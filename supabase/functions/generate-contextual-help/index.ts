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
    const { featureCode, generateFor } = await req.json();

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
        role_requirements,
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

    const types = generateFor || ["tooltip", "walkthrough", "help_text", "error_messages"];

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
            content: `You are a UX writer for HRplus Cerebra HRIS. Generate clear, helpful, and concise contextual help content.

Guidelines:
- Tooltips: Max 100 characters, action-oriented
- Walkthroughs: Step-by-step, numbered, max 5 steps per screen
- Help text: Explain the "why" and "how", max 200 characters
- Error messages: Helpful, specific, provide resolution steps

Output a JSON object with the requested content types.`
          },
          {
            role: "user",
            content: `Generate contextual help content for this feature:

Feature: ${feature.feature_name}
Module: ${(feature.application_modules as any)?.module_name}
Description: ${feature.description || "N/A"}
UI Elements: ${JSON.stringify(feature.ui_elements || {})}
Workflow Steps: ${JSON.stringify(feature.workflow_steps || {})}
Roles: ${(feature.role_requirements || []).join(", ") || "All users"}

Generate these content types: ${types.join(", ")}

Return JSON with structure:
{
  "tooltip": {"field_name": "tooltip text", ...},
  "walkthrough": [{"step": 1, "element": "element_id", "title": "...", "content": "..."}],
  "help_text": {"section_name": "help text", ...},
  "error_messages": {"error_type": {"title": "...", "message": "...", "resolution": "..."}, ...}
}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate help content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let helpContent = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        helpContent = JSON.parse(jsonMatch[0]);
      }
    } catch {
      helpContent = { raw: content };
    }

    return new Response(
      JSON.stringify({ 
        feature: {
          feature_code: feature.feature_code,
          feature_name: feature.feature_name,
          module_name: (feature.application_modules as any)?.module_name,
        },
        helpContent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-contextual-help:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
