import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RatingLevel {
  id: string;
  code: string;
  name: string;
  min_score: number;
  max_score: number;
  requires_pip: boolean;
  succession_eligible: boolean;
  promotion_eligible: boolean;
  bonus_eligible: boolean;
}

interface ExistingRule {
  rule_code: string;
  action_type: string;
  rating_level_codes?: string[];
}

interface SuggestedRule {
  rule_name: string;
  rule_code: string;
  description: string;
  condition_type: string;
  rating_level_codes: string[];
  condition_section: string;
  action_type: string;
  action_is_mandatory: boolean;
  action_priority: number;
  action_message: string;
  reasoning: string;
  industry_context: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ratingLevels, existingRules, focusArea } = await req.json() as {
      ratingLevels: RatingLevel[];
      existingRules: ExistingRule[];
      focusArea?: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about existing rules to avoid duplicates
    const existingRuleSummary = existingRules.length > 0
      ? `Existing rules already configured: ${existingRules.map(r => `${r.rule_code} (${r.action_type})`).join(", ")}`
      : "No rules currently configured.";

    // Build rating levels context
    const ratingLevelsSummary = ratingLevels.map(r => 
      `- ${r.name} (${r.code}): Score ${r.min_score}-${r.max_score}` +
      `${r.requires_pip ? ", PIP required" : ""}` +
      `${r.succession_eligible ? ", succession eligible" : ""}` +
      `${r.promotion_eligible ? ", promotion eligible" : ""}`
    ).join("\n");

    const focusPrompt = focusArea 
      ? `Focus specifically on ${focusArea} related rules.` 
      : "Provide a balanced mix of rules across different action types.";

    const systemPrompt = `You are an HR technology expert specializing in performance management systems. Your task is to suggest action rules for an appraisal system based on industry best practices from SAP SuccessFactors, Workday, and Oracle HCM.

AVAILABLE ACTION TYPES:
- create_pip: Create Performance Improvement Plan (for underperformers)
- create_idp: Create Individual Development Plan (for growth)
- suggest_succession: Flag for Succession Pool (high potentials)
- block_finalization: Block Appraisal Finalization (require action first)
- require_comment: Require Manager Comment (justification)
- notify_hr: Notify HR Team (escalation)
- schedule_coaching: Schedule Coaching Session (support)
- require_development_plan: Require Development Plan (mandatory planning)

CONDITION SECTIONS:
- overall: Overall appraisal score
- goals: Goals section score
- competencies: Competencies section score
- responsibilities: Responsibilities section score

PRIORITY LEVELS: 1 (Low), 2 (Medium), 3 (High), 4 (Critical)`;

    const userPrompt = `Based on the following rating levels configuration:

${ratingLevelsSummary}

${existingRuleSummary}

${focusPrompt}

Generate 4-5 unique, actionable rule suggestions that are NOT already covered by existing rules. For each rule, provide:
1. A clear rule name and code
2. Which rating level(s) should trigger it
3. The appropriate action type
4. Whether it should be mandatory
5. Priority level
6. A message to display to the employee/manager
7. Brief reasoning for why this rule is valuable
8. Industry context (which major HRMS systems use similar rules)

Return ONLY rules that add value beyond what's already configured.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_action_rules",
              description: "Return suggested action rules for the appraisal system",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        rule_name: { type: "string", description: "Human-readable rule name" },
                        rule_code: { type: "string", description: "Snake_case unique code" },
                        description: { type: "string", description: "Brief description of the rule" },
                        condition_type: { type: "string", enum: ["rating_category", "score_below", "score_above", "repeated_low"] },
                        rating_level_codes: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Rating level codes that trigger this rule"
                        },
                        condition_section: { type: "string", enum: ["overall", "goals", "competencies", "responsibilities"] },
                        action_type: { 
                          type: "string", 
                          enum: ["create_pip", "create_idp", "suggest_succession", "block_finalization", "require_comment", "notify_hr", "schedule_coaching", "require_development_plan"] 
                        },
                        action_is_mandatory: { type: "boolean" },
                        action_priority: { type: "number", enum: [1, 2, 3, 4] },
                        action_message: { type: "string", description: "Message shown to employee/manager" },
                        reasoning: { type: "string", description: "Why this rule is valuable" },
                        industry_context: { type: "string", description: "Which HRMS systems use similar rules" },
                      },
                      required: ["rule_name", "rule_code", "description", "condition_type", "rating_level_codes", "condition_section", "action_type", "action_is_mandatory", "action_priority", "action_message", "reasoning", "industry_context"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_action_rules" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI suggestions");
    }

    const result = await response.json();
    
    // Extract suggestions from tool call response
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid AI response format");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const suggestions: SuggestedRule[] = parsed.suggestions || [];

    // Filter out any suggestions that match existing rule codes
    const existingCodes = new Set(existingRules.map(r => r.rule_code.toLowerCase()));
    const filteredSuggestions = suggestions.filter(
      s => !existingCodes.has(s.rule_code.toLowerCase())
    );

    return new Response(JSON.stringify({ suggestions: filteredSuggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("action-rule-ai-suggester error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
