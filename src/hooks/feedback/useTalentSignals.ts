import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TalentSignalDefinition {
  id: string;
  company_id: string | null;
  code: string;
  name: string;
  name_en: string | null;
  description: string | null;
  signal_category: string;
  aggregation_method: string;
  confidence_threshold: number;
  bias_risk_factors: any;
  is_system_defined: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TalentSignalSnapshot {
  id: string;
  employee_id: string;
  company_id: string;
  signal_definition_id: string;
  source_cycle_id: string | null;
  source_type: string;
  snapshot_version: number;
  signal_value: number | null;
  raw_score: number | null;
  normalized_score: number | null;
  confidence_score: number | null;
  bias_risk_level: string;
  bias_factors: any;
  evidence_count: number;
  evidence_summary: any;
  rater_breakdown: any;
  valid_from: string;
  valid_until: string | null;
  is_current: boolean;
  computed_at: string;
  created_at: string;
  signal_definition?: TalentSignalDefinition;
}

export interface SignalSummary {
  employee_id: string;
  signals: TalentSignalSnapshot[];
  by_category: Record<string, TalentSignalSnapshot[]>;
  summary: {
    overall_score: number | null;
    signal_count: number;
    avg_confidence: number;
    strengths: Array<{ name: string; score: number; confidence: number }>;
    development_areas: Array<{ name: string; score: number; confidence: number }>;
  };
}

// Fetch signal definitions for a company
export function useTalentSignalDefinitions(companyId?: string) {
  return useQuery({
    queryKey: ["talent-signal-definitions", companyId],
    queryFn: async () => {
      const query = supabase
        .from("talent_signal_definitions")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (companyId) {
        query.or(`company_id.eq.${companyId},company_id.is.null`);
      } else {
        query.is("company_id", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TalentSignalDefinition[];
    },
    enabled: true,
  });
}

// Fetch current signal snapshots for an employee
export function useTalentSignalSnapshots(employeeId?: string) {
  return useQuery({
    queryKey: ["talent-signal-snapshots", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from("talent_signal_snapshots")
        .select(`
          *,
          signal_definition:talent_signal_definitions(*)
        `)
        .eq("employee_id", employeeId)
        .eq("is_current", true)
        .order("signal_value", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as TalentSignalSnapshot[];
    },
    enabled: !!employeeId,
  });
}

// Fetch signal history for an employee over time
export function useTalentSignalHistory(employeeId?: string, signalCode?: string) {
  return useQuery({
    queryKey: ["talent-signal-history", employeeId, signalCode],
    queryFn: async () => {
      if (!employeeId) return [];

      let query = supabase
        .from("talent_signal_snapshots")
        .select(`
          *,
          signal_definition:talent_signal_definitions(code, name, signal_category)
        `)
        .eq("employee_id", employeeId)
        .order("computed_at", { ascending: true });

      if (signalCode) {
        const { data: signalDef } = await supabase
          .from("talent_signal_definitions")
          .select("id")
          .eq("code", signalCode)
          .single();

        if (signalDef) {
          query = query.eq("signal_definition_id", signalDef.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as TalentSignalSnapshot[];
    },
    enabled: !!employeeId,
  });
}

// Fetch signal summary via edge function
export function useTalentSignalSummary(employeeId?: string, companyId?: string) {
  return useQuery({
    queryKey: ["talent-signal-summary", employeeId, companyId],
    queryFn: async () => {
      if (!employeeId || !companyId) return null;

      const { data, error } = await supabase.functions.invoke("feedback-signal-processor", {
        body: {
          action: "get_signal_summary",
          employeeId,
          companyId,
        },
      });

      if (error) throw error;
      return data as SignalSummary;
    },
    enabled: !!employeeId && !!companyId,
  });
}

// Process signals for a completed cycle
export function useProcessCycleSignals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cycleId, companyId }: { cycleId: string; companyId: string }) => {
      const { data, error } = await supabase.functions.invoke("feedback-signal-processor", {
        body: {
          action: "process_cycle",
          cycleId,
          companyId,
        },
      });

      if (error) throw error;
      return data as { success: boolean; processed: number; employees: string[] };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["talent-signal-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["talent-signal-summary"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-360-cycles"] });
      toast({
        title: "Signals Processed",
        description: `Successfully processed signals for ${data.processed} employees.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process cycle signals.",
        variant: "destructive",
      });
    },
  });
}

// Create or update a signal definition
export function useManageSignalDefinition() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (definition: Partial<TalentSignalDefinition> & { id?: string }) => {
      const { id, ...rest } = definition;
      if (id) {
        const { data, error } = await supabase
          .from("talent_signal_definitions")
          .update(rest as any)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("talent_signal_definitions")
          .insert(rest as any)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["talent-signal-definitions"] });
      toast({
        title: variables.id ? "Signal Updated" : "Signal Created",
        description: `Signal definition has been ${variables.id ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save signal definition.",
        variant: "destructive",
      });
    },
  });
}

// Delete a signal definition
export function useDeleteSignalDefinition() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("talent_signal_definitions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-signal-definitions"] });
      toast({
        title: "Signal Deleted",
        description: "Signal definition has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete signal definition.",
        variant: "destructive",
      });
    },
  });
}
