// Hook for chapter-by-chapter manual generation
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ManualSection } from "./useManualGeneration";

export interface ChapterInfo {
  chapterNumber: string;
  title: string;
  sectionCount: number;
  sections: ManualSection[];
}

export interface ChapterGenerationStatus {
  chapterNumber: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  successCount?: number;
  failCount?: number;
  error?: string;
}

export interface ChapterGenerationProgress {
  isGenerating: boolean;
  currentChapter: string | null;
  completedChapters: string[];
  failedChapters: string[];
  totalChapters: number;
  chapterStatuses: Record<string, ChapterGenerationStatus>;
}

// Extract chapters from flat section list
export function extractChapters(sections: ManualSection[]): ChapterInfo[] {
  const chapters: ChapterInfo[] = [];
  const chapterMap = new Map<string, ManualSection[]>();

  // Group sections by their parent chapter number
  for (const section of sections) {
    const chapterNum = section.section_number.split('.')[0];
    if (!chapterMap.has(chapterNum)) {
      chapterMap.set(chapterNum, []);
    }
    chapterMap.get(chapterNum)!.push(section);
  }

  // Convert to ChapterInfo array
  for (const [chapterNumber, sectionList] of chapterMap) {
    // Find the parent section (the one without a dot) for the title
    const parentSection = sectionList.find(s => s.section_number === chapterNumber);
    const title = parentSection?.title || `Chapter ${chapterNumber}`;

    chapters.push({
      chapterNumber,
      title,
      sectionCount: sectionList.length,
      sections: sectionList.sort((a, b) => a.display_order - b.display_order)
    });
  }

  // Sort by chapter number
  return chapters.sort((a, b) => parseInt(a.chapterNumber) - parseInt(b.chapterNumber));
}

export function useChapterGeneration(manualId: string | null) {
  const queryClient = useQueryClient();
  
  const [progress, setProgress] = useState<ChapterGenerationProgress>({
    isGenerating: false,
    currentChapter: null,
    completedChapters: [],
    failedChapters: [],
    totalChapters: 0,
    chapterStatuses: {}
  });

  const resetProgress = useCallback(() => {
    setProgress({
      isGenerating: false,
      currentChapter: null,
      completedChapters: [],
      failedChapters: [],
      totalChapters: 0,
      chapterStatuses: {}
    });
  }, []);

  const generateChapter = useCallback(async (chapterNumber: string): Promise<boolean> => {
    if (!manualId) return false;

    const { data: { user } } = await supabase.auth.getUser();

    setProgress(prev => ({
      ...prev,
      currentChapter: chapterNumber,
      chapterStatuses: {
        ...prev.chapterStatuses,
        [chapterNumber]: { chapterNumber, status: 'generating' }
      }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('generate-manual-chapter', {
        body: { 
          manualId, 
          chapterNumber,
          userId: user?.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setProgress(prev => ({
          ...prev,
          completedChapters: [...prev.completedChapters, chapterNumber],
          chapterStatuses: {
            ...prev.chapterStatuses,
            [chapterNumber]: { 
              chapterNumber, 
              status: 'completed',
              successCount: data.successCount,
              failCount: data.failCount
            }
          }
        }));
        return true;
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setProgress(prev => ({
        ...prev,
        failedChapters: [...prev.failedChapters, chapterNumber],
        chapterStatuses: {
          ...prev.chapterStatuses,
          [chapterNumber]: { 
            chapterNumber, 
            status: 'failed',
            error: errorMessage
          }
        }
      }));
      return false;
    }
  }, [manualId]);

  const generateChapters = useCallback(async (
    chapters: ChapterInfo[],
    options?: { 
      stopOnError?: boolean;
      onChapterComplete?: (chapter: ChapterInfo, success: boolean) => void;
    }
  ) => {
    if (!manualId || chapters.length === 0) return;

    const { stopOnError = false, onChapterComplete } = options || {};

    // Initialize progress
    const initialStatuses: Record<string, ChapterGenerationStatus> = {};
    for (const chapter of chapters) {
      initialStatuses[chapter.chapterNumber] = { 
        chapterNumber: chapter.chapterNumber, 
        status: 'pending' 
      };
    }

    setProgress({
      isGenerating: true,
      currentChapter: null,
      completedChapters: [],
      failedChapters: [],
      totalChapters: chapters.length,
      chapterStatuses: initialStatuses
    });

    let successCount = 0;
    let failCount = 0;

    for (const chapter of chapters) {
      const success = await generateChapter(chapter.chapterNumber);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
        if (stopOnError) {
          toast.error(`Generation stopped at Chapter ${chapter.chapterNumber}`);
          break;
        }
      }

      onChapterComplete?.(chapter, success);

      // Small delay between chapters
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Update manual status and version after all chapters
    if (successCount > 0) {
      // Get current manual to update version
      const { data: manual } = await supabase
        .from('manual_definitions')
        .select('current_version')
        .eq('id', manualId)
        .single();

      const currentVersion = manual?.current_version || '0.0.0';
      const newVersion = incrementVersion(currentVersion, failCount === 0 ? 'minor' : 'patch');

      await supabase
        .from('manual_definitions')
        .update({
          current_version: newVersion,
          last_generated_at: new Date().toISOString(),
          generation_status: 'idle'
        })
        .eq('id', manualId);
    }

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['manual-definitions'] });
    queryClient.invalidateQueries({ queryKey: ['manual-sections'] });

    setProgress(prev => ({
      ...prev,
      isGenerating: false,
      currentChapter: null
    }));

    if (failCount === 0) {
      toast.success(`All ${successCount} chapters generated successfully!`);
    } else if (successCount > 0) {
      toast.warning(`Generated ${successCount} chapters, ${failCount} failed`);
    } else {
      toast.error('All chapters failed to generate');
    }
  }, [manualId, generateChapter, queryClient]);

  const cancelGeneration = useCallback(async () => {
    // Reset manual status to idle
    if (manualId) {
      await supabase
        .from('manual_definitions')
        .update({ generation_status: 'idle' })
        .eq('id', manualId);
    }

    setProgress(prev => ({
      ...prev,
      isGenerating: false,
      currentChapter: null
    }));

    toast.info('Generation cancelled');
  }, [manualId]);

  return {
    progress,
    generateChapter,
    generateChapters,
    cancelGeneration,
    resetProgress
  };
}

function incrementVersion(currentVersion: string, bumpType: 'major' | 'minor' | 'patch'): string {
  const parts = currentVersion.replace('v', '').split('.').map(Number);
  const [major = 1, minor = 0, patch = 0] = parts;

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}
