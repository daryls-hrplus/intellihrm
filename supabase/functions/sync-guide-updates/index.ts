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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for Enablement Hub changes to sync with guide...");

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString();

    // Check for recent enablement-related changes
    const { data: recentFeatureChanges } = await supabase
      .from("application_features")
      .select("feature_code, feature_name, description, updated_at")
      .gte("updated_at", startDate)
      .ilike("feature_code", "%ENABLEMENT%")
      .order("updated_at", { ascending: false });

    const { data: recentModuleChanges } = await supabase
      .from("application_modules")
      .select("module_code, module_name, description, updated_at")
      .gte("updated_at", startDate)
      .eq("module_code", "enablement")
      .order("updated_at", { ascending: false });

    // Check for new AI tools or content types
    const { data: contentStatusChanges } = await supabase
      .from("enablement_content_status")
      .select("feature_code, documentation_status, updated_at")
      .gte("updated_at", startDate)
      .order("updated_at", { ascending: false })
      .limit(20);

    // Get existing guide update log or create new one
    const { data: existingLog } = await supabase
      .from("enablement_guide_updates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    const lastUpdateDate = existingLog?.[0]?.created_at 
      ? new Date(existingLog[0].created_at) 
      : new Date(0);

    // Filter to only changes since last update
    const newFeatureChanges = recentFeatureChanges?.filter(
      f => new Date(f.updated_at) > lastUpdateDate
    ) || [];

    const newModuleChanges = recentModuleChanges?.filter(
      m => new Date(m.updated_at) > lastUpdateDate
    ) || [];

    const hasChanges = newFeatureChanges.length > 0 || newModuleChanges.length > 0;

    if (!hasChanges) {
      return new Response(
        JSON.stringify({ 
          hasChanges: false,
          message: "No new changes detected since last sync",
          lastSyncDate: existingLog?.[0]?.created_at || null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to generate guide update recommendations
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let guideUpdates = null;

    if (LOVABLE_API_KEY) {
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
              content: `You are a technical writer for HRplus Cerebra HRIS. Based on feature and module changes, generate user guide updates.

Return a JSON object with:
{
  "sections_to_update": [
    {
      "section": "section name",
      "change_type": "new|modified|deprecated",
      "summary": "Brief summary of change",
      "suggested_content": "New or updated content for the guide"
    }
  ],
  "changelog_entry": "A formatted changelog entry for this update",
  "priority": "critical|high|medium|low"
}`
            },
            {
              role: "user",
              content: `Generate guide updates for these Enablement Hub changes:

FEATURE CHANGES:
${JSON.stringify(newFeatureChanges, null, 2)}

MODULE CHANGES:
${JSON.stringify(newModuleChanges, null, 2)}`
            }
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || "";
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            guideUpdates = JSON.parse(jsonMatch[0]);
          }
        } catch {
          guideUpdates = { changelog_entry: content };
        }
      }
    }

    // Log the update check
    const { error: insertError } = await supabase
      .from("enablement_guide_updates")
      .insert({
        change_summary: guideUpdates?.changelog_entry || `${newFeatureChanges.length} feature changes, ${newModuleChanges.length} module changes`,
        feature_changes: newFeatureChanges,
        module_changes: newModuleChanges,
        suggested_updates: guideUpdates?.sections_to_update || [],
        status: "pending_review",
      });

    if (insertError) {
      console.error("Error logging guide update:", insertError);
    }

    return new Response(
      JSON.stringify({ 
        hasChanges: true,
        featureChanges: newFeatureChanges,
        moduleChanges: newModuleChanges,
        guideUpdates,
        message: "Guide updates generated. Review and apply as needed.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in sync-guide-updates:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
