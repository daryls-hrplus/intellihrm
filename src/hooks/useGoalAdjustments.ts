import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { 
  GoalAdjustment, 
  ChangeType, 
  AdjustmentReason, 
  ApprovalStatus,
  GoalLockInfo 
} from "@/types/goalAdjustments";

interface CreateAdjustmentParams {
  goal_id: string;
  change_type: ChangeType;
  adjustment_reason: AdjustmentReason;
  reason_details?: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  business_justification?: string;
  supporting_evidence?: string;
  impact_assessment?: string;
  is_material_change?: boolean;
  requires_recalibration?: boolean;
}

interface UpdateApprovalParams {
  adjustment_id: string;
  approval_status: ApprovalStatus;
  approval_notes?: string;
}

interface LockGoalParams {
  goal_id: string;
  lock_reason: string;
}

export function useGoalAdjustments(goalId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch adjustments for a specific goal
  const { data: adjustments, isLoading, error } = useQuery({
    queryKey: ["goal-adjustments", goalId],
    queryFn: async () => {
      if (!goalId) return [];
      
      // Using type assertion since goal_adjustments table was just created
      const { data, error } = await (supabase
        .from("goal_adjustments" as any)
        .select(`
          *,
          adjusted_by_profile:profiles!goal_adjustments_adjusted_by_fkey(id, full_name, avatar_url),
          approved_by_profile:profiles!goal_adjustments_approved_by_fkey(id, full_name)
        `)
        .eq("goal_id", goalId)
        .order("adjusted_at", { ascending: false }) as any);

      if (error) throw error;
      return data as GoalAdjustment[];
    },
    enabled: !!goalId,
  });

  // Fetch goal lock info
  const { data: lockInfo } = useQuery({
    queryKey: ["goal-lock-info", goalId],
    queryFn: async () => {
      if (!goalId) return null;
      
      const { data, error } = await supabase
        .from("performance_goals")
        .select(`
          is_locked,
          locked_at,
          locked_by,
          lock_reason
        `)
        .eq("id", goalId)
        .single();

      if (error) throw error;
      
      // Fetch locked_by profile separately if locked
      let lockedByProfile = null;
      if ((data as any)?.locked_by) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", (data as any).locked_by)
          .single();
        lockedByProfile = profile;
      }
      
      return {
        is_locked: (data as any)?.is_locked ?? false,
        locked_at: (data as any)?.locked_at,
        locked_by: (data as any)?.locked_by,
        lock_reason: (data as any)?.lock_reason,
        locked_by_profile: lockedByProfile,
      } as GoalLockInfo;
    },
    enabled: !!goalId,
  });

  // Create adjustment mutation
  const createAdjustment = useMutation({
    mutationFn: async (params: CreateAdjustmentParams) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user?.id ?? "")
        .single();

      const { data, error } = await (supabase
        .from("goal_adjustments" as any)
        .insert({
          ...params,
          adjusted_by: user?.id,
          company_id: profile?.company_id,
          approval_status: params.is_material_change ? "pending" : "approved",
          approved_by: params.is_material_change ? null : user?.id,
          approved_at: params.is_material_change ? null : new Date().toISOString(),
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-adjustments", goalId] });
      queryClient.invalidateQueries({ queryKey: ["performance-goals"] });
      toast({
        title: "Adjustment recorded",
        description: "The goal adjustment has been logged successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record adjustment.",
        variant: "destructive",
      });
    },
  });

  // Update approval status mutation
  const updateApproval = useMutation({
    mutationFn: async (params: UpdateApprovalParams) => {
      const { data, error } = await (supabase
        .from("goal_adjustments" as any)
        .update({
          approval_status: params.approval_status,
          approval_notes: params.approval_notes,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", params.adjustment_id)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal-adjustments", goalId] });
      toast({
        title: variables.approval_status === "approved" ? "Adjustment approved" : "Adjustment rejected",
        description: `The adjustment has been ${variables.approval_status}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update approval.",
        variant: "destructive",
      });
    },
  });

  // Lock goal mutation
  const lockGoal = useMutation({
    mutationFn: async (params: LockGoalParams) => {
      const { data, error } = await supabase
        .from("performance_goals")
        .update({
          is_locked: true,
          locked_at: new Date().toISOString(),
          locked_by: user?.id,
          lock_reason: params.lock_reason,
        } as any)
        .eq("id", params.goal_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-lock-info", goalId] });
      queryClient.invalidateQueries({ queryKey: ["performance-goals"] });
      toast({
        title: "Goal locked",
        description: "This goal is now locked and cannot be edited.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to lock goal.",
        variant: "destructive",
      });
    },
  });

  // Unlock goal mutation
  const unlockGoal = useMutation({
    mutationFn: async (goalIdToUnlock: string) => {
      const { data, error } = await supabase
        .from("performance_goals")
        .update({
          is_locked: false,
          locked_at: null,
          locked_by: null,
          lock_reason: null,
        } as any)
        .eq("id", goalIdToUnlock)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-lock-info", goalId] });
      queryClient.invalidateQueries({ queryKey: ["performance-goals"] });
      toast({
        title: "Goal unlocked",
        description: "This goal can now be edited.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unlock goal.",
        variant: "destructive",
      });
    },
  });

  // Withdraw adjustment mutation
  const withdrawAdjustment = useMutation({
    mutationFn: async (adjustmentId: string) => {
      const { data, error } = await (supabase
        .from("goal_adjustments" as any)
        .update({
          approval_status: "withdrawn",
        })
        .eq("id", adjustmentId)
        .eq("adjusted_by", user?.id)
        .eq("approval_status", "pending")
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-adjustments", goalId] });
      toast({
        title: "Adjustment withdrawn",
        description: "The pending adjustment has been withdrawn.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw adjustment.",
        variant: "destructive",
      });
    },
  });

  return {
    adjustments,
    isLoading,
    error,
    lockInfo,
    createAdjustment,
    updateApproval,
    lockGoal,
    unlockGoal,
    withdrawAdjustment,
  };
}
