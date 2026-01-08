// Article Workflow Service - Manages article lifecycle transitions

import { supabase } from "@/integrations/supabase/client";
import type { ArticleStatus, ArticleVersion, WorkflowTransition, InlineComment } from "./types";

// Allowed workflow transitions
const ALLOWED_TRANSITIONS: WorkflowTransition[] = [
  { from: ['draft'], to: 'pending_review', action: 'submit_for_review' },
  { from: ['pending_review'], to: 'in_review', action: 'assign_reviewer' },
  { from: ['in_review'], to: 'approved', action: 'approve' },
  { from: ['in_review'], to: 'changes_requested', action: 'request_changes', requiresComment: true },
  { from: ['changes_requested'], to: 'draft', action: 'revise' },
  { from: ['approved'], to: 'published', action: 'publish' },
  { from: ['published'], to: 'retired', action: 'retire' },
  { from: ['retired', 'published'], to: 'archived', action: 'archive' },
  { from: ['draft', 'pending_review', 'in_review', 'changes_requested', 'approved'], to: 'draft', action: 'cancel' },
];

export class ArticleWorkflowService {
  // Check if a transition is allowed
  static canTransition(currentStatus: ArticleStatus, action: string): boolean {
    const transition = ALLOWED_TRANSITIONS.find(t => t.action === action);
    if (!transition) return false;
    return transition.from.includes(currentStatus);
  }

  // Get available actions for current status
  static getAvailableActions(currentStatus: ArticleStatus): string[] {
    return ALLOWED_TRANSITIONS
      .filter(t => t.from.includes(currentStatus))
      .map(t => t.action);
  }

  // Submit article for review
  static async submitForReview(
    versionId: string, 
    submitterNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('kb_article_versions')
        .update({
          status: 'pending_review' as ArticleStatus,
          change_summary: submitterNotes || undefined,
        })
        .eq('id', versionId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Assign a reviewer to the article
  static async assignReviewer(
    versionId: string,
    reviewerId: string,
    dueDate?: Date,
    assignedBy?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update article status
      const { error: updateError } = await supabase
        .from('kb_article_versions')
        .update({ status: 'in_review' as ArticleStatus })
        .eq('id', versionId);

      if (updateError) throw updateError;

      // Create review record
      const { error: reviewError } = await supabase
        .from('kb_article_reviews')
        .insert({
          version_id: versionId,
          reviewer_id: reviewerId,
          assigned_by: assignedBy,
          due_date: dueDate?.toISOString().split('T')[0],
          status: 'pending',
        });

      if (reviewError) throw reviewError;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Approve a version
  static async approveVersion(
    versionId: string,
    reviewerId: string,
    comments?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update article version
      const { error: versionError } = await supabase
        .from('kb_article_versions')
        .update({
          status: 'approved' as ArticleStatus,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_comments: comments,
        })
        .eq('id', versionId);

      if (versionError) throw versionError;

      // Update review record
      const { error: reviewError } = await supabase
        .from('kb_article_reviews')
        .update({
          status: 'approved',
          decision_at: new Date().toISOString(),
          comments,
        })
        .eq('version_id', versionId)
        .eq('status', 'pending');

      if (reviewError) throw reviewError;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Request changes on a version
  static async requestChanges(
    versionId: string,
    reviewerId: string,
    requiredChanges: string,
    inlineComments?: InlineComment[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update article version
      const { error: versionError } = await supabase
        .from('kb_article_versions')
        .update({
          status: 'changes_requested' as ArticleStatus,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_comments: requiredChanges,
        })
        .eq('id', versionId);

      if (versionError) throw versionError;

      // Update review record
      const { error: reviewError } = await supabase
        .from('kb_article_reviews')
        .update({
          status: 'changes_requested',
          decision_at: new Date().toISOString(),
          comments: requiredChanges,
          inline_comments: inlineComments as any,
        })
        .eq('version_id', versionId)
        .eq('status', 'pending');

      if (reviewError) throw reviewError;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Publish an approved version
  static async publishVersion(
    versionId: string,
    publisherId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the version to find the article
      const { data: version, error: fetchError } = await supabase
        .from('kb_article_versions')
        .select('article_id')
        .eq('id', versionId)
        .single();

      if (fetchError || !version) throw fetchError || new Error('Version not found');

      // Update version status
      const { error: versionError } = await supabase
        .from('kb_article_versions')
        .update({
          status: 'published' as ArticleStatus,
          published_by: publisherId,
          published_at: new Date().toISOString(),
        })
        .eq('id', versionId);

      if (versionError) throw versionError;

      // Update article to point to this version
      const { error: articleError } = await supabase
        .from('kb_articles')
        .update({
          current_version_id: versionId,
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', version.article_id);

      if (articleError) throw articleError;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Rollback to a previous version (creates new version)
  static async rollbackToVersion(
    articleId: string,
    targetVersionId: string,
    reason: string,
    userId: string
  ): Promise<{ success: boolean; newVersionId?: string; error?: string }> {
    try {
      // Get the target version content
      const { data: targetVersion, error: fetchError } = await supabase
        .from('kb_article_versions')
        .select('*')
        .eq('id', targetVersionId)
        .single();

      if (fetchError || !targetVersion) throw fetchError || new Error('Target version not found');

      // Get latest version number for the article
      const { data: latestVersions, error: latestError } = await supabase
        .from('kb_article_versions')
        .select('major_version, minor_version, patch_version')
        .eq('article_id', articleId)
        .order('major_version', { ascending: false })
        .order('minor_version', { ascending: false })
        .order('patch_version', { ascending: false })
        .limit(1);

      if (latestError) throw latestError;

      const latest = latestVersions?.[0];
      const newPatch = (latest?.patch_version || 0) + 1;
      const newVersionNumber = `${latest?.major_version || 1}.${latest?.minor_version || 0}.${newPatch}`;

      // Create new version with old content
      const { data: newVersion, error: createError } = await supabase
        .from('kb_article_versions')
        .insert({
          article_id: articleId,
          version_number: newVersionNumber,
          major_version: latest?.major_version || 1,
          minor_version: latest?.minor_version || 0,
          patch_version: newPatch,
          title: targetVersion.title,
          content: targetVersion.content,
          excerpt: targetVersion.excerpt,
          change_summary: `Rollback to ${targetVersion.version_number}: ${reason}`,
          change_type: 'rollback',
          source_manual_id: targetVersion.source_manual_id,
          source_manual_version: targetVersion.source_manual_version,
          source_section_id: targetVersion.source_section_id,
          status: 'draft',
          created_by: userId,
          rolled_back_from_version_id: targetVersionId,
        })
        .select()
        .single();

      if (createError || !newVersion) throw createError || new Error('Failed to create rollback version');

      return { success: true, newVersionId: newVersion.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Retire a published version
  static async retireVersion(
    versionId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('kb_article_versions')
        .update({
          status: 'retired' as ArticleStatus,
          review_comments: reason ? `Retired: ${reason}` : 'Retired',
        })
        .eq('id', versionId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get version history for an article
  static async getVersionHistory(articleId: string): Promise<ArticleVersion[]> {
    const { data, error } = await supabase
      .from('kb_article_versions')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ArticleVersion[];
  }

  // Get pending reviews for a user
  static async getPendingReviews(reviewerId: string) {
    const { data, error } = await supabase
      .from('kb_article_reviews')
      .select(`
        *,
        version:kb_article_versions(*)
      `)
      .eq('reviewer_id', reviewerId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
