import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentationAgentRequest {
  action:
    | 'analyze_schema'
    | 'inspect_features'
    | 'generate_manual_section'
    | 'generate_kb_article'
    | 'generate_quickstart'
    | 'assess_coverage'
    | 'sync_release'
    | 'bulk_generate';
  context?: {
    moduleCode?: string;
    featureCode?: string;
    manualId?: string;
    sectionTitle?: string;
    targetAudience?: string[];
    releaseId?: string;
  };
}

interface FeatureWithModule {
  id: string;
  feature_code: string;
  feature_name: string;
  description: string | null;
  module_id: string;
  application_modules: {
    module_code: string;
    module_name: string;
    description: string | null;
  };
}

interface ContentStatus {
  feature_code: string;
  module_code: string;
  workflow_status: string;
  documentation_status: string;
  scorm_lite_status: string;
  rise_course_status: string;
  video_status: string;
  dap_guide_status: string;
}

interface CoverageAnalysis {
  totalFeatures: number;
  documented: number;
  undocumented: number;
  coveragePercentage: number;
  gapsByModule: Record<string, { total: number; gaps: number; features: string[] }>;
  priorityFeatures: { feature_code: string; feature_name: string; module_code: string }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, context = {} }: DocumentationAgentRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case 'analyze_schema': {
        // Fetch all features with module info
        let query = supabase
          .from("application_features")
          .select(`
            id,
            feature_code,
            feature_name,
            description,
            module_id,
            application_modules!inner(module_code, module_name, description)
          `)
          .eq("is_active", true);

        if (context.moduleCode) {
          query = query.eq("application_modules.module_code", context.moduleCode);
        }

        const { data: features, error: featuresError } = await query;
        if (featuresError) throw featuresError;

        // Fetch content status
        const { data: contentStatus } = await supabase
          .from("enablement_content_status")
          .select("feature_code, module_code, workflow_status, documentation_status");

        // Calculate coverage
        const documentedCodes = new Set(
          (contentStatus || [])
            .filter(c => c.documentation_status === "complete" || c.workflow_status === "published")
            .map(c => c.feature_code)
        );

        const allFeatures = features as unknown as FeatureWithModule[];
        const undocumented = allFeatures.filter(f => !documentedCodes.has(f.feature_code));

        // Group by module
        const gapsByModule: Record<string, { total: number; gaps: number; features: string[] }> = {};
        for (const feature of allFeatures) {
          const modCode = feature.application_modules?.module_code || 'unknown';
          if (!gapsByModule[modCode]) {
            gapsByModule[modCode] = { total: 0, gaps: 0, features: [] };
          }
          gapsByModule[modCode].total++;
          if (!documentedCodes.has(feature.feature_code)) {
            gapsByModule[modCode].gaps++;
            gapsByModule[modCode].features.push(feature.feature_code);
          }
        }

        const analysis: CoverageAnalysis = {
          totalFeatures: allFeatures.length,
          documented: allFeatures.length - undocumented.length,
          undocumented: undocumented.length,
          coveragePercentage: allFeatures.length > 0 
            ? Math.round(((allFeatures.length - undocumented.length) / allFeatures.length) * 100) 
            : 0,
          gapsByModule,
          priorityFeatures: undocumented.slice(0, 20).map(f => ({
            feature_code: f.feature_code,
            feature_name: f.feature_name,
            module_code: f.application_modules?.module_code || 'unknown',
          })),
        };

        return new Response(
          JSON.stringify({ success: true, analysis }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'inspect_features': {
        // Get features from database that match the registry patterns
        const { data: features } = await supabase
          .from("application_features")
          .select(`
            id, feature_code, feature_name, description,
            route_path, workflow_steps, ui_elements,
            application_modules!inner(module_code, module_name)
          `)
          .eq("is_active", true)
          .order("module_id")
          .order("display_order");

        // Get enablement content status for coverage check
        const { data: contentStatus } = await supabase
          .from("enablement_content_status")
          .select("feature_code, documentation_status, workflow_status");

        const statusMap = new Map(
          (contentStatus || []).map(c => [c.feature_code, c])
        );

        const featuresWithStatus = (features || []).map(f => ({
          ...f,
          hasDocumentation: statusMap.has(f.feature_code),
          documentationStatus: statusMap.get(f.feature_code)?.documentation_status || 'not_started',
          workflowStatus: statusMap.get(f.feature_code)?.workflow_status || 'backlog',
        }));

        return new Response(
          JSON.stringify({ success: true, features: featuresWithStatus }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'generate_manual_section': {
        if (!context.featureCode || !context.sectionTitle) {
          return new Response(
            JSON.stringify({ error: "featureCode and sectionTitle are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get feature details
        const { data: feature } = await supabase
          .from("application_features")
          .select(`
            *,
            application_modules!inner(module_code, module_name, description)
          `)
          .eq("feature_code", context.featureCode)
          .single();

        if (!feature) {
          return new Response(
            JSON.stringify({ error: "Feature not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate content with AI
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
          return new Response(
            JSON.stringify({ error: "AI configuration missing" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const systemPrompt = `You are a technical documentation expert for HRplus Cerebra HRIS. Generate comprehensive, professional administrator documentation for HR software features.

Output should be well-structured markdown with:
- Clear headings and subheadings
- Step-by-step procedures where applicable
- Best practices and tips
- Configuration options explained
- Cross-references to related features

Target audience: ${(context.targetAudience || ['HR Administrators']).join(', ')}
Writing style: Professional, clear, action-oriented`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Generate documentation section titled "${context.sectionTitle}" for the following feature:

Feature: ${feature.feature_name}
Code: ${feature.feature_code}
Module: ${(feature.application_modules as any)?.module_name || 'Unknown'}
Description: ${feature.description || 'No description available'}
Route: ${feature.route_path || 'N/A'}
Workflow Steps: ${JSON.stringify(feature.workflow_steps || {})}
UI Elements: ${JSON.stringify(feature.ui_elements || {})}

Generate comprehensive documentation including:
1. Overview of the feature
2. Prerequisites and permissions
3. Step-by-step configuration guide
4. Common use cases
5. Troubleshooting tips
6. Related features and integrations`,
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error("AI API error:", errorText);
          return new Response(
            JSON.stringify({ error: "AI generation failed" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const aiData = await aiResponse.json();
        const generatedContent = aiData.choices?.[0]?.message?.content || "";

        return new Response(
          JSON.stringify({ 
            success: true, 
            content: generatedContent,
            feature: {
              feature_code: feature.feature_code,
              feature_name: feature.feature_name,
              module_code: (feature.application_modules as any)?.module_code,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'generate_kb_article': {
        if (!context.featureCode) {
          return new Response(
            JSON.stringify({ error: "featureCode is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get feature details
        const { data: feature } = await supabase
          .from("application_features")
          .select(`
            *,
            application_modules!inner(module_code, module_name, description)
          `)
          .eq("feature_code", context.featureCode)
          .single();

        if (!feature) {
          return new Response(
            JSON.stringify({ error: "Feature not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
          return new Response(
            JSON.stringify({ error: "AI configuration missing" }),
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
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a knowledge base article writer for HRplus Cerebra HRIS. Create concise, helpful articles for end-users.

Output JSON with:
{
  "title": "Clear article title",
  "summary": "2-3 sentence summary",
  "content": "Full markdown article content",
  "keywords": ["keyword1", "keyword2"],
  "category": "suggested category"
}`
              },
              {
                role: "user",
                content: `Create a KB article for:
Feature: ${feature.feature_name}
Module: ${(feature.application_modules as any)?.module_name}
Description: ${feature.description || 'No description'}

The article should help users understand how to use this feature effectively.`,
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          return new Response(
            JSON.stringify({ error: "AI generation failed" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || "";
        
        // Parse JSON from response
        let articleData;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            articleData = JSON.parse(jsonMatch[0]);
          }
        } catch {
          articleData = { title: feature.feature_name, content, summary: "", keywords: [] };
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            article: articleData,
            feature_code: feature.feature_code,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'assess_coverage': {
        // Comprehensive coverage assessment
        const { data: features } = await supabase
          .from("application_features")
          .select("id, feature_code, feature_name, module_id, application_modules!inner(module_code, module_name)")
          .eq("is_active", true);

        const { data: contentStatus } = await supabase
          .from("enablement_content_status")
          .select("*");

        const { data: kbArticles } = await supabase
          .from("kb_articles")
          .select("id, title, status, source_manual_id");

        const { data: quickstarts } = await supabase
          .from("enablement_quickstart_templates")
          .select("id, module_code, status");

        const statusMap = new Map(
          (contentStatus || []).map(c => [c.feature_code, c])
        );

        const totalFeatures = features?.length || 0;
        const documented = (contentStatus || []).filter(c => 
          c.documentation_status === "complete" || c.workflow_status === "published"
        ).length;

        const publishedArticles = (kbArticles || []).filter(a => a.status === "published").length;
        const publishedQuickstarts = (quickstarts || []).filter(q => q.status === "published").length;

        // Group features by module for breakdown
        const moduleBreakdown: Record<string, {
          total: number;
          documented: number;
          percentage: number;
        }> = {};

        for (const feature of features || []) {
          const modCode = (feature.application_modules as any)?.module_code || 'unknown';
          if (!moduleBreakdown[modCode]) {
            moduleBreakdown[modCode] = { total: 0, documented: 0, percentage: 0 };
          }
          moduleBreakdown[modCode].total++;
          if (statusMap.has(feature.feature_code)) {
            const status = statusMap.get(feature.feature_code);
            if (status?.documentation_status === "complete" || status?.workflow_status === "published") {
              moduleBreakdown[modCode].documented++;
            }
          }
        }

        // Calculate percentages
        for (const mod in moduleBreakdown) {
          const m = moduleBreakdown[mod];
          m.percentage = m.total > 0 ? Math.round((m.documented / m.total) * 100) : 0;
        }

        const overallCoverage = totalFeatures > 0 
          ? Math.round((documented / totalFeatures) * 100) 
          : 0;

        // Calculate readiness score (weighted)
        const readinessScore = Math.round(
          (overallCoverage * 0.5) + 
          (Math.min(publishedArticles / 50, 1) * 25) +
          (Math.min(publishedQuickstarts / 10, 1) * 25)
        );

        return new Response(
          JSON.stringify({
            success: true,
            coverage: {
              totalFeatures,
              documented,
              overallCoverage,
              publishedArticles,
              publishedQuickstarts,
              moduleBreakdown,
              readinessScore,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'sync_release': {
        if (!context.releaseId) {
          return new Response(
            JSON.stringify({ error: "releaseId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get coverage assessment
        const { data: contentStatus } = await supabase
          .from("enablement_content_status")
          .select("*")
          .eq("release_id", context.releaseId);

        const totalItems = contentStatus?.length || 0;
        const completed = (contentStatus || []).filter(c => 
          c.workflow_status === "published" || c.documentation_status === "complete"
        ).length;

        const completionRate = totalItems > 0 
          ? Math.round((completed / totalItems) * 100) 
          : 0;

        // Update release lifecycle with readiness score
        const { error: updateError } = await supabase
          .from("enablement_release_lifecycle")
          .update({
            last_readiness_score: completionRate,
            last_assessment_at: new Date().toISOString(),
          })
          .eq("id", context.releaseId);

        if (updateError) {
          console.error("Error updating lifecycle:", updateError);
        }

        return new Response(
          JSON.stringify({
            success: true,
            syncResult: {
              releaseId: context.releaseId,
              totalItems,
              completed,
              completionRate,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'bulk_generate': {
        // Get undocumented features for bulk generation
        const { data: features } = await supabase
          .from("application_features")
          .select(`
            feature_code, feature_name,
            application_modules!inner(module_code, module_name)
          `)
          .eq("is_active", true);

        const { data: contentStatus } = await supabase
          .from("enablement_content_status")
          .select("feature_code");

        const documentedCodes = new Set(
          (contentStatus || []).map(c => c.feature_code)
        );

        const undocumented = (features || [])
          .filter(f => !documentedCodes.has(f.feature_code))
          .slice(0, context.moduleCode ? 50 : 20); // Limit batch size

        return new Response(
          JSON.stringify({
            success: true,
            candidates: undocumented.map(f => ({
              feature_code: f.feature_code,
              feature_name: f.feature_name,
              module_code: (f.application_modules as any)?.module_code,
              module_name: (f.application_modules as any)?.module_name,
            })),
            totalUndocumented: (features || []).length - documentedCodes.size,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Documentation Agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
