import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PiiAlertRequest {
  userId: string;
  userEmail: string;
  accessCount: number;
  alertType: string;
  alertReason: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, userEmail, accessCount, alertType, alertReason }: PiiAlertRequest = await req.json();

    // Get Resend API key from system settings
    const { data: settingData, error: settingError } = await supabaseClient
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .single();

    if (settingError || !settingData?.value) {
      console.log("No Resend API key configured, logging alert without email");
      
      // Still log the alert even if we can't send email
      await supabaseClient.from("pii_access_alerts").insert({
        user_id: userId,
        user_email: userEmail,
        access_count: accessCount,
        alert_type: alertType,
        alert_reason: alertReason,
        email_sent: false,
      });

      return new Response(
        JSON.stringify({ success: true, emailSent: false, reason: "No API key configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(settingData.value);

    // Get admin emails to notify
    const { data: adminUsers } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const adminIds = adminUsers?.map((u) => u.user_id) || [];
    
    const { data: adminProfiles } = await supabaseClient
      .from("profiles")
      .select("email")
      .in("id", adminIds);

    const adminEmails = adminProfiles?.map((p) => p.email).filter(Boolean) || [];

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ success: false, reason: "No admin emails found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send alert email
    const emailResponse = await resend.emails.send({
      from: "HRIS Security <onboarding@resend.dev>",
      to: adminEmails,
      subject: `🚨 Suspicious PII Access Alert - ${alertType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">🚨 Suspicious PII Access Detected</h1>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h2 style="color: #991b1b; margin-top: 0;">Alert Details</h2>
            <p><strong>User Email:</strong> ${userEmail}</p>
            <p><strong>Alert Type:</strong> ${alertType}</p>
            <p><strong>Access Count:</strong> ${accessCount} attempts</p>
            <p><strong>Reason:</strong> ${alertReason}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
          <p style="color: #666;">This user has accessed PII-protected pages multiple times. Please review their access patterns in the PII Access Report.</p>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">This is an automated security alert from your HRIS system.</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the alert
    await supabaseClient.from("pii_access_alerts").insert({
      user_id: userId,
      user_email: userEmail,
      access_count: accessCount,
      alert_type: alertType,
      alert_reason: alertReason,
      email_sent: true,
    });

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-pii-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
