// Hook to check if a competency is currently in use in active appraisal cycles
// This prevents deprecation/major edits during active cycles

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveAppraisalCycle {
  cycle_id: string;
  cycle_name: string;
  status: string;
  participants_count: number;
  scores_count: number;
  start_date: string;
  end_date: string;
}

export interface CompetencyUsage {
  activeAppraisalCycles: ActiveAppraisalCycle[];
  totalScoresInActiveCycles: number;
  isBlockedFromDeprecation: boolean;
  isBlockedFromMajorEdits: boolean;
  warningMessage: string | null;
  pendingDeprecationAllowed: boolean;
}

export function useCompetencyUsageCheck() {
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<CompetencyUsage | null>(null);

  const checkUsage = useCallback(async (competencyId: string): Promise<CompetencyUsage> => {
    setLoading(true);
    try {
      // Find all appraisal_scores where this competency is used
      // and the cycle is active/in_progress
      const { data: scoresData, error: scoresError } = await supabase
        .from("appraisal_scores")
        .select(`
          id,
          participant_id,
          item_id,
          appraisal_participants!inner(
            id,
            cycle_id,
            appraisal_cycles!inner(
              id,
              name,
              status,
              start_date,
              end_date
            )
          )
        `)
        .eq("evaluation_type", "competency")
        .or(`item_id.eq.${competencyId},item_id.ilike.%-${competencyId}`);

      if (scoresError) {
        console.error("Error checking competency usage:", scoresError);
        throw scoresError;
      }

      // Filter to only active/in_progress cycles
      const activeCycleScores = (scoresData || []).filter((score: any) => {
        const cycleStatus = score.appraisal_participants?.appraisal_cycles?.status;
        return cycleStatus === "active" || cycleStatus === "in_progress";
      });

      // Group by cycle
      const cycleMap = new Map<string, ActiveAppraisalCycle>();
      const participantsByycle = new Map<string, Set<string>>();

      for (const score of activeCycleScores) {
        const cycle = (score as any).appraisal_participants?.appraisal_cycles;
        if (!cycle) continue;

        const cycleId = cycle.id;
        if (!cycleMap.has(cycleId)) {
          cycleMap.set(cycleId, {
            cycle_id: cycleId,
            cycle_name: cycle.name,
            status: cycle.status,
            participants_count: 0,
            scores_count: 0,
            start_date: cycle.start_date,
            end_date: cycle.end_date,
          });
          participantsByycle.set(cycleId, new Set());
        }

        const existing = cycleMap.get(cycleId)!;
        existing.scores_count++;
        
        const participantId = (score as any).appraisal_participants?.id;
        if (participantId) {
          participantsByycle.get(cycleId)!.add(participantId);
        }
      }

      // Update participant counts
      for (const [cycleId, participants] of participantsByycle) {
        const cycle = cycleMap.get(cycleId);
        if (cycle) {
          cycle.participants_count = participants.size;
        }
      }

      const activeAppraisalCycles = Array.from(cycleMap.values());
      const totalScoresInActiveCycles = activeCycleScores.length;
      const isBlockedFromDeprecation = activeAppraisalCycles.length > 0;
      const isBlockedFromMajorEdits = totalScoresInActiveCycles > 0;

      let warningMessage: string | null = null;
      if (isBlockedFromDeprecation) {
        const cycleNames = activeAppraisalCycles.map(c => c.cycle_name).join(", ");
        warningMessage = `This competency is currently being used in ${activeAppraisalCycles.length} active appraisal cycle(s): ${cycleNames}. It cannot be deprecated until these cycles are closed.`;
      }

      const result: CompetencyUsage = {
        activeAppraisalCycles,
        totalScoresInActiveCycles,
        isBlockedFromDeprecation,
        isBlockedFromMajorEdits,
        warningMessage,
        pendingDeprecationAllowed: isBlockedFromDeprecation, // Can set to pending_deprecation if blocked
      };

      setUsage(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearUsage = useCallback(() => {
    setUsage(null);
  }, []);

  return {
    loading,
    usage,
    checkUsage,
    clearUsage,
  };
}
