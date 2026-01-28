import { useMemo } from "react";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";

/**
 * Hook to extract feature codes from the canonical FEATURE_REGISTRY.
 * Used to pass registry-based feature codes to edge functions for consistent gap analysis.
 */
export function useRegistryFeatureCodes() {
  const featureCodes = useMemo(() => {
    const codes: string[] = [];
    FEATURE_REGISTRY.forEach(module => {
      module.groups.forEach(group => {
        group.features.forEach(feature => {
          codes.push(feature.code);
        });
      });
    });
    return codes;
  }, []);

  const getModuleFeatureCodes = (moduleCode: string): string[] => {
    const module = FEATURE_REGISTRY.find(m => m.code === moduleCode);
    if (!module) return [];
    return module.groups.flatMap(g => g.features.map(f => f.code));
  };

  const getModuleCodes = useMemo(() => {
    return FEATURE_REGISTRY.map(m => m.code);
  }, []);

  return {
    allFeatureCodes: featureCodes,
    totalCount: featureCodes.length,
    moduleCodes: getModuleCodes,
    getModuleFeatureCodes,
  };
}

/**
 * Utility function to extract all feature codes without React hook.
 * Useful for edge functions or non-component contexts.
 */
export function getAllRegistryFeatureCodes(): string[] {
  const codes: string[] = [];
  FEATURE_REGISTRY.forEach(module => {
    module.groups.forEach(group => {
      group.features.forEach(feature => {
        codes.push(feature.code);
      });
    });
  });
  return codes;
}
