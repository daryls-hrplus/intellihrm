import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface My360Request {
  id: string;
  cycle_id: string;
  cycle_name: string;
  subject_employee_id: string;
  subject_employee_name: string;
  rater_category_id: string | null;
  status: string;
  due_date: string | null;
  submitted_at: string | null;
  is_mandatory: boolean;
}

export interface Feedback360Question {
  id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  display_order: number;
  category_id: string | null;
  rating_scale_min: number | null;
  rating_scale_max: number | null;
}

export function useMy360FeedbackRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-360-feedback-requests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get requests where I am the rater (feedback I need to give)
      const { data, error } = await supabase
        .from("feedback_360_requests")
        .select(`
          id,
          status,
          rater_category_id,
          due_date,
          submitted_at,
          is_mandatory,
          subject_employee_id,
          cycle:feedback_360_cycles!inner(
            id,
            name
          )
        `)
        .eq("rater_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      // Get subject employee names
      const subjectIds = [...new Set(data.map(r => r.subject_employee_id))];
      let employeeMap: Record<string, string> = {};
      
      if (subjectIds.length > 0) {
        const { data: employees } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", subjectIds);
        
        if (employees) {
          employeeMap = Object.fromEntries(employees.map(e => [e.id, e.full_name || "Unknown"]));
        }
      }

      return data.map((r): My360Request => {
        const cycle = r.cycle as any;
        return {
          id: r.id,
          cycle_id: cycle.id,
          cycle_name: cycle.name,
          subject_employee_id: r.subject_employee_id,
          subject_employee_name: employeeMap[r.subject_employee_id] || "Unknown",
          rater_category_id: r.rater_category_id,
          status: r.status,
          due_date: r.due_date,
          submitted_at: r.submitted_at,
          is_mandatory: r.is_mandatory,
        };
      });
    },
    enabled: !!user?.id,
  });
}

export function use360CycleQuestions(cycleId: string | undefined) {
  return useQuery({
    queryKey: ["360-cycle-questions", cycleId],
    queryFn: async () => {
      if (!cycleId) return [];

      const { data, error } = await supabase
        .from("feedback_360_questions")
        .select("id, question_text, question_type, is_required, display_order, category_id, rating_scale_min, rating_scale_max")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return (data || []) as Feedback360Question[];
    },
    enabled: !!cycleId,
  });
}

export function useSubmit360Feedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      responses,
    }: {
      requestId: string;
      responses: Array<{ question_id: string; rating: number | null; comment: string | null }>;
    }) => {
      // Insert responses
      for (const response of responses) {
        const { error } = await supabase
          .from("feedback_360_responses")
          .upsert({
            request_id: requestId,
            question_id: response.question_id,
            rating_value: response.rating,
            text_response: response.comment,
          });
        if (error) throw error;
      }

      // Update request status
      const { error: updateError } = await supabase
        .from("feedback_360_requests")
        .update({
          status: "completed",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-360-feedback-requests"] });
      toast.success("Feedback submitted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });
}
