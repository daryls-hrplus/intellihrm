import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivationRequest {
  cycleId: string;
  sendNotifications: boolean;
  lockGoals: boolean;
  createTasks: boolean;
}

interface ActivationResult {
  success: boolean;
  cycleId: string;
  cycleName: string;
  participantsNotified: number;
  managersNotified: number;
  emailsSentToParticipants: number;
  emailsSentToManagers: number;
  goalsLocked: number;
  tasksCreated: number;
  reminderRulesTriggered: number;
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
      console.warn("[activate-appraisal-cycle] RESEND_API_KEY not configured - emails will not be sent");
    }

    // Get authorization header for user context
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { 
      cycleId, 
      sendNotifications = true, 
      lockGoals = true,
      createTasks = true 
    }: ActivationRequest = await req.json();

    if (!cycleId) {
      return new Response(
        JSON.stringify({ success: false, error: "cycleId is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const now = new Date().toISOString();
    const result: ActivationResult = {
      success: true,
      cycleId,
      cycleName: "",
      participantsNotified: 0,
      managersNotified: 0,
      emailsSentToParticipants: 0,
      emailsSentToManagers: 0,
      goalsLocked: 0,
      tasksCreated: 0,
      reminderRulesTriggered: 0,
      errors: [],
      warnings: [],
    };

    console.log(`[activate-appraisal-cycle] Starting activation for cycle: ${cycleId}`);

    // 1. Validate cycle exists and is in draft status
    const { data: cycle, error: cycleError } = await supabase
      .from("appraisal_cycles")
      .select(`
        id, 
        name, 
        company_id, 
        status, 
        start_date, 
        end_date, 
        evaluation_deadline,
        template_id
      `)
      .eq("id", cycleId)
      .single();

    if (cycleError || !cycle) {
      console.error(`[activate-appraisal-cycle] Cycle not found: ${cycleId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Cycle not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    result.cycleName = cycle.name;

    if (cycle.status !== "draft") {
      console.error(`[activate-appraisal-cycle] Cycle is not in draft status: ${cycle.status}`);
      return new Response(
        JSON.stringify({ success: false, error: `Cycle is already ${cycle.status}. Only draft cycles can be activated.` }),
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

    console.log(`[activate-appraisal-cycle] Email templates loaded: participant=${!!participantTemplate}, manager=${!!managerTemplate}`);

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
          email,
          company_id
        )
      `)
      .eq("cycle_id", cycleId);

    if (participantsError) {
      console.error(`[activate-appraisal-cycle] Error fetching participants:`, participantsError);
      result.errors.push(`Failed to fetch participants: ${participantsError.message}`);
    }

    const participantCount = participants?.length || 0;
    console.log(`[activate-appraisal-cycle] Found ${participantCount} participants`);

    if (participantCount === 0) {
      result.warnings.push("No participants enrolled in this cycle. Consider adding participants before activation.");
    }

    // 3. Update cycle status to active with activation metadata
    const { error: updateError } = await supabase
      .from("appraisal_cycles")
      .update({
        status: "active",
        activated_at: now,
        activated_by: userId,
        updated_at: now,
      })
      .eq("id", cycleId);

    if (updateError) {
      console.error(`[activate-appraisal-cycle] Error updating cycle status:`, updateError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to activate cycle: ${updateError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`[activate-appraisal-cycle] Cycle status updated to active`);

    // 4. Update all participants to 'pending' status with due date
    if (participants && participants.length > 0) {
      const dueDate = cycle.evaluation_deadline || cycle.end_date;
      
      const { error: participantUpdateError } = await supabase
        .from("appraisal_participants")
        .update({
          status: "pending",
          due_date: dueDate,
          updated_at: now,
        })
        .eq("cycle_id", cycleId)
        .eq("status", "draft");

      if (participantUpdateError) {
        result.errors.push(`Failed to update participant statuses: ${participantUpdateError.message}`);
      } else {
        result.tasksCreated = participants.filter(p => (p as any).status === "draft").length;
      }
    }

    // 5. Send notifications to participants and managers
    if (sendNotifications && participants && participants.length > 0) {
      // Group participants by evaluator for manager notifications
      const evaluatorGroups: Record<string, typeof participants> = {};
      
      for (const participant of participants) {
        const evaluatorId = participant.evaluator_id;
        if (evaluatorId) {
          if (!evaluatorGroups[evaluatorId]) {
            evaluatorGroups[evaluatorId] = [];
          }
          evaluatorGroups[evaluatorId].push(participant);
        }

        // Send individual notification to each participant
        const profile = participant.profiles as any;
        if (profile?.id) {
          const notificationTitle = "Appraisal Cycle Started";
          const notificationMessage = `The appraisal cycle "${cycle.name}" has started. Please complete your self-assessment by ${cycle.evaluation_deadline || cycle.end_date}.`;
          const firstName = profile.first_name || profile.full_name?.split(' ')[0] || 'Team Member';
          const deadline = cycle.evaluation_deadline || cycle.end_date;
          
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
                notification_type: 'participant',
                deadline
              }
            });
          } else {
            console.error(`[activate-appraisal-cycle] Failed to send notification to participant ${profile.id}:`, notifError);
          }

          // Send email to participant
          if (resend && profile.email) {
            try {
              let emailSubject = participantTemplate?.subject || `Performance Review Cycle Started: ${cycle.name}`;
              let emailBody = participantTemplate?.body || 
                `Dear ${firstName},\n\nThe performance review cycle "${cycle.name}" has been launched.\n\nPlease log in to complete your self-assessment by ${deadline}.\n\nBest regards,\n${companyName} HR Team`;

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
                  notification_type: 'participant_email',
                  deadline
                }
              });
              
              console.log(`[activate-appraisal-cycle] Email sent to participant: ${profile.email}`);
            } catch (emailError) {
              console.error(`[activate-appraisal-cycle] Failed to send email to ${profile.email}:`, emailError);
              result.warnings.push(`Failed to send email to ${profile.email}`);
            }
          }
        }
      }

      // Send consolidated notification to each manager
      for (const [evaluatorId, teamMembers] of Object.entries(evaluatorGroups)) {
        const memberNames = teamMembers
          .map(p => {
            const profile = p.profiles as any;
            return profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
          })
          .filter(Boolean)
          .join(", ");

        const managerTitle = "Team Appraisals Ready for Evaluation";
        const managerMessage = `The appraisal cycle "${cycle.name}" has started. You have ${teamMembers.length} team member(s) to evaluate: ${memberNames}. Deadline: ${cycle.evaluation_deadline || cycle.end_date}.`;
        const deadline = cycle.evaluation_deadline || cycle.end_date;

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
              notification_type: 'manager',
              team_size: teamMembers.length,
              deadline
            }
          });
        } else {
          console.error(`[activate-appraisal-cycle] Failed to send notification to manager ${evaluatorId}:`, managerNotifError);
        }

        // Send email to manager
        if (resend && managerProfile?.email) {
          try {
            let emailSubject = managerTemplate?.subject || `Action Required: Evaluate Your Team for ${cycle.name}`;
            let emailBody = managerTemplate?.body || 
              `Dear ${managerFirstName},\n\nThe performance review cycle "${cycle.name}" is now active.\n\n**Your Team Members Requiring Evaluation:**\n${memberNames}\n\n**Deadline:** ${deadline}\n\nPlease log in to complete your evaluations before the deadline.\n\nBest regards,\n${companyName} HR Team`;

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
                notification_type: 'manager_email',
                team_size: teamMembers.length,
                deadline
              }
            });
            
            console.log(`[activate-appraisal-cycle] Email sent to manager: ${managerProfile.email}`);
          } catch (emailError) {
            console.error(`[activate-appraisal-cycle] Failed to send email to manager ${managerProfile.email}:`, emailError);
            result.warnings.push(`Failed to send email to manager ${managerProfile.email}`);
          }
        }
      }

      console.log(`[activate-appraisal-cycle] Notifications sent: ${result.participantsNotified} participants (${result.emailsSentToParticipants} emails), ${result.managersNotified} managers (${result.emailsSentToManagers} emails)`);
    }

    // 6. Trigger reminder rules for APPRAISAL_CYCLE_ACTIVATED event
    const { data: reminderRules, error: reminderError } = await supabase
      .from("reminder_rules")
      .select(`
        id,
        rule_name,
        event_type_id,
        reminder_event_types!inner(code)
      `)
      .eq("company_id", cycle.company_id)
      .eq("is_active", true)
      .not("effective_from", "is", null);

    if (!reminderError && reminderRules) {
      const activationRules = reminderRules.filter(
        (r: any) => r.reminder_event_types?.code === "APPRAISAL_CYCLE_ACTIVATED"
      );
      
      result.reminderRulesTriggered = activationRules.length;
      console.log(`[activate-appraisal-cycle] Found ${activationRules.length} reminder rules to trigger`);
    }

    // 7. Check for goal locking rules (on_cycle_freeze trigger)
    if (lockGoals) {
      const { data: lockingRules, error: lockingError } = await supabase
        .from("goal_locking_rules")
        .select("id, rule_name, trigger_type, target_status")
        .eq("company_id", cycle.company_id)
        .eq("is_active", true)
        .eq("trigger_type", "on_cycle_freeze");

      if (!lockingError && lockingRules && lockingRules.length > 0) {
        console.log(`[activate-appraisal-cycle] Found ${lockingRules.length} goal locking rules`);
        
        const { data: lockedGoals, error: lockError } = await supabase
          .from("goals")
          .update({
            is_locked: true,
            lock_reason: `Locked by appraisal cycle: ${cycle.name}`,
            locked_at: now,
            locked_by: userId,
            updated_at: now,
          })
          .eq("company_id", cycle.company_id)
          .eq("is_locked", false)
          .gte("target_date", cycle.start_date)
          .lte("target_date", cycle.end_date)
          .select("id");

        if (lockError) {
          result.errors.push(`Failed to lock goals: ${lockError.message}`);
        } else {
          result.goalsLocked = lockedGoals?.length || 0;
          console.log(`[activate-appraisal-cycle] Locked ${result.goalsLocked} goals`);
        }
      }
    }

    // 8. Log HR-level activation
    console.log(`[activate-appraisal-cycle] Cycle ${cycle.name} activated with ${participantCount} participants.`);

    // 9. Log the activation job
    await supabase.from("ai_scheduled_job_runs").insert({
      job_name: "activate-appraisal-cycle",
      job_type: "appraisal_activation",
      status: result.errors.length > 0 ? "completed_with_errors" : "completed",
      started_at: now,
      completed_at: new Date().toISOString(),
      metrics_generated: {
        cycleId: result.cycleId,
        cycleName: result.cycleName,
        participantsNotified: result.participantsNotified,
        managersNotified: result.managersNotified,
        emailsSentToParticipants: result.emailsSentToParticipants,
        emailsSentToManagers: result.emailsSentToManagers,
        goalsLocked: result.goalsLocked,
        tasksCreated: result.tasksCreated,
        reminderRulesTriggered: result.reminderRulesTriggered,
      },
      error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
      triggered_by: "manual",
      triggered_by_user: userId,
      company_id: cycle.company_id,
    });

    console.log(`[activate-appraisal-cycle] Activation complete for cycle: ${cycle.name}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[activate-appraisal-cycle] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
