import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateArtifactRequest {
  categoryName: string;
  moduleName: string;
  featureName: string;
  featureDescription?: string;
  contentLevel: string;
  targetRoles: string[];
  uiElements?: Record<string, unknown>;
  workflowSteps?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GenerateArtifactRequest = await req.json();
    const { categoryName, moduleName, featureName, featureDescription, contentLevel, targetRoles, uiElements, workflowSteps } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert technical writer for enterprise HRMS software documentation. 
You create enablement content that follows industry best practices from SAP Enable Now, Workday Learning, and Oracle Guided Learning.

Your documentation style is:
- Clear, concise, and action-oriented
- Uses numbered steps for procedures
- Includes tips and warnings where relevant
- Focuses on user outcomes, not just actions
- Appropriate for the specified content level and target audience

Content Level Guidelines:
- Overview: High-level introduction, key concepts, when to use this feature
- How-To: Step-by-step instructions for completing a specific task
- Advanced: In-depth guidance for power users, edge cases, best practices
- Scenario: Real-world use cases with context and examples
- FAQ: Common questions and troubleshooting
- Video: Script outline for video content`;

    const userPrompt = `Generate enablement artifact content for:

**Category:** ${categoryName}
**Module:** ${moduleName}  
**Feature:** ${featureName}
${featureDescription ? `**Feature Description:** ${featureDescription}` : ''}
**Content Level:** ${contentLevel}
**Target Audience:** ${targetRoles.join(', ')}
${uiElements ? `**UI Elements:** ${JSON.stringify(uiElements)}` : ''}
${workflowSteps ? `**Workflow Steps:** ${JSON.stringify(workflowSteps)}` : ''}

Generate the following in JSON format using the suggest_artifact function:
1. A clear, descriptive title
2. 2-4 learning objectives (what the user will learn/achieve)
3. 1-3 preconditions (what must be true before starting)
4. 3-8 detailed instructional steps with:
   - Step title
   - Clear description of what to do
   - Optional tips (helpful hints)
   - Optional warnings (things to avoid)
5. 2-3 expected outcomes (what happens after completion)`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_artifact",
              description: "Generate structured enablement artifact content",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string",
                    description: "Clear, descriptive title for the artifact"
                  },
                  description: {
                    type: "string",
                    description: "Brief description of what this artifact covers"
                  },
                  learning_objectives: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-4 learning objectives"
                  },
                  preconditions: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 1-3 preconditions"
                  },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        tips: { 
                          type: "array",
                          items: { type: "string" }
                        },
                        warnings: {
                          type: "array", 
                          items: { type: "string" }
                        }
                      },
                      required: ["title", "description"]
                    },
                    description: "List of 3-8 instructional steps"
                  },
                  expected_outcomes: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-3 expected outcomes"
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Relevant tags for search and categorization"
                  }
                },
                required: ["title", "description", "learning_objectives", "preconditions", "steps", "expected_outcomes"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_artifact" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "suggest_artifact") {
      throw new Error("No valid tool call response received");
    }

    const artifactContent = JSON.parse(toolCall.function.arguments);

    // Add IDs and order to steps
    const stepsWithIds = artifactContent.steps.map((step: any, index: number) => ({
      id: crypto.randomUUID(),
      order: index + 1,
      title: step.title,
      description: step.description,
      tips: step.tips || [],
      warnings: step.warnings || []
    }));

    return new Response(JSON.stringify({
      success: true,
      artifact: {
        ...artifactContent,
        steps: stepsWithIds
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-artifact-content error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate artifact content" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
