import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPANY_ID = "4b7cab47-f59b-4f0b-ae80-94aab4b0c29e";

const demoEmployees = [
  { full_name: "Marcus Anthony Williams", email: "marcus.williams@cmg.com", position: "Chief Executive Officer" },
  { full_name: "Keisha Marie Thompson", email: "keisha.thompson@cmg.com", position: "Chief Operations Officer" },
  { full_name: "Devon Andre Campbell", email: "devon.campbell@cmg.com", position: "Chief Financial Officer" },
  { full_name: "Natasha Simone Brown", email: "natasha.brown@cmg.com", position: "Chief Human Resources Officer" },
  { full_name: "Ricardo James Martinez", email: "ricardo.martinez@cmg.com", position: "Chief Technology Officer" },
  { full_name: "Camille Elizabeth Johnson", email: "camille.johnson@cmg.com", position: "VP of Sales" },
  { full_name: "Tyrone Michael Davis", email: "tyrone.davis@cmg.com", position: "VP of Marketing" },
  { full_name: "Shanique Ann Roberts", email: "shanique.roberts@cmg.com", position: "VP of Customer Success" },
  { full_name: "Andre Christopher Lewis", email: "andre.lewis@cmg.com", position: "Finance Manager" },
  { full_name: "Monique Patricia Clarke", email: "monique.clarke@cmg.com", position: "HR Manager" },
  { full_name: "Jason Paul Mitchell", email: "jason.mitchell@cmg.com", position: "IT Manager" },
  { full_name: "Aaliyah Rose Taylor", email: "aaliyah.taylor@cmg.com", position: "Sales Manager" },
  { full_name: "Brandon Keith Harris", email: "brandon.harris@cmg.com", position: "Marketing Manager" },
  { full_name: "Tiffany Nicole Green", email: "tiffany.green@cmg.com", position: "Senior Accountant" },
  { full_name: "Dwayne Omar Phillips", email: "dwayne.phillips@cmg.com", position: "HR Specialist" },
  { full_name: "Crystal Joy Anderson", email: "crystal.anderson@cmg.com", position: "Senior Software Engineer" },
  { full_name: "Kareem Rashid Thomas", email: "kareem.thomas@cmg.com", position: "Sales Representative" },
  { full_name: "Simone Gabrielle White", email: "simone.white@cmg.com", position: "Sales Representative" },
  { full_name: "Damian Troy Jackson", email: "damian.jackson@cmg.com", position: "Marketing Specialist" },
  { full_name: "Alicia Danielle Scott", email: "alicia.scott@cmg.com", position: "Accountant" },
  { full_name: "Terrence Wayne King", email: "terrence.king@cmg.com", position: "Software Engineer" },
  { full_name: "Jasmine Elise Moore", email: "jasmine.moore@cmg.com", position: "Software Engineer" },
  { full_name: "Marlon Cedric Young", email: "marlon.young@cmg.com", position: "Customer Success Specialist" },
  { full_name: "Brianna Faith Edwards", email: "brianna.edwards@cmg.com", position: "Customer Success Specialist" },
];

function randomPassword() {
  const base = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  return `Demo${base}A1!`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify requesting user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRow } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .in("role", ["admin", "hr_manager"])
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden - requires admin or hr_manager role" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all positions for this company
    const { data: positions, error: posError } = await adminClient
      .from("positions")
      .select("id, title")
      .eq("company_id", COMPANY_ID);

    if (posError) {
      console.error("Error fetching positions:", posError);
      return new Response(JSON.stringify({ error: "Failed to fetch positions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const positionMap = new Map(positions?.map(p => [p.title, p.id]) || []);
    const results: { email: string; success: boolean; error?: string; user_id?: string }[] = [];

    for (const emp of demoEmployees) {
      try {
        // Check if profile already exists
        const { data: existingProfile } = await adminClient
          .from("profiles")
          .select("id")
          .eq("email", emp.email.toLowerCase())
          .maybeSingle();

        if (existingProfile) {
          results.push({ email: emp.email, success: false, error: "Already exists" });
          continue;
        }

        const temporaryPassword = randomPassword();

        // Create auth user
        const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
          email: emp.email.toLowerCase(),
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: { full_name: emp.full_name },
        });

        if (createError || !authData?.user) {
          console.error(`Failed to create user ${emp.email}:`, createError);
          results.push({ email: emp.email, success: false, error: createError?.message || "Failed to create user" });
          continue;
        }

        const userId = authData.user.id;

        // Update profile
        await adminClient
          .from("profiles")
          .update({
            full_name: emp.full_name,
            company_id: COMPANY_ID,
            is_active: true,
            start_date: new Date().toISOString().split("T")[0],
          })
          .eq("id", userId);

        // Assign to position if found
        const positionId = positionMap.get(emp.position);
        if (positionId) {
          await adminClient
            .from("employee_positions")
            .insert({
              employee_id: userId,
              position_id: positionId,
              is_primary: true,
              start_date: new Date().toISOString().split("T")[0],
            });
        }

        results.push({ email: emp.email, success: true, user_id: userId });
        console.log(`Created employee: ${emp.full_name} (${emp.email})`);

      } catch (err) {
        console.error(`Error creating ${emp.email}:`, err);
        results.push({ email: emp.email, success: false, error: String(err) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Created ${successCount} employees, ${failCount} failed/skipped`,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("seed-demo-employees error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
