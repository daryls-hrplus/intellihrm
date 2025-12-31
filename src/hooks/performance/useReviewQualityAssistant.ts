import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReviewQualityIssue {
  type: 'inconsistent_scoring' | 'missing_evidence' | 'bias_detected' | 'vague_comment' | 'inflation_risk';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  isoClause?: string;
}

export interface ClarifyingPrompt {
  question: string;
  context: string;
  suggestedApproach: string;
}

export interface ReviewQualityAssessment {
  participantId: string;
  qualityScore: number;
  consistencyScore: number;
  evidenceCoverageScore: number;
  biasFreeScore: number;
  issues: ReviewQualityIssue[];
  clarifyingPrompts: ClarifyingPrompt[];
  isReadyForSubmission: boolean;
  aiModelUsed?: string;
  aiConfidenceScore?: number;
  analyzedAt: string;
}

export interface ReviewReadinessResult {
  isReady: boolean;
  blockers: ReviewQualityIssue[];
  warnings: ReviewQualityIssue[];
  overallQuality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
}

export function useReviewQualityAssistant() {
  const [analyzing, setAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<ReviewQualityAssessment | null>(null);

  const analyzeReviewQuality = useCallback(async (
    participantId: string,
    companyId: string,
    scores?: Array<{ competencyId?: string; goalId?: string; score: number; comment: string }>
  ): Promise<ReviewQualityAssessment | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('review-quality-assistant', {
        body: {
          action: 'analyze_review_quality',
          participantId,
          companyId,
          scores,
        },
      });

      if (error) {
        console.error('Error analyzing review quality:', error);
        return null;
      }

      const result = data as ReviewQualityAssessment;
      setAssessment(result);
      return result;
    } catch (err) {
      console.error('Failed to analyze review quality:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const detectInconsistentScoring = useCallback(async (
    participantId: string,
    companyId: string
  ): Promise<ReviewQualityIssue[] | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('review-quality-assistant', {
        body: {
          action: 'detect_inconsistent_scoring',
          participantId,
          companyId,
        },
      });

      if (error) {
        console.error('Error detecting inconsistent scoring:', error);
        return null;
      }

      return data.issues as ReviewQualityIssue[];
    } catch (err) {
      console.error('Failed to detect inconsistent scoring:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const detectMissingEvidence = useCallback(async (
    participantId: string,
    companyId: string
  ): Promise<ReviewQualityIssue[] | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('review-quality-assistant', {
        body: {
          action: 'detect_missing_evidence',
          participantId,
          companyId,
        },
      });

      if (error) {
        console.error('Error detecting missing evidence:', error);
        return null;
      }

      return data.issues as ReviewQualityIssue[];
    } catch (err) {
      console.error('Failed to detect missing evidence:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const generateClarifyingPrompts = useCallback(async (
    participantId: string,
    companyId: string,
    issues?: ReviewQualityIssue[]
  ): Promise<ClarifyingPrompt[] | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('review-quality-assistant', {
        body: {
          action: 'generate_clarifying_prompts',
          participantId,
          companyId,
          issues,
        },
      });

      if (error) {
        console.error('Error generating clarifying prompts:', error);
        return null;
      }

      return data.prompts as ClarifyingPrompt[];
    } catch (err) {
      console.error('Failed to generate clarifying prompts:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const calculateReviewReadiness = useCallback(async (
    participantId: string,
    companyId: string
  ): Promise<ReviewReadinessResult | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('review-quality-assistant', {
        body: {
          action: 'calculate_review_readiness',
          participantId,
          companyId,
        },
      });

      if (error) {
        console.error('Error calculating review readiness:', error);
        return null;
      }

      return data as ReviewReadinessResult;
    } catch (err) {
      console.error('Failed to calculate review readiness:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return {
    analyzing,
    assessment,
    analyzeReviewQuality,
    detectInconsistentScoring,
    detectMissingEvidence,
    generateClarifyingPrompts,
    calculateReviewReadiness,
  };
}
