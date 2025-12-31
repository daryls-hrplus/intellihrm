import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type BiasType = 
  | 'recency_bias' 
  | 'leniency_bias' 
  | 'severity_bias' 
  | 'halo_effect' 
  | 'horn_effect' 
  | 'central_tendency' 
  | 'contrast_effect';

export interface BiasPattern {
  id: string;
  managerId: string;
  biasType: BiasType;
  severity: 'low' | 'medium' | 'high';
  evidenceCount: number;
  affectedEmployees: Array<{ employeeId: string; impactDescription: string }>;
  nudgeMessage: string;
  detectionConfidence: number;
  createdAt: string;
}

export interface BiasNudge {
  id: string;
  biasType: BiasType;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  suggestedAction: string;
  learnMoreUrl?: string;
}

export interface ManagerBiasAnalysis {
  managerId: string;
  patterns: BiasPattern[];
  overallBiasScore: number;
  nudges: BiasNudge[];
  recommendations: string[];
}

export function useEnhancedBiasDetector() {
  const [analyzing, setAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState<BiasPattern[]>([]);

  const analyzeManagerBias = useCallback(async (
    managerId: string,
    companyId: string,
    cycleId?: string
  ): Promise<ManagerBiasAnalysis | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bias-detector', {
        body: {
          action: 'analyze_manager_bias',
          managerId,
          companyId,
          cycleId,
        },
      });

      if (error) {
        console.error('Error analyzing manager bias:', error);
        return null;
      }

      const result = data as ManagerBiasAnalysis;
      setPatterns(result.patterns);
      return result;
    } catch (err) {
      console.error('Failed to analyze manager bias:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const detectRecencyBias = useCallback(async (
    managerId: string,
    companyId: string,
    cycleId: string
  ): Promise<BiasPattern | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bias-detector', {
        body: {
          action: 'detect_recency_bias',
          managerId,
          companyId,
          cycleId,
        },
      });

      if (error) {
        console.error('Error detecting recency bias:', error);
        return null;
      }

      return data.pattern as BiasPattern;
    } catch (err) {
      console.error('Failed to detect recency bias:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const detectLeniencySeverityBias = useCallback(async (
    managerId: string,
    companyId: string
  ): Promise<BiasPattern[] | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bias-detector', {
        body: {
          action: 'detect_leniency_severity',
          managerId,
          companyId,
        },
      });

      if (error) {
        console.error('Error detecting leniency/severity bias:', error);
        return null;
      }

      return data.patterns as BiasPattern[];
    } catch (err) {
      console.error('Failed to detect leniency/severity bias:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const detectHaloHornEffect = useCallback(async (
    managerId: string,
    companyId: string,
    participantId: string
  ): Promise<BiasPattern | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bias-detector', {
        body: {
          action: 'detect_halo_horn',
          managerId,
          companyId,
          participantId,
        },
      });

      if (error) {
        console.error('Error detecting halo/horn effect:', error);
        return null;
      }

      return data.pattern as BiasPattern;
    } catch (err) {
      console.error('Failed to detect halo/horn effect:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const detectCentralTendency = useCallback(async (
    managerId: string,
    companyId: string
  ): Promise<BiasPattern | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bias-detector', {
        body: {
          action: 'detect_central_tendency',
          managerId,
          companyId,
        },
      });

      if (error) {
        console.error('Error detecting central tendency:', error);
        return null;
      }

      return data.pattern as BiasPattern;
    } catch (err) {
      console.error('Failed to detect central tendency:', err);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const acknowledgeNudge = useCallback(async (
    patternId: string,
    acknowledged: boolean
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('manager_bias_patterns')
        .update({ 
          nudge_acknowledged: acknowledged,
          nudge_shown_at: new Date().toISOString()
        })
        .eq('id', patternId);

      if (error) {
        console.error('Error acknowledging nudge:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to acknowledge nudge:', err);
      return false;
    }
  }, []);

  const disputePattern = useCallback(async (
    patternId: string,
    disputeReason: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('manager_bias_patterns')
        .update({ 
          dispute_reason: disputeReason,
          disputed_at: new Date().toISOString()
        })
        .eq('id', patternId);

      if (error) {
        console.error('Error disputing pattern:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to dispute pattern:', err);
      return false;
    }
  }, []);

  return {
    analyzing,
    patterns,
    analyzeManagerBias,
    detectRecencyBias,
    detectLeniencySeverityBias,
    detectHaloHornEffect,
    detectCentralTendency,
    acknowledgeNudge,
    disputePattern,
  };
}
