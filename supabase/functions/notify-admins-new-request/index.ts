import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userEmail: string;
  requestedModules: string[];
  reason: string;
}

const MENU_MODULES: Record<string, string> = {
  dashboard: "Dashboard",
  workforce: "Workforce Management",
  leave: "Leave Management",
  compensation: "Compensation",
  benefits: "Benefits",
  performance: "Performance",
  training: "Training",
  succession: "Succession Planning",
  recruitment: "Recruitment",
  hse: "Health & Safety",
  employee_relations: "Employee Relations",
  property: "Company Property",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-admins-new-request function called");

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

    // Get Resend API key from system settings
    const { data: resendSetting, error: settingError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .maybeSingle();

    if (settingError) {
      console.error("Error fetching resend_api_key:", settingError);
      throw new Error("Failed to fetch email configuration");
    }

    if (!resendSetting?.value) {
      console.log("Resend API key not configured, skipping email notification");
      return new Response(
        JSON.stringify({ message: "Email not configured, notification skipped" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin email from system settings
    const { data: adminEmailSetting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "admin_notification_email")
      .maybeSingle();

    // Get all admin user emails as fallback
    const { data: adminUsers, error: adminError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminError) {
      console.error("Error fetching admin users:", adminError);
    }

    const adminEmails: string[] = [];

    // Add configured admin email if exists
    if (adminEmailSetting?.value) {
      adminEmails.push(adminEmailSetting.value);
    }

    // Get admin profile emails
    if (adminUsers && adminUsers.length > 0) {
      const adminIds = adminUsers.map((u) => u.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email")
        .in("id", adminIds);

      if (profiles) {
        profiles.forEach((p) => {
          if (p.email && !adminEmails.includes(p.email)) {
            adminEmails.push(p.email);
          }
        });
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found, skipping notification");
      return new Response(
        JSON.stringify({ message: "No admin emails configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userEmail, requestedModules, reason }: NotificationRequest = await req.json();

    console.log("Sending notification for new access request from:", userEmail);

    const moduleNames = requestedModules
      .map((code) => MENU_MODULES[code] || code)
      .join(", ");

    const resend = new Resend(resendSetting.value);

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Access Request Submitted</h2>
        <p>A new access request has been submitted and requires your review.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Requested By:</strong> ${userEmail}</p>
          <p style="margin: 0 0 10px 0;"><strong>Requested Modules:</strong> ${moduleNames}</p>
          <p style="margin: 0;"><strong>Reason:</strong></p>
          <p style="margin: 5px 0 0 0; color: #666;">${reason}</p>
        </div>
        
        <p>Please log in to the HRIS system to review and process this request.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated notification from the HRIS system.
        </p>
      </div>
    `;

    // Send to all admin emails
    for (const adminEmail of adminEmails) {
      try {
        const emailResponse = await resend.emails.send({
          from: "HRIS System <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `New Access Request from ${userEmail}`,
          html: htmlBody,
        });
        console.log(`Email sent to ${adminEmail}:`, emailResponse);
      } catch (emailErr) {
        console.error(`Failed to send email to ${adminEmail}:`, emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, notified: adminEmails.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-admins-new-request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
