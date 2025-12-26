import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmployeeWorkloadData {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  activeGoalCount: number;
  totalWeighting: number;
  overdueCount: number;
  atRiskCount: number;
  workloadScore: number;
  isOverloaded: boolean;
  status: 'healthy' | 'warning' | 'critical';
}

export interface WorkloadMetrics {
  totalEmployees: number;
  overloadedCount: number;
  warningCount: number;
  healthyCount: number;
  avgWorkloadScore: number;
  employees: EmployeeWorkloadData[];
  workloadDistribution: { range: string; count: number; color: string }[];
}

export function useEmployeeWorkload(companyId: string | undefined, departmentId?: string) {
  return useQuery({
    queryKey: ['employee-workload', companyId, departmentId],
    queryFn: async (): Promise<WorkloadMetrics> => {
      if (!companyId) {
        return {
          totalEmployees: 0,
          overloadedCount: 0,
          warningCount: 0,
          healthyCount: 0,
          avgWorkloadScore: 0,
          employees: [],
          workloadDistribution: [],
        };
      }

      // Get all active employees
      let employeesQuery = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          department_id,
          departments(id, name)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (departmentId) {
        employeesQuery = employeesQuery.eq('department_id', departmentId);
      }

      const { data: employees, error: empError } = await employeesQuery;
      if (empError) throw empError;

      // Get all active goals
      const { data: goals, error: goalsError } = await supabase
        .from('performance_goals')
        .select('id, employee_id, weighting, due_date, progress_percentage, status')
        .eq('company_id', companyId)
        .in('status', ['in_progress', 'active', 'draft']);

      if (goalsError) throw goalsError;

      const today = new Date();
      
      // Calculate workload for each employee
      const employeeWorkloads: EmployeeWorkloadData[] = (employees || []).map(emp => {
        const empGoals = (goals || []).filter(g => g.employee_id === emp.id);
        
        const activeGoalCount = empGoals.length;
        const totalWeighting = empGoals.reduce((sum, g) => sum + (g.weighting || 0), 0);
        
        // Count overdue goals
        const overdueCount = empGoals.filter(g => {
          if (!g.due_date) return false;
          return new Date(g.due_date) < today;
        }).length;

        // Count at-risk goals (due within 7 days, progress < 80%)
        const atRiskCount = empGoals.filter(g => {
          if (!g.due_date) return false;
          const dueDate = new Date(g.due_date);
          const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysRemaining <= 7 && daysRemaining >= 0 && (g.progress_percentage || 0) < 80;
        }).length;

        // Calculate workload score
        const workloadScore = Math.min(200, 
          (activeGoalCount * 10) + 
          totalWeighting + 
          (overdueCount * 15) + 
          (atRiskCount * 10)
        );

        const isOverloaded = workloadScore > 150 || totalWeighting > 100;
        
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (workloadScore > 150 || totalWeighting > 150) {
          status = 'critical';
        } else if (workloadScore > 100 || totalWeighting > 100) {
          status = 'warning';
        }

        return {
          employeeId: emp.id,
          employeeName: emp.full_name || 'Unknown',
          departmentName: emp.departments?.name || 'Unassigned',
          activeGoalCount,
          totalWeighting: Math.round(totalWeighting),
          overdueCount,
          atRiskCount,
          workloadScore: Math.round(workloadScore),
          isOverloaded,
          status,
        };
      });

      // Calculate distribution
      const distribution = [
        { range: '0-50 (Light)', count: 0, color: 'hsl(var(--primary))' },
        { range: '51-100 (Normal)', count: 0, color: 'hsl(var(--muted))' },
        { range: '101-150 (Heavy)', count: 0, color: 'hsl(var(--warning))' },
        { range: '150+ (Critical)', count: 0, color: 'hsl(var(--destructive))' },
      ];

      employeeWorkloads.forEach(e => {
        if (e.workloadScore <= 50) distribution[0].count++;
        else if (e.workloadScore <= 100) distribution[1].count++;
        else if (e.workloadScore <= 150) distribution[2].count++;
        else distribution[3].count++;
      });

      const criticalCount = employeeWorkloads.filter(e => e.status === 'critical').length;
      const warningCount = employeeWorkloads.filter(e => e.status === 'warning').length;
      const healthyCount = employeeWorkloads.filter(e => e.status === 'healthy').length;

      const avgScore = employeeWorkloads.length > 0
        ? employeeWorkloads.reduce((sum, e) => sum + e.workloadScore, 0) / employeeWorkloads.length
        : 0;

      return {
        totalEmployees: employeeWorkloads.length,
        overloadedCount: criticalCount,
        warningCount,
        healthyCount,
        avgWorkloadScore: Math.round(avgScore),
        employees: employeeWorkloads.sort((a, b) => b.workloadScore - a.workloadScore),
        workloadDistribution: distribution,
      };
    },
    enabled: !!companyId,
  });
}
