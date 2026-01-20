import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendRequest {
  cycleId: string;
  targetAudience?: "all" | "participants" | "managers";
}

interface ResendResult {
  success: boolean;
  cycleId: string;
  cycleName: string;
  participantsNotified: number;
  managersNotified: number;
  emailsSentToParticipants: number;
  emailsSentToManagers: number;
  errors: string[];
  warnings: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Resend for email sending
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    
    if (!resend) {
      console.warn("[resend-appraisal-notifications] RESEND_API_KEY not configured - emails will not be sent");
    }

    // Get authorization header for user context
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { cycleId, targetAudience = "all" }: ResendRequest = await req.json();

    if (!cycleId) {
      return new Response(
        JSON.stringify({ success: false, error: "cycleId is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const result: ResendResult = {
      success: true,
      cycleId,
      cycleName: "",
      participantsNotified: 0,
      managersNotified: 0,
      emailsSentToParticipants: 0,
      emailsSentToManagers: 0,
      errors: [],
      warnings: [],
    };

    console.log(`[resend-appraisal-notifications] Starting resend for cycle: ${cycleId}`);

    // 1. Validate cycle exists and is active
    const { data: cycle, error: cycleError } = await supabase
      .from("appraisal_cycles")
      .select(`
        id, 
        name, 
        company_id, 
        status, 
        start_date, 
        end_date, 
        evaluation_deadline
      `)
      .eq("id", cycleId)
      .single();

    if (cycleError || !cycle) {
      console.error(`[resend-appraisal-notifications] Cycle not found: ${cycleId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Cycle not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    result.cycleName = cycle.name;

    if (cycle.status !== "active") {
      return new Response(
        JSON.stringify({ success: false, error: `Cycle is ${cycle.status}. Only active cycles can have notifications resent.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch company name for email templates
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", cycle.company_id)
      .single();
    const companyName = company?.name || "Your Organization";

    // Fetch email templates for appraisal notifications
    const { data: participantTemplate } = await supabase
      .from("reminder_email_templates")
      .select("subject, body")
      .eq("category", "performance_appraisals")
      .eq("name", "Review Cycle Launch")
      .eq("is_active", true)
      .single();

    const { data: managerTemplate } = await supabase
      .from("reminder_email_templates")
      .select("subject, body")
      .eq("category", "performance_appraisals")
      .eq("name", "Manager Evaluation Submission Reminder")
      .eq("is_active", true)
      .single();

    console.log(`[resend-appraisal-notifications] Email templates loaded: participant=${!!participantTemplate}, manager=${!!managerTemplate}`);

    // 2. Get all participants for this cycle
    const { data: participants, error: participantsError } = await supabase
      .from("appraisal_participants")
      .select(`
        id,
        employee_id,
        evaluator_id,
        status,
        profiles:employee_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("cycle_id", cycleId);

    if (participantsError) {
      console.error(`[resend-appraisal-notifications] Error fetching participants:`, participantsError);
      result.errors.push(`Failed to fetch participants: ${participantsError.message}`);
    }

    if (!participants || participants.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No participants found in this cycle" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`[resend-appraisal-notifications] Found ${participants.length} participants`);

    // 3. Send notifications to participants
    const now = new Date().toISOString();
    const deadline = cycle.evaluation_deadline || cycle.end_date;
    
    if (targetAudience === "all" || targetAudience === "participants") {
      for (const participant of participants) {
        const profile = participant.profiles as any;
        if (profile?.id) {
          const notificationTitle = "Reminder: Appraisal Cycle Active";
          const notificationMessage = `The appraisal cycle "${cycle.name}" is active. Please complete your self-assessment by ${deadline}.`;
          const firstName = profile.first_name || 'Team Member';
          
          // In-app notification
          const { error: notifError } = await supabase.from("notifications").insert({
            user_id: profile.id,
            title: notificationTitle,
            message: notificationMessage,
            type: "info",
            link: "/ess/appraisals",
          });

          if (!notifError) {
            result.participantsNotified++;
            
            // Log in-app delivery
            const recipientName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown';
            await supabase.from("reminder_delivery_log").insert({
              company_id: cycle.company_id,
              employee_id: profile.id,
              delivery_channel: 'in_app',
              recipient_email: profile.email,
              recipient_name: recipientName,
              subject: notificationTitle,
              body_preview: notificationMessage.substring(0, 200),
              status: 'delivered',
              sent_at: now,
              delivered_at: now,
              source_table: 'appraisal_cycles',
              source_record_id: cycleId,
              metadata: { 
                cycle_name: cycle.name, 
                notification_type: 'participant_reminder',
                deadline
              }
            });
          } else {
            console.error(`[resend-appraisal-notifications] Failed to send to participant ${profile.id}:`, notifError);
          }

          // Send email to participant
          if (resend && profile.email) {
            try {
              let emailSubject = participantTemplate?.subject || `Reminder: Performance Review Cycle - ${cycle.name}`;
              let emailBody = participantTemplate?.body || 
                `Dear ${firstName},\n\nThis is a reminder that the performance review cycle "${cycle.name}" is currently active.\n\nPlease log in to complete your self-assessment by ${deadline}.\n\nBest regards,\n${companyName} HR Team`;

              // Replace placeholders
              emailSubject = emailSubject
                .replace(/\{\{cycle_name\}\}/g, cycle.name)
                .replace(/\{\{employee_first_name\}\}/g, firstName);
              
              emailBody = emailBody
                .replace(/\{\{employee_first_name\}\}/g, firstName)
                .replace(/\{\{cycle_name\}\}/g, cycle.name)
                .replace(/\{\{end_date\}\}/g, deadline)
                .replace(/\{\{deadline\}\}/g, deadline)
                .replace(/\{\{company_name\}\}/g, companyName);

              // Convert markdown to basic HTML
              const htmlBody = emailBody
                .replace(/\n/g, "<br>")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

              await resend.emails.send({
                from: "HRplus Cerebra <noreply@notifications.intellihrm.net>",
                to: [profile.email],
                subject: emailSubject,
                html: htmlBody,
              });

              result.emailsSentToParticipants++;
              
              // Log email delivery
              const recipientName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown';
              await supabase.from("reminder_delivery_log").insert({
                company_id: cycle.company_id,
                employee_id: profile.id,
                delivery_channel: 'email',
                recipient_email: profile.email,
                recipient_name: recipientName,
                subject: emailSubject,
                body_preview: emailBody.substring(0, 200),
                status: 'sent',
                sent_at: now,
                source_table: 'appraisal_cycles',
                source_record_id: cycleId,
                metadata: { 
                  cycle_name: cycle.name, 
                  notification_type: 'participant_reminder_email',
                  deadline
                }
              });
              
              console.log(`[resend-appraisal-notifications] Email sent to participant: ${profile.email}`);
            } catch (emailError) {
              console.error(`[resend-appraisal-notifications] Failed to send email to ${profile.email}:`, emailError);
              result.warnings.push(`Failed to send email to ${profile.email}`);
            }
          }
        }
      }
    }

    // 4. Send consolidated notification to each manager
    if (targetAudience === "all" || targetAudience === "managers") {
      // Group participants by evaluator
      const evaluatorGroups: Record<string, typeof participants> = {};
      
      for (const participant of participants) {
        const evaluatorId = participant.evaluator_id;
        if (evaluatorId) {
          if (!evaluatorGroups[evaluatorId]) {
            evaluatorGroups[evaluatorId] = [];
          }
          evaluatorGroups[evaluatorId].push(participant);
        }
      }

      for (const [evaluatorId, teamMembers] of Object.entries(evaluatorGroups)) {
        const memberNames = teamMembers
          .map(p => {
            const profile = p.profiles as any;
            return profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
          })
          .filter(Boolean)
          .join(", ");

        const managerTitle = "Reminder: Team Appraisals Pending";
        const managerMessage = `The appraisal cycle "${cycle.name}" is active. You have ${teamMembers.length} team member(s) to evaluate: ${memberNames}. Deadline: ${deadline}.`;

        // In-app notification
        const { error: managerNotifError } = await supabase.from("notifications").insert({
          user_id: evaluatorId,
          title: managerTitle,
          message: managerMessage,
          type: "action_required",
          link: "/mss/appraisals",
        });

        // Fetch manager profile for email
        const { data: managerProfile } = await supabase
          .from("profiles")
          .select("email, first_name, last_name")
          .eq("id", evaluatorId)
          .single();
        
        const managerName = managerProfile 
          ? `${managerProfile.first_name || ''} ${managerProfile.last_name || ''}`.trim() 
          : 'Unknown';
        const managerFirstName = managerProfile?.first_name || 'Manager';

        if (!managerNotifError) {
          result.managersNotified++;
          
          // Log in-app delivery
          await supabase.from("reminder_delivery_log").insert({
            company_id: cycle.company_id,
            employee_id: evaluatorId,
            delivery_channel: 'in_app',
            recipient_email: managerProfile?.email,
            recipient_name: managerName,
            subject: managerTitle,
            body_preview: managerMessage.substring(0, 200),
            status: 'delivered',
            sent_at: now,
            delivered_at: now,
            source_table: 'appraisal_cycles',
            source_record_id: cycleId,
            metadata: { 
              cycle_name: cycle.name, 
              notification_type: 'manager_reminder',
              team_size: teamMembers.length,
              deadline
            }
          });
        } else {
          console.error(`[resend-appraisal-notifications] Failed to send to manager ${evaluatorId}:`, managerNotifError);
        }

        // Send email to manager
        if (resend && managerProfile?.email) {
          try {
            let emailSubject = managerTemplate?.subject || `Reminder: Evaluate Your Team for ${cycle.name}`;
            let emailBody = managerTemplate?.body || 
              `Dear ${managerFirstName},\n\nThis is a reminder that the performance review cycle "${cycle.name}" is active.\n\n**Your Team Members Requiring Evaluation:**\n${memberNames}\n\n**Deadline:** ${deadline}\n\nPlease log in to complete your evaluations before the deadline.\n\nBest regards,\n${companyName} HR Team`;

            // Replace placeholders
            emailSubject = emailSubject
              .replace(/\{\{cycle_name\}\}/g, cycle.name)
              .replace(/\{\{manager_name\}\}/g, managerName)
              .replace(/\{\{manager_first_name\}\}/g, managerFirstName);
            
            emailBody = emailBody
              .replace(/\{\{manager_name\}\}/g, managerName)
              .replace(/\{\{manager_first_name\}\}/g, managerFirstName)
              .replace(/\{\{cycle_name\}\}/g, cycle.name)
              .replace(/\{\{team_member_list\}\}/g, memberNames)
              .replace(/\{\{team_count\}\}/g, String(teamMembers.length))
              .replace(/\{\{deadline\}\}/g, deadline)
              .replace(/\{\{end_date\}\}/g, deadline)
              .replace(/\{\{company_name\}\}/g, companyName);

            // Convert markdown to basic HTML
            const htmlBody = emailBody
              .replace(/\n/g, "<br>")
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

            await resend.emails.send({
              from: "HRplus Cerebra <noreply@notifications.intellihrm.net>",
              to: [managerProfile.email],
              subject: emailSubject,
              html: htmlBody,
            });

            result.emailsSentToManagers++;
            
            // Log email delivery
            await supabase.from("reminder_delivery_log").insert({
              company_id: cycle.company_id,
              employee_id: evaluatorId,
              delivery_channel: 'email',
              recipient_email: managerProfile.email,
              recipient_name: managerName,
              subject: emailSubject,
              body_preview: emailBody.substring(0, 200),
              status: 'sent',
              sent_at: now,
              source_table: 'appraisal_cycles',
              source_record_id: cycleId,
              metadata: { 
                cycle_name: cycle.name, 
                notification_type: 'manager_reminder_email',
                team_size: teamMembers.length,
                deadline
              }
            });
            
            console.log(`[resend-appraisal-notifications] Email sent to manager: ${managerProfile.email}`);
          } catch (emailError) {
            console.error(`[resend-appraisal-notifications] Failed to send email to manager ${managerProfile.email}:`, emailError);
            result.warnings.push(`Failed to send email to manager ${managerProfile.email}`);
          }
        }
      }
    }

    console.log(`[resend-appraisal-notifications] Resend complete: ${result.participantsNotified} participants (${result.emailsSentToParticipants} emails), ${result.managersNotified} managers (${result.emailsSentToManagers} emails)`);

    // 5. Log the resend job
    await supabase.from("ai_scheduled_job_runs").insert({
      job_name: "resend-appraisal-notifications",
      job_type: "appraisal_notification_resend",
      status: result.errors.length > 0 ? "completed_with_errors" : "completed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      metrics_generated: {
        cycleId: result.cycleId,
        cycleName: result.cycleName,
        participantsNotified: result.participantsNotified,
        managersNotified: result.managersNotified,
        emailsSentToParticipants: result.emailsSentToParticipants,
        emailsSentToManagers: result.emailsSentToManagers,
        targetAudience,
      },
      error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
      triggered_by: "manual",
      triggered_by_user: userId,
      company_id: cycle.company_id,
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[resend-appraisal-notifications] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
