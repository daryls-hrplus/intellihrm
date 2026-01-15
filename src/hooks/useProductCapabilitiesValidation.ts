import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CAPABILITIES_DATA, ModuleData } from "@/components/enablement/product-capabilities/data/capabilitiesData";
import { BaseValidationIssue, BaseValidationReport } from "@/types/documentValidation";

export interface ProductCapabilitiesIssue extends BaseValidationIssue {
  type: 
    | 'missing_route' 
    | 'badge_mismatch' 
    | 'missing_tagline' 
    | 'missing_overview' 
    | 'no_ai_capabilities' 
    | 'no_integrations'
    | 'duplicate_capability'
    | 'invalid_integration_ref';
  details: {
    moduleId?: string;
    moduleTitle?: string;
    actId?: string;
    expectedValue?: string | number;
    actualValue?: string | number;
    duplicateIn?: string[];
  };
}

export interface ProductCapabilitiesReport extends BaseValidationReport {
  documentType: 'product_capabilities';
  summary: {
    totalModules: number;
    totalCapabilities: number;
    modulesWithRoutes: number;
    modulesWithoutRoutes: number;
    badgeMismatches: number;
    incompleteModules: number;
    modulesWithoutAI: number;
    modulesWithoutIntegrations: number;
  };
  issues: ProductCapabilitiesIssue[];
}

interface DbFeature {
  feature_code: string;
  route_path: string | null;
  feature_name: string;
}

/**
 * Hook for validating Product Capabilities document
 */
export function useProductCapabilitiesValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [lastReport, setLastReport] = useState<ProductCapabilitiesReport | null>(null);

  /**
   * Count total capabilities in a module
   */
  const countCapabilities = useCallback((module: ModuleData): number => {
    let count = 0;
    module.categories?.forEach(cat => {
      count += cat.items?.length || 0;
    });
    return count;
  }, []);

  /**
   * Parse badge text to get expected count
   */
  const parseBadgeCount = useCallback((badge?: string): number | null => {
    if (!badge) return null;
    const match = badge.match(/(\d+)\+?/);
    return match ? parseInt(match[1], 10) : null;
  }, []);

  /**
   * Run validation
   */
  const runValidation = useCallback(async (): Promise<ProductCapabilitiesReport> => {
    setIsValidating(true);
    const issues: ProductCapabilitiesIssue[] = [];
    const runId = crypto.randomUUID();

    try {
      // Fetch all database routes
      const { data: dbFeatures } = await supabase
        .from("application_features")
        .select("feature_code, route_path, feature_name")
        .not("route_path", "is", null);

      const dbFeatureMap = new Map<string, DbFeature>();
      const routeToFeatureMap = new Map<string, DbFeature>();
      
      (dbFeatures || []).forEach(f => {
        dbFeatureMap.set(f.feature_code, f);
        if (f.route_path) {
          routeToFeatureMap.set(f.route_path, f);
        }
      });

      let totalModules = 0;
      let totalCapabilities = 0;
      let modulesWithRoutes = 0;
      let modulesWithoutRoutes = 0;
      let badgeMismatches = 0;
      let incompleteModules = 0;
      let modulesWithoutAI = 0;
      let modulesWithoutIntegrations = 0;

      const allModuleIds = new Set<string>();

      // Validate each module in each act
      for (const act of CAPABILITIES_DATA) {
        for (const module of act.modules) {
          totalModules++;
          allModuleIds.add(module.id);

          const capCount = countCapabilities(module);
          totalCapabilities += capCount;

          // Check 1: Module has matching route in database
          // Try to match by module id as feature code or by constructing common patterns
          const possibleFeatureCodes = [
            module.id,
            module.id.replace(/-/g, '_'),
            `module_${module.id}`,
            module.id.toLowerCase()
          ];
          
          const hasRoute = possibleFeatureCodes.some(code => dbFeatureMap.has(code));
          
          if (hasRoute) {
            modulesWithRoutes++;
          } else {
            modulesWithoutRoutes++;
            issues.push({
              id: `missing_route_${module.id}`,
              type: 'missing_route',
              severity: 'warning',
              message: `Module "${module.title}" has no matching route in application_features`,
              fixable: true,
              details: {
                moduleId: module.id,
                moduleTitle: module.title,
                actId: act.id
              }
            });
          }

          // Check 2: Badge count accuracy
          const expectedCount = parseBadgeCount(module.badge);
          if (expectedCount !== null && Math.abs(expectedCount - capCount) > 5) {
            badgeMismatches++;
            issues.push({
              id: `badge_mismatch_${module.id}`,
              type: 'badge_mismatch',
              severity: 'info',
              message: `Badge says "${module.badge}" but found ${capCount} capabilities`,
              fixable: false,
              details: {
                moduleId: module.id,
                moduleTitle: module.title,
                expectedValue: expectedCount,
                actualValue: capCount
              }
            });
          }

          // Check 3: Required fields
          if (!module.tagline || module.tagline.trim() === '') {
            incompleteModules++;
            issues.push({
              id: `missing_tagline_${module.id}`,
              type: 'missing_tagline',
              severity: 'error',
              message: `Module "${module.title}" is missing a tagline`,
              fixable: false,
              details: {
                moduleId: module.id,
                moduleTitle: module.title
              }
            });
          }

          if (!module.overview || module.overview.trim() === '') {
            issues.push({
              id: `missing_overview_${module.id}`,
              type: 'missing_overview',
              severity: 'error',
              message: `Module "${module.title}" is missing an overview`,
              fixable: false,
              details: {
                moduleId: module.id,
                moduleTitle: module.title
              }
            });
          }

          // Check 4: AI capabilities defined
          if (!module.aiCapabilities || module.aiCapabilities.length === 0) {
            modulesWithoutAI++;
            issues.push({
              id: `no_ai_${module.id}`,
              type: 'no_ai_capabilities',
              severity: 'warning',
              message: `Module "${module.title}" has no AI capabilities defined`,
              fixable: false,
              details: {
                moduleId: module.id,
                moduleTitle: module.title
              }
            });
          }

          // Check 5: Integrations defined
          if (!module.integrations || module.integrations.length === 0) {
            modulesWithoutIntegrations++;
            issues.push({
              id: `no_integrations_${module.id}`,
              type: 'no_integrations',
              severity: 'info',
              message: `Module "${module.title}" has no integrations defined`,
              fixable: false,
              details: {
                moduleId: module.id,
                moduleTitle: module.title
              }
            });
          }
        }
      }

      // Calculate health score
      const routeRatio = totalModules > 0 ? modulesWithRoutes / totalModules : 0;
      const completenessRatio = totalModules > 0 ? (totalModules - incompleteModules) / totalModules : 0;
      const aiCoverageRatio = totalModules > 0 ? (totalModules - modulesWithoutAI) / totalModules : 0;
      
      const errorCount = issues.filter(i => i.severity === 'error').length;
      const warningCount = issues.filter(i => i.severity === 'warning').length;
      const basePenalty = Math.min(20, (errorCount * 5) + (warningCount * 1));

      const healthScore = Math.round(
        (routeRatio * 30) +
        (completenessRatio * 30) +
        (aiCoverageRatio * 20) +
        (20 - basePenalty)
      );

      const report: ProductCapabilitiesReport = {
        documentType: 'product_capabilities',
        documentName: 'Product Capabilities Document',
        runId,
        timestamp: new Date(),
        summary: {
          totalModules,
          totalCapabilities,
          modulesWithRoutes,
          modulesWithoutRoutes,
          badgeMismatches,
          incompleteModules,
          modulesWithoutAI,
          modulesWithoutIntegrations
        },
        issues: issues.sort((a, b) => {
          const severityOrder = { error: 0, warning: 1, info: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        healthScore: Math.max(0, Math.min(100, healthScore)),
        fixableCount: issues.filter(i => i.fixable).length
      };

      setLastReport(report);
      return report;
    } finally {
      setIsValidating(false);
    }
  }, [countCapabilities, parseBadgeCount]);

  /**
   * Get quick summary without full validation
   */
  const getQuickSummary = useCallback(() => {
    let totalModules = 0;
    let totalCapabilities = 0;

    for (const act of CAPABILITIES_DATA) {
      for (const module of act.modules) {
        totalModules++;
        totalCapabilities += countCapabilities(module);
      }
    }

    return {
      totalModules,
      totalCapabilities,
      actsCount: CAPABILITIES_DATA.length
    };
  }, [countCapabilities]);

  return {
    runValidation,
    getQuickSummary,
    isValidating,
    lastReport
  };
}
