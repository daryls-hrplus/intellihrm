import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companySize, industry, currentHeadcount, historicalGrowth } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a workforce planning expert. Based on industry benchmarks and best practices, recommend 3-4 realistic scenario configurations for headcount planning.

Consider these industry benchmarks:
- Technology: 15-25% annual growth typical, 15-20% attrition
- Healthcare: 5-10% growth, 12-18% attrition
- Finance: 8-15% growth, 10-15% attrition
- Manufacturing: 3-8% growth, 8-12% attrition
- Retail: 5-12% growth, 20-30% attrition
- Professional Services: 10-20% growth, 15-20% attrition

Company size considerations:
- Startup (1-50): Higher growth variance, can be aggressive
- Small (51-200): Moderate growth, building foundations
- Medium (201-1000): Steady growth, process optimization
- Large (1001+): Conservative growth, focus on efficiency

Provide practical, actionable recommendations.`;

    const userPrompt = `Generate scenario recommendations for:
- Company Size: ${companySize} employees (current headcount: ${currentHeadcount})
- Industry: ${industry}
- Historical Growth: ${historicalGrowth || 'Unknown'}

Provide 3-4 scenario recommendations as JSON.`;

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
              name: "recommend_scenarios",
              description: "Return scenario recommendations based on company analysis",
              parameters: {
                type: "object",
                properties: {
                  analysis: {
                    type: "string",
                    description: "Brief analysis of the company's position and market"
                  },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Scenario name" },
                        description: { type: "string", description: "Brief description of the scenario" },
                        growthRate: { type: "number", description: "Annual growth rate percentage" },
                        attritionRate: { type: "number", description: "Annual attrition rate percentage" },
                        budgetConstraint: { type: "number", description: "Max hires per quarter" },
                        timeHorizon: { type: "number", description: "Forecast months (12 or 24)" },
                        confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level" },
                        rationale: { type: "string", description: "Why this scenario is recommended" }
                      },
                      required: ["name", "description", "growthRate", "attritionRate", "budgetConstraint", "timeHorizon", "confidence", "rationale"]
                    }
                  },
                  industryInsights: {
                    type: "string",
                    description: "Key insights about the industry's workforce trends"
                  }
                },
                required: ["analysis", "recommendations", "industryInsights"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_scenarios" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unexpected response format");
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
