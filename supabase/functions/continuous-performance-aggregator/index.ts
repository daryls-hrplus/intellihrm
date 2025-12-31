import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AggregatorRequest {
  action: 'aggregate_signals' | 'calculate_trajectory' | 'generate_intervention_prompts' | 'get_employee_trajectory';
  employeeId?: string;
  companyId: string;
  managerId?: string;
  signalData?: {
    type: string;
    value: number;
    sentiment?: string;
    sourceId?: string;
    sourceTable?: string;
  };
}

interface TrajectoryScore {
  score: number;
  momentum: 'accelerating' | 'stable' | 'decelerating';
  trendDirection: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  contributingFactors: Array<{ signalType: string; contribution: number; recentEvents: number }>;
  interventionRecommended: boolean;
  interventionType?: string;
}

// Signal weights for trajectory calculation
const SIGNAL_WEIGHTS = {
  goal_progress: 0.25,
  feedback: 0.20,
  training: 0.15,
  recognition: 0.15,
  check_in: 0.10,
  project: 0.10,
  skill_validation: 0.05
};

// Intervention thresholds
const INTERVENTION_THRESHOLDS = {
  critical: { score: 30, riskLevel: 'critical', type: 'pip' },
  high: { score: 45, riskLevel: 'high', type: 'support' },
  medium: { score: 60, riskLevel: 'medium', type: 'coaching' },
  recognition: { score: 85, riskLevel: 'low', type: 'recognition' }
};

async function getRecentSignals(supabase: any, employeeId: string, daysBack: number = 90): Promise<any[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  const { data: signals, error } = await supabase
    .from('continuous_performance_signals')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('captured_at', cutoffDate.toISOString())
    .order('captured_at', { ascending: false });
  
  if (error) {
    console.error('[continuous-performance-aggregator] Error fetching signals:', error);
    return [];
  }
  
  return signals || [];
}

function calculateWeightedScore(signals: any[]): number {
  if (signals.length === 0) return 50; // Default neutral score
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  // Apply recency weighting - more recent signals count more
  const now = new Date().getTime();
  const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
  
  for (const signal of signals) {
    const signalAge = now - new Date(signal.captured_at).getTime();
    const recencyWeight = Math.max(0.3, 1 - (signalAge / maxAge) * 0.7); // 30% minimum weight
    
    const typeWeight = SIGNAL_WEIGHTS[signal.signal_type as keyof typeof SIGNAL_WEIGHTS] || 0.1;
    const combinedWeight = typeWeight * recencyWeight * (signal.signal_weight || 1);
    
    totalWeight += combinedWeight;
    weightedSum += (signal.signal_value || 50) * combinedWeight;
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 50;
}

function calculateMomentum(signals: any[]): 'accelerating' | 'stable' | 'decelerating' {
  if (signals.length < 5) return 'stable';
  
  // Compare recent signals (last 30 days) vs older signals (30-90 days)
  const now = new Date().getTime();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  const recentSignals = signals.filter(s => new Date(s.captured_at).getTime() > thirtyDaysAgo);
  const olderSignals = signals.filter(s => new Date(s.captured_at).getTime() <= thirtyDaysAgo);
  
  if (recentSignals.length < 2 || olderSignals.length < 2) return 'stable';
  
  const recentAvg = recentSignals.reduce((sum, s) => sum + (s.signal_value || 50), 0) / recentSignals.length;
  const olderAvg = olderSignals.reduce((sum, s) => sum + (s.signal_value || 50), 0) / olderSignals.length;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 10) return 'accelerating';
  if (diff < -10) return 'decelerating';
  return 'stable';
}

function calculateTrendDirection(signals: any[]): 'improving' | 'stable' | 'declining' {
  if (signals.length < 3) return 'stable';
  
  // Simple linear regression on the last 10 signals
  const recentSignals = signals.slice(0, 10);
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  const n = recentSignals.length;
  
  recentSignals.forEach((signal, i) => {
    sumX += i;
    sumY += signal.signal_value || 50;
    sumXY += i * (signal.signal_value || 50);
    sumX2 += i * i;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Positive slope = improving (note: index 0 is most recent)
  if (slope < -2) return 'improving';
  if (slope > 2) return 'declining';
  return 'stable';
}

function determineRiskLevel(score: number, trendDirection: string, momentum: string): 'low' | 'medium' | 'high' | 'critical' {
  if (score < INTERVENTION_THRESHOLDS.critical.score) return 'critical';
  if (score < INTERVENTION_THRESHOLDS.high.score) return 'high';
  if (score < INTERVENTION_THRESHOLDS.medium.score) {
    // Medium risk elevated to high if declining
    if (trendDirection === 'declining' && momentum === 'decelerating') return 'high';
    return 'medium';
  }
  return 'low';
}

function determineIntervention(score: number, riskLevel: string, trendDirection: string): { recommended: boolean; type?: string } {
  if (riskLevel === 'critical') return { recommended: true, type: 'pip' };
  if (riskLevel === 'high') return { recommended: true, type: 'support' };
  if (riskLevel === 'medium' && trendDirection === 'declining') return { recommended: true, type: 'coaching' };
  if (score >= INTERVENTION_THRESHOLDS.recognition.score && trendDirection === 'improving') {
    return { recommended: true, type: 'recognition' };
  }
  return { recommended: false };
}

function getContributingFactors(signals: any[]): TrajectoryScore['contributingFactors'] {
  const factors: Record<string, { total: number; count: number }> = {};
  
  for (const signal of signals) {
    const type = signal.signal_type;
    if (!factors[type]) {
      factors[type] = { total: 0, count: 0 };
    }
    factors[type].total += signal.signal_value || 50;
    factors[type].count += 1;
  }
  
  return Object.entries(factors).map(([signalType, data]) => ({
    signalType,
    contribution: data.total / data.count,
    recentEvents: data.count
  })).sort((a, b) => b.recentEvents - a.recentEvents);
}

async function calculateTrajectory(supabase: any, employeeId: string, companyId: string): Promise<TrajectoryScore> {
  const signals = await getRecentSignals(supabase, employeeId);
  
  const score = calculateWeightedScore(signals);
  const momentum = calculateMomentum(signals);
  const trendDirection = calculateTrendDirection(signals);
  const riskLevel = determineRiskLevel(score, trendDirection, momentum);
  const intervention = determineIntervention(score, riskLevel, trendDirection);
  const contributingFactors = getContributingFactors(signals);
  
  const trajectory: TrajectoryScore = {
    score,
    momentum,
    trendDirection,
    riskLevel,
    contributingFactors,
    interventionRecommended: intervention.recommended,
    interventionType: intervention.type
  };
  
  // Store the trajectory score
  await supabase.from('performance_trajectory_scores').insert({
    employee_id: employeeId,
    company_id: companyId,
    trajectory_score: trajectory.score,
    momentum: trajectory.momentum,
    trend_direction: trajectory.trendDirection,
    contributing_factors: trajectory.contributingFactors,
    risk_level: trajectory.riskLevel,
    intervention_recommended: trajectory.interventionRecommended,
    intervention_type: trajectory.interventionType,
    data_freshness_days: signals.length > 0 
      ? Math.floor((new Date().getTime() - new Date(signals[0].captured_at).getTime()) / (1000 * 60 * 60 * 24))
      : null,
    minimum_signals_met: signals.length >= 5,
    calculated_at: new Date().toISOString()
  });
  
  return trajectory;
}

async function generateInterventionPrompts(
  supabase: any,
  companyId: string,
  managerId: string
): Promise<any[]> {
  // Get all direct reports
  const { data: directReports } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('manager_id', managerId)
    .eq('company_id', companyId);
  
  if (!directReports || directReports.length === 0) return [];
  
  const prompts: any[] = [];
  
  for (const employee of directReports) {
    const trajectory = await calculateTrajectory(supabase, employee.id, companyId);
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    
    if (!trajectory.interventionRecommended) continue;
    
    let promptType: string;
    let promptTitle: string;
    let promptMessage: string;
    let suggestedActions: string[];
    let priority: string;
    
    switch (trajectory.interventionType) {
      case 'pip':
        promptType = 'concern';
        promptTitle = `Performance Concern: ${employeeName}`;
        promptMessage = `${employeeName}'s performance trajectory indicates significant challenges. Consider scheduling a focused discussion.`;
        suggestedActions = [
          'Schedule a private 1:1 meeting',
          'Review recent performance data together',
          'Develop a structured improvement plan',
          'Connect with HR for support resources'
        ];
        priority = 'urgent';
        break;
        
      case 'support':
        promptType = 'concern';
        promptTitle = `Support Needed: ${employeeName}`;
        promptMessage = `${employeeName} may benefit from additional support. Their recent trajectory shows room for growth.`;
        suggestedActions = [
          'Check in on current workload and challenges',
          'Identify specific skill gaps to address',
          'Consider mentoring or coaching resources',
          'Set clear short-term goals'
        ];
        priority = 'high';
        break;
        
      case 'coaching':
        promptType = 'coaching';
        promptTitle = `Coaching Opportunity: ${employeeName}`;
        promptMessage = `${employeeName} could benefit from targeted coaching to maintain positive momentum.`;
        suggestedActions = [
          'Schedule a developmental conversation',
          'Discuss career growth opportunities',
          'Provide specific feedback on recent work',
          'Identify stretch assignments'
        ];
        priority = 'medium';
        break;
        
      case 'recognition':
        promptType = 'recognition';
        promptTitle = `Recognize Achievement: ${employeeName}`;
        promptMessage = `${employeeName} has shown excellent performance. Consider recognizing their contributions.`;
        suggestedActions = [
          'Provide specific praise in your next 1:1',
          'Nominate for team recognition',
          'Consider for high-visibility project',
          'Discuss promotion readiness'
        ];
        priority = 'medium';
        break;
        
      default:
        promptType = 'check_in';
        promptTitle = `Check In: ${employeeName}`;
        promptMessage = `Consider a brief check-in with ${employeeName}.`;
        suggestedActions = ['Schedule a quick catch-up'];
        priority = 'low';
    }
    
    // Store the prompt
    const { data: storedPrompt } = await supabase
      .from('manager_intervention_prompts')
      .insert({
        manager_id: managerId,
        employee_id: employee.id,
        company_id: companyId,
        prompt_type: promptType,
        prompt_title: promptTitle,
        prompt_message: promptMessage,
        suggested_actions: suggestedActions,
        priority,
        trigger_source: 'trajectory_analysis'
      })
      .select()
      .single();
    
    if (storedPrompt) {
      prompts.push({
        ...storedPrompt,
        employeeName,
        trajectoryScore: trajectory.score,
        riskLevel: trajectory.riskLevel
      });
    }
  }
  
  return prompts;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: AggregatorRequest = await req.json();
    const { action, employeeId, companyId, managerId, signalData } = request;

    console.log(`[continuous-performance-aggregator] Action: ${action}`);

    switch (action) {
      case 'aggregate_signals':
        if (!employeeId || !signalData) {
          return new Response(
            JSON.stringify({ error: 'employeeId and signalData required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: signal, error: signalError } = await supabase
          .from('continuous_performance_signals')
          .insert({
            employee_id: employeeId,
            company_id: companyId,
            signal_type: signalData.type,
            signal_value: signalData.value,
            signal_sentiment: signalData.sentiment,
            signal_source_id: signalData.sourceId,
            signal_source_table: signalData.sourceTable
          })
          .select()
          .single();
        
        if (signalError) {
          console.error('[continuous-performance-aggregator] Signal insert error:', signalError);
          return new Response(
            JSON.stringify({ error: signalError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true, signal }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'calculate_trajectory':
        if (!employeeId) {
          return new Response(
            JSON.stringify({ error: 'employeeId required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const trajectory = await calculateTrajectory(supabase, employeeId, companyId);
        
        // Log to explainability
        await supabase.from('ai_explainability_records').insert({
          company_id: companyId,
          insight_type: 'trajectory',
          source_data_summary: trajectory.contributingFactors.map(f => ({
            data_type: f.signalType,
            record_count: f.recentEvents,
            date_range: 'last_90_days'
          })),
          weights_applied: Object.entries(SIGNAL_WEIGHTS).map(([type, weight]) => ({
            factor: type,
            weight,
            contribution: weight * 100
          })),
          confidence_score: trajectory.contributingFactors.reduce((sum, f) => sum + f.recentEvents, 0) >= 10 ? 0.85 : 0.65,
          confidence_factors: [
            { factor: 'data_volume', impact: trajectory.contributingFactors.reduce((sum, f) => sum + f.recentEvents, 0) >= 10 ? 'high' : 'low' },
            { factor: 'recency', impact: 'medium' }
          ],
          model_version: 'hrplus-trajectory-v1',
          model_provider: 'HRplus',
          iso_compliance_verified: true,
          human_review_required: trajectory.riskLevel === 'critical' || trajectory.riskLevel === 'high'
        });
        
        return new Response(
          JSON.stringify({ trajectory }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'generate_intervention_prompts':
        if (!managerId) {
          return new Response(
            JSON.stringify({ error: 'managerId required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const prompts = await generateInterventionPrompts(supabase, companyId, managerId);
        
        console.log(`[continuous-performance-aggregator] Generated ${prompts.length} intervention prompts for manager ${managerId}`);
        
        return new Response(
          JSON.stringify({ prompts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'get_employee_trajectory':
        if (!employeeId) {
          return new Response(
            JSON.stringify({ error: 'employeeId required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: latestTrajectory } = await supabase
          .from('performance_trajectory_scores')
          .select('*')
          .eq('employee_id', employeeId)
          .order('calculated_at', { ascending: false })
          .limit(1)
          .single();
        
        // Get trajectory history for chart
        const { data: trajectoryHistory } = await supabase
          .from('performance_trajectory_scores')
          .select('trajectory_score, calculated_at, trend_direction, risk_level')
          .eq('employee_id', employeeId)
          .order('calculated_at', { ascending: false })
          .limit(12);
        
        return new Response(
          JSON.stringify({ 
            current: latestTrajectory,
            history: trajectoryHistory || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: any) {
    console.error('[continuous-performance-aggregator] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
