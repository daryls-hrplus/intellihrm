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
    const { releaseId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch features with their last updated timestamps
    const { data: features, error: featuresError } = await supabase
      .from("application_features")
      .select(`
        feature_code,
        feature_name,
        description,
        ui_elements,
        workflow_steps,
        updated_at,
        application_modules!inner(module_code, module_name)
      `)
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (featuresError) {
      console.error("Error fetching features:", featuresError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch features" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch existing content status
    const { data: contentStatus } = await supabase
      .from("enablement_content_status")
      .select("feature_code, updated_at, workflow_status");

    // Build content update map
    const contentUpdateMap: Record<string, { updated_at: string; status: string }> = {};
    contentStatus?.forEach(cs => {
      contentUpdateMap[cs.feature_code] = {
        updated_at: cs.updated_at,
        status: cs.workflow_status,
      };
    });

    // Detect changes - features updated after their content was last updated
    const changedFeatures = features?.filter(f => {
      const content = contentUpdateMap[f.feature_code];
      if (!content) return true; // No content exists - needs documentation
      
      const featureUpdated = new Date(f.updated_at);
      const contentUpdated = new Date(content.updated_at);
      
      return featureUpdated > contentUpdated;
    }) || [];

    // Use AI to analyze changes and suggest documentation updates
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY || changedFeatures.length === 0) {
      return new Response(
        JSON.stringify({ 
          changedFeatures: changedFeatures.map(f => ({
            feature_code: f.feature_code,
            feature_name: f.feature_name,
            module_code: (f.application_modules as any)?.module_code,
            module_name: (f.application_modules as any)?.module_name,
            updated_at: f.updated_at,
            hasContent: !!contentUpdateMap[f.feature_code],
          })),
          analysis: null 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
            content: `You are a documentation analyst for HRplus Cerebra HRIS. Analyze feature changes and determine what documentation updates are needed.

Output a JSON object with:
- changes: array of {feature_code, change_type: "new_feature"|"ui_change"|"workflow_change"|"enhancement", severity: "major"|"minor"|"cosmetic", suggested_updates: string[], estimated_effort: "low"|"medium"|"high"}
- summary: overview of changes detected
- priority_order: feature_codes ordered by documentation priority`
          },
          {
            role: "user",
            content: `Analyze these changed features and determine documentation needs:\n${JSON.stringify(changedFeatures.slice(0, 15).map(f => ({
              feature_code: f.feature_code,
              feature_name: f.feature_name,
              description: f.description,
              module: (f.application_modules as any)?.module_name,
              ui_elements: f.ui_elements,
              workflow_steps: f.workflow_steps,
            })), null, 2)}`
          }
        ],
      }),
    });

    let analysis = null;
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch {
        analysis = { summary: content };
      }
    }

    // If releaseId provided, create feature change records
    if (releaseId && analysis?.changes) {
      for (const change of analysis.changes.slice(0, 10)) {
        const matchedFeature = changedFeatures.find(f => f.feature_code === change.feature_code);
        const moduleCode = matchedFeature?.application_modules ? (matchedFeature.application_modules as any).module_code : "unknown";
        await supabase.from("enablement_feature_changes").upsert({
          feature_code: change.feature_code,
          module_code: moduleCode,
          release_id: releaseId,
          change_type: change.change_type,
          change_description: change.suggested_updates?.join("; ") || null,
          change_severity: change.severity,
          requires_content_update: true,
        }, { onConflict: "feature_code,release_id" });
      }
    }

    return new Response(
      JSON.stringify({ 
        changedFeatures: changedFeatures.map(f => ({
          feature_code: f.feature_code,
          feature_name: f.feature_name,
          module_code: (f.application_modules as any)?.module_code,
          module_name: (f.application_modules as any)?.module_name,
          updated_at: f.updated_at,
          hasContent: !!contentUpdateMap[f.feature_code],
        })),
        analysis 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in detect-feature-changes:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
