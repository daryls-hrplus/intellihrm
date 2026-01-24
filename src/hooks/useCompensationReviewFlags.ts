import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CompensationReviewFlag {
  id: string;
  company_id: string;
  employee_id: string;
  source_type: string;
  source_participant_id: string | null;
  source_cycle_id: string | null;
  performance_category_code: string | null;
  performance_score: number | null;
  recommended_action: string | null;
  recommended_percentage: number | null;
  justification: string | null;
  status: string;
  priority: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  processed_at: string | null;
  processed_by: string | null;
  outcome_notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    employee_id: string | null;
    avatar_url: string | null;
  };
  appraisal_cycle?: {
    id: string;
    name: string;
  } | null;
}

interface UseCompensationReviewFlagsOptions {
  companyId?: string;
  status?: string;
}

export function useCompensationReviewFlags(options: UseCompensationReviewFlagsOptions = {}) {
  const { companyId, status = "pending" } = options;
  const [flags, setFlags] = useState<CompensationReviewFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("compensation_review_flags")
        .select(`
          *,
          employee:profiles!compensation_review_flags_employee_id_fkey(
            id,
            first_name,
            last_name,
            employee_id,
            avatar_url
          ),
          appraisal_cycle:appraisal_cycles!compensation_review_flags_source_cycle_id_fkey(
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (companyId && companyId !== "all") {
        query = query.eq("company_id", companyId);
      }

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setFlags((data || []) as unknown as CompensationReviewFlag[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch flags";
      setError(message);
      console.error("Error fetching compensation review flags:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, status]);

  const approveFlag = async (flagId: string, userId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from("compensation_review_flags")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
          review_notes: notes || null,
        })
        .eq("id", flagId);

      if (error) throw error;

      toast.success("Flag approved successfully");
      await fetchFlags();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve flag";
      toast.error(message);
      throw err;
    }
  };

  const rejectFlag = async (flagId: string, userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from("compensation_review_flags")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
          review_notes: reason,
        })
        .eq("id", flagId);

      if (error) throw error;

      toast.success("Flag rejected");
      await fetchFlags();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject flag";
      toast.error(message);
      throw err;
    }
  };

  const markProcessed = async (flagId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("compensation_review_flags")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
          processed_by: userId,
        })
        .eq("id", flagId);

      if (error) throw error;

      toast.success("Flag marked as processed");
      await fetchFlags();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to mark as processed";
      toast.error(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  return {
    flags,
    loading,
    error,
    fetchFlags,
    approveFlag,
    rejectFlag,
    markProcessed,
  };
}
