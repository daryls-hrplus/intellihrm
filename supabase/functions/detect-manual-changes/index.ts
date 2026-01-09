import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangeDetectionResult {
  manualId: string;
  manualCode: string;
  totalChanges: number;
  changedFeatures: Array<{
    featureCode: string;
    featureName: string;
    changeType: 'added' | 'modified' | 'removed';
    updatedAt: string;
  }>;
  affectedSections: Array<{
    sectionId: string;
    sectionNumber: string;
    title: string;
    affectedBy: string[];
  }>;
  severity: 'minor' | 'major' | 'critical';
  changeReport: {
    summary: string;
    recommendedAction: string;
    versionBump: 'patch' | 'minor' | 'major';
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { manualCode, sinceDate } = await req.json();

    // Get manual definitions to scan
    let manualsQuery = supabase
      .from('manual_definitions')
      .select('*');
    
    if (manualCode) {
      manualsQuery = manualsQuery.eq('manual_code', manualCode);
    }

    const { data: manuals, error: manualsError } = await manualsQuery;
    if (manualsError) throw manualsError;

    const results: ChangeDetectionResult[] = [];

    for (const manual of manuals || []) {
      // Determine the date to check from
      const checkFromDate = sinceDate || manual.last_generated_at || '1970-01-01';

      // Get features that have changed for this manual's modules
      const { data: changedFeatures, error: featuresError } = await supabase
        .from('application_features')
        .select('feature_code, feature_name, module_code, updated_at, created_at')
        .overlaps('module_code', manual.module_codes || [])
        .or(`updated_at.gt.${checkFromDate},created_at.gt.${checkFromDate}`);

      if (featuresError) throw featuresError;

      // Get modules that have changed
      const { data: changedModules, error: modulesError } = await supabase
        .from('application_modules')
        .select('module_code, module_name, updated_at, created_at')
        .in('module_code', manual.module_codes || [])
        .or(`updated_at.gt.${checkFromDate},created_at.gt.${checkFromDate}`);

      if (modulesError) throw modulesError;

      // Get sections that might be affected
      const { data: sections, error: sectionsError } = await supabase
        .from('manual_sections')
        .select('id, section_number, title, source_feature_codes, source_module_codes')
        .eq('manual_id', manual.id);

      if (sectionsError) throw sectionsError;

      // Build change list
      const changes: ChangeDetectionResult['changedFeatures'] = [];
      
      for (const feature of changedFeatures || []) {
        const isNew = new Date(feature.created_at) > new Date(checkFromDate);
        changes.push({
          featureCode: feature.feature_code,
          featureName: feature.feature_name,
          changeType: isNew ? 'added' : 'modified',
          updatedAt: feature.updated_at
        });
      }

      // Determine affected sections
      const affectedSections: ChangeDetectionResult['affectedSections'] = [];
      const changedFeatureCodes = changes.map(c => c.featureCode);
      const changedModuleCodes = (changedModules || []).map(m => m.module_code);

      for (const section of sections || []) {
        const affectedByFeatures = (section.source_feature_codes || [])
          .filter((fc: string) => changedFeatureCodes.includes(fc));
        const affectedByModules = (section.source_module_codes || [])
          .filter((mc: string) => changedModuleCodes.includes(mc));
        
        if (affectedByFeatures.length > 0 || affectedByModules.length > 0) {
          affectedSections.push({
            sectionId: section.id,
            sectionNumber: section.section_number,
            title: section.title,
            affectedBy: [...affectedByFeatures, ...affectedByModules]
          });

          // Mark section as needing regeneration
          await supabase
            .from('manual_sections')
            .update({ needs_regeneration: true })
            .eq('id', section.id);
        }
      }

      // Calculate severity
      let severity: 'minor' | 'major' | 'critical' = 'minor';
      let versionBump: 'patch' | 'minor' | 'major' = 'patch';
      
      if (changes.filter(c => c.changeType === 'added').length > 0) {
        severity = 'major';
        versionBump = 'minor';
      }
      if (affectedSections.length > 5) {
        severity = 'critical';
        versionBump = 'major';
      }

      // Create change detection records
      for (const change of changes) {
        const affectedIds = affectedSections
          .filter(s => s.affectedBy.includes(change.featureCode))
          .map(s => s.sectionId);

        await supabase
          .from('manual_change_detections')
          .insert({
            manual_id: manual.id,
            change_type: change.changeType === 'added' ? 'feature_added' : 'feature_modified',
            source_table: 'application_features',
            source_id: change.featureCode, // Using code as we don't have ID here
            source_code: change.featureCode,
            change_summary: `${change.featureName} was ${change.changeType}`,
            affected_section_ids: affectedIds,
            severity: severity
          });
      }

      results.push({
        manualId: manual.id,
        manualCode: manual.manual_code,
        totalChanges: changes.length,
        changedFeatures: changes,
        affectedSections,
        severity,
        changeReport: {
          summary: changes.length === 0 
            ? 'No changes detected since last generation'
            : `${changes.length} feature(s) changed, ${affectedSections.length} section(s) affected`,
          recommendedAction: changes.length === 0
            ? 'No action needed'
            : `Regenerate ${affectedSections.length} section(s) with ${versionBump} version bump`,
          versionBump
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        totalManualsScanned: results.length,
        totalChangesDetected: results.reduce((sum, r) => sum + r.totalChanges, 0)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error detecting manual changes:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
