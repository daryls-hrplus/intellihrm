// Hook for content review operations - approve/reject/edit manual sections
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PendingReview {
  id: string;
  section_number: string;
  title: string;
  content: unknown;
  draft_content: unknown;
  review_status: string;
  submitted_for_review_at: string | null;
  submitted_by: string | null;
  manual_id: string;
  manual_name?: string;
}

export interface ReviewHistoryItem {
  id: string;
  section_id: string;
  previous_content: Record<string, unknown> | null;
  proposed_content: Record<string, unknown>;
  action: 'submitted' | 'approved' | 'rejected' | 'edited' | 'published';
  action_by: string | null;
  action_at: string;
  notes: string | null;
  version_number: number;
}

export function useContentReview() {
  const queryClient = useQueryClient();

  // Fetch pending reviews
  const { 
    data: pendingReviews = [], 
    isLoading: isLoadingPending,
    error: pendingError 
  } = useQuery({
    queryKey: ['content-reviews', 'pending'],
    queryFn: async (): Promise<PendingReview[]> => {
      const { data, error } = await supabase
        .from('manual_sections')
        .select(`
          id,
          section_number,
          title,
          content,
          draft_content,
          review_status,
          submitted_for_review_at,
          submitted_by,
          manual_id,
          manual_definitions(manual_name)
        `)
        .eq('review_status', 'pending_review')
        .order('submitted_for_review_at', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        manual_name: (item.manual_definitions as any)?.manual_name,
      }));
    }
  });

  // Fetch approved sections ready for publishing
  const { 
    data: approvedSections = [],
    isLoading: isLoadingApproved 
  } = useQuery({
    queryKey: ['content-reviews', 'approved'],
    queryFn: async (): Promise<PendingReview[]> => {
      const { data, error } = await supabase
        .from('manual_sections')
        .select(`
          id,
          section_number,
          title,
          content,
          draft_content,
          review_status,
          submitted_for_review_at,
          submitted_by,
          manual_id,
          manual_definitions(manual_name)
        `)
        .eq('review_status', 'approved')
        .order('reviewed_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        manual_name: (item.manual_definitions as any)?.manual_name,
      }));
    }
  });

  // Fetch review history
  const useReviewHistory = (sectionId: string | null) => {
    return useQuery({
      queryKey: ['content-reviews', 'history', sectionId],
      queryFn: async (): Promise<ReviewHistoryItem[]> => {
        if (!sectionId) return [];
        
        const { data, error } = await supabase
          .from('manual_section_reviews')
          .select('*')
          .eq('section_id', sectionId)
          .order('action_at', { ascending: false });
        
        if (error) throw error;
        return (data || []) as ReviewHistoryItem[];
      },
      enabled: !!sectionId,
    });
  };

  // Approve section
  const approveMutation = useMutation({
    mutationFn: async ({ sectionId, notes }: { sectionId: string; notes?: string }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get section's draft content
      const { data: section, error: fetchError } = await supabase
        .from('manual_sections')
        .select('draft_content, content')
        .eq('id', sectionId)
        .single();

      if (fetchError) throw fetchError;
      if (!section?.draft_content) throw new Error("No draft content to approve");

      // Move draft to content, update status
      const { error: updateError } = await supabase
        .from('manual_sections')
        .update({
          content: section.draft_content,
          draft_content: null,
          review_status: 'approved',
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes || null,
        })
        .eq('id', sectionId);

      if (updateError) throw updateError;

      // Log to review history
      const { error: historyError } = await supabase
        .from('manual_section_reviews')
        .insert({
          section_id: sectionId,
          previous_content: section.content,
          proposed_content: section.draft_content,
          action: 'approved',
          action_by: user.id,
          notes: notes || null,
        });

      if (historyError) {
        console.error("Failed to log review history:", historyError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      toast.success("Content approved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  // Reject section
  const rejectMutation = useMutation({
    mutationFn: async ({ sectionId, reason }: { sectionId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get section for history
      const { data: section } = await supabase
        .from('manual_sections')
        .select('draft_content, content')
        .eq('id', sectionId)
        .single();

      const { error: updateError } = await supabase
        .from('manual_sections')
        .update({
          review_status: 'rejected',
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reason,
        })
        .eq('id', sectionId);

      if (updateError) throw updateError;

      // Log to review history
      await supabase.from('manual_section_reviews').insert({
        section_id: sectionId,
        previous_content: section?.content || null,
        proposed_content: section?.draft_content || {},
        action: 'rejected',
        action_by: user.id,
        notes: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-reviews'] });
      toast.success("Changes requested sent to content creator");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  // Edit and approve (inline editing)
  const editAndApproveMutation = useMutation({
    mutationFn: async ({ 
      sectionId, 
      editedContent, 
      notes 
    }: { 
      sectionId: string; 
      editedContent: string; 
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get section for history
      const { data: section } = await supabase
        .from('manual_sections')
        .select('draft_content, content')
        .eq('id', sectionId)
        .single();

      const newContent = { markdown: editedContent };

      const { error: updateError } = await supabase
        .from('manual_sections')
        .update({
          content: newContent,
          draft_content: null,
          review_status: 'approved',
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes || 'Edited during review',
        })
        .eq('id', sectionId);

      if (updateError) throw updateError;

      // Log to review history
      await supabase.from('manual_section_reviews').insert({
        section_id: sectionId,
        previous_content: section?.content || null,
        proposed_content: newContent,
        action: 'edited',
        action_by: user.id,
        notes: notes || 'Content edited during review',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      toast.success("Content edited and approved");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save edits: ${error.message}`);
    },
  });

  // Bulk approve
  const bulkApproveMutation = useMutation({
    mutationFn: async (sectionIds: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let successCount = 0;
      const errors: string[] = [];

      for (const sectionId of sectionIds) {
        try {
          const { data: section } = await supabase
            .from('manual_sections')
            .select('draft_content, content')
            .eq('id', sectionId)
            .single();

          if (!section?.draft_content) continue;

          await supabase
            .from('manual_sections')
            .update({
              content: section.draft_content,
              draft_content: null,
              review_status: 'approved',
              reviewer_id: user.id,
              reviewed_at: new Date().toISOString(),
              review_notes: 'Bulk approved',
            })
            .eq('id', sectionId);

          await supabase.from('manual_section_reviews').insert({
            section_id: sectionId,
            previous_content: section.content,
            proposed_content: section.draft_content,
            action: 'approved',
            action_by: user.id,
            notes: 'Bulk approved',
          });

          successCount++;
        } catch (err) {
          errors.push(sectionId);
        }
      }

      return { successCount, errors };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      toast.success(`${result.successCount} sections approved`);
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} sections failed`);
      }
    },
  });

  // Get section details for review
  const useSectionDetails = (sectionId: string | null) => {
    return useQuery({
      queryKey: ['manual-section-detail', sectionId],
      queryFn: async () => {
        if (!sectionId) return null;
        
        const { data, error } = await supabase
          .from('manual_sections')
          .select(`
            *,
            manual_definitions(manual_name, manual_code)
          `)
          .eq('id', sectionId)
          .single();
        
        if (error) throw error;
        return data;
      },
      enabled: !!sectionId,
    });
  };

  return {
    // Data
    pendingReviews,
    approvedSections,
    pendingCount: pendingReviews.length,
    approvedCount: approvedSections.length,
    
    // Loading states
    isLoadingPending,
    isLoadingApproved,
    
    // Errors
    pendingError,
    
    // Actions
    approve: approveMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    editAndApprove: editAndApproveMutation.mutateAsync,
    bulkApprove: bulkApproveMutation.mutateAsync,
    
    // Action states
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isEditing: editAndApproveMutation.isPending,
    isBulkApproving: bulkApproveMutation.isPending,
    
    // Hooks for specific queries
    useReviewHistory,
    useSectionDetails,
  };
}

// Export pending count hook for use in navigation badges
export function usePendingReviewCount() {
  const { data: count = 0 } = useQuery({
    queryKey: ['content-reviews', 'pending-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('manual_sections')
        .select('*', { count: 'exact', head: true })
        .eq('review_status', 'pending_review');
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  return count;
}
