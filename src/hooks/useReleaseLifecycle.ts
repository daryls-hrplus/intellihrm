import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export type ReleaseStatus = 'pre-release' | 'preview' | 'ga-released' | 'maintenance';

export interface Milestone {
  id: string;
  name: string;
  targetDate: string | null;
  completed: boolean;
  completedAt?: string;
}

export interface ReleaseLifecycle {
  id: string;
  company_id: string | null;
  release_status: ReleaseStatus;
  current_release_id: string | null;
  version_freeze_enabled: boolean;
  base_version: string;
  target_ga_date: string | null;
  milestones: Milestone[];
  last_readiness_score: number | null;
  last_readiness_assessment: ReadinessAssessment | null;
  last_assessment_at: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface ReadinessAssessment {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  manuals: Array<{
    manualId: string;
    name: string;
    readinessScore: number;
    issues: string[];
    recommendations: string[];
  }>;
  blockers: string[];
  warnings: string[];
  readyForRelease: boolean;
}

const parseReleaseStatus = (status: string): ReleaseStatus => {
  const validStatuses: ReleaseStatus[] = ['pre-release', 'preview', 'ga-released', 'maintenance'];
  return validStatuses.includes(status as ReleaseStatus) 
    ? (status as ReleaseStatus) 
    : 'pre-release';
};

const parseMilestones = (data: Json | null): Milestone[] => {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((item) => {
      const m = item as Record<string, unknown>;
      return {
        id: String(m.id || ''),
        name: String(m.name || ''),
        targetDate: m.targetDate ? String(m.targetDate) : null,
        completed: Boolean(m.completed),
        completedAt: m.completedAt ? String(m.completedAt) : undefined,
      };
    });
  }
  return [];
};

const parseReadinessAssessment = (data: Json | null): ReadinessAssessment | null => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const obj = data as Record<string, unknown>;
  if (!obj.overallScore || !obj.grade) return null;
  
  return {
    overallScore: Number(obj.overallScore),
    grade: obj.grade as 'A' | 'B' | 'C' | 'D' | 'F',
    manuals: Array.isArray(obj.manuals) ? obj.manuals.map((m: unknown) => {
      const manual = m as Record<string, unknown>;
      return {
        manualId: String(manual.manualId || ''),
        name: String(manual.name || ''),
        readinessScore: Number(manual.readinessScore || 0),
        issues: Array.isArray(manual.issues) ? manual.issues.map(String) : [],
        recommendations: Array.isArray(manual.recommendations) ? manual.recommendations.map(String) : [],
      };
    }) : [],
    blockers: Array.isArray(obj.blockers) ? obj.blockers.map(String) : [],
    warnings: Array.isArray(obj.warnings) ? obj.warnings.map(String) : [],
    readyForRelease: Boolean(obj.readyForRelease),
  };
};

export function useReleaseLifecycle() {
  const queryClient = useQueryClient();

  // Fetch the release lifecycle configuration
  const { data: lifecycle, isLoading, error } = useQuery({
    queryKey: ['release-lifecycle'],
    queryFn: async (): Promise<ReleaseLifecycle | null> => {
      const { data, error } = await supabase
        .from('enablement_release_lifecycle')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          id: data.id,
          company_id: data.company_id,
          release_status: parseReleaseStatus(data.release_status),
          current_release_id: data.current_release_id,
          version_freeze_enabled: data.version_freeze_enabled,
          base_version: data.base_version,
          target_ga_date: data.target_ga_date,
          milestones: parseMilestones(data.milestones),
          last_readiness_score: data.last_readiness_score,
          last_readiness_assessment: parseReadinessAssessment(data.last_readiness_assessment),
          last_assessment_at: data.last_assessment_at,
          created_at: data.created_at,
          updated_at: data.updated_at,
          updated_by: data.updated_by,
        };
      }
      return null;
    },
  });

  // Derived state
  const isPreRelease = lifecycle?.release_status === 'pre-release';
  const isPreview = lifecycle?.release_status === 'preview';
  const isGAReleased = lifecycle?.release_status === 'ga-released';
  const isMaintenance = lifecycle?.release_status === 'maintenance';
  const versionFreezeEnabled = lifecycle?.version_freeze_enabled ?? true;

  // Update lifecycle configuration
  const updateLifecycle = useMutation({
    mutationFn: async (updates: Partial<Omit<ReleaseLifecycle, 'id' | 'created_at' | 'updated_at'>>) => {
      if (!lifecycle?.id) {
        // Create new record if none exists
        const { data, error } = await supabase
          .from('enablement_release_lifecycle')
          .insert({
            release_status: updates.release_status || 'pre-release',
            version_freeze_enabled: updates.version_freeze_enabled ?? true,
            base_version: updates.base_version || '1.0.0',
            target_ga_date: updates.target_ga_date,
            milestones: (updates.milestones || []) as unknown as Json,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }

      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.release_status !== undefined) updatePayload.release_status = updates.release_status;
      if (updates.version_freeze_enabled !== undefined) updatePayload.version_freeze_enabled = updates.version_freeze_enabled;
      if (updates.base_version !== undefined) updatePayload.base_version = updates.base_version;
      if (updates.target_ga_date !== undefined) updatePayload.target_ga_date = updates.target_ga_date;
      if (updates.milestones !== undefined) updatePayload.milestones = updates.milestones as unknown as Json;
      if (updates.last_readiness_score !== undefined) updatePayload.last_readiness_score = updates.last_readiness_score;
      if (updates.last_readiness_assessment !== undefined) updatePayload.last_readiness_assessment = updates.last_readiness_assessment as unknown as Json;
      if (updates.last_assessment_at !== undefined) updatePayload.last_assessment_at = updates.last_assessment_at;

      const { data, error } = await supabase
        .from('enablement_release_lifecycle')
        .update(updatePayload)
        .eq('id', lifecycle.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-lifecycle'] });
      toast.success('Release lifecycle updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // Add a milestone
  const addMilestone = useMutation({
    mutationFn: async (milestone: Omit<Milestone, 'id'>) => {
      const newMilestone: Milestone = {
        ...milestone,
        id: crypto.randomUUID(),
      };

      const currentMilestones = lifecycle?.milestones || [];
      const updatedMilestones = [...currentMilestones, newMilestone];

      return updateLifecycle.mutateAsync({ milestones: updatedMilestones });
    },
    onSuccess: () => {
      toast.success('Milestone added');
    },
  });

  // Complete a milestone
  const completeMilestone = useMutation({
    mutationFn: async (milestoneId: string) => {
      const currentMilestones = lifecycle?.milestones || [];
      const updatedMilestones = currentMilestones.map((m) =>
        m.id === milestoneId
          ? { ...m, completed: true, completedAt: new Date().toISOString() }
          : m
      );

      return updateLifecycle.mutateAsync({ milestones: updatedMilestones });
    },
    onSuccess: () => {
      toast.success('Milestone completed');
    },
  });

  // Remove a milestone
  const removeMilestone = useMutation({
    mutationFn: async (milestoneId: string) => {
      const currentMilestones = lifecycle?.milestones || [];
      const updatedMilestones = currentMilestones.filter((m) => m.id !== milestoneId);

      return updateLifecycle.mutateAsync({ milestones: updatedMilestones });
    },
    onSuccess: () => {
      toast.success('Milestone removed');
    },
  });

  // Update readiness assessment cache
  const updateReadinessCache = useMutation({
    mutationFn: async (assessment: ReadinessAssessment) => {
      if (!lifecycle?.id) throw new Error('No lifecycle record found');

      const { error } = await supabase
        .from('enablement_release_lifecycle')
        .update({
          last_readiness_score: assessment.overallScore,
          last_readiness_assessment: assessment as unknown as Json,
          last_assessment_at: new Date().toISOString(),
        })
        .eq('id', lifecycle.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-lifecycle'] });
    },
  });

  // Get release status display info
  const getStatusDisplay = () => {
    switch (lifecycle?.release_status) {
      case 'pre-release':
        return { label: 'Pre-Release', color: 'bg-amber-500/10 text-amber-700 border-amber-500/30' };
      case 'preview':
        return { label: 'Preview', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' };
      case 'ga-released':
        return { label: 'GA Released', color: 'bg-green-500/10 text-green-700 border-green-500/30' };
      case 'maintenance':
        return { label: 'Maintenance', color: 'bg-slate-500/10 text-slate-700 border-slate-500/30' };
      default:
        return { label: 'Unknown', color: 'bg-muted text-muted-foreground' };
    }
  };

  // Calculate days to GA
  const getDaysToGA = () => {
    if (!lifecycle?.target_ga_date) return null;
    const today = new Date();
    const gaDate = new Date(lifecycle.target_ga_date);
    const diffTime = gaDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get milestone progress
  const getMilestoneProgress = () => {
    const milestones = lifecycle?.milestones || [];
    if (milestones.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = milestones.filter(m => m.completed).length;
    return {
      completed,
      total: milestones.length,
      percentage: Math.round((completed / milestones.length) * 100),
    };
  };

  return {
    lifecycle,
    isLoading,
    error,
    // Derived state
    isPreRelease,
    isPreview,
    isGAReleased,
    isMaintenance,
    versionFreezeEnabled,
    // Display helpers
    getStatusDisplay,
    getDaysToGA,
    getMilestoneProgress,
    // Mutations
    updateLifecycle,
    addMilestone,
    completeMilestone,
    removeMilestone,
    updateReadinessCache,
  };
}

// Helper hook for version freeze status (used in publishing)
export function useVersionFreezeStatus() {
  const { lifecycle, isPreRelease, versionFreezeEnabled } = useReleaseLifecycle();
  
  return {
    isVersionFrozen: versionFreezeEnabled && isPreRelease,
    baseVersion: lifecycle?.base_version || '1.0.0',
    releaseStatus: lifecycle?.release_status || 'pre-release',
  };
}
