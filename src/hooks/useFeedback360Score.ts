import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Feedback360Response {
  id: string;
  request_id: string;
  question_id: string;
  rating_value: number | null;
  text_response: string | null;
  selected_choices: any;
}

export interface Feedback360Request {
  id: string;
  cycle_id: string;
  participant_id: string | null;
  subject_employee_id: string;
  rater_id: string;
  rater_category_id: string;
  status: string;
  submitted_at: string | null;
}

export interface RaterCategory {
  id: string;
  code: string;
  name: string;
  weight_percentage: number;
  is_anonymous: boolean;
}

export interface CategoryScore {
  category: RaterCategory;
  averageRating: number;
  responseCount: number;
  weightedScore: number;
}

export interface Feedback360ScoreSummary {
  overallScore: number;
  categoryScores: CategoryScore[];
  totalResponses: number;
  completionRate: number;
  isComplete: boolean;
}

export function useFeedback360Score(subjectEmployeeId: string | undefined, cycleId: string | undefined) {
  return useQuery({
    queryKey: ["feedback-360-score", subjectEmployeeId, cycleId],
    queryFn: async (): Promise<Feedback360ScoreSummary | null> => {
      if (!subjectEmployeeId || !cycleId) return null;

      // Fetch rater categories
      const { data: categories, error: categoriesError } = await supabase
        .from("feedback_360_rater_categories")
        .select("*")
        .order("display_order");
      
      if (categoriesError) throw categoriesError;

      // Fetch all requests for this subject in this cycle
      const { data: requests, error: requestsError } = await supabase
        .from("feedback_360_requests")
        .select("*")
        .eq("cycle_id", cycleId)
        .eq("subject_employee_id", subjectEmployeeId);

      if (requestsError) throw requestsError;

      if (!requests || requests.length === 0) {
        return null;
      }

      const requestIds = requests.map(r => r.id);
      const completedRequests = requests.filter(r => r.status === "completed");

      // Fetch all responses for completed requests
      const { data: responses, error: responsesError } = await supabase
        .from("feedback_360_responses")
        .select("*")
        .in("request_id", requestIds);

      if (responsesError) throw responsesError;

      // Calculate scores by category
      const categoryScores: CategoryScore[] = [];
      let totalWeightedScore = 0;
      let totalWeight = 0;

      for (const category of categories || []) {
        const categoryRequests = requests.filter(r => r.rater_category_id === category.id);
        const categoryRequestIds = categoryRequests.map(r => r.id);
        const categoryResponses = (responses || []).filter(r => 
          categoryRequestIds.includes(r.request_id) && r.rating_value != null
        );

        if (categoryResponses.length === 0) continue;

        const sumRatings = categoryResponses.reduce((sum, r) => sum + (r.rating_value || 0), 0);
        const averageRating = sumRatings / categoryResponses.length;
        const weightedScore = averageRating * (category.weight_percentage / 100);

        categoryScores.push({
          category,
          averageRating: Math.round(averageRating * 100) / 100,
          responseCount: categoryResponses.length,
          weightedScore,
        });

        totalWeightedScore += weightedScore;
        totalWeight += category.weight_percentage;
      }

      // Normalize if total weight doesn't equal 100
      const normalizedScore = totalWeight > 0 
        ? (totalWeightedScore / totalWeight) * 100 
        : 0;

      const overallScore = Math.round(normalizedScore * 100) / 100;

      return {
        overallScore,
        categoryScores,
        totalResponses: (responses || []).length,
        completionRate: requests.length > 0 ? (completedRequests.length / requests.length) * 100 : 0,
        isComplete: completedRequests.length === requests.length && requests.length > 0,
      };
    },
    enabled: !!subjectEmployeeId && !!cycleId,
  });
}

export function useFeedback360Requests(subjectEmployeeId: string | undefined, cycleId: string | undefined) {
  return useQuery({
    queryKey: ["feedback-360-requests", subjectEmployeeId, cycleId],
    queryFn: async () => {
      if (!subjectEmployeeId || !cycleId) return [];

      const { data, error } = await supabase
        .from("feedback_360_requests")
        .select(`
          *,
          rater:profiles!feedback_360_requests_rater_id_fkey(id, full_name, email),
          category:feedback_360_rater_categories(*)
        `)
        .eq("cycle_id", cycleId)
        .eq("subject_employee_id", subjectEmployeeId);

      if (error) throw error;
      return data;
    },
    enabled: !!subjectEmployeeId && !!cycleId,
  });
}

export function useRaterCategories(companyId: string | undefined) {
  return useQuery({
    queryKey: ["feedback-360-rater-categories", companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from("feedback_360_rater_categories")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as RaterCategory[];
    },
    enabled: !!companyId,
  });
}

/**
 * Normalize a 360 feedback score to a target scale
 * @param score - The raw 360 score
 * @param sourceMin - Source scale minimum (default 1)
 * @param sourceMax - Source scale maximum (default 5)
 * @param targetMin - Target scale minimum (default 1)
 * @param targetMax - Target scale maximum (default 5)
 */
export function normalize360Score(
  score: number,
  sourceMin: number = 1,
  sourceMax: number = 5,
  targetMin: number = 1,
  targetMax: number = 5
): number {
  if (sourceMin === targetMin && sourceMax === targetMax) {
    return score;
  }

  // Linear normalization
  const normalizedRatio = (score - sourceMin) / (sourceMax - sourceMin);
  const normalizedScore = targetMin + normalizedRatio * (targetMax - targetMin);
  
  return Math.round(normalizedScore * 100) / 100;
}

/**
 * Calculate the 360 feedback contribution to final appraisal score
 * @param feedback360Score - The calculated 360 score
 * @param weight - The weight percentage (0-100)
 * @param maxRating - Maximum possible rating
 */
export function calculate360Contribution(
  feedback360Score: number,
  weight: number,
  maxRating: number = 5
): number {
  const normalizedScore = normalize360Score(feedback360Score, 1, 5, 1, maxRating);
  return (normalizedScore * weight) / 100;
}
