import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessSignalsRequest {
  action: 'process_cycle' | 'process_employee' | 'recalculate_signals' | 'get_signal_summary';
  cycleId?: string;
  employeeId?: string;
  companyId: string;
  forceRecalculate?: boolean;
}

// Signal type mappings for 360 questions
const SIGNAL_MAPPINGS: Record<string, string[]> = {
  'leadership_consistency': ['leadership', 'management', 'direction', 'lead', 'guide'],
  'collaboration': ['teamwork', 'cooperation', 'partnership', 'collaborate', 'team'],
  'influence': ['persuasion', 'impact', 'stakeholder', 'influence', 'convince'],
  'people_leadership': ['coaching', 'development', 'support', 'mentoring', 'develop', 'mentor'],
  'technical_excellence': ['expertise', 'technical', 'knowledge', 'skill', 'proficiency'],
  'strategic_thinking': ['strategy', 'planning', 'vision', 'future', 'strategic'],
  'customer_focus': ['customer', 'client', 'service', 'satisfaction'],
  'adaptability': ['change', 'flexibility', 'resilience', 'agility', 'adapt']
};

// Calculate confidence based on response quality
function calculateConfidence(
  responseCount: number,
  raterGroupCount: number,
  minResponses: number
): number {
  const responseConfidence = Math.min(1, responseCount / (minResponses * 2));
  const diversityConfidence = Math.min(1, raterGroupCount / 3);
  return Number(((responseConfidence * 0.6) + (diversityConfidence * 0.4)).toFixed(3));
}

// Detect potential bias in responses
function detectBias(
  raterBreakdown: Record<string, { avg: number; count: number }>,
  overallAvg: number
): { level: string; factors: string[] } {
  const factors: string[] = [];
  let maxDeviation = 0;

  for (const [group, data] of Object.entries(raterBreakdown)) {
    const deviation = Math.abs(data.avg - overallAvg);
    if (deviation > maxDeviation) maxDeviation = deviation;
    
    if (deviation > 1.5) {
      factors.push(`${group} ratings deviate significantly (${deviation.toFixed(1)} points)`);
    }
    
    if (data.count === 1) {
      factors.push(`Only one ${group} rater - limited perspective`);
    }
  }

  const level = maxDeviation > 2 ? 'high' : maxDeviation > 1 ? 'medium' : 'low';
  return { level, factors };
}

// Map question text to signal types
function mapQuestionToSignals(questionText: string, categoryName?: string): string[] {
  const text = (questionText + ' ' + (categoryName || '')).toLowerCase();
  const matchedSignals: string[] = [];

  for (const [signalCode, keywords] of Object.entries(SIGNAL_MAPPINGS)) {
    if (keywords.some(kw => text.includes(kw))) {
      matchedSignals.push(signalCode);
    }
  }

  return matchedSignals.length > 0 ? matchedSignals : ['general'];
}

async function processCycleSignals(
  supabase: any,
  cycleId: string,
  companyId: string
): Promise<{ processed: number; employees: string[] }> {
  console.log(`[feedback-signal-processor] Processing cycle ${cycleId}`);

  // Get cycle details
  const { data: cycle, error: cycleError } = await supabase
    .from('feedback_360_cycles')
    .select('*')
    .eq('id', cycleId)
    .single();

  if (cycleError || !cycle) {
    throw new Error(`Cycle not found: ${cycleId}`);
  }

  // Get all completed requests for this cycle
  const { data: requests, error: requestsError } = await supabase
    .from('feedback_360_requests')
    .select(`
      id,
      subject_employee_id,
      rater_id,
      category:feedback_360_rater_categories(id, name, weight)
    `)
    .eq('cycle_id', cycleId)
    .eq('status', 'completed');

  if (requestsError) throw requestsError;

  if (!requests || requests.length === 0) {
    console.log(`[feedback-signal-processor] No completed requests for cycle ${cycleId}`);
    return { processed: 0, employees: [] };
  }

  // Group by subject employee
  const employeeRequests: Record<string, any[]> = {};
  for (const req of requests) {
    if (!employeeRequests[req.subject_employee_id]) {
      employeeRequests[req.subject_employee_id] = [];
    }
    employeeRequests[req.subject_employee_id].push(req);
  }

  // Get signal definitions
  const { data: signalDefs } = await supabase
    .from('talent_signal_definitions')
    .select('*')
    .or(`company_id.eq.${companyId},company_id.is.null`)
    .eq('is_active', true);

  const processedEmployees: string[] = [];
  const anonymityThreshold = cycle.anonymity_threshold || 3;

  // Process each employee
  for (const [employeeId, empRequests] of Object.entries(employeeRequests)) {
    if (empRequests.length < anonymityThreshold) {
      console.log(`[feedback-signal-processor] Skipping ${employeeId} - insufficient responses (${empRequests.length}/${anonymityThreshold})`);
      continue;
    }

    // Get all responses for this employee
    const requestIds = empRequests.map((r: any) => r.id);
    const { data: responses } = await supabase
      .from('feedback_360_responses')
      .select(`
        *,
        question:feedback_360_questions(id, question_text, category_id)
      `)
      .in('request_id', requestIds);

    if (!responses || responses.length === 0) {
      console.log(`[feedback-signal-processor] No responses for employee ${employeeId}`);
      continue;
    }

    // Calculate signal values
    const signalData: Record<string, {
      values: number[];
      raterBreakdown: Record<string, { sum: number; count: number }>;
      evidenceIds: string[];
    }> = {};

    for (const response of responses) {
      if (!response.rating_value) continue;

      const questionText = response.question?.question_text || '';
      const mappedSignals = mapQuestionToSignals(questionText);
      const request = empRequests.find((r: any) => r.id === response.request_id);
      const raterCategory = request?.category?.name || 'unknown';
      const categoryWeight = request?.category?.weight || 1;

      for (const signalCode of mappedSignals) {
        if (!signalData[signalCode]) {
          signalData[signalCode] = { values: [], raterBreakdown: {}, evidenceIds: [] };
        }

        // Apply category weight
        signalData[signalCode].values.push(response.rating_value * categoryWeight);
        signalData[signalCode].evidenceIds.push(response.id);

        if (!signalData[signalCode].raterBreakdown[raterCategory]) {
          signalData[signalCode].raterBreakdown[raterCategory] = { sum: 0, count: 0 };
        }
        signalData[signalCode].raterBreakdown[raterCategory].sum += response.rating_value;
        signalData[signalCode].raterBreakdown[raterCategory].count += 1;
      }
    }

    // Mark previous snapshots as not current
    await supabase
      .from('talent_signal_snapshots')
      .update({ is_current: false, valid_until: new Date().toISOString() })
      .eq('employee_id', employeeId)
      .eq('source_cycle_id', cycleId)
      .eq('is_current', true);

    // Create signal snapshots
    for (const [signalCode, data] of Object.entries(signalData)) {
      const signalDef = signalDefs?.find((d: any) => d.code === signalCode);
      if (!signalDef) {
        console.log(`[feedback-signal-processor] Signal definition not found for ${signalCode}`);
        continue;
      }

      if (data.values.length === 0) continue;

      const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;
      const normalizedScore = Math.min(100, Math.max(0, (avg / 5) * 100)); // Assuming 5-point scale

      // Calculate rater breakdown
      const raterBreakdown: Record<string, { avg: number; count: number }> = {};
      for (const [category, breakdown] of Object.entries(data.raterBreakdown)) {
        raterBreakdown[category] = {
          avg: Number((breakdown.sum / breakdown.count).toFixed(2)),
          count: breakdown.count
        };
      }

      const confidence = calculateConfidence(
        data.values.length,
        Object.keys(raterBreakdown).length,
        anonymityThreshold
      );

      const biasAnalysis = detectBias(raterBreakdown, avg);

      // Get current version
      const { data: existingSnapshots } = await supabase
        .from('talent_signal_snapshots')
        .select('snapshot_version')
        .eq('employee_id', employeeId)
        .eq('signal_definition_id', signalDef.id)
        .eq('source_cycle_id', cycleId)
        .order('snapshot_version', { ascending: false })
        .limit(1);

      const newVersion = (existingSnapshots?.[0]?.snapshot_version || 0) + 1;

      // Create snapshot
      const { data: snapshot, error: snapshotError } = await supabase
        .from('talent_signal_snapshots')
        .insert({
          employee_id: employeeId,
          company_id: companyId,
          signal_definition_id: signalDef.id,
          source_cycle_id: cycleId,
          source_type: '360_cycle',
          snapshot_version: newVersion,
          signal_value: Number(normalizedScore.toFixed(2)),
          raw_score: Number(avg.toFixed(2)),
          normalized_score: Number(normalizedScore.toFixed(2)),
          confidence_score: confidence,
          bias_risk_level: biasAnalysis.level,
          bias_factors: biasAnalysis.factors,
          evidence_count: data.values.length,
          evidence_summary: {
            response_count: data.values.length,
            rater_group_count: Object.keys(raterBreakdown).length,
            score_range: { 
              min: Number(Math.min(...data.values).toFixed(2)), 
              max: Number(Math.max(...data.values).toFixed(2)) 
            }
          },
          rater_breakdown: raterBreakdown,
          is_current: true
        })
        .select()
        .single();

      if (snapshotError) {
        console.error(`[feedback-signal-processor] Error creating snapshot:`, snapshotError);
        continue;
      }

      // Create evidence links (batch insert for performance)
      const evidenceLinks = data.evidenceIds.map(evidenceId => ({
        snapshot_id: snapshot.id,
        source_table: 'feedback_360_responses',
        source_id: evidenceId,
        contribution_weight: Number((1 / data.evidenceIds.length).toFixed(4))
      }));

      if (evidenceLinks.length > 0) {
        await supabase.from('signal_evidence_links').insert(evidenceLinks);
      }
    }

    processedEmployees.push(employeeId);
  }

  // Update cycle status
  await supabase
    .from('feedback_360_cycles')
    .update({
      signal_processing_status: 'completed',
      signals_processed_at: new Date().toISOString()
    })
    .eq('id', cycleId);

  console.log(`[feedback-signal-processor] Processed ${processedEmployees.length} employees for cycle ${cycleId}`);
  return { processed: processedEmployees.length, employees: processedEmployees };
}

async function getSignalSummary(
  supabase: any,
  employeeId: string,
  companyId: string
): Promise<any> {
  const { data: snapshots } = await supabase
    .from('talent_signal_snapshots')
    .select(`
      *,
      signal_definition:talent_signal_definitions(code, name, signal_category, description)
    `)
    .eq('employee_id', employeeId)
    .eq('is_current', true)
    .order('signal_value', { ascending: false });

  if (!snapshots || snapshots.length === 0) {
    return {
      employee_id: employeeId,
      signals: [],
      by_category: {},
      summary: {
        overall_score: null,
        signal_count: 0,
        avg_confidence: 0,
        strengths: [],
        development_areas: []
      }
    };
  }

  // Group by category
  const byCategory: Record<string, any[]> = {};
  for (const snapshot of snapshots) {
    const category = snapshot.signal_definition?.signal_category || 'general';
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push(snapshot);
  }

  // Calculate overall scores
  const allValues = snapshots.map((s: any) => s.signal_value).filter(Boolean);
  const overallAvg = allValues.length > 0 
    ? Number((allValues.reduce((a: number, b: number) => a + b, 0) / allValues.length).toFixed(2))
    : null;

  const confidenceValues = snapshots.map((s: any) => s.confidence_score).filter(Boolean);
  const avgConfidence = confidenceValues.length > 0
    ? Number((confidenceValues.reduce((a: number, b: number) => a + b, 0) / confidenceValues.length).toFixed(3))
    : 0;

  return {
    employee_id: employeeId,
    signals: snapshots,
    by_category: byCategory,
    summary: {
      overall_score: overallAvg,
      signal_count: allValues.length,
      avg_confidence: avgConfidence,
      strengths: snapshots
        .filter((s: any) => s.signal_value >= 80)
        .map((s: any) => ({
          name: s.signal_definition?.name,
          score: s.signal_value,
          confidence: s.confidence_score
        })),
      development_areas: snapshots
        .filter((s: any) => s.signal_value < 60)
        .map((s: any) => ({
          name: s.signal_definition?.name,
          score: s.signal_value,
          confidence: s.confidence_score
        }))
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: ProcessSignalsRequest = await req.json();
    const { action, cycleId, employeeId, companyId } = request;

    console.log(`[feedback-signal-processor] Action: ${action}, Company: ${companyId}`);

    if (!companyId) {
      return new Response(
        JSON.stringify({ error: 'companyId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'process_cycle':
        if (!cycleId) {
          return new Response(
            JSON.stringify({ error: 'cycleId required for process_cycle action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const result = await processCycleSignals(supabase, cycleId, companyId);
        return new Response(
          JSON.stringify({ success: true, ...result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_signal_summary':
        if (!employeeId) {
          return new Response(
            JSON.stringify({ error: 'employeeId required for get_signal_summary action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const summary = await getSignalSummary(supabase, employeeId, companyId);
        return new Response(
          JSON.stringify(summary),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: `Invalid action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[feedback-signal-processor] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
