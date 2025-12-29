import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmployeeRiskData {
  employee_id: string;
  employee_name: string;
  department_id: string;
  performance_scores: number[];
  goal_completion_rate: number;
  engagement_score?: number;
  tenure_months: number;
  last_promotion_months?: number;
  training_hours?: number;
  is_succession_candidate: boolean;
}

interface RiskAssessment {
  risk_category: 'flight_risk' | 'performance_decline' | 'disengagement' | 'skill_gap' | 'burnout';
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  contributing_factors: string[];
  recommended_interventions: string[];
  trend_direction: 'improving' | 'stable' | 'declining';
}

function calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function analyzeFlightRisk(data: EmployeeRiskData): RiskAssessment {
  let riskScore = 0;
  const factors: string[] = [];
  const interventions: string[] = [];

  // Tenure analysis
  if (data.tenure_months >= 24 && data.tenure_months <= 36) {
    riskScore += 15;
    factors.push('In typical "flight window" (2-3 years tenure)');
  }

  // Promotion stagnation
  if (data.last_promotion_months && data.last_promotion_months > 24) {
    riskScore += 20;
    factors.push(`No promotion in ${Math.floor(data.last_promotion_months / 12)} years`);
    interventions.push('Schedule career development discussion');
  }

  // High performer without growth
  if (data.performance_scores.length > 0) {
    const avgScore = data.performance_scores.reduce((a, b) => a + b, 0) / data.performance_scores.length;
    if (avgScore > 4 && data.last_promotion_months && data.last_promotion_months > 18) {
      riskScore += 25;
      factors.push('High performer without recent advancement');
      interventions.push('Consider stretch assignments or leadership opportunities');
    }
  }

  // Succession candidate risk
  if (data.is_succession_candidate) {
    riskScore += 10;
    factors.push('Key succession candidate');
    interventions.push('Ensure retention plan is in place');
  }

  // Low engagement
  if (data.engagement_score && data.engagement_score < 3) {
    riskScore += 20;
    factors.push('Low engagement scores');
    interventions.push('Schedule 1:1 to understand concerns');
  }

  return {
    risk_category: 'flight_risk',
    risk_score: Math.min(riskScore, 100),
    risk_level: calculateRiskLevel(riskScore),
    contributing_factors: factors,
    recommended_interventions: interventions,
    trend_direction: 'stable'
  };
}

function analyzePerformanceDecline(data: EmployeeRiskData): RiskAssessment {
  let riskScore = 0;
  const factors: string[] = [];
  const interventions: string[] = [];
  let trendDirection: 'improving' | 'stable' | 'declining' = 'stable';

  if (data.performance_scores.length >= 2) {
    const recent = data.performance_scores.slice(-2);
    const older = data.performance_scores.slice(0, -2);
    
    if (older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      
      if (recentAvg < olderAvg - 0.5) {
        riskScore += 30;
        factors.push(`Performance dropped from ${olderAvg.toFixed(1)} to ${recentAvg.toFixed(1)}`);
        trendDirection = 'declining';
        interventions.push('Conduct performance improvement discussion');
      } else if (recentAvg > olderAvg + 0.3) {
        trendDirection = 'improving';
      }
    }
  }

  // Goal completion
  if (data.goal_completion_rate < 50) {
    riskScore += 25;
    factors.push(`Low goal completion rate (${data.goal_completion_rate}%)`);
    interventions.push('Review goal alignment and provide additional support');
  } else if (data.goal_completion_rate < 70) {
    riskScore += 10;
    factors.push(`Moderate goal completion rate (${data.goal_completion_rate}%)`);
  }

  // Training gaps
  if (data.training_hours !== undefined && data.training_hours < 8) {
    riskScore += 15;
    factors.push('Limited training participation');
    interventions.push('Recommend relevant training programs');
  }

  return {
    risk_category: 'performance_decline',
    risk_score: Math.min(riskScore, 100),
    risk_level: calculateRiskLevel(riskScore),
    contributing_factors: factors,
    recommended_interventions: interventions,
    trend_direction: trendDirection
  };
}

function analyzeDisengagement(data: EmployeeRiskData): RiskAssessment {
  let riskScore = 0;
  const factors: string[] = [];
  const interventions: string[] = [];

  if (data.engagement_score !== undefined) {
    if (data.engagement_score < 2.5) {
      riskScore += 40;
      factors.push('Very low engagement score');
      interventions.push('Immediate manager intervention required');
    } else if (data.engagement_score < 3.5) {
      riskScore += 20;
      factors.push('Below average engagement');
      interventions.push('Schedule engagement discussion');
    }
  }

  // Long tenure with no development
  if (data.tenure_months > 48 && (!data.training_hours || data.training_hours < 16)) {
    riskScore += 15;
    factors.push('Long-tenured with limited development activity');
    interventions.push('Create personalized development plan');
  }

  return {
    risk_category: 'disengagement',
    risk_score: Math.min(riskScore, 100),
    risk_level: calculateRiskLevel(riskScore),
    contributing_factors: factors,
    recommended_interventions: interventions,
    trend_direction: 'stable'
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

    const { company_id, department_id, employee_ids } = await req.json();

    console.log('Analyzing talent risks for company:', company_id);

    // Fetch employee data with performance history
    let query = supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        department_id,
        hire_date,
        company_id
      `)
      .eq('company_id', company_id);

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    if (employee_ids && employee_ids.length > 0) {
      query = query.in('id', employee_ids);
    }

    const { data: employees, error: empError } = await query;

    if (empError) {
      console.error('Error fetching employees:', empError);
      throw empError;
    }

    console.log(`Found ${employees?.length || 0} employees to analyze`);

    const riskResults = [];

    for (const employee of employees || []) {
      // Get performance scores from appraisals
      const { data: appraisals } = await supabase
        .from('appraisal_participants')
        .select('overall_score, goal_score, created_at')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get goal completion data
      const { data: goals } = await supabase
        .from('goals')
        .select('status')
        .eq('employee_id', employee.id);

      // Check if succession candidate
      const { data: succession } = await supabase
        .from('succession_candidates')
        .select('id')
        .eq('candidate_id', employee.id)
        .single();

      const performanceScores = appraisals?.map(a => a.overall_score).filter(Boolean) || [];
      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;
      const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 50;

      const tenureMonths = employee.hire_date 
        ? Math.floor((Date.now() - new Date(employee.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 12;

      const employeeData: EmployeeRiskData = {
        employee_id: employee.id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        department_id: employee.department_id,
        performance_scores: performanceScores,
        goal_completion_rate: goalCompletionRate,
        tenure_months: tenureMonths,
        is_succession_candidate: !!succession
      };

      // Run risk analyses
      const flightRisk = analyzeFlightRisk(employeeData);
      const performanceRisk = analyzePerformanceDecline(employeeData);
      const disengagementRisk = analyzeDisengagement(employeeData);

      // Calculate composite risk
      const compositeScore = Math.max(flightRisk.risk_score, performanceRisk.risk_score, disengagementRisk.risk_score);
      const primaryRisk = [flightRisk, performanceRisk, disengagementRisk]
        .sort((a, b) => b.risk_score - a.risk_score)[0];

      // Store risk assessment
      const { error: insertError } = await supabase
        .from('employee_performance_risks')
        .upsert({
          employee_id: employee.id,
          company_id: company_id,
          risk_category: primaryRisk.risk_category,
          risk_score: compositeScore,
          risk_level: calculateRiskLevel(compositeScore),
          contributing_factors: primaryRisk.contributing_factors,
          recommended_interventions: primaryRisk.recommended_interventions,
          trend_direction: primaryRisk.trend_direction,
          last_assessed_at: new Date().toISOString()
        }, {
          onConflict: 'employee_id,company_id,risk_category'
        });

      if (insertError) {
        console.error('Error storing risk assessment:', insertError);
      }

      // Store trend history
      await supabase
        .from('performance_trend_history')
        .insert({
          employee_id: employee.id,
          company_id: company_id,
          metric_type: 'composite_risk',
          metric_value: compositeScore,
          trend_direction: primaryRisk.trend_direction
        });

      riskResults.push({
        employee_id: employee.id,
        employee_name: employeeData.employee_name,
        department_id: employee.department_id,
        composite_risk_score: compositeScore,
        risk_level: calculateRiskLevel(compositeScore),
        primary_risk_category: primaryRisk.risk_category,
        risk_assessments: {
          flight_risk: flightRisk,
          performance_decline: performanceRisk,
          disengagement: disengagementRisk
        }
      });
    }

    // Sort by risk score descending
    riskResults.sort((a, b) => b.composite_risk_score - a.composite_risk_score);

    console.log(`Completed risk analysis for ${riskResults.length} employees`);

    return new Response(JSON.stringify({
      success: true,
      analyzed_count: riskResults.length,
      results: riskResults,
      high_risk_count: riskResults.filter(r => r.risk_level === 'high' || r.risk_level === 'critical').length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in talent-risk-analyzer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
