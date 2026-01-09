import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      manualCode, 
      runType = 'incremental',
      versionBump = 'minor',
      userId,
      sectionIds, // Optional: specific sections to regenerate
      templateConfig, // Optional: template/branding configuration
      targetRoles // Optional: target audience roles
    } = await req.json();

    if (!manualCode) {
      throw new Error('manualCode is required');
    }

    // Get manual definition
    const { data: manual, error: manualError } = await supabase
      .from('manual_definitions')
      .select('*')
      .eq('manual_code', manualCode)
      .single();

    if (manualError) throw manualError;
    if (!manual) throw new Error('Manual not found');

    // Update manual status
    await supabase
      .from('manual_definitions')
      .update({ generation_status: 'generating' })
      .eq('id', manual.id);

    // Create generation run record
    // For initial runs, version_bump should be null and we set requested_version
    // For other runs, we set version_bump to minor/major/patch
    const isInitialRun = runType === 'initial' || runType === 'full' && !manual.current_version;
    const effectiveVersionBump = isInitialRun ? null : (versionBump || 'minor');
    const requestedVersion = isInitialRun ? '1.0.0' : null;
    
    const { data: run, error: runError } = await supabase
      .from('manual_generation_runs')
      .insert({
        manual_id: manual.id,
        triggered_by: userId,
        run_type: isInitialRun ? 'full' : runType,
        version_bump: effectiveVersionBump,
        requested_version: requestedVersion,
        from_version: manual.current_version || null,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (runError) throw runError;

    // Get sections to regenerate
    let sectionsQuery = supabase
      .from('manual_sections')
      .select('*')
      .eq('manual_id', manual.id)
      .order('display_order');

    if (sectionIds && sectionIds.length > 0) {
      sectionsQuery = sectionsQuery.in('id', sectionIds);
    } else if (runType === 'incremental') {
      sectionsQuery = sectionsQuery.eq('needs_regeneration', true);
    }

    const { data: sections, error: sectionsError } = await sectionsQuery;
    if (sectionsError) throw sectionsError;

    const totalSections = sections?.length || 0;
    let regeneratedCount = 0;
    let failedCount = 0;
    const sectionResults: Array<{ sectionId: string; success: boolean; error?: string }> = [];

    // Update run with total count
    await supabase
      .from('manual_generation_runs')
      .update({ sections_total: totalSections })
      .eq('id', run.id);

    // Process sections (with rate limiting)
    // Get template config from manual if not passed explicitly
    const effectiveTemplateConfig = templateConfig || manual.template_config || {};
    const effectiveTargetRoles = targetRoles || effectiveTemplateConfig.targetRoles || ['admin'];

    for (const section of sections || []) {
      try {
        // Call generate-manual-section function with template config
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-manual-section`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            sectionId: section.id,
            regenerationType: runType === 'full' ? 'full' : 'incremental',
            userId,
            templateConfig: effectiveTemplateConfig,
            targetRoles: effectiveTargetRoles
          })
        });

        const result = await response.json();

        if (result.success) {
          regeneratedCount++;
          sectionResults.push({ sectionId: section.id, success: true });
        } else {
          failedCount++;
          sectionResults.push({ 
            sectionId: section.id, 
            success: false, 
            error: result.error 
          });
        }

        // Rate limiting: wait 500ms between sections
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: unknown) {
        failedCount++;
        sectionResults.push({ 
          sectionId: section.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Calculate new version
    const newVersion = incrementVersion(manual.current_version, versionBump);

    // Generate overall changelog using AI
    const changelog = await generateChangelog(
      supabaseUrl,
      supabaseKey,
      manual.manual_name,
      sectionResults.filter(r => r.success).map(r => r.sectionId),
      sections || []
    );

    // Update manual with new version
    await supabase
      .from('manual_definitions')
      .update({
        current_version: newVersion,
        last_generated_at: new Date().toISOString(),
        generation_status: failedCount === totalSections ? 'failed' : 'idle'
      })
      .eq('id', manual.id);

    // Mark change detections as processed
    await supabase
      .from('manual_change_detections')
      .update({
        is_processed: true,
        processed_at: new Date().toISOString(),
        generation_run_id: run.id
      })
      .eq('manual_id', manual.id)
      .eq('is_processed', false);

    // Complete the run
    const finalStatus = failedCount === totalSections ? 'failed' : 
                       failedCount > 0 ? 'completed' : 'completed';

    await supabase
      .from('manual_generation_runs')
      .update({
        to_version: newVersion,
        sections_regenerated: regeneratedCount,
        sections_failed: failedCount,
        changelog,
        status: finalStatus,
        completed_at: new Date().toISOString(),
        error_message: failedCount > 0 ? `${failedCount} section(s) failed to regenerate` : null
      })
      .eq('id', run.id);

    return new Response(
      JSON.stringify({
        success: failedCount < totalSections,
        runId: run.id,
        fromVersion: manual.current_version,
        newVersion,
        sectionsTotal: totalSections,
        sectionsRegenerated: regeneratedCount,
        sectionsFailed: failedCount,
        changelog,
        sectionResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error regenerating manual:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function incrementVersion(
  currentVersion: string,
  bumpType: 'initial' | 'major' | 'minor' | 'patch'
): string {
  // Handle initial version
  if (bumpType === 'initial') {
    return '1.0.0';
  }

  const parts = currentVersion.replace('v', '').split('.').map(Number);
  const [major = 1, minor = 0, patch = 0] = parts;

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

async function generateChangelog(
  supabaseUrl: string,
  supabaseKey: string,
  manualName: string,
  successfulSectionIds: string[],
  allSections: any[]
): Promise<string> {
  try {
    const regeneratedSections = allSections
      .filter(s => successfulSectionIds.includes(s.id))
      .map(s => `${s.section_number}: ${s.title}`)
      .join('\n- ');

    if (!regeneratedSections) {
      return 'No sections were regenerated.';
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a technical writer creating changelog entries for documentation updates. Be concise and professional.'
          },
          {
            role: 'user',
            content: `Generate a brief changelog summary (3-5 bullet points) for the ${manualName} documentation update. The following sections were regenerated:\n- ${regeneratedSections}\n\nFormat as bullet points starting with action verbs (Updated, Added, Improved, Revised, etc.)`
          }
        ],
        model: 'google/gemini-2.5-flash-lite'
      })
    });

    if (!response.ok) {
      return `Updated ${successfulSectionIds.length} section(s) with latest feature information.`;
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || 
           `Updated ${successfulSectionIds.length} section(s) with latest feature information.`;

  } catch (error) {
    console.error('Error generating changelog:', error);
    return `Updated ${successfulSectionIds.length} section(s) with latest feature information.`;
  }
}
