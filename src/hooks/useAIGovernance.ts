import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AIRiskAssessment {
  id: string;
  interaction_log_id: string | null;
  risk_category: string;
  risk_score: number | null;
  risk_factors: any;
  mitigation_applied: string[] | null;
  human_review_required: boolean | null;
  human_review_completed: boolean | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_outcome: string | null;
  review_notes: string | null;
  created_at: string | null;
  company_id: string | null;
  user_id: string | null;
}

export interface AIBiasIncident {
  id: string;
  interaction_log_id: string | null;
  detection_method: string;
  bias_type: string;
  affected_characteristic: string | null;
  prompt_content: string | null;
  response_content: string | null;
  evidence_description: string | null;
  severity: string | null;
  remediation_status: string | null;
  remediation_notes: string | null;
  remediation_actions: any;
  reported_by: string | null;
  investigated_by: string | null;
  resolved_at: string | null;
  created_at: string | null;
  company_id: string | null;
}

export interface AIHumanOverride {
  id: string;
  interaction_log_id: string | null;
  original_ai_response: string;
  override_action: string;
  modified_response: string | null;
  override_reason: string;
  justification_category: string | null;
  overridden_by: string;
  approved_by: string | null;
  approval_required: boolean | null;
  approval_status: string | null;
  created_at: string | null;
  company_id: string | null;
}

export interface AIModelRegistry {
  id: string;
  model_identifier: string;
  display_name: string;
  provider: string;
  version: string | null;
  purpose: string;
  risk_classification: string | null;
  approved_use_cases: string[] | null;
  prohibited_use_cases: string[] | null;
  data_retention_policy: string | null;
  last_audit_date: string | null;
  next_audit_due: string | null;
  audit_findings: any;
  compliance_status: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  company_id: string | null;
  created_by: string | null;
}

export interface AIGovernanceMetrics {
  id: string;
  metric_date: string;
  metric_type: string;
  total_interactions: number | null;
  high_risk_interactions: number | null;
  human_reviews_required: number | null;
  human_reviews_completed: number | null;
  overrides_count: number | null;
  bias_incidents_detected: number | null;
  avg_risk_score: number | null;
  avg_confidence_score: number | null;
  compliance_rate: number | null;
  created_at: string | null;
  company_id: string | null;
}

export function useAIGovernance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch risk assessments
  const { data: riskAssessments = [], isLoading: isLoadingRisks } = useQuery({
    queryKey: ["ai-risk-assessments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_risk_assessments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AIRiskAssessment[];
    },
  });

  // Fetch bias incidents
  const { data: biasIncidents = [], isLoading: isLoadingBias } = useQuery({
    queryKey: ["ai-bias-incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_bias_incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AIBiasIncident[];
    },
  });

  // Fetch human overrides
  const { data: humanOverrides = [], isLoading: isLoadingOverrides } = useQuery({
    queryKey: ["ai-human-overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_human_overrides")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AIHumanOverride[];
    },
  });

  // Fetch model registry
  const { data: modelRegistry = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ["ai-model-registry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_model_registry")
        .select("*")
        .order("display_name");
      
      if (error) throw error;
      return data as AIModelRegistry[];
    },
  });

  // Fetch governance metrics
  const { data: governanceMetrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["ai-governance-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_governance_metrics")
        .select("*")
        .order("metric_date", { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as AIGovernanceMetrics[];
    },
  });

  // Fetch pending human reviews
  const { data: pendingReviews = [], isLoading: isLoadingPendingReviews } = useQuery({
    queryKey: ["ai-pending-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_risk_assessments")
        .select("*")
        .eq("human_review_required", true)
        .eq("human_review_completed", false)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as AIRiskAssessment[];
    },
  });

  // Complete human review
  const completeReviewMutation = useMutation({
    mutationFn: async ({ 
      assessmentId, 
      outcome, 
      notes 
    }: { 
      assessmentId: string; 
      outcome: string; 
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("ai_risk_assessments")
        .update({
          human_review_completed: true,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_outcome: outcome,
          review_notes: notes,
        })
        .eq("id", assessmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-risk-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["ai-pending-reviews"] });
      toast({ title: "Review completed successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to complete review", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update bias incident status
  const updateBiasIncidentMutation = useMutation({
    mutationFn: async ({ 
      incidentId, 
      status, 
      notes 
    }: { 
      incidentId: string; 
      status: string; 
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = {
        remediation_status: status,
        remediation_notes: notes,
      };
      
      if (status === 'remediated' || status === 'false_positive') {
        updateData.resolved_at = new Date().toISOString();
      }
      
      if (status === 'investigating') {
        updateData.investigated_by = user?.id;
      }
      
      const { error } = await supabase
        .from("ai_bias_incidents")
        .update(updateData)
        .eq("id", incidentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-bias-incidents"] });
      toast({ title: "Incident updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update incident", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Calculate summary statistics
  const summary = {
    totalInteractions: riskAssessments.length,
    highRiskCount: riskAssessments.filter(r => (r.risk_score || 0) >= 0.7).length,
    pendingReviewsCount: pendingReviews.length,
    openBiasIncidents: biasIncidents.filter(b => b.remediation_status === 'open').length,
    overridesCount: humanOverrides.length,
    avgRiskScore: riskAssessments.length > 0 
      ? riskAssessments.reduce((sum, r) => sum + (r.risk_score || 0), 0) / riskAssessments.length 
      : 0,
    compliantModels: modelRegistry.filter(m => m.compliance_status === 'compliant').length,
    totalModels: modelRegistry.length,
  };

  return {
    riskAssessments,
    biasIncidents,
    humanOverrides,
    modelRegistry,
    governanceMetrics,
    pendingReviews,
    summary,
    isLoading: isLoadingRisks || isLoadingBias || isLoadingOverrides || isLoadingModels || isLoadingMetrics || isLoadingPendingReviews,
    completeReview: completeReviewMutation.mutate,
    updateBiasIncident: updateBiasIncidentMutation.mutate,
  };
}
