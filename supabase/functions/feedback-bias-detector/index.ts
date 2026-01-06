import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BiasDetectionRequest {
  cycle_id: string;
  company_id: string;
  analysis_type: 'individual' | 'aggregate' | 'rater';
  target_id?: string; // employee_id or rater_id
}

interface BiasPattern {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  affected_dimension?: string;
  evidence: string[];
  recommendation: string;
}

interface BiasAnalysisResult {
  patterns_detected: BiasPattern[];
  overall_risk_score: number;
  demographics_analyzed: string[];
  sample_size: number;
  confidence_score: number;
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cycle_id, company_id, analysis_type, target_id }: BiasDetectionRequest = await req.json();

    console.log(`Running bias detection for cycle ${cycle_id}, type: ${analysis_type}`);

    // Fetch feedback data for analysis
    let query = supabase
      .from('feedback_360_responses')
      .select(`
        id,
        rating_value,
        text_response,
        request:feedback_360_requests!inner(
          id,
          subject_employee_id,
          rater_id,
          rater_category_id,
          cycle_id
        )
      `)
      .eq('request.cycle_id', cycle_id);

    if (analysis_type === 'individual' && target_id) {
      query = query.eq('request.subject_employee_id', target_id);
    } else if (analysis_type === 'rater' && target_id) {
      query = query.eq('request.rater_id', target_id);
    }

    const { data: responses, error: responsesError } = await query;

    if (responsesError) {
      throw new Error(`Failed to fetch responses: ${responsesError.message}`);
    }

    if (!responses || responses.length < 5) {
      return new Response(
        JSON.stringify({
          patterns_detected: [],
          overall_risk_score: 0,
          demographics_analyzed: [],
          sample_size: responses?.length || 0,
          confidence_score: 0,
          recommendations: ['Insufficient data for bias analysis. Minimum 5 responses required.']
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for AI analysis
    const ratingsByCategory: Record<string, number[]> = {};
    responses.forEach((r: any) => {
      const category = r.request?.rater_category_id || 'unknown';
      if (!ratingsByCategory[category]) {
        ratingsByCategory[category] = [];
      }
      if (r.rating_value !== null) {
        ratingsByCategory[category].push(r.rating_value);
      }
    });

    // Calculate statistical indicators
    const stats = Object.entries(ratingsByCategory).map(([category, ratings]) => {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / ratings.length;
      return { category, avg: avg.toFixed(2), variance: variance.toFixed(2), count: ratings.length };
    });

    // Call Lovable AI for bias pattern detection
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
            content: `You are an expert in organizational psychology and bias detection in 360-degree feedback systems.
Analyze the provided rating data for potential bias patterns including:
- Leniency bias (consistently high ratings)
- Severity bias (consistently low ratings)
- Central tendency (avoiding extreme ratings)
- Halo/horn effect (similar ratings across all dimensions)
- In-group/out-group bias (rating differences by rater category)
- Recency bias (patterns suggesting recent events dominate)

Be evidence-based and avoid false positives. Only flag patterns with clear statistical evidence.
Return your analysis as valid JSON:
{
  "patterns_detected": [{"type": "string", "severity": "low|medium|high", "description": "string", "affected_dimension": "string|null", "evidence": ["string"], "recommendation": "string"}],
  "overall_risk_score": number (0-1),
  "recommendations": ["string"],
  "confidence_score": number (0-1)
}`
          },
          {
            role: 'user',
            content: `Analyze these 360 feedback statistics for bias patterns:\n\nRating Statistics by Category:\n${JSON.stringify(stats, null, 2)}\n\nTotal responses: ${responses.length}\nAnalysis type: ${analysis_type}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', await aiResponse.text());
      throw new Error('Failed to analyze bias with AI');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0]?.message?.content || '{}';
    
    let analysis: Partial<BiasAnalysisResult>;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      analysis = {
        patterns_detected: [],
        overall_risk_score: 0,
        recommendations: ['Analysis could not be completed'],
        confidence_score: 0
      };
    }

    const result: BiasAnalysisResult = {
      patterns_detected: analysis.patterns_detected || [],
      overall_risk_score: analysis.overall_risk_score || 0,
      demographics_analyzed: Object.keys(ratingsByCategory),
      sample_size: responses.length,
      confidence_score: analysis.confidence_score || 0.5,
      recommendations: analysis.recommendations || []
    };

    // Log to explainability table
    await supabase.from('ai_feedback_explainability_logs').insert({
      employee_id: target_id,
      cycle_id,
      ai_action_type: 'bias_detection',
      input_summary: { 
        analysis_type,
        sample_size: responses.length,
        categories_analyzed: Object.keys(ratingsByCategory).length
      },
      output_summary: {
        patterns_count: result.patterns_detected.length,
        risk_score: result.overall_risk_score
      },
      explanation: `Analyzed ${responses.length} responses across ${Object.keys(ratingsByCategory).length} rater categories. Found ${result.patterns_detected.length} potential bias patterns with risk score ${result.overall_risk_score.toFixed(2)}.`,
      model_version: 'google/gemini-2.5-flash',
      company_id
    });

    console.log('Bias detection complete:', {
      patterns: result.patterns_detected.length,
      risk_score: result.overall_risk_score
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in feedback-bias-detector:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
