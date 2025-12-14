import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST_PER_1K_TOKENS = 0.002;

// Escalation topics that should prompt user to contact HR
const ESCALATION_TOPICS = [
  "termination", "fired", "firing", "let go",
  "legal matter", "lawsuit", "litigation",
  "harassment", "discrimination", "hostile work",
  "violence", "threat", "safety concern",
  "salary negotiation", "compensation dispute",
  "union", "strike", "collective bargaining",
  "disciplinary action", "written warning", "suspension",
  "grievance", "formal complaint"
];

// PII fields that should not be revealed without proper permissions
const PII_FIELDS = [
  "email", "phone", "mobile", "address", "street",
  "bank_account", "routing_number", "ssn", "social_security",
  "national_id", "passport", "salary", "wage", "compensation",
  "date_of_birth", "dob", "birth_date"
];

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

    // Get user profile and role
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, company_id")
      .eq("id", user.id)
      .single();

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const roles = userRoles?.map(r => r.role) || [];
    const isAdmin = roles.includes("admin");
    const isHrManager = roles.includes("hr_manager");
    const canViewPii = isAdmin || isHrManager;

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
    const userMessage = messages[messages.length - 1]?.content || "";

    // Check for escalation topics
    const lowerMessage = userMessage.toLowerCase();
    const triggeredEscalation = ESCALATION_TOPICS.some(topic => lowerMessage.includes(topic));

    // Check for PII requests
    const requestsPii = PII_FIELDS.some(field => lowerMessage.includes(field));

    // Fetch relevant context from policies, SOPs, knowledge base, and employee data
    let policyContext = "";
    let sopContext = "";
    let helpCenterContext = "";
    let employeeContext = "";

    // Detect if user is asking about an employee
    const employeeQueryPatterns = [
      /(?:about|info|information|details|profile|who is|tell me about|find|look up|search for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:'s|s')?\s+(?:profile|details|info|information|department|position|manager|email|phone)/gi,
    ];

    let employeeNames: string[] = [];
    for (const pattern of employeeQueryPatterns) {
      const matches = userMessage.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          employeeNames.push(match[1].trim());
        }
      }
    }

    // Also check for common name patterns in the message
    const namePattern = /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g;
    const potentialNames = [...userMessage.matchAll(namePattern)].map(m => `${m[1]} ${m[2]}`);
    employeeNames = [...new Set([...employeeNames, ...potentialNames])];

    // Query employee data if names detected
    if (employeeNames.length > 0) {
      try {
        for (const name of employeeNames.slice(0, 3)) { // Limit to 3 names
          const nameParts = name.split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ");

          // Query profiles with related data
          const { data: employees } = await supabase
            .from("profiles")
            .select(`
              id, first_name, last_name, employee_id, 
              employment_status, gender, nationality,
              email, phone_number, date_of_birth,
              hire_date, termination_date,
              company_id, department_id,
              companies:company_id (name),
              departments:department_id (name)
            `)
            .or(`and(first_name.ilike.%${firstName}%,last_name.ilike.%${lastName}%),and(first_name.ilike.%${lastName}%,last_name.ilike.%${firstName}%)`)
            .limit(5);

          if (employees && employees.length > 0) {
            for (const emp of employees) {
              // Build employee context respecting PII permissions
              let empInfo = `\n--- Employee: ${emp.first_name} ${emp.last_name} ---\n`;
              empInfo += `Employee ID: ${emp.employee_id || "N/A"}\n`;
              empInfo += `Employment Status: ${emp.employment_status || "N/A"}\n`;
              empInfo += `Company: ${(emp.companies as any)?.name || "N/A"}\n`;
              empInfo += `Department: ${(emp.departments as any)?.name || "N/A"}\n`;
              empInfo += `Hire Date: ${emp.hire_date || "N/A"}\n`;
              
              if (emp.termination_date) {
                empInfo += `Termination Date: ${emp.termination_date}\n`;
              }

              // Include PII only if user has permission
              if (canViewPii) {
                empInfo += `Email: ${emp.email || "N/A"}\n`;
                empInfo += `Phone: ${emp.phone_number || "N/A"}\n`;
                empInfo += `Date of Birth: ${emp.date_of_birth || "N/A"}\n`;
                empInfo += `Gender: ${emp.gender || "N/A"}\n`;
                empInfo += `Nationality: ${emp.nationality || "N/A"}\n`;
              } else {
                empInfo += `[PII fields hidden - user does not have permission to view personal information]\n`;
              }

              // Get current position if available
              try {
                const { data: positions } = await supabase
                  .from("employee_positions")
                  .select(`
                    is_primary, start_date, end_date,
                    positions:position_id (title, position_code)
                  `)
                  .eq("employee_id", emp.id)
                  .is("end_date", null)
                  .order("is_primary", { ascending: false })
                  .limit(1);

                if (positions && positions.length > 0) {
                  const pos = positions[0];
                  empInfo += `Current Position: ${(pos.positions as any)?.title || "N/A"}\n`;
                  empInfo += `Position Code: ${(pos.positions as any)?.position_code || "N/A"}\n`;
                  empInfo += `Position Start Date: ${pos.start_date || "N/A"}\n`;
                }
              } catch (e) {
                console.log("Position fetch error (non-critical):", e);
              }

              // Get manager info if available
              try {
                const { data: managerRelation } = await supabase
                  .from("employee_managers")
                  .select(`
                    manager:manager_id (first_name, last_name)
                  `)
                  .eq("employee_id", emp.id)
                  .eq("is_primary", true)
                  .is("end_date", null)
                  .single();

                if (managerRelation && managerRelation.manager) {
                  const mgr = managerRelation.manager as any;
                  empInfo += `Manager: ${mgr.first_name} ${mgr.last_name}\n`;
                }
              } catch (e) {
                // No manager found, that's ok
              }

              employeeContext += empInfo;
            }
          }
        }
      } catch (e) {
        console.log("Employee fetch error:", e);
      }
    }

    // Get policy documents context (existing RAG system)
    try {
      const { data: policyDocs } = await supabase
        .from("policy_documents")
        .select("title, content")
        .eq("is_active", true)
        .or(`is_global.eq.true,company_id.eq.${profile?.company_id}`)
        .limit(5);

      if (policyDocs && policyDocs.length > 0) {
        policyContext = policyDocs.map(d => `Policy: ${d.title}\n${d.content?.substring(0, 500) || ""}`).join("\n\n");
      }
    } catch (e) {
      console.log("Policy fetch error (non-critical):", e);
    }

    // Get SOP documents context
    try {
      const { data: sopDocs } = await supabase
        .from("sop_documents")
        .select("title, description, steps, task_type")
        .eq("is_active", true)
        .or(`is_global.eq.true,company_id.eq.${profile?.company_id}`)
        .limit(5);

      if (sopDocs && sopDocs.length > 0) {
        sopContext = sopDocs.map(d => {
          const stepsText = d.steps ? JSON.stringify(d.steps) : "";
          return `SOP: ${d.title}\nTask Type: ${d.task_type || "General"}\nDescription: ${d.description || ""}\nSteps: ${stepsText}`;
        }).join("\n\n");
      }
    } catch (e) {
      console.log("SOP fetch error (non-critical):", e);
    }

    // Get knowledge base articles (Help Center)
    try {
      const { data: kbArticles } = await supabase
        .from("knowledge_base_articles")
        .select("title, content, category")
        .eq("is_published", true)
        .limit(5);

      if (kbArticles && kbArticles.length > 0) {
        helpCenterContext = kbArticles.map(a => `Help Article: ${a.title}\nCategory: ${a.category || "General"}\n${a.content?.substring(0, 500) || ""}`).join("\n\n");
      }
    } catch (e) {
      console.log("Knowledge base fetch error (non-critical):", e);
    }

    // Build system prompt with guardrails
    const systemPrompt = `You are the HRplus Cerebra AI Assistant, a helpful HR assistant for the HRplus Cerebra HRIS system.

## YOUR ROLE AND GUIDELINES:

1. **Role-Based Access Control**: The current user has the following roles: ${roles.join(", ") || "employee"}. Respect access levels and only provide information appropriate for their role.

2. **Company Policies**: When answering questions, reference and adhere to company policies. Here are relevant policies:
${policyContext || "No specific policies loaded."}

3. **Standard Operating Procedures (SOPs)**: For task-related questions, guide users through the proper steps defined in SOPs:
${sopContext || "No specific SOPs loaded."}

4. **Help Center Guidelines**: Reference the Help Center for feature usage guidance:
${helpCenterContext || "No specific help articles loaded."}

5. **Employee Data**: When users ask about specific employees, use this information from the database:
${employeeContext || "No employee data found matching the query."}

6. **PII Protection**: ${canViewPii ? "This user has permission to view PII data." : "This user does NOT have permission to view PII (Personally Identifiable Information). Do NOT reveal specific emails, phone numbers, addresses, bank details, salaries, or other personal information of employees."}

7. **Escalation Protocol**: ${triggeredEscalation ? "⚠️ IMPORTANT: This query involves a sensitive topic. Include a clear recommendation to contact HR directly for official guidance and documentation." : "For sensitive topics like terminations, legal matters, harassment, discrimination, or salary disputes, always recommend contacting HR directly."}

8. **Response Disclaimer**: Always end your responses with a brief disclaimer that your guidance should be verified with HR for official decisions.

## IMPORTANT RULES:
- Be professional, concise, and helpful
- When answering questions about employees, use ONLY the employee data provided above - do not make up information
- When referencing SOPs, list the steps clearly
- When referencing policies, cite the policy name
- If you don't have information about something, say so clearly
- Never make up policies, procedures, or employee details - only reference what's provided
- For complex HR matters, always recommend speaking with HR directly
- Protect employee privacy at all times`;

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
          { role: "system", content: systemPrompt },
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

    const now = new Date();

    // Log usage to ai_usage_logs
    await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      company_id: profile?.company_id,
      model: "google/gemini-2.5-flash",
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      feature: feature || "chat",
      usage_year: now.getFullYear(),
      usage_month: now.getMonth() + 1,
      estimated_cost_usd: estimatedCost,
    });

    // Log AI interaction for audit (with guardrail tracking)
    await supabase.from("ai_interaction_logs").insert({
      user_id: user.id,
      company_id: profile?.company_id,
      user_message: userMessage,
      ai_response: assistantMessage,
      context_sources: {
        policies_used: !!policyContext,
        sops_used: !!sopContext,
        help_center_used: !!helpCenterContext,
      },
      tokens_used: usage.total_tokens,
      estimated_cost_usd: estimatedCost,
      user_role: roles.join(", ") || "employee",
      pii_accessed: requestsPii && canViewPii,
      escalation_triggered: triggeredEscalation,
    });

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      usage: {
        ...usage,
        estimated_cost_usd: estimatedCost
      },
      guardrails: {
        escalation_triggered: triggeredEscalation,
        pii_protected: requestsPii && !canViewPii
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
