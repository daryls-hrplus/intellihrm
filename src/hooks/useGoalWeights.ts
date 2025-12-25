import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type WeightStatus = "complete" | "under" | "over";

export interface WeightSummary {
  totalWeight: number;
  remainingWeight: number;
  status: WeightStatus;
  goalCount: number;
  requiredGoalCount: number;
}

export interface EmployeeWeightSummary {
  employeeId: string;
  employeeName: string;
  summary: WeightSummary;
}

export function useGoalWeights(companyId: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [employeeWeights, setEmployeeWeights] = useState<EmployeeWeightSummary[]>([]);

  const calculateStatus = (totalWeight: number): WeightStatus => {
    if (totalWeight === 100) return "complete";
    if (totalWeight < 100) return "under";
    return "over";
  };

  const fetchEmployeeWeights = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      // Fetch all individual goals with employee info
      const { data: goals, error } = await supabase
        .from("performance_goals")
        .select(`
          id,
          employee_id,
          weighting,
          status,
          category
        `)
        .eq("company_id", companyId)
        .eq("goal_level", "individual")
        .not("employee_id", "is", null)
        .in("status", ["draft", "active", "in_progress"]);

      if (error) throw error;

      // Fetch employee names
      const employeeIds = [...new Set((goals || []).map(g => g.employee_id).filter(Boolean))];
      
      const { data: employees } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", employeeIds);

      const employeeMap = new Map((employees || []).map(e => [e.id, e.full_name]));

      // Group goals by employee
      const employeeGoalsMap = new Map<string, typeof goals>();
      
      (goals || []).forEach(goal => {
        if (!goal.employee_id) return;
        const existing = employeeGoalsMap.get(goal.employee_id) || [];
        existing.push(goal);
        employeeGoalsMap.set(goal.employee_id, existing);
      });

      // Calculate summaries
      const summaries: EmployeeWeightSummary[] = [];
      
      employeeGoalsMap.forEach((empGoals, employeeId) => {
        const totalWeight = empGoals.reduce((sum, g) => sum + (g.weighting || 0), 0);
        
        // Check for required weights in extended attributes
        let requiredGoalCount = 0;
        empGoals.forEach(g => {
          try {
            const category = g.category;
            if (category && category.includes('"isWeightRequired":true')) {
              requiredGoalCount++;
            }
          } catch {
            // Ignore parsing errors
          }
        });

        summaries.push({
          employeeId,
          employeeName: employeeMap.get(employeeId) || "Unknown",
          summary: {
            totalWeight,
            remainingWeight: 100 - totalWeight,
            status: calculateStatus(totalWeight),
            goalCount: empGoals.length,
            requiredGoalCount,
          },
        });
      });

      setEmployeeWeights(summaries);
    } catch (error) {
      console.error("Error fetching employee weights:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchEmployeeWeights();
  }, [fetchEmployeeWeights]);

  // Get weight summary for a specific employee
  const getEmployeeWeightSummary = useCallback(
    (employeeId: string): WeightSummary | null => {
      const found = employeeWeights.find(e => e.employeeId === employeeId);
      return found?.summary || null;
    },
    [employeeWeights]
  );

  // Calculate what the new total would be with proposed weight
  const calculateProposedTotal = useCallback(
    (
      employeeId: string,
      proposedWeight: number,
      existingGoalId?: string
    ): { currentTotal: number; proposedTotal: number; status: WeightStatus } => {
      const existing = employeeWeights.find(e => e.employeeId === employeeId);
      const currentTotal = existing?.summary.totalWeight || 0;
      
      // If editing an existing goal, we need to subtract its current weight first
      // For now we approximate - proper implementation would query the specific goal
      const proposedTotal = currentTotal + proposedWeight;
      
      return {
        currentTotal,
        proposedTotal,
        status: calculateStatus(proposedTotal),
      };
    },
    [employeeWeights]
  );

  // Validate weights for an employee
  const validateEmployeeWeights = useCallback(
    async (employeeId: string): Promise<{ valid: boolean; message: string; summary: WeightSummary }> => {
      if (!companyId) {
        return {
          valid: false,
          message: "Company not found",
          summary: { totalWeight: 0, remainingWeight: 100, status: "under", goalCount: 0, requiredGoalCount: 0 },
        };
      }

      const { data: goals, error } = await supabase
        .from("performance_goals")
        .select("id, weighting, category")
        .eq("company_id", companyId)
        .eq("goal_level", "individual")
        .eq("employee_id", employeeId)
        .in("status", ["draft", "active", "in_progress"]);

      if (error) {
        return {
          valid: false,
          message: "Error fetching goals",
          summary: { totalWeight: 0, remainingWeight: 100, status: "under", goalCount: 0, requiredGoalCount: 0 },
        };
      }

      const totalWeight = (goals || []).reduce((sum, g) => sum + (g.weighting || 0), 0);
      const status = calculateStatus(totalWeight);

      let message = "";
      if (status === "complete") {
        message = "Weight allocation is complete (100%)";
      } else if (status === "under") {
        message = `${100 - totalWeight}% weight remaining to allocate`;
      } else {
        message = `Weight is over-allocated by ${totalWeight - 100}%`;
      }

      return {
        valid: status === "complete",
        message,
        summary: {
          totalWeight,
          remainingWeight: 100 - totalWeight,
          status,
          goalCount: goals?.length || 0,
          requiredGoalCount: 0,
        },
      };
    },
    [companyId]
  );

  // Get employees with incomplete weights
  const getIncompleteWeights = useCallback((): EmployeeWeightSummary[] => {
    return employeeWeights.filter(e => e.summary.status !== "complete");
  }, [employeeWeights]);

  return {
    loading,
    employeeWeights,
    getEmployeeWeightSummary,
    calculateProposedTotal,
    validateEmployeeWeights,
    getIncompleteWeights,
    refetch: fetchEmployeeWeights,
  };
}
