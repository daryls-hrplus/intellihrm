import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CapabilityMetrics {
  managerId: string;
  cycleId?: string;
  timelinessScore: number;
  commentQualityScore: number;
  differentiationScore: number;
  calibrationAlignmentScore: number;
  overallCapabilityScore: number;
  capabilityTrend: 'improving' | 'stable' | 'declining';
  breakdown: {
    timeliness: {
      totalReviewsAssigned: number;
      reviewsCompleted: number;
      reviewsOnTime: number;
      reviewsLate: number;
      avgDaysBeforeDeadline: number;
      timelinessScore: number;
    };
    commentQuality: {
      avgDepthScore: number;
      avgSpecificityScore: number;
      avgActionabilityScore: number;
      avgOverallScore: number;
      totalComments: number;
      commentsWithEvidence: number;
      commentsWithExamples: number;
    } | null;
    scoreVariance: {
      avgScore: number;
      stdDeviation: number;
      distribution: Record<number, number>;
      differentiationScore: number;
      totalScores: number;
    };
    calibrationAlignment: {
      score: number;
    };
  };
  calculatedAt: string;
}

export interface CoachingRecommendation {
  area: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
}

export function useManagerCapabilityMetrics() {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<CapabilityMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<CoachingRecommendation[]>([]);
  const { toast } = useToast();

  const calculateMetrics = useCallback(async (
    managerId: string, 
    companyId: string, 
    cycleId?: string
  ): Promise<CapabilityMetrics | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manager-capability-analyzer', {
        body: {
          action: 'generate_capability_scorecard',
          managerId,
          companyId,
          cycleId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setMetrics(data.data);
      return data.data;
    } catch (error) {
      console.error('Error calculating capability metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate capability metrics',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCapabilityScorecard = useCallback(async (
    managerId: string,
    companyId: string
  ): Promise<CapabilityMetrics | null> => {
    try {
      const { data, error } = await supabase
        .from('manager_capability_metrics')
        .select('*')
        .eq('manager_id', managerId)
        .eq('company_id', companyId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const mapped: CapabilityMetrics = {
          managerId: data.manager_id,
          cycleId: data.cycle_id || undefined,
          timelinessScore: data.timeliness_score || 0,
          commentQualityScore: data.comment_quality_score || 0,
          differentiationScore: data.differentiation_score || 0,
          calibrationAlignmentScore: data.calibration_alignment_score || 0,
          overallCapabilityScore: data.overall_capability_score || 0,
          capabilityTrend: (data.capability_trend as 'improving' | 'stable' | 'declining') || 'stable',
          breakdown: (data.calculation_details as any) || {
            timeliness: {
              totalReviewsAssigned: data.total_reviews_assigned,
              reviewsCompleted: data.reviews_completed,
              reviewsOnTime: data.reviews_on_time,
              reviewsLate: data.reviews_late,
              avgDaysBeforeDeadline: data.avg_days_before_deadline,
              timelinessScore: data.timeliness_score,
            },
            commentQuality: {
              avgDepthScore: data.avg_comment_depth_score,
              avgSpecificityScore: 0,
              avgActionabilityScore: 0,
              avgOverallScore: data.comment_quality_score,
              totalComments: data.avg_comment_length,
              commentsWithEvidence: data.comments_with_evidence,
              commentsWithExamples: data.comments_with_examples,
            },
            scoreVariance: {
              avgScore: data.avg_score_given,
              stdDeviation: data.score_std_deviation,
              distribution: (data.score_distribution as Record<number, number>) || {},
              differentiationScore: data.differentiation_score,
              totalScores: 0,
            },
            calibrationAlignment: {
              score: data.calibration_alignment_score,
            },
          },
          calculatedAt: data.calculated_at,
        };
        setMetrics(mapped);
        return mapped;
      }
      return null;
    } catch (error) {
      console.error('Error fetching capability scorecard:', error);
      return null;
    }
  }, []);

  const getCapabilityTrend = useCallback(async (
    managerId: string,
    companyId: string
  ): Promise<Array<{ cycleId: string; score: number; date: string }>> => {
    try {
      const { data, error } = await supabase
        .from('manager_capability_metrics')
        .select('cycle_id, overall_capability_score, calculated_at')
        .eq('manager_id', managerId)
        .eq('company_id', companyId)
        .order('calculated_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(d => ({
        cycleId: d.cycle_id || '',
        score: d.overall_capability_score || 0,
        date: d.calculated_at,
      }));
    } catch (error) {
      console.error('Error fetching capability trend:', error);
      return [];
    }
  }, []);

  const getCoachingRecommendations = useCallback(async (
    managerId: string,
    companyId: string,
    cycleId?: string
  ): Promise<CoachingRecommendation[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manager-capability-analyzer', {
        body: {
          action: 'generate_coaching_recommendations',
          managerId,
          companyId,
          cycleId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setRecommendations(data.data.recommendations || []);
      return data.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching coaching recommendations:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const batchAnalyzeManagers = useCallback(async (
    companyId: string,
    cycleId?: string
  ): Promise<{ totalManagers: number; analyzed: number; failed: number }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manager-capability-analyzer', {
        body: {
          action: 'batch_analyze_managers',
          companyId,
          cycleId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: 'Analysis Complete',
        description: `Analyzed ${data.data.analyzed} of ${data.data.totalManagers} managers`,
      });

      return data.data;
    } catch (error) {
      console.error('Error batch analyzing managers:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze managers',
        variant: 'destructive',
      });
      return { totalManagers: 0, analyzed: 0, failed: 0 };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    metrics,
    recommendations,
    calculateMetrics,
    fetchCapabilityScorecard,
    getCapabilityTrend,
    getCoachingRecommendations,
    batchAnalyzeManagers,
  };
}
