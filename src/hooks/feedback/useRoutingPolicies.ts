import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RoutingPolicy {
  id: string;
  company_id: string;
  source_type: string;
  target_module: string;
  is_enabled: boolean;
  visibility_delay_days: number;
  require_release: boolean;
  min_completion_rate: number;
  created_at: string;
  updated_at: string;
}

export const SOURCE_TYPES = [
  { value: '360_cycle', label: '360 Feedback Cycles' },
  { value: 'appraisal', label: 'Performance Appraisals' },
  { value: 'continuous_feedback', label: 'Continuous Feedback' },
  { value: 'project_feedback', label: 'Project Feedback' },
] as const;

export const TARGET_MODULES = [
  { value: 'appraisal', label: 'Appraisals' },
  { value: 'talent_profile', label: 'Talent Profile' },
  { value: 'nine_box', label: '9-Box Grid' },
  { value: 'succession', label: 'Succession Planning' },
  { value: 'idp', label: 'Individual Development Plans' },
  { value: 'analytics', label: 'Analytics & Reporting' },
] as const;

export function useRoutingPolicies(companyId?: string) {
  return useQuery({
    queryKey: ['routing-policies', companyId],
    queryFn: async () => {
      let query = supabase
        .from('signal_routing_policies')
        .select('*')
        .order('source_type', { ascending: true });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RoutingPolicy[];
    },
    enabled: !!companyId,
  });
}

export function useManageRoutingPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policy: Partial<RoutingPolicy> & { company_id: string }) => {
      if (policy.id) {
        const { data, error } = await supabase
          .from('signal_routing_policies')
          .update({
            is_enabled: policy.is_enabled,
            visibility_delay_days: policy.visibility_delay_days,
            require_release: policy.require_release,
            min_completion_rate: policy.min_completion_rate,
          })
          .eq('id', policy.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('signal_routing_policies')
          .insert({
            company_id: policy.company_id,
            source_type: policy.source_type,
            target_module: policy.target_module,
            is_enabled: policy.is_enabled ?? true,
            visibility_delay_days: policy.visibility_delay_days ?? 0,
            require_release: policy.require_release ?? true,
            min_completion_rate: policy.min_completion_rate ?? 0.7,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-policies'] });
      toast.success('Routing policy saved');
    },
    onError: (error) => {
      toast.error(`Failed to save routing policy: ${error.message}`);
    },
  });
}

export function useDeleteRoutingPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyId: string) => {
      const { error } = await supabase
        .from('signal_routing_policies')
        .delete()
        .eq('id', policyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-policies'] });
      toast.success('Routing policy deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete routing policy: ${error.message}`);
    },
  });
}
