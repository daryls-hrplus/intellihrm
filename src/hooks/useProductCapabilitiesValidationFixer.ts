import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CAPABILITIES_DATA } from "@/components/enablement/product-capabilities/data/capabilitiesData";
import { toast } from "sonner";

export interface ProductCapabilitiesFixPreview {
  modulesToCreate: {
    moduleId: string;
    moduleTitle: string;
    featureCode: string;
    routePath: string;
  }[];
  totalFixable: number;
}

export interface ProductCapabilitiesFixResult {
  success: boolean;
  featuresCreated: number;
  errors: string[];
}

/**
 * Hook for auto-fixing Product Capabilities validation issues
 */
export function useProductCapabilitiesValidationFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [lastPreview, setLastPreview] = useState<ProductCapabilitiesFixPreview | null>(null);

  /**
   * Generate feature code from module ID
   */
  const generateFeatureCode = useCallback((moduleId: string): string => {
    return moduleId.replace(/-/g, '_').toLowerCase();
  }, []);

  /**
   * Generate route path from module ID
   */
  const generateRoutePath = useCallback((moduleId: string, actId: string): string => {
    // Map act IDs to route prefixes
    const actRoutePrefixes: Record<string, string> = {
      'prologue': '/admin',
      'act1': '/workforce',
      'act2': '/employee',
      'act3': '/payroll',
      'act4': '/talent',
      'act5': '/compliance',
      'epilogue': '/help'
    };
    
    const prefix = actRoutePrefixes[actId] || '/modules';
    return `${prefix}/${moduleId}`;
  }, []);

  /**
   * Preview what would be fixed
   */
  const previewFix = useCallback(async (): Promise<ProductCapabilitiesFixPreview> => {
    setIsPreviewing(true);

    try {
      // Get existing features from database
      const { data: existingFeatures } = await supabase
        .from("application_features")
        .select("feature_code");

      const existingCodes = new Set((existingFeatures || []).map(f => f.feature_code));

      const modulesToCreate: ProductCapabilitiesFixPreview['modulesToCreate'] = [];

      for (const act of CAPABILITIES_DATA) {
        for (const module of act.modules) {
          const featureCode = generateFeatureCode(module.id);
          
          // Check if feature already exists
          if (!existingCodes.has(featureCode)) {
            modulesToCreate.push({
              moduleId: module.id,
              moduleTitle: module.title,
              featureCode,
              routePath: generateRoutePath(module.id, act.id)
            });
          }
        }
      }

      const preview: ProductCapabilitiesFixPreview = {
        modulesToCreate,
        totalFixable: modulesToCreate.length
      };

      setLastPreview(preview);
      return preview;
    } finally {
      setIsPreviewing(false);
    }
  }, [generateFeatureCode, generateRoutePath]);

  /**
   * Execute the fix
   */
  const fixAllIssues = useCallback(async (): Promise<ProductCapabilitiesFixResult> => {
    setIsFixing(true);

    try {
      const preview = lastPreview || await previewFix();
      
      if (preview.modulesToCreate.length === 0) {
        toast.info("No fixes needed - all modules have routes");
        return { success: true, featuresCreated: 0, errors: [] };
      }

      // Ensure 'capabilities' module exists
      const { data: existingModules } = await supabase
        .from("application_modules")
        .select("id, module_code")
        .eq("module_code", "capabilities");

      let moduleId: string;

      if (existingModules && existingModules.length > 0) {
        moduleId = existingModules[0].id;
      } else {
        // Create the capabilities module
        const { data: newModule, error: moduleError } = await supabase
          .from("application_modules")
          .insert({
            module_code: "capabilities",
            module_name: "Product Capabilities",
            description: "Product capabilities documentation modules",
            route_path: "/capabilities",
            is_active: true
          })
          .select("id")
          .single();

        if (moduleError) {
          toast.error("Failed to create capabilities module");
          return { success: false, featuresCreated: 0, errors: [moduleError.message] };
        }

        moduleId = newModule.id;
      }

      // Create features for each module
      const featuresToInsert = preview.modulesToCreate.map(m => ({
        module_id: moduleId,
        feature_code: m.featureCode,
        feature_name: m.moduleTitle,
        route_path: m.routePath,
        description: `${m.moduleTitle} capabilities module`,
        is_active: true,
        source: 'auto-fix-capabilities'
      }));

      const { error: insertError } = await supabase
        .from("application_features")
        .insert(featuresToInsert);

      if (insertError) {
        toast.error("Failed to create features");
        return { success: false, featuresCreated: 0, errors: [insertError.message] };
      }

      toast.success(`Created ${featuresToInsert.length} feature entries`);

      return {
        success: true,
        featuresCreated: featuresToInsert.length,
        errors: []
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Fix failed: ${message}`);
      return { success: false, featuresCreated: 0, errors: [message] };
    } finally {
      setIsFixing(false);
    }
  }, [lastPreview, previewFix]);

  return {
    previewFix,
    fixAllIssues,
    isFixing,
    isPreviewing,
    lastPreview
  };
}
