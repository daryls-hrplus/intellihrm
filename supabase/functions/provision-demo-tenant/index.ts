import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProvisionRequest {
  registrationId: string;
  taskId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { registrationId, taskId } = await req.json() as ProvisionRequest;

    console.log(`Starting provisioning for registration: ${registrationId}`);

    // Fetch the registration
    const { data: registration, error: regError } = await supabase
      .from("demo_registrations")
      .select("*")
      .eq("id", registrationId)
      .single();

    if (regError || !registration) {
      throw new Error(`Registration not found: ${regError?.message}`);
    }

    // Update task status if provided
    const updateTaskStatus = async (status: string, notes?: string) => {
      if (taskId) {
        await supabase
          .from("client_provisioning_tasks")
          .update({
            status,
            completed_at: status === "completed" ? new Date().toISOString() : null,
            notes,
          })
          .eq("id", taskId);
      }
    };

    await updateTaskStatus("in_progress", "Starting provisioning...");

    // Step 1: Create the company group
    console.log("Creating company group...");
    const { data: companyGroup, error: groupError } = await supabase
      .from("company_groups")
      .insert({
        name: registration.company_name,
        code: registration.subdomain.toUpperCase().replace(/-/g, "_"),
        is_active: true,
      })
      .select()
      .single();

    if (groupError) {
      await updateTaskStatus("failed", `Failed to create company group: ${groupError.message}`);
      throw new Error(`Failed to create company group: ${groupError.message}`);
    }

    // Step 2: Create the company
    console.log("Creating company...");
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: registration.company_name,
        code: registration.subdomain.toUpperCase().replace(/-/g, "_"),
        group_id: companyGroup.id,
        is_active: true,
        tenant_type: "demo",
      })
      .select()
      .single();

    if (companyError) {
      await updateTaskStatus("failed", `Failed to create company: ${companyError.message}`);
      throw new Error(`Failed to create company: ${companyError.message}`);
    }

    // Step 3: Create demo user in auth
    console.log("Creating demo user...");
    const demoPassword = generateSecurePassword();
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: registration.contact_email,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        full_name: registration.contact_name,
        company_id: company.id,
        is_demo_user: true,
      },
    });

    if (authError) {
      await updateTaskStatus("failed", `Failed to create user: ${authError.message}`);
      throw new Error(`Failed to create demo user: ${authError.message}`);
    }

    // Step 4: Create profile
    console.log("Creating user profile...");
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authUser.user.id,
        email: registration.contact_email,
        full_name: registration.contact_name,
        company_id: company.id,
        is_active: true,
        employment_status: "permanent",
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    // Step 5: Assign admin role
    console.log("Assigning admin role...");
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authUser.user.id,
        role: "admin",
      });

    if (roleError) {
      console.error("Role assignment error:", roleError);
    }

    // Step 6: Create sample data (departments, positions, etc.)
    console.log("Creating sample data...");
    await createSampleData(supabase, company.id);

    // Step 7: Update registration status
    console.log("Updating registration status...");
    await supabase
      .from("demo_registrations")
      .update({
        status: "provisioned",
        provisioned_company_id: company.id,
        provisioned_at: new Date().toISOString(),
      })
      .eq("id", registrationId);

    // Step 8: Send welcome email with credentials (via Resend)
    console.log("Sending welcome email...");
    await sendWelcomeEmail(registration, demoPassword);

    await updateTaskStatus("completed", "Provisioning completed successfully");

    console.log(`Provisioning completed for ${registration.company_name}`);

    return new Response(
      JSON.stringify({
        success: true,
        companyId: company.id,
        companyGroupId: companyGroup.id,
        userId: authUser.user.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Provisioning error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateSecurePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  const array = new Uint32Array(16);
  crypto.getRandomValues(array);
  for (let i = 0; i < 16; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

async function createSampleData(supabase: any, companyId: string) {
  // Create sample departments
  const departments = [
    { name: "Human Resources", code: "HR", company_id: companyId },
    { name: "Information Technology", code: "IT", company_id: companyId },
    { name: "Finance", code: "FIN", company_id: companyId },
    { name: "Operations", code: "OPS", company_id: companyId },
    { name: "Sales", code: "SALES", company_id: companyId },
  ];

  const { data: deptData } = await supabase
    .from("departments")
    .insert(departments)
    .select();

  // Create sample leave types
  const leaveTypes = [
    { name: "Annual Leave", code: "AL", company_id: companyId, is_paid: true, default_days_per_year: 15 },
    { name: "Sick Leave", code: "SL", company_id: companyId, is_paid: true, default_days_per_year: 10 },
    { name: "Personal Leave", code: "PL", company_id: companyId, is_paid: true, default_days_per_year: 3 },
    { name: "Unpaid Leave", code: "UL", company_id: companyId, is_paid: false, default_days_per_year: 0 },
  ];

  await supabase.from("leave_types").insert(leaveTypes);

  // Create sample salary grades
  const salaryGrades = [
    { code: "E1", name: "Entry Level", min_salary: 30000, max_salary: 45000, company_id: companyId },
    { code: "E2", name: "Junior", min_salary: 45000, max_salary: 65000, company_id: companyId },
    { code: "E3", name: "Mid-Level", min_salary: 65000, max_salary: 90000, company_id: companyId },
    { code: "E4", name: "Senior", min_salary: 90000, max_salary: 130000, company_id: companyId },
    { code: "M1", name: "Manager", min_salary: 100000, max_salary: 150000, company_id: companyId },
    { code: "M2", name: "Senior Manager", min_salary: 130000, max_salary: 180000, company_id: companyId },
    { code: "D1", name: "Director", min_salary: 160000, max_salary: 220000, company_id: companyId },
  ];

  await supabase.from("salary_grades").insert(salaryGrades);

  console.log("Sample data created successfully");
}

async function sendWelcomeEmail(registration: any, password: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const demoUrl = `https://${registration.subdomain}.hrplus.app/demo/login?id=${registration.id}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HRplus <noreply@hrplus.net>",
        to: [registration.contact_email],
        subject: `Your HRplus Demo is Ready - ${registration.company_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Welcome to HRplus!</h1>
            <p>Hi ${registration.contact_name},</p>
            <p>Your demo environment for <strong>${registration.company_name}</strong> is now ready!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Demo Credentials</h3>
              <p><strong>Login URL:</strong> <a href="${demoUrl}">${demoUrl}</a></p>
              <p><strong>Email:</strong> ${registration.contact_email}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            
            <p><strong>Demo expires:</strong> ${new Date(registration.demo_expires_at).toLocaleDateString()}</p>
            
            <p>We've pre-populated your demo with sample data to help you explore all features.</p>
            
            <p>Questions? Reply to this email or contact our support team.</p>
            
            <p>Best regards,<br>The HRplus Team</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send email:", errorText);
    } else {
      console.log("Welcome email sent successfully");
    }
  } catch (error) {
    console.error("Email sending error:", error);
  }
}
