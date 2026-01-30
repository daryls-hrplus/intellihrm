import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamHealthMetrics {
  teamSize: number;
  actionsPending: number;
  overdueItems: number;
  highPerformers: number;
  highPerformersPercent: number;
  atRiskCount: number;
}

export interface PerformanceMetrics {
  appraisalCompletionRate: number;
  completedAppraisals: number;
  totalAppraisals: number;
  teamAverageRating: number | null;
  ratingDistribution: { rating: string; count: number; percentage: number }[];
  goalsOnTrack: number;
  goalsOnTrackPercent: number;
  totalGoals: number;
  activePips: number;
}

export interface PendingApprovalsMetrics {
  leave: number;
  time: number;
  training: number;
  expense: number;
  workflow: number;
  total: number;
}

export interface DirectReport {
  employee_id: string;
  employee_name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useMssTeamMetrics() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["mss-team-metrics", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: reports } = await supabase.rpc("get_manager_direct_reports", { p_manager_id: user.id });
      const directReports = (reports || []) as DirectReport[];
      const employeeIds = directReports.map((r) => r.employee_id);
      const teamSize = employeeIds.length;

      if (teamSize === 0) {
        return {
          directReports,
          healthMetrics: { teamSize: 0, actionsPending: 0, overdueItems: 0, highPerformers: 0, highPerformersPercent: 0, atRiskCount: 0 },
          performanceMetrics: { appraisalCompletionRate: 0, completedAppraisals: 0, totalAppraisals: 0, teamAverageRating: null, ratingDistribution: [], goalsOnTrack: 0, goalsOnTrackPercent: 0, totalGoals: 0, activePips: 0 },
          pendingApprovals: { leave: 0, time: 0, training: 0, expense: 0, workflow: 0, total: 0 },
        };
      }

      // Fetch metrics using db alias to avoid deep type instantiation
      const leaveRes = await db.from("leave_requests").select("id", { count: "exact", head: true }).eq("approver_id", user.id).eq("status", "pending");
      const appraisalRes = await db.from("appraisal_participants").select("status, overall_score").in("employee_id", employeeIds).eq("evaluator_id", user.id);
      const goalsRes = await db.from("performance_goals").select("id, status, progress_percentage").in("employee_id", employeeIds).in("status", ["active", "in_progress"]);
      const pipRes = await db.from("performance_improvement_plans").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).eq("status", "active");
      const timesheetRes = await db.from("timesheet_submissions").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).eq("status", "pending");
      const trainingRes = await db.from("training_requests").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).eq("status", "pending");
      const workflowRes = await db.from("workflow_step_tracking").select("id", { count: "exact", head: true }).eq("actor_id", user.id).is("completed_at", null);

      const appraisals = (appraisalRes.data || []) as { status: string; overall_score: number | null }[];
      const totalAppraisals = appraisals.length;
      const completedAppraisals = appraisals.filter((a) => a.status === "completed" || a.status === "acknowledged").length;
      const scores = appraisals.filter((a) => a.overall_score != null).map((a) => Number(a.overall_score));
      const teamAverageRating = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      const highPerformers = scores.filter((s) => s >= 4).length;

      const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      scores.forEach((s) => { const r = Math.round(s); if (r >= 1 && r <= 5) ratingCounts[r]++; });
      const ratingDistribution = Object.entries(ratingCounts).map(([rating, count]) => ({
        rating, count, percentage: scores.length > 0 ? Math.round((count / scores.length) * 100) : 0,
      }));

      const goals = (goalsRes.data || []) as { progress_percentage: number | null }[];
      const totalGoals = goals.length;
      const goalsOnTrack = goals.filter((g) => (g.progress_percentage || 0) >= 50).length;

      const leave = leaveRes.count || 0;
      const time = timesheetRes.count || 0;
      const training = trainingRes.count || 0;
      const workflow = workflowRes.count || 0;

      return {
        directReports,
        healthMetrics: { teamSize, actionsPending: leave + time + training + workflow, overdueItems: 0, highPerformers, highPerformersPercent: teamSize > 0 ? Math.round((highPerformers / teamSize) * 100) : 0, atRiskCount: scores.filter((s) => s < 2.5).length },
        performanceMetrics: { appraisalCompletionRate: totalAppraisals > 0 ? Math.round((completedAppraisals / totalAppraisals) * 100) : 0, completedAppraisals, totalAppraisals, teamAverageRating, ratingDistribution, goalsOnTrack, goalsOnTrackPercent: totalGoals > 0 ? Math.round((goalsOnTrack / totalGoals) * 100) : 0, totalGoals, activePips: pipRes.count || 0 },
        pendingApprovals: { leave, time, training, expense: 0, workflow, total: leave + time + training + workflow },
      };
    },
    enabled: !!user?.id,
  });

  const empty = {
    directReports: [] as DirectReport[],
    healthMetrics: { teamSize: 0, actionsPending: 0, overdueItems: 0, highPerformers: 0, highPerformersPercent: 0, atRiskCount: 0 } as TeamHealthMetrics,
    performanceMetrics: { appraisalCompletionRate: 0, completedAppraisals: 0, totalAppraisals: 0, teamAverageRating: null, ratingDistribution: [], goalsOnTrack: 0, goalsOnTrackPercent: 0, totalGoals: 0, activePips: 0 } as PerformanceMetrics,
    pendingApprovals: { leave: 0, time: 0, training: 0, expense: 0, workflow: 0, total: 0 } as PendingApprovalsMetrics,
  };

  return { ...(data || empty), isLoading };
}
