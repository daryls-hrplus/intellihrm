import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MyReview360Participation {
  id: string;
  cycle_id: string;
  cycle_name: string;
  cycle_status: string;
  status: string;
  self_review_completed: boolean;
  manager_review_completed: boolean;
  overall_score: number | null;
  start_date: string;
  end_date: string;
  self_review_deadline: string | null;
  feedback_deadline: string | null;
  include_self_review: boolean;
  include_peer_review: boolean;
  include_manager_review: boolean;
  include_direct_report_review: boolean;
}

export function useMyReview360Participations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-review-360-participations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // @ts-ignore - Supabase types issue with nested selects
      const { data, error } = await supabase
        .from("review_participants")
        .select(`
          id,
          status,
          self_review_completed,
          manager_review_completed,
          overall_score,
          review_cycle:review_cycles!inner(
            id,
            name,
            status,
            start_date,
            end_date,
            self_review_deadline,
            feedback_deadline,
            include_self_review,
            include_peer_review,
            include_manager_review,
            include_direct_report_review,
            is_template
          )
        `)
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      // Filter out template cycles and map to interface
      return (data as any[])
        .filter((p) => {
          const cycle = p.review_cycle;
          return !cycle.is_template && (cycle.status === 'active' || cycle.status === 'in_progress' || cycle.status === 'completed');
        })
        .map((p): MyReview360Participation => {
          const cycle = p.review_cycle;
          return {
            id: p.id,
            cycle_id: cycle.id,
            cycle_name: cycle.name,
            cycle_status: cycle.status,
            status: p.status,
            self_review_completed: p.self_review_completed || false,
            manager_review_completed: p.manager_review_completed || false,
            overall_score: p.overall_score,
            start_date: cycle.start_date,
            end_date: cycle.end_date,
            self_review_deadline: cycle.self_review_deadline,
            feedback_deadline: cycle.feedback_deadline,
            include_self_review: cycle.include_self_review,
            include_peer_review: cycle.include_peer_review,
            include_manager_review: cycle.include_manager_review,
            include_direct_report_review: cycle.include_direct_report_review,
          };
        });
    },
    enabled: !!user?.id,
  });
}
