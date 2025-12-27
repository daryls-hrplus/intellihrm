import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoalData {
  id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit_of_measure?: string;
  start_date?: string;
  due_date?: string;
  status?: string;
  category?: string;
  specific?: boolean;
  measurable?: boolean;
  achievable?: boolean;
  relevant?: boolean;
  time_bound?: boolean;
  company_id: string;
}

interface QualityAnalysis {
  clarity_score: number;
  specificity_score: number;
  measurability_score: number;
  achievability_score: number;
  relevance_score: number;
  overall_quality_score: number;
  reasoning: string;
  improvement_suggestions: { area: string; suggestion: string; priority: "high" | "medium" | "low" }[];
  risk_factors: { factor: string; severity: "low" | "medium" | "high" | "critical" }[];
  completion_risk_level: "low" | "medium" | "high" | "critical";
}

interface DuplicateResult {
  has_duplicates: boolean;
  similar_goals: { title: string; similarity_percentage: number; reason: string; recommendation: string }[];
}

interface SkillResult {
  skills: { skill_name: string; skill_category: string; proficiency_level: string; importance: string }[];
}

interface TemplateSuggestion {
  suggestions: { template_name: string; template_type: string; confidence: number; reasoning: string; suggested_target?: string; unit_of_measure?: string }[];
}

interface CoachingNudge {
  nudge_type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  suggested_action: string;
  employee_name?: string;
  goal_title?: string;
}

export function useGoalAIAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeQuality = async (goal: GoalData): Promise<QualityAnalysis | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("goal-ai-analyzer", {
        body: { action: "analyze_quality", goal },
      });
      if (error) throw error;
      return data as QualityAnalysis;
    } catch (error) {
      console.error("Error analyzing goal quality:", error);
      toast.error("Failed to analyze goal quality");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const detectDuplicates = async (goal: GoalData, existingGoals: GoalData[]): Promise<DuplicateResult | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("goal-ai-analyzer", {
        body: { action: "detect_duplicates", goal, goals: existingGoals },
      });
      if (error) throw error;
      return data as DuplicateResult;
    } catch (error) {
      console.error("Error detecting duplicates:", error);
      toast.error("Failed to check for duplicates");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const inferSkills = async (goal: GoalData): Promise<SkillResult | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("goal-ai-analyzer", {
        body: { action: "infer_skills", goal },
      });
      if (error) throw error;
      return data as SkillResult;
    } catch (error) {
      console.error("Error inferring skills:", error);
      toast.error("Failed to infer skills");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const suggestTemplates = async (goal: GoalData): Promise<TemplateSuggestion | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("goal-ai-analyzer", {
        body: { action: "suggest_templates", goal },
      });
      if (error) throw error;
      return data as TemplateSuggestion;
    } catch (error) {
      console.error("Error suggesting templates:", error);
      toast.error("Failed to suggest templates");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const generateCoachingNudges = async (companyId: string, managerId: string, employeeId?: string): Promise<{ nudges: CoachingNudge[] } | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("goal-ai-analyzer", {
        body: { action: "generate_coaching", companyId, managerId, employeeId },
      });
      if (error) throw error;
      return data as { nudges: CoachingNudge[] };
    } catch (error) {
      console.error("Error generating coaching nudges:", error);
      toast.error("Failed to generate coaching suggestions");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    analyzeQuality,
    detectDuplicates,
    inferSkills,
    suggestTemplates,
    generateCoachingNudges,
  };
}
