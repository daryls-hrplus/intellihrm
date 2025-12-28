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
    const body = await req.json().catch(() => ({}));

    // Accept both camelCase and snake_case (client may send either)
    const competencyIdRaw = body.competencyId ?? body.competency_id;
    const competencyName = body.competencyName ?? body.competency_name;
    const competencyDescription = body.competencyDescription ?? body.competency_description ?? null;
    const competencyCategory = body.competencyCategory ?? body.competency_category ?? 'general';
    const companyIdRaw = body.companyId ?? body.company_id;

    const isUuid = (v: unknown): v is string =>
      typeof v === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

    const competencyId = isUuid(competencyIdRaw) ? competencyIdRaw : null;
    const companyId = isUuid(companyIdRaw) ? companyIdRaw : null;

    console.log('Request params:', { competencyId, competencyName, competencyCategory, companyId });

    if (!competencyId) {
      return new Response(JSON.stringify({ error: 'competency_id must be a valid UUID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!competencyName) {
      return new Response(JSON.stringify({ error: 'competency_name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch available skills - handle missing/invalid companyId gracefully
    let query = supabase
      .from('skills_competencies')
      .select('id, name, code, description, category')
      .eq('type', 'SKILL')
      .eq('status', 'active');

    if (companyId) {
      query = query.or(`company_id.eq.${companyId},is_global.eq.true`);
    } else {
      query = query.eq('is_global', true);
    }

    const { data: skills, error: skillsError } = await query.limit(200);

    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
      throw skillsError;
    }

    // Fetch existing mappings for this competency
    const { data: existingMappings } = await supabase
      .from('competency_skill_mappings')
      .select('skill_id')
      .eq('competency_id', competencyId);

    const existingSkillIds = new Set((existingMappings || []).map(m => m.skill_id));

    const availableSkills = skills?.filter(s => !existingSkillIds.has(s.id)) || [];

    if (availableSkills.length === 0) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Lovable AI for intelligent matching
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      // Fallback to keyword matching
      const suggestions = performKeywordMatching(competencyName, competencyDescription, competencyCategory, availableSkills);
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are an HR skills expert. Given a competency, suggest which skills from the available list are most relevant.

COMPETENCY:
Name: ${competencyName}
Description: ${competencyDescription || 'N/A'}
Category: ${competencyCategory}

AVAILABLE SKILLS:
${availableSkills.slice(0, 50).map((s, i) => `${i + 1}. ${s.name} (${s.category}) - ${s.description || 'No description'}`).join('\n')}

Return a JSON array of the top 10 most relevant skills with this format:
[{"skill_index": 1, "confidence": 0.95, "reason": "Brief reason"}]

Only include skills with confidence > 0.5. skill_index is the 1-based index from the list above.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an HR skills matching expert. Return only valid JSON arrays." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      const suggestions = performKeywordMatching(competencyName, competencyDescription, competencyCategory, availableSkills);
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '[]';
    
    // Parse AI response
    let aiSuggestions: { skill_index: number; confidence: number; reason: string }[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiSuggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }

    // Map AI suggestions to actual skill data
    const suggestions = aiSuggestions
      .filter(s => s.skill_index > 0 && s.skill_index <= availableSkills.length)
      .map(s => ({
        skill: availableSkills[s.skill_index - 1],
        confidence: s.confidence,
        reason: s.reason,
        ai_suggested: true,
      }))
      .slice(0, 10);

    console.log(`Suggested ${suggestions.length} skills for competency ${competencyName}`);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-skill-mappings:', error);

    const errObj = error as any;
    const message =
      (errObj && typeof errObj === 'object' && typeof errObj.message === 'string' && errObj.message) ||
      (error instanceof Error ? error.message : '') ||
      'Unknown error';

    return new Response(JSON.stringify({ error: message, code: errObj?.code ?? null }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback keyword matching when AI is unavailable
function performKeywordMatching(
  competencyName: string,
  competencyDescription: string | null,
  competencyCategory: string,
  skills: any[]
): any[] {
  const searchTerms = `${competencyName} ${competencyDescription || ''} ${competencyCategory}`.toLowerCase().split(/\s+/);
  
  const scored = skills.map(skill => {
    const skillText = `${skill.name} ${skill.description || ''} ${skill.category}`.toLowerCase();
    let score = 0;
    
    for (const term of searchTerms) {
      if (term.length > 2 && skillText.includes(term)) {
        score += 1;
      }
    }
    
    // Category match bonus
    if (skill.category === competencyCategory) {
      score += 2;
    }
    
    return { skill, confidence: Math.min(score / 10, 0.9), reason: 'Keyword match', ai_suggested: false };
  });

  return scored
    .filter(s => s.confidence > 0.1)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
}
