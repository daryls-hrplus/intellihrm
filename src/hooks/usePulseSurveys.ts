import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PulseSurveyTemplate {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  category: string;
  questions: any[];
  estimated_duration_minutes: number;
  is_system_template: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PulseSurvey {
  id: string;
  company_id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  questions: any[];
  target_departments: string[];
  target_audience: string;
  is_anonymous: boolean;
  status: string;
  frequency: string;
  schedule_cron: string | null;
  next_scheduled_at: string | null;
  start_date: string;
  end_date: string;
  reminder_enabled: boolean;
  response_count: number;
  completion_rate: number;
  created_at: string;
}

export interface SentimentMetrics {
  id: string;
  company_id: string;
  department_id: string | null;
  survey_id: string | null;
  metric_date: string;
  avg_sentiment_score: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  total_responses: number;
  top_themes: string[];
  emotion_breakdown: Record<string, number>;
  trend_direction: string;
  trend_change: number;
  engagement_score: number;
}

export interface SentimentAlert {
  id: string;
  company_id: string;
  survey_id: string | null;
  department_id: string | null;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  recommended_actions: string[];
  is_resolved: boolean;
  created_at: string;
}

export interface CoachingNudge {
  id: string;
  company_id: string;
  manager_id: string;
  department_id: string | null;
  nudge_type: string;
  priority: string;
  title: string;
  message: string;
  suggested_actions: any[];
  related_themes: string[];
  is_dismissed: boolean;
  is_acted_upon: boolean;
  created_at: string;
}

export function usePulseSurveyTemplates(companyId?: string) {
  return useQuery({
    queryKey: ["pulse-survey-templates", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulse_survey_templates")
        .select("*")
        .or(`company_id.eq.${companyId},is_system_template.eq.true`)
        .eq("is_active", true)
        .order("is_system_template", { ascending: false })
        .order("name");
      if (error) throw error;
      return data as PulseSurveyTemplate[];
    },
    enabled: !!companyId,
  });
}

export function usePulseSurveys(companyId?: string) {
  return useQuery({
    queryKey: ["pulse-surveys", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulse_surveys")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PulseSurvey[];
    },
    enabled: !!companyId,
  });
}

export function useSentimentMetrics(companyId?: string, surveyId?: string, departmentId?: string) {
  return useQuery({
    queryKey: ["sentiment-metrics", companyId, surveyId, departmentId],
    queryFn: async () => {
      let query = supabase
        .from("pulse_sentiment_metrics")
        .select("*")
        .eq("company_id", companyId)
        .order("metric_date", { ascending: false })
        .limit(30);
      
      if (surveyId) query = query.eq("survey_id", surveyId);
      if (departmentId) query = query.eq("department_id", departmentId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SentimentMetrics[];
    },
    enabled: !!companyId,
  });
}

export function useSentimentAlerts(companyId?: string, includeResolved = false) {
  return useQuery({
    queryKey: ["sentiment-alerts", companyId, includeResolved],
    queryFn: async () => {
      let query = supabase
        .from("pulse_sentiment_alerts")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      
      if (!includeResolved) query = query.eq("is_resolved", false);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SentimentAlert[];
    },
    enabled: !!companyId,
  });
}

export function useCoachingNudges(managerId?: string, companyId?: string) {
  return useQuery({
    queryKey: ["coaching-nudges", managerId, companyId],
    queryFn: async () => {
      let query = supabase
        .from("pulse_coaching_nudges")
        .select("*")
        .eq("is_dismissed", false)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (managerId) query = query.eq("manager_id", managerId);
      if (companyId) query = query.eq("company_id", companyId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CoachingNudge[];
    },
    enabled: !!managerId || !!companyId,
  });
}

export function usePulseSurveyMutations() {
  const queryClient = useQueryClient();

  const createSurvey = useMutation({
    mutationFn: async (survey: Record<string, any>) => {
      const { data, error } = await supabase
        .from("pulse_surveys")
        .insert(survey as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pulse-surveys"] });
      toast.success("Pulse survey created");
    },
    onError: (error: any) => toast.error(`Failed to create survey: ${error.message}`),
  });

  const updateSurvey = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PulseSurvey> & { id: string }) => {
      const { data, error } = await supabase
        .from("pulse_surveys")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pulse-surveys"] });
      toast.success("Survey updated");
    },
    onError: (error) => toast.error(`Failed to update survey: ${error.message}`),
  });

  const resolveAlert = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from("pulse_sentiment_alerts")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentiment-alerts"] });
      toast.success("Alert resolved");
    },
  });

  const dismissNudge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pulse_coaching_nudges")
        .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-nudges"] });
    },
  });

  const actOnNudge = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from("pulse_coaching_nudges")
        .update({
          is_acted_upon: true,
          acted_upon_at: new Date().toISOString(),
          action_notes: notes,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-nudges"] });
      toast.success("Action recorded");
    },
  });

  const analyzeSentiment = useMutation({
    mutationFn: async (request: {
      action: string;
      surveyId?: string;
      companyId: string;
      departmentId?: string;
      managerId?: string;
      responses?: any[];
    }) => {
      const { data, error } = await supabase.functions.invoke("analyze-pulse-sentiment", {
        body: request,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sentiment-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["sentiment-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["coaching-nudges"] });
      if (variables.action === "analyze_response" || variables.action === "analyze_batch") {
        toast.success("Sentiment analysis complete");
      }
    },
    onError: (error) => toast.error(`Analysis failed: ${error.message}`),
  });

  return {
    createSurvey,
    updateSurvey,
    resolveAlert,
    dismissNudge,
    actOnNudge,
    analyzeSentiment,
  };
}
