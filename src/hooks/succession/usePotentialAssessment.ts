import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTodayString } from "@/utils/dateUtils";

export interface PotentialAssessmentTemplate {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PotentialAssessmentQuestion {
  id: string;
  template_id: string;
  question_text: string;
  question_category: string;
  display_order: number;
  is_required: boolean;
  created_at: string;
}

export interface PotentialAssessment {
  id: string;
  employee_id: string;
  assessed_by: string | null;
  template_id: string | null;
  company_id: string;
  assessment_date: string;
  total_points: number | null;
  calculated_rating: number | null;
  override_rating: number | null;
  override_reason: string | null;
  is_current: boolean;
  created_at: string;
}

export interface PotentialAssessmentResponse {
  id: string;
  assessment_id: string;
  question_id: string | null;
  scale_value: number;
  points_earned: number;
  notes: string | null;
  created_at: string;
}

export const DEFAULT_QUESTIONS = [
  { question_text: 'Quickly learns and applies new concepts in unfamiliar situations', question_category: 'learning_agility', display_order: 1 },
  { question_text: 'Seeks feedback and learns from mistakes without becoming defensive', question_category: 'learning_agility', display_order: 2 },
  { question_text: 'Inspires and motivates others toward shared goals', question_category: 'leadership', display_order: 3 },
  { question_text: 'Builds effective teams and develops talent', question_category: 'leadership', display_order: 4 },
  { question_text: 'Demonstrates ambition and willingness to take on stretch assignments', question_category: 'drive', display_order: 5 },
  { question_text: 'Shows resilience when facing setbacks', question_category: 'drive', display_order: 6 },
  { question_text: 'Thrives in ambiguous situations with limited guidance', question_category: 'adaptability', display_order: 7 },
  { question_text: 'Embraces change and helps others navigate transitions', question_category: 'adaptability', display_order: 8 },
];

export const SCALE_OPTIONS = [
  { value: 1, label: 'Disagree', points: 1 },
  { value: 2, label: 'Agree', points: 2 },
  { value: 3, label: 'Strongly Agree', points: 3 },
];

export function calculatePotentialRating(totalPoints: number, maxPoints: number = 24): number {
  // Rating thresholds based on 8 questions * 3 max points = 24 max
  const percentage = totalPoints / maxPoints;
  if (percentage <= 0.42) return 1; // Low (0-10 points)
  if (percentage <= 0.75) return 2; // Medium (11-18 points)
  return 3; // High (19-24 points)
}

export function usePotentialAssessmentTemplates(companyId?: string) {
  return useQuery({
    queryKey: ['potential-assessment-templates', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('potential_assessment_templates')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as PotentialAssessmentTemplate[];
    },
    enabled: !!companyId,
  });
}

export function usePotentialAssessmentQuestions(templateId?: string) {
  return useQuery({
    queryKey: ['potential-assessment-questions', templateId],
    queryFn: async () => {
      if (!templateId) return [];
      
      const { data, error } = await supabase
        .from('potential_assessment_questions')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (error) throw error;
      return data as PotentialAssessmentQuestion[];
    },
    enabled: !!templateId,
  });
}

export function useEmployeePotentialAssessment(employeeId?: string) {
  return useQuery({
    queryKey: ['employee-potential-assessment', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('potential_assessments')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_current', true)
        .order('assessment_date', { ascending: false })
        .limit(1);

      if (error) throw error;
      return (data?.[0] as PotentialAssessment) || null;
    },
    enabled: !!employeeId,
  });
}

export function useCreatePotentialAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      employeeId,
      companyId,
      responses,
    }: {
      employeeId: string;
      companyId: string;
      responses: Record<string, number>;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const totalPoints = Object.values(responses).reduce((sum, val) => sum + val, 0);
      const calculatedRating = calculatePotentialRating(totalPoints);

      // Get or create default template
      let { data: templates } = await supabase
        .from('potential_assessment_templates')
        .select('id')
        .eq('company_id', companyId)
        .eq('is_default', true)
        .limit(1);

      let templateId = templates?.[0]?.id;

      if (!templateId) {
        const { data: newTemplate } = await supabase
          .from('potential_assessment_templates')
          .insert({
            company_id: companyId,
            name: 'Default Potential Assessment',
            description: 'Industry-standard potential assessment questionnaire',
            is_default: true,
            is_active: true,
          })
          .select('id')
          .single();

        templateId = newTemplate?.id;

        if (templateId) {
          await supabase
            .from('potential_assessment_questions')
            .insert(DEFAULT_QUESTIONS.map(q => ({
              template_id: templateId,
              ...q,
              is_required: true,
            })));
        }
      }

      // Mark previous assessments as not current
      await supabase
        .from('potential_assessments')
        .update({ is_current: false })
        .eq('employee_id', employeeId);

      // Create assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('potential_assessments')
        .insert({
          employee_id: employeeId,
          assessed_by: user?.user?.id,
          template_id: templateId,
          company_id: companyId,
          assessment_date: getTodayString(),
          total_points: totalPoints,
          calculated_rating: calculatedRating,
          is_current: true,
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Save responses
      const responsesToInsert = Object.entries(responses).map(([questionId, value]) => ({
        assessment_id: assessment.id,
        question_id: questionId.startsWith('default-') ? null : questionId,
        scale_value: value,
        points_earned: value,
      }));

      await supabase
        .from('potential_assessment_responses')
        .insert(responsesToInsert);

      return assessment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-potential-assessment', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['calculated-ratings', variables.employeeId] });
      toast.success('Potential assessment completed');
    },
    onError: (error) => {
      console.error('Error creating potential assessment:', error);
      toast.error('Failed to create potential assessment');
    },
  });
}

export function useManageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Partial<PotentialAssessmentTemplate> & { company_id: string }) => {
      if (template.id) {
        const { data, error } = await supabase
          .from('potential_assessment_templates')
          .update({
            name: template.name,
            description: template.description,
            is_default: template.is_default,
            is_active: template.is_active,
          })
          .eq('id', template.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('potential_assessment_templates')
          .insert({
            company_id: template.company_id,
            name: template.name!,
            description: template.description || null,
            is_default: template.is_default ?? false,
            is_active: template.is_active ?? true,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potential-assessment-templates'] });
      toast.success('Template saved');
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    },
  });
}

export function useManageQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: Partial<PotentialAssessmentQuestion> & { template_id: string }) => {
      if (question.id) {
        const { data, error } = await supabase
          .from('potential_assessment_questions')
          .update({
            question_text: question.question_text,
            question_category: question.question_category,
            display_order: question.display_order,
            is_required: question.is_required,
          })
          .eq('id', question.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('potential_assessment_questions')
          .insert({
            template_id: question.template_id,
            question_text: question.question_text!,
            question_category: question.question_category || 'general',
            display_order: question.display_order ?? 0,
            is_required: question.is_required ?? true,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['potential-assessment-questions', variables.template_id] });
      toast.success('Question saved');
    },
    onError: (error) => {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    },
  });
}
