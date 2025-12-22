import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkPayslipRequest {
  payroll_run_id: string;
  action: 'email' | 'download_info' | 'validate';
  company_id: string;
}

interface EmployeePayslipInfo {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  payslip_number: string;
  gross_pay: number;
  net_pay: number;
  total_deductions: number;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  currency: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { payroll_run_id, action, company_id }: BulkPayslipRequest = await req.json();
    
    console.log(`Bulk payslip distribution - Action: ${action}, Run ID: ${payroll_run_id}`);

    // Fetch payroll run details
    const { data: payrollRun, error: runError } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        pay_period:pay_periods(*)
      `)
      .eq('id', payroll_run_id)
      .single();

    if (runError || !payrollRun) {
      console.error("Failed to fetch payroll run:", runError);
      throw new Error("Payroll run not found");
    }

    // Fetch all employee payroll records for this run
    const { data: employeePayrolls, error: empError } = await supabase
      .from('employee_payroll')
      .select(`
        *,
        employee:profiles!employee_payroll_employee_id_fkey(id, full_name, email)
      `)
      .eq('payroll_run_id', payroll_run_id);

    if (empError) {
      console.error("Failed to fetch employee payrolls:", empError);
      throw new Error("Failed to fetch employee payroll records");
    }

    // Fetch company details
    const { data: company } = await supabase
      .from('companies')
      .select('name, address, logo_url')
      .eq('id', company_id)
      .single();

    const payPeriod = payrollRun.pay_period;

    // Build employee payslip info list
    const employeePayslips: EmployeePayslipInfo[] = (employeePayrolls || []).map((ep: any) => ({
      employee_id: ep.employee_id,
      employee_name: ep.employee?.full_name || 'Unknown',
      employee_email: ep.employee?.email || '',
      payslip_number: `PS-${ep.id.slice(0, 8).toUpperCase()}`,
      gross_pay: ep.gross_pay || 0,
      net_pay: ep.net_pay || 0,
      total_deductions: ep.total_deductions || 0,
      pay_period_start: payPeriod?.period_start || '',
      pay_period_end: payPeriod?.period_end || '',
      pay_date: payPeriod?.pay_date || '',
      currency: ep.currency || 'USD',
    }));

    // Validate action - return employee info for download/print
    if (action === 'download_info' || action === 'validate') {
      return new Response(
        JSON.stringify({
          success: true,
          payroll_run: {
            run_number: payrollRun.run_number,
            status: payrollRun.status,
            employee_count: payrollRun.employee_count,
            total_gross_pay: payrollRun.total_gross_pay,
            total_net_pay: payrollRun.total_net_pay,
          },
          company: company,
          pay_period: payPeriod,
          employees: employeePayslips,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Email action - send payslips to all employees
    if (action === 'email') {
      // Fetch Resend API key from system settings
      const { data: resendSetting, error: settingError } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "resend_api_key")
        .single();

      if (settingError || !resendSetting?.value) {
        console.error("Resend API key not configured:", settingError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Email service not configured. Please configure Resend API key in system settings.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const resend = new Resend(resendSetting.value);
      const results: { employee_name: string; status: 'sent' | 'failed'; error?: string }[] = [];

      // Fetch email settings for from address
      const { data: emailSettings } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "email_from_address")
        .single();

      const fromAddress = emailSettings?.value || "payroll@company.com";
      const companyName = company?.name || "Company";

      for (const emp of employeePayslips) {
        if (!emp.employee_email) {
          results.push({ employee_name: emp.employee_name, status: 'failed', error: 'No email address' });
          continue;
        }

        try {
          const formatCurrency = (amount: number, currency: string) => {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
          };

          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
                .summary { background: white; border-radius: 8px; padding: 16px; margin: 16px 0; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
                .row:last-child { border-bottom: none; }
                .label { color: #64748b; }
                .value { font-weight: 600; }
                .net-pay { color: #059669; font-size: 18px; }
                .footer { text-align: center; padding: 16px; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Your Payslip is Ready</h1>
                  <p style="margin: 8px 0 0 0; opacity: 0.9;">${companyName}</p>
                </div>
                <div class="content">
                  <p>Dear ${emp.employee_name},</p>
                  <p>Your payslip for the period <strong>${new Date(emp.pay_period_start).toLocaleDateString()} - ${new Date(emp.pay_period_end).toLocaleDateString()}</strong> is now available.</p>
                  
                  <div class="summary">
                    <h3 style="margin: 0 0 12px 0; color: #1e40af;">Pay Summary</h3>
                    <div class="row">
                      <span class="label">Payslip Number</span>
                      <span class="value">${emp.payslip_number}</span>
                    </div>
                    <div class="row">
                      <span class="label">Pay Date</span>
                      <span class="value">${new Date(emp.pay_date).toLocaleDateString()}</span>
                    </div>
                    <div class="row">
                      <span class="label">Gross Pay</span>
                      <span class="value">${formatCurrency(emp.gross_pay, emp.currency)}</span>
                    </div>
                    <div class="row">
                      <span class="label">Total Deductions</span>
                      <span class="value" style="color: #dc2626;">-${formatCurrency(emp.total_deductions, emp.currency)}</span>
                    </div>
                    <div class="row">
                      <span class="label">Net Pay</span>
                      <span class="value net-pay">${formatCurrency(emp.net_pay, emp.currency)}</span>
                    </div>
                  </div>
                  
                  <p>Please log in to view your full payslip with detailed breakdowns.</p>
                </div>
                <div class="footer">
                  <p>This is an automated message from ${companyName} Payroll.</p>
                  <p>If you have any questions, please contact your HR department.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          await resend.emails.send({
            from: `${companyName} Payroll <${fromAddress}>`,
            to: [emp.employee_email],
            subject: `Your Payslip for ${new Date(emp.pay_period_start).toLocaleDateString()} - ${new Date(emp.pay_period_end).toLocaleDateString()}`,
            html: emailHtml,
          });

          results.push({ employee_name: emp.employee_name, status: 'sent' });
          console.log(`Email sent successfully to ${emp.employee_email}`);
        } catch (emailError: any) {
          console.error(`Failed to send email to ${emp.employee_email}:`, emailError);
          results.push({ employee_name: emp.employee_name, status: 'failed', error: emailError.message });
        }
      }

      const sentCount = results.filter(r => r.status === 'sent').length;
      const failedCount = results.filter(r => r.status === 'failed').length;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Sent ${sentCount} emails successfully. ${failedCount} failed.`,
          sent_count: sentCount,
          failed_count: failedCount,
          results,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in bulk-payslip-distribution:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
