import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RiskAssessment {
  risk_category: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  contributing_factors: string[];
  recommended_interventions: string[];
  trend_direction: 'improving' | 'stable' | 'declining';
}

export interface EmployeeRiskResult {
  employee_id: string;
  employee_name: string;
  department_id: string;
  composite_risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  primary_risk_category: string;
  risk_assessments: {
    flight_risk: RiskAssessment;
    performance_decline: RiskAssessment;
    disengagement: RiskAssessment;
  };
}

export interface TalentRiskAnalysisResult {
  success: boolean;
  analyzed_count: number;
  results: EmployeeRiskResult[];
  high_risk_count: number;
}

export function useTalentRiskAnalysis(companyId?: string) {
  const queryClient = useQueryClient();

  // Fetch stored risk assessments
  const { data: storedRisks, isLoading: isLoadingRisks, refetch: refetchRisks } = useQuery({
    queryKey: ['employee-performance-risks', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('employee_performance_risks' as any)
        .select(`
          *,
          profiles:employee_id (
            id,
            first_name,
            last_name,
            department_id,
            departments:department_id (name)
          )
        `)
        .eq('company_id', companyId)
        .order('risk_score', { ascending: false });

      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!companyId
  });

  // Fetch risk trend history
  const { data: trendHistory } = useQuery({
    queryKey: ['performance-trend-history', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('performance_trend_history' as any)
        .select('*')
        .eq('company_id', companyId)
        .order('snapshot_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!companyId
  });

  // Fetch interventions
  const { data: interventions, refetch: refetchInterventions } = useQuery({
    queryKey: ['performance-risk-interventions', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('performance_risk_interventions' as any)
        .select(`
          *,
          profiles:employee_id (first_name, last_name),
          assigned_profiles:assigned_to (first_name, last_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!companyId
  });

  // Run AI analysis mutation
  const runAnalysisMutation = useMutation({
    mutationFn: async ({ 
      departmentId, 
      employeeIds 
    }: { 
      departmentId?: string; 
      employeeIds?: string[] 
    }) => {
      const { data, error } = await supabase.functions.invoke('talent-risk-analyzer', {
        body: { 
          company_id: companyId, 
          department_id: departmentId,
          employee_ids: employeeIds
        }
      });

      if (error) throw error;
      return data as TalentRiskAnalysisResult;
    },
    onSuccess: (data) => {
      toast.success(`Analyzed ${data.analyzed_count} employees. Found ${data.high_risk_count} high-risk cases.`);
      queryClient.invalidateQueries({ queryKey: ['employee-performance-risks'] });
      queryClient.invalidateQueries({ queryKey: ['performance-trend-history'] });
    },
    onError: (error) => {
      console.error('Risk analysis error:', error);
      toast.error('Failed to run risk analysis');
    }
  });

  // Create intervention mutation
  const createInterventionMutation = useMutation({
    mutationFn: async (intervention: {
      employee_id: string;
      risk_id: string;
      intervention_type: string;
      description: string;
      assigned_to?: string;
      due_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('performance_risk_interventions' as any)
        .insert({
          ...intervention,
          company_id: companyId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Intervention created');
      refetchInterventions();
    },
    onError: (error) => {
      console.error('Create intervention error:', error);
      toast.error('Failed to create intervention');
    }
  });

  // Update intervention status
  const updateInterventionMutation = useMutation({
    mutationFn: async ({ id, status, outcome_notes }: { 
      id: string; 
      status: string; 
      outcome_notes?: string 
    }) => {
      const updates: Record<string, unknown> = { status };
      if (outcome_notes) updates.outcome_notes = outcome_notes;
      if (status === 'completed') updates.completed_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('performance_risk_interventions' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Intervention updated');
      refetchInterventions();
    }
  });

  // Calculate summary stats
  const riskSummary = {
    total: storedRisks?.length || 0,
    critical: storedRisks?.filter((r: any) => r.risk_level === 'critical').length || 0,
    high: storedRisks?.filter((r: any) => r.risk_level === 'high').length || 0,
    medium: storedRisks?.filter((r: any) => r.risk_level === 'medium').length || 0,
    low: storedRisks?.filter((r: any) => r.risk_level === 'low').length || 0,
    byCategory: {
      flight_risk: storedRisks?.filter((r: any) => r.risk_category === 'flight_risk').length || 0,
      performance_decline: storedRisks?.filter((r: any) => r.risk_category === 'performance_decline').length || 0,
      disengagement: storedRisks?.filter((r: any) => r.risk_category === 'disengagement').length || 0
    }
  };

  return {
    storedRisks,
    trendHistory,
    interventions,
    riskSummary,
    isLoadingRisks,
    runAnalysis: runAnalysisMutation.mutate,
    isAnalyzing: runAnalysisMutation.isPending,
    createIntervention: createInterventionMutation.mutate,
    updateIntervention: updateInterventionMutation.mutate,
    refetchRisks
  };
}
