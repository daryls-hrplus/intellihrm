import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckRulesRequest {
  action: 'check_rules' | 'trigger_actions';
  participant_id: string;
  scores: {
    goals?: number;
    competencies?: number;
    responsibilities?: number;
    feedback_360?: number;
    values?: number;
    overall?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, participant_id, scores } = await req.json() as CheckRulesRequest;

    console.log(`[appraisal-action-enforcer] Action: ${action}, Participant: ${participant_id}`);

    // Get participant and cycle info
    const { data: participant, error: participantError } = await supabaseClient
      .from('appraisal_participants')
      .select('*, cycle:appraisal_cycles(*)')
      .eq('id', participant_id)
      .single();

    if (participantError || !participant) {
      throw new Error('Participant not found');
    }

    const templateId = participant.cycle?.template_id;
    if (!templateId) {
      return new Response(JSON.stringify({ triggered_actions: [], blocking: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get active rules for this template
    const { data: rules, error: rulesError } = await supabaseClient
      .from('appraisal_outcome_action_rules')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .order('display_order');

    if (rulesError) throw rulesError;

    const triggeredActions: any[] = [];

    for (const rule of rules || []) {
      const sectionScore = scores[rule.condition_section as keyof typeof scores];
      if (sectionScore === undefined) continue;

      let triggered = false;
      switch (rule.condition_operator) {
        case '<': triggered = sectionScore < rule.condition_threshold; break;
        case '<=': triggered = sectionScore <= rule.condition_threshold; break;
        case '>': triggered = sectionScore > rule.condition_threshold; break;
        case '>=': triggered = sectionScore >= rule.condition_threshold; break;
        case '=': triggered = sectionScore === rule.condition_threshold; break;
        case '!=': triggered = sectionScore !== rule.condition_threshold; break;
      }

      if (triggered) {
        console.log(`[appraisal-action-enforcer] Rule triggered: ${rule.rule_name}`);
        triggeredActions.push({
          rule_id: rule.id,
          rule_name: rule.rule_name,
          action_type: rule.action_type,
          action_is_mandatory: rule.action_is_mandatory,
          action_message: rule.action_message,
          triggered_score: sectionScore,
          triggered_section: rule.condition_section,
        });

        if (action === 'trigger_actions') {
          // Create execution record
          await supabaseClient.from('appraisal_action_executions').insert({
            participant_id,
            rule_id: rule.id,
            triggered_score: sectionScore,
            triggered_section: rule.condition_section,
            status: 'pending',
          });
        }
      }
    }

    const hasBlocking = triggeredActions.some(a => a.action_is_mandatory);

    return new Response(JSON.stringify({
      triggered_actions: triggeredActions,
      blocking: hasBlocking,
      mandatory_count: triggeredActions.filter(a => a.action_is_mandatory).length,
      advisory_count: triggeredActions.filter(a => !a.action_is_mandatory).length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('[appraisal-action-enforcer] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
