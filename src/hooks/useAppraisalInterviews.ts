import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AppraisalInterview {
  id: string;
  participant_id: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  meeting_type: "in_person" | "video_call" | "phone_call";
  meeting_link: string | null;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "no_show";
  agenda: string | null;
  manager_notes: string | null;
  employee_notes: string | null;
  outcome_summary: string | null;
  scheduled_by: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  participant?: {
    id: string;
    employee_id: string;
    evaluator_id: string | null;
    cycle_id: string;
    status: string;
    employee?: {
      id: string;
      full_name: string;
      email: string;
    };
    evaluator?: {
      id: string;
      full_name: string;
      email: string;
    };
    cycle?: {
      id: string;
      name: string;
    };
  };
}

export const useAppraisalInterviews = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [interviews, setInterviews] = useState<AppraisalInterview[]>([]);

  const fetchInterviews = useCallback(async (filters?: {
    participantId?: string;
    cycleId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from("appraisal_interviews")
        .select(`
          *,
          participant:appraisal_participants(
            id,
            employee_id,
            evaluator_id,
            cycle_id,
            status,
            employee:profiles!appraisal_participants_employee_id_fkey(id, full_name, email),
            evaluator:profiles!appraisal_participants_evaluator_id_fkey(id, full_name, email),
            cycle:appraisal_cycles(id, name)
          )
        `)
        .order("scheduled_at", { ascending: true });

      if (filters?.participantId) {
        query = query.eq("participant_id", filters.participantId);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.startDate) {
        query = query.gte("scheduled_at", filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte("scheduled_at", filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by cycle if provided
      let filteredData = data || [];
      if (filters?.cycleId) {
        filteredData = filteredData.filter(
          (i: any) => i.participant?.cycle_id === filters.cycleId
        );
      }

      setInterviews(filteredData as AppraisalInterview[]);
      return filteredData as AppraisalInterview[];
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch appraisal interviews",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMyInterviews = useCallback(async (userId: string, role: "employee" | "manager") => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appraisal_interviews")
        .select(`
          *,
          participant:appraisal_participants(
            id,
            employee_id,
            evaluator_id,
            cycle_id,
            status,
            employee:profiles!appraisal_participants_employee_id_fkey(id, full_name, email),
            evaluator:profiles!appraisal_participants_evaluator_id_fkey(id, full_name, email),
            cycle:appraisal_cycles(id, name)
          )
        `)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;

      // Filter based on role
      const filtered = (data || []).filter((interview: any) => {
        if (role === "employee") {
          return interview.participant?.employee_id === userId;
        } else {
          return interview.participant?.evaluator_id === userId;
        }
      });

      setInterviews(filtered as AppraisalInterview[]);
      return filtered as AppraisalInterview[];
    } catch (error) {
      console.error("Error fetching my interviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your interviews",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createInterview = useCallback(async (interview: {
    participant_id: string;
    scheduled_at: string;
    duration_minutes?: number;
    location?: string;
    meeting_type?: "in_person" | "video_call" | "phone_call";
    meeting_link?: string;
    agenda?: string;
  }) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("appraisal_interviews")
        .insert({
          ...interview,
          scheduled_by: user?.id,
          duration_minutes: interview.duration_minutes || 60,
          meeting_type: interview.meeting_type || "in_person",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Interview Scheduled",
        description: "The appraisal interview has been scheduled successfully",
      });

      return data;
    } catch (error) {
      console.error("Error creating interview:", error);
      toast({
        title: "Error",
        description: "Failed to schedule interview",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateInterview = useCallback(async (id: string, updates: Partial<AppraisalInterview>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appraisal_interviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Interview Updated",
        description: "The interview has been updated successfully",
      });

      return data;
    } catch (error) {
      console.error("Error updating interview:", error);
      toast({
        title: "Error",
        description: "Failed to update interview",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const confirmInterview = useCallback(async (id: string) => {
    return updateInterview(id, {
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    });
  }, [updateInterview]);

  const cancelInterview = useCallback(async (id: string, reason?: string) => {
    return updateInterview(id, {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    });
  }, [updateInterview]);

  const completeInterview = useCallback(async (id: string, outcomeSummary?: string) => {
    return updateInterview(id, {
      status: "completed",
      completed_at: new Date().toISOString(),
      outcome_summary: outcomeSummary,
    });
  }, [updateInterview]);

  const rescheduleInterview = useCallback(async (id: string, newScheduledAt: string) => {
    return updateInterview(id, {
      status: "rescheduled",
      scheduled_at: newScheduledAt,
    });
  }, [updateInterview]);

  const deleteInterview = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("appraisal_interviews")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Interview Deleted",
        description: "The interview has been deleted",
      });

      return true;
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast({
        title: "Error",
        description: "Failed to delete interview",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    interviews,
    fetchInterviews,
    fetchMyInterviews,
    createInterview,
    updateInterview,
    confirmInterview,
    cancelInterview,
    completeInterview,
    rescheduleInterview,
    deleteInterview,
  };
};
