import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LeaveType {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  accrual_unit: "days" | "hours";
  is_accrual_based: boolean;
  default_annual_entitlement: number;
  allows_negative_balance: boolean;
  max_negative_balance: number;
  requires_approval: boolean;
  min_request_amount: number;
  max_consecutive_days: number | null;
  advance_notice_days: number;
  can_be_encashed: boolean;
  encashment_rate: number;
  color: string;
  is_active: boolean;
  accrues_leave_while_on: boolean;
  gender_applicability: "all" | "male" | "female";
  leave_year_basis: "calendar" | "anniversary" | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveAccrualRule {
  id: string;
  company_id: string;
  leave_type_id: string;
  name: string;
  description: string | null;
  accrual_frequency: "daily" | "monthly" | "annually" | "bi_weekly" | "weekly";
  accrual_amount: number;
  years_of_service_min: number;
  years_of_service_max: number | null;
  salary_grade_id: string | null;
  employee_status: string | null;
  employee_type: string | null;
  priority: number;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  leave_type?: LeaveType;
}

export interface LeaveRolloverRule {
  id: string;
  company_id: string;
  leave_type_id: string;
  max_rollover_amount: number | null;
  max_balance_cap: number | null;
  rollover_expiry_months: number | null;
  forfeit_unused: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  leave_type?: LeaveType;
}

export interface LeaveBalanceRecalculation {
  id: string;
  employee_id: string;
  company_id: string;
  calculation_type: 'current_year' | 'from_hire_date' | 'custom_range';
  period_start: string;
  period_end: string;
  old_balance: any;
  new_balance: any;
  triggered_by: 'manual' | 'rule_change';
  initiated_by: string | null;
  created_at: string;
  notes: string | null;
}

export interface LeaveYear {
  id: string;
  company_id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_closed: boolean;
  closed_at: string | null;
  closed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  leave_year_id: string | null;
  opening_balance: number;
  accrued_amount: number;
  used_amount: number;
  adjustment_amount: number;
  carried_forward: number;
  current_balance: number;
  last_accrual_date: string | null;
  leave_type?: LeaveType;
  leave_year?: LeaveYear;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  request_number: string;
  start_date: string;
  end_date: string;
  start_half: "full" | "first_half" | "second_half" | null;
  end_half: "full" | "first_half" | "second_half" | null;
  duration: number;
  reason: string | null;
  contact_during_leave: string | null;
  handover_notes: string | null;
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled" | "withdrawn";
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  workflow_instance_id: string | null;
  source: "ess" | "hr_admin";
  created_at: string;
  updated_at: string;
  leave_type?: LeaveType;
  employee?: { full_name: string; email: string };
  reviewer?: { full_name: string };
}

export interface LeaveHoliday {
  id: string;
  company_id: string;
  name: string;
  holiday_date: string;
  is_recurring: boolean;
  is_half_day: boolean;
  applies_to_all: boolean;
  department_ids: string[] | null;
  is_active: boolean;
  country: string | null;
  holiday_type: 'country' | 'company';
}

export interface CountryHoliday {
  id: string;
  country: string;
  name: string;
  holiday_date: string;
  is_recurring: boolean;
  is_half_day: boolean;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useLeaveManagement(companyId?: string, leaveYearId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  // Fetch leave types
  const { data: leaveTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["leave-types", companyId],
    queryFn: async () => {
      let query = supabase
        .from("leave_types")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaveType[];
    },
  });

  // Fetch leave years
  const { data: leaveYears = [], isLoading: loadingLeaveYears } = useQuery({
    queryKey: ["leave-years", companyId],
    queryFn: async () => {
      let query = supabase
        .from("leave_years")
        .select("*")
        .order("start_date", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaveYear[];
    },
  });

  // Fetch accrual rules
  const { data: accrualRules = [], isLoading: loadingAccrualRules } = useQuery({
    queryKey: ["leave-accrual-rules", companyId],
    queryFn: async () => {
      let query = supabase
        .from("leave_accrual_rules")
        .select("*, leave_type:leave_types(*)")
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaveAccrualRule[];
    },
  });

  // Fetch rollover rules
  const { data: rolloverRules = [], isLoading: loadingRolloverRules } = useQuery({
    queryKey: ["leave-rollover-rules", companyId],
    queryFn: async () => {
      let query = supabase
        .from("leave_rollover_rules")
        .select("*, leave_type:leave_types(*)")
        .eq("is_active", true);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaveRolloverRule[];
    },
  });

  // Fetch employee leave balances (for current user)
  const { data: leaveBalances = [], isLoading: loadingBalances, refetch: refetchBalances } = useQuery({
    queryKey: ["leave-balances", user?.id, leaveYearId || currentYear],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("leave_balances")
        .select("*, leave_type:leave_types(*), leave_year:leave_years(*)")
        .eq("employee_id", user.id);

      if (leaveYearId) {
        query = query.eq("leave_year_id", leaveYearId);
      } else {
        query = query.eq("year", currentYear);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaveBalance[];
    },
    enabled: !!user?.id,
  });

  // Fetch all leave balances across all employees (for admin view)
  const { data: allLeaveBalances = [], isLoading: loadingAllBalances, refetch: refetchAllBalances } = useQuery({
    queryKey: ["all-leave-balances", companyId, leaveYearId || currentYear],
    queryFn: async () => {
      // First get all leave balances
      let balancesQuery = supabase
        .from("leave_balances")
        .select("*, leave_type:leave_types(*), leave_year:leave_years(*)");

      if (leaveYearId) {
        balancesQuery = balancesQuery.eq("leave_year_id", leaveYearId);
      } else {
        balancesQuery = balancesQuery.eq("year", currentYear);
      }

      const { data: balances, error: balancesError } = await balancesQuery;
      if (balancesError) throw balancesError;

      // Then get all profiles to join
      let profilesQuery = supabase
        .from("profiles")
        .select("id, full_name, email, company_id")
        .eq("is_active", true);

      if (companyId) {
        profilesQuery = profilesQuery.eq("company_id", companyId);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // Create a map of profiles for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Join balances with employee profiles
      const result = (balances || [])
        .filter(balance => profileMap.has(balance.employee_id))
        .map(balance => ({
          ...balance,
          employee: profileMap.get(balance.employee_id),
        }));

      return result as (LeaveBalance & { employee: { id: string; full_name: string; email: string; company_id: string } })[];
    },
  });

  // Fetch employee leave requests
  const { data: leaveRequests = [], isLoading: loadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ["leave-requests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("leave_requests")
        .select("*, leave_type:leave_types(*)")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LeaveRequest[];
    },
    enabled: !!user?.id,
  });

  // Fetch all leave requests (admin)
  const { data: allLeaveRequests = [], isLoading: loadingAllRequests, refetch: refetchAllRequests } = useQuery({
    queryKey: ["all-leave-requests", companyId],
    queryFn: async () => {
      let query = supabase
        .from("leave_requests")
        .select(`
          *,
          leave_type:leave_types(*),
          employee:profiles!leave_requests_employee_id_fkey(full_name, email),
          reviewer:profiles!leave_requests_reviewed_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaveRequest[];
    },
  });

  // Fetch company holidays
  const { data: holidays = [], isLoading: loadingHolidays } = useQuery({
    queryKey: ["leave-holidays", companyId],
    queryFn: async () => {
      let query = supabase
        .from("leave_holidays")
        .select("*")
        .eq("is_active", true)
        .order("holiday_date");

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaveHoliday[];
    },
  });

  // Fetch country holidays
  const { data: countryHolidays = [], isLoading: loadingCountryHolidays } = useQuery({
    queryKey: ["country-holidays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("country_holidays")
        .select("*")
        .eq("is_active", true)
        .order("holiday_date");

      if (error) throw error;
      return data as CountryHoliday[];
    },
  });

  // Create leave type
  const createLeaveType = useMutation({
    mutationFn: async (leaveType: Partial<LeaveType>) => {
      const { data, error } = await supabase
        .from("leave_types")
        .insert([leaveType as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      toast.success("Leave type created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create leave type: ${error.message}`);
    },
  });

  // Update leave type
  const updateLeaveType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveType> & { id: string }) => {
      const { data, error } = await supabase
        .from("leave_types")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      toast.success("Leave type updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update leave type: ${error.message}`);
    },
  });

  // Delete leave type (soft delete by setting is_active to false)
  const deleteLeaveType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leave_types")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      toast.success("Leave type deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete leave type: ${error.message}`);
    },
  });

  // Create accrual rule
  const createAccrualRule = useMutation({
    mutationFn: async (rule: Partial<LeaveAccrualRule>) => {
      const { data, error } = await supabase
        .from("leave_accrual_rules")
        .insert([rule as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-accrual-rules"] });
      toast.success("Accrual rule created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create accrual rule: ${error.message}`);
    },
  });

  // Update accrual rule
  const updateAccrualRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveAccrualRule> & { id: string }) => {
      const { data, error } = await supabase
        .from("leave_accrual_rules")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-accrual-rules"] });
      toast.success("Accrual rule updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update accrual rule: ${error.message}`);
    },
  });

  // Delete accrual rule
  const deleteAccrualRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leave_accrual_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-accrual-rules"] });
      toast.success("Accrual rule deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete accrual rule: ${error.message}`);
    },
  });

  // Create rollover rule
  const createRolloverRule = useMutation({
    mutationFn: async (rule: Partial<LeaveRolloverRule>) => {
      const { data, error } = await supabase
        .from("leave_rollover_rules")
        .insert([rule as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-rollover-rules"] });
      toast.success("Rollover rule created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create rollover rule: ${error.message}`);
    },
  });

  // Create leave request
  const createLeaveRequest = useMutation({
    mutationFn: async (request: Partial<LeaveRequest>) => {
      const { data, error } = await supabase
        .from("leave_requests")
        .insert([{
          ...request,
          employee_id: request.employee_id || user?.id,
          submitted_at: new Date().toISOString(),
          source: request.source || 'ess',
        } as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["all-leave-requests"] });
      toast.success("Leave request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit leave request: ${error.message}`);
    },
  });

  // Update leave request (for HR Admin editing)
  const updateLeaveRequest = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from("leave_requests")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["all-leave-requests"] });
      toast.success("Leave request updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update leave request: ${error.message}`);
    },
  });

  // Delete leave request
  const deleteLeaveRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leave_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["all-leave-requests"] });
      toast.success("Leave request deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete leave request: ${error.message}`);
    },
  });

  // Update leave request status
  const updateLeaveRequestStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      review_notes,
    }: {
      id: string;
      status: LeaveRequest["status"];
      review_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("leave_requests")
        .update({
          status,
          review_notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["all-leave-requests"] });
      toast.success(`Leave request ${variables.status} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update leave request: ${error.message}`);
    },
  });

  // Create company holiday
  const createHoliday = useMutation({
    mutationFn: async (holiday: Partial<LeaveHoliday>) => {
      const { data, error } = await supabase
        .from("leave_holidays")
        .insert([holiday as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-holidays"] });
      toast.success("Company holiday added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add holiday: ${error.message}`);
    },
  });

  // Create country holiday
  const createCountryHoliday = useMutation({
    mutationFn: async (holiday: Partial<CountryHoliday>) => {
      const { data, error } = await supabase
        .from("country_holidays")
        .insert([holiday as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["country-holidays"] });
      toast.success("Country holiday added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add country holiday: ${error.message}`);
    },
  });

  // Recalculate leave balance
  const recalculateLeaveBalance = useMutation({
    mutationFn: async ({
      employeeId,
      companyId,
      calculationType = 'current_year',
      periodStart,
      periodEnd,
    }: {
      employeeId: string;
      companyId: string;
      calculationType?: 'current_year' | 'from_hire_date' | 'custom_range';
      periodStart?: string;
      periodEnd?: string;
    }) => {
      const { data, error } = await supabase.rpc('recalculate_leave_balance', {
        p_employee_id: employeeId,
        p_company_id: companyId,
        p_calculation_type: calculationType,
        p_period_start: periodStart || null,
        p_period_end: periodEnd || null,
        p_triggered_by: 'manual',
        p_initiated_by: user?.id || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      toast.success("Leave balance recalculated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to recalculate balance: ${error.message}`);
    },
  });

  return {
    // Data
    leaveTypes,
    leaveYears,
    accrualRules,
    rolloverRules,
    leaveBalances,
    allLeaveBalances,
    leaveRequests,
    allLeaveRequests,
    holidays,
    countryHolidays,
    // Loading states
    isLoading: loadingTypes || loadingLeaveYears || loadingAccrualRules || loadingRolloverRules || loadingBalances || loadingRequests || loadingHolidays || loadingAllRequests || loadingCountryHolidays || loadingAllBalances,
    loadingTypes,
    loadingLeaveYears,
    loadingAccrualRules,
    loadingRolloverRules,
    loadingBalances,
    loadingAllBalances,
    loadingRequests,
    loadingAllRequests,
    loadingHolidays,
    loadingCountryHolidays,
    // Mutations
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    createAccrualRule,
    updateAccrualRule,
    deleteAccrualRule,
    createRolloverRule,
    createLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    updateLeaveRequestStatus,
    createHoliday,
    createCountryHoliday,
    recalculateLeaveBalance,
    // Refetch
    refetchBalances,
    refetchAllBalances,
    refetchRequests,
    refetchAllRequests,
  };
}
