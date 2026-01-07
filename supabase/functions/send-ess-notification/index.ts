import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType = 'approved' | 'rejected' | 'info_required';

interface NotificationPayload {
  notification_type: NotificationType;
  employee_id: string;
  request_id: string;
  request_type: string;
  change_action: string;
  reviewer_notes?: string;
  reviewer_name?: string;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  personal_contact: "Personal Contact",
  emergency_contact: "Emergency Contact",
  address: "Address",
  name_change: "Name Change",
  banking: "Banking Details",
  qualification: "Qualification",
  dependent: "Dependent",
  government_id: "Government ID",
  medical_info: "Medical Information",
  marital_status: "Marital Status",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Add",
  update: "Update",
  delete: "Remove",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log("Received ESS notification request:", payload);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from("profiles")
      .select("id, email, full_name, first_name, first_last_name")
      .eq("id", payload.employee_id)
      .single();

    if (employeeError || !employee) {
      console.error("Failed to get employee:", employeeError);
      throw new Error("Employee not found");
    }

    const employeeName = employee.full_name || 
      `${employee.first_name || ''} ${employee.first_last_name || ''}`.trim() || 
      'Employee';

    console.log("Sending notification to:", employee.email, "Type:", payload.notification_type);

    const requestTypeLabel = REQUEST_TYPE_LABELS[payload.request_type] || payload.request_type;
    const actionLabel = ACTION_LABELS[payload.change_action] || payload.change_action;

    // Build notification content based on type
    let notificationTitle = "";
    let notificationMessage = "";
    let emailSubject = "";
    let notificationType = "";

    switch (payload.notification_type) {
      case 'approved':
        notificationTitle = `Change Request Approved`;
        notificationMessage = `Your ${requestTypeLabel.toLowerCase()} ${actionLabel.toLowerCase()} request has been approved and the changes have been applied to your record.${payload.reviewer_notes ? ` Note: ${payload.reviewer_notes}` : ''}`;
        emailSubject = `✅ Your ${requestTypeLabel} Request Has Been Approved`;
        notificationType = "ess_request_approved";
        break;

      case 'rejected':
        notificationTitle = `Change Request Rejected`;
        notificationMessage = `Your ${requestTypeLabel.toLowerCase()} ${actionLabel.toLowerCase()} request has been rejected.${payload.reviewer_notes ? ` Reason: ${payload.reviewer_notes}` : ' Please contact HR for more information.'}`;
        emailSubject = `⚠️ Your ${requestTypeLabel} Request Was Not Approved`;
        notificationType = "ess_request_rejected";
        break;

      case 'info_required':
        notificationTitle = `Additional Information Needed`;
        notificationMessage = `Your ${requestTypeLabel.toLowerCase()} ${actionLabel.toLowerCase()} request requires additional information before it can be processed.${payload.reviewer_notes ? ` Details: ${payload.reviewer_notes}` : ' Please check your request and provide the required information.'}`;
        emailSubject = `📋 Additional Information Needed for Your ${requestTypeLabel} Request`;
        notificationType = "ess_request_info_required";
        break;
    }

    // Check user's notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", payload.employee_id)
      .single();

    const prefsRecord = prefs as Record<string, unknown> | null;
    const inAppEnabled = prefsRecord?.workflow_approved !== false;
    const emailEnabled = prefsRecord?.email_notifications !== false;

    // Create in-app notification if enabled
    if (inAppEnabled) {
      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: payload.employee_id,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        link: `/ess/my-change-requests`,
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
    if (emailEnabled && resendApiKey && employee.email) {
      try {
        const statusColor = {
          approved: "#10b981",
          rejected: "#ef4444",
          info_required: "#f59e0b",
        }[payload.notification_type];

        const statusIcon = {
          approved: "✅",
          rejected: "⚠️",
          info_required: "📋",
        }[payload.notification_type];

        const actionText = {
          approved: "Your request has been approved and the changes are now reflected in your employee record.",
          rejected: "Unfortunately, your request could not be approved at this time.",
          info_required: "Your request is on hold pending additional information from you.",
        }[payload.notification_type];

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: ${statusColor}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0; font-size: 20px;">${statusIcon} ${notificationTitle}</h2>
            </div>
            <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #4b5563; font-size: 16px; margin-top: 0;">
                Hello ${employeeName},
              </p>
              <p style="color: #4b5563; font-size: 16px;">
                ${actionText}
              </p>
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Request Type:</strong> ${requestTypeLabel}</p>
                <p style="margin: 0 0 8px 0;"><strong>Action:</strong> ${actionLabel}</p>
                <p style="margin: 0;"><strong>Status:</strong> ${payload.notification_type === 'approved' ? 'Approved & Applied' : payload.notification_type === 'rejected' ? 'Rejected' : 'Information Required'}</p>
              </div>
              ${payload.reviewer_notes ? `
              <div style="background-color: ${payload.notification_type === 'rejected' ? '#fef2f2' : '#fffbeb'}; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                <p style="margin: 0; font-weight: bold; color: #374151;">${payload.notification_type === 'rejected' ? 'Reason:' : payload.notification_type === 'info_required' ? 'What\'s Needed:' : 'Note from HR:'}</p>
                <p style="margin: 8px 0 0 0; color: #4b5563;">${payload.reviewer_notes}</p>
              </div>
              ` : ''}
              <div style="margin-top: 24px; text-align: center;">
                <a href="${supabaseUrl.replace('.supabase.co', '')}/ess/my-change-requests" 
                   style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; font-weight: 500;">
                  View My Requests
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
            to: [employee.email],
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
        hasEmail: !!employee.email,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-ess-notification:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});