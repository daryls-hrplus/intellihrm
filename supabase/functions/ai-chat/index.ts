import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST_PER_1K_TOKENS = 0.002; // $0.002 per 1K tokens

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is enabled and within budget
    const { data: budgetCheck } = await supabase.rpc("check_ai_budget", { p_user_id: user.id });
    
    if (budgetCheck && budgetCheck.length > 0) {
      const budget = budgetCheck[0];
      if (!budget.is_within_budget) {
        return new Response(JSON.stringify({ 
          error: "Monthly AI budget exceeded",
          monthly_budget: budget.monthly_budget,
          monthly_spent: budget.monthly_spent,
          budget_tier: budget.budget_tier
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check if user is enabled
    const { data: userSettings } = await supabase
      .from("ai_user_settings")
      .select("is_enabled")
      .eq("user_id", user.id)
      .single();

    if (userSettings && !userSettings.is_enabled) {
      return new Response(JSON.stringify({ error: "AI access is disabled for your account" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, feature } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
          { 
            role: "system", 
            content: "You are a helpful HR assistant for the HRplus Cerebra system. Help users with HR-related questions, explain policies, assist with workflows, and provide guidance on using the system. Be professional, concise, and helpful." 
          },
          ...messages,
        ],
        stream: false,
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
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "";
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    
    // Calculate cost
    const estimatedCost = (usage.total_tokens / 1000) * COST_PER_1K_TOKENS;

    // Log usage to database
    const now = new Date();
    await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      model: "google/gemini-2.5-flash",
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      feature: feature || "chat",
      usage_year: now.getFullYear(),
      usage_month: now.getMonth() + 1,
      estimated_cost_usd: estimatedCost,
    });

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      usage: {
        ...usage,
        estimated_cost_usd: estimatedCost
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
