import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ApprovalMode = 'auto_approve' | 'hr_review' | 'workflow';

export interface ESSApprovalPolicy {
  id: string;
  company_id: string | null;
  request_type: string;
  field_name: string | null;
  approval_mode: ApprovalMode;
  workflow_template_id: string | null;
  requires_documentation: boolean;
  notification_only: boolean;
  effective_date: string;
  country_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PolicyFormData {
  request_type: string;
  field_name?: string | null;
  approval_mode: ApprovalMode;
  workflow_template_id?: string | null;
  requires_documentation?: boolean;
  notification_only?: boolean;
  effective_date?: string;
  country_code?: string | null;
  is_active?: boolean;
}

// Default policies to seed if none exist
const DEFAULT_POLICIES: Omit<PolicyFormData, 'company_id'>[] = [
  { request_type: 'personal_contact', approval_mode: 'hr_review', notification_only: false },
  { request_type: 'emergency_contact', approval_mode: 'auto_approve', notification_only: true },
  { request_type: 'address', approval_mode: 'auto_approve', notification_only: true },
  { request_type: 'qualification', approval_mode: 'hr_review', notification_only: false },
];

export function useESSApprovalPolicies() {
  const { company } = useAuth();
  const queryClient = useQueryClient();

  const { data: policies, isLoading, error } = useQuery({
    queryKey: ["ess-approval-policies", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ess_approval_policies")
        .select("*")
        .eq("company_id", company?.id)
        .order("request_type", { ascending: true });
      
      if (error) throw error;
      return data as ESSApprovalPolicy[];
    },
    enabled: !!company?.id,
  });

  const createPolicy = useMutation({
    mutationFn: async (policy: PolicyFormData) => {
      const { data, error } = await supabase
        .from("ess_approval_policies")
        .insert({
          ...policy,
          company_id: company?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-approval-policies", company?.id] });
      toast.success("Policy created successfully");
    },
    onError: (error: any) => {
      console.error("Create policy error:", error);
      toast.error(error.message || "Failed to create policy");
    },
  });

  const updatePolicy = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ESSApprovalPolicy> & { id: string }) => {
      const { data, error } = await supabase
        .from("ess_approval_policies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-approval-policies", company?.id] });
      toast.success("Policy updated successfully");
    },
    onError: (error: any) => {
      console.error("Update policy error:", error);
      toast.error(error.message || "Failed to update policy");
    },
  });

  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ess_approval_policies")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-approval-policies", company?.id] });
      toast.success("Policy deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete policy error:", error);
      toast.error(error.message || "Failed to delete policy");
    },
  });

  const seedDefaultPolicies = useMutation({
    mutationFn: async () => {
      const policiesToInsert = DEFAULT_POLICIES.map(p => ({
        ...p,
        company_id: company?.id,
      }));
      
      const { data, error } = await supabase
        .from("ess_approval_policies")
        .insert(policiesToInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-approval-policies", company?.id] });
      toast.success("Default policies created");
    },
    onError: (error: any) => {
      console.error("Seed policies error:", error);
      toast.error(error.message || "Failed to create default policies");
    },
  });

  return {
    policies,
    isLoading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy,
    seedDefaultPolicies,
    hasNoPolicies: !isLoading && (!policies || policies.length === 0),
  };
}

// Hook for looking up the approval policy for a specific request type
export function useApprovalPolicyLookup(requestType: string) {
  const { company } = useAuth();

  const { data: policy } = useQuery({
    queryKey: ["ess-approval-policy-lookup", company?.id, requestType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ess_approval_policies")
        .select("*")
        .eq("company_id", company?.id)
        .eq("request_type", requestType)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data as ESSApprovalPolicy | null;
    },
    enabled: !!company?.id && !!requestType,
  });

  // Default to hr_review if no policy configured
  const effectiveMode: ApprovalMode = policy?.approval_mode || 'hr_review';
  const notificationOnly = policy?.notification_only || false;

  return {
    policy,
    approvalMode: effectiveMode,
    requiresDocumentation: policy?.requires_documentation || false,
    notificationOnly,
    workflowTemplateId: policy?.workflow_template_id,
  };
}
