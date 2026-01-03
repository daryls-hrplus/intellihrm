import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ModuleEvidenceCard {
  id: string;
  employee_id: string;
  company_id: string;
  module_type: string;
  module_entity_id: string | null;
  evidence_type: string;
  source_snapshot_id: string | null;
  display_summary: string | null;
  confidence_level: number | null;
  is_referenced: boolean;
  referenced_at: string | null;
  referenced_by: string | null;
  created_at: string;
  source_snapshot?: {
    id: string;
    signal_value: number | null;
    confidence_score: number | null;
    bias_risk_level: string;
    evidence_summary: Record<string, unknown>;
    signal_definition?: {
      code: string;
      name: string;
      signal_category: string;
    };
  };
}

export interface EvidenceUsageAudit {
  id: string;
  evidence_card_id: string;
  used_in_module: string;
  used_in_entity_id: string | null;
  action: string;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useModuleEvidence(employeeId?: string, moduleType?: string) {
  return useQuery({
    queryKey: ['module-evidence', employeeId, moduleType],
    queryFn: async () => {
      let query = supabase
        .from('module_evidence_cards')
        .select(`
          *,
          source_snapshot:talent_signal_snapshots(
            id,
            signal_value,
            confidence_score,
            bias_risk_level,
            evidence_summary,
            signal_definition:talent_signal_definitions(code, name, signal_category)
          )
        `)
        .order('created_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      if (moduleType) {
        query = query.eq('module_type', moduleType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ModuleEvidenceCard[];
    },
    enabled: !!employeeId,
  });
}

export function useEvidenceLineage(snapshotId?: string) {
  return useQuery({
    queryKey: ['evidence-lineage', snapshotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signal_evidence_links')
        .select('*')
        .eq('snapshot_id', snapshotId);
      if (error) throw error;
      return data;
    },
    enabled: !!snapshotId,
  });
}

export function useLogEvidenceUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (usage: {
      evidence_card_id: string;
      used_in_module: string;
      used_in_entity_id?: string;
      action: 'viewed' | 'referenced' | 'cited' | 'exported';
      metadata?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = {
        evidence_card_id: usage.evidence_card_id,
        used_in_module: usage.used_in_module,
        used_in_entity_id: usage.used_in_entity_id,
        action: usage.action,
        metadata: usage.metadata || {},
        user_id: user?.id,
      };

      const { data, error } = await supabase
        .from('evidence_usage_audit')
        .insert(insertData as never)
        .select()
        .single();
      
      if (error) throw error;

      // Mark card as referenced if action is 'referenced' or 'cited'
      if (usage.action === 'referenced' || usage.action === 'cited') {
        await supabase
          .from('module_evidence_cards')
          .update({
            is_referenced: true,
            referenced_at: new Date().toISOString(),
            referenced_by: user?.id,
          })
          .eq('id', usage.evidence_card_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-evidence'] });
    },
  });
}

export function useCreateEvidenceCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: {
      employee_id: string;
      company_id: string;
      module_type: string;
      module_entity_id?: string;
      evidence_type: string;
      source_snapshot_id?: string;
      display_summary?: string;
      confidence_level?: number;
    }) => {
      const { data, error } = await supabase
        .from('module_evidence_cards')
        .insert(card)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-evidence'] });
      toast.success('Evidence card created');
    },
    onError: (error) => {
      toast.error(`Failed to create evidence card: ${error.message}`);
    },
  });
}
