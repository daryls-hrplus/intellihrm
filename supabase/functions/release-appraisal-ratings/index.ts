import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const Resend = (await import("https://esm.sh/resend@2.0.0")).Resend;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReleaseRatingsRequest {
  cycleId: string;
  participantIds?: string[]; // Optional - if not provided, release all finalized
  releasedBy: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { cycleId, participantIds, releasedBy }: ReleaseRatingsRequest = await req.json();

    console.log(`Processing rating release for cycle: ${cycleId}`);

    // Fetch cycle details
    const { data: cycle, error: cycleError } = await supabase
      .from("appraisal_cycles")
      .select("id, name, company_id")
      .eq("id", cycleId)
      .single();

    if (cycleError || !cycle) {
      console.error("Cycle not found:", cycleError);
      return new Response(JSON.stringify({ error: "Cycle not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch company details
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", cycle.company_id)
      .single();

    // Build query for participants
    let participantsQuery = supabase
      .from("appraisal_participants")
      .select(`
        id,
        employee_id,
        status,
        overall_score,
        released_at
      `)
      .eq("cycle_id", cycleId)
      .in("status", ["finalized", "reviewed"]) // Only release finalized/reviewed participants
      .is("released_at", null); // Not already released

    // Filter by specific participants if provided
    if (participantIds && participantIds.length > 0) {
      participantsQuery = participantsQuery.in("id", participantIds);
    }

    const { data: participants, error: participantsError } = await participantsQuery;

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }

    if (!participants || participants.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No participants eligible for release",
          results: { released: 0, notified: 0, errors: [] }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${participants.length} participants to release ratings for`);

    const now = new Date().toISOString();
    const results: { released: number; notified: number; errors: string[] } = { 
      released: 0, 
      notified: 0, 
      errors: [] 
    };

    // Update all participants to released status
    const participantIdsToRelease = participants.map(p => p.id);
    const { error: updateError } = await supabase
      .from("appraisal_participants")
      .update({
        status: "released",
        released_at: now,
        released_by: releasedBy,
      })
      .in("id", participantIdsToRelease);

    if (updateError) {
      console.error("Error updating participants:", updateError);
      throw updateError;
    }

    results.released = participants.length;

    // Update cycle with release timestamp if all participants are being released
    if (!participantIds) {
      await supabase
        .from("appraisal_cycles")
        .update({
          ratings_released_at: now,
          ratings_released_by: releasedBy,
        })
        .eq("id", cycleId);
    }

    // Fetch email template
    const { data: template } = await supabase
      .from("reminder_email_templates")
      .select("subject, body")
      .eq("category", "performance_appraisals")
      .eq("name", "Rating Release")
      .eq("is_active", true)
      .single();

    // Get event type for logging
    const { data: eventType } = await supabase
      .from("reminder_event_types")
      .select("id")
      .eq("code", "APPRAISAL_RATING_RELEASED")
      .single();

    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Send notifications for each participant
    for (const participant of participants) {
      try {
        // Get employee details
        const { data: employee } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", participant.employee_id)
          .single();

        if (!employee) continue;

        const firstName = employee.full_name?.split(" ")[0] || "Team Member";

        // Replace template placeholders
        let subject = template?.subject || `Your Performance Review Results for ${cycle.name} Are Now Available`;
        let body = template?.body || `Dear ${firstName},\n\nYour performance review results for "${cycle.name}" are now available.\n\nPlease log in to view your results and provide your acknowledgment.\n\nBest regards,\n${company?.name || "HR"} Team`;

        subject = subject
          .replace(/\{\{cycle_name\}\}/g, cycle.name)
          .replace(/\{\{employee_first_name\}\}/g, firstName);

        body = body
          .replace(/\{\{cycle_name\}\}/g, cycle.name)
          .replace(/\{\{employee_first_name\}\}/g, firstName)
          .replace(/\{\{company_name\}\}/g, company?.name || "");

        // Create delivery log entry
        const { data: deliveryLog } = await supabase
          .from("reminder_delivery_log")
          .insert({
            company_id: cycle.company_id,
            employee_id: employee.id,
            event_type_id: eventType?.id,
            delivery_channel: resend ? "email" : "in_app",
            recipient_email: employee.email,
            recipient_name: employee.full_name,
            subject,
            body_preview: body.substring(0, 200),
            status: "pending",
            source_record_id: cycleId,
            source_table: "appraisal_cycles",
            metadata: { 
              cycle_name: cycle.name, 
              participant_id: participant.id,
              overall_score: participant.overall_score 
            },
          })
          .select()
          .single();

        // Send email if Resend is configured
        if (resend && employee.email) {
          try {
            const emailResult = await resend.emails.send({
              from: "HRplus Cerebra <noreply@notifications.intellihrm.net>",
              to: [employee.email],
              subject,
              html: body.replace(/\n/g, "<br>"),
            });

            await supabase
              .from("reminder_delivery_log")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
                message_id: emailResult.data?.id,
              })
              .eq("id", deliveryLog?.id);

            results.notified++;
          } catch (emailError: any) {
            console.error(`Failed to send email to ${employee.email}:`, emailError);
            
            await supabase
              .from("reminder_delivery_log")
              .update({
                status: "failed",
                failed_at: new Date().toISOString(),
                failure_reason: emailError.message,
              })
              .eq("id", deliveryLog?.id);

            results.errors.push(`${employee.email}: ${emailError.message}`);
          }
        } else {
          // Mark as sent for in-app only
          await supabase
            .from("reminder_delivery_log")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", deliveryLog?.id);

          results.notified++;
        }

        // Create in-app notification
        await supabase.from("notifications").insert({
          user_id: employee.id,
          title: "Performance Review Results Available",
          message: `Your performance review results for "${cycle.name}" are now available. Please log in to view and acknowledge your review.`,
          type: "appraisal_released",
          reference_id: participant.id,
          reference_type: "appraisal_participant",
        });

      } catch (error: any) {
        console.error(`Error processing participant ${participant.id}:`, error);
        results.errors.push(`Participant ${participant.id}: ${error.message}`);
      }
    }

    console.log(`Rating release complete: ${results.released} released, ${results.notified} notified`);

    return new Response(
      JSON.stringify({
        success: true,
        cycleName: cycle.name,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in release-appraisal-ratings:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
