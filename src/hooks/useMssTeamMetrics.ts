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

export interface CompositionMetrics {
  newHires: number;
  probationary: number;
  upcomingAnniversaries: number;
  expiringDocuments: number;
  pendingExits: number;
}

export interface TrainingMetrics {
  activeEnrollments: number;
  completionRate: number;
  overdueTraining: number;
  expiringCertifications: number;
  activeDevelopmentPlans: number;
}

export interface SuccessionMetrics {
  successionCoverage: number;
  keyPositionsWithSuccessors: number;
  totalKeyPositions: number;
  readyNowCandidates: number;
  highPotentials: number;
  flightRisk: number;
  skillGaps: number;
}

export interface CompensationMetrics {
  avgCompaRatio: number;
  belowMidpoint: number;
  aboveMaximum: number;
  payEquityAlerts: number;
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

      const emptyResult = {
        directReports,
        healthMetrics: { teamSize: 0, actionsPending: 0, overdueItems: 0, highPerformers: 0, highPerformersPercent: 0, atRiskCount: 0 },
        performanceMetrics: { appraisalCompletionRate: 0, completedAppraisals: 0, totalAppraisals: 0, teamAverageRating: null, ratingDistribution: [], goalsOnTrack: 0, goalsOnTrackPercent: 0, totalGoals: 0, activePips: 0 },
        pendingApprovals: { leave: 0, time: 0, training: 0, expense: 0, workflow: 0, total: 0 },
        compositionMetrics: { newHires: 0, probationary: 0, upcomingAnniversaries: 0, expiringDocuments: 0, pendingExits: 0 },
        trainingMetrics: { activeEnrollments: 0, completionRate: 0, overdueTraining: 0, expiringCertifications: 0, activeDevelopmentPlans: 0 },
        successionMetrics: { successionCoverage: 0, keyPositionsWithSuccessors: 0, totalKeyPositions: 0, readyNowCandidates: 0, highPotentials: 0, flightRisk: 0, skillGaps: 0 },
        compensationMetrics: { avgCompaRatio: 1.0, belowMidpoint: 0, aboveMaximum: 0, payEquityAlerts: 0 },
      };

      if (teamSize === 0) {
        return emptyResult;
      }

      // Calculate date thresholds
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch core metrics
      const [
        leaveRes,
        appraisalRes,
        goalsRes,
        pipRes,
        timesheetRes,
        trainingRes,
        workflowRes,
        // Phase 2 queries
        profilesRes,
        onboardingRes,
        offboardingRes,
        enrollmentsRes,
        certExpRes,
        devPlansRes,
        successionRes,
        talentPoolRes,
        riskFlagsRes,
        skillGapsRes,
        compDataRes,
      ] = await Promise.all([
        // Core metrics
        db.from("leave_requests").select("id", { count: "exact", head: true }).eq("approver_id", user.id).eq("status", "pending"),
        db.from("appraisal_participants").select("status, overall_score").in("employee_id", employeeIds).eq("evaluator_id", user.id),
        db.from("performance_goals").select("id, status, progress_percentage").in("employee_id", employeeIds).in("status", ["active", "in_progress"]),
        db.from("performance_improvement_plans").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).eq("status", "active"),
        db.from("timesheet_submissions").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).eq("status", "pending"),
        db.from("training_requests").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).eq("status", "pending"),
        db.from("workflow_step_tracking").select("id", { count: "exact", head: true }).eq("actor_id", user.id).is("completed_at", null),
        
        // Composition metrics
        db.from("profiles").select("id, hire_date, probation_end_date, employment_status").in("id", employeeIds),
        db.from("employee_onboarding").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).neq("status", "completed"),
        db.from("employee_offboarding").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).in("status", ["initiated", "in_progress"]),
        
        // Training metrics
        db.from("employee_enrollments").select("id, status, due_date, completed_at").in("employee_id", employeeIds),
        db.from("employee_certifications").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).gte("expiry_date", now.toISOString()).lte("expiry_date", ninetyDaysFromNow),
        db.from("development_plans").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).eq("status", "active"),
        
        // Succession metrics
        db.from("succession_candidates").select("id, position_id, readiness_level").in("employee_id", employeeIds),
        db.from("talent_pool_members").select("id", { count: "exact", head: true }).in("employee_id", employeeIds),
        db.from("attrition_risk_flags").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).eq("is_active", true).gte("risk_score", 0.7),
        db.from("skill_gap_analysis").select("id", { count: "exact", head: true }).in("employee_id", employeeIds).eq("gap_severity", "critical"),
        
        // Compensation metrics
        db.from("employee_compensation").select("id, compa_ratio").in("employee_id", employeeIds).eq("is_current", true),
      ]);

      // Process appraisals
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

      // Process goals
      const goals = (goalsRes.data || []) as { progress_percentage: number | null }[];
      const totalGoals = goals.length;
      const goalsOnTrack = goals.filter((g) => (g.progress_percentage || 0) >= 50).length;

      // Pending approvals
      const leave = leaveRes.count || 0;
      const time = timesheetRes.count || 0;
      const training = trainingRes.count || 0;
      const workflow = workflowRes.count || 0;

      // Process composition metrics
      const profiles = (profilesRes.data || []) as { id: string; hire_date: string | null; probation_end_date: string | null }[];
      const newHires = profiles.filter(p => p.hire_date && new Date(p.hire_date) >= new Date(ninetyDaysAgo)).length;
      const probationary = profiles.filter(p => p.probation_end_date && new Date(p.probation_end_date) > now).length;
      const upcomingAnniversaries = profiles.filter(p => {
        if (!p.hire_date) return false;
        const hireDate = new Date(p.hire_date);
        const thisYearAnniversary = new Date(now.getFullYear(), hireDate.getMonth(), hireDate.getDate());
        return thisYearAnniversary >= now && thisYearAnniversary <= new Date(thirtyDaysFromNow);
      }).length;
      const pendingExits = offboardingRes.count || 0;
      // For expiring documents, we'd need a documents table - using 0 as placeholder
      const expiringDocuments = 0;

      // Process training metrics
      const enrollments = (enrollmentsRes.data || []) as { id: string; status: string; due_date: string | null; completed_at: string | null }[];
      const activeEnrollments = enrollments.filter(e => e.status === "enrolled" || e.status === "in_progress").length;
      const completedEnrollments = enrollments.filter(e => e.status === "completed").length;
      const completionRate = enrollments.length > 0 ? Math.round((completedEnrollments / enrollments.length) * 100) : 0;
      const overdueTraining = enrollments.filter(e => e.due_date && new Date(e.due_date) < now && e.status !== "completed").length;
      const expiringCertifications = certExpRes.count || 0;
      const activeDevelopmentPlans = devPlansRes.count || 0;

      // Process succession metrics
      const successionCandidates = (successionRes.data || []) as { id: string; position_id: string; readiness_level: string }[];
      const uniquePositionsCovered = new Set(successionCandidates.map(c => c.position_id)).size;
      const totalKeyPositions = Math.max(uniquePositionsCovered, teamSize > 0 ? Math.ceil(teamSize * 0.3) : 1);
      const successionCoverage = totalKeyPositions > 0 ? Math.round((uniquePositionsCovered / totalKeyPositions) * 100) : 0;
      const readyNowCandidates = successionCandidates.filter(c => c.readiness_level === "ready_now").length;
      const highPotentials = talentPoolRes.count || 0;
      const flightRisk = riskFlagsRes.count || 0;
      const skillGaps = skillGapsRes.count || 0;

      // Process compensation metrics
      const compData = (compDataRes.data || []) as { id: string; compa_ratio: number | null }[];
      const validCompaRatios = compData.filter(c => c.compa_ratio != null).map(c => Number(c.compa_ratio));
      const avgCompaRatio = validCompaRatios.length > 0 
        ? validCompaRatios.reduce((a, b) => a + b, 0) / validCompaRatios.length 
        : 1.0;
      const belowMidpoint = validCompaRatios.filter(r => r < 0.95).length;
      const aboveMaximum = validCompaRatios.filter(r => r > 1.2).length;
      const payEquityAlerts = 0; // Would need pay equity analysis table

      return {
        directReports,
        healthMetrics: { 
          teamSize, 
          actionsPending: leave + time + training + workflow, 
          overdueItems: overdueTraining, 
          highPerformers, 
          highPerformersPercent: teamSize > 0 ? Math.round((highPerformers / teamSize) * 100) : 0, 
          atRiskCount: scores.filter((s) => s < 2.5).length + flightRisk
        },
        performanceMetrics: { 
          appraisalCompletionRate: totalAppraisals > 0 ? Math.round((completedAppraisals / totalAppraisals) * 100) : 0, 
          completedAppraisals, 
          totalAppraisals, 
          teamAverageRating, 
          ratingDistribution, 
          goalsOnTrack, 
          goalsOnTrackPercent: totalGoals > 0 ? Math.round((goalsOnTrack / totalGoals) * 100) : 0, 
          totalGoals, 
          activePips: pipRes.count || 0 
        },
        pendingApprovals: { leave, time, training, expense: 0, workflow, total: leave + time + training + workflow },
        compositionMetrics: { newHires, probationary, upcomingAnniversaries, expiringDocuments, pendingExits },
        trainingMetrics: { activeEnrollments, completionRate, overdueTraining, expiringCertifications, activeDevelopmentPlans },
        successionMetrics: { successionCoverage, keyPositionsWithSuccessors: uniquePositionsCovered, totalKeyPositions, readyNowCandidates, highPotentials, flightRisk, skillGaps },
        compensationMetrics: { avgCompaRatio, belowMidpoint, aboveMaximum, payEquityAlerts },
      };
    },
    enabled: !!user?.id,
  });

  const empty = {
    directReports: [] as DirectReport[],
    healthMetrics: { teamSize: 0, actionsPending: 0, overdueItems: 0, highPerformers: 0, highPerformersPercent: 0, atRiskCount: 0 } as TeamHealthMetrics,
    performanceMetrics: { appraisalCompletionRate: 0, completedAppraisals: 0, totalAppraisals: 0, teamAverageRating: null, ratingDistribution: [], goalsOnTrack: 0, goalsOnTrackPercent: 0, totalGoals: 0, activePips: 0 } as PerformanceMetrics,
    pendingApprovals: { leave: 0, time: 0, training: 0, expense: 0, workflow: 0, total: 0 } as PendingApprovalsMetrics,
    compositionMetrics: { newHires: 0, probationary: 0, upcomingAnniversaries: 0, expiringDocuments: 0, pendingExits: 0 } as CompositionMetrics,
    trainingMetrics: { activeEnrollments: 0, completionRate: 0, overdueTraining: 0, expiringCertifications: 0, activeDevelopmentPlans: 0 } as TrainingMetrics,
    successionMetrics: { successionCoverage: 0, keyPositionsWithSuccessors: 0, totalKeyPositions: 0, readyNowCandidates: 0, highPotentials: 0, flightRisk: 0, skillGaps: 0 } as SuccessionMetrics,
    compensationMetrics: { avgCompaRatio: 1.0, belowMidpoint: 0, aboveMaximum: 0, payEquityAlerts: 0 } as CompensationMetrics,
  };

  return { ...(data || empty), isLoading };
}
