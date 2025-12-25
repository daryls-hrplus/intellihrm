import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SubMetricDefinition, EvidenceType, RollupMethod } from '@/types/goalEnhancements';
import { calculateCompositeProgress, type SubMetricValue } from '@/utils/goalCalculations';

export interface GoalSubMetricValue {
  id?: string;
  goalId: string;
  subMetricName: string;
  targetValue: number | null;
  currentValue: number;
  baselineValue: number | null;
  unitOfMeasure: string | null;
  weight: number;
  evidenceUrl: string | null;
  evidenceType: EvidenceType | null;
  evidenceNotes: string | null;
}

interface UseGoalSubMetricsReturn {
  subMetrics: GoalSubMetricValue[];
  loading: boolean;
  saving: boolean;
  compositeProgress: number;
  subMetricProgress: { name: string; progress: number; weight: number }[];
  initializeFromTemplate: (goalId: string, templateSubMetrics: SubMetricDefinition[]) => void;
  updateSubMetric: (index: number, updates: Partial<GoalSubMetricValue>) => void;
  saveSubMetrics: (goalId: string) => Promise<boolean>;
  loadSubMetrics: (goalId: string) => Promise<void>;
  calculateProgress: (rollupMethod?: RollupMethod) => void;
}

export function useGoalSubMetrics(): UseGoalSubMetricsReturn {
  const [subMetrics, setSubMetrics] = useState<GoalSubMetricValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compositeProgress, setCompositeProgress] = useState(0);
  const [subMetricProgress, setSubMetricProgress] = useState<{ name: string; progress: number; weight: number }[]>([]);

  const initializeFromTemplate = useCallback((goalId: string, templateSubMetrics: SubMetricDefinition[]) => {
    const initialized = templateSubMetrics.map((sm) => ({
      goalId,
      subMetricName: sm.name,
      targetValue: null,
      currentValue: 0,
      baselineValue: null,
      unitOfMeasure: sm.unitOfMeasure || null,
      weight: sm.weight,
      evidenceUrl: null,
      evidenceType: null,
      evidenceNotes: null,
    }));
    setSubMetrics(initialized);
  }, []);

  const updateSubMetric = useCallback((index: number, updates: Partial<GoalSubMetricValue>) => {
    setSubMetrics((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...updates };
      }
      return updated;
    });
  }, []);

  const calculateProgress = useCallback((rollupMethod: RollupMethod = 'weighted') => {
    const values: SubMetricValue[] = subMetrics
      .filter((sm) => sm.targetValue !== null && sm.targetValue > 0)
      .map((sm) => ({
        name: sm.subMetricName,
        targetValue: sm.targetValue || 0,
        currentValue: sm.currentValue,
        weight: sm.weight,
        baselineValue: sm.baselineValue || undefined,
      }));

    const result = calculateCompositeProgress(values, rollupMethod);
    setCompositeProgress(result.overallProgress);
    setSubMetricProgress(result.subMetricProgress);
  }, [subMetrics]);

  const loadSubMetrics = useCallback(async (goalId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goal_sub_metric_values')
        .select('*')
        .eq('goal_id', goalId)
        .order('weight', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const loaded = data.map((row) => ({
          id: row.id,
          goalId: row.goal_id,
          subMetricName: row.sub_metric_name,
          targetValue: row.target_value,
          currentValue: row.current_value || 0,
          baselineValue: row.baseline_value,
          unitOfMeasure: row.unit_of_measure,
          weight: row.weight,
          evidenceUrl: row.evidence_url,
          evidenceType: row.evidence_type as EvidenceType | null,
          evidenceNotes: row.evidence_notes,
        }));
        setSubMetrics(loaded);
      }
    } catch (err) {
      console.error('Failed to load sub-metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSubMetrics = useCallback(async (goalId: string): Promise<boolean> => {
    setSaving(true);
    try {
      // Upsert all sub-metrics
      for (const sm of subMetrics) {
        const payload = {
          goal_id: goalId,
          sub_metric_name: sm.subMetricName,
          target_value: sm.targetValue,
          current_value: sm.currentValue,
          baseline_value: sm.baselineValue,
          unit_of_measure: sm.unitOfMeasure,
          weight: sm.weight,
          evidence_url: sm.evidenceUrl,
          evidence_type: sm.evidenceType,
          evidence_notes: sm.evidenceNotes,
        };

        const { error } = await supabase
          .from('goal_sub_metric_values')
          .upsert(payload, { 
            onConflict: 'goal_id,sub_metric_name',
          });

        if (error) throw error;
      }

      return true;
    } catch (err) {
      console.error('Failed to save sub-metrics:', err);
      toast.error('Failed to save sub-metrics');
      return false;
    } finally {
      setSaving(false);
    }
  }, [subMetrics]);

  // Auto-calculate progress when sub-metrics change
  useEffect(() => {
    calculateProgress();
  }, [subMetrics, calculateProgress]);

  return {
    subMetrics,
    loading,
    saving,
    compositeProgress,
    subMetricProgress,
    initializeFromTemplate,
    updateSubMetric,
    saveSubMetrics,
    loadSubMetrics,
    calculateProgress,
  };
}
