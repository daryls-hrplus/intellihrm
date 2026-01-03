import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CycleTemplate {
  id: string;
  company_id: string;
  name: string;
  template_name: string | null;
  template_description: string | null;
  is_template: boolean;
  cycle_purpose: string | null;
  feed_to_appraisal: boolean | null;
  feed_to_talent_profile: boolean | null;
  feed_to_nine_box: boolean | null;
  feed_to_succession: boolean | null;
  include_in_analytics: boolean | null;
  anonymity_threshold: number | null;
  retention_period_months: number | null;
  ai_tone_setting: string | null;
  created_at: string;
  tags?: string[];
}

export function useCycleTemplates(companyId?: string) {
  return useQuery({
    queryKey: ['cycle-templates', companyId],
    queryFn: async () => {
      const { data: cycles, error } = await supabase
        .from('feedback_360_cycles')
        .select('*')
        .eq('is_template', true)
        .order('template_name', { ascending: true });

      if (error) throw error;

      // Fetch tags for each template
      const cycleIds = cycles?.map(c => c.id) || [];
      const { data: tags } = await supabase
        .from('feedback_cycle_template_tags')
        .select('cycle_id, tag')
        .in('cycle_id', cycleIds);

      const tagMap: Record<string, string[]> = {};
      tags?.forEach(t => {
        if (!tagMap[t.cycle_id]) tagMap[t.cycle_id] = [];
        tagMap[t.cycle_id].push(t.tag);
      });

      return cycles?.map(c => ({
        ...c,
        tags: tagMap[c.id] || [],
      })) as CycleTemplate[];
    },
    enabled: !!companyId,
  });
}

export function useSaveAsTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cycleId,
      templateName,
      templateDescription,
      tags,
    }: {
      cycleId: string;
      templateName: string;
      templateDescription?: string;
      tags?: string[];
    }) => {
      // Update cycle to be a template
      const { data: cycle, error } = await supabase
        .from('feedback_360_cycles')
        .update({
          is_template: true,
          template_name: templateName,
          template_description: templateDescription,
        })
        .eq('id', cycleId)
        .select()
        .single();

      if (error) throw error;

      // Add tags
      if (tags && tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          cycle_id: cycleId,
          tag,
        }));
        await supabase
          .from('feedback_cycle_template_tags')
          .insert(tagInserts);
      }

      return cycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-templates'] });
      toast.success('Cycle saved as template');
    },
    onError: (error) => {
      toast.error(`Failed to save template: ${error.message}`);
    },
  });
}

export function useCloneCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      newName,
      companyId,
    }: {
      templateId: string;
      newName: string;
      companyId: string;
    }) => {
      // Get template cycle
      const { data: template, error: fetchError } = await supabase
        .from('feedback_360_cycles')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Create new cycle from template
      const insertData: Record<string, unknown> = {
        company_id: companyId,
        name: newName,
        description: template.description,
        cycle_purpose: template.cycle_purpose,
        feed_to_appraisal: template.feed_to_appraisal,
        feed_to_talent_profile: template.feed_to_talent_profile,
        feed_to_nine_box: template.feed_to_nine_box,
        feed_to_succession: template.feed_to_succession,
        include_in_analytics: template.include_in_analytics,
        anonymity_threshold: template.anonymity_threshold,
        retention_period_months: template.retention_period_months,
        ai_tone_setting: template.ai_tone_setting,
        results_visibility_rules: template.results_visibility_rules,
        is_template: false,
        cloned_from_id: templateId,
        status: 'draft',
      };

      const { data: newCycle, error: insertError } = await supabase
        .from('feedback_360_cycles')
        .insert(insertData as never)
        .select()
        .single();

      if (insertError) throw insertError;

      return newCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-360-cycles'] });
      toast.success('Cycle created from template');
    },
    onError: (error) => {
      toast.error(`Failed to clone cycle: ${error.message}`);
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      // Remove template flag (don't delete the cycle itself)
      const { error } = await supabase
        .from('feedback_360_cycles')
        .update({
          is_template: false,
          template_name: null,
          template_description: null,
        })
        .eq('id', templateId);

      if (error) throw error;

      // Delete tags
      await supabase
        .from('feedback_cycle_template_tags')
        .delete()
        .eq('cycle_id', templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-templates'] });
      toast.success('Template removed');
    },
    onError: (error) => {
      toast.error(`Failed to remove template: ${error.message}`);
    },
  });
}
