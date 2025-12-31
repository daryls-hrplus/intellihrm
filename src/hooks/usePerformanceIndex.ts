import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PerformanceIndex {
  id: string;
  employee_id: string;
  company_id: string;
  rolling_12m_score: number | null;
  rolling_24m_score: number | null;
  rolling_36m_score: number | null;
  cycles_12m_count: number;
  cycles_24m_count: number;
  cycles_36m_count: number;
  avg_goal_score: number | null;
  avg_competency_score: number | null;
  avg_responsibility_score: number | null;
  avg_values_score: number | null;
  trend_direction: "improving" | "stable" | "declining" | null;
  trend_velocity: number | null;
  trend_confidence: number | null;
  best_score: number | null;
  best_cycle_id: string | null;
  lowest_score: number | null;
  lowest_cycle_id: string | null;
  score_variance: number | null;
  score_std_deviation: number | null;
  consistency_rating: "highly_consistent" | "consistent" | "variable" | "highly_variable" | null;
  promotion_readiness_score: number | null;
  succession_readiness_score: number | null;
  skill_gap_closure_rate: number | null;
  idp_completion_rate: number | null;
  last_calculated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CycleSnapshot {
  id: string;
  employee_id: string;
  company_id: string;
  cycle_id: string;
  participant_id: string | null;
  cycle_name: string;
  cycle_type: string | null;
  cycle_start_date: string;
  cycle_end_date: string;
  overall_score: number | null;
  goal_score: number | null;
  competency_score: number | null;
  responsibility_score: number | null;
  values_score: number | null;
  feedback_360_score: number | null;
  performance_category_id: string | null;
  performance_category_code: string | null;
  performance_category_name: string | null;
  rank_in_company: number | null;
  rank_in_department: number | null;
  percentile_company: number | null;
  percentile_department: number | null;
  was_calibrated: boolean;
  calibration_delta: number | null;
  strengths_count: number;
  gaps_count: number;
  risk_count: number;
  evaluator_id: string | null;
  evaluator_name: string | null;
  archived_at: string;
}

export function usePerformanceIndex(employeeId: string | undefined, companyId?: string) {
  return useQuery({
    queryKey: ["performance-index", employeeId, companyId],
    queryFn: async () => {
      if (!employeeId) return null;

      let query = supabase
        .from("employee_performance_index")
        .select("*")
        .eq("employee_id", employeeId);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data as PerformanceIndex | null;
    },
    enabled: !!employeeId,
  });
}

export function useCycleSnapshots(employeeId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: ["cycle-snapshots", employeeId, limit],
    queryFn: async () => {
      if (!employeeId) return [];

      let query = supabase
        .from("performance_cycle_snapshots")
        .select("*")
        .eq("employee_id", employeeId)
        .order("cycle_end_date", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as CycleSnapshot[];
    },
    enabled: !!employeeId,
  });
}

export function useCalculatePerformanceIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      companyId, 
      participantId 
    }: { 
      employeeId: string; 
      companyId: string; 
      participantId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("calculate-performance-index", {
        body: {
          employee_id: employeeId,
          company_id: companyId,
          participant_id: participantId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["performance-index", variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ["cycle-snapshots", variables.employeeId] });
      toast.success("Performance index calculated");
    },
    onError: (error) => {
      console.error("Error calculating performance index:", error);
      toast.error("Failed to calculate performance index");
    },
  });
}

export function getTrendIcon(direction: string | null) {
  switch (direction) {
    case "improving": return "trending-up";
    case "declining": return "trending-down";
    default: return "minus";
  }
}

export function getTrendColor(direction: string | null) {
  switch (direction) {
    case "improving": return "text-green-600";
    case "declining": return "text-red-600";
    default: return "text-muted-foreground";
  }
}

export function getConsistencyColor(rating: string | null) {
  switch (rating) {
    case "highly_consistent": return "bg-green-100 text-green-800";
    case "consistent": return "bg-blue-100 text-blue-800";
    case "variable": return "bg-amber-100 text-amber-800";
    case "highly_variable": return "bg-red-100 text-red-800";
    default: return "bg-muted text-muted-foreground";
  }
}
