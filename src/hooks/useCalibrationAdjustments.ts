import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalibrationAdjustment } from "@/types/calibration";

interface UseCalibrationAdjustmentsOptions {
  sessionId: string;
}

export function useCalibrationAdjustments({ sessionId }: UseCalibrationAdjustmentsOptions) {
  const [adjustments, setAdjustments] = useState<CalibrationAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdjustments = useCallback(async () => {
    if (!sessionId) {
      setAdjustments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("calibration_adjustments")
        .select(`
          *,
          profiles!calibration_adjustments_employee_id_fkey(
            id, full_name, department_id,
            departments(name)
          ),
          adjuster:profiles!calibration_adjustments_adjusted_by_fkey(full_name)
        `)
        .eq("session_id", sessionId)
        .order("adjusted_at", { ascending: false });

      if (fetchError) throw fetchError;

      setAdjustments((data || []).map(adj => ({
        ...adj,
        status: adj.status as CalibrationAdjustment['status'],
      })));
    } catch (err: any) {
      setError(err.message);
      setAdjustments([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const createAdjustment = useCallback(async (adjustment: Partial<CalibrationAdjustment>) => {
    try {
      const { data, error } = await supabase
        .from("calibration_adjustments")
        .insert(adjustment as any)
        .select()
        .single();

      if (error) throw error;

      setAdjustments(prev => [data as CalibrationAdjustment, ...prev]);

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }, []);

  const applyAdjustment = useCallback(async (adjustmentId: string) => {
    try {
      const { data, error } = await supabase
        .from("calibration_adjustments")
        .update({ 
          status: 'applied',
          applied_at: new Date().toISOString(),
        })
        .eq("id", adjustmentId)
        .select()
        .single();

      if (error) throw error;

      setAdjustments(prev => prev.map(adj => 
        adj.id === adjustmentId 
          ? { ...adj, status: 'applied' as const, applied_at: new Date().toISOString() }
          : adj
      ));

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }, []);

  const revertAdjustment = useCallback(async (adjustmentId: string, revertedBy: string) => {
    try {
      const { data, error } = await supabase
        .from("calibration_adjustments")
        .update({ 
          status: 'reverted',
          reverted_at: new Date().toISOString(),
          reverted_by: revertedBy,
        })
        .eq("id", adjustmentId)
        .select()
        .single();

      if (error) throw error;

      setAdjustments(prev => prev.map(adj => 
        adj.id === adjustmentId 
          ? { ...adj, status: 'reverted' as const, reverted_at: new Date().toISOString(), reverted_by: revertedBy }
          : adj
      ));

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }, []);

  const applyAllPending = useCallback(async () => {
    const pending = adjustments.filter(a => a.status === 'pending');
    
    try {
      const { error } = await supabase
        .from("calibration_adjustments")
        .update({ 
          status: 'applied',
          applied_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
        .eq("status", 'pending');

      if (error) throw error;

      setAdjustments(prev => prev.map(adj => 
        adj.status === 'pending' 
          ? { ...adj, status: 'applied' as const, applied_at: new Date().toISOString() }
          : adj
      ));

      return { success: true, count: pending.length, error: null };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message };
    }
  }, [adjustments, sessionId]);

  const getAdjustmentsByEmployee = useCallback((employeeId: string) => {
    return adjustments.filter(a => a.employee_id === employeeId);
  }, [adjustments]);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const pendingCount = adjustments.filter(a => a.status === 'pending').length;
  const appliedCount = adjustments.filter(a => a.status === 'applied').length;
  const revertedCount = adjustments.filter(a => a.status === 'reverted').length;

  return {
    adjustments,
    isLoading,
    error,
    createAdjustment,
    applyAdjustment,
    revertAdjustment,
    applyAllPending,
    getAdjustmentsByEmployee,
    refetch: fetchAdjustments,
    stats: {
      total: adjustments.length,
      pending: pendingCount,
      applied: appliedCount,
      reverted: revertedCount,
    },
  };
}
