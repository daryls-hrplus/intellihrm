import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NineBoxSignalMapping {
  id: string;
  company_id: string;
  signal_definition_id: string;
  contributes_to: 'performance' | 'potential' | 'both';
  weight: number;
  minimum_confidence: number;
  is_active: boolean;
  created_at: string;
  signal_definition?: {
    id: string;
    code: string;
    name: string;
    signal_category: string;
  };
}

export interface AggregatedSignalScore {
  axis: 'performance' | 'potential';
  score: number;
  confidence: number;
  signalCount: number;
  signals: Array<{
    name: string;
    score: number;
    weight: number;
    confidence: number;
    biasRisk: string;
  }>;
}

// Default signal-to-axis mappings based on industry standards
export const DEFAULT_SIGNAL_MAPPINGS: Array<{
  signal_category: string;
  contributes_to: 'performance' | 'potential' | 'both';
  weight: number;
  rationale: string;
}> = [
  { signal_category: 'leadership', contributes_to: 'potential', weight: 1.0, rationale: 'Leadership capability indicates future readiness' },
  { signal_category: 'people_leadership', contributes_to: 'potential', weight: 1.0, rationale: 'Team development skills predict advancement' },
  { signal_category: 'strategic_thinking', contributes_to: 'potential', weight: 1.0, rationale: 'Strategic mindset for senior roles' },
  { signal_category: 'influence', contributes_to: 'potential', weight: 1.0, rationale: 'Ability to lead without authority' },
  { signal_category: 'adaptability', contributes_to: 'potential', weight: 0.8, rationale: 'Learning agility proxy' },
  { signal_category: 'technical', contributes_to: 'performance', weight: 1.0, rationale: 'Current role execution' },
  { signal_category: 'customer_focus', contributes_to: 'performance', weight: 0.8, rationale: 'Current role effectiveness' },
  { signal_category: 'teamwork', contributes_to: 'both', weight: 0.7, rationale: 'Collaboration affects both axes' },
  { signal_category: 'values', contributes_to: 'potential', weight: 0.6, rationale: 'Cultural fit for advancement' },
  { signal_category: 'general', contributes_to: 'both', weight: 0.5, rationale: 'General feedback applies to both' },
];

export function useNineBoxSignalMappings(companyId?: string) {
  return useQuery({
    queryKey: ['nine-box-signal-mappings', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('nine_box_signal_mappings')
        .select(`
          *,
          signal_definition:talent_signal_definitions(id, code, name, signal_category)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (error) throw error;
      
      return (data || []).map((m: any) => ({
        ...m,
        signal_definition: Array.isArray(m.signal_definition) 
          ? m.signal_definition[0] 
          : m.signal_definition
      })) as NineBoxSignalMapping[];
    },
    enabled: !!companyId,
  });
}

export function useManageSignalMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mapping: Partial<NineBoxSignalMapping> & { company_id: string }) => {
      if (mapping.id) {
        const { data, error } = await supabase
          .from('nine_box_signal_mappings')
          .update({
            signal_definition_id: mapping.signal_definition_id,
            contributes_to: mapping.contributes_to,
            weight: mapping.weight,
            minimum_confidence: mapping.minimum_confidence,
            is_active: mapping.is_active,
          })
          .eq('id', mapping.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('nine_box_signal_mappings')
          .insert(mapping)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nine-box-signal-mappings'] });
      toast.success('Signal mapping saved');
    },
    onError: (error) => {
      console.error('Error saving signal mapping:', error);
      toast.error('Failed to save signal mapping');
    },
  });
}

export function useDeleteSignalMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('nine_box_signal_mappings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nine-box-signal-mappings'] });
      toast.success('Signal mapping deleted');
    },
    onError: (error) => {
      console.error('Error deleting signal mapping:', error);
      toast.error('Failed to delete signal mapping');
    },
  });
}

export function useAggregatedSignalScores(employeeId?: string, companyId?: string) {
  const { data: mappings } = useNineBoxSignalMappings(companyId);

  return useQuery({
    queryKey: ['aggregated-signal-scores', employeeId, companyId],
    queryFn: async (): Promise<{ performance: AggregatedSignalScore | null; potential: AggregatedSignalScore | null }> => {
      if (!employeeId || !companyId) {
        return { performance: null, potential: null };
      }

      // Fetch all current signals for employee
      const { data: snapshots, error } = await supabase
        .from('talent_signal_snapshots')
        .select(`
          id,
          signal_value,
          normalized_score,
          confidence_score,
          bias_risk_level,
          signal_definition:talent_signal_definitions(id, code, name, signal_category)
        `)
        .eq('employee_id', employeeId)
        .eq('is_current', true);

      if (error) throw error;

      const signals = (snapshots || []).map((s: any) => ({
        ...s,
        signal_definition: Array.isArray(s.signal_definition) ? s.signal_definition[0] : s.signal_definition
      }));

      // Aggregate by axis
      const aggregateForAxis = (axis: 'performance' | 'potential'): AggregatedSignalScore | null => {
        const relevantSignals = signals.filter((s: any) => {
          const category = s.signal_definition?.signal_category;
          
          // Check custom mappings first
          if (mappings && mappings.length > 0) {
            const mapping = mappings.find(m => m.signal_definition_id === s.signal_definition?.id);
            if (mapping) {
              return mapping.contributes_to === axis || mapping.contributes_to === 'both';
            }
          }
          
          // Fall back to default mappings
          const defaultMapping = DEFAULT_SIGNAL_MAPPINGS.find(m => m.signal_category === category);
          if (defaultMapping) {
            return defaultMapping.contributes_to === axis || defaultMapping.contributes_to === 'both';
          }
          
          return false;
        });

        if (relevantSignals.length === 0) return null;

        let totalScore = 0;
        let totalWeight = 0;
        let totalConfidence = 0;
        const signalDetails: AggregatedSignalScore['signals'] = [];

        relevantSignals.forEach((s: any) => {
          const score = s.normalized_score || 0;
          const confidence = s.confidence_score || 0;
          
          // Get weight from custom mapping or default
          let weight = 1.0;
          if (mappings && mappings.length > 0) {
            const mapping = mappings.find(m => m.signal_definition_id === s.signal_definition?.id);
            if (mapping) {
              weight = mapping.weight;
              // Skip if confidence below minimum
              if (confidence < (mapping.minimum_confidence || 0)) return;
            }
          } else {
            const defaultMapping = DEFAULT_SIGNAL_MAPPINGS.find(m => m.signal_category === s.signal_definition?.signal_category);
            if (defaultMapping) {
              weight = defaultMapping.weight;
            }
          }

          // Apply bias risk adjustment
          const biasMultiplier = s.bias_risk_level === 'high' ? 0.7 : s.bias_risk_level === 'medium' ? 0.85 : 1.0;
          const adjustedScore = score * biasMultiplier;

          totalScore += adjustedScore * weight;
          totalWeight += weight;
          totalConfidence += confidence;

          signalDetails.push({
            name: s.signal_definition?.name || 'Unknown',
            score: adjustedScore,
            weight,
            confidence,
            biasRisk: s.bias_risk_level,
          });
        });

        if (totalWeight === 0) return null;

        return {
          axis,
          score: totalScore / totalWeight,
          confidence: totalConfidence / relevantSignals.length,
          signalCount: relevantSignals.length,
          signals: signalDetails,
        };
      };

      return {
        performance: aggregateForAxis('performance'),
        potential: aggregateForAxis('potential'),
      };
    },
    enabled: !!employeeId && !!companyId,
  });
}

export function useInitializeDefaultMappings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      // Fetch all signal definitions
      const { data: definitions, error: defError } = await supabase
        .from('talent_signal_definitions')
        .select('id, code, signal_category')
        .eq('is_active', true);

      if (defError) throw defError;

      // Create mappings for each definition based on defaults
      const mappingsToInsert = (definitions || [])
        .map(def => {
          const defaultMapping = DEFAULT_SIGNAL_MAPPINGS.find(m => m.signal_category === def.signal_category);
          if (!defaultMapping) return null;
          
          return {
            company_id: companyId,
            signal_definition_id: def.id,
            contributes_to: defaultMapping.contributes_to,
            weight: defaultMapping.weight,
            minimum_confidence: 0.6,
            is_active: true,
          };
        })
        .filter(Boolean);

      if (mappingsToInsert.length === 0) {
        throw new Error('No signal definitions found to map');
      }

      const { error } = await supabase
        .from('nine_box_signal_mappings')
        .insert(mappingsToInsert);

      if (error) throw error;
      return mappingsToInsert.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['nine-box-signal-mappings'] });
      toast.success(`Created ${count} default signal mappings`);
    },
    onError: (error) => {
      console.error('Error initializing mappings:', error);
      toast.error('Failed to initialize signal mappings');
    },
  });
}
