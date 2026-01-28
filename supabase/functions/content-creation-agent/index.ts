import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Agent action types
type AgentAction =
  | 'analyze_context'
  | 'generate_manual_section'
  | 'generate_kb_article'
  | 'generate_quickstart'
  | 'generate_sop'
  | 'generate_training'
  | 'identify_gaps'
  | 'suggest_improvements'
  | 'suggest_next_actions'
  | 'batch_generate'
  | 'preview_section_regeneration'
  | 'validate_documentation'
  | 'chat';

type Persona = 'ess' | 'mss' | 'hr' | 'admin' | 'all';

interface AgentRequest {
  action: AgentAction;
  context?: {
    moduleCode?: string;
    featureCode?: string;
    sectionTitle?: string;
    sectionNumber?: string;
    sectionId?: string;
    customInstructions?: string;
    targetPersona?: Persona;
    targetAudience?: string[];
    contentType?: string;
    checklistType?: 'implementation' | 'testing' | 'go-live';
    batchCandidates?: string[];
    chatMessage?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  };
}

interface ContextAnalysis {
  totalFeatures: number;
  documented: number;
  undocumented: number;
  coveragePercentage: number;
  moduleBreakdown: Record<string, {
    moduleName: string;
    total: number;
    documented: number;
    gaps: number;
    percentage: number;
    priorityFeatures: string[];
  }>;
  readinessScore: number;
  recommendations: string[];
  staleContent: Array<{ feature_code: string; lastUpdated: string; daysSinceUpdate: number }>;
}

// System prompt for the documentation agent
const AGENT_SYSTEM_PROMPT = `You are the Content Creation Agent for Intelli HRM, an enterprise-grade HRMS platform serving the Caribbean, Africa, and global markets.

Your role is to generate high-quality documentation following these standards:

## Output Formats

### Manual Section Format
Generate JSX-ready markdown with:
- Section header with Badge (Section X.Y) and reading time estimate
- Executive Summary box (for overview sections)
- Business Value statement
- Target Audience matrix (for Part 1 sections)
- Step-by-step procedures with numbered lists
- Configuration tables where applicable
- Best practices callouts using Tips/Warnings
- Learning Objectives at section end
- Document Conventions (Implemented, Recommended, Planned badges)
- Cross-references to related features

### KB Article Format
Generate JSON structure:
{
  "title": "How to [Action] in [Feature]",
  "summary": "2-3 sentence overview for the article card",
  "persona": "ESS|MSS|HR|Admin",
  "content": "Full markdown article with headings, steps, tips",
  "steps": [{ "step": 1, "action": "...", "tip": "..." }],
  "faqs": [{ "question": "...", "answer": "..." }],
  "keywords": ["keyword1", "keyword2"],
  "related": ["feature_code_1", "feature_code_2"]
}

### Quick Start Format
Generate JSON structure for module rapid setup:
{
  "roles": [{ "role": "...", "title": "...", "icon": "...", "responsibility": "..." }],
  "prerequisites": [{ "id": "...", "title": "...", "required": true, "description": "..." }],
  "pitfalls": [{ "issue": "...", "prevention": "...", "severity": "high|medium|low" }],
  "setupSteps": [{ "id": "...", "title": "...", "estimatedTime": "...", "substeps": [...] }],
  "successMetrics": [{ "metric": "...", "target": "...", "howToMeasure": "..." }]
}

### SOP Format
Generate structured procedure document:
{
  "title": "Standard Operating Procedure: [Process Name]",
  "purpose": "Why this SOP exists",
  "scope": "Who and what this applies to",
  "definitions": [{ "term": "...", "definition": "..." }],
  "responsibilities": [{ "role": "...", "duties": ["..."] }],
  "procedure": [{ "step": 1, "action": "...", "details": "...", "screenshotMarker": "..." }],
  "qualityChecks": ["..."],
  "exceptions": ["..."],
  "revision_history": [{ "version": "1.0", "date": "...", "changes": "Initial release" }]
}

## Quality Standards
- Readability: Target Flesch-Kincaid Grade 8-10
- Completeness: Cover all UI elements and workflows mentioned in feature data
- Accuracy: Reference actual database fields and UI components from context
- Actionability: Every section must have clear next steps
- Consistency: Use "Intelli HRM" brand, never competitors or "HRplus"

## Persona Targeting
- ESS (Employee Self-Service): Simple language, focus on personal tasks
- MSS (Manager Self-Service): Team-focused, approval workflows, analytics
- HR Partner: Policy administration, compliance, employee support
- Admin: Technical configuration, security, system setup

## Feature Status Badges
Use these status indicators:
- Implemented: Feature exists in current system
- Recommended: Best practice or target state
- Planned: Roadmap feature not yet available`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, context = {} }: AgentRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Helper function to call AI
    const callAI = async (systemPrompt: string, userPrompt: string, useTools = false) => {
      if (!LOVABLE_API_KEY) {
        throw new Error("AI configuration missing");
      }

      const body: Record<string, unknown> = {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      };

      if (useTools) {
        body.tools = [
          {
            type: "function",
            function: {
              name: "return_structured_content",
              description: "Return structured documentation content",
              parameters: {
                type: "object",
                properties: {
                  content: { type: "string", description: "The generated content" },
                  metadata: {
                    type: "object",
                    properties: {
                      readingTime: { type: "number" },
                      qualityScore: { type: "number" },
                      completeness: { type: "number" },
                    },
                  },
                },
                required: ["content"],
              },
            },
          },
        ];
        body.tool_choice = { type: "function", function: { name: "return_structured_content" } };
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add funds to continue.");
        }
        const errorText = await response.text();
        console.error("AI API error:", response.status, errorText);
        throw new Error("AI generation failed");
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    };

    // Helper to fetch feature context
    const getFeatureContext = async (featureCode: string) => {
      const { data: feature } = await supabase
        .from("application_features")
        .select(`
          *,
          application_modules!inner(module_code, module_name, description)
        `)
        .eq("feature_code", featureCode)
        .single();

      if (!feature) return null;

      // Get existing documentation
      const { data: artifacts } = await supabase
        .from("enablement_artifacts")
        .select("artifact_id, title, artifact_type, status")
        .eq("feature_code", featureCode)
        .limit(5);

      // Get content status
      const { data: contentStatus } = await supabase
        .from("enablement_content_status")
        .select("*")
        .eq("feature_code", featureCode)
        .single();

      return {
        ...feature,
        existingArtifacts: artifacts || [],
        contentStatus,
      };
    };

    // Helper to get module context
    const getModuleContext = async (moduleCode: string) => {
      const { data: module } = await supabase
        .from("application_modules")
        .select("*")
        .eq("module_code", moduleCode)
        .single();

      const { data: features } = await supabase
        .from("application_features")
        .select("feature_code, feature_name, description, route_path")
        .eq("module_id", module?.id)
        .eq("is_active", true);

      return {
        ...module,
        features: features || [],
        featureCount: features?.length || 0,
      };
    };

    switch (action) {
      // ==================== ANALYZE CONTEXT ====================
      case 'analyze_context': {
        // Fetch all features with module info
        let featuresQuery = supabase
          .from("application_features")
          .select(`
            id, feature_code, feature_name, description, route_path,
            application_modules!inner(module_code, module_name)
          `)
          .eq("is_active", true);

        if (context.moduleCode) {
          featuresQuery = featuresQuery.eq("application_modules.module_code", context.moduleCode);
        }

        const { data: features, error: featuresError } = await featuresQuery;
        if (featuresError) throw featuresError;

        // Fetch content status
        const { data: contentStatus } = await supabase
          .from("enablement_content_status")
          .select("feature_code, module_code, documentation_status, workflow_status, updated_at");

        // Fetch existing artifacts
        const { data: artifacts } = await supabase
          .from("enablement_artifacts")
          .select("feature_code, artifact_type, status, updated_at");

        // OPTION A: Fetch manual sections to include in coverage calculation
        const { data: manualSections } = await supabase
          .from("manual_sections")
          .select("id, source_module_codes")
          .not("source_module_codes", "is", null);

        // Build a set of module codes that have manual sections
        const modulesWithManualSections = new Set<string>();
        for (const section of manualSections || []) {
          const codes = (section.source_module_codes as string[]) || [];
          codes.forEach(code => modulesWithManualSections.add(code));
        }

        // Build status maps
        const docStatusMap = new Map(
          (contentStatus || []).map(c => [c.feature_code, c])
        );
        const artifactMap = new Map<string, number>();
        (artifacts || []).forEach(a => {
          if (a.feature_code) {
            artifactMap.set(a.feature_code, (artifactMap.get(a.feature_code) || 0) + 1);
          }
        });

        // Calculate coverage by module
        const moduleBreakdown: ContextAnalysis['moduleBreakdown'] = {};
        const now = new Date();
        const staleContent: ContextAnalysis['staleContent'] = [];

        for (const feature of features || []) {
          const modCode = (feature.application_modules as any)?.module_code || 'unknown';
          const modName = (feature.application_modules as any)?.module_name || 'Unknown';

          if (!moduleBreakdown[modCode]) {
            moduleBreakdown[modCode] = {
              moduleName: modName,
              total: 0,
              documented: 0,
              gaps: 0,
              percentage: 0,
              priorityFeatures: [],
            };
          }

          moduleBreakdown[modCode].total++;

          const status = docStatusMap.get(feature.feature_code);
          const hasArtifacts = artifactMap.has(feature.feature_code);
          // NEW: Also consider if the module has manual sections
          const hasManualContent = modulesWithManualSections.has(modCode);
          const isDocumented = status?.documentation_status === 'complete' ||
            status?.documentation_status === 'in_progress' ||
            status?.workflow_status === 'published' ||
            status?.workflow_status === 'documentation' ||
            hasArtifacts ||
            hasManualContent;

          if (isDocumented) {
            moduleBreakdown[modCode].documented++;

            // Check for stale content (not updated in 90+ days)
            if (status?.updated_at) {
              const updatedAt = new Date(status.updated_at);
              const daysSince = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
              if (daysSince > 90) {
                staleContent.push({
                  feature_code: feature.feature_code,
                  lastUpdated: status.updated_at,
                  daysSinceUpdate: daysSince,
                });
              }
            }
          } else {
            moduleBreakdown[modCode].gaps++;
            if (moduleBreakdown[modCode].priorityFeatures.length < 5) {
              moduleBreakdown[modCode].priorityFeatures.push(feature.feature_code);
            }
          }
        }

        // Calculate percentages
        for (const mod in moduleBreakdown) {
          const m = moduleBreakdown[mod];
          m.percentage = m.total > 0 ? Math.round((m.documented / m.total) * 100) : 0;
        }

        const totalFeatures = features?.length || 0;
        const documented = Object.values(moduleBreakdown).reduce((sum, m) => sum + m.documented, 0);
        const coveragePercentage = totalFeatures > 0 ? Math.round((documented / totalFeatures) * 100) : 0;

        // Generate recommendations
        const recommendations: string[] = [];
        const sortedModules = Object.entries(moduleBreakdown)
          .sort(([, a], [, b]) => a.percentage - b.percentage);

        if (sortedModules.length > 0 && sortedModules[0][1].percentage < 50) {
          recommendations.push(`Focus on ${sortedModules[0][1].moduleName} - only ${sortedModules[0][1].percentage}% documented`);
        }
        if (staleContent.length > 0) {
          recommendations.push(`${staleContent.length} features have stale documentation (90+ days old)`);
        }
        if (coveragePercentage < 70) {
          recommendations.push("Consider bulk generation for undocumented features");
        }

        // Calculate readiness score
        const readinessScore = Math.min(100, Math.round(
          coveragePercentage * 0.6 +
          (staleContent.length === 0 ? 20 : Math.max(0, 20 - staleContent.length * 2)) +
          (recommendations.length <= 1 ? 20 : Math.max(0, 20 - recommendations.length * 5))
        ));

        // Get documentation health summary (orphaned/unmapped check)
        let documentationHealth = {
          orphanedReferences: 0,
          unmappedSections: 0,
          healthStatus: 'healthy' as 'healthy' | 'warning' | 'critical'
        };

        try {
          // Quick orphan check
          const { data: manualSections } = await supabase
            .from("manual_sections")
            .select("source_feature_codes")
            .not("source_feature_codes", "is", null);

          const validCodes = new Set((features || []).map(f => f.feature_code));
          let orphanedCount = 0;
          for (const section of manualSections || []) {
            const codes = (section.source_feature_codes as string[]) || [];
            const hasOrphans = codes.some(code => !validCodes.has(code));
            if (hasOrphans) orphanedCount++;
          }

          const { count: unmappedCount } = await supabase
            .from("manual_sections")
            .select("id", { count: 'exact', head: true })
            .or("source_feature_codes.is.null,source_feature_codes.eq.{}");

          documentationHealth.orphanedReferences = orphanedCount;
          documentationHealth.unmappedSections = unmappedCount || 0;
          if (orphanedCount > 5) {
            documentationHealth.healthStatus = 'critical';
          } else if (orphanedCount > 0 || (unmappedCount || 0) > 10) {
            documentationHealth.healthStatus = 'warning';
          }
        } catch (e) {
          console.error("Documentation health check failed:", e);
        }

        const analysis: ContextAnalysis = {
          totalFeatures,
          documented,
          undocumented: totalFeatures - documented,
          coveragePercentage,
          moduleBreakdown,
          readinessScore,
          recommendations,
          staleContent: staleContent.slice(0, 10),
        };

        // Manual section coverage stats
        const manualSectionCoverage = {
          totalModulesWithSections: modulesWithManualSections.size,
          totalSections: manualSections?.length || 0,
          modulesWithContent: Array.from(modulesWithManualSections),
        };

        return new Response(
          JSON.stringify({ 
            success: true, 
            analysis,
            documentationHealth,
            manualSectionCoverage
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==================== GENERATE MANUAL SECTION ====================
      case 'generate_manual_section': {
        if (!context.featureCode) {
          return new Response(
            JSON.stringify({ error: "featureCode is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const featureContext = await getFeatureContext(context.featureCode);
        if (!featureContext) {
          return new Response(
            JSON.stringify({ error: "Feature not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const sectionTitle = context.sectionTitle || featureContext.feature_name;
        const sectionNumber = context.sectionNumber || "X.Y";
        const audiences = context.targetAudience || ['HR Administrators', 'Super Admins'];

        const userPrompt = `Generate an Administrator Manual section for Intelli HRM.

## Context
- Section Number: ${sectionNumber}
- Section Title: ${sectionTitle}
- Feature Code: ${featureContext.feature_code}
- Feature Name: ${featureContext.feature_name}
- Module: ${(featureContext.application_modules as any)?.module_name}
- Route Path: ${featureContext.route_path || 'N/A'}
- Description: ${featureContext.description || 'No description available'}
- Workflow Steps: ${JSON.stringify(featureContext.workflow_steps || {})}
- UI Elements: ${JSON.stringify(featureContext.ui_elements || {})}
- Target Audience: ${audiences.join(', ')}
- Existing Documentation: ${featureContext.existingArtifacts.length} artifacts

## Requirements
Generate a comprehensive manual section following the Intelli HRM Administrator Manual format:

1. **Section Header** with Badge (Section ${sectionNumber}) and estimated reading time (format: "X min read")

2. **Executive Summary** (if overview section) - Brief paragraph explaining purpose and business value

3. **Prerequisites** - What users need before using this feature

4. **Step-by-Step Configuration/Usage Guide** - Numbered steps with clear actions

5. **Configuration Options Table** - If applicable, document all settings

6. **Best Practices** - Tips and recommendations using callout boxes

7. **Troubleshooting** - Common issues and solutions

8. **Related Features** - Cross-references to other features

9. **Learning Objectives** - What users will learn (3-5 bullet points)

Format as clean markdown that can be rendered in a React component.`;

        const content = await callAI(AGENT_SYSTEM_PROMPT, userPrompt);

        // Estimate reading time (avg 200 words per minute)
        const wordCount = content.split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200));

        return new Response(
          JSON.stringify({
            success: true,
            content,
            metadata: {
              sectionNumber,
              sectionTitle,
              featureCode: featureContext.feature_code,
              featureName: featureContext.feature_name,
              moduleCode: (featureContext.application_modules as any)?.module_code,
              readingTime,
              wordCount,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==================== GENERATE KB ARTICLE ====================
      case 'generate_kb_article': {
        if (!context.featureCode) {
          return new Response(
            JSON.stringify({ error: "featureCode is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const featureContext = await getFeatureContext(context.featureCode);
        if (!featureContext) {
          return new Response(
            JSON.stringify({ error: "Feature not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const persona = context.targetPersona || 'all';

        const userPrompt = `Generate a Knowledge Base article for Intelli HRM.

## Feature Information
- Feature: ${featureContext.feature_name}
- Code: ${featureContext.feature_code}
- Module: ${(featureContext.application_modules as any)?.module_name}
- Description: ${featureContext.description || 'No description'}
- Route: ${featureContext.route_path || 'N/A'}
- Target Persona: ${persona.toUpperCase()}

## Requirements
Generate a JSON object with this exact structure:
{
  "title": "How to [specific action] in ${featureContext.feature_name}",
  "summary": "2-3 sentence overview suitable for an article card",
  "persona": "${persona}",
  "content": "Full markdown article with clear headings and steps",
  "steps": [
    { "step": 1, "action": "Clear action description", "tip": "Optional helpful tip" }
  ],
  "faqs": [
    { "question": "Common question?", "answer": "Clear answer" }
  ],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "suggested KB category",
  "related": ["related_feature_code_1"]
}

Focus on practical, actionable guidance for the ${persona} persona.`;

        const content = await callAI(AGENT_SYSTEM_PROMPT, userPrompt);

        // Parse JSON from response
        let articleData;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            articleData = JSON.parse(jsonMatch[0]);
          }
        } catch {
          articleData = {
            title: featureContext.feature_name,
            content,
            summary: "",
            keywords: [],
            persona,
          };
        }

        return new Response(
          JSON.stringify({
            success: true,
            article: articleData,
            featureCode: featureContext.feature_code,
            moduleName: (featureContext.application_modules as any)?.module_name,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==================== GENERATE QUICK START ====================
      case 'generate_quickstart': {
        if (!context.moduleCode) {
          return new Response(
            JSON.stringify({ error: "moduleCode is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const moduleContext = await getModuleContext(context.moduleCode);
        if (!moduleContext) {
          return new Response(
            JSON.stringify({ error: "Module not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const userPrompt = `Generate a Quick Start Guide for the ${moduleContext.module_name} module in Intelli HRM.

## Module Information
- Module: ${moduleContext.module_name}
- Code: ${moduleContext.module_code}
- Description: ${moduleContext.description || 'No description'}
- Features: ${moduleContext.features.map((f: any) => f.feature_name).join(', ')}
- Feature Count: ${moduleContext.featureCount}

## Requirements
Generate a JSON object with this structure for a rapid module setup guide:
{
  "moduleName": "${moduleContext.module_name}",
  "moduleCode": "${moduleContext.module_code}",
  "estimatedSetupTime": "X hours",
  "roles": [
    {
      "role": "role_code",
      "title": "Human-readable title",
      "icon": "lucide-icon-name",
      "responsibility": "Brief description of what this role does"
    }
  ],
  "prerequisites": [
    {
      "id": "prereq_1",
      "title": "Prerequisite title",
      "description": "What needs to be done",
      "required": true
    }
  ],
  "pitfalls": [
    {
      "issue": "Common mistake or issue",
      "prevention": "How to avoid it",
      "severity": "high|medium|low"
    }
  ],
  "setupSteps": [
    {
      "id": "step_1",
      "title": "Step title",
      "estimatedTime": "15 min",
      "description": "What this step accomplishes",
      "substeps": [
        "Detailed action 1",
        "Detailed action 2"
      ]
    }
  ],
  "successMetrics": [
    {
      "metric": "What to measure",
      "target": "Expected outcome",
      "howToMeasure": "How to verify success"
    }
  ],
  "nextSteps": ["What to do after initial setup"]
}

Make it practical and actionable for implementation consultants.`;

        const content = await callAI(AGENT_SYSTEM_PROMPT, userPrompt);

        // Parse JSON
        let quickstartData;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            quickstartData = JSON.parse(jsonMatch[0]);
          }
        } catch {
          quickstartData = {
            moduleName: moduleContext.module_name,
            moduleCode: moduleContext.module_code,
            rawContent: content,
          };
        }

        return new Response(
          JSON.stringify({
            success: true,
            quickstart: quickstartData,
            moduleCode: moduleContext.module_code,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==================== GENERATE SOP ====================
      case 'generate_sop': {
        if (!context.featureCode) {
          return new Response(
            JSON.stringify({ error: "featureCode is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const featureContext = await getFeatureContext(context.featureCode);
        if (!featureContext) {
          return new Response(
            JSON.stringify({ error: "Feature not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const userPrompt = `Generate a Standard Operating Procedure (SOP) for ${featureContext.feature_name} in Intelli HRM.

## Feature Information
- Feature: ${featureContext.feature_name}
- Module: ${(featureContext.application_modules as any)?.module_name}
- Description: ${featureContext.description || 'No description'}
- Route: ${featureContext.route_path || 'N/A'}

## Requirements
Generate a formal SOP JSON structure:
{
  "title": "SOP: ${featureContext.feature_name}",
  "sopNumber": "SOP-XXX-001",
  "effectiveDate": "${new Date().toISOString().split('T')[0]}",
  "purpose": "Why this SOP exists and what it ensures",
  "scope": "Who this applies to and under what circumstances",
  "definitions": [
    { "term": "Term", "definition": "Clear definition" }
  ],
  "responsibilities": [
    { "role": "Role name", "duties": ["Duty 1", "Duty 2"] }
  ],
  "procedure": [
    {
      "step": 1,
      "action": "What to do",
      "details": "Detailed instructions",
      "screenshotMarker": "[Screenshot: Description of what to capture]"
    }
  ],
  "qualityChecks": ["Verification step 1", "Verification step 2"],
  "exceptions": ["When to deviate from this procedure"],
  "relatedDocuments": ["Related SOP or document references"],
  "revisionHistory": [
    { "version": "1.0", "date": "${new Date().toISOString().split('T')[0]}", "author": "System", "changes": "Initial release" }
  ]
}`;

        const content = await callAI(AGENT_SYSTEM_PROMPT, userPrompt);

        let sopData;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            sopData = JSON.parse(jsonMatch[0]);
          }
        } catch {
          sopData = { title: `SOP: ${featureContext.feature_name}`, rawContent: content };
        }

        return new Response(
          JSON.stringify({
            success: true,
            sop: sopData,
            featureCode: featureContext.feature_code,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==================== IDENTIFY GAPS ====================
      case 'identify_gaps': {
        const moduleCodeFilter = context.moduleCode;
        
        // Get all features (optionally filtered by module)
        let featuresQuery = supabase
          .from("application_features")
          .select(`
            feature_code, feature_name, description,
            application_modules!inner(module_code, module_name)
          `)
          .eq("is_active", true);

        if (moduleCodeFilter) {
          featuresQuery = featuresQuery.eq("application_modules.module_code", moduleCodeFilter);
        }

        const { data: features } = await featuresQuery;

        // Get documentation status
        const { data: contentStatus } = await supabase
          .from("enablement_content_status")
          .select("feature_code, documentation_status, workflow_status");

        // Get artifacts
        const { data: artifacts } = await supabase
          .from("enablement_artifacts")
          .select("feature_code, artifact_type");

        const statusMap = new Map((contentStatus || []).map(c => [c.feature_code, c]));
        const artifactCounts = new Map<string, Set<string>>();
        (artifacts || []).forEach(a => {
          if (a.feature_code) {
            if (!artifactCounts.has(a.feature_code)) {
              artifactCounts.set(a.feature_code, new Set());
            }
            artifactCounts.get(a.feature_code)!.add(a.artifact_type);
          }
        });

        // Analyze gaps
        const gaps = {
          noDocumentation: [] as any[],
          noKBArticle: [] as any[],
          noQuickStart: [] as any[],
          noSOP: [] as any[],
        };

        for (const feature of features || []) {
          const status = statusMap.get(feature.feature_code);
          const types = artifactCounts.get(feature.feature_code) || new Set();

          const isDocumented = status?.documentation_status === 'complete' ||
            status?.workflow_status === 'published';

          if (!isDocumented && types.size === 0) {
            gaps.noDocumentation.push({
              feature_code: feature.feature_code,
              feature_name: feature.feature_name,
              module_code: (feature.application_modules as any)?.module_code,
              module_name: (feature.application_modules as any)?.module_name,
            });
          }

          if (!types.has('kb_article')) {
            gaps.noKBArticle.push({ feature_code: feature.feature_code, feature_name: feature.feature_name });
          }
          if (!types.has('sop')) {
            gaps.noSOP.push({ feature_code: feature.feature_code, feature_name: feature.feature_name });
          }
        }

        // Get modules without quickstarts
        const { data: quickstarts } = await supabase
          .from("enablement_quickstart_templates")
          .select("module_code");

        const modulesWithQuickstart = new Set((quickstarts || []).map(q => q.module_code));
        const { data: modules } = await supabase
          .from("application_modules")
          .select("module_code, module_name")
          .eq("is_active", true);

        gaps.noQuickStart = (modules || [])
          .filter(m => !modulesWithQuickstart.has(m.module_code))
          .map(m => ({ module_code: m.module_code, module_name: m.module_name }));

        // ORPHAN DETECTION: Documentation referencing non-existent features
        const featureCodeSet = new Set((features || []).map(f => f.feature_code));
        const { data: manualSections } = await supabase
          .from("manual_sections")
          .select("id, section_number, title, source_feature_codes, manual_definitions!inner(manual_code)");

        const orphanedDocumentation: Array<{
          section_number: string;
          section_title: string;
          manual_code: string;
          orphaned_codes: string[];
          action_required: string;
        }> = [];

        for (const section of manualSections || []) {
          const codes = (section.source_feature_codes as string[]) || [];
          const orphans = codes.filter(code => !featureCodeSet.has(code));

          if (orphans.length > 0) {
            orphanedDocumentation.push({
              section_number: section.section_number || '',
              section_title: section.title || '',
              manual_code: (section.manual_definitions as any)?.manual_code || '',
              orphaned_codes: orphans,
              action_required: 'Remove invalid codes or add features to registry'
            });
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            gaps: {
              noDocumentation: gaps.noDocumentation.slice(0, 20),
              noKBArticle: gaps.noKBArticle.slice(0, 20),
              noQuickStart: gaps.noQuickStart,
              noSOP: gaps.noSOP.slice(0, 20),
              orphanedDocumentation: orphanedDocumentation.slice(0, 20),
            },
            summary: {
              undocumentedFeatures: gaps.noDocumentation.length,
              missingKBArticles: gaps.noKBArticle.length,
              missingQuickStarts: gaps.noQuickStart.length,
              missingSOPs: gaps.noSOP.length,
              orphanedDocumentation: orphanedDocumentation.length,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==================== SUGGEST NEXT ACTIONS ====================
      case 'suggest_next_actions': {
        // Get current state
        const { data: features } = await supabase
          .from("application_features")
          .select("id")
          .eq("is_active", true);

        const { data: contentStatus } = await supabase
          .from("enablement_content_status")
          .select("documentation_status, workflow_status, updated_at");

        const { data: artifacts } = await supabase
          .from("enablement_artifacts")
          .select("status, updated_at");

        const totalFeatures = features?.length || 0;
        const documented = (contentStatus || []).filter(
          c => c.documentation_status === 'complete' || c.workflow_status === 'published'
        ).length;

        const coverageRate = totalFeatures > 0 ? (documented / totalFeatures) * 100 : 0;

        // Generate contextual suggestions
        const suggestions = [];

        if (coverageRate < 30) {
          suggestions.push({
            action: 'bulk_generate',
            priority: 'high',
            title: 'Start Bulk Generation',
            description: `Coverage is only ${Math.round(coverageRate)}%. Run bulk generation to quickly create documentation for undocumented features.`,
          });
        } else if (coverageRate < 70) {
          suggestions.push({
            action: 'identify_gaps',
            priority: 'medium',
            title: 'Review Gap Analysis',
            description: 'Identify and prioritize remaining undocumented features.',
          });
        }

        // Check for stale content
        const now = new Date();
        const staleCount = (contentStatus || []).filter(c => {
          if (!c.updated_at) return false;
          const updated = new Date(c.updated_at);
          return (now.getTime() - updated.getTime()) > 90 * 24 * 60 * 60 * 1000;
        }).length;

        if (staleCount > 0) {
          suggestions.push({
            action: 'refresh_stale',
            priority: staleCount > 10 ? 'high' : 'medium',
            title: 'Refresh Stale Content',
            description: `${staleCount} items haven't been updated in 90+ days. Consider regenerating or reviewing.`,
          });
        }

        suggestions.push({
          action: 'generate_quickstart',
          priority: 'low',
          title: 'Create Quick Starts',
          description: 'Generate rapid setup guides for modules without quick starts.',
        });

        return new Response(
          JSON.stringify({
            success: true,
            suggestions,
            stats: {
              totalFeatures,
              documented,
              coverageRate: Math.round(coverageRate),
              staleContent: staleCount,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==================== CHAT (Natural Language Interface) ====================
      case 'chat': {
        if (!context.chatMessage) {
          return new Response(
            JSON.stringify({ error: "chatMessage is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get current coverage for context
        const { data: features } = await supabase
          .from("application_features")
          .select("id, feature_code, feature_name, application_modules!inner(module_code, module_name)")
          .eq("is_active", true)
          .limit(50);

        const { data: modules } = await supabase
          .from("application_modules")
          .select("module_code, module_name")
          .eq("is_active", true);

        const chatSystemPrompt = `${AGENT_SYSTEM_PROMPT}

## Current Context
Available Modules: ${(modules || []).map(m => m.module_name).join(', ')}
Sample Features: ${(features || []).slice(0, 10).map((f: any) => f.feature_name).join(', ')}

## Chat Capabilities
You can help users:
1. Generate documentation (manual sections, KB articles, SOPs, quick starts)
2. Analyze coverage and identify gaps
3. Suggest improvements and next actions
4. Answer questions about documentation best practices

When the user requests content generation, respond with a clear plan and ask for confirmation.
Be conversational but focused on documentation tasks.`;

        const conversationMessages = context.conversationHistory || [];
        const messages = [
          { role: "system", content: chatSystemPrompt },
          ...conversationMessages,
          { role: "user", content: context.chatMessage },
        ];

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages,
          }),
        });

        if (!response.ok) {
          throw new Error("Chat generation failed");
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response.";

        return new Response(
          JSON.stringify({
            success: true,
            reply,
            suggestedActions: extractSuggestedActions(reply),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==================== PREVIEW SECTION REGENERATION ====================
      case 'preview_section_regeneration': {
        if (!context.sectionId) {
          return new Response(
            JSON.stringify({ error: "sectionId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch the existing section
        const { data: section, error: sectionError } = await supabase
          .from("manual_sections")
          .select(`
            id,
            section_number,
            title,
            content,
            source_feature_codes,
            last_generated_at,
            manual_definitions!inner(current_version, manual_name, manual_code)
          `)
          .eq("id", context.sectionId)
          .single();

        if (sectionError || !section) {
          return new Response(
            JSON.stringify({ error: "Section not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Extract current content as markdown
        const currentContent = (() => {
          if (!section.content) return "";
          const content = section.content as Record<string, unknown>;
          if (typeof content.markdown === 'string') return content.markdown;
          if (typeof content.content === 'string') return content.content;
          return JSON.stringify(content, null, 2);
        })();

        // Get feature context for regeneration
        const featureCodes = section.source_feature_codes || [];
        let featureContext = "";
        
        if (featureCodes.length > 0) {
          const { data: features } = await supabase
            .from("application_features")
            .select("feature_code, feature_name, description, workflow_steps, ui_elements")
            .in("feature_code", featureCodes);
          
          if (features && features.length > 0) {
            featureContext = features.map((f: any) => `
Feature: ${f.feature_name} (${f.feature_code})
Description: ${f.description || 'N/A'}
Workflow Steps: ${JSON.stringify(f.workflow_steps || {})}
UI Elements: ${JSON.stringify(f.ui_elements || {})}
            `).join('\n');
          }
        }

        const manualName = (section.manual_definitions as any)?.manual_name || "Administrator Manual";

        // Generate new content
        const userPrompt = `Regenerate the following Administrator Manual section for ${manualName} in Intelli HRM.

## Current Section
- Section Number: ${section.section_number}
- Section Title: ${section.title}
- Manual: ${manualName}

## Source Features
${featureContext || "No specific features linked to this section."}

## Current Content (for reference)
${currentContent.substring(0, 2000)}${currentContent.length > 2000 ? '...' : ''}

## Requirements
Generate an improved version of this section following the Intelli HRM Administrator Manual format:
1. Section header with Badge (Section ${section.section_number}) and estimated reading time
2. Clear, actionable content with step-by-step instructions where applicable
3. Configuration tables if relevant
4. Best practices and tips
5. Troubleshooting section if applicable

${context.customInstructions ? `Additional Instructions: ${context.customInstructions}` : ''}

Format as clean markdown that can be rendered in a React component.`;

        const proposedContent = await callAI(AGENT_SYSTEM_PROMPT, userPrompt);

        return new Response(
          JSON.stringify({
            success: true,
            currentContent,
            proposedContent,
            sectionInfo: {
              sectionNumber: section.section_number,
              title: section.title,
              lastGeneratedAt: section.last_generated_at,
              currentVersion: (section.manual_definitions as any)?.current_version || "1.0",
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ==================== VALIDATE DOCUMENTATION (BI-DIRECTIONAL) ====================
      case 'validate_documentation': {
        // 1. Get all feature codes from application_features
        const { data: dbFeatures, error: featuresError } = await supabase
          .from("application_features")
          .select("feature_code, feature_name, application_modules!inner(module_code)")
          .eq("is_active", true);

        if (featuresError) throw featuresError;

        const validFeatureCodes = new Set(dbFeatures?.map(f => f.feature_code) || []);

        // 2. Get all manual sections with feature code mappings
        const { data: manualSections, error: sectionsError } = await supabase
          .from("manual_sections")
          .select(`
            id, section_number, title, source_feature_codes, markdown_content,
            manual_definitions!inner(manual_code, title)
          `)
          .not("source_feature_codes", "is", null);

        if (sectionsError) throw sectionsError;

        // 3. Find orphaned references (in docs but not in DB)
        const orphanedDocumentation: Array<{
          section_id: string;
          section_number: string;
          section_title: string;
          manual_code: string;
          orphaned_codes: string[];
          valid_codes: string[];
          severity: 'critical' | 'warning';
        }> = [];
        const validMappings: Array<{ section_number: string; feature_codes: string[] }> = [];

        for (const section of manualSections || []) {
          const codes = (section.source_feature_codes as string[]) || [];
          if (codes.length === 0) continue;

          const orphanedCodes = codes.filter(code => !validFeatureCodes.has(code));
          const validCodes = codes.filter(code => validFeatureCodes.has(code));

          if (orphanedCodes.length > 0) {
            orphanedDocumentation.push({
              section_id: section.id,
              section_number: section.section_number || '',
              section_title: section.title || '',
              manual_code: (section.manual_definitions as any)?.manual_code || '',
              orphaned_codes: orphanedCodes,
              valid_codes: validCodes,
              severity: orphanedCodes.length === codes.length ? 'critical' : 'warning'
            });
          } else {
            validMappings.push({
              section_number: section.section_number || '',
              feature_codes: validCodes
            });
          }
        }

        // 4. Find sections with no feature mapping at all
        const { data: unmappedSections, error: unmappedError } = await supabase
          .from("manual_sections")
          .select("id, section_number, title, manual_definitions!inner(manual_code)")
          .or("source_feature_codes.is.null,source_feature_codes.eq.{}");

        if (unmappedError) throw unmappedError;

        // 5. Calculate health score
        const orphanedCount = orphanedDocumentation.length;
        const unmappedCount = unmappedSections?.length || 0;
        const validCount = validMappings.length;

        // Health score calculation
        const orphanPenalty = Math.min(50, orphanedCount * 10);
        const unmappedPenalty = Math.min(30, unmappedCount * 2);
        const validBonus = validCount > 0 ? Math.min(20, validCount) : 0;
        const healthScore = Math.max(0, 100 - orphanPenalty - unmappedPenalty + validBonus);

        return new Response(
          JSON.stringify({
            success: true,
            validation: {
              totalSections: manualSections?.length || 0,
              validMappings: validCount,
              orphanedDocumentation: orphanedDocumentation.slice(0, 20),
              unmappedSections: (unmappedSections || []).slice(0, 20).map(s => ({
                section_id: s.id,
                section_number: s.section_number || '',
                title: s.title || '',
                manual_code: (s.manual_definitions as any)?.manual_code || ''
              })),
              summary: {
                orphanedCount,
                unmappedCount,
                healthScore: Math.round(healthScore)
              }
            }
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
    console.error("Content Creation Agent error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper to extract suggested actions from chat response
function extractSuggestedActions(text: string): string[] {
  const actions = [];
  if (text.toLowerCase().includes('generate') && text.toLowerCase().includes('manual')) {
    actions.push('generate_manual_section');
  }
  if (text.toLowerCase().includes('kb article') || text.toLowerCase().includes('knowledge base')) {
    actions.push('generate_kb_article');
  }
  if (text.toLowerCase().includes('quick start')) {
    actions.push('generate_quickstart');
  }
  if (text.toLowerCase().includes('sop') || text.toLowerCase().includes('procedure')) {
    actions.push('generate_sop');
  }
  if (text.toLowerCase().includes('coverage') || text.toLowerCase().includes('analyze')) {
    actions.push('analyze_context');
  }
  if (text.toLowerCase().includes('gap')) {
    actions.push('identify_gaps');
  }
  return actions;
}
