import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GoalCycle {
  id: string;
  company_id: string;
  name: string;
  cycle_type: string;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
}

export function useGoalCycles(companyId: string | undefined) {
  return useQuery({
    queryKey: ["goal-cycles", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("goal_cycles")
        .select("id, company_id, name, cycle_type, start_date, end_date, status, is_active")
        .eq("company_id", companyId)
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      return (data || []) as GoalCycle[];
    },
    enabled: !!companyId,
  });
}

export function useActiveGoalCycles(companyId: string | undefined) {
  const { data: cycles = [], ...rest } = useGoalCycles(companyId);
  
  const activeCycles = cycles.filter(
    (c) => c.status === "active" || c.is_active
  );
  
  return {
    cycles: activeCycles,
    allCycles: cycles,
    ...rest,
  };
}
