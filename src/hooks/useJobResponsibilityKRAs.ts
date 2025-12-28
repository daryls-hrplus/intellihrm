import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobResponsibilityKRA {
  id: string;
  job_responsibility_id: string;
  responsibility_kra_id: string | null;
  name: string;
  job_specific_target: string | null;
  measurement_method: string | null;
  weight: number;
  is_inherited: boolean;
  inherited_at: string | null;
  customized_at: string | null;
  customized_by: string | null;
  ai_generated: boolean;
  ai_source: string | null;
  sequence_order: number;
}

export interface GenericKRA {
  id: string;
  name: string;
  target_metric: string | null;
  weight: number;
}

export interface ContextualizedKRA {
  id: string;
  name: string;
  target: string;
  method: string;
}

export function useJobResponsibilityKRAs(jobResponsibilityId: string) {
  const [kras, setKRAs] = useState<JobResponsibilityKRA[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchKRAs = useCallback(async () => {
    if (!jobResponsibilityId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_responsibility_kras")
        .select("*")
        .eq("job_responsibility_id", jobResponsibilityId)
        .order("sequence_order");

      if (error) throw error;
      setKRAs(data || []);
    } catch (error) {
      console.error("Error fetching job responsibility KRAs:", error);
    } finally {
      setLoading(false);
    }
  }, [jobResponsibilityId]);

  const inheritFromGeneric = useCallback(async (genericKRAs: GenericKRA[]) => {
    if (!jobResponsibilityId || genericKRAs.length === 0) return;

    setLoading(true);
    try {
      const krasToInsert = genericKRAs.map((gkra, index) => ({
        job_responsibility_id: jobResponsibilityId,
        responsibility_kra_id: gkra.id,
        name: gkra.name,
        job_specific_target: gkra.target_metric,
        weight: gkra.weight || 0,
        is_inherited: true,
        inherited_at: new Date().toISOString(),
        sequence_order: index,
      }));

      const { error } = await supabase
        .from("job_responsibility_kras")
        .upsert(krasToInsert, { onConflict: "job_responsibility_id,responsibility_kra_id" });

      if (error) throw error;
      
      await fetchKRAs();
      toast.success("KRAs inherited from library");
    } catch (error) {
      console.error("Error inheriting KRAs:", error);
      toast.error("Failed to inherit KRAs");
    } finally {
      setLoading(false);
    }
  }, [jobResponsibilityId, fetchKRAs]);

  const customizeKRA = useCallback(async (
    kraId: string,
    updates: { job_specific_target?: string; measurement_method?: string; weight?: number }
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("job_responsibility_kras")
        .update({
          ...updates,
          is_inherited: false,
          customized_at: new Date().toISOString(),
        })
        .eq("id", kraId);

      if (error) throw error;
      
      await fetchKRAs();
      toast.success("KRA customized");
    } catch (error) {
      console.error("Error customizing KRA:", error);
      toast.error("Failed to customize KRA");
    } finally {
      setLoading(false);
    }
  }, [fetchKRAs]);

  const resetToInherited = useCallback(async (kraId: string, originalTarget?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("job_responsibility_kras")
        .update({
          job_specific_target: originalTarget || null,
          measurement_method: null,
          is_inherited: true,
          customized_at: null,
          ai_generated: false,
          ai_source: null,
        })
        .eq("id", kraId);

      if (error) throw error;
      
      await fetchKRAs();
      toast.success("KRA reset to inherited");
    } catch (error) {
      console.error("Error resetting KRA:", error);
      toast.error("Failed to reset KRA");
    } finally {
      setLoading(false);
    }
  }, [fetchKRAs]);

  const generateWithAI = useCallback(async (
    genericKRAs: GenericKRA[],
    jobContext: {
      jobName: string;
      jobDescription?: string;
      jobGrade?: string;
      jobLevel?: string;
    }
  ): Promise<ContextualizedKRA[]> => {
    if (genericKRAs.length === 0) return [];

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("responsibility-ai-helper", {
        body: {
          action: "bulk_contextualize_kras",
          kras: genericKRAs.map(kra => ({
            id: kra.id,
            name: kra.name,
            genericTarget: kra.target_metric,
          })),
          jobName: jobContext.jobName,
          jobDescription: jobContext.jobDescription,
          jobGrade: jobContext.jobGrade,
          jobLevel: jobContext.jobLevel,
        },
      });

      if (error) throw error;
      
      if (data?.success && data?.results) {
        return data.results as ContextualizedKRA[];
      }
      
      return [];
    } catch (error) {
      console.error("Error generating KRAs with AI:", error);
      toast.error("Failed to generate KRA suggestions");
      return [];
    } finally {
      setGenerating(false);
    }
  }, []);

  const saveAIGeneratedKRAs = useCallback(async (
    contextualizedKRAs: Array<{
      responsibility_kra_id: string;
      name: string;
      target: string;
      method: string;
    }>
  ) => {
    if (!jobResponsibilityId || contextualizedKRAs.length === 0) return;

    setLoading(true);
    try {
      // First, delete existing job-specific KRAs for this job responsibility
      await supabase
        .from("job_responsibility_kras")
        .delete()
        .eq("job_responsibility_id", jobResponsibilityId);

      // Insert new KRAs - set responsibility_kra_id to null since these are from string arrays
      // not from actual responsibility_kras records
      const krasToInsert = contextualizedKRAs.map((kra, index) => ({
        job_responsibility_id: jobResponsibilityId,
        responsibility_kra_id: null, // Set to null - the IDs are synthetic, not real UUIDs
        name: kra.name,
        job_specific_target: kra.target,
        measurement_method: kra.method,
        is_inherited: false,
        ai_generated: true,
        ai_source: "job_contextualization",
        customized_at: new Date().toISOString(),
        sequence_order: index,
      }));

      const { error } = await supabase
        .from("job_responsibility_kras")
        .insert(krasToInsert);

      if (error) throw error;
      
      await fetchKRAs();
      toast.success("AI-generated KRAs saved");
    } catch (error) {
      console.error("Error saving AI-generated KRAs:", error);
      toast.error("Failed to save KRAs");
    } finally {
      setLoading(false);
    }
  }, [jobResponsibilityId, fetchKRAs]);

  const deleteKRA = useCallback(async (kraId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("job_responsibility_kras")
        .delete()
        .eq("id", kraId);

      if (error) throw error;
      
      await fetchKRAs();
      toast.success("KRA removed");
    } catch (error) {
      console.error("Error deleting KRA:", error);
      toast.error("Failed to remove KRA");
    } finally {
      setLoading(false);
    }
  }, [fetchKRAs]);

  return {
    kras,
    loading,
    generating,
    fetchKRAs,
    inheritFromGeneric,
    customizeKRA,
    resetToInherited,
    generateWithAI,
    saveAIGeneratedKRAs,
    deleteKRA,
  };
}
