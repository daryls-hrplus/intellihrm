import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalculationConfig {
  recency_weights: number[];
  min_cycles_for_trend: number;
}

interface CycleSnapshot {
  cycle_id: string;
  cycle_name: string;
  cycle_end_date: string;
  overall_score: number;
  goal_score: number | null;
  competency_score: number | null;
  responsibility_score: number | null;
  values_score: number | null;
  feedback_360_score: number | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { employee_id, company_id, participant_id } = await req.json();

    if (!employee_id || !company_id) {
      throw new Error("employee_id and company_id are required");
    }

    console.log(`Calculating performance index for employee: ${employee_id}`);

    // 1. Get all completed appraisals for this employee
    const { data: appraisals, error: appraisalsError } = await supabaseClient
      .from("appraisal_participants")
      .select(`
        id,
        overall_score,
        competency_score,
        responsibility_score,
        employee_id,
        appraisal_cycles!inner(
          id,
          name,
          start_date,
          end_date,
          status,
          company_id,
          goal_weight,
          competency_weight,
          responsibility_weight,
          values_weight
        )
      `)
      .eq("employee_id", employee_id)
      .eq("appraisal_cycles.company_id", company_id)
      .eq("appraisal_cycles.status", "completed")
      .order("appraisal_cycles(end_date)", { ascending: false });

    if (appraisalsError) {
      console.error("Error fetching appraisals:", appraisalsError);
      throw appraisalsError;
    }

    console.log(`Found ${appraisals?.length || 0} completed appraisals`);

    // Get configuration
    const config: CalculationConfig = {
      recency_weights: [0.40, 0.35, 0.25],
      min_cycles_for_trend: 2,
    };

    // Calculate rolling windows (12m, 24m, 36m from now)
    const now = new Date();
    const windows = {
      "12m": new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      "24m": new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()),
      "36m": new Date(now.getFullYear() - 3, now.getMonth(), now.getDate()),
    };

    // Filter appraisals by window
    const getAppraisalsInWindow = (windowStart: Date) => {
      return (appraisals || []).filter((a: any) => {
        const endDate = new Date(a.appraisal_cycles.end_date);
        return endDate >= windowStart;
      });
    };

    const appraisals12m = getAppraisalsInWindow(windows["12m"]);
    const appraisals24m = getAppraisalsInWindow(windows["24m"]);
    const appraisals36m = getAppraisalsInWindow(windows["36m"]);

    // Calculate weighted rolling averages
    const calculateWeightedAverage = (apps: any[], weights: number[]) => {
      if (apps.length === 0) return null;
      
      let totalWeight = 0;
      let weightedSum = 0;
      
      apps.slice(0, weights.length).forEach((app, idx) => {
        const weight = weights[idx] || weights[weights.length - 1];
        if (app.overall_score !== null) {
          weightedSum += app.overall_score * weight;
          totalWeight += weight;
        }
      });
      
      return totalWeight > 0 ? weightedSum / totalWeight : null;
    };

    const rolling12m = calculateWeightedAverage(appraisals12m, config.recency_weights);
    const rolling24m = calculateWeightedAverage(appraisals24m, config.recency_weights);
    const rolling36m = calculateWeightedAverage(appraisals36m, config.recency_weights);

    // Calculate component averages
    const calculateComponentAverage = (apps: any[], key: string) => {
      const validScores = apps.filter((a: any) => a[key] !== null).map((a: any) => a[key]);
      return validScores.length > 0 ? validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length : null;
    };

    const avgGoalScore = calculateComponentAverage(appraisals36m, "goal_score");
    const avgCompetencyScore = calculateComponentAverage(appraisals36m, "competency_score");
    const avgResponsibilityScore = calculateComponentAverage(appraisals36m, "responsibility_score");
    const avgValuesScore = calculateComponentAverage(appraisals36m, "values_score");

    // Calculate trend using linear regression
    const calculateTrend = (apps: any[]) => {
      if (apps.length < config.min_cycles_for_trend) {
        return { direction: "stable", velocity: 0, confidence: 0 };
      }

      const scores = apps
        .filter((a: any) => a.overall_score !== null)
        .map((a: any, i: number) => ({ x: i, y: a.overall_score }));

      if (scores.length < 2) {
        return { direction: "stable", velocity: 0, confidence: 0 };
      }

      // Simple linear regression
      const n = scores.length;
      const sumX = scores.reduce((s, p) => s + p.x, 0);
      const sumY = scores.reduce((s, p) => s + p.y, 0);
      const sumXY = scores.reduce((s, p) => s + p.x * p.y, 0);
      const sumXX = scores.reduce((s, p) => s + p.x * p.x, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      
      // Calculate R-squared for confidence
      const meanY = sumY / n;
      const ssTotal = scores.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0);
      const predicted = scores.map((p) => ({ x: p.x, y: meanY + slope * p.x }));
      const ssRes = scores.reduce((s, p, i) => s + Math.pow(p.y - predicted[i].y, 2), 0);
      const rSquared = ssTotal > 0 ? 1 - ssRes / ssTotal : 0;

      let direction: "improving" | "stable" | "declining" = "stable";
      if (slope > 1) direction = "improving";
      else if (slope < -1) direction = "declining";

      return {
        direction,
        velocity: Math.abs(slope),
        confidence: Math.max(0, Math.min(1, rSquared)),
      };
    };

    const trend = calculateTrend(appraisals36m);

    // Find best and lowest scores
    const allScores = (appraisals || [])
      .filter((a: any) => a.overall_score !== null)
      .map((a: any) => ({
        score: a.overall_score,
        cycle_id: a.appraisal_cycles.id,
      }));

    const bestEntry = allScores.reduce((best: any, curr: any) => 
      (!best || curr.score > best.score) ? curr : best, null);
    const lowestEntry = allScores.reduce((lowest: any, curr: any) => 
      (!lowest || curr.score < lowest.score) ? curr : lowest, null);

    // Calculate consistency metrics
    const calculateConsistency = (apps: any[]) => {
      const scores = apps.filter((a: any) => a.overall_score !== null).map((a: any) => a.overall_score);
      if (scores.length < 2) {
        return { variance: null, stdDev: null, rating: "consistent" };
      }

      const mean = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum: number, s: number) => sum + Math.pow(s - mean, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);

      let rating: "highly_consistent" | "consistent" | "variable" | "highly_variable" = "consistent";
      if (stdDev < 3) rating = "highly_consistent";
      else if (stdDev < 6) rating = "consistent";
      else if (stdDev < 10) rating = "variable";
      else rating = "highly_variable";

      return { variance, stdDev, rating };
    };

    const consistency = calculateConsistency(appraisals36m);

    // Calculate readiness scores
    const calculatePromotionReadiness = () => {
      if (rolling12m === null) return null;
      let score = 0;
      
      // Base score from recent performance (50%)
      score += (rolling12m / 100) * 50;
      
      // Trend bonus (20%)
      if (trend.direction === "improving") score += 15 * trend.confidence;
      else if (trend.direction === "stable") score += 10 * trend.confidence;
      
      // Consistency bonus (15%)
      if (consistency.rating === "highly_consistent") score += 15;
      else if (consistency.rating === "consistent") score += 10;
      else if (consistency.rating === "variable") score += 5;
      
      // Experience/cycles count (15%)
      const cycleBonus = Math.min(15, appraisals36m.length * 3);
      score += cycleBonus;
      
      return Math.min(100, Math.max(0, score));
    };

    const promotionReadiness = calculatePromotionReadiness();
    const successionReadiness = promotionReadiness !== null 
      ? Math.min(100, promotionReadiness * 0.9 + (trend.direction === "improving" ? 10 : 0))
      : null;

    // 2. Upsert to employee_performance_index
    const indexData = {
      employee_id,
      company_id,
      rolling_12m_score: rolling12m,
      rolling_24m_score: rolling24m,
      rolling_36m_score: rolling36m,
      cycles_12m_count: appraisals12m.length,
      cycles_24m_count: appraisals24m.length,
      cycles_36m_count: appraisals36m.length,
      avg_goal_score: avgGoalScore,
      avg_competency_score: avgCompetencyScore,
      avg_responsibility_score: avgResponsibilityScore,
      avg_values_score: avgValuesScore,
      trend_direction: trend.direction,
      trend_velocity: trend.velocity,
      trend_confidence: trend.confidence,
      best_score: bestEntry?.score || null,
      best_cycle_id: bestEntry?.cycle_id || null,
      lowest_score: lowestEntry?.score || null,
      lowest_cycle_id: lowestEntry?.cycle_id || null,
      score_variance: consistency.variance,
      score_std_deviation: consistency.stdDev,
      consistency_rating: consistency.rating,
      promotion_readiness_score: promotionReadiness,
      succession_readiness_score: successionReadiness,
      last_calculated_at: new Date().toISOString(),
      calculation_config: config,
    };

    const { error: upsertError } = await supabaseClient
      .from("employee_performance_index")
      .upsert(indexData, { onConflict: "employee_id,company_id" });

    if (upsertError) {
      console.error("Error upserting performance index:", upsertError);
      throw upsertError;
    }

    console.log("Performance index updated successfully");

    // 3. Create immutable snapshot for the current cycle (if participant_id provided)
    if (participant_id) {
      const participant = appraisals?.find((a: any) => a.id === participant_id);
      
      if (participant) {
        const cycleArray = participant.appraisal_cycles as any[];
        const cycle = Array.isArray(cycleArray) ? cycleArray[0] : cycleArray;
        const cycleId = cycle?.id;
        const cycleName = cycle?.name;
        const cycleStartDate = cycle?.start_date;
        const cycleEndDate = cycle?.end_date;
        const isProbation = cycle?.is_probation_review;
        
        if (cycleId) {
          // Check if snapshot already exists
          const { data: existingSnapshot } = await supabaseClient
            .from("performance_cycle_snapshots")
            .select("id")
            .eq("employee_id", employee_id)
            .eq("cycle_id", cycleId)
            .single();

          if (!existingSnapshot) {
            // Get performance category
            const { data: categories } = await supabaseClient
              .from("performance_categories")
              .select("*")
              .eq("company_id", company_id)
              .eq("is_active", true);

            const category = categories?.find((c: any) => 
              participant.overall_score >= c.min_score && participant.overall_score <= c.max_score
            );

            // Get strengths/gaps counts
            const { data: insights } = await supabaseClient
              .from("appraisal_strengths_gaps")
              .select("insight_type")
              .eq("participant_id", participant_id);

            const strengthsCount = insights?.filter((i: any) => i.insight_type === "strength").length || 0;
            const gapsCount = insights?.filter((i: any) => i.insight_type === "gap").length || 0;
            const riskCount = insights?.filter((i: any) => i.insight_type === "risk_indicator").length || 0;

            const snapshotData = {
              employee_id,
              company_id,
              cycle_id: cycleId,
              participant_id,
              cycle_name: cycleName || "Unknown Cycle",
              cycle_type: isProbation ? "probation" : "annual",
              cycle_start_date: cycleStartDate,
              cycle_end_date: cycleEndDate,
              overall_score: participant.overall_score,
              goal_score: null,
              competency_score: participant.competency_score,
              responsibility_score: participant.responsibility_score,
              values_score: null,
              feedback_360_score: null,
              performance_category_id: category?.id || null,
              performance_category_code: category?.code || null,
              performance_category_name: category?.name || null,
              strengths_count: strengthsCount,
              gaps_count: gapsCount,
              risk_count: riskCount,
              evaluator_id: null,
              evaluator_name: null,
              archived_at: new Date().toISOString(),
              snapshot_version: 1,
            };

            const { error: snapshotError } = await supabaseClient
              .from("performance_cycle_snapshots")
              .insert(snapshotData);

            if (snapshotError) {
              console.error("Error creating snapshot:", snapshotError);
            } else {
              console.log("Performance cycle snapshot created");
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: indexData,
        message: "Performance index calculated successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in calculate-performance-index:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});