import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MENU_MODULES = [
  { code: "dashboard", label: "Dashboard" },
  { code: "workforce", label: "Workforce" },
  { code: "leave", label: "Leave" },
  { code: "compensation", label: "Compensation" },
  { code: "benefits", label: "Benefits" },
  { code: "performance", label: "Performance" },
  { code: "training", label: "Training" },
  { code: "succession", label: "Succession" },
  { code: "recruitment", label: "Recruitment" },
  { code: "hse", label: "Health & Safety" },
  { code: "employee_relations", label: "Employee Relations" },
  { code: "property", label: "Property" },
  { code: "admin", label: "Admin" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("Starting weekly permissions report...");

    // Get Resend API key from system settings
    const { data: settingData, error: settingError } = await supabaseClient
      .from("system_settings")
      .select("value")
      .eq("key", "resend_api_key")
      .single();

    if (settingError || !settingData?.value) {
      console.log("No Resend API key configured, skipping email");
      return new Response(
        JSON.stringify({ success: false, reason: "No API key configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(settingData.value);

    // Get admin emails
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

    // Fetch all data for the report
    const { data: roles } = await supabaseClient
      .from("roles")
      .select("*")
      .eq("is_active", true)
      .order("name");

    const { data: profiles } = await supabaseClient
      .from("profiles")
      .select("id, email, full_name")
      .order("full_name");

    const { data: userRoles } = await supabaseClient
      .from("user_roles")
      .select("user_id, role_id, role");

    // Check for recent audit log changes related to roles/permissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentChanges } = await supabaseClient
      .from("audit_logs")
      .select("*")
      .in("entity_type", ["roles", "user_roles"])
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    // Build summary stats
    const totalUsers = profiles?.length || 0;
    const totalRoles = roles?.length || 0;
    const adminCount = userRoles?.filter((ur) => ur.role === "admin").length || 0;
    const changeCount = recentChanges?.length || 0;

    // Build user permissions summary
    const userSummaries = (profiles || []).map((profile) => {
      const userRoleEntries = (userRoles || []).filter((ur) => ur.user_id === profile.id);
      const userRoleDetails = userRoleEntries
        .map((ur) => (roles || []).find((r: any) => r.id === ur.role_id))
        .filter(Boolean);

      const isAdmin = userRoleEntries.some((ur) => ur.role === "admin");
      const permissions = new Set<string>();
      let canViewPii = false;

      userRoleDetails.forEach((role: any) => {
        const perms = Array.isArray(role.menu_permissions) ? role.menu_permissions : [];
        perms.forEach((p: string) => permissions.add(p));
        if (role.can_view_pii) canViewPii = true;
      });

      if (isAdmin) {
        MENU_MODULES.forEach((m) => permissions.add(m.code));
        canViewPii = true;
      }

      return {
        name: profile.full_name || "Unnamed",
        email: profile.email,
        roles: userRoleDetails.map((r: any) => r.name).join(", ") || "None",
        isAdmin,
        canViewPii,
        moduleCount: permissions.size,
      };
    });

    // Build recent changes HTML
    let changesHtml = "";
    if (changeCount > 0) {
      changesHtml = `
        <h3 style="color: #dc2626; margin-top: 24px;">⚠️ Permission Changes This Week (${changeCount})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
          <thead>
            <tr style="background: #fef2f2;">
              <th style="padding: 8px; text-align: left; border: 1px solid #fecaca;">Action</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #fecaca;">Entity</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #fecaca;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${(recentChanges || []).slice(0, 10).map((change: any) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #fecaca;">${change.action}</td>
                <td style="padding: 8px; border: 1px solid #fecaca;">${change.entity_type}: ${change.entity_name || change.entity_id || "N/A"}</td>
                <td style="padding: 8px; border: 1px solid #fecaca;">${new Date(change.created_at).toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        ${changeCount > 10 ? `<p style="color: #666; font-size: 12px;">... and ${changeCount - 10} more changes</p>` : ""}
      `;
    } else {
      changesHtml = `<p style="color: #16a34a; margin-top: 24px;">✓ No permission changes in the last 7 days</p>`;
    }

    // Build users with PII access list
    const piiUsers = userSummaries.filter((u) => u.canViewPii);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "HRIS Security <onboarding@resend.dev>",
      to: adminEmails,
      subject: `📊 Weekly Permissions Report - ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #1e40af;">📊 Weekly Permissions Report</h1>
          <p style="color: #666;">Generated on ${new Date().toLocaleString()}</p>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0;">
            <div style="background: #eff6ff; padding: 16px; border-radius: 8px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #1e40af;">${totalUsers}</p>
              <p style="font-size: 12px; color: #666; margin: 4px 0 0;">Total Users</p>
            </div>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #b45309;">${adminCount}</p>
              <p style="font-size: 12px; color: #666; margin: 4px 0 0;">Administrators</p>
            </div>
            <div style="background: #fce7f3; padding: 16px; border-radius: 8px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #be185d;">${piiUsers.length}</p>
              <p style="font-size: 12px; color: #666; margin: 4px 0 0;">PII Access</p>
            </div>
            <div style="background: #dcfce7; padding: 16px; border-radius: 8px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #16a34a;">${totalRoles}</p>
              <p style="font-size: 12px; color: #666; margin: 4px 0 0;">Active Roles</p>
            </div>
          </div>

          ${changesHtml}

          <h3 style="margin-top: 24px;">👁️ Users with PII Access (${piiUsers.length})</h3>
          ${piiUsers.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
              <thead>
                <tr style="background: #fef3c7;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #fcd34d;">Name</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #fcd34d;">Email</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #fcd34d;">Roles</th>
                </tr>
              </thead>
              <tbody>
                ${piiUsers.map((u) => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #fcd34d;">${u.name}${u.isAdmin ? " (Admin)" : ""}</td>
                    <td style="padding: 8px; border: 1px solid #fcd34d;">${u.email}</td>
                    <td style="padding: 8px; border: 1px solid #fcd34d;">${u.roles}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : "<p>No users have PII access configured.</p>"}

          <h3 style="margin-top: 24px;">📋 Full User Permissions Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">User</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Roles</th>
                <th style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">Modules</th>
                <th style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">PII</th>
              </tr>
            </thead>
            <tbody>
              ${userSummaries.slice(0, 50).map((u) => `
                <tr style="${u.isAdmin ? "background: #fef3c7;" : ""}">
                  <td style="padding: 8px; border: 1px solid #d1d5db;">
                    <strong>${u.name}</strong><br>
                    <span style="font-size: 12px; color: #666;">${u.email}</span>
                  </td>
                  <td style="padding: 8px; border: 1px solid #d1d5db;">${u.roles}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">${u.moduleCount}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">${u.canViewPii ? "✓" : "–"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          ${userSummaries.length > 50 ? `<p style="color: #666; font-size: 12px;">... and ${userSummaries.length - 50} more users</p>` : ""}

          <p style="color: #666; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            This is an automated weekly security report from your HRIS system.<br>
            For detailed information, please log in to the admin dashboard.
          </p>
        </div>
      `,
    });

    console.log("Weekly permissions report sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailsSent: adminEmails.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in weekly-permissions-report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
