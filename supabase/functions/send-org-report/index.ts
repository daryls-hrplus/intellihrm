import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrgReportRequest {
  scheduleId?: string;
  companyId?: string;
  departmentId?: string;
  recipientEmails?: string[];
  reportType?: "weekly" | "monthly";
}

serve(async (req: Request): Promise<Response> => {
  console.log("Org report function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    let requestBody: OrgReportRequest = {};
    try {
      requestBody = await req.json();
    } catch {
      // Default values
    }

    // If scheduleId provided, fetch schedule config
    let config = {
      companyId: requestBody.companyId,
      departmentId: requestBody.departmentId,
      recipientEmails: requestBody.recipientEmails || [],
      reportType: requestBody.reportType || "weekly",
      includePositions: true,
      includeEmployees: true,
      includeChanges: true,
      scheduleName: "Manual Report",
    };

    if (requestBody.scheduleId) {
      const { data: schedule, error: scheduleError } = await supabaseClient
        .from("scheduled_org_reports")
        .select("*")
        .eq("id", requestBody.scheduleId)
        .single();

      if (scheduleError || !schedule) {
        console.log("Schedule not found:", scheduleError);
        return new Response(
          JSON.stringify({ success: false, reason: "Schedule not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      config = {
        companyId: schedule.company_id,
        departmentId: schedule.department_id,
        recipientEmails: schedule.recipient_emails || [],
        reportType: schedule.schedule_type === "monthly" ? "monthly" : "weekly",
        includePositions: schedule.include_positions,
        includeEmployees: schedule.include_employees,
        includeChanges: schedule.include_changes,
        scheduleName: schedule.name,
      };
    }

    // Get Resend API key
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .single();

    if (settingsError || !settingsData?.value) {
      console.log("Resend API key not configured");
      return new Response(
        JSON.stringify({ success: false, reason: "Resend API key not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(settingsData.value);

    // Get recipients - use provided emails or fetch admins
    let recipients = config.recipientEmails;
    if (recipients.length === 0) {
      const { data: adminRoles } = await supabaseClient
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (adminRoles && adminRoles.length > 0) {
        const { data: adminProfiles } = await supabaseClient
          .from("profiles")
          .select("email")
          .in("id", adminRoles.map(r => r.user_id));

        recipients = adminProfiles?.map(p => p.email).filter(Boolean) || [];
      }
    }

    if (recipients.length === 0) {
      console.log("No recipients found");
      return new Response(
        JSON.stringify({ success: false, reason: "No recipient emails found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (config.reportType === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 7);
    }
    const periodLabel = config.reportType === "monthly" ? "Monthly" : "Weekly";

    // Fetch company info if specified
    let companyName = "All Companies";
    if (config.companyId) {
      const { data: company } = await supabaseClient
        .from("companies")
        .select("name")
        .eq("id", config.companyId)
        .single();
      companyName = company?.name || "Unknown Company";
    }

    // Fetch department info if specified
    let departmentName = "All Departments";
    if (config.departmentId) {
      const { data: dept } = await supabaseClient
        .from("departments")
        .select("name")
        .eq("id", config.departmentId)
        .single();
      departmentName = dept?.name || "Unknown Department";
    }

    // Build department filter
    let deptIds: string[] = [];
    if (config.companyId) {
      const { data: depts } = await supabaseClient
        .from("departments")
        .select("id")
        .eq("company_id", config.companyId);
      deptIds = depts?.map(d => d.id) || [];
    }
    if (config.departmentId) {
      deptIds = [config.departmentId];
    }

    // Fetch positions data
    let positionsQuery = supabaseClient
      .from("positions")
      .select("id, title, department_id, start_date, end_date, authorized_headcount, created_at");
    
    if (deptIds.length > 0) {
      positionsQuery = positionsQuery.in("department_id", deptIds);
    }

    const { data: positions } = await positionsQuery;

    // Fetch departments for mapping
    const { data: departments } = await supabaseClient
      .from("departments")
      .select("id, name, company_id");

    const getDeptName = (deptId: string) => {
      return departments?.find(d => d.id === deptId)?.name || "Unknown";
    };

    // Calculate position stats
    const positionStats = {
      total: positions?.length || 0,
      active: positions?.filter(p => !p.end_date || new Date(p.end_date) >= now).length || 0,
      added: positions?.filter(p => new Date(p.start_date) >= startDate && new Date(p.start_date) <= now).length || 0,
      removed: positions?.filter(p => p.end_date && new Date(p.end_date) >= startDate && new Date(p.end_date) <= now).length || 0,
    };

    // Fetch employee positions
    let epQuery = supabaseClient
      .from("employee_positions")
      .select("id, employee_id, position_id, start_date, end_date");

    if (positions && positions.length > 0) {
      epQuery = epQuery.in("position_id", positions.map(p => p.id));
    }

    const { data: employeePositions } = await epQuery;

    // Fetch employee profiles
    const employeeIds = [...new Set(employeePositions?.map(ep => ep.employee_id) || [])];
    const { data: employees } = await supabaseClient
      .from("profiles")
      .select("id, full_name, email")
      .in("id", employeeIds.length > 0 ? employeeIds : ['00000000-0000-0000-0000-000000000000']);

    const getEmployeeName = (empId: string) => {
      const emp = employees?.find(e => e.id === empId);
      return emp?.full_name || emp?.email || "Unknown";
    };

    const getPositionTitle = (posId: string) => {
      return positions?.find(p => p.id === posId)?.title || "Unknown";
    };

    // Calculate employee stats
    const employeeStats = {
      active: new Set(employeePositions?.filter(ep => !ep.end_date || new Date(ep.end_date) >= now).map(ep => ep.employee_id)).size,
      joined: employeePositions?.filter(ep => new Date(ep.start_date) >= startDate && new Date(ep.start_date) <= now).length || 0,
      departed: employeePositions?.filter(ep => ep.end_date && new Date(ep.end_date) >= startDate && new Date(ep.end_date) <= now).length || 0,
    };

    // Get recent employee joins
    const recentJoins = employeePositions
      ?.filter(ep => new Date(ep.start_date) >= startDate && new Date(ep.start_date) <= now)
      .slice(0, 10)
      .map(ep => ({
        name: getEmployeeName(ep.employee_id),
        position: getPositionTitle(ep.position_id),
        date: new Date(ep.start_date).toLocaleDateString(),
      })) || [];

    // Get recent departures
    const recentDepartures = employeePositions
      ?.filter(ep => ep.end_date && new Date(ep.end_date) >= startDate && new Date(ep.end_date) <= now)
      .slice(0, 10)
      .map(ep => ({
        name: getEmployeeName(ep.employee_id),
        position: getPositionTitle(ep.position_id),
        date: ep.end_date ? new Date(ep.end_date).toLocaleDateString() : "-",
      })) || [];

    // Get new positions
    const newPositions = positions
      ?.filter(p => new Date(p.start_date) >= startDate && new Date(p.start_date) <= now)
      .slice(0, 10)
      .map(p => ({
        title: p.title,
        department: getDeptName(p.department_id),
        date: new Date(p.start_date).toLocaleDateString(),
      })) || [];

    // Build email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f8f9fa; }
          .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
          .stat-box { background: white; border-radius: 8px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-value { font-size: 28px; font-weight: bold; color: #3b82f6; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: 600; }
          .section-title { display: flex; align-items: center; gap: 8px; margin: 0 0 15px 0; color: #1e40af; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
          .badge-added { background: #d1fae5; color: #065f46; }
          .badge-removed { background: #fee2e2; color: #991b1b; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">📊 ${periodLabel} Organizational Changes Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">
            ${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}
          </p>
          <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">
            ${companyName}${config.departmentId ? ` • ${departmentName}` : ""}
          </p>
        </div>
        
        <div class="content">
          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-value">${positionStats.active}</div>
              <div class="stat-label">Active Positions</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${employeeStats.active}</div>
              <div class="stat-label">Active Employees</div>
            </div>
            <div class="stat-box">
              <div class="stat-value positive">+${positionStats.added}</div>
              <div class="stat-label">New Positions</div>
            </div>
            <div class="stat-box">
              <div class="stat-value positive">+${employeeStats.joined}</div>
              <div class="stat-label">Employee Joins</div>
            </div>
          </div>

          ${config.includeChanges ? `
          <div class="card">
            <h3 class="section-title">📈 Period Summary</h3>
            <table>
              <tr>
                <td><strong>Net Position Change</strong></td>
                <td style="text-align: right;">
                  <span class="${positionStats.added - positionStats.removed >= 0 ? 'positive' : 'negative'}" style="font-weight: bold; font-size: 18px;">
                    ${positionStats.added - positionStats.removed >= 0 ? '+' : ''}${positionStats.added - positionStats.removed}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Net Employee Change</strong></td>
                <td style="text-align: right;">
                  <span class="${employeeStats.joined - employeeStats.departed >= 0 ? 'positive' : 'negative'}" style="font-weight: bold; font-size: 18px;">
                    ${employeeStats.joined - employeeStats.departed >= 0 ? '+' : ''}${employeeStats.joined - employeeStats.departed}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Positions Added / Removed</td>
                <td style="text-align: right;">
                  <span class="badge badge-added">+${positionStats.added} added</span>
                  <span class="badge badge-removed" style="margin-left: 8px;">-${positionStats.removed} removed</span>
                </td>
              </tr>
              <tr>
                <td>Employees Joined / Departed</td>
                <td style="text-align: right;">
                  <span class="badge badge-added">+${employeeStats.joined} joined</span>
                  <span class="badge badge-removed" style="margin-left: 8px;">-${employeeStats.departed} departed</span>
                </td>
              </tr>
            </table>
          </div>
          ` : ""}

          ${config.includePositions && newPositions.length > 0 ? `
          <div class="card">
            <h3 class="section-title">🆕 New Positions This Period</h3>
            <table>
              <thead>
                <tr>
                  <th>Position Title</th>
                  <th>Department</th>
                  <th>Start Date</th>
                </tr>
              </thead>
              <tbody>
                ${newPositions.map(p => `
                  <tr>
                    <td><strong>${p.title}</strong></td>
                    <td>${p.department}</td>
                    <td>${p.date}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          ` : ""}

          ${config.includeEmployees && recentJoins.length > 0 ? `
          <div class="card">
            <h3 class="section-title">👋 Employee Joins</h3>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Position</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                ${recentJoins.map(e => `
                  <tr>
                    <td><strong>${e.name}</strong></td>
                    <td>${e.position}</td>
                    <td>${e.date}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          ` : ""}

          ${config.includeEmployees && recentDepartures.length > 0 ? `
          <div class="card">
            <h3 class="section-title">👋 Employee Departures</h3>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Position</th>
                  <th>Departure Date</th>
                </tr>
              </thead>
              <tbody>
                ${recentDepartures.map(e => `
                  <tr>
                    <td><strong>${e.name}</strong></td>
                    <td>${e.position}</td>
                    <td>${e.date}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          ` : ""}
        </div>
        
        <div class="footer">
          <p>This is an automated ${periodLabel.toLowerCase()} report from your HRIS system.</p>
          <p>Report: ${config.scheduleName}</p>
          <p>Generated on ${now.toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // Send emails
    let emailsSent = 0;
    for (const email of recipients) {
      try {
        await resend.emails.send({
          from: "HRIS Reports <onboarding@resend.dev>",
          to: [email],
          subject: `📊 ${periodLabel} Org Changes Report - ${companyName} - ${now.toLocaleDateString()}`,
          html: htmlContent,
        });
        emailsSent++;
        console.log(`Report sent to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send to ${email}:`, emailError);
      }
    }

    // Update last_sent_at if schedule ID was provided
    if (requestBody.scheduleId) {
      await supabaseClient
        .from("scheduled_org_reports")
        .update({ last_sent_at: now.toISOString() })
        .eq("id", requestBody.scheduleId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        reportType: config.reportType,
        summary: {
          positions: positionStats,
          employees: employeeStats,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error generating org report:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});