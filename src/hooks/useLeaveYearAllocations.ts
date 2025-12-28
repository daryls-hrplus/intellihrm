import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaveYearAllocation {
  id: string;
  leave_request_id: string;
  year: number;
  leave_year_id: string | null;
  allocated_days: number;
  balance_id: string | null;
  is_deducted: boolean;
  deducted_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useLeaveYearAllocations(leaveRequestIds?: string[]) {
  return useQuery({
    queryKey: ["leave-year-allocations", leaveRequestIds],
    queryFn: async () => {
      if (!leaveRequestIds || leaveRequestIds.length === 0) return [];

      const { data, error } = await supabase
        .from("leave_request_year_allocations")
        .select("*")
        .in("leave_request_id", leaveRequestIds)
        .order("year", { ascending: true });

      if (error) throw error;
      return data as LeaveYearAllocation[];
    },
    enabled: !!leaveRequestIds && leaveRequestIds.length > 0,
  });
}

export function useLeaveAllocationsByYear(year: number, employeeId?: string) {
  return useQuery({
    queryKey: ["leave-allocations-by-year", year, employeeId],
    queryFn: async () => {
      if (!employeeId) return [];

      // Get all leave requests for the employee
      const { data: requests, error: reqError } = await supabase
        .from("leave_requests")
        .select("id")
        .eq("employee_id", employeeId)
        .eq("status", "approved");

      if (reqError) throw reqError;

      if (!requests || requests.length === 0) return [];

      const requestIds = requests.map((r) => r.id);

      // Get allocations for the specified year
      const { data, error } = await supabase
        .from("leave_request_year_allocations")
        .select("*")
        .in("leave_request_id", requestIds)
        .eq("year", year);

      if (error) throw error;
      return data as LeaveYearAllocation[];
    },
    enabled: !!employeeId,
  });
}
