import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TourGenerationRequest {
  module_code: string;
  module_name: string;
  feature_code?: string;
  feature_name?: string;
  feature_description?: string;
  route_path: string;
  tour_type: "walkthrough" | "spotlight" | "announcement";
  target_audience: "new_users" | "managers" | "admins" | "all";
  ui_elements?: string[];
  workflow_steps?: string[];
}

interface GeneratedTourStep {
  step_order: number;
  target_selector: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right" | "auto" | "center";
  highlight_type: "spotlight" | "tooltip" | "modal" | "beacon";
  action_type: "click" | "input" | "hover" | "scroll" | "wait" | "none" | null;
}

interface GeneratedTour {
  tour_code: string;
  tour_name: string;
  description: string;
  estimated_duration_seconds: number;
  steps: GeneratedTourStep[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const request: TourGenerationRequest = await req.json();
    console.log("Generating tour for:", request.module_code, request.feature_code || "module overview");

    const systemPrompt = `You are an expert UX designer and user onboarding specialist for HRplus Cerebra, an enterprise HRMS platform.

Your task is to generate guided tour content that:
1. Helps users understand and navigate the feature effectively
2. Uses clear, concise language appropriate for HR professionals
3. Follows best practices for interactive product tours
4. Creates meaningful step-by-step guidance

Guidelines:
- Keep step content under 150 characters
- Use action-oriented titles (e.g., "Explore Your Dashboard", "Create Your First Report")
- Target specific UI elements using data-tour attributes or semantic selectors
- Suggest appropriate placements based on typical UI layouts
- For walkthroughs, include 4-8 steps
- For spotlights, include 2-4 key highlights
- For announcements, include 1-3 announcement points`;

    const userPrompt = `Generate a ${request.tour_type} tour for the HRplus ${request.module_name} module.

Module: ${request.module_name} (${request.module_code})
${request.feature_name ? `Feature: ${request.feature_name} (${request.feature_code})` : ""}
${request.feature_description ? `Description: ${request.feature_description}` : ""}
Route: ${request.route_path}
Target Audience: ${request.target_audience}
${request.ui_elements?.length ? `UI Elements: ${request.ui_elements.join(", ")}` : ""}
${request.workflow_steps?.length ? `Workflow Steps: ${request.workflow_steps.join(" → ")}` : ""}

Generate a tour that guides ${request.target_audience === "new_users" ? "new users" : request.target_audience === "managers" ? "managers" : request.target_audience === "admins" ? "administrators" : "all users"} through this ${request.feature_name ? "feature" : "module"}.

Use these CSS selector patterns for targeting:
- [data-tour="element-name"] for specific elements
- .card-header, .card-content for card sections
- button[type="submit"] for submit buttons
- [role="navigation"] for navigation areas
- h1, h2 for headings`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_guided_tour",
              description: "Create a complete guided tour with metadata and steps",
              parameters: {
                type: "object",
                properties: {
                  tour_code: {
                    type: "string",
                    description: "Unique tour code in snake_case format, e.g., workforce_dashboard_intro",
                  },
                  tour_name: {
                    type: "string",
                    description: "Human-readable tour name, e.g., 'Workforce Dashboard Introduction'",
                  },
                  description: {
                    type: "string",
                    description: "Brief description of what users will learn, max 200 characters",
                  },
                  estimated_duration_seconds: {
                    type: "number",
                    description: "Estimated time to complete the tour in seconds (typically 30-120)",
                  },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step_order: { type: "number", description: "Step sequence number starting from 1" },
                        target_selector: { type: "string", description: "CSS selector for the target element" },
                        title: { type: "string", description: "Step title, max 50 characters" },
                        content: { type: "string", description: "Step content/description, max 150 characters" },
                        placement: {
                          type: "string",
                          enum: ["top", "bottom", "left", "right", "auto", "center"],
                          description: "Tooltip placement relative to target",
                        },
                        highlight_type: {
                          type: "string",
                          enum: ["spotlight", "tooltip", "modal", "beacon"],
                          description: "How to highlight the element",
                        },
                        action_type: {
                          type: "string",
                          enum: ["click", "input", "hover", "scroll", "wait", "none"],
                          description: "Expected user action, or none for passive step",
                        },
                      },
                      required: ["step_order", "target_selector", "title", "content", "placement", "highlight_type"],
                      additionalProperties: false,
                    },
                    description: "Array of tour steps in sequence",
                  },
                },
                required: ["tour_code", "tour_name", "description", "estimated_duration_seconds", "steps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_guided_tour" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    // Extract the tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "create_guided_tour") {
      throw new Error("Invalid AI response format");
    }

    const generatedTour: GeneratedTour = JSON.parse(toolCall.function.arguments);
    console.log("Generated tour:", generatedTour.tour_code, "with", generatedTour.steps.length, "steps");

    return new Response(
      JSON.stringify({
        success: true,
        tour: generatedTour,
        request_context: {
          module_code: request.module_code,
          feature_code: request.feature_code,
          route_path: request.route_path,
          tour_type: request.tour_type,
          target_audience: request.target_audience,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating tour:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate tour",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
