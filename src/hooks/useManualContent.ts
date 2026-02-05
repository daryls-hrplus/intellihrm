import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ManualSection {
  id: string;
  manual_id: string;
  section_id: string;
  chapter_id: string;
  title: string;
  content_markdown: string;
  read_time_minutes: number;
  target_roles: string[];
  order_index: number;
  chapter_order: number;
  parent_section_id: string | null;
  metadata: Record<string, unknown>;
}

export interface ManualChapter {
  chapter_id: string;
  chapter_order: number;
  title: string;
  sections: ManualSection[];
}

/**
 * Fetches the table of contents (metadata only) for a manual
 */
export function useManualTableOfContents(manualId: string | undefined) {
  return useQuery({
    queryKey: ['manual-toc', manualId],
    queryFn: async () => {
      if (!manualId) return [];
      
      const { data, error } = await supabase
        .from('manual_content')
        .select('id, manual_id, section_id, chapter_id, title, read_time_minutes, order_index, chapter_order, parent_section_id')
        .eq('manual_id', manualId)
        .order('chapter_order', { ascending: true })
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Pick<ManualSection, 'id' | 'manual_id' | 'section_id' | 'chapter_id' | 'title' | 'read_time_minutes' | 'order_index' | 'chapter_order' | 'parent_section_id'>[];
    },
    enabled: !!manualId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Fetches a single section's full content
 */
export function useManualSection(manualId: string | undefined, sectionId: string | undefined) {
  return useQuery({
    queryKey: ['manual-section', manualId, sectionId],
    queryFn: async () => {
      if (!manualId || !sectionId) return null;
      
      const { data, error } = await supabase
        .from('manual_content')
        .select('*')
        .eq('manual_id', manualId)
        .eq('section_id', sectionId)
        .single();
      
      if (error) throw error;
      return data as ManualSection;
    },
    enabled: !!manualId && !!sectionId,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}

/**
 * Fetches all sections for a chapter
 */
export function useManualChapter(manualId: string | undefined, chapterId: string | undefined) {
  return useQuery({
    queryKey: ['manual-chapter', manualId, chapterId],
    queryFn: async () => {
      if (!manualId || !chapterId) return [];
      
      const { data, error } = await supabase
        .from('manual_content')
        .select('*')
        .eq('manual_id', manualId)
        .eq('chapter_id', chapterId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as ManualSection[];
    },
    enabled: !!manualId && !!chapterId,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}

/**
 * Full-text search across manual content
 */
export function useManualSearch(manualId: string | undefined, searchTerm: string) {
  return useQuery({
    queryKey: ['manual-search', manualId, searchTerm],
    queryFn: async () => {
      if (!manualId || !searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('manual_content')
        .select('id, section_id, chapter_id, title, content_markdown')
        .eq('manual_id', manualId)
        .textSearch('search_vector', searchTerm, { type: 'websearch' })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!manualId && searchTerm.length >= 2,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}

/**
 * Groups sections into chapters for TOC display
 */
export function groupSectionsIntoChapters(
  sections: Pick<ManualSection, 'chapter_id' | 'chapter_order' | 'title' | 'section_id' | 'order_index' | 'read_time_minutes' | 'parent_section_id'>[]
): ManualChapter[] {
  const chaptersMap = new Map<string, ManualChapter>();
  
  for (const section of sections) {
    if (!chaptersMap.has(section.chapter_id)) {
      chaptersMap.set(section.chapter_id, {
        chapter_id: section.chapter_id,
        chapter_order: section.chapter_order,
        title: '', // Will be set from first section with parent_section_id = null
        sections: [],
      });
    }
    
    const chapter = chaptersMap.get(section.chapter_id)!;
    
    // First section without parent is the chapter title
    if (!section.parent_section_id && !chapter.title) {
      chapter.title = section.title;
    }
    
    chapter.sections.push(section as ManualSection);
  }
  
  return Array.from(chaptersMap.values())
    .sort((a, b) => a.chapter_order - b.chapter_order);
}
