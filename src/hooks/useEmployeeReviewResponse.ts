import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Response types
export type ResponseType = 'agree' | 'agree_with_comments' | 'disagree' | 'partial_disagree';
export type ResponseStatus = 'draft' | 'submitted' | 'hr_review' | 'manager_responded' | 'closed';
export type EscalationCategory = 'clarification_needed' | 'process_concern' | 'rating_discussion' | 'manager_feedback' | 'other';
export type HRAction = 'no_action' | 'manager_discussion' | 'rating_adjusted' | 'escalated_to_dispute' | 'closed';

export interface SpecificDisagreement {
  area: 'goals' | 'competencies' | 'responsibilities' | 'values' | 'overall';
  item_id?: string;
  item_title?: string;
  original_rating: number;
  expected_rating: number;
  reason: string;
}

export interface EmployeeReviewResponse {
  id: string;
  company_id: string;
  appraisal_participant_id: string | null;
  goal_rating_submission_id: string | null;
  employee_id: string;
  manager_id: string | null;
  response_type: ResponseType;
  employee_comments: string | null;
  specific_disagreements: SpecificDisagreement[];
  is_escalated_to_hr: boolean;
  escalation_reason: string | null;
  escalation_category: EscalationCategory | null;
  escalated_at: string | null;
  hr_reviewer_id: string | null;
  hr_response: string | null;
  hr_reviewed_at: string | null;
  hr_action_taken: HRAction | null;
  manager_rebuttal: string | null;
  manager_rebuttal_at: string | null;
  visible_to_manager: boolean;
  visible_to_hr: boolean;
  visible_in_record: boolean;
  status: ResponseStatus;
  submitted_at: string | null;
  response_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeResponseConfiguration {
  id: string;
  company_id: string;
  cycle_id: string | null;
  is_enabled: boolean;
  response_window_days: number;
  allow_late_responses: boolean;
  allow_disagree: boolean;
  allow_partial_disagree: boolean;
  allow_hr_escalation: boolean;
  require_comments_for_disagree: boolean;
  show_response_to_manager: boolean;
  allow_manager_rebuttal: boolean;
  include_in_permanent_record: boolean;
  notify_hr_on_disagreement: boolean;
  notify_hr_on_escalation: boolean;
  auto_escalate_on_disagree: boolean;
  created_at: string;
  updated_at: string;
}

interface SubmitResponseParams {
  appraisalParticipantId?: string;
  goalRatingSubmissionId?: string;
  managerId?: string;
  responseType: ResponseType;
  employeeComments?: string;
  specificDisagreements?: SpecificDisagreement[];
  isEscalatedToHr?: boolean;
  escalationReason?: string;
  escalationCategory?: EscalationCategory;
  responseDeadline?: string;
}

interface UseEmployeeReviewResponseOptions {
  companyId: string;
}

export function useEmployeeReviewResponse({ companyId }: UseEmployeeReviewResponseOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch configuration for company/cycle
  const fetchConfiguration = useCallback(async (cycleId?: string): Promise<EmployeeResponseConfiguration | null> => {
    try {
      let query = supabase
        .from('employee_response_configuration')
        .select('*')
        .eq('company_id', companyId);

      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      } else {
        query = query.is('cycle_id', null);
      }

      const { data, error: fetchError } = await query.maybeSingle();
      if (fetchError) throw fetchError;
      return data as EmployeeResponseConfiguration | null;
    } catch (err: any) {
      console.error('Error fetching response configuration:', err);
      return null;
    }
  }, [companyId]);

  // Fetch employee's responses
  const { data: myResponses, isLoading: responsesLoading, refetch: refetchResponses } = useQuery({
    queryKey: ['employee-review-responses', user?.id, companyId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('employee_review_responses')
        .select('*')
        .eq('employee_id', user.id)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        specific_disagreements: (item.specific_disagreements || []) as unknown as SpecificDisagreement[],
      })) as EmployeeReviewResponse[];
    },
    enabled: !!user?.id && !!companyId,
  });

  // Fetch response for specific appraisal
  const fetchResponseForAppraisal = useCallback(async (appraisalParticipantId: string): Promise<EmployeeReviewResponse | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('employee_review_responses')
        .select('*')
        .eq('appraisal_participant_id', appraisalParticipantId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) return null;
      return {
        ...data,
        specific_disagreements: (data.specific_disagreements || []) as unknown as SpecificDisagreement[],
      } as EmployeeReviewResponse;
    } catch (err: any) {
      console.error('Error fetching response for appraisal:', err);
      return null;
    }
  }, []);

  // Fetch pending responses (appraisals awaiting employee response)
  const { data: pendingAppraisals, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-review-responses', user?.id, companyId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get appraisals with manager_submitted status that don't have a response yet
      const { data, error } = await supabase
        .from('appraisal_participants')
        .select(`
          id,
          employee_id,
          cycle_id,
          status,
          employee_response_status,
          employee_response_due_at,
          has_employee_response,
          overall_score,
          goal_score,
          competency_score,
          responsibility_score,
          final_comments,
          appraisal_cycles!inner (
            id,
            name,
            status,
            company_id
          )
        `)
        .eq('employee_id', user.id)
        .eq('appraisal_cycles.company_id', companyId)
        .in('status', ['manager_submitted', 'pending_response', 'awaiting_employee_response'])
        .eq('has_employee_response', false);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!companyId,
  });

  // Submit employee response
  const submitResponse = async (params: SubmitResponseParams) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const responseData: Record<string, unknown> = {
        company_id: companyId,
        employee_id: user.id,
        appraisal_participant_id: params.appraisalParticipantId || null,
        goal_rating_submission_id: params.goalRatingSubmissionId || null,
        manager_id: params.managerId || null,
        response_type: params.responseType,
        employee_comments: params.employeeComments || null,
        specific_disagreements: JSON.stringify(params.specificDisagreements || []),
        is_escalated_to_hr: params.isEscalatedToHr || false,
        escalation_reason: params.escalationReason || null,
        escalation_category: params.escalationCategory || null,
        escalated_at: params.isEscalatedToHr ? new Date().toISOString() : null,
        status: 'submitted' as ResponseStatus,
        submitted_at: new Date().toISOString(),
        response_deadline: params.responseDeadline || null,
        visible_to_manager: true,
        visible_to_hr: true,
        visible_in_record: true,
      };

      const { data, error: insertError } = await supabase
        .from('employee_review_responses')
        .insert(responseData as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update appraisal participant status
      if (params.appraisalParticipantId) {
        const updateData: Record<string, unknown> = {
          has_employee_response: true,
          employee_response_status: params.isEscalatedToHr ? 'escalated' : 'responded',
        };

        await supabase
          .from('appraisal_participants')
          .update(updateData)
          .eq('id', params.appraisalParticipantId);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['employee-review-responses'] });
      queryClient.invalidateQueries({ queryKey: ['pending-review-responses'] });
      queryClient.invalidateQueries({ queryKey: ['my-appraisals'] });

      return { data, error: null };
    } catch (err: any) {
      console.error('Error submitting response:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Escalate to HR
  const escalateToHR = async (
    responseId: string,
    reason: string,
    category: EscalationCategory
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('employee_review_responses')
        .update({
          is_escalated_to_hr: true,
          escalation_reason: reason,
          escalation_category: category,
          escalated_at: new Date().toISOString(),
          status: 'hr_review',
        })
        .eq('id', responseId)
        .select()
        .single();

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['employee-review-responses'] });
      return { data, error: null };
    } catch (err: any) {
      console.error('Error escalating to HR:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // HR respond to escalation
  const respondToEscalation = async (
    responseId: string,
    hrResponse: string,
    action: HRAction
  ) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('employee_review_responses')
        .update({
          hr_reviewer_id: user.id,
          hr_response: hrResponse,
          hr_reviewed_at: new Date().toISOString(),
          hr_action_taken: action,
          status: action === 'escalated_to_dispute' ? 'hr_review' : 'closed',
        })
        .eq('id', responseId)
        .select()
        .single();

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['employee-review-responses'] });
      queryClient.invalidateQueries({ queryKey: ['hr-response-escalations'] });
      return { data, error: null };
    } catch (err: any) {
      console.error('Error responding to escalation:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Manager add rebuttal
  const addManagerRebuttal = async (responseId: string, rebuttal: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('employee_review_responses')
        .update({
          manager_rebuttal: rebuttal,
          manager_rebuttal_at: new Date().toISOString(),
          status: 'manager_responded',
        })
        .eq('id', responseId)
        .select()
        .single();

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['employee-review-responses'] });
      return { data, error: null };
    } catch (err: any) {
      console.error('Error adding manager rebuttal:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if response is required for an appraisal
  const isResponseRequired = useCallback((appraisalStatus: string): boolean => {
    return ['manager_submitted', 'pending_response', 'awaiting_employee_response'].includes(appraisalStatus);
  }, []);

  // Get response type label
  const getResponseTypeLabel = (type: ResponseType): string => {
    const labels: Record<ResponseType, string> = {
      agree: 'Agree',
      agree_with_comments: 'Agree with Comments',
      disagree: 'Disagree',
      partial_disagree: 'Partially Disagree',
    };
    return labels[type];
  };

  // Get escalation category label
  const getEscalationCategoryLabel = (category: EscalationCategory): string => {
    const labels: Record<EscalationCategory, string> = {
      clarification_needed: 'Clarification Needed',
      process_concern: 'Process Concern',
      rating_discussion: 'Rating Discussion',
      manager_feedback: 'Manager Feedback',
      other: 'Other',
    };
    return labels[category];
  };

  return {
    // State
    isLoading: isLoading || responsesLoading || pendingLoading,
    error,
    
    // Data
    myResponses: myResponses || [],
    pendingAppraisals: pendingAppraisals || [],
    
    // Actions
    fetchConfiguration,
    fetchResponseForAppraisal,
    submitResponse,
    escalateToHR,
    respondToEscalation,
    addManagerRebuttal,
    refetchResponses,
    
    // Helpers
    isResponseRequired,
    getResponseTypeLabel,
    getEscalationCategoryLabel,
  };
}

// HR-specific hook for managing escalations
export function useHRResponseEscalations(companyId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all escalations for company
  const { data: escalations, isLoading, refetch } = useQuery({
    queryKey: ['hr-response-escalations', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_review_responses')
        .select(`
          *,
          employee:profiles!employee_review_responses_employee_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          manager:profiles!employee_review_responses_manager_id_fkey (
            id,
            first_name,
            last_name
          ),
          hr_reviewer:profiles!employee_review_responses_hr_reviewer_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('company_id', companyId)
        .eq('is_escalated_to_hr', true)
        .order('escalated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  // Get pending escalations
  const pendingEscalations = (escalations || []).filter(
    (e: any) => e.status === 'hr_review' || (e.is_escalated_to_hr && !e.hr_reviewed_at)
  );

  // Get resolved escalations
  const resolvedEscalations = (escalations || []).filter(
    (e: any) => e.hr_reviewed_at !== null
  );

  return {
    escalations: escalations || [],
    pendingEscalations,
    resolvedEscalations,
    isLoading,
    refetch,
  };
}
