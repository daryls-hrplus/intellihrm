import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface WebhookPayload {
  eventType: string;
  externalReference?: string;
  requisitionId?: string;
  candidate?: {
    externalId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    resumeUrl?: string;
    linkedinUrl?: string;
    currentCompany?: string;
    currentTitle?: string;
    yearsExperience?: number;
    skills?: string[];
    education?: any[];
  };
  application?: {
    externalId?: string;
    status?: string;
    stage?: string;
    coverLetter?: string;
    expectedSalary?: number;
    noticePeriodDays?: number;
    availableStartDate?: string;
    screeningAnswers?: any[];
  };
  hireDetails?: {
    hiredAt?: string;
    startDate?: string;
    salary?: number;
    position?: string;
  };
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const payload: WebhookPayload = await req.json();
    const webhookSecret = req.headers.get("x-webhook-secret");
    
    console.log(`Received webhook event: ${payload.eventType}`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    // Log the webhook
    const { data: webhookLog, error: logError } = await supabase
      .from("job_board_webhook_logs")
      .insert({
        event_type: payload.eventType,
        payload: payload,
        processed: false,
      })
      .select()
      .single();

    if (logError) {
      console.error("Error logging webhook:", logError);
    }

    // Validate webhook secret if configured
    let jobBoardConfig = null;
    if (payload.metadata?.companyId) {
      const { data: configs } = await supabase
        .from("job_board_configs")
        .select("*")
        .eq("company_id", payload.metadata.companyId)
        .eq("is_active", true);
      
      if (configs && configs.length > 0) {
        // Find matching config by secret if provided
        jobBoardConfig = webhookSecret
          ? configs.find(c => c.webhook_secret === webhookSecret)
          : configs[0];
      }
    }

    let result: any = { processed: true };

    switch (payload.eventType) {
      case "application.created":
      case "candidate.applied": {
        // Handle new application from job board
        if (!payload.candidate || !payload.requisitionId) {
          console.error("Missing candidate or requisitionId in payload");
          break;
        }

        // Get requisition to find company_id
        const { data: requisition } = await supabase
          .from("job_requisitions")
          .select("id, company_id")
          .eq("id", payload.requisitionId)
          .single();

        if (!requisition) {
          console.error("Requisition not found:", payload.requisitionId);
          break;
        }

        // Check if candidate already exists by email
        const { data: existingCandidate } = await supabase
          .from("candidates")
          .select("id")
          .eq("company_id", requisition.company_id)
          .eq("email", payload.candidate.email)
          .single();

        let candidateId: string;

        if (existingCandidate) {
          candidateId = existingCandidate.id;
          console.log("Found existing candidate:", candidateId);
        } else {
          // Create new candidate
          const { data: newCandidate, error: candError } = await supabase
            .from("candidates")
            .insert({
              company_id: requisition.company_id,
              external_candidate_id: payload.candidate.externalId,
              source: "job_board",
              source_job_board: jobBoardConfig?.name || "external",
              first_name: payload.candidate.firstName,
              last_name: payload.candidate.lastName,
              email: payload.candidate.email,
              phone: payload.candidate.phone,
              location: payload.candidate.location,
              resume_url: payload.candidate.resumeUrl,
              linkedin_url: payload.candidate.linkedinUrl,
              current_company: payload.candidate.currentCompany,
              current_title: payload.candidate.currentTitle,
              years_experience: payload.candidate.yearsExperience,
              skills: payload.candidate.skills || [],
              education: payload.candidate.education || [],
            })
            .select()
            .single();

          if (candError) {
            console.error("Error creating candidate:", candError);
            break;
          }

          candidateId = newCandidate!.id;
          console.log("Created new candidate:", candidateId);
        }

        // Check if application already exists
        const { data: existingApp } = await supabase
          .from("applications")
          .select("id")
          .eq("requisition_id", requisition.id)
          .eq("candidate_id", candidateId)
          .single();

        if (!existingApp) {
          // Create new application
          const { data: application, error: appError } = await supabase
            .from("applications")
            .insert({
              requisition_id: requisition.id,
              candidate_id: candidateId,
              external_application_id: payload.application?.externalId,
              source: "job_board",
              source_job_board: jobBoardConfig?.name || "external",
              status: "new",
              stage: "applied",
              cover_letter: payload.application?.coverLetter,
              expected_salary: payload.application?.expectedSalary,
              notice_period_days: payload.application?.noticePeriodDays,
              available_start_date: payload.application?.availableStartDate,
              screening_answers: payload.application?.screeningAnswers || [],
            })
            .select()
            .single();

          if (appError) {
            console.error("Error creating application:", appError);
          } else {
            console.log("Created new application:", application?.id);
            result.applicationId = application?.id;
          }
        } else {
          console.log("Application already exists:", existingApp.id);
          result.applicationId = existingApp.id;
        }

        result.candidateId = candidateId;
        break;
      }

      case "candidate.hired":
      case "application.hired": {
        // Handle hired candidate notification
        if (!payload.requisitionId || !payload.candidate?.email) {
          console.error("Missing requisitionId or candidate email for hire event");
          break;
        }

        // Find the application
        const { data: application, error: appError } = await supabase
          .from("applications")
          .select(`
            id,
            candidate_id,
            requisition_id,
            candidate:candidates(id, email, first_name, last_name)
          `)
          .eq("requisition_id", payload.requisitionId)
          .eq("candidate.email", payload.candidate.email)
          .single();

        if (appError || !application) {
          console.error("Application not found for hire event");
          break;
        }

        // Update application status to hired
        const { error: updateError } = await supabase
          .from("applications")
          .update({
            status: "hired",
            stage: "hired",
            hired_at: payload.hireDetails?.hiredAt || new Date().toISOString(),
          })
          .eq("id", application.id);

        if (updateError) {
          console.error("Error updating application to hired:", updateError);
        } else {
          console.log("Application marked as hired:", application.id);
        }

        // Update requisition filled count
        const { data: requisition } = await supabase
          .from("job_requisitions")
          .select("id, filled_count, openings")
          .eq("id", payload.requisitionId)
          .single();

        if (requisition) {
          const newFilledCount = (requisition.filled_count || 0) + 1;
          const newStatus = newFilledCount >= requisition.openings ? "filled" : "open";
          
          await supabase
            .from("job_requisitions")
            .update({
              filled_count: newFilledCount,
              status: newStatus,
              closed_date: newStatus === "filled" ? new Date().toISOString().split("T")[0] : null,
            })
            .eq("id", requisition.id);
        }

        result.applicationId = application.id;
        result.hired = true;
        break;
      }

      case "application.status_updated": {
        // Handle status update from job board
        if (!payload.application?.externalId && !payload.requisitionId) {
          console.error("Missing application identifier");
          break;
        }

        let query = supabase.from("applications").select("id");
        
        if (payload.application?.externalId) {
          query = query.eq("external_application_id", payload.application.externalId);
        }

        const { data: application } = await query.single();

        if (application && payload.application?.status) {
          await supabase
            .from("applications")
            .update({
              status: payload.application.status,
              stage: payload.application.stage || payload.application.status,
            })
            .eq("id", application.id);

          result.applicationId = application.id;
          result.statusUpdated = true;
        }
        break;
      }

      default:
        console.log("Unhandled webhook event type:", payload.eventType);
        result.unhandled = true;
    }

    // Mark webhook as processed
    if (webhookLog) {
      await supabase
        .from("job_board_webhook_logs")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq("id", webhookLog.id);
    }

    console.log("Webhook processed successfully:", result);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
