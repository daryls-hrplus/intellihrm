import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManageUserRequest {
  action: "invite" | "resend_invite" | "enable" | "disable" | "generate_temp_password" | 
          "force_password_change" | "unlock_account" | "revoke_sessions" | "update_profile" | "update_roles" |
          "bulk_enable" | "bulk_disable" | "bulk_update_roles";
  email?: string;
  full_name?: string;
  company_id?: string;
  department_id?: string;
  section_id?: string;
  user_id?: string;
  user_ids?: string[];
  roles?: string[];
  force_change?: boolean;
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
      console.error("Auth error:", authError?.message, authError?.status);
      const errorMessage = authError?.message?.includes("session") || authError?.message?.includes("expired") 
        ? "Session expired - please log out and log back in"
        : "Unauthorized - please log in again";
      return new Response(
        JSON.stringify({ error: errorMessage, code: "SESSION_EXPIRED" }),
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

    const body: ManageUserRequest = await req.json();
    const { action, email, full_name, company_id, department_id, section_id, user_id, user_ids, roles: newRoles, force_change } = body;
    console.log(`Processing action: ${action}`, { email, full_name, company_id, user_id, user_ids });

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
            department_id: department_id || null,
            section_id: section_id || null,
            invited_at: new Date().toISOString(),
            invitation_status: "pending",
            is_active: true,
            force_password_change: true
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
            invitation_status: "pending",
            force_password_change: true
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

        // Set force password change flag
        await supabase
          .from("profiles")
          .update({ force_password_change: true })
          .eq("id", user_id);

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

      case "force_password_change": {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "User ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ force_password_change: force_change ?? true })
          .eq("id", user_id);

        if (profileError) {
          console.error("Profile update error:", profileError);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Force password change ${force_change ?? true ? 'enabled' : 'disabled'} for user ${user_id}`);

        return new Response(
          JSON.stringify({ success: true, force_password_change: force_change ?? true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "unlock_account": {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "User ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Reset failed login attempts and unlock
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            failed_login_attempts: 0,
            locked_until: null
          })
          .eq("id", user_id);

        if (profileError) {
          console.error("Profile update error:", profileError);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Also unban in auth if needed
        await supabase.auth.admin.updateUserById(user_id, {
          ban_duration: "none"
        });

        console.log(`Account unlocked for user ${user_id}`);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "revoke_sessions": {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "User ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Sign out the user from all sessions
        const { error: signOutError } = await supabase.auth.admin.signOut(user_id, "global");

        if (signOutError) {
          console.error("Sign out error:", signOutError);
          return new Response(
            JSON.stringify({ error: signOutError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`All sessions revoked for user ${user_id}`);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_profile": {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "User ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: Record<string, unknown> = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (company_id !== undefined) updateData.company_id = company_id || null;
        if (department_id !== undefined) updateData.department_id = department_id || null;
        if (section_id !== undefined) updateData.section_id = section_id || null;

        const { error: profileError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user_id);

        if (profileError) {
          console.error("Profile update error:", profileError);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Profile updated for user ${user_id}`);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_roles": {
        if (!user_id || !newRoles || !Array.isArray(newRoles)) {
          return new Response(
            JSON.stringify({ error: "User ID and roles are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get role definitions
        const { data: roleDefs, error: roleDefsError } = await supabase
          .from("roles")
          .select("id, code")
          .eq("is_active", true);

        if (roleDefsError) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch role definitions" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Delete existing roles
        const { error: deleteError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user_id);

        if (deleteError) {
          console.error("Delete roles error:", deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Insert new roles
        const roleInserts = newRoles.map(roleCode => {
          const roleDef = roleDefs?.find(r => r.code === roleCode);
          return {
            user_id,
            role: roleCode as "admin" | "employee" | "hr_manager",
            role_id: roleDef?.id
          };
        }).filter(r => r.role_id);

        if (roleInserts.length > 0) {
          const { error: insertError } = await supabase
            .from("user_roles")
            .insert(roleInserts);

          if (insertError) {
            console.error("Insert roles error:", insertError);
            return new Response(
              JSON.stringify({ error: insertError.message }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        console.log(`Roles updated for user ${user_id}: ${newRoles.join(', ')}`);

        return new Response(
          JSON.stringify({ success: true, roles: newRoles }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "bulk_enable":
      case "bulk_disable": {
        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
          return new Response(
            JSON.stringify({ error: "User IDs are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const isActive = action === "bulk_enable";
        const results: { userId: string; success: boolean; error?: string }[] = [];

        // Filter out current user if disabling
        const targetUserIds = action === "bulk_disable" 
          ? user_ids.filter(id => id !== requestingUser.id)
          : user_ids;

        for (const userId of targetUserIds) {
          try {
            // Update profile
            await supabase
              .from("profiles")
              .update({ is_active: isActive })
              .eq("id", userId);

            // Update auth
            await supabase.auth.admin.updateUserById(userId, {
              ban_duration: isActive ? "none" : "876600h"
            });

            results.push({ userId, success: true });
          } catch (err) {
            results.push({ userId, success: false, error: String(err) });
          }
        }

        console.log(`Bulk ${action} completed for ${results.filter(r => r.success).length}/${targetUserIds.length} users`);

        return new Response(
          JSON.stringify({ success: true, results }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "bulk_update_roles": {
        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0 || !newRoles) {
          return new Response(
            JSON.stringify({ error: "User IDs and roles are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get role definitions
        const { data: roleDefs } = await supabase
          .from("roles")
          .select("id, code")
          .eq("is_active", true);

        const results: { userId: string; success: boolean; error?: string }[] = [];

        for (const userId of user_ids) {
          try {
            // Delete existing roles
            await supabase
              .from("user_roles")
              .delete()
              .eq("user_id", userId);

            // Insert new roles
            const roleInserts = newRoles.map(roleCode => {
              const roleDef = roleDefs?.find(r => r.code === roleCode);
              return {
                user_id: userId,
                role: roleCode as "admin" | "employee" | "hr_manager",
                role_id: roleDef?.id
              };
            }).filter(r => r.role_id);

            if (roleInserts.length > 0) {
              await supabase
                .from("user_roles")
                .insert(roleInserts);
            }

            results.push({ userId, success: true });
          } catch (err) {
            results.push({ userId, success: false, error: String(err) });
          }
        }

        console.log(`Bulk role update completed for ${results.filter(r => r.success).length}/${user_ids.length} users`);

        return new Response(
          JSON.stringify({ success: true, results }),
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
