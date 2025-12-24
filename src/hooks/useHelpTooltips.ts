import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HelpTooltip } from '@/types/tours';
import { useAuth } from '@/contexts/AuthContext';

interface UseHelpTooltipsOptions {
  moduleCode?: string;
  featureCode?: string;
}

export function useHelpTooltips(options: UseHelpTooltipsOptions = {}) {
  const { moduleCode, featureCode } = options;
  const { profile } = useAuth();
  const [tooltips, setTooltips] = useState<HelpTooltip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTooltips = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('enablement_help_tooltips')
        .select('*')
        .eq('is_active', true);

      if (moduleCode) {
        query = query.eq('module_code', moduleCode);
      }

      if (featureCode) {
        query = query.eq('feature_code', featureCode);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter by user roles if specified - note: profile doesn't have role, use empty array check
      const filteredTooltips = (data as HelpTooltip[])?.filter(t => 
        !t.target_roles || t.target_roles.length === 0
      ) || [];
      
      setTooltips(filteredTooltips);
    } catch (error) {
      console.error('Error fetching help tooltips:', error);
    } finally {
      setIsLoading(false);
    }
  }, [moduleCode, featureCode, profile]);

  const getTooltipForElement = useCallback((selector: string): HelpTooltip | undefined => {
    return tooltips.find(t => t.element_selector === selector);
  }, [tooltips]);

  const getTooltipByCode = useCallback((code: string): HelpTooltip | undefined => {
    return tooltips.find(t => t.tooltip_code === code);
  }, [tooltips]);

  useEffect(() => {
    fetchTooltips();
  }, [fetchTooltips]);

  return {
    tooltips,
    isLoading,
    fetchTooltips,
    getTooltipForElement,
    getTooltipByCode,
  };
}
