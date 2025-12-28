import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Job {
  id: string;
  name: string;
  code: string;
  company_id: string | null;
}

export interface JobCapabilityRequirement {
  id: string;
  capability_id: string;
  job_id: string;
  required_proficiency_level: number;
  weighting: number | null;
  is_required: boolean;
  is_preferred: boolean;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface JobRequirementInput {
  job_id: string;
  required_proficiency_level?: number;
  weighting?: number;
  is_required?: boolean;
  is_preferred?: boolean;
  start_date?: string;
  end_date?: string | null;
  notes?: string | null;
}

// Legacy interface for backward compatibility
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
  const [requirements, setRequirements] = useState<JobCapabilityRequirement[]>([]);

  // Fetch job requirements from the single source of truth: job_capability_requirements
  const fetchApplicability = useCallback(async (capabilityId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_capability_requirements")
        .select(`
          id,
          capability_id,
          job_id,
          required_proficiency_level,
          weighting,
          is_required,
          is_preferred,
          start_date,
          end_date,
          notes,
          created_at,
          updated_at,
          job:jobs(id, name, code, company_id)
        `)
        .eq("capability_id", capabilityId);

      if (error) throw error;
      setRequirements(data as unknown as JobCapabilityRequirement[]);
      return data;
    } catch (error: any) {
      console.error("Error fetching job requirements:", error);
      toast.error("Failed to fetch job requirements");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a single job requirement with full context
  const addJobRequirement = useCallback(async (
    capabilityId: string, 
    input: JobRequirementInput
  ) => {
    try {
      const { error } = await supabase
        .from("job_capability_requirements")
        .insert({
          capability_id: capabilityId,
          job_id: input.job_id,
          required_proficiency_level: input.required_proficiency_level ?? 3,
          weighting: input.weighting ?? 10,
          is_required: input.is_required ?? true,
          is_preferred: input.is_preferred ?? false,
          start_date: input.start_date ?? new Date().toISOString().split("T")[0],
          end_date: input.end_date ?? null,
          notes: input.notes ?? null,
        });

      if (error) throw error;
      toast.success("Job linked to capability");
      return true;
    } catch (error: any) {
      console.error("Error adding job requirement:", error);
      toast.error(error.message || "Failed to link job");
      return false;
    }
  }, []);

  // Update an existing job requirement
  const updateJobRequirement = useCallback(async (
    id: string,
    updates: Partial<JobRequirementInput>
  ) => {
    try {
      const { error } = await supabase
        .from("job_capability_requirements")
        .update({
          required_proficiency_level: updates.required_proficiency_level,
          weighting: updates.weighting,
          is_required: updates.is_required,
          is_preferred: updates.is_preferred,
          end_date: updates.end_date,
          notes: updates.notes,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Job requirement updated");
      return true;
    } catch (error: any) {
      console.error("Error updating job requirement:", error);
      toast.error(error.message || "Failed to update job requirement");
      return false;
    }
  }, []);

  // Remove a job requirement
  const removeApplicability = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("job_capability_requirements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Job unlinked from capability");
      return true;
    } catch (error: any) {
      console.error("Error removing job requirement:", error);
      toast.error(error.message || "Failed to unlink job");
      return false;
    }
  }, []);

  // Bulk set job requirements - replaces all requirements for a capability
  const bulkSetApplicability = useCallback(async (
    capabilityId: string, 
    jobRequirements: JobRequirementInput[]
  ) => {
    try {
      // First, get existing requirements
      const { data: existing } = await supabase
        .from("job_capability_requirements")
        .select("id, job_id")
        .eq("capability_id", capabilityId);

      const existingJobIds = new Set(existing?.map(e => e.job_id) || []);
      const newJobIds = new Set(jobRequirements.map(r => r.job_id));

      // Delete removed jobs
      const toDelete = existing?.filter(e => !newJobIds.has(e.job_id)) || [];
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("job_capability_requirements")
          .delete()
          .in("id", toDelete.map(e => e.id));
        if (deleteError) throw deleteError;
      }

      // Insert new jobs
      const toInsert = jobRequirements.filter(r => !existingJobIds.has(r.job_id));
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("job_capability_requirements")
          .insert(
            toInsert.map((input) => ({
              capability_id: capabilityId,
              job_id: input.job_id,
              required_proficiency_level: input.required_proficiency_level ?? 3,
              weighting: input.weighting ?? 10,
              is_required: input.is_required ?? true,
              is_preferred: input.is_preferred ?? false,
              start_date: input.start_date ?? new Date().toISOString().split("T")[0],
              end_date: input.end_date ?? null,
              notes: input.notes ?? null,
            }))
          );
        if (insertError) throw insertError;
      }

      // Update existing jobs with new values
      const toUpdate = jobRequirements.filter(r => existingJobIds.has(r.job_id));
      for (const update of toUpdate) {
        const existingRecord = existing?.find(e => e.job_id === update.job_id);
        if (existingRecord) {
          await supabase
            .from("job_capability_requirements")
            .update({
              required_proficiency_level: update.required_proficiency_level ?? 3,
              weighting: update.weighting ?? 10,
              is_required: update.is_required ?? true,
              is_preferred: update.is_preferred ?? false,
              end_date: update.end_date ?? null,
              notes: update.notes ?? null,
            })
            .eq("id", existingRecord.id);
        }
      }

      return true;
    } catch (error: any) {
      console.error("Error setting job requirements:", error);
      toast.error(error.message || "Failed to update job requirements");
      return false;
    }
  }, []);

  // Legacy compatibility: get applicability in old format
  const applicability = requirements.map(r => ({
    id: r.id,
    capability_id: r.capability_id,
    job_id: r.job_id,
    ai_suggested: false,
    confidence_score: null,
    created_at: r.created_at,
    job: r.job,
  }));

  return {
    loading,
    requirements,
    applicability, // Legacy format
    fetchApplicability,
    addJobRequirement,
    updateJobRequirement,
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
