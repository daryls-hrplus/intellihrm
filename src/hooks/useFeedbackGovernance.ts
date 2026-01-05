import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ConsentType = 
  | 'participation' 
  | 'data_processing' 
  | 'ai_analysis' 
  | 'external_sharing' 
  | 'signal_generation' 
  | 'report_distribution';

export type PolicyType = 
  | 'retention' 
  | 'anonymization' 
  | 'ai_usage' 
  | 'external_access'
  | 'signal_aggregation' 
  | 'cross_module_sharing';

export type ExceptionType = 
  | 'anonymity_bypass' 
  | 'deadline_extension' 
  | 'rater_exclusion'
  | 'report_access_override' 
  | 'ai_opt_out' 
  | 'signal_suppression';

export interface FeedbackConsentRecord {
  id: string;
  employee_id: string;
  cycle_id: string;
  company_id: string;
  consent_type: ConsentType;
  consent_given: boolean;
  consent_timestamp: string;
  consent_version: string;
  consent_text_hash?: string;
  ip_address?: string;
  user_agent?: string;
  withdrawn_at?: string;
  withdrawal_reason?: string;
}

export interface FeedbackDataPolicy {
  id: string;
  company_id: string;
  policy_type: PolicyType;
  policy_config: Record<string, any>;
  effective_from: string;
  effective_until?: string;
  approved_by?: string;
  approval_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface FeedbackException {
  id: string;
  cycle_id: string;
  employee_id: string;
  company_id: string;
  exception_type: ExceptionType;
  reason: string;
  supporting_evidence?: string;
  requested_by: string;
  approved_by?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_timestamp?: string;
  valid_until?: string;
  created_at: string;
}

export interface FeedbackAIActionLog {
  id: string;
  employee_id: string;
  cycle_id: string;
  company_id: string;
  action_type: string;
  input_summary: Record<string, any>;
  output_summary: Record<string, any>;
  model_used?: string;
  model_version?: string;
  confidence_score?: number;
  explanation: string;
  human_override: boolean;
  override_by?: string;
  override_reason?: string;
  processing_time_ms?: number;
  created_at: string;
}

export function useFeedbackGovernance(companyId?: string, cycleId?: string) {
  const { user } = useAuth();
  const [consents, setConsents] = useState<FeedbackConsentRecord[]>([]);
  const [policies, setPolicies] = useState<FeedbackDataPolicy[]>([]);
  const [exceptions, setExceptions] = useState<FeedbackException[]>([]);
  const [aiLogs, setAILogs] = useState<FeedbackAIActionLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConsents = useCallback(async (employeeId?: string) => {
    if (!cycleId && !employeeId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("feedback_consent_records")
        .select("*")
        .order("consent_timestamp", { ascending: false });

      if (cycleId) query = query.eq("cycle_id", cycleId);
      if (employeeId) query = query.eq("employee_id", employeeId);

      const { data, error } = await query;
      if (error) throw error;
      setConsents((data || []) as FeedbackConsentRecord[]);
    } catch (error) {
      console.error("Error fetching consents:", error);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  const recordConsent = useCallback(async (
    employeeId: string,
    consentType: ConsentType,
    consentGiven: boolean,
    consentVersion: string = "1.0"
  ): Promise<boolean> => {
    if (!cycleId || !companyId) return false;

    try {
      const { error } = await supabase
        .from("feedback_consent_records")
        .upsert({
          employee_id: employeeId,
          cycle_id: cycleId,
          company_id: companyId,
          consent_type: consentType,
          consent_given: consentGiven,
          consent_version: consentVersion,
          consent_timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }, {
          onConflict: "employee_id,cycle_id,consent_type"
        });

      if (error) throw error;
      toast.success("Consent recorded successfully");
      return true;
    } catch (error: any) {
      console.error("Error recording consent:", error);
      toast.error(error.message || "Failed to record consent");
      return false;
    }
  }, [cycleId, companyId]);

  const withdrawConsent = useCallback(async (
    consentId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("feedback_consent_records")
        .update({
          withdrawn_at: new Date().toISOString(),
          withdrawal_reason: reason
        })
        .eq("id", consentId);

      if (error) throw error;
      toast.success("Consent withdrawn successfully");
      return true;
    } catch (error: any) {
      console.error("Error withdrawing consent:", error);
      toast.error(error.message || "Failed to withdraw consent");
      return false;
    }
  }, []);

  const fetchPolicies = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedback_data_policies")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("effective_from", { ascending: false });

      if (error) throw error;
      setPolicies((data || []) as FeedbackDataPolicy[]);
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createPolicy = useCallback(async (
    policyType: PolicyType,
    policyConfig: Record<string, any>,
    effectiveFrom: string
  ): Promise<boolean> => {
    if (!companyId || !user?.id) return false;

    try {
      const { error } = await supabase
        .from("feedback_data_policies")
        .insert({
          company_id: companyId,
          policy_type: policyType,
          policy_config: policyConfig,
          effective_from: effectiveFrom,
          approved_by: user.id,
          approval_date: new Date().toISOString()
        });

      if (error) throw error;
      toast.success("Policy created successfully");
      await fetchPolicies();
      return true;
    } catch (error: any) {
      console.error("Error creating policy:", error);
      toast.error(error.message || "Failed to create policy");
      return false;
    }
  }, [companyId, user?.id, fetchPolicies]);

  const fetchExceptions = useCallback(async () => {
    if (!cycleId && !companyId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("feedback_exceptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (cycleId) query = query.eq("cycle_id", cycleId);
      if (companyId) query = query.eq("company_id", companyId);

      const { data, error } = await query;
      if (error) throw error;
      setExceptions((data || []) as FeedbackException[]);
    } catch (error) {
      console.error("Error fetching exceptions:", error);
    } finally {
      setLoading(false);
    }
  }, [cycleId, companyId]);

  const requestException = useCallback(async (
    employeeId: string,
    exceptionType: ExceptionType,
    reason: string,
    supportingEvidence?: string,
    validUntil?: string
  ): Promise<boolean> => {
    if (!cycleId || !companyId || !user?.id) return false;

    try {
      const { error } = await supabase
        .from("feedback_exceptions")
        .insert({
          cycle_id: cycleId,
          employee_id: employeeId,
          company_id: companyId,
          exception_type: exceptionType,
          reason,
          supporting_evidence: supportingEvidence,
          requested_by: user.id,
          valid_until: validUntil
        });

      if (error) throw error;
      toast.success("Exception request submitted");
      await fetchExceptions();
      return true;
    } catch (error: any) {
      console.error("Error requesting exception:", error);
      toast.error(error.message || "Failed to request exception");
      return false;
    }
  }, [cycleId, companyId, user?.id, fetchExceptions]);

  const processException = useCallback(async (
    exceptionId: string,
    approved: boolean
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("feedback_exceptions")
        .update({
          approval_status: approved ? "approved" : "rejected",
          approved_by: user.id,
          approval_timestamp: new Date().toISOString()
        })
        .eq("id", exceptionId);

      if (error) throw error;
      toast.success(`Exception ${approved ? "approved" : "rejected"}`);
      await fetchExceptions();
      return true;
    } catch (error: any) {
      console.error("Error processing exception:", error);
      toast.error(error.message || "Failed to process exception");
      return false;
    }
  }, [user?.id, fetchExceptions]);

  const fetchAILogs = useCallback(async (employeeId?: string) => {
    if (!cycleId && !employeeId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("feedback_ai_action_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (cycleId) query = query.eq("cycle_id", cycleId);
      if (employeeId) query = query.eq("employee_id", employeeId);

      const { data, error } = await query;
      if (error) throw error;
      setAILogs((data || []) as FeedbackAIActionLog[]);
    } catch (error) {
      console.error("Error fetching AI logs:", error);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  const logAIAction = useCallback(async (
    employeeId: string,
    actionType: string,
    inputSummary: Record<string, any>,
    outputSummary: Record<string, any>,
    explanation: string,
    options?: {
      modelUsed?: string;
      modelVersion?: string;
      confidenceScore?: number;
      processingTimeMs?: number;
    }
  ): Promise<boolean> => {
    if (!cycleId || !companyId) return false;

    try {
      const { error } = await supabase
        .from("feedback_ai_action_logs")
        .insert({
          employee_id: employeeId,
          cycle_id: cycleId,
          company_id: companyId,
          action_type: actionType,
          input_summary: inputSummary,
          output_summary: outputSummary,
          explanation,
          model_used: options?.modelUsed,
          model_version: options?.modelVersion,
          confidence_score: options?.confidenceScore,
          processing_time_ms: options?.processingTimeMs
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error logging AI action:", error);
      return false;
    }
  }, [cycleId, companyId]);

  return {
    consents,
    policies,
    exceptions,
    aiLogs,
    loading,
    fetchConsents,
    recordConsent,
    withdrawConsent,
    fetchPolicies,
    createPolicy,
    fetchExceptions,
    requestException,
    processException,
    fetchAILogs,
    logAIAction
  };
}
