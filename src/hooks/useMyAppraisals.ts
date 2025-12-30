import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MyAppraisal {
  id: string;
  cycle_id: string;
  cycle_name: string;
  cycle_start_date: string;
  cycle_end_date: string;
  cycle_status: string;
  evaluator_id: string | null;
  evaluator_name: string | null;
  status: string;
  overall_score: number | null;
  goal_score: number | null;
  competency_score: number | null;
  responsibility_score: number | null;
  final_comments: string | null;
  employee_comments: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  pending_actions_count: number;
  mandatory_actions_count: number;
  evaluation_deadline: string | null;
  position_title: string | null;
}

export function useMyAppraisals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-appraisals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch participations where employee_id = current user
      const { data: participations, error } = await supabase
        .from("appraisal_participants")
        .select(`
          id,
          status,
          overall_score,
          goal_score,
          competency_score,
          responsibility_score,
          final_comments,
          employee_comments,
          submitted_at,
          reviewed_at,
          primary_position_id,
          evaluator_id,
          cycle:appraisal_cycles!inner(
            id,
            name,
            start_date,
            end_date,
            status,
            evaluation_deadline
          )
        `)
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!participations) return [];

      // Get evaluator names
      const evaluatorIds = [...new Set(participations.map(p => p.evaluator_id).filter(Boolean))];
      let evaluatorMap: Record<string, string> = {};
      
      if (evaluatorIds.length > 0) {
        const { data: evaluators } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", evaluatorIds as string[]);
        
        if (evaluators) {
          evaluatorMap = Object.fromEntries(evaluators.map(e => [e.id, e.full_name || ""]));
        }
      }

      // Get position titles
      const positionIds = [...new Set(participations.map(p => p.primary_position_id).filter(Boolean))];
      let positionMap: Record<string, string> = {};
      
      if (positionIds.length > 0) {
        const { data: positions } = await supabase
          .from("positions")
          .select("id, title")
          .in("id", positionIds as string[]);
        
        if (positions) {
          positionMap = Object.fromEntries(positions.map(p => [p.id, p.title || ""]));
        }
      }

      // Get pending actions count for each participant
      const participantIds = participations.map(p => p.id);
      const { data: actions } = await supabase
        .from("appraisal_action_executions")
        .select("participant_id, status, rule:appraisal_outcome_action_rules(action_is_mandatory)")
        .in("participant_id", participantIds)
        .eq("status", "pending");

      const actionCounts: Record<string, { total: number; mandatory: number }> = {};
      if (actions) {
        for (const action of actions) {
          if (!actionCounts[action.participant_id]) {
            actionCounts[action.participant_id] = { total: 0, mandatory: 0 };
          }
          actionCounts[action.participant_id].total++;
          if (action.rule?.action_is_mandatory) {
            actionCounts[action.participant_id].mandatory++;
          }
        }
      }

      return participations.map((p): MyAppraisal => {
        const cycle = p.cycle as any;
        return {
          id: p.id,
          cycle_id: cycle.id,
          cycle_name: cycle.name,
          cycle_start_date: cycle.start_date,
          cycle_end_date: cycle.end_date,
          cycle_status: cycle.status,
          evaluator_id: p.evaluator_id,
          evaluator_name: p.evaluator_id ? evaluatorMap[p.evaluator_id] || null : null,
          status: p.status,
          overall_score: p.overall_score,
          goal_score: p.goal_score,
          competency_score: p.competency_score,
          responsibility_score: p.responsibility_score,
          final_comments: p.final_comments,
          employee_comments: p.employee_comments,
          submitted_at: p.submitted_at,
          reviewed_at: p.reviewed_at,
          pending_actions_count: actionCounts[p.id]?.total || 0,
          mandatory_actions_count: actionCounts[p.id]?.mandatory || 0,
          evaluation_deadline: cycle.evaluation_deadline,
          position_title: p.primary_position_id ? positionMap[p.primary_position_id] || null : null,
        };
      });
    },
    enabled: !!user?.id,
  });
}

export function useMyActiveAppraisals() {
  const { data: appraisals = [], ...rest } = useMyAppraisals();
  
  const active = appraisals.filter(a => 
    a.cycle_status === "active" || a.cycle_status === "in_progress"
  );
  
  const completed = appraisals.filter(a => 
    a.cycle_status === "completed" || a.cycle_status === "closed"
  );
  
  const pendingSelfAssessment = active.filter(a => 
    !a.submitted_at && a.status !== "completed"
  );
  
  const pendingAcknowledgment = appraisals.filter(a => 
    a.overall_score !== null && a.status !== "acknowledged"
  );

  return {
    appraisals,
    active,
    completed,
    pendingSelfAssessment,
    pendingAcknowledgment,
    ...rest,
  };
}
