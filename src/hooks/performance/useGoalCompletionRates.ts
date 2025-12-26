import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export interface CompletionByDepartment {
  departmentId: string;
  departmentName: string;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
}

export interface CompletionByLevel {
  level: string;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
}

export interface MonthlyTrend {
  month: string;
  completionRate: number;
  completedCount: number;
  totalCount: number;
}

export interface GoalCompletionMetrics {
  overallCompletionRate: number;
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  notStartedGoals: number;
  cancelledGoals: number;
  byDepartment: CompletionByDepartment[];
  byLevel: CompletionByLevel[];
  monthlyTrend: MonthlyTrend[];
}

export function useGoalCompletionRates(
  companyId: string | undefined,
  dateRange?: { start: Date; end: Date }
) {
  return useQuery({
    queryKey: ['goal-completion-rates', companyId, dateRange?.start, dateRange?.end],
    queryFn: async (): Promise<GoalCompletionMetrics> => {
      if (!companyId) {
        return {
          overallCompletionRate: 0,
          totalGoals: 0,
          completedGoals: 0,
          inProgressGoals: 0,
          notStartedGoals: 0,
          cancelledGoals: 0,
          byDepartment: [],
          byLevel: [],
          monthlyTrend: [],
        };
      }

      // Build query
      let query = supabase
        .from('performance_goals')
        .select(`
          id,
          status,
          goal_type,
          created_at,
          employee_id,
          profiles!performance_goals_employee_id_fkey(
            department_id,
            departments(id, name)
          )
        `)
        .eq('company_id', companyId);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data: goals, error } = await query;
      if (error) throw error;

      // Filter out cancelled for completion calculation
      const activeGoals = (goals || []).filter((g: any) => g.status !== 'cancelled');
      const allGoals = goals || [];

      // Calculate status counts
      const completedGoals = activeGoals.filter((g: any) => g.status === 'completed').length;
      const inProgressGoals = allGoals.filter((g: any) => g.status === 'in_progress' || g.status === 'active').length;
      const notStartedGoals = allGoals.filter((g: any) => g.status === 'draft').length;
      const cancelledGoals = allGoals.filter((g: any) => g.status === 'cancelled').length;

      // By department
      const deptStats: Record<string, { name: string; total: number; completed: number }> = {};
      activeGoals.forEach((g: any) => {
        const dept = g.profiles?.departments;
        if (dept) {
          if (!deptStats[dept.id]) {
            deptStats[dept.id] = { name: dept.name, total: 0, completed: 0 };
          }
          deptStats[dept.id].total++;
          if (g.status === 'completed') {
            deptStats[dept.id].completed++;
          }
        }
      });

      const byDepartment: CompletionByDepartment[] = Object.entries(deptStats)
        .map(([id, data]) => ({
          departmentId: id,
          departmentName: data.name,
          totalGoals: data.total,
          completedGoals: data.completed,
          completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        }))
        .sort((a, b) => b.completionRate - a.completionRate);

      // By level (using goal_type)
      const levelStats: Record<string, { total: number; completed: number }> = {};
      activeGoals.forEach((g: any) => {
        const level = g.goal_type || 'individual';
        if (!levelStats[level]) {
          levelStats[level] = { total: 0, completed: 0 };
        }
        levelStats[level].total++;
        if (g.status === 'completed') {
          levelStats[level].completed++;
        }
      });

      const levelOrder = ['company', 'department', 'team', 'individual'];
      const byLevel: CompletionByLevel[] = levelOrder.map(level => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        totalGoals: levelStats[level]?.total || 0,
        completedGoals: levelStats[level]?.completed || 0,
        completionRate: levelStats[level]?.total > 0 
          ? Math.round((levelStats[level].completed / levelStats[level].total) * 100) 
          : 0,
      }));

      // Monthly trend (last 6 months)
      const monthlyTrend: MonthlyTrend[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthGoals = activeGoals.filter((g: any) => {
          const createdAt = new Date(g.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        });

        const monthCompleted = monthGoals.filter((g: any) => g.status === 'completed').length;
        
        monthlyTrend.push({
          month: format(monthDate, 'MMM'),
          completionRate: monthGoals.length > 0 
            ? Math.round((monthCompleted / monthGoals.length) * 100) 
            : 0,
          completedCount: monthCompleted,
          totalCount: monthGoals.length,
        });
      }

      return {
        overallCompletionRate: activeGoals.length > 0 
          ? Math.round((completedGoals / activeGoals.length) * 100) 
          : 0,
        totalGoals: allGoals.length,
        completedGoals,
        inProgressGoals,
        notStartedGoals,
        cancelledGoals,
        byDepartment,
        byLevel,
        monthlyTrend,
      };
    },
    enabled: !!companyId,
  });
}
