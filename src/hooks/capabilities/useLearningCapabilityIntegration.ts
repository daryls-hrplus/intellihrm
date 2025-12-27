import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CapabilityRow = Database['public']['Tables']['skills_competencies']['Row'];

interface LearningRecommendation {
  capability: CapabilityRow;
  current_level: number;
  target_level: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function useLearningCapabilityIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);

  /**
   * Get learning recommendations based on capability gaps
   */
  const getRecommendationsForGaps = useCallback(async (
    employeeId: string,
    targetCapabilities: { capability_id: string; target_level: number }[]
  ): Promise<LearningRecommendation[]> => {
    setIsLoading(true);
    try {
      const capabilityIds = targetCapabilities.map(t => t.capability_id);
      
      const [capabilitiesRes, evidenceRes] = await Promise.all([
        supabase.from("skills_competencies").select("*").in("id", capabilityIds),
        supabase.from("competency_evidence")
          .select("*")
          .eq("employee_id", employeeId)
          .in("competency_id", capabilityIds)
          .eq("validation_status", "validated")
          .order("effective_from", { ascending: false }),
      ]);

      if (capabilitiesRes.error) throw capabilitiesRes.error;
      
      const capabilities = capabilitiesRes.data || [];
      const evidence = evidenceRes.data || [];
      const recs: LearningRecommendation[] = [];

      for (const target of targetCapabilities) {
        const capability = capabilities.find(c => c.id === target.capability_id);
        if (!capability) continue;

        const latestEvidence = evidence.find(e => e.competency_id === target.capability_id);
        const currentLevel = latestEvidence?.proficiency_level || 0;
        const gap = target.target_level - currentLevel;

        if (gap > 0) {
          recs.push({
            capability,
            current_level: currentLevel,
            target_level: target.target_level,
            gap,
            priority: gap >= 2 ? 'HIGH' : gap === 1 ? 'MEDIUM' : 'LOW',
          });
        }
      }

      setRecommendations(recs);
      return recs;
    } catch (error) {
      console.error("Error getting learning recommendations:", error);
      toast.error("Failed to get learning recommendations");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Link a training completion to capability evidence
   */
  const recordTrainingCompletion = useCallback(async (
    employeeId: string,
    trainingId: string,
    capabilityId: string,
    achievedLevel: number
  ) => {
    try {
      const { data, error } = await supabase
        .from("competency_evidence")
        .insert({
          employee_id: employeeId,
          competency_id: capabilityId,
          evidence_source: "training_completion",
          proficiency_level: achievedLevel,
          validation_status: "pending",
          evidence_reference: { training_id: trainingId },
          effective_from: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Training completion recorded");
      return data;
    } catch (error) {
      console.error("Error recording training completion:", error);
      toast.error("Failed to record training completion");
      return null;
    }
  }, []);

  return {
    isLoading,
    recommendations,
    getRecommendationsForGaps,
    recordTrainingCompletion,
  };
}
