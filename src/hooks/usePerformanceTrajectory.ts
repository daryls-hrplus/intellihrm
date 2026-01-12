import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PerformanceTrajectory {
  id: string;
  employee_id: string;
  company_id: string | null;
  prediction_date: string;
  current_score: number | null;
  predicted_score_3m: number | null;
  predicted_score_6m: number | null;
  predicted_score_12m: number | null;
  confidence_level: number | null;
  trend_direction: "improving" | "stable" | "declining" | "volatile" | null;
  factors: Record<string, unknown>;
  data_points_used: number;
  model_version: string | null;
  created_at: string;
}

export function usePerformanceTrajectory(employeeId?: string) {
  const queryClient = useQueryClient();

  const { data: trajectory, isLoading, error } = useQuery({
    queryKey: ["performance-trajectory", employeeId],
    queryFn: async () => {
      let query = supabase
        .from("performance_trajectory")
        .select("*")
        .order("prediction_date", { ascending: false });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      return data as PerformanceTrajectory | null;
    },
    enabled: !!employeeId,
  });

  const { data: trajectoryHistory } = useQuery({
    queryKey: ["performance-trajectory-history", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_trajectory")
        .select("*")
        .eq("employee_id", employeeId!)
        .order("prediction_date", { ascending: true })
        .limit(12);

      if (error) throw error;
      return data as PerformanceTrajectory[];
    },
    enabled: !!employeeId,
  });

  const generateTrajectoryMutation = useMutation({
    mutationFn: async (empId: string) => {
      // Get historical performance data
      const { data: appraisals } = await supabase
        .from("appraisal_participants")
        .select(`
          overall_score,
          created_at,
          appraisal_cycles!inner(start_date)
        `)
        .eq("employee_id", empId)
        .not("overall_score", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!appraisals || appraisals.length < 2) {
        throw new Error("Insufficient performance history for prediction");
      }

      // Simple linear regression for prediction
      const ratings = appraisals.map((a) => (a.overall_score as number) || 0);
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const trend = ratings[0] - ratings[ratings.length - 1];
      const trendPerPeriod = trend / (ratings.length - 1);

      let trendDirection: "improving" | "stable" | "declining" | "volatile" = "stable";
      if (trendPerPeriod > 0.1) trendDirection = "improving";
      else if (trendPerPeriod < -0.1) trendDirection = "declining";

      // Calculate predictions
      const currentScore = ratings[0];
      const predicted3m = Math.min(5, Math.max(1, currentScore + trendPerPeriod * 0.5));
      const predicted6m = Math.min(5, Math.max(1, currentScore + trendPerPeriod * 1));
      const predicted12m = Math.min(5, Math.max(1, currentScore + trendPerPeriod * 2));

      // Confidence based on data points
      const confidence = Math.min(0.95, 0.5 + (ratings.length * 0.1));

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", empId)
        .single();

      const { data, error } = await supabase
        .from("performance_trajectory")
        .insert({
          employee_id: empId,
          company_id: profile?.company_id,
          current_score: currentScore,
          predicted_score_3m: predicted3m,
          predicted_score_6m: predicted6m,
          predicted_score_12m: predicted12m,
          confidence_level: confidence,
          trend_direction: trendDirection,
          data_points_used: ratings.length,
          factors: {
            historical_ratings: ratings,
            avg_rating: avgRating,
            trend_per_period: trendPerPeriod,
          },
          model_version: "simple-linear-v1",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-trajectory"] });
      toast.success("Performance trajectory generated");
    },
    onError: (error) => {
      toast.error(`Failed to generate trajectory: ${error.message}`);
    },
  });

  return {
    trajectory,
    trajectoryHistory,
    isLoading,
    error,
    generateTrajectory: generateTrajectoryMutation.mutate,
    isGenerating: generateTrajectoryMutation.isPending,
  };
}
