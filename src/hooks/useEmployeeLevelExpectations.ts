import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobLevelExpectation } from "./useJobLevelExpectations";

interface EmployeeLevelInfo {
  jobLevel: string | null;
  jobGrade: string | null;
  jobTitle: string | null;
  positionTitle: string | null;
}

interface GapAnalysis {
  competencyGap: number | null; // Positive = above expectation, Negative = below
  goalGap: number | null;
  competencyStatus: "exceeds" | "meets" | "below" | "unknown";
  goalStatus: "exceeds" | "meets" | "below" | "unknown";
}

export interface EmployeeLevelExpectationsResult {
  expectation: JobLevelExpectation | null;
  employeeInfo: EmployeeLevelInfo;
  gapAnalysis: GapAnalysis | null;
  loading: boolean;
}

export function useEmployeeLevelExpectations(
  employeeId: string | null,
  companyId: string | null,
  currentScores?: {
    competencyScore: number | null;
    goalScore: number | null;
  }
) {
  const [expectation, setExpectation] = useState<JobLevelExpectation | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeLevelInfo>({
    jobLevel: null,
    jobGrade: null,
    jobTitle: null,
    positionTitle: null,
  });
  const [loading, setLoading] = useState(false);

  const fetchEmployeeLevelExpectations = useCallback(async () => {
    if (!employeeId || !companyId) return;

    setLoading(true);
    try {
      // First, get the employee's active position(s) and their job info
      const { data: positions } = await supabase
        .from("employee_positions")
        .select(`
          position_id,
          is_primary,
          positions!inner(
            id,
            title,
            job_id,
            jobs!inner(
              id,
              title,
              job_level,
              job_grade
            )
          )
        `)
        .eq("employee_id", employeeId)
        .eq("is_active", true)
        .order("is_primary", { ascending: false })
        .limit(1);

      if (!positions || positions.length === 0) {
        setExpectation(null);
        return;
      }

      const primaryPosition = positions[0];
      const job = (primaryPosition as any).positions?.jobs;
      const position = (primaryPosition as any).positions;

      if (!job) {
        setExpectation(null);
        return;
      }

      const jobLevel = job.job_level;
      const jobGrade = job.job_grade;

      setEmployeeInfo({
        jobLevel,
        jobGrade,
        jobTitle: job.title,
        positionTitle: position?.title,
      });

      if (!jobLevel || !jobGrade) {
        setExpectation(null);
        return;
      }

      // Fetch the matching job level expectation
      const today = new Date().toISOString().split("T")[0];
      const { data: expectations } = await supabase
        .from("job_level_expectations")
        .select("*")
        .eq("company_id", companyId)
        .eq("job_level", jobLevel)
        .eq("job_grade", jobGrade)
        .eq("is_active", true)
        .lte("effective_from", today)
        .or(`effective_to.is.null,effective_to.gte.${today}`)
        .order("effective_from", { ascending: false })
        .limit(1);

      if (expectations && expectations.length > 0) {
        setExpectation(expectations[0] as JobLevelExpectation);
      } else {
        setExpectation(null);
      }
    } catch (error) {
      console.error("Error fetching employee level expectations:", error);
      setExpectation(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId, companyId]);

  useEffect(() => {
    fetchEmployeeLevelExpectations();
  }, [fetchEmployeeLevelExpectations]);

  // Calculate gap analysis
  const gapAnalysis = useCallback((): GapAnalysis | null => {
    if (!expectation || !currentScores) return null;

    const { competencyScore, goalScore } = currentScores;
    const { min_competency_score, min_goal_achievement_percent } = expectation;

    const getStatus = (
      actual: number | null,
      threshold: number,
      tolerance: number = 0.1
    ): "exceeds" | "meets" | "below" | "unknown" => {
      if (actual === null) return "unknown";
      if (actual >= threshold + tolerance) return "exceeds";
      if (actual >= threshold - tolerance) return "meets";
      return "below";
    };

    // Competency is typically on a scale (e.g., 1-5)
    // Goal is typically a percentage
    const competencyGap = competencyScore !== null 
      ? competencyScore - min_competency_score 
      : null;
    
    const goalGap = goalScore !== null 
      ? goalScore - min_goal_achievement_percent 
      : null;

    return {
      competencyGap,
      goalGap,
      competencyStatus: getStatus(competencyScore, min_competency_score, 0.2),
      goalStatus: getStatus(goalScore, min_goal_achievement_percent, 5),
    };
  }, [expectation, currentScores]);

  return {
    expectation,
    employeeInfo,
    gapAnalysis: gapAnalysis(),
    loading,
    refetch: fetchEmployeeLevelExpectations,
  };
}
