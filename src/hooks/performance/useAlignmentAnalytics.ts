import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DepartmentAlignment {
  departmentId: string;
  departmentName: string;
  totalGoals: number;
  alignedGoals: number;
  orphanGoals: number;
  alignmentPercentage: number;
}

export interface AlignmentMetrics {
  companyAlignmentPercentage: number;
  totalGoals: number;
  alignedGoals: number;
  orphanGoals: number;
  brokenChains: number;
  departmentAlignment: DepartmentAlignment[];
  cascadeLevels: { level: string; count: number }[];
}

export function useAlignmentAnalytics(companyId: string | undefined) {
  return useQuery({
    queryKey: ['alignment-analytics', companyId],
    queryFn: async (): Promise<AlignmentMetrics> => {
      if (!companyId) {
        return {
          companyAlignmentPercentage: 0,
          totalGoals: 0,
          alignedGoals: 0,
          orphanGoals: 0,
          brokenChains: 0,
          departmentAlignment: [],
          cascadeLevels: [],
        };
      }

      // Get all goals
      const { data: goals, error: goalsError } = await supabase
        .from('performance_goals')
        .select(`
          id,
          title,
          parent_goal_id,
          goal_type,
          status,
          employee_id,
          profiles!performance_goals_employee_id_fkey(
            id,
            department_id,
            departments(id, name)
          )
        `)
        .eq('company_id', companyId)
        .neq('status', 'cancelled');

      if (goalsError) throw goalsError;

      // Create sets for quick lookup
      const alignedGoalIds = new Set<string>();
      (goals || []).forEach((g: any) => {
        if (g.parent_goal_id) alignedGoalIds.add(g.id);
      });

      // Check for broken chains (parent cancelled but child active)
      const goalMap = new Map((goals || []).map((g: any) => [g.id, g]));
      let brokenChains = 0;
      (goals || []).forEach((g: any) => {
        if (g.parent_goal_id) {
          const parent = goalMap.get(g.parent_goal_id);
          if (parent && parent.status === 'cancelled' && g.status !== 'cancelled') {
            brokenChains++;
          }
        }
      });

      // Calculate department alignment
      const deptGoals: Record<string, { name: string; total: number; aligned: number }> = {};
      
      goals?.forEach(g => {
        const dept = g.profiles?.departments;
        if (dept) {
          if (!deptGoals[dept.id]) {
            deptGoals[dept.id] = { name: dept.name, total: 0, aligned: 0 };
          }
          deptGoals[dept.id].total++;
          if (alignedGoalIds.has(g.id)) {
            deptGoals[dept.id].aligned++;
          }
        }
      });

      const departmentAlignment: DepartmentAlignment[] = Object.entries(deptGoals).map(([id, data]) => ({
        departmentId: id,
        departmentName: data.name,
        totalGoals: data.total,
        alignedGoals: data.aligned,
        orphanGoals: data.total - data.aligned,
        alignmentPercentage: data.total > 0 ? Math.round((data.aligned / data.total) * 100) : 0,
      })).sort((a, b) => b.alignmentPercentage - a.alignmentPercentage);

      // Calculate cascade levels based on goal_type
      const levelCounts: Record<string, number> = {};
      goals?.forEach(g => {
        const level = g.goal_type || 'individual';
        levelCounts[level] = (levelCounts[level] || 0) + 1;
      });

      const levelOrder = ['company', 'department', 'team', 'individual'];
      const cascadeLevels = levelOrder.map(level => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        count: levelCounts[level] || 0,
      }));

      const totalGoals = goals?.length || 0;
      const alignedGoals = alignedGoalIds.size;
      const orphanGoals = totalGoals - alignedGoals;

      return {
        companyAlignmentPercentage: totalGoals > 0 ? Math.round((alignedGoals / totalGoals) * 100) : 0,
        totalGoals,
        alignedGoals,
        orphanGoals,
        brokenChains,
        departmentAlignment,
        cascadeLevels,
      };
    },
    enabled: !!companyId,
  });
}
