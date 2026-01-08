// Hook for article workflow state management

import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleWorkflowService } from "@/services/kb/ArticleWorkflowService";
import type { ArticleVersion, ArticleReview, ArticleStatus } from "@/services/kb/types";
import { toast } from "sonner";

interface InlineComment {
  lineNumber: number;
  comment: string;
  author: string;
  createdAt: string;
  resolved?: boolean;
}

interface UseArticleWorkflowOptions {
  articleId?: string;
  versionId?: string;
}

export function useArticleWorkflow(options: UseArticleWorkflowOptions = {}) {
  const { articleId, versionId } = options;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch current version
  const { data: currentVersion, isLoading: isLoadingVersion } = useQuery({
    queryKey: ['article-version', versionId],
    queryFn: async () => {
      if (!versionId) return null;
      const { data, error } = await supabase
        .from('kb_article_versions')
        .select('*')
        .eq('id', versionId)
        .single();
      
      if (error) throw error;
      return data as ArticleVersion;
    },
    enabled: !!versionId,
  });

  // Fetch version history
  const { data: versionHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['article-versions', articleId],
    queryFn: async () => {
      if (!articleId) return [];
      const { data, error } = await supabase
        .from('kb_article_versions')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ArticleVersion[];
    },
    enabled: !!articleId,
  });

  // Fetch pending review
  const { data: pendingReview } = useQuery({
    queryKey: ['article-review', versionId],
    queryFn: async () => {
      if (!versionId) return null;
      const { data, error } = await supabase
        .from('kb_article_reviews')
        .select('*')
        .eq('version_id', versionId)
        .in('status', ['pending', 'in_progress'])
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      // Transform inline_comments from Json to InlineComment[]
      return {
        ...data,
        inline_comments: Array.isArray(data.inline_comments) 
          ? data.inline_comments as unknown as InlineComment[]
          : null,
      } as ArticleReview;
    },
    enabled: !!versionId,
  });

  // Check if transition is allowed
  const canTransition = useCallback((action: string): boolean => {
    if (!currentVersion) return false;
    return ArticleWorkflowService.canTransition(currentVersion.status, action);
  }, [currentVersion]);

  // Submit for review
  const submitForReview = useMutation({
    mutationFn: async (notes?: string) => {
      if (!versionId) throw new Error('Version ID required');
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Update version status
      const { error: versionError } = await supabase
        .from('kb_article_versions')
        .update({ 
          status: 'pending_review' as ArticleStatus,
          change_summary: notes || null,
        })
        .eq('id', versionId);
      
      if (versionError) throw versionError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-version', versionId] });
      queryClient.invalidateQueries({ queryKey: ['article-versions', articleId] });
      toast.success('Submitted for review');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit: ${error.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Assign reviewer
  const assignReviewer = useMutation({
    mutationFn: async ({ reviewerId, dueDate }: { reviewerId: string; dueDate?: Date }) => {
      if (!versionId) throw new Error('Version ID required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Create review assignment
      const { error: reviewError } = await supabase
        .from('kb_article_reviews')
        .insert({
          version_id: versionId,
          reviewer_id: reviewerId,
          assigned_by: user.id,
          due_date: dueDate?.toISOString().split('T')[0] || null,
          status: 'pending',
        });
      
      if (reviewError) throw reviewError;

      // Update version status
      const { error: versionError } = await supabase
        .from('kb_article_versions')
        .update({ status: 'in_review' as ArticleStatus })
        .eq('id', versionId);
      
      if (versionError) throw versionError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-version', versionId] });
      queryClient.invalidateQueries({ queryKey: ['article-review', versionId] });
      toast.success('Reviewer assigned');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign reviewer: ${error.message}`);
    },
  });

  // Approve version
  const approve = useMutation({
    mutationFn: async (comments?: string) => {
      if (!versionId) throw new Error('Version ID required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Update review
      const { error: reviewError } = await supabase
        .from('kb_article_reviews')
        .update({
          status: 'approved',
          decision_at: new Date().toISOString(),
          comments: comments || null,
        })
        .eq('version_id', versionId)
        .in('status', ['pending', 'in_progress']);
      
      if (reviewError) throw reviewError;

      // Update version status
      const { error: versionError } = await supabase
        .from('kb_article_versions')
        .update({
          status: 'approved' as ArticleStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_comments: comments || null,
        })
        .eq('id', versionId);
      
      if (versionError) throw versionError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-version', versionId] });
      queryClient.invalidateQueries({ queryKey: ['article-review', versionId] });
      toast.success('Version approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  // Request changes
  const requestChanges = useMutation({
    mutationFn: async ({ 
      feedback, 
      inlineComments 
    }: { 
      feedback: string; 
      inlineComments?: InlineComment[] 
    }) => {
      if (!versionId) throw new Error('Version ID required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Update review
      const { error: reviewError } = await supabase
        .from('kb_article_reviews')
        .update({
          status: 'changes_requested',
          decision_at: new Date().toISOString(),
          comments: feedback,
          inline_comments: inlineComments ? JSON.parse(JSON.stringify(inlineComments)) : null,
        })
        .eq('version_id', versionId)
        .in('status', ['pending', 'in_progress']);
      
      if (reviewError) throw reviewError;

      // Update version status
      const { error: versionError } = await supabase
        .from('kb_article_versions')
        .update({
          status: 'changes_requested' as ArticleStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_comments: feedback,
        })
        .eq('id', versionId);
      
      if (versionError) throw versionError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-version', versionId] });
      queryClient.invalidateQueries({ queryKey: ['article-review', versionId] });
      toast.success('Changes requested');
    },
    onError: (error: Error) => {
      toast.error(`Failed to request changes: ${error.message}`);
    },
  });

  // Publish version
  const publish = useMutation({
    mutationFn: async () => {
      if (!versionId || !articleId) throw new Error('Version and Article ID required');
      setIsPublishing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Update version status
      const { error: versionError } = await supabase
        .from('kb_article_versions')
        .update({
          status: 'published' as ArticleStatus,
          published_by: user.id,
          published_at: new Date().toISOString(),
        })
        .eq('id', versionId);
      
      if (versionError) throw versionError;

      // Update article to point to this version
      const { error: articleError } = await supabase
        .from('kb_articles')
        .update({
          current_version_id: versionId,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId);
      
      if (articleError) throw articleError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-version', versionId] });
      queryClient.invalidateQueries({ queryKey: ['article-versions', articleId] });
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      toast.success('Version published');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish: ${error.message}`);
    },
    onSettled: () => {
      setIsPublishing(false);
    },
  });

  // Rollback to version
  const rollback = useMutation({
    mutationFn: async ({ targetVersionId, reason }: { targetVersionId: string; reason: string }) => {
      if (!articleId) throw new Error('Article ID required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Get target version content
      const { data: targetVersion, error: fetchError } = await supabase
        .from('kb_article_versions')
        .select('*')
        .eq('id', targetVersionId)
        .single();
      
      if (fetchError) throw fetchError;

      // Get latest version number
      const { data: latestVersions, error: latestError } = await supabase
        .from('kb_article_versions')
        .select('major_version, minor_version, patch_version')
        .eq('article_id', articleId)
        .order('major_version', { ascending: false })
        .order('minor_version', { ascending: false })
        .order('patch_version', { ascending: false })
        .limit(1);
      
      if (latestError) throw latestError;

      const latest = latestVersions[0] || { major_version: 1, minor_version: 0, patch_version: 0 };
      const newPatch = latest.patch_version + 1;
      const newVersionNumber = `${latest.major_version}.${latest.minor_version}.${newPatch}`;

      // Create new version from target
      const { error: createError } = await supabase
        .from('kb_article_versions')
        .insert({
          article_id: articleId,
          version_number: newVersionNumber,
          major_version: latest.major_version,
          minor_version: latest.minor_version,
          patch_version: newPatch,
          title: targetVersion.title,
          content: targetVersion.content,
          excerpt: targetVersion.excerpt,
          change_summary: `Rollback to v${targetVersion.version_number}: ${reason}`,
          change_type: 'rollback',
          source_manual_id: targetVersion.source_manual_id,
          source_manual_version: targetVersion.source_manual_version,
          source_section_id: targetVersion.source_section_id,
          status: 'draft',
          created_by: user.id,
          rolled_back_from_version_id: targetVersionId,
        });
      
      if (createError) throw createError;

      return { success: true, newVersion: newVersionNumber };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['article-versions', articleId] });
      toast.success(`Rollback created as v${data.newVersion}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to rollback: ${error.message}`);
    },
  });

  return {
    // State
    currentVersion,
    versionHistory,
    pendingReview,
    isLoadingVersion,
    isLoadingHistory,
    canTransition,

    // Actions
    submitForReview: submitForReview.mutateAsync,
    assignReviewer: assignReviewer.mutateAsync,
    approve: approve.mutateAsync,
    requestChanges: requestChanges.mutateAsync,
    publish: publish.mutateAsync,
    rollback: rollback.mutateAsync,

    // Loading states
    isSubmitting,
    isPublishing,
  };
}
