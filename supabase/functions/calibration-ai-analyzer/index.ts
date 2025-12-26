import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  sessionId: string;
  companyId: string;
  cycleId?: string;
}

interface RatingData {
  employeeId: string;
  employeeName: string;
  department: string;
  managerRating: number;
  selfRating: number;
  finalScore: number;
  goalAchievement: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionId, companyId, cycleId } = await req.json() as AnalysisRequest;

    console.log('Starting calibration analysis for session:', sessionId);

    // Fetch session details
    const { data: session, error: sessionError } = await supabase
      .from('calibration_sessions')
      .select('*, appraisal_cycles(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Session fetch error:', sessionError);
      throw new Error('Failed to fetch calibration session');
    }

    // Fetch goal rating submissions for this cycle/company
    const effectiveCycleId = cycleId || session.appraisal_cycle_id;
    
    let query = supabase
      .from('goal_rating_submissions')
      .select(`
        *,
        performance_goals!inner(
          id, title, employee_id, weighting,
          profiles!performance_goals_employee_id_fkey(
            id, full_name, department_id,
            departments(name)
          )
        )
      `)
      .eq('company_id', companyId);

    if (effectiveCycleId) {
      query = query.eq('performance_goals.cycle_id', effectiveCycleId);
    }

    const { data: submissions, error: submissionsError } = await query;

    if (submissionsError) {
      console.error('Submissions fetch error:', submissionsError);
      throw new Error('Failed to fetch rating submissions');
    }

    console.log(`Found ${submissions?.length || 0} submissions to analyze`);

    // Process ratings into analysis format
    const ratingsByEmployee = new Map<string, RatingData>();
    
    for (const submission of submissions || []) {
      const goal = submission.performance_goals;
      const employee = goal?.profiles;
      
      if (!employee) continue;

      const existing = ratingsByEmployee.get(employee.id) || {
        employeeId: employee.id,
        employeeName: employee.full_name || 'Unknown',
        department: employee.departments?.name || 'Unknown',
        managerRating: 0,
        selfRating: 0,
        finalScore: 0,
        goalAchievement: 0,
        count: 0,
      };

      existing.managerRating += submission.manager_rating || 0;
      existing.selfRating += submission.self_rating || 0;
      existing.finalScore += submission.final_score || 0;
      (existing as any).count += 1;

      ratingsByEmployee.set(employee.id, existing);
    }

    // Calculate averages
    const ratingsData = Array.from(ratingsByEmployee.values()).map(r => ({
      ...r,
      managerRating: (r as any).count > 0 ? r.managerRating / (r as any).count : 0,
      selfRating: (r as any).count > 0 ? r.selfRating / (r as any).count : 0,
      finalScore: (r as any).count > 0 ? r.finalScore / (r as any).count : 0,
    }));

    // Detect anomalies
    const anomalies: any[] = [];
    const biasAlerts: any[] = [];
    
    for (const rating of ratingsData) {
      // Large gap between self and manager rating
      const ratingGap = Math.abs(rating.selfRating - rating.managerRating);
      if (ratingGap > 1.5) {
        anomalies.push({
          type: 'rating_gap',
          employeeId: rating.employeeId,
          employeeName: rating.employeeName,
          selfRating: rating.selfRating.toFixed(2),
          managerRating: rating.managerRating.toFixed(2),
          gap: ratingGap.toFixed(2),
          severity: ratingGap > 2.5 ? 'high' : 'medium',
        });
      }

      // Unusually high or low final scores
      if (rating.finalScore > 4.5 || rating.finalScore < 1.5) {
        anomalies.push({
          type: 'extreme_rating',
          employeeId: rating.employeeId,
          employeeName: rating.employeeName,
          finalScore: rating.finalScore.toFixed(2),
          severity: rating.finalScore > 4.8 || rating.finalScore < 1.2 ? 'high' : 'medium',
        });
      }
    }

    // Calculate distribution
    const distribution = {
      exceptional: ratingsData.filter(r => r.finalScore >= 4.5).length,
      exceeds: ratingsData.filter(r => r.finalScore >= 3.5 && r.finalScore < 4.5).length,
      meets: ratingsData.filter(r => r.finalScore >= 2.5 && r.finalScore < 3.5).length,
      needs_improvement: ratingsData.filter(r => r.finalScore >= 1.5 && r.finalScore < 2.5).length,
      unsatisfactory: ratingsData.filter(r => r.finalScore < 1.5).length,
    };

    const totalRatings = ratingsData.length;
    const distributionPercentages = {
      exceptional: totalRatings > 0 ? (distribution.exceptional / totalRatings * 100).toFixed(1) : '0',
      exceeds: totalRatings > 0 ? (distribution.exceeds / totalRatings * 100).toFixed(1) : '0',
      meets: totalRatings > 0 ? (distribution.meets / totalRatings * 100).toFixed(1) : '0',
      needs_improvement: totalRatings > 0 ? (distribution.needs_improvement / totalRatings * 100).toFixed(1) : '0',
      unsatisfactory: totalRatings > 0 ? (distribution.unsatisfactory / totalRatings * 100).toFixed(1) : '0',
    };

    // Check against forced distribution if configured
    const calibrationRules = session.calibration_rules || {};
    if (calibrationRules.force_distribution && calibrationRules.max_rating_5_percent) {
      const topPercentage = parseFloat(distributionPercentages.exceptional);
      if (topPercentage > calibrationRules.max_rating_5_percent) {
        biasAlerts.push({
          type: 'distribution_violation',
          message: `Top rating category exceeds target: ${topPercentage}% vs ${calibrationRules.max_rating_5_percent}% allowed`,
          severity: 'high',
          action: `Reduce ${distribution.exceptional - Math.floor(totalRatings * calibrationRules.max_rating_5_percent / 100)} employees from top category`,
        });
      }
    }

    // Calculate overall health score
    const healthScore = Math.max(0, 100 - (anomalies.length * 10) - (biasAlerts.length * 15));

    // Store analysis results
    const analysisResult = {
      session_id: sessionId,
      analysis_type: 'pre_session',
      overall_health_score: healthScore / 100,
      anomalies_detected: anomalies.length,
      bias_alerts: biasAlerts.length,
      suggested_adjustments: { anomalies, suggestions: [] },
      distribution_analysis: {
        current: distribution,
        percentages: distributionPercentages,
        total: totalRatings,
      },
      equity_analysis: { biasAlerts },
      model_used: 'rule-based-v1',
      confidence_score: 0.85,
      company_id: companyId,
      analyzed_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('calibration_ai_analyses')
      .upsert(analysisResult, { onConflict: 'session_id,analysis_type' });

    if (insertError) {
      console.error('Failed to store analysis:', insertError);
    }

    console.log('Analysis complete:', {
      healthScore,
      anomalies: anomalies.length,
      biasAlerts: biasAlerts.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          healthScore,
          anomalies,
          biasAlerts,
          distribution,
          distributionPercentages,
          totalRatings,
          ratingsData,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Calibration analysis error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
