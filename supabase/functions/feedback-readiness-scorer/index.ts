import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReadinessScorerRequest {
  action: 'compute_indicators' | 'get_employee_indicators' | 'get_org_summary';
  employee_id?: string;
  company_id: string;
  indicator_codes?: string[];
}

interface IndicatorScore {
  indicator_id: string;
  code: string;
  name: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  explanation: string;
  factors: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, employee_id, company_id, indicator_codes }: ReadinessScorerRequest = await req.json();

    console.log(`[feedback-readiness-scorer] Action: ${action}, Company: ${company_id}`);

    if (!company_id) {
      return new Response(
        JSON.stringify({ error: 'company_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch indicator definitions
    let indicatorQuery = supabase
      .from('talent_indicator_definitions')
      .select('*')
      .eq('is_active', true)
      .or(`company_id.is.null,company_id.eq.${company_id}`);

    if (indicator_codes && indicator_codes.length > 0) {
      indicatorQuery = indicatorQuery.in('code', indicator_codes);
    }

    const { data: definitions, error: defsError } = await indicatorQuery;

    if (defsError) {
      throw new Error(`Failed to fetch indicator definitions: ${defsError.message}`);
    }

    if (action === 'compute_indicators' && employee_id) {
      // Fetch all relevant data for the employee
      const [signalsRes, appraisalsRes, goalsRes, learningRes] = await Promise.all([
        supabase
          .from('talent_signal_snapshots')
          .select('*, signal_definition:talent_signal_definitions(*)')
          .eq('employee_id', employee_id)
          .eq('is_current', true),
        supabase
          .from('appraisal_participants')
          .select('*, cycle:appraisal_cycles(*)')
          .eq('employee_id', employee_id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('goals')
          .select('*')
          .eq('employee_id', employee_id)
          .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('learning_enrollments')
          .select('*, program:learning_programs(*)')
          .eq('employee_id', employee_id)
          .gte('enrolled_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const signals = signalsRes.data || [];
      const appraisals = appraisalsRes.data || [];
      const goals = goalsRes.data || [];
      const learning = learningRes.data || [];

      const indicatorScores: IndicatorScore[] = [];

      for (const definition of definitions || []) {
        let score = 0;
        let confidence = 0;
        const factors: Record<string, any> = {};

        switch (definition.code) {
          case 'flight_risk':
            // Calculate flight risk based on tenure, recent ratings, engagement signals
            const avgSignalScore = signals.length > 0
              ? signals.reduce((sum, s) => sum + (s.signal_value || 0), 0) / signals.length
              : 50;
            const recentRating = appraisals[0]?.final_rating || 3;
            const goalCompletion = goals.filter(g => g.status === 'completed').length / Math.max(goals.length, 1);
            
            // Higher score = higher risk
            score = 100 - (avgSignalScore * 0.4 + recentRating * 15 + goalCompletion * 30);
            confidence = Math.min(1, (signals.length + appraisals.length) / 10);
            factors.avg_signal_score = avgSignalScore;
            factors.recent_rating = recentRating;
            factors.goal_completion_rate = goalCompletion;
            break;

          case 'leadership_readiness':
            // Based on leadership signals and development progress
            const leadershipSignals = signals.filter(s => 
              ['leadership_consistency', 'people_leadership', 'strategic_thinking', 'influence'].includes(s.signal_definition?.code || '')
            );
            const leadershipAvg = leadershipSignals.length > 0
              ? leadershipSignals.reduce((sum, s) => sum + (s.signal_value || 0), 0) / leadershipSignals.length
              : 0;
            const leadershipLearning = learning.filter(l => 
              l.program?.category?.toLowerCase().includes('leadership')
            ).length;
            
            score = leadershipAvg * 0.7 + Math.min(30, leadershipLearning * 10);
            confidence = leadershipSignals.length > 0 ? Math.min(1, leadershipSignals.length / 4) : 0.3;
            factors.leadership_signal_avg = leadershipAvg;
            factors.leadership_programs_completed = leadershipLearning;
            break;

          case 'succession_readiness':
            // Overall readiness for promotion/succession
            const allSignalsAvg = signals.length > 0
              ? signals.reduce((sum, s) => sum + (s.signal_value || 0), 0) / signals.length
              : 0;
            const performanceTrend = appraisals.length >= 2
              ? (appraisals[0]?.final_rating || 3) - (appraisals[1]?.final_rating || 3)
              : 0;
            const learningProgress = learning.filter(l => l.status === 'completed').length / Math.max(learning.length, 1);
            
            score = allSignalsAvg * 0.5 + (performanceTrend + 1) * 15 + learningProgress * 20;
            confidence = Math.min(1, (signals.length + appraisals.length + learning.length) / 15);
            factors.signal_average = allSignalsAvg;
            factors.performance_trend = performanceTrend > 0 ? 'improving' : performanceTrend < 0 ? 'declining' : 'stable';
            factors.learning_completion_rate = learningProgress;
            break;

          case 'engagement_level':
            // Engagement based on participation and sentiment
            const collaborationSignals = signals.filter(s =>
              ['collaboration', 'teamwork'].includes(s.signal_definition?.code || '')
            );
            const collabAvg = collaborationSignals.length > 0
              ? collaborationSignals.reduce((sum, s) => sum + (s.signal_value || 0), 0) / collaborationSignals.length
              : 50;
            const activeGoals = goals.filter(g => ['in_progress', 'on_track'].includes(g.status || '')).length;
            
            score = collabAvg * 0.6 + Math.min(40, activeGoals * 10);
            confidence = collaborationSignals.length > 0 ? 0.7 : 0.4;
            factors.collaboration_score = collabAvg;
            factors.active_goals = activeGoals;
            break;

          default:
            // Generic calculation
            score = signals.length > 0
              ? signals.reduce((sum, s) => sum + (s.signal_value || 0), 0) / signals.length
              : 0;
            confidence = 0.5;
        }

        // Determine level based on thresholds
        const thresholds = definition.threshold_levels || { low: 30, medium: 60, high: 80 };
        let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (score >= thresholds.high) level = 'high';
        else if (score >= thresholds.medium) level = 'medium';
        else if (score < thresholds.low && definition.code === 'flight_risk') level = 'critical';

        // Generate explanation
        let explanation = '';
        if (definition.code === 'flight_risk') {
          explanation = score > 70 ? 'High flight risk - immediate attention recommended' :
                       score > 40 ? 'Moderate flight risk - monitor engagement' :
                       'Low flight risk - employee appears engaged';
        } else if (definition.code === 'leadership_readiness') {
          explanation = score > 80 ? 'Ready for leadership role' :
                       score > 60 ? 'Developing leadership capabilities' :
                       'Needs more development before leadership role';
        } else if (definition.code === 'succession_readiness') {
          explanation = score > 80 ? 'Ready now for next level' :
                       score > 60 ? 'Ready in 1-2 years' :
                       'Needs significant development';
        } else {
          explanation = `Score: ${score.toFixed(1)}% based on available data`;
        }

        indicatorScores.push({
          indicator_id: definition.id,
          code: definition.code,
          name: definition.name,
          score: parseFloat(score.toFixed(1)),
          level,
          confidence: parseFloat(confidence.toFixed(2)),
          explanation,
          factors
        });

        // Save to database
        await supabase.from('talent_indicator_scores').upsert({
          employee_id,
          indicator_id: definition.id,
          score: parseFloat(score.toFixed(1)),
          level,
          confidence: parseFloat(confidence.toFixed(2)),
          explanation,
          explanation_factors: factors,
          computed_at: new Date().toISOString(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }, {
          onConflict: 'employee_id,indicator_id'
        });
      }

      return new Response(
        JSON.stringify({
          employee_id,
          indicators: indicatorScores,
          computed_at: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_employee_indicators' && employee_id) {
      const { data: scores, error } = await supabase
        .from('talent_indicator_scores')
        .select('*, indicator:talent_indicator_definitions(*)')
        .eq('employee_id', employee_id)
        .gte('valid_until', new Date().toISOString());

      if (error) throw error;

      return new Response(
        JSON.stringify({ employee_id, indicators: scores || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_org_summary') {
      // Get aggregated indicator data across org
      const { data: scores, error } = await supabase
        .from('talent_indicator_scores')
        .select('*, indicator:talent_indicator_definitions(*), employee:profiles(department_id)')
        .gte('valid_until', new Date().toISOString());

      if (error) throw error;

      // Aggregate by indicator
      const byIndicator: Record<string, { scores: number[]; levels: Record<string, number> }> = {};
      for (const score of scores || []) {
        const code = score.indicator?.code || 'unknown';
        if (!byIndicator[code]) {
          byIndicator[code] = { scores: [], levels: { low: 0, medium: 0, high: 0, critical: 0 } };
        }
        byIndicator[code].scores.push(score.score);
        byIndicator[code].levels[score.level]++;
      }

      const summary = Object.entries(byIndicator).map(([code, data]) => ({
        code,
        avg_score: data.scores.length > 0 
          ? parseFloat((data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1))
          : 0,
        employee_count: data.scores.length,
        level_distribution: data.levels
      }));

      return new Response(
        JSON.stringify({ summary, total_employees: new Set((scores || []).map(s => s.employee_id)).size }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[feedback-readiness-scorer] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
