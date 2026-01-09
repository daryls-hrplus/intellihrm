import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SectionInfo {
  id: string;
  title: string;
  content?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { selectedSections, availableSections } = await req.json();

    if (!selectedSections || !Array.isArray(selectedSections)) {
      return new Response(
        JSON.stringify({ error: 'selectedSections array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!availableSections || availableSections.length === 0) {
      return new Response(
        JSON.stringify({ suggestedSections: [], reasoning: 'No additional sections available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const selectedTitles = selectedSections.map((s: SectionInfo) => `- ${s.title}`).join('\n');
    const availableTitles = availableSections.map((s: SectionInfo) => `- ID: ${s.id} | Title: ${s.title}`).join('\n');

    const prompt = `You are an HRMS documentation expert analyzing section dependencies.

The user has selected these sections to publish:
${selectedTitles}

These sections are available but NOT selected:
${availableTitles}

Analyze which of the available sections should also be included because they:
1. Are prerequisites for understanding the selected content
2. Are directly referenced by the selected sections
3. Cover closely related concepts that users would typically need together
4. Provide essential context for the selected topics

Return ONLY the IDs of sections that SHOULD be added. Be selective - only suggest truly related content.

Respond with a JSON object:
{
  "suggestedSections": ["id1", "id2"],
  "reasoning": "Brief explanation of why these were suggested"
}

If no additional sections are needed, return empty array.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a documentation dependency analyzer. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '{}';
    
    let result;
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanedContent);
    } catch {
      console.error('Failed to parse AI response:', content);
      result = { suggestedSections: [], reasoning: 'Analysis completed' };
    }

    // Validate that suggested IDs exist in available sections
    const availableIds = new Set(availableSections.map((s: SectionInfo) => s.id));
    const validSuggestions = (result.suggestedSections || []).filter((id: string) => availableIds.has(id));

    return new Response(
      JSON.stringify({
        suggestedSections: validSuggestions,
        reasoning: result.reasoning || '',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Dependency analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
