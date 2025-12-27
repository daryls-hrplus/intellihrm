import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CapabilityType = "SKILL" | "COMPETENCY";
export type CapabilityCategory = "technical" | "functional" | "behavioral" | "leadership" | "core";
export type CapabilityStatus = "draft" | "pending_approval" | "active" | "deprecated";

export interface ProficiencyLevel {
  level: number;
  name: string;
  description: string;
}

export interface ProficiencyScale {
  id: string;
  company_id: string | null;
  name: string;
  code: string;
  description: string | null;
  is_default: boolean;
  levels: ProficiencyLevel[];
  is_active: boolean;
  created_at: string;
}

export interface Capability {
  id: string;
  company_id: string | null;
  type: CapabilityType;
  name: string;
  code: string;
  description: string | null;
  category: CapabilityCategory;
  proficiency_scale_id: string | null;
  status: CapabilityStatus;
  version: number;
  effective_from: string;
  effective_to: string | null;
  owner_role: string | null;
  parent_capability_id: string | null;
  external_id: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  proficiency_scales?: ProficiencyScale;
  parent_capability?: { id: string; name: string; code: string };
  skill_attributes?: SkillAttributes;
  competency_attributes?: CompetencyAttributes;
}

export interface SkillAttributes {
  id: string;
  capability_id: string;
  synonyms: string[];
  adjacent_skills: string[];
  typical_acquisition_modes: string[];
  expiry_months: number | null;
  can_be_inferred: boolean;
  inference_keywords: string[];
}

export interface CompetencyAttributes {
  id: string;
  capability_id: string;
  behavioral_indicators: Record<string, unknown>[];
  assessment_rules: Record<string, unknown>;
  role_applicability: string[];
  can_be_inferred: boolean;
}

export interface CompetencySkillMapping {
  id: string;
  competency_id: string;
  skill_id: string;
  weight: number;
  is_required: boolean;
  min_proficiency_level: number | null;
  skill?: Capability;
}

export interface CapabilityFilters {
  type?: CapabilityType;
  category?: CapabilityCategory;
  status?: CapabilityStatus;
  search?: string;
  companyId?: string;
}

export interface CreateCapabilityInput {
  company_id: string | null;
  type: CapabilityType;
  name: string;
  code: string;
  description?: string;
  category: CapabilityCategory;
  proficiency_scale_id?: string;
  status?: CapabilityStatus;
  effective_from?: string;
  effective_to?: string;
  owner_role?: string;
  parent_capability_id?: string;
  external_id?: string;
  metadata?: Record<string, unknown>;
  skill_attributes?: Partial<Omit<SkillAttributes, "id" | "capability_id">>;
  competency_attributes?: Partial<Omit<CompetencyAttributes, "id" | "capability_id">>;
}

export function useCapabilities() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCapabilities = useCallback(async (filters?: CapabilityFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from("capabilities")
        .select(`
          *,
          proficiency_scales(*),
          skill_attributes(*),
          competency_attributes(*)
        `)
        .order("name");

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.companyId && filters.companyId !== "all") {
        query = query.eq("company_id", filters.companyId);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching capabilities:", error);
        toast.error("Failed to fetch capabilities");
        return [];
      }

      const transformed = (data || []).map(cap => ({
        ...cap,
        skill_attributes: Array.isArray(cap.skill_attributes) ? cap.skill_attributes[0] : cap.skill_attributes,
        competency_attributes: Array.isArray(cap.competency_attributes) ? cap.competency_attributes[0] : cap.competency_attributes,
      })) as unknown as Capability[];

      setCapabilities(transformed);
      return transformed;
    } catch (err) {
      console.error("Error in fetchCapabilities:", err);
      toast.error("Failed to fetch capabilities");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCapability = useCallback(async (input: CreateCapabilityInput): Promise<Capability | null> => {
    try {
      const { skill_attributes, competency_attributes, ...capabilityData } = input;

      const { data: capability, error } = await supabase
        .from("capabilities")
        .insert([capabilityData as any])
        .select()
        .single();

      if (error) {
        console.error("Error creating capability:", error);
        toast.error("Failed to create capability");
        return null;
      }

      // Insert type-specific attributes
      if (input.type === "SKILL" && skill_attributes) {
        const { error: attrError } = await supabase
          .from("skill_attributes")
          .insert([{
            capability_id: capability.id,
            ...skill_attributes,
          } as any]);

        if (attrError) {
          console.error("Error creating skill attributes:", attrError);
        }
      }

      if (input.type === "COMPETENCY" && competency_attributes) {
        const { error: attrError } = await supabase
          .from("competency_attributes")
          .insert([{
            capability_id: capability.id,
            ...competency_attributes,
          } as any]);

        if (attrError) {
          console.error("Error creating competency attributes:", attrError);
        }
      }

      toast.success(`${input.type === "SKILL" ? "Skill" : "Competency"} created successfully`);
      return capability as Capability;
    } catch (err) {
      console.error("Error in createCapability:", err);
      toast.error("Failed to create capability");
      return null;
    }
  }, [user?.id]);

  const updateCapability = useCallback(async (
    id: string,
    input: Partial<CreateCapabilityInput>
  ): Promise<Capability | null> => {
    try {
      const { skill_attributes, competency_attributes, ...capabilityData } = input;

      const { data: capability, error } = await supabase
        .from("capabilities")
        .update(capabilityData as any)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating capability:", error);
        toast.error("Failed to update capability");
        return null;
      }

      // Update type-specific attributes
      if (skill_attributes) {
        const { error: attrError } = await supabase
          .from("skill_attributes")
          .upsert([{
            capability_id: id,
            ...skill_attributes,
          } as any], { onConflict: "capability_id" });

        if (attrError) {
          console.error("Error updating skill attributes:", attrError);
        }
      }

      if (competency_attributes) {
        const { error: attrError } = await supabase
          .from("competency_attributes")
          .upsert([{
            capability_id: id,
            ...competency_attributes,
          } as any], { onConflict: "capability_id" });

        if (attrError) {
          console.error("Error updating competency attributes:", attrError);
        }
      }

      toast.success("Capability updated successfully");
      return capability as Capability;
    } catch (err) {
      console.error("Error in updateCapability:", err);
      toast.error("Failed to update capability");
      return null;
    }
  }, []);

  const deleteCapability = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("capabilities")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting capability:", error);
        toast.error("Failed to delete capability");
        return false;
      }

      toast.success("Capability deleted successfully");
      return true;
    } catch (err) {
      console.error("Error in deleteCapability:", err);
      toast.error("Failed to delete capability");
      return false;
    }
  }, []);

  const updateStatus = useCallback(async (
    id: string,
    status: CapabilityStatus
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("capabilities")
        .update({ status })
        .eq("id", id);

      if (error) {
        console.error("Error updating capability status:", error);
        toast.error("Failed to update status");
        return false;
      }

      toast.success(`Status updated to ${status}`);
      return true;
    } catch (err) {
      console.error("Error in updateStatus:", err);
      toast.error("Failed to update status");
      return false;
    }
  }, []);

  return {
    capabilities,
    loading,
    fetchCapabilities,
    createCapability,
    updateCapability,
    deleteCapability,
    updateStatus,
  };
}

export function useProficiencyScales() {
  const [scales, setScales] = useState<ProficiencyScale[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScales = useCallback(async (companyId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("proficiency_scales")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching proficiency scales:", error);
        toast.error("Failed to fetch proficiency scales");
        return [];
      }

      const transformed = (data || []).map(scale => ({
        ...scale,
        levels: Array.isArray(scale.levels) ? scale.levels : [],
      })) as unknown as ProficiencyScale[];

      setScales(transformed);
      return transformed;
    } catch (err) {
      console.error("Error in fetchScales:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scales,
    loading,
    fetchScales,
  };
}

export function useCompetencySkillMappings() {
  const [mappings, setMappings] = useState<CompetencySkillMapping[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMappings = useCallback(async (competencyId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("competency_skill_mappings")
        .select("*")
        .eq("competency_id", competencyId)
        .order("weight", { ascending: false });

      if (error) {
        console.error("Error fetching skill mappings:", error);
        return [];
      }

      setMappings(data as unknown as CompetencySkillMapping[]);
      return data as unknown as CompetencySkillMapping[];
    } catch (err) {
      console.error("Error in fetchMappings:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addMapping = useCallback(async (
    competencyId: string,
    skillId: string,
    weight: number = 1,
    isRequired: boolean = false,
    minProficiencyLevel?: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("competency_skill_mappings")
        .insert([{
          competency_id: competencyId,
          skill_id: skillId,
          weight,
          is_required: isRequired,
          min_proficiency_level: minProficiencyLevel,
        }]);

      if (error) {
        if (error.code === "23505") {
          toast.error("This skill is already linked to this competency");
        } else {
          toast.error("Failed to add skill mapping");
        }
        return false;
      }

      toast.success("Skill linked successfully");
      return true;
    } catch (err) {
      console.error("Error in addMapping:", err);
      return false;
    }
  }, []);

  const removeMapping = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("competency_skill_mappings")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Failed to remove skill mapping");
        return false;
      }

      toast.success("Skill unlinked successfully");
      return true;
    } catch (err) {
      console.error("Error in removeMapping:", err);
      return false;
    }
  }, []);

  return {
    mappings,
    loading,
    fetchMappings,
    addMapping,
    removeMapping,
  };
}
