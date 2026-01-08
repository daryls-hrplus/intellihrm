// Manual Publishing Service - Handles publishing manuals to Knowledge Base

import { supabase } from "@/integrations/supabase/client";
import type { PublishOptions, SyncResult, PublishedManual, ArticleVersion } from "./types";

export class ManualPublishService {
  // Get all published manuals
  static async getPublishedManuals(): Promise<PublishedManual[]> {
    const { data, error } = await supabase
      .from('kb_published_manuals')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PublishedManual[];
  }

  // Get published manual by manual_id
  static async getPublishedManual(manualId: string): Promise<PublishedManual | null> {
    const { data, error } = await supabase
      .from('kb_published_manuals')
      .select('*')
      .eq('manual_id', manualId)
      .eq('status', 'current')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as PublishedManual | null;
  }

  // Get next version number for a manual
  static async getNextVersion(manualId: string, incrementType: 'major' | 'minor' | 'patch'): Promise<string> {
    const { data } = await supabase
      .from('kb_published_manuals')
      .select('published_version')
      .eq('manual_id', manualId)
      .order('published_at', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) {
      return '1.0.0';
    }

    const currentVersion = data[0].published_version;
    const parts = currentVersion.replace('v', '').split('.').map(Number);
    const [major, minor, patch] = parts;

    switch (incrementType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  // Publish a manual to the Knowledge Base
  static async publishManual(
    options: PublishOptions,
    userId: string
  ): Promise<{ success: boolean; publishedManualId?: string; error?: string }> {
    try {
      // First, supersede any existing current version
      await supabase
        .from('kb_published_manuals')
        .update({
          status: 'superseded',
          superseded_at: new Date().toISOString(),
        })
        .eq('manual_id', options.manualId)
        .eq('status', 'current');

      // Create new published manual record
      const { data: publishedManual, error: publishError } = await supabase
        .from('kb_published_manuals')
        .insert({
          manual_id: options.manualId,
          manual_name: options.manualName,
          source_version: options.sourceVersion,
          published_version: options.publishVersion,
          sections_total: options.sections.length,
          sections_published: options.sections.length,
          sections_updated: 0,
          status: 'current',
          changelog: options.changelog,
          category_id: options.targetCategoryId,
          published_by: userId,
        })
        .select()
        .single();

      if (publishError) throw publishError;

      return { success: true, publishedManualId: publishedManual.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Create or update KB articles from manual sections
  static async createArticlesFromSections(
    manualId: string,
    sections: Array<{
      id: string;
      title: string;
      content: string;
      excerpt?: string;
    }>,
    categoryId: string,
    sourceVersion: string,
    publishVersion: string,
    userId: string
  ): Promise<SyncResult> {
    const result: SyncResult = {
      added: 0,
      updated: 0,
      unchanged: 0,
      errors: [],
    };

    for (const section of sections) {
      try {
        // Check if article already exists
        const { data: existing } = await supabase
          .from('kb_articles')
          .select('id, content')
          .eq('source_manual_id', manualId)
          .eq('source_section_id', section.id)
          .single();

        if (existing) {
          // Check if content changed
          if (existing.content === section.content) {
            result.unchanged++;
            continue;
          }

          // Update existing article
          const { error: updateError } = await supabase
            .from('kb_articles')
            .update({
              title: section.title,
              content: section.content,
              excerpt: section.excerpt,
              last_synced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateError) throw updateError;

          // Create new version
          await this.createArticleVersion(
            existing.id,
            section.title,
            section.content,
            section.excerpt,
            manualId,
            sourceVersion,
            section.id,
            userId,
            'minor'
          );

          result.updated++;
        } else {
          // Create new article
          const slug = section.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          const { data: newArticle, error: insertError } = await supabase
            .from('kb_articles')
            .insert({
              title: section.title,
              slug: `${manualId}-${slug}-${Date.now()}`,
              content: section.content,
              excerpt: section.excerpt,
              category_id: categoryId,
              is_published: true,
              source_manual_id: manualId,
              source_section_id: section.id,
              last_synced_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) throw insertError;

          // Create initial version
          await this.createArticleVersion(
            newArticle.id,
            section.title,
            section.content,
            section.excerpt,
            manualId,
            sourceVersion,
            section.id,
            userId,
            'initial'
          );

          result.added++;
        }
      } catch (error: any) {
        result.errors.push(`Section ${section.id}: ${error.message}`);
      }
    }

    return result;
  }

  // Create a new article version
  static async createArticleVersion(
    articleId: string,
    title: string,
    content: string,
    excerpt: string | undefined,
    sourceManualId: string,
    sourceVersion: string,
    sectionId: string,
    userId: string,
    changeType: 'major' | 'minor' | 'patch' | 'initial'
  ): Promise<ArticleVersion | null> {
    // Get latest version
    const { data: latestVersions } = await supabase
      .from('kb_article_versions')
      .select('major_version, minor_version, patch_version')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false })
      .limit(1);

    let major = 1, minor = 0, patch = 0;
    
    if (latestVersions && latestVersions.length > 0) {
      const latest = latestVersions[0];
      switch (changeType) {
        case 'major':
          major = latest.major_version + 1;
          minor = 0;
          patch = 0;
          break;
        case 'minor':
          major = latest.major_version;
          minor = latest.minor_version + 1;
          patch = 0;
          break;
        case 'patch':
          major = latest.major_version;
          minor = latest.minor_version;
          patch = latest.patch_version + 1;
          break;
        case 'initial':
          break;
      }
    }

    const versionNumber = `${major}.${minor}.${patch}`;

    const { data, error } = await supabase
      .from('kb_article_versions')
      .insert({
        article_id: articleId,
        version_number: versionNumber,
        major_version: major,
        minor_version: minor,
        patch_version: patch,
        title,
        content,
        excerpt,
        change_type: changeType,
        source_manual_id: sourceManualId,
        source_manual_version: sourceVersion,
        source_section_id: sectionId,
        status: 'published',
        created_by: userId,
        published_by: userId,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating version:', error);
      return null;
    }

    // Update article with current version
    await supabase
      .from('kb_articles')
      .update({ current_version_id: data.id })
      .eq('id', articleId);

    return data as ArticleVersion;
  }

  // Get articles that need sync (manual updated since last sync)
  static async getArticlesNeedingSync(manualId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('*')
      .eq('source_manual_id', manualId)
      .order('title');

    if (error) throw error;
    return data || [];
  }

  // Archive a published manual
  static async archiveManual(manualId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('kb_published_manuals')
        .update({ status: 'archived' })
        .eq('manual_id', manualId)
        .eq('status', 'current');

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get publish history for a manual
  static async getPublishHistory(manualId: string): Promise<PublishedManual[]> {
    const { data, error } = await supabase
      .from('kb_published_manuals')
      .select('*')
      .eq('manual_id', manualId)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PublishedManual[];
  }
}
