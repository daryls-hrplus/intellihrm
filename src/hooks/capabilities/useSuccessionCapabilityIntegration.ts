import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SuccessorCapabilityProfile {
  employee_id: string;
  employee_name: string;
  overall_readiness: number;
  gaps_count: number;
}

export function useSuccessionCapabilityIntegration() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Analyze successor readiness based on capability requirements
   */
  const analyzeSuccessorReadiness = useCallback(async (
    successorEmployeeId: string,
    requiredCapabilities: { capability_id: string; required_level: number }[]
  ): Promise<SuccessorCapabilityProfile | null> => {
    setIsLoading(true);
    try {
      const capabilityIds = requiredCapabilities.map(r => r.capability_id);

      const [evidenceRes, profileRes] = await Promise.all([
        supabase.from("competency_evidence")
          .select("*")
          .eq("employee_id", successorEmployeeId)
          .in("competency_id", capabilityIds)
          .eq("validation_status", "validated"),
        supabase.from("profiles")
          .select("id, full_name")
          .eq("id", successorEmployeeId)
          .single(),
      ]);

      const evidence = evidenceRes.data || [];
      const profile = profileRes.data;

      let metCount = 0;
      for (const req of requiredCapabilities) {
        const emp = evidence.find(e => e.competency_id === req.capability_id);
        if (emp && emp.proficiency_level >= req.required_level) {
          metCount++;
        }
      }

      const readiness = requiredCapabilities.length > 0 
        ? Math.round((metCount / requiredCapabilities.length) * 100)
        : 100;

      return {
        employee_id: successorEmployeeId,
        employee_name: profile?.full_name || 'Unknown',
        overall_readiness: readiness,
        gaps_count: requiredCapabilities.length - metCount,
      };
    } catch (error) {
      console.error("Error analyzing successor readiness:", error);
      toast.error("Failed to analyze successor readiness");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    analyzeSuccessorReadiness,
  };
}
