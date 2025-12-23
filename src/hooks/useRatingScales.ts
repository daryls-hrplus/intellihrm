import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RatingLabel {
  label: string;
  description: string;
}

export interface ComponentRatingScale {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  min_rating: number;
  max_rating: number;
  rating_labels: Record<string, RatingLabel>;
  scale_purpose: string[] | null;
  is_default: boolean;
  is_active: boolean;
}

export interface OverallRatingLevel {
  value: number;
  label: string;
  description: string;
  color: string;
}

export interface OverallRatingScale {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  levels: OverallRatingLevel[];
  has_forced_distribution: boolean;
  distribution_targets: Record<string, number> | null;
  requires_calibration: boolean;
  is_default: boolean;
  is_active: boolean;
}

export interface RatingMapping {
  id: string;
  company_id: string;
  overall_scale_id: string;
  component_scale_id: string;
  name: string;
  mapping_rules: Array<{
    overall_level: number;
    min_score: number;
    max_score: number;
  }>;
  is_active: boolean;
}

interface UseRatingScalesOptions {
  companyId: string;
  purpose?: 'appraisal' | 'goals' | '360_feedback' | 'all';
  activeOnly?: boolean;
}

export function useComponentRatingScales({ companyId, purpose, activeOnly = true }: UseRatingScalesOptions) {
  const [scales, setScales] = useState<ComponentRatingScale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScales = async () => {
    if (!companyId) {
      setScales([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("performance_rating_scales")
        .select("*")
        .eq("company_id", companyId)
        .order("name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let filteredData = data || [];

      // Filter by purpose if specified
      if (purpose && purpose !== 'all') {
        filteredData = filteredData.filter(scale => {
          const purposes = scale.scale_purpose || ['appraisal'];
          return purposes.includes(purpose) || purposes.includes('all');
        });
      }

      setScales(filteredData.map(scale => ({
        ...scale,
        rating_labels: typeof scale.rating_labels === 'object' && scale.rating_labels !== null && !Array.isArray(scale.rating_labels)
          ? scale.rating_labels as unknown as Record<string, RatingLabel>
          : {},
        scale_purpose: scale.scale_purpose || ['appraisal'],
      })));
    } catch (err: any) {
      setError(err.message);
      setScales([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, [companyId, purpose, activeOnly]);

  return { scales, isLoading, error, refetch: fetchScales };
}

export function useOverallRatingScales({ companyId, activeOnly = true }: Omit<UseRatingScalesOptions, 'purpose'>) {
  const [scales, setScales] = useState<OverallRatingScale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScales = async () => {
    if (!companyId) {
      setScales([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("overall_rating_scales")
        .select("*")
        .eq("company_id", companyId)
        .order("name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setScales((data || []).map(scale => ({
        ...scale,
        levels: Array.isArray(scale.levels) ? scale.levels as unknown as OverallRatingLevel[] : [],
        distribution_targets: scale.distribution_targets as unknown as Record<string, number> | null,
      })));
    } catch (err: any) {
      setError(err.message);
      setScales([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, [companyId, activeOnly]);

  return { scales, isLoading, error, refetch: fetchScales };
}

export function useRatingMappings({ companyId, activeOnly = true }: Omit<UseRatingScalesOptions, 'purpose'>) {
  const [mappings, setMappings] = useState<RatingMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMappings = async () => {
    if (!companyId) {
      setMappings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("overall_rating_mappings")
        .select("*")
        .eq("company_id", companyId)
        .order("name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setMappings((data || []).map(mapping => ({
        ...mapping,
        mapping_rules: Array.isArray(mapping.mapping_rules) 
          ? mapping.mapping_rules as RatingMapping['mapping_rules']
          : [],
      })));
    } catch (err: any) {
      setError(err.message);
      setMappings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [companyId, activeOnly]);

  return { mappings, isLoading, error, refetch: fetchMappings };
}
