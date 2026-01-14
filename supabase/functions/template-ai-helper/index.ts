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
    const { action, categoryName, content, existingTemplates } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "suggest_templates") {
      systemPrompt = `You are an HR support template expert. Generate professional canned response templates for HR helpdesk tickets. 
Templates should be:
- Professional and empathetic in tone
- Clear and actionable
- Include appropriate placeholder variables like {employee_name}, {ticket_number}, {category}, {submitted_date}, {company_name}
- Suitable for HR support agents to quickly respond to common inquiries`;

      userPrompt = `Generate 3-5 canned response template suggestions for the "${categoryName}" category.

${existingTemplates?.length ? `Existing templates in this category (avoid duplicates):
${existingTemplates.map((t: string) => `- ${t}`).join('\n')}` : ''}

For each template, provide:
1. A concise, descriptive title
2. Professional content with placeholders
3. Brief use case description

Format your response as JSON array:
[
  {
    "title": "Template Title",
    "content": "Template content with {employee_name} placeholders...",
    "useCase": "When to use this template"
  }
]`;
    } else if (action === "suggest_email_templates") {
      systemPrompt = `You are an HR notification email template expert. Generate professional reminder and notification email templates for HR systems.
Templates should be:
- Professional yet friendly in tone
- Clear and action-oriented with specific calls to action
- Include appropriate placeholders using double curly braces: {{employee_first_name}}, {{employee_full_name}}, {{manager_name}}, {{company_name}}, {{event_title}}, {{event_date}}, {{days_until}}, {{cycle_name}}
- Suitable for automated HR reminder and notification systems
- Well-structured with proper greeting, body, and sign-off`;

      userPrompt = `Generate 3 email template suggestions for the "${categoryName}" reminder/notification category.

${existingTemplates?.length ? `Existing templates in this category (AVOID creating similar ones):
${existingTemplates.map((t: string) => `- ${t}`).join('\n')}` : 'No existing templates in this category yet.'}

For each template, provide:
1. title: A concise, descriptive name for the template
2. subject: Email subject line with placeholders where appropriate
3. content: Full email body with placeholders, proper formatting with line breaks
4. useCase: Brief description of when this template should be used

Format your response as JSON array:
[
  {
    "title": "Template Name",
    "subject": "Subject line with {{placeholders}}",
    "content": "Dear {{employee_first_name}},\\n\\nEmail body content...\\n\\nBest regards,\\n{{company_name}} HR Team",
    "useCase": "Use when..."
  }
]`;
    } else if (action === "improve_content") {
      systemPrompt = `You are an expert HR communications editor. Improve template content to be more professional, clear, and empathetic while maintaining the original meaning and any placeholder variables.`;

      userPrompt = `Improve this HR canned response template content:

"""
${content}
"""

Requirements:
- Keep all existing placeholder variables (e.g., {employee_name}, {ticket_number})
- Improve clarity and professionalism
- Ensure empathetic tone appropriate for employee communications
- Keep the response concise but complete

Return only the improved content, no explanations.`;
    } else if (action === "improve_email_content") {
      systemPrompt = `You are an expert HR communications editor. Improve email template content to be more professional, clear, and engaging while maintaining the original meaning and all placeholder variables.`;

      userPrompt = `Improve this HR notification email template:

"""
${content}
"""

Requirements:
- Keep ALL existing placeholder variables exactly as they are (e.g., {{employee_first_name}}, {{event_date}})
- Improve clarity, professionalism, and engagement
- Ensure friendly yet professional tone appropriate for employee communications
- Maintain proper email structure (greeting, body, call-to-action, sign-off)
- Keep the response concise but complete

Return only the improved content, no explanations or markdown formatting.`;
    } else {
      throw new Error("Invalid action");
    }

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
          { role: "user", content: userPrompt },
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
          JSON.stringify({ error: "AI credits needed. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    let result;
    if (action === "suggest_templates" || action === "suggest_email_templates") {
      // Parse JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          result = { suggestions: JSON.parse(jsonMatch[0]) };
        } catch {
          result = { suggestions: [], raw: aiResponse };
        }
      } else {
        result = { suggestions: [], raw: aiResponse };
      }
    } else {
      result = { improvedContent: aiResponse.trim() };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("template-ai-helper error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
