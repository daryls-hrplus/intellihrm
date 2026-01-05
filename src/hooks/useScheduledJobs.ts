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
  };
}
