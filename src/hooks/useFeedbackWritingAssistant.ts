import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WritingSuggestion {
  type: 'bias' | 'clarity' | 'specificity' | 'tone' | 'length' | 'behavioral';
  suggestion: string;
  explanation: string;
  severity: 'info' | 'warning' | 'error';
  originalPhrase?: string;
}

export interface QualityScores {
  clarity: number;
  specificity: number;
  biasRisk: number;
  behavioralFocus: number;
  overall: number;
}

export interface WritingAnalysisResult {
  suggestions: WritingSuggestion[];
  qualityScores: QualityScores;
  biasIndicators: string[];
}

interface UseWritingAssistantOptions {
  debounceMs?: number;
  minTextLength?: number;
}

export function useFeedbackWritingAssistant(options: UseWritingAssistantOptions = {}) {
  const { debounceMs = 1000, minTextLength = 20 } = options;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<WritingAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout>();
  const lastTextRef = useRef<string>('');

  const analyze = useCallback(async (
    text: string,
    questionContext?: string,
    raterCategory?: string
  ) => {
    if (text.length < minTextLength) {
      setResult(null);
      return;
    }

    // Skip if text hasn't changed
    if (text === lastTextRef.current) return;
    lastTextRef.current = text;

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('feedback-writing-assistant', {
        body: { text, questionContext, raterCategory }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      // Don't show toast for every debounced call failure
      console.error('Writing analysis error:', message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [minTextLength]);

  const analyzeDebounced = useCallback((
    text: string,
    questionContext?: string,
    raterCategory?: string
  ) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      analyze(text, questionContext, raterCategory);
    }, debounceMs);
  }, [analyze, debounceMs]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    lastTextRef.current = '';
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const acceptSuggestion = useCallback(async (
    responseId: string,
    suggestion: WritingSuggestion,
    originalText: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      await supabase.from('feedback_writing_suggestions').insert({
        response_id: responseId,
        rater_id: user.id,
        company_id: profile?.company_id,
        original_text: originalText,
        suggestion_type: suggestion.type,
        suggestion_text: suggestion.suggestion,
        explanation: suggestion.explanation,
        severity: suggestion.severity,
        was_accepted: true,
        accepted_at: new Date().toISOString()
      });

      toast.success('Suggestion applied');
    } catch (err) {
      console.error('Failed to log suggestion acceptance:', err);
    }
  }, []);

  const dismissSuggestion = useCallback(async (
    responseId: string,
    suggestion: WritingSuggestion,
    originalText: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      await supabase.from('feedback_writing_suggestions').insert({
        response_id: responseId,
        rater_id: user.id,
        company_id: profile?.company_id,
        original_text: originalText,
        suggestion_type: suggestion.type,
        suggestion_text: suggestion.suggestion,
        explanation: suggestion.explanation,
        severity: suggestion.severity,
        was_accepted: false,
        dismissed_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to log suggestion dismissal:', err);
    }
  }, []);

  return {
    isAnalyzing,
    result,
    error,
    analyze,
    analyzeDebounced,
    acceptSuggestion,
    dismissSuggestion,
    reset
  };
}
