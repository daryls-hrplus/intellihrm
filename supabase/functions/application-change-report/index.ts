import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChangeRecord {
  entityType: string;
  entityName: string;
  changeType: string;
  changedAt: string;
  details: string;
  category: "ui" | "backend" | "database" | "edge_function";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate, releaseId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const changes: ChangeRecord[] = [];
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : now;

    // 1. Track application_features changes
    const { data: featureChanges } = await supabase
      .from("application_features")
      .select(`
        feature_code,
        feature_name,
        updated_at,
        created_at,
        application_modules (module_name)
      `)
      .or(`updated_at.gte.${start.toISOString()},created_at.gte.${start.toISOString()}`)
      .lte("updated_at", end.toISOString());

    featureChanges?.forEach((feature) => {
      const moduleInfo = feature.application_modules as any;
      const isNew = new Date(feature.created_at) >= start;
      changes.push({
        entityType: "Feature",
        entityName: `${feature.feature_name} (${feature.feature_code})`,
        changeType: isNew ? "Created" : "Updated",
        changedAt: feature.updated_at,
        details: `Module: ${moduleInfo?.module_name || 'Unknown'}`,
        category: "ui",
      });
    });

    // 2. Track application_modules changes
    const { data: moduleChanges } = await supabase
      .from("application_modules")
      .select("module_code, module_name, updated_at, created_at")
      .or(`updated_at.gte.${start.toISOString()},created_at.gte.${start.toISOString()}`)
      .lte("updated_at", end.toISOString());

    moduleChanges?.forEach((module) => {
      const isNew = new Date(module.created_at) >= start;
      changes.push({
        entityType: "Module",
        entityName: `${module.module_name} (${module.module_code})`,
        changeType: isNew ? "Created" : "Updated",
        changedAt: module.updated_at,
        details: "Application module configuration",
        category: "ui",
      });
    });

    // 3. Track database schema changes from migrations (if tracking exists)
    const { data: migrationLogs } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("entity_type", "database_migration")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false });

    migrationLogs?.forEach((log) => {
      changes.push({
        entityType: "Database Migration",
        entityName: log.entity_name || "Schema Change",
        changeType: log.action || "Applied",
        changedAt: log.created_at,
        details: JSON.stringify(log.new_values || {}),
        category: "database",
      });
    });

    // 4. Track workflow template changes
    const { data: workflowChanges } = await supabase
      .from("workflow_templates")
      .select("id, name, workflow_type, updated_at, created_at")
      .or(`updated_at.gte.${start.toISOString()},created_at.gte.${start.toISOString()}`)
      .lte("updated_at", end.toISOString());

    workflowChanges?.forEach((wf) => {
      const isNew = new Date(wf.created_at) >= start;
      changes.push({
        entityType: "Workflow Template",
        entityName: wf.name,
        changeType: isNew ? "Created" : "Updated",
        changedAt: wf.updated_at,
        details: `Type: ${wf.workflow_type}`,
        category: "backend",
      });
    });

    // 5. Track RLS policy changes from audit logs
    const { data: policyLogs } = await supabase
      .from("audit_logs")
      .select("*")
      .ilike("entity_type", "%policy%")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    policyLogs?.forEach((log) => {
      changes.push({
        entityType: "RLS Policy",
        entityName: log.entity_name || "Security Policy",
        changeType: log.action,
        changedAt: log.created_at,
        details: "Row-level security configuration",
        category: "database",
      });
    });

    // 6. Track role/permission changes
    const { data: roleChanges } = await supabase
      .from("roles")
      .select("id, name, code, updated_at, created_at")
      .or(`updated_at.gte.${start.toISOString()},created_at.gte.${start.toISOString()}`)
      .lte("updated_at", end.toISOString());

    roleChanges?.forEach((role) => {
      const isNew = new Date(role.created_at) >= start;
      changes.push({
        entityType: "Role",
        entityName: `${role.name} (${role.code})`,
        changeType: isNew ? "Created" : "Updated",
        changedAt: role.updated_at,
        details: "Permission configuration",
        category: "backend",
      });
    });

    // 7. Track lookup values changes (configuration)
    const { data: lookupChanges } = await supabase
      .from("lookup_values")
      .select("id, lookup_type, code, name, updated_at, created_at")
      .or(`updated_at.gte.${start.toISOString()},created_at.gte.${start.toISOString()}`)
      .lte("updated_at", end.toISOString())
      .limit(50);

    lookupChanges?.forEach((lookup) => {
      const isNew = new Date(lookup.created_at) >= start;
      changes.push({
        entityType: "Lookup Value",
        entityName: `${lookup.name} (${lookup.lookup_type})`,
        changeType: isNew ? "Created" : "Updated",
        changedAt: lookup.updated_at,
        details: `Code: ${lookup.code}`,
        category: "backend",
      });
    });

    // Sort by date descending
    changes.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

    // Group by category for summary
    const summary = {
      ui: changes.filter(c => c.category === "ui").length,
      backend: changes.filter(c => c.category === "backend").length,
      database: changes.filter(c => c.category === "database").length,
      edge_function: changes.filter(c => c.category === "edge_function").length,
      total: changes.length,
    };

    // Group by date for timeline view
    const byDate: Record<string, ChangeRecord[]> = {};
    changes.forEach((change) => {
      const date = change.changedAt.split("T")[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(change);
    });

    // If releaseId provided, link changes to the release
    if (releaseId && changes.length > 0) {
      const featureChangesForRelease = changes
        .filter(c => c.entityType === "Feature")
        .slice(0, 20);

      for (const change of featureChangesForRelease) {
        const featureCode = change.entityName.match(/\(([^)]+)\)/)?.[1];
        if (featureCode) {
          await supabase
            .from("enablement_feature_changes")
            .upsert({
              release_id: releaseId,
              feature_code: featureCode,
              module_code: "detected",
              change_type: change.changeType.toLowerCase(),
              change_description: change.details,
              change_severity: "minor",
              detected_at: change.changedAt,
            }, {
              onConflict: "release_id,feature_code",
            });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        summary,
        changesByDate: byDate,
        changes,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in application-change-report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
