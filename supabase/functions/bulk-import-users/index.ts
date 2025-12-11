import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserImportRow {
  email: string;
  full_name?: string;
  role?: string;
  company_id?: string;
}

interface ImportResult {
  email: string;
  success: boolean;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !requestingUser) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .single();

    if (!userRole) {
      throw new Error("Only admins can import users");
    }

    const { users, defaultPassword }: { users: UserImportRow[]; defaultPassword: string } = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      throw new Error("No users provided for import");
    }

    if (!defaultPassword || defaultPassword.length < 6) {
      throw new Error("Default password must be at least 6 characters");
    }

    console.log(`Starting bulk import of ${users.length} users`);

    const results: ImportResult[] = [];

    // Get default employee role ID
    const { data: employeeRole } = await supabase
      .from("roles")
      .select("id")
      .eq("code", "employee")
      .single();

    const defaultRoleId = employeeRole?.id;

    for (const userData of users) {
      try {
        // Validate email
        if (!userData.email || !userData.email.includes("@")) {
          results.push({ email: userData.email || "unknown", success: false, error: "Invalid email" });
          continue;
        }

        const email = userData.email.trim().toLowerCase();

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingUser) {
          results.push({ email, success: false, error: "User already exists" });
          continue;
        }

        // Create auth user
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
          email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name || email.split("@")[0],
          },
        });

        if (createError) {
          console.error(`Error creating user ${email}:`, createError);
          results.push({ email, success: false, error: createError.message });
          continue;
        }

        const userId = authData.user.id;

        // Update profile with company_id if provided
        if (userData.company_id) {
          await supabase
            .from("profiles")
            .update({ company_id: userData.company_id })
            .eq("id", userId);
        }

        // Assign role if specified and different from default
        if (userData.role && userData.role !== "employee") {
          const { data: roleData } = await supabase
            .from("roles")
            .select("id")
            .eq("code", userData.role)
            .single();

          if (roleData) {
            // Update the user_roles entry
            await supabase
              .from("user_roles")
              .update({ role_id: roleData.id, role: userData.role as "admin" | "hr_manager" | "employee" })
              .eq("user_id", userId);
          }
        }

        console.log(`Successfully created user: ${email}`);
        results.push({ email, success: true });

      } catch (userError: any) {
        console.error(`Error processing user ${userData.email}:`, userError);
        results.push({ 
          email: userData.email || "unknown", 
          success: false, 
          error: userError.message || "Unknown error" 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Import complete: ${successCount} successful, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary: {
          total: users.length,
          successful: successCount,
          failed: failCount
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Bulk import error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
