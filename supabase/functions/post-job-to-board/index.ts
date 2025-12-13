import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobPostingRequest {
  requisitionId: string;
  jobBoardConfigId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { requisitionId, jobBoardConfigId }: JobPostingRequest = await req.json();

    console.log(`Posting job requisition ${requisitionId} to job board config ${jobBoardConfigId}`);

    // Fetch the job requisition
    const { data: requisition, error: reqError } = await supabase
      .from("job_requisitions")
      .select(`
        *,
        department:departments(name),
        hiring_manager:profiles!job_requisitions_hiring_manager_id_fkey(full_name, email),
        company:companies(name)
      `)
      .eq("id", requisitionId)
      .single();

    if (reqError || !requisition) {
      console.error("Error fetching requisition:", reqError);
      return new Response(
        JSON.stringify({ error: "Job requisition not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the job board configuration
    const { data: jobBoardConfig, error: configError } = await supabase
      .from("job_board_configs")
      .select("*")
      .eq("id", jobBoardConfigId)
      .single();

    if (configError || !jobBoardConfig) {
      console.error("Error fetching job board config:", configError);
      return new Response(
        JSON.stringify({ error: "Job board configuration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the job posting payload (generic format)
    const jobPayload = {
      externalReference: requisition.requisition_number,
      title: requisition.title,
      description: requisition.description,
      requirements: requisition.requirements,
      responsibilities: requisition.responsibilities,
      benefits: requisition.benefits,
      location: requisition.location,
      isRemote: requisition.is_remote,
      employmentType: requisition.employment_type,
      experienceLevel: requisition.experience_level,
      salaryMin: requisition.salary_min,
      salaryMax: requisition.salary_max,
      salaryCurrency: requisition.salary_currency,
      department: requisition.department?.name,
      company: requisition.company?.name,
      hiringManager: requisition.hiring_manager?.full_name,
      openings: requisition.openings,
      targetHireDate: requisition.target_hire_date,
      webhookUrl: `${supabaseUrl}/functions/v1/job-board-webhook`,
      metadata: {
        requisitionId: requisition.id,
        companyId: requisition.company_id,
      },
    };

    console.log("Sending job to external board:", jobBoardConfig.api_endpoint);

    // Post to the external job board
    let externalResponse;
    let externalData;
    let postingStatus = "posted";
    let errorMessage = null;

    try {
      // Get API key from config if available
      const apiKey = (jobBoardConfig.config as any)?.api_key;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      externalResponse = await fetch(jobBoardConfig.api_endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(jobPayload),
      });

      if (!externalResponse.ok) {
        const errorText = await externalResponse.text();
        console.error("Job board API error:", errorText);
        postingStatus = "failed";
        errorMessage = `API Error: ${externalResponse.status} - ${errorText.substring(0, 500)}`;
      } else {
        externalData = await externalResponse.json();
        console.log("Job board response:", externalData);
      }
    } catch (fetchError) {
      console.error("Failed to post to job board:", fetchError);
      postingStatus = "failed";
      errorMessage = `Connection error: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`;
    }

    // Check if posting already exists
    const { data: existingPosting } = await supabase
      .from("job_postings")
      .select("id")
      .eq("requisition_id", requisitionId)
      .eq("job_board_config_id", jobBoardConfigId)
      .single();

    // Create or update the job posting record
    const postingData = {
      requisition_id: requisitionId,
      job_board_config_id: jobBoardConfigId,
      external_job_id: externalData?.id || externalData?.jobId || null,
      posting_url: externalData?.url || externalData?.postingUrl || null,
      status: postingStatus,
      posted_at: postingStatus === "posted" ? new Date().toISOString() : null,
      last_synced_at: new Date().toISOString(),
      response_data: externalData || null,
      error_message: errorMessage,
    };

    let posting;
    if (existingPosting) {
      const { data, error } = await supabase
        .from("job_postings")
        .update(postingData)
        .eq("id", existingPosting.id)
        .select()
        .single();
      posting = data;
      if (error) console.error("Error updating posting:", error);
    } else {
      const { data, error } = await supabase
        .from("job_postings")
        .insert(postingData)
        .select()
        .single();
      posting = data;
      if (error) console.error("Error creating posting:", error);
    }

    // Update requisition status if successfully posted
    if (postingStatus === "posted" && requisition.status === "approved") {
      await supabase
        .from("job_requisitions")
        .update({ status: "open", posted_date: new Date().toISOString().split("T")[0] })
        .eq("id", requisitionId);
    }

    console.log("Job posting completed with status:", postingStatus);

    return new Response(
      JSON.stringify({
        success: postingStatus === "posted",
        posting,
        externalJobId: externalData?.id || externalData?.jobId,
        postingUrl: externalData?.url || externalData?.postingUrl,
        error: errorMessage,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in post-job-to-board function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
