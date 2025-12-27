import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FatigueRule {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  rule_type: string;
  threshold_value: number;
  threshold_unit: string;
  applies_to: string;
  applies_to_id: string | null;
  severity: string;
  is_active: boolean;
  created_at: string;
}

export interface FatigueViolation {
  id: string;
  company_id: string;
  employee_id: string;
  rule_id: string;
  violation_date: string;
  actual_value: number;
  threshold_value: number;
  severity: string;
  details: unknown;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  override_approved_by: string | null;
  override_reason: string | null;
  created_at: string;
  employee?: { full_name: string } | null;
  rule?: { name: string; code: string } | null;
}

export function useFatigueManagement(companyId: string | null) {
  const [rules, setRules] = useState<FatigueRule[]>([]);
  const [violations, setViolations] = useState<FatigueViolation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRules = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("fatigue_management_rules")
        .select("*")
        .eq("company_id", companyId)
        .order("name");

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error("Error fetching fatigue rules:", error);
      toast.error("Failed to load fatigue rules");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const fetchViolations = useCallback(async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from("fatigue_violations")
        .select(`
          *,
          employee:profiles(full_name),
          rule:fatigue_management_rules(name, code)
        `)
        .eq("company_id", companyId)
        .order("violation_date", { ascending: false })
        .limit(100);

      if (error) throw error;
      setViolations(data || []);
    } catch (error) {
      console.error("Error fetching violations:", error);
    }
  }, [companyId]);

  useEffect(() => {
    fetchRules();
    fetchViolations();
  }, [fetchRules, fetchViolations]);

  const createRule = async (data: {
    name: string;
    code: string;
    description?: string;
    rule_type: string;
    threshold_value: number;
    threshold_unit: string;
    applies_to?: string;
    applies_to_id?: string;
    severity?: string;
  }) => {
    if (!companyId) return null;

    try {
      const { data: newRule, error } = await supabase
        .from("fatigue_management_rules")
        .insert({
          company_id: companyId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Fatigue rule created");
      fetchRules();
      return newRule;
    } catch (error) {
      console.error("Error creating rule:", error);
      toast.error("Failed to create rule");
      return null;
    }
  };

  const updateRule = async (id: string, data: Partial<FatigueRule>) => {
    try {
      const { error } = await supabase
        .from("fatigue_management_rules")
        .update(data)
        .eq("id", id);

      if (error) throw error;
      toast.success("Rule updated");
      fetchRules();
    } catch (error) {
      console.error("Error updating rule:", error);
      toast.error("Failed to update rule");
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fatigue_management_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Rule deleted");
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Failed to delete rule");
    }
  };

  const acknowledgeViolation = async (id: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("fatigue_violations")
        .update({
          acknowledged_by: user?.user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Violation acknowledged");
      fetchViolations();
    } catch (error) {
      console.error("Error acknowledging violation:", error);
      toast.error("Failed to acknowledge violation");
    }
  };

  const overrideViolation = async (id: string, reason: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("fatigue_violations")
        .update({
          override_approved_by: user?.user?.id,
          override_reason: reason,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Violation override approved");
      fetchViolations();
    } catch (error) {
      console.error("Error overriding violation:", error);
      toast.error("Failed to override violation");
    }
  };

  return {
    rules,
    violations,
    isLoading,
    fetchRules,
    fetchViolations,
    createRule,
    updateRule,
    deleteRule,
    acknowledgeViolation,
    overrideViolation,
  };
}
