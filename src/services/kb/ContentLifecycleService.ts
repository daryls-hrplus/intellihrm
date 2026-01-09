// Content Lifecycle Service - Manages article review schedules and content freshness

import { supabase } from "@/integrations/supabase/client";
import type { ArticleVersion } from "./types";

export interface LifecycleStats {
  totalArticles: number;
  dueForReview: number;
  expiringContent: number;
  staleContent: number;
  pendingApprovals: number;
}

export interface LifecycleReport {
  period: { start: Date; end: Date };
  articlesReviewed: number;
  articlesPublished: number;
  articlesExpired: number;
  averageReviewTime: number;
}

export class ContentLifecycleService {
  // Get articles due for review within specified days
  static async getArticlesDueForReview(daysAhead: number = 7): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('kb_article_versions')
      .select(`
        *,
        article:kb_articles(id, title, category_id)
      `)
      .not('review_due_date', 'is', null)
      .lte('review_due_date', futureDate.toISOString().split('T')[0])
      .eq('status', 'published')
      .order('review_due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get expiring content within specified days
  static async getExpiringContent(daysAhead: number = 30): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('kb_article_versions')
      .select(`
        *,
        article:kb_articles(id, title, category_id)
      `)
      .not('expires_at', 'is', null)
      .lte('expires_at', futureDate.toISOString())
      .eq('status', 'published')
      .order('expires_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get stale content (not updated in X days)
  static async getStaleContent(staleDays: number = 180): Promise<any[]> {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - staleDays);

    const { data, error } = await supabase
      .from('kb_article_versions')
      .select(`
        *,
        article:kb_articles(id, title, category_id)
      `)
      .lt('created_at', staleDate.toISOString())
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get pending approvals
  static async getPendingApprovals(): Promise<any[]> {
    const { data, error } = await supabase
      .from('kb_article_versions')
      .select(`
        *,
        article:kb_articles(id, title, category_id)
      `)
      .in('status', ['pending_review', 'in_review'])
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Schedule a review for an article
  static async scheduleReview(
    versionId: string,
    reviewDate: Date,
    reviewerId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('kb_article_versions')
        .update({
          review_due_date: reviewDate.toISOString().split('T')[0],
        })
        .eq('id', versionId);

      if (error) throw error;

      // Create a review assignment if reviewer specified
      if (reviewerId) {
        const { data: version } = await supabase
          .from('kb_article_versions')
          .select('article_id')
          .eq('id', versionId)
          .single();

        if (version) {
          await supabase
            .from('kb_article_reviews')
            .insert({
              version_id: versionId,
              article_id: version.article_id,
              reviewer_id: reviewerId,
              due_date: reviewDate.toISOString().split('T')[0],
              status: 'pending',
            });
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Extend review due date
  static async extendReviewDate(
    versionId: string,
    newDate: Date,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('kb_article_versions')
        .update({
          review_due_date: newDate.toISOString().split('T')[0],
          change_summary: reason,
        })
        .eq('id', versionId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Set content expiration
  static async setExpiration(
    versionId: string,
    expiresAt: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('kb_article_versions')
        .update({
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', versionId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get lifecycle statistics
  static async getLifecycleStats(): Promise<LifecycleStats> {
    // Get total published articles
    const { count: totalArticles } = await supabase
      .from('kb_article_versions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    // Get due for review (next 7 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const { count: dueForReview } = await supabase
      .from('kb_article_versions')
      .select('*', { count: 'exact', head: true })
      .not('review_due_date', 'is', null)
      .lte('review_due_date', futureDate.toISOString().split('T')[0])
      .eq('status', 'published');

    // Get expiring (next 30 days)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    const { count: expiringContent } = await supabase
      .from('kb_article_versions')
      .select('*', { count: 'exact', head: true })
      .not('expires_at', 'is', null)
      .lte('expires_at', expirationDate.toISOString())
      .eq('status', 'published');

    // Get stale content (180+ days old without update)
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 180);
    const { count: staleContent } = await supabase
      .from('kb_article_versions')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', staleDate.toISOString())
      .eq('status', 'published');

    // Get pending approvals
    const { count: pendingApprovals } = await supabase
      .from('kb_article_versions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending_review', 'in_review']);

    return {
      totalArticles: totalArticles || 0,
      dueForReview: dueForReview || 0,
      expiringContent: expiringContent || 0,
      staleContent: staleContent || 0,
      pendingApprovals: pendingApprovals || 0,
    };
  }

  // Generate lifecycle report for date range
  static async generateLifecycleReport(
    dateRange: { start: Date; end: Date }
  ): Promise<LifecycleReport> {
    const startStr = dateRange.start.toISOString();
    const endStr = dateRange.end.toISOString();

    // Articles reviewed in period
    const { count: articlesReviewed } = await supabase
      .from('kb_article_reviews')
      .select('*', { count: 'exact', head: true })
      .gte('decision_at', startStr)
      .lte('decision_at', endStr);

    // Articles published in period
    const { count: articlesPublished } = await supabase
      .from('kb_article_versions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', startStr)
      .lte('published_at', endStr);

    // Articles expired in period
    const { count: articlesExpired } = await supabase
      .from('kb_article_versions')
      .select('*', { count: 'exact', head: true })
      .not('expires_at', 'is', null)
      .gte('expires_at', startStr)
      .lte('expires_at', endStr);

    return {
      period: dateRange,
      articlesReviewed: articlesReviewed || 0,
      articlesPublished: articlesPublished || 0,
      articlesExpired: articlesExpired || 0,
      averageReviewTime: 0, // Would need more complex calculation
    };
  }
}
