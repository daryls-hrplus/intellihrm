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
    const { moduleCode } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all features
    let featuresQuery = supabase
      .from("application_features")
      .select(`
        feature_code,
        feature_name,
        description,
        module_id,
        application_modules!inner(module_code, module_name)
      `)
      .eq("is_active", true);

    if (moduleCode && moduleCode !== "all") {
      featuresQuery = featuresQuery.eq("application_modules.module_code", moduleCode);
    }

    const { data: features, error: featuresError } = await featuresQuery;

    if (featuresError) {
      console.error("Error fetching features:", featuresError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch features" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch content status for features
    const { data: contentStatus } = await supabase
      .from("enablement_content_status")
      .select("feature_code, documentation_status, scorm_lite_status, rise_course_status, video_status, dap_guide_status");

    // Fetch videos
    const { data: videos } = await supabase
      .from("enablement_videos")
      .select("feature_code")
      .eq("is_active", true);

    // Fetch DAP guides
    const { data: dapGuides } = await supabase
      .from("enablement_dap_guides")
      .select("feature_code")
      .eq("is_active", true);

    // Build content coverage map
    const contentMap: Record<string, {
      documentation: boolean;
      scorm: boolean;
      rise: boolean;
      video: boolean;
      dap: boolean;
    }> = {};

    contentStatus?.forEach(cs => {
      contentMap[cs.feature_code] = {
        documentation: cs.documentation_status === "complete",
        scorm: cs.scorm_lite_status === "complete",
        rise: cs.rise_course_status === "complete",
        video: cs.video_status === "complete",
        dap: cs.dap_guide_status === "complete",
      };
    });

    videos?.forEach(v => {
      if (contentMap[v.feature_code]) {
        contentMap[v.feature_code].video = true;
      }
    });

    dapGuides?.forEach(d => {
      if (contentMap[d.feature_code]) {
        contentMap[d.feature_code].dap = true;
      }
    });

    // Analyze gaps
    const gaps = features?.map(f => {
      const coverage = contentMap[f.feature_code] || {
        documentation: false,
        scorm: false,
        rise: false,
        video: false,
        dap: false,
      };

      const coverageScore = [
        coverage.documentation,
        coverage.scorm,
        coverage.rise,
        coverage.video,
        coverage.dap,
      ].filter(Boolean).length / 5 * 100;

      return {
        feature_code: f.feature_code,
        feature_name: f.feature_name,
        description: f.description,
        module_code: (f.application_modules as any)?.module_code,
        module_name: (f.application_modules as any)?.module_name,
        coverage,
        coverageScore,
        missingContent: Object.entries(coverage)
          .filter(([_, v]) => !v)
          .map(([k]) => k),
      };
    }) || [];

    // Use AI to prioritize and provide recommendations
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ gaps, recommendations: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lowCoverageFeatures = gaps.filter(g => g.coverageScore < 60).slice(0, 20);

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
            content: `You are an enablement content strategist for HRplus Cerebra HRIS. Analyze content gaps and provide prioritized recommendations.
            
Output a JSON object with:
- priorities: array of {feature_code, priority: "critical"|"high"|"medium"|"low", reason: string, recommended_content_types: string[]}
- quick_wins: features that can be documented quickly
- high_impact: features that users need most
- summary: brief overview of the content gap situation`
          },
          {
            role: "user",
            content: `Analyze these features with low content coverage and prioritize them:\n${JSON.stringify(lowCoverageFeatures, null, 2)}`
          }
        ],
      }),
    });

    let recommendations = null;
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        }
      } catch {
        recommendations = { summary: content };
      }
    }

    return new Response(
      JSON.stringify({ gaps, recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-content-gaps:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
