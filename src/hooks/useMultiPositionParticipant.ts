import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PositionWeight {
  id: string;
  position_id: string;
  position_title: string;
  job_id: string | null;
  job_title: string | null;
  weight_percentage: number;
  is_primary: boolean;
  competency_score: number | null;
  responsibility_score: number | null;
  goal_score: number | null;
  overall_score: number | null;
}

export interface MultiPositionInfo {
  hasMultiplePositions: boolean;
  positions: PositionWeight[];
  multiPositionMode: "aggregate" | "separate";
}

export function useMultiPositionParticipant(participantId: string | null, cycleId: string | null) {
  const [info, setInfo] = useState<MultiPositionInfo>({
    hasMultiplePositions: false,
    positions: [],
    multiPositionMode: "aggregate",
  });
  const [loading, setLoading] = useState(false);

  const fetchMultiPositionInfo = useCallback(async () => {
    if (!participantId || !cycleId) return;

    setLoading(true);
    try {
      // Fetch cycle multi-position mode
      const { data: cycle } = await supabase
        .from("appraisal_cycles")
        .select("multi_position_mode")
        .eq("id", cycleId)
        .single();

      const mode = (cycle?.multi_position_mode as "aggregate" | "separate") || "aggregate";

      // Fetch position weights for this participant
      const { data: weights } = await (supabase
        .from("appraisal_position_weights" as any)
        .select(`
          id,
          position_id,
          job_id,
          weight_percentage,
          is_primary,
          competency_score,
          responsibility_score,
          goal_score,
          overall_score,
          positions:position_id (title, job_id, jobs:job_id (title))
        `)
        .eq("participant_id", participantId) as any);

      if (weights && weights.length > 1) {
        setInfo({
          hasMultiplePositions: true,
          multiPositionMode: mode,
          positions: weights.map((w: any) => ({
            id: w.id,
            position_id: w.position_id,
            position_title: w.positions?.title || "Unknown Position",
            job_id: w.job_id || w.positions?.job_id,
            job_title: w.positions?.jobs?.title || null,
            weight_percentage: w.weight_percentage,
            is_primary: w.is_primary,
            competency_score: w.competency_score,
            responsibility_score: w.responsibility_score,
            goal_score: w.goal_score,
            overall_score: w.overall_score,
          })),
        });
      } else if (weights && weights.length === 1) {
        // Single position but still tracked
        setInfo({
          hasMultiplePositions: false,
          multiPositionMode: mode,
          positions: weights.map((w: any) => ({
            id: w.id,
            position_id: w.position_id,
            position_title: w.positions?.title || "Unknown Position",
            job_id: w.job_id || w.positions?.job_id,
            job_title: w.positions?.jobs?.title || null,
            weight_percentage: 100,
            is_primary: true,
            competency_score: w.competency_score,
            responsibility_score: w.responsibility_score,
            goal_score: w.goal_score,
            overall_score: w.overall_score,
          })),
        });
      } else {
        // No position weights - check if employee has multiple positions
        const { data: participant } = await supabase
          .from("appraisal_participants")
          .select("employee_id")
          .eq("id", participantId)
          .single();

        if (participant) {
          const { data: positions, count } = await supabase
            .from("employee_positions")
            .select("position_id", { count: "exact" })
            .eq("employee_id", participant.employee_id)
            .eq("is_active", true);

          setInfo({
            hasMultiplePositions: (count || 0) > 1,
            multiPositionMode: mode,
            positions: [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching multi-position info:", error);
    } finally {
      setLoading(false);
    }
  }, [participantId, cycleId]);

  useEffect(() => {
    fetchMultiPositionInfo();
  }, [fetchMultiPositionInfo]);

  const updatePositionScores = useCallback(
    async (positionId: string, scores: Partial<Pick<PositionWeight, "competency_score" | "responsibility_score" | "goal_score" | "overall_score">>) => {
      const positionWeight = info.positions.find((p) => p.position_id === positionId);
      if (!positionWeight) return;

      try {
        await (supabase
          .from("appraisal_position_weights" as any)
          .update(scores)
          .eq("id", positionWeight.id) as any);

        await fetchMultiPositionInfo();
      } catch (error) {
        console.error("Error updating position scores:", error);
      }
    },
    [info.positions, fetchMultiPositionInfo]
  );

  const calculateAggregatedScore = useCallback(() => {
    if (!info.hasMultiplePositions || info.positions.length === 0) return null;

    let totalWeight = 0;
    let weightedSum = 0;

    for (const position of info.positions) {
      if (position.overall_score !== null) {
        weightedSum += position.overall_score * position.weight_percentage;
        totalWeight += position.weight_percentage;
      }
    }

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  }, [info]);

  return {
    ...info,
    loading,
    refetch: fetchMultiPositionInfo,
    updatePositionScores,
    calculateAggregatedScore,
  };
}
