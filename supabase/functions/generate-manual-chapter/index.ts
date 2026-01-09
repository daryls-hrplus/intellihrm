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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { 
      manualId,
      chapterNumber, // e.g., "1" for sections 1, 1.1, 1.2, etc.
      userId,
      templateConfig,
      targetRoles
    } = await req.json();

    if (!manualId || !chapterNumber) {
      throw new Error('manualId and chapterNumber are required');
    }

    // Get manual definition
    const { data: manual, error: manualError } = await supabase
      .from('manual_definitions')
      .select('*')
      .eq('id', manualId)
      .single();

    if (manualError) throw manualError;
    if (!manual) throw new Error('Manual not found');

    // Get all sections for this chapter (e.g., "1", "1.1", "1.2", etc.)
    const { data: sections, error: sectionsError } = await supabase
      .from('manual_sections')
      .select('*')
      .eq('manual_id', manualId)
      .or(`section_number.eq.${chapterNumber},section_number.like.${chapterNumber}.%`)
      .order('display_order');

    if (sectionsError) throw sectionsError;

    if (!sections || sections.length === 0) {
      throw new Error(`No sections found for chapter ${chapterNumber}`);
    }

    const effectiveTemplateConfig = templateConfig || manual.template_config || {};
    const effectiveTargetRoles = targetRoles || effectiveTemplateConfig.targetRoles || ['admin'];

    const results: Array<{ sectionId: string; sectionNumber: string; success: boolean; error?: string }> = [];
    let successCount = 0;
    let failCount = 0;

    // Process each section in the chapter
    for (const section of sections) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-manual-section`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            sectionId: section.id,
            regenerationType: 'full',
            userId,
            templateConfig: effectiveTemplateConfig,
            targetRoles: effectiveTargetRoles
          })
        });

        const result = await response.json();

        if (result.success) {
          successCount++;
          results.push({ 
            sectionId: section.id, 
            sectionNumber: section.section_number,
            success: true 
          });
        } else {
          failCount++;
          results.push({ 
            sectionId: section.id, 
            sectionNumber: section.section_number,
            success: false, 
            error: result.error 
          });
        }

        // Rate limiting between sections
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error: unknown) {
        failCount++;
        results.push({ 
          sectionId: section.id, 
          sectionNumber: section.section_number,
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        chapterNumber,
        totalSections: sections.length,
        successCount,
        failCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating chapter:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
