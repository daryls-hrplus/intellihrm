import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  companyId: string;
  employeeId?: string;
  action: 'analyze_employee' | 'analyze_company' | 'get_risk_summary' | 'trigger_intervention';
  interventionType?: string;
  riskId?: string;
}

interface PerformanceData {
  employee_id: string;
  employee_name: string;
  cycle_id: string;
  cycle_name: string;
  cycle_end_date: string;
  goal_score: number;
  competency_score: number;
  responsibility_score: number;
  overall_score: number;
}

interface CertificationData {
  employee_id: string;
  certificate_name: string;
  expiry_date: string;
  is_mandatory: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { companyId, employeeId, action, interventionType, riskId } = await req.json() as AnalysisRequest;

    console.log(`Performance risk analyzer: action=${action}, companyId=${companyId}, employeeId=${employeeId}`);

    if (action === 'get_risk_summary') {
      return await getRiskSummary(supabase, companyId, corsHeaders);
    }

    if (action === 'trigger_intervention') {
      return await triggerIntervention(supabase, riskId!, interventionType!, corsHeaders);
    }

    // Get employees to analyze
    let employeeIds: string[] = [];
    if (employeeId) {
      employeeIds = [employeeId];
    } else {
      const { data: employees } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', companyId)
        .eq('is_active', true);
      employeeIds = (employees || []).map(e => e.id);
    }

    console.log(`Analyzing ${employeeIds.length} employees`);

    const results = [];

    for (const empId of employeeIds) {
      try {
        const riskAnalysis = await analyzeEmployee(supabase, empId, companyId, lovableApiKey);
        results.push(riskAnalysis);
      } catch (err) {
        console.error(`Error analyzing employee ${empId}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analyzed_count: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Performance risk analyzer error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function analyzeEmployee(supabase: any, employeeId: string, companyId: string, lovableApiKey?: string) {
  console.log(`Analyzing employee: ${employeeId}`);

  // Get employee info
  const { data: employee } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', employeeId)
    .single();

  // Get last 3 appraisal cycles performance
  const { data: performanceHistory } = await supabase
    .from('appraisal_participants')
    .select(`
      id,
      employee_id,
      final_rating,
      goal_rating,
      competency_rating,
      responsibility_rating,
      cycle:appraisal_cycles(id, name, end_date)
    `)
    .eq('employee_id', employeeId)
    .not('final_rating', 'is', null)
    .order('cycle(end_date)', { ascending: false })
    .limit(5);

  // Get expiring certifications (within 90 days)
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
  
  const { data: expiringCerts } = await supabase
    .from('employee_certifications')
    .select('id, certificate_name, expiry_date, is_mandatory')
    .eq('employee_id', employeeId)
    .lte('expiry_date', ninetyDaysFromNow.toISOString().split('T')[0])
    .gt('expiry_date', new Date().toISOString().split('T')[0]);

  // Get existing risks
  const { data: existingRisks } = await supabase
    .from('employee_performance_risks')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('is_active', true);

  const risks: any[] = [];
  const trendHistory: any[] = [];

  // Analyze chronic underperformance
  const chronicRisk = analyzeChronicUnderperformance(performanceHistory || []);
  if (chronicRisk) {
    risks.push(chronicRisk);
  }

  // Analyze skills decay
  const skillsDecayRisk = analyzeSkillsDecay(expiringCerts || []);
  if (skillsDecayRisk) {
    risks.push(skillsDecayRisk);
  }

  // Analyze toxic high performer
  const toxicHPRisk = analyzeToxicHighPerformer(performanceHistory || []);
  if (toxicHPRisk) {
    risks.push(toxicHPRisk);
  }

  // Analyze declining trend
  const trendRisk = analyzeDeclinigTrend(performanceHistory || []);
  if (trendRisk.risk) {
    risks.push(trendRisk.risk);
  }
  if (trendRisk.trendData.length > 0) {
    trendHistory.push(...trendRisk.trendData);
  }

  // Generate AI recommendations if risks found
  for (const risk of risks) {
    if (lovableApiKey && risk.risk_level !== 'low') {
      try {
        const recommendation = await generateAIRecommendation(risk, employee, lovableApiKey);
        risk.ai_recommendation = recommendation;
      } catch (err) {
        console.error('AI recommendation error:', err);
      }
    }
  }

  // Upsert risks to database
  for (const risk of risks) {
    const existingRisk = (existingRisks || []).find(
      (r: any) => r.risk_type === risk.risk_type
    );

    if (existingRisk) {
      await supabase
        .from('employee_performance_risks')
        .update({
          risk_level: risk.risk_level,
          risk_score: risk.risk_score,
          risk_factors: risk.risk_factors,
          affected_competencies: risk.affected_competencies,
          consecutive_underperformance_count: risk.consecutive_underperformance_count,
          expiring_certifications: risk.expiring_certifications,
          goal_vs_behavior_gap: risk.goal_vs_behavior_gap,
          goal_score: risk.goal_score,
          competency_score: risk.competency_score,
          ai_recommendation: risk.ai_recommendation,
          ai_analysis: risk.ai_analysis,
          last_analyzed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRisk.id);
    } else {
      await supabase
        .from('employee_performance_risks')
        .insert({
          employee_id: employeeId,
          company_id: companyId,
          ...risk,
          detection_method: 'ai_analysis',
          first_detected_at: new Date().toISOString(),
          last_analyzed_at: new Date().toISOString()
        });
    }
  }

  // Clear resolved risks
  const activeRiskTypes = risks.map(r => r.risk_type);
  if (existingRisks && existingRisks.length > 0) {
    for (const existing of existingRisks) {
      if (!activeRiskTypes.includes(existing.risk_type)) {
        await supabase
          .from('employee_performance_risks')
          .update({
            is_active: false,
            resolved_at: new Date().toISOString(),
            resolution_notes: 'Auto-resolved: Risk no longer detected'
          })
          .eq('id', existing.id);
      }
    }
  }

  // Store trend history
  for (const trend of trendHistory) {
    await supabase
      .from('performance_trend_history')
      .upsert({
        employee_id: employeeId,
        company_id: companyId,
        ...trend
      }, {
        onConflict: 'employee_id,cycle_id',
        ignoreDuplicates: false
      });
  }

  return {
    employee_id: employeeId,
    employee_name: employee?.full_name,
    risks_found: risks.length,
    risk_types: risks.map(r => r.risk_type),
    highest_risk_level: getHighestRiskLevel(risks)
  };
}

function analyzeChronicUnderperformance(performanceHistory: any[]) {
  if (performanceHistory.length < 2) return null;

  let consecutiveUnderperformance = 0;
  const underperformingCycles: string[] = [];
  const affectedCompetencies: string[] = [];

  for (const record of performanceHistory) {
    const goalScore = record.goal_rating || 0;
    const overallScore = record.final_rating || 0;

    if (overallScore < 3 || goalScore < 3) {
      consecutiveUnderperformance++;
      underperformingCycles.push(record.cycle?.name || 'Unknown');
      
      if (record.competency_rating && record.competency_rating < 2.5) {
        affectedCompetencies.push('competency');
      }
      if (record.responsibility_rating && record.responsibility_rating < 2.5) {
        affectedCompetencies.push('responsibility');
      }
    } else {
      break; // Stop at first passing cycle (consecutive check)
    }
  }

  if (consecutiveUnderperformance >= 2) {
    const riskScore = Math.min(100, 40 + (consecutiveUnderperformance * 15));
    const riskLevel = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : 'medium';

    return {
      risk_type: 'chronic_underperformance',
      risk_level: riskLevel,
      risk_score: riskScore,
      risk_factors: [
        { type: 'consecutive_cycles', count: consecutiveUnderperformance, cycles: underperformingCycles }
      ],
      affected_competencies: [...new Set(affectedCompetencies)],
      consecutive_underperformance_count: consecutiveUnderperformance,
      succession_impact: riskLevel === 'critical' ? 'excluded' : riskLevel === 'high' ? 'flagged' : 'none'
    };
  }

  return null;
}

function analyzeSkillsDecay(expiringCerts: any[]) {
  if (expiringCerts.length === 0) return null;

  const mandatoryCerts = expiringCerts.filter(c => c.is_mandatory);
  const riskScore = mandatoryCerts.length > 0 
    ? Math.min(100, 30 + (mandatoryCerts.length * 20))
    : Math.min(60, 15 + (expiringCerts.length * 10));

  const riskLevel = mandatoryCerts.length >= 2 ? 'high' : mandatoryCerts.length === 1 ? 'medium' : 'low';

  return {
    risk_type: 'skills_decay',
    risk_level: riskLevel,
    risk_score: riskScore,
    risk_factors: [
      { type: 'expiring_certifications', count: expiringCerts.length, mandatory_count: mandatoryCerts.length }
    ],
    expiring_certifications: expiringCerts.map(c => ({
      name: c.certificate_name,
      expiry_date: c.expiry_date,
      is_mandatory: c.is_mandatory
    })),
    succession_impact: riskLevel === 'high' ? 'flagged' : 'none'
  };
}

function analyzeToxicHighPerformer(performanceHistory: any[]) {
  if (performanceHistory.length === 0) return null;

  const latest = performanceHistory[0];
  const goalScore = latest.goal_rating || 0;
  const competencyScore = latest.competency_rating || 0;
  const responsibilityScore = latest.responsibility_rating || 0;
  const behaviorScore = (competencyScore + responsibilityScore) / 2;

  const gap = goalScore - behaviorScore;

  // High performer (goal >= 4) with low behavior (< 2.5)
  if (goalScore >= 4 && behaviorScore < 2.5) {
    const riskScore = Math.min(100, 50 + (gap * 10));
    
    return {
      risk_type: 'toxic_high_performer',
      risk_level: gap >= 2 ? 'high' : 'medium',
      risk_score: riskScore,
      risk_factors: [
        { type: 'goal_behavior_gap', gap: gap.toFixed(2), goal_score: goalScore, behavior_score: behaviorScore.toFixed(2) }
      ],
      goal_vs_behavior_gap: gap,
      goal_score: goalScore,
      competency_score: competencyScore,
      succession_impact: 'flagged',
      promotion_block_reason: 'High goal achievement but low behavioral/competency scores - coaching required before promotion'
    };
  }

  return null;
}

function analyzeDeclinigTrend(performanceHistory: any[]) {
  if (performanceHistory.length < 2) return { risk: null, trendData: [] };

  const trendData: any[] = [];
  let consecutiveDeclines = 0;
  let previousScore = null;

  // Process from oldest to newest for trend calculation
  const sortedHistory = [...performanceHistory].reverse();

  for (let i = 0; i < sortedHistory.length; i++) {
    const record = sortedHistory[i];
    const currentScore = record.final_rating || 0;
    const delta = previousScore !== null ? currentScore - previousScore : 0;
    
    const trendDirection = delta > 0.2 ? 'improving' : delta < -0.2 ? 'declining' : 'stable';
    
    if (trendDirection === 'declining') {
      consecutiveDeclines++;
    } else {
      consecutiveDeclines = 0;
    }

    trendData.push({
      cycle_id: record.cycle?.id,
      cycle_name: record.cycle?.name,
      cycle_end_date: record.cycle?.end_date,
      overall_score: record.final_rating,
      goal_score: record.goal_rating,
      competency_score: record.competency_rating,
      responsibility_score: record.responsibility_rating,
      trend_direction: trendDirection,
      trend_score: delta,
      previous_overall_score: previousScore,
      score_delta: delta,
      snapshot_date: record.cycle?.end_date || new Date().toISOString().split('T')[0]
    });

    previousScore = currentScore;
  }

  let risk = null;
  if (consecutiveDeclines >= 2) {
    const totalDrop = (sortedHistory[0]?.final_rating || 0) - (sortedHistory[sortedHistory.length - 1]?.final_rating || 0);
    const riskScore = Math.min(100, 30 + (consecutiveDeclines * 15) + (Math.abs(totalDrop) * 10));
    
    risk = {
      risk_type: 'declining_trend',
      risk_level: consecutiveDeclines >= 3 ? 'high' : 'medium',
      risk_score: riskScore,
      risk_factors: [
        { type: 'consecutive_declines', count: consecutiveDeclines, total_drop: totalDrop.toFixed(2) }
      ],
      succession_impact: consecutiveDeclines >= 3 ? 'flagged' : 'none'
    };
  }

  return { risk, trendData };
}

async function generateAIRecommendation(risk: any, employee: any, apiKey: string) {
  const prompt = `As an HR performance management expert, provide a concise recommendation for addressing this employee performance risk:

Employee: ${employee?.full_name || 'Unknown'}
Risk Type: ${risk.risk_type}
Risk Level: ${risk.risk_level}
Risk Score: ${risk.risk_score}/100
Risk Factors: ${JSON.stringify(risk.risk_factors)}

Provide:
1. A brief diagnosis (1-2 sentences)
2. 2-3 specific intervention recommendations
3. Timeline for improvement

Keep response under 200 words. Be specific and actionable.`;

  const response = await fetch('https://api.lovable.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Unable to generate recommendation';
}

async function getRiskSummary(supabase: any, companyId: string, corsHeaders: any) {
  const { data: risks } = await supabase
    .from('employee_performance_risks')
    .select(`
      risk_type,
      risk_level,
      employee:profiles(id, full_name)
    `)
    .eq('company_id', companyId)
    .eq('is_active', true);

  const summary = {
    total_risks: risks?.length || 0,
    by_type: {} as Record<string, number>,
    by_level: { low: 0, medium: 0, high: 0, critical: 0 },
    affected_employees: new Set()
  };

  for (const risk of risks || []) {
    summary.by_type[risk.risk_type] = (summary.by_type[risk.risk_type] || 0) + 1;
    summary.by_level[risk.risk_level as keyof typeof summary.by_level]++;
    summary.affected_employees.add(risk.employee?.id);
  }

  return new Response(
    JSON.stringify({
      success: true,
      summary: {
        ...summary,
        affected_employees_count: summary.affected_employees.size
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function triggerIntervention(supabase: any, riskId: string, interventionType: string, corsHeaders: any) {
  const { data: risk } = await supabase
    .from('employee_performance_risks')
    .select('*, employee:profiles(id, full_name, company_id)')
    .eq('id', riskId)
    .single();

  if (!risk) {
    return new Response(
      JSON.stringify({ success: false, error: 'Risk not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );
  }

  let interventionId = null;

  if (interventionType === 'idp') {
    // Create Individual Development Plan
    const { data: idp } = await supabase
      .from('individual_development_plans')
      .insert({
        employee_id: risk.employee_id,
        company_id: risk.employee?.company_id,
        title: `Performance Improvement Plan - ${risk.risk_type.replace(/_/g, ' ')}`,
        description: `Auto-created from performance risk detection. ${risk.ai_recommendation || ''}`,
        status: 'in_progress',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    interventionId = idp?.id;
  }

  // Update risk with triggered intervention
  await supabase
    .from('employee_performance_risks')
    .update({
      triggered_interventions: [
        ...(risk.triggered_interventions || []),
        { type: interventionType, id: interventionId, triggered_at: new Date().toISOString() }
      ]
    })
    .eq('id', riskId);

  return new Response(
    JSON.stringify({ success: true, intervention_id: interventionId }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function getHighestRiskLevel(risks: any[]): string {
  const levels = ['critical', 'high', 'medium', 'low'];
  for (const level of levels) {
    if (risks.some(r => r.risk_level === level)) return level;
  }
  return 'none';
}
