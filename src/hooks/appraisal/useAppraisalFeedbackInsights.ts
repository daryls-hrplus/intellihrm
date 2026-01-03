import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TalentSignalSnapshot } from '@/types/talentSignals';
import type { AppraisalEvidenceUsage, CoachingPrompt, InsightCaution } from '@/types/developmentThemes';

interface AppraisalFeedbackInsights {
  signals: TalentSignalSnapshot[];
  coachingPrompts: CoachingPrompt[];
  cautions: InsightCaution[];
  evidenceUsage: AppraisalEvidenceUsage[];
}

// Fetch 360 insights for an appraisal participant
export function useAppraisalFeedbackInsights(participantId?: string, employeeId?: string) {
  return useQuery({
    queryKey: ['appraisal-feedback-insights', participantId, employeeId],
    queryFn: async (): Promise<AppraisalFeedbackInsights> => {
      if (!employeeId) {
        return { signals: [], coachingPrompts: [], cautions: [], evidenceUsage: [] };
      }

      // Fetch current talent signals for the employee
      const { data: signals, error: signalsError } = await supabase
        .from('talent_signal_snapshots')
        .select(`
          *,
          signal_definition:talent_signal_definitions(*)
        `)
        .eq('employee_id', employeeId)
        .eq('is_current', true)
        .order('computed_at', { ascending: false });

      if (signalsError) throw signalsError;

      const typedSignals = (signals || []) as unknown as TalentSignalSnapshot[];

      // Fetch evidence usage if participant exists
      let evidenceUsage: AppraisalEvidenceUsage[] = [];
      if (participantId) {
        const { data: usage, error: usageError } = await supabase
          .from('appraisal_evidence_usage')
          .select('*')
          .eq('participant_id', participantId);

        if (!usageError && usage) {
          evidenceUsage = usage as AppraisalEvidenceUsage[];
        }
      }

      // Generate coaching prompts based on signals
      const coachingPrompts = generateCoachingPrompts(typedSignals);
      
      // Generate cautions based on signal quality
      const cautions = generateInsightCautions(typedSignals);

      return {
        signals: typedSignals,
        coachingPrompts,
        cautions,
        evidenceUsage,
      };
    },
    enabled: !!employeeId,
  });
}

// Track when evidence is viewed
export function useTrackEvidenceView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      participantId, 
      evidenceType, 
      snapshotId 
    }: { 
      participantId: string; 
      evidenceType: string; 
      snapshotId?: string;
    }) => {
      // Check if already tracked
      const { data: existing } = await supabase
        .from('appraisal_evidence_usage')
        .select('id')
        .eq('participant_id', participantId)
        .eq('evidence_type', evidenceType)
        .maybeSingle();

      if (existing) {
        // Update view timestamp
        const { error } = await supabase
          .from('appraisal_evidence_usage')
          .update({ 
            was_viewed: true, 
            view_timestamp: new Date().toISOString() 
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('appraisal_evidence_usage')
          .insert({
            participant_id: participantId,
            evidence_type: evidenceType,
            source_snapshot_id: snapshotId,
            was_viewed: true,
            view_timestamp: new Date().toISOString(),
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisal-feedback-insights'] });
    },
  });
}

// Mark evidence as referenced in appraisal
export function useMarkEvidenceReferenced() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      participantId, 
      evidenceType 
    }: { 
      participantId: string; 
      evidenceType: string;
    }) => {
      const { data: existing } = await supabase
        .from('appraisal_evidence_usage')
        .select('id')
        .eq('participant_id', participantId)
        .eq('evidence_type', evidenceType)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('appraisal_evidence_usage')
          .update({ 
            was_referenced: true, 
            reference_timestamp: new Date().toISOString() 
          })
          .eq('id', existing.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisal-feedback-insights'] });
      toast.success('Evidence referenced in appraisal');
    },
  });
}

// Helper: Generate coaching prompts from signals
function generateCoachingPrompts(signals: TalentSignalSnapshot[]): CoachingPrompt[] {
  const prompts: CoachingPrompt[] = [];

  signals.forEach((signal, index) => {
    const score = signal.normalized_score || signal.signal_value || 0;
    const signalName = signal.signal_definition?.name || 'Unknown Signal';
    
    // Strength prompts (high scores)
    if (score >= 4) {
      prompts.push({
        id: `strength-${index}`,
        category: 'strength',
        prompt_text: `Ask how they've developed their ${signalName.toLowerCase()} skills`,
        context: `${signalName} rated highly across raters`,
        signal_code: signal.signal_definition?.code,
      });
    }
    
    // Development prompts (low scores)
    if (score <= 2.5 && score > 0) {
      prompts.push({
        id: `dev-${index}`,
        category: 'development',
        prompt_text: `Explore what support would help with ${signalName.toLowerCase()}`,
        context: `${signalName} has room for growth`,
        signal_code: signal.signal_definition?.code,
      });
    }

    // Blind spot prompts (large variance between rater groups)
    const raterBreakdown = signal.rater_breakdown as Record<string, { avg: number; count: number }> | null;
    if (raterBreakdown) {
      const avgs = Object.values(raterBreakdown).map(r => r.avg);
      const variance = Math.max(...avgs) - Math.min(...avgs);
      if (variance > 1.5) {
        prompts.push({
          id: `blind-${index}`,
          category: 'blind_spot',
          prompt_text: `Discuss varying perceptions of ${signalName.toLowerCase()} across different groups`,
          context: 'Different rater groups have divergent views',
          signal_code: signal.signal_definition?.code,
        });
      }
    }
  });

  // Add general exploration prompt
  prompts.push({
    id: 'explore-general',
    category: 'exploration',
    prompt_text: 'What surprised you most about your feedback?',
    context: 'General reflection prompt',
  });

  return prompts.slice(0, 8); // Limit to 8 prompts
}

// Helper: Generate insight cautions
function generateInsightCautions(signals: TalentSignalSnapshot[]): InsightCaution[] {
  const cautions: InsightCaution[] = [];

  signals.forEach((signal) => {
    // Low sample size warning
    if (signal.evidence_count < 3) {
      cautions.push({
        type: 'low_sample',
        severity: signal.evidence_count < 2 ? 'critical' : 'warning',
        message: `Low response count for ${signal.signal_definition?.name || 'this signal'}`,
        details: `Only ${signal.evidence_count} response(s). Interpret with caution.`,
      });
    }

    // High variance warning
    const summary = signal.evidence_summary as { score_range?: { min: number; max: number } } | null;
    if (summary?.score_range) {
      const range = summary.score_range.max - summary.score_range.min;
      if (range > 2.5) {
        cautions.push({
          type: 'high_variance',
          severity: 'warning',
          message: `High score variance for ${signal.signal_definition?.name || 'this signal'}`,
          details: `Scores ranged from ${summary.score_range.min} to ${summary.score_range.max}. Perceptions vary significantly.`,
        });
      }
    }

    // Low confidence warning
    if (signal.confidence_score && signal.confidence_score < 0.6) {
      cautions.push({
        type: 'single_source',
        severity: 'info',
        message: `Lower confidence for ${signal.signal_definition?.name || 'this signal'}`,
        details: 'Limited data sources or recency may affect reliability.',
      });
    }
  });

  // Deduplicate by type
  const uniqueCautions = cautions.reduce((acc, caution) => {
    const existing = acc.find(c => c.type === caution.type);
    if (!existing || caution.severity === 'critical') {
      return [...acc.filter(c => c.type !== caution.type), caution];
    }
    return acc;
  }, [] as InsightCaution[]);

  return uniqueCautions;
}
