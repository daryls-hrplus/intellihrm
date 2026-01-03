import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

interface ProspectSession {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  industry: string | null;
  employee_count: string | null;
}

function calculateLeadTemperature(score: number): string {
  if (score >= 76) return "qualified";
  if (score >= 51) return "hot";
  if (score >= 26) return "warm";
  return "cold";
}

function generateRecommendedFollowUp(
  score: number,
  temperature: string,
  session: ProspectSession
): string {
  if (temperature === "qualified" || temperature === "hot") {
    if (session.email) {
      return `High-priority lead. Schedule personalized demo call with ${session.email} within 24 hours.`;
    }
    return "High-intent prospect. Prioritize email capture and schedule demo.";
  }

  if (temperature === "warm") {
    return "Send nurture email with relevant case study and add to retargeting campaign.";
  }

  return "Low engagement. Consider improving content or targeting.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { session_id, compute_all } = await req.json();

    console.log("Computing lead scores", { session_id, compute_all });

    // Get sessions to process
    let sessionsQuery = supabase
      .from("demo_prospect_sessions")
      .select("*");

    if (session_id) {
      sessionsQuery = sessionsQuery.eq("id", session_id);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      throw sessionsError;
    }

    console.log(`Processing ${sessions?.length || 0} sessions`);

    const results = [];

    for (const session of sessions || []) {
      // Get all engagement events for this session
      const { data: events, error: eventsError } = await supabase
        .from("demo_engagement_events")
        .select("*")
        .eq("session_id", session.id);

      if (eventsError) {
        console.error(`Error fetching events for session ${session.id}:`, eventsError);
        continue;
      }

      // Get experience info for chapter counting
      const experienceIds = [...new Set(events?.filter(e => e.experience_id).map(e => e.experience_id))];
      
      let totalChapters = 0;
      let completedChapters = 0;

      if (experienceIds.length > 0) {
        const { data: chapters } = await supabase
          .from("demo_experience_chapters")
          .select("id, experience_id")
          .in("experience_id", experienceIds)
          .eq("is_active", true);

        totalChapters = chapters?.length || 0;
        
        const completedChapterIds = new Set(
          events?.filter(e => e.event_type === "chapter_complete").map(e => e.chapter_id)
        );
        completedChapters = completedChapterIds.size;
      }

      // Calculate metrics from events
      const totalWatchTime = events?.reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0) || 0;
      
      const ctaEvents = events?.filter(e => 
        e.event_type === "cta_click" || e.event_type === "book_demo" || e.event_type === "request_trial"
      ) || [];

      const featureExploreEvents = events?.filter(e => 
        e.event_type === "feature_explore" || e.event_type === "interactive_action"
      ) || [];

      // Calculate video engagement
      const videoEvents = events?.filter(e => 
        e.event_type === "video_progress" || e.event_type === "video_complete"
      ) || [];
      
      const avgVideoWatchPercentage = videoEvents.length > 0
        ? videoEvents.reduce((sum, e) => sum + (e.video_watch_percentage || 0), 0) / videoEvents.length
        : 0;

      // Profile completeness bonus
      let profileScore = 0;
      if (session.email) profileScore += 25;
      if (session.full_name) profileScore += 15;
      if (session.company_name) profileScore += 20;
      if (session.industry) profileScore += 15;
      if (session.employee_count) profileScore += 10;
      if (session.job_title) profileScore += 15;

      // Calculate weighted final score (0-100)
      const videoScore = Math.min(100, avgVideoWatchPercentage);
      const chapterScore = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
      const ctaScore = Math.min(100, ctaEvents.length * 25);
      const timeScore = Math.min(100, (totalWatchTime / 300) * 100); // 5 min = 100

      const engagementScore = Math.round(
        videoScore * 0.30 +
        chapterScore * 0.25 +
        ctaScore * 0.20 +
        timeScore * 0.10 +
        profileScore * 0.15
      );

      const leadTemperature = calculateLeadTemperature(engagementScore);
      const recommendedFollowUp = generateRecommendedFollowUp(engagementScore, leadTemperature, session);

      // Upsert lead score using actual table columns
      const { data: leadScore, error: upsertError } = await supabase
        .from("demo_lead_scores")
        .upsert({
          session_id: session.id,
          email: session.email,
          total_watch_time_seconds: totalWatchTime,
          chapters_completed: completedChapters,
          features_explored: featureExploreEvents.length,
          cta_clicks: ctaEvents.length,
          engagement_score: engagementScore,
          lead_temperature: leadTemperature,
          recommended_follow_up: recommendedFollowUp,
          ai_insights: {
            video_engagement: Math.round(videoScore),
            chapter_completion: Math.round(chapterScore),
            cta_interactions: Math.round(ctaScore),
            time_investment: Math.round(timeScore),
            profile_completeness: profileScore,
            total_events: events?.length || 0,
          },
          last_computed_at: new Date().toISOString(),
        }, {
          onConflict: "session_id",
        })
        .select()
        .single();

      if (upsertError) {
        console.error(`Error upserting lead score for session ${session.id}:`, upsertError);
        continue;
      }

      results.push({
        session_id: session.id,
        email: session.email,
        engagement_score: engagementScore,
        lead_temperature: leadTemperature,
      });

      console.log(`Computed score for ${session.email || session.id}: ${engagementScore} (${leadTemperature})`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in compute-lead-score:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
