import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Job {
  id: string;
  name: string;
  code: string;
  company_id: string | null;
}

export interface CapabilityJobApplicability {
  id: string;
  capability_id: string;
  job_id: string;
  ai_suggested: boolean;
  confidence_score: number | null;
  created_at: string;
  job?: Job;
}

export function useCapabilityJobApplicability() {
  const [loading, setLoading] = useState(false);
  const [applicability, setApplicability] = useState<CapabilityJobApplicability[]>([]);

  const fetchApplicability = useCallback(async (capabilityId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("capability_job_applicability")
        .select(`
          id,
          capability_id,
          job_id,
          ai_suggested,
          confidence_score,
          created_at,
          job:jobs(id, name, code, company_id)
        `)
        .eq("capability_id", capabilityId);

      if (error) throw error;
      setApplicability(data as unknown as CapabilityJobApplicability[]);
      return data;
    } catch (error: any) {
      console.error("Error fetching job applicability:", error);
      toast.error("Failed to fetch job applicability");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addApplicability = useCallback(async (capabilityId: string, jobId: string) => {
    try {
      const { error } = await supabase
        .from("capability_job_applicability")
        .insert({
          capability_id: capabilityId,
          job_id: jobId,
          ai_suggested: false,
        });

      if (error) throw error;
      toast.success("Job linked to capability");
      return true;
    } catch (error: any) {
      console.error("Error adding job applicability:", error);
      toast.error(error.message || "Failed to link job");
      return false;
    }
  }, []);

  const removeApplicability = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("capability_job_applicability")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Job unlinked from capability");
      return true;
    } catch (error: any) {
      console.error("Error removing job applicability:", error);
      toast.error(error.message || "Failed to unlink job");
      return false;
    }
  }, []);

  const bulkSetApplicability = useCallback(async (capabilityId: string, jobIds: string[]) => {
    try {
      // First delete existing
      const { error: deleteError } = await supabase
        .from("capability_job_applicability")
        .delete()
        .eq("capability_id", capabilityId);

      if (deleteError) throw deleteError;

      // Then insert new ones
      if (jobIds.length > 0) {
        const { error: insertError } = await supabase
          .from("capability_job_applicability")
          .insert(
            jobIds.map((jobId) => ({
              capability_id: capabilityId,
              job_id: jobId,
              ai_suggested: false,
            }))
          );

        if (insertError) throw insertError;
      }

      return true;
    } catch (error: any) {
      console.error("Error setting job applicability:", error);
      toast.error(error.message || "Failed to update job applicability");
      return false;
    }
  }, []);

  return {
    loading,
    applicability,
    fetchApplicability,
    addApplicability,
    removeApplicability,
    bulkSetApplicability,
  };
}

export function useJobs() {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = useCallback(async (companyId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("jobs")
        .select("id, name, code, company_id")
        .eq("is_active", true)
        .order("name");

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
      return data || [];
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, jobs, fetchJobs };
}
