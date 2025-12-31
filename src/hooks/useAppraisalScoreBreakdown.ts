import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScoreBreakdown {
  id: string;
  participant_id: string;
  company_id: string;
  cycle_id: string;
  goals_raw_score: number | null;
  goals_weight: number | null;
  goals_contribution: number | null;
  goals_item_count: number;
  competencies_raw_score: number | null;
  competencies_weight: number | null;
  competencies_contribution: number | null;
  competencies_item_count: number;
  responsibilities_raw_score: number | null;
  responsibilities_weight: number | null;
  responsibilities_contribution: number | null;
  responsibilities_item_count: number;
  values_raw_score: number | null;
  values_weight: number | null;
  values_contribution: number | null;
  values_item_count: number;
  feedback_360_raw_score: number | null;
  feedback_360_weight: number | null;
  feedback_360_contribution: number | null;
  feedback_360_response_count: number;
  feedback_360_completion_rate: number | null;
  pre_calibration_score: number | null;
  calibration_adjustment: number | null;
  post_calibration_score: number | null;
  calibration_session_id: string | null;
  calibration_reason: string | null;
  was_calibrated: boolean;
  evidence_count: number;
  validated_evidence_count: number;
  evidence_summary: Record<string, number>;
  ai_quality_score: number | null;
  ai_flags: string[];
  performance_category_id: string | null;
  category_thresholds: Record<string, { min: number; max: number }> | null;
  calculated_at: string;
  calculation_version: number;
  created_at: string;
  updated_at: string;
}

export interface ScoreComponent {
  name: string;
  rawScore: number | null;
  weight: number | null;
  contribution: number | null;
  itemCount: number;
  color: string;
}

export function useAppraisalScoreBreakdown(participantId: string | undefined) {
  return useQuery({
    queryKey: ["appraisal-score-breakdown", participantId],
    queryFn: async () => {
      if (!participantId) return null;
      const { data, error } = await supabase
        .from("appraisal_score_breakdown")
        .select("*")
        .eq("participant_id", participantId)
        .maybeSingle();
      if (error) throw error;
      return data as ScoreBreakdown | null;
    },
    enabled: !!participantId,
  });
}

export function useCalculateScoreBreakdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ participantId, cycleId, companyId }: { participantId: string; cycleId: string; companyId: string }) => {
      // Fetch participant and cycle data
      const [participantRes, cycleRes] = await Promise.all([
        supabase.from("appraisal_participants").select("*").eq("id", participantId).single(),
        supabase.from("appraisal_cycles").select("*").eq("id", cycleId).single(),
      ]);

      if (participantRes.error) throw participantRes.error;
      if (cycleRes.error) throw cycleRes.error;

      const participant = participantRes.data;
      const cycle = cycleRes.data;

      // Calculate contributions
      const goalsContribution = (participant.goal_score || 0) * (cycle.goal_weight / 100);
      const competenciesContribution = (participant.competency_score || 0) * (cycle.competency_weight / 100);
      const responsibilitiesContribution = (participant.responsibility_score || 0) * (cycle.responsibility_weight / 100);

      // Get performance category
      const { data: category } = await supabase
        .from("performance_categories")
        .select("id")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .gte("max_score", participant.overall_score || 0)
        .lte("min_score", participant.overall_score || 0)
        .maybeSingle();

      const breakdownData = {
        participant_id: participantId,
        company_id: companyId,
        cycle_id: cycleId,
        goals_raw_score: participant.goal_score,
        goals_weight: cycle.goal_weight,
        goals_contribution: goalsContribution,
        goals_item_count: 0,
        competencies_raw_score: participant.competency_score,
        competencies_weight: cycle.competency_weight,
        competencies_contribution: competenciesContribution,
        competencies_item_count: 0,
        responsibilities_raw_score: participant.responsibility_score,
        responsibilities_weight: cycle.responsibility_weight,
        responsibilities_contribution: responsibilitiesContribution,
        responsibilities_item_count: 0,
        values_raw_score: null,
        values_weight: cycle.values_weight || 0,
        values_contribution: 0,
        values_item_count: 0,
        feedback_360_raw_score: null,
        feedback_360_weight: cycle.feedback_360_weight || 0,
        feedback_360_contribution: 0,
        feedback_360_response_count: 0,
        feedback_360_completion_rate: null,
        pre_calibration_score: participant.overall_score,
        calibration_adjustment: 0,
        post_calibration_score: participant.overall_score,
        calibration_session_id: null,
        calibration_reason: null,
        was_calibrated: false,
        evidence_count: 0,
        validated_evidence_count: 0,
        evidence_summary: {},
        ai_quality_score: null,
        ai_flags: [],
        performance_category_id: category?.id || null,
        category_thresholds: null,
        calculated_at: new Date().toISOString(),
        calculation_version: 1,
      };

      const { data, error } = await supabase
        .from("appraisal_score_breakdown")
        .upsert(breakdownData, { onConflict: "participant_id" })
        .select()
        .single();

      if (error) throw error;
      return data as ScoreBreakdown;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-score-breakdown", data.participant_id] });
    },
    onError: (error) => {
      console.error("Error calculating breakdown:", error);
      toast.error("Failed to calculate score breakdown");
    },
  });
}

export function getScoreComponents(breakdown: ScoreBreakdown | null): ScoreComponent[] {
  if (!breakdown) return [];
  const components: ScoreComponent[] = [];

  if (breakdown.goals_weight && breakdown.goals_weight > 0) {
    components.push({ name: "Goals", rawScore: breakdown.goals_raw_score, weight: breakdown.goals_weight, contribution: breakdown.goals_contribution, itemCount: breakdown.goals_item_count, color: "#3B82F6" });
  }
  if (breakdown.competencies_weight && breakdown.competencies_weight > 0) {
    components.push({ name: "Competencies", rawScore: breakdown.competencies_raw_score, weight: breakdown.competencies_weight, contribution: breakdown.competencies_contribution, itemCount: breakdown.competencies_item_count, color: "#8B5CF6" });
  }
  if (breakdown.responsibilities_weight && breakdown.responsibilities_weight > 0) {
    components.push({ name: "Responsibilities", rawScore: breakdown.responsibilities_raw_score, weight: breakdown.responsibilities_weight, contribution: breakdown.responsibilities_contribution, itemCount: breakdown.responsibilities_item_count, color: "#10B981" });
  }
  if (breakdown.values_weight && breakdown.values_weight > 0) {
    components.push({ name: "Values", rawScore: breakdown.values_raw_score, weight: breakdown.values_weight, contribution: breakdown.values_contribution, itemCount: breakdown.values_item_count, color: "#F59E0B" });
  }
  if (breakdown.feedback_360_weight && breakdown.feedback_360_weight > 0) {
    components.push({ name: "360 Feedback", rawScore: breakdown.feedback_360_raw_score, weight: breakdown.feedback_360_weight, contribution: breakdown.feedback_360_contribution, itemCount: breakdown.feedback_360_response_count, color: "#EC4899" });
  }

  return components;
}
