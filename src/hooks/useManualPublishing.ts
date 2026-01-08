// Hook for manual publishing workflow

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ManualPublishService } from "@/services/kb/ManualPublishService";
import type { PublishOptions, PublishedManual } from "@/services/kb/types";
import { toast } from "sonner";

// Manual configurations - matches the Enablement Hub manuals
export const MANUAL_CONFIGS = [
  {
    id: 'admin-security',
    name: 'Admin & Security - Administrator Guide',
    version: 'v1.3.0',
    sectionsCount: 55,
    href: '/enablement/manuals/admin-security',
    icon: 'Shield',
    color: 'bg-red-500/10 text-red-600',
  },
  {
    id: 'workforce',
    name: 'Workforce - Administrator Guide',
    version: 'v1.3.0',
    sectionsCount: 80,
    href: '/enablement/manuals/workforce',
    icon: 'Users',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: 'hr-hub',
    name: 'HR Hub - Administrator Guide',
    version: 'v1.3.0',
    sectionsCount: 32,
    href: '/enablement/manuals/hr-hub',
    icon: 'HelpCircle',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    id: 'appraisals',
    name: 'Performance Appraisal - Administrator Guide',
    version: 'v1.3.0',
    sectionsCount: 48,
    href: '/enablement/manuals/appraisals',
    icon: 'BookOpen',
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'goals',
    name: 'Goals Manual',
    version: 'v1.3.0',
    sectionsCount: 24,
    href: '/enablement/manuals/goals',
    icon: 'Target',
    color: 'bg-green-500/10 text-green-600',
  },
];

export function useManualPublishing() {
  const queryClient = useQueryClient();

  // Fetch all published manuals
  const { data: publishedManuals = [], isLoading, error } = useQuery({
    queryKey: ['published-manuals'],
    queryFn: () => ManualPublishService.getPublishedManuals(),
  });

  // Get publication status for each manual
  const getManualStatus = (manualId: string) => {
    const published = publishedManuals.find(
      p => p.manual_id === manualId && p.status === 'current'
    );
    const config = MANUAL_CONFIGS.find(m => m.id === manualId);
    
    if (!published) {
      return {
        isPublished: false,
        publishedVersion: null,
        sourceVersion: config?.version || 'v1.0.0',
        needsSync: false,
        sectionsPublished: 0,
        sectionsTotal: config?.sectionsCount || 0,
      };
    }

    const needsSync = config?.version !== published.source_version;
    
    return {
      isPublished: true,
      publishedVersion: published.published_version,
      sourceVersion: config?.version || 'v1.0.0',
      needsSync,
      sectionsPublished: published.sections_published,
      sectionsTotal: config?.sectionsCount || 0,
      publishedAt: published.published_at,
    };
  };

  // Publish a manual
  const publishManual = useMutation({
    mutationFn: async ({ options, userId }: { options: PublishOptions; userId: string }) => {
      const result = await ManualPublishService.publishManual(options, userId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-manuals'] });
      toast.success('Manual published successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish: ${error.message}`);
    },
  });

  // Get next version for a manual
  const getNextVersion = async (manualId: string, incrementType: 'major' | 'minor' | 'patch') => {
    return ManualPublishService.getNextVersion(manualId, incrementType);
  };

  // Get publish history for a manual
  const getPublishHistory = async (manualId: string) => {
    return ManualPublishService.getPublishHistory(manualId);
  };

  return {
    manualConfigs: MANUAL_CONFIGS,
    publishedManuals,
    isLoading,
    error,
    getManualStatus,
    publishManual,
    getNextVersion,
    getPublishHistory,
  };
}

// Hook for a single manual's publishing state
export function useManualPublishStatus(manualId: string) {
  const { data: published, isLoading } = useQuery({
    queryKey: ['published-manual', manualId],
    queryFn: () => ManualPublishService.getPublishedManual(manualId),
  });

  const config = MANUAL_CONFIGS.find(m => m.id === manualId);

  return {
    published,
    config,
    isLoading,
    isPublished: !!published,
    needsSync: published ? config?.version !== published.source_version : false,
  };
}
