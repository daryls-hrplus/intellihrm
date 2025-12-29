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
    const { proposalDetails, agreementId, companyId, workforceData } = await req.json();

    if (!proposalDetails) {
      return new Response(
        JSON.stringify({ success: false, error: "Proposal details are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get workforce data from database if not provided
    let workforce = workforceData;
    if (!workforce && companyId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get employee count and salary data
      const { data: employees, error: empError } = await supabase
        .from("profiles")
        .select("id, employment_type")
        .eq("company_id", companyId)
        .eq("status", "active");

      if (!empError && employees) {
        workforce = {
          totalEmployees: employees.length,
          fullTimeCount: employees.filter((e: any) => e.employment_type === "full_time").length,
          partTimeCount: employees.filter((e: any) => e.employment_type === "part_time").length,
        };
      }
    }

    console.log("Analyzing negotiation proposal for agreement:", agreementId);

    const systemPrompt = `You are an expert labor relations financial analyst specializing in Collective Bargaining Agreement (CBA) negotiations.
Your task is to analyze negotiation proposals and provide detailed cost projections.

You must calculate:
1. Annual cost impact of each proposal item
2. Total cost over the contract term
3. Per-employee cost impact
4. Percentage increase over current costs
5. Risk assessment for each proposal

Consider factors like:
- Base wage increases and their compounding effect
- Benefit cost changes (health insurance, retirement, etc.)
- Overtime rate changes
- Shift differential impacts
- Leave policy cost implications
- One-time vs recurring costs
- Implementation costs

Provide realistic estimates with clear assumptions.
Always express monetary values in the local currency (assume USD unless specified).
Include both optimistic and pessimistic scenarios.`;

    const userPrompt = `Analyze this CBA negotiation proposal and provide detailed cost projections:

PROPOSAL DETAILS:
${proposalDetails}

WORKFORCE DATA:
${workforce ? JSON.stringify(workforce, null, 2) : "Not available - use reasonable assumptions for a mid-size company (500 employees)"}

Please provide a comprehensive cost analysis.`;

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
              name: "calculate_negotiation_costs",
              description: "Calculate the financial impact of CBA negotiation proposals",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "object",
                    properties: {
                      total_annual_cost: { type: "number", description: "Total annual cost impact in USD" },
                      total_contract_cost: { type: "number", description: "Total cost over contract term in USD" },
                      per_employee_annual: { type: "number", description: "Annual cost per employee in USD" },
                      percentage_increase: { type: "number", description: "Percentage increase over current costs" },
                      contract_term_years: { type: "number", description: "Contract term in years assumed" }
                    },
                    required: ["total_annual_cost", "total_contract_cost", "per_employee_annual", "percentage_increase"]
                  },
                  line_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { 
                          type: "string",
                          enum: ["wages", "benefits", "overtime", "leave", "pension", "insurance", "other"]
                        },
                        item_name: { type: "string", description: "Name of the cost item" },
                        description: { type: "string", description: "Description of what's being proposed" },
                        current_cost: { type: "number", description: "Current annual cost" },
                        proposed_cost: { type: "number", description: "Proposed annual cost" },
                        annual_increase: { type: "number", description: "Annual cost increase" },
                        is_recurring: { type: "boolean", description: "Whether this is a recurring cost" },
                        implementation_cost: { type: "number", description: "One-time implementation cost if any" },
                        risk_level: { type: "string", enum: ["low", "medium", "high"] },
                        notes: { type: "string", description: "Additional notes or assumptions" }
                      },
                      required: ["category", "item_name", "annual_increase", "is_recurring"]
                    }
                  },
                  scenarios: {
                    type: "object",
                    properties: {
                      optimistic: {
                        type: "object",
                        properties: {
                          total_annual_cost: { type: "number" },
                          assumptions: { type: "string" }
                        }
                      },
                      pessimistic: {
                        type: "object",
                        properties: {
                          total_annual_cost: { type: "number" },
                          assumptions: { type: "string" }
                        }
                      }
                    }
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Strategic recommendations for the negotiation"
                  },
                  risks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        risk: { type: "string" },
                        impact: { type: "string", enum: ["low", "medium", "high"] },
                        mitigation: { type: "string" }
                      }
                    }
                  },
                  assumptions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key assumptions made in the analysis"
                  }
                },
                required: ["summary", "line_items", "recommendations", "assumptions"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "calculate_negotiation_costs" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to analyze proposal" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI cost analysis received");

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "calculate_negotiation_costs") {
      return new Response(
        JSON.stringify({ success: false, error: "AI did not return cost analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const costAnalysis = JSON.parse(toolCall.function.arguments);
    console.log("Cost analysis complete");

    return new Response(
      JSON.stringify({ success: true, data: costAnalysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error analyzing negotiation costs:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
