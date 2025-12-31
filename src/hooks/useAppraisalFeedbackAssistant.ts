import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ActionType = 
  | 'generate_strength_statements'
  | 'generate_development_suggestions'
  | 'improve_comment'
  | 'detect_bias'
  | 'suggest_evidence'
  | 'generate_summary';

export interface Suggestion {
  type: 'strength' | 'development' | 'improvement' | 'summary';
  original?: string;
  suggested: string;
  reasoning: string;
  confidence: number;
}

export interface FeedbackAssistantResponse {
  suggestions: Suggestion[];
  biasFlags?: string[];
  evidenceRecommendations?: string[];
}

export interface FeedbackContext {
  scores?: {
    goals?: number;
    competencies?: number;
    responsibilities?: number;
    values?: number;
    overall?: number;
  };
  existingComments?: string;
  evidenceSummary?: {
    totalEvidence: number;
    validatedEvidence: number;
    evidenceTypes: string[];
  };
  componentType?: string;
  componentName?: string;
}

export function useAppraisalFeedbackAssistant() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<FeedbackAssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callAssistant = async (
    action: ActionType,
    employeeId: string,
    cycleId: string,
    context?: FeedbackContext,
    participantId?: string
  ): Promise<FeedbackAssistantResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('appraisal-feedback-assistant', {
        body: {
          action,
          employeeId,
          cycleId,
          participantId,
          context
        }
      });

      if (fnError) throw fnError;

      setResponse(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get AI suggestions';
      setError(message);
      toast.error('AI Assistant Error', { description: message });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateStrengths = (employeeId: string, cycleId: string, context?: FeedbackContext) =>
    callAssistant('generate_strength_statements', employeeId, cycleId, context);

  const generateDevelopment = (employeeId: string, cycleId: string, context?: FeedbackContext) =>
    callAssistant('generate_development_suggestions', employeeId, cycleId, context);

  const improveComment = (employeeId: string, cycleId: string, comment: string, componentType?: string, componentName?: string) =>
    callAssistant('improve_comment', employeeId, cycleId, { 
      existingComments: comment,
      componentType,
      componentName
    });

  const detectBias = (employeeId: string, cycleId: string, comment: string) =>
    callAssistant('detect_bias', employeeId, cycleId, { existingComments: comment });

  const suggestEvidence = (employeeId: string, cycleId: string, context?: FeedbackContext) =>
    callAssistant('suggest_evidence', employeeId, cycleId, context);

  const generateSummary = (employeeId: string, cycleId: string, participantId?: string) =>
    callAssistant('generate_summary', employeeId, cycleId, undefined, participantId);

  const reset = () => {
    setResponse(null);
    setError(null);
  };

  return {
    loading,
    response,
    error,
    generateStrengths,
    generateDevelopment,
    improveComment,
    detectBias,
    suggestEvidence,
    generateSummary,
    reset
  };
}
