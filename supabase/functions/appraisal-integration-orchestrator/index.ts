import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntegrationRule {
  id: string;
  name: string;
  trigger_event: string;
  condition_type: string;
  condition_operator: string;
  condition_value: number | null;
  condition_value_max: number | null;
  condition_category_codes: string[];
  condition_section: string | null;
  target_module: string;
  action_type: string;
  action_config: Record<string, unknown>;
  auto_execute: boolean;
  requires_approval: boolean;
  approval_role: string | null;
  execution_order: number;
}

interface TriggerData {
  participant_id: string;
  employee_id: string;
  company_id: string;
  overall_score: number | null;
  goal_score: number | null;
  competency_score: number | null;
  responsibility_score: number | null;
  values_score: number | null;
  performance_category_code: string | null;
  performance_category_name: string | null;
  cycle_id: string;
  cycle_name: string;
}

interface OrchestratorRequest {
  participant_id: string;
  trigger_event?: 'appraisal_finalized' | 'score_threshold' | 'category_assigned';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { participant_id, trigger_event = 'appraisal_finalized' }: OrchestratorRequest = await req.json();
    console.log(`Appraisal Integration Orchestrator - Participant: ${participant_id}, Event: ${trigger_event}`);

    // 1. Fetch participant with score breakdown and category
    const triggerData = await fetchTriggerData(supabase, participant_id);
    if (!triggerData) {
      throw new Error("Participant not found or has no score data");
    }

    console.log("Trigger data:", JSON.stringify(triggerData, null, 2));

    // 2. Load active integration rules for company
    const { data: rules, error: rulesError } = await supabase
      .from('appraisal_integration_rules')
      .select('*')
      .eq('company_id', triggerData.company_id)
      .eq('is_active', true)
      .order('execution_order', { ascending: true });

    if (rulesError) {
      console.error("Error fetching rules:", rulesError);
      throw rulesError;
    }

    console.log(`Found ${rules?.length || 0} active rules`);

    const results: Array<{
      rule_id: string;
      rule_name: string;
      target_module: string;
      action_result: string;
      target_record_id?: string;
      error_message?: string;
    }> = [];

    // 3. Evaluate and execute each rule
    for (const rule of (rules || []) as IntegrationRule[]) {
      try {
        const matches = evaluateRuleCondition(rule, triggerData, trigger_event);
        
        if (!matches) {
          console.log(`Rule ${rule.name} - condition not met, skipping`);
          continue;
        }

        console.log(`Rule ${rule.name} - condition matched, executing...`);

        let actionResult: { success: boolean; targetRecordId?: string; error?: string };

        if (rule.auto_execute && !rule.requires_approval) {
          // Execute immediately
          actionResult = await executeRuleAction(supabase, rule, triggerData);
          
          // Log execution
          await logIntegration(supabase, {
            rule_id: rule.id,
            participant_id,
            employee_id: triggerData.employee_id,
            company_id: triggerData.company_id,
            trigger_event,
            trigger_data: triggerData,
            target_module: rule.target_module,
            action_type: rule.action_type,
            action_config: rule.action_config,
            action_result: actionResult.success ? 'success' : 'failed',
            target_record_id: actionResult.targetRecordId,
            error_message: actionResult.error,
            executed_at: new Date().toISOString(),
            requires_approval: false
          });

          results.push({
            rule_id: rule.id,
            rule_name: rule.name,
            target_module: rule.target_module,
            action_result: actionResult.success ? 'success' : 'failed',
            target_record_id: actionResult.targetRecordId,
            error_message: actionResult.error
          });
        } else {
          // Queue for approval
          await logIntegration(supabase, {
            rule_id: rule.id,
            participant_id,
            employee_id: triggerData.employee_id,
            company_id: triggerData.company_id,
            trigger_event,
            trigger_data: triggerData,
            target_module: rule.target_module,
            action_type: rule.action_type,
            action_config: rule.action_config,
            action_result: 'pending_approval',
            requires_approval: true
          });

          results.push({
            rule_id: rule.id,
            rule_name: rule.name,
            target_module: rule.target_module,
            action_result: 'pending_approval'
          });
        }
      } catch (ruleError) {
        console.error(`Error executing rule ${rule.name}:`, ruleError);
        results.push({
          rule_id: rule.id,
          rule_name: rule.name,
          target_module: rule.target_module,
          action_result: 'failed',
          error_message: ruleError instanceof Error ? ruleError.message : 'Unknown error'
        });
      }
    }

    console.log("Orchestration complete:", results);

    return new Response(JSON.stringify({ 
      success: true,
      participant_id,
      trigger_event,
      rules_evaluated: rules?.length || 0,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Appraisal Integration Orchestrator Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function fetchTriggerData(supabase: any, participantId: string): Promise<TriggerData | null> {
  // Get participant with scores
  const { data: participant, error } = await supabase
    .from('appraisal_participants')
    .select(`
      id,
      employee_id,
      overall_score,
      goal_score,
      competency_score,
      responsibility_score,
      cycle:appraisal_cycles!inner(
        id,
        name,
        company_id,
        values_weight
      )
    `)
    .eq('id', participantId)
    .single();

  if (error || !participant) {
    console.error("Error fetching participant:", error);
    return null;
  }

  const cycleArray = participant.cycle as any[];
  const cycle = Array.isArray(cycleArray) ? cycleArray[0] : cycleArray;

  // Get score breakdown for category
  const { data: breakdown } = await supabase
    .from('appraisal_score_breakdown')
    .select('performance_category_id')
    .eq('participant_id', participantId)
    .single();

  let categoryCode = null;
  let categoryName = null;

  if (breakdown?.performance_category_id) {
    const { data: category } = await supabase
      .from('performance_categories')
      .select('code, name')
      .eq('id', breakdown.performance_category_id)
      .single();
    
    categoryCode = category?.code;
    categoryName = category?.name;
  }

  // Get values score if applicable
  let valuesScore = null;
  if (cycle?.values_weight > 0) {
    const { data: valuesData } = await supabase
      .from('values_assessment_scores')
      .select('score')
      .eq('participant_id', participantId);
    
    if (valuesData?.length) {
      const total = valuesData.reduce((sum: number, v: any) => sum + (v.score || 0), 0);
      valuesScore = total / valuesData.length;
    }
  }

  return {
    participant_id: participantId,
    employee_id: participant.employee_id,
    company_id: cycle?.company_id,
    overall_score: participant.overall_score,
    goal_score: participant.goal_score,
    competency_score: participant.competency_score,
    responsibility_score: participant.responsibility_score,
    values_score: valuesScore,
    performance_category_code: categoryCode,
    performance_category_name: categoryName,
    cycle_id: cycle?.id,
    cycle_name: cycle?.name
  };
}

function evaluateRuleCondition(rule: IntegrationRule, data: TriggerData, triggerEvent: string): boolean {
  // Check trigger event matches
  if (rule.trigger_event !== triggerEvent && rule.trigger_event !== 'appraisal_finalized') {
    return false;
  }

  // Get the score to evaluate based on condition_section
  let scoreToEvaluate: number | null = data.overall_score;
  if (rule.condition_section) {
    switch (rule.condition_section) {
      case 'goals': scoreToEvaluate = data.goal_score; break;
      case 'competencies': scoreToEvaluate = data.competency_score; break;
      case 'responsibilities': scoreToEvaluate = data.responsibility_score; break;
      case 'values': scoreToEvaluate = data.values_score; break;
      default: scoreToEvaluate = data.overall_score;
    }
  }

  switch (rule.condition_type) {
    case 'category_match':
      if (!data.performance_category_code) return false;
      const codes = rule.condition_category_codes || [];
      if (rule.condition_operator === 'in') {
        return codes.includes(data.performance_category_code);
      } else if (rule.condition_operator === 'not_in') {
        return !codes.includes(data.performance_category_code);
      }
      return false;

    case 'score_range':
      if (scoreToEvaluate === null) return false;
      const value = rule.condition_value ?? 0;
      switch (rule.condition_operator) {
        case '=': return scoreToEvaluate === value;
        case '!=': return scoreToEvaluate !== value;
        case '>': return scoreToEvaluate > value;
        case '<': return scoreToEvaluate < value;
        case '>=': return scoreToEvaluate >= value;
        case '<=': return scoreToEvaluate <= value;
        case 'between':
          const max = rule.condition_value_max ?? 100;
          return scoreToEvaluate >= value && scoreToEvaluate <= max;
        default: return false;
      }

    case 'trend_direction':
      // Would need historical data - for now just pass
      return true;

    case 'readiness_threshold':
      // Would need performance index data
      return true;

    default:
      return true;
  }
}

async function executeRuleAction(
  supabase: any, 
  rule: IntegrationRule, 
  data: TriggerData
): Promise<{ success: boolean; targetRecordId?: string; error?: string }> {
  const config = rule.action_config;

  try {
    switch (rule.target_module) {
      case 'nine_box':
        return await executeNineBoxAction(supabase, rule, data, config);
      
      case 'succession':
        return await executeSuccessionAction(supabase, rule, data, config);
      
      case 'idp':
      case 'pip':
        return await executeIdpAction(supabase, rule, data, config);
      
      case 'compensation':
        return await executeCompensationAction(supabase, rule, data, config);
      
      case 'workforce_analytics':
        return await executeAnalyticsAction(supabase, rule, data, config);
      
      case 'notifications':
        return await executeNotificationAction(supabase, rule, data, config);
      
      case 'reminders':
        return await executeRemindersAction(supabase, rule, data, config);
      
      default:
        return { success: false, error: `Unknown target module: ${rule.target_module}` };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Action execution failed' 
    };
  }
}

async function executeNineBoxAction(
  supabase: any,
  rule: IntegrationRule,
  data: TriggerData,
  config: Record<string, unknown>
): Promise<{ success: boolean; targetRecordId?: string; error?: string }> {
  // Calculate performance rating from score (1-3 scale)
  let performanceRating = 2;
  if (config.performance_rating_from_score && data.overall_score !== null) {
    if (data.overall_score >= 4) performanceRating = 3;
    else if (data.overall_score >= 2.5) performanceRating = 2;
    else performanceRating = 1;
  }

  const potentialRating = config.potential_rating as number || 2;

  // Check if assessment exists
  const { data: existing } = await supabase
    .from('nine_box_assessments')
    .select('id')
    .eq('employee_id', data.employee_id)
    .eq('is_current', true)
    .single();

  if (existing && rule.action_type === 'update') {
    // Update existing
    const { error } = await supabase
      .from('nine_box_assessments')
      .update({
        performance_rating: performanceRating,
        potential_rating: potentialRating,
        notes: `Updated from appraisal: ${data.cycle_name}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    if (error) return { success: false, error: error.message };
    return { success: true, targetRecordId: existing.id };
  } else if (rule.action_type === 'create' || rule.action_type === 'update') {
    // Archive old and create new
    await supabase
      .from('nine_box_assessments')
      .update({ is_current: false })
      .eq('employee_id', data.employee_id)
      .eq('is_current', true);

    const { data: created, error } = await supabase
      .from('nine_box_assessments')
      .insert({
        employee_id: data.employee_id,
        company_id: data.company_id,
        performance_rating: performanceRating,
        potential_rating: potentialRating,
        assessment_date: new Date().toISOString().split('T')[0],
        is_current: true,
        notes: `Auto-generated from appraisal: ${data.cycle_name}`
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, targetRecordId: created?.id };
  }

  return { success: false, error: 'Invalid action type for nine_box' };
}

async function executeSuccessionAction(
  supabase: any,
  rule: IntegrationRule,
  data: TriggerData,
  config: Record<string, unknown>
): Promise<{ success: boolean; targetRecordId?: string; error?: string }> {
  // Update readiness level based on performance
  const readinessMap: Record<string, string> = {
    'exceptional': 'ready_now',
    'exceeds': 'ready_1_year',
    'meets': 'ready_2_years',
    'needs_improvement': 'development_needed',
    'unsatisfactory': 'development_needed'
  };

  const readinessLevel = data.performance_category_code 
    ? readinessMap[data.performance_category_code] || 'ready_2_years'
    : 'ready_2_years';

  // Find succession candidates for this employee
  const { data: candidates, error: fetchError } = await supabase
    .from('succession_candidates')
    .select('id')
    .eq('candidate_id', data.employee_id);

  if (fetchError) return { success: false, error: fetchError.message };

  if (candidates && candidates.length > 0) {
    // Update all candidacies
    const { error } = await supabase
      .from('succession_candidates')
      .update({
        readiness_level: readinessLevel,
        last_assessment_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('candidate_id', data.employee_id);

    if (error) return { success: false, error: error.message };
    return { success: true, targetRecordId: candidates[0].id };
  }

  return { success: true }; // No candidates to update
}

async function executeIdpAction(
  supabase: any,
  rule: IntegrationRule,
  data: TriggerData,
  config: Record<string, unknown>
): Promise<{ success: boolean; targetRecordId?: string; error?: string }> {
  const isPip = rule.target_module === 'pip' || config.is_pip === true;

  // Create IDP/PIP
  const { data: idp, error } = await supabase
    .from('individual_development_plans')
    .insert({
      employee_id: data.employee_id,
      company_id: data.company_id,
      title: isPip 
        ? `Performance Improvement Plan - ${data.cycle_name}`
        : `Development Plan - ${data.cycle_name}`,
      description: isPip
        ? `Auto-generated PIP due to ${data.performance_category_name} performance rating`
        : `Auto-generated development plan from appraisal ${data.cycle_name}`,
      plan_type: isPip ? 'pip' : 'development',
      status: 'draft',
      start_date: new Date().toISOString().split('T')[0],
      source_appraisal_id: data.participant_id
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  // Get gaps from appraisal to create IDP goals
  const { data: gaps } = await supabase
    .from('appraisal_strengths_gaps')
    .select('*')
    .eq('participant_id', data.participant_id)
    .eq('insight_type', 'gap');

  if (gaps && gaps.length > 0 && idp) {
    for (const gap of gaps) {
      await supabase.from('idp_goals').insert({
        idp_id: idp.id,
        title: gap.title,
        description: gap.description,
        goal_type: isPip ? 'improvement' : 'development',
        priority: gap.priority || 'medium',
        status: 'not_started'
      });
    }
  }

  return { success: true, targetRecordId: idp?.id };
}

async function executeCompensationAction(
  supabase: any,
  rule: IntegrationRule,
  data: TriggerData,
  config: Record<string, unknown>
): Promise<{ success: boolean; targetRecordId?: string; error?: string }> {
  // Determine recommended action based on category
  const actionMap: Record<string, { action: string; percentage?: number }> = {
    'exceptional': { action: 'increase', percentage: 10 },
    'exceeds': { action: 'increase', percentage: 5 },
    'meets': { action: 'review', percentage: 3 },
    'needs_improvement': { action: 'hold' },
    'unsatisfactory': { action: 'hold' }
  };

  const recommendation = data.performance_category_code
    ? actionMap[data.performance_category_code] || { action: 'review' }
    : { action: 'review' };

  const { data: flag, error } = await supabase
    .from('compensation_review_flags')
    .insert({
      employee_id: data.employee_id,
      company_id: data.company_id,
      source_type: 'appraisal',
      source_participant_id: data.participant_id,
      source_cycle_id: data.cycle_id,
      performance_category_code: data.performance_category_code,
      performance_score: data.overall_score,
      recommended_action: recommendation.action,
      recommended_percentage: recommendation.percentage,
      justification: `Based on ${data.performance_category_name} performance in ${data.cycle_name}`,
      priority: data.performance_category_code === 'exceptional' ? 'high' : 'normal',
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, targetRecordId: flag?.id };
}

async function executeAnalyticsAction(
  supabase: any,
  rule: IntegrationRule,
  data: TriggerData,
  config: Record<string, unknown>
): Promise<{ success: boolean; targetRecordId?: string; error?: string }> {
  // Trigger performance index calculation
  try {
    await supabase.functions.invoke('calculate-performance-index', {
      body: {
        employee_id: data.employee_id,
        company_id: data.company_id,
        participant_id: data.participant_id
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to trigger analytics update' };
  }
}

async function executeNotificationAction(
  supabase: any,
  rule: IntegrationRule,
  data: TriggerData,
  config: Record<string, unknown>
): Promise<{ success: boolean; targetRecordId?: string; error?: string }> {
  // Create notification
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.employee_id,
      title: config.title as string || 'Appraisal Update',
      message: config.message as string || `Your appraisal for ${data.cycle_name} has been processed`,
      type: 'appraisal',
      metadata: {
        participant_id: data.participant_id,
        cycle_id: data.cycle_id,
        category: data.performance_category_code
      }
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, targetRecordId: notification?.id };
}

async function executeRemindersAction(
  supabase: any,
  rule: IntegrationRule,
  data: TriggerData,
  config: Record<string, unknown>
): Promise<{ success: boolean; targetRecordId?: string; error?: string }> {
  // Create HR reminder for follow-up actions
  const daysAfter = (config.days_after as number) || 7;
  const reminderDate = new Date(Date.now() + daysAfter * 24 * 60 * 60 * 1000);
  
  // Get event type for the reminder
  const eventTypeCode = config.event_type_code as string || 'APPRAISAL_FINALIZED';
  const { data: eventType } = await supabase
    .from('reminder_event_types')
    .select('id')
    .eq('code', eventTypeCode)
    .single();

  const { data: reminder, error } = await supabase
    .from('employee_reminders')
    .insert({
      company_id: data.company_id,
      employee_id: data.employee_id,
      event_type_id: eventType?.id || null,
      title: (config.title as string) || `Follow-up: ${data.cycle_name}`,
      message: (config.message as string) || `Follow-up reminder for appraisal ${data.cycle_name}`,
      event_date: reminderDate.toISOString(),
      reminder_date: reminderDate.toISOString(),
      source_record_id: data.participant_id,
      source_table: 'appraisal_participants',
      priority: (config.priority as string) || 'medium',
      notification_method: 'both',
      status: 'pending',
      created_by_role: 'system',
      can_employee_dismiss: true,
      notes: `Auto-generated from appraisal integration rule: ${rule.name}`
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, targetRecordId: reminder?.id };
}

async function logIntegration(supabase: any, logData: Record<string, unknown>): Promise<void> {
  const { error } = await supabase
    .from('appraisal_integration_log')
    .insert(logData);

  if (error) {
    console.error("Error logging integration:", error);
  }
}
