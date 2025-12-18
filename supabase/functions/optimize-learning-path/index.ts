import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { roleCode, currentSkills, targetRole, learningGoals } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch available modules and features
    const { data: modules } = await supabase
      .from("application_modules")
      .select("module_code, module_name, description, role_requirements")
      .eq("is_active", true);

    // Fetch available training content
    const { data: contentStatus } = await supabase
      .from("enablement_content_status")
      .select(`
        feature_code,
        module_code,
        documentation_status,
        scorm_lite_status,
        rise_course_status,
        video_status,
        complexity_score
      `)
      .in("workflow_status", ["published", "review"]);

    // Fetch videos
    const { data: videos } = await supabase
      .from("enablement_videos")
      .select("feature_code, title, duration_seconds")
      .eq("is_active", true);

    // Build available content map
    const availableContent: Record<string, { 
      hasVideo: boolean; 
      hasSCORM: boolean; 
      hasRise: boolean;
      hasDocs: boolean;
      complexity: number;
      videoDuration?: number;
    }> = {};

    contentStatus?.forEach(cs => {
      availableContent[cs.feature_code] = {
        hasVideo: cs.video_status === "complete",
        hasSCORM: cs.scorm_lite_status === "complete",
        hasRise: cs.rise_course_status === "complete",
        hasDocs: cs.documentation_status === "complete",
        complexity: cs.complexity_score || 3,
      };
    });

    videos?.forEach(v => {
      if (availableContent[v.feature_code]) {
        availableContent[v.feature_code].hasVideo = true;
        availableContent[v.feature_code].videoDuration = v.duration_seconds;
      }
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a learning path optimizer for HRplus Cerebra HRIS. Create personalized learning paths based on role, current skills, and goals.

Consider:
- Progressive complexity (basics before advanced)
- Role-specific module focus
- Available content types (video preferred for visual learners, docs for reference)
- Time constraints
- Skill dependencies

Output a JSON object:
{
  "learningPath": {
    "name": "Path name",
    "description": "Brief description",
    "estimatedDuration": "X hours",
    "phases": [
      {
        "name": "Phase name",
        "duration": "X hours",
        "modules": [
          {
            "module_code": "...",
            "features": ["feature1", "feature2"],
            "contentType": "video"|"scorm"|"documentation",
            "priority": "essential"|"recommended"|"optional",
            "skills_gained": ["skill1", "skill2"]
          }
        ]
      }
    ]
  },
  "prerequisites": ["any prerequisites"],
  "certification_eligible": boolean,
  "recommendations": ["personalized tips"]
}`
          },
          {
            role: "user",
            content: `Create a personalized learning path:

Role: ${roleCode || "employee"}
Current Skills: ${JSON.stringify(currentSkills || [])}
Target Role: ${targetRole || "same"}
Learning Goals: ${JSON.stringify(learningGoals || ["general proficiency"])}

Available Modules:
${JSON.stringify(modules?.slice(0, 15), null, 2)}

Available Content:
${JSON.stringify(Object.entries(availableContent).slice(0, 30).map(([code, content]) => ({
  feature_code: code,
  ...content
})), null, 2)}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", aiResponse.status);
      return new Response(
        JSON.stringify({ error: "Failed to optimize learning path" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let learningPath = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        learningPath = JSON.parse(jsonMatch[0]);
      }
    } catch {
      learningPath = { raw: content };
    }

    return new Response(
      JSON.stringify({ learningPath }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in optimize-learning-path:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
