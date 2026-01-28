// Hook for manual section preview and diff workflow
import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useManualDefinitions, useManualSections, ManualDefinition, ManualSection } from "./useManualGeneration";
import { extractChapters, ChapterInfo } from "./useChapterGeneration";
import { useQueryClient } from "@tanstack/react-query";

export interface PreviewResult {
  currentContent: string;
  proposedContent: string;
  sectionInfo: {
    sectionNumber: string;
    title: string;
    lastGeneratedAt: string | null;
    currentVersion: string;
  };
}

export interface ManualSectionPreviewState {
  // Selection state
  selectedManualId: string;
  selectedChapter: string;
  selectedSectionId: string;
  
  // Data
  manuals: ManualDefinition[];
  sections: ManualSection[];
  chapters: ChapterInfo[];
  isLoadingManuals: boolean;
  isLoadingSections: boolean;
  
  // Preview state
  isGeneratingPreview: boolean;
  isApplying: boolean;
  previewResult: PreviewResult | null;
  previewError: string | null;
  
  // Computed
  selectedSection: ManualSection | null;
  sectionsForChapter: ManualSection[];
  
  // Actions
  setSelectedManualId: (id: string) => void;
  setSelectedChapter: (chapterNumber: string) => void;
  setSelectedSectionId: (id: string) => void;
  generatePreview: (customInstructions?: string) => Promise<PreviewResult | null>;
  applyChanges: (saveAsDraft?: boolean) => Promise<boolean>;
  regenerateSection: () => Promise<boolean>;
  regenerateChapter: () => Promise<boolean>;
  clearPreview: () => void;
}

export function useManualSectionPreview(): ManualSectionPreviewState {
  const queryClient = useQueryClient();
  
  // Selection state
  const [selectedManualId, setSelectedManualId] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  
  // Preview state
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  // Data fetching
  const { data: manuals = [], isLoading: isLoadingManuals } = useManualDefinitions();
  const { data: sections = [], isLoading: isLoadingSections } = useManualSections(selectedManualId || null);
  
  // Extract chapters from sections
  const chapters = useMemo(() => {
    if (sections.length === 0) return [];
    return extractChapters(sections);
  }, [sections]);
  
  // Get sections for selected chapter
  const sectionsForChapter = useMemo(() => {
    if (!selectedChapter || sections.length === 0) return [];
    return sections.filter(s => {
      const sectionChapter = s.section_number.split('.')[0];
      return sectionChapter === selectedChapter;
    }).sort((a, b) => a.display_order - b.display_order);
  }, [selectedChapter, sections]);
  
  // Get selected section
  const selectedSection = useMemo(() => {
    if (!selectedSectionId) return null;
    return sections.find(s => s.id === selectedSectionId) || null;
  }, [selectedSectionId, sections]);
  
  // Handle manual selection change
  const handleManualChange = useCallback((id: string) => {
    setSelectedManualId(id);
    setSelectedChapter("");
    setSelectedSectionId("");
    setPreviewResult(null);
    setPreviewError(null);
  }, []);
  
  // Handle chapter selection change
  const handleChapterChange = useCallback((chapterNumber: string) => {
    setSelectedChapter(chapterNumber);
    setSelectedSectionId("");
    setPreviewResult(null);
    setPreviewError(null);
  }, []);
  
  // Handle section selection change
  const handleSectionChange = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setPreviewResult(null);
    setPreviewError(null);
  }, []);
  
  // Convert section content to markdown string
  const contentToMarkdown = (content: Record<string, unknown>): string => {
    if (!content) return "";
    
    // If content has a 'markdown' field, use it
    if (typeof content.markdown === 'string') {
      return content.markdown;
    }
    
    // If content has a 'content' field that's a string, use it
    if (typeof content.content === 'string') {
      return content.content;
    }
    
    // Otherwise try to stringify
    try {
      return JSON.stringify(content, null, 2);
    } catch {
      return "";
    }
  };
  
  // Generate preview (new content without saving)
  const generatePreview = useCallback(async (customInstructions?: string): Promise<PreviewResult | null> => {
    if (!selectedSectionId || !selectedSection) {
      toast.error("Please select a section first");
      return null;
    }
    
    setIsGeneratingPreview(true);
    setPreviewError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('content-creation-agent', {
        body: {
          action: 'preview_section_regeneration',
          context: {
            sectionId: selectedSectionId,
            customInstructions,
          }
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Preview generation failed");
      }
      
      const result: PreviewResult = {
        currentContent: data.currentContent,
        proposedContent: data.proposedContent,
        sectionInfo: data.sectionInfo,
      };
      
      setPreviewResult(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate preview";
      setPreviewError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [selectedSectionId, selectedSection]);
  
  // Apply the previewed changes (saves as draft for review by default)
  const applyChanges = useCallback(async (saveAsDraft = true): Promise<boolean> => {
    if (!previewResult || !selectedSectionId) {
      toast.error("No preview to apply");
      return false;
    }
    
    setIsApplying(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (saveAsDraft) {
        // Save to draft_content and set review_status to pending_review
        const { error } = await supabase
          .from('manual_sections')
          .update({
            draft_content: { markdown: previewResult.proposedContent },
            review_status: 'pending_review',
            submitted_for_review_at: new Date().toISOString(),
            submitted_by: user?.id || null,
            last_generated_at: new Date().toISOString(),
            needs_regeneration: false,
          })
          .eq('id', selectedSectionId);
        
        if (error) throw error;
        
        // Create audit trail entry
        await supabase.from('manual_section_reviews').insert({
          section_id: selectedSectionId,
          previous_content: selectedSection?.content || null,
          proposed_content: { markdown: previewResult.proposedContent },
          action: 'submitted',
          action_by: user?.id || null,
          notes: 'Submitted for review via Content Creation Studio',
        });
        
        toast.success("Content submitted for review");
      } else {
        // Direct apply (for already-approved content or when skipping review)
        const { error } = await supabase
          .from('manual_sections')
          .update({
            content: { markdown: previewResult.proposedContent },
            review_status: 'approved',
            last_generated_at: new Date().toISOString(),
            needs_regeneration: false,
          })
          .eq('id', selectedSectionId);
        
        if (error) throw error;
        toast.success("Changes applied directly");
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      
      setPreviewResult(null);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to apply changes";
      toast.error(message);
      return false;
    } finally {
      setIsApplying(false);
    }
  }, [previewResult, selectedSectionId, selectedSection, queryClient]);
  
  // Regenerate section directly (no preview)
  const regenerateSection = useCallback(async (): Promise<boolean> => {
    if (!selectedSectionId) {
      toast.error("Please select a section first");
      return false;
    }
    
    setIsApplying(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('generate-manual-section', {
        body: {
          sectionId: selectedSectionId,
          regenerationType: 'full',
          userId: user?.id,
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      toast.success("Section regenerated successfully");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to regenerate section";
      toast.error(message);
      return false;
    } finally {
      setIsApplying(false);
    }
  }, [selectedSectionId, queryClient]);
  
  // Regenerate entire chapter
  const regenerateChapter = useCallback(async (): Promise<boolean> => {
    if (!selectedManualId || !selectedChapter) {
      toast.error("Please select a chapter first");
      return false;
    }
    
    setIsApplying(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('generate-manual-chapter', {
        body: {
          manualId: selectedManualId,
          chapterNumber: selectedChapter,
          userId: user?.id,
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      toast.success(`Chapter ${selectedChapter} regenerated (${data.successCount} sections)`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to regenerate chapter";
      toast.error(message);
      return false;
    } finally {
      setIsApplying(false);
    }
  }, [selectedManualId, selectedChapter, queryClient]);
  
  // Clear preview
  const clearPreview = useCallback(() => {
    setPreviewResult(null);
    setPreviewError(null);
  }, []);
  
  return {
    // Selection state
    selectedManualId,
    selectedChapter,
    selectedSectionId,
    
    // Data
    manuals,
    sections,
    chapters,
    isLoadingManuals,
    isLoadingSections,
    
    // Preview state
    isGeneratingPreview,
    isApplying,
    previewResult,
    previewError,
    
    // Computed
    selectedSection,
    sectionsForChapter,
    
    // Actions
    setSelectedManualId: handleManualChange,
    setSelectedChapter: handleChapterChange,
    setSelectedSectionId: handleSectionChange,
    generatePreview,
    applyChanges,
    regenerateSection,
    regenerateChapter,
    clearPreview,
  };
}

