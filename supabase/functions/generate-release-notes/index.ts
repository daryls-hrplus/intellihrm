import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeatureChange {
  feature_code: string;
  module_code: string;
  change_type: string;
  change_description: string | null;
  change_severity: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { releaseId, releaseName, versionNumber } = await req.json();

    if (!releaseId) {
      return new Response(
        JSON.stringify({ error: "Release ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch feature changes for this release
    const { data: featureChanges, error: changesError } = await supabase
      .from("enablement_feature_changes")
      .select("feature_code, module_code, change_type, change_description, change_severity")
      .eq("release_id", releaseId);

    if (changesError) {
      console.error("Error fetching feature changes:", changesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch feature changes" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch application features for additional context
    const featureCodes = featureChanges?.map(fc => fc.feature_code) || [];
    const { data: appFeatures } = await supabase
      .from("application_features")
      .select("feature_code, feature_name, description")
      .in("feature_code", featureCodes);

    // Create feature name lookup
    const featureNameLookup: Record<string, { name: string; description: string }> = {};
    appFeatures?.forEach(f => {
      featureNameLookup[f.feature_code] = { 
        name: f.feature_name, 
        description: f.description || "" 
      };
    });

    // Fetch module names for context
    const moduleCodes = [...new Set(featureChanges?.map(fc => fc.module_code) || [])];
    const { data: appModules } = await supabase
      .from("application_modules")
      .select("module_code, module_name")
      .in("module_code", moduleCodes);

    const moduleNameLookup: Record<string, string> = {};
    appModules?.forEach(m => {
      moduleNameLookup[m.module_code] = m.module_name;
    });

    // Prepare context for AI
    const changesContext = featureChanges?.map(fc => ({
      feature: featureNameLookup[fc.feature_code]?.name || fc.feature_code,
      featureDescription: featureNameLookup[fc.feature_code]?.description || "",
      module: moduleNameLookup[fc.module_code] || fc.module_code,
      changeType: fc.change_type,
      description: fc.change_description || "",
      severity: fc.change_severity,
    })) || [];

    // Generate release notes using AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a technical writer for HRplus Cerebra, an enterprise HRIS system. 
Your task is to generate professional, user-friendly release notes from feature change data.

Guidelines:
- Write in a professional but approachable tone
- Focus on user benefits, not technical implementation details
- Group changes by module for better readability
- Use clear headings and bullet points
- Highlight major changes prominently
- Include a brief executive summary at the top
- Use emojis sparingly for visual appeal (✨ for new features, 🔧 for improvements, ⚠️ for breaking changes)
- Format output in Markdown`;

    const userPrompt = `Generate release notes for HRplus Cerebra version ${versionNumber}${releaseName ? ` (${releaseName})` : ""}.

Feature Changes Data:
${JSON.stringify(changesContext, null, 2)}

${changesContext.length === 0 ? 
  "No feature changes have been logged yet for this release. Generate a placeholder release notes template that can be filled in later." : 
  "Generate comprehensive release notes based on the above changes."}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate release notes" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedNotes = aiData.choices?.[0]?.message?.content || "";

    // Update the release with the generated notes
    const { error: updateError } = await supabase
      .from("enablement_releases")
      .update({ 
        release_notes: generatedNotes,
        updated_at: new Date().toISOString()
      })
      .eq("id", releaseId);

    if (updateError) {
      console.error("Error updating release notes:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save release notes" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        releaseNotes: generatedNotes,
        featureCount: changesContext.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-release-notes:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
