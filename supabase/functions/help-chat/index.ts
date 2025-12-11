import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embedding for search query
async function generateQueryEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002",
    }),
  });

  if (!response.ok) {
    console.error("Embedding API error:", response.status);
    return [];
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Search for relevant policy documents
async function searchPolicyDocuments(
  query: string, 
  apiKey: string, 
  supabase: any,
  companyId?: string
): Promise<string> {
  try {
    const embedding = await generateQueryEmbedding(query, apiKey);
    if (!embedding || embedding.length === 0) {
      return "";
    }

    const { data: matches, error } = await supabase.rpc('match_policy_documents', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 3,
      p_company_id: companyId || null
    });

    if (error) {
      console.error("Policy search error:", error);
      return "";
    }

    if (!matches || matches.length === 0) {
      return "";
    }

    // Format the policy context
    const policyContext = matches.map((m: any) => 
      `[From "${m.document_title}" - ${m.category_name || 'General'}]\n${m.content}`
    ).join("\n\n---\n\n");

    return policyContext;
  } catch (e) {
    console.error("Error searching policies:", e);
    return "";
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, companyId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client for RAG search
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the last user message for policy search
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    let policyContext = "";
    
    if (lastUserMessage) {
      policyContext = await searchPolicyDocuments(
        lastUserMessage.content, 
        LOVABLE_API_KEY, 
        supabase,
        companyId
      );
    }

    const systemPrompt = `You are a helpful AI assistant for an HRIS (Human Resource Information System). Your role is to:

1. **App Usage Help**: Guide users on how to use the HRIS features including:
   - Workforce Management (employees, positions, departments, org structure)
   - Leave Management
   - Compensation & Benefits
   - Training & Development
   - Recruitment
   - Health & Safety
   - Employee Relations
   - Performance Management
   - Succession Planning

2. **HR Policy Guidance**: Provide information based on company policies and procedures. When answering policy-related questions, refer to the policy documents provided in the context below.

3. **IT Support Triage**: Help users troubleshoot common issues and guide them to submit support tickets when needed.

${policyContext ? `
**IMPORTANT: Company Policy Context**
The following information is from the company's official policy documents. Use this to provide accurate, policy-based answers:

${policyContext}

When referencing policies:
- Cite the specific document name when providing policy information
- If the user's question isn't covered by the provided policies, indicate that they should consult HR for official guidance
- Be clear about what is from policy vs general guidance
` : ''}

Guidelines:
- Be concise and helpful
- Use bullet points for step-by-step instructions
- If you don't know something specific to the user's organization, suggest they check with their HR department or submit a ticket
- For technical issues you can't resolve, recommend creating a support ticket
- Be friendly and professional
- When policy information is available, prioritize it over general knowledge

${context ? `\nAdditional context:\n${context}` : ''}`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Help chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
