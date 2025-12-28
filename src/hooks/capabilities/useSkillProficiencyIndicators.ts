import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SkillProficiencyIndicators {
  [level: string]: string[];
}

interface UseSkillProficiencyIndicatorsResult {
  indicators: SkillProficiencyIndicators | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch skill-specific proficiency indicators from the database
 */
export function useSkillProficiencyIndicators(
  skillId: string | undefined
): UseSkillProficiencyIndicatorsResult {
  const [indicators, setIndicators] = useState<SkillProficiencyIndicators | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchIndicators = async () => {
    if (!skillId) {
      setIndicators(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("skills_competencies")
        .select("proficiency_indicators")
        .eq("id", skillId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Type assertion since the column is JSONB
      const indicatorsData = data?.proficiency_indicators as SkillProficiencyIndicators | null;
      setIndicators(indicatorsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch indicators"));
      setIndicators(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [skillId]);

  return {
    indicators,
    isLoading,
    error,
    refetch: fetchIndicators,
  };
}

/**
 * Batch fetch indicators for multiple skills
 */
export function useSkillsProficiencyIndicatorsBatch(
  skillIds: string[]
): {
  indicatorsMap: Map<string, SkillProficiencyIndicators>;
  isLoading: boolean;
} {
  const [indicatorsMap, setIndicatorsMap] = useState<Map<string, SkillProficiencyIndicators>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      if (skillIds.length === 0) {
        setIndicatorsMap(new Map());
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("skills_competencies")
          .select("id, proficiency_indicators")
          .in("id", skillIds);

        if (!error && data) {
          const map = new Map<string, SkillProficiencyIndicators>();
          data.forEach((item) => {
            if (item.proficiency_indicators) {
              map.set(item.id, item.proficiency_indicators as SkillProficiencyIndicators);
            }
          });
          setIndicatorsMap(map);
        }
      } catch {
        // Silent fail for batch operations
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [skillIds.join(",")]);

  return { indicatorsMap, isLoading };
}
