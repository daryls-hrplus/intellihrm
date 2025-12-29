import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeCommentRequest {
  action: 'analyze_comment' | 'analyze_batch' | 'suggest_alternatives' | 'validate_rating_evidence';
  comment?: string;
  rating?: number;
  sourceType?: 'appraisal_score' | 'goal_comment' | 'feedback_response' | 'check_in';
  sourceId?: string;
  participantId?: string;
  goalId?: string;
  competencyId?: string;
  employeeId?: string;
  companyId?: string;
}

interface BiasIndicator {
  term: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  context: string;
}

interface CommentAnalysisResult {
  inflationScore: number;
  consistencyScore: number;
  biasIndicators: BiasIndicator[];
  suggestedAlternatives: Array<{ original: string; alternative: string; reason: string }>;
  evidenceSummary: {
    totalEvidence: number;
    validatedEvidence: number;
    evidenceTypes: string[];
  };
  overallAssessment: 'good' | 'needs_attention' | 'critical';
  confidenceScore: number;
}

// Biased terms mapping with neutral alternatives (industry-standard from Workday/SAP)
const BIASED_TERMS: Record<string, { category: string; alternatives: string[]; severity: 'low' | 'medium' | 'high' }> = {
  'aggressive': { category: 'gender_coded', alternatives: ['assertive', 'confident', 'direct'], severity: 'medium' },
  'bossy': { category: 'gender_coded', alternatives: ['decisive', 'takes initiative', 'leadership-oriented'], severity: 'high' },
  'emotional': { category: 'gender_coded', alternatives: ['passionate', 'invested', 'engaged'], severity: 'medium' },
  'hysterical': { category: 'gender_coded', alternatives: ['enthusiastic', 'animated', 'expressive'], severity: 'high' },
  'abrasive': { category: 'gender_coded', alternatives: ['direct', 'straightforward', 'candid'], severity: 'medium' },
  'shrill': { category: 'gender_coded', alternatives: ['clear', 'articulate', 'emphatic'], severity: 'high' },
  'pushy': { category: 'gender_coded', alternatives: ['persistent', 'driven', 'determined'], severity: 'medium' },
  'cultural fit': { category: 'vague_bias', alternatives: ['team collaboration style', 'communication approach', 'work style alignment'], severity: 'medium' },
  'not a good fit': { category: 'vague_bias', alternatives: ['skills gap in specific area', 'different approach to X', 'would benefit from training in Y'], severity: 'medium' },
  'attitude problem': { category: 'vague_bias', alternatives: ['specific behavioral concern about X', 'communication style differs from team norms', 'would benefit from coaching on X'], severity: 'high' },
  'young': { category: 'age_coded', alternatives: ['less experienced', 'developing expertise', 'early career'], severity: 'medium' },
  'old school': { category: 'age_coded', alternatives: ['traditional approach', 'established methods', 'conventional techniques'], severity: 'medium' },
  'mature': { category: 'age_coded', alternatives: ['experienced', 'seasoned', 'established'], severity: 'low' },
  'articulate': { category: 'racial_coded', alternatives: ['clear communicator', 'effective presenter', 'strong verbal skills'], severity: 'low' },
  'urban': { category: 'racial_coded', alternatives: ['metropolitan', 'city-based', 'central location'], severity: 'medium' },
  'exotic': { category: 'racial_coded', alternatives: ['unique perspective', 'diverse background', 'international experience'], severity: 'high' },
  'good for a': { category: 'conditional_praise', alternatives: ['demonstrates strong', 'excels at', 'consistently delivers'], severity: 'high' },
  'surprisingly': { category: 'conditional_praise', alternatives: ['notably', 'consistently', 'demonstrably'], severity: 'medium' },
  'impressive for': { category: 'conditional_praise', alternatives: ['impressive overall', 'strong performance', 'excellent results'], severity: 'high' },
};

// Vague/inflated terms that don't match specific performance
const VAGUE_TERMS = [
  'good job', 'great work', 'nice effort', 'doing well', 'meets expectations',
  'satisfactory', 'adequate', 'fine', 'okay', 'alright', 'decent',
  'solid performer', 'team player', 'hard worker', 'always tries',
  'good attitude', 'positive attitude', 'pleasant to work with',
];

// Terms indicating potential rating-comment mismatch
const NEGATIVE_INDICATORS = [
  'needs improvement', 'could do better', 'struggles with', 'fails to',
  'inconsistent', 'unreliable', 'missed deadlines', 'poor communication',
  'lacks initiative', 'below expectations', 'disappointing', 'concerning',
  'requires supervision', 'not meeting', 'underperforming', 'insufficient',
];

const POSITIVE_INDICATORS = [
  'exceptional', 'outstanding', 'exceeds expectations', 'top performer',
  'excellent', 'remarkable', 'exemplary', 'stellar', 'phenomenal',
  'consistently delivers', 'role model', 'mentor', 'leader', 'innovator',
  'drives results', 'transformational', 'indispensable', 'critical contribution',
];

function detectBiasedTerms(comment: string): BiasIndicator[] {
  const indicators: BiasIndicator[] = [];
  const lowerComment = comment.toLowerCase();

  for (const [term, info] of Object.entries(BIASED_TERMS)) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = lowerComment.match(regex);
    if (matches) {
      const contextStart = Math.max(0, lowerComment.indexOf(term.toLowerCase()) - 30);
      const contextEnd = Math.min(comment.length, lowerComment.indexOf(term.toLowerCase()) + term.length + 30);
      indicators.push({
        term: term,
        category: info.category,
        severity: info.severity,
        suggestion: `Consider using: ${info.alternatives.slice(0, 2).join(' or ')}`,
        context: comment.substring(contextStart, contextEnd),
      });
    }
  }

  return indicators;
}

function calculateInflationScore(comment: string, rating: number): number {
  if (!comment || comment.trim().length === 0) return 0;
  
  const lowerComment = comment.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  let vagueCount = 0;

  // Count positive indicators
  for (const term of POSITIVE_INDICATORS) {
    if (lowerComment.includes(term.toLowerCase())) positiveCount++;
  }

  // Count negative indicators
  for (const term of NEGATIVE_INDICATORS) {
    if (lowerComment.includes(term.toLowerCase())) negativeCount++;
  }

  // Count vague terms
  for (const term of VAGUE_TERMS) {
    if (lowerComment.includes(term.toLowerCase())) vagueCount++;
  }

  // Calculate sentiment score (-1 to 1)
  const totalIndicators = positiveCount + negativeCount + vagueCount;
  if (totalIndicators === 0) return 30; // Neutral comment with no indicators

  const sentimentScore = (positiveCount - negativeCount) / totalIndicators;
  
  // Normalize rating to -1 to 1 scale (assuming 1-5 rating scale)
  const normalizedRating = ((rating - 1) / 4) * 2 - 1;
  
  // Calculate mismatch
  const mismatch = Math.abs(sentimentScore - normalizedRating);
  
  // High rating (4-5) with negative/neutral comments = inflation concern
  if (rating >= 4 && negativeCount > 0) {
    return Math.min(100, 60 + negativeCount * 15);
  }
  
  // Low rating (1-2) with positive comments = inconsistency
  if (rating <= 2 && positiveCount > 2) {
    return Math.min(100, 50 + positiveCount * 10);
  }

  // Vague comments on extreme ratings
  if ((rating >= 4 || rating <= 2) && vagueCount > 1) {
    return Math.min(100, 40 + vagueCount * 10);
  }

  // General mismatch score
  return Math.min(100, Math.round(mismatch * 50) + vagueCount * 5);
}

function generateAlternatives(comment: string): Array<{ original: string; alternative: string; reason: string }> {
  const alternatives: Array<{ original: string; alternative: string; reason: string }> = [];
  const lowerComment = comment.toLowerCase();

  for (const [term, info] of Object.entries(BIASED_TERMS)) {
    if (lowerComment.includes(term.toLowerCase())) {
      alternatives.push({
        original: term,
        alternative: info.alternatives[0],
        reason: `"${term}" can carry ${info.category.replace('_', ' ')} connotations. Consider using more objective language.`,
      });
    }
  }

  return alternatives;
}

interface EvidenceRecord {
  id: string;
  evidence_type: string;
  validation_status: string;
}

async function getEvidenceSummary(
  supabase: any,
  employeeId: string,
  goalId?: string,
  competencyId?: string
): Promise<{ totalEvidence: number; validatedEvidence: number; evidenceTypes: string[] }> {
  let query = supabase
    .from('performance_evidence')
    .select('id, evidence_type, validation_status')
    .eq('employee_id', employeeId);

  if (goalId) {
    query = query.eq('goal_id', goalId);
  }
  if (competencyId) {
    query = query.eq('competency_id', competencyId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { totalEvidence: 0, validatedEvidence: 0, evidenceTypes: [] };
  }

  const evidence = data as EvidenceRecord[];
  const validatedCount = evidence.filter(e => e.validation_status === 'validated').length;
  const types = [...new Set(evidence.map(e => e.evidence_type))];

  return {
    totalEvidence: evidence.length,
    validatedEvidence: validatedCount,
    evidenceTypes: types,
  };
}

function calculateConsistencyScore(
  rating: number,
  evidenceSummary: { totalEvidence: number; validatedEvidence: number; evidenceTypes: string[] }
): number {
  const { totalEvidence, validatedEvidence, evidenceTypes } = evidenceSummary;

  // Base score starts at 100 and decreases with inconsistencies
  let score = 100;

  // High rating with no evidence = major inconsistency
  if (rating >= 4 && totalEvidence === 0) {
    score -= 50;
  } else if (rating >= 4 && validatedEvidence === 0) {
    score -= 30;
  }

  // Low rating with strong validated evidence = potential inconsistency
  if (rating <= 2 && validatedEvidence >= 3) {
    score -= 35;
  }

  // Bonus for diverse evidence types
  if (evidenceTypes.length >= 3) {
    score = Math.min(100, score + 10);
  }

  // Bonus for validated evidence matching high rating
  if (rating >= 4 && validatedEvidence >= 2) {
    score = Math.min(100, score + 15);
  }

  return Math.max(0, Math.min(100, score));
}

function determineOverallAssessment(
  inflationScore: number,
  consistencyScore: number,
  biasIndicators: BiasIndicator[]
): 'good' | 'needs_attention' | 'critical' {
  const highSeverityBias = biasIndicators.filter(b => b.severity === 'high').length;
  const mediumSeverityBias = biasIndicators.filter(b => b.severity === 'medium').length;

  // Critical conditions
  if (inflationScore >= 75 || consistencyScore <= 30 || highSeverityBias >= 2) {
    return 'critical';
  }

  // Needs attention conditions
  if (
    inflationScore >= 50 ||
    consistencyScore <= 60 ||
    highSeverityBias >= 1 ||
    mediumSeverityBias >= 3
  ) {
    return 'needs_attention';
  }

  return 'good';
}

async function analyzeComment(
  supabase: any,
  request: AnalyzeCommentRequest
): Promise<CommentAnalysisResult> {
  const { comment, rating, employeeId, goalId, competencyId } = request;

  if (!comment) {
    throw new Error('Comment is required');
  }

  const ratingValue = rating ?? 3; // Default to middle rating if not provided

  // Detect biased terms
  const biasIndicators = detectBiasedTerms(comment);

  // Calculate inflation score
  const inflationScore = calculateInflationScore(comment, ratingValue);

  // Generate alternatives for biased terms
  const suggestedAlternatives = generateAlternatives(comment);

  // Get evidence summary if employee ID provided
  let evidenceSummary = { totalEvidence: 0, validatedEvidence: 0, evidenceTypes: [] as string[] };
  if (employeeId) {
    evidenceSummary = await getEvidenceSummary(supabase, employeeId, goalId, competencyId);
  }

  // Calculate consistency score
  const consistencyScore = calculateConsistencyScore(ratingValue, evidenceSummary);

  // Determine overall assessment
  const overallAssessment = determineOverallAssessment(inflationScore, consistencyScore, biasIndicators);

  // Calculate confidence (based on comment length and indicator detection)
  const confidenceScore = Math.min(0.95, 0.6 + (comment.length / 500) * 0.2 + (biasIndicators.length > 0 ? 0.1 : 0));

  return {
    inflationScore,
    consistencyScore,
    biasIndicators,
    suggestedAlternatives,
    evidenceSummary,
    overallAssessment,
    confidenceScore,
  };
}

interface AppraisalScore {
  id: string;
  comments: string | null;
  score: number;
  participant: {
    employee_id: string;
  };
}

async function analyzeBatch(
  supabase: any,
  participantId: string,
  companyId: string
): Promise<{ results: CommentAnalysisResult[]; summary: { avgInflation: number; avgConsistency: number; totalBiasIssues: number } }> {
  // Get all appraisal scores for this participant
  const { data, error } = await supabase
    .from('appraisal_scores')
    .select(`
      id,
      comments,
      score,
      participant:appraisal_participants!inner(
        employee_id
      )
    `)
    .eq('participant_id', participantId);

  if (error || !data) {
    throw new Error('Failed to fetch appraisal scores');
  }

  const scores = data as unknown as AppraisalScore[];
  const results: CommentAnalysisResult[] = [];
  let totalInflation = 0;
  let totalConsistency = 0;
  let totalBiasIssues = 0;

  for (const score of scores) {
    if (!score.comments) continue;

    const employeeId = score.participant?.employee_id;
    const result = await analyzeComment(supabase, {
      action: 'analyze_comment',
      comment: score.comments,
      rating: score.score,
      sourceType: 'appraisal_score',
      sourceId: score.id,
      employeeId,
    });

    results.push(result);
    totalInflation += result.inflationScore;
    totalConsistency += result.consistencyScore;
    totalBiasIssues += result.biasIndicators.length;

    // Store result in database
    await supabase.from('comment_analysis_results').insert({
      company_id: companyId,
      source_type: 'appraisal_score',
      source_id: score.id,
      rating_value: score.score,
      comment_text: score.comments,
      inflation_score: result.inflationScore,
      consistency_score: result.consistencyScore,
      bias_indicators: result.biasIndicators,
      suggested_alternatives: result.suggestedAlternatives,
      evidence_summary: result.evidenceSummary,
      analysis_model: 'hrplus-comment-analyzer-v1',
      confidence_score: result.confidenceScore,
    });
  }

  const count = results.length || 1;
  return {
    results,
    summary: {
      avgInflation: Math.round(totalInflation / count),
      avgConsistency: Math.round(totalConsistency / count),
      totalBiasIssues,
    },
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: AnalyzeCommentRequest = await req.json();
    console.log("Performance Comment Analyzer - Action:", request.action);

    let response;

    switch (request.action) {
      case 'analyze_comment':
        response = await analyzeComment(supabase, request);
        break;

      case 'analyze_batch':
        if (!request.participantId || !request.companyId) {
          throw new Error('participantId and companyId are required for batch analysis');
        }
        response = await analyzeBatch(supabase, request.participantId, request.companyId);
        break;

      case 'suggest_alternatives':
        if (!request.comment) {
          throw new Error('comment is required for suggesting alternatives');
        }
        response = {
          biasIndicators: detectBiasedTerms(request.comment),
          suggestedAlternatives: generateAlternatives(request.comment),
        };
        break;

      case 'validate_rating_evidence':
        if (!request.employeeId) {
          throw new Error('employeeId is required for evidence validation');
        }
        const evidenceSummary = await getEvidenceSummary(
          supabase,
          request.employeeId,
          request.goalId,
          request.competencyId
        );
        const consistencyScore = calculateConsistencyScore(request.rating ?? 3, evidenceSummary);
        response = {
          evidenceSummary,
          consistencyScore,
          recommendation: consistencyScore >= 70 ? 'consistent' : consistencyScore >= 40 ? 'review_needed' : 'inconsistent',
        };
        break;

      default:
        throw new Error(`Unknown action: ${(request as AnalyzeCommentRequest).action}`);
    }

    console.log("Performance Comment Analyzer - Success");

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error("Performance Comment Analyzer Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
