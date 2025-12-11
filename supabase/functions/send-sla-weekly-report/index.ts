import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SlaMetrics {
  totalTickets: number;
  resolvedTickets: number;
  responseCompliance: number;
  resolutionCompliance: number;
  responseBreaches: number;
  resolutionBreaches: number;
  avgResponseTimeHours: number;
  avgResolutionTimeHours: number;
  byPriority: Array<{
    name: string;
    total: number;
    responseBreaches: number;
    resolutionBreaches: number;
  }>;
  topCategories: Array<{
    name: string;
    total: number;
    breaches: number;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Generating weekly SLA performance report...");

    // Get Resend API key from system settings
    const { data: settingData, error: settingError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .single();

    if (settingError || !settingData?.value) {
      console.log("Resend API key not configured");
      return new Response(
        JSON.stringify({ success: false, message: "Resend API key not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(settingData.value);

    // Get manager emails
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "hr_manager"]);

    const adminUserIds = adminRoles?.map((r) => r.user_id) || [];
    
    if (adminUserIds.length === 0) {
      console.log("No managers found to send report to");
      return new Response(
        JSON.stringify({ success: false, message: "No managers found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("email, full_name")
      .in("id", adminUserIds);

    const managerEmails = adminProfiles?.map((p) => p.email).filter(Boolean) || [];
    
    if (managerEmails.length === 0) {
      console.log("No manager emails found");
      return new Response(
        JSON.stringify({ success: false, message: "No manager emails found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${managerEmails.length} managers to notify`);

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Fetch tickets from the past week
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select(`
        id,
        status,
        created_at,
        first_response_at,
        resolved_at,
        sla_breach_response,
        sla_breach_resolution,
        priority:ticket_priorities(name, response_time_hours, resolution_time_hours),
        category:ticket_categories(name)
      `)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      throw ticketsError;
    }

    console.log(`Found ${tickets?.length || 0} tickets in the past week`);

    // Calculate metrics
    const metrics = calculateMetrics(tickets || []);

    // Generate and send email
    const reportHtml = generateReportHtml(metrics, startDate, endDate);
    
    const { error: emailError } = await resend.emails.send({
      from: "HRIS Help Desk <onboarding@resend.dev>",
      to: managerEmails,
      subject: `📊 Weekly SLA Performance Report - ${formatDate(startDate)} to ${formatDate(endDate)}`,
      html: reportHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log(`Weekly SLA report sent to ${managerEmails.length} managers`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Report sent to ${managerEmails.length} managers`,
        metrics: {
          totalTickets: metrics.totalTickets,
          responseCompliance: metrics.responseCompliance.toFixed(1),
          resolutionCompliance: metrics.resolutionCompliance.toFixed(1),
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-sla-weekly-report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

function calculateMetrics(tickets: any[]): SlaMetrics {
  const totalTickets = tickets.length;
  
  if (totalTickets === 0) {
    return {
      totalTickets: 0,
      resolvedTickets: 0,
      responseCompliance: 100,
      resolutionCompliance: 100,
      responseBreaches: 0,
      resolutionBreaches: 0,
      avgResponseTimeHours: 0,
      avgResolutionTimeHours: 0,
      byPriority: [],
      topCategories: [],
    };
  }

  // Process tickets for joins
  const processedTickets = tickets.map(t => ({
    ...t,
    priority: Array.isArray(t.priority) ? t.priority[0] : t.priority,
    category: Array.isArray(t.category) ? t.category[0] : t.category,
  }));

  const resolvedTickets = processedTickets.filter(t => 
    t.status === "resolved" || t.status === "closed"
  ).length;

  const ticketsWithResponse = processedTickets.filter(t => t.first_response_at);
  const responseBreaches = processedTickets.filter(t => t.sla_breach_response === true).length;
  const resolutionBreaches = processedTickets.filter(t => t.sla_breach_resolution === true).length;

  const responseCompliance = ticketsWithResponse.length > 0
    ? ((ticketsWithResponse.length - responseBreaches) / ticketsWithResponse.length) * 100
    : 100;

  const resolutionCompliance = resolvedTickets > 0
    ? ((resolvedTickets - resolutionBreaches) / resolvedTickets) * 100
    : 100;

  // Calculate average times
  const responseTimes = ticketsWithResponse.map(t => {
    const created = new Date(t.created_at);
    const responded = new Date(t.first_response_at);
    return (responded.getTime() - created.getTime()) / (1000 * 60 * 60);
  });

  const resolutionTimes = processedTickets
    .filter(t => t.resolved_at)
    .map(t => {
      const created = new Date(t.created_at);
      const resolved = new Date(t.resolved_at);
      return (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
    });

  const avgResponseTimeHours = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const avgResolutionTimeHours = resolutionTimes.length > 0
    ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
    : 0;

  // Group by priority
  const priorityMap = new Map<string, { name: string; total: number; responseBreaches: number; resolutionBreaches: number }>();
  processedTickets.forEach(t => {
    const name = t.priority?.name || "No Priority";
    if (!priorityMap.has(name)) {
      priorityMap.set(name, { name, total: 0, responseBreaches: 0, resolutionBreaches: 0 });
    }
    const entry = priorityMap.get(name)!;
    entry.total++;
    if (t.sla_breach_response) entry.responseBreaches++;
    if (t.sla_breach_resolution) entry.resolutionBreaches++;
  });

  // Group by category
  const categoryMap = new Map<string, { name: string; total: number; breaches: number }>();
  processedTickets.forEach(t => {
    const name = t.category?.name || "Uncategorized";
    if (!categoryMap.has(name)) {
      categoryMap.set(name, { name, total: 0, breaches: 0 });
    }
    const entry = categoryMap.get(name)!;
    entry.total++;
    if (t.sla_breach_response || t.sla_breach_resolution) entry.breaches++;
  });

  return {
    totalTickets,
    resolvedTickets,
    responseCompliance,
    resolutionCompliance,
    responseBreaches,
    resolutionBreaches,
    avgResponseTimeHours,
    avgResolutionTimeHours,
    byPriority: Array.from(priorityMap.values()).sort((a, b) => b.total - a.total),
    topCategories: Array.from(categoryMap.values()).sort((a, b) => b.total - a.total).slice(0, 5),
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getComplianceColor(value: number): string {
  if (value >= 95) return "#22c55e";
  if (value >= 80) return "#eab308";
  return "#ef4444";
}

function getComplianceLabel(value: number): string {
  if (value >= 95) return "Excellent";
  if (value >= 80) return "Good";
  if (value >= 60) return "Needs Improvement";
  return "Critical";
}

function generateReportHtml(metrics: SlaMetrics, startDate: Date, endDate: Date): string {
  const responseColor = getComplianceColor(metrics.responseCompliance);
  const resolutionColor = getComplianceColor(metrics.resolutionCompliance);

  const priorityRows = metrics.byPriority.map(p => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${p.total}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: ${p.responseBreaches > 0 ? '#ef4444' : '#22c55e'};">${p.responseBreaches}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: ${p.resolutionBreaches > 0 ? '#ef4444' : '#22c55e'};">${p.resolutionBreaches}</td>
    </tr>
  `).join("");

  const categoryRows = metrics.topCategories.map(c => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${c.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${c.total}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: ${c.breaches > 0 ? '#ef4444' : '#22c55e'};">${c.breaches}</td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📊 Weekly SLA Report</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            ${formatDate(startDate)} - ${formatDate(endDate)}
          </p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          
          <!-- Executive Summary -->
          <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Executive Summary
          </h2>
          
          <!-- Key Metrics Grid -->
          <div style="display: table; width: 100%; margin-bottom: 30px;">
            <div style="display: table-row;">
              <!-- Total Tickets -->
              <div style="display: table-cell; width: 25%; padding: 10px; text-align: center; background: #f9fafb; border-radius: 8px;">
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #3b82f6;">${metrics.totalTickets}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Total Tickets</p>
              </div>
              <!-- Resolved -->
              <div style="display: table-cell; width: 25%; padding: 10px; text-align: center;">
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #22c55e;">${metrics.resolvedTickets}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Resolved</p>
              </div>
              <!-- Response Breaches -->
              <div style="display: table-cell; width: 25%; padding: 10px; text-align: center;">
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: ${metrics.responseBreaches > 0 ? '#ef4444' : '#22c55e'};">${metrics.responseBreaches}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Response Breaches</p>
              </div>
              <!-- Resolution Breaches -->
              <div style="display: table-cell; width: 25%; padding: 10px; text-align: center;">
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: ${metrics.resolutionBreaches > 0 ? '#ef4444' : '#22c55e'};">${metrics.resolutionBreaches}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Resolution Breaches</p>
              </div>
            </div>
          </div>

          <!-- SLA Compliance -->
          <h2 style="color: #1f2937; font-size: 20px; margin: 30px 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            SLA Compliance
          </h2>
          
          <div style="display: table; width: 100%; margin-bottom: 30px;">
            <div style="display: table-row;">
              <!-- Response SLA -->
              <div style="display: table-cell; width: 50%; padding: 15px; background: #f9fafb; border-radius: 8px; vertical-align: top;">
                <div style="text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Response SLA Compliance</p>
                  <p style="margin: 10px 0; font-size: 48px; font-weight: bold; color: ${responseColor};">
                    ${metrics.responseCompliance.toFixed(1)}%
                  </p>
                  <span style="display: inline-block; padding: 4px 12px; background: ${responseColor}20; color: ${responseColor}; border-radius: 20px; font-size: 12px; font-weight: 500;">
                    ${getComplianceLabel(metrics.responseCompliance)}
                  </span>
                  <p style="margin: 15px 0 0 0; font-size: 12px; color: #6b7280;">
                    Avg Response Time: <strong>${metrics.avgResponseTimeHours.toFixed(1)}h</strong>
                  </p>
                </div>
              </div>
              <!-- Spacer -->
              <div style="display: table-cell; width: 20px;"></div>
              <!-- Resolution SLA -->
              <div style="display: table-cell; width: 50%; padding: 15px; background: #f9fafb; border-radius: 8px; vertical-align: top;">
                <div style="text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Resolution SLA Compliance</p>
                  <p style="margin: 10px 0; font-size: 48px; font-weight: bold; color: ${resolutionColor};">
                    ${metrics.resolutionCompliance.toFixed(1)}%
                  </p>
                  <span style="display: inline-block; padding: 4px 12px; background: ${resolutionColor}20; color: ${resolutionColor}; border-radius: 20px; font-size: 12px; font-weight: 500;">
                    ${getComplianceLabel(metrics.resolutionCompliance)}
                  </span>
                  <p style="margin: 15px 0 0 0; font-size: 12px; color: #6b7280;">
                    Avg Resolution Time: <strong>${metrics.avgResolutionTimeHours.toFixed(1)}h</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- By Priority -->
          ${metrics.byPriority.length > 0 ? `
          <h2 style="color: #1f2937; font-size: 20px; margin: 30px 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Performance by Priority
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Priority</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Tickets</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Response Breaches</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Resolution Breaches</th>
              </tr>
            </thead>
            <tbody>
              ${priorityRows}
            </tbody>
          </table>
          ` : ""}

          <!-- By Category -->
          ${metrics.topCategories.length > 0 ? `
          <h2 style="color: #1f2937; font-size: 20px; margin: 30px 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Top Categories
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Category</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Tickets</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Total Breaches</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows}
            </tbody>
          </table>
          ` : ""}

          <!-- Recommendations -->
          ${(metrics.responseBreaches > 0 || metrics.resolutionBreaches > 0) ? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 20px;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e;">⚠️ Areas for Improvement</p>
            <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
              ${metrics.responseBreaches > 0 ? `<li>Response SLA: ${metrics.responseBreaches} breach(es) this week. Consider reviewing staffing during peak hours.</li>` : ""}
              ${metrics.resolutionBreaches > 0 ? `<li>Resolution SLA: ${metrics.resolutionBreaches} breach(es) this week. Review ticket complexity and escalation processes.</li>` : ""}
            </ul>
          </div>
          ` : `
          <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 20px;">
            <p style="margin: 0; font-weight: 600; color: #166534;">✅ Great Performance!</p>
            <p style="margin: 10px 0 0 0; color: #166534; font-size: 14px;">No SLA breaches this week. Keep up the excellent work!</p>
          </div>
          `}
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            This is an automated weekly report from the HRIS Help Desk system.<br>
            Generated on ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
