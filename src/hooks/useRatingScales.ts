import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RatingLabel {
  label: string;
  description: string;
}

export interface ComponentRatingScale {
  id: string;
  company_id: string | null;
  name: string;
  code: string;
  description: string | null;
  min_rating: number;
  max_rating: number;
  rating_labels: Record<string, RatingLabel>;
  scale_purpose: string[] | null;
  is_default: boolean;
  is_active: boolean;
  scope: 'global' | 'company';
  source_template_id: string | null;
}

export interface OverallRatingLevel {
  value: number;
  label: string;
  description: string;
  color: string;
}

export interface OverallRatingScale {
  id: string;
  company_id: string | null;
  name: string;
  code: string;
  description: string | null;
  levels: OverallRatingLevel[];
  has_forced_distribution: boolean;
  distribution_targets: Record<string, number> | null;
  requires_calibration: boolean;
  is_default: boolean;
  is_active: boolean;
  scope: 'global' | 'company';
  source_template_id: string | null;
}

export interface RatingMapping {
  id: string;
  company_id: string | null;
  overall_scale_id: string;
  component_scale_id: string;
  name: string;
  mapping_rules: Array<{
    overall_level: number;
    min_score: number;
    max_score: number;
  }>;
  is_active: boolean;
  scope: 'global' | 'company';
  source_template_id: string | null;
}

interface UseRatingScalesOptions {
  companyId: string;
  purpose?: 'appraisal' | 'goals' | '360_feedback' | 'all';
  activeOnly?: boolean;
  includeGlobal?: boolean;
}

export function useComponentRatingScales({ companyId, purpose, activeOnly = true, includeGlobal = true }: UseRatingScalesOptions) {
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
        .select("*");

      // Fetch global (company_id IS NULL) + company-specific templates
      if (includeGlobal) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      } else {
        query = query.eq("company_id", companyId);
      }

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      // Order by scope (global first) then name
      query = query.order("scope", { ascending: true }).order("name");

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

      setScales(filteredData.map(scale => {
        const scaleAny = scale as any;
        return {
          ...scale,
          company_id: scale.company_id as string | null,
          rating_labels: typeof scale.rating_labels === 'object' && scale.rating_labels !== null && !Array.isArray(scale.rating_labels)
            ? scale.rating_labels as unknown as Record<string, RatingLabel>
            : {},
          scale_purpose: scale.scale_purpose || ['appraisal'],
          scope: (scaleAny.scope as 'global' | 'company') || 'company',
          source_template_id: scaleAny.source_template_id as string | null,
        };
      }));
    } catch (err: any) {
      setError(err.message);
      setScales([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, [companyId, purpose, activeOnly, includeGlobal]);

  return { scales, isLoading, error, refetch: fetchScales };
}

export function useOverallRatingScales({ companyId, activeOnly = true, includeGlobal = true }: Omit<UseRatingScalesOptions, 'purpose'>) {
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
        .select("*");

      // Fetch global (company_id IS NULL) + company-specific templates
      if (includeGlobal) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      } else {
        query = query.eq("company_id", companyId);
      }

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      // Order by scope (global first) then name
      query = query.order("scope", { ascending: true }).order("name");

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setScales((data || []).map(scale => {
        const scaleAny = scale as any;
        return {
          ...scale,
          company_id: scale.company_id as string | null,
          levels: Array.isArray(scale.levels) ? scale.levels as unknown as OverallRatingLevel[] : [],
          distribution_targets: scale.distribution_targets as unknown as Record<string, number> | null,
          scope: (scaleAny.scope as 'global' | 'company') || 'company',
          source_template_id: scaleAny.source_template_id as string | null,
        };
      }));
    } catch (err: any) {
      setError(err.message);
      setScales([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, [companyId, activeOnly, includeGlobal]);

  return { scales, isLoading, error, refetch: fetchScales };
}

export function useRatingMappings({ companyId, activeOnly = true, includeGlobal = true }: Omit<UseRatingScalesOptions, 'purpose'>) {
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
        .select("*");

      // Fetch global (company_id IS NULL) + company-specific templates
      if (includeGlobal) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      } else {
        query = query.eq("company_id", companyId);
      }

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      // Order by scope (global first) then name
      query = query.order("scope", { ascending: true }).order("name");

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setMappings((data || []).map(mapping => {
        const mappingAny = mapping as any;
        return {
          ...mapping,
          company_id: mapping.company_id as string | null,
          mapping_rules: Array.isArray(mapping.mapping_rules) 
            ? mapping.mapping_rules as RatingMapping['mapping_rules']
            : [],
          scope: (mappingAny.scope as 'global' | 'company') || 'company',
          source_template_id: mappingAny.source_template_id as string | null,
        };
      }));
    } catch (err: any) {
      setError(err.message);
      setMappings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [companyId, activeOnly, includeGlobal]);

  return { mappings, isLoading, error, refetch: fetchMappings };
}
