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
  entityCode?: string;
  moduleName?: string;
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
    
    // Parse dates properly - handle single day queries
    let start: Date;
    let end: Date;
    
    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      end = now;
    }

    console.log(`Scanning for changes from ${start.toISOString()} to ${end.toISOString()}`);

    // 1. Track application_features changes (UI)
    const { data: featureChanges, error: featureError } = await supabase
      .from("application_features")
      .select(`
        id,
        feature_code,
        feature_name,
        description,
        route_path,
        ui_elements,
        workflow_steps,
        updated_at,
        created_at,
        is_active,
        module_id,
        application_modules (module_code, module_name)
      `)
      .gte("updated_at", start.toISOString())
      .lte("updated_at", end.toISOString())
      .order("updated_at", { ascending: false });

    if (featureError) console.error("Feature query error:", featureError);

    featureChanges?.forEach((feature) => {
      const moduleInfo = feature.application_modules as any;
      const isNew = new Date(feature.created_at) >= start;
      const hasUIElements = feature.ui_elements && Object.keys(feature.ui_elements).length > 0;
      const hasWorkflow = feature.workflow_steps && Array.isArray(feature.workflow_steps) && feature.workflow_steps.length > 0;
      
      changes.push({
        entityType: "Feature",
        entityName: feature.feature_name,
        entityCode: feature.feature_code,
        changeType: isNew ? "Created" : "Updated",
        changedAt: feature.updated_at,
        details: `Module: ${moduleInfo?.module_name || 'Unknown'}${feature.route_path ? ` | Route: ${feature.route_path}` : ""}${hasUIElements ? " | Has UI elements" : ""}${hasWorkflow ? " | Has workflow steps" : ""}`,
        category: "ui",
        moduleName: moduleInfo?.module_name,
      });
    });

    // 2. Track application_modules changes (UI)
    const { data: moduleChanges, error: moduleError } = await supabase
      .from("application_modules")
      .select("id, module_code, module_name, description, route_path, icon_name, updated_at, created_at, is_active")
      .gte("updated_at", start.toISOString())
      .lte("updated_at", end.toISOString())
      .order("updated_at", { ascending: false });

    if (moduleError) console.error("Module query error:", moduleError);

    moduleChanges?.forEach((module) => {
      const isNew = new Date(module.created_at) >= start;
      changes.push({
        entityType: "Module",
        entityName: module.module_name,
        entityCode: module.module_code,
        changeType: isNew ? "Created" : "Updated",
        changedAt: module.updated_at,
        details: `Route: ${module.route_path}${module.icon_name ? ` | Icon: ${module.icon_name}` : ""}${!module.is_active ? " | INACTIVE" : ""}`,
        category: "ui",
      });
    });

    // 3. Track all audit_logs entries (Database)
    const { data: auditLogs, error: auditError } = await supabase
      .from("audit_logs")
      .select("*")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false })
      .limit(100);

    if (auditError) console.error("Audit log query error:", auditError);

    auditLogs?.forEach((log) => {
      let category: "database" | "backend" = "database";
      
      // Categorize by entity type
      if (log.entity_type?.includes("policy") || log.entity_type?.includes("rls")) {
        category = "database";
      } else if (log.entity_type?.includes("migration") || log.entity_type?.includes("schema")) {
        category = "database";
      }

      changes.push({
        entityType: log.entity_type || "Audit Entry",
        entityName: log.entity_name || log.entity_id || "Unknown",
        changeType: log.action || "Modified",
        changedAt: log.created_at,
        details: log.metadata ? JSON.stringify(log.metadata).substring(0, 200) : "No details",
        category,
      });
    });

    // 4. Track workflow template changes (Backend)
    const { data: workflowChanges, error: workflowError } = await supabase
      .from("workflow_templates")
      .select("id, name, workflow_type, description, steps, updated_at, created_at, is_active")
      .gte("updated_at", start.toISOString())
      .lte("updated_at", end.toISOString())
      .order("updated_at", { ascending: false });

    if (workflowError) console.error("Workflow query error:", workflowError);

    workflowChanges?.forEach((wf) => {
      const isNew = new Date(wf.created_at) >= start;
      const stepCount = wf.steps ? (Array.isArray(wf.steps) ? wf.steps.length : Object.keys(wf.steps).length) : 0;
      changes.push({
        entityType: "Workflow Template",
        entityName: wf.name,
        changeType: isNew ? "Created" : "Updated",
        changedAt: wf.updated_at,
        details: `Type: ${wf.workflow_type}${stepCount > 0 ? ` | ${stepCount} steps` : ""}${!wf.is_active ? " | INACTIVE" : ""}`,
        category: "backend",
      });
    });

    // 5. Track role/permission changes (Backend)
    const { data: roleChanges, error: roleError } = await supabase
      .from("roles")
      .select("id, name, code, description, menu_permissions, updated_at, created_at, is_active")
      .gte("updated_at", start.toISOString())
      .lte("updated_at", end.toISOString())
      .order("updated_at", { ascending: false });

    if (roleError) console.error("Role query error:", roleError);

    roleChanges?.forEach((role) => {
      const isNew = new Date(role.created_at) >= start;
      const permCount = role.menu_permissions ? Object.keys(role.menu_permissions).length : 0;
      changes.push({
        entityType: "Role",
        entityName: role.name,
        entityCode: role.code,
        changeType: isNew ? "Created" : "Updated",
        changedAt: role.updated_at,
        details: `Code: ${role.code}${permCount > 0 ? ` | ${permCount} permissions configured` : ""}${!role.is_active ? " | INACTIVE" : ""}`,
        category: "backend",
      });
    });

    // 6. Track lookup values changes (Backend - Configuration)
    const { data: lookupChanges, error: lookupError } = await supabase
      .from("lookup_values")
      .select("id, lookup_type, code, name, description, updated_at, created_at, is_active")
      .gte("updated_at", start.toISOString())
      .lte("updated_at", end.toISOString())
      .order("updated_at", { ascending: false })
      .limit(100);

    if (lookupError) console.error("Lookup query error:", lookupError);

    lookupChanges?.forEach((lookup) => {
      const isNew = new Date(lookup.created_at) >= start;
      changes.push({
        entityType: "Lookup Value",
        entityName: lookup.name,
        entityCode: lookup.code,
        changeType: isNew ? "Created" : "Updated",
        changedAt: lookup.updated_at,
        details: `Type: ${lookup.lookup_type} | Code: ${lookup.code}${!lookup.is_active ? " | INACTIVE" : ""}`,
        category: "backend",
      });
    });

    // 7. Track enablement change tracking table (if populated)
    const { data: enablementChanges, error: enablementError } = await supabase
      .from("enablement_change_tracking")
      .select("*")
      .gte("changed_at", start.toISOString())
      .lte("changed_at", end.toISOString())
      .order("changed_at", { ascending: false });

    if (!enablementError && enablementChanges) {
      enablementChanges.forEach((change) => {
        changes.push({
          entityType: change.entity_type,
          entityName: change.entity_name,
          entityCode: change.entity_code,
          changeType: change.change_type,
          changedAt: change.changed_at,
          details: change.change_details ? JSON.stringify(change.change_details).substring(0, 200) : `Source: ${change.source}`,
          category: change.change_category as any,
        });
      });
    }

    // 8. Track pay elements changes (Backend - Payroll config)
    const { data: payElementChanges } = await supabase
      .from("pay_elements")
      .select("id, code, name, element_type, updated_at, created_at, is_active")
      .gte("updated_at", start.toISOString())
      .lte("updated_at", end.toISOString())
      .order("updated_at", { ascending: false })
      .limit(50);

    payElementChanges?.forEach((pe) => {
      const isNew = new Date(pe.created_at) >= start;
      changes.push({
        entityType: "Pay Element",
        entityName: pe.name,
        entityCode: pe.code,
        changeType: isNew ? "Created" : "Updated",
        changedAt: pe.updated_at,
        details: `Type: ${pe.element_type}${!pe.is_active ? " | INACTIVE" : ""}`,
        category: "backend",
      });
    });

    // 9. Track benefit plans changes
    const { data: benefitChanges } = await supabase
      .from("benefit_plans")
      .select("id, code, name, plan_type, updated_at, created_at, is_active")
      .gte("updated_at", start.toISOString())
      .lte("updated_at", end.toISOString())
      .order("updated_at", { ascending: false })
      .limit(50);

    benefitChanges?.forEach((bp) => {
      const isNew = new Date(bp.created_at) >= start;
      changes.push({
        entityType: "Benefit Plan",
        entityName: bp.name,
        entityCode: bp.code,
        changeType: isNew ? "Created" : "Updated",
        changedAt: bp.updated_at,
        details: `Type: ${bp.plan_type}${!bp.is_active ? " | INACTIVE" : ""}`,
        category: "backend",
      });
    });

    // 10. Track leave types changes
    const { data: leaveTypeChanges } = await supabase
      .from("leave_types")
      .select("id, code, name, category, updated_at, created_at, is_active")
      .gte("updated_at", start.toISOString())
      .lte("updated_at", end.toISOString())
      .order("updated_at", { ascending: false })
      .limit(50);

    leaveTypeChanges?.forEach((lt) => {
      const isNew = new Date(lt.created_at) >= start;
      changes.push({
        entityType: "Leave Type",
        entityName: lt.name,
        entityCode: lt.code,
        changeType: isNew ? "Created" : "Updated",
        changedAt: lt.updated_at,
        details: `Category: ${lt.category}${!lt.is_active ? " | INACTIVE" : ""}`,
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
        if (change.entityCode) {
          await supabase
            .from("enablement_feature_changes")
            .upsert({
              release_id: releaseId,
              feature_code: change.entityCode,
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

    console.log(`Found ${changes.length} changes in date range`);

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
        debug: {
          queriedTables: [
            "application_features",
            "application_modules", 
            "audit_logs",
            "workflow_templates",
            "roles",
            "lookup_values",
            "enablement_change_tracking",
            "pay_elements",
            "benefit_plans",
            "leave_types"
          ],
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in application-change-report:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        changes: [],
        summary: { ui: 0, backend: 0, database: 0, edge_function: 0, total: 0 },
        changesByDate: {},
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
