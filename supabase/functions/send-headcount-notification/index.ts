import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HeadcountNotificationRequest {
  requestId: string;
  action: "submitted" | "approved" | "rejected";
  positionTitle: string;
  currentHeadcount: number;
  requestedHeadcount: number;
  reason: string;
  reviewNotes?: string;
  requesterEmail: string;
  requesterName: string;
  reviewerName?: string;
  governanceBodyName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-headcount-notification function invoked");

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
      console.error("Resend API key not configured:", settingError);
      return new Response(
        JSON.stringify({ error: "Email service not configured. Please set the Resend API key in Admin Settings." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resendApiKey = settingData.value;

    const {
      requestId,
      action,
      positionTitle,
      currentHeadcount,
      requestedHeadcount,
      reason,
      reviewNotes,
      requesterEmail,
      requesterName,
      reviewerName,
      governanceBodyName,
    }: HeadcountNotificationRequest = await req.json();

    console.log(`Processing ${action} notification for request ${requestId}`);

    let subject: string;
    let htmlContent: string;
    const headcountChange = requestedHeadcount - currentHeadcount;
    const changeText = headcountChange > 0 ? `increase by ${headcountChange}` : `decrease by ${Math.abs(headcountChange)}`;

    switch (action) {
      case "submitted":
        subject = `Headcount Request Submitted: ${positionTitle}`;
        htmlContent = `
          <h2>New Headcount Request Submitted</h2>
          <p>A new headcount change request has been submitted and requires review.</p>
          
          <h3>Request Details</h3>
          <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Position</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${positionTitle}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Requested By</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${requesterName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Current Headcount</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${currentHeadcount}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Requested Headcount</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${requestedHeadcount}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Change</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${changeText}</td></tr>
            ${governanceBodyName ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Assigned To</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${governanceBodyName}</td></tr>` : ""}
          </table>
          
          <h3>Business Justification</h3>
          <p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${reason}</p>
          
          <p>Please log in to review and process this request.</p>
        `;
        break;

      case "approved":
        subject = `Headcount Request Approved: ${positionTitle}`;
        htmlContent = `
          <h2>Headcount Request Approved</h2>
          <p>Your headcount change request has been <span style="color: #22c55e; font-weight: bold;">approved</span>.</p>
          
          <h3>Request Details</h3>
          <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Position</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${positionTitle}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>New Headcount</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${requestedHeadcount}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Approved By</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${reviewerName || "Governance Body"}</td></tr>
            ${governanceBodyName ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Governance Body</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${governanceBodyName}</td></tr>` : ""}
          </table>
          
          ${reviewNotes ? `<h3>Review Notes</h3><p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${reviewNotes}</p>` : ""}
          
          <p>The position's authorized headcount has been updated accordingly.</p>
        `;
        break;

      case "rejected":
        subject = `Headcount Request Rejected: ${positionTitle}`;
        htmlContent = `
          <h2>Headcount Request Rejected</h2>
          <p>Your headcount change request has been <span style="color: #ef4444; font-weight: bold;">rejected</span>.</p>
          
          <h3>Request Details</h3>
          <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Position</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${positionTitle}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Requested Headcount</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${requestedHeadcount}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Rejected By</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${reviewerName || "Governance Body"}</td></tr>
            ${governanceBodyName ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Governance Body</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${governanceBodyName}</td></tr>` : ""}
          </table>
          
          ${reviewNotes ? `<h3>Rejection Reason</h3><p style="background: #fff5f5; padding: 12px; border-radius: 4px; border-left: 4px solid #ef4444;">${reviewNotes}</p>` : ""}
          
          <p>Please contact the reviewer if you have questions or would like to submit a revised request.</p>
        `;
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    // For submitted requests, also notify admins
    let recipients = [requesterEmail];
    
    if (action === "submitted") {
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (adminRoles && adminRoles.length > 0) {
        const { data: adminProfiles } = await supabase
          .from("profiles")
          .select("email")
          .in("id", adminRoles.map(r => r.user_id));
        
        if (adminProfiles) {
          const adminEmails = adminProfiles.map(p => p.email).filter(e => e !== requesterEmail);
          recipients = [...recipients, ...adminEmails];
        }
      }
    }

    console.log(`Sending email to: ${recipients.join(", ")}`);

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HRIS <onboarding@resend.dev>",
        to: recipients,
        subject,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-headcount-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
