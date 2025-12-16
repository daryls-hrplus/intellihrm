import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManageUserRequest {
  action: "invite" | "resend_invite" | "enable" | "disable" | "generate_temp_password";
  email?: string;
  full_name?: string;
  company_id?: string;
  user_id?: string;
}

const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const sendEmail = async (resendApiKey: string, to: string, subject: string, html: string) => {
  const resend = new Resend(resendApiKey);
  return await resend.emails.send({
    from: "HRplus Cerebra <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
  });
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !requestingUser) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id);

    if (rolesError) {
      console.error("Roles fetch error:", rolesError);
      return new Response(
        JSON.stringify({ error: "Failed to verify permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isAdmin = roles?.some(r => r.role === "admin" || r.role === "hr_manager");
    if (!isAdmin) {
      console.error("User is not admin or HR manager");
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, email, full_name, company_id, user_id }: ManageUserRequest = await req.json();
    console.log(`Processing action: ${action}`, { email, full_name, company_id, user_id });

    switch (action) {
      case "invite": {
        if (!email) {
          return new Response(
            JSON.stringify({ error: "Email is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if user already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (existingProfile) {
          return new Response(
            JSON.stringify({ error: "User with this email already exists" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tempPassword = generatePassword();
        
        // Create auth user
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: full_name || email.split("@")[0] }
        });

        if (createError) {
          console.error("Create user error:", createError);
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update profile with additional info
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: full_name || email.split("@")[0],
            company_id: company_id || null,
            invited_at: new Date().toISOString(),
            invitation_status: "pending",
            is_active: true
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
        }

        // Assign employee role by default
        const { data: employeeRole } = await supabase
          .from("roles")
          .select("id")
          .eq("code", "employee")
          .single();

        if (employeeRole) {
          await supabase
            .from("user_roles")
            .insert({ user_id: authData.user.id, role: "employee", role_id: employeeRole.id });
        }

        // Send invitation email if Resend is configured
        if (resendApiKey) {
          try {
            await sendEmail(
              resendApiKey,
              email,
              "Welcome to HRplus Cerebra - Your Account is Ready",
              `
                <h1>Welcome to HRplus Cerebra!</h1>
                <p>Hi ${full_name || "there"},</p>
                <p>Your account has been created. Here are your login credentials:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                <p>Please log in and change your password immediately.</p>
                <p>Best regards,<br>The HRplus Cerebra Team</p>
              `
            );
            console.log("Invitation email sent successfully");
          } catch (emailError) {
            console.error("Failed to send invitation email:", emailError);
          }
        } else {
          console.log("RESEND_API_KEY not configured, skipping email");
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user_id: authData.user.id, 
            temp_password: tempPassword,
            email_sent: !!resendApiKey
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resend_invite": {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "User ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", user_id)
          .single();

        if (profileError || !profile) {
          return new Response(
            JSON.stringify({ error: "User not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tempPassword = generatePassword();

        // Update user password
        const { error: updateError } = await supabase.auth.admin.updateUserById(user_id, {
          password: tempPassword
        });

        if (updateError) {
          console.error("Update password error:", updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update invitation timestamp
        await supabase
          .from("profiles")
          .update({
            invited_at: new Date().toISOString(),
            invitation_status: "pending"
          })
          .eq("id", user_id);

        // Send invitation email if Resend is configured
        if (resendApiKey) {
          try {
            await sendEmail(
              resendApiKey,
              profile.email,
              "HRplus Cerebra - New Login Credentials",
              `
                <h1>New Login Credentials</h1>
                <p>Hi ${profile.full_name || "there"},</p>
                <p>Your login credentials have been reset. Here are your new credentials:</p>
                <p><strong>Email:</strong> ${profile.email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                <p>Please log in and change your password immediately.</p>
                <p>Best regards,<br>The HRplus Cerebra Team</p>
              `
            );
            console.log("Re-invite email sent successfully");
          } catch (emailError) {
            console.error("Failed to send re-invite email:", emailError);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            temp_password: tempPassword,
            email_sent: !!resendApiKey
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "enable":
      case "disable": {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "User ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Prevent disabling yourself
        if (action === "disable" && user_id === requestingUser.id) {
          return new Response(
            JSON.stringify({ error: "Cannot disable your own account" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const isActive = action === "enable";

        // Update profile is_active
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ is_active: isActive })
          .eq("id", user_id);

        if (profileError) {
          console.error("Profile update error:", profileError);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Ban/unban auth user
        const { error: authError } = await supabase.auth.admin.updateUserById(user_id, {
          ban_duration: isActive ? "none" : "876600h" // ~100 years if disabled
        });

        if (authError) {
          console.error("Auth update error:", authError);
          // Revert profile change
          await supabase
            .from("profiles")
            .update({ is_active: !isActive })
            .eq("id", user_id);
          return new Response(
            JSON.stringify({ error: authError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`User ${user_id} has been ${action}d`);

        return new Response(
          JSON.stringify({ success: true, is_active: isActive }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "generate_temp_password": {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "User ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tempPassword = generatePassword();

        // Update user password
        const { error: updateError } = await supabase.auth.admin.updateUserById(user_id, {
          password: tempPassword
        });

        if (updateError) {
          console.error("Update password error:", updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user email for notification
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", user_id)
          .single();

        // Send email if Resend is configured
        if (resendApiKey && profile) {
          try {
            await sendEmail(
              resendApiKey,
              profile.email,
              "HRplus Cerebra - Password Reset",
              `
                <h1>Password Reset</h1>
                <p>Hi ${profile.full_name || "there"},</p>
                <p>Your password has been reset by an administrator. Here are your new credentials:</p>
                <p><strong>Email:</strong> ${profile.email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                <p>Please log in and change your password immediately.</p>
                <p>Best regards,<br>The HRplus Cerebra Team</p>
              `
            );
            console.log("Password reset email sent successfully");
          } catch (emailError) {
            console.error("Failed to send password reset email:", emailError);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            temp_password: tempPassword,
            email_sent: !!resendApiKey
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("Error in manage-user function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
