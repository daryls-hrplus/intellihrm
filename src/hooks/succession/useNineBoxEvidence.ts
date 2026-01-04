import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalculatedRating } from "./useNineBoxRatingSources";

export interface NineBoxEvidenceSource {
  id: string;
  assessment_id: string;
  company_id: string;
  axis: 'performance' | 'potential';
  source_type: string;
  source_id: string | null;
  source_value: number | null;
  weight_applied: number | null;
  confidence_score: number | null;
  contribution_summary: string | null;
  created_at: string;
}

export interface SaveAssessmentWithEvidenceParams {
  assessmentId: string;
  companyId: string;
  performanceRating: CalculatedRating | null;
  potentialRating: CalculatedRating | null;
  isOverridePerformance: boolean;
  isOverridePotential: boolean;
  overridePerformanceReason?: string;
  overridePotentialReason?: string;
}

export function useSaveNineBoxEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assessmentId,
      companyId,
      performanceRating,
      potentialRating,
      isOverridePerformance,
      isOverridePotential,
      overridePerformanceReason,
      overridePotentialReason,
    }: SaveAssessmentWithEvidenceParams) => {
      // First delete existing evidence for this assessment
      await supabase
        .from('nine_box_evidence_sources')
        .delete()
        .eq('assessment_id', assessmentId);

      const evidenceToInsert: Array<{
        assessment_id: string;
        company_id: string;
        axis: string;
        source_type: string;
        source_id: string | null;
        source_value: number | null;
        weight_applied: number | null;
        confidence_score: number | null;
        contribution_summary: string | null;
      }> = [];

      // Add performance evidence
      if (performanceRating) {
        performanceRating.sources.forEach(source => {
          evidenceToInsert.push({
            assessment_id: assessmentId,
            company_id: companyId,
            axis: 'performance',
            source_type: source.type,
            source_id: null, // Can be enhanced to store actual source IDs
            source_value: source.value,
            weight_applied: source.weight,
            confidence_score: performanceRating.confidence,
            contribution_summary: isOverridePerformance 
              ? `Override: ${overridePerformanceReason || 'Manual adjustment'}`
              : `Auto-calculated from ${source.label}`,
          });
        });
      }

      // Add potential evidence
      if (potentialRating) {
        potentialRating.sources.forEach(source => {
          evidenceToInsert.push({
            assessment_id: assessmentId,
            company_id: companyId,
            axis: 'potential',
            source_type: source.type,
            source_id: null,
            source_value: source.value,
            weight_applied: source.weight,
            confidence_score: potentialRating.confidence,
            contribution_summary: isOverridePotential
              ? `Override: ${overridePotentialReason || 'Manual adjustment'}`
              : `Auto-calculated from ${source.label}`,
          });
        });
      }

      if (evidenceToInsert.length > 0) {
        const { error } = await supabase
          .from('nine_box_evidence_sources')
          .insert(evidenceToInsert);

        if (error) throw error;
      }

      return evidenceToInsert.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nine-box-evidence'] });
    },
    onError: (error) => {
      console.error('Error saving evidence:', error);
      // Don't show toast - this is a background operation
    },
  });
}

export function useSaveSuccessionEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      candidateId,
      companyId,
      nineBoxAssessmentId,
      signalSnapshots,
      readinessContribution,
    }: {
      candidateId: string;
      companyId: string;
      nineBoxAssessmentId?: string;
      signalSnapshots?: Array<{ id: string; name: string; score: number; category: string }>;
      readinessContribution: number;
    }) => {
      // Create succession candidate evidence
      const evidenceData = {
        candidate_id: candidateId,
        company_id: companyId,
        evidence_type: 'nine_box_assessment',
        source_nine_box_id: nineBoxAssessmentId || null,
        signal_summary: signalSnapshots ? {
          count: signalSnapshots.length,
          signals: signalSnapshots.map(s => ({
            name: s.name,
            score: s.score,
            category: s.category,
          })),
        } : null,
        leadership_indicators: signalSnapshots ? {
          leadership_count: signalSnapshots.filter(s => 
            ['leadership', 'people_leadership', 'influence'].includes(s.category)
          ).length,
          avg_leadership_score: signalSnapshots
            .filter(s => ['leadership', 'people_leadership', 'influence'].includes(s.category))
            .reduce((sum, s) => sum + s.score, 0) / 
            (signalSnapshots.filter(s => ['leadership', 'people_leadership', 'influence'].includes(s.category)).length || 1),
        } : null,
        readiness_contribution: readinessContribution,
      };

      const { data, error } = await supabase
        .from('succession_candidate_evidence')
        .insert(evidenceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['succession-candidate-evidence'] });
      toast.success('Succession evidence linked');
    },
    onError: (error) => {
      console.error('Error saving succession evidence:', error);
      toast.error('Failed to save succession evidence');
    },
  });
}

export function useNineBoxEvidenceSources(assessmentId?: string) {
  const queryClient = useQueryClient();

  return {
    getEvidence: async () => {
      if (!assessmentId) return [];
      
      const { data, error } = await supabase
        .from('nine_box_evidence_sources')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('axis')
        .order('created_at');

      if (error) throw error;
      return data as NineBoxEvidenceSource[];
    },
  };
}
