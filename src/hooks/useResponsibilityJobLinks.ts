import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface JobLink {
  id: string;
  job_id: string;
  job_name: string;
  job_code: string;
  weighting: number;
  start_date: string;
  end_date: string | null;
}

interface ResponsibilityJobLinkData {
  responsibility_id: string;
  job_count: number;
  jobs: JobLink[];
}

export function useResponsibilityJobLinks(companyId: string) {
  const [linkData, setLinkData] = useState<Map<string, ResponsibilityJobLinkData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobLinks = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      // Fetch all job_responsibilities with job details for this company
      const { data, error } = await supabase
        .from("job_responsibilities")
        .select(`
          id,
          responsibility_id,
          job_id,
          weighting,
          start_date,
          end_date,
          jobs!inner (
            id,
            name,
            code,
            company_id
          )
        `)
        .eq("jobs.company_id", companyId);

      if (error) {
        console.error("Error fetching job links:", error);
        return;
      }

      // Group by responsibility_id
      const grouped = new Map<string, ResponsibilityJobLinkData>();
      
      (data || []).forEach((jr: any) => {
        const responsibilityId = jr.responsibility_id;
        const existing = grouped.get(responsibilityId) || {
          responsibility_id: responsibilityId,
          job_count: 0,
          jobs: [],
        };

        existing.jobs.push({
          id: jr.id,
          job_id: jr.job_id,
          job_name: jr.jobs?.name || "Unknown Job",
          job_code: jr.jobs?.code || "",
          weighting: jr.weighting,
          start_date: jr.start_date,
          end_date: jr.end_date,
        });
        existing.job_count = existing.jobs.length;

        grouped.set(responsibilityId, existing);
      });

      setLinkData(grouped);
    } catch (err) {
      console.error("Error in fetchJobLinks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchJobLinks();
  }, [fetchJobLinks]);

  const getJobCount = (responsibilityId: string): number => {
    return linkData.get(responsibilityId)?.job_count || 0;
  };

  const getJobLinks = (responsibilityId: string): JobLink[] => {
    return linkData.get(responsibilityId)?.jobs || [];
  };

  const getTotalWeight = (responsibilityId: string): number => {
    const jobs = getJobLinks(responsibilityId);
    return jobs.reduce((sum, j) => sum + j.weighting, 0);
  };

  return {
    linkData,
    isLoading,
    getJobCount,
    getJobLinks,
    getTotalWeight,
    refetch: fetchJobLinks,
  };
}
