import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HelpVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  route_patterns: string[];
  action_tags: string[];
  keywords: string[];
  difficulty_level: string;
  is_featured: boolean;
  category: { name: string; icon_name: string }[] | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { currentRoute, userIntent, searchQuery } = await req.json();

    console.log("Help videos request:", { currentRoute, userIntent, searchQuery });

    // Fetch all active videos with their categories
    const { data: videos, error: videosError } = await supabase
      .from("help_videos")
      .select(`
        id, title, description, video_url, thumbnail_url, duration_seconds,
        route_patterns, action_tags, keywords, difficulty_level, is_featured,
        category:help_video_categories(name, icon_name)
      `)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("display_order");

    if (videosError) {
      console.error("Error fetching videos:", videosError);
      throw videosError;
    }

    // If it's just a search query, do simple text matching
    if (searchQuery && !userIntent) {
      const searchLower = searchQuery.toLowerCase();
      const results = (videos || []).filter((v: HelpVideo) => 
        v.title.toLowerCase().includes(searchLower) ||
        v.description?.toLowerCase().includes(searchLower) ||
        v.keywords.some(k => k.toLowerCase().includes(searchLower)) ||
        v.action_tags.some(t => t.toLowerCase().includes(searchLower))
      );

      return new Response(
        JSON.stringify({ videos: results, method: "search" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Score videos based on route pattern matching
    const scoredVideos = (videos || []).map((video: HelpVideo) => {
      let score = 0;

      // Route pattern matching (highest weight)
      if (currentRoute && video.route_patterns.length > 0) {
        for (const pattern of video.route_patterns) {
          if (matchRoutePattern(currentRoute, pattern)) {
            score += 50;
            break;
          }
        }
      }

      // Keyword matching with user intent
      if (userIntent) {
        const intentLower = userIntent.toLowerCase();
        const intentWords = intentLower.split(/\s+/);

        // Check action tags
        for (const tag of video.action_tags) {
          if (intentLower.includes(tag.toLowerCase())) {
            score += 30;
          }
        }

        // Check keywords
        for (const keyword of video.keywords) {
          for (const word of intentWords) {
            if (keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())) {
              score += 10;
            }
          }
        }

        // Check title and description
        if (video.title.toLowerCase().includes(intentLower)) {
          score += 20;
        }
        if (video.description?.toLowerCase().includes(intentLower)) {
          score += 5;
        }
      }

      // Featured videos get a small boost
      if ((video as any).is_featured) {
        score += 5;
      }

      return { ...video, relevanceScore: score };
    });

    // Sort by score and filter to relevant videos
    const relevantVideos = scoredVideos
      .filter(v => v.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);

    // If no contextual matches, try AI matching with Lovable AI
    if (relevantVideos.length === 0 && userIntent) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      
      if (LOVABLE_API_KEY) {
        try {
          const videoSummaries = (videos || []).map((v: HelpVideo) => ({
            id: v.id,
            title: v.title,
            description: v.description,
            tags: [...v.action_tags, ...v.keywords].join(", "),
          }));

          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: `You are a help assistant that matches user questions to tutorial videos.
Given a list of videos and a user's question, return the IDs of the most relevant videos (max 5).
Return only a JSON array of video IDs, nothing else. Example: ["id1", "id2"]`,
                },
                {
                  role: "user",
                  content: `User is on route: ${currentRoute}
User wants help with: ${userIntent}

Available videos:
${JSON.stringify(videoSummaries, null, 2)}

Return the IDs of the most relevant videos for this user.`,
                },
              ],
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "";
            
            // Extract video IDs from response
            const match = content.match(/\[[\s\S]*\]/);
            if (match) {
              const ids = JSON.parse(match[0]) as string[];
              const aiVideos = ids
                .map(id => videos?.find((v: HelpVideo) => v.id === id))
                .filter(Boolean)
                .map(v => ({ ...v, relevanceScore: 25 }));

              if (aiVideos.length > 0) {
                return new Response(
                  JSON.stringify({ videos: aiVideos, method: "ai" }),
                  { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
              }
            }
          }
        } catch (aiError) {
          console.error("AI matching error:", aiError);
          // Fall through to return empty results
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        videos: relevantVideos, 
        method: relevantVideos.length > 0 ? "contextual" : "none" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in contextual-help-videos:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function matchRoutePattern(route: string, pattern: string): boolean {
  // Convert pattern to regex
  // /admin/* matches /admin/anything
  // /ess/leave matches exactly /ess/leave
  const regexPattern = pattern
    .replace(/\*/g, ".*")
    .replace(/\//g, "\\/");
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(route);
}
