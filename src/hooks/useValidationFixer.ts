import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FixPreview {
  legacyTasks: {
    id: string;
    area: string;
    adminRoute: string;
    matchingFeatureCode: string | null;
  }[];
  featuresToCreate: {
    adminRoute: string;
    generatedFeatureCode: string;
    area: string;
  }[];
  tasksToUpdate: number;
  canAutoFix: boolean;
}

export interface FixResult {
  success: boolean;
  summary: {
    featuresCreated: number;
    tasksUpdated: number;
    errors: string[];
  };
}

/**
 * Hook for auto-fixing validation issues by migrating legacy routes to feature codes
 */
export function useValidationFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [lastPreview, setLastPreview] = useState<FixPreview | null>(null);

  /**
   * Generate a feature_code from an admin_route path
   */
  const generateFeatureCode = (route: string): string => {
    return route
      .replace(/^\//, '') // Remove leading slash
      .replace(/[/-]/g, '_') // Replace slashes and dashes with underscores
      .toLowerCase();
  };

  /**
   * Preview what would be fixed without making changes
   */
  const previewFix = useCallback(async (): Promise<FixPreview> => {
    setIsPreviewing(true);
    
    try {
      // Get all legacy tasks (have admin_route but no feature_code)
      const { data: legacyTasksData, error: legacyError } = await supabase
        .from("implementation_tasks")
        .select("id, area, admin_route, feature_code")
        .is("feature_code", null)
        .not("admin_route", "is", null)
        .eq("is_active", true);

      if (legacyError) throw legacyError;

      // Get all existing application_features
      const { data: existingFeatures, error: featuresError } = await supabase
        .from("application_features")
        .select("feature_code, route_path");

      if (featuresError) throw featuresError;

      // Create a map of route_path to feature_code
      const routeToFeatureMap = new Map(
        existingFeatures?.map(f => [f.route_path, f.feature_code]) || []
      );

      // Analyze each legacy task
      const legacyTasks = (legacyTasksData || []).map(task => ({
        id: task.id,
        area: task.area || "Unknown",
        adminRoute: task.admin_route!,
        matchingFeatureCode: routeToFeatureMap.get(task.admin_route!) || null
      }));

      // Identify routes that need new features created
      const routesNeedingFeatures = new Set<string>();
      const featuresToCreate: FixPreview['featuresToCreate'] = [];

      for (const task of legacyTasks) {
        if (!task.matchingFeatureCode && !routesNeedingFeatures.has(task.adminRoute)) {
          routesNeedingFeatures.add(task.adminRoute);
          featuresToCreate.push({
            adminRoute: task.adminRoute,
            generatedFeatureCode: generateFeatureCode(task.adminRoute),
            area: task.area
          });
        }
      }

      const preview: FixPreview = {
        legacyTasks,
        featuresToCreate,
        tasksToUpdate: legacyTasks.length,
        canAutoFix: legacyTasks.length > 0
      };

      setLastPreview(preview);
      return preview;
    } finally {
      setIsPreviewing(false);
    }
  }, []);

  /**
   * Execute the fix - create missing features and update tasks
   */
  const fixAllIssues = useCallback(async (): Promise<FixResult> => {
    setIsFixing(true);
    const errors: string[] = [];
    let featuresCreated = 0;
    let tasksUpdated = 0;

    try {
      // First, get a preview to know what to fix
      const preview = lastPreview || await previewFix();

      if (!preview.canAutoFix) {
        return {
          success: true,
          summary: { featuresCreated: 0, tasksUpdated: 0, errors: [] }
        };
      }

      // Step 1: Get or create admin module
      let moduleId: string;
      const { data: existingModule } = await supabase
        .from("application_modules")
        .select("id")
        .eq("module_code", "admin")
        .single();

      if (existingModule) {
        moduleId = existingModule.id;
      } else {
        const { data: newModule, error: moduleError } = await supabase
          .from("application_modules")
          .insert({
            module_code: "admin",
            module_name: "Administration",
            route_path: "/admin",
            description: "Administrative functions and settings"
          })
          .select("id")
          .single();

        if (moduleError) {
          errors.push(`Failed to create admin module: ${moduleError.message}`);
          throw new Error("Module creation failed");
        }
        moduleId = newModule.id;
      }

      // Step 2: Create missing features
      for (const feature of preview.featuresToCreate) {
        try {
          const { error: insertError } = await supabase
            .from("application_features")
            .insert({
              feature_code: feature.generatedFeatureCode,
              feature_name: feature.area,
              route_path: feature.adminRoute,
              module_id: moduleId,
              module_code: "admin",
              source: "auto-fix",
              is_active: true,
              description: "Auto-created from legacy admin_route"
            });

          if (insertError) {
            // Check if it's a duplicate key error - that's fine
            if (!insertError.message.includes("duplicate key")) {
              errors.push(`Failed to create feature for ${feature.adminRoute}: ${insertError.message}`);
            }
          } else {
            featuresCreated++;
          }
        } catch (err) {
          errors.push(`Error creating feature for ${feature.adminRoute}`);
        }
      }

      // Step 3: Refresh the feature map after creating new ones
      const { data: allFeatures } = await supabase
        .from("application_features")
        .select("feature_code, route_path");

      const routeToFeatureMap = new Map(
        allFeatures?.map(f => [f.route_path, f.feature_code]) || []
      );

      // Step 4: Update implementation_tasks with feature_codes
      for (const task of preview.legacyTasks) {
        const featureCode = routeToFeatureMap.get(task.adminRoute);
        if (featureCode) {
          const { error: updateError } = await supabase
            .from("implementation_tasks")
            .update({ 
              feature_code: featureCode,
              updated_at: new Date().toISOString()
            })
            .eq("id", task.id);

          if (updateError) {
            errors.push(`Failed to update task ${task.id}: ${updateError.message}`);
          } else {
            tasksUpdated++;
          }
        }
      }

      const success = errors.length === 0;
      
      if (success) {
        toast.success(`Fixed ${tasksUpdated} tasks: ${featuresCreated} features created`);
      } else {
        toast.warning(`Partial fix: ${tasksUpdated} tasks updated, ${errors.length} errors`);
      }

      // Clear the preview since we've made changes
      setLastPreview(null);

      return {
        success,
        summary: {
          featuresCreated,
          tasksUpdated,
          errors
        }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push(message);
      toast.error(`Fix failed: ${message}`);
      
      return {
        success: false,
        summary: {
          featuresCreated,
          tasksUpdated,
          errors
        }
      };
    } finally {
      setIsFixing(false);
    }
  }, [lastPreview, previewFix]);

  return {
    previewFix,
    fixAllIssues,
    isFixing,
    isPreviewing,
    lastPreview,
    clearPreview: () => setLastPreview(null)
  };
}
