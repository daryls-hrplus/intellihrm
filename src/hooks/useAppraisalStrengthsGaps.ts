import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type InsightType = "strength" | "gap" | "risk_indicator";
export type InsightCategory = "goal" | "competency" | "responsibility" | "value" | "behavioral" | "360_feedback";
export type InsightPriority = "critical" | "high" | "medium" | "low";

export interface StrengthGap {
  id: string;
  participant_id: string;
  company_id: string;
  cycle_id: string;
  insight_type: InsightType;
  category: InsightCategory;
  title: string;
  description: string | null;
  related_item_type: string | null;
  related_item_id: string | null;
  score_impact: number | null;
  evidence_ids: string[];
  ai_identified: boolean;
  ai_confidence: number | null;
  ai_reasoning: string | null;
  priority: InsightPriority;
  suggested_action: string | null;
  linked_idp_goal_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useAppraisalStrengthsGaps(participantId: string | undefined) {
  return useQuery({
    queryKey: ["appraisal-strengths-gaps", participantId],
    queryFn: async () => {
      if (!participantId) return [];

      const { data, error } = await supabase
        .from("appraisal_strengths_gaps")
        .select("*")
        .eq("participant_id", participantId)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as StrengthGap[];
    },
    enabled: !!participantId,
  });
}

export function useGroupedStrengthsGaps(participantId: string | undefined) {
  const { data: items, isLoading, error } = useAppraisalStrengthsGaps(participantId);

  const grouped = {
    strengths: items?.filter(i => i.insight_type === "strength") || [],
    gaps: items?.filter(i => i.insight_type === "gap") || [],
    riskIndicators: items?.filter(i => i.insight_type === "risk_indicator") || [],
  };

  return { grouped, isLoading, error };
}

export function useManageStrengthGap() {
  const queryClient = useQueryClient();

  const createStrengthGap = useMutation({
    mutationFn: async (item: Omit<StrengthGap, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("appraisal_strengths_gaps")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data as StrengthGap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-strengths-gaps", data.participant_id] });
      toast.success(`${data.insight_type === "strength" ? "Strength" : data.insight_type === "gap" ? "Gap" : "Risk indicator"} added`);
    },
    onError: (error) => {
      console.error("Error creating strength/gap:", error);
      toast.error("Failed to add insight");
    },
  });

  const updateStrengthGap = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StrengthGap> & { id: string }) => {
      const { data, error } = await supabase
        .from("appraisal_strengths_gaps")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as StrengthGap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-strengths-gaps", data.participant_id] });
      toast.success("Insight updated");
    },
    onError: (error) => {
      console.error("Error updating strength/gap:", error);
      toast.error("Failed to update insight");
    },
  });

  const deleteStrengthGap = useMutation({
    mutationFn: async ({ id, participantId }: { id: string; participantId: string }) => {
      const { error } = await supabase
        .from("appraisal_strengths_gaps")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return participantId;
    },
    onSuccess: (participantId) => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-strengths-gaps", participantId] });
      toast.success("Insight removed");
    },
    onError: (error) => {
      console.error("Error deleting strength/gap:", error);
      toast.error("Failed to remove insight");
    },
  });

  const linkToIdp = useMutation({
    mutationFn: async ({ id, idpGoalId }: { id: string; idpGoalId: string }) => {
      const { data, error } = await supabase
        .from("appraisal_strengths_gaps")
        .update({ linked_idp_goal_id: idpGoalId })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as StrengthGap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appraisal-strengths-gaps", data.participant_id] });
      toast.success("Linked to IDP goal");
    },
    onError: (error) => {
      console.error("Error linking to IDP:", error);
      toast.error("Failed to link to IDP goal");
    },
  });

  return { createStrengthGap, updateStrengthGap, deleteStrengthGap, linkToIdp };
}

export function getCategoryColor(category: InsightCategory): string {
  const colors: Record<InsightCategory, string> = {
    goal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    competency: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    responsibility: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    value: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    behavioral: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "360_feedback": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  };
  return colors[category] || "bg-muted text-muted-foreground";
}

export function getPriorityColor(priority: InsightPriority): string {
  const colors: Record<InsightPriority, string> = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-black",
    low: "bg-muted text-muted-foreground",
  };
  return colors[priority] || "bg-muted text-muted-foreground";
}
