import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompensationStats {
  totalPayroll: number;
  employeesPaid: number;
  pendingReviews: number;
  avgSalary: number;
  isLoading: boolean;
}

export function useCompensationStats(companyId: string, asOfDate: Date) {
  const [stats, setStats] = useState<CompensationStats>({
    totalPayroll: 0,
    employeesPaid: 0,
    pendingReviews: 0,
    avgSalary: 0,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      setStats(prev => ({ ...prev, isLoading: true }));

      try {
        const dateStr = asOfDate.toISOString().split('T')[0];

        // Build query for employee positions with compensation
        let query = supabase
          .from("employee_positions")
          .select(`
            id,
            employee_id,
            compensation_amount,
            compensation_currency,
            is_active,
            profiles!inner(id, company_id)
          `)
          .eq("is_active", true)
          .lte("start_date", dateStr)
          .or(`end_date.is.null,end_date.gte.${dateStr}`);

        if (companyId && companyId !== "all") {
          query = query.eq("profiles.company_id", companyId);
        }

        const { data: positions, error } = await query;

        if (error) {
          console.error("Error fetching compensation stats:", error);
          setStats({
            totalPayroll: 0,
            employeesPaid: 0,
            pendingReviews: 0,
            avgSalary: 0,
            isLoading: false,
          });
          return;
        }

        const validPositions = positions?.filter(p => p.compensation_amount && p.compensation_amount > 0) || [];
        
        const totalPayroll = validPositions.reduce((sum, p) => sum + (Number(p.compensation_amount) || 0), 0);
        const employeesPaid = validPositions.length;
        const avgSalary = employeesPaid > 0 ? totalPayroll / employeesPaid : 0;

        // Fetch pending merit cycle reviews count
        let pendingQuery = supabase
          .from("merit_recommendations")
          .select("id, merit_cycles!inner(company_id, status)")
          .eq("status", "pending")
          .eq("merit_cycles.status", "active");

        if (companyId && companyId !== "all") {
          pendingQuery = pendingQuery.eq("merit_cycles.company_id", companyId);
        }

        const { data: pendingReviews } = await pendingQuery;

        setStats({
          totalPayroll,
          employeesPaid,
          pendingReviews: pendingReviews?.length || 0,
          avgSalary,
          isLoading: false,
        });
      } catch (err) {
        console.error("Error in fetchStats:", err);
        setStats({
          totalPayroll: 0,
          employeesPaid: 0,
          pendingReviews: 0,
          avgSalary: 0,
          isLoading: false,
        });
      }
    }

    fetchStats();
  }, [companyId, asOfDate]);

  return stats;
}
