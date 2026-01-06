import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ==================== TYPES ====================

export interface LeaveCancellationRequest {
  id: string;
  leave_request_id: string;
  employee_id: string;
  company_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  leave_request?: {
    id: string;
    request_number: string;
    start_date: string;
    end_date: string;
    duration: number;
    leave_type?: { name: string; code: string };
  };
  employee?: { full_name: string; email: string };
  reviewer?: { full_name: string };
}

export interface LeaveEncashmentRequest {
  id: string;
  employee_id: string;
  company_id: string;
  leave_type_id: string;
  leave_year_id: string | null;
  days_requested: number;
  rate_per_day: number | null;
  total_amount: number | null;
  currency: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  payroll_run_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  leave_type?: { name: string; code: string };
  employee?: { full_name: string; email: string };
  approver?: { full_name: string };
}

export interface LeaveLiabilitySnapshot {
  id: string;
  company_id: string;
  snapshot_date: string;
  leave_type_id: string | null;
  department_id: string | null;
  total_employees: number;
  total_days_accrued: number;
  total_days_used: number;
  total_days_balance: number;
  avg_daily_rate: number | null;
  total_liability_amount: number | null;
  currency: string;
  generated_by: string | null;
  notes: string | null;
  created_at: string;
  leave_type?: { name: string };
  department?: { name: string };
}

export interface LeaveRequestAttachment {
  id: string;
  leave_request_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  attachment_type: 'medical_certificate' | 'travel_document' | 'supporting_document' | 'approval_letter' | 'other';
  uploaded_by: string | null;
  description: string | null;
  created_at: string;
}

export interface LeaveBlackoutPeriod {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  leave_type_ids: string[];
  department_ids: string[];
  position_ids: string[];
  applies_to_all: boolean;
  is_hard_block: boolean;
  requires_override_approval: boolean;
  override_approver_role: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveConflictRule {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  rule_type: 'percentage' | 'absolute' | 'critical_roles';
  department_id: string | null;
  max_concurrent_percentage: number;
  max_concurrent_count: number | null;
  critical_role_ids: string[];
  min_coverage_required: number;
  warning_threshold_percentage: number;
  block_threshold_percentage: number;
  is_warning_only: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: { name: string };
}

export interface LeavePlanItem {
  id: string;
  employee_id: string;
  company_id: string;
  leave_type_id: string;
  leave_year_id: string | null;
  planned_start_date: string;
  planned_end_date: string;
  planned_days: number;
  notes: string | null;
  status: 'planned' | 'submitted' | 'approved' | 'cancelled';
  leave_request_id: string | null;
  color: string;
  is_tentative: boolean;
  created_at: string;
  updated_at: string;
  leave_type?: { name: string; code: string; color: string };
}

export interface LeaveProrataSettings {
  id: string;
  company_id: string;
  leave_type_id: string;
  calculation_method: 'daily' | 'monthly' | 'quarterly';
  rounding_method: 'up' | 'down' | 'nearest';
  rounding_precision: number;
  include_join_month: boolean;
  min_service_days_for_accrual: number;
  apply_to_first_year_only: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  leave_type?: { name: string };
}

// ==================== HOOKS ====================

export function useLeaveCancellation(companyId?: string) {
  const { user, company } = useAuth();
  const queryClient = useQueryClient();
  const effectiveCompanyId = companyId || company?.id;

  const { data: cancellationRequests = [], isLoading } = useQuery({
    queryKey: ["leave-cancellation-requests", effectiveCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_cancellation_requests")
        .select(`
          *,
          leave_request:leave_requests(
            id, request_number, start_date, end_date, duration,
            leave_type:leave_types(name, code)
          ),
          employee:profiles!leave_cancellation_requests_employee_id_fkey(full_name, email),
          reviewer:profiles!leave_cancellation_requests_reviewed_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LeaveCancellationRequest[];
    },
    enabled: !!user,
  });

  const createCancellation = useMutation({
    mutationFn: async (data: { leave_request_id: string; reason: string }) => {
      const { data: result, error } = await supabase
        .from("leave_cancellation_requests")
        .insert([{
          ...data,
          employee_id: user?.id,
          company_id: effectiveCompanyId,
        }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-cancellation-requests"] });
      toast.success("Cancellation request submitted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reviewCancellation = useMutation({
    mutationFn: async ({ id, status, review_notes }: { id: string; status: 'approved' | 'rejected'; review_notes?: string }) => {
      const { data, error } = await supabase
        .from("leave_cancellation_requests")
        .update({
          status,
          review_notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      
      // If approved, update the leave request status
      if (status === 'approved') {
        const cancellation = cancellationRequests.find(c => c.id === id);
        if (cancellation) {
          await supabase
            .from("leave_requests")
            .update({ status: 'cancelled' })
            .eq("id", cancellation.leave_request_id);
        }
      }
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["leave-cancellation-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast.success(`Cancellation ${status}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { cancellationRequests, isLoading, createCancellation, reviewCancellation };
}

export function useLeaveEncashment(companyId?: string) {
  const { user, company, isAdmin, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const effectiveCompanyId = companyId || company?.id;
  const isAdminOrHR = isAdmin || hasRole("hr_manager");

  const { data: encashmentRequests = [], isLoading } = useQuery({
    queryKey: ["leave-encashment-requests", effectiveCompanyId, isAdminOrHR],
    queryFn: async () => {
      let query = supabase
        .from("leave_encashment_requests")
        .select(`
          *,
          leave_type:leave_types(name, code),
          employee:profiles!leave_encashment_requests_employee_id_fkey(full_name, email),
          approver:profiles!leave_encashment_requests_approved_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (!isAdminOrHR) {
        query = query.eq("employee_id", user?.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as LeaveEncashmentRequest[];
    },
    enabled: !!user,
  });

  const createEncashment = useMutation({
    mutationFn: async (data: {
      leave_type_id: string;
      leave_year_id?: string;
      days_requested: number;
      rate_per_day?: number;
      reason?: string;
    }) => {
      const total_amount = data.rate_per_day ? data.days_requested * data.rate_per_day : null;
      const { data: result, error } = await supabase
        .from("leave_encashment_requests")
        .insert([{
          ...data,
          total_amount,
          employee_id: user?.id,
          company_id: effectiveCompanyId,
        }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-encashment-requests"] });
      toast.success("Encashment request submitted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reviewEncashment = useMutation({
    mutationFn: async ({ id, status, rejection_reason, rate_per_day }: { 
      id: string; 
      status: 'approved' | 'rejected' | 'paid'; 
      rejection_reason?: string;
      rate_per_day?: number;
    }) => {
      const updates: Record<string, unknown> = {
        status,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      };
      if (rejection_reason) updates.rejection_reason = rejection_reason;
      if (status === 'paid') updates.paid_at = new Date().toISOString();
      if (rate_per_day) {
        updates.rate_per_day = rate_per_day;
        const request = encashmentRequests.find(r => r.id === id);
        if (request) updates.total_amount = request.days_requested * rate_per_day;
      }
      
      const { data, error } = await supabase
        .from("leave_encashment_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["leave-encashment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      toast.success(`Request ${status}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { encashmentRequests, isLoading, createEncashment, reviewEncashment };
}

export function useLeaveLiability(companyId?: string) {
  const { user, company } = useAuth();
  const queryClient = useQueryClient();
  const effectiveCompanyId = companyId || company?.id;

  const { data: liabilitySnapshots = [], isLoading } = useQuery({
    queryKey: ["leave-liability-snapshots", effectiveCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_liability_snapshots")
        .select(`
          *,
          leave_type:leave_types(name),
          department:departments(name)
        `)
        .eq("company_id", effectiveCompanyId)
        .order("snapshot_date", { ascending: false });
      if (error) throw error;
      return data as LeaveLiabilitySnapshot[];
    },
    enabled: !!effectiveCompanyId,
  });

  const generateSnapshot = useMutation({
    mutationFn: async (data: { snapshot_date: string; notes?: string }) => {
      // Get all balances for the company
      const { data: balances, error: balancesError } = await (supabase
        .from("leave_balances")
        .select("*, leave_type:leave_types(*)") as any)
        .eq("company_id", effectiveCompanyId);
      if (balancesError) throw balancesError;

      // Group by leave type
      const byType: Record<string, {
        total_employees: number;
        total_days_accrued: number;
        total_days_used: number;
        total_days_balance: number;
      }> = {};

      (balances || []).forEach((b: any) => {
        const typeId = b.leave_type_id;
        if (!byType[typeId]) {
          byType[typeId] = { total_employees: 0, total_days_accrued: 0, total_days_used: 0, total_days_balance: 0 };
        }
        byType[typeId].total_employees++;
        byType[typeId].total_days_accrued += b.accrued_amount || 0;
        byType[typeId].total_days_used += b.used_amount || 0;
        byType[typeId].total_days_balance += b.current_balance || 0;
      });

      // Insert snapshots for each leave type
      const snapshots = Object.entries(byType).map(([leave_type_id, stats]) => ({
        company_id: effectiveCompanyId,
        snapshot_date: data.snapshot_date,
        leave_type_id,
        ...stats,
        generated_by: user?.id,
        notes: data.notes,
      }));

      const { error } = await supabase.from("leave_liability_snapshots").insert(snapshots as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-liability-snapshots"] });
      toast.success("Liability snapshot generated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { liabilitySnapshots, isLoading, generateSnapshot };
}

export function useLeaveAttachments(leaveRequestId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["leave-attachments", leaveRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_request_attachments")
        .select("*")
        .eq("leave_request_id", leaveRequestId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LeaveRequestAttachment[];
    },
    enabled: !!leaveRequestId,
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ file, attachment_type, description }: {
      file: File;
      attachment_type: LeaveRequestAttachment['attachment_type'];
      description?: string;
    }) => {
      if (!leaveRequestId || !user?.id) throw new Error("Missing required data");
      
      const filePath = `${user.id}/${leaveRequestId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("leave-attachments")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("leave_request_attachments")
        .insert([{
          leave_request_id: leaveRequestId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          attachment_type,
          uploaded_by: user.id,
          description,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-attachments", leaveRequestId] });
      toast.success("Attachment uploaded");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteAttachment = useMutation({
    mutationFn: async (id: string) => {
      const attachment = attachments.find(a => a.id === id);
      if (attachment) {
        await supabase.storage.from("leave-attachments").remove([attachment.file_path]);
      }
      const { error } = await supabase.from("leave_request_attachments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-attachments", leaveRequestId] });
      toast.success("Attachment deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { attachments, isLoading, uploadAttachment, deleteAttachment };
}

export function useLeaveBlackouts(companyId?: string) {
  const { user, company } = useAuth();
  const queryClient = useQueryClient();
  const effectiveCompanyId = companyId || company?.id;

  const { data: blackoutPeriods = [], isLoading } = useQuery({
    queryKey: ["leave-blackout-periods", effectiveCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_blackout_periods")
        .select("*")
        .eq("company_id", effectiveCompanyId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as LeaveBlackoutPeriod[];
    },
    enabled: !!effectiveCompanyId,
  });

  const createBlackout = useMutation({
    mutationFn: async (data: { name: string; start_date: string; end_date: string } & Partial<LeaveBlackoutPeriod>) => {
      const { data: result, error } = await supabase
        .from("leave_blackout_periods")
        .insert([{ ...data, company_id: effectiveCompanyId, created_by: user?.id }] as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-blackout-periods"] });
      toast.success("Blackout period created");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateBlackout = useMutation({
    mutationFn: async ({ id, ...data }: Partial<LeaveBlackoutPeriod> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("leave_blackout_periods")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-blackout-periods"] });
      toast.success("Blackout period updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteBlackout = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leave_blackout_periods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-blackout-periods"] });
      toast.success("Blackout period deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Check if a date range conflicts with blackout periods
  const checkBlackoutConflict = (startDate: string, endDate: string, leaveTypeId?: string) => {
    return blackoutPeriods.filter(bp => {
      if (!bp.is_active) return false;
      const bpStart = new Date(bp.start_date);
      const bpEnd = new Date(bp.end_date);
      const reqStart = new Date(startDate);
      const reqEnd = new Date(endDate);
      
      const datesOverlap = reqStart <= bpEnd && reqEnd >= bpStart;
      if (!datesOverlap) return false;
      
      if (bp.applies_to_all) return true;
      if (leaveTypeId && bp.leave_type_ids?.includes(leaveTypeId)) return true;
      return false;
    });
  };

  return { blackoutPeriods, isLoading, createBlackout, updateBlackout, deleteBlackout, checkBlackoutConflict };
}

export function useLeaveConflictRules(companyId?: string) {
  const { user, company } = useAuth();
  const queryClient = useQueryClient();
  const effectiveCompanyId = companyId || company?.id;

  const { data: conflictRules = [], isLoading } = useQuery({
    queryKey: ["leave-conflict-rules", effectiveCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_conflict_rules")
        .select("*, department:departments(name)")
        .eq("company_id", effectiveCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LeaveConflictRule[];
    },
    enabled: !!effectiveCompanyId,
  });

  const createRule = useMutation({
    mutationFn: async (data: { name: string } & Partial<LeaveConflictRule>) => {
      const { data: result, error } = await supabase
        .from("leave_conflict_rules")
        .insert([{ ...data, company_id: effectiveCompanyId }] as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-conflict-rules"] });
      toast.success("Conflict rule created");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...data }: Partial<LeaveConflictRule> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("leave_conflict_rules")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-conflict-rules"] });
      toast.success("Conflict rule updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leave_conflict_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-conflict-rules"] });
      toast.success("Conflict rule deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { conflictRules, isLoading, createRule, updateRule, deleteRule };
}

export function useLeavePlanner(companyId?: string) {
  const { user, company } = useAuth();
  const queryClient = useQueryClient();
  const effectiveCompanyId = companyId || company?.id;

  const { data: planItems = [], isLoading } = useQuery({
    queryKey: ["leave-plan-items", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_plan_items")
        .select("*, leave_type:leave_types(name, code, color)")
        .eq("employee_id", user?.id)
        .order("planned_start_date");
      if (error) throw error;
      return data as LeavePlanItem[];
    },
    enabled: !!user?.id,
  });

  const createPlanItem = useMutation({
    mutationFn: async (data: { leave_type_id: string; planned_start_date: string; planned_end_date: string; planned_days: number } & Partial<LeavePlanItem>) => {
      const { data: result, error } = await supabase
        .from("leave_plan_items")
        .insert([{ ...data, employee_id: user?.id, company_id: effectiveCompanyId }] as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-plan-items"] });
      toast.success("Leave plan item created");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updatePlanItem = useMutation({
    mutationFn: async ({ id, ...data }: Partial<LeavePlanItem> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("leave_plan_items")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-plan-items"] });
      toast.success("Leave plan item updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deletePlanItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leave_plan_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-plan-items"] });
      toast.success("Leave plan item deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { planItems, isLoading, createPlanItem, updatePlanItem, deletePlanItem };
}

export function useLeaveProrataSettings(companyId?: string) {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const effectiveCompanyId = companyId || company?.id;

  const { data: prorataSettings = [], isLoading } = useQuery({
    queryKey: ["leave-prorata-settings", effectiveCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_prorata_settings")
        .select("*, leave_type:leave_types(name)")
        .eq("company_id", effectiveCompanyId);
      if (error) throw error;
      return data as LeaveProrataSettings[];
    },
    enabled: !!effectiveCompanyId,
  });

  const upsertSettings = useMutation({
    mutationFn: async (data: { leave_type_id: string } & Partial<LeaveProrataSettings>) => {
      const { data: result, error } = await supabase
        .from("leave_prorata_settings")
        .upsert({ ...data, company_id: effectiveCompanyId } as any, { onConflict: 'company_id,leave_type_id' })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-prorata-settings"] });
      toast.success("Pro-rata settings saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Calculate pro-rata entitlement
  const calculateProrata = (
    annualEntitlement: number,
    joinDate: string,
    leaveTypeId: string,
    yearStart: string,
    yearEnd: string
  ): number => {
    const settings = prorataSettings.find(s => s.leave_type_id === leaveTypeId);
    if (!settings || !settings.is_active) return annualEntitlement;

    const join = new Date(joinDate);
    const start = new Date(yearStart);
    const end = new Date(yearEnd);

    if (join <= start) return annualEntitlement;
    if (join > end) return 0;

    let fraction = 0;
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const daysWorked = (end.getTime() - join.getTime()) / (1000 * 60 * 60 * 24);

    switch (settings.calculation_method) {
      case 'daily':
        fraction = daysWorked / totalDays;
        break;
      case 'monthly':
        const monthsRemaining = 12 - join.getMonth() + (settings.include_join_month ? 1 : 0);
        fraction = Math.max(0, monthsRemaining) / 12;
        break;
      case 'quarterly':
        const quarter = Math.floor(join.getMonth() / 3);
        const quartersRemaining = 4 - quarter;
        fraction = quartersRemaining / 4;
        break;
    }

    let prorata = annualEntitlement * fraction;

    // Apply rounding
    const precision = settings.rounding_precision || 0.5;
    switch (settings.rounding_method) {
      case 'up':
        prorata = Math.ceil(prorata / precision) * precision;
        break;
      case 'down':
        prorata = Math.floor(prorata / precision) * precision;
        break;
      case 'nearest':
        prorata = Math.round(prorata / precision) * precision;
        break;
    }

    return prorata;
  };

  return { prorataSettings, isLoading, upsertSettings, calculateProrata };
}
