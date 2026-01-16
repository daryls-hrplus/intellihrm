import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface JobConfigStats {
  jobId: string;
  jobName: string;
  jobCode: string;
  isActive: boolean;
  hasCompetencies: boolean;
  hasResponsibilities: boolean;
  hasGoals: boolean;
  hasSkills: boolean;
  competencyCount: number;
  responsibilityCount: number;
  goalCount: number;
  skillCount: number;
  isFullyConfigured: boolean;
}

interface ConfigurationSummary {
  totalActiveJobs: number;
  jobsWithCompetencies: number;
  jobsWithResponsibilities: number;
  jobsWithGoals: number;
  jobsWithSkills: number;
  fullyConfiguredJobs: number;
  jobStats: JobConfigStats[];
}

export type ConfigFilter =
  | "all"
  | "with-competencies"
  | "without-competencies"
  | "with-responsibilities"
  | "without-responsibilities"
  | "with-goals"
  | "without-goals"
  | "with-skills"
  | "without-skills"
  | "fully-configured"
  | "incomplete";

export function useJobConfigurationStats(companyId: string) {
  const [stats, setStats] = useState<ConfigurationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ConfigFilter>("all");

  const fetchStats = useCallback(async () => {
    if (!companyId) {
      setStats(null);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all active jobs for the company
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, name, code, is_active")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        return;
      }

      if (!jobs || jobs.length === 0) {
        setStats({
          totalActiveJobs: 0,
          jobsWithCompetencies: 0,
          jobsWithResponsibilities: 0,
          jobsWithGoals: 0,
          jobsWithSkills: 0,
          fullyConfiguredJobs: 0,
          jobStats: [],
        });
        return;
      }

      const jobIds = jobs.map((j) => j.id);

      // Fetch capability requirements with type info to separate competencies and skills
      const { data: capabilityData } = await supabase
        .from("job_capability_requirements")
        .select("job_id, id, capability_id, skills_competencies!inner(type)")
        .in("job_id", jobIds)
        .is("end_date", null);

      // Fetch responsibilities
      const { data: responsibilities } = await supabase
        .from("job_responsibilities")
        .select("job_id, id")
        .in("job_id", jobIds)
        .is("end_date", null);

      // Fetch goals
      const { data: goals } = await supabase
        .from("job_goals")
        .select("job_id, id")
        .in("job_id", jobIds)
        .is("end_date", null);

      // Separate competencies and skills from capability requirements
      const competencies = (capabilityData || []).filter(
        (c: any) => c.skills_competencies?.type === "COMPETENCY"
      );
      const skills = (capabilityData || []).filter(
        (c: any) => c.skills_competencies?.type === "SKILL"
      );

      // Build stats for each job
      const jobStats: JobConfigStats[] = jobs.map((job) => {
        const competencyCount = competencies.filter((c: any) => c.job_id === job.id).length;
        const responsibilityCount = responsibilities?.filter((r) => r.job_id === job.id).length || 0;
        const goalCount = goals?.filter((g) => g.job_id === job.id).length || 0;
        const skillCount = skills.filter((s: any) => s.job_id === job.id).length;

        const hasCompetencies = competencyCount > 0;
        const hasResponsibilities = responsibilityCount > 0;
        const hasGoals = goalCount > 0;
        const hasSkills = skillCount > 0;
        const isFullyConfigured = hasCompetencies && hasResponsibilities && hasGoals && hasSkills;

        return {
          jobId: job.id,
          jobName: job.name,
          jobCode: job.code,
          isActive: job.is_active,
          hasCompetencies,
          hasResponsibilities,
          hasGoals,
          hasSkills,
          competencyCount,
          responsibilityCount,
          goalCount,
          skillCount,
          isFullyConfigured,
        };
      });

      // Calculate summary stats
      const summary: ConfigurationSummary = {
        totalActiveJobs: jobs.length,
        jobsWithCompetencies: jobStats.filter((j) => j.hasCompetencies).length,
        jobsWithResponsibilities: jobStats.filter((j) => j.hasResponsibilities).length,
        jobsWithGoals: jobStats.filter((j) => j.hasGoals).length,
        jobsWithSkills: jobStats.filter((j) => j.hasSkills).length,
        fullyConfiguredJobs: jobStats.filter((j) => j.isFullyConfigured).length,
        jobStats,
      };

      setStats(summary);
    } catch (err) {
      console.error("Error fetching job configuration stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Filter jobs based on active filter
  const filteredJobIds = useMemo(() => {
    if (!stats) return new Set<string>();

    const filtered = stats.jobStats.filter((job) => {
      switch (activeFilter) {
        case "all":
          return true;
        case "with-competencies":
          return job.hasCompetencies;
        case "without-competencies":
          return !job.hasCompetencies;
        case "with-responsibilities":
          return job.hasResponsibilities;
        case "without-responsibilities":
          return !job.hasResponsibilities;
        case "with-goals":
          return job.hasGoals;
        case "without-goals":
          return !job.hasGoals;
        case "with-skills":
          return job.hasSkills;
        case "without-skills":
          return !job.hasSkills;
        case "fully-configured":
          return job.isFullyConfigured;
        case "incomplete":
          return !job.isFullyConfigured;
        default:
          return true;
      }
    });

    return new Set(filtered.map((j) => j.jobId));
  }, [stats, activeFilter]);

  const getPercentage = (count: number, total: number): string => {
    if (total === 0) return "0%";
    return `${Math.round((count / total) * 100)}%`;
  };

  return {
    stats,
    isLoading,
    refetch: fetchStats,
    activeFilter,
    setActiveFilter,
    filteredJobIds,
    getPercentage,
  };
}
