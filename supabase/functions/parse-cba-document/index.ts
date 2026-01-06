import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supported rule types in the current schema
const SUPPORTED_RULE_TYPES = ['overtime', 'shift_differential', 'rest_period', 'break_time', 'max_hours', 'holiday_pay', 'on_call'];
const SUPPORTED_DAY_TYPES = ['regular', 'weekend', 'holiday', 'night', 'all'];

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

IMPORTANT: Analyze the document thoroughly and categorize rules into TWO groups:
1. SUPPORTED RULES - Rules that fit these predefined types:
   - Rule types: overtime, shift_differential, rest_period, break_time, max_hours, holiday_pay, on_call
   - Day types: regular, weekend, holiday, night, all

2. UNSUPPORTED RULES - Rules that don't fit the schema above. Examples:
   - Callback pay, standby pay, split shift premium
   - Tiered/progressive overtime rates (e.g., 1.5x first 2 hours, 2x thereafter)
   - Consecutive day bonuses
   - Public holiday vs regular holiday distinctions
   - Complex conditional rules (weekly hour thresholds, etc.)

For each rule found, assess:
- Whether it fits the supported schema
- Confidence score (0-1) for extraction accuracy
- Any data loss if using a workaround for unsupported rules`;

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
          { role: "user", content: `Please analyze this CBA document and extract all time-related rules, categorizing them as supported or unsupported:\n\n${documentContent}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_cba_rules",
              description: "Extract CBA time rules from the document with gap detection",
              parameters: {
                type: "object",
                properties: {
                  rules: {
                    type: "array",
                    description: "Rules that fit the supported schema",
                    items: {
                      type: "object",
                      properties: {
                        rule_name: { type: "string", description: "Descriptive name for the rule" },
                        rule_type: { 
                          type: "string", 
                          enum: SUPPORTED_RULE_TYPES,
                          description: "Type of time rule"
                        },
                        day_type: { 
                          type: "string", 
                          enum: SUPPORTED_DAY_TYPES,
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
                        },
                        approximation_warning: {
                          type: "string",
                          description: "Warning if this rule is a simplification of a more complex original rule"
                        }
                      },
                      required: ["rule_name", "rule_type", "day_type", "priority", "confidence"],
                      additionalProperties: false
                    }
                  },
                  unsupported_rules: {
                    type: "array",
                    description: "Rules that cannot be expressed with the current schema",
                    items: {
                      type: "object",
                      properties: {
                        original_text: { type: "string", description: "Original text from the document" },
                        suggested_type: { type: "string", description: "What type this rule should be (e.g., callback_pay, tiered_overtime)" },
                        reason: { type: "string", description: "Why this doesn't fit the current schema" },
                        workaround: { type: "string", description: "How it could be partially modeled using existing types" },
                        data_loss_warning: { type: "string", description: "What functionality is lost if using the workaround" }
                      },
                      required: ["original_text", "suggested_type", "reason"],
                      additionalProperties: false
                    }
                  },
                  extension_suggestions: {
                    type: "array",
                    description: "Suggestions for extending the module to support found rules",
                    items: {
                      type: "object",
                      properties: {
                        feature: { type: "string", description: "Feature name to add" },
                        description: { type: "string", description: "What this feature would enable" },
                        priority: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Importance level" },
                        affected_rules: { type: "array", items: { type: "string" }, description: "Which unsupported rules this would fix" }
                      },
                      required: ["feature", "description", "priority"],
                      additionalProperties: false
                    }
                  },
                  schema_gaps: {
                    type: "object",
                    description: "Identified gaps in the current schema",
                    properties: {
                      missing_rule_types: { type: "array", items: { type: "string" }, description: "Rule types not in current schema" },
                      missing_day_types: { type: "array", items: { type: "string" }, description: "Day types not in current schema" },
                      missing_conditions: { type: "array", items: { type: "string" }, description: "Conditional logic not supported" },
                      missing_formulas: { type: "array", items: { type: "string" }, description: "Complex calculations not supported" }
                    },
                    additionalProperties: false
                  },
                  summary: {
                    type: "string",
                    description: "Brief summary of the CBA time provisions"
                  },
                  warnings: {
                    type: "array",
                    items: { type: "string" },
                    description: "Any ambiguities or potential conflicts found"
                  },
                  complexity_assessment: {
                    type: "object",
                    properties: {
                      overall_complexity: { type: "string", enum: ["simple", "moderate", "complex", "requires_extension"] },
                      coverage_percentage: { type: "number", description: "Percentage of document rules that can be fully supported (0-100)" },
                      recommendation: { type: "string", description: "AI recommendation for proceeding" }
                    },
                    additionalProperties: false
                  }
                },
                required: ["rules", "unsupported_rules", "summary", "complexity_assessment"],
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
    
    const supportedCount = extractedData.rules?.length || 0;
    const unsupportedCount = extractedData.unsupported_rules?.length || 0;
    
    console.log(`Extracted ${supportedCount} supported rules, ${unsupportedCount} unsupported rules from CBA document`);

    return new Response(JSON.stringify({
      success: true,
      rules: extractedData.rules || [],
      unsupported_rules: extractedData.unsupported_rules || [],
      extension_suggestions: extractedData.extension_suggestions || [],
      schema_gaps: extractedData.schema_gaps || {},
      summary: extractedData.summary || "",
      warnings: extractedData.warnings || [],
      complexity_assessment: extractedData.complexity_assessment || { overall_complexity: "simple", coverage_percentage: 100 },
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
