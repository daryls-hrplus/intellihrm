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
    const { featureCode, videoTitle, videoDuration, targetAudience, tone } = await req.json();

    if (!featureCode) {
      return new Response(
        JSON.stringify({ error: "Feature code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch feature details
    const { data: feature, error: featureError } = await supabase
      .from("application_features")
      .select(`
        feature_code,
        feature_name,
        description,
        ui_elements,
        workflow_steps,
        application_modules!inner(module_code, module_name)
      `)
      .eq("feature_code", featureCode)
      .single();

    if (featureError || !feature) {
      return new Response(
        JSON.stringify({ error: "Feature not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const durationMinutes = videoDuration || 3;
    const wordsPerMinute = 150; // Average speaking pace
    const targetWords = durationMinutes * wordsPerMinute;

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
            content: `You are a professional video script writer for HRplus Cerebra HRIS training videos.

Guidelines:
- Write for spoken delivery (natural pauses, clear sentences)
- Include timing markers [00:00] for each section
- Add visual cues in [brackets] for screen actions
- Use ${tone || "professional and friendly"} tone
- Target audience: ${targetAudience || "HR professionals and employees"}
- Target duration: ${durationMinutes} minutes (~${targetWords} words)
- Include intro, main content, and outro

Output a JSON object:
{
  "title": "Video title",
  "duration": "X:XX",
  "wordCount": number,
  "script": [
    {
      "timestamp": "00:00",
      "section": "section name",
      "narration": "spoken text",
      "visualCue": "what to show on screen"
    }
  ],
  "summary": "Brief video description for metadata",
  "keywords": ["for", "searchability"]
}`
          },
          {
            role: "user",
            content: `Create a voice-over script for a training video:

Video Title: ${videoTitle || feature.feature_name + " Tutorial"}
Feature: ${feature.feature_name}
Module: ${(feature.application_modules as any)?.module_name}
Description: ${feature.description || "N/A"}
UI Elements: ${JSON.stringify(feature.ui_elements || {})}
Workflow Steps: ${JSON.stringify(feature.workflow_steps || {})}

Create an engaging, educational script that guides users through this feature.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", aiResponse.status);
      return new Response(
        JSON.stringify({ error: "Failed to generate script" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let script = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        script = JSON.parse(jsonMatch[0]);
      }
    } catch {
      script = { raw: content };
    }

    return new Response(
      JSON.stringify({ 
        feature: {
          feature_code: feature.feature_code,
          feature_name: feature.feature_name,
          module_name: (feature.application_modules as any)?.module_name,
        },
        script 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-voiceover-script:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
