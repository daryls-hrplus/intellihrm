import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODULE_MAP: Record<string, { moduleName: string; description: string }> = {
  LND: { moduleName: "Learning & Development", description: "Training programs, course management, and employee development" },
  PERF: { moduleName: "Performance Management", description: "Performance reviews, appraisals, and continuous feedback" },
  GOALS: { moduleName: "Goals & OKRs", description: "Goal setting, OKRs, and strategic alignment" },
  WFM: { moduleName: "Workforce Management", description: "Workforce planning, scheduling, and capacity management" },
  TIME: { moduleName: "Time & Attendance", description: "Time tracking, attendance management, and overtime" },
  BEN: { moduleName: "Benefits Administration", description: "Employee benefits enrollment and management" },
  COMP: { moduleName: "Compensation Management", description: "Salary planning, merit increases, and compensation cycles" },
  SEC: { moduleName: "Security & Access", description: "Role-based access control and security settings" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moduleCode }: { moduleCode: string } = await req.json();

    if (!moduleCode || !MODULE_MAP[moduleCode]) {
      return new Response(
        JSON.stringify({ error: "Invalid module code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const moduleInfo = MODULE_MAP[moduleCode];

    const prompt = `You are generating a Quick Start Guide for the "${moduleInfo.moduleName}" module of an enterprise HRMS system called HRplus.

Module Description: ${moduleInfo.description}

Generate a complete Quick Start Guide with the following JSON structure. Be specific to ${moduleInfo.moduleName} functionality:

{
  "roles": [
    {
      "role": "role_code",
      "title": "Role Title",
      "icon": "UserCog|Settings|Briefcase|MonitorCog|Users",
      "responsibility": "What this role does in this module"
    }
  ],
  "prerequisites": [
    {
      "id": "prereq_1",
      "title": "Prerequisite Title",
      "description": "What needs to be done first",
      "required": true,
      "module": "Related module code if applicable"
    }
  ],
  "pitfalls": [
    {
      "issue": "Common mistake or problem",
      "prevention": "How to avoid it"
    }
  ],
  "contentStrategyQuestions": [
    "Strategic question to consider before implementation"
  ],
  "setupSteps": [
    {
      "id": "step_1",
      "title": "Step Title",
      "description": "What to do",
      "estimatedTime": "15-30 minutes",
      "substeps": ["Substep 1", "Substep 2"],
      "expectedResult": "What success looks like"
    }
  ],
  "rolloutOptions": [
    {
      "id": "pilot",
      "label": "Pilot Launch",
      "description": "Start with one department"
    },
    {
      "id": "phased",
      "label": "Phased Rollout",
      "description": "Roll out by department over time"
    },
    {
      "id": "full",
      "label": "Full Launch",
      "description": "Company-wide rollout"
    }
  ],
  "rolloutRecommendation": "Recommended approach and why",
  "verificationChecks": [
    "Check item to verify setup is complete"
  ],
  "integrationChecklist": [
    {
      "id": "integration_1",
      "label": "Integration item",
      "required": true
    }
  ],
  "successMetrics": [
    {
      "metric": "Metric name",
      "target": "Target value (e.g., >80%)",
      "howToMeasure": "How to measure this"
    }
  ]
}

Requirements:
- Generate 3-4 roles appropriate for ${moduleInfo.moduleName}
- Generate 3-5 prerequisites
- Generate 4-6 common pitfalls
- Generate 4-6 strategic questions
- Generate 5-8 setup steps with realistic time estimates
- Generate 3 rollout options (pilot, phased, full)
- Generate 5-8 verification checks
- Generate 4-6 integration items
- Generate 3-5 success metrics with measurable targets

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert HR systems implementation consultant. Generate precise, actionable Quick Start Guide content." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse the JSON from the response
    let generatedContent;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      generatedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent,
        moduleCode,
        moduleName: moduleInfo.moduleName
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-quickstart-content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
