import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CalibrationSession {
  id: string;
  company_id: string;
  appraisal_cycle_id: string | null;
  overall_scale_id: string | null;
  name: string;
  description: string | null;
  scheduled_date: string | null;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  facilitator_id: string | null;
  participants: string[];
  calibration_rules: {
    force_distribution?: boolean;
    max_rating_5_percent?: number;
  } | null;
  outcome_summary: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface UseCalibrationSessionsOptions {
  companyId: string;
  cycleId?: string;
}

export function useCalibrationSessions({ companyId, cycleId }: UseCalibrationSessionsOptions) {
  const [sessions, setSessions] = useState<CalibrationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!companyId) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("calibration_sessions")
        .select("*")
        .eq("company_id", companyId)
        .order("scheduled_date", { ascending: false });

      if (cycleId) {
        query = query.eq("appraisal_cycle_id", cycleId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setSessions((data || []).map(session => ({
        ...session,
        participants: Array.isArray(session.participants) ? session.participants : [],
        calibration_rules: session.calibration_rules as CalibrationSession['calibration_rules'],
        status: session.status as CalibrationSession['status'],
      })));
    } catch (err: any) {
      setError(err.message);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [companyId, cycleId]);

  return { sessions, isLoading, error, refetch: fetchSessions };
}
