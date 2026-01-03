import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface DemoSession {
  id: string;
  session_token: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  job_title: string | null;
  industry: string | null;
  employee_count: string | null;
  personalization_answers: Record<string, unknown>;
  started_at: string;
}

interface LeadCaptureData {
  email?: string;
  full_name?: string;
  company_name?: string;
  job_title?: string;
  industry?: string;
  employee_count?: string;
  phone?: string;
}

export function useDemoSession() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateSessionToken = () => {
    return `demo_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const getStoredToken = () => {
    return localStorage.getItem("demo_session_token");
  };

  const storeToken = (token: string) => {
    localStorage.setItem("demo_session_token", token);
  };

  const initSession = useCallback(async () => {
    setIsLoading(true);
    try {
      let token = getStoredToken();
      
      if (token) {
        // Try to fetch existing session
        const { data: existingSession } = await supabase
          .from("demo_prospect_sessions")
          .select("*")
          .eq("session_token", token)
          .single();

        if (existingSession) {
          setSession(existingSession as unknown as DemoSession);
          // Update last activity
          await supabase
            .from("demo_prospect_sessions")
            .update({ last_activity_at: new Date().toISOString() })
            .eq("id", existingSession.id);
          setIsLoading(false);
          return existingSession as unknown as DemoSession;
        }
      }

      // Create new session
      token = generateSessionToken();
      storeToken(token);

      const utmParams = new URLSearchParams(window.location.search);
      const sourceUtmParams: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
        const value = utmParams.get(key);
        if (value) sourceUtmParams[key] = value;
      });

      const { data: newSession, error } = await supabase
        .from("demo_prospect_sessions")
        .insert({
          session_token: token,
          source_utm_params: sourceUtmParams as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;

      setSession(newSession as unknown as DemoSession);
      return newSession as unknown as DemoSession;
    } catch (error) {
      console.error("Error initializing demo session:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLeadInfo = async (data: LeadCaptureData) => {
    if (!session) return null;

    try {
      const { data: updated, error } = await supabase
        .from("demo_prospect_sessions")
        .update({
          ...data,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", session.id)
        .select()
        .single();

      if (error) throw error;

      setSession(updated as unknown as DemoSession);
      
      // Track lead capture event
      await trackEvent("lead_capture", { captured_fields: Object.keys(data) });
      
      return updated as unknown as DemoSession;
    } catch (error) {
      console.error("Error updating lead info:", error);
      return null;
    }
  };

  const updatePersonalization = async (answers: Record<string, unknown>) => {
    if (!session) return null;

    try {
      const mergedAnswers = {
        ...(session.personalization_answers || {}),
        ...answers,
      };
      
      const { data: updated, error } = await supabase
        .from("demo_prospect_sessions")
        .update({
          personalization_answers: mergedAnswers as unknown as Json,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", session.id)
        .select()
        .single();

      if (error) throw error;

      setSession(updated as unknown as DemoSession);
      return updated as unknown as DemoSession;
    } catch (error) {
      console.error("Error updating personalization:", error);
      return null;
    }
  };

  const trackEvent = async (
    eventType: string,
    eventData: Record<string, unknown> = {},
    experienceId?: string,
    chapterId?: string,
    watchPercentage?: number,
    timeSpent?: number
  ) => {
    if (!session) return;

    try {
      await supabase.from("demo_engagement_events").insert({
        session_id: session.id,
        experience_id: experienceId || null,
        chapter_id: chapterId || null,
        event_type: eventType,
        video_watch_percentage: watchPercentage || 0,
        time_spent_seconds: timeSpent || 0,
        event_data: eventData as unknown as Json,
      });
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  };

  useEffect(() => {
    initSession();
  }, [initSession]);

  return {
    session,
    isLoading,
    initSession,
    updateLeadInfo,
    updatePersonalization,
    trackEvent,
    isIdentified: !!session?.email,
  };
}
