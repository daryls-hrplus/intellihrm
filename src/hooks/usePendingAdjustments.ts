import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { GoalAdjustment, ApprovalStatus } from "@/types/goalAdjustments";

export function usePendingAdjustments(companyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all pending adjustments for the company (for managers/admins)
  const { data: pendingAdjustments, isLoading, error } = useQuery({
    queryKey: ["pending-adjustments", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await (supabase
        .from("goal_adjustments" as any)
        .select(`
          *,
          adjusted_by_profile:profiles!goal_adjustments_adjusted_by_fkey(id, full_name, avatar_url),
          goal:performance_goals!goal_adjustments_goal_id_fkey(id, title, employee_id)
        `)
        .eq("company_id", companyId)
        .eq("approval_status", "pending")
        .order("adjusted_at", { ascending: false }) as any);

      if (error) throw error;
      return data as (GoalAdjustment & { goal: { id: string; title: string; employee_id: string } })[];
    },
    enabled: !!companyId,
  });

  // Approve adjustment
  const approveAdjustment = useMutation({
    mutationFn: async ({ adjustmentId, notes }: { adjustmentId: string; notes?: string }) => {
      const { data, error } = await (supabase
        .from("goal_adjustments" as any)
        .update({
          approval_status: "approved",
          approval_notes: notes,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", adjustmentId)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-adjustments", companyId] });
      queryClient.invalidateQueries({ queryKey: ["goal-adjustments"] });
      toast({
        title: "Adjustment approved",
        description: "The goal adjustment has been approved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve adjustment.",
        variant: "destructive",
      });
    },
  });

  // Reject adjustment
  const rejectAdjustment = useMutation({
    mutationFn: async ({ adjustmentId, notes }: { adjustmentId: string; notes?: string }) => {
      const { data, error } = await (supabase
        .from("goal_adjustments" as any)
        .update({
          approval_status: "rejected",
          approval_notes: notes,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", adjustmentId)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-adjustments", companyId] });
      queryClient.invalidateQueries({ queryKey: ["goal-adjustments"] });
      toast({
        title: "Adjustment rejected",
        description: "The goal adjustment has been rejected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject adjustment.",
        variant: "destructive",
      });
    },
  });

  return {
    pendingAdjustments,
    isLoading,
    error,
    pendingCount: pendingAdjustments?.length ?? 0,
    approveAdjustment,
    rejectAdjustment,
  };
}
