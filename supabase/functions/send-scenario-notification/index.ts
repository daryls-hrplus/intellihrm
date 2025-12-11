import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScenarioNotificationRequest {
  recipientEmails: string[];
  scenarioName: string;
  shareUrl: string;
  senderName: string;
  senderEmail: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received scenario notification request");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { 
      recipientEmails, 
      scenarioName, 
      shareUrl, 
      senderName, 
      senderEmail,
      message 
    }: ScenarioNotificationRequest = await req.json();

    console.log(`Sending scenario notification to ${recipientEmails.length} recipients`);

    // Get Resend API key from system settings
    const { data: settingData, error: settingError } = await supabaseClient
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .single();

    if (settingError || !settingData?.value) {
      console.log("No Resend API key configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          emailSent: false, 
          reason: "Email notifications not configured. Please add Resend API key in Admin Settings." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(settingData.value);

    // Filter valid email addresses
    const validEmails = recipientEmails.filter(email => 
      email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (validEmails.length === 0) {
      console.log("No valid email addresses provided");
      return new Response(
        JSON.stringify({ success: false, reason: "No valid email addresses provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send notification email
    const emailResponse = await resend.emails.send({
      from: "HRIS Pro <onboarding@resend.dev>",
      to: validEmails,
      subject: `${senderName} shared a scenario planning analysis with you`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📊 Scenario Planning Shared</h1>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">
              <strong>${senderName}</strong> (${senderEmail}) has shared a scenario planning analysis with you.
            </p>
            
            <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #0f766e; margin: 0 0 8px 0; font-weight: 600;">Scenario: ${scenarioName}</p>
              ${message ? `<p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${shareUrl}" 
                 style="display: inline-block; background: #0f766e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                View Scenario Analysis
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              This link provides read-only access to the shared scenario planning data. You can view projections, compare scenarios, and analyze the headcount forecast.
            </p>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            This email was sent from HRIS Pro. If you didn't expect this, you can safely ignore it.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailSent: true, 
        recipientCount: validEmails.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-scenario-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
