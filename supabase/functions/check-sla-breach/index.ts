import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketWithSLA {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  created_at: string;
  first_response_at: string | null;
  due_date: string | null;
  sla_breach_response: boolean | null;
  sla_breach_resolution: boolean | null;
  requester: { id: string; email: string; full_name: string | null };
  assignee: { id: string; email: string; full_name: string | null } | null;
  priority: { name: string; response_time_hours: number; resolution_time_hours: number } | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for tickets approaching or breaching SLA...");

    // Get Resend API key from system settings
    const { data: settingData, error: settingError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .single();

    if (settingError || !settingData?.value) {
      console.log("Resend API key not configured, skipping email notifications");
      return new Response(
        JSON.stringify({ success: false, message: "Resend API key not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(settingData.value);

    // Get admin and HR manager emails for escalation
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "hr_manager"]);

    const adminUserIds = adminRoles?.map((r) => r.user_id) || [];
    let managerEmails: string[] = [];

    if (adminUserIds.length > 0) {
      const { data: adminProfiles } = await supabase
        .from("profiles")
        .select("email")
        .in("id", adminUserIds);
      managerEmails = adminProfiles?.map((p) => p.email).filter(Boolean) || [];
    }

    console.log(`Found ${managerEmails.length} managers for escalation`);

    // Get open tickets with priority and SLA info
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select(`
        id,
        ticket_number,
        subject,
        status,
        created_at,
        first_response_at,
        due_date,
        sla_breach_response,
        sla_breach_resolution,
        requester:profiles!tickets_requester_id_fkey(id, email, full_name),
        assignee:profiles!tickets_assignee_id_fkey(id, email, full_name),
        priority:ticket_priorities!tickets_priority_id_fkey(name, response_time_hours, resolution_time_hours)
      `)
      .in("status", ["open", "in_progress", "pending"])
      .not("priority_id", "is", null);

    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      throw ticketsError;
    }

    const now = new Date();
    const warningThresholdPercent = 0.8; // Warn at 80% of SLA time
    const warningsSent: string[] = [];
    const breachesSent: string[] = [];
    const escalationsSent: string[] = [];

    for (const ticketData of tickets || []) {
      // Handle Supabase's array return for single joins
      const ticket = {
        ...ticketData,
        requester: Array.isArray(ticketData.requester) ? ticketData.requester[0] : ticketData.requester,
        assignee: Array.isArray(ticketData.assignee) ? ticketData.assignee[0] : ticketData.assignee,
        priority: Array.isArray(ticketData.priority) ? ticketData.priority[0] : ticketData.priority,
      } as TicketWithSLA;
      
      if (!ticket.priority) continue;

      const createdAt = new Date(ticket.created_at);
      const recipientEmail = ticket.assignee?.email || ticket.requester.email;
      
      // === Response SLA Check ===
      if (!ticket.first_response_at) {
        const responseDeadline = new Date(createdAt.getTime() + ticket.priority.response_time_hours * 60 * 60 * 1000);
        const warningTime = new Date(createdAt.getTime() + ticket.priority.response_time_hours * warningThresholdPercent * 60 * 60 * 1000);
        
        // Check for actual breach (past deadline)
        if (now >= responseDeadline && !ticket.sla_breach_response) {
          const overdueMins = Math.round((now.getTime() - responseDeadline.getTime()) / (60 * 1000));
          
          // Send to assignee/requester
          await sendSLABreachEmail(resend, ticket, "response", overdueMins, recipientEmail);
          breachesSent.push(`Response BREACH for ${ticket.ticket_number}`);
          
          // Escalate to managers
          if (managerEmails.length > 0) {
            await sendEscalationEmail(resend, ticket, "response", overdueMins, managerEmails);
            escalationsSent.push(`Response ESCALATION for ${ticket.ticket_number}`);
          }
          
          // Mark as breached to avoid duplicate notifications
          await supabase
            .from("tickets")
            .update({ sla_breach_response: true })
            .eq("id", ticket.id);
        }
        // Check for warning (approaching deadline)
        else if (now >= warningTime && now < responseDeadline) {
          const timeLeft = Math.round((responseDeadline.getTime() - now.getTime()) / (60 * 1000));
          await sendSLAWarningEmail(resend, ticket, "response", timeLeft, recipientEmail);
          warningsSent.push(`Response warning for ${ticket.ticket_number}`);
        }
      }

      // === Resolution SLA Check ===
      const resolutionDeadline = new Date(createdAt.getTime() + ticket.priority.resolution_time_hours * 60 * 60 * 1000);
      const resolutionWarningTime = new Date(createdAt.getTime() + ticket.priority.resolution_time_hours * warningThresholdPercent * 60 * 60 * 1000);
      
      // Check for actual breach (past deadline)
      if (now >= resolutionDeadline && !ticket.sla_breach_resolution) {
        const overdueMins = Math.round((now.getTime() - resolutionDeadline.getTime()) / (60 * 1000));
        
        // Send to assignee/requester
        await sendSLABreachEmail(resend, ticket, "resolution", overdueMins, recipientEmail);
        breachesSent.push(`Resolution BREACH for ${ticket.ticket_number}`);
        
        // Escalate to managers
        if (managerEmails.length > 0) {
          await sendEscalationEmail(resend, ticket, "resolution", overdueMins, managerEmails);
          escalationsSent.push(`Resolution ESCALATION for ${ticket.ticket_number}`);
        }
        
        // Mark as breached to avoid duplicate notifications
        await supabase
          .from("tickets")
          .update({ sla_breach_resolution: true })
          .eq("id", ticket.id);
      }
      // Check for warning (approaching deadline)
      else if (now >= resolutionWarningTime && now < resolutionDeadline) {
        const timeLeft = Math.round((resolutionDeadline.getTime() - now.getTime()) / (60 * 1000));
        await sendSLAWarningEmail(resend, ticket, "resolution", timeLeft, recipientEmail);
        warningsSent.push(`Resolution warning for ${ticket.ticket_number}`);
      }
    }

    console.log(`SLA check complete. Warnings: ${warningsSent.length}, Breaches: ${breachesSent.length}, Escalations: ${escalationsSent.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: [...warningsSent, ...breachesSent, ...escalationsSent],
        warningsCount: warningsSent.length,
        breachesCount: breachesSent.length,
        escalationsCount: escalationsSent.length
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in check-sla-breach:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

async function sendSLAWarningEmail(
  resend: Resend,
  ticket: TicketWithSLA,
  slaType: "response" | "resolution",
  minutesLeft: number,
  recipientEmail: string
) {
  const hoursLeft = Math.floor(minutesLeft / 60);
  const mins = minutesLeft % 60;
  const timeString = hoursLeft > 0 ? `${hoursLeft}h ${mins}m` : `${mins} minutes`;

  const subject = `⚠️ SLA Warning: Ticket ${ticket.ticket_number} - ${slaType === "response" ? "Response" : "Resolution"} deadline approaching`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ SLA Warning</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
          The following ticket is approaching its <strong>${slaType === "response" ? "first response" : "resolution"}</strong> SLA deadline:
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #92400e;"><strong>Time Remaining: ${timeString}</strong></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Ticket Number</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${ticket.ticket_number}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Subject</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.subject}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Priority</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.priority?.name || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Status</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.status}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Requester</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.requester.full_name || ticket.requester.email}</td>
          </tr>
          ${ticket.assignee ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Assignee</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.assignee.full_name || ticket.assignee.email}</td>
          </tr>
          ` : ""}
        </table>

        <p style="color: #6b7280; font-size: 14px;">
          Please take action to avoid SLA breach.
        </p>
      </div>
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        This is an automated message from the HRIS Help Desk system.
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "HRIS Help Desk <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });
    console.log(`SLA warning email sent to ${recipientEmail} for ticket ${ticket.ticket_number}`);
  } catch (error) {
    console.error(`Failed to send SLA warning email for ticket ${ticket.ticket_number}:`, error);
  }
}

async function sendSLABreachEmail(
  resend: Resend,
  ticket: TicketWithSLA,
  slaType: "response" | "resolution",
  minutesOverdue: number,
  recipientEmail: string
) {
  const hoursOver = Math.floor(minutesOverdue / 60);
  const mins = minutesOverdue % 60;
  const timeString = hoursOver > 0 ? `${hoursOver}h ${mins}m` : `${mins} minutes`;

  const subject = `🚨 SLA BREACHED: Ticket ${ticket.ticket_number} - ${slaType === "response" ? "Response" : "Resolution"} deadline exceeded`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🚨 SLA BREACHED</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
          The following ticket has <strong>breached</strong> its <strong>${slaType === "response" ? "first response" : "resolution"}</strong> SLA:
        </p>
        
        <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #991b1b;"><strong>⏱️ Overdue by: ${timeString}</strong></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Ticket Number</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${ticket.ticket_number}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Subject</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.subject}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Priority</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.priority?.name || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Status</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.status}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Requester</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.requester.full_name || ticket.requester.email}</td>
          </tr>
          ${ticket.assignee ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Assignee</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.assignee.full_name || ticket.assignee.email}</td>
          </tr>
          ` : ""}
        </table>

        <div style="background: #fef2f2; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #991b1b; font-size: 14px;">
            <strong>Immediate action required.</strong> This ticket has exceeded its SLA commitment and requires urgent attention.
          </p>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        This is an automated message from the HRIS Help Desk system.
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "HRIS Help Desk <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });
    console.log(`SLA BREACH email sent to ${recipientEmail} for ticket ${ticket.ticket_number}`);
  } catch (error) {
    console.error(`Failed to send SLA breach email for ticket ${ticket.ticket_number}:`, error);
  }
}

async function sendEscalationEmail(
  resend: Resend,
  ticket: TicketWithSLA,
  slaType: "response" | "resolution",
  minutesOverdue: number,
  managerEmails: string[]
) {
  const hoursOver = Math.floor(minutesOverdue / 60);
  const mins = minutesOverdue % 60;
  const timeString = hoursOver > 0 ? `${hoursOver}h ${mins}m` : `${mins} minutes`;

  const subject = `🔺 ESCALATION: Ticket ${ticket.ticket_number} has breached ${slaType === "response" ? "Response" : "Resolution"} SLA`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔺 SLA Breach Escalation</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
          <strong>Management Alert:</strong> The following ticket has breached its <strong>${slaType === "response" ? "first response" : "resolution"}</strong> SLA and requires your attention:
        </p>
        
        <div style="background: #ede9fe; border-left: 4px solid #7c3aed; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0 0 5px 0; color: #5b21b6;"><strong>⏱️ Overdue by: ${timeString}</strong></p>
          <p style="margin: 0; color: #6d28d9; font-size: 14px;">SLA Type: ${slaType === "response" ? "First Response" : "Resolution"}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Ticket Number</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${ticket.ticket_number}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Subject</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.subject}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Priority</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.priority?.name || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Status</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.status}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Requester</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.requester.full_name || ticket.requester.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Assigned To</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${ticket.assignee ? (ticket.assignee.full_name || ticket.assignee.email) : '<span style="color: #dc2626;">Unassigned</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Created</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${new Date(ticket.created_at).toLocaleString()}</td>
          </tr>
        </table>

        <div style="background: #f3f4f6; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px; font-weight: 600;">
            Recommended Actions:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
            <li>Review ticket priority and reassign if necessary</li>
            <li>Contact the assigned agent or assign to available staff</li>
            <li>Communicate with the requester about the delay</li>
            <li>Document reasons for the breach for process improvement</li>
          </ul>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        This escalation was sent to all administrators and HR managers.<br>
        HRIS Help Desk System
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "HRIS Help Desk <onboarding@resend.dev>",
      to: managerEmails,
      subject,
      html,
    });
    console.log(`SLA ESCALATION email sent to ${managerEmails.length} manager(s) for ticket ${ticket.ticket_number}`);
  } catch (error) {
    console.error(`Failed to send escalation email for ticket ${ticket.ticket_number}:`, error);
  }
}

serve(handler);
