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
    const { content, contentType, featureCode } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get feature context if provided
    let featureContext = null;
    if (featureCode) {
      const { data: feature } = await supabase
        .from("application_features")
        .select("feature_code, feature_name, description")
        .eq("feature_code", featureCode)
        .single();
      featureContext = feature;
    }

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
            content: `You are a documentation quality analyst for HRplus Cerebra HRIS. Evaluate content effectiveness and provide actionable improvements.

Scoring criteria (each 1-10):
1. Clarity: Is it easy to understand?
2. Completeness: Does it cover all necessary information?
3. Accuracy: Is it technically correct?
4. Structure: Is it well-organized?
5. Actionability: Can users apply what they learn?
6. Accessibility: Is it accessible to all skill levels?
7. Searchability: Will users find it when they need it?
8. Visual Appeal: Is it visually engaging (for visual content)?

Output a JSON object:
{
  "overallScore": number (1-100),
  "scores": {
    "clarity": number,
    "completeness": number,
    "accuracy": number,
    "structure": number,
    "actionability": number,
    "accessibility": number,
    "searchability": number,
    "visualAppeal": number
  },
  "strengths": ["list of strengths"],
  "improvements": [
    {
      "area": "area name",
      "issue": "what's wrong",
      "suggestion": "how to fix it",
      "priority": "high"|"medium"|"low"
    }
  ],
  "rewrittenSections": [
    {
      "original": "problematic text",
      "improved": "suggested improvement",
      "reason": "why this is better"
    }
  ],
  "summary": "Brief quality assessment"
}`
          },
          {
            role: "user",
            content: `Analyze this ${contentType || "documentation"} content for quality and effectiveness:

${featureContext ? `Feature Context:
Name: ${featureContext.feature_name}
Description: ${featureContext.description}

` : ""}Content to analyze:
${content.substring(0, 5000)}${content.length > 5000 ? "\n\n[Content truncated...]" : ""}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", aiResponse.status);
      return new Response(
        JSON.stringify({ error: "Failed to analyze content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const responseContent = aiData.choices?.[0]?.message?.content || "";
    
    let analysis = null;
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch {
      analysis = { raw: responseContent };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in score-content-effectiveness:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
