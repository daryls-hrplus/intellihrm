import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RegisterFeatureInput {
  featureCode: string;
  featureName: string;
  moduleCode: string;
  groupName?: string;
  description?: string;
  iconName?: string;
  routePath?: string;
  releaseId?: string; // Optional: Add to a specific release
}

export interface RegisteredFeature {
  id: string;
  feature_code: string;
  feature_name: string;
  module_id: string;
  module_code: string;
  group_name: string | null;
  description: string | null;
  icon_name: string | null;
  route_path: string | null;
}

/**
 * Hook for registering new features in the application_features table
 * This ensures every new feature is properly tracked for enablement
 */
export function useRegisterFeature() {
  const [isRegistering, setIsRegistering] = useState(false);

  /**
   * Register a new feature in the database
   * - Inserts into application_features
   * - Creates enablement_content_status record
   * - Optionally links to a release
   */
  const registerFeature = async (input: RegisterFeatureInput): Promise<RegisteredFeature | null> => {
    setIsRegistering(true);
    try {
      // 1. Get the module ID for the given module_code
      const { data: module, error: moduleError } = await supabase
        .from("application_modules")
        .select("id")
        .eq("module_code", input.moduleCode)
        .single();

      if (moduleError || !module) {
        throw new Error(`Module not found: ${input.moduleCode}`);
      }

      // 2. Insert the feature (upsert to prevent duplicates)
      const { data: feature, error: featureError } = await supabase
        .from("application_features")
        .upsert({
          feature_code: input.featureCode,
          feature_name: input.featureName,
          module_id: module.id,
          module_code: input.moduleCode,
          group_name: input.groupName || "General",
          description: input.description || null,
          icon_name: input.iconName || "Box",
          route_path: input.routePath || null,
          is_active: true,
          source: "manual",
          last_synced_at: new Date().toISOString()
        }, {
          onConflict: "feature_code",
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (featureError) {
        throw featureError;
      }

      // 3. Create enablement_content_status record if it doesn't exist
      // Uses feature_code as identifier (not feature_id)
      const { error: statusError } = await supabase
        .from("enablement_content_status")
        .upsert({
          feature_code: input.featureCode,
          module_code: input.moduleCode,
          release_id: input.releaseId || null,
          workflow_status: "not_started",
          documentation_status: "not_started",
          scorm_lite_status: "not_started",
          rise_course_status: "not_started",
          video_status: "not_started",
          dap_guide_status: "not_started",
          priority: "medium"
        }, {
          onConflict: "feature_code",
          ignoreDuplicates: true
        });

      if (statusError) {
        console.error("Error creating enablement status:", statusError);
        // Don't throw - feature was created successfully
      }

      toast.success(`Feature "${input.featureName}" registered successfully`);
      return feature as RegisteredFeature;
    } catch (error) {
      console.error("Error registering feature:", error);
      toast.error("Failed to register feature");
      return null;
    } finally {
      setIsRegistering(false);
    }
  };

  /**
   * Register multiple features at once
   */
  const registerFeatures = async (inputs: RegisterFeatureInput[]): Promise<RegisteredFeature[]> => {
    const results: RegisteredFeature[] = [];
    
    for (const input of inputs) {
      const result = await registerFeature(input);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  };

  /**
   * Check if a feature code already exists
   */
  const featureExists = async (featureCode: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("application_features")
      .select("id")
      .eq("feature_code", featureCode)
      .maybeSingle();

    if (error) {
      console.error("Error checking feature existence:", error);
      return false;
    }

    return !!data;
  };

  return {
    registerFeature,
    registerFeatures,
    featureExists,
    isRegistering
  };
}
