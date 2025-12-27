import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCapabilityAIAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);

  const inferSkillsFromText = async (text: string, companyId?: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: { action: "infer_skills", text, companyId },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error inferring skills:", error);
      toast.error("Failed to infer skills from text");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const detectDuplicates = async (capability: any, existingCapabilities: any[]) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: { action: "detect_duplicates", capability, capabilities: existingCapabilities },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error detecting duplicates:", error);
      toast.error("Failed to check for duplicates");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const suggestSynonyms = async (capability: any) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: { action: "suggest_synonyms", capability },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error suggesting synonyms:", error);
      toast.error("Failed to suggest synonyms");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const suggestAdjacentSkills = async (capability: any, companyId?: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: { action: "suggest_adjacent", capability, companyId },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error suggesting adjacent skills:", error);
      toast.error("Failed to suggest adjacent skills");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeCapabilityGap = async (employeeId: string, jobProfileId: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: { action: "analyze_gap", employeeId, jobProfileId },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error analyzing capability gap:", error);
      toast.error("Failed to analyze capability gap");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const generateProficiencyIndicators = async (capability: any) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: { action: "generate_proficiency_indicators", capability },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating proficiency indicators:", error);
      toast.error("Failed to generate proficiency indicators");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    inferSkillsFromText,
    detectDuplicates,
    suggestSynonyms,
    suggestAdjacentSkills,
    analyzeCapabilityGap,
    generateProficiencyIndicators,
  };
}
