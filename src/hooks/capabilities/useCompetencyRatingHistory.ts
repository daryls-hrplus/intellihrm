import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type RatingSource = 'appraisal' | 'assessment' | '360_review' | 'calibration';

export interface CompetencyRatingHistory {
  id: string;
  company_id: string | null;
  employee_id: string;
  capability_id: string;
  appraisal_cycle_id: string | null;
  rating_period_start: string;
  rating_period_end: string;
  rating_level: number;
  previous_rating_level: number | null;
  rating_change: number;
  job_id: string | null;
  job_family_id: string | null;
  job_level: string | null;
  evidence_count: number;
  validation_count: number;
  avg_confidence_score: number | null;
  rated_by: string | null;
  rating_source: RatingSource | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  capability?: { name: string; code: string; type: string } | null;
  job?: { name: string } | null;
  job_family?: { name: string } | null;
  rater?: { full_name: string } | null;
  cycle?: { name: string } | null;
}

export interface CreateRatingHistoryData {
  capability_id: string;
  rating_period_start: string;
  rating_period_end: string;
  rating_level: number;
  previous_rating_level?: number;
  appraisal_cycle_id?: string;
  job_id?: string;
  job_family_id?: string;
  job_level?: string;
  evidence_count?: number;
  validation_count?: number;
  avg_confidence_score?: number;
  rating_source?: RatingSource;
  notes?: string;
}

export interface DriftAnalysis {
  capability_id: string;
  capability_name: string;
  current_level: number;
  previous_level: number;
  change: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  periods_analyzed: number;
  avg_change_per_period: number;
  // New: confidence tracking
  current_confidence: number | null;
  confidence_trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | null;
}

export function useCompetencyRatingHistory() {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<CompetencyRatingHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRatingHistory = useCallback(async (
    employeeId: string,
    capabilityId?: string
  ): Promise<CompetencyRatingHistory[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      let query = supabase
        .from("competency_rating_history")
        .select(`
          *,
          capability:skills_competencies(name, code, type),
          job:jobs(name),
          job_family:job_families(name),
          rater:profiles!competency_rating_history_rated_by_fkey(full_name),
          cycle:appraisal_cycles(name)
        `)
        .eq("employee_id", employeeId)
        .order("rating_period_end", { ascending: false });

      if (capabilityId) {
        query = query.eq("capability_id", capabilityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory((data || []) as CompetencyRatingHistory[]);
      return data as CompetencyRatingHistory[];
    } catch (error: any) {
      console.error("Error fetching rating history:", error);
      toast.error("Failed to load rating history");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const recordRating = useCallback(async (
    employeeId: string,
    data: CreateRatingHistoryData
  ): Promise<CompetencyRatingHistory | null> => {
    if (!user || !profile) return null;

    try {
      const { data: newRating, error } = await supabase
        .from("competency_rating_history")
        .insert({
          company_id: profile.company_id,
          employee_id: employeeId,
          rated_by: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Rating recorded");
      return newRating as CompetencyRatingHistory;
    } catch (error: any) {
      console.error("Error recording rating:", error);
      toast.error("Failed to record rating");
      return null;
    }
  }, [user, profile]);

  const fetchDriftAnalysis = useCallback(async (
    employeeId: string
  ): Promise<DriftAnalysis[]> => {
    if (!user) return [];

    try {
      // Fetch rating history
      const { data, error } = await supabase
        .from("competency_rating_history")
        .select(`
          capability_id,
          rating_level,
          rating_period_end,
          avg_confidence_score,
          capability:skills_competencies(name)
        `)
        .eq("employee_id", employeeId)
        .order("rating_period_end", { ascending: true });

      if (error) throw error;

      // Group by capability and calculate drift
      const byCapability = (data || []).reduce((acc, record) => {
        const capId = record.capability_id;
        if (!acc[capId]) {
          acc[capId] = {
            capability_id: capId,
            capability_name: (record.capability as any)?.name || "Unknown",
            ratings: [],
            confidences: [],
          };
        }
        acc[capId].ratings.push(record.rating_level);
        if (record.avg_confidence_score !== null) {
          acc[capId].confidences.push(record.avg_confidence_score);
        }
        return acc;
      }, {} as Record<string, { 
        capability_id: string; 
        capability_name: string; 
        ratings: number[];
        confidences: number[];
      }>);

      // Calculate drift metrics
      return Object.values(byCapability).map(cap => {
        const ratings = cap.ratings;
        const confidences = cap.confidences;
        const periodsAnalyzed = ratings.length;
        const currentLevel = ratings[ratings.length - 1] || 0;
        const previousLevel = ratings.length > 1 ? ratings[ratings.length - 2] : currentLevel;
        const firstLevel = ratings[0] || 0;
        const totalChange = currentLevel - firstLevel;
        const avgChangePerPeriod = periodsAnalyzed > 1 ? totalChange / (periodsAnalyzed - 1) : 0;

        let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
        if (avgChangePerPeriod > 0.1) trend = 'IMPROVING';
        else if (avgChangePerPeriod < -0.1) trend = 'DECLINING';

        // Calculate confidence trend
        const currentConfidence = confidences.length > 0 ? confidences[confidences.length - 1] : null;
        let confidenceTrend: 'IMPROVING' | 'STABLE' | 'DECLINING' | null = null;
        
        if (confidences.length >= 2) {
          const firstConf = confidences[0];
          const lastConf = confidences[confidences.length - 1];
          const confChange = lastConf - firstConf;
          if (confChange > 0.05) confidenceTrend = 'IMPROVING';
          else if (confChange < -0.05) confidenceTrend = 'DECLINING';
          else confidenceTrend = 'STABLE';
        }

        return {
          capability_id: cap.capability_id,
          capability_name: cap.capability_name,
          current_level: currentLevel,
          previous_level: previousLevel,
          change: currentLevel - previousLevel,
          trend,
          periods_analyzed: periodsAnalyzed,
          avg_change_per_period: Math.round(avgChangePerPeriod * 100) / 100,
          current_confidence: currentConfidence,
          confidence_trend: confidenceTrend,
        };
      });
    } catch (error: any) {
      console.error("Error fetching drift analysis:", error);
      return [];
    }
  }, [user]);

  const getCapabilityTrend = useCallback((
    historyData: CompetencyRatingHistory[]
  ): 'IMPROVING' | 'STABLE' | 'DECLINING' => {
    if (historyData.length < 2) return 'STABLE';
    
    const sorted = [...historyData].sort(
      (a, b) => new Date(a.rating_period_end).getTime() - new Date(b.rating_period_end).getTime()
    );
    
    const firstLevel = sorted[0].rating_level;
    const lastLevel = sorted[sorted.length - 1].rating_level;
    const diff = lastLevel - firstLevel;
    
    if (diff > 0) return 'IMPROVING';
    if (diff < 0) return 'DECLINING';
    return 'STABLE';
  }, []);

  const getHistoryByPeriod = useCallback((
    historyData: CompetencyRatingHistory[]
  ): { period: string; avgRating: number; count: number }[] => {
    const byPeriod = historyData.reduce((acc, record) => {
      const periodKey = `${record.rating_period_start} - ${record.rating_period_end}`;
      if (!acc[periodKey]) {
        acc[periodKey] = { sum: 0, count: 0 };
      }
      acc[periodKey].sum += record.rating_level;
      acc[periodKey].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    return Object.entries(byPeriod).map(([period, data]) => ({
      period,
      avgRating: Math.round((data.sum / data.count) * 100) / 100,
      count: data.count,
    }));
  }, []);

  return {
    history,
    loading,
    fetchRatingHistory,
    recordRating,
    fetchDriftAnalysis,
    getCapabilityTrend,
    getHistoryByPeriod,
  };
}
