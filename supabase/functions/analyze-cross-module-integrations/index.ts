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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching modules and features for integration analysis...");

    // Fetch all modules
    const { data: modules, error: modulesError } = await supabase
      .from("application_modules")
      .select("module_code, module_name, description, features")
      .eq("is_active", true);

    if (modulesError) {
      console.error("Error fetching modules:", modulesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch modules" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all features with their modules
    const { data: features, error: featuresError } = await supabase
      .from("application_features")
      .select(`
        feature_code,
        feature_name,
        description,
        workflow_steps,
        application_modules!inner(module_code, module_name)
      `)
      .eq("is_active", true);

    if (featuresError) {
      console.error("Error fetching features:", featuresError);
    }

    // Analyze existing cross-module references
    const crossModuleDependencies: Array<{source: string; target: string; type: string}> = [];

    // Check for workflow integrations
    features?.forEach((f: any) => {
      const workflowSteps = f.workflow_steps;
      if (workflowSteps && Array.isArray(workflowSteps)) {
        workflowSteps.forEach((step: any) => {
          if (step.linkedModule && step.linkedModule !== f.application_modules?.module_code) {
            crossModuleDependencies.push({
              source: f.application_modules?.module_code || "unknown",
              target: step.linkedModule,
              type: "workflow",
            });
          }
        });
      }
    });

    // Use AI to analyze and suggest integrations
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          crossModuleDependencies,
          error: "AI analysis unavailable - no API key configured"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const modulesSummary = modules?.map(m => ({
      code: m.module_code,
      name: m.module_name,
      description: m.description,
    }));

    const featuresSummary = features?.slice(0, 50).map((f: any) => ({
      code: f.feature_code,
      name: f.feature_name,
      module: f.application_modules?.module_code,
      description: f.description,
    }));

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
            content: `You are an enterprise HRIS integration architect for HRplus Cerebra. Analyze the modules and features to identify valuable cross-module integrations that would enhance user experience and data flow.

Focus on:
1. Data sharing opportunities (e.g., employee data → payroll, performance → succession)
2. Workflow integrations (e.g., recruitment → onboarding, leave → payroll)
3. Analytics consolidation (e.g., multi-module dashboards)
4. User experience improvements (e.g., single entry points, linked actions)

Return a JSON object with:
{
  "suggestions": [
    {
      "source_module": "module_code",
      "target_module": "module_code",
      "integration_type": "data_sharing|workflow|analytics|ux",
      "description": "Brief description of the integration",
      "priority": "critical|high|medium|low",
      "implementation_notes": "Technical guidance"
    }
  ],
  "recommendations": "Overall strategic recommendations for cross-module architecture"
}`
          },
          {
            role: "user",
            content: `Analyze these HRIS modules and features for integration opportunities:

MODULES:
${JSON.stringify(modulesSummary, null, 2)}

SAMPLE FEATURES:
${JSON.stringify(featuresSummary, null, 2)}

EXISTING DEPENDENCIES:
${JSON.stringify(crossModuleDependencies, null, 2)}`
          }
        ],
      }),
    });

    let suggestions: any[] = [];
    let recommendations = "";

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          suggestions = parsed.suggestions || [];
          recommendations = parsed.recommendations || "";
        }
      } catch (e) {
        console.error("Failed to parse AI response:", e);
        recommendations = content;
      }
    }

    console.log(`Generated ${suggestions.length} integration suggestions`);

    return new Response(
      JSON.stringify({ 
        suggestions,
        crossModuleDependencies,
        recommendations,
        moduleCount: modules?.length || 0,
        featureCount: features?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-cross-module-integrations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
