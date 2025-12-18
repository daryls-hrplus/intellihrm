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
    const { moduleCode, releaseId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all active features, optionally filtered by module
    let query = supabase
      .from("application_features")
      .select(`
        feature_code,
        feature_name,
        description,
        route_path,
        workflow_steps,
        ui_elements,
        application_modules!inner (
          module_code,
          module_name
        )
      `)
      .eq("is_active", true);

    if (moduleCode && moduleCode !== "all") {
      query = query.eq("application_modules.module_code", moduleCode);
    }

    const { data: features, error: featuresError } = await query;

    if (featuresError) {
      console.error("Error fetching features:", featuresError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch features" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!features || features.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No features found to document",
          generatedCount: 0,
          documents: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedDocs: any[] = [];
    const batchSize = 5;

    // Process features in batches
    for (let i = 0; i < features.length; i += batchSize) {
      const batch = features.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (feature) => {
        const moduleInfo = feature.application_modules as any;
        
        const systemPrompt = `You are a technical documentation writer for HRplus Cerebra HRIS system.
Generate comprehensive feature documentation following industry best practices.

Guidelines:
- Write clear, user-focused documentation
- Include step-by-step instructions where applicable
- Use proper headings and structure
- Include tips and best practices
- Note any prerequisites or permissions required
- Format output in Markdown`;

        const userPrompt = `Generate documentation for this feature:

Feature: ${feature.feature_name}
Code: ${feature.feature_code}
Module: ${moduleInfo?.module_name || 'Unknown'}
Description: ${feature.description || 'No description available'}
Route: ${feature.route_path || 'N/A'}
${feature.workflow_steps ? `Workflow Steps: ${JSON.stringify(feature.workflow_steps)}` : ''}
${feature.ui_elements ? `UI Elements: ${JSON.stringify(feature.ui_elements)}` : ''}

Generate complete documentation including:
1. Overview
2. Prerequisites/Permissions
3. Step-by-Step Instructions
4. Tips & Best Practices
5. Related Features`;

        try {
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
            console.error(`AI error for ${feature.feature_code}:`, await aiResponse.text());
            return null;
          }

          const aiData = await aiResponse.json();
          const documentation = aiData.choices?.[0]?.message?.content || "";

          return {
            featureCode: feature.feature_code,
            featureName: feature.feature_name,
            moduleCode: moduleInfo?.module_code,
            moduleName: moduleInfo?.module_name,
            documentation,
            generatedAt: new Date().toISOString(),
          };
        } catch (err) {
          console.error(`Error generating doc for ${feature.feature_code}:`, err);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      generatedDocs.push(...batchResults.filter(Boolean));
    }

    // Optionally save to enablement_content_status if releaseId provided
    if (releaseId && generatedDocs.length > 0) {
      for (const doc of generatedDocs) {
        await supabase
          .from("enablement_content_status")
          .upsert({
            release_id: releaseId,
            feature_code: doc.featureCode,
            module_code: doc.moduleCode,
            content_type: "documentation",
            status: "in_progress",
            notes: `Auto-generated documentation on ${new Date().toLocaleDateString()}`,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "release_id,feature_code,content_type",
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generatedCount: generatedDocs.length,
        totalFeatures: features.length,
        documents: generatedDocs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-all-feature-docs:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
