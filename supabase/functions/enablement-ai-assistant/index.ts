import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnablementRequest {
  action: 'generate_module_overview' | 'generate_feature_tutorial' | 'generate_video_storyboard' | 'generate_quick_reference' | 'generate_kb_article';
  moduleCode?: string;
  moduleName?: string;
  featureCode?: string;
  featureName?: string;
  featureDescription?: string;
  targetRoles?: string[];
  workflowSteps?: string[];
  uiElements?: string[];
  includeScreenshots?: boolean;
  clientCompanyName?: string;
  customInstructions?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const request: EnablementRequest = await req.json();
    console.log("Enablement AI request:", request.action);

    let systemPrompt = "";
    let userPrompt = "";

    switch (request.action) {
      case 'generate_module_overview':
        systemPrompt = `You are a technical documentation expert for HRplus Cerebra, an enterprise HRIS system. Generate comprehensive module overview documentation that is suitable for training courses.
Your output should be structured, clear, and include:
1. Module purpose and business value
2. Key features and capabilities
3. Target user roles and their typical workflows
4. Integration points with other modules
5. Best practices and tips`;
        userPrompt = `Generate a comprehensive module overview for the "${request.moduleName}" module in HRplus Cerebra.
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Please structure the response as JSON with the following format:
{
  "title": "Module overview title",
  "description": "Brief description",
  "sections": [
    {
      "heading": "Section title",
      "content": "Section content in markdown",
      "keyPoints": ["point 1", "point 2"]
    }
  ],
  "targetRoles": ["role1", "role2"],
  "estimatedDuration": 15,
  "learningObjectives": ["objective 1", "objective 2"]
}`;
        break;

      case 'generate_feature_tutorial':
        systemPrompt = `You are a technical documentation expert for HRplus Cerebra, an enterprise HRIS system. Generate step-by-step feature tutorials that are clear, actionable, and suitable for end-user training.
Your tutorials should:
1. Break down complex workflows into simple steps
2. Include tips and best practices
3. Mention common mistakes to avoid
4. Be suitable for users of varying technical abilities`;
        userPrompt = `Generate a step-by-step tutorial for the "${request.featureName}" feature in the ${request.moduleName} module.

Feature description: ${request.featureDescription || 'Not provided'}
${request.workflowSteps?.length ? `Known workflow steps: ${request.workflowSteps.join(', ')}` : ''}
${request.uiElements?.length ? `UI elements involved: ${request.uiElements.join(', ')}` : ''}
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Please structure the response as JSON with the following format:
{
  "title": "Tutorial title",
  "description": "Brief description of what users will learn",
  "prerequisites": ["prerequisite 1", "prerequisite 2"],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "instruction": "Detailed instruction",
      "tip": "Optional helpful tip",
      "screenshotHint": "Description of what screenshot should show"
    }
  ],
  "summary": "Brief summary",
  "nextSteps": ["suggestion 1", "suggestion 2"],
  "estimatedDuration": 10
}`;
        break;

      case 'generate_video_storyboard':
        systemPrompt = `You are a video production specialist for software training content. Generate detailed video storyboards with narration scripts suitable for recording professional training videos.
Your storyboards should:
1. Include scene-by-scene breakdown
2. Provide exact narration scripts
3. Specify on-screen actions and annotations
4. Include timing estimates
5. Note where to add callouts and highlights`;
        userPrompt = `Generate a video storyboard for a training video about "${request.featureName}" in the ${request.moduleName} module.

Feature description: ${request.featureDescription || 'Not provided'}
${request.workflowSteps?.length ? `Workflow steps: ${request.workflowSteps.join(', ')}` : ''}
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Please structure the response as JSON with the following format:
{
  "title": "Video title",
  "description": "Video description",
  "totalDuration": "5:30",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "duration": "0:30",
      "narration": "Exact narration script to read",
      "onScreenAction": "What should be shown on screen",
      "annotations": ["callout 1", "highlight area 2"],
      "screenshotHint": "Description of screenshot needed"
    }
  ],
  "closingScript": "Final narration for closing",
  "callToAction": "What viewer should do next"
}`;
        break;

      case 'generate_quick_reference':
        systemPrompt = `You are a technical documentation expert creating quick reference guides. Generate concise, scannable reference materials that users can quickly consult while working.
Your quick references should:
1. Be highly scannable with bullet points
2. Include keyboard shortcuts if applicable
3. Provide common task procedures
4. List important tips and warnings`;
        userPrompt = `Generate a quick reference guide for the "${request.featureName || request.moduleName}" in HRplus Cerebra.

${request.featureDescription ? `Description: ${request.featureDescription}` : ''}
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Please structure the response as JSON with the following format:
{
  "title": "Quick Reference: Feature Name",
  "sections": [
    {
      "heading": "Section title",
      "items": [
        {
          "label": "Item label",
          "description": "Brief description",
          "shortcut": "Optional keyboard shortcut"
        }
      ]
    }
  ],
  "tips": ["tip 1", "tip 2"],
  "warnings": ["warning 1"],
  "relatedFeatures": ["feature 1", "feature 2"]
}`;
        break;

      case 'generate_kb_article':
        systemPrompt = `You are a knowledge base content specialist for HRplus Cerebra. Generate helpful knowledge base articles that answer user questions and provide guidance.
Your articles should:
1. Use clear, non-technical language where possible
2. Include practical examples
3. Anticipate follow-up questions
4. Be searchable with relevant keywords`;
        userPrompt = `Generate a knowledge base article about "${request.featureName}" in the ${request.moduleName} module.

Feature description: ${request.featureDescription || 'Not provided'}
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Please structure the response as JSON with the following format:
{
  "title": "Article title",
  "summary": "Brief summary for search results",
  "content": "Full article content in markdown",
  "faqs": [
    {
      "question": "Common question",
      "answer": "Answer to the question"
    }
  ],
  "tags": ["tag1", "tag2"],
  "relatedArticles": ["suggestion 1", "suggestion 2"]
}`;
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = { rawContent: content };
    }

    console.log("Enablement AI response generated successfully");

    return new Response(JSON.stringify({
      success: true,
      action: request.action,
      content: parsedContent
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Enablement AI error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
