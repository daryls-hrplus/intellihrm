import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AISuggestedRule {
  rule_name: string;
  rule_code: string;
  description: string;
  condition_type: "rating_category" | "score_below" | "score_above" | "repeated_low";
  rating_level_codes: string[];
  condition_section: "overall" | "goals" | "competencies" | "responsibilities";
  action_type: string;
  action_is_mandatory: boolean;
  action_priority: number;
  action_message: string;
  reasoning: string;
  industry_context: string;
}

interface RatingLevel {
  id: string;
  code: string;
  name: string;
  min_score: number;
  max_score: number;
  requires_pip?: boolean;
  succession_eligible?: boolean;
  promotion_eligible?: boolean;
  bonus_eligible?: boolean;
}

interface ExistingRule {
  rule_code: string;
  action_type: string;
  rating_level_codes?: string[];
}

export function useActionRuleAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestedRule[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = async (
    ratingLevels: RatingLevel[],
    existingRules: ExistingRule[],
    focusArea?: string
  ): Promise<AISuggestedRule[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("action-rule-ai-suggester", {
        body: {
          ratingLevels,
          existingRules,
          focusArea,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to get AI suggestions");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const suggestionList = data?.suggestions || [];
      setSuggestions(suggestionList);
      return suggestionList;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get AI suggestions";
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setError(null);
  };

  return {
    isLoading,
    suggestions,
    error,
    getSuggestions,
    clearSuggestions,
  };
}
