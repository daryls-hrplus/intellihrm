import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessRequest {
  action: 
    | "calculate_aggregate"
    | "apply_recency_decay"
    | "identify_expiring"
    | "generate_validation_nudges"
    | "process_training_completion"
    | "process_appraisal_evidence";
  employeeId?: string;
  companyId?: string;
  capabilityId?: string;
  evidenceData?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json() as ProcessRequest;
    const { action, employeeId, companyId, capabilityId, evidenceData } = body;
    console.log(`Processing evidence action: ${action}`);

    let result: unknown;

    switch (action) {
      case "calculate_aggregate":
        result = await calculateAggregateProficiency(employeeId!, capabilityId!, supabase);
        break;
      case "apply_recency_decay":
        result = await applyRecencyDecay(companyId!, supabase);
        break;
      case "identify_expiring":
        result = await identifyExpiringSkills(companyId!, supabase);
        break;
      case "generate_validation_nudges":
        result = await generateValidationNudges(companyId!, supabase);
        break;
      case "process_training_completion":
        result = await processTrainingCompletion(evidenceData, supabase);
        break;
      case "process_appraisal_evidence":
        result = await processAppraisalEvidence(evidenceData, supabase);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Evidence Processor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function calculateAggregateProficiency(employeeId: string, capabilityId: string, supabase: any) {
  console.log(`Calculating aggregate proficiency for employee ${employeeId}, capability ${capabilityId}`);

  // Fetch all evidence for this employee and capability
  const { data: evidence, error } = await supabase
    .from("capability_evidence")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("capability_id", capabilityId)
    .neq("validation_status", "rejected")
    .order("effective_from", { ascending: false });

  if (error) throw error;
  if (!evidence || evidence.length === 0) {
    return { aggregate_level: null, confidence: 0, sources_count: 0 };
  }

  // Weight by source type and recency
  const sourceWeights: Record<string, number> = {
    certification: 1.0,
    formal_assessment: 0.95,
    manager_assessment: 0.85,
    "360_feedback": 0.80,
    training_completion: 0.75,
    project_history: 0.70,
    self_declared: 0.50,
    ai_inference: 0.40,
  };

  const now = new Date();
  let totalWeight = 0;
  let weightedSum = 0;
  let maxConfidence = 0;

  for (const ev of evidence) {
    // Calculate recency factor (decay over 2 years)
    const effectiveDate = new Date(ev.effective_from);
    const monthsAgo = (now.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const recencyFactor = Math.max(0.3, 1 - (monthsAgo / 24)); // Min 30% weight after 2 years

    // Get source weight
    const sourceWeight = sourceWeights[ev.evidence_source] || 0.5;

    // Validation bonus
    const validationBonus = ev.validation_status === "validated" ? 1.2 : 1.0;

    // Calculate effective weight
    const effectiveWeight = sourceWeight * recencyFactor * validationBonus * (ev.confidence_score || 0.5);

    totalWeight += effectiveWeight;
    weightedSum += ev.proficiency_level * effectiveWeight;
    maxConfidence = Math.max(maxConfidence, ev.confidence_score || 0);
  }

  const aggregateLevel = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
  const aggregateConfidence = Math.min(1, (totalWeight / evidence.length) * (evidence.length > 2 ? 1.1 : 1));

  return {
    aggregate_level: aggregateLevel,
    confidence: Math.round(aggregateConfidence * 100) / 100,
    sources_count: evidence.length,
    latest_evidence_date: evidence[0]?.effective_from,
    sources_breakdown: evidence.reduce((acc: Record<string, number>, ev: any) => {
      acc[ev.evidence_source] = (acc[ev.evidence_source] || 0) + 1;
      return acc;
    }, {}),
  };
}

// deno-lint-ignore no-explicit-any
async function applyRecencyDecay(companyId: string, supabase: any) {
  console.log(`Applying recency decay for company ${companyId}`);

  const now = new Date();
  const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);

  // Find old evidence that needs decay applied
  const { data: oldEvidence, error } = await supabase
    .from("capability_evidence")
    .select(`
      id,
      confidence_score,
      effective_from,
      capability_id,
      employee_id,
      capabilities!inner(company_id)
    `)
    .eq("capabilities.company_id", companyId)
    .lt("effective_from", twoYearsAgo.toISOString())
    .gt("confidence_score", 0.3);

  if (error) throw error;

  let updatedCount = 0;

  for (const ev of oldEvidence || []) {
    const effectiveDate = new Date(ev.effective_from);
    const monthsAgo = (now.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // Apply decay: reduce confidence by 5% per month after 24 months
    const decayFactor = Math.max(0.3, 1 - ((monthsAgo - 24) * 0.05));
    const newConfidence = Math.max(0.3, (ev.confidence_score || 1) * decayFactor);

    if (newConfidence < ev.confidence_score) {
      const { error: updateError } = await supabase
        .from("capability_evidence")
        .update({ confidence_score: newConfidence, updated_at: now.toISOString() })
        .eq("id", ev.id);

      if (!updateError) updatedCount++;
    }
  }

  return {
    processed_count: oldEvidence?.length || 0,
    updated_count: updatedCount,
    processed_at: now.toISOString(),
  };
}

// deno-lint-ignore no-explicit-any
async function identifyExpiringSkills(companyId: string, supabase: any) {
  console.log(`Identifying expiring skills for company ${companyId}`);

  const now = new Date();
  const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Find evidence that will expire in the next 3 months
  const { data: expiringEvidence, error } = await supabase
    .from("capability_evidence")
    .select(`
      id,
      employee_id,
      capability_id,
      proficiency_level,
      expires_at,
      evidence_source,
      capabilities!inner(id, name, code, company_id),
      profiles!capability_evidence_employee_id_fkey(id, full_name, email)
    `)
    .eq("capabilities.company_id", companyId)
    .not("expires_at", "is", null)
    .lte("expires_at", threeMonthsFromNow.toISOString())
    .gt("expires_at", now.toISOString())
    .eq("validation_status", "validated");

  if (error) throw error;

  // Find already expired
  const { data: expiredEvidence, error: expiredError } = await supabase
    .from("capability_evidence")
    .select(`
      id,
      employee_id,
      capability_id,
      proficiency_level,
      expires_at,
      capabilities!inner(id, name, code, company_id),
      profiles!capability_evidence_employee_id_fkey(id, full_name, email)
    `)
    .eq("capabilities.company_id", companyId)
    .not("expires_at", "is", null)
    .lt("expires_at", now.toISOString())
    .neq("validation_status", "expired");

  if (expiredError) throw expiredError;

  // Update expired evidence status
  for (const ev of expiredEvidence || []) {
    await supabase
      .from("capability_evidence")
      .update({ validation_status: "expired", updated_at: now.toISOString() })
      .eq("id", ev.id);
  }

  return {
    expiring_soon: (expiringEvidence || []).map((ev: any) => ({
      evidence_id: ev.id,
      employee_id: ev.employee_id,
      employee_name: ev.profiles?.full_name,
      employee_email: ev.profiles?.email,
      capability_id: ev.capability_id,
      capability_name: ev.capabilities?.name,
      capability_code: ev.capabilities?.code,
      current_level: ev.proficiency_level,
      expires_at: ev.expires_at,
      days_until_expiry: Math.ceil((new Date(ev.expires_at).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    })),
    recently_expired: (expiredEvidence || []).map((ev: any) => ({
      evidence_id: ev.id,
      employee_id: ev.employee_id,
      employee_name: ev.profiles?.full_name,
      capability_name: ev.capabilities?.name,
      expired_at: ev.expires_at,
    })),
    expired_count_updated: expiredEvidence?.length || 0,
  };
}

// deno-lint-ignore no-explicit-any
async function generateValidationNudges(companyId: string, supabase: any) {
  console.log(`Generating validation nudges for company ${companyId}`);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Find pending evidence older than 30 days
  const { data: stalePending, error } = await supabase
    .from("capability_evidence")
    .select(`
      id,
      employee_id,
      capability_id,
      proficiency_level,
      evidence_source,
      created_at,
      capabilities!inner(id, name, code, company_id),
      profiles!capability_evidence_employee_id_fkey(id, full_name, manager_id)
    `)
    .eq("capabilities.company_id", companyId)
    .eq("validation_status", "pending")
    .lt("created_at", thirtyDaysAgo.toISOString());

  if (error) throw error;

  // Group by manager for efficient nudging
  const nudgesByManager: Record<string, any[]> = {};

  for (const ev of stalePending || []) {
    const managerId = ev.profiles?.manager_id;
    if (managerId) {
      if (!nudgesByManager[managerId]) {
        nudgesByManager[managerId] = [];
      }
      nudgesByManager[managerId].push({
        evidence_id: ev.id,
        employee_id: ev.employee_id,
        employee_name: ev.profiles?.full_name,
        capability_name: ev.capabilities?.name,
        evidence_source: ev.evidence_source,
        pending_since: ev.created_at,
        days_pending: Math.floor((Date.now() - new Date(ev.created_at).getTime()) / (24 * 60 * 60 * 1000)),
      });
    }
  }

  // Get manager details
  const managerIds = Object.keys(nudgesByManager);
  let managers: any[] = [];
  
  if (managerIds.length > 0) {
    const { data: managerData } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", managerIds);
    managers = managerData || [];
  }

  const nudges = managers.map((manager: any) => ({
    manager_id: manager.id,
    manager_name: manager.full_name,
    manager_email: manager.email,
    pending_validations: nudgesByManager[manager.id],
    total_pending: nudgesByManager[manager.id].length,
    priority: nudgesByManager[manager.id].length > 5 ? "high" : nudgesByManager[manager.id].length > 2 ? "medium" : "low",
  }));

  return {
    nudges,
    total_stale_pending: stalePending?.length || 0,
    managers_to_nudge: nudges.length,
    generated_at: new Date().toISOString(),
  };
}

// deno-lint-ignore no-explicit-any
async function processTrainingCompletion(evidenceData: any, supabase: any) {
  console.log("Processing training completion evidence:", evidenceData);

  const {
    employee_id,
    course_id,
    completion_date,
    score,
    certificate_url,
    competency_mappings,
  } = evidenceData;

  if (!employee_id || !course_id) {
    throw new Error("Missing required fields: employee_id and course_id");
  }

  // If competency_mappings not provided, fetch from course_competencies
  let mappings = competency_mappings;
  if (!mappings) {
    const { data: courseMappings } = await supabase
      .from("course_competencies")
      .select("competency_id, proficiency_level")
      .eq("course_id", course_id);
    mappings = courseMappings || [];
  }

  const createdEvidence: string[] = [];

  for (const mapping of mappings) {
    // Check if capability exists in capabilities table
    const { data: capability } = await supabase
      .from("capabilities")
      .select("id")
      .eq("id", mapping.competency_id)
      .single();

    if (capability) {
      const { data: newEvidence, error } = await supabase
        .from("capability_evidence")
        .insert({
          employee_id,
          capability_id: mapping.competency_id,
          evidence_source: "training_completion",
          proficiency_level: mapping.proficiency_level || 2,
          confidence_score: score ? score / 100 : 0.7,
          validation_status: "validated", // Training completions are auto-validated
          validated_at: new Date().toISOString(),
          effective_from: completion_date || new Date().toISOString(),
          evidence_reference: {
            course_id,
            completion_date,
            score,
            certificate_url,
          },
          notes: `Completed training course with ${score ? `${score}% score` : "pass"}`,
        })
        .select("id")
        .single();

      if (!error && newEvidence) {
        createdEvidence.push(newEvidence.id);
      }
    }
  }

  return {
    success: true,
    evidence_created: createdEvidence.length,
    evidence_ids: createdEvidence,
    processed_at: new Date().toISOString(),
  };
}

// deno-lint-ignore no-explicit-any
async function processAppraisalEvidence(evidenceData: any, supabase: any) {
  console.log("Processing appraisal evidence:", evidenceData);

  const {
    participant_id,
    cycle_id,
  } = evidenceData;

  if (!participant_id) {
    throw new Error("Missing required field: participant_id");
  }

  // Fetch appraisal scores
  const { data: scores, error } = await supabase
    .from("appraisal_scores")
    .select(`
      id,
      item_id,
      item_name,
      rating,
      comments,
      evaluation_type,
      appraisal_participants!inner(
        id,
        employee_id,
        cycle_id,
        appraisal_cycles!inner(company_id, end_date)
      )
    `)
    .eq("participant_id", participant_id)
    .eq("evaluation_type", "competency");

  if (error) throw error;
  if (!scores || scores.length === 0) {
    return { success: true, evidence_created: 0, message: "No competency scores found" };
  }

  const createdEvidence: string[] = [];
  const employeeId = scores[0].appraisal_participants?.employee_id;
  const cycleEndDate = scores[0].appraisal_participants?.appraisal_cycles?.end_date;

  for (const score of scores) {
    // Check if competency exists in capabilities table
    const { data: capability } = await supabase
      .from("capabilities")
      .select("id")
      .eq("id", score.item_id)
      .single();

    if (capability && score.rating) {
      const { data: newEvidence, error: insertError } = await supabase
        .from("capability_evidence")
        .insert({
          employee_id: employeeId,
          capability_id: score.item_id,
          evidence_source: "formal_assessment",
          proficiency_level: score.rating,
          confidence_score: 0.9, // High confidence for formal appraisals
          validation_status: "validated",
          validated_at: new Date().toISOString(),
          effective_from: cycleEndDate || new Date().toISOString(),
          evidence_reference: {
            appraisal_cycle_id: cycle_id,
            participant_id,
            score_id: score.id,
          },
          notes: score.comments || `Rated ${score.rating} in appraisal`,
        })
        .select("id")
        .single();

      if (!insertError && newEvidence) {
        createdEvidence.push(newEvidence.id);
      }
    }
  }

  return {
    success: true,
    evidence_created: createdEvidence.length,
    evidence_ids: createdEvidence,
    processed_at: new Date().toISOString(),
  };
}
