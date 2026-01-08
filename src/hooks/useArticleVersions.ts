// Hook for managing article versions

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleWorkflowService } from "@/services/kb/ArticleWorkflowService";
import type { ArticleVersion } from "@/services/kb/types";
import { toast } from "sonner";

export function useArticleVersions(articleId: string | null) {
  const queryClient = useQueryClient();

  // Fetch all versions for an article
  const { data: versions = [], isLoading, error } = useQuery({
    queryKey: ['article-versions', articleId],
    queryFn: async () => {
      if (!articleId) return [];
      return ArticleWorkflowService.getVersionHistory(articleId);
    },
    enabled: !!articleId,
  });

  // Get latest published version
  const latestPublished = versions.find(v => v.status === 'published');
  
  // Get current draft if any
  const currentDraft = versions.find(v => v.status === 'draft');

  // Submit for review mutation
  const submitForReview = useMutation({
    mutationFn: async ({ versionId, notes }: { versionId: string; notes?: string }) => {
      const result = await ArticleWorkflowService.submitForReview(versionId, notes);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-versions', articleId] });
      toast.success('Submitted for review');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit: ${error.message}`);
    },
  });

  // Approve mutation
  const approve = useMutation({
    mutationFn: async ({ versionId, reviewerId, comments }: { versionId: string; reviewerId: string; comments?: string }) => {
      const result = await ArticleWorkflowService.approveVersion(versionId, reviewerId, comments);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-versions', articleId] });
      toast.success('Version approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  // Request changes mutation
  const requestChanges = useMutation({
    mutationFn: async ({ 
      versionId, 
      reviewerId, 
      changes,
      inlineComments 
    }: { 
      versionId: string; 
      reviewerId: string; 
      changes: string;
      inlineComments?: any[];
    }) => {
      const result = await ArticleWorkflowService.requestChanges(versionId, reviewerId, changes, inlineComments);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-versions', articleId] });
      toast.success('Changes requested');
    },
    onError: (error: Error) => {
      toast.error(`Failed to request changes: ${error.message}`);
    },
  });

  // Publish mutation
  const publish = useMutation({
    mutationFn: async ({ versionId, publisherId }: { versionId: string; publisherId: string }) => {
      const result = await ArticleWorkflowService.publishVersion(versionId, publisherId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-versions', articleId] });
      toast.success('Version published');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish: ${error.message}`);
    },
  });

  // Rollback mutation
  const rollback = useMutation({
    mutationFn: async ({ 
      targetVersionId, 
      reason,
      userId 
    }: { 
      targetVersionId: string; 
      reason: string;
      userId: string;
    }) => {
      if (!articleId) throw new Error('Article ID required');
      const result = await ArticleWorkflowService.rollbackToVersion(articleId, targetVersionId, reason, userId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-versions', articleId] });
      toast.success('Rollback version created as draft');
    },
    onError: (error: Error) => {
      toast.error(`Failed to rollback: ${error.message}`);
    },
  });

  return {
    versions,
    isLoading,
    error,
    latestPublished,
    currentDraft,
    submitForReview,
    approve,
    requestChanges,
    publish,
    rollback,
  };
}

// Hook for comparing two versions
export function useVersionComparison(oldVersionId: string | null, newVersionId: string | null) {
  return useQuery({
    queryKey: ['version-comparison', oldVersionId, newVersionId],
    queryFn: async () => {
      if (!oldVersionId || !newVersionId) return null;

      const { data: versions, error } = await supabase
        .from('kb_article_versions')
        .select('*')
        .in('id', [oldVersionId, newVersionId]);

      if (error) throw error;

      const oldVersion = versions?.find(v => v.id === oldVersionId);
      const newVersion = versions?.find(v => v.id === newVersionId);

      return { oldVersion, newVersion };
    },
    enabled: !!oldVersionId && !!newVersionId,
  });
}
