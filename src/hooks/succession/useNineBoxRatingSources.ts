import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NineBoxRatingSource {
  id: string;
  company_id: string;
  axis: 'performance' | 'potential';
  source_type: string;
  source_config: Record<string, any>;
  weight: number;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface CalculatedRating {
  rating: number;
  confidence: number;
  sources: Array<{
    type: string;
    label: string;
    value: number;
    weight: number;
    rawValue: any;
  }>;
}

// Default source configurations
export const DEFAULT_PERFORMANCE_SOURCES = [
  { source_type: 'appraisal_overall_score', weight: 0.5, priority: 1 },
  { source_type: 'goal_achievement', weight: 0.3, priority: 2 },
  { source_type: 'competency_average', weight: 0.2, priority: 3 },
];

export const DEFAULT_POTENTIAL_SOURCES = [
  { source_type: 'potential_assessment', weight: 0.4, priority: 1 },
  { source_type: 'leadership_signals', weight: 0.4, priority: 2 },
  { source_type: 'values_signals', weight: 0.2, priority: 3 },
];

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  appraisal_overall_score: 'Appraisal Score',
  calibrated_score: 'Calibrated Rating',
  goal_achievement: 'Goal Achievement',
  competency_average: 'Competency Average',
  potential_assessment: 'Potential Assessment',
  leadership_signals: 'Leadership Signals (360)',
  values_signals: 'Values & Adaptability Signals',
};

export function useNineBoxRatingSources(companyId?: string) {
  return useQuery({
    queryKey: ['nine-box-rating-sources', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('nine_box_rating_sources')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('priority');

      if (error) throw error;
      return data as NineBoxRatingSource[];
    },
    enabled: !!companyId,
  });
}

export function useManageRatingSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (source: Partial<NineBoxRatingSource> & { company_id: string }) => {
      if (source.id) {
        const { data, error } = await supabase
          .from('nine_box_rating_sources')
          .update({
            axis: source.axis,
            source_type: source.source_type,
            source_config: source.source_config,
            weight: source.weight,
            is_active: source.is_active,
            priority: source.priority,
          })
          .eq('id', source.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('nine_box_rating_sources')
          .insert({
            company_id: source.company_id,
            axis: source.axis!,
            source_type: source.source_type!,
            source_config: source.source_config || {},
            weight: source.weight ?? 1.0,
            is_active: source.is_active ?? true,
            priority: source.priority ?? 0,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nine-box-rating-sources'] });
      toast.success('Rating source saved');
    },
    onError: (error) => {
      console.error('Error saving rating source:', error);
      toast.error('Failed to save rating source');
    },
  });
}

export function useDeleteRatingSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('nine_box_rating_sources')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nine-box-rating-sources'] });
      toast.success('Rating source deleted');
    },
    onError: (error) => {
      console.error('Error deleting rating source:', error);
      toast.error('Failed to delete rating source');
    },
  });
}

export function useCalculateRatings(employeeId?: string, companyId?: string) {
  return useQuery({
    queryKey: ['calculated-ratings', employeeId, companyId],
    queryFn: async (): Promise<{ performance: CalculatedRating | null; potential: CalculatedRating | null }> => {
      if (!employeeId || !companyId) {
        return { performance: null, potential: null };
      }

      // Fetch all evidence in parallel
      const [appraisalRes, goalsRes, signalsRes, potentialRes] = await Promise.all([
        supabase
          .from('appraisal_participants')
          .select('overall_score, status, appraisal_cycle:appraisal_cycles(name)')
          .eq('employee_id', employeeId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('performance_goals' as any)
          .select('id, status, progress_percentage')
          .eq('owner_id', employeeId)
          .eq('is_active', true),
        supabase
          .from('talent_signal_snapshots')
          .select('id, signal_value, normalized_score, confidence_score, bias_risk_level, signal_definition:talent_signal_definitions(code, name, signal_category)')
          .eq('employee_id', employeeId)
          .eq('is_current', true),
        supabase
          .from('potential_assessments')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('is_current', true)
          .limit(1),
      ]);

      const appraisal = (appraisalRes.data as any)?.[0];
      const goals = (goalsRes.data as any) || [];
      const signals = (signalsRes.data || []).map((s: any) => ({
        ...s,
        signal_definition: Array.isArray(s.signal_definition) ? s.signal_definition[0] : s.signal_definition
      }));
      const potentialAssessment = (potentialRes.data as any)?.[0];

      // Calculate Performance Rating
      const performanceSources: CalculatedRating['sources'] = [];
      let performanceScore = 0;
      let performanceWeight = 0;

      if (appraisal?.overall_score) {
        const normalizedScore = appraisal.overall_score / 5;
        performanceSources.push({
          type: 'appraisal_overall_score',
          label: 'Appraisal Score',
          value: normalizedScore,
          weight: 0.5,
          rawValue: appraisal.overall_score,
        });
        performanceScore += normalizedScore * 0.5;
        performanceWeight += 0.5;
      }

      if (goals.length > 0) {
        const avgProgress = goals.reduce((sum: number, g: any) => sum + (g.progress_percentage || 0), 0) / goals.length;
        const normalizedGoals = avgProgress / 100;
        performanceSources.push({
          type: 'goal_achievement',
          label: 'Goal Achievement',
          value: normalizedGoals,
          weight: 0.3,
          rawValue: avgProgress,
        });
        performanceScore += normalizedGoals * 0.3;
        performanceWeight += 0.3;
      }

      const technicalSignals = signals.filter((s: any) => 
        ['technical', 'customer_focus'].includes(s.signal_definition?.signal_category)
      );
      if (technicalSignals.length > 0) {
        const avgTechnical = technicalSignals.reduce((sum: number, s: any) => sum + (s.normalized_score || 0), 0) / technicalSignals.length;
        performanceSources.push({
          type: 'competency_average',
          label: 'Technical Skills',
          value: avgTechnical,
          weight: 0.2,
          rawValue: technicalSignals.length,
        });
        performanceScore += avgTechnical * 0.2;
        performanceWeight += 0.2;
      }

      // Calculate Potential Rating
      const potentialSources: CalculatedRating['sources'] = [];
      let potentialScore = 0;
      let potentialWeight = 0;

      if (potentialAssessment?.calculated_rating) {
        const normalizedPotential = potentialAssessment.calculated_rating / 3;
        potentialSources.push({
          type: 'potential_assessment',
          label: 'Potential Assessment',
          value: normalizedPotential,
          weight: 0.4,
          rawValue: potentialAssessment.calculated_rating,
        });
        potentialScore += normalizedPotential * 0.4;
        potentialWeight += 0.4;
      }

      const leadershipSignals = signals.filter((s: any) => 
        ['leadership', 'people_leadership', 'strategic_thinking', 'influence'].includes(s.signal_definition?.signal_category)
      );
      if (leadershipSignals.length > 0) {
        const avgLeadership = leadershipSignals.reduce((sum: number, s: any) => sum + (s.normalized_score || 0), 0) / leadershipSignals.length;
        potentialSources.push({
          type: 'leadership_signals',
          label: 'Leadership Signals',
          value: avgLeadership,
          weight: 0.4,
          rawValue: leadershipSignals.length,
        });
        potentialScore += avgLeadership * 0.4;
        potentialWeight += 0.4;
      }

      const valuesSignals = signals.filter((s: any) => 
        ['values', 'adaptability'].includes(s.signal_definition?.signal_category)
      );
      if (valuesSignals.length > 0) {
        const avgValues = valuesSignals.reduce((sum: number, s: any) => sum + (s.normalized_score || 0), 0) / valuesSignals.length;
        potentialSources.push({
          type: 'values_signals',
          label: 'Values & Adaptability',
          value: avgValues,
          weight: 0.2,
          rawValue: valuesSignals.length,
        });
        potentialScore += avgValues * 0.2;
        potentialWeight += 0.2;
      }

      // Normalize and convert to 1-3 scale
      const normalizedPerformance = performanceWeight > 0 ? performanceScore / performanceWeight : 0;
      const normalizedPotential = potentialWeight > 0 ? potentialScore / potentialWeight : 0;

      const toRating = (score: number) => score < 0.33 ? 1 : score < 0.67 ? 2 : 3;

      return {
        performance: performanceWeight > 0 ? {
          rating: toRating(normalizedPerformance),
          confidence: Math.min(performanceWeight, 1),
          sources: performanceSources,
        } : null,
        potential: potentialWeight > 0 ? {
          rating: toRating(normalizedPotential),
          confidence: Math.min(potentialWeight, 1),
          sources: potentialSources,
        } : null,
      };
    },
    enabled: !!employeeId && !!companyId,
  });
}
