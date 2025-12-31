import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzerRequest {
  action: string;
  managerId?: string;
  companyId: string;
  cycleId?: string;
  sessionId?: string;
  participantId?: string;
  comment?: string;
  commentType?: string;
}

// ISO 42001 Compliant Scoring Constants
const SCORING_WEIGHTS = {
  timeliness: 0.25,
  commentQuality: 0.30,
  differentiation: 0.20,
  calibrationAlignment: 0.25,
};

const FLAG_THRESHOLDS = {
  poor_timeliness: { threshold: 80, severity: 'medium' },
  chronic_lateness: { threshold: 60, cycles: 2, severity: 'high' },
  low_comment_quality: { threshold: 50, severity: 'medium' },
  superficial_comments: { threshold: 50, minWords: 30, severity: 'high' },
  extreme_leniency: { avgThreshold: 4.5, stdDevMax: 0.3, severity: 'medium' },
  extreme_severity: { avgThreshold: 2.5, stdDevMax: 0.3, severity: 'high' },
  calibration_drift: { threshold: 30, severity: 'medium' },
  consistent_inflation: { cycles: 3, severity: 'high' },
  training_needed: { threshold: 60, severity: 'medium' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: AnalyzerRequest = await req.json();
    const { action, managerId, companyId, cycleId, sessionId, participantId, comment, commentType } = request;

    console.log(`[Manager Capability Analyzer] Action: ${action}, Manager: ${managerId}, Company: ${companyId}`);

    let result;

    switch (action) {
      case 'calculate_timeliness_metrics':
        result = await calculateTimelinessMetrics(supabase, managerId!, companyId, cycleId);
        break;
      case 'analyze_comment_quality':
        result = await analyzeCommentQuality(supabase, managerId!, companyId, participantId, comment!, commentType);
        break;
      case 'calculate_score_variance':
        result = await calculateScoreVariance(supabase, managerId!, companyId, cycleId);
        break;
      case 'calculate_calibration_alignment':
        result = await calculateCalibrationAlignment(supabase, managerId!, companyId, sessionId!);
        break;
      case 'generate_capability_scorecard':
        result = await generateCapabilityScorecard(supabase, managerId!, companyId, cycleId);
        break;
      case 'generate_hr_flags':
        result = await generateHRFlags(supabase, managerId!, companyId, cycleId);
        break;
      case 'generate_coaching_recommendations':
        result = await generateCoachingRecommendations(supabase, managerId!, companyId, cycleId);
        break;
      case 'batch_analyze_managers':
        result = await batchAnalyzeManagers(supabase, companyId, cycleId);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log for ISO 42001 compliance
    await logExplainability(supabase, action, companyId, managerId, result);

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Manager Capability Analyzer] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Calculate timeliness metrics for a manager
async function calculateTimelinessMetrics(supabase: any, managerId: string, companyId: string, cycleId?: string) {
  console.log(`[Timeliness] Calculating for manager ${managerId}`);
  
  // Fetch participants where this manager is the evaluator
  let query = supabase
    .from('appraisal_participants')
    .select(`
      id,
      status,
      manager_submitted_at,
      created_at,
      appraisal_cycles!inner(id, evaluation_deadline, end_date, company_id)
    `)
    .eq('manager_id', managerId)
    .eq('appraisal_cycles.company_id', companyId);

  if (cycleId) {
    query = query.eq('cycle_id', cycleId);
  }

  const { data: participants, error } = await query;
  if (error) throw error;

  const totalAssigned = participants?.length || 0;
  let completed = 0;
  let onTime = 0;
  let late = 0;
  let totalDaysBeforeDeadline = 0;

  for (const p of participants || []) {
    if (p.status === 'completed' || p.manager_submitted_at) {
      completed++;
      const deadline = new Date(p.appraisal_cycles?.evaluation_deadline || p.appraisal_cycles?.end_date);
      const submittedAt = new Date(p.manager_submitted_at || new Date());
      
      const daysBeforeDeadline = (deadline.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24);
      totalDaysBeforeDeadline += daysBeforeDeadline;
      
      if (daysBeforeDeadline >= 0) {
        onTime++;
      } else {
        late++;
      }
    }
  }

  const avgDaysBeforeDeadline = completed > 0 ? totalDaysBeforeDeadline / completed : 0;
  
  // Calculate timeliness score (0-100)
  let timelinessScore = totalAssigned > 0 ? (onTime / totalAssigned) * 100 : 100;
  const earlyBonus = avgDaysBeforeDeadline > 3 ? 10 : 0;
  const latePenalty = late * 5;
  timelinessScore = Math.min(100, Math.max(0, timelinessScore + earlyBonus - latePenalty));

  const metrics = {
    totalReviewsAssigned: totalAssigned,
    reviewsCompleted: completed,
    reviewsOnTime: onTime,
    reviewsLate: late,
    avgDaysBeforeDeadline: Math.round(avgDaysBeforeDeadline * 100) / 100,
    timelinessScore: Math.round(timelinessScore * 100) / 100,
  };

  console.log(`[Timeliness] Results:`, metrics);
  return metrics;
}

// AI-powered comment quality analysis
async function analyzeCommentQuality(
  supabase: any, 
  managerId: string, 
  companyId: string, 
  participantId?: string, 
  comment?: string,
  commentType?: string
) {
  console.log(`[Comment Quality] Analyzing for manager ${managerId}`);

  if (!comment) {
    // Fetch all comments from this manager for the cycle
    const { data: submissions, error } = await supabase
      .from('goal_rating_submissions')
      .select(`
        id,
        manager_comment,
        appraisal_participants!inner(id, manager_id, cycle_id)
      `)
      .eq('appraisal_participants.manager_id', managerId);

    if (error) throw error;

    const analyses = [];
    for (const s of submissions || []) {
      if (s.manager_comment) {
        const analysis = analyzeComment(s.manager_comment);
        analyses.push({ ...analysis, submissionId: s.id });
      }
    }

    return { batchAnalysis: analyses, averageScores: calculateAverageScores(analyses) };
  }

  // Single comment analysis
  const analysis = analyzeComment(comment);
  
  // Store the analysis
  if (participantId) {
    await supabase.from('manager_comment_analysis').upsert({
      manager_id: managerId,
      company_id: companyId,
      participant_id: participantId,
      comment_text: comment,
      comment_type: commentType || 'general',
      comment_length: comment.length,
      word_count: analysis.wordCount,
      depth_score: analysis.depthScore,
      specificity_score: analysis.specificityScore,
      actionability_score: analysis.actionabilityScore,
      overall_quality_score: analysis.overallScore,
      evidence_present: analysis.evidencePresent,
      examples_present: analysis.examplesPresent,
      forward_looking: analysis.forwardLooking,
      balanced_feedback: analysis.balancedFeedback,
      issues_detected: analysis.issues,
      improvement_suggestions: analysis.suggestions,
      ai_model_used: 'rule-based-v1',
      ai_confidence_score: analysis.confidence,
      analyzed_at: new Date().toISOString(),
    });
  }

  return analysis;
}

// Analyze a single comment
function analyzeComment(comment: string) {
  const wordCount = comment.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = comment.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Check for evidence indicators
  const evidenceKeywords = ['achieved', 'delivered', 'completed', 'resulted', 'measured', 'demonstrated', 'exceeded', 'met', 'improved', 'increased', 'decreased', 'reduced'];
  const evidencePresent = evidenceKeywords.some(kw => comment.toLowerCase().includes(kw));
  
  // Check for examples
  const exampleKeywords = ['for example', 'such as', 'specifically', 'instance', 'when', 'during', 'project'];
  const examplesPresent = exampleKeywords.some(kw => comment.toLowerCase().includes(kw));
  
  // Check for forward-looking content
  const forwardKeywords = ['should', 'could', 'recommend', 'suggest', 'next', 'going forward', 'continue', 'develop', 'improve', 'focus on', 'work on'];
  const forwardLooking = forwardKeywords.some(kw => comment.toLowerCase().includes(kw));
  
  // Check for balanced feedback
  const positiveKeywords = ['excellent', 'great', 'strong', 'good', 'well', 'effective', 'impressive', 'outstanding'];
  const developmentKeywords = ['improve', 'develop', 'area', 'opportunity', 'challenge', 'consider', 'grow'];
  const hasPositive = positiveKeywords.some(kw => comment.toLowerCase().includes(kw));
  const hasDevelopment = developmentKeywords.some(kw => comment.toLowerCase().includes(kw));
  const balancedFeedback = hasPositive && hasDevelopment;

  // Calculate scores
  const lengthScore = Math.min(100, (wordCount / 50) * 100);
  const depthScore = calculateDepthScore(sentences, wordCount, evidencePresent, examplesPresent);
  const specificityScore = calculateSpecificityScore(comment, examplesPresent, evidencePresent);
  const actionabilityScore = calculateActionabilityScore(comment, forwardLooking);
  
  const overallScore = (lengthScore * 0.15 + depthScore * 0.30 + specificityScore * 0.30 + actionabilityScore * 0.25);

  // Detect issues
  const issues = [];
  const suggestions = [];
  
  if (wordCount < 30) {
    issues.push({ type: 'too_short', description: 'Comment is too brief to provide meaningful feedback' });
    suggestions.push('Consider adding more specific details and examples');
  }
  if (!evidencePresent) {
    issues.push({ type: 'no_evidence', description: 'Comment lacks reference to specific achievements or outcomes' });
    suggestions.push('Include references to specific results or measurable outcomes');
  }
  if (!forwardLooking) {
    issues.push({ type: 'not_developmental', description: 'Comment does not include forward-looking guidance' });
    suggestions.push('Add recommendations for future development or areas to focus on');
  }
  if (!balancedFeedback && wordCount > 20) {
    issues.push({ type: 'unbalanced', description: 'Feedback may not include both strengths and development areas' });
    suggestions.push('Ensure feedback includes both recognition of strengths and constructive development areas');
  }

  return {
    wordCount,
    sentenceCount: sentences.length,
    depthScore: Math.round(depthScore * 100) / 100,
    specificityScore: Math.round(specificityScore * 100) / 100,
    actionabilityScore: Math.round(actionabilityScore * 100) / 100,
    overallScore: Math.round(overallScore * 100) / 100,
    evidencePresent,
    examplesPresent,
    forwardLooking,
    balancedFeedback,
    issues,
    suggestions,
    confidence: 85, // Rule-based confidence level
  };
}

function calculateDepthScore(sentences: string[], wordCount: number, hasEvidence: boolean, hasExamples: boolean): number {
  let score = 0;
  score += Math.min(40, (wordCount / 100) * 40); // Word count contribution
  score += sentences.length > 2 ? 20 : sentences.length * 10; // Sentence variety
  score += hasEvidence ? 20 : 0;
  score += hasExamples ? 20 : 0;
  return Math.min(100, score);
}

function calculateSpecificityScore(comment: string, hasExamples: boolean, hasEvidence: boolean): number {
  let score = 0;
  const genericPhrases = ['good job', 'well done', 'keep it up', 'great work', 'no issues', 'satisfactory'];
  const isGeneric = genericPhrases.some(p => comment.toLowerCase().includes(p));
  
  if (isGeneric && comment.length < 100) {
    score = 20;
  } else {
    score = 50;
  }
  
  score += hasExamples ? 25 : 0;
  score += hasEvidence ? 25 : 0;
  
  return Math.min(100, score);
}

function calculateActionabilityScore(comment: string, hasForwardLooking: boolean): number {
  let score = hasForwardLooking ? 60 : 20;
  
  const actionVerbs = ['should', 'could', 'recommend', 'suggest', 'consider', 'focus', 'develop', 'improve'];
  const actionCount = actionVerbs.filter(v => comment.toLowerCase().includes(v)).length;
  score += Math.min(40, actionCount * 15);
  
  return Math.min(100, score);
}

function calculateAverageScores(analyses: any[]) {
  if (analyses.length === 0) return null;
  
  return {
    avgDepthScore: analyses.reduce((sum, a) => sum + a.depthScore, 0) / analyses.length,
    avgSpecificityScore: analyses.reduce((sum, a) => sum + a.specificityScore, 0) / analyses.length,
    avgActionabilityScore: analyses.reduce((sum, a) => sum + a.actionabilityScore, 0) / analyses.length,
    avgOverallScore: analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length,
    totalComments: analyses.length,
    commentsWithEvidence: analyses.filter(a => a.evidencePresent).length,
    commentsWithExamples: analyses.filter(a => a.examplesPresent).length,
  };
}

// Calculate score variance/differentiation
async function calculateScoreVariance(supabase: any, managerId: string, companyId: string, cycleId?: string) {
  console.log(`[Score Variance] Calculating for manager ${managerId}`);
  
  let query = supabase
    .from('goal_rating_submissions')
    .select(`
      manager_score,
      appraisal_participants!inner(manager_id, cycle_id, appraisal_cycles!inner(company_id))
    `)
    .eq('appraisal_participants.manager_id', managerId)
    .eq('appraisal_participants.appraisal_cycles.company_id', companyId)
    .not('manager_score', 'is', null);

  if (cycleId) {
    query = query.eq('appraisal_participants.cycle_id', cycleId);
  }

  const { data: scores, error } = await query;
  if (error) throw error;

  const scoreValues = (scores || []).map((s: any) => s.manager_score);
  
  if (scoreValues.length === 0) {
    return { avgScore: 0, stdDeviation: 0, distribution: {}, differentiationScore: 50 };
  }

  const avg = scoreValues.reduce((a: number, b: number) => a + b, 0) / scoreValues.length;
  const squareDiffs = scoreValues.map((value: number) => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a: number, b: number) => a + b, 0) / squareDiffs.length;
  const stdDev = Math.sqrt(avgSquareDiff);

  // Calculate distribution
  const distribution: Record<number, number> = {};
  scoreValues.forEach((s: number) => {
    const rounded = Math.round(s);
    distribution[rounded] = (distribution[rounded] || 0) + 1;
  });

  // Differentiation score - ideal std dev is around 0.8
  const idealStdDev = 0.8;
  const deviationFromIdeal = Math.abs(stdDev - idealStdDev);
  const differentiationScore = Math.max(0, 100 - (deviationFromIdeal * 50));

  return {
    avgScore: Math.round(avg * 100) / 100,
    stdDeviation: Math.round(stdDev * 100) / 100,
    distribution,
    differentiationScore: Math.round(differentiationScore * 100) / 100,
    totalScores: scoreValues.length,
  };
}

// Calculate calibration alignment
async function calculateCalibrationAlignment(supabase: any, managerId: string, companyId: string, sessionId: string) {
  console.log(`[Calibration Alignment] Calculating for manager ${managerId}, session ${sessionId}`);
  
  // Get calibration adjustments for this manager's employees
  const { data: adjustments, error } = await supabase
    .from('calibration_adjustments')
    .select(`
      original_score,
      adjusted_score,
      employee_id,
      calibration_sessions!inner(id, company_id)
    `)
    .eq('session_id', sessionId)
    .eq('calibration_sessions.company_id', companyId);

  if (error) throw error;

  // Get which employees this manager evaluated
  const { data: participants } = await supabase
    .from('appraisal_participants')
    .select('employee_id')
    .eq('manager_id', managerId);

  const managerEmployees = new Set((participants || []).map((p: any) => p.employee_id));
  const relevantAdjustments = (adjustments || []).filter((a: any) => managerEmployees.has(a.employee_id));

  const employeesReviewed = relevantAdjustments.length;
  let unchanged = 0, increased = 0, decreased = 0;
  let totalAdjustment = 0, maxAdjustment = 0;

  for (const adj of relevantAdjustments) {
    const diff = (adj.adjusted_score || adj.original_score) - adj.original_score;
    if (diff === 0) unchanged++;
    else if (diff > 0) increased++;
    else decreased++;
    
    totalAdjustment += Math.abs(diff);
    maxAdjustment = Math.max(maxAdjustment, Math.abs(diff));
  }

  const avgAdjustment = employeesReviewed > 0 ? totalAdjustment / employeesReviewed : 0;
  const adjustmentRate = employeesReviewed > 0 ? ((increased + decreased) / employeesReviewed) * 100 : 0;
  const alignmentScore = 100 - adjustmentRate;

  // Determine drift pattern
  let driftPattern = 'aligned';
  if (increased > decreased * 2) driftPattern = 'consistently_low';
  else if (decreased > increased * 2) driftPattern = 'consistently_high';
  else if (adjustmentRate > 30) driftPattern = 'variable';

  const result = {
    employeesReviewed,
    scoresUnchanged: unchanged,
    scoresIncreased: increased,
    scoresDecreased: decreased,
    avgAdjustment: Math.round(avgAdjustment * 100) / 100,
    maxAdjustment: Math.round(maxAdjustment * 100) / 100,
    alignmentScore: Math.round(alignmentScore * 100) / 100,
    driftPattern,
  };

  // Store alignment record
  await supabase.from('manager_calibration_alignment').upsert({
    manager_id: managerId,
    company_id: companyId,
    session_id: sessionId,
    employees_reviewed: employeesReviewed,
    scores_unchanged: unchanged,
    scores_increased: increased,
    scores_decreased: decreased,
    avg_adjustment: avgAdjustment,
    max_adjustment: maxAdjustment,
    alignment_score: alignmentScore,
    drift_pattern: driftPattern,
    training_recommended: alignmentScore < 70,
  }, { onConflict: 'manager_id,session_id' });

  return result;
}

// Generate unified capability scorecard
async function generateCapabilityScorecard(supabase: any, managerId: string, companyId: string, cycleId?: string) {
  console.log(`[Scorecard] Generating for manager ${managerId}`);
  
  const [timeliness, commentQuality, scoreVariance] = await Promise.all([
    calculateTimelinessMetrics(supabase, managerId, companyId, cycleId),
    analyzeCommentQuality(supabase, managerId, companyId),
    calculateScoreVariance(supabase, managerId, companyId, cycleId),
  ]);

  const commentScore = (commentQuality as any)?.averageScores?.avgOverallScore || 50;
  
  // Get latest calibration alignment
  const { data: latestAlignment } = await supabase
    .from('manager_calibration_alignment')
    .select('alignment_score')
    .eq('manager_id', managerId)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const calibrationScore = latestAlignment?.alignment_score || 50;

  // Calculate overall score with weights
  const overallScore = 
    (timeliness.timelinessScore * SCORING_WEIGHTS.timeliness) +
    (commentScore * SCORING_WEIGHTS.commentQuality) +
    (scoreVariance.differentiationScore * SCORING_WEIGHTS.differentiation) +
    (calibrationScore * SCORING_WEIGHTS.calibrationAlignment);

  // Determine trend (would need historical data for real implementation)
  const trend = overallScore >= 70 ? 'stable' : overallScore >= 50 ? 'stable' : 'declining';

  const scorecard = {
    managerId,
    cycleId,
    timelinessScore: timeliness.timelinessScore,
    commentQualityScore: commentScore,
    differentiationScore: scoreVariance.differentiationScore,
    calibrationAlignmentScore: calibrationScore,
    overallCapabilityScore: Math.round(overallScore * 100) / 100,
    capabilityTrend: trend,
    breakdown: {
      timeliness,
      commentQuality: (commentQuality as any)?.averageScores,
      scoreVariance,
      calibrationAlignment: { score: calibrationScore },
    },
    calculatedAt: new Date().toISOString(),
  };

  // Store the scorecard
  await supabase.from('manager_capability_metrics').upsert({
    manager_id: managerId,
    company_id: companyId,
    cycle_id: cycleId,
    total_reviews_assigned: timeliness.totalReviewsAssigned,
    reviews_completed: timeliness.reviewsCompleted,
    reviews_on_time: timeliness.reviewsOnTime,
    reviews_late: timeliness.reviewsLate,
    avg_days_before_deadline: timeliness.avgDaysBeforeDeadline,
    timeliness_score: timeliness.timelinessScore,
    avg_comment_length: (commentQuality as any)?.averageScores?.totalComments || 0,
    avg_comment_depth_score: (commentQuality as any)?.averageScores?.avgDepthScore || 0,
    comments_with_examples: (commentQuality as any)?.averageScores?.commentsWithExamples || 0,
    comments_with_evidence: (commentQuality as any)?.averageScores?.commentsWithEvidence || 0,
    comment_quality_score: commentScore,
    avg_score_given: scoreVariance.avgScore,
    score_std_deviation: scoreVariance.stdDeviation,
    score_distribution: scoreVariance.distribution,
    differentiation_score: scoreVariance.differentiationScore,
    calibration_alignment_score: calibrationScore,
    overall_capability_score: overallScore,
    capability_trend: trend,
    calculation_details: scorecard.breakdown,
    calculated_at: new Date().toISOString(),
  }, { onConflict: 'manager_id,cycle_id' });

  return scorecard;
}

// Generate HR-only flags based on thresholds
async function generateHRFlags(supabase: any, managerId: string, companyId: string, cycleId?: string) {
  console.log(`[HR Flags] Generating for manager ${managerId}`);
  
  const scorecard = await generateCapabilityScorecard(supabase, managerId, companyId, cycleId);
  const flags = [];

  // Check timeliness
  if (scorecard.timelinessScore < FLAG_THRESHOLDS.poor_timeliness.threshold) {
    flags.push({
      flag_type: 'poor_timeliness',
      flag_severity: FLAG_THRESHOLDS.poor_timeliness.severity,
      flag_title: 'Below Target Review Completion Rate',
      flag_description: `Manager has ${scorecard.breakdown.timeliness.reviewsOnTime} of ${scorecard.breakdown.timeliness.totalReviewsAssigned} reviews completed on time (${Math.round(scorecard.timelinessScore)}%).`,
      evidence_data: { timeliness: scorecard.breakdown.timeliness },
      affected_employees_count: scorecard.breakdown.timeliness.reviewsLate,
    });
  }

  // Check comment quality
  if (scorecard.commentQualityScore < FLAG_THRESHOLDS.low_comment_quality.threshold) {
    flags.push({
      flag_type: 'low_comment_quality',
      flag_severity: FLAG_THRESHOLDS.low_comment_quality.severity,
      flag_title: 'Review Comments Need Improvement',
      flag_description: `Manager's average comment quality score is ${Math.round(scorecard.commentQualityScore)}/100. Comments may lack depth, evidence, or actionable guidance.`,
      evidence_data: { commentQuality: scorecard.breakdown.commentQuality },
      affected_employees_count: scorecard.breakdown.commentQuality?.totalComments || 0,
    });
  }

  // Check score differentiation (extreme leniency)
  const avgScore = scorecard.breakdown.scoreVariance?.avgScore || 3;
  const stdDev = scorecard.breakdown.scoreVariance?.stdDeviation || 1;
  
  if (avgScore > FLAG_THRESHOLDS.extreme_leniency.avgThreshold && stdDev < FLAG_THRESHOLDS.extreme_leniency.stdDevMax) {
    flags.push({
      flag_type: 'extreme_leniency',
      flag_severity: FLAG_THRESHOLDS.extreme_leniency.severity,
      flag_title: 'Potential Leniency Bias Detected',
      flag_description: `Manager's average score is ${avgScore.toFixed(2)} with low variance (${stdDev.toFixed(2)}). This may indicate inflated ratings without differentiation.`,
      evidence_data: { scoreVariance: scorecard.breakdown.scoreVariance },
      affected_employees_count: scorecard.breakdown.scoreVariance?.totalScores || 0,
    });
  }

  // Check extreme severity
  if (avgScore < FLAG_THRESHOLDS.extreme_severity.avgThreshold && stdDev < FLAG_THRESHOLDS.extreme_severity.stdDevMax) {
    flags.push({
      flag_type: 'extreme_severity',
      flag_severity: FLAG_THRESHOLDS.extreme_severity.severity,
      flag_title: 'Potential Severity Bias Detected',
      flag_description: `Manager's average score is ${avgScore.toFixed(2)} with low variance (${stdDev.toFixed(2)}). This may indicate overly harsh ratings.`,
      evidence_data: { scoreVariance: scorecard.breakdown.scoreVariance },
      affected_employees_count: scorecard.breakdown.scoreVariance?.totalScores || 0,
    });
  }

  // Check overall capability
  if (scorecard.overallCapabilityScore < FLAG_THRESHOLDS.training_needed.threshold) {
    flags.push({
      flag_type: 'training_needed',
      flag_severity: FLAG_THRESHOLDS.training_needed.severity,
      flag_title: 'Manager Development Recommended',
      flag_description: `Overall capability score of ${Math.round(scorecard.overallCapabilityScore)}/100 suggests this manager would benefit from additional training on performance review best practices.`,
      evidence_data: { scorecard },
      affected_employees_count: scorecard.breakdown.timeliness?.totalReviewsAssigned || 0,
    });
  }

  // Store flags (only new ones)
  for (const flag of flags) {
    const { data: existing } = await supabase
      .from('manager_hr_flags')
      .select('id')
      .eq('manager_id', managerId)
      .eq('company_id', companyId)
      .eq('cycle_id', cycleId)
      .eq('flag_type', flag.flag_type)
      .eq('is_resolved', false)
      .single();

    if (!existing) {
      await supabase.from('manager_hr_flags').insert({
        manager_id: managerId,
        company_id: companyId,
        cycle_id: cycleId,
        ...flag,
        human_review_required: true,
      });
    }
  }

  return { flags, scorecard };
}

// Generate coaching recommendations
async function generateCoachingRecommendations(supabase: any, managerId: string, companyId: string, cycleId?: string) {
  console.log(`[Coaching] Generating recommendations for manager ${managerId}`);
  
  const scorecard = await generateCapabilityScorecard(supabase, managerId, companyId, cycleId);
  const recommendations = [];

  if (scorecard.timelinessScore < 80) {
    recommendations.push({
      area: 'timeliness',
      priority: scorecard.timelinessScore < 60 ? 'high' : 'medium',
      title: 'Improve Review Completion Timeliness',
      description: 'Schedule dedicated time for performance reviews well before deadlines. Consider blocking calendar time specifically for this activity.',
      actionItems: [
        'Set calendar reminders 1 week before evaluation deadline',
        'Block 30-minute slots for each review',
        'Start with direct reports you work most closely with',
      ],
    });
  }

  if (scorecard.commentQualityScore < 70) {
    recommendations.push({
      area: 'comment_quality',
      priority: scorecard.commentQualityScore < 50 ? 'high' : 'medium',
      title: 'Enhance Feedback Quality',
      description: 'Your review comments could be more effective with specific examples and actionable guidance.',
      actionItems: [
        'Include at least one specific example in each comment',
        'Reference measurable outcomes or achievements',
        'Provide at least one forward-looking development suggestion',
        'Balance positive recognition with constructive feedback',
      ],
    });
  }

  if (scorecard.differentiationScore < 70) {
    recommendations.push({
      area: 'differentiation',
      priority: scorecard.differentiationScore < 50 ? 'high' : 'medium',
      title: 'Differentiate Performance Ratings',
      description: 'Consider whether all team members truly perform identically. Thoughtful differentiation helps recognize top performers and identify those needing support.',
      actionItems: [
        'Review each employee against specific, measurable criteria',
        'Compare performance to role expectations, not just peer comparisons',
        'Document specific evidence supporting each rating decision',
      ],
    });
  }

  if (scorecard.calibrationAlignmentScore < 70) {
    recommendations.push({
      area: 'calibration',
      priority: scorecard.calibrationAlignmentScore < 50 ? 'high' : 'medium',
      title: 'Align with Organizational Standards',
      description: 'Your initial ratings have been frequently adjusted during calibration. Understanding organizational rating standards can help.',
      actionItems: [
        'Review the rating scale definitions before evaluating',
        'Consider how top performers differ from average performers',
        'Attend calibration sessions actively to understand expectations',
      ],
    });
  }

  return {
    managerId,
    recommendations,
    overallScore: scorecard.overallCapabilityScore,
    generatedAt: new Date().toISOString(),
  };
}

// Batch analyze all managers in a company
async function batchAnalyzeManagers(supabase: any, companyId: string, cycleId?: string) {
  console.log(`[Batch] Analyzing all managers for company ${companyId}`);
  
  // Get all managers (users who have employees reporting to them)
  const { data: managers } = await supabase
    .from('appraisal_participants')
    .select('manager_id')
    .eq('appraisal_cycles.company_id', companyId);

  const uniqueManagers = [...new Set((managers || []).map((m: any) => m.manager_id).filter(Boolean))];
  
  const results = [];
  for (const managerId of uniqueManagers) {
    try {
      const flagResult = await generateHRFlags(supabase, managerId as string, companyId, cycleId);
      results.push({ managerId, success: true, ...flagResult });
    } catch (error) {
      console.error(`Error analyzing manager ${managerId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({ managerId, success: false, error: errorMessage });
    }
  }

  return {
    totalManagers: uniqueManagers.length,
    analyzed: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
}

// Log explainability record for ISO 42001 compliance
async function logExplainability(supabase: any, action: string, companyId: string, managerId?: string, result?: any) {
  try {
    await supabase.from('ai_explainability_records').insert({
      company_id: companyId,
      insight_type: `manager_capability_${action}`,
      model_version: 'rule-based-v1',
      confidence_score: result?.confidence || 85,
      source_data_summary: {
        action,
        managerId,
        resultSummary: result ? Object.keys(result) : [],
        timestamp: new Date().toISOString(),
      },
      limitations: [
        'Rule-based analysis may not capture nuanced communication patterns',
        'Historical trend analysis requires multiple cycles of data',
        'Score thresholds are configurable and may need calibration per organization',
      ],
      human_review_required: action === 'generate_hr_flags',
    });
  } catch (error) {
    console.warn('[Explainability] Failed to log:', error);
  }
}
