import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouteResolver } from "./useRouteResolver";
import { useHandbookTasks } from "./useHandbookTasks";
import { PHASE_STEP_MAPPINGS } from "@/data/implementationMappings";

export interface ValidationIssue {
  type: 'missing_feature_code' | 'invalid_route' | 'orphan_route' | 'unsynced_feature' | 'route_mismatch';
  severity: 'error' | 'warning' | 'info';
  message: string;
  details: {
    phaseId?: string;
    stepOrder?: number;
    area?: string;
    featureCode?: string;
    expectedRoute?: string;
    actualRoute?: string;
  };
}

export interface ValidationReport {
  runId: string;
  timestamp: Date;
  summary: {
    totalTasks: number;
    tasksWithFeatureCode: number;
    tasksWithLegacyRoute: number;
    validRoutes: number;
    invalidRoutes: number;
    orphanRoutes: number;
    unsyncedFeatures: number;
  };
  issues: ValidationIssue[];
  healthScore: number; // 0-100
}

/**
 * Hook for validating route consistency across the system
 */
export function useRouteValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [lastReport, setLastReport] = useState<ValidationReport | null>(null);
  
  const { 
    resolveByFeatureCode, 
    resolveByLegacyRoute, 
    getUnsyncedRoutes,
    getAllDbRoutes,
    isLoaded: routerLoaded 
  } = useRouteResolver();
  
  const { tasks: dbTasks, isUsingDatabase } = useHandbookTasks();

  /**
   * Run full validation of routes
   */
  const runValidation = useCallback(async (): Promise<ValidationReport> => {
    setIsValidating(true);
    
    const issues: ValidationIssue[] = [];
    const runId = crypto.randomUUID();
    
    try {
      // Get all implementation tasks (from hardcoded source for comparison)
      const allTasks: Array<{ phaseId: string; stepOrder: number; area: string; adminRoute?: string }> = [];
      Object.entries(PHASE_STEP_MAPPINGS).forEach(([phaseId, mappings]) => {
        mappings.forEach(mapping => {
          allTasks.push({
            phaseId,
            stepOrder: mapping.order,
            area: mapping.area,
            adminRoute: mapping.adminRoute
          });
        });
      });

      let tasksWithFeatureCode = 0;
      let tasksWithLegacyRoute = 0;
      let validRoutes = 0;
      let invalidRoutes = 0;

      // Check each task
      for (const task of allTasks) {
        // Check if task has been migrated to use feature_code
        const dbTask = dbTasks.find(t => 
          t.phase_id === task.phaseId && t.step_order === task.stepOrder
        );

        if (dbTask?.feature_code) {
          tasksWithFeatureCode++;
          // Validate the feature code resolves to a valid route
          const resolution = resolveByFeatureCode(dbTask.feature_code);
          if (resolution.isValid) {
            validRoutes++;
          } else {
            invalidRoutes++;
            issues.push({
              type: 'invalid_route',
              severity: 'error',
              message: `Feature code "${dbTask.feature_code}" does not resolve to a valid route`,
              details: {
                phaseId: task.phaseId,
                stepOrder: task.stepOrder,
                area: task.area,
                featureCode: dbTask.feature_code
              }
            });
          }
        } else if (task.adminRoute) {
          tasksWithLegacyRoute++;
          // Validate the legacy route exists
          const resolution = resolveByLegacyRoute(task.adminRoute);
          if (resolution.source === 'legacy') {
            // Route not found in database or registry
            issues.push({
              type: 'missing_feature_code',
              severity: 'warning',
              message: `Task uses legacy route "${task.adminRoute}" - should be migrated to feature_code`,
              details: {
                phaseId: task.phaseId,
                stepOrder: task.stepOrder,
                area: task.area,
                expectedRoute: task.adminRoute
              }
            });
          }
          validRoutes++; // Consider legacy routes as "valid" for now
        } else {
          // No route at all
          issues.push({
            type: 'invalid_route',
            severity: 'error',
            message: `Task has no route defined`,
            details: {
              phaseId: task.phaseId,
              stepOrder: task.stepOrder,
              area: task.area
            }
          });
          invalidRoutes++;
        }
      }

      // Check for unsynced features (in registry but not in database)
      const unsyncedFeatures = getUnsyncedRoutes();
      unsyncedFeatures.forEach(feature => {
        issues.push({
          type: 'unsynced_feature',
          severity: 'info',
          message: `Feature "${feature.featureCode}" exists in registry but not synced to database`,
          details: {
            featureCode: feature.featureCode,
            expectedRoute: feature.path
          }
        });
      });

      // Calculate health score
      const totalTasks = allTasks.length;
      const featureCodeRatio = tasksWithFeatureCode / totalTasks;
      const validRouteRatio = validRoutes / totalTasks;
      const errorCount = issues.filter(i => i.severity === 'error').length;
      const warningCount = issues.filter(i => i.severity === 'warning').length;

      // Health score formula: 
      // - 40% for feature code migration progress
      // - 40% for route validity
      // - 20% penalty for errors and warnings
      const basePenalty = Math.min(20, (errorCount * 5) + (warningCount * 1));
      const healthScore = Math.round(
        (featureCodeRatio * 40) + 
        (validRouteRatio * 40) + 
        (20 - basePenalty)
      );

      const report: ValidationReport = {
        runId,
        timestamp: new Date(),
        summary: {
          totalTasks,
          tasksWithFeatureCode,
          tasksWithLegacyRoute,
          validRoutes,
          invalidRoutes,
          orphanRoutes: 0, // TODO: implement orphan detection
          unsyncedFeatures: unsyncedFeatures.length
        },
        issues: issues.sort((a, b) => {
          const severityOrder = { error: 0, warning: 1, info: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        healthScore: Math.max(0, Math.min(100, healthScore))
      };

      setLastReport(report);

      // Optionally save to database
      try {
        // Save validation run
        await supabase.from("route_validation_log").insert(
          issues.slice(0, 100).map(issue => ({
            validation_run_id: runId,
            feature_code: issue.details.featureCode || `${issue.details.phaseId}-${issue.details.stepOrder}`,
            route_path: issue.details.expectedRoute || issue.details.actualRoute || null,
            validation_status: issue.severity === 'error' ? 'invalid' : 
                             issue.severity === 'warning' ? 'warning' : 'valid',
            validation_message: issue.message
          }))
        );
      } catch (dbError) {
        console.warn("Could not save validation log to database:", dbError);
      }

      return report;
    } finally {
      setIsValidating(false);
    }
  }, [dbTasks, resolveByFeatureCode, resolveByLegacyRoute, getUnsyncedRoutes]);

  /**
   * Get quick health check without full validation
   */
  const getQuickHealth = useCallback(() => {
    const dbRoutes = getAllDbRoutes();
    const unsyncedRoutes = getUnsyncedRoutes();
    
    // Count tasks with feature codes
    let tasksWithFeatureCode = 0;
    let totalTasks = 0;
    
    Object.values(PHASE_STEP_MAPPINGS).forEach(mappings => {
      totalTasks += mappings.length;
    });
    
    dbTasks.forEach(task => {
      if (task.feature_code) tasksWithFeatureCode++;
    });

    return {
      totalDbRoutes: dbRoutes.length,
      unsyncedCount: unsyncedRoutes.length,
      totalTasks,
      tasksWithFeatureCode,
      migrationProgress: totalTasks > 0 
        ? Math.round((tasksWithFeatureCode / totalTasks) * 100)
        : 0,
      isHealthy: unsyncedRoutes.length === 0 && tasksWithFeatureCode === totalTasks
    };
  }, [getAllDbRoutes, getUnsyncedRoutes, dbTasks]);

  return {
    runValidation,
    getQuickHealth,
    isValidating,
    lastReport,
    isReady: routerLoaded
  };
}
