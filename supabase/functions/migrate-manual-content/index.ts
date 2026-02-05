import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge function to migrate manual content from JSX components to markdown
 * This is called manually to seed the manual_content table
 * 
 * POST /migrate-manual-content
 * Body: { manualId: string, sections: ManualSectionInput[] }
 */

interface ManualSectionInput {
  section_id: string;
  chapter_id: string;
  title: string;
  content_markdown: string;
  read_time_minutes?: number;
  target_roles?: string[];
  order_index: number;
  chapter_order: number;
  parent_section_id?: string | null;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const { manualId, sections } = await req.json() as {
        manualId: string;
        sections: ManualSectionInput[];
      };

      if (!manualId || !sections || !Array.isArray(sections)) {
        return new Response(
          JSON.stringify({ error: 'manualId and sections array required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Upsert sections (insert or update on conflict)
      const records = sections.map(section => ({
        manual_id: manualId,
        section_id: section.section_id,
        chapter_id: section.chapter_id,
        title: section.title,
        content_markdown: section.content_markdown,
        read_time_minutes: section.read_time_minutes ?? 5,
        target_roles: section.target_roles ?? ['all'],
        order_index: section.order_index,
        chapter_order: section.chapter_order,
        parent_section_id: section.parent_section_id ?? null,
        metadata: section.metadata ?? {},
      }));

      const { data, error } = await supabaseClient
        .from('manual_content')
        .upsert(records, { 
          onConflict: 'manual_id,section_id',
          ignoreDuplicates: false 
        })
        .select('id, section_id');

      if (error) {
        console.error('Upsert error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Migrated ${sections.length} sections for ${manualId}`,
          sections: data 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: List all manuals and their section counts
    if (req.method === 'GET') {
      const { data, error } = await supabaseClient
        .from('manual_content')
        .select('manual_id')
        .order('manual_id');

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Group by manual_id and count
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        counts[row.manual_id] = (counts[row.manual_id] || 0) + 1;
      }

      return new Response(
        JSON.stringify({ 
          manuals: Object.entries(counts).map(([id, count]) => ({ id, sectionCount: count }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
