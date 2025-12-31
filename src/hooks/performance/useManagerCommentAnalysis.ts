import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CommentAnalysis {
  id?: string;
  wordCount: number;
  sentenceCount: number;
  depthScore: number;
  specificityScore: number;
  actionabilityScore: number;
  overallScore: number;
  evidencePresent: boolean;
  examplesPresent: boolean;
  forwardLooking: boolean;
  balancedFeedback: boolean;
  issues: Array<{
    type: string;
    description: string;
  }>;
  suggestions: string[];
  confidence: number;
}

export interface CommentMetrics {
  avgDepthScore: number;
  avgSpecificityScore: number;
  avgActionabilityScore: number;
  avgOverallScore: number;
  totalComments: number;
  commentsWithEvidence: number;
  commentsWithExamples: number;
}

export interface StoredCommentAnalysis {
  id: string;
  managerId: string;
  participantId?: string;
  cycleId?: string;
  commentText: string;
  commentType: string;
  commentLength: number;
  wordCount: number;
  depthScore: number;
  specificityScore: number;
  actionabilityScore: number;
  overallQualityScore: number;
  evidencePresent: boolean;
  examplesPresent: boolean;
  forwardLooking: boolean;
  balancedFeedback: boolean;
  issuesDetected: Array<{ type: string; description: string }>;
  improvementSuggestions: string[];
  aiConfidenceScore: number;
  analyzedAt: string;
}

export function useManagerCommentAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CommentAnalysis | null>(null);
  const [metrics, setMetrics] = useState<CommentMetrics | null>(null);
  const { toast } = useToast();

  const analyzeComment = useCallback(async (
    managerId: string,
    companyId: string,
    comment: string,
    participantId?: string,
    commentType?: string
  ): Promise<CommentAnalysis | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manager-capability-analyzer', {
        body: {
          action: 'analyze_comment_quality',
          managerId,
          companyId,
          participantId,
          comment,
          commentType,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setAnalysis(data.data);
      return data.data;
    } catch (error) {
      console.error('Error analyzing comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze comment',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCommentMetrics = useCallback(async (
    managerId: string,
    companyId: string,
    cycleId?: string
  ): Promise<CommentMetrics | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manager-capability-analyzer', {
        body: {
          action: 'analyze_comment_quality',
          managerId,
          companyId,
          cycleId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const resultMetrics = data.data.averageScores;
      setMetrics(resultMetrics);
      return resultMetrics;
    } catch (error) {
      console.error('Error fetching comment metrics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBatchAnalysis = useCallback(async (
    managerId: string,
    companyId: string,
    cycleId?: string
  ): Promise<StoredCommentAnalysis[]> => {
    try {
      let query = supabase
        .from('manager_comment_analysis')
        .select('*')
        .eq('manager_id', managerId)
        .eq('company_id', companyId)
        .order('analyzed_at', { ascending: false });

      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        managerId: d.manager_id,
        participantId: d.participant_id || undefined,
        cycleId: d.cycle_id || undefined,
        commentText: d.comment_text || '',
        commentType: d.comment_type || 'general',
        commentLength: d.comment_length || 0,
        wordCount: d.word_count || 0,
        depthScore: d.depth_score || 0,
        specificityScore: d.specificity_score || 0,
        actionabilityScore: d.actionability_score || 0,
        overallQualityScore: d.overall_quality_score || 0,
        evidencePresent: d.evidence_present || false,
        examplesPresent: d.examples_present || false,
        forwardLooking: d.forward_looking || false,
        balancedFeedback: d.balanced_feedback || false,
        issuesDetected: (d.issues_detected as any[]) || [],
        improvementSuggestions: (d.improvement_suggestions as string[]) || [],
        aiConfidenceScore: d.ai_confidence_score || 0,
        analyzedAt: d.analyzed_at || d.created_at,
      }));
    } catch (error) {
      console.error('Error fetching batch analysis:', error);
      return [];
    }
  }, []);

  const getQualityDistribution = useCallback((analyses: StoredCommentAnalysis[]) => {
    if (analyses.length === 0) {
      return { excellent: 0, good: 0, needsImprovement: 0, poor: 0 };
    }

    return {
      excellent: analyses.filter(a => a.overallQualityScore >= 80).length,
      good: analyses.filter(a => a.overallQualityScore >= 60 && a.overallQualityScore < 80).length,
      needsImprovement: analyses.filter(a => a.overallQualityScore >= 40 && a.overallQualityScore < 60).length,
      poor: analyses.filter(a => a.overallQualityScore < 40).length,
    };
  }, []);

  const getIssuesSummary = useCallback((analyses: StoredCommentAnalysis[]) => {
    const issueCount: Record<string, number> = {};
    
    analyses.forEach(a => {
      a.issuesDetected.forEach(issue => {
        issueCount[issue.type] = (issueCount[issue.type] || 0) + 1;
      });
    });

    return Object.entries(issueCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  return {
    loading,
    analysis,
    metrics,
    analyzeComment,
    fetchCommentMetrics,
    getBatchAnalysis,
    getQualityDistribution,
    getIssuesSummary,
  };
}
