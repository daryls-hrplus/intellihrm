import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClusteringRequest {
  cycle_id: string;
  company_id: string;
  scope: 'cycle' | 'department' | 'company';
  scope_id?: string;
  min_cluster_size?: number;
}

interface ThemeCluster {
  id: string;
  theme_name: string;
  theme_description: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  response_count: number;
  affected_employees: number;
  prevalence_percentage: number;
  representative_quotes: string[];
  related_signals: string[];
  actionability: 'high' | 'medium' | 'low';
  recommended_actions: string[];
}

interface ClusteringResult {
  clusters: ThemeCluster[];
  total_responses_analyzed: number;
  clustering_confidence: number;
  org_level_insights: {
    top_positive_themes: string[];
    top_concern_themes: string[];
    emerging_patterns: string[];
  };
  computed_at: string;
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
      cycle_id, 
      company_id, 
      scope = 'cycle',
      scope_id,
      min_cluster_size = 3
    }: ClusteringRequest = await req.json();

    console.log(`Clustering themes for ${scope} in cycle ${cycle_id}`);

    // Fetch text responses based on scope
    let query = supabase
      .from('feedback_360_responses')
      .select(`
        id,
        text_response,
        rating_value,
        request:feedback_360_requests!inner(
          subject_employee_id,
          cycle_id,
          rater_category_id
        )
      `)
      .eq('request.cycle_id', cycle_id)
      .not('text_response', 'is', null);

    const { data: responses, error: responsesError } = await query;

    if (responsesError) {
      throw new Error(`Failed to fetch responses: ${responsesError.message}`);
    }

    // Filter to only responses with meaningful text
    const textResponses = (responses || []).filter((r: any) => 
      r.text_response && r.text_response.trim().length > 10
    );

    if (textResponses.length < min_cluster_size) {
      return new Response(
        JSON.stringify({
          clusters: [],
          total_responses_analyzed: textResponses.length,
          clustering_confidence: 0,
          org_level_insights: {
            top_positive_themes: [],
            top_concern_themes: [],
            emerging_patterns: []
          },
          computed_at: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for AI clustering
    const feedbackTexts = textResponses.map((r: any) => ({
      id: r.id,
      text: r.text_response,
      rating: r.rating_value,
      employee_id: r.request?.subject_employee_id
    }));

    // Count unique employees
    const uniqueEmployees = new Set(feedbackTexts.map((f: any) => f.employee_id)).size;

    // Call Lovable AI for theme clustering
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
            content: `You are an expert organizational psychologist specializing in qualitative feedback analysis and theme extraction.

Analyze the provided 360 feedback comments and identify recurring themes. Group similar feedback into coherent clusters.

For each theme cluster:
1. Give it a clear, descriptive name
2. Classify sentiment (positive/neutral/negative/mixed)
3. Identify representative quotes (max 3, anonymized)
4. Map to relevant talent signals (leadership, collaboration, technical, communication, values, innovation, customer_focus, adaptability)
5. Assess actionability (high/medium/low)
6. Suggest specific recommended actions

Return your analysis as valid JSON:
{
  "clusters": [
    {
      "id": "string (unique)",
      "theme_name": "string",
      "theme_description": "string",
      "sentiment": "positive|neutral|negative|mixed",
      "response_count": number,
      "prevalence_percentage": number,
      "representative_quotes": ["string (anonymized)"],
      "related_signals": ["string"],
      "actionability": "high|medium|low",
      "recommended_actions": ["string"]
    }
  ],
  "org_level_insights": {
    "top_positive_themes": ["string"],
    "top_concern_themes": ["string"],
    "emerging_patterns": ["string"]
  },
  "clustering_confidence": number (0-1)
}`
          },
          {
            role: 'user',
            content: `Analyze and cluster these ${feedbackTexts.length} feedback comments from ${uniqueEmployees} employees:

${feedbackTexts.map((f: any, i: number) => `[${i + 1}] (Rating: ${f.rating || 'N/A'}) "${f.text}"`).join('\n\n')}`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', await aiResponse.text());
      throw new Error('Failed to cluster themes with AI');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0]?.message?.content || '{}';
    
    let analysis: any;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      analysis = { clusters: [], org_level_insights: {}, clustering_confidence: 0 };
    }

    // Enrich clusters with computed fields
    const enrichedClusters: ThemeCluster[] = (analysis.clusters || []).map((cluster: any) => ({
      id: cluster.id || crypto.randomUUID(),
      theme_name: cluster.theme_name || 'Unnamed Theme',
      theme_description: cluster.theme_description || '',
      sentiment: cluster.sentiment || 'neutral',
      response_count: cluster.response_count || 0,
      affected_employees: Math.ceil((cluster.prevalence_percentage || 0) / 100 * uniqueEmployees),
      prevalence_percentage: cluster.prevalence_percentage || 0,
      representative_quotes: cluster.representative_quotes || [],
      related_signals: cluster.related_signals || [],
      actionability: cluster.actionability || 'medium',
      recommended_actions: cluster.recommended_actions || []
    }));

    const result: ClusteringResult = {
      clusters: enrichedClusters,
      total_responses_analyzed: textResponses.length,
      clustering_confidence: analysis.clustering_confidence || 0.5,
      org_level_insights: {
        top_positive_themes: analysis.org_level_insights?.top_positive_themes || [],
        top_concern_themes: analysis.org_level_insights?.top_concern_themes || [],
        emerging_patterns: analysis.org_level_insights?.emerging_patterns || []
      },
      computed_at: new Date().toISOString()
    };

    // Log to explainability table
    await supabase.from('ai_feedback_explainability_logs').insert({
      cycle_id,
      ai_action_type: 'theme_clustering',
      input_summary: { 
        scope,
        response_count: textResponses.length,
        unique_employees: uniqueEmployees
      },
      output_summary: {
        clusters_found: enrichedClusters.length,
        positive_themes: result.org_level_insights.top_positive_themes.length,
        concern_themes: result.org_level_insights.top_concern_themes.length
      },
      explanation: `Clustered ${textResponses.length} responses from ${uniqueEmployees} employees into ${enrichedClusters.length} theme groups. Found ${result.org_level_insights.top_positive_themes.length} positive themes and ${result.org_level_insights.top_concern_themes.length} areas of concern.`,
      model_version: 'google/gemini-2.5-flash',
      company_id
    });

    console.log('Theme clustering complete:', {
      clusters: enrichedClusters.length,
      responses: textResponses.length
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in feedback-theme-clusterer:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
