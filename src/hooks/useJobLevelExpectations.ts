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

export interface ThresholdSuggestion {
  competencyScore: number | null;
  goalPercent: number | null;
  pattern: 'linear' | 'exponential' | 'custom' | 'none';
  confidence: 'high' | 'medium' | 'low';
  message: string;
}

export interface ValidationWarning {
  type: 'regression' | 'gap' | 'range' | 'duplicate';
  severity: 'warning' | 'info';
  message: string;
  recommendation?: string;
}

export function useJobLevelExpectations(companyId: string) {
  const [expectations, setExpectations] = useState<JobLevelExpectation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Smart Threshold Suggestions - analyze patterns from existing expectations
  const analyzeThresholdPatterns = useCallback(
    (targetGrade: string, targetLevel: string): ThresholdSuggestion => {
      const activeExpectations = expectations.filter((e) => e.is_active);
      
      if (activeExpectations.length < 2) {
        return {
          competencyScore: 3.0,
          goalPercent: 80,
          pattern: 'none',
          confidence: 'low',
          message: 'Not enough data to suggest - using defaults'
        };
      }

      // Extract grade number for ordering
      const getGradeNum = (grade: string) => parseInt(grade.replace(/\D/g, '')) || 0;
      const sorted = [...activeExpectations].sort(
        (a, b) => getGradeNum(a.job_grade) - getGradeNum(b.job_grade)
      );

      // Calculate average increments
      let competencyIncrements: number[] = [];
      let goalIncrements: number[] = [];

      for (let i = 1; i < sorted.length; i++) {
        const gradeDiff = getGradeNum(sorted[i].job_grade) - getGradeNum(sorted[i - 1].job_grade);
        if (gradeDiff > 0) {
          const compIncrement = ((sorted[i].min_competency_score || 0) - (sorted[i - 1].min_competency_score || 0)) / gradeDiff;
          const goalIncrement = ((sorted[i].min_goal_achievement_percent || 0) - (sorted[i - 1].min_goal_achievement_percent || 0)) / gradeDiff;
          competencyIncrements.push(compIncrement);
          goalIncrements.push(goalIncrement);
        }
      }

      if (competencyIncrements.length === 0) {
        return {
          competencyScore: 3.0,
          goalPercent: 80,
          pattern: 'none',
          confidence: 'low',
          message: 'Unable to determine pattern'
        };
      }

      const avgCompIncrement = competencyIncrements.reduce((a, b) => a + b, 0) / competencyIncrements.length;
      const avgGoalIncrement = goalIncrements.reduce((a, b) => a + b, 0) / goalIncrements.length;

      // Find the nearest defined grade to extrapolate from
      const targetGradeNum = getGradeNum(targetGrade);
      let nearestBelow = sorted.filter((e) => getGradeNum(e.job_grade) < targetGradeNum).pop();
      let nearestAbove = sorted.find((e) => getGradeNum(e.job_grade) > targetGradeNum);

      let suggestedComp: number;
      let suggestedGoal: number;
      let confidence: 'high' | 'medium' | 'low' = 'medium';

      if (nearestBelow) {
        const gradeDistance = targetGradeNum - getGradeNum(nearestBelow.job_grade);
        suggestedComp = (nearestBelow.min_competency_score || 3.0) + (avgCompIncrement * gradeDistance);
        suggestedGoal = (nearestBelow.min_goal_achievement_percent || 80) + (avgGoalIncrement * gradeDistance);
        confidence = gradeDistance === 1 ? 'high' : 'medium';
      } else if (nearestAbove) {
        const gradeDistance = getGradeNum(nearestAbove.job_grade) - targetGradeNum;
        suggestedComp = (nearestAbove.min_competency_score || 3.0) - (avgCompIncrement * gradeDistance);
        suggestedGoal = (nearestAbove.min_goal_achievement_percent || 80) - (avgGoalIncrement * gradeDistance);
        confidence = 'low';
      } else {
        suggestedComp = 3.0;
        suggestedGoal = 80;
        confidence = 'low';
      }

      // Clamp values to reasonable ranges
      suggestedComp = Math.max(1.0, Math.min(5.0, suggestedComp));
      suggestedGoal = Math.max(50, Math.min(100, suggestedGoal));

      // Determine pattern type
      const variance = competencyIncrements.reduce((sum, inc) => sum + Math.pow(inc - avgCompIncrement, 2), 0) / competencyIncrements.length;
      const pattern = variance < 0.01 ? 'linear' : variance < 0.1 ? 'custom' : 'custom';

      return {
        competencyScore: Math.round(suggestedComp * 10) / 10,
        goalPercent: Math.round(suggestedGoal),
        pattern,
        confidence,
        message: `Based on ${activeExpectations.length} existing expectations (${confidence} confidence)`
      };
    },
    [expectations]
  );

  // Consistency Validation
  const validateConsistency = useCallback(
    (formData: JobLevelExpectationForm, existingId?: string): ValidationWarning[] => {
      const warnings: ValidationWarning[] = [];
      const getGradeNum = (grade: string) => parseInt(grade.replace(/\D/g, '')) || 0;
      
      const currentGradeNum = getGradeNum(formData.job_grade);
      const currentCompetency = parseFloat(formData.min_competency_score) || 0;
      const currentGoal = parseFloat(formData.min_goal_achievement_percent) || 0;

      // Filter out the current record being edited
      const otherExpectations = expectations.filter((e) => e.is_active && e.id !== existingId);

      // Check for score regression (lower grade with higher score)
      const lowerGrades = otherExpectations.filter((e) => getGradeNum(e.job_grade) < currentGradeNum);
      const higherGrades = otherExpectations.filter((e) => getGradeNum(e.job_grade) > currentGradeNum);

      for (const lower of lowerGrades) {
        if ((lower.min_competency_score || 0) > currentCompetency) {
          warnings.push({
            type: 'regression',
            severity: 'warning',
            message: `Score regression: ${lower.job_grade} requires ${lower.min_competency_score} but ${formData.job_grade} only requires ${currentCompetency}`,
            recommendation: `Consider setting score to at least ${lower.min_competency_score}`
          });
        }
        if ((lower.min_goal_achievement_percent || 0) > currentGoal) {
          warnings.push({
            type: 'regression',
            severity: 'warning',
            message: `Goal regression: ${lower.job_grade} requires ${lower.min_goal_achievement_percent}% but ${formData.job_grade} only requires ${currentGoal}%`,
            recommendation: `Consider setting goal to at least ${lower.min_goal_achievement_percent}%`
          });
        }
      }

      for (const higher of higherGrades) {
        if ((higher.min_competency_score || 0) < currentCompetency) {
          warnings.push({
            type: 'regression',
            severity: 'warning',
            message: `Score inconsistency: ${higher.job_grade} requires ${higher.min_competency_score} which is less than ${formData.job_grade} at ${currentCompetency}`,
            recommendation: `Consider reviewing ${higher.job_grade} expectations`
          });
        }
      }

      // Check for reasonable ranges
      if (currentCompetency < 2.0) {
        warnings.push({
          type: 'range',
          severity: 'info',
          message: `Competency score ${currentCompetency} is below typical minimum (2.0)`,
          recommendation: 'Consider if this threshold is appropriate'
        });
      }
      if (currentCompetency > 4.5) {
        warnings.push({
          type: 'range',
          severity: 'info',
          message: `Competency score ${currentCompetency} is very high - may be difficult to achieve`,
          recommendation: 'Ensure this is realistic for this level'
        });
      }
      if (currentGoal < 60) {
        warnings.push({
          type: 'range',
          severity: 'info',
          message: `Goal target ${currentGoal}% is below typical minimum (60%)`,
          recommendation: 'Consider if this threshold is appropriate'
        });
      }

      // Check for duplicate grade/level with overlapping dates
      const duplicates = otherExpectations.filter(
        (e) =>
          e.job_grade === formData.job_grade &&
          e.job_level === formData.job_level &&
          (!e.effective_to || e.effective_to >= formData.effective_from) &&
          (!formData.effective_to || formData.effective_to >= e.effective_from)
      );
      if (duplicates.length > 0) {
        warnings.push({
          type: 'duplicate',
          severity: 'warning',
          message: `Overlapping effective dates with existing ${formData.job_grade}/${formData.job_level} configuration`,
          recommendation: 'Set an effective_to date on the existing record first'
        });
      }

      // Check for gaps in grade sequence
      const definedGrades = new Set(otherExpectations.map((e) => getGradeNum(e.job_grade)));
      definedGrades.add(currentGradeNum);
      const gradeNums = Array.from(definedGrades).sort((a, b) => a - b);
      for (let i = 1; i < gradeNums.length; i++) {
        if (gradeNums[i] - gradeNums[i - 1] > 1) {
          const missingGrades = [];
          for (let g = gradeNums[i - 1] + 1; g < gradeNums[i]; g++) {
            missingGrades.push(`GR${g}`);
          }
          warnings.push({
            type: 'gap',
            severity: 'info',
            message: `Gap detected: No expectations defined for ${missingGrades.join(', ')}`,
            recommendation: 'Consider defining expectations for missing grades'
          });
        }
      }

      return warnings;
    },
    [expectations]
  );

  // AI-Generated Progression Criteria
  const generateProgressionCriteria = async (
    jobLevel: string,
    jobGrade: string
  ): Promise<{ criteria: string; criteria_en: string } | null> => {
    setIsGenerating(true);
    try {
      // Get existing criteria for context
      const existingCriteria = expectations
        .filter((e) => e.is_active && e.progression_criteria)
        .slice(0, 3)
        .map((e) => ({
          grade: e.job_grade,
          level: e.job_level,
          criteria: e.progression_criteria
        }));

      const { data, error } = await supabase.functions.invoke('responsibility-ai-helper', {
        body: {
          action: 'generate_progression_criteria',
          jobLevel,
          jobGrade,
          existingCriteria
        }
      });

      if (error) throw error;

      if (data?.success && data.criteria) {
        return {
          criteria: data.criteria,
          criteria_en: data.criteria_en || data.criteria
        };
      }

      return null;
    } catch (error) {
      console.error('Error generating progression criteria:', error);
      toast.error('Failed to generate progression criteria');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

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
    isGenerating,
    fetchExpectations,
    saveExpectation,
    deleteExpectation,
    getExpectationForJob,
    analyzeThresholdPatterns,
    validateConsistency,
    generateProgressionCriteria,
  };
}
