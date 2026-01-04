import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CycleTemplate {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  template_name: string | null;
  template_description: string | null;
  is_template: boolean;
  include_self_review: boolean | null;
  include_manager_review: boolean | null;
  include_peer_review: boolean | null;
  include_direct_report_review: boolean | null;
  min_peer_reviewers: number | null;
  max_peer_reviewers: number | null;
  rating_scale_id: string | null;
  cycle_type: string | null;
  visibility_rules: Record<string, unknown> | null;
  created_at: string;
  tags?: string[];
}

export function useCycleTemplates(companyId?: string) {
  return useQuery({
    queryKey: ['cycle-templates', companyId],
    queryFn: async () => {
      const { data: cycles, error } = await supabase
        .from('review_cycles')
        .select('*')
        .eq('is_template', true)
        .order('template_name', { ascending: true });

      if (error) throw error;

      // Fetch tags for each template
      const cycleIds = cycles?.map(c => c.id) || [];
      if (cycleIds.length === 0) return [] as CycleTemplate[];

      const { data: tags } = await supabase
        .from('review_cycle_template_tags')
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
        .from('review_cycles')
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
        // First delete existing tags
        await supabase
          .from('review_cycle_template_tags')
          .delete()
          .eq('cycle_id', cycleId);

        const tagInserts = tags.map(tag => ({
          cycle_id: cycleId,
          tag,
        }));
        await supabase
          .from('review_cycle_template_tags')
          .insert(tagInserts);
      }

      return cycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-templates'] });
      queryClient.invalidateQueries({ queryKey: ['review-cycles'] });
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
        .from('review_cycles')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Create new cycle from template - dates will need to be set by user
      const { data: newCycle, error: insertError } = await supabase
        .from('review_cycles')
        .insert({
          company_id: companyId,
          name: newName,
          description: template.description,
          start_date: template.start_date,
          end_date: template.end_date,
          include_self_review: template.include_self_review,
          include_manager_review: template.include_manager_review,
          include_peer_review: template.include_peer_review,
          include_direct_report_review: template.include_direct_report_review,
          min_peer_reviewers: template.min_peer_reviewers,
          max_peer_reviewers: template.max_peer_reviewers,
          rating_scale_id: template.rating_scale_id,
          cycle_type: template.cycle_type,
          visibility_rules: template.visibility_rules,
          is_template: false,
          cloned_from_id: templateId,
          status: 'draft',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return newCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-cycles'] });
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
        .from('review_cycles')
        .update({
          is_template: false,
          template_name: null,
          template_description: null,
        })
        .eq('id', templateId);

      if (error) throw error;

      // Delete tags
      await supabase
        .from('review_cycle_template_tags')
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

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      templateName,
      templateDescription,
      cycleType,
      includeSelfReview,
      includeManagerReview,
      includePeerReview,
      includeDirectReportReview,
      minPeerReviewers,
      maxPeerReviewers,
      tags,
    }: {
      companyId: string;
      templateName: string;
      templateDescription?: string;
      cycleType?: string;
      includeSelfReview?: boolean;
      includeManagerReview?: boolean;
      includePeerReview?: boolean;
      includeDirectReportReview?: boolean;
      minPeerReviewers?: number;
      maxPeerReviewers?: number;
      tags?: string[];
    }) => {
      // Create template directly (not from existing cycle)
      // Templates need placeholder dates - they will be set when cloning
      const placeholderDate = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: template, error } = await supabase
        .from('review_cycles')
        .insert({
          company_id: companyId,
          name: templateName,
          template_name: templateName,
          template_description: templateDescription,
          is_template: true,
          status: 'draft',
          start_date: placeholderDate,
          end_date: futureDate,
          cycle_type: cycleType || '360_feedback',
          include_self_review: includeSelfReview ?? true,
          include_manager_review: includeManagerReview ?? true,
          include_peer_review: includePeerReview ?? true,
          include_direct_report_review: includeDirectReportReview ?? false,
          min_peer_reviewers: minPeerReviewers ?? 2,
          max_peer_reviewers: maxPeerReviewers ?? 5,
        })
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (tags && tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          cycle_id: template.id,
          tag,
        }));
        await supabase
          .from('review_cycle_template_tags')
          .insert(tagInserts);
      }

      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}
