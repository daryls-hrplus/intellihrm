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
    const { moduleCode, limit = 50 } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch resolved support tickets
    let ticketsQuery = supabase
      .from("helpdesk_tickets")
      .select("id, subject, description, resolution, category, priority, created_at")
      .eq("status", "resolved")
      .not("resolution", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (moduleCode && moduleCode !== "all") {
      ticketsQuery = ticketsQuery.eq("category", moduleCode);
    }

    const { data: tickets, error: ticketsError } = await ticketsQuery;

    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      // If helpdesk_tickets table doesn't exist, return sample data
      const sampleTickets = [
        {
          subject: "How do I request leave?",
          description: "I'm trying to submit a leave request but can't find the option.",
          resolution: "Navigate to ESS > Leave > Apply for Leave. Select leave type, dates, and submit.",
          category: "leave_management"
        },
        {
          subject: "Payslip not showing",
          description: "My payslip for this month is not appearing in the system.",
          resolution: "Payslips are published after payroll processing. Check with HR if payroll has been finalized.",
          category: "payroll"
        },
        {
          subject: "Cannot update personal information",
          description: "Getting an error when trying to update my address.",
          resolution: "Some fields require HR approval. Submit a profile change request through ESS.",
          category: "workforce"
        }
      ];

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ faqs: [], message: "Using sample data - no tickets found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a FAQ curator for HRplus Cerebra HRIS. Convert support tickets into clear, helpful FAQ entries.

Output a JSON array of FAQs:
[{
  "question": "Clear, searchable question",
  "answer": "Concise, helpful answer with steps if applicable",
  "category": "module category",
  "keywords": ["searchable", "keywords"],
  "related_features": ["feature_code1", "feature_code2"]
}]`
            },
            {
              role: "user",
              content: `Convert these sample support tickets into FAQ entries:\n${JSON.stringify(sampleTickets, null, 2)}`
            }
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || "";
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            return new Response(
              JSON.stringify({ faqs: JSON.parse(jsonMatch[0]), source: "sample" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch {}
      }

      return new Response(
        JSON.stringify({ faqs: [], message: "No tickets found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tickets || tickets.length === 0) {
      return new Response(
        JSON.stringify({ faqs: [], message: "No resolved tickets found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group similar tickets and generate FAQs
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a FAQ curator for HRplus Cerebra HRIS. Analyze support tickets, identify common themes, and generate comprehensive FAQ entries.

Guidelines:
- Group similar questions into single FAQ entries
- Write questions in natural language users would search for
- Provide clear, step-by-step answers when applicable
- Include troubleshooting tips where relevant
- Add relevant keywords for searchability

Output a JSON array of FAQs:
[{
  "question": "Clear, searchable question",
  "answer": "Concise, helpful answer with steps if applicable",
  "category": "module category",
  "keywords": ["searchable", "keywords"],
  "ticket_count": number of related tickets,
  "priority": "high"|"medium"|"low" based on frequency
}]`
          },
          {
            role: "user",
            content: `Analyze these resolved support tickets and generate FAQ entries:\n${JSON.stringify(tickets, null, 2)}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", aiResponse.status);
      return new Response(
        JSON.stringify({ error: "Failed to generate FAQs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let faqs = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        faqs = JSON.parse(jsonMatch[0]);
      }
    } catch {
      faqs = [];
    }

    return new Response(
      JSON.stringify({ faqs, ticketCount: tickets.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-faq-from-tickets:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
