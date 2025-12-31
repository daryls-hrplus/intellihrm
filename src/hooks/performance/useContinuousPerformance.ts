import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SignalType = 'goal_progress' | 'feedback' | 'training' | 'recognition' | 'check_in';
export type MomentumType = 'accelerating' | 'stable' | 'decelerating';
export type TrendDirection = 'improving' | 'stable' | 'declining';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PerformanceSignal {
  id: string;
  employeeId: string;
  signalType: SignalType;
  signalValue: number;
  signalSentiment: 'positive' | 'neutral' | 'negative';
  signalWeight: number;
  capturedAt: string;
}

export interface ContributingFactor {
  signalType: SignalType;
  contribution: number;
  recentEvents: Array<{ description: string; impact: number; date: string }>;
}

export interface TrajectoryScore {
  id: string;
  employeeId: string;
  trajectoryScore: number;
  momentum: MomentumType;
  trendDirection: TrendDirection;
  contributingFactors: ContributingFactor[];
  riskLevel: RiskLevel;
  interventionRecommended: boolean;
  interventionType?: string;
  calculatedAt: string;
}

export interface InterventionPrompt {
  id: string;
  managerId: string;
  employeeId: string;
  employeeName?: string;
  promptType: 'coaching' | 'recognition' | 'check_in' | 'concern';
  promptTitle: string;
  promptMessage: string;
  suggestedActions: Array<{ action: string; priority: number }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isDismissed: boolean;
  isActioned: boolean;
  actionTaken?: string;
  createdAt: string;
}

export function useContinuousPerformance() {
  const [loading, setLoading] = useState(false);
  const [trajectoryScore, setTrajectoryScore] = useState<TrajectoryScore | null>(null);
  const [signals, setSignals] = useState<PerformanceSignal[]>([]);
  const [interventionPrompts, setInterventionPrompts] = useState<InterventionPrompt[]>([]);

  const calculateTrajectory = useCallback(async (
    employeeId: string,
    companyId: string
  ): Promise<TrajectoryScore | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('continuous-performance-aggregator', {
        body: {
          action: 'calculate_trajectory',
          employeeId,
          companyId,
        },
      });

      if (error) {
        console.error('Error calculating trajectory:', error);
        return null;
      }

      const result = data as TrajectoryScore;
      setTrajectoryScore(result);
      return result;
    } catch (err) {
      console.error('Failed to calculate trajectory:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const aggregateSignals = useCallback(async (
    employeeId: string,
    companyId: string
  ): Promise<PerformanceSignal[] | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('continuous-performance-aggregator', {
        body: {
          action: 'aggregate_signals',
          employeeId,
          companyId,
        },
      });

      if (error) {
        console.error('Error aggregating signals:', error);
        return null;
      }

      const result = data.signals as PerformanceSignal[];
      setSignals(result);
      return result;
    } catch (err) {
      console.error('Failed to aggregate signals:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateInterventionPrompts = useCallback(async (
    managerId: string,
    companyId: string
  ): Promise<InterventionPrompt[] | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('continuous-performance-aggregator', {
        body: {
          action: 'generate_intervention_prompts',
          managerId,
          companyId,
        },
      });

      if (error) {
        console.error('Error generating intervention prompts:', error);
        return null;
      }

      const result = data.prompts as InterventionPrompt[];
      setInterventionPrompts(result);
      return result;
    } catch (err) {
      console.error('Failed to generate intervention prompts:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrajectoryScore = useCallback(async (
    employeeId: string
  ): Promise<TrajectoryScore | null> => {
    try {
      const { data, error } = await supabase
        .from('performance_trajectory_scores')
        .select('*')
        .eq('employee_id', employeeId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching trajectory score:', error);
        return null;
      }

      const result: TrajectoryScore = {
        id: data.id,
        employeeId: data.employee_id,
        trajectoryScore: data.trajectory_score,
        momentum: data.momentum as MomentumType,
        trendDirection: data.trend_direction as TrendDirection,
        contributingFactors: (data.contributing_factors as unknown as ContributingFactor[]) || [],
        riskLevel: data.risk_level as RiskLevel,
        interventionRecommended: data.intervention_recommended || false,
        interventionType: data.intervention_type || undefined,
        calculatedAt: data.calculated_at,
      };

      setTrajectoryScore(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch trajectory score:', err);
      return null;
    }
  }, []);

  const fetchInterventionPrompts = useCallback(async (
    managerId: string
  ): Promise<InterventionPrompt[]> => {
    try {
      const { data, error } = await supabase
        .from('manager_intervention_prompts')
        .select('*')
        .eq('manager_id', managerId)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching intervention prompts:', error);
        return [];
      }

      const result: InterventionPrompt[] = (data || []).map(item => ({
        id: item.id,
        managerId: item.manager_id,
        employeeId: item.employee_id,
        employeeName: undefined,
        promptType: item.prompt_type as InterventionPrompt['promptType'],
        promptTitle: item.prompt_title,
        promptMessage: item.prompt_message,
        suggestedActions: item.suggested_actions as InterventionPrompt['suggestedActions'],
        priority: item.priority as InterventionPrompt['priority'],
        isDismissed: item.is_dismissed || false,
        isActioned: item.is_actioned || false,
        actionTaken: item.action_taken || undefined,
        createdAt: item.created_at,
      }));

      setInterventionPrompts(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch intervention prompts:', err);
      return [];
    }
  }, []);

  const dismissPrompt = useCallback(async (promptId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('manager_intervention_prompts')
        .update({ is_dismissed: true })
        .eq('id', promptId);

      if (error) {
        console.error('Error dismissing prompt:', error);
        return false;
      }

      setInterventionPrompts(prev => prev.filter(p => p.id !== promptId));
      return true;
    } catch (err) {
      console.error('Failed to dismiss prompt:', err);
      return false;
    }
  }, []);

  const markPromptActioned = useCallback(async (
    promptId: string,
    actionTaken: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('manager_intervention_prompts')
        .update({ 
          is_actioned: true,
          action_taken: actionTaken
        })
        .eq('id', promptId);

      if (error) {
        console.error('Error marking prompt actioned:', error);
        return false;
      }

      setInterventionPrompts(prev => 
        prev.map(p => p.id === promptId ? { ...p, isActioned: true, actionTaken } : p)
      );
      return true;
    } catch (err) {
      console.error('Failed to mark prompt actioned:', err);
      return false;
    }
  }, []);

  return {
    loading,
    trajectoryScore,
    signals,
    interventionPrompts,
    calculateTrajectory,
    aggregateSignals,
    generateInterventionPrompts,
    fetchTrajectoryScore,
    fetchInterventionPrompts,
    dismissPrompt,
    markPromptActioned,
  };
}
