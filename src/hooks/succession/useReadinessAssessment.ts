import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ReadinessAssessmentForm {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  staff_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReadinessAssessmentCategory {
  id: string;
  company_id: string;
  form_id: string | null;
  category_name: string;
  sort_order: number;
}

export interface ReadinessAssessmentIndicator {
  id: string;
  form_id: string;
  category_id: string | null;
  indicator_name: string;
  assessor_type: string;
  weight_percent: number;
  rating_scale_max: number;
  scoring_guide_low: string | null;
  scoring_guide_mid: string | null;
  scoring_guide_high: string | null;
  sort_order: number;
  category?: ReadinessAssessmentCategory;
}

export interface ReadinessAssessmentEvent {
  id: string;
  company_id: string;
  candidate_id: string;
  form_id: string | null;
  initiated_by: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  overall_score: number | null;
  readiness_band: string | null;
  created_at: string;
  candidate?: {
    id: string;
    employee_id: string;
    employee?: {
      id: string;
      full_name: string;
    };
  };
  form?: ReadinessAssessmentForm;
  initiator?: {
    id: string;
    full_name: string;
  };
}

export interface ReadinessAssessmentResponse {
  id: string;
  event_id: string;
  indicator_id: string;
  assessor_id: string;
  assessor_type: string;
  rating: number;
  comments: string | null;
  submitted_at: string | null;
  indicator?: ReadinessAssessmentIndicator;
  assessor?: {
    id: string;
    full_name: string;
  };
}

export function useReadinessAssessment(companyId?: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Fetch all readiness assessment forms for a company
  const fetchForms = async () => {
    if (!companyId) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('readiness_assessment_forms')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;
      return data as ReadinessAssessmentForm[];
    } catch (error: any) {
      toast.error('Failed to fetch assessment forms: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new assessment form
  const createForm = async (form: Partial<ReadinessAssessmentForm>) => {
    if (!companyId) return null;
    try {
      const { data, error } = await supabase
        .from('readiness_assessment_forms')
        .insert({
          company_id: companyId,
          name: form.name!,
          description: form.description,
          staff_type: form.staff_type,
          is_active: form.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Assessment form created');
      return data as ReadinessAssessmentForm;
    } catch (error: any) {
      toast.error('Failed to create form: ' + error.message);
      return null;
    }
  };

  // Update an assessment form
  const updateForm = async (id: string, updates: Partial<ReadinessAssessmentForm>) => {
    try {
      const { data, error } = await supabase
        .from('readiness_assessment_forms')
        .update({
          name: updates.name,
          description: updates.description,
          staff_type: updates.staff_type,
          is_active: updates.is_active,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Assessment form updated');
      return data as ReadinessAssessmentForm;
    } catch (error: any) {
      toast.error('Failed to update form: ' + error.message);
      return null;
    }
  };

  // Fetch categories for a form
  const fetchCategories = async (formId?: string) => {
    if (!companyId) return [];
    try {
      let query = supabase
        .from('readiness_assessment_categories')
        .select('*')
        .eq('company_id', companyId)
        .order('sort_order');

      if (formId) {
        query = query.eq('form_id', formId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ReadinessAssessmentCategory[];
    } catch (error: any) {
      toast.error('Failed to fetch categories: ' + error.message);
      return [];
    }
  };

  // Create a category
  const createCategory = async (category: Partial<ReadinessAssessmentCategory>) => {
    if (!companyId) return null;
    try {
      const { data, error } = await supabase
        .from('readiness_assessment_categories')
        .insert({
          company_id: companyId,
          form_id: category.form_id,
          category_name: category.category_name!,
          sort_order: category.sort_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReadinessAssessmentCategory;
    } catch (error: any) {
      toast.error('Failed to create category: ' + error.message);
      return null;
    }
  };

  // Fetch indicators for a form
  const fetchIndicators = async (formId: string) => {
    try {
      const { data, error } = await supabase
        .from('readiness_assessment_indicators')
        .select(`
          *,
          category:readiness_assessment_categories(*)
        `)
        .eq('form_id', formId)
        .order('sort_order');

      if (error) throw error;
      return data as ReadinessAssessmentIndicator[];
    } catch (error: any) {
      toast.error('Failed to fetch indicators: ' + error.message);
      return [];
    }
  };

  // Create an indicator
  const createIndicator = async (indicator: Partial<ReadinessAssessmentIndicator>) => {
    try {
      const { data, error } = await supabase
        .from('readiness_assessment_indicators')
        .insert({
          form_id: indicator.form_id!,
          category_id: indicator.category_id,
          indicator_name: indicator.indicator_name!,
          assessor_type: indicator.assessor_type ?? 'manager',
          weight_percent: indicator.weight_percent ?? 1,
          rating_scale_max: indicator.rating_scale_max ?? 5,
          scoring_guide_low: indicator.scoring_guide_low,
          scoring_guide_mid: indicator.scoring_guide_mid,
          scoring_guide_high: indicator.scoring_guide_high,
          sort_order: indicator.sort_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReadinessAssessmentIndicator;
    } catch (error: any) {
      toast.error('Failed to create indicator: ' + error.message);
      return null;
    }
  };

  // Update an indicator
  const updateIndicator = async (id: string, updates: Partial<ReadinessAssessmentIndicator>) => {
    try {
      const { data, error } = await supabase
        .from('readiness_assessment_indicators')
        .update({
          indicator_name: updates.indicator_name,
          category_id: updates.category_id,
          assessor_type: updates.assessor_type,
          weight_percent: updates.weight_percent,
          rating_scale_max: updates.rating_scale_max,
          scoring_guide_low: updates.scoring_guide_low,
          scoring_guide_mid: updates.scoring_guide_mid,
          scoring_guide_high: updates.scoring_guide_high,
          sort_order: updates.sort_order,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ReadinessAssessmentIndicator;
    } catch (error: any) {
      toast.error('Failed to update indicator: ' + error.message);
      return null;
    }
  };

  // Delete an indicator
  const deleteIndicator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('readiness_assessment_indicators')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Indicator deleted');
      return true;
    } catch (error: any) {
      toast.error('Failed to delete indicator: ' + error.message);
      return false;
    }
  };

  // Fetch assessment events
  const fetchEvents = async (candidateId?: string) => {
    if (!companyId) return [];
    setLoading(true);
    try {
      let query = supabase
        .from('readiness_assessment_events')
        .select(`
          *,
          candidate:succession_candidates(
            id,
            employee_id
          ),
          form:readiness_assessment_forms(*),
          initiator:profiles!readiness_assessment_events_initiated_by_fkey(id, full_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (candidateId) {
        query = query.eq('candidate_id', candidateId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ReadinessAssessmentEvent[];
    } catch (error: any) {
      toast.error('Failed to fetch assessment events: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create an assessment event (HR initiates) with workflow integration
  const createEvent = async (event: {
    candidate_id: string;
    form_id?: string;
    due_date?: string;
  }) => {
    if (!companyId || !user?.id) return null;
    try {
      const { data, error } = await supabase
        .from('readiness_assessment_events')
        .insert({
          company_id: companyId,
          candidate_id: event.candidate_id,
          form_id: event.form_id,
          due_date: event.due_date,
          initiated_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Check if workflow is enabled for succession readiness approval
      const { data: transactionType } = await supabase
        .from('lookup_values')
        .select('id')
        .eq('category', 'transaction_type')
        .eq('code', 'SUCC_READINESS_APPROVAL')
        .maybeSingle();

      if (transactionType?.id) {
        const { data: workflowSetting } = await supabase
          .from('company_transaction_workflow_settings')
          .select('workflow_enabled, workflow_template_id, auto_start_workflow')
          .eq('company_id', companyId)
          .eq('transaction_type_id', transactionType.id)
          .maybeSingle();

        if (workflowSetting?.workflow_enabled && workflowSetting?.auto_start_workflow) {
          // Start workflow instance via edge function
          await supabase.functions.invoke('start-workflow', {
            body: {
              template_id: workflowSetting.workflow_template_id,
              reference_type: 'readiness_assessment_event',
              reference_id: data.id,
              company_id: companyId,
            }
          });
        }
      }

      toast.success('Assessment initiated');
      return data as ReadinessAssessmentEvent;
    } catch (error: any) {
      toast.error('Failed to initiate assessment: ' + error.message);
      return null;
    }
  };

  // Fetch responses for an event
  const fetchResponses = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('readiness_assessment_responses')
        .select(`
          *,
          indicator:readiness_assessment_indicators(*),
          assessor:profiles(id, full_name)
        `)
        .eq('event_id', eventId)
        .order('created_at');

      if (error) throw error;
      return data as ReadinessAssessmentResponse[];
    } catch (error: any) {
      toast.error('Failed to fetch responses: ' + error.message);
      return [];
    }
  };

  // Submit a response
  const submitResponse = async (response: {
    event_id: string;
    indicator_id: string;
    rating: number;
    comments?: string;
    assessor_type: string;
  }) => {
    if (!user?.id) return null;
    try {
      // Check if response already exists
      const { data: existing } = await supabase
        .from('readiness_assessment_responses')
        .select('id')
        .eq('event_id', response.event_id)
        .eq('indicator_id', response.indicator_id)
        .eq('assessor_id', user.id)
        .single();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('readiness_assessment_responses')
          .update({
            rating: response.rating,
            comments: response.comments,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as ReadinessAssessmentResponse;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('readiness_assessment_responses')
          .insert({
            event_id: response.event_id,
            indicator_id: response.indicator_id,
            assessor_id: user.id,
            assessor_type: response.assessor_type,
            rating: response.rating,
            comments: response.comments,
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data as ReadinessAssessmentResponse;
      }
    } catch (error: any) {
      toast.error('Failed to submit response: ' + error.message);
      return null;
    }
  };

  // Calculate and update overall score for an event
  const calculateOverallScore = async (eventId: string) => {
    try {
      // Get event with form
      const { data: event } = await supabase
        .from('readiness_assessment_events')
        .select('form_id')
        .eq('id', eventId)
        .single();

      if (!event?.form_id) return null;

      // Get all indicators with weights
      const { data: indicators } = await supabase
        .from('readiness_assessment_indicators')
        .select('id, weight_percent, rating_scale_max')
        .eq('form_id', event.form_id);

      if (!indicators?.length) return null;

      // Get all responses
      const { data: responses } = await supabase
        .from('readiness_assessment_responses')
        .select('indicator_id, rating')
        .eq('event_id', eventId)
        .not('submitted_at', 'is', null);

      if (!responses?.length) return null;

      // Calculate weighted average
      let totalWeight = 0;
      let weightedSum = 0;

      for (const indicator of indicators) {
        const response = responses.find(r => r.indicator_id === indicator.id);
        if (response) {
          const normalizedRating = (response.rating / indicator.rating_scale_max) * 100;
          weightedSum += normalizedRating * indicator.weight_percent;
          totalWeight += indicator.weight_percent;
        }
      }

      const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

      // Get readiness band
      const { data: bands } = await supabase
        .from('readiness_rating_bands')
        .select('rating_label, min_percentage, max_percentage')
        .eq('company_id', companyId)
        .order('sort_order');

      const band = bands?.find(b => 
        overallScore >= b.min_percentage && overallScore <= b.max_percentage
      );

      // Update event
      const { data: updated, error } = await supabase
        .from('readiness_assessment_events')
        .update({
          overall_score: overallScore,
          readiness_band: band?.rating_label || null,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      // Also update the candidate's readiness score
      const { data: eventData } = await supabase
        .from('readiness_assessment_events')
        .select('candidate_id')
        .eq('id', eventId)
        .single();

      if (eventData?.candidate_id) {
        await supabase
          .from('succession_candidates')
          .update({
            latest_readiness_score: overallScore,
            latest_readiness_band: band?.rating_label || null,
            readiness_assessed_at: new Date().toISOString(),
          })
          .eq('id', eventData.candidate_id);
      }

      toast.success('Assessment completed');
      return updated;
    } catch (error: any) {
      toast.error('Failed to calculate score: ' + error.message);
      return null;
    }
  };

  return {
    loading,
    // Forms
    fetchForms,
    createForm,
    updateForm,
    // Categories
    fetchCategories,
    createCategory,
    // Indicators
    fetchIndicators,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    // Events
    fetchEvents,
    createEvent,
    // Responses
    fetchResponses,
    submitResponse,
    calculateOverallScore,
  };
}
