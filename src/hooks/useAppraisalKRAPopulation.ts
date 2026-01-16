import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppraisalKRASnapshot, AssessmentMode } from '@/types/appraisalKRASnapshot';

interface JobResponsibilityKRA {
  id: string;
  name: string;
  job_specific_target: string | null;
  weight: number;
  measurement_method: string | null;
  responsibility_kra_id: string | null;
  responsibility_kras?: {
    id: string;
    name: string;
    description: string | null;
    target_metric: string | null;
  };
}

interface JobResponsibilityWithKRAs {
  id: string;
  responsibility_id: string;
  weighting: number;
  assessment_mode: AssessmentMode;
  responsibilities: {
    id: string;
    name: string;
    description: string | null;
  };
  job_responsibility_kras: JobResponsibilityKRA[];
}

export function useAppraisalKRAPopulation() {
  const [isPopulating, setIsPopulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Populate KRA snapshots for a participant based on their job responsibilities
   * This creates a snapshot of KRAs at the time of appraisal for audit and accurate rating
   */
  const populateKRAsForParticipant = useCallback(async (
    participantId: string,
    jobId: string,
    companyId?: string
  ): Promise<{ populated: number; skipped: number; error: string | null }> => {
    setIsPopulating(true);
    setError(null);

    try {
      // 1. Get all job responsibilities with their KRAs and assessment mode
      const { data: jobResps, error: fetchError } = await supabase
        .from('job_responsibilities')
        .select(`
          id,
          responsibility_id,
          weighting,
          assessment_mode,
          responsibilities (id, name, description),
          job_responsibility_kras (
            id,
            name,
            job_specific_target,
            weight,
            measurement_method,
            responsibility_kra_id,
            responsibility_kras (
              id, name, description, target_metric
            )
          )
        `)
        .eq('job_id', jobId)
        .is('end_date', null);

      if (fetchError) throw fetchError;

      const responsibilities = (jobResps || []) as unknown as JobResponsibilityWithKRAs[];

      // 2. Check for existing snapshots to avoid duplicates
      const { data: existingSnapshots } = await supabase
        .from('appraisal_kra_snapshots')
        .select('responsibility_id, source_kra_id')
        .eq('participant_id', participantId);

      const existingKeys = new Set(
        (existingSnapshots || []).map(s => `${s.responsibility_id}-${s.source_kra_id}`)
      );

      let populated = 0;
      let skipped = 0;
      const snapshotsToCreate: Partial<AppraisalKRASnapshot>[] = [];

      // 3. For each responsibility, check assessment mode and create snapshots
      for (const resp of responsibilities) {
        const mode = resp.assessment_mode || 'auto';
        const hasJobKRAs = resp.job_responsibility_kras && resp.job_responsibility_kras.length > 0;

        // Determine effective mode
        const effectiveMode: AssessmentMode = mode === 'auto' 
          ? (hasJobKRAs ? 'kra_based' : 'responsibility_only')
          : mode;

        // Only create KRA snapshots for kra_based or hybrid modes
        if (effectiveMode === 'responsibility_only') {
          skipped++;
          continue;
        }

        // If no job-specific KRAs exist, fall back to base responsibility KRAs
        if (!hasJobKRAs) {
          // Fetch base responsibility KRAs
          const { data: baseKRAs } = await supabase
            .from('responsibility_kras')
            .select('*')
            .eq('responsibility_id', resp.responsibility_id)
            .eq('is_active', true)
            .order('sequence_order');

          for (const kra of baseKRAs || []) {
            const key = `${resp.responsibility_id}-${kra.id}`;
            if (existingKeys.has(key)) {
              skipped++;
              continue;
            }

            snapshotsToCreate.push({
              participant_id: participantId,
              responsibility_id: resp.responsibility_id,
              company_id: companyId || null,
              source_kra_id: kra.id,
              job_kra_id: null,
              name: kra.name,
              description: kra.description,
              target_metric: kra.target_metric,
              job_specific_target: null,
              measurement_method: kra.measurement_method,
              weight: kra.weight,
              sequence_order: kra.sequence_order,
              status: 'pending',
              evidence_urls: [],
            });
            populated++;
          }
        } else {
          // Use job-specific KRAs
          for (const jobKra of resp.job_responsibility_kras) {
            const sourceKraId = jobKra.responsibility_kra_id;
            const key = `${resp.responsibility_id}-${sourceKraId || jobKra.id}`;
            
            if (existingKeys.has(key)) {
              skipped++;
              continue;
            }

            snapshotsToCreate.push({
              participant_id: participantId,
              responsibility_id: resp.responsibility_id,
              company_id: companyId || null,
              source_kra_id: sourceKraId,
              job_kra_id: jobKra.id,
              name: jobKra.name || jobKra.responsibility_kras?.name || 'Unknown KRA',
              description: jobKra.responsibility_kras?.description || null,
              target_metric: jobKra.responsibility_kras?.target_metric || null,
              job_specific_target: jobKra.job_specific_target,
              measurement_method: jobKra.measurement_method,
              weight: jobKra.weight,
              sequence_order: 0, // Will be set based on array index
              status: 'pending',
              evidence_urls: [],
            });
            populated++;
          }
        }
      }

      // 4. Batch insert all snapshots
      if (snapshotsToCreate.length > 0) {
        const insertData = snapshotsToCreate.map((s, idx) => ({
          participant_id: s.participant_id!,
          responsibility_id: s.responsibility_id!,
          company_id: s.company_id,
          source_kra_id: s.source_kra_id,
          job_kra_id: s.job_kra_id,
          name: s.name!,
          description: s.description,
          target_metric: s.target_metric,
          job_specific_target: s.job_specific_target,
          measurement_method: s.measurement_method,
          weight: s.weight ?? 0,
          sequence_order: s.sequence_order || idx,
          status: s.status || 'pending',
          evidence_urls: s.evidence_urls || [],
        }));
        
        // Cast to any to handle types not yet regenerated after migration
        const { error: insertError } = await (supabase
          .from('appraisal_kra_snapshots') as any)
          .insert(insertData);
        if (insertError) throw insertError;
      }

      return { populated, skipped, error: null };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to populate KRAs';
      setError(errorMsg);
      return { populated: 0, skipped: 0, error: errorMsg };
    } finally {
      setIsPopulating(false);
    }
  }, []);

  /**
   * Get KRA snapshots for a specific responsibility in an appraisal
   */
  const getKRASnapshots = useCallback(async (
    participantId: string,
    responsibilityId: string
  ): Promise<AppraisalKRASnapshot[]> => {
    try {
      const { data, error } = await supabase
        .from('appraisal_kra_snapshots')
        .select('*')
        .eq('participant_id', participantId)
        .eq('responsibility_id', responsibilityId)
        .order('sequence_order');

      if (error) throw error;
      return (data || []) as AppraisalKRASnapshot[];
    } catch (err) {
      console.error('Error fetching KRA snapshots:', err);
      return [];
    }
  }, []);

  /**
   * Get all KRA snapshots for a participant
   */
  const getAllKRASnapshots = useCallback(async (
    participantId: string
  ): Promise<AppraisalKRASnapshot[]> => {
    try {
      const { data, error } = await supabase
        .from('appraisal_kra_snapshots')
        .select('*')
        .eq('participant_id', participantId)
        .order('responsibility_id')
        .order('sequence_order');

      if (error) throw error;
      return (data || []) as AppraisalKRASnapshot[];
    } catch (err) {
      console.error('Error fetching all KRA snapshots:', err);
      return [];
    }
  }, []);

  /**
   * Update a KRA snapshot rating (self or manager)
   */
  const updateKRASnapshotRating = useCallback(async (
    snapshotId: string,
    isManager: boolean,
    rating: number,
    comments?: string,
    managerId?: string
  ): Promise<{ success: boolean; error: string | null }> => {
    try {
      const now = new Date().toISOString();
      const updates: Partial<AppraisalKRASnapshot> = isManager
        ? {
            manager_rating: rating,
            manager_comments: comments || null,
            manager_rated_at: now,
            manager_id: managerId || null,
            status: 'manager_rated',
          }
        : {
            self_rating: rating,
            self_comments: comments || null,
            self_rated_at: now,
            status: 'self_rated',
          };

      // Calculate scores
      if (isManager && rating) {
        // Get self rating to calculate average
        const { data: snapshot } = await supabase
          .from('appraisal_kra_snapshots')
          .select('self_rating, weight')
          .eq('id', snapshotId)
          .single();

        if (snapshot) {
          const selfRating = snapshot.self_rating || rating;
          const calculatedScore = (selfRating + rating) / 2;
          const weightAdjustedScore = calculatedScore * (snapshot.weight / 100);
          
          updates.calculated_score = calculatedScore;
          updates.final_score = rating; // Manager rating as final
          updates.weight_adjusted_score = weightAdjustedScore;
          updates.status = 'completed';
        }
      }

      const { error } = await supabase
        .from('appraisal_kra_snapshots')
        .update(updates)
        .eq('id', snapshotId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Calculate rollup score for a responsibility from its KRA snapshots
   */
  const calculateResponsibilityRollup = useCallback(async (
    participantId: string,
    responsibilityId: string
  ): Promise<number | null> => {
    const snapshots = await getKRASnapshots(participantId, responsibilityId);
    
    if (snapshots.length === 0) return null;

    let totalWeight = 0;
    let weightedSum = 0;

    for (const snapshot of snapshots) {
      const score = snapshot.final_score || snapshot.manager_rating || snapshot.self_rating;
      if (score !== null && snapshot.weight > 0) {
        weightedSum += score * snapshot.weight;
        totalWeight += snapshot.weight;
      }
    }

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  }, [getKRASnapshots]);

  /**
   * Get assessment mode for a job responsibility
   */
  const getAssessmentMode = useCallback(async (
    jobResponsibilityId: string
  ): Promise<AssessmentMode> => {
    try {
      const { data, error } = await supabase
        .from('job_responsibilities')
        .select('assessment_mode')
        .eq('id', jobResponsibilityId)
        .single();

      if (error) throw error;
      return (data?.assessment_mode as AssessmentMode) || 'auto';
    } catch (err) {
      console.error('Error fetching assessment mode:', err);
      return 'auto';
    }
  }, []);

  return {
    isPopulating,
    error,
    populateKRAsForParticipant,
    getKRASnapshots,
    getAllKRASnapshots,
    updateKRASnapshotRating,
    calculateResponsibilityRollup,
    getAssessmentMode,
  };
}
