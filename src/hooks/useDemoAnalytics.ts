import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DemoSession {
  id: string;
  session_token: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  job_title: string | null;
  industry: string | null;
  employee_count: string | null;
  started_at: string;
  last_activity_at: string;
}

interface LeadScore {
  id: string;
  session_id: string;
  engagement_score: number;
  lead_temperature: string;
  total_watch_time_seconds: number;
  chapters_completed: number;
  features_explored: number;
  cta_clicks: number;
  recommended_follow_up: string | null;
  ai_insights: Record<string, unknown> | null;
  last_computed_at: string | null;
}

interface EngagementEvent {
  id: string;
  session_id: string;
  experience_id: string | null;
  chapter_id: string | null;
  event_type: string;
  video_watch_percentage: number;
  time_spent_seconds: number;
  event_data: Record<string, unknown>;
  created_at: string;
}

interface ProspectWithScore extends DemoSession {
  lead_score: LeadScore | null;
  events_count: number;
  total_time_spent: number;
}

interface ExperienceMetrics {
  experience_id: string;
  experience_name: string;
  experience_code: string;
  total_views: number;
  unique_sessions: number;
  avg_completion_rate: number;
  avg_time_spent: number;
  lead_conversion_rate: number;
}

interface DashboardStats {
  total_sessions: number;
  identified_leads: number;
  avg_engagement_score: number;
  conversion_rate: number;
  sessions_this_month: number;
  qualified_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
}

export function useDemoAnalyticsStats() {
  return useQuery({
    queryKey: ["demo-analytics-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Get all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("demo_prospect_sessions")
        .select("id, email, started_at");

      if (sessionsError) throw sessionsError;

      // Get all lead scores
      const { data: leadScores, error: scoresError } = await supabase
        .from("demo_lead_scores")
        .select("*");

      if (scoresError) throw scoresError;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalSessions = sessions?.length || 0;
      const identifiedLeads = sessions?.filter(s => s.email)?.length || 0;
      const sessionsThisMonth = sessions?.filter(s => 
        new Date(s.started_at) >= startOfMonth
      )?.length || 0;

      const scores = leadScores || [];
      const avgScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s.engagement_score, 0) / scores.length
        : 0;

      const qualified = scores.filter(s => s.lead_temperature === "qualified").length;
      const hot = scores.filter(s => s.lead_temperature === "hot").length;
      const warm = scores.filter(s => s.lead_temperature === "warm").length;
      const cold = scores.filter(s => s.lead_temperature === "cold").length;

      // Conversion rate: qualified leads / total identified leads
      const conversionRate = identifiedLeads > 0
        ? (qualified / identifiedLeads) * 100
        : 0;

      return {
        total_sessions: totalSessions,
        identified_leads: identifiedLeads,
        avg_engagement_score: Math.round(avgScore),
        conversion_rate: Math.round(conversionRate * 10) / 10,
        sessions_this_month: sessionsThisMonth,
        qualified_leads: qualified,
        hot_leads: hot,
        warm_leads: warm,
        cold_leads: cold,
      };
    },
  });
}

export function useProspectsWithScores() {
  return useQuery({
    queryKey: ["prospects-with-scores"],
    queryFn: async (): Promise<ProspectWithScore[]> => {
      // Get all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("demo_prospect_sessions")
        .select("*")
        .order("last_activity_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get all lead scores
      const { data: leadScores, error: scoresError } = await supabase
        .from("demo_lead_scores")
        .select("*");

      if (scoresError) throw scoresError;

      // Get event counts per session
      const { data: events, error: eventsError } = await supabase
        .from("demo_engagement_events")
        .select("session_id, time_spent_seconds");

      if (eventsError) throw eventsError;

      const scoreMap = new Map(leadScores?.map(s => [s.session_id, {
        id: s.id,
        session_id: s.session_id,
        engagement_score: s.engagement_score,
        lead_temperature: s.lead_temperature,
        total_watch_time_seconds: s.total_watch_time_seconds,
        chapters_completed: s.chapters_completed,
        features_explored: s.features_explored,
        cta_clicks: s.cta_clicks,
        recommended_follow_up: s.recommended_follow_up,
        ai_insights: s.ai_insights as Record<string, unknown> | null,
        last_computed_at: s.last_computed_at,
      } as LeadScore]));
      
      const eventStats = new Map<string, { count: number; time: number }>();
      events?.forEach(e => {
        const stats = eventStats.get(e.session_id) || { count: 0, time: 0 };
        stats.count++;
        stats.time += e.time_spent_seconds || 0;
        eventStats.set(e.session_id, stats);
      });

      return (sessions || []).map(session => ({
        ...session,
        lead_score: scoreMap.get(session.id) || null,
        events_count: eventStats.get(session.id)?.count || 0,
        total_time_spent: eventStats.get(session.id)?.time || 0,
      }));
    },
  });
}

export function useExperienceMetrics() {
  return useQuery({
    queryKey: ["experience-metrics"],
    queryFn: async (): Promise<ExperienceMetrics[]> => {
      // Get all experiences
      const { data: experiences, error: expError } = await supabase
        .from("demo_experiences")
        .select("id, experience_name, experience_code")
        .eq("is_active", true);

      if (expError) throw expError;

      // Get all events
      const { data: events, error: eventsError } = await supabase
        .from("demo_engagement_events")
        .select("session_id, experience_id, event_type, video_watch_percentage, time_spent_seconds");

      if (eventsError) throw eventsError;

      // Get sessions with emails for conversion calculation
      const { data: sessions, error: sessionsError } = await supabase
        .from("demo_prospect_sessions")
        .select("id, email");

      if (sessionsError) throw sessionsError;

      const sessionEmailMap = new Map(sessions?.map(s => [s.id, !!s.email]));

      return (experiences || []).map(exp => {
        const expEvents = events?.filter(e => e.experience_id === exp.id) || [];
        const uniqueSessions = new Set(expEvents.map(e => e.session_id));
        
        const videoEvents = expEvents.filter(e => 
          e.event_type === "video_progress" || e.event_type === "video_complete"
        );
        const avgCompletion = videoEvents.length > 0
          ? videoEvents.reduce((sum, e) => sum + (e.video_watch_percentage || 0), 0) / videoEvents.length
          : 0;

        const totalTime = expEvents.reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0);
        const avgTime = uniqueSessions.size > 0 ? totalTime / uniqueSessions.size : 0;

        // Conversion: sessions that have email
        const convertedSessions = [...uniqueSessions].filter(sid => sessionEmailMap.get(sid));
        const conversionRate = uniqueSessions.size > 0
          ? (convertedSessions.length / uniqueSessions.size) * 100
          : 0;

        return {
          experience_id: exp.id,
          experience_name: exp.experience_name,
          experience_code: exp.experience_code,
          total_views: expEvents.filter(e => e.event_type === "experience_start").length,
          unique_sessions: uniqueSessions.size,
          avg_completion_rate: Math.round(avgCompletion),
          avg_time_spent: Math.round(avgTime),
          lead_conversion_rate: Math.round(conversionRate),
        };
      });
    },
  });
}

export function useProspectJourney(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["prospect-journey", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;

      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from("demo_prospect_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Get lead score
      const { data: leadScore } = await supabase
        .from("demo_lead_scores")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();
      
      // Map database fields to our interface
      const mappedLeadScore: LeadScore | null = leadScore ? {
        id: leadScore.id,
        session_id: leadScore.session_id,
        engagement_score: leadScore.engagement_score,
        lead_temperature: leadScore.lead_temperature,
        total_watch_time_seconds: leadScore.total_watch_time_seconds,
        chapters_completed: leadScore.chapters_completed,
        features_explored: leadScore.features_explored,
        cta_clicks: leadScore.cta_clicks,
        recommended_follow_up: leadScore.recommended_follow_up,
        ai_insights: leadScore.ai_insights as Record<string, unknown> | null,
        last_computed_at: leadScore.last_computed_at,
      } : null;

      // Get all events
      const { data: events, error: eventsError } = await supabase
        .from("demo_engagement_events")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (eventsError) throw eventsError;

      // Get experience and chapter names
      const experienceIds = [...new Set(events?.filter(e => e.experience_id).map(e => e.experience_id))];
      const chapterIds = [...new Set(events?.filter(e => e.chapter_id).map(e => e.chapter_id))];

      const { data: experiences } = await supabase
        .from("demo_experiences")
        .select("id, experience_name")
        .in("id", experienceIds.length > 0 ? experienceIds : ["none"]);

      const { data: chapters } = await supabase
        .from("demo_experience_chapters")
        .select("id, title")
        .in("id", chapterIds.length > 0 ? chapterIds : ["none"]);

      const experienceMap = new Map(experiences?.map(e => [e.id, e.experience_name]));
      const chapterMap = new Map(chapters?.map(c => [c.id, c.title]));

      const enrichedEvents = (events || []).map(event => ({
        ...event,
        experience_name: event.experience_id ? experienceMap.get(event.experience_id) : null,
        chapter_title: event.chapter_id ? chapterMap.get(event.chapter_id) : null,
      }));

      return {
        session,
        leadScore: mappedLeadScore,
        events: enrichedEvents,
      };
    },
    enabled: !!sessionId,
  });
}

export function useComputeLeadScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId?: string) => {
      const { data, error } = await supabase.functions.invoke("compute-lead-score", {
        body: { session_id: sessionId, compute_all: !sessionId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-analytics-stats"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-with-scores"] });
      queryClient.invalidateQueries({ queryKey: ["prospect-journey"] });
    },
  });
}
