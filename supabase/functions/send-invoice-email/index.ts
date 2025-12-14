import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { invoiceId } = await req.json();

    // Fetch invoice with related data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        company:companies(id, name, email, address, phone),
        subscription:company_subscriptions(*, tier:subscription_tiers(*))
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message}`);
    }

    // Get Resend API key
    const { data: resendSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'resend_api_key')
      .single();

    if (!resendSetting?.value) {
      throw new Error('Resend API key not configured');
    }

    const resend = new Resend(resendSetting.value);

    // Fetch invoice settings
    const { data: settings } = await supabase
      .from('invoice_settings')
      .select('*')
      .is('company_id', null)
      .single();

    // Build recipient list
    const recipients: string[] = [];
    
    if (settings?.send_to_company_admin && invoice.company?.email) {
      recipients.push(invoice.company.email);
    }
    
    if (settings?.additional_email_recipients) {
      recipients.push(...settings.additional_email_recipients);
    }

    if (recipients.length === 0) {
      throw new Error('No recipients configured for invoice delivery');
    }

    // Generate HTML invoice
    const invoiceHtml = generateInvoiceHtml(invoice, settings);

    const emailResults = [];

    for (const recipient of recipients) {
      try {
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: settings?.company_email ? `${settings.company_name} <${settings.company_email}>` : 'HRplus Cerebra <billing@hrplus.com>',
          to: [recipient],
          subject: `Invoice ${invoice.invoice_number} - ${settings?.company_name || 'HRplus Cerebra'}`,
          html: invoiceHtml,
        });

        // Log email
        await supabase.from('invoice_email_logs').insert({
          invoice_id: invoice.id,
          recipient_email: recipient,
          email_type: 'invoice',
          status: emailError ? 'failed' : 'sent',
          error_message: emailError?.message,
          resend_message_id: emailResult?.id
        });

        emailResults.push({ recipient, success: !emailError, error: emailError?.message });
      } catch (err: any) {
        await supabase.from('invoice_email_logs').insert({
          invoice_id: invoice.id,
          recipient_email: recipient,
          email_type: 'invoice',
          status: 'failed',
          error_message: err.message
        });
        emailResults.push({ recipient, success: false, error: err.message });
      }
    }

    // CC system admin
    if (settings?.cc_system_admin && settings?.system_admin_email) {
      try {
        await resend.emails.send({
          from: settings?.company_email ? `${settings.company_name} <${settings.company_email}>` : 'HRplus Cerebra <billing@hrplus.com>',
          to: [settings.system_admin_email],
          subject: `[Copy] Invoice ${invoice.invoice_number} - ${invoice.company?.name}`,
          html: invoiceHtml,
        });
      } catch (err) {
        console.error('Failed to send CC to system admin:', err);
      }
    }

    // Update invoice status
    await supabase
      .from('invoices')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', invoiceId);

    return new Response(JSON.stringify({ success: true, results: emailResults }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

function generateInvoiceHtml(invoice: any, settings: any): string {
  const company = invoice.company || {};
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(amount);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #333; background: #f9fafb; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: bold; color: #4F46E5; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .address-block { width: 45%; }
    .address-label { font-weight: bold; color: #666; margin-bottom: 8px; text-transform: uppercase; font-size: 12px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 12px; text-transform: uppercase; }
    .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .table .amount { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .total-row.grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; border-bottom: none; margin-top: 8px; padding-top: 16px; }
    .terms { margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .terms h4 { margin: 0 0 8px 0; font-size: 14px; }
    .terms p { margin: 0; font-size: 13px; color: #666; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
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
        <div class="logo">${settings?.company_name || 'HRplus Cerebra'}</div>
        <p style="margin: 8px 0 0 0; color: #666;">${settings?.company_address || ''}</p>
        <p style="margin: 4px 0 0 0; color: #666;">${settings?.company_email || ''}</p>
        <p style="margin: 4px 0 0 0; color: #666;">${settings?.company_phone || ''}</p>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">INVOICE</div>
        <p style="font-size: 18px; margin: 8px 0;"><strong>${invoice.invoice_number}</strong></p>
        <p style="margin: 4px 0; color: #666;">Issue Date: ${invoice.issue_date}</p>
        <p style="margin: 4px 0; color: #666;">Due Date: ${invoice.due_date}</p>
        <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
      </div>
    </div>

    <div class="addresses">
      <div class="address-block">
        <div class="address-label">Bill To</div>
        <p style="font-weight: bold; margin: 0 0 4px 0;">${company.name || 'Customer'}</p>
        <p style="margin: 0; color: #666;">${company.address || ''}</p>
        <p style="margin: 0; color: #666;">${company.email || ''}</p>
        <p style="margin: 0; color: #666;">${company.phone || ''}</p>
      </div>
      <div class="address-block" style="text-align: right;">
        <div class="address-label">Billing Period</div>
        <p style="margin: 0;">${invoice.billing_period_start} to ${invoice.billing_period_end}</p>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="width: 60px; text-align: center;">Qty</th>
          <th class="amount" style="width: 120px;">Unit Price</th>
          <th class="amount" style="width: 120px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.line_items.map((item: any) => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: center;">${item.quantity}</td>
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
        <div class="total-row" style="color: #059669;">
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
        <h4>Terms & Conditions</h4>
        <p>${invoice.terms}</p>
      </div>
    ` : ''}

    <div class="footer">
      ${invoice.footer_text || settings?.invoice_footer || 'Thank you for your business!'}
    </div>
  </div>
</body>
</html>
  `;
}