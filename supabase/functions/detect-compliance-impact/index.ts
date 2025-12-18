import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPLIANCE_KEYWORDS = [
  "gdpr", "privacy", "data protection", "pii", "personal data",
  "audit", "compliance", "regulatory", "legal", "policy",
  "security", "access control", "authorization", "authentication",
  "retention", "deletion", "consent", "reporting", "statutory",
  "tax", "payroll", "leave", "overtime", "minimum wage",
  "termination", "disciplinary", "grievance", "health safety"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { releaseId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch feature changes for the release
    let query = supabase
      .from("enablement_feature_changes")
      .select(`
        id,
        feature_code,
        module_code,
        change_type,
        change_description,
        change_severity
      `);

    if (releaseId) {
      query = query.eq("release_id", releaseId);
    }

    const { data: changes, error: changesError } = await query;

    if (changesError) {
      console.error("Error fetching changes:", changesError);
    }

    // Fetch features with compliance-related content
    const { data: features } = await supabase
      .from("application_features")
      .select(`
        feature_code,
        feature_name,
        description,
        workflow_steps,
        application_modules!inner(module_code, module_name)
      `)
      .eq("is_active", true);

    // Filter features with compliance keywords
    const complianceFeatures = features?.filter(f => {
      const text = `${f.feature_name} ${f.description || ""} ${JSON.stringify(f.workflow_steps || {})}`.toLowerCase();
      return COMPLIANCE_KEYWORDS.some(keyword => text.includes(keyword));
    }) || [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ 
          complianceFeatures: complianceFeatures.map(f => ({
            feature_code: f.feature_code,
            feature_name: f.feature_name,
            module_name: (f.application_modules as any)?.module_name,
          })),
          analysis: null 
        }),
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
            content: `You are a compliance analyst for HRplus Cerebra HRIS. Identify compliance-related changes that require documentation updates.

Focus areas:
- GDPR/Data Protection changes
- Payroll/Tax regulation updates
- Leave law modifications
- Health & Safety requirements
- Employment law changes
- Audit trail requirements
- Security policy updates

Output a JSON object:
{
  "complianceImpacts": [
    {
      "feature_code": "...",
      "regulation_area": "GDPR"|"Tax"|"Leave"|"H&S"|"Employment"|"Audit"|"Security",
      "impact_level": "critical"|"high"|"medium"|"low",
      "description": "what changed",
      "documentation_required": ["list of docs needed"],
      "stakeholders": ["who needs to know"],
      "deadline": "urgency indicator"
    }
  ],
  "summary": "Overview of compliance impacts",
  "immediate_actions": ["urgent items"],
  "training_updates_needed": ["training materials to update"]
}`
          },
          {
            role: "user",
            content: `Analyze these features and changes for compliance impact:

Feature Changes:
${JSON.stringify(changes?.slice(0, 20) || [], null, 2)}

Compliance-Related Features:
${JSON.stringify(complianceFeatures.slice(0, 20).map(f => ({
  feature_code: f.feature_code,
  feature_name: f.feature_name,
  description: f.description,
  module: (f.application_modules as any)?.module_name,
})), null, 2)}`
          }
        ],
      }),
    });

    let analysis = null;
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch {
        analysis = { summary: content };
      }
    }

    return new Response(
      JSON.stringify({ 
        complianceFeatures: complianceFeatures.map(f => ({
          feature_code: f.feature_code,
          feature_name: f.feature_name,
          module_name: (f.application_modules as any)?.module_name,
        })),
        changes: changes?.length || 0,
        analysis 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in detect-compliance-impact:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
