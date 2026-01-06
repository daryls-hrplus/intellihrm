import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentContent, agreementId, companyId } = await req.json();
    
    if (!documentContent) {
      throw new Error("No document content provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Parsing CBA document for agreement:", agreementId);

    const systemPrompt = `You are an expert at analyzing Collective Bargaining Agreement (CBA) documents and extracting time and attendance rules.

Extract ALL time-related rules from the document, including:
- Overtime rates and thresholds
- Shift differentials (night, weekend, holiday)
- Maximum working hours (per day, per week)
- Minimum rest periods between shifts
- Break time requirements
- Holiday pay rules
- On-call pay rules

For each rule, identify:
1. Rule name (descriptive)
2. Rule type (overtime, shift_differential, rest_period, break_time, max_hours, holiday_pay, on_call)
3. Day type it applies to (regular, weekend, holiday, night, all)
4. Numeric value (e.g., overtime multiplier like 1.5, or max hours like 8)
5. Text value for conditions or descriptions`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze this CBA document and extract all time-related rules:\n\n${documentContent}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_cba_rules",
              description: "Extract CBA time rules from the document",
              parameters: {
                type: "object",
                properties: {
                  rules: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        rule_name: { type: "string", description: "Descriptive name for the rule" },
                        rule_type: { 
                          type: "string", 
                          enum: ["overtime", "shift_differential", "rest_period", "break_time", "max_hours", "holiday_pay", "on_call"],
                          description: "Type of time rule"
                        },
                        day_type: { 
                          type: "string", 
                          enum: ["regular", "weekend", "holiday", "night", "all"],
                          description: "What type of day/shift this applies to"
                        },
                        value_numeric: { 
                          type: "number", 
                          description: "Numeric value (e.g., 1.5 for overtime, 8 for max hours)"
                        },
                        value_text: { 
                          type: "string", 
                          description: "Text description or conditions"
                        },
                        priority: {
                          type: "number",
                          description: "Priority order (1 = highest)"
                        },
                        confidence: {
                          type: "number",
                          description: "Confidence score 0-1 of extraction accuracy"
                        }
                      },
                      required: ["rule_name", "rule_type", "day_type", "priority", "confidence"],
                      additionalProperties: false
                    }
                  },
                  summary: {
                    type: "string",
                    description: "Brief summary of the CBA time provisions"
                  },
                  warnings: {
                    type: "array",
                    items: { type: "string" },
                    description: "Any ambiguities or potential conflicts found"
                  }
                },
                required: ["rules", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_cba_rules" } }
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_cba_rules") {
      throw new Error("Unexpected AI response format");
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    
    console.log(`Extracted ${extractedData.rules?.length || 0} rules from CBA document`);

    return new Response(JSON.stringify({
      success: true,
      rules: extractedData.rules || [],
      summary: extractedData.summary || "",
      warnings: extractedData.warnings || [],
      agreementId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error parsing CBA document:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
