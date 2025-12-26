import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuggestionRequest {
  sessionId: string;
  companyId: string;
  targetDistribution?: {
    exceptional: number;
    exceeds: number;
    meets: number;
    needs_improvement: number;
    unsatisfactory: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionId, companyId, targetDistribution } = await req.json() as SuggestionRequest;

    console.log('Generating calibration suggestions for session:', sessionId);

    // Default forced distribution targets (typical bell curve)
    const targets = targetDistribution || {
      exceptional: 10,    // 10% in top tier
      exceeds: 25,        // 25% exceeds expectations
      meets: 45,          // 45% meets expectations
      needs_improvement: 15, // 15% needs improvement
      unsatisfactory: 5,  // 5% unsatisfactory
    };

    // Fetch current analysis
    const { data: analysis } = await supabase
      .from('calibration_ai_analyses')
      .select('*')
      .eq('session_id', sessionId)
      .eq('analysis_type', 'pre_session')
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .single();

    if (!analysis?.distribution_analysis) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No analysis found. Run calibration-ai-analyzer first.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const current = analysis.distribution_analysis.percentages;
    const suggestions: any[] = [];

    // Calculate adjustments needed
    const adjustments = {
      exceptional: parseFloat(current.exceptional) - targets.exceptional,
      exceeds: parseFloat(current.exceeds) - targets.exceeds,
      meets: parseFloat(current.meets) - targets.meets,
      needs_improvement: parseFloat(current.needs_improvement) - targets.needs_improvement,
      unsatisfactory: parseFloat(current.unsatisfactory) - targets.unsatisfactory,
    };

    // Generate suggestions for over-represented categories
    if (adjustments.exceptional > 2) {
      suggestions.push({
        type: 'reduce_category',
        category: 'exceptional',
        currentPercent: current.exceptional,
        targetPercent: targets.exceptional,
        action: `Consider moving ${Math.ceil(adjustments.exceptional * analysis.distribution_analysis.total / 100)} employees from Exceptional to Exceeds Expectations`,
        priority: 'high',
        reasoning: 'Top ratings exceed forced distribution target. Review exceptional ratings for potential inflation.',
      });
    }

    if (adjustments.exceeds > 5) {
      suggestions.push({
        type: 'reduce_category',
        category: 'exceeds',
        currentPercent: current.exceeds,
        targetPercent: targets.exceeds,
        action: `Consider moving ${Math.ceil(adjustments.exceeds * analysis.distribution_analysis.total / 100)} employees from Exceeds to Meets Expectations`,
        priority: 'medium',
        reasoning: 'Exceeds Expectations category is over-represented compared to target distribution.',
      });
    }

    if (adjustments.meets < -10) {
      suggestions.push({
        type: 'increase_category',
        category: 'meets',
        currentPercent: current.meets,
        targetPercent: targets.meets,
        action: `The Meets Expectations category is under-represented. Consider recalibrating ratings from adjacent categories.`,
        priority: 'medium',
        reasoning: 'A healthy organization typically has most employees meeting expectations.',
      });
    }

    // Generate individual employee suggestions from anomalies
    const anomalies = analysis.suggested_adjustments?.anomalies || [];
    
    for (const anomaly of anomalies) {
      if (anomaly.type === 'rating_gap') {
        suggestions.push({
          type: 'review_individual',
          employeeId: anomaly.employeeId,
          employeeName: anomaly.employeeName,
          action: `Review rating discrepancy: Self (${anomaly.selfRating}) vs Manager (${anomaly.managerRating})`,
          priority: anomaly.severity === 'high' ? 'high' : 'medium',
          reasoning: 'Large gap between self and manager rating may indicate miscommunication or bias.',
          suggestedScore: ((parseFloat(anomaly.selfRating) + parseFloat(anomaly.managerRating)) / 2).toFixed(2),
        });
      }
      
      if (anomaly.type === 'extreme_rating') {
        const direction = parseFloat(anomaly.finalScore) > 4 ? 'down' : 'up';
        suggestions.push({
          type: 'adjust_extreme',
          employeeId: anomaly.employeeId,
          employeeName: anomaly.employeeName,
          currentScore: anomaly.finalScore,
          action: `Consider adjusting extreme rating ${direction}`,
          priority: anomaly.severity === 'high' ? 'high' : 'medium',
          reasoning: `Extreme ratings require strong justification. Current score: ${anomaly.finalScore}`,
          suggestedScore: direction === 'down' ? '4.00' : '2.00',
        });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    suggestions.sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 3));

    console.log(`Generated ${suggestions.length} suggestions`);

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        targetDistribution: targets,
        currentDistribution: current,
        adjustmentsNeeded: adjustments,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Calibration suggestion error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
