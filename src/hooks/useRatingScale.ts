import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RatingLabel {
  label: string;
  description: string;
}

export interface RatingScale {
  id: string;
  name: string;
  min_rating: number;
  max_rating: number;
  labels: Record<string, RatingLabel>;
  scale_type: string;
  is_active: boolean;
}

export interface ConversionRule {
  performance_rating: number;
  proficiency_change: number;
  condition: "if_below_max" | "if_above_min" | "maintain" | "always";
  label: string;
}

export interface ConversionRuleSet {
  id: string;
  name: string;
  description: string | null;
  rules: ConversionRule[];
  is_default: boolean;
  is_active: boolean;
}

/**
 * Fetches a rating scale by ID with parsed labels
 */
export function useRatingScale(scaleId: string | null | undefined) {
  return useQuery({
    queryKey: ["rating-scale", scaleId],
    queryFn: async () => {
      if (!scaleId) return null;
      
      const { data, error } = await supabase
        .from("performance_rating_scales")
        .select("*")
        .eq("id", scaleId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Parse labels from JSONB - column is rating_labels
      let parsedLabels: Record<string, RatingLabel> = {};
      if (data.rating_labels && typeof data.rating_labels === "object" && !Array.isArray(data.rating_labels)) {
        parsedLabels = data.rating_labels as unknown as Record<string, RatingLabel>;
      }
      
      return {
        id: data.id,
        name: data.name,
        min_rating: data.min_rating,
        max_rating: data.max_rating,
        labels: parsedLabels,
        scale_type: data.scope || "company",
        is_active: data.is_active,
      } as RatingScale;
    },
    enabled: !!scaleId,
  });
}

/**
 * Fetches conversion rules for rating-to-proficiency mapping
 */
export function useConversionRules(companyId: string | null | undefined) {
  return useQuery({
    queryKey: ["conversion-rules", companyId],
    queryFn: async () => {
      // First try company-specific rules
      if (companyId) {
        const { data: companyRules } = await supabase
          .from("rating_proficiency_conversion_rules")
          .select("*")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .maybeSingle();
        
        if (companyRules) {
          const rules = Array.isArray(companyRules.rules) 
            ? companyRules.rules as unknown as ConversionRule[]
            : [];
          return {
            id: companyRules.id,
            name: companyRules.name,
            description: companyRules.description,
            rules,
            is_default: companyRules.is_default || false,
            is_active: companyRules.is_active ?? true,
          } as ConversionRuleSet;
        }
      }
      
      // Fall back to default rules
      const { data: defaultRules } = await supabase
        .from("rating_proficiency_conversion_rules")
        .select("*")
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();
      
      if (defaultRules) {
        const rules = Array.isArray(defaultRules.rules) 
          ? defaultRules.rules as unknown as ConversionRule[]
          : [];
        return {
          id: defaultRules.id,
          name: defaultRules.name,
          description: defaultRules.description,
          rules,
          is_default: defaultRules.is_default ?? true,
          is_active: defaultRules.is_active ?? true,
        } as ConversionRuleSet;
      }
      
      // If no rules found, return industry-standard defaults
      return {
        id: "default",
        name: "Industry Standard Defaults",
        description: "Default conversion rules when none are configured",
        rules: [
          { performance_rating: 5, proficiency_change: 1, condition: "if_below_max", label: "Exceptional - Proficiency Increased" },
          { performance_rating: 4, proficiency_change: 0, condition: "maintain", label: "Exceeds - Proficiency Maintained" },
          { performance_rating: 3, proficiency_change: 0, condition: "maintain", label: "Meets - Proficiency Maintained" },
          { performance_rating: 2, proficiency_change: -1, condition: "if_above_min", label: "Needs Improvement - Proficiency May Decrease" },
          { performance_rating: 1, proficiency_change: -1, condition: "always", label: "Unsatisfactory - Proficiency Decreased" },
        ],
        is_default: true,
        is_active: true,
      } as ConversionRuleSet;
    },
    enabled: true,
  });
}

/**
 * Helper to get display label for a rating value from a scale
 */
export function getRatingLabel(
  scale: RatingScale | null | undefined,
  rating: number,
  fallbackLabels?: Record<number, string>
): string {
  if (scale?.labels) {
    const label = scale.labels[String(Math.round(rating))];
    if (label?.label) return label.label;
  }
  
  if (fallbackLabels) {
    return fallbackLabels[Math.round(rating)] || "";
  }
  
  // Ultimate fallback
  const defaultLabels: Record<number, string> = {
    1: "Needs Improvement",
    2: "Below Expectations",
    3: "Meets Expectations",
    4: "Exceeds Expectations",
    5: "Outstanding",
  };
  
  return defaultLabels[Math.round(rating)] || "";
}

/**
 * Helper to convert rating labels to a simple Record<number, string> map
 */
export function getLabelsMap(scale: RatingScale | null | undefined): Record<number, string> {
  if (!scale?.labels) return {};
  
  return Object.fromEntries(
    Object.entries(scale.labels).map(([key, val]) => [parseInt(key), val.label])
  );
}
