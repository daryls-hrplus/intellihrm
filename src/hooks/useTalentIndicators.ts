import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IndicatorDefinition {
  id: string;
  company_id: string | null;
  code: string;
  name: string;
  description: string | null;
  category: "readiness" | "risk" | "potential" | "engagement" | "performance";
  calculation_method: "formula" | "ai_computed" | "manual" | "hybrid";
  calculation_config: Record<string, any>;
  threshold_levels: { low: number; medium: number; high: number };
  data_sources: string[];
  applies_to: string[];
  refresh_frequency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IndicatorScore {
  id: string;
  employee_id: string;
  indicator_id: string;
  company_id: string;
  score: number;
  level: "low" | "medium" | "high" | "critical";
  confidence: number | null;
  trend: "improving" | "stable" | "declining" | null;
  trend_percentage: number | null;
  explanation: string | null;
  explanation_factors: Record<string, any> | null;
  data_points_used: number | null;
  computed_at: string;
  valid_until: string | null;
  indicator?: IndicatorDefinition;
  employee?: { full_name: string; email: string };
}

export interface IndicatorAlert {
  id: string;
  indicator_score_id: string;
  employee_id: string;
  company_id: string;
  alert_type: "threshold_breach" | "trend_change" | "confidence_drop" | "stale_data";
  severity: "info" | "warning" | "critical";
  message: string;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
  employee?: { full_name: string };
  indicator_score?: IndicatorScore;
}

export function useTalentIndicatorDefinitions(companyId?: string) {
  return useQuery({
    queryKey: ["talent-indicator-definitions", companyId],
    queryFn: async () => {
      let query = supabase
        .from("talent_indicator_definitions")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      // Include global definitions (company_id is null) and company-specific
      if (companyId) {
        query = query.or(`company_id.is.null,company_id.eq.${companyId}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as IndicatorDefinition[];
    },
    enabled: true,
  });
}

export function useTalentIndicatorScores(companyId?: string, employeeId?: string) {
  return useQuery({
    queryKey: ["talent-indicator-scores", companyId, employeeId],
    queryFn: async () => {
      let query = supabase
        .from("talent_indicator_scores")
        .select(`
          *,
          indicator:talent_indicator_definitions(*),
          employee:profiles(full_name, email)
        `)
        .order("computed_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as IndicatorScore[];
    },
    enabled: !!companyId || !!employeeId,
  });
}

export function useTalentIndicatorAlerts(companyId?: string, unacknowledgedOnly = true) {
  return useQuery({
    queryKey: ["talent-indicator-alerts", companyId, unacknowledgedOnly],
    queryFn: async () => {
      let query = supabase
        .from("talent_indicator_alerts")
        .select(`
          *,
          indicator_score:talent_indicator_scores(
            score, level, trend,
            indicator:talent_indicator_definitions(name, code, category)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      if (unacknowledgedOnly) {
        query = query.eq("acknowledged", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch employee names separately to avoid the relationship ambiguity
      const alertsWithEmployees = await Promise.all(
        (data || []).map(async (alert: any) => {
          const { data: employee } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", alert.employee_id)
            .single();
          return { ...alert, employee };
        })
      );
      
      return alertsWithEmployees as unknown as IndicatorAlert[];
    },
    enabled: !!companyId,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, userId }: { alertId: string; userId: string }) => {
      const { error } = await supabase
        .from("talent_indicator_alerts")
        .update({
          acknowledged: true,
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-indicator-alerts"] });
      toast.success("Alert acknowledged");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to acknowledge alert");
    },
  });
}

export function useCreateIndicatorDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (definition: Partial<IndicatorDefinition>) => {
      const { data, error } = await supabase
        .from("talent_indicator_definitions")
        .insert(definition as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-indicator-definitions"] });
      toast.success("Indicator definition created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create indicator definition");
    },
  });
}
