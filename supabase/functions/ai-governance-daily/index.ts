import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailyMetrics {
  total_interactions: number;
  high_risk_interactions: number;
  avg_risk_score: number;
  avg_confidence_score: number;
  human_reviews_required: number;
  human_reviews_completed: number;
  bias_incidents_detected: number;
  overrides_count: number;
  compliance_rate: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting daily AI governance aggregation...');
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // Get all companies with AI governance enabled
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name');

    if (companyError) {
      console.error('Error fetching companies:', companyError);
      throw companyError;
    }

    const results = [];

    for (const company of companies || []) {
      console.log(`Processing company: ${company.name} (${company.id})`);

      // Aggregate risk assessments for yesterday
      const { data: riskData, error: riskError } = await supabase
        .from('ai_risk_assessments')
        .select('risk_score, human_review_required, human_review_completed')
        .eq('company_id', company.id)
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`);

      if (riskError) {
        console.error(`Error fetching risk data for ${company.id}:`, riskError);
        continue;
      }

      // Aggregate bias incidents
      const { data: biasData, error: biasError } = await supabase
        .from('ai_bias_incidents')
        .select('id, severity')
        .eq('company_id', company.id)
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`);

      if (biasError) {
        console.error(`Error fetching bias data for ${company.id}:`, biasError);
        continue;
      }

      // Aggregate human overrides
      const { data: overrideData, error: overrideError } = await supabase
        .from('ai_human_overrides')
        .select('id')
        .eq('company_id', company.id)
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`);

      if (overrideError) {
        console.error(`Error fetching override data for ${company.id}:`, overrideError);
        continue;
      }

      // Aggregate interaction logs
      const { data: interactionData, error: interactionError } = await supabase
        .from('ai_interaction_logs')
        .select('id')
        .eq('company_id', company.id)
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`);

      if (interactionError) {
        console.error(`Error fetching interaction data for ${company.id}:`, interactionError);
        continue;
      }

      // Aggregate explainability logs for confidence scores
      const { data: explainData, error: explainError } = await supabase
        .from('ai_explainability_logs')
        .select('confidence_score')
        .eq('company_id', company.id)
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`);

      if (explainError) {
        console.error(`Error fetching explainability data for ${company.id}:`, explainError);
        continue;
      }

      // Calculate metrics
      const totalInteractions = interactionData?.length || 0;
      const riskScores = (riskData || []).map(r => r.risk_score || 0);
      const avgRiskScore = riskScores.length > 0 
        ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length 
        : 0;
      
      const highRiskCount = riskScores.filter(s => s >= 70).length;
      const reviewsRequired = (riskData || []).filter(r => r.human_review_required).length;
      const reviewsCompleted = (riskData || []).filter(r => r.human_review_completed).length;
      
      const confidenceScores = (explainData || [])
        .map(e => e.confidence_score)
        .filter((s): s is number => s !== null);
      const avgConfidence = confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0;

      const complianceRate = reviewsRequired > 0 
        ? (reviewsCompleted / reviewsRequired) * 100 
        : 100;

      const metrics: DailyMetrics = {
        total_interactions: totalInteractions,
        high_risk_interactions: highRiskCount,
        avg_risk_score: Math.round(avgRiskScore * 100) / 100,
        avg_confidence_score: Math.round(avgConfidence * 100) / 100,
        human_reviews_required: reviewsRequired,
        human_reviews_completed: reviewsCompleted,
        bias_incidents_detected: biasData?.length || 0,
        overrides_count: overrideData?.length || 0,
        compliance_rate: Math.round(complianceRate * 100) / 100
      };

      // Store daily metrics
      const { error: insertError } = await supabase
        .from('ai_governance_metrics')
        .insert({
          company_id: company.id,
          metric_date: dateStr,
          metric_type: 'daily',
          ...metrics
        });

      if (insertError) {
        console.error(`Error inserting metrics for ${company.id}:`, insertError);
        continue;
      }

      console.log(`Daily metrics stored for ${company.name}:`, metrics);
      results.push({ company_id: company.id, company_name: company.name, metrics });

      // Check for alert conditions
      if (highRiskCount > 0 && reviewsCompleted < reviewsRequired) {
        console.log(`ALERT: ${company.name} has ${reviewsRequired - reviewsCompleted} pending high-risk reviews`);
        
        // Create reminder for pending reviews
        await supabase.from('employee_reminders').insert({
          company_id: company.id,
          reminder_type: 'ai_pending_review',
          title: 'Pending AI Risk Reviews',
          description: `There are ${reviewsRequired - reviewsCompleted} high-risk AI interactions pending human review`,
          priority: 'high',
          due_date: new Date().toISOString(),
          status: 'pending'
        });
      }

      if ((biasData?.length || 0) > 0) {
        console.log(`ALERT: ${company.name} has ${biasData?.length} new bias incidents`);
      }
    }

    console.log('Daily AI governance aggregation completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        date: dateStr,
        companies_processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in daily AI governance aggregation:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
