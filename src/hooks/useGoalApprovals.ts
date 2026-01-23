import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GoalApprovalRule {
  id: string;
  company_id: string;
  name: string;
  goal_level: string;
  approval_type: string;
  requires_hr_approval: boolean;
  max_approval_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalApprovalChainStep {
  id: string;
  rule_id: string;
  step_order: number;
  approver_type: string;
  approver_user_id: string | null;
  is_optional: boolean;
  sla_hours: number | null;
  created_at: string;
}

export interface GoalApproval {
  id: string;
  goal_id: string;
  rule_id: string | null;
  step_order: number;
  approver_id: string;
  status: string;
  comments: string | null;
  decided_at: string | null;
  due_date: string | null;
  created_at: string;
  goal?: {
    id: string;
    title: string;
    description: string | null;
    goal_level: string;
    goal_type: string;
    status: string;
    employee_id: string | null;
    employee?: { full_name: string } | null;
  };
  approver?: { full_name: string } | null;
}

export interface GoalApprovalHistory {
  id: string;
  approval_id: string;
  action: string;
  actor_id: string;
  comments: string | null;
  created_at: string;
  actor?: { full_name: string } | null;
}

export function useGoalApprovals(companyId?: string) {
  const { user } = useAuth();
  const [rules, setRules] = useState<GoalApprovalRule[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<GoalApproval[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRules = useCallback(async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from("goal_approval_rules")
        .select("*")
        .eq("company_id", companyId)
        .order("goal_level");

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error("Error fetching approval rules:", error);
    }
  }, [companyId]);

  const fetchPendingApprovals = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_approvals")
        .select(`
          *,
          goal:performance_goals(
            id,
            title,
            description,
            goal_level,
            goal_type,
            status,
            employee_id,
            employee:profiles!performance_goals_employee_id_fkey(full_name)
          ),
          approver:profiles!goal_approvals_approver_id_fkey(full_name)
        `)
        .eq("approver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setPendingApprovals(data || []);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const submitGoalForApproval = useCallback(async (goalId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("submit_goal_for_approval", {
        p_goal_id: goalId,
      });

      if (error) throw error;
      
      toast.success("Goal submitted for approval");
      return true;
    } catch (error: any) {
      console.error("Error submitting goal for approval:", error);
      toast.error(error.message || "Failed to submit goal for approval");
      return false;
    }
  }, []);

  const processApproval = useCallback(async (
    approvalId: string,
    decision: "approved" | "rejected" | "returned",
    comments?: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("process_goal_approval", {
        p_approval_id: approvalId,
        p_decision: decision,
        p_comments: comments || null,
      });

      if (error) throw error;
      
      const actionText = decision === "approved" ? "approved" : decision === "rejected" ? "rejected" : "returned for revision";
      toast.success(`Goal ${actionText} successfully`);
      await fetchPendingApprovals();
      return true;
    } catch (error: any) {
      console.error("Error processing approval:", error);
      toast.error(error.message || "Failed to process approval");
      return false;
    }
  }, [fetchPendingApprovals]);

  const getApprovalHistory = useCallback(async (goalId: string): Promise<GoalApprovalHistory[]> => {
    try {
      const { data, error } = await supabase
        .from("goal_approval_history")
        .select(`
          *,
          actor:profiles!goal_approval_history_actor_id_fkey(full_name)
        `)
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as GoalApprovalHistory[];
    } catch (error) {
      console.error("Error fetching approval history:", error);
      return [];
    }
  }, []);

  const getRuleForGoalLevel = useCallback((goalLevel: string): GoalApprovalRule | undefined => {
    return rules.find(r => r.goal_level === goalLevel && r.is_active);
  }, [rules]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  return {
    rules,
    pendingApprovals,
    loading,
    fetchRules,
    fetchPendingApprovals,
    submitGoalForApproval,
    processApproval,
    getApprovalHistory,
    getRuleForGoalLevel,
  };
}
