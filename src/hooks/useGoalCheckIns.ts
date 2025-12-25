import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GoalCheckIn {
  id: string;
  goal_id: string;
  employee_id: string;
  manager_id: string | null;
  check_in_type: "scheduled" | "ad_hoc" | "milestone";
  check_in_date: string;
  progress_at_check_in: number | null;
  employee_status: "on_track" | "at_risk" | "blocked" | "ahead" | null;
  employee_commentary: string | null;
  achievements: string | null;
  blockers: string | null;
  next_steps: string | null;
  manager_commentary: string | null;
  manager_assessment: "on_track" | "needs_attention" | "off_track" | null;
  coaching_notes: string | null;
  action_items: string | null;
  evidence_urls: string[];
  status: "pending" | "employee_submitted" | "manager_reviewed" | "completed";
  employee_submitted_at: string | null;
  manager_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCheckInData {
  goal_id: string;
  check_in_type?: "scheduled" | "ad_hoc" | "milestone";
  check_in_date?: string;
  progress_at_check_in?: number;
  employee_status?: string;
  employee_commentary?: string;
  achievements?: string;
  blockers?: string;
  next_steps?: string;
  evidence_urls?: string[];
}

export interface UpdateCheckInData {
  employee_status?: string;
  employee_commentary?: string;
  achievements?: string;
  blockers?: string;
  next_steps?: string;
  manager_commentary?: string;
  manager_assessment?: string;
  coaching_notes?: string;
  action_items?: string;
  evidence_urls?: string[];
  status?: string;
}

export function useGoalCheckIns(goalId?: string) {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<GoalCheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCheckIns = useCallback(async (targetGoalId?: string) => {
    const gId = targetGoalId || goalId;
    if (!gId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_check_ins")
        .select("*")
        .eq("goal_id", gId)
        .order("check_in_date", { ascending: false });

      if (error) throw error;
      setCheckIns((data || []) as GoalCheckIn[]);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      toast.error("Failed to load check-ins");
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  const createCheckIn = useCallback(async (data: CreateCheckInData): Promise<GoalCheckIn | null> => {
    if (!user?.id) return null;

    setSaving(true);
    try {
      // Get manager from the goal
      const { data: goal } = await supabase
        .from("performance_goals")
        .select("assigned_by, progress_percentage")
        .eq("id", data.goal_id)
        .maybeSingle();

      const { data: checkIn, error } = await supabase
        .from("goal_check_ins")
        .insert({
          ...data,
          employee_id: user.id,
          manager_id: goal?.assigned_by || null,
          progress_at_check_in: data.progress_at_check_in ?? goal?.progress_percentage ?? 0,
          check_in_date: data.check_in_date || new Date().toISOString().split("T")[0],
          check_in_type: data.check_in_type || "ad_hoc",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Check-in created successfully");
      await fetchCheckIns(data.goal_id);
      return checkIn as GoalCheckIn;
    } catch (error) {
      console.error("Error creating check-in:", error);
      toast.error("Failed to create check-in");
      return null;
    } finally {
      setSaving(false);
    }
  }, [user?.id, fetchCheckIns]);

  const updateCheckIn = useCallback(async (
    checkInId: string,
    data: UpdateCheckInData
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = { ...data };

      // Auto-update status based on what's being submitted
      if (data.employee_commentary && !data.status) {
        updateData.status = "employee_submitted";
        updateData.employee_submitted_at = new Date().toISOString();
      }
      if (data.manager_commentary && !data.status) {
        updateData.status = "manager_reviewed";
        updateData.manager_reviewed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("goal_check_ins")
        .update(updateData)
        .eq("id", checkInId);

      if (error) throw error;

      toast.success("Check-in updated successfully");
      await fetchCheckIns();
      return true;
    } catch (error) {
      console.error("Error updating check-in:", error);
      toast.error("Failed to update check-in");
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchCheckIns]);

  const submitEmployeeCheckIn = useCallback(async (
    checkInId: string,
    data: {
      employee_status: string;
      employee_commentary: string;
      achievements?: string;
      blockers?: string;
      next_steps?: string;
      evidence_urls?: string[];
    }
  ): Promise<boolean> => {
    return updateCheckIn(checkInId, {
      ...data,
      status: "employee_submitted",
    });
  }, [updateCheckIn]);

  const submitManagerReview = useCallback(async (
    checkInId: string,
    data: {
      manager_assessment: string;
      manager_commentary: string;
      coaching_notes?: string;
      action_items?: string;
    }
  ): Promise<boolean> => {
    return updateCheckIn(checkInId, {
      ...data,
      status: "completed",
    });
  }, [updateCheckIn]);

  const getOverdueCheckIns = useCallback(async (employeeId?: string): Promise<GoalCheckIn[]> => {
    try {
      let query = supabase
        .from("goal_check_ins")
        .select("*")
        .in("status", ["pending", "employee_submitted"])
        .lt("check_in_date", new Date().toISOString().split("T")[0]);

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query.order("check_in_date", { ascending: true });

      if (error) throw error;
      return (data || []) as GoalCheckIn[];
    } catch (error) {
      console.error("Error fetching overdue check-ins:", error);
      return [];
    }
  }, []);

  const getPendingManagerReviews = useCallback(async (managerId: string): Promise<GoalCheckIn[]> => {
    try {
      const { data, error } = await supabase
        .from("goal_check_ins")
        .select("*")
        .eq("manager_id", managerId)
        .eq("status", "employee_submitted")
        .order("check_in_date", { ascending: true });

      if (error) throw error;
      return (data || []) as GoalCheckIn[];
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      return [];
    }
  }, []);

  return {
    checkIns,
    loading,
    saving,
    fetchCheckIns,
    createCheckIn,
    updateCheckIn,
    submitEmployeeCheckIn,
    submitManagerReview,
    getOverdueCheckIns,
    getPendingManagerReviews,
  };
}
