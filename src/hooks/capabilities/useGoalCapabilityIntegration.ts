import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CapabilityRow = Database['public']['Tables']['skills_competencies']['Row'];
type GoalSkillRequirementRow = Database['public']['Tables']['goal_skill_requirements']['Row'];

interface GoalCapabilityRequirement extends GoalSkillRequirementRow {
  capability?: CapabilityRow | null;
}

interface CapabilityGap {
  capability: CapabilityRow;
  required_level: number;
  current_level: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_actions?: string[];
}

export function useGoalCapabilityIntegration() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch capabilities required for a specific goal
   */
  const fetchGoalCapabilities = useCallback(async (goalId: string): Promise<GoalCapabilityRequirement[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_skill_requirements")
        .select(`
          *,
          capability:skills_competencies(*)
        `)
        .eq("goal_id", goalId);

      if (error) throw error;
      return (data || []) as GoalCapabilityRequirement[];
    } catch (error) {
      console.error("Error fetching goal capabilities:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Link a capability to a goal requirement
   */
  const linkCapabilityToGoal = useCallback(async (
    requirementId: string,
    capabilityId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("goal_skill_requirements")
        .update({ capability_id: capabilityId })
        .eq("id", requirementId)
        .select()
        .single();

      if (error) throw error;
      toast.success("Capability linked to goal");
      return data;
    } catch (error) {
      console.error("Error linking capability:", error);
      toast.error("Failed to link capability");
      return null;
    }
  }, []);

  /**
   * Add a capability requirement to a goal
   */
  const addCapabilityToGoal = useCallback(async (
    goalId: string,
    companyId: string,
    capabilityId: string,
    proficiencyLevel: string = "intermediate"
  ) => {
    try {
      // First get the capability details
      const { data: capability, error: capError } = await supabase
        .from("skills_competencies")
        .select("name, category")
        .eq("id", capabilityId)
        .single();

      if (capError) throw capError;

      const { data, error } = await supabase
        .from("goal_skill_requirements")
        .insert({
          goal_id: goalId,
          company_id: companyId,
          capability_id: capabilityId,
          skill_name: capability.name,
          skill_category: capability.category,
          proficiency_level: proficiencyLevel,
          is_gap: false,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Capability requirement added");
      return data;
    } catch (error) {
      console.error("Error adding capability to goal:", error);
      toast.error("Failed to add capability requirement");
      return null;
    }
  }, []);

  /**
   * Analyze capability gaps for an employee against goal requirements
   */
  const analyzeGoalCapabilityGaps = useCallback(async (
    goalId: string,
    employeeId: string
  ): Promise<CapabilityGap[]> => {
    setIsLoading(true);
    try {
      // Get goal requirements with linked capabilities
      const { data: requirements, error: reqError } = await supabase
        .from("goal_skill_requirements")
        .select(`
          *,
          capability:skills_competencies(*)
        `)
        .eq("goal_id", goalId)
        .not("capability_id", "is", null);

      if (reqError) throw reqError;
      if (!requirements?.length) return [];

      // Get employee's capability evidence
      const capabilityIds = requirements
        .filter(r => r.capability_id)
        .map(r => r.capability_id as string);

      const { data: evidence, error: evError } = await supabase
        .from("competency_evidence")
        .select("*")
        .eq("employee_id", employeeId)
        .in("competency_id", capabilityIds)
        .eq("validation_status", "validated")
        .order("effective_from", { ascending: false });

      if (evError) throw evError;

      // Build gap analysis
      const gaps: CapabilityGap[] = [];
      const proficiencyMap: Record<string, number> = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        expert: 4,
      };

      for (const req of requirements) {
        const capability = req.capability as CapabilityRow | null;
        if (!capability) continue;

        const requiredLevel = proficiencyMap[req.proficiency_level?.toLowerCase() || "intermediate"] || 2;
        
        // Find latest evidence for this capability
        const employeeEvidence = evidence?.find(e => e.competency_id === req.capability_id);
        const currentLevel = employeeEvidence?.proficiency_level || 0;
        
        const gap = requiredLevel - currentLevel;

        if (gap > 0) {
          gaps.push({
            capability,
            required_level: requiredLevel,
            current_level: currentLevel,
            gap,
            priority: gap >= 2 ? "HIGH" : gap === 1 ? "MEDIUM" : "LOW",
            recommended_actions: req.recommended_training_ids || [],
          });
        }
      }

      return gaps;
    } catch (error) {
      console.error("Error analyzing capability gaps:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Use AI to infer required capabilities from goal text
   */
  const inferCapabilitiesFromGoal = useCallback(async (
    goalTitle: string,
    goalDescription: string,
    companyId?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: {
          action: "infer_skills",
          text: `Goal: ${goalTitle}\n\nDescription: ${goalDescription}`,
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
    fetchGoalCapabilities,
    linkCapabilityToGoal,
    addCapabilityToGoal,
    analyzeGoalCapabilityGaps,
    inferCapabilitiesFromGoal,
  };
}
