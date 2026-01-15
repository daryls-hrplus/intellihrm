import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PHASE_STEP_MAPPINGS, StepMapping } from "@/data/implementationMappings";

export interface HandbookTask {
  id: string;
  phase_id: string;
  step_order: number;
  area: string;
  description: string | null;
  feature_code: string | null;
  admin_route: string | null;
  import_type: string | null;
  is_required: boolean;
  estimated_minutes: number;
  sub_section: string | null;
  source_manual: string | null;
  source_section: string | null;
  is_global: boolean;
  display_order: number | null;
  is_active: boolean;
}

/**
 * Hook to fetch handbook tasks from database (Database-First SSOT)
 * Falls back to hardcoded PHASE_STEP_MAPPINGS during migration
 */
export function useHandbookTasks(phaseId?: string) {
  const [tasks, setTasks] = useState<HandbookTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDatabase, setIsUsingDatabase] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallbackToHardcoded = useCallback(() => {
    const convertedTasks: HandbookTask[] = [];
    const phasesToProcess = phaseId 
      ? { [phaseId]: PHASE_STEP_MAPPINGS[phaseId] }
      : PHASE_STEP_MAPPINGS;

    Object.entries(phasesToProcess).forEach(([phase, mappings]) => {
      if (!mappings) return;
      mappings.forEach((mapping: StepMapping, index: number) => {
        convertedTasks.push({
          id: `legacy-${phase}-${mapping.order}`,
          phase_id: phase,
          step_order: mapping.order,
          area: mapping.area,
          description: null,
          feature_code: null,
          admin_route: mapping.adminRoute || null,
          import_type: mapping.importType || null,
          is_required: mapping.isRequired || false,
          estimated_minutes: mapping.estimatedMinutes || 15,
          sub_section: mapping.subSection || null,
          source_manual: mapping.sourceManual || null,
          source_section: mapping.sourceSection || null,
          is_global: mapping.isGlobal || false,
          display_order: index,
          is_active: true
        });
      });
    });
    setTasks(convertedTasks);
    setIsUsingDatabase(false);
  }, [phaseId]);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("implementation_tasks")
        .select("*")
        .eq("is_active", true)
        .order("step_order", { ascending: true });

      if (phaseId) {
        query = query.eq("phase_id", phaseId);
      }

      const { data, error: dbError } = await query;

      if (dbError || !data || data.length === 0) {
        fallbackToHardcoded();
        return;
      }

      setTasks(data as HandbookTask[]);
      setIsUsingDatabase(true);
    } catch {
      fallbackToHardcoded();
    } finally {
      setIsLoading(false);
    }
  }, [phaseId, fallbackToHardcoded]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const tasksByPhase = tasks.reduce((acc, task) => {
    if (!acc[task.phase_id]) acc[task.phase_id] = [];
    acc[task.phase_id].push(task);
    return acc;
  }, {} as Record<string, HandbookTask[]>);

  return { tasks, tasksByPhase, isLoading, isUsingDatabase, error, refetch: fetchTasks };
}
