import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CapabilityRow = Database['public']['Tables']['capabilities']['Row'];

interface CandidateCapabilityMatch {
  candidate_id: string;
  candidate_name: string;
  overall_match_score: number;
  gaps: string[];
}

export function useRecruitmentCapabilityIntegration() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Match candidate skills against capability requirements
   */
  const matchCandidateCapabilities = useCallback(async (
    candidateId: string,
    requiredCapabilities: { capability_id: string; required_level: number }[]
  ): Promise<CandidateCapabilityMatch | null> => {
    setIsLoading(true);
    try {
      const { data: candidate, error } = await supabase
        .from("candidates")
        .select("id, first_name, last_name, skills")
        .eq("id", candidateId)
        .single();

      if (error) throw error;

      const candidateSkills = (candidate.skills as any[]) || [];
      const gaps: string[] = [];
      let matchedCount = 0;

      // Get capability names for gap reporting
      const capIds = requiredCapabilities.map(r => r.capability_id);
      const { data: capabilities } = await supabase
        .from("capabilities")
        .select("id, name")
        .in("id", capIds);

      for (const req of requiredCapabilities) {
        const cap = capabilities?.find(c => c.id === req.capability_id);
        const skill = candidateSkills.find(s => 
          s.capability_id === req.capability_id ||
          s.name?.toLowerCase() === cap?.name?.toLowerCase()
        );
        
        if (skill && (skill.level || 0) >= req.required_level) {
          matchedCount++;
        } else if (cap) {
          gaps.push(cap.name);
        }
      }

      const score = requiredCapabilities.length > 0 
        ? Math.round((matchedCount / requiredCapabilities.length) * 100)
        : 100;

      return {
        candidate_id: candidateId,
        candidate_name: `${candidate.first_name} ${candidate.last_name}`,
        overall_match_score: score,
        gaps,
      };
    } catch (error) {
      console.error("Error matching candidate capabilities:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Use AI to infer capabilities from job description
   */
  const inferCapabilitiesFromJobDescription = useCallback(async (
    jobTitle: string,
    jobDescription: string,
    companyId?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: {
          action: "infer_skills",
          text: `Job Title: ${jobTitle}\n\nJob Description: ${jobDescription}`,
          companyId,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error inferring capabilities:", error);
      return null;
    }
  }, []);

  return {
    isLoading,
    matchCandidateCapabilities,
    inferCapabilitiesFromJobDescription,
  };
}
