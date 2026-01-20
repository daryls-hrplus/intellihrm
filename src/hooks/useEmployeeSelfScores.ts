import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SelfScoreItem {
  id?: string;
  item_id: string;
  item_name: string;
  evaluation_type: "competency" | "responsibility" | "goal" | "values";
  weight: number;
  self_rating: number | null;
  self_comments: string;
  self_metadata?: Record<string, any>;
  manager_rating?: number | null;
  manager_comments?: string | null;
  // For competencies
  proficiency_indicators?: Record<string, string[]>;
  required_level?: number;
  // For evidence
  evidence_count?: number;
}

export interface SelfScoreFilters {
  participant_id: string;
  evaluation_type?: "competency" | "responsibility" | "goal" | "values";
}

export function useEmployeeSelfScores(participantId: string) {
  const [scores, setScores] = useState<SelfScoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchScores = useCallback(async () => {
    if (!participantId) return [];
    
    setLoading(true);
    try {
      // Fetch existing scores with self_rating data
      const { data, error } = await supabase
        .from("appraisal_scores")
        .select("*")
        .eq("participant_id", participantId);

      if (error) throw error;

      const mappedScores: SelfScoreItem[] = (data || []).map((score: any) => ({
        id: score.id,
        item_id: score.item_id,
        item_name: score.item_name,
        evaluation_type: score.evaluation_type,
        weight: score.weight || 0,
        self_rating: score.self_rating,
        self_comments: score.self_comments || "",
        self_metadata: score.self_metadata || {},
        manager_rating: score.rating,
        manager_comments: score.comments,
      }));

      setScores(mappedScores);
      return mappedScores;
    } catch (error: any) {
      console.error("Error fetching self scores:", error);
      toast.error("Failed to load scores");
      return [];
    } finally {
      setLoading(false);
    }
  }, [participantId]);

  const updateSelfRating = useCallback((
    itemId: string,
    evaluationType: string,
    updates: Partial<Pick<SelfScoreItem, "self_rating" | "self_comments" | "self_metadata">>
  ) => {
    setScores(prev => prev.map(score => {
      if (score.item_id === itemId && score.evaluation_type === evaluationType) {
        return { ...score, ...updates };
      }
      return score;
    }));
  }, []);

  const saveSelfRatings = useCallback(async (itemsToSave?: SelfScoreItem[]) => {
    const toSave = itemsToSave || scores;
    if (!participantId || toSave.length === 0) return false;

    setSaving(true);
    try {
      for (const score of toSave) {
        if (score.self_rating !== null) {
          const payload: any = {
            participant_id: participantId,
            evaluation_type: score.evaluation_type,
            item_id: score.item_id,
            item_name: score.item_name,
            weight: score.weight,
            self_rating: score.self_rating,
            self_comments: score.self_comments || null,
            self_rated_at: new Date().toISOString(),
            self_metadata: score.self_metadata || {},
          };

          if (score.id) {
            // Update existing
            await supabase
              .from("appraisal_scores")
              .update({
                self_rating: payload.self_rating,
                self_comments: payload.self_comments,
                self_rated_at: payload.self_rated_at,
                self_metadata: payload.self_metadata,
              })
              .eq("id", score.id);
          } else {
            // Insert new (self-rating before manager rating)
            await supabase
              .from("appraisal_scores")
              .insert(payload);
          }
        }
      }
      return true;
    } catch (error: any) {
      console.error("Error saving self ratings:", error);
      toast.error("Failed to save ratings");
      return false;
    } finally {
      setSaving(false);
    }
  }, [participantId, scores]);

  const getScoresByType = useCallback((type: "competency" | "responsibility" | "goal" | "values") => {
    return scores.filter(s => s.evaluation_type === type);
  }, [scores]);

  const getCompletionStats = useCallback(() => {
    const total = scores.length;
    const completed = scores.filter(s => s.self_rating !== null).length;
    const byType = {
      competency: { total: 0, completed: 0 },
      responsibility: { total: 0, completed: 0 },
      goal: { total: 0, completed: 0 },
      values: { total: 0, completed: 0 },
    };

    scores.forEach(s => {
      if (byType[s.evaluation_type]) {
        byType[s.evaluation_type].total++;
        if (s.self_rating !== null) {
          byType[s.evaluation_type].completed++;
        }
      }
    });

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      byType,
    };
  }, [scores]);

  const calculateCategoryAverage = useCallback((type: "competency" | "responsibility" | "goal" | "values") => {
    const typeScores = scores.filter(s => s.evaluation_type === type && s.self_rating !== null);
    if (typeScores.length === 0) return null;

    const totalWeight = typeScores.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight === 0) {
      // Simple average if no weights
      const sum = typeScores.reduce((sum, s) => sum + (s.self_rating || 0), 0);
      return sum / typeScores.length;
    }

    // Weighted average
    const weightedSum = typeScores.reduce((sum, s) => sum + (s.self_rating || 0) * s.weight, 0);
    return weightedSum / totalWeight;
  }, [scores]);

  return {
    scores,
    setScores,
    loading,
    saving,
    fetchScores,
    updateSelfRating,
    saveSelfRatings,
    getScoresByType,
    getCompletionStats,
    calculateCategoryAverage,
  };
}
