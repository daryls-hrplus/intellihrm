import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CAPABILITIES_DATA } from "@/components/enablement/product-capabilities/data/capabilitiesData";
import { toast } from "sonner";
import { useCodeRegistryScanner } from "@/hooks/useCodeRegistryScanner";

export interface ProductCapabilitiesFixPreview {
  modulesToCreate: {
    moduleId: string;
    moduleTitle: string;
    featureCode: string;
    routePath: string;
    existsInCode: boolean;
  }[];
  ghostDocumentation: {
    moduleId: string;
    moduleTitle: string;
    featureCode: string;
    routePath: string;
  }[];
  totalFixable: number;
  totalGhosts: number;
}

export interface ProductCapabilitiesFixResult {
  success: boolean;
  featuresCreated: number;
  ghostsSkipped: number;
  errors: string[];
}

/**
 * Hook for auto-fixing Product Capabilities validation issues
 * Uses unidirectional validation: Code → Database → Document
 */
export function useProductCapabilitiesValidationFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [lastPreview, setLastPreview] = useState<ProductCapabilitiesFixPreview | null>(null);
  
  const { routeExistsInCode, featureExistsInCode } = useCodeRegistryScanner();

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
   * Preview what would be fixed - with code verification
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
      const ghostDocumentation: ProductCapabilitiesFixPreview['ghostDocumentation'] = [];

      for (const act of CAPABILITIES_DATA) {
        for (const module of act.modules) {
          const featureCode = generateFeatureCode(module.id);
          const routePath = generateRoutePath(module.id, act.id);
          
          // Check if feature already exists in DB
          if (!existingCodes.has(featureCode)) {
            // Check if code exists for this route (unidirectional validation)
            const existsInCode = routeExistsInCode(routePath) || featureExistsInCode(featureCode);
            
            if (existsInCode) {
              // Code exists - can safely create DB entry
              modulesToCreate.push({
                moduleId: module.id,
                moduleTitle: module.title,
                featureCode,
                routePath,
                existsInCode: true
              });
            } else {
              // Ghost documentation - documented but no code
              ghostDocumentation.push({
                moduleId: module.id,
                moduleTitle: module.title,
                featureCode,
                routePath
              });
            }
          }
        }
      }

      const preview: ProductCapabilitiesFixPreview = {
        modulesToCreate,
        ghostDocumentation,
        totalFixable: modulesToCreate.length,
        totalGhosts: ghostDocumentation.length
      };

      setLastPreview(preview);
      return preview;
    } finally {
      setIsPreviewing(false);
    }
  }, [generateFeatureCode, generateRoutePath, routeExistsInCode, featureExistsInCode]);

  /**
   * Execute the fix - only for entries that exist in code
   */
  const fixAllIssues = useCallback(async (): Promise<ProductCapabilitiesFixResult> => {
    setIsFixing(true);

    try {
      const preview = lastPreview || await previewFix();
      
      if (preview.modulesToCreate.length === 0) {
        if (preview.totalGhosts > 0) {
          toast.warning(`No fixes possible - ${preview.totalGhosts} ghost documentation entries need code implementation first`);
        } else {
          toast.info("No fixes needed - all modules have routes");
        }
        return { success: true, featuresCreated: 0, ghostsSkipped: preview.totalGhosts, errors: [] };
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
          return { success: false, featuresCreated: 0, ghostsSkipped: 0, errors: [moduleError.message] };
        }

        moduleId = newModule.id;
      }

      // Only create features for modules that exist in code
      const verifiedModules = preview.modulesToCreate.filter(m => m.existsInCode);
      
      if (verifiedModules.length === 0) {
        toast.warning("No verified code implementations found to sync");
        return { success: true, featuresCreated: 0, ghostsSkipped: preview.totalGhosts, errors: [] };
      }

      const featuresToInsert = verifiedModules.map(m => ({
        module_id: moduleId,
        feature_code: m.featureCode,
        feature_name: m.moduleTitle,
        route_path: m.routePath,
        description: `${m.moduleTitle} capabilities module`,
        is_active: true,
        source: 'auto-fix-capabilities-verified'
      }));

      const { error: insertError } = await supabase
        .from("application_features")
        .insert(featuresToInsert);

      if (insertError) {
        toast.error("Failed to create features");
        return { success: false, featuresCreated: 0, ghostsSkipped: 0, errors: [insertError.message] };
      }

      if (preview.totalGhosts > 0) {
        toast.success(`Created ${featuresToInsert.length} verified features. ${preview.totalGhosts} ghost entries skipped (no code).`);
      } else {
        toast.success(`Created ${featuresToInsert.length} feature entries`);
      }

      return {
        success: true,
        featuresCreated: featuresToInsert.length,
        ghostsSkipped: preview.totalGhosts,
        errors: []
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Fix failed: ${message}`);
      return { success: false, featuresCreated: 0, ghostsSkipped: 0, errors: [message] };
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
