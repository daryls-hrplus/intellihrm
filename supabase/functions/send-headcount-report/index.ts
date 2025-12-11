import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HeadcountReportRequest {
  reportType?: "weekly" | "monthly";
  recipientEmail?: string; // Optional: specific recipient, otherwise sends to admins
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Headcount report function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let requestBody: HeadcountReportRequest = {};
    try {
      requestBody = await req.json();
    } catch {
      // Default values if no body provided
    }
    const reportType = requestBody.reportType || "weekly";

    // Get Resend API key from system settings
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .single();

    if (settingsError || !settingsData?.value) {
      console.log("Resend API key not configured");
      return new Response(
        JSON.stringify({
          success: false,
          reason: "Resend API key not configured in system settings",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(settingsData.value);

    // Get admin emails
    const adminEmails: string[] = [];
    
    if (requestBody.recipientEmail) {
      adminEmails.push(requestBody.recipientEmail);
    } else {
      // Get admin user IDs
      const { data: adminRoles } = await supabaseClient
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (adminRoles && adminRoles.length > 0) {
        const adminUserIds = adminRoles.map((r) => r.user_id);
        
        const { data: adminProfiles } = await supabaseClient
          .from("profiles")
          .select("email")
          .in("id", adminUserIds);

        if (adminProfiles) {
          adminProfiles.forEach((p) => {
            if (p.email) adminEmails.push(p.email);
          });
        }
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({
          success: false,
          reason: "No admin email addresses found",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (reportType === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 7);
    }

    // Fetch headcount data
    const { data: headcountRequests } = await supabaseClient
      .from("headcount_requests")
      .select(`
        *,
        position:positions(title, department:departments(name, company:companies(name))),
        requester:profiles!headcount_requests_requested_by_fkey(full_name, email),
        reviewer:profiles!headcount_requests_reviewed_by_fkey(full_name)
      `)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    // Calculate summary statistics
    const totalRequests = headcountRequests?.length || 0;
    const approvedRequests = headcountRequests?.filter((r) => r.status === "approved").length || 0;
    const rejectedRequests = headcountRequests?.filter((r) => r.status === "rejected").length || 0;
    const pendingRequests = headcountRequests?.filter((r) => r.status === "pending").length || 0;

    // Calculate net headcount change
    const netHeadcountChange = headcountRequests
      ?.filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + (r.requested_headcount - r.current_headcount), 0) || 0;

    // Get current vacancy summary
    const { data: companies } = await supabaseClient
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .limit(5);

    const vacancySummaries: { company: string; vacancies: number; authorized: number; filled: number }[] = [];
    
    if (companies) {
      for (const company of companies) {
        const { data: vacancyData } = await supabaseClient
          .rpc("get_position_vacancy_summary", { p_company_id: company.id });
        
        if (vacancyData && vacancyData.length > 0) {
          const totalAuthorized = vacancyData.reduce((sum: number, v: any) => sum + v.authorized_headcount, 0);
          const totalFilled = vacancyData.reduce((sum: number, v: any) => sum + Number(v.filled_count), 0);
          const totalVacancies = vacancyData.reduce((sum: number, v: any) => sum + Number(v.vacancy_count), 0);
          
          vacancySummaries.push({
            company: company.name,
            authorized: totalAuthorized,
            filled: totalFilled,
            vacancies: totalVacancies,
          });
        }
      }
    }

    // Build email HTML
    const periodLabel = reportType === "monthly" ? "Monthly" : "Weekly";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f8f9fa; }
          .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
          .stat-box { background: white; border-radius: 8px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-value { font-size: 28px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .approved { color: #10b981; }
          .rejected { color: #ef4444; }
          .pending { color: #f59e0b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: 600; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
          .badge-approved { background: #d1fae5; color: #065f46; }
          .badge-rejected { background: #fee2e2; color: #991b1b; }
          .badge-pending { background: #fef3c7; color: #92400e; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">${periodLabel} Headcount Analytics Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">
            ${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}
          </p>
        </div>
        
        <div class="content">
          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-value">${totalRequests}</div>
              <div class="stat-label">Total Requests</div>
            </div>
            <div class="stat-box">
              <div class="stat-value approved">${approvedRequests}</div>
              <div class="stat-label">Approved</div>
            </div>
            <div class="stat-box">
              <div class="stat-value rejected">${rejectedRequests}</div>
              <div class="stat-label">Rejected</div>
            </div>
            <div class="stat-box">
              <div class="stat-value pending">${pendingRequests}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>

          <div class="card">
            <h3 style="margin-top: 0;">Net Headcount Change</h3>
            <p style="font-size: 24px; font-weight: bold; color: ${netHeadcountChange >= 0 ? '#10b981' : '#ef4444'};">
              ${netHeadcountChange >= 0 ? '+' : ''}${netHeadcountChange} positions
            </p>
            <p style="color: #666; font-size: 14px;">Based on approved requests during this period</p>
          </div>

          ${vacancySummaries.length > 0 ? `
          <div class="card">
            <h3 style="margin-top: 0;">Current Vacancy Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Authorized</th>
                  <th>Filled</th>
                  <th>Vacancies</th>
                </tr>
              </thead>
              <tbody>
                ${vacancySummaries.map((v) => `
                  <tr>
                    <td>${v.company}</td>
                    <td>${v.authorized}</td>
                    <td>${v.filled}</td>
                    <td style="color: ${v.vacancies > 0 ? '#f59e0b' : '#10b981'}; font-weight: 600;">${v.vacancies}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          ` : ""}

          ${headcountRequests && headcountRequests.length > 0 ? `
          <div class="card">
            <h3 style="margin-top: 0;">Recent Headcount Requests</h3>
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Requester</th>
                  <th>Change</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${headcountRequests.slice(0, 10).map((r) => `
                  <tr>
                    <td>
                      <strong>${r.position?.title || "Unknown"}</strong><br/>
                      <span style="font-size: 12px; color: #666;">${r.position?.department?.name || ""}</span>
                    </td>
                    <td>${r.requester?.full_name || r.requester?.email || "Unknown"}</td>
                    <td>${r.current_headcount} → ${r.requested_headcount}</td>
                    <td>
                      <span class="badge badge-${r.status}">
                        ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td>${new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            ${headcountRequests.length > 10 ? `<p style="color: #666; font-size: 14px; margin-top: 15px;">And ${headcountRequests.length - 10} more requests...</p>` : ""}
          </div>
          ` : `
          <div class="card">
            <h3 style="margin-top: 0;">Recent Headcount Requests</h3>
            <p style="color: #666;">No headcount requests during this period.</p>
          </div>
          `}
        </div>
        
        <div class="footer">
          <p>This is an automated report from your HRIS system.</p>
          <p>Generated on ${now.toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // Send emails
    let emailsSent = 0;
    for (const email of adminEmails) {
      try {
        await resend.emails.send({
          from: "HRIS Reports <onboarding@resend.dev>",
          to: [email],
          subject: `${periodLabel} Headcount Analytics Report - ${now.toLocaleDateString()}`,
          html: htmlContent,
        });
        emailsSent++;
        console.log(`Report sent to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send to ${email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        reportType,
        summary: {
          totalRequests,
          approvedRequests,
          rejectedRequests,
          pendingRequests,
          netHeadcountChange,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error generating headcount report:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
