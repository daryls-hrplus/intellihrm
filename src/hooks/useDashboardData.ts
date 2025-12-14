import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, subMonths, format } from "date-fns";

export interface DashboardStats {
  totalEmployees: number;
  newHires: number;
  pendingLeaveRequests: number;
  openPositions: number;
  employeeChange: number;
  newHiresChange: number;
}

export interface DepartmentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface HeadcountData {
  month: string;
  employees: number;
}

const DEPARTMENT_COLORS = [
  "hsl(168, 76%, 36%)",
  "hsl(199, 89%, 48%)",
  "hsl(38, 92%, 50%)",
  "hsl(142, 76%, 36%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
  "hsl(210, 70%, 50%)",
  "hsl(60, 70%, 45%)",
];

export function useDashboardStats() {
  const { company } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", company?.id],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const startOfLastMonth = startOfMonth(subMonths(now, 1));

      // Get total employees count
      const { count: totalEmployees } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company?.id);

      // Get new hires this month (profiles created this month)
      const { count: newHires } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company?.id)
        .gte("created_at", startOfCurrentMonth.toISOString());

      // Get new hires last month for comparison
      const { count: lastMonthHires } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company?.id)
        .gte("created_at", startOfLastMonth.toISOString())
        .lt("created_at", startOfCurrentMonth.toISOString());

      // Get pending leave requests
      const { count: pendingLeaveRequests } = await supabase
        .from("leave_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Get open positions
      const { count: openPositions } = await supabase
        .from("job_requisitions")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company?.id)
        .eq("status", "open");

      return {
        totalEmployees: totalEmployees || 0,
        newHires: newHires || 0,
        pendingLeaveRequests: pendingLeaveRequests || 0,
        openPositions: openPositions || 0,
        employeeChange: 0, // Would need historical data to calculate
        newHiresChange: (newHires || 0) - (lastMonthHires || 0),
      };
    },
    enabled: !!company?.id,
  });
}

export function useEmployeeDistribution() {
  const { company } = useAuth();

  return useQuery({
    queryKey: ["employee-distribution", company?.id],
    queryFn: async (): Promise<DepartmentDistribution[]> => {
      // Get departments with employee counts
      const { data: departments } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", company?.id)
        .eq("is_active", true);

      if (!departments || departments.length === 0) {
        return [];
      }

      // Get employee counts per department
      const distribution: DepartmentDistribution[] = [];

      for (let i = 0; i < departments.length; i++) {
        const dept = departments[i];
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("department_id", dept.id);

        if (count && count > 0) {
          distribution.push({
            name: dept.name,
            value: count,
            color: DEPARTMENT_COLORS[i % DEPARTMENT_COLORS.length],
          });
        }
      }

      return distribution;
    },
    enabled: !!company?.id,
  });
}

export function useHeadcountTrend() {
  const { company } = useAuth();

  return useQuery({
    queryKey: ["headcount-trend", company?.id],
    queryFn: async (): Promise<HeadcountData[]> => {
      const data: HeadcountData[] = [];
      const now = new Date();

      // Get headcount for the last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("company_id", company?.id)
          .lte("created_at", endOfMonth.toISOString());

        data.push({
          month: format(monthDate, "MMM"),
          employees: count || 0,
        });
      }

      return data;
    },
    enabled: !!company?.id,
  });
}
