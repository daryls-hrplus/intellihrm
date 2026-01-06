import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  responses: Array<{
    id: string;
    text: string;
    question_id?: string;
    rater_category?: string;
  }>;
  employee_id: string;
  cycle_id: string;
  company_id: string;
}

interface Theme {
  name: string;
  frequency: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  supporting_quotes: string[];
  signal_type?: string;
}

interface AnalysisResult {
  themes: Theme[];
  overall_sentiment: {
    score: number;
    label: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  };
  key_strengths: string[];
  development_areas: string[];
  actionable_insights: string[];
  confidence_score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { responses, employee_id, cycle_id, company_id }: AnalysisRequest = await req.json();

    if (!responses || responses.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No responses provided for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${responses.length} feedback responses for employee ${employee_id}`);

    // Prepare text for analysis
    const feedbackTexts = responses
      .filter(r => r.text && r.text.trim().length > 0)
      .map(r => `[${r.rater_category || 'Unknown'}]: ${r.text}`)
      .join('\n\n');

    if (!feedbackTexts) {
      return new Response(
        JSON.stringify({ 
          themes: [],
          overall_sentiment: { score: 0.5, label: 'neutral' },
          key_strengths: [],
          development_areas: [],
          actionable_insights: [],
          confidence_score: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI for narrative analysis
    const aiResponse = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert HR analyst specializing in 360-degree feedback analysis. 
Analyze the provided feedback responses and extract:
1. Key themes (recurring topics across responses)
2. Overall sentiment (score 0-1 and label)
3. Key strengths (specific, actionable)
4. Development areas (specific, constructive)
5. Actionable insights for the employee

Be objective, evidence-based, and constructive. Focus on patterns across multiple raters.
Return your analysis as valid JSON matching this structure:
{
  "themes": [{"name": "string", "frequency": number, "sentiment": "positive|neutral|negative", "supporting_quotes": ["string"], "signal_type": "leadership|collaboration|technical|communication|values"}],
  "overall_sentiment": {"score": number, "label": "very_positive|positive|neutral|negative|very_negative"},
  "key_strengths": ["string"],
  "development_areas": ["string"],
  "actionable_insights": ["string"],
  "confidence_score": number
}`
          },
          {
            role: 'user',
            content: `Analyze these 360 feedback responses:\n\n${feedbackTexts}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', await aiResponse.text());
      throw new Error('Failed to analyze feedback with AI');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0]?.message?.content || '{}';
    
    // Parse AI response
    let analysis: AnalysisResult;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      analysis = {
        themes: [],
        overall_sentiment: { score: 0.5, label: 'neutral' },
        key_strengths: [],
        development_areas: [],
        actionable_insights: [],
        confidence_score: 0.5
      };
    }

    // Log to explainability table
    await supabase.from('ai_feedback_explainability_logs').insert({
      employee_id,
      cycle_id,
      ai_action_type: 'narrative_analysis',
      input_summary: { response_count: responses.length },
      output_summary: {
        theme_count: analysis.themes?.length || 0,
        sentiment: analysis.overall_sentiment?.label,
        strengths_count: analysis.key_strengths?.length || 0,
        development_areas_count: analysis.development_areas?.length || 0
      },
      explanation: `Analyzed ${responses.length} feedback responses. Found ${analysis.themes?.length || 0} themes with overall ${analysis.overall_sentiment?.label || 'neutral'} sentiment.`,
      model_version: 'google/gemini-2.5-flash',
      company_id
    });

    console.log('Narrative analysis complete:', {
      themes: analysis.themes?.length || 0,
      sentiment: analysis.overall_sentiment?.label
    });

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in feedback-narrative-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
