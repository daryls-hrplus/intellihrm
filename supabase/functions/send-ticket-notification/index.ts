import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketNotificationRequest {
  ticketId: string;
  notificationType: "assigned" | "reply" | "status_change";
  recipientEmail: string;
  recipientName?: string;
  ticketNumber: string;
  ticketSubject: string;
  message?: string;
  assigneeName?: string;
  newStatus?: string;
  replyContent?: string;
  replyAuthor?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-ticket-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      ticketId,
      notificationType,
      recipientEmail,
      recipientName,
      ticketNumber,
      ticketSubject,
      message,
      assigneeName,
      newStatus,
      replyContent,
      replyAuthor,
    }: TicketNotificationRequest = await req.json();

    console.log(`Processing ${notificationType} notification for ticket ${ticketNumber}`);

    // Get Resend API key from system_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .single();

    if (settingsError || !settingsData?.value) {
      console.log("Resend API key not configured, skipping email notification");
      return new Response(
        JSON.stringify({ success: false, message: "Resend API key not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(settingsData.value);

    let subject = "";
    let htmlContent = "";

    const ticketLink = `Ticket #${ticketNumber}`;

    switch (notificationType) {
      case "assigned":
        subject = `[${ticketNumber}] Ticket Assigned to You: ${ticketSubject}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e;">Ticket Assigned to You</h2>
            <p>Hello ${recipientName || "there"},</p>
            <p>A helpdesk ticket has been assigned to you:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Ticket:</strong> ${ticketLink}</p>
              <p><strong>Subject:</strong> ${ticketSubject}</p>
              ${message ? `<p><strong>Description:</strong> ${message}</p>` : ""}
            </div>
            <p>Please review and respond to this ticket at your earliest convenience.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated message from the HRIS Helpdesk System.
            </p>
          </div>
        `;
        break;

      case "reply":
        subject = `[${ticketNumber}] New Reply: ${ticketSubject}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e;">New Reply on Your Ticket</h2>
            <p>Hello ${recipientName || "there"},</p>
            <p>There's a new reply on your helpdesk ticket:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Ticket:</strong> ${ticketLink}</p>
              <p><strong>Subject:</strong> ${ticketSubject}</p>
              <p><strong>Reply from:</strong> ${replyAuthor || "Support Team"}</p>
              <div style="background-color: #fff; padding: 10px; border-left: 3px solid #007bff; margin-top: 10px;">
                ${replyContent || ""}
              </div>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated message from the HRIS Helpdesk System.
            </p>
          </div>
        `;
        break;

      case "status_change":
        subject = `[${ticketNumber}] Status Updated: ${ticketSubject}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e;">Ticket Status Updated</h2>
            <p>Hello ${recipientName || "there"},</p>
            <p>The status of your helpdesk ticket has been updated:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Ticket:</strong> ${ticketLink}</p>
              <p><strong>Subject:</strong> ${ticketSubject}</p>
              <p><strong>New Status:</strong> <span style="color: #28a745; font-weight: bold;">${newStatus || "Updated"}</span></p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated message from the HRIS Helpdesk System.
            </p>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${notificationType}`);
    }

    console.log(`Sending ${notificationType} email to ${recipientEmail}`);

    const emailResponse = await resend.emails.send({
      from: "HRIS Helpdesk <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-ticket-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
