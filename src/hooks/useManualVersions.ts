// Hooks for manual section version control

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SectionVersion {
  id: string;
  section_id: string;
  version_number: string;
  content: Record<string, any> | null;
  markdown_content: string | null;
  changelog_entry: string | null;
  generated_by: string | null;
  generated_at: string | null;
  ai_model_used: string | null;
  tokens_used: number | null;
  created_at: string;
}

// Fetch version history for a section
export function useSectionVersions(sectionId: string | null) {
  return useQuery({
    queryKey: ['section-versions', sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      
      const { data, error } = await supabase
        .from('manual_section_versions')
        .select('*')
        .eq('section_id', sectionId)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return (data || []) as SectionVersion[];
    },
    enabled: !!sectionId
  });
}

// Rollback to a previous version
export function useRollbackToVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionId, 
      versionId,
      changeSummary 
    }: { 
      sectionId: string; 
      versionId: string;
      changeSummary?: string;
    }) => {
      // 1. Get the version to rollback to
      const { data: version, error: versionError } = await supabase
        .from('manual_section_versions')
        .select('*')
        .eq('id', versionId)
        .single();
      
      if (versionError) throw versionError;
      
      // 2. Update the section with the old content
      const { data, error } = await supabase
        .from('manual_sections')
        .update({
          content: version.content,
          markdown_content: version.markdown_content
        })
        .eq('id', sectionId)
        .select()
        .single();
      
      if (error) throw error;
      
      // 3. Create a rollback version entry
      const { data: { user } } = await supabase.auth.getUser();
      const newVersion = String(parseInt(version.version_number || '1') + 1);
      const { error: insertError } = await supabase
        .from('manual_section_versions')
        .insert({
          section_id: sectionId,
          version_number: newVersion,
          content: version.content,
          markdown_content: version.markdown_content,
          generated_by: user?.id,
          changelog_entry: changeSummary || `Rolled back to version ${version.version_number}`
        });
      
      if (insertError) throw insertError;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      queryClient.invalidateQueries({ queryKey: ['section-versions'] });
      toast.success('Section rolled back successfully');
    },
    onError: (error: Error) => {
      toast.error(`Rollback failed: ${error.message}`);
    }
  });
}

// Create a manual version snapshot
export function useCreateVersionSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionId, 
      changeType = 'content',
      changeSummary 
    }: { 
      sectionId: string;
      changeType?: 'content' | 'structure' | 'branding' | 'import';
      changeSummary?: string;
    }) => {
      // Get current section data
      const { data: section, error: sectionError } = await supabase
        .from('manual_sections')
        .select('*')
        .eq('id', sectionId)
        .single();
      
      if (sectionError) throw sectionError;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create version snapshot
      const { data, error } = await supabase
        .from('manual_section_versions')
        .insert({
          section_id: sectionId,
          version_number: ((section as any).current_version || 0) + 1,
          title: section.title,
          content: section.content as Record<string, any>,
          markdown_content: (section as any).markdown_content,
          changed_by: user?.id,
          change_type: changeType,
          change_summary: changeSummary
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update current version number
      await supabase
        .from('manual_sections')
        .update({ current_version: ((section as any).current_version || 0) + 1 })
        .eq('id', sectionId);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-versions'] });
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create version: ${error.message}`);
    }
  });
}

// Compare two versions
export function useCompareVersions(versionId1: string | null, versionId2: string | null) {
  return useQuery({
    queryKey: ['version-compare', versionId1, versionId2],
    queryFn: async () => {
      if (!versionId1 || !versionId2) return null;
      
      const { data: versions, error } = await supabase
        .from('manual_section_versions')
        .select('*')
        .in('id', [versionId1, versionId2]);
      
      if (error) throw error;
      
      const v1 = versions.find(v => v.id === versionId1);
      const v2 = versions.find(v => v.id === versionId2);
      
      return { version1: v1, version2: v2 };
    },
    enabled: !!(versionId1 && versionId2)
  });
}

// Lock/unlock a section for manual editing
export function useToggleSectionLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionId, 
      isLocked 
    }: { 
      sectionId: string; 
      isLocked: boolean;
    }) => {
      const { data, error } = await supabase
        .from('manual_sections')
        .update({ is_locked: isLocked })
        .eq('id', sectionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      toast.success((data as any).is_locked ? 'Section locked from AI regeneration' : 'Section unlocked for AI regeneration');
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle lock: ${error.message}`);
    }
  });
}

// Update section with markdown content
export function useUpdateSectionWithMarkdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionId, 
      title,
      content,
      markdownContent,
      isLocked
    }: { 
      sectionId: string;
      title?: string;
      content?: Record<string, any>;
      markdownContent?: string;
      isLocked?: boolean;
    }) => {
      const updates: Record<string, any> = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (markdownContent !== undefined) updates.markdown_content = markdownContent;
      if (isLocked !== undefined) updates.is_locked = isLocked;
      
      const { data, error } = await supabase
        .from('manual_sections')
        .update(updates)
        .eq('id', sectionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      queryClient.invalidateQueries({ queryKey: ['section-versions'] });
      toast.success('Section updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update section: ${error.message}`);
    }
  });
}
