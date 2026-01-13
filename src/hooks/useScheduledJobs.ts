import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScheduledJob {
  id: string;
  job_name: string;
  job_description: string | null;
  edge_function_name: string;
  is_enabled: boolean;
  interval_minutes: number;
  last_run_at: string | null;
  last_run_status: string | null;
  last_run_result: Record<string, unknown> | null;
  next_scheduled_run: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  timezone?: string | null;
  run_window_start?: string | null;
  run_window_end?: string | null;
  run_days?: number[] | null;
}

export type JobValidityStatus = 'scheduled' | 'active' | 'expired' | 'inactive';

/**
 * Get the validity status of a scheduled job based on valid_from/valid_to dates
 */
export function getJobValidityStatus(job: ScheduledJob): JobValidityStatus {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if job has future start date
  if (job.valid_from && job.valid_from > today) {
    return 'scheduled';
  }
  
  // Check if job has expired
  if (job.valid_to && job.valid_to < today) {
    return 'expired';
  }
  
  // Check if job is enabled
  if (!job.is_enabled) {
    return 'inactive';
  }
  
  return 'active';
}

/**
 * Check if a job is within its run window (business hours)
 */
export function isJobWithinRunWindow(job: ScheduledJob, timezone?: string): boolean {
  if (!job.run_window_start || !job.run_window_end) {
    return true; // No window restriction
  }
  
  const tz = timezone || job.timezone || 'UTC';
  const now = new Date();
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const currentTime = timeFormatter.format(now);
  
  return currentTime >= job.run_window_start && currentTime <= job.run_window_end;
}

/**
 * Check if today is a valid run day for the job
 */
export function isJobRunDay(job: ScheduledJob, timezone?: string): boolean {
  if (!job.run_days || job.run_days.length === 0) {
    return true; // No day restriction
  }
  
  const tz = timezone || job.timezone || 'UTC';
  const now = new Date();
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
  });
  
  // Convert day name to number (1=Monday, 7=Sunday)
  const dayMap: Record<string, number> = {
    'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7
  };
  
  const dayName = dayFormatter.format(now);
  const dayNumber = dayMap[dayName] || 1;
  
  return job.run_days.includes(dayNumber);
}

export function useScheduledJobs() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["scheduled-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_jobs")
        .select("*")
        .order("job_name");

      if (error) throw error;
      return data as ScheduledJob[];
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<ScheduledJob, "is_enabled" | "interval_minutes">> 
    }) => {
      const { data, error } = await supabase
        .from("scheduled_jobs")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-jobs"] });
      toast.success("Job configuration updated");
    },
    onError: (error) => {
      toast.error(`Failed to update job: ${error.message}`);
    },
  });

  const runJobMutation = useMutation({
    mutationFn: async (job: ScheduledJob) => {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke(job.edge_function_name, {
        body: { triggered_at: new Date().toISOString(), manual: true },
      });

      if (error) throw error;

      // Update the job with run results
      await supabase
        .from("scheduled_jobs")
        .update({
          last_run_at: new Date().toISOString(),
          last_run_status: "success",
          last_run_result: data,
          next_scheduled_run: new Date(
            Date.now() + job.interval_minutes * 60 * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-jobs"] });
      const results = data?.results;
      if (results) {
        toast.success(
          `Job completed: ${results.processed || 0} processed, ${results.escalated || 0} escalated, ${results.expired || 0} expired`
        );
      } else {
        toast.success("Job executed successfully");
      }
    },
    onError: async (error, job) => {
      // Update job with error status
      await supabase
        .from("scheduled_jobs")
        .update({
          last_run_at: new Date().toISOString(),
          last_run_status: "error",
          last_run_result: { error: error.message },
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      queryClient.invalidateQueries({ queryKey: ["scheduled-jobs"] });
      toast.error(`Job failed: ${error.message}`);
    },
  });

  return {
    jobs,
    isLoading,
    error,
    updateJob: updateJobMutation.mutate,
    runJob: runJobMutation.mutate,
    isUpdating: updateJobMutation.isPending,
    isRunning: runJobMutation.isPending,
    getJobValidityStatus,
    isJobWithinRunWindow,
    isJobRunDay,
  };
}
