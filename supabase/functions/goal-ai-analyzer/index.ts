import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoalData {
  id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit_of_measure?: string;
  start_date?: string;
  due_date?: string;
  status?: string;
  category?: string;
  specific?: boolean;
  measurable?: boolean;
  achievable?: boolean;
  relevant?: boolean;
  time_bound?: boolean;
  company_id: string;
}

interface AnalysisRequest {
  action: "analyze_quality" | "detect_duplicates" | "infer_skills" | "suggest_templates" | "generate_coaching";
  goal?: GoalData;
  goals?: GoalData[];
  companyId?: string;
  managerId?: string;
  employeeId?: string;
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

    const { action, goal, goals, companyId, managerId, employeeId } = await req.json() as AnalysisRequest;
    console.log(`Processing goal AI action: ${action}`);

    let result: unknown;

    switch (action) {
      case "analyze_quality":
        result = await analyzeGoalQuality(goal!, LOVABLE_API_KEY, supabase);
        break;
      case "detect_duplicates":
        result = await detectDuplicates(goal!, goals!, LOVABLE_API_KEY);
        break;
      case "infer_skills":
        result = await inferSkills(goal!, LOVABLE_API_KEY, supabase);
        break;
      case "suggest_templates":
        result = await suggestTemplates(goal!, LOVABLE_API_KEY);
        break;
      case "generate_coaching":
        result = await generateCoachingNudges(companyId!, managerId!, employeeId, LOVABLE_API_KEY, supabase);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Goal AI Analyzer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function analyzeGoalQuality(goal: GoalData, apiKey: string, supabase: any) {
  console.log("Analyzing goal quality for:", goal.title);

  const systemPrompt = `You are an expert in goal-setting best practices, OKRs, and performance management. 
Analyze the provided goal and return a detailed quality assessment.

Evaluate based on these criteria:
1. Clarity (0-100): Is the goal clearly stated and easy to understand?
2. Specificity (0-100): Is it specific enough to act upon?
3. Measurability (0-100): Can progress be objectively measured?
4. Achievability (0-100): Is it realistic given context?
5. Relevance (0-100): Does it appear aligned with business objectives?

Also identify:
- Key improvement suggestions (max 5)
- Risk factors that might affect completion
- Overall quality score (0-100)`;

  const goalContext = `
Goal Title: ${goal.title}
Description: ${goal.description || "Not provided"}
Target Value: ${goal.target_value || "Not set"} ${goal.unit_of_measure || ""}
Current Value: ${goal.current_value || "Not set"}
Start Date: ${goal.start_date || "Not set"}
Due Date: ${goal.due_date || "Not set"}
Status: ${goal.status || "Not set"}
SMART Criteria Already Set:
- Specific: ${goal.specific ?? "Not defined"}
- Measurable: ${goal.measurable ?? "Not defined"}
- Achievable: ${goal.achievable ?? "Not defined"}
- Relevant: ${goal.relevant ?? "Not defined"}
- Time-bound: ${goal.time_bound ?? "Not defined"}
`;

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
        { role: "user", content: goalContext },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_goal_quality",
            description: "Returns a structured quality analysis of a goal",
            parameters: {
              type: "object",
              properties: {
                clarity_score: { type: "integer", minimum: 0, maximum: 100 },
                specificity_score: { type: "integer", minimum: 0, maximum: 100 },
                measurability_score: { type: "integer", minimum: 0, maximum: 100 },
                achievability_score: { type: "integer", minimum: 0, maximum: 100 },
                relevance_score: { type: "integer", minimum: 0, maximum: 100 },
                overall_quality_score: { type: "integer", minimum: 0, maximum: 100 },
                reasoning: { type: "string" },
                improvement_suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      area: { type: "string" },
                      suggestion: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                    },
                    required: ["area", "suggestion", "priority"],
                  },
                },
                risk_factors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      factor: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    },
                    required: ["factor", "severity"],
                  },
                },
                completion_risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
              },
              required: ["clarity_score", "specificity_score", "measurability_score", "achievability_score", "relevance_score", "overall_quality_score", "reasoning", "improvement_suggestions", "risk_factors", "completion_risk_level"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "analyze_goal_quality" } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", errorText);
    throw new Error("Failed to analyze goal quality");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall?.function?.arguments) {
    throw new Error("No analysis returned from AI");
  }

  const analysis = JSON.parse(toolCall.function.arguments);
  console.log("Quality analysis result:", analysis);

  // Store in database
  const { error: dbError } = await supabase
    .from("goal_ai_analyses")
    .upsert({
      goal_id: goal.id,
      company_id: goal.company_id,
      ai_quality_score: analysis.overall_quality_score,
      clarity_score: analysis.clarity_score,
      specificity_score: analysis.specificity_score,
      measurability_score: analysis.measurability_score,
      achievability_score: analysis.achievability_score,
      relevance_score: analysis.relevance_score,
      improvement_suggestions: analysis.improvement_suggestions,
      ai_reasoning: analysis.reasoning,
      risk_factors: analysis.risk_factors,
      completion_risk_level: analysis.completion_risk_level,
      model_used: "google/gemini-2.5-flash",
      confidence_score: 0.85,
      analyzed_at: new Date().toISOString(),
    }, { onConflict: "goal_id" });

  if (dbError) {
    console.error("Database error:", dbError);
  }

  return analysis;
}

async function detectDuplicates(goal: GoalData, existingGoals: GoalData[], apiKey: string) {
  console.log("Detecting duplicates for:", goal.title);

  if (!existingGoals || existingGoals.length === 0) {
    return { hasDuplicates: false, similarGoals: [] };
  }

  const systemPrompt = `You are an expert at detecting duplicate or highly similar goals in organizations.
Compare the new goal against existing goals and identify potential duplicates or overlaps.
Consider semantic similarity, not just exact matches.
A goal is considered a duplicate if:
- It has the same intent/outcome with 70%+ similarity
- It measures the same metric for the same scope
- It would create conflicting or redundant work`;

  const goalsContext = existingGoals.map(g => `- ${g.title}: ${g.description || "No description"}`).join("\n");

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
        { role: "user", content: `New Goal:\nTitle: ${goal.title}\nDescription: ${goal.description || "None"}\n\nExisting Goals:\n${goalsContext}` },
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
                similar_goals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      similarity_percentage: { type: "integer", minimum: 0, maximum: 100 },
                      reason: { type: "string" },
                      recommendation: { type: "string", enum: ["merge", "link_as_dependency", "proceed_anyway", "cancel"] },
                    },
                    required: ["title", "similarity_percentage", "reason", "recommendation"],
                  },
                },
              },
              required: ["has_duplicates", "similar_goals"],
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
    return { hasDuplicates: false, similarGoals: [] };
  }

  return JSON.parse(toolCall.function.arguments);
}

// deno-lint-ignore no-explicit-any
async function inferSkills(goal: GoalData, apiKey: string, supabase: any) {
  console.log("Inferring skills for:", goal.title);

  const systemPrompt = `You are an expert in competency frameworks and skill analysis.
Analyze the goal and infer what skills, competencies, and capabilities are required to achieve it.
Consider both technical skills and soft skills.
Categorize skills as: Technical, Leadership, Communication, Analytical, Interpersonal, or Domain-Specific.`;

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
        { role: "user", content: `Goal Title: ${goal.title}\nDescription: ${goal.description || "None"}\nCategory: ${goal.category || "General"}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "infer_skills",
            description: "Returns inferred skill requirements for a goal",
            parameters: {
              type: "object",
              properties: {
                skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      skill_name: { type: "string" },
                      skill_category: { type: "string", enum: ["Technical", "Leadership", "Communication", "Analytical", "Interpersonal", "Domain-Specific"] },
                      proficiency_level: { type: "string", enum: ["basic", "intermediate", "advanced", "expert"] },
                      importance: { type: "string", enum: ["required", "helpful", "optional"] },
                    },
                    required: ["skill_name", "skill_category", "proficiency_level", "importance"],
                  },
                },
              },
              required: ["skills"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "infer_skills" } },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to infer skills");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall?.function?.arguments) {
    return { skills: [] };
  }

  const result = JSON.parse(toolCall.function.arguments);

  // Store skills in database
  for (const skill of result.skills) {
    await supabase
      .from("goal_skill_requirements")
      .insert({
        goal_id: goal.id,
        company_id: goal.company_id,
        skill_name: skill.skill_name,
        skill_category: skill.skill_category,
        proficiency_level: skill.proficiency_level,
        ai_confidence: skill.importance === "required" ? 0.9 : skill.importance === "helpful" ? 0.7 : 0.5,
      });
  }

  return result;
}

async function suggestTemplates(goal: GoalData, apiKey: string) {
  console.log("Suggesting templates for:", goal.title);

  const systemPrompt = `You are an expert in performance metrics and goal frameworks.
Based on the goal description, suggest the most appropriate metric templates.
Consider common business metrics like: Revenue Target, Cost Reduction, Customer Satisfaction, 
Employee Engagement, Project Completion, Quality Score, Error Rate, Response Time, Training Completion, etc.
Also consider framework types: simple (single metric), composite (multiple sub-metrics), 
okr (objective with key results), delta (before/after improvement).`;

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
        { role: "user", content: `Goal Title: ${goal.title}\nDescription: ${goal.description || "None"}\nCategory: ${goal.category || "General"}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "suggest_templates",
            description: "Returns suggested metric templates for a goal",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      template_name: { type: "string" },
                      template_type: { type: "string", enum: ["simple", "composite", "okr", "delta"] },
                      confidence: { type: "integer", minimum: 0, maximum: 100 },
                      reasoning: { type: "string" },
                      suggested_target: { type: "string" },
                      unit_of_measure: { type: "string" },
                    },
                    required: ["template_name", "template_type", "confidence", "reasoning"],
                  },
                },
              },
              required: ["suggestions"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "suggest_templates" } },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to suggest templates");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall?.function?.arguments) {
    return { suggestions: [] };
  }

  return JSON.parse(toolCall.function.arguments);
}

// deno-lint-ignore no-explicit-any
async function generateCoachingNudges(
  companyId: string, 
  managerId: string, 
  employeeId: string | undefined, 
  apiKey: string, 
  supabase: any
) {
  console.log("Generating coaching nudges for manager:", managerId);

  // Fetch team goals data
  let query = supabase
    .from("performance_goals")
    .select(`
      id, title, description, progress_percentage, status, due_date, created_at, updated_at,
      employee_id, profiles!performance_goals_employee_id_fkey(full_name)
    `)
    .eq("company_id", companyId)
    .neq("status", "cancelled");

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data: goals, error } = await query;

  if (error) {
    console.error("Failed to fetch goals:", error);
    throw new Error("Failed to fetch goals data");
  }

  if (!goals || goals.length === 0) {
    return { nudges: [] };
  }

  // Analyze goals for coaching opportunities
  // deno-lint-ignore no-explicit-any
  const goalsContext = goals.map((g: any) => ({
    title: g.title,
    progress: g.progress_percentage || 0,
    status: g.status,
    dueDate: g.due_date,
    daysSinceUpdate: Math.floor((Date.now() - new Date(g.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
    employeeName: g.profiles?.full_name || "Unknown",
  }));

  const systemPrompt = `You are an expert manager coach. Analyze the team's goals and generate actionable coaching nudges.
Focus on:
1. Goals that haven't been updated recently (stale)
2. Goals at risk of missing deadlines
3. Recognition opportunities for ahead-of-schedule goals
4. Development suggestions for struggling goals
5. Workload concerns if someone has too many goals

Generate 3-5 high-value nudges maximum, prioritized by impact.`;

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
        { role: "user", content: `Team Goals Data:\n${JSON.stringify(goalsContext, null, 2)}\n\nToday's Date: ${new Date().toISOString().split("T")[0]}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_nudges",
            description: "Returns coaching nudges for a manager",
            parameters: {
              type: "object",
              properties: {
                nudges: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nudge_type: { type: "string", enum: ["check_in_reminder", "progress_concern", "recognition_opportunity", "development_suggestion", "workload_warning", "goal_quality", "alignment_gap"] },
                      title: { type: "string" },
                      message: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                      suggested_action: { type: "string" },
                      employee_name: { type: "string" },
                      goal_title: { type: "string" },
                    },
                    required: ["nudge_type", "title", "message", "priority", "suggested_action"],
                  },
                },
              },
              required: ["nudges"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_nudges" } },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate coaching nudges");
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall?.function?.arguments) {
    return { nudges: [] };
  }

  const result = JSON.parse(toolCall.function.arguments);

  // Store nudges in database
  // deno-lint-ignore no-explicit-any
  for (const nudge of result.nudges) {
    // Find matching goal and employee
    // deno-lint-ignore no-explicit-any
    const matchingGoal = goals.find((g: any) => g.title === nudge.goal_title);
    
    await supabase
      .from("goal_coaching_nudges")
      .insert({
        company_id: companyId,
        manager_id: managerId,
        employee_id: matchingGoal?.employee_id || null,
        goal_id: matchingGoal?.id || null,
        nudge_type: nudge.nudge_type,
        title: nudge.title,
        message: nudge.message,
        priority: nudge.priority,
        suggested_action: nudge.suggested_action,
        confidence_score: 0.8,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
  }

  return result;
}
