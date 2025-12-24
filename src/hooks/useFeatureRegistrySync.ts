import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";
import { toast } from "sonner";

export interface SyncResult {
  success: boolean;
  dryRun: boolean;
  summary: {
    newFeatures: number;
    updatedFeatures: number;
    unchanged: number;
    total: number;
  };
  newFeatureDetails: Array<{
    code: string;
    name: string;
    description: string;
    moduleName: string;
    groupName: string;
    icon: string;
    routePath: string;
  }>;
  updatedFeatureCodes: string[];
  errors: string[];
}

export interface UnsyncedFeature {
  code: string;
  name: string;
  description: string;
  moduleName: string;
  groupName: string;
  icon: string;
  routePath: string;
}

export function useFeatureRegistrySync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [unsyncedFeatures, setUnsyncedFeatures] = useState<UnsyncedFeature[]>([]);
  const [isCheckingUnsynced, setIsCheckingUnsynced] = useState(false);

  // Check for unsynced features (features in registry but not in database)
  const checkUnsyncedFeatures = useCallback(async () => {
    setIsCheckingUnsynced(true);
    try {
      // Get all feature codes from database
      const { data: dbFeatures, error } = await supabase
        .from("application_features")
        .select("feature_code");

      if (error) throw error;

      const dbFeatureCodes = new Set(dbFeatures?.map(f => f.feature_code) || []);

      // Find features in registry but not in database
      const unsynced: UnsyncedFeature[] = [];
      
      FEATURE_REGISTRY.forEach(module => {
        module.groups.forEach(group => {
          group.features.forEach(feature => {
            if (!dbFeatureCodes.has(feature.code)) {
              unsynced.push({
                code: feature.code,
                name: feature.name,
                description: feature.description,
                moduleName: module.name,
                groupName: group.groupName,
                icon: feature.icon,
                routePath: feature.routePath
              });
            }
          });
        });
      });

      setUnsyncedFeatures(unsynced);
      return unsynced;
    } catch (error) {
      console.error("Error checking unsynced features:", error);
      return [];
    } finally {
      setIsCheckingUnsynced(false);
    }
  }, []);

  // Perform sync (dry run or actual)
  const syncRegistry = useCallback(async (options: { 
    dryRun?: boolean; 
    addToRelease?: string | null;
    excludeFeatureCodes?: string[];
  } = {}) => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-feature-registry", {
        body: {
          registry: FEATURE_REGISTRY,
          options: {
            dryRun: options.dryRun ?? false,
            addToRelease: options.addToRelease ?? null,
            excludeFeatureCodes: options.excludeFeatureCodes ?? []
          }
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setLastSyncResult(data as SyncResult);

      if (!options.dryRun) {
        // Refresh unsynced features after actual sync
        await checkUnsyncedFeatures();
        
        if (data.summary.newFeatures > 0 || data.summary.updatedFeatures > 0) {
          toast.success(
            `Sync complete: ${data.summary.newFeatures} new, ${data.summary.updatedFeatures} updated`
          );
        } else {
          toast.info("All features are already in sync");
        }
      }

      return data as SyncResult;
    } catch (error) {
      console.error("Error syncing registry:", error);
      toast.error("Failed to sync feature registry");
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [checkUnsyncedFeatures]);

  // Get total feature count from registry
  const getTotalRegistryFeatures = useCallback(() => {
    return FEATURE_REGISTRY.reduce((sum, module) => 
      sum + module.groups.reduce((groupSum, group) => 
        groupSum + group.features.length, 0
      ), 0
    );
  }, []);

  // Check for unsynced features on mount
  useEffect(() => {
    checkUnsyncedFeatures();
  }, [checkUnsyncedFeatures]);

  return {
    isSyncing,
    isCheckingUnsynced,
    lastSyncResult,
    unsyncedFeatures,
    unsyncedCount: unsyncedFeatures.length,
    totalRegistryFeatures: getTotalRegistryFeatures(),
    syncRegistry,
    checkUnsyncedFeatures,
    previewSync: () => syncRegistry({ dryRun: true })
  };
}
