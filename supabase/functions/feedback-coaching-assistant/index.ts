import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoachingRequest {
  manager_id: string;
  employee_id: string;
  cycle_id: string;
  company_id: string;
  coaching_context?: 'feedback_discussion' | 'development_planning' | 'performance_review' | 'general';
  specific_themes?: string[];
}

interface CoachingPrompt {
  category: string;
  prompt_text: string;
  rationale: string;
  expected_outcome: string;
  follow_up_questions: string[];
}

interface CoachingResult {
  conversation_starters: CoachingPrompt[];
  development_focus_areas: Array<{
    area: string;
    priority: 'high' | 'medium' | 'low';
    suggested_actions: string[];
    resources: string[];
  }>;
  recognition_opportunities: string[];
  caution_areas: Array<{
    topic: string;
    reason: string;
    alternative_approach: string;
  }>;
  overall_coaching_strategy: string;
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

    const { 
      manager_id, 
      employee_id, 
      cycle_id, 
      company_id,
      coaching_context = 'feedback_discussion',
      specific_themes = []
    }: CoachingRequest = await req.json();

    console.log(`Generating coaching prompts for manager ${manager_id} about employee ${employee_id}`);

    // Fetch employee's feedback summary
    const { data: responses, error: responsesError } = await supabase
      .from('feedback_360_responses')
      .select(`
        rating_value,
        text_response,
        question:feedback_360_questions(question_text, category_id),
        request:feedback_360_requests!inner(
          rater_category_id
        )
      `)
      .eq('request.subject_employee_id', employee_id)
      .eq('request.cycle_id', cycle_id);

    if (responsesError) {
      throw new Error(`Failed to fetch responses: ${responsesError.message}`);
    }

    // Fetch employee profile
    const { data: employee } = await supabase
      .from('profiles')
      .select('full_name, job_title')
      .eq('id', employee_id)
      .single();

    // Prepare feedback summary for AI
    const feedbackSummary = responses?.map((r: any) => ({
      question: r.question?.question_text || 'General feedback',
      rating: r.rating_value,
      comment: r.text_response,
      rater_type: r.request?.rater_category_id
    })) || [];

    // Calculate average ratings by category
    const ratingsByRaterType: Record<string, number[]> = {};
    feedbackSummary.forEach((f: any) => {
      if (f.rating !== null) {
        const key = f.rater_type || 'unknown';
        if (!ratingsByRaterType[key]) ratingsByRaterType[key] = [];
        ratingsByRaterType[key].push(f.rating);
      }
    });

    const avgByType = Object.entries(ratingsByRaterType).map(([type, ratings]) => ({
      type,
      avg: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
    }));

    // Call Lovable AI for coaching prompts
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
            content: `You are an expert executive coach helping managers have effective development conversations with their team members based on 360 feedback.

Generate coaching guidance that is:
- Constructive and growth-oriented
- Based on evidence from the feedback
- Psychologically safe and non-threatening
- Actionable with specific conversation prompts

Return your response as valid JSON:
{
  "conversation_starters": [{"category": "string", "prompt_text": "string", "rationale": "string", "expected_outcome": "string", "follow_up_questions": ["string"]}],
  "development_focus_areas": [{"area": "string", "priority": "high|medium|low", "suggested_actions": ["string"], "resources": ["string"]}],
  "recognition_opportunities": ["string"],
  "caution_areas": [{"topic": "string", "reason": "string", "alternative_approach": "string"}],
  "overall_coaching_strategy": "string",
  "confidence_score": number (0-1)
}`
          },
          {
            role: 'user',
            content: `Generate coaching prompts for a ${coaching_context} conversation.

Employee: ${employee?.full_name || 'Team Member'} (${employee?.job_title || 'Position not specified'})

Feedback Summary:
- Total responses: ${feedbackSummary.length}
- Average ratings by rater type: ${JSON.stringify(avgByType)}
${specific_themes.length > 0 ? `- Specific themes to address: ${specific_themes.join(', ')}` : ''}

Sample feedback comments (anonymized):
${feedbackSummary
  .filter((f: any) => f.comment)
  .slice(0, 10)
  .map((f: any) => `- "${f.comment}"`)
  .join('\n')}`
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      })
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', await aiResponse.text());
      throw new Error('Failed to generate coaching prompts');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0]?.message?.content || '{}';
    
    let result: CoachingResult;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      result = {
        conversation_starters: [],
        development_focus_areas: [],
        recognition_opportunities: [],
        caution_areas: [],
        overall_coaching_strategy: 'Unable to generate strategy',
        confidence_score: 0
      };
    }

    // Ensure all required fields exist
    result = {
      conversation_starters: result.conversation_starters || [],
      development_focus_areas: result.development_focus_areas || [],
      recognition_opportunities: result.recognition_opportunities || [],
      caution_areas: result.caution_areas || [],
      overall_coaching_strategy: result.overall_coaching_strategy || '',
      confidence_score: result.confidence_score || 0.5
    };

    // Log to explainability table
    await supabase.from('ai_feedback_explainability_logs').insert({
      employee_id,
      cycle_id,
      ai_action_type: 'coaching_assistance',
      input_summary: { 
        coaching_context,
        feedback_count: feedbackSummary.length,
        specific_themes
      },
      output_summary: {
        prompts_generated: result.conversation_starters.length,
        focus_areas: result.development_focus_areas.length,
        caution_areas: result.caution_areas.length
      },
      explanation: `Generated ${result.conversation_starters.length} coaching prompts for ${coaching_context} based on ${feedbackSummary.length} feedback responses.`,
      model_version: 'google/gemini-2.5-flash',
      company_id
    });

    console.log('Coaching assistance complete:', {
      prompts: result.conversation_starters.length,
      focus_areas: result.development_focus_areas.length
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in feedback-coaching-assistant:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
