import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CompTimePolicy {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  expiry_type: 'configurable' | 'no_expiry' | 'year_end_reset';
  expiry_days: number | null;
  max_balance_hours: number | null;
  requires_approval: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompTimeEarned {
  id: string;
  employee_id: string;
  company_id: string;
  policy_id: string | null;
  hours_earned: number;
  work_date: string;
  reason: string;
  work_type: 'overtime' | 'holiday_work' | 'weekend_work' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expires_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: { full_name: string; email: string };
  approver?: { full_name: string };
}

export interface CompTimeUsed {
  id: string;
  employee_id: string;
  company_id: string;
  hours_used: number;
  use_date: string;
  reason: string | null;
  leave_request_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  employee?: { full_name: string; email: string };
  approver?: { full_name: string };
}

export interface CompTimeBalance {
  id: string;
  employee_id: string;
  company_id: string;
  total_earned: number;
  total_used: number;
  total_expired: number;
  current_balance: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
  employee?: { full_name: string; email: string };
}

export function useCompensatoryTime(companyId?: string) {
  const { user, company, isAdmin, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const effectiveCompanyId = companyId || company?.id;

  // Fetch policies
  const { data: policies = [], isLoading: loadingPolicies } = useQuery({
    queryKey: ["comp-time-policies", effectiveCompanyId],
    queryFn: async () => {
      const query = supabase
        .from("comp_time_policies")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (effectiveCompanyId) {
        query.eq("company_id", effectiveCompanyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CompTimePolicy[];
    },
    enabled: !!user,
  });

  // Fetch earned requests (employee's own or all for admin)
  const { data: earnedRequests = [], isLoading: loadingEarned, refetch: refetchEarned } = useQuery({
    queryKey: ["comp-time-earned", effectiveCompanyId, isAdminOrHR],
    queryFn: async () => {
      let query = supabase
        .from("comp_time_earned")
        .select(`
          *,
          employee:profiles!comp_time_earned_employee_id_fkey(full_name, email),
          approver:profiles!comp_time_earned_approved_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (effectiveCompanyId) {
        query = query.eq("company_id", effectiveCompanyId);
      }
      
      if (!isAdminOrHR) {
        query = query.eq("employee_id", user?.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CompTimeEarned[];
    },
    enabled: !!user,
  });

  // Fetch used requests
  const { data: usedRequests = [], isLoading: loadingUsed, refetch: refetchUsed } = useQuery({
    queryKey: ["comp-time-used", effectiveCompanyId, isAdminOrHR],
    queryFn: async () => {
      let query = supabase
        .from("comp_time_used")
        .select(`
          *,
          employee:profiles!comp_time_used_employee_id_fkey(full_name, email),
          approver:profiles!comp_time_used_approved_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (effectiveCompanyId) {
        query = query.eq("company_id", effectiveCompanyId);
      }
      
      if (!isAdminOrHR) {
        query = query.eq("employee_id", user?.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CompTimeUsed[];
    },
    enabled: !!user,
  });

  // Fetch balances
  const { data: balances = [], isLoading: loadingBalances, refetch: refetchBalances } = useQuery({
    queryKey: ["comp-time-balances", effectiveCompanyId, isAdminOrHR],
    queryFn: async () => {
      let query = supabase
        .from("comp_time_balances")
        .select(`
          *,
          employee:profiles!comp_time_balances_employee_id_fkey(full_name, email)
        `)
        .order("current_balance", { ascending: false });
      
      if (effectiveCompanyId) {
        query = query.eq("company_id", effectiveCompanyId);
      }
      
      if (!isAdminOrHR) {
        query = query.eq("employee_id", user?.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CompTimeBalance[];
    },
    enabled: !!user,
  });

  // My balance (single user)
  const myBalance = balances.find(b => b.employee_id === user?.id);

  // Create policy
  const createPolicy = useMutation({
    mutationFn: async (policy: Partial<CompTimePolicy>) => {
      const { data, error } = await supabase
        .from("comp_time_policies")
        .insert([policy])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comp-time-policies"] });
      toast.success("Policy created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create policy: ${error.message}`);
    },
  });

  // Update policy
  const updatePolicy = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CompTimePolicy> & { id: string }) => {
      const { data, error } = await supabase
        .from("comp_time_policies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comp-time-policies"] });
      toast.success("Policy updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update policy: ${error.message}`);
    },
  });

  // Submit comp time earned request
  const submitEarnedRequest = useMutation({
    mutationFn: async (request: Partial<CompTimeEarned>) => {
      const { data, error } = await supabase
        .from("comp_time_earned")
        .insert([{
          ...request,
          employee_id: user?.id,
          company_id: effectiveCompanyId,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comp-time-earned"] });
      queryClient.invalidateQueries({ queryKey: ["comp-time-balances"] });
      toast.success("Comp time request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit request: ${error.message}`);
    },
  });

  // Approve/reject earned request
  const updateEarnedStatus = useMutation({
    mutationFn: async ({ id, status, rejection_reason }: { id: string; status: 'approved' | 'rejected'; rejection_reason?: string }) => {
      const updates: Partial<CompTimeEarned> = {
        status,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      };
      if (rejection_reason) {
        updates.rejection_reason = rejection_reason;
      }
      
      const { data, error } = await supabase
        .from("comp_time_earned")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comp-time-earned"] });
      queryClient.invalidateQueries({ queryKey: ["comp-time-balances"] });
      toast.success(`Request ${variables.status === 'approved' ? 'approved' : 'rejected'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });

  // Submit comp time usage request
  const submitUsedRequest = useMutation({
    mutationFn: async (request: Partial<CompTimeUsed>) => {
      const { data, error } = await supabase
        .from("comp_time_used")
        .insert([{
          ...request,
          employee_id: user?.id,
          company_id: effectiveCompanyId,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comp-time-used"] });
      queryClient.invalidateQueries({ queryKey: ["comp-time-balances"] });
      toast.success("Usage request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit usage request: ${error.message}`);
    },
  });

  // Approve/reject usage request
  const updateUsedStatus = useMutation({
    mutationFn: async ({ id, status, rejection_reason }: { id: string; status: 'approved' | 'rejected'; rejection_reason?: string }) => {
      const updates: Partial<CompTimeUsed> = {
        status,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      };
      if (rejection_reason) {
        updates.rejection_reason = rejection_reason;
      }
      
      const { data, error } = await supabase
        .from("comp_time_used")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comp-time-used"] });
      queryClient.invalidateQueries({ queryKey: ["comp-time-balances"] });
      toast.success(`Request ${variables.status === 'approved' ? 'approved' : 'rejected'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });

  return {
    // Data
    policies,
    earnedRequests,
    usedRequests,
    balances,
    myBalance,
    
    // Loading states
    loadingPolicies,
    loadingEarned,
    loadingUsed,
    loadingBalances,
    isLoading: loadingPolicies || loadingEarned || loadingUsed || loadingBalances,
    
    // Mutations
    createPolicy,
    updatePolicy,
    submitEarnedRequest,
    updateEarnedStatus,
    submitUsedRequest,
    updateUsedStatus,
    
    // Refetch
    refetchEarned,
    refetchUsed,
    refetchBalances,
  };
}
