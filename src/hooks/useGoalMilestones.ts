import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  due_date: string;
  completed_date: string | null;
  status: "pending" | "in_progress" | "completed" | "missed";
  weight: number;
  sequence_order: number;
  evidence_url: string | null;
  evidence_notes: string | null;
  created_by: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMilestoneData {
  goal_id: string;
  title: string;
  description?: string;
  due_date: string;
  weight?: number;
  sequence_order?: number;
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  due_date?: string;
  status?: "pending" | "in_progress" | "completed" | "missed";
  weight?: number;
  sequence_order?: number;
  evidence_url?: string;
  evidence_notes?: string;
}

export function useGoalMilestones(goalId?: string) {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchMilestones = useCallback(async (targetGoalId?: string) => {
    const gId = targetGoalId || goalId;
    if (!gId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_milestones")
        .select("*")
        .eq("goal_id", gId)
        .order("sequence_order", { ascending: true });

      if (error) throw error;
      setMilestones((data || []) as GoalMilestone[]);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      toast.error("Failed to load milestones");
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  const createMilestone = useCallback(async (data: CreateMilestoneData): Promise<GoalMilestone | null> => {
    if (!user?.id) return null;

    setSaving(true);
    try {
      // Get the next sequence order
      const { data: existingMilestones } = await supabase
        .from("goal_milestones")
        .select("sequence_order")
        .eq("goal_id", data.goal_id)
        .order("sequence_order", { ascending: false })
        .limit(1);

      const nextOrder = existingMilestones?.length
        ? (existingMilestones[0].sequence_order || 0) + 1
        : 0;

      const { data: milestone, error } = await supabase
        .from("goal_milestones")
        .insert({
          ...data,
          sequence_order: data.sequence_order ?? nextOrder,
          weight: data.weight ?? 0,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Milestone created successfully");
      await fetchMilestones(data.goal_id);
      return milestone as GoalMilestone;
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast.error("Failed to create milestone");
      return null;
    } finally {
      setSaving(false);
    }
  }, [user?.id, fetchMilestones]);

  const updateMilestone = useCallback(async (
    milestoneId: string,
    data: UpdateMilestoneData
  ): Promise<boolean> => {
    if (!user?.id) return false;

    setSaving(true);
    try {
      const updateData: Record<string, unknown> = { ...data };

      // Handle completion
      if (data.status === "completed") {
        updateData.completed_date = new Date().toISOString().split("T")[0];
        updateData.completed_by = user.id;
      } else if (data.status) {
        updateData.completed_date = null;
        updateData.completed_by = null;
      }

      const { error } = await supabase
        .from("goal_milestones")
        .update(updateData)
        .eq("id", milestoneId);

      if (error) throw error;

      toast.success("Milestone updated successfully");
      await fetchMilestones();
      return true;
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error("Failed to update milestone");
      return false;
    } finally {
      setSaving(false);
    }
  }, [user?.id, fetchMilestones]);

  const deleteMilestone = useCallback(async (milestoneId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("goal_milestones")
        .delete()
        .eq("id", milestoneId);

      if (error) throw error;

      toast.success("Milestone deleted successfully");
      await fetchMilestones();
      return true;
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error("Failed to delete milestone");
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchMilestones]);

  const completeMilestone = useCallback(async (
    milestoneId: string,
    evidence?: { url?: string; notes?: string }
  ): Promise<boolean> => {
    return updateMilestone(milestoneId, {
      status: "completed",
      evidence_url: evidence?.url,
      evidence_notes: evidence?.notes,
    });
  }, [updateMilestone]);

  const reorderMilestones = useCallback(async (
    reorderedMilestones: { id: string; sequence_order: number }[]
  ): Promise<boolean> => {
    setSaving(true);
    try {
      // Update each milestone's order
      for (const item of reorderedMilestones) {
        await supabase
          .from("goal_milestones")
          .update({ sequence_order: item.sequence_order })
          .eq("id", item.id);
      }

      await fetchMilestones();
      return true;
    } catch (error) {
      console.error("Error reordering milestones:", error);
      toast.error("Failed to reorder milestones");
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchMilestones]);

  // Calculate milestone-based progress
  const calculateMilestoneProgress = useCallback((): number => {
    if (milestones.length === 0) return 0;

    const totalWeight = milestones.reduce((sum, m) => sum + (m.weight || 0), 0);
    
    if (totalWeight === 0) {
      // Equal weight for all milestones
      const completed = milestones.filter(m => m.status === "completed").length;
      return Math.round((completed / milestones.length) * 100);
    }

    // Weighted progress
    const completedWeight = milestones
      .filter(m => m.status === "completed")
      .reduce((sum, m) => sum + (m.weight || 0), 0);

    return Math.round((completedWeight / totalWeight) * 100);
  }, [milestones]);

  return {
    milestones,
    loading,
    saving,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    completeMilestone,
    reorderMilestones,
    calculateMilestoneProgress,
  };
}
