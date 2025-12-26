import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  GoalRatingSubmission, 
  RatingSubmissionStatus, 
  DisputeCategory, 
  DisputeStatus 
} from '@/types/goalRatings';

interface UseGoalRatingSubmissionsOptions {
  companyId: string;
}

export function useGoalRatingSubmissions({ companyId }: UseGoalRatingSubmissionsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch submission for a specific goal
  const fetchSubmission = useCallback(async (goalId: string): Promise<GoalRatingSubmission | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('goal_rating_submissions')
        .select('*')
        .eq('goal_id', goalId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      return data as GoalRatingSubmission | null;
    } catch (err: any) {
      console.error('Error fetching rating submission:', err);
      return null;
    }
  }, []);

  // Fetch all submissions for an employee
  const fetchEmployeeSubmissions = useCallback(async (employeeId: string): Promise<GoalRatingSubmission[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('goal_rating_submissions')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return (data as GoalRatingSubmission[]) || [];
    } catch (err: any) {
      console.error('Error fetching employee submissions:', err);
      return [];
    }
  }, []);

  // Fetch submissions by status for manager view
  const fetchSubmissionsByStatus = useCallback(async (
    status: RatingSubmissionStatus | RatingSubmissionStatus[],
    managerId?: string
  ): Promise<GoalRatingSubmission[]> => {
    try {
      let query = supabase
        .from('goal_rating_submissions')
        .select('*')
        .eq('company_id', companyId);

      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }

      if (managerId) {
        query = query.eq('manager_id', managerId);
      }

      const { data, error: fetchError } = await query.order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      return (data as GoalRatingSubmission[]) || [];
    } catch (err: any) {
      console.error('Error fetching submissions by status:', err);
      return [];
    }
  }, [companyId]);

  // Fetch disputed submissions
  const fetchDisputedSubmissions = useCallback(async (): Promise<GoalRatingSubmission[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('goal_rating_submissions')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_disputed', true)
        .order('disputed_at', { ascending: false });

      if (fetchError) throw fetchError;
      return (data as GoalRatingSubmission[]) || [];
    } catch (err: any) {
      console.error('Error fetching disputed submissions:', err);
      return [];
    }
  }, [companyId]);

  // Create or update submission with self-rating
  const submitSelfRating = async (
    goalId: string,
    employeeId: string,
    rating: number,
    comments?: string,
    configId?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if submission exists
      const existing = await fetchSubmission(goalId);

      if (existing) {
        const { data, error: updateError } = await supabase
          .from('goal_rating_submissions')
          .update({
            self_rating: rating,
            self_rating_at: new Date().toISOString(),
            self_comments: comments || null,
            status: 'self_submitted',
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return { data, error: null };
      } else {
        const { data, error: insertError } = await supabase
          .from('goal_rating_submissions')
          .insert({
            goal_id: goalId,
            company_id: companyId,
            employee_id: employeeId,
            rating_config_id: configId || null,
            self_rating: rating,
            self_rating_at: new Date().toISOString(),
            self_comments: comments || null,
            status: 'self_submitted',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return { data, error: null };
      }
    } catch (err: any) {
      console.error('Error submitting self-rating:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Submit manager rating
  const submitManagerRating = async (
    goalId: string,
    managerId: string,
    rating: number,
    comments?: string,
    calculatedScore?: number,
    finalScore?: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const existing = await fetchSubmission(goalId);

      if (!existing) {
        throw new Error('No submission found for this goal');
      }

      const { data, error: updateError } = await supabase
        .from('goal_rating_submissions')
        .update({
          manager_rating: rating,
          manager_id: managerId,
          manager_rating_at: new Date().toISOString(),
          manager_comments: comments || null,
          calculated_score: calculatedScore || null,
          final_score: finalScore || rating,
          status: 'manager_submitted',
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error submitting manager rating:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Release rating to employee
  const releaseRating = async (submissionId: string, releasedBy: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('goal_rating_submissions')
        .update({
          status: 'released',
          released_at: new Date().toISOString(),
          released_by: releasedBy,
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error releasing rating:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Employee acknowledges rating
  const acknowledgeRating = async (
    submissionId: string,
    acknowledgedBy: string,
    comments?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('goal_rating_submissions')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: acknowledgedBy,
          acknowledgment_comments: comments || null,
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error acknowledging rating:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Initiate dispute
  const disputeRating = async (
    submissionId: string,
    reason: string,
    category: DisputeCategory
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('goal_rating_submissions')
        .update({
          status: 'disputed',
          is_disputed: true,
          disputed_at: new Date().toISOString(),
          dispute_reason: reason,
          dispute_category: category,
          dispute_status: 'open',
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error disputing rating:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve dispute (HR/Admin)
  const resolveDispute = async (
    submissionId: string,
    resolvedBy: string,
    resolution: string,
    status: DisputeStatus,
    adjustedFinalScore?: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const updates: Record<string, unknown> = {
        dispute_status: status,
        dispute_resolution: resolution,
        dispute_resolved_at: new Date().toISOString(),
        dispute_resolved_by: resolvedBy,
      };

      // If resolved with adjustment, update final score and change status back
      if (status === 'resolved' && adjustedFinalScore !== undefined) {
        updates.final_score = adjustedFinalScore;
        updates.status = 'released';
        updates.is_disputed = false;
      } else if (status === 'rejected') {
        updates.status = 'released';
        updates.is_disputed = false;
      }

      const { data, error: updateError } = await supabase
        .from('goal_rating_submissions')
        .update(updates)
        .eq('id', submissionId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error resolving dispute:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate weight-adjusted score
  const calculateWeightAdjustedScore = (
    finalScore: number,
    goalWeight: number,
    maxRating: number = 5
  ): number => {
    return (finalScore / maxRating) * goalWeight;
  };

  return {
    isLoading,
    error,
    fetchSubmission,
    fetchEmployeeSubmissions,
    fetchSubmissionsByStatus,
    fetchDisputedSubmissions,
    submitSelfRating,
    submitManagerRating,
    releaseRating,
    acknowledgeRating,
    disputeRating,
    resolveDispute,
    calculateWeightAdjustedScore,
  };
}
