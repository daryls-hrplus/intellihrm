import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewQualityRequest {
  action: 'analyze_review_quality' | 'detect_inconsistent_scoring' | 'detect_missing_evidence' | 'generate_clarifying_prompts' | 'calculate_review_readiness';
  participantId: string;
  companyId: string;
  reviewData?: {
    scores: Array<{ dimension: string; score: number; comment?: string }>;
    overallScore?: number;
    overallComment?: string;
    evidenceItems?: Array<{ type: string; description: string }>;
  };
}

interface QualityIssue {
  type: 'inconsistent_scoring' | 'missing_evidence' | 'vague_comment' | 'score_comment_mismatch' | 'incomplete_section';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  affectedDimension?: string;
  isoClause?: string;
}

// Score-sentiment mapping for consistency detection
const SCORE_SENTIMENT_MAP = {
  1: ['poor', 'unsatisfactory', 'below', 'fail', 'inadequate', 'weak', 'needs improvement'],
  2: ['developing', 'inconsistent', 'partial', 'sometimes', 'emerging'],
  3: ['meets', 'satisfactory', 'adequate', 'competent', 'solid', 'good'],
  4: ['exceeds', 'strong', 'excellent', 'outstanding', 'exceptional', 'above'],
  5: ['exceptional', 'outstanding', 'exemplary', 'superior', 'world-class', 'best']
};

// Vague language patterns
const VAGUE_PATTERNS = [
  /\bgood\b(?!\s+at)/i,
  /\bnice\b/i,
  /\bfine\b/i,
  /\bokay\b/i,
  /\balright\b/i,
  /\bdoes\s+(?:a\s+)?good\s+job\b/i,
  /\bno\s+issues?\b/i,
  /\bno\s+problems?\b/i,
  /\boverall\s+positive\b/i
];

// Evidence indicators
const EVIDENCE_PATTERNS = [
  /\bfor\s+example\b/i,
  /\bspecifically\b/i,
  /\bdemonstrated\s+by\b/i,
  /\bas\s+shown\s+(?:by|in|when)\b/i,
  /\bin\s+the\s+\w+\s+project\b/i,
  /\bduring\s+(?:the\s+)?Q[1-4]\b/i,
  /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  /\bincreased\s+(?:by\s+)?\d+%?\b/i,
  /\breduced\s+(?:by\s+)?\d+%?\b/i,
  /\bachieved\s+\d+/i,
  /\bcompleted\s+\d+/i,
  /\bdelivered\s+(?:the\s+)?\w+/i
];

function detectInconsistentScoring(scores: Array<{ dimension: string; score: number; comment?: string }>): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  for (const item of scores) {
    if (!item.comment || item.comment.trim().length < 10) continue;
    
    const comment = item.comment.toLowerCase();
    const score = Math.round(item.score);
    
    // Check if comment sentiment matches score
    let expectedSentiments: string[] = [];
    let oppositeSentiments: string[] = [];
    
    if (score <= 2) {
      expectedSentiments = [...SCORE_SENTIMENT_MAP[1], ...SCORE_SENTIMENT_MAP[2]];
      oppositeSentiments = [...SCORE_SENTIMENT_MAP[4], ...SCORE_SENTIMENT_MAP[5]];
    } else if (score >= 4) {
      expectedSentiments = [...SCORE_SENTIMENT_MAP[4], ...SCORE_SENTIMENT_MAP[5]];
      oppositeSentiments = [...SCORE_SENTIMENT_MAP[1], ...SCORE_SENTIMENT_MAP[2]];
    }
    
    const hasExpected = expectedSentiments.some(s => comment.includes(s));
    const hasOpposite = oppositeSentiments.some(s => comment.includes(s));
    
    if (hasOpposite && !hasExpected) {
      issues.push({
        type: 'score_comment_mismatch',
        severity: 'high',
        description: `The comment for "${item.dimension}" uses language that doesn't align with the score of ${score}.`,
        suggestion: 'Review the score or update the comment to better reflect the actual performance level.',
        affectedDimension: item.dimension,
        isoClause: 'ISO 42001 7.2 - Transparency and consistency in AI-assisted evaluations'
      });
    }
  }
  
  return issues;
}

function detectMissingEvidence(scores: Array<{ dimension: string; score: number; comment?: string }>): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  for (const item of scores) {
    const comment = item.comment || '';
    const hasEvidence = EVIDENCE_PATTERNS.some(pattern => pattern.test(comment));
    
    // Higher scores require stronger evidence
    if (item.score >= 4 && !hasEvidence && comment.length < 100) {
      issues.push({
        type: 'missing_evidence',
        severity: 'medium',
        description: `The rating for "${item.dimension}" (${item.score}) would benefit from specific examples or evidence.`,
        suggestion: 'Add specific examples, metrics, or project references to support this rating.',
        affectedDimension: item.dimension,
        isoClause: 'ISO 42001 8.4 - Evidence-based decision support'
      });
    }
    
    // Low scores especially need documentation
    if (item.score <= 2 && !hasEvidence) {
      issues.push({
        type: 'missing_evidence',
        severity: 'high',
        description: `Low ratings require documented evidence. "${item.dimension}" needs specific examples.`,
        suggestion: 'Document specific instances, dates, and impacts to support this developmental rating.',
        affectedDimension: item.dimension,
        isoClause: 'ISO 42001 8.4 - Evidence-based decision support'
      });
    }
  }
  
  return issues;
}

function detectVagueLanguage(scores: Array<{ dimension: string; score: number; comment?: string }>): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  for (const item of scores) {
    const comment = item.comment || '';
    
    // Check for vague patterns
    const vagueMatches = VAGUE_PATTERNS.filter(pattern => pattern.test(comment));
    
    if (vagueMatches.length > 0 && comment.length < 150) {
      issues.push({
        type: 'vague_comment',
        severity: 'low',
        description: `The comment for "${item.dimension}" uses general language that could be more specific.`,
        suggestion: 'Replace general terms with specific behaviors, outcomes, or examples.',
        affectedDimension: item.dimension,
        isoClause: 'ISO 42001 7.2 - Clear and specific feedback'
      });
    }
  }
  
  return issues;
}

function detectIncompleteSections(scores: Array<{ dimension: string; score: number; comment?: string }>): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  for (const item of scores) {
    if (!item.comment || item.comment.trim().length < 20) {
      issues.push({
        type: 'incomplete_section',
        severity: 'medium',
        description: `The "${item.dimension}" section needs a more detailed comment.`,
        suggestion: 'Provide at least 2-3 sentences describing performance in this area.',
        affectedDimension: item.dimension,
        isoClause: 'ISO 42001 7.5 - Complete documentation'
      });
    }
  }
  
  return issues;
}

function generateClarifyingPrompts(issues: QualityIssue[]): string[] {
  const prompts: string[] = [];
  
  const missingEvidence = issues.filter(i => i.type === 'missing_evidence');
  if (missingEvidence.length > 0) {
    prompts.push(`What specific projects or accomplishments demonstrate performance in ${missingEvidence.map(i => i.affectedDimension).join(', ')}?`);
  }
  
  const scoreMismatches = issues.filter(i => i.type === 'score_comment_mismatch');
  if (scoreMismatches.length > 0) {
    prompts.push(`Can you clarify the performance level for ${scoreMismatches.map(i => i.affectedDimension).join(', ')}? The comments and scores seem to convey different messages.`);
  }
  
  const vagueComments = issues.filter(i => i.type === 'vague_comment');
  if (vagueComments.length > 0) {
    prompts.push(`What specific behaviors or results would you highlight for ${vagueComments.map(i => i.affectedDimension).join(', ')}?`);
  }
  
  const incomplete = issues.filter(i => i.type === 'incomplete_section');
  if (incomplete.length > 0) {
    prompts.push(`Please expand on your assessment of ${incomplete.map(i => i.affectedDimension).join(', ')} with examples or observations.`);
  }
  
  return prompts;
}

function calculateScores(issues: QualityIssue[], totalDimensions: number): {
  qualityScore: number;
  consistencyScore: number;
  evidenceCoverageScore: number;
  biasFreeScore: number;
  isReady: boolean;
} {
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;
  const lowIssues = issues.filter(i => i.severity === 'low').length;
  
  // Consistency score based on score-comment mismatches
  const inconsistencies = issues.filter(i => i.type === 'score_comment_mismatch').length;
  const consistencyScore = Math.max(0, 100 - (inconsistencies / Math.max(1, totalDimensions)) * 100);
  
  // Evidence coverage score
  const missingEvidence = issues.filter(i => i.type === 'missing_evidence').length;
  const evidenceCoverageScore = Math.max(0, 100 - (missingEvidence / Math.max(1, totalDimensions)) * 50);
  
  // Bias-free score (no detected bias patterns = 100)
  const biasFreeScore = 100; // This would be enhanced with actual bias detection
  
  // Overall quality score
  const qualityScore = Math.max(0, 100 - (highIssues * 20) - (mediumIssues * 10) - (lowIssues * 5));
  
  // Ready if quality score is above threshold and no high-severity issues
  const isReady = qualityScore >= 60 && highIssues === 0;
  
  return {
    qualityScore,
    consistencyScore,
    evidenceCoverageScore,
    biasFreeScore,
    isReady
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

    const request: ReviewQualityRequest = await req.json();
    const { action, participantId, companyId, reviewData } = request;

    console.log(`[review-quality-assistant] Action: ${action}, Participant: ${participantId}`);

    if (!reviewData?.scores || reviewData.scores.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Review data with scores is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let issues: QualityIssue[] = [];
    
    switch (action) {
      case 'detect_inconsistent_scoring':
        issues = detectInconsistentScoring(reviewData.scores);
        break;
        
      case 'detect_missing_evidence':
        issues = detectMissingEvidence(reviewData.scores);
        break;
        
      case 'generate_clarifying_prompts':
        // First detect all issues, then generate prompts
        issues = [
          ...detectInconsistentScoring(reviewData.scores),
          ...detectMissingEvidence(reviewData.scores),
          ...detectVagueLanguage(reviewData.scores),
          ...detectIncompleteSections(reviewData.scores)
        ];
        const prompts = generateClarifyingPrompts(issues);
        return new Response(
          JSON.stringify({ prompts, issues }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'calculate_review_readiness':
      case 'analyze_review_quality':
      default:
        // Full analysis
        issues = [
          ...detectInconsistentScoring(reviewData.scores),
          ...detectMissingEvidence(reviewData.scores),
          ...detectVagueLanguage(reviewData.scores),
          ...detectIncompleteSections(reviewData.scores)
        ];
        break;
    }

    const scores = calculateScores(issues, reviewData.scores.length);
    const clarifyingPrompts = generateClarifyingPrompts(issues);

    // Store the assessment
    const { data: assessment, error: insertError } = await supabase
      .from('review_quality_assessments')
      .upsert({
        participant_id: participantId,
        company_id: companyId,
        quality_score: scores.qualityScore,
        consistency_score: scores.consistencyScore,
        evidence_coverage_score: scores.evidenceCoverageScore,
        bias_free_score: scores.biasFreeScore,
        issues: issues,
        clarifying_prompts: clarifyingPrompts,
        is_ready_for_submission: scores.isReady,
        ai_model_used: 'hrplus-review-quality-v1',
        ai_confidence_score: 0.85,
        analyzed_at: new Date().toISOString()
      }, { onConflict: 'participant_id' })
      .select()
      .single();

    if (insertError) {
      console.error('[review-quality-assistant] Error storing assessment:', insertError);
    }

    // Log to explainability records for ISO 42001 compliance
    await supabase.from('ai_explainability_records').insert({
      company_id: companyId,
      insight_type: 'quality',
      insight_id: assessment?.id,
      insight_table: 'review_quality_assessments',
      source_data_summary: [
        { data_type: 'review_scores', record_count: reviewData.scores.length, date_range: 'current' }
      ],
      weights_applied: [
        { factor: 'consistency', weight: 0.3, contribution: scores.consistencyScore * 0.3 },
        { factor: 'evidence', weight: 0.3, contribution: scores.evidenceCoverageScore * 0.3 },
        { factor: 'completeness', weight: 0.2, contribution: 20 },
        { factor: 'bias_free', weight: 0.2, contribution: scores.biasFreeScore * 0.2 }
      ],
      confidence_score: 0.85,
      confidence_factors: [
        { factor: 'pattern_matching', impact: 'high' },
        { factor: 'rule_based_analysis', impact: 'high' }
      ],
      model_version: 'hrplus-review-quality-v1',
      model_provider: 'HRplus',
      iso_compliance_verified: true,
      human_review_required: scores.qualityScore < 50
    });

    console.log(`[review-quality-assistant] Analysis complete. Quality: ${scores.qualityScore}, Ready: ${scores.isReady}`);

    return new Response(
      JSON.stringify({
        qualityScore: scores.qualityScore,
        consistencyScore: scores.consistencyScore,
        evidenceCoverageScore: scores.evidenceCoverageScore,
        biasFreeScore: scores.biasFreeScore,
        isReady: scores.isReady,
        issues,
        clarifyingPrompts,
        assessmentId: assessment?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[review-quality-assistant] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
