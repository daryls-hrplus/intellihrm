import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScaleNormalizationRule {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  source_min: number;
  source_max: number;
  source_step: number;
  target_min: number;
  target_max: number;
  target_step: number;
  method: "linear" | "percentile" | "custom_mapping";
  custom_mapping: Record<string, number> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScaleDefinition {
  min: number;
  max: number;
  step?: number;
}

export function useScaleNormalizationRules(companyId: string | undefined) {
  return useQuery({
    queryKey: ["scale-normalization-rules", companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from("scale_normalization_rules")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true);

      if (error) throw error;
      return data as ScaleNormalizationRule[];
    },
    enabled: !!companyId,
  });
}

/**
 * Normalize a score from one scale to another using linear interpolation
 */
export function normalizeScore(
  value: number,
  sourceScale: ScaleDefinition,
  targetScale: ScaleDefinition
): number {
  const { min: sMin, max: sMax } = sourceScale;
  const { min: tMin, max: tMax, step: tStep } = targetScale;

  // Clamp value to source range
  const clampedValue = Math.max(sMin, Math.min(sMax, value));

  // Linear interpolation
  const ratio = (clampedValue - sMin) / (sMax - sMin);
  let normalizedValue = tMin + ratio * (tMax - tMin);

  // Apply step rounding if specified
  if (tStep) {
    normalizedValue = Math.round(normalizedValue / tStep) * tStep;
  }

  // Final clamp to target range
  return Math.max(tMin, Math.min(tMax, normalizedValue));
}

/**
 * Normalize a score to a percentage (0-100)
 */
export function normalizeToPercentage(value: number, scale: ScaleDefinition): number {
  return normalizeScore(value, scale, { min: 0, max: 100 });
}

/**
 * Normalize any scale to the standard 5-point scale (1-5)
 */
export function normalizeToFivePoint(value: number, scale: ScaleDefinition): number {
  return normalizeScore(value, scale, { min: 1, max: 5, step: 0.5 });
}

/**
 * Normalize any scale to a 10-point scale (1-10)
 */
export function normalizeToTenPoint(value: number, scale: ScaleDefinition): number {
  return normalizeScore(value, scale, { min: 1, max: 10, step: 0.5 });
}

/**
 * Apply custom mapping normalization
 */
export function applyCustomMapping(
  value: number,
  mapping: Record<string, number>
): number | null {
  const key = value.toString();
  if (key in mapping) {
    return mapping[key];
  }

  // Find closest key for interpolation
  const keys = Object.keys(mapping).map(Number).sort((a, b) => a - b);
  
  if (value < keys[0]) return mapping[keys[0].toString()];
  if (value > keys[keys.length - 1]) return mapping[keys[keys.length - 1].toString()];

  // Linear interpolation between closest points
  for (let i = 0; i < keys.length - 1; i++) {
    if (value >= keys[i] && value <= keys[i + 1]) {
      const ratio = (value - keys[i]) / (keys[i + 1] - keys[i]);
      const mappedLow = mapping[keys[i].toString()];
      const mappedHigh = mapping[keys[i + 1].toString()];
      return mappedLow + ratio * (mappedHigh - mappedLow);
    }
  }

  return null;
}

/**
 * Hook providing normalization utilities
 */
export function useScaleNormalization() {
  return {
    normalizeScore,
    normalizeToPercentage,
    normalizeToFivePoint,
    normalizeToTenPoint,
    applyCustomMapping,

    /**
     * Convert a 3-point scale to 5-point
     */
    from3To5Point: (value: number) => normalizeScore(value, { min: 1, max: 3 }, { min: 1, max: 5 }),

    /**
     * Convert a 4-point scale to 5-point
     */
    from4To5Point: (value: number) => normalizeScore(value, { min: 1, max: 4 }, { min: 1, max: 5 }),

    /**
     * Convert a 7-point scale to 5-point
     */
    from7To5Point: (value: number) => normalizeScore(value, { min: 1, max: 7 }, { min: 1, max: 5 }),

    /**
     * Convert a 10-point scale to 5-point
     */
    from10To5Point: (value: number) => normalizeScore(value, { min: 1, max: 10 }, { min: 1, max: 5 }),

    /**
     * Compare scores across different scales by normalizing to percentage
     */
    compareScores: (scores: Array<{ value: number; scale: ScaleDefinition }>) => {
      return scores.map(({ value, scale }) => ({
        originalValue: value,
        percentage: normalizeToPercentage(value, scale),
        fivePoint: normalizeToFivePoint(value, scale),
      }));
    },

    /**
     * Calculate average of scores from different scales
     */
    averageNormalizedScores: (
      scores: Array<{ value: number; scale: ScaleDefinition; weight?: number }>,
      targetScale: ScaleDefinition = { min: 1, max: 5 }
    ): number => {
      if (scores.length === 0) return 0;

      const totalWeight = scores.reduce((sum, s) => sum + (s.weight || 1), 0);
      const weightedSum = scores.reduce((sum, { value, scale, weight = 1 }) => {
        const normalized = normalizeScore(value, scale, targetScale);
        return sum + normalized * weight;
      }, 0);

      return weightedSum / totalWeight;
    },
  };
}

/**
 * Predefined scale definitions for common rating systems
 */
export const COMMON_SCALES: Record<string, ScaleDefinition> = {
  THREE_POINT: { min: 1, max: 3, step: 1 },
  FOUR_POINT: { min: 1, max: 4, step: 1 },
  FIVE_POINT: { min: 1, max: 5, step: 0.5 },
  SEVEN_POINT: { min: 1, max: 7, step: 1 },
  TEN_POINT: { min: 1, max: 10, step: 0.5 },
  PERCENTAGE: { min: 0, max: 100, step: 1 },
};

/**
 * Get rating label based on normalized score
 */
export function getRatingLabel(normalizedScore: number, scale: "5" | "10" = "5"): string {
  const labels5 = [
    { max: 1.5, label: "Needs Improvement" },
    { max: 2.5, label: "Developing" },
    { max: 3.5, label: "Meets Expectations" },
    { max: 4.5, label: "Exceeds Expectations" },
    { max: 5, label: "Outstanding" },
  ];

  const labels10 = [
    { max: 3, label: "Unsatisfactory" },
    { max: 5, label: "Needs Improvement" },
    { max: 7, label: "Meets Expectations" },
    { max: 9, label: "Exceeds Expectations" },
    { max: 10, label: "Outstanding" },
  ];

  const labels = scale === "5" ? labels5 : labels10;
  const found = labels.find(l => normalizedScore <= l.max);
  return found?.label || "Unknown";
}
