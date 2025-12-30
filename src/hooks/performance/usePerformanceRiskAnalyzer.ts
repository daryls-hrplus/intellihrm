import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  EmployeePerformanceRisk, 
  PerformanceTrendHistory, 
  RiskSummary,
  PerformanceRiskAnalysisResult,
  PerformanceRiskLevel,
  PerformanceRiskType
} from '@/types/performanceRisks';

interface UsePerformanceRiskAnalyzerOptions {
  companyId?: string;
  employeeId?: string;
}

export function usePerformanceRiskAnalyzer({ companyId, employeeId }: UsePerformanceRiskAnalyzerOptions = {}) {
  const queryClient = useQueryClient();
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch employee performance risks
  const { 
    data: risks = [], 
    isLoading: isLoadingRisks,
    refetch: refetchRisks 
  } = useQuery({
    queryKey: ['employee-performance-risks', companyId, employeeId],
    queryFn: async () => {
      let query = supabase
        .from('employee_performance_risks')
        .select(`
          *,
          employee:profiles!employee_performance_risks_employee_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('is_active', true)
        .order('risk_score', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as EmployeePerformanceRisk[];
    },
    enabled: !!companyId || !!employeeId
  });

  // Fetch performance trend history
  const { 
    data: trendHistory = [], 
    isLoading: isLoadingTrends 
  } = useQuery({
    queryKey: ['performance-trend-history', companyId, employeeId],
    queryFn: async () => {
      let query = supabase
        .from('performance_trend_history')
        .select('*')
        .order('snapshot_date', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PerformanceTrendHistory[];
    },
    enabled: !!companyId || !!employeeId
  });

  // Analyze employee mutation
  const analyzeEmployeeMutation = useMutation({
    mutationFn: async (targetEmployeeId: string) => {
      if (!companyId) throw new Error('Company ID required');
      
      setAnalyzing(true);
      const { data, error } = await supabase.functions.invoke('performance-risk-analyzer', {
        body: {
          companyId,
          employeeId: targetEmployeeId,
          action: 'analyze_employee'
        }
      });

      if (error) throw error;
      return data as { success: boolean; results: PerformanceRiskAnalysisResult[] };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Employee risk analysis completed');
        queryClient.invalidateQueries({ queryKey: ['employee-performance-risks'] });
        queryClient.invalidateQueries({ queryKey: ['performance-trend-history'] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
    onSettled: () => {
      setAnalyzing(false);
    }
  });

  // Analyze company mutation
  const analyzeCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error('Company ID required');
      
      setAnalyzing(true);
      const { data, error } = await supabase.functions.invoke('performance-risk-analyzer', {
        body: {
          companyId,
          action: 'analyze_company'
        }
      });

      if (error) throw error;
      return data as { success: boolean; analyzed_count: number; results: PerformanceRiskAnalysisResult[] };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Analyzed ${data.analyzed_count} employees`);
        queryClient.invalidateQueries({ queryKey: ['employee-performance-risks'] });
        queryClient.invalidateQueries({ queryKey: ['performance-trend-history'] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
    onSettled: () => {
      setAnalyzing(false);
    }
  });

  // Trigger intervention mutation
  const triggerInterventionMutation = useMutation({
    mutationFn: async ({ riskId, interventionType }: { riskId: string; interventionType: string }) => {
      const { data, error } = await supabase.functions.invoke('performance-risk-analyzer', {
        body: {
          companyId,
          riskId,
          interventionType,
          action: 'trigger_intervention'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Intervention created successfully');
      queryClient.invalidateQueries({ queryKey: ['employee-performance-risks'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create intervention: ${error.message}`);
    }
  });

  // Acknowledge risk mutation
  const acknowledgeRiskMutation = useMutation({
    mutationFn: async (riskId: string) => {
      const { error } = await supabase
        .from('employee_performance_risks')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', riskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Risk acknowledged');
      queryClient.invalidateQueries({ queryKey: ['employee-performance-risks'] });
    }
  });

  // Resolve risk mutation
  const resolveRiskMutation = useMutation({
    mutationFn: async ({ riskId, notes }: { riskId: string; notes?: string }) => {
      const { error } = await supabase
        .from('employee_performance_risks')
        .update({
          is_active: false,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', riskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Risk resolved');
      queryClient.invalidateQueries({ queryKey: ['employee-performance-risks'] });
    }
  });

  // Calculate summary from risks
  const riskSummary: RiskSummary = {
    total_risks: risks.length,
    by_type: risks.reduce((acc, risk) => {
      acc[risk.risk_type] = (acc[risk.risk_type] || 0) + 1;
      return acc;
    }, {} as Record<PerformanceRiskType, number>),
    by_level: {
      low: risks.filter(r => r.risk_level === 'low').length,
      medium: risks.filter(r => r.risk_level === 'medium').length,
      high: risks.filter(r => r.risk_level === 'high').length,
      critical: risks.filter(r => r.risk_level === 'critical').length
    },
    affected_employees_count: new Set(risks.map(r => r.employee_id)).size
  };

  // Get risks by level
  const getHighRisks = () => risks.filter(r => r.risk_level === 'high' || r.risk_level === 'critical');
  const getCriticalRisks = () => risks.filter(r => r.risk_level === 'critical');

  // Get employee risks
  const getEmployeeRisks = (empId: string) => risks.filter(r => r.employee_id === empId);

  // Get employee trend
  const getEmployeeTrend = (empId: string) => trendHistory.filter(t => t.employee_id === empId);

  return {
    // Data
    risks,
    trendHistory,
    riskSummary,
    
    // Loading states
    isLoadingRisks,
    isLoadingTrends,
    analyzing,
    
    // Actions
    analyzeEmployee: analyzeEmployeeMutation.mutate,
    analyzeCompany: analyzeCompanyMutation.mutate,
    triggerIntervention: triggerInterventionMutation.mutate,
    acknowledgeRisk: acknowledgeRiskMutation.mutate,
    resolveRisk: resolveRiskMutation.mutate,
    refetchRisks,
    
    // Helpers
    getHighRisks,
    getCriticalRisks,
    getEmployeeRisks,
    getEmployeeTrend
  };
}
