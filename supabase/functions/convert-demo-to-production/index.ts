import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversionRequest {
  demoId: string;
  companyDetails: {
    companyName: string;
    legalName: string;
    billingEmail: string;
    billingAddress: string;
  };
  selectedModules: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { demoId, companyDetails, selectedModules } = await req.json() as ConversionRequest;

    console.log(`Starting conversion for demo: ${demoId}`);

    // Fetch the demo registration
    const { data: registration, error: regError } = await supabase
      .from("demo_registrations")
      .select("*, companies:provisioned_company_id(*)")
      .eq("id", demoId)
      .single();

    if (regError || !registration) {
      throw new Error(`Demo registration not found: ${regError?.message}`);
    }

    if (registration.status === "converted") {
      throw new Error("This demo has already been converted to production");
    }

    if (!registration.provisioned_company_id) {
      throw new Error("Demo has not been provisioned yet");
    }

    // Step 1: Update company details
    console.log("Updating company details...");
    const { error: companyUpdateError } = await supabase
      .from("companies")
      .update({
        name: companyDetails.companyName,
        legal_name: companyDetails.legalName,
        tenant_type: "production",
      })
      .eq("id", registration.provisioned_company_id);

    if (companyUpdateError) {
      throw new Error(`Failed to update company: ${companyUpdateError.message}`);
    }

    // Step 2: Update company group
    console.log("Updating company group...");
    const { data: company } = await supabase
      .from("companies")
      .select("group_id")
      .eq("id", registration.provisioned_company_id)
      .single();

    if (company?.group_id) {
      await supabase
        .from("company_groups")
        .update({
          name: companyDetails.companyName,
        })
        .eq("id", company.group_id);
    }

    // Step 3: Create subscription record
    console.log("Creating subscription...");
    const { data: subscription, error: subError } = await supabase
      .from("company_subscriptions")
      .upsert({
        company_id: registration.provisioned_company_id,
        status: "pending_payment",
        billing_cycle: "monthly",
        selected_modules: selectedModules,
        billing_email: companyDetails.billingEmail,
        billing_address: companyDetails.billingAddress,
      })
      .select()
      .single();

    if (subError) {
      console.error("Subscription creation error:", subError);
    }

    // Step 4: Remove demo user metadata flags
    console.log("Updating user metadata...");
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("company_id", registration.provisioned_company_id);

    if (profiles) {
      for (const profile of profiles) {
        await supabase.auth.admin.updateUserById(profile.id, {
          user_metadata: {
            is_demo_user: false,
          },
        });
      }
    }

    // Step 5: Update demo registration status
    console.log("Updating registration status...");
    const { error: statusError } = await supabase
      .from("demo_registrations")
      .update({
        status: "converted",
        converted_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (statusError) {
      throw new Error(`Failed to update registration status: ${statusError.message}`);
    }

    // Step 6: Send conversion confirmation email
    console.log("Sending confirmation email...");
    await sendConversionEmail(registration, companyDetails, selectedModules);

    // Step 7: Create audit log entry
    await supabase.from("audit_logs").insert({
      company_id: registration.provisioned_company_id,
      action: "demo_converted_to_production",
      entity_type: "company",
      entity_id: registration.provisioned_company_id,
      details: {
        demo_id: demoId,
        selected_modules: selectedModules,
        converted_at: new Date().toISOString(),
      },
    });

    console.log(`Conversion completed for ${companyDetails.companyName}`);

    return new Response(
      JSON.stringify({
        success: true,
        companyId: registration.provisioned_company_id,
        subscriptionId: subscription?.id,
        message: "Demo successfully converted to production",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Conversion error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendConversionEmail(registration: any, companyDetails: any, selectedModules: string[]) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const loginUrl = `https://${registration.subdomain}.hrplus.app/auth`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HRplus <noreply@hrplus.net>",
        to: [companyDetails.billingEmail],
        cc: [registration.contact_email],
        subject: `Welcome to HRplus Production - ${companyDetails.companyName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Welcome to HRplus Production!</h1>
            <p>Hi ${registration.contact_name},</p>
            <p>Congratulations! Your demo for <strong>${companyDetails.companyName}</strong> has been successfully converted to a production environment.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Production Environment</h3>
              <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
              <p><strong>Modules Activated:</strong> ${selectedModules.join(", ")}</p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Complete your billing setup in the admin portal</li>
              <li>Review and customize your configuration settings</li>
              <li>Import your employee data or continue with demo data</li>
              <li>Invite your team members</li>
            </ol>
            
            <p>Your dedicated implementation consultant will reach out within 24 hours to help you get started.</p>
            
            <p>Questions? Contact our support team at support@hrplus.net</p>
            
            <p>Best regards,<br>The HRplus Team</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send email:", errorText);
    } else {
      console.log("Conversion confirmation email sent successfully");
    }
  } catch (error) {
    console.error("Email sending error:", error);
  }
}
