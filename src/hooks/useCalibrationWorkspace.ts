import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  CalibrationSession, 
  CalibrationEmployee, 
  CalibrationAIAnalysis,
  getBoxPosition,
  NineBoxPosition 
} from "@/types/calibration";

interface UseCalibrationWorkspaceOptions {
  sessionId: string;
  companyId: string;
}

export function useCalibrationWorkspace({ sessionId, companyId }: UseCalibrationWorkspaceOptions) {
  const [session, setSession] = useState<CalibrationSession | null>(null);
  const [employees, setEmployees] = useState<CalibrationEmployee[]>([]);
  const [analysis, setAnalysis] = useState<CalibrationAIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAdjustments, setPendingAdjustments] = useState<Map<string, Partial<CalibrationEmployee>>>(new Map());

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from("calibration_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      
      setSession({
        ...data,
        participants: Array.isArray(data.participants) ? data.participants : [],
        calibration_rules: data.calibration_rules as CalibrationSession['calibration_rules'],
        status: data.status as CalibrationSession['status'],
      });
    } catch (err: any) {
      console.error("Error fetching session:", err);
      setError(err.message);
    }
  }, [sessionId]);

  const fetchEmployees = useCallback(async () => {
    if (!companyId || !session) return;

    try {
      const cycleId = session.appraisal_cycle_id;
      
      // Fetch goal rating submissions with employee details
      const { data: submissions, error } = await supabase
        .from("goal_rating_submissions")
        .select(`
          *,
          performance_goals!inner(
            id, title, employee_id, weighting,
            profiles!performance_goals_employee_id_fkey(
              id, full_name, avatar_url, department_id,
              departments(name)
            )
          )
        `)
        .eq("company_id", companyId);

      if (error) throw error;

      // Group by employee and calculate averages
      const employeeMap = new Map<string, CalibrationEmployee>();

      for (const submission of submissions || []) {
        const goal = submission.performance_goals;
        const profile = goal?.profiles;
        
        if (!profile) continue;

        const existing = employeeMap.get(profile.id);
        
        const selfRating = submission.self_rating || 0;
        const managerRating = submission.manager_rating || 0;
        const finalScore = submission.final_score || 0;

        if (existing) {
          // Update averages
          const count = (existing as any)._count + 1;
          existing.selfRating = (existing.selfRating * ((existing as any)._count) + selfRating) / count;
          existing.managerRating = (existing.managerRating * ((existing as any)._count) + managerRating) / count;
          existing.currentScore = (existing.currentScore * ((existing as any)._count) + finalScore) / count;
          (existing as any)._count = count;
        } else {
          employeeMap.set(profile.id, {
            id: profile.id,
            employeeId: profile.id,
            employeeName: profile.full_name || 'Unknown',
            department: profile.departments?.name || 'Unknown',
            avatarUrl: profile.avatar_url,
            currentScore: finalScore,
            originalScore: finalScore,
            selfRating,
            managerRating,
            boxPosition: getBoxPosition(finalScore, (selfRating + managerRating) / 2),
            hasAnomalies: Math.abs(selfRating - managerRating) > 1.5,
            anomalyType: Math.abs(selfRating - managerRating) > 1.5 ? 'rating_gap' : undefined,
            _count: 1,
          } as CalibrationEmployee & { _count: number });
        }
      }

      // Remove internal _count and set box positions
      const employeeList = Array.from(employeeMap.values()).map(emp => {
        const { _count, ...employee } = emp as any;
        employee.boxPosition = getBoxPosition(employee.currentScore, (employee.selfRating + employee.managerRating) / 2);
        return employee;
      });

      setEmployees(employeeList);
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      setError(err.message);
    }
  }, [companyId, session]);

  const fetchAnalysis = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from("calibration_ai_analyses")
        .select("*")
        .eq("session_id", sessionId)
        .order("analyzed_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAnalysis(data[0] as unknown as CalibrationAIAnalysis);
      }
    } catch (err: any) {
      console.error("Error fetching analysis:", err);
    }
  }, [sessionId]);

  const runAIAnalysis = useCallback(async () => {
    if (!sessionId || !companyId) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("calibration-ai-analyzer", {
        body: { sessionId, companyId, cycleId: session?.appraisal_cycle_id },
      });

      if (error) throw error;
      
      // Refresh analysis after running
      await fetchAnalysis();
      
      return data;
    } catch (err: any) {
      console.error("Error running AI analysis:", err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, companyId, session?.appraisal_cycle_id, fetchAnalysis]);

  const updateEmployeePosition = useCallback((employeeId: string, newPosition: NineBoxPosition) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.employeeId === employeeId) {
        return { ...emp, boxPosition: newPosition };
      }
      return emp;
    }));

    setPendingAdjustments(prev => {
      const updated = new Map(prev);
      const existing = updated.get(employeeId) || {};
      updated.set(employeeId, { ...existing, boxPosition: newPosition });
      return updated;
    });
  }, []);

  const updateEmployeeScore = useCallback((employeeId: string, newScore: number) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.employeeId === employeeId) {
        const newPosition = getBoxPosition(newScore, (emp.selfRating + emp.managerRating) / 2);
        return { ...emp, currentScore: newScore, boxPosition: newPosition };
      }
      return emp;
    }));

    setPendingAdjustments(prev => {
      const updated = new Map(prev);
      const existing = updated.get(employeeId) || {};
      updated.set(employeeId, { ...existing, currentScore: newScore });
      return updated;
    });
  }, []);

  const saveAdjustments = useCallback(async (adjustedBy: string, reason: string) => {
    if (pendingAdjustments.size === 0) return;

    try {
      const adjustments = [];
      
      for (const [employeeId, changes] of pendingAdjustments) {
        const original = employees.find(e => e.employeeId === employeeId);
        if (!original) continue;

        adjustments.push({
          session_id: sessionId,
          employee_id: employeeId,
          original_score: original.originalScore,
          calibrated_score: changes.currentScore || original.currentScore,
          original_box_position: original.boxPosition,
          calibrated_box_position: changes.boxPosition || original.boxPosition,
          adjustment_reason: reason,
          adjusted_by: adjustedBy,
          status: 'pending',
          company_id: companyId,
        });
      }

      const { error } = await supabase
        .from("calibration_adjustments")
        .insert(adjustments);

      if (error) throw error;

      // Clear pending adjustments
      setPendingAdjustments(new Map());
      
      return { success: true };
    } catch (err: any) {
      console.error("Error saving adjustments:", err);
      return { success: false, error: err.message };
    }
  }, [pendingAdjustments, employees, sessionId, companyId]);

  const discardChanges = useCallback(() => {
    setPendingAdjustments(new Map());
    // Reload employees to reset to original state
    fetchEmployees();
  }, [fetchEmployees]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchSession().finally(() => setIsLoading(false));
  }, [fetchSession]);

  // Load employees after session is loaded
  useEffect(() => {
    if (session) {
      fetchEmployees();
      fetchAnalysis();
    }
  }, [session, fetchEmployees, fetchAnalysis]);

  return {
    session,
    employees,
    analysis,
    isLoading,
    isAnalyzing,
    error,
    pendingAdjustments,
    hasPendingChanges: pendingAdjustments.size > 0,
    runAIAnalysis,
    updateEmployeePosition,
    updateEmployeeScore,
    saveAdjustments,
    discardChanges,
    refetch: () => {
      fetchSession();
      fetchEmployees();
      fetchAnalysis();
    },
  };
}
