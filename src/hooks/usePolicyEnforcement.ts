import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PolicyViolation {
  rule_id: string;
  rule_type: string;
  severity: "info" | "warning" | "error";
  message: string;
  document_title: string;
  can_override: boolean;
}

interface PolicyCheckResult {
  success: boolean;
  context: string;
  violations: PolicyViolation[];
  warnings: PolicyViolation[];
  total_rules_checked: number;
  has_blocking_violations: boolean;
}

interface PolicyEnforcementState {
  isChecking: boolean;
  result: PolicyCheckResult | null;
  error: string | null;
}

export function usePolicyEnforcement() {
  const { profile } = useAuth();
  const [state, setState] = useState<PolicyEnforcementState>({
    isChecking: false,
    result: null,
    error: null,
  });

  const checkPolicies = useCallback(async (
    context: string,
    data: Record<string, any>
  ): Promise<PolicyCheckResult | null> => {
    setState({ isChecking: true, result: null, error: null });

    try {
      const { data: result, error } = await supabase.functions.invoke("check-policy-rules", {
        body: {
          context,
          data,
          companyId: profile?.company_id,
        },
      });

      if (error) throw error;

      setState({ isChecking: false, result, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to check policies";
      setState({ isChecking: false, result: null, error: errorMessage });
      return null;
    }
  }, [profile?.company_id]);

  const logEnforcementAction = useCallback(async (
    ruleId: string | null,
    actionContext: string,
    ruleTriggered: string,
    userResponse: "acknowledged" | "overridden" | "cancelled",
    overrideJustification?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("policy_enforcement_logs").insert({
        rule_id: ruleId,
        user_id: user.id,
        action_context: actionContext,
        rule_triggered: ruleTriggered,
        user_response: userResponse,
        override_justification: overrideJustification,
      });
    } catch (error) {
      console.error("Failed to log enforcement action:", error);
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isChecking: false, result: null, error: null });
  }, []);

  return {
    ...state,
    checkPolicies,
    logEnforcementAction,
    reset,
  };
}
