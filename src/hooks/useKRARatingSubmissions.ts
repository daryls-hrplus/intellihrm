import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KRARatingSubmission, ResponsibilityKRA, KRAWithRating } from '@/types/responsibilityKRA';

interface UseKRARatingSubmissionsOptions {
  participantId?: string;
  companyId?: string;
}

export function useKRARatingSubmissions({ participantId, companyId }: UseKRARatingSubmissionsOptions = {}) {
  const [ratings, setRatings] = useState<KRARatingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async (partId?: string, responsibilityId?: string) => {
    const targetParticipantId = partId || participantId;
    if (!targetParticipantId) return [];

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('kra_rating_submissions')
        .select(`
          *,
          responsibility_kra:responsibility_kras(*)
        `)
        .eq('participant_id', targetParticipantId);

      if (responsibilityId) {
        query = query.eq('responsibility_id', responsibilityId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const mapped = (data || []).map((r: any) => ({
        ...r,
        evidence_urls: Array.isArray(r.evidence_urls) ? r.evidence_urls : [],
        responsibility_kra: r.responsibility_kra as ResponsibilityKRA,
      })) as KRARatingSubmission[];

      setRatings(mapped);
      return mapped;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [participantId]);

  const fetchKRAsWithRatings = useCallback(async (
    partId: string, 
    responsibilityId: string
  ): Promise<KRAWithRating[]> => {
    try {
      // Fetch all KRAs for this responsibility
      const { data: kras, error: krasError } = await supabase
        .from('responsibility_kras')
        .select('*')
        .eq('responsibility_id', responsibilityId)
        .eq('is_active', true)
        .order('sequence_order', { ascending: true });

      if (krasError) throw krasError;

      // Fetch existing ratings
      const { data: existingRatings, error: ratingsError } = await supabase
        .from('kra_rating_submissions')
        .select('*')
        .eq('participant_id', partId)
        .eq('responsibility_id', responsibilityId);

      if (ratingsError) throw ratingsError;

      // Map ratings to KRAs
      const ratingMap = new Map<string, KRARatingSubmission>();
      (existingRatings || []).forEach((r: any) => {
        ratingMap.set(r.responsibility_kra_id, {
          ...r,
          evidence_urls: Array.isArray(r.evidence_urls) ? r.evidence_urls : [],
        });
      });

      return (kras || []).map((kra: any) => ({
        ...kra,
        rating: ratingMap.get(kra.id) || null,
      }));
    } catch (err: any) {
      console.error('Error fetching KRAs with ratings:', err);
      return [];
    }
  }, []);

  const submitSelfRating = async (
    kraId: string,
    responsibilityId: string,
    rating: number,
    comments?: string,
    partId?: string
  ) => {
    const targetParticipantId = partId || participantId;
    if (!targetParticipantId) return { data: null, error: 'No participant ID' };

    try {
      // Check for existing submission
      const { data: existing } = await supabase
        .from('kra_rating_submissions')
        .select('id')
        .eq('participant_id', targetParticipantId)
        .eq('responsibility_kra_id', kraId)
        .single();

      const now = new Date().toISOString();
      
      if (existing) {
        const { data: result, error: updateError } = await supabase
          .from('kra_rating_submissions')
          .update({
            self_rating: rating,
            self_rating_at: now,
            self_comments: comments || null,
            status: 'self_rated',
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return { data: result as KRARatingSubmission, error: null };
      } else {
        const { data: result, error: insertError } = await supabase
          .from('kra_rating_submissions')
          .insert({
            participant_id: targetParticipantId,
            responsibility_kra_id: kraId,
            responsibility_id: responsibilityId,
            company_id: companyId,
            self_rating: rating,
            self_rating_at: now,
            self_comments: comments || null,
            status: 'self_rated',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return { data: result as KRARatingSubmission, error: null };
      }
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const submitManagerRating = async (
    kraId: string,
    responsibilityId: string,
    managerId: string,
    rating: number,
    comments?: string,
    partId?: string
  ) => {
    const targetParticipantId = partId || participantId;
    if (!targetParticipantId) return { data: null, error: 'No participant ID' };

    try {
      // Get KRA weight for calculation
      const { data: kra } = await supabase
        .from('responsibility_kras')
        .select('weight')
        .eq('id', kraId)
        .single();

      const kraWeight = kra?.weight || 0;
      const now = new Date().toISOString();

      // Check for existing submission
      const { data: existing } = await supabase
        .from('kra_rating_submissions')
        .select('id, self_rating')
        .eq('participant_id', targetParticipantId)
        .eq('responsibility_kra_id', kraId)
        .single();

      // Calculate final score (average of self and manager, or just manager if no self)
      const selfRating = existing?.self_rating;
      const finalScore = selfRating !== null && selfRating !== undefined
        ? (selfRating + rating) / 2
        : rating;
      
      const weightAdjustedScore = (finalScore / 5) * kraWeight;

      if (existing) {
        const { data: result, error: updateError } = await supabase
          .from('kra_rating_submissions')
          .update({
            manager_rating: rating,
            manager_id: managerId,
            manager_rating_at: now,
            manager_comments: comments || null,
            calculated_score: rating,
            final_score: finalScore,
            weight_adjusted_score: weightAdjustedScore,
            status: 'completed',
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return { data: result as KRARatingSubmission, error: null };
      } else {
        const { data: result, error: insertError } = await supabase
          .from('kra_rating_submissions')
          .insert({
            participant_id: targetParticipantId,
            responsibility_kra_id: kraId,
            responsibility_id: responsibilityId,
            company_id: companyId,
            manager_rating: rating,
            manager_id: managerId,
            manager_rating_at: now,
            manager_comments: comments || null,
            calculated_score: rating,
            final_score: rating,
            weight_adjusted_score: (rating / 5) * kraWeight,
            status: 'manager_rated',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return { data: result as KRARatingSubmission, error: null };
      }
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const calculateResponsibilityRollup = (kraRatings: KRARatingSubmission[], kraList: ResponsibilityKRA[]): number => {
    if (kraRatings.length === 0 || kraList.length === 0) return 0;

    let totalWeight = 0;
    let weightedSum = 0;

    kraList.forEach(kra => {
      const rating = kraRatings.find(r => r.responsibility_kra_id === kra.id);
      if (rating?.final_score !== null && rating?.final_score !== undefined) {
        weightedSum += rating.final_score * kra.weight;
        totalWeight += kra.weight;
      }
    });

    if (totalWeight === 0) return 0;
    return Math.round((weightedSum / totalWeight) * 100) / 100;
  };

  return {
    ratings,
    isLoading,
    error,
    fetchRatings,
    fetchKRAsWithRatings,
    submitSelfRating,
    submitManagerRating,
    calculateResponsibilityRollup,
  };
}
