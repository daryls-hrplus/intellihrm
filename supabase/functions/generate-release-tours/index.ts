import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReleaseToursRequest {
  release_id: string;
  tour_type?: "walkthrough" | "spotlight" | "announcement";
  target_audience?: "new_users" | "managers" | "admins" | "all";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const request: ReleaseToursRequest = await req.json();
    
    console.log("Generating tours for release:", request.release_id);

    // Fetch release details
    const { data: release, error: releaseError } = await supabase
      .from("enablement_releases")
      .select("*")
      .eq("id", request.release_id)
      .single();

    if (releaseError || !release) {
      throw new Error("Release not found");
    }

    // Fetch content items for this release
    const { data: contentItems, error: contentError } = await supabase
      .from("enablement_content_status")
      .select("*")
      .eq("release_id", request.release_id);

    if (contentError) {
      throw new Error("Failed to fetch release content");
    }

    if (!contentItems || contentItems.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No content items found for this release",
          tours_generated: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedTours: any[] = [];
    const errors: string[] = [];

    // Generate tours for each content item
    for (const item of contentItems) {
      try {
        console.log("Generating tour for feature:", item.feature_code);

        const tourRequest = {
          module_code: item.module_code,
          module_name: item.module_code.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
          feature_code: item.feature_code,
          feature_name: item.feature_name,
          feature_description: item.change_description,
          route_path: `/${item.module_code.replace(/_/g, "-")}/${item.feature_code?.replace(/_/g, "-") || ""}`,
          tour_type: request.tour_type || "walkthrough",
          target_audience: request.target_audience || "all",
        };

        // Call the generate-tour-ai function
        const generateResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-tour-ai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify(tourRequest),
        });

        if (!generateResponse.ok) {
          const errorText = await generateResponse.text();
          console.error("Failed to generate tour for", item.feature_code, errorText);
          errors.push(`Failed to generate tour for ${item.feature_code}`);
          continue;
        }

        const tourResult = await generateResponse.json();
        
        if (!tourResult.success || !tourResult.tour) {
          errors.push(`Invalid response for ${item.feature_code}`);
          continue;
        }

        // Insert the tour into the database
        const { data: insertedTour, error: insertError } = await supabase
          .from("enablement_tours")
          .insert({
            tour_code: tourResult.tour.tour_code,
            tour_name: tourResult.tour.tour_name,
            description: tourResult.tour.description,
            module_code: item.module_code,
            feature_code: item.feature_code,
            tour_type: request.tour_type || "walkthrough",
            trigger_route: tourRequest.route_path,
            estimated_duration_seconds: tourResult.tour.estimated_duration_seconds,
            is_active: false,
            review_status: "draft",
            generated_by: "release_trigger",
            release_id: request.release_id,
            ai_generation_prompt: JSON.stringify(tourRequest),
          })
          .select()
          .single();

        if (insertError) {
          console.error("Failed to insert tour:", insertError);
          errors.push(`Failed to save tour for ${item.feature_code}`);
          continue;
        }

        // Insert the tour steps
        const steps = tourResult.tour.steps.map((step: any) => ({
          tour_id: insertedTour.id,
          step_order: step.step_order,
          target_selector: step.target_selector,
          title: step.title,
          content: step.content,
          placement: step.placement,
          highlight_type: step.highlight_type,
          action_type: step.action_type || null,
        }));

        const { error: stepsError } = await supabase
          .from("enablement_tour_steps")
          .insert(steps);

        if (stepsError) {
          console.error("Failed to insert steps:", stepsError);
          errors.push(`Failed to save steps for ${item.feature_code}`);
        }

        generatedTours.push({
          id: insertedTour.id,
          tour_code: insertedTour.tour_code,
          tour_name: insertedTour.tour_name,
          feature_code: item.feature_code,
          steps_count: steps.length,
        });

        console.log("Successfully generated tour:", insertedTour.tour_code);
      } catch (itemError) {
        console.error("Error processing item:", item.feature_code, itemError);
        errors.push(`Error processing ${item.feature_code}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        release_id: request.release_id,
        release_name: release.release_name,
        tours_generated: generatedTours.length,
        tours: generatedTours,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating release tours:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate tours",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
