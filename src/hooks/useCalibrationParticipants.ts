import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalibrationParticipant } from "@/types/calibration";

interface UseCalibrationParticipantsOptions {
  sessionId: string;
  companyId: string;
}

export function useCalibrationParticipants({ sessionId, companyId }: UseCalibrationParticipantsOptions) {
  const [participants, setParticipants] = useState<CalibrationParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    if (!sessionId) {
      setParticipants([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("calibration_participants")
        .select(`
          *,
          profiles(id, full_name, email, avatar_url)
        `)
        .eq("session_id", sessionId)
        .eq("is_active", true)
        .order("joined_at", { ascending: true });

      if (fetchError) throw fetchError;

      setParticipants((data || []).map(p => ({
        ...p,
        role: p.role as CalibrationParticipant['role'],
      })));
    } catch (err: any) {
      setError(err.message);
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const addParticipant = useCallback(async (
    userId: string, 
    role: 'facilitator' | 'reviewer' | 'observer' = 'reviewer'
  ) => {
    if (!sessionId || !companyId) {
      return { data: null, error: "Missing session or company ID" };
    }

    try {
      const { data, error } = await supabase
        .from("calibration_participants")
        .insert({
          session_id: sessionId,
          user_id: userId,
          role,
          company_id: companyId,
          is_active: true,
        })
        .select(`
          *,
          profiles(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      setParticipants(prev => [...prev, {
        ...data,
        role: data.role as CalibrationParticipant['role'],
      }]);

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }, [sessionId, companyId]);

  const removeParticipant = useCallback(async (participantId: string) => {
    try {
      const { error } = await supabase
        .from("calibration_participants")
        .update({ is_active: false })
        .eq("id", participantId);

      if (error) throw error;

      setParticipants(prev => prev.filter(p => p.id !== participantId));

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateParticipantRole = useCallback(async (
    participantId: string, 
    newRole: 'facilitator' | 'reviewer' | 'observer'
  ) => {
    try {
      const { data, error } = await supabase
        .from("calibration_participants")
        .update({ role: newRole })
        .eq("id", participantId)
        .select()
        .single();

      if (error) throw error;

      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { ...p, role: newRole }
          : p
      ));

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return {
    participants,
    isLoading,
    error,
    addParticipant,
    removeParticipant,
    updateParticipantRole,
    refetch: fetchParticipants,
    facilitator: participants.find(p => p.role === 'facilitator'),
    reviewers: participants.filter(p => p.role === 'reviewer'),
    observers: participants.filter(p => p.role === 'observer'),
  };
}
