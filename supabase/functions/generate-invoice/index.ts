import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateInvoiceRequest {
  subscriptionId: string;
  invoiceType: 'subscription' | 'renewal' | 'upgrade' | 'adjustment';
  sendEmail?: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { subscriptionId, invoiceType, sendEmail = true }: GenerateInvoiceRequest = await req.json();

    // Fetch subscription with company and tier details
    const { data: subscription, error: subError } = await supabase
      .from('company_subscriptions')
      .select(`
        *,
        company:companies(id, name, address, email, phone),
        tier:subscription_tiers(*)
      `)
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      throw new Error(`Subscription not found: ${subError?.message}`);
    }

    // Fetch invoice settings (global or company-specific)
    const { data: settings } = await supabase
      .from('invoice_settings')
      .select('*')
      .or(`company_id.is.null,company_id.eq.${subscription.company_id}`)
      .order('company_id', { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    const invoiceSettings = settings || {
      invoice_prefix: 'INV',
      next_invoice_number: 1,
      default_tax_rate: 0,
      default_payment_terms: 30,
      invoice_terms: 'Payment is due within 30 days of invoice date.',
      invoice_footer: 'Thank you for your business!'
    };

    // Generate invoice number
    const invoiceNumber = `${invoiceSettings.invoice_prefix}-${String(invoiceSettings.next_invoice_number).padStart(6, '0')}`;

    // Calculate billing period
    const now = new Date();
    const billingPeriodStart = new Date(subscription.current_period_start || now);
    const billingPeriodEnd = new Date(subscription.current_period_end || now);
    
    // Calculate due date
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + (invoiceSettings.default_payment_terms || 30));

    // Build line items
    const lineItems = [];
    const tier = subscription.tier;
    const billingCycle = subscription.billing_cycle || 'monthly';
    const employeeCount = subscription.active_employee_count || 1;

    // Base subscription line item
    const baseAmount = billingCycle === 'annual' ? subscription.annual_amount : subscription.monthly_amount;
    lineItems.push({
      description: `${tier?.name || 'Subscription'} - ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} Plan`,
      quantity: 1,
      unit_price: baseAmount,
      amount: baseAmount
    });

    // Add employee-based pricing if applicable
    if (tier?.price_per_employee && employeeCount > 0) {
      const employeeAmount = tier.price_per_employee * employeeCount;
      lineItems.push({
        description: `Employee licenses (${employeeCount} employees @ $${tier.price_per_employee}/employee)`,
        quantity: employeeCount,
        unit_price: tier.price_per_employee,
        amount: employeeAmount
      });
    }

    // Add selected modules
    const selectedModules = subscription.selected_modules || [];
    if (selectedModules.length > 0) {
      lineItems.push({
        description: `Enabled Modules: ${selectedModules.join(', ')}`,
        quantity: selectedModules.length,
        unit_price: 0,
        amount: 0
      });
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = invoiceSettings.default_tax_rate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        company_id: subscription.company_id,
        subscription_id: subscriptionId,
        invoice_type: invoiceType,
        status: 'draft',
        billing_period_start: billingPeriodStart.toISOString().split('T')[0],
        billing_period_end: billingPeriodEnd.toISOString().split('T')[0],
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: subscription.currency || 'USD',
        line_items: lineItems,
        issue_date: now.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        terms: invoiceSettings.invoice_terms,
        footer_text: invoiceSettings.invoice_footer
      })
      .select()
      .single();

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`);
    }

    // Update next invoice number
    if (settings?.id) {
      await supabase
        .from('invoice_settings')
        .update({ next_invoice_number: (invoiceSettings.next_invoice_number || 1) + 1 })
        .eq('id', settings.id);
    }

    // Send email if requested
    if (sendEmail) {
      // Get Resend API key from system settings
      const { data: resendSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'resend_api_key')
        .single();

      if (resendSetting?.value) {
        const resend = new Resend(resendSetting.value);
        
        // Build recipient list
        const recipients: string[] = [];
        
        // Add company admin email
        if (invoiceSettings.send_to_company_admin && subscription.company?.email) {
          recipients.push(subscription.company.email);
        }
        
        // Add additional recipients
        if (invoiceSettings.additional_email_recipients) {
          recipients.push(...invoiceSettings.additional_email_recipients);
        }

        // Generate HTML invoice
        const invoiceHtml = generateInvoiceHtml(invoice, subscription, invoiceSettings);

        for (const recipient of recipients) {
          try {
            const { data: emailResult, error: emailError } = await resend.emails.send({
              from: 'HRplus Cerebra <billing@hrplus.com>',
              to: [recipient],
              subject: `Invoice ${invoiceNumber} - HRplus Cerebra`,
              html: invoiceHtml,
            });

            // Log email send
            await supabase.from('invoice_email_logs').insert({
              invoice_id: invoice.id,
              recipient_email: recipient,
              email_type: 'invoice',
              status: emailError ? 'failed' : 'sent',
              error_message: emailError?.message,
              resend_message_id: emailResult?.id
            });
          } catch (emailErr: any) {
            console.error(`Failed to send invoice to ${recipient}:`, emailErr);
            await supabase.from('invoice_email_logs').insert({
              invoice_id: invoice.id,
              recipient_email: recipient,
              email_type: 'invoice',
              status: 'failed',
              error_message: emailErr.message
            });
          }
        }

        // CC system admin
        if (invoiceSettings.cc_system_admin && invoiceSettings.system_admin_email) {
          try {
            await resend.emails.send({
              from: 'HRplus Cerebra <billing@hrplus.com>',
              to: [invoiceSettings.system_admin_email],
              subject: `[Copy] Invoice ${invoiceNumber} - ${subscription.company?.name}`,
              html: invoiceHtml,
            });
          } catch (err) {
            console.error('Failed to send CC to system admin:', err);
          }
        }

        // Update invoice status to sent
        await supabase
          .from('invoices')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', invoice.id);
      }
    }

    return new Response(JSON.stringify({ success: true, invoice }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

function generateInvoiceHtml(invoice: any, subscription: any, settings: any): string {
  const company = subscription.company || {};
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(amount);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
    .invoice-container { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: bold; color: #4F46E5; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .address-block { width: 45%; }
    .address-label { font-weight: bold; color: #666; margin-bottom: 8px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
    .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .table .amount { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .total-row.grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; border-bottom: none; }
    .terms { margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-paid { background: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <div class="logo">${settings.company_name || 'HRplus Cerebra'}</div>
        <p>${settings.company_address || ''}</p>
        <p>${settings.company_email || ''}</p>
        <p>${settings.company_phone || ''}</p>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">INVOICE</div>
        <p><strong>${invoice.invoice_number}</strong></p>
        <p>Issue Date: ${invoice.issue_date}</p>
        <p>Due Date: ${invoice.due_date}</p>
        <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
      </div>
    </div>

    <div class="addresses">
      <div class="address-block">
        <div class="address-label">Bill To:</div>
        <p><strong>${company.name || 'Customer'}</strong></p>
        <p>${company.address || ''}</p>
        <p>${company.email || ''}</p>
        <p>${company.phone || ''}</p>
      </div>
      <div class="address-block">
        <div class="address-label">Billing Period:</div>
        <p>${invoice.billing_period_start} to ${invoice.billing_period_end}</p>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th class="amount">Unit Price</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.line_items.map((item: any) => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td class="amount">${formatCurrency(item.unit_price)}</td>
            <td class="amount">${formatCurrency(item.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatCurrency(invoice.subtotal)}</span>
      </div>
      ${invoice.tax_amount > 0 ? `
        <div class="total-row">
          <span>Tax (${invoice.tax_rate}%)</span>
          <span>${formatCurrency(invoice.tax_amount)}</span>
        </div>
      ` : ''}
      ${invoice.discount_amount > 0 ? `
        <div class="total-row">
          <span>Discount ${invoice.discount_description ? `(${invoice.discount_description})` : ''}</span>
          <span>-${formatCurrency(invoice.discount_amount)}</span>
        </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>Total Due</span>
        <span>${formatCurrency(invoice.total_amount)}</span>
      </div>
    </div>

    ${invoice.terms ? `
      <div class="terms">
        <strong>Terms & Conditions</strong>
        <p>${invoice.terms}</p>
      </div>
    ` : ''}

    <div class="footer">
      ${invoice.footer_text || settings.invoice_footer || 'Thank you for your business!'}
    </div>
  </div>
</body>
</html>
  `;
}