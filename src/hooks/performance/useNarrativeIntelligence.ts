import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type NarrativeType = 
  | 'performance_summary' 
  | 'promotion_justification' 
  | 'development_narrative' 
  | 'calibration_notes' 
  | 'pip_rationale';

export interface GeneratedNarrative {
  id: string;
  narrativeType: NarrativeType;
  generatedContent: string;
  sourceData: {
    ratings: Array<{ type: string; score: number; comment?: string }>;
    evidence: Array<{ type: string; description: string }>;
    goals: Array<{ title: string; progress: number }>;
  };
  managerEditedContent?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  aiModelUsed: string;
  aiConfidenceScore: number;
  createdAt: string;
}

export interface NarrativeGenerationParams {
  employeeId: string;
  companyId: string;
  participantId?: string;
  cycleId?: string;
  narrativeType: NarrativeType;
  additionalContext?: string;
}

export function useNarrativeIntelligence() {
  const [generating, setGenerating] = useState(false);
  const [narrative, setNarrative] = useState<GeneratedNarrative | null>(null);

  const generateNarrative = useCallback(async (
    params: NarrativeGenerationParams
  ): Promise<GeneratedNarrative | null> => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('narrative-intelligence-generator', {
        body: {
          action: `generate_${params.narrativeType}`,
          ...params,
        },
      });

      if (error) {
        console.error('Error generating narrative:', error);
        return null;
      }

      const result = data as GeneratedNarrative;
      setNarrative(result);
      return result;
    } catch (err) {
      console.error('Failed to generate narrative:', err);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const generatePerformanceSummary = useCallback(async (
    employeeId: string,
    companyId: string,
    participantId: string
  ) => {
    return generateNarrative({
      employeeId,
      companyId,
      participantId,
      narrativeType: 'performance_summary',
    });
  }, [generateNarrative]);

  const generatePromotionJustification = useCallback(async (
    employeeId: string,
    companyId: string,
    additionalContext?: string
  ) => {
    return generateNarrative({
      employeeId,
      companyId,
      narrativeType: 'promotion_justification',
      additionalContext,
    });
  }, [generateNarrative]);

  const generateDevelopmentNarrative = useCallback(async (
    employeeId: string,
    companyId: string
  ) => {
    return generateNarrative({
      employeeId,
      companyId,
      narrativeType: 'development_narrative',
    });
  }, [generateNarrative]);

  const generateCalibrationNotes = useCallback(async (
    employeeId: string,
    companyId: string,
    cycleId: string
  ) => {
    return generateNarrative({
      employeeId,
      companyId,
      cycleId,
      narrativeType: 'calibration_notes',
    });
  }, [generateNarrative]);

  const generatePipRationale = useCallback(async (
    employeeId: string,
    companyId: string
  ) => {
    return generateNarrative({
      employeeId,
      companyId,
      narrativeType: 'pip_rationale',
    });
  }, [generateNarrative]);

  const saveEditedNarrative = useCallback(async (
    narrativeId: string,
    editedContent: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_generated_narratives')
        .update({ manager_edited_content: editedContent })
        .eq('id', narrativeId);

      if (error) {
        console.error('Error saving edited narrative:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to save edited narrative:', err);
      return false;
    }
  }, []);

  const approveNarrative = useCallback(async (
    narrativeId: string,
    approvedBy: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_generated_narratives')
        .update({ 
          is_approved: true,
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', narrativeId);

      if (error) {
        console.error('Error approving narrative:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to approve narrative:', err);
      return false;
    }
  }, []);

  const fetchNarrativeHistory = useCallback(async (
    employeeId: string,
    narrativeType?: NarrativeType
  ): Promise<GeneratedNarrative[]> => {
    try {
      let query = supabase
        .from('ai_generated_narratives')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (narrativeType) {
        query = query.eq('narrative_type', narrativeType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching narrative history:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        narrativeType: item.narrative_type as NarrativeType,
        generatedContent: item.generated_content,
        sourceData: item.source_data as GeneratedNarrative['sourceData'],
        managerEditedContent: item.manager_edited_content || undefined,
        isApproved: item.is_approved || false,
        approvedBy: item.approved_by || undefined,
        approvedAt: item.approved_at || undefined,
        aiModelUsed: item.ai_model_used || 'unknown',
        aiConfidenceScore: item.ai_confidence_score || 0,
        createdAt: item.created_at || '',
      }));
    } catch (err) {
      console.error('Failed to fetch narrative history:', err);
      return [];
    }
  }, []);

  return {
    generating,
    narrative,
    generateNarrative,
    generatePerformanceSummary,
    generatePromotionJustification,
    generateDevelopmentNarrative,
    generateCalibrationNotes,
    generatePipRationale,
    saveEditedNarrative,
    approveNarrative,
    fetchNarrativeHistory,
  };
}
