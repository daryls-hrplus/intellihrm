// Hook for AI-powered manual generation workflow

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ManualDefinition {
  id: string;
  manual_code: string;
  manual_name: string;
  description: string | null;
  current_version: string;
  module_codes: string[];
  last_generated_at: string | null;
  generation_status: 'idle' | 'generating' | 'review_pending' | 'failed';
  icon_name: string | null;
  color_class: string | null;
  href: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManualSection {
  id: string;
  manual_id: string;
  section_number: string;
  title: string;
  content: Record<string, any>;
  source_feature_codes: string[];
  source_module_codes: string[];
  last_generated_at: string | null;
  needs_regeneration: boolean;
  generation_hash: string | null;
  display_order: number;
  parent_section_id: string | null;
}

export interface ManualChangeDetection {
  id: string;
  manual_id: string;
  detected_at: string;
  change_type: 'feature_added' | 'feature_modified' | 'feature_removed' | 'module_updated';
  source_table: string;
  source_id: string;
  source_code: string | null;
  change_summary: string | null;
  affected_section_ids: string[];
  severity: 'minor' | 'major' | 'critical';
  is_processed: boolean;
}

export interface ManualGenerationRun {
  id: string;
  manual_id: string;
  triggered_by: string | null;
  run_type: 'full' | 'incremental' | 'section';
  version_bump: 'major' | 'minor' | 'patch' | null;
  from_version: string | null;
  to_version: string | null;
  sections_total: number;
  sections_regenerated: number;
  sections_failed: number;
  changelog: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
}

export interface ChangeDetectionResult {
  manualId: string;
  manualCode: string;
  totalChanges: number;
  changedFeatures: Array<{
    featureCode: string;
    featureName: string;
    changeType: 'added' | 'modified' | 'removed';
    updatedAt: string;
  }>;
  affectedSections: Array<{
    sectionId: string;
    sectionNumber: string;
    title: string;
    affectedBy: string[];
  }>;
  severity: 'minor' | 'major' | 'critical';
  changeReport: {
    summary: string;
    recommendedAction: string;
    versionBump: 'patch' | 'minor' | 'major';
  };
}

// Fetch all manual definitions
export function useManualDefinitions() {
  return useQuery({
    queryKey: ['manual-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manual_definitions')
        .select('*')
        .order('manual_name');
      
      if (error) throw error;
      return data as ManualDefinition[];
    }
  });
}

// Fetch sections for a specific manual
export function useManualSections(manualId: string | null) {
  return useQuery({
    queryKey: ['manual-sections', manualId],
    queryFn: async () => {
      if (!manualId) return [];
      
      const { data, error } = await supabase
        .from('manual_sections')
        .select('*')
        .eq('manual_id', manualId)
        .order('display_order');
      
      if (error) throw error;
      return data as ManualSection[];
    },
    enabled: !!manualId
  });
}

// Fetch unprocessed change detections
export function useManualChangeDetections(manualId?: string) {
  return useQuery({
    queryKey: ['manual-change-detections', manualId],
    queryFn: async () => {
      let query = supabase
        .from('manual_change_detections')
        .select('*')
        .eq('is_processed', false)
        .order('detected_at', { ascending: false });
      
      if (manualId) {
        query = query.eq('manual_id', manualId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ManualChangeDetection[];
    }
  });
}

// Fetch generation runs for a manual
export function useManualGenerationRuns(manualId: string | null) {
  return useQuery({
    queryKey: ['manual-generation-runs', manualId],
    queryFn: async () => {
      if (!manualId) return [];
      
      const { data, error } = await supabase
        .from('manual_generation_runs')
        .select('*')
        .eq('manual_id', manualId)
        .order('started_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as ManualGenerationRun[];
    },
    enabled: !!manualId
  });
}

// Detect changes for manuals
export function useDetectChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (manualCode?: string) => {
      const { data, error } = await supabase.functions.invoke('detect-manual-changes', {
        body: { manualCode }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.results as ChangeDetectionResult[];
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['manual-change-detections'] });
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      
      const totalChanges = results.reduce((sum, r) => sum + r.totalChanges, 0);
      if (totalChanges > 0) {
        toast.success(`Detected ${totalChanges} change(s) across ${results.length} manual(s)`);
      } else {
        toast.info('No changes detected');
      }
    },
    onError: (error: Error) => {
      toast.error(`Change detection failed: ${error.message}`);
    }
  });
}

// Generate a single section
export function useGenerateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionId, 
      regenerationType = 'full',
      customInstructions 
    }: { 
      sectionId: string; 
      regenerationType?: 'full' | 'incremental';
      customInstructions?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('generate-manual-section', {
        body: { 
          sectionId, 
          regenerationType,
          customInstructions,
          userId: user?.id 
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      toast.success(`Section generated (v${data.version})`);
    },
    onError: (error: Error) => {
      toast.error(`Generation failed: ${error.message}`);
    }
  });
}

// Regenerate entire manual or selected sections
export function useRegenerateManual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      manualCode, 
      runType = 'incremental',
      versionBump = 'minor',
      sectionIds 
    }: { 
      manualCode: string;
      runType?: 'full' | 'incremental' | 'section';
      versionBump?: 'major' | 'minor' | 'patch';
      sectionIds?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('regenerate-manual', {
        body: { 
          manualCode, 
          runType,
          versionBump,
          sectionIds,
          userId: user?.id 
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['manual-definitions'] });
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      queryClient.invalidateQueries({ queryKey: ['manual-generation-runs'] });
      queryClient.invalidateQueries({ queryKey: ['manual-change-detections'] });
      
      toast.success(
        `Manual updated to v${data.newVersion} (${data.sectionsRegenerated} sections)`
      );
    },
    onError: (error: Error) => {
      toast.error(`Regeneration failed: ${error.message}`);
    }
  });
}

// Create a new section
export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (section: Omit<ManualSection, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('manual_sections')
        .insert(section)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-sections'] });
      toast.success('Section created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create section: ${error.message}`);
    }
  });
}

// Update section content manually
export function useUpdateSectionContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionId, 
      content,
      title 
    }: { 
      sectionId: string; 
      content: Record<string, any>;
      title?: string;
    }) => {
      const updates: Record<string, any> = { content };
      if (title) updates.title = title;
      
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
      toast.success('Section updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update section: ${error.message}`);
    }
  });
}

// Get sections needing regeneration count
export function useSectionsNeedingRegeneration(manualId: string | null) {
  return useQuery({
    queryKey: ['sections-needing-regen', manualId],
    queryFn: async () => {
      if (!manualId) return 0;
      
      const { count, error } = await supabase
        .from('manual_sections')
        .select('id', { count: 'exact', head: true })
        .eq('manual_id', manualId)
        .eq('needs_regeneration', true);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!manualId
  });
}
