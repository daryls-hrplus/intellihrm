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
    const { documentContent, agreementId } = await req.json();

    if (!documentContent) {
      return new Response(
        JSON.stringify({ success: false, error: "Document content is required" }),
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

    console.log("Analyzing CBA document for agreement:", agreementId);

    const systemPrompt = `You are an expert labor relations analyst specializing in Collective Bargaining Agreements (CBAs). 
Your task is to analyze the provided CBA document and extract its structure into articles, clauses, and enforceable rules.

For each article, identify:
- Article number and title
- Category (wages, benefits, scheduling, discipline, seniority, leave, safety, general, grievance, management_rights, union_rights)

For each clause within articles, identify:
- Clause number and title
- The full text content
- Clause type (same categories as articles)
- Whether it's enforceable (can be automatically checked/enforced)
- If enforceable, extract the rule parameters (e.g., max hours, minimum rest periods, overtime rates)

For enforceable rules, identify:
- Rule type (max_hours, min_rest, overtime_rate, shift_premium, seniority_bidding, minimum_staffing, break_duration, call_in_pay, holiday_pay, vacation_accrual)
- Specific parameters that can be programmatically enforced
- Enforcement action (block, warn, log)

Be thorough and extract ALL articles and clauses from the document.`;

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
          { role: "user", content: `Please analyze this Collective Bargaining Agreement document and extract its structure:\n\n${documentContent}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_cba_structure",
              description: "Extract the complete structure of a Collective Bargaining Agreement including articles, clauses, and enforceable rules",
              parameters: {
                type: "object",
                properties: {
                  articles: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        article_number: { type: "string", description: "Article number (e.g., '1', '2.1', 'A')" },
                        title: { type: "string", description: "Article title" },
                        category: { 
                          type: "string", 
                          enum: ["wages", "benefits", "scheduling", "discipline", "seniority", "leave", "safety", "general", "grievance", "management_rights", "union_rights"]
                        },
                        content: { type: "string", description: "Full article text if not broken into clauses" },
                        clauses: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              clause_number: { type: "string", description: "Clause number within the article" },
                              title: { type: "string", description: "Clause title or subject" },
                              content: { type: "string", description: "Full clause text" },
                              clause_type: { 
                                type: "string",
                                enum: ["wages", "benefits", "scheduling", "discipline", "seniority", "leave", "safety", "general", "grievance", "management_rights", "union_rights"]
                              },
                              is_enforceable: { type: "boolean", description: "Whether this clause can be automatically enforced" },
                              rule_parameters: { 
                                type: "object",
                                description: "Parameters for automatic enforcement if applicable",
                                properties: {
                                  rule_type: {
                                    type: "string",
                                    enum: ["max_hours", "min_rest", "overtime_rate", "shift_premium", "seniority_bidding", "minimum_staffing", "break_duration", "call_in_pay", "holiday_pay", "vacation_accrual"]
                                  },
                                  value: { type: "number", description: "Numeric value for the rule" },
                                  unit: { type: "string", description: "Unit of measurement (hours, minutes, percent, days)" },
                                  conditions: { type: "string", description: "Any conditions or exceptions" },
                                  enforcement_action: { type: "string", enum: ["block", "warn", "log"] }
                                }
                              }
                            },
                            required: ["clause_number", "title", "content", "clause_type", "is_enforceable"]
                          }
                        }
                      },
                      required: ["article_number", "title", "category"]
                    }
                  },
                  summary: {
                    type: "object",
                    properties: {
                      total_articles: { type: "number" },
                      total_clauses: { type: "number" },
                      enforceable_rules_count: { type: "number" },
                      key_provisions: { type: "array", items: { type: "string" } },
                      effective_date: { type: "string" },
                      expiry_date: { type: "string" }
                    }
                  }
                },
                required: ["articles", "summary"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_cba_structure" } }
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
        JSON.stringify({ success: false, error: "Failed to analyze document" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_cba_structure") {
      return new Response(
        JSON.stringify({ success: false, error: "AI did not return structured data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    console.log("Extracted", extractedData.articles?.length || 0, "articles");

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error analyzing CBA document:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
