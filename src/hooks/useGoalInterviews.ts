import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GoalInterview {
  id: string;
  goal_id: string;
  employee_id: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  meeting_link: string | null;
  meeting_type: string;
  status: string;
  agenda: string | null;
  manager_notes: string | null;
  employee_notes: string | null;
  outcome_summary: string | null;
  scheduled_by: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  reminder_sent: boolean | null;
  created_at: string;
  updated_at: string;
  goal?: {
    id: string;
    title: string;
    status: string;
  };
  employee?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  scheduler?: {
    id: string;
    full_name: string | null;
  };
}

export function useGoalInterviews(userId: string, userRole: "employee" | "manager") {
  const queryClient = useQueryClient();

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["goal-interviews", userId, userRole],
    queryFn: async () => {
      let query = supabase
        .from("goal_interviews")
        .select(`
          *,
          goal:performance_goals(id, title, status),
          employee:profiles!goal_interviews_employee_id_fkey(id, full_name, avatar_url),
          scheduler:profiles!goal_interviews_scheduled_by_fkey(id, full_name)
        `)
        .order("scheduled_at", { ascending: true });

      if (userRole === "employee") {
        query = query.eq("employee_id", userId);
      } else {
        query = query.eq("scheduled_by", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GoalInterview[];
    },
  });

  const createInterview = useMutation({
    mutationFn: async (interview: Omit<GoalInterview, 'id' | 'created_at' | 'updated_at' | 'goal' | 'employee' | 'scheduler'>) => {
      const { data, error } = await supabase
        .from("goal_interviews")
        .insert(interview)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-interviews"] });
      toast.success("Goal interview scheduled successfully");
    },
    onError: (error) => {
      toast.error("Failed to schedule interview: " + error.message);
    },
  });

  const updateInterview = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GoalInterview> & { id: string }) => {
      const { data, error } = await supabase
        .from("goal_interviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-interviews"] });
      toast.success("Interview updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update interview: " + error.message);
    },
  });

  const deleteInterview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("goal_interviews")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-interviews"] });
      toast.success("Interview deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete interview: " + error.message);
    },
  });

  const confirmInterview = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("goal_interviews")
        .update({ 
          status: "confirmed",
          confirmed_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-interviews"] });
      toast.success("Interview confirmed");
    },
    onError: (error) => {
      toast.error("Failed to confirm interview: " + error.message);
    },
  });

  const cancelInterview = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from("goal_interviews")
        .update({ 
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-interviews"] });
      toast.success("Interview cancelled");
    },
    onError: (error) => {
      toast.error("Failed to cancel interview: " + error.message);
    },
  });

  const completeInterview = useMutation({
    mutationFn: async ({ id, outcome_summary, manager_notes }: { id: string; outcome_summary?: string; manager_notes?: string }) => {
      const { data, error } = await supabase
        .from("goal_interviews")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString(),
          outcome_summary,
          manager_notes
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-interviews"] });
      toast.success("Interview marked as completed");
    },
    onError: (error) => {
      toast.error("Failed to complete interview: " + error.message);
    },
  });

  return {
    interviews,
    isLoading,
    createInterview,
    updateInterview,
    deleteInterview,
    confirmInterview,
    cancelInterview,
    completeInterview,
  };
}
