import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BiasIndicator {
  term: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  context: string;
}

export interface SuggestedAlternative {
  original: string;
  alternative: string;
  reason: string;
}

export interface EvidenceSummary {
  totalEvidence: number;
  validatedEvidence: number;
  evidenceTypes: string[];
}

export interface CommentAnalysisResult {
  inflationScore: number;
  consistencyScore: number;
  biasIndicators: BiasIndicator[];
  suggestedAlternatives: SuggestedAlternative[];
  evidenceSummary: EvidenceSummary;
  overallAssessment: 'good' | 'needs_attention' | 'critical';
  confidenceScore: number;
}

export interface BatchAnalysisResult {
  results: CommentAnalysisResult[];
  summary: {
    avgInflation: number;
    avgConsistency: number;
    totalBiasIssues: number;
  };
}

export interface EvidenceValidationResult {
  evidenceSummary: EvidenceSummary;
  consistencyScore: number;
  recommendation: 'consistent' | 'review_needed' | 'inconsistent';
}

export function useCommentAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeComment = useCallback(async (params: {
    comment: string;
    rating?: number;
    sourceType?: 'appraisal_score' | 'goal_comment' | 'feedback_response' | 'check_in';
    sourceId?: string;
    employeeId?: string;
    goalId?: string;
    competencyId?: string;
  }): Promise<CommentAnalysisResult | null> => {
    if (!params.comment || params.comment.trim().length === 0) {
      return null;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('performance-comment-analyzer', {
        body: {
          action: 'analyze_comment',
          ...params,
        },
      });

      if (error) {
        console.error('Error analyzing comment:', error);
        return null;
      }

      return data as CommentAnalysisResult;
    } catch (err) {
      console.error('Failed to analyze comment:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const analyzeAppraisalBatch = useCallback(async (
    participantId: string,
    companyId: string
  ): Promise<BatchAnalysisResult | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('performance-comment-analyzer', {
        body: {
          action: 'analyze_batch',
          participantId,
          companyId,
        },
      });

      if (error) {
        console.error('Error analyzing batch:', error);
        return null;
      }

      return data as BatchAnalysisResult;
    } catch (err) {
      console.error('Failed to analyze batch:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const suggestAlternatives = useCallback(async (
    comment: string
  ): Promise<{ biasIndicators: BiasIndicator[]; suggestedAlternatives: SuggestedAlternative[] } | null> => {
    if (!comment || comment.trim().length === 0) {
      return null;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('performance-comment-analyzer', {
        body: {
          action: 'suggest_alternatives',
          comment,
        },
      });

      if (error) {
        console.error('Error suggesting alternatives:', error);
        return null;
      }

      return data as { biasIndicators: BiasIndicator[]; suggestedAlternatives: SuggestedAlternative[] };
    } catch (err) {
      console.error('Failed to suggest alternatives:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const validateRatingEvidence = useCallback(async (params: {
    employeeId: string;
    rating?: number;
    goalId?: string;
    competencyId?: string;
  }): Promise<EvidenceValidationResult | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('performance-comment-analyzer', {
        body: {
          action: 'validate_rating_evidence',
          ...params,
        },
      });

      if (error) {
        console.error('Error validating evidence:', error);
        return null;
      }

      return data as EvidenceValidationResult;
    } catch (err) {
      console.error('Failed to validate evidence:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return {
    analyzing,
    analyzeComment,
    analyzeAppraisalBatch,
    suggestAlternatives,
    validateRatingEvidence,
  };
}
