import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const Resend = (await import("https://esm.sh/resend@2.0.0")).Resend;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  cycleId: string;
  companyId: string;
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
    const { cycleId, companyId }: NotificationRequest = await req.json();

    console.log(`Processing 360 results release notifications for cycle: ${cycleId}`);

    // Fetch cycle details
    const { data: cycle, error: cycleError } = await supabase
      .from("review_cycles")
      .select("name, company_id, results_released_at")
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
      .eq("id", companyId)
      .single();

    // Fetch all participants for this cycle
    const { data: participants, error: participantsError } = await supabase
      .from("review_participants")
      .select(`
        id,
        employee_id,
        employee:profiles!review_participants_employee_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq("cycle_id", cycleId);

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }

    console.log(`Found ${participants?.length || 0} participants to notify`);

    // Fetch the 360 Results Released email template
    const { data: template } = await supabase
      .from("reminder_email_templates")
      .select("subject, body")
      .eq("category", "performance")
      .eq("name", "360 Results Released")
      .eq("is_active", true)
      .single();

    // Get event type for logging
    const { data: eventType } = await supabase
      .from("reminder_event_types")
      .select("id")
      .eq("code", "360_RESULTS_RELEASED")
      .single();

    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const results: { sent: number; failed: number; errors: string[] } = { sent: 0, failed: 0, errors: [] };

    for (const participant of participants || []) {
      const employee = participant.employee as any;
      if (!employee?.email) continue;

      const firstName = employee.full_name?.split(" ")[0] || "Team Member";
      
      // Replace template placeholders
      let subject = template?.subject || "Your 360 Feedback Results Are Now Available";
      let body = template?.body || `Dear ${firstName},\n\nYour 360 feedback results for "${cycle.name}" are now available. Please log in to view your feedback report.\n\nBest regards,\n${company?.name || "HR"} Team`;

      subject = subject
        .replace(/\{\{cycle_name\}\}/g, cycle.name)
        .replace(/\{\{employee_first_name\}\}/g, firstName);

      body = body
        .replace(/\{\{cycle_name\}\}/g, cycle.name)
        .replace(/\{\{employee_first_name\}\}/g, firstName)
        .replace(/\{\{company_name\}\}/g, company?.name || "");

      // Create delivery log entry
      const { data: deliveryLog, error: logError } = await supabase
        .from("reminder_delivery_log")
        .insert({
          company_id: companyId,
          employee_id: employee.id,
          event_type_id: eventType?.id,
          delivery_channel: resend ? "email" : "in_app",
          recipient_email: employee.email,
          recipient_name: employee.full_name,
          subject,
          body_preview: body.substring(0, 200),
          status: "pending",
          source_record_id: cycleId,
          source_table: "review_cycles",
          metadata: { cycle_name: cycle.name, participant_id: participant.id },
        })
        .select()
        .single();

      // Try to send email if Resend is configured
      if (resend) {
        try {
          const emailResult = await resend.emails.send({
            from: "HRplus <noreply@resend.dev>",
            to: [employee.email],
            subject,
            html: body.replace(/\n/g, "<br>"),
          });

          // Update delivery log with success
          await supabase
            .from("reminder_delivery_log")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              message_id: emailResult.data?.id,
            })
            .eq("id", deliveryLog?.id);

          results.sent++;
        } catch (emailError: any) {
          console.error(`Failed to send email to ${employee.email}:`, emailError);
          
          // Update delivery log with failure
          await supabase
            .from("reminder_delivery_log")
            .update({
              status: "failed",
              failed_at: new Date().toISOString(),
              failure_reason: emailError.message,
            })
            .eq("id", deliveryLog?.id);

          results.failed++;
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

        results.sent++;
      }

      // Create in-app notification
      await supabase.from("notifications").insert({
        user_id: employee.id,
        title: "360 Feedback Results Available",
        message: `Your feedback results for "${cycle.name}" are now available to view.`,
        type: "360_results",
        reference_id: cycleId,
        reference_type: "review_cycle",
      });
    }

    console.log(`Notification results: ${results.sent} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications processed: ${results.sent} sent, ${results.failed} failed`,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-360-release-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
