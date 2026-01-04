import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BehavioralAnchor {
  id: string;
  competency_id: string;
  company_id: string;
  scale_value: number;
  scale_label: string;
  anchor_text: string;
  examples: string[];
  created_at: string;
  updated_at: string;
}

export interface AnchorSet {
  [scaleValue: number]: BehavioralAnchor;
}

export interface QuestionAnchors {
  [scaleValue: string]: {
    label: string;
    description: string;
    examples: string[];
  };
}

export function useBehavioralAnchors() {
  const [loading, setLoading] = useState(false);

  const fetchAnchorsForCompetency = async (competencyId: string): Promise<BehavioralAnchor[]> => {
    const { data, error } = await supabase
      .from('competency_behavioral_anchors')
      .select('*')
      .eq('competency_id', competencyId)
      .order('scale_value');

    if (error) {
      console.error('Error fetching anchors:', error);
      return [];
    }

    return data || [];
  };

  const fetchAnchorsForCompany = async (companyId: string): Promise<BehavioralAnchor[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('competency_behavioral_anchors')
        .select(`
          *,
          competencies(name)
        `)
        .eq('company_id', companyId)
        .order('competency_id')
        .order('scale_value');

      if (error) throw error;
      return data || [];
    } finally {
      setLoading(false);
    }
  };

  const saveAnchor = async (
    anchor: Omit<BehavioralAnchor, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('competency_behavioral_anchors')
        .upsert({
          ...anchor,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'competency_id,scale_value'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving anchor:', error);
      toast.error('Failed to save behavioral anchor');
      return false;
    }
  };

  const saveAnchorsForCompetency = async (
    competencyId: string,
    companyId: string,
    anchors: Array<{
      scale_value: number;
      scale_label: string;
      anchor_text: string;
      examples: string[];
    }>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('competency_behavioral_anchors')
        .upsert(
          anchors.map(a => ({
            competency_id: competencyId,
            company_id: companyId,
            scale_value: a.scale_value,
            scale_label: a.scale_label,
            anchor_text: a.anchor_text,
            examples: a.examples,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'competency_id,scale_value' }
        );

      if (error) throw error;
      toast.success('Behavioral anchors saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving anchors:', error);
      toast.error('Failed to save behavioral anchors');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAnchor = async (anchorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('competency_behavioral_anchors')
        .delete()
        .eq('id', anchorId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting anchor:', error);
      toast.error('Failed to delete behavioral anchor');
      return false;
    }
  };

  const updateQuestionAnchors = async (
    questionId: string,
    anchors: QuestionAnchors,
    displayMode: 'tooltip' | 'inline' | 'popup' = 'tooltip'
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('feedback_360_questions')
        .update({
          behavioral_anchors: anchors,
          anchor_display_mode: displayMode,
        })
        .eq('id', questionId);

      if (error) throw error;
      toast.success('Question anchors updated');
      return true;
    } catch (error) {
      console.error('Error updating question anchors:', error);
      toast.error('Failed to update question anchors');
      return false;
    }
  };

  const getDefaultAnchors = (scaleMax: number = 5): QuestionAnchors => {
    const defaults: Record<number, { label: string; description: string; examples: string[] }> = {
      1: {
        label: 'Needs Development',
        description: 'Rarely demonstrates this behavior; requires significant improvement',
        examples: ['Avoids opportunities to demonstrate', 'Struggles with basic aspects'],
      },
      2: {
        label: 'Below Expectations',
        description: 'Occasionally demonstrates but inconsistently',
        examples: ['Shows behavior only when prompted', 'Needs frequent guidance'],
      },
      3: {
        label: 'Meets Expectations',
        description: 'Consistently demonstrates this behavior at expected level',
        examples: ['Regularly applies in daily work', 'Maintains steady performance'],
      },
      4: {
        label: 'Exceeds Expectations',
        description: 'Frequently exceeds expectations and helps others',
        examples: ['Goes above and beyond', 'Coaches others in this area'],
      },
      5: {
        label: 'Exceptional',
        description: 'Role model; consistently exemplifies at highest level',
        examples: ['Recognized as expert', 'Drives organizational improvement'],
      },
    };

    const result: QuestionAnchors = {};
    for (let i = 1; i <= scaleMax; i++) {
      result[i.toString()] = defaults[i] || {
        label: `Level ${i}`,
        description: '',
        examples: [],
      };
    }
    return result;
  };

  return {
    loading,
    fetchAnchorsForCompetency,
    fetchAnchorsForCompany,
    saveAnchor,
    saveAnchorsForCompetency,
    deleteAnchor,
    updateQuestionAnchors,
    getDefaultAnchors,
  };
}
