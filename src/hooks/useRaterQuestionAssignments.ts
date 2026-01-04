import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuestionAssignment {
  id: string;
  question_id: string;
  rater_category_id: string;
  cycle_id: string;
  is_visible: boolean;
  display_order_override: number | null;
  is_required_override: boolean | null;
  created_at: string;
}

export interface QuestionWithAssignments {
  id: string;
  question_text: string;
  question_type: string;
  competency_id: string | null;
  competency_name?: string;
  assignments: Record<string, QuestionAssignment>;
}

export function useRaterQuestionAssignments() {
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async (cycleId: string): Promise<QuestionAssignment[]> => {
    const { data, error } = await supabase
      .from('review_360_question_assignments')
      .select('*')
      .eq('cycle_id', cycleId);

    if (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }

    return data || [];
  };

  const fetchQuestionsWithAssignments = async (
    cycleId: string,
    companyId: string
  ): Promise<QuestionWithAssignments[]> => {
    setLoading(true);
    try {
      // Fetch questions
      const { data: questions, error: qError } = await supabase
        .from('feedback_360_questions')
        .select(`
          id,
          question_text,
          question_type,
          competency_id,
          competencies(name)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('display_order');

      if (qError) throw qError;

      // Fetch assignments for this cycle
      const assignments = await fetchAssignments(cycleId);

      // Map assignments to questions
      const questionsWithAssignments: QuestionWithAssignments[] = (questions || []).map(q => {
        const questionAssignments: Record<string, QuestionAssignment> = {};
        assignments
          .filter(a => a.question_id === q.id)
          .forEach(a => {
            questionAssignments[a.rater_category_id] = a;
          });

        return {
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          competency_id: q.competency_id,
          competency_name: (q.competencies as any)?.name,
          assignments: questionAssignments,
        };
      });

      return questionsWithAssignments;
    } catch (error) {
      console.error('Error fetching questions with assignments:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveAssignment = async (
    questionId: string,
    raterCategoryId: string,
    cycleId: string,
    isVisible: boolean,
    displayOrderOverride?: number | null,
    isRequiredOverride?: boolean | null
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('review_360_question_assignments')
        .upsert({
          question_id: questionId,
          rater_category_id: raterCategoryId,
          cycle_id: cycleId,
          is_visible: isVisible,
          display_order_override: displayOrderOverride,
          is_required_override: isRequiredOverride,
        }, {
          onConflict: 'question_id,rater_category_id,cycle_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Failed to save question assignment');
      return false;
    }
  };

  const bulkSaveAssignments = async (
    assignments: Array<{
      questionId: string;
      raterCategoryId: string;
      cycleId: string;
      isVisible: boolean;
    }>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('review_360_question_assignments')
        .upsert(
          assignments.map(a => ({
            question_id: a.questionId,
            rater_category_id: a.raterCategoryId,
            cycle_id: a.cycleId,
            is_visible: a.isVisible,
          })),
          { onConflict: 'question_id,rater_category_id,cycle_id' }
        );

      if (error) throw error;
      toast.success('Assignments saved successfully');
      return true;
    } catch (error) {
      console.error('Error bulk saving assignments:', error);
      toast.error('Failed to save assignments');
      return false;
    }
  };

  const getQuestionsForRater = async (
    cycleId: string,
    raterCategoryId: string,
    companyId: string
  ) => {
    try {
      // First get assignments for this rater category
      const { data: assignments, error: aError } = await supabase
        .from('review_360_question_assignments')
        .select('question_id, display_order_override, is_required_override')
        .eq('cycle_id', cycleId)
        .eq('rater_category_id', raterCategoryId)
        .eq('is_visible', true);

      if (aError) throw aError;

      if (!assignments || assignments.length === 0) {
        // No specific assignments, return all active questions
        const { data: questions, error: qError } = await supabase
          .from('feedback_360_questions')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .order('display_order');

        if (qError) throw qError;
        return questions || [];
      }

      // Get questions that are assigned to this rater
      const questionIds = assignments.map(a => a.question_id);
      const { data: questions, error: qError } = await supabase
        .from('feedback_360_questions')
        .select('*')
        .in('id', questionIds)
        .eq('is_active', true);

      if (qError) throw qError;

      // Apply overrides and sort
      return (questions || [])
        .map(q => {
          const assignment = assignments.find(a => a.question_id === q.id);
          return {
            ...q,
            display_order: assignment?.display_order_override ?? q.display_order,
            is_required: assignment?.is_required_override ?? q.is_required,
          };
        })
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    } catch (error) {
      console.error('Error fetching questions for rater:', error);
      return [];
    }
  };

  return {
    loading,
    fetchAssignments,
    fetchQuestionsWithAssignments,
    saveAssignment,
    bulkSaveAssignments,
    getQuestionsForRater,
  };
}
