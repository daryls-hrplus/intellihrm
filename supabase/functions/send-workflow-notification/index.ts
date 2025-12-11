import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  instance_id: string;
  approver_id: string;
  step_name: string;
  workflow_name: string;
  category: string;
  reference_type: string;
  reference_id: string;
  deadline_at?: string;
  escalation_hours?: number;
  initiator_name?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log("Received workflow notification request:", payload);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get approver details
    const { data: approver, error: approverError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", payload.approver_id)
      .single();

    if (approverError || !approver) {
      console.error("Failed to get approver:", approverError);
      throw new Error("Approver not found");
    }

    console.log("Sending notification to approver:", approver.email);

    // Calculate deadline display
    let deadlineText = "";
    if (payload.deadline_at) {
      const deadline = new Date(payload.deadline_at);
      deadlineText = `This request requires your action by ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}.`;
    } else if (payload.escalation_hours) {
      deadlineText = `This request will escalate if not actioned within ${payload.escalation_hours} hours.`;
    }

    // Format category for display
    const categoryLabels: Record<string, string> = {
      leave_request: "Leave Request",
      probation_confirmation: "Probation Confirmation",
      headcount_request: "Headcount Request",
      training_request: "Training Request",
      promotion: "Promotion",
      transfer: "Transfer",
      resignation: "Resignation",
      termination: "Termination",
      expense_claim: "Expense Claim",
      letter_request: "Letter Request",
      general: "General Request",
    };
    const categoryLabel = categoryLabels[payload.category] || payload.category;

    // Create in-app notification
    const notificationTitle = `Approval Required: ${categoryLabel}`;
    const notificationMessage = payload.initiator_name
      ? `${payload.initiator_name} has submitted a ${categoryLabel.toLowerCase()} that requires your approval at step "${payload.step_name}". ${deadlineText}`
      : `A ${categoryLabel.toLowerCase()} requires your approval at step "${payload.step_name}". ${deadlineText}`;

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: payload.approver_id,
      title: notificationTitle,
      message: notificationMessage,
      type: "workflow",
      link: `/workflow/approvals`,
    });

    if (notifError) {
      console.error("Failed to create in-app notification:", notifError);
    } else {
      console.log("In-app notification created successfully");
    }

    // Check user's email notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_notifications")
      .eq("user_id", payload.approver_id)
      .single();

    const emailEnabled = prefs?.email_notifications !== false;

    // Send email notification if enabled and Resend API key is configured
    if (emailEnabled && resendApiKey) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Approval Required: ${categoryLabel}</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Hello ${approver.full_name || "there"},
            </p>
            <p style="color: #4b5563; font-size: 16px;">
              ${payload.initiator_name ? `<strong>${payload.initiator_name}</strong> has submitted a` : "A"} 
              ${categoryLabel.toLowerCase()} that requires your approval.
            </p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Workflow:</strong> ${payload.workflow_name}</p>
              <p style="margin: 0 0 8px 0;"><strong>Current Step:</strong> ${payload.step_name}</p>
              <p style="margin: 0 0 8px 0;"><strong>Type:</strong> ${categoryLabel}</p>
              ${deadlineText ? `<p style="margin: 0; color: #dc2626;"><strong>⏰ ${deadlineText}</strong></p>` : ""}
            </div>
            <p style="color: #4b5563; font-size: 16px;">
              Please log in to the system to review and take action on this request.
            </p>
            <div style="margin-top: 24px;">
              <a href="${supabaseUrl.replace('.supabase.co', '')}/workflow/approvals" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: 500;">
                Review Request
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "HRIS System <noreply@resend.dev>",
            to: [approver.email],
            subject: `Action Required: ${categoryLabel} Awaiting Your Approval`,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          console.log("Email notification sent successfully");
        } else {
          const errorText = await emailResponse.text();
          console.error("Failed to send email:", errorText);
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    } else {
      console.log("Email notification skipped:", {
        emailEnabled,
        hasResendKey: !!resendApiKey,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-workflow-notification:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
