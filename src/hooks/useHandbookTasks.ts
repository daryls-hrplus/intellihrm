import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PHASE_STEP_MAPPINGS } from "@/data/implementationMappings";
import type { 
  ImplementationTask, 
  StepMapping, 
  PhaseStats, 
  DataSourceType
} from "@/types/implementation";

// Re-export for backward compatibility
export type HandbookTask = ImplementationTask;

/**
 * Hook to fetch handbook tasks from database (Database-First SSOT)
 * Falls back to hardcoded PHASE_STEP_MAPPINGS during migration
 */
export function useHandbookTasks(phaseId?: string) {
  const [tasks, setTasks] = useState<ImplementationTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDatabase, setIsUsingDatabase] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallbackToHardcoded = useCallback(() => {
    const convertedTasks: ImplementationTask[] = [];
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
    setError(null);
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

      if (dbError) {
        console.warn("Database error, falling back to hardcoded:", dbError);
        setError(dbError.message);
        fallbackToHardcoded();
        return;
      }
      
      if (!data || data.length === 0) {
        console.warn("No database tasks found, falling back to hardcoded");
        fallbackToHardcoded();
        return;
      }

      setTasks(data as ImplementationTask[]);
      setIsUsingDatabase(true);
    } catch (e) {
      console.warn("Exception fetching tasks, falling back to hardcoded:", e);
      fallbackToHardcoded();
    } finally {
      setIsLoading(false);
    }
  }, [phaseId, fallbackToHardcoded]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const tasksByPhase = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.phase_id]) acc[task.phase_id] = [];
      acc[task.phase_id].push(task);
      return acc;
    }, {} as Record<string, ImplementationTask[]>);
  }, [tasks]);

  // Data source indicator
  const dataSource: DataSourceType = isUsingDatabase ? 'database' : 'legacy';

  return { 
    tasks, 
    tasksByPhase, 
    isLoading, 
    isUsingDatabase, 
    dataSource,
    error, 
    refetch: fetchTasks 
  };
}

/**
 * Hook to get a single implementation task by phase and step order
 */
export function useImplementationTask(phaseId: string, stepOrder: number) {
  const { tasks, isLoading, isUsingDatabase, dataSource } = useHandbookTasks(phaseId);
  
  const task = useMemo(() => {
    return tasks.find(t => t.step_order === stepOrder) || null;
  }, [tasks, stepOrder]);

  return { task, isLoading, isUsingDatabase, dataSource };
}

/**
 * Hook to get phase statistics from implementation tasks
 */
export function useImplementationTaskStats(phaseId?: string) {
  const { tasks, isLoading, isUsingDatabase, dataSource } = useHandbookTasks(phaseId);

  const stats = useMemo((): PhaseStats => {
    const filteredTasks = phaseId 
      ? tasks.filter(t => t.phase_id === phaseId) 
      : tasks;

    return {
      totalTasks: filteredTasks.length,
      requiredTasks: filteredTasks.filter(t => t.is_required).length,
      estimatedMinutes: filteredTasks.reduce((sum, t) => sum + t.estimated_minutes, 0),
      importableTasks: filteredTasks.filter(t => t.import_type).length,
      globalTasks: filteredTasks.filter(t => t.is_global).length,
      companyTasks: filteredTasks.filter(t => !t.is_global).length,
      tasksWithFeatureCode: filteredTasks.filter(t => t.feature_code).length,
      tasksWithLegacyRoute: filteredTasks.filter(t => !t.feature_code && t.admin_route).length,
    };
  }, [tasks, phaseId]);

  /**
   * Get estimated time for a specific phase (in minutes)
   */
  const getPhaseEstimatedTime = useCallback((targetPhaseId: string): number => {
    return tasks
      .filter(t => t.phase_id === targetPhaseId)
      .reduce((sum, t) => sum + t.estimated_minutes, 0);
  }, [tasks]);

  /**
   * Get count of required steps for a phase
   */
  const getRequiredStepsCount = useCallback((targetPhaseId: string): number => {
    return tasks
      .filter(t => t.phase_id === targetPhaseId && t.is_required)
      .length;
  }, [tasks]);

  /**
   * Get importable steps for a phase
   */
  const getImportableSteps = useCallback((targetPhaseId: string): ImplementationTask[] => {
    return tasks.filter(t => t.phase_id === targetPhaseId && t.import_type);
  }, [tasks]);

  /**
   * Get step mapping by phase and order (for backward compatibility)
   */
  const getStepMapping = useCallback((targetPhaseId: string, stepOrder: number): StepMapping | undefined => {
    const task = tasks.find(t => t.phase_id === targetPhaseId && t.step_order === stepOrder);
    if (!task) return undefined;
    
    // Convert database task back to legacy StepMapping format
    return {
      order: task.step_order,
      area: task.area,
      adminRoute: task.admin_route || undefined,
      importType: task.import_type || undefined,
      isRequired: task.is_required,
      estimatedMinutes: task.estimated_minutes,
      subSection: task.sub_section || undefined,
      sourceManual: task.source_manual as StepMapping['sourceManual'],
      sourceSection: task.source_section || undefined,
      isGlobal: task.is_global,
    };
  }, [tasks]);

  return { 
    stats, 
    isLoading, 
    isUsingDatabase, 
    dataSource,
    getPhaseEstimatedTime,
    getRequiredStepsCount,
    getImportableSteps,
    getStepMapping
  };
}
