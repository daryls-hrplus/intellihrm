import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  action: 
    | "infer_skills" 
    | "detect_duplicates" 
    | "suggest_synonyms" 
    | "suggest_adjacent"
    | "analyze_gap"
    | "generate_proficiency_indicators";
  text?: string;
  capability?: { id: string; name: string; description?: string; type: string; code: string };
  capabilities?: { id: string; name: string; code: string }[];
  companyId?: string;
  employeeId?: string;
  jobProfileId?: string;
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json() as AnalysisRequest;
    const { action, text, capability, capabilities, companyId, employeeId, jobProfileId } = body;
    console.log(`Processing capability AI action: ${action}`);

    let result: unknown;

    switch (action) {
      case "infer_skills":
        result = await inferSkillsFromText(text || "", LOVABLE_API_KEY, supabase, companyId);
        break;
      case "detect_duplicates":
        result = await detectDuplicates(capability!, capabilities || [], LOVABLE_API_KEY);
        break;
      case "suggest_synonyms":
        result = await suggestSynonyms(capability!, LOVABLE_API_KEY);
        break;
      case "suggest_adjacent":
        result = await suggestAdjacentSkills(capability!, LOVABLE_API_KEY, supabase, companyId);
        break;
      case "analyze_gap":
        result = await analyzeCapabilityGap(employeeId!, jobProfileId!, LOVABLE_API_KEY, supabase);
        break;
      case "generate_proficiency_indicators":
        result = await generateProficiencyIndicators(capability!, LOVABLE_API_KEY);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Capability AI Analyzer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function inferSkillsFromText(text: string, apiKey: string, supabase: any, companyId?: string) {
  console.log("Inferring skills from text:", text.substring(0, 100));

  // Fetch existing capabilities for matching
  let existingCapabilities: { id: string; name: string; code: string }[] = [];
  if (companyId) {
    const { data } = await supabase
      .from("skills_competencies")
      .select("id, name, code")
      .or(`company_id.eq.${companyId},company_id.is.null`)
      .eq("status", "active")
      .eq("type", "SKILL");
    existingCapabilities = data || [];
  }

  const systemPrompt = `You are an expert in HR competency frameworks and skill analysis.
Analyze the provided text (job description, project description, goal, etc.) and extract relevant skills.
For each skill, determine if it matches an existing skill in the registry or is a new skill.

Existing skills in the registry:
${existingCapabilities.map(c => `- ${c.name} (${c.code})`).join("\n") || "None"}

Categorize skills as: technical, functional, behavioral, leadership, or core.
Rate the proficiency level required: 1 (basic), 2 (intermediate), 3 (advanced), 4 (expert), 5 (master).`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this text and extract skills:\n\n${text}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_skills",
            description: "Returns extracted skills from text",
            parameters: {
              type: "object",
              properties: {
                skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      code: { type: "string" },
                      category: { type: "string", enum: ["technical", "functional", "behavioral", "leadership", "core"] },
                      required_level: { type: "integer", minimum: 1, maximum: 5 },
                      confidence: { type: "number", minimum: 0, maximum: 1 },
                      existing_match_id: { type: "string", nullable: true },
                      is_new: { type: "boolean" },
                      context: { type: "string" },
                    },
                    required: ["name", "code", "category", "required_level", "confidence", "is_new"],
                  },
                },
              },
              required: ["skills"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "extract_skills" } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", errorText);
    throw new Error("Failed to infer skills from text");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    return { skills: [] };
  }

  return JSON.parse(toolCall.function.arguments);
}

// deno-lint-ignore no-explicit-any
async function detectDuplicates(capability: any, existingCapabilities: any[], apiKey: string) {
  console.log("Detecting duplicates for:", capability.name);

  if (!existingCapabilities || existingCapabilities.length === 0) {
    return { has_duplicates: false, similar_capabilities: [] };
  }

  const systemPrompt = `You are an expert at detecting duplicate or similar skills/competencies in organizations.
Compare the new capability against existing ones and identify potential duplicates or overlaps.
Consider semantic similarity, synonyms, and related concepts.
A capability is considered a duplicate if:
- It has the same intent with 70%+ similarity
- It measures the same skill with different wording
- It would create redundancy in the capability registry`;

  const capabilitiesContext = existingCapabilities.map(c => `- ${c.name} (${c.code})`).join("\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `New Capability:\nName: ${capability.name}\nCode: ${capability.code}\nDescription: ${capability.description || "None"}\n\nExisting Capabilities:\n${capabilitiesContext}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "detect_duplicates",
            description: "Returns duplicate detection results",
            parameters: {
              type: "object",
              properties: {
                has_duplicates: { type: "boolean" },
                similar_capabilities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      code: { type: "string" },
                      similarity_percentage: { type: "integer", minimum: 0, maximum: 100 },
                      reason: { type: "string" },
                      recommendation: { type: "string", enum: ["merge", "keep_both", "rename", "use_existing"] },
                    },
                    required: ["name", "code", "similarity_percentage", "reason", "recommendation"],
                  },
                },
              },
              required: ["has_duplicates", "similar_capabilities"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "detect_duplicates" } },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to detect duplicates");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    return { has_duplicates: false, similar_capabilities: [] };
  }

  return JSON.parse(toolCall.function.arguments);
}

// deno-lint-ignore no-explicit-any
async function suggestSynonyms(capability: any, apiKey: string) {
  console.log("Suggesting synonyms for:", capability.name);

  const systemPrompt = `You are an expert in skills taxonomy and HR terminology.
Generate synonyms and alternative names for the given skill/competency.
Include:
- Common industry variations
- Regional terminology differences
- Acronyms and abbreviations
- Related but not identical terms`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Capability: ${capability.name}\nType: ${capability.type}\nDescription: ${capability.description || "None"}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "suggest_synonyms",
            description: "Returns synonym suggestions",
            parameters: {
              type: "object",
              properties: {
                synonyms: {
                  type: "array",
                  items: { type: "string" },
                },
                related_terms: {
                  type: "array",
                  items: { type: "string" },
                },
                common_abbreviations: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["synonyms", "related_terms"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "suggest_synonyms" } },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to suggest synonyms");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    return { synonyms: [], related_terms: [] };
  }

  return JSON.parse(toolCall.function.arguments);
}

// deno-lint-ignore no-explicit-any
async function suggestAdjacentSkills(capability: any, apiKey: string, supabase: any, companyId?: string) {
  console.log("Suggesting adjacent skills for:", capability.name);

  // Fetch existing skills
  let existingSkills: string[] = [];
  if (companyId) {
    const { data } = await supabase
      .from("skills_competencies")
      .select("name")
      .or(`company_id.eq.${companyId},company_id.is.null`)
      .eq("status", "active")
      .eq("type", "SKILL")
      .neq("id", capability.id);
    existingSkills = (data || []).map((s: { name: string }) => s.name);
  }

  const systemPrompt = `You are an expert in skills development and career paths.
Suggest adjacent skills that are commonly learned together or that complement the given skill.
Consider:
- Prerequisite skills
- Skills that build upon this one
- Complementary skills in the same domain
- Skills from related domains that enhance effectiveness

Existing skills in the organization:
${existingSkills.slice(0, 50).join(", ") || "None"}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Skill: ${capability.name}\nDescription: ${capability.description || "None"}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "suggest_adjacent_skills",
            description: "Returns adjacent skill suggestions",
            parameters: {
              type: "object",
              properties: {
                prerequisite_skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      reason: { type: "string" },
                      exists_in_registry: { type: "boolean" },
                    },
                    required: ["name", "reason"],
                  },
                },
                next_skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      reason: { type: "string" },
                      exists_in_registry: { type: "boolean" },
                    },
                    required: ["name", "reason"],
                  },
                },
                complementary_skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      reason: { type: "string" },
                      exists_in_registry: { type: "boolean" },
                    },
                    required: ["name", "reason"],
                  },
                },
              },
              required: ["prerequisite_skills", "next_skills", "complementary_skills"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "suggest_adjacent_skills" } },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to suggest adjacent skills");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    return { prerequisite_skills: [], next_skills: [], complementary_skills: [] };
  }

  return JSON.parse(toolCall.function.arguments);
}

// deno-lint-ignore no-explicit-any
async function analyzeCapabilityGap(employeeId: string, jobProfileId: string, apiKey: string, supabase: any) {
  console.log("Analyzing capability gap for employee:", employeeId);

  // Fetch employee capabilities
  const { data: employeeEvidence } = await supabase
    .from("competency_evidence")
    .select(`
      competency_id,
      proficiency_level,
      confidence_score,
      validation_status,
      skills_competencies!inner(id, name, code, type, category)
    `)
    .eq("employee_id", employeeId)
    .eq("validation_status", "validated");

  // Fetch job requirements
  const { data: jobRequirements } = await supabase
    .from("job_competencies")
    .select(`
      id,
      competency_id,
      required_level,
      is_primary,
      skills_competencies!job_competencies_competency_id_fkey(id, name, code, type, category)
    `)
    .eq("job_id", jobProfileId);

  // Build context for AI analysis
  const employeeSkills = (employeeEvidence || []).map((e: any) => ({
    name: e.skills_competencies?.name,
    level: e.proficiency_level,
    confidence: e.confidence_score,
  }));

  const requirements = (jobRequirements || []).map((r: any) => ({
    name: r.skills_competencies?.name,
    required_level: r.required_level,
    is_primary: r.is_primary,
  }));

  const systemPrompt = `You are an expert in talent development and capability gap analysis.
Analyze the employee's current capabilities against job requirements.
Provide specific development recommendations for closing identified gaps.
Prioritize mandatory/primary requirements over optional ones.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Employee Capabilities:\n${JSON.stringify(employeeSkills, null, 2)}\n\nJob Requirements:\n${JSON.stringify(requirements, null, 2)}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_gap",
            description: "Returns capability gap analysis with recommendations",
            parameters: {
              type: "object",
              properties: {
                overall_readiness_percentage: { type: "integer", minimum: 0, maximum: 100 },
                critical_gaps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      capability_name: { type: "string" },
                      current_level: { type: "integer" },
                      required_level: { type: "integer" },
                      priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                      development_time_estimate: { type: "string" },
                    },
                    required: ["capability_name", "current_level", "required_level", "priority"],
                  },
                },
                strengths: {
                  type: "array",
                  items: { type: "string" },
                },
                development_recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      capability_name: { type: "string" },
                      recommendation: { type: "string" },
                      learning_resources: { type: "array", items: { type: "string" } },
                      estimated_effort: { type: "string" },
                    },
                    required: ["capability_name", "recommendation"],
                  },
                },
                summary: { type: "string" },
              },
              required: ["overall_readiness_percentage", "critical_gaps", "strengths", "development_recommendations", "summary"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "analyze_gap" } },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze capability gap");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    return { error: "No analysis generated" };
  }

  return JSON.parse(toolCall.function.arguments);
}

// deno-lint-ignore no-explicit-any
async function generateProficiencyIndicators(capability: any, apiKey: string) {
  console.log("Generating proficiency indicators for:", capability.name);

  const systemPrompt = `You are an expert in competency framework design.
Generate behavioral indicators for each proficiency level of the given capability.
Create 5 levels with clear, observable behavioral descriptions.
Ensure progression is clear and each level builds upon the previous.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Capability: ${capability.name}\nType: ${capability.type}\nDescription: ${capability.description || "None"}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_proficiency_levels",
            description: "Returns proficiency level definitions with behavioral indicators",
            parameters: {
              type: "object",
              properties: {
                levels: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      level: { type: "integer", minimum: 1, maximum: 5 },
                      name: { type: "string" },
                      description: { type: "string" },
                      behavioral_indicators: {
                        type: "array",
                        items: { type: "string" },
                      },
                      typical_experience: { type: "string" },
                    },
                    required: ["level", "name", "description", "behavioral_indicators"],
                  },
                },
              },
              required: ["levels"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_proficiency_levels" } },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate proficiency indicators");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    return { levels: [] };
  }

  return JSON.parse(toolCall.function.arguments);
}
