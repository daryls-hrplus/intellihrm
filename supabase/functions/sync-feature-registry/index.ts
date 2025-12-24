import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeatureDefinition {
  code: string;
  name: string;
  description: string;
  routePath: string;
  icon: string;
  tabCode: string;
  roleRequirements: string[];
  workflowSteps?: string[];
  uiElements?: string[];
}

interface FeatureGroup {
  groupCode: string;
  groupName: string;
  features: FeatureDefinition[];
}

interface ModuleDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  routePath: string;
  roleRequirements: string[];
  groups: FeatureGroup[];
}

interface SyncResult {
  newFeatures: string[];
  updatedFeatures: string[];
  unchangedCount: number;
  errors: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { registry, options = {} } = await req.json();
    const { 
      dryRun = false, 
      addToRelease = null,
      excludeFeatureCodes = []
    } = options;

    if (!registry || !Array.isArray(registry)) {
      return new Response(
        JSON.stringify({ error: 'Invalid registry data. Expected array of modules.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const excludeSet = new Set(excludeFeatureCodes as string[]);
    console.log(`[sync-feature-registry] Starting sync for ${registry.length} modules, dryRun: ${dryRun}, excluding: ${excludeFeatureCodes.length} features`);

    // Get existing module mapping
    const { data: existingModules, error: moduleError } = await supabase
      .from('application_modules')
      .select('id, module_code');

    if (moduleError) {
      console.error('[sync-feature-registry] Error fetching modules:', moduleError);
      throw moduleError;
    }

    const moduleMap = new Map(existingModules?.map(m => [m.module_code, m.id]) || []);

    // Get existing features for comparison
    const { data: existingFeatures, error: featureError } = await supabase
      .from('application_features')
      .select('id, feature_code, feature_name, description, route_path, icon_name, module_code, group_code');

    if (featureError) {
      console.error('[sync-feature-registry] Error fetching features:', featureError);
      throw featureError;
    }

    const existingFeatureMap = new Map(existingFeatures?.map(f => [f.feature_code, f]) || []);

    const result: SyncResult = {
      newFeatures: [],
      updatedFeatures: [],
      unchangedCount: 0,
      errors: []
    };

    const featuresToUpsert: any[] = [];
    const newFeatureDetails: any[] = [];

    // Process each module and its features
    for (const module of registry as ModuleDefinition[]) {
      let moduleId = moduleMap.get(module.code);

      // Create module if it doesn't exist
      if (!moduleId && !dryRun) {
        const { data: newModule, error: createModuleError } = await supabase
          .from('application_modules')
          .insert({
            module_code: module.code,
            module_name: module.name,
            description: module.description,
            icon_name: module.icon,
            route_path: module.routePath,
            role_requirements: module.roleRequirements,
            is_active: true
          })
          .select('id')
          .single();

        if (createModuleError) {
          console.error(`[sync-feature-registry] Error creating module ${module.code}:`, createModuleError);
          result.errors.push(`Failed to create module: ${module.code}`);
          continue;
        }
        moduleId = newModule?.id;
        console.log(`[sync-feature-registry] Created new module: ${module.code}`);
      }

      // Process each group and feature
      for (const group of module.groups) {
        for (const feature of group.features) {
          // Skip excluded features
          if (excludeSet.has(feature.code)) {
            console.log(`[sync-feature-registry] Skipping excluded feature: ${feature.code}`);
            continue;
          }

          const existing = existingFeatureMap.get(feature.code);
          
          const featureData = {
            feature_code: feature.code,
            feature_name: feature.name,
            description: feature.description,
            route_path: feature.routePath,
            icon_name: feature.icon,
            role_requirements: feature.roleRequirements,
            workflow_steps: feature.workflowSteps || null,
            ui_elements: feature.uiElements || null,
            module_code: module.code,
            group_code: group.groupCode,
            group_name: group.groupName,
            feature_category: `${module.name} > ${group.groupName}`,
            source: 'registry',
            last_synced_at: new Date().toISOString(),
            is_active: true
          };

          if (!existing) {
            // New feature
            result.newFeatures.push(feature.code);
            newFeatureDetails.push({
              code: feature.code,
              name: feature.name,
              description: feature.description,
              moduleName: module.name,
              moduleCode: module.code,
              groupName: group.groupName,
              icon: feature.icon,
              routePath: feature.routePath
            });
            
            if (moduleId) {
              featuresToUpsert.push({
                ...featureData,
                module_id: moduleId
              });
            }
          } else {
            // Check if any fields changed
            const hasChanges = 
              existing.feature_name !== feature.name ||
              existing.description !== feature.description ||
              existing.route_path !== feature.routePath ||
              existing.icon_name !== feature.icon ||
              existing.module_code !== module.code ||
              existing.group_code !== group.groupCode;

            if (hasChanges) {
              result.updatedFeatures.push(feature.code);
              featuresToUpsert.push({
                ...featureData,
                id: existing.id,
                module_id: moduleId
              });
            } else {
              result.unchangedCount++;
              // Still update last_synced_at
              if (!dryRun) {
                await supabase
                  .from('application_features')
                  .update({ last_synced_at: new Date().toISOString() })
                  .eq('id', existing.id);
              }
            }
          }
        }
      }
    }

    // Perform upserts if not dry run
    if (!dryRun && featuresToUpsert.length > 0) {
      // Split into inserts (new features without ID) and updates (existing features with ID)
      const featuresToInsert = featuresToUpsert.filter(f => !f.id);
      const featuresToUpdate = featuresToUpsert.filter(f => f.id);
      
      // Insert new features (they get auto-generated IDs from default)
      if (featuresToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('application_features')
          .insert(featuresToInsert);

        if (insertError) {
          console.error('[sync-feature-registry] Error inserting new features:', insertError);
          result.errors.push(`Error inserting features: ${insertError.message}`);
        } else {
          console.log(`[sync-feature-registry] Inserted ${featuresToInsert.length} new features`);
        }
      }
      
      // Update existing features one by one to avoid upsert issues
      for (const feature of featuresToUpdate) {
        const featureId = feature.id;
        delete feature.id; // Remove id from the update payload
        
        const { error: updateError } = await supabase
          .from('application_features')
          .update(feature)
          .eq('id', featureId);
          
        if (updateError) {
          console.error(`[sync-feature-registry] Error updating feature ${feature.feature_code}:`, updateError);
          result.errors.push(`Error updating ${feature.feature_code}: ${updateError.message}`);
        }
      }
      
      if (featuresToUpdate.length > 0) {
        console.log(`[sync-feature-registry] Updated ${featuresToUpdate.length} existing features`);
      }
    }

    // Auto-create enablement_content_status records for new features
    if (!dryRun && result.newFeatures.length > 0) {
      console.log(`[sync-feature-registry] Creating enablement_content_status for ${result.newFeatures.length} new features`);
      
      const statusRecords = newFeatureDetails.map(f => ({
        feature_code: f.code,
        module_code: f.moduleCode,
        release_id: addToRelease || null,
        workflow_status: 'development_backlog',
        priority: 'medium',
        documentation_status: 'not_started',
        scorm_lite_status: 'not_started',
        rise_course_status: 'not_started',
        video_status: 'not_started',
        dap_guide_status: 'na'
      }));

      // Use insert with onConflict on (feature_code, release_id) composite key
      const { error: statusError } = await supabase
        .from('enablement_content_status')
        .upsert(statusRecords, { 
          onConflict: 'feature_code,release_id',
          ignoreDuplicates: true 
        });

      if (statusError) {
        console.error('[sync-feature-registry] Error creating content status:', statusError);
        result.errors.push(`Error creating enablement status: ${statusError.message}`);
      } else {
        console.log(`[sync-feature-registry] Created ${statusRecords.length} enablement_content_status records`);
      }
    }

    // If adding to release and we have new features
    if (!dryRun && addToRelease && result.newFeatures.length > 0) {
      console.log(`[sync-feature-registry] Adding ${result.newFeatures.length} new features to release ${addToRelease}`);
      
      // Get the feature IDs for new features
      const { data: newFeatureIds } = await supabase
        .from('application_features')
        .select('id, feature_code, feature_name')
        .in('feature_code', result.newFeatures);

      if (newFeatureIds && newFeatureIds.length > 0) {
        // Create enablement_feature_changes records
        const changeRecords = newFeatureIds.map(f => ({
          release_id: addToRelease,
          feature_id: f.id,
          change_type: 'new_feature',
          change_description: `New feature added from registry: ${f.feature_name}`,
          is_breaking_change: false
        }));

        const { error: changeError } = await supabase
          .from('enablement_feature_changes')
          .insert(changeRecords);

        if (changeError) {
          console.error('[sync-feature-registry] Error creating change records:', changeError);
          result.errors.push(`Error adding to release: ${changeError.message}`);
        } else {
          // Update release feature count
          await supabase
            .from('enablement_releases')
            .update({ 
              feature_count: supabase.rpc('get_release_feature_count', { release_id: addToRelease })
            })
            .eq('id', addToRelease);
            
          console.log(`[sync-feature-registry] Added ${changeRecords.length} change records to release`);
        }
      }
    }

    const response = {
      success: result.errors.length === 0,
      dryRun,
      summary: {
        newFeatures: result.newFeatures.length,
        updatedFeatures: result.updatedFeatures.length,
        unchanged: result.unchangedCount,
        total: result.newFeatures.length + result.updatedFeatures.length + result.unchangedCount
      },
      newFeatureDetails,
      updatedFeatureCodes: result.updatedFeatures,
      errors: result.errors
    };

    console.log('[sync-feature-registry] Sync complete:', response.summary);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sync-feature-registry] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
