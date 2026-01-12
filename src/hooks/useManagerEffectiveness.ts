import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ManagerEffectivenessScore {
  id: string;
  manager_id: string;
  company_id: string | null;
  period_start: string;
  period_end: string;
  avg_team_rating: number | null;
  team_rating_change: number | null;
  team_size: number;
  feedback_frequency_score: number | null;
  feedback_quality_score: number | null;
  avg_feedback_per_employee: number | null;
  goal_completion_rate: number | null;
  team_goal_alignment_score: number | null;
  team_development_score: number | null;
  training_completion_rate: number | null;
  team_retention_rate: number | null;
  team_engagement_score: number | null;
  appraisal_completion_rate: number | null;
  avg_appraisal_delay_days: number | null;
  overall_score: number | null;
  score_trend: "improving" | "stable" | "declining" | null;
  ai_insights: Record<string, unknown>;
  improvement_recommendations: unknown[];
  calculated_at: string;
}

export function useManagerEffectiveness(managerId?: string) {
  const queryClient = useQueryClient();

  const { data: currentScore, isLoading } = useQuery({
    queryKey: ["manager-effectiveness", managerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manager_effectiveness_scores")
        .select("*")
        .eq("manager_id", managerId!)
        .order("period_end", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as ManagerEffectivenessScore | null;
    },
    enabled: !!managerId,
  });

  const { data: scoreHistory } = useQuery({
    queryKey: ["manager-effectiveness-history", managerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manager_effectiveness_scores")
        .select("*")
        .eq("manager_id", managerId!)
        .order("period_end", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as ManagerEffectivenessScore[];
    },
    enabled: !!managerId,
  });

  const calculateScoreMutation = useMutation({
    mutationFn: async ({ managerId, periodStart, periodEnd }: { 
      managerId: string; 
      periodStart: string; 
      periodEnd: string; 
    }) => {
      // Get team appraisals where this manager is the evaluator
      const { data: teamAppraisals } = await supabase
        .from("appraisal_participants")
        .select("employee_id, overall_score, status, created_at")
        .eq("evaluator_id", managerId)
        .gte("created_at", periodStart)
        .lte("created_at", periodEnd);

      const teamMembers = new Set((teamAppraisals || []).map(a => a.employee_id));
      const teamSize = teamMembers.size;

      // Calculate average team rating
      const ratings = (teamAppraisals || []).filter(a => a.overall_score).map(a => a.overall_score as number);
      const avgTeamRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

      // Calculate appraisal completion rate
      const completed = (teamAppraisals || []).filter(a => a.status === "completed" || a.status === "finalized").length;
      const total = (teamAppraisals || []).length || 1;
      const appraisalCompletionRate = completed / total;

      // Get feedback given by manager
      const { data: feedbackGiven } = await supabase
        .from("continuous_feedback")
        .select("id")
        .eq("from_user_id", managerId)
        .gte("created_at", periodStart)
        .lte("created_at", periodEnd);

      const feedbackCount = feedbackGiven?.length || 0;
      const avgFeedbackPerEmployee = teamSize > 0 ? feedbackCount / teamSize : 0;
      const feedbackFrequencyScore = Math.min(1, avgFeedbackPerEmployee / 4);

      // Get goal completion for team
      const { data: teamGoals } = await supabase
        .from("performance_goals")
        .select("id, status")
        .in("employee_id", Array.from(teamMembers))
        .gte("created_at", periodStart);

      const completedGoals = (teamGoals || []).filter(g => g.status === "completed").length;
      const totalGoals = (teamGoals || []).length || 1;
      const goalCompletionRate = completedGoals / totalGoals;

      // Calculate overall score
      const normalizedTeamRating = avgTeamRating ? avgTeamRating / 5 : 0.5;
      const overallScore = (
        normalizedTeamRating * 0.25 +
        feedbackFrequencyScore * 0.2 +
        goalCompletionRate * 0.2 +
        appraisalCompletionRate * 0.15 +
        0.8 * 0.2
      );

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", managerId)
        .single();

      const { data, error } = await supabase
        .from("manager_effectiveness_scores")
        .upsert({
          manager_id: managerId,
          company_id: profile?.company_id,
          period_start: periodStart,
          period_end: periodEnd,
          avg_team_rating: avgTeamRating,
          team_size: teamSize,
          feedback_frequency_score: feedbackFrequencyScore,
          avg_feedback_per_employee: avgFeedbackPerEmployee,
          goal_completion_rate: goalCompletionRate,
          appraisal_completion_rate: appraisalCompletionRate,
          overall_score: overallScore,
          ai_insights: { feedback_count: feedbackCount, completed_goals: completedGoals, total_goals: totalGoals },
          improvement_recommendations: generateRecommendations(feedbackFrequencyScore, goalCompletionRate, appraisalCompletionRate),
          calculated_at: new Date().toISOString(),
        }, { onConflict: "manager_id,period_start,period_end" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-effectiveness"] });
      toast.success("Manager effectiveness score calculated");
    },
    onError: (error) => {
      toast.error(`Failed to calculate score: ${error.message}`);
    },
  });

  return {
    currentScore,
    scoreHistory,
    isLoading,
    calculateScore: calculateScoreMutation.mutate,
    isCalculating: calculateScoreMutation.isPending,
  };
}

function generateRecommendations(feedbackScore: number, goalRate: number, appraisalRate: number): string[] {
  const recommendations: string[] = [];
  if (feedbackScore < 0.5) recommendations.push("Increase feedback frequency - aim for at least 4 feedback sessions per team member per quarter");
  if (goalRate < 0.7) recommendations.push("Review goal-setting practices - consider more achievable milestones");
  if (appraisalRate < 0.9) recommendations.push("Prioritize completing all team appraisals on time");
  if (recommendations.length === 0) recommendations.push("Continue current management practices - metrics are strong");
  return recommendations;
}
