import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType = 
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'returned'
  | 'completed'
  | 'comment_added';

interface NotificationPayload {
  instance_id: string;
  recipient_id: string; // Can be approver or initiator depending on event
  notification_type: NotificationType;
  step_name?: string;
  workflow_name: string;
  category: string;
  reference_type: string;
  reference_id: string;
  deadline_at?: string;
  escalation_hours?: number;
  initiator_name?: string;
  actor_name?: string; // Person who took action
  comment?: string;
  rejection_reason?: string;
  return_reason?: string;
}

// Legacy payload support
interface LegacyPayload {
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
  hire: "New Hire",
  rehire: "Rehire",
  confirmation: "Confirmation",
  probation_extension: "Probation Extension",
  acting: "Acting Assignment",
  secondment: "Secondment",
  salary_change: "Salary Change",
  rate_change: "Rate Change",
  qualification: "Qualification",
};

const notificationTypeLabels: Record<NotificationType, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  escalated: "Escalated",
  returned: "Returned for Revision",
  completed: "Completed",
  comment_added: "Comment Added",
};

const getPreferenceColumn = (notificationType: NotificationType): string => {
  const mapping: Record<NotificationType, string> = {
    pending_approval: "workflow_pending_approval",
    approved: "workflow_approved",
    rejected: "workflow_rejected",
    escalated: "workflow_escalated",
    returned: "workflow_returned",
    completed: "workflow_completed",
    comment_added: "workflow_pending_approval", // Use same as pending for comments
  };
  return mapping[notificationType] || "workflow_pending_approval";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawPayload = await req.json();
    
    // Support legacy payload format
    let payload: NotificationPayload;
    if ('approver_id' in rawPayload && !('notification_type' in rawPayload)) {
      const legacy = rawPayload as LegacyPayload;
      payload = {
        instance_id: legacy.instance_id,
        recipient_id: legacy.approver_id,
        notification_type: 'pending_approval',
        step_name: legacy.step_name,
        workflow_name: legacy.workflow_name,
        category: legacy.category,
        reference_type: legacy.reference_type,
        reference_id: legacy.reference_id,
        deadline_at: legacy.deadline_at,
        escalation_hours: legacy.escalation_hours,
        initiator_name: legacy.initiator_name,
      };
    } else {
      payload = rawPayload as NotificationPayload;
    }

    console.log("Received workflow notification request:", payload);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get recipient details
    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", payload.recipient_id)
      .single();

    if (recipientError || !recipient) {
      console.error("Failed to get recipient:", recipientError);
      throw new Error("Recipient not found");
    }

    console.log("Sending notification to:", recipient.email, "Type:", payload.notification_type);

    const categoryLabel = categoryLabels[payload.category] || payload.category;
    const typeLabel = notificationTypeLabels[payload.notification_type];

    // Build notification content based on type
    let notificationTitle = "";
    let notificationMessage = "";
    let emailSubject = "";
    let deadlineText = "";

    if (payload.deadline_at) {
      const deadline = new Date(payload.deadline_at);
      deadlineText = `Action required by ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}.`;
    } else if (payload.escalation_hours && payload.notification_type === 'pending_approval') {
      deadlineText = `This request will escalate if not actioned within ${payload.escalation_hours} hours.`;
    }

    switch (payload.notification_type) {
      case 'pending_approval':
        notificationTitle = `Approval Required: ${categoryLabel}`;
        notificationMessage = payload.initiator_name
          ? `${payload.initiator_name} has submitted a ${categoryLabel.toLowerCase()} that requires your approval${payload.step_name ? ` at step "${payload.step_name}"` : ""}. ${deadlineText}`
          : `A ${categoryLabel.toLowerCase()} requires your approval${payload.step_name ? ` at step "${payload.step_name}"` : ""}. ${deadlineText}`;
        emailSubject = `Action Required: ${categoryLabel} Awaiting Your Approval`;
        break;

      case 'approved':
        notificationTitle = `Request Approved: ${categoryLabel}`;
        notificationMessage = payload.actor_name
          ? `Your ${categoryLabel.toLowerCase()} has been approved by ${payload.actor_name}${payload.step_name ? ` at step "${payload.step_name}"` : ""}.`
          : `Your ${categoryLabel.toLowerCase()} has been approved${payload.step_name ? ` at step "${payload.step_name}"` : ""}.`;
        emailSubject = `Good News: Your ${categoryLabel} Has Been Approved`;
        break;

      case 'rejected':
        notificationTitle = `Request Rejected: ${categoryLabel}`;
        notificationMessage = payload.actor_name
          ? `Your ${categoryLabel.toLowerCase()} has been rejected by ${payload.actor_name}${payload.rejection_reason ? `. Reason: ${payload.rejection_reason}` : ""}.`
          : `Your ${categoryLabel.toLowerCase()} has been rejected${payload.rejection_reason ? `. Reason: ${payload.rejection_reason}` : ""}.`;
        emailSubject = `Update: Your ${categoryLabel} Has Been Rejected`;
        break;

      case 'escalated':
        notificationTitle = `Workflow Escalated: ${categoryLabel}`;
        notificationMessage = `A ${categoryLabel.toLowerCase()} has been escalated to you for review${payload.step_name ? ` at step "${payload.step_name}"` : ""}. Previous approver did not respond in time.`;
        emailSubject = `Escalation: ${categoryLabel} Requires Your Immediate Attention`;
        break;

      case 'returned':
        notificationTitle = `Request Returned: ${categoryLabel}`;
        notificationMessage = payload.actor_name
          ? `Your ${categoryLabel.toLowerCase()} has been returned for revision by ${payload.actor_name}${payload.return_reason ? `. Reason: ${payload.return_reason}` : ""}.`
          : `Your ${categoryLabel.toLowerCase()} has been returned for revision${payload.return_reason ? `. Reason: ${payload.return_reason}` : ""}.`;
        emailSubject = `Action Needed: Your ${categoryLabel} Has Been Returned`;
        break;

      case 'completed':
        notificationTitle = `Workflow Completed: ${categoryLabel}`;
        notificationMessage = `Your ${categoryLabel.toLowerCase()} workflow has been fully completed and all approvals have been obtained.`;
        emailSubject = `Completed: Your ${categoryLabel} Is Now Finalized`;
        break;

      case 'comment_added':
        notificationTitle = `New Comment: ${categoryLabel}`;
        notificationMessage = payload.actor_name
          ? `${payload.actor_name} added a comment on a ${categoryLabel.toLowerCase()} workflow${payload.comment ? `: "${payload.comment.substring(0, 100)}${payload.comment.length > 100 ? '...' : ''}"` : ""}.`
          : `A new comment was added to a ${categoryLabel.toLowerCase()} workflow.`;
        emailSubject = `New Comment on ${categoryLabel} Workflow`;
        break;
    }

    // Check user's notification preferences
    const preferenceColumn = getPreferenceColumn(payload.notification_type);
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", payload.recipient_id)
      .single();

    // Type-safe access to preferences
    const prefsRecord = prefs as Record<string, unknown> | null;
    const inAppEnabled = prefsRecord?.[preferenceColumn] !== false;
    const emailEnabled = prefsRecord?.email_notifications !== false && prefsRecord?.[preferenceColumn] !== false;

    // Create in-app notification if enabled
    if (inAppEnabled) {
      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: payload.recipient_id,
        title: notificationTitle,
        message: notificationMessage,
        type: "workflow",
        link: payload.notification_type === 'pending_approval' || payload.notification_type === 'escalated'
          ? `/workflow/approvals`
          : `/workflow/my-requests`,
      });

      if (notifError) {
        console.error("Failed to create in-app notification:", notifError);
      } else {
        console.log("In-app notification created successfully");
      }
    } else {
      console.log("In-app notification skipped - user preference disabled");
    }

    // Send email notification if enabled
    if (emailEnabled && resendApiKey) {
      try {
        const statusColor = {
          pending_approval: "#f59e0b",
          approved: "#10b981",
          rejected: "#ef4444",
          escalated: "#dc2626",
          returned: "#f97316",
          completed: "#10b981",
          comment_added: "#3b82f6",
        }[payload.notification_type];

        const statusIcon = {
          pending_approval: "⏳",
          approved: "✅",
          rejected: "❌",
          escalated: "🚨",
          returned: "↩️",
          completed: "🎉",
          comment_added: "💬",
        }[payload.notification_type];

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: ${statusColor}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0; font-size: 20px;">${statusIcon} ${notificationTitle}</h2>
            </div>
            <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #4b5563; font-size: 16px; margin-top: 0;">
                Hello ${recipient.full_name || "there"},
              </p>
              <p style="color: #4b5563; font-size: 16px;">
                ${notificationMessage}
              </p>
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Workflow:</strong> ${payload.workflow_name}</p>
                <p style="margin: 0 0 8px 0;"><strong>Type:</strong> ${categoryLabel}</p>
                <p style="margin: 0 0 8px 0;"><strong>Status:</strong> ${typeLabel}</p>
                ${payload.step_name ? `<p style="margin: 0 0 8px 0;"><strong>Step:</strong> ${payload.step_name}</p>` : ""}
                ${deadlineText ? `<p style="margin: 0; color: #dc2626;"><strong>⏰ ${deadlineText}</strong></p>` : ""}
              </div>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${supabaseUrl.replace('.supabase.co', '')}${payload.notification_type === 'pending_approval' || payload.notification_type === 'escalated' ? '/workflow/approvals' : '/workflow/my-requests'}" 
                   style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; font-weight: 500;">
                  View Details
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 14px; margin-top: 32px; text-align: center;">
                This is an automated notification. You can manage your notification preferences in your account settings.
              </p>
            </div>
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
            to: [recipient.email],
            subject: emailSubject,
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
