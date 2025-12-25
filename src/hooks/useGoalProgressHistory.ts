import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GoalProgressEntry {
  id: string;
  goal_id: string;
  recorded_by: string | null;
  recorded_at: string;
  progress_percentage: number;
  previous_percentage: number | null;
  current_value: number | null;
  previous_value: number | null;
  source: "manual" | "milestone" | "check_in" | "kpi_sync" | "rollup";
  source_id: string | null;
  notes: string | null;
}

export interface ProgressTrend {
  date: string;
  progress: number;
  source: string;
}

export function useGoalProgressHistory(goalId?: string) {
  const [history, setHistory] = useState<GoalProgressEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (targetGoalId?: string) => {
    const gId = targetGoalId || goalId;
    if (!gId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_progress_history")
        .select("*")
        .eq("goal_id", gId)
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      setHistory((data || []) as GoalProgressEntry[]);
    } catch (error) {
      console.error("Error fetching progress history:", error);
      toast.error("Failed to load progress history");
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  const logProgress = useCallback(async (
    targetGoalId: string,
    progressPercentage: number,
    source: GoalProgressEntry["source"],
    options?: {
      previousPercentage?: number;
      currentValue?: number;
      previousValue?: number;
      sourceId?: string;
      notes?: string;
    }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("goal_progress_history")
        .insert({
          goal_id: targetGoalId,
          progress_percentage: progressPercentage,
          previous_percentage: options?.previousPercentage,
          current_value: options?.currentValue,
          previous_value: options?.previousValue,
          source,
          source_id: options?.sourceId,
          notes: options?.notes,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error logging progress:", error);
      return false;
    }
  }, []);

  const getProgressTrend = useCallback((): ProgressTrend[] => {
    return history.map(entry => ({
      date: entry.recorded_at,
      progress: entry.progress_percentage,
      source: entry.source,
    }));
  }, [history]);

  const getProgressChange = useCallback((days: number = 30): {
    startProgress: number;
    endProgress: number;
    change: number;
    percentageChange: number;
  } => {
    if (history.length === 0) {
      return { startProgress: 0, endProgress: 0, change: 0, percentageChange: 0 };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const startEntry = history.find(
      entry => new Date(entry.recorded_at) >= cutoffDate
    ) || history[0];

    const endEntry = history[history.length - 1];

    const startProgress = startEntry.progress_percentage;
    const endProgress = endEntry.progress_percentage;
    const change = endProgress - startProgress;
    const percentageChange = startProgress > 0
      ? Math.round((change / startProgress) * 100)
      : change > 0 ? 100 : 0;

    return { startProgress, endProgress, change, percentageChange };
  }, [history]);

  const getAverageProgressRate = useCallback((): number => {
    if (history.length < 2) return 0;

    const first = history[0];
    const last = history[history.length - 1];

    const daysDiff = Math.max(1,
      (new Date(last.recorded_at).getTime() - new Date(first.recorded_at).getTime())
      / (1000 * 60 * 60 * 24)
    );

    const progressDiff = last.progress_percentage - first.progress_percentage;
    
    // Progress per day
    return Math.round((progressDiff / daysDiff) * 10) / 10;
  }, [history]);

  const getSourceBreakdown = useCallback((): Record<string, number> => {
    const breakdown: Record<string, number> = {};
    
    history.forEach(entry => {
      breakdown[entry.source] = (breakdown[entry.source] || 0) + 1;
    });

    return breakdown;
  }, [history]);

  return {
    history,
    loading,
    fetchHistory,
    logProgress,
    getProgressTrend,
    getProgressChange,
    getAverageProgressRate,
    getSourceBreakdown,
  };
}
