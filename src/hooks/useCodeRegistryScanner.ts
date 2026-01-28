import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  CodeRegistry, 
  CodeRegistryEntry, 
  CodeRegistrySyncStatus 
} from "@/types/codeRegistry";
import { FEATURE_REGISTRY, getAllFeatures } from "@/lib/featureRegistry";

/**
 * Hook for scanning and managing the code registry
 * Now uses FEATURE_REGISTRY as the source of truth instead of static array
 */
export function useCodeRegistryScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<CodeRegistry | null>(null);
  const [syncStatus, setSyncStatus] = useState<CodeRegistrySyncStatus | null>(null);

  /**
   * Build code routes dynamically from FEATURE_REGISTRY
   * This is the single source of truth for what features exist in code
   */
  const codeRoutes = useMemo((): CodeRegistryEntry[] => {
    const entries: CodeRegistryEntry[] = [];
    
    // Add all features from all modules and groups
    FEATURE_REGISTRY.forEach(module => {
      module.groups.forEach(group => {
        group.features.forEach(feature => {
          entries.push({
            pageName: feature.name,
            routePath: feature.routePath,
            moduleCode: module.code,
            featureCode: feature.code,
            hasProtection: true,
            requiredRoles: feature.roleRequirements || [],
            protectedModuleCode: module.code,
            sourceFile: "featureRegistry.ts"
          });
        });
      });
    });
    
    return entries;
  }, []);

  /**
   * Scan code registry and compare with database
   */
  const scanRegistry = useCallback(async (): Promise<CodeRegistry> => {
    setIsScanning(true);
    const startTime = Date.now();

    try {
      const registry: CodeRegistry = {
        entries: codeRoutes,
        totalPages: new Set(codeRoutes.map(r => r.pageName)).size,
        totalRoutes: codeRoutes.length,
        lastScanned: new Date(),
        scanDuration: 0
      };

      registry.scanDuration = Date.now() - startTime;
      setLastScan(registry);
      return registry;
    } finally {
      setIsScanning(false);
    }
  }, [codeRoutes]);

  /**
   * Compare code registry with database to find sync status
   */
  const checkSyncStatus = useCallback(async (): Promise<CodeRegistrySyncStatus> => {
    setIsScanning(true);

    try {
      // Get all features from database
      const { data: dbFeatures } = await supabase
        .from("application_features")
        .select("feature_code, route_path, feature_name");

      const dbFeatureSet = new Set((dbFeatures || []).map(f => f.feature_code));
      const codeFeatureSet = new Set(codeRoutes.map(r => r.featureCode));

      // Find synced entries
      const synced = codeRoutes.filter(route => dbFeatureSet.has(route.featureCode));

      // Find unregistered (in code but not in DB)
      const unregistered = codeRoutes.filter(route => !dbFeatureSet.has(route.featureCode));

      // Find orphaned (in DB but not in code)
      const orphaned = (dbFeatures || [])
        .filter(f => !codeFeatureSet.has(f.feature_code))
        .map(f => ({
          featureCode: f.feature_code,
          routePath: f.route_path || '',
          featureName: f.feature_name
        }));

      const status: CodeRegistrySyncStatus = {
        synced,
        unregistered,
        orphaned
      };

      setSyncStatus(status);
      return status;
    } finally {
      setIsScanning(false);
    }
  }, [codeRoutes]);

  /**
   * Check if a specific route exists in code
   */
  const routeExistsInCode = useCallback((routePath: string): boolean => {
    return codeRoutes.some(r => r.routePath === routePath);
  }, [codeRoutes]);

  /**
   * Check if a specific feature code exists in code
   */
  const featureExistsInCode = useCallback((featureCode: string): boolean => {
    return codeRoutes.some(r => r.featureCode === featureCode);
  }, [codeRoutes]);

  /**
   * Get code entry by feature code
   */
  const getCodeEntry = useCallback((featureCode: string): CodeRegistryEntry | undefined => {
    return codeRoutes.find(r => r.featureCode === featureCode);
  }, [codeRoutes]);

  /**
   * Get code entry by route path
   */
  const getCodeEntryByRoute = useCallback((routePath: string): CodeRegistryEntry | undefined => {
    return codeRoutes.find(r => r.routePath === routePath);
  }, [codeRoutes]);

  return {
    // State
    isScanning,
    lastScan,
    syncStatus,
    codeRoutes,
    
    // Actions
    scanRegistry,
    checkSyncStatus,
    
    // Utilities
    routeExistsInCode,
    featureExistsInCode,
    getCodeEntry,
    getCodeEntryByRoute,
    
    // Stats
    totalCodeRoutes: codeRoutes.length,
    totalModules: new Set(codeRoutes.map(r => r.moduleCode)).size
  };
}
