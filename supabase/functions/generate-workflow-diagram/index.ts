import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowStep {
  step_order: number;
  name: string;
  description: string | null;
  approver_type: string;
  use_reporting_line: boolean;
  requires_signature: boolean;
  escalation_action: string | null;
  escalation_hours: number | null;
  can_delegate: boolean;
}

interface WorkflowTemplate {
  name: string;
  code: string;
  category: string;
  description: string | null;
  requires_signature: boolean;
  requires_letter: boolean;
  auto_terminate_hours: number | null;
  allow_return_to_previous: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template, steps } = await req.json() as { 
      template: WorkflowTemplate; 
      steps: WorkflowStep[] 
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about the workflow
    const stepsDescription = steps
      .sort((a, b) => a.step_order - b.step_order)
      .map(step => {
        let desc = `Step ${step.step_order}: "${step.name}" - Approver: ${step.approver_type}`;
        if (step.use_reporting_line) {
          desc += ` (Uses reporting line)`;
        }
        if (step.requires_signature) {
          desc += ` [Requires signature]`;
        }
        if (step.escalation_action && step.escalation_hours) {
          desc += ` [Escalation: ${step.escalation_action} after ${step.escalation_hours}h]`;
        }
        if (step.can_delegate) {
          desc += ` [Can delegate]`;
        }
        return desc;
      })
      .join('\n');

    const systemPrompt = `You are an expert at creating Mermaid.js flowchart diagrams for business workflows.
Generate a clear, professional Mermaid flowchart diagram based on the workflow template provided.

Rules:
1. Use the 'flowchart TD' (top-down) direction
2. Use descriptive node IDs like 'start', 'step1', 'decision1', 'end_approve', 'end_reject'
3. Style the nodes appropriately:
   - Start node: Use ((Start)) for circle
   - End nodes: Use ((Approved)) or ((Rejected)) for circles
   - Regular steps: Use [Step Name] for rectangles
   - Decision/conditional steps: Use {Condition?} for diamonds
4. Include escalation paths if defined
5. Show the flow clearly from start to possible end states
6. Keep labels concise but informative
7. Add styling at the end for visual appeal:
   - classDef startEnd fill:#10b981,stroke:#059669,color:#fff
   - classDef approval fill:#3b82f6,stroke:#2563eb,color:#fff
   - classDef decision fill:#f59e0b,stroke:#d97706,color:#fff
   - classDef reject fill:#ef4444,stroke:#dc2626,color:#fff

Return ONLY the Mermaid diagram code, no explanation or markdown code blocks.`;

    const userPrompt = `Generate a Mermaid flowchart for this workflow:

Workflow: "${template.name}" (${template.code})
Category: ${template.category}
Description: ${template.description || 'No description'}
${template.requires_signature ? '- Requires signature' : ''}
${template.requires_letter ? '- Requires letter generation' : ''}
${template.auto_terminate_hours ? `- Auto-terminates after ${template.auto_terminate_hours} hours` : ''}
${template.allow_return_to_previous ? '- Allows return to previous step' : ''}

Steps:
${stepsDescription || 'No steps defined - create a generic approval workflow diagram'}

Create a professional flowchart showing the complete approval process from submission to final outcome (approved/rejected).`;

    console.log('Generating diagram for workflow:', template.name);

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
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const mermaidCode = data.choices?.[0]?.message?.content?.trim();

    if (!mermaidCode) {
      throw new Error("No diagram generated");
    }

    // Clean up the response - remove any markdown code blocks if present
    const cleanedCode = mermaidCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Generated Mermaid code:', cleanedCode.substring(0, 200) + '...');

    return new Response(
      JSON.stringify({ 
        mermaidCode: cleanedCode,
        workflowName: template.name 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating workflow diagram:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate diagram" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
