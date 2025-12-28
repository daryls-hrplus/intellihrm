import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GenerateDescriptionParams {
  name: string;
  category?: string;
  existingDescription?: string;
}

interface SuggestKRAsParams {
  name: string;
  category?: string;
  description?: string;
}

interface EnrichAllParams {
  name: string;
  category?: string;
  existingDescription?: string;
}

interface EnrichAllResult {
  description: string;
  kras: string[];
  suggestedCategory?: string;
  complexity?: number;
}

interface SuggestForFamilyParams {
  familyName: string;
  familyDescription?: string;
  existingResponsibilities?: string[];
}

interface FamilySuggestion {
  name: string;
  category: string;
  suggestedWeight: number;
  description: string;
}

interface GenerateFamilyDescriptionParams {
  familyName: string;
  existingDescription?: string;
}

export function useResponsibilityAI() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDescription = async (params: GenerateDescriptionParams): Promise<string | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('responsibility-ai-helper', {
        body: {
          action: 'generate_description',
          ...params,
        },
      });

      if (error) {
        console.error('Error generating description:', error);
        return null;
      }

      return data.description || null;
    } catch (error) {
      console.error('Error calling AI:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestKRAs = async (params: SuggestKRAsParams): Promise<string[] | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('responsibility-ai-helper', {
        body: {
          action: 'suggest_kras',
          ...params,
        },
      });

      if (error) {
        console.error('Error suggesting KRAs:', error);
        return null;
      }

      return data.kras || null;
    } catch (error) {
      console.error('Error calling AI:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const enrichAll = async (params: EnrichAllParams): Promise<EnrichAllResult | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('responsibility-ai-helper', {
        body: {
          action: 'enrich_all',
          ...params,
        },
      });

      if (error) {
        console.error('Error enriching responsibility:', error);
        return null;
      }

      return {
        description: data.description,
        kras: data.kras || [],
        suggestedCategory: data.suggestedCategory,
        complexity: data.complexity,
      };
    } catch (error) {
      console.error('Error calling AI:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestForFamily = async (params: SuggestForFamilyParams): Promise<FamilySuggestion[] | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('responsibility-ai-helper', {
        body: {
          action: 'suggest_for_family',
          ...params,
        },
      });

      if (error) {
        console.error('Error suggesting for family:', error);
        return null;
      }

      return data.suggestions || null;
    } catch (error) {
      console.error('Error calling AI:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFamilyDescription = async (params: GenerateFamilyDescriptionParams): Promise<string | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('responsibility-ai-helper', {
        body: {
          action: 'generate_family_description',
          ...params,
        },
      });

      if (error) {
        console.error('Error generating family description:', error);
        return null;
      }

      return data.description || null;
    } catch (error) {
      console.error('Error calling AI:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateDescription,
    suggestKRAs,
    enrichAll,
    suggestForFamily,
    generateFamilyDescription,
  };
}
