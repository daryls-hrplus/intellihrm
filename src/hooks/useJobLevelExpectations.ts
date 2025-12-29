import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobLevelExpectation {
  id: string;
  company_id: string;
  job_level: string;
  job_grade: string;
  min_competency_score: number;
  min_goal_achievement_percent: number;
  progression_criteria: string | null;
  progression_criteria_en: string | null;
  notes: string | null;
  is_active: boolean;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface JobLevelExpectationForm {
  job_level: string;
  job_grade: string;
  min_competency_score: string;
  min_goal_achievement_percent: string;
  progression_criteria: string;
  progression_criteria_en: string;
  notes: string;
  is_active: boolean;
  effective_from: string;
  effective_to: string;
}

export const emptyExpectationForm: JobLevelExpectationForm = {
  job_level: "",
  job_grade: "",
  min_competency_score: "3.0",
  min_goal_achievement_percent: "80",
  progression_criteria: "",
  progression_criteria_en: "",
  notes: "",
  is_active: true,
  effective_from: new Date().toISOString().split("T")[0],
  effective_to: "",
};

export function useJobLevelExpectations(companyId: string) {
  const [expectations, setExpectations] = useState<JobLevelExpectation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchExpectations = useCallback(async () => {
    if (!companyId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_level_expectations")
        .select("*")
        .eq("company_id", companyId)
        .order("job_grade")
        .order("job_level");

      if (error) throw error;
      setExpectations((data as JobLevelExpectation[]) || []);
    } catch (error) {
      console.error("Error fetching job level expectations:", error);
      toast.error("Failed to load job level expectations");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchExpectations();
  }, [fetchExpectations]);

  const saveExpectation = async (
    formData: JobLevelExpectationForm,
    existingId?: string
  ): Promise<boolean> => {
    if (!companyId) {
      toast.error("Company not selected");
      return false;
    }

    if (!formData.job_level || !formData.job_grade) {
      toast.error("Job level and grade are required");
      return false;
    }

    setIsSaving(true);
    try {
      const payload = {
        company_id: companyId,
        job_level: formData.job_level,
        job_grade: formData.job_grade,
        min_competency_score: parseFloat(formData.min_competency_score) || 3.0,
        min_goal_achievement_percent:
          parseFloat(formData.min_goal_achievement_percent) || 80,
        progression_criteria: formData.progression_criteria.trim() || null,
        progression_criteria_en: formData.progression_criteria_en.trim() || null,
        notes: formData.notes.trim() || null,
        is_active: formData.is_active,
        effective_from: formData.effective_from,
        effective_to: formData.effective_to || null,
      };

      if (existingId) {
        const { error } = await supabase
          .from("job_level_expectations")
          .update(payload)
          .eq("id", existingId);

        if (error) throw error;
        toast.success("Level expectations updated");
      } else {
        const { error } = await supabase
          .from("job_level_expectations")
          .insert([payload]);

        if (error) throw error;
        toast.success("Level expectations created");
      }

      await fetchExpectations();
      return true;
    } catch (error: any) {
      console.error("Error saving job level expectations:", error);
      if (error.code === "23505") {
        toast.error(
          "Expectations for this level/grade combination already exist for this effective date"
        );
      } else {
        toast.error("Failed to save level expectations");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExpectation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("job_level_expectations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Level expectations deleted");
      await fetchExpectations();
      return true;
    } catch (error) {
      console.error("Error deleting job level expectations:", error);
      toast.error("Failed to delete level expectations");
      return false;
    }
  };

  const getExpectationForJob = (
    jobLevel: string | null,
    jobGrade: string | null
  ): JobLevelExpectation | null => {
    if (!jobLevel || !jobGrade) return null;

    const today = new Date().toISOString().split("T")[0];
    return (
      expectations.find(
        (e) =>
          e.job_level === jobLevel &&
          e.job_grade === jobGrade &&
          e.is_active &&
          e.effective_from <= today &&
          (!e.effective_to || e.effective_to >= today)
      ) || null
    );
  };

  return {
    expectations,
    isLoading,
    isSaving,
    fetchExpectations,
    saveExpectation,
    deleteExpectation,
    getExpectationForJob,
  };
}
