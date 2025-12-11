import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  requestId: string;
  status: "approved" | "rejected" | "revoked" | "auto-approved";
  reviewNotes?: string;
  ruleName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Resend API key from system_settings
    const { data: settingData, error: settingError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .single();

    if (settingError || !settingData?.value) {
      console.log("Resend API key not configured, skipping email notification");
      return new Response(
        JSON.stringify({ success: true, message: "Email notification skipped - API key not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Dynamically import Resend
    const { Resend } = await import("https://esm.sh/resend@2.0.0");
    const resend = new Resend(settingData.value);

    const { requestId, status, reviewNotes, ruleName }: NotificationRequest = await req.json();

    // Fetch the access request details
    const { data: request, error: requestError } = await supabase
      .from("access_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      throw new Error("Access request not found");
    }

    // Get admin email for "from" address
    const { data: adminSetting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "admin_email")
      .single();

    const fromEmail = adminSetting?.value || "noreply@yourdomain.com";

    // Determine status display
    let statusText: string;
    let statusColor: string;
    let statusMessage: string;

    switch (status) {
      case "approved":
        statusText = "Approved";
        statusColor = "#22c55e";
        statusMessage = "Your access has been granted. You can now access the requested modules.";
        break;
      case "auto-approved":
        statusText = "Auto-Approved";
        statusColor = "#22c55e";
        statusMessage = `Your access has been automatically approved${ruleName ? ` based on the "${ruleName}" rule` : ""}. You can now access the requested modules.`;
        break;
      case "rejected":
        statusText = "Rejected";
        statusColor = "#ef4444";
        statusMessage = "If you have questions about this decision, please contact your administrator.";
        break;
      case "revoked":
        statusText = "Revoked";
        statusColor = "#f97316";
        statusMessage = "Your previously approved access has been revoked. Please contact your administrator if you have questions.";
        break;
      default:
        statusText = "Updated";
        statusColor = "#6b7280";
        statusMessage = "Please contact your administrator for more information.";
    }

    const modulesRequested = Array.isArray(request.requested_modules) 
      ? request.requested_modules.join(", ") 
      : String(request.requested_modules);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; background-color: ${statusColor}; }
          .detail-row { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
          .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; }
          .value { margin-top: 5px; color: #111827; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Access Request Update</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your request has been reviewed</p>
          </div>
          <div class="content">
            <div style="text-align: center; margin-bottom: 25px;">
              <span class="status-badge">${statusText}</span>
            </div>
            
            <div class="detail-row">
              <div class="label">Requested Modules</div>
              <div class="value">${modulesRequested}</div>
            </div>
            
            ${request.reason ? `
            <div class="detail-row">
              <div class="label">Your Reason</div>
              <div class="value">${request.reason}</div>
            </div>
            ` : ''}
            
            ${reviewNotes ? `
            <div class="detail-row">
              <div class="label">Reviewer Notes</div>
              <div class="value">${reviewNotes}</div>
            </div>
            ` : ''}
            
            <div class="detail-row">
              <div class="label">Reviewed On</div>
              <div class="value">${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
            
            <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
              ${statusMessage}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: `HRIS System <${fromEmail}>`,
      to: [request.user_email],
      subject: `Access Request ${statusText}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
