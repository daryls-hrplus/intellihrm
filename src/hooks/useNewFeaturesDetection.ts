import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isReadyForEnablement, WorkflowColumn } from "@/types/enablement";

export interface NewFeature {
  id: string;
  feature_code: string;
  feature_name: string;
  module_code: string | null;
  module_name: string | null;
  group_name: string | null;
  description: string | null;
  icon_name: string | null;
  route_path: string | null;
  created_at: string;
  workflow_status?: string;
  reason: "no_enablement_record" | "all_not_started" | "recently_added" | "ready_for_artifacts";
}

/**
 * Hook to detect features that need enablement content
 * A feature is considered "new" if:
 * 1. It has no enablement_content_status record
 * 2. All artifact statuses are 'not_started'
 * 3. It was added in the last 7 days
 * 4. It's ready for enablement artifacts (in documentation/ready_for_enablement stage)
 */
export function useNewFeaturesDetection() {
  const [newFeatures, setNewFeatures] = useState<NewFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewFeatures = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get all active features with their module info
      const { data: features, error: featuresError } = await supabase
        .from("application_features")
        .select(`
          id,
          feature_code,
          feature_name,
          module_code,
          group_name,
          description,
          icon_name,
          route_path,
          created_at,
          application_modules!inner(module_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (featuresError) throw featuresError;

      // Get all enablement content statuses (keyed by feature_code)
      const { data: statuses, error: statusError } = await supabase
        .from("enablement_content_status")
        .select("feature_code, workflow_status, documentation_status, scorm_lite_status, rise_course_status, video_status, dap_guide_status");

      if (statusError) throw statusError;

      // Create a map of feature_code -> status
      const statusMap = new Map(
        (statuses || []).map(s => [s.feature_code, s])
      );

      // Calculate 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const detectedFeatures: NewFeature[] = [];

      for (const feature of features || []) {
        const status = statusMap.get(feature.feature_code);
        const createdAt = new Date(feature.created_at);
        const isRecentlyAdded = createdAt > sevenDaysAgo;

        let reason: NewFeature["reason"] | null = null;

        // Check if no enablement record exists
        if (!status) {
          reason = "no_enablement_record";
        } 
        // Check if ready for enablement artifacts
        else if (isReadyForEnablement(status.workflow_status as WorkflowColumn)) {
          // Only flag if artifacts not started
          const hasNoArtifacts = 
            status.documentation_status === "not_started" &&
            status.scorm_lite_status === "not_started" &&
            status.rise_course_status === "not_started" &&
            status.video_status === "not_started";
          
          if (hasNoArtifacts) {
            reason = "ready_for_artifacts";
          }
        }
        // Check if all statuses are 'not_started' (in earlier stages)
        else if (
          status.documentation_status === "not_started" &&
          status.scorm_lite_status === "not_started" &&
          status.rise_course_status === "not_started" &&
          status.video_status === "not_started" &&
          (status.dap_guide_status === "not_started" || status.dap_guide_status === "na")
        ) {
          reason = "all_not_started";
        }
        // Check if recently added (even if has some status)
        else if (isRecentlyAdded) {
          reason = "recently_added";
        }

        if (reason) {
          detectedFeatures.push({
            id: feature.id,
            feature_code: feature.feature_code,
            feature_name: feature.feature_name,
            module_code: feature.module_code,
            module_name: (feature.application_modules as any)?.module_name || null,
            group_name: feature.group_name,
            description: feature.description,
            icon_name: feature.icon_name,
            route_path: feature.route_path,
            created_at: feature.created_at,
            workflow_status: status?.workflow_status,
            reason
          });
        }
      }

      setNewFeatures(detectedFeatures);
    } catch (err) {
      console.error("Error fetching new features:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch new features");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewFeatures();
  }, [fetchNewFeatures]);

  // Group by reason
  const noEnablementRecord = newFeatures.filter(f => f.reason === "no_enablement_record");
  const allNotStarted = newFeatures.filter(f => f.reason === "all_not_started");
  const recentlyAdded = newFeatures.filter(f => f.reason === "recently_added");
  const readyForArtifacts = newFeatures.filter(f => f.reason === "ready_for_artifacts");

  return {
    newFeatures,
    noEnablementRecord,
    allNotStarted,
    recentlyAdded,
    readyForArtifacts,
    totalCount: newFeatures.length,
    isLoading,
    error,
    refetch: fetchNewFeatures
  };
}
