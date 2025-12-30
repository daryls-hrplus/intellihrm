import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SkillGapInput {
  action: 'analyze-appraisal' | 'analyze-employee' | 'bulk-process';
  participantId?: string;
  employeeId?: string;
  companyId?: string;
  cycleId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, participantId, employeeId, companyId, cycleId }: SkillGapInput = await req.json();

    console.log(`Processing skill gap analysis - Action: ${action}`);

    let result: any = {};

    switch (action) {
      case 'analyze-appraisal':
        result = await analyzeAppraisalGaps(supabase, participantId!, employeeId!);
        break;

      case 'analyze-employee':
        result = await analyzeEmployeeGaps(supabase, employeeId!, companyId!);
        break;

      case 'bulk-process':
        result = await bulkProcessCycle(supabase, cycleId!, companyId!);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in skill-gap-processor:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function analyzeAppraisalGaps(supabase: any, participantId: string, employeeId: string) {
  console.log(`Analyzing appraisal gaps for participant: ${participantId}`);

  // Get employee's company
  const { data: employee } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', employeeId)
    .single();

  if (!employee) {
    throw new Error('Employee not found');
  }

  // Get appraisal scores for competencies
  const { data: scores } = await supabase
    .from('appraisal_scores')
    .select('item_id, item_name, rating, evaluation_type')
    .eq('participant_id', participantId)
    .eq('evaluation_type', 'competency');

  if (!scores || scores.length === 0) {
    console.log('No competency scores found for this appraisal');
    return { gapsCreated: 0, message: 'No competency scores to analyze' };
  }

  // Get job competency requirements for the employee
  const { data: jobCompetencies } = await supabase
    .from('employee_positions')
    .select(`
      position:positions!inner(
        job:jobs!inner(
          job_competencies(
            competency_id,
            proficiency_level,
            is_required,
            competency:competencies(name)
          )
        )
      )
    `)
    .eq('employee_id', employeeId)
    .eq('is_active', true);

  // Build a map of required competency levels
  const requiredLevels: Record<string, { level: number; name: string }> = {};
  
  if (jobCompetencies) {
    for (const ep of jobCompetencies) {
      const jobComps = ep.position?.job?.job_competencies || [];
      for (const jc of jobComps) {
        if (jc.is_required && jc.competency_id) {
          requiredLevels[jc.competency_id] = {
            level: jc.proficiency_level || 3,
            name: jc.competency?.name || 'Unknown Competency'
          };
        }
      }
    }
  }

  // Analyze gaps
  const gapsToCreate = [];
  
  for (const score of scores) {
    const required = requiredLevels[score.item_id];
    const currentLevel = score.rating || 0;
    
    // If we have a requirement, check for gap
    if (required && currentLevel < required.level) {
      const gapScore = required.level - currentLevel;
      
      // Determine priority based on gap size
      let priority = 'medium';
      if (gapScore >= 3) priority = 'critical';
      else if (gapScore >= 2) priority = 'high';
      else if (gapScore <= 1) priority = 'low';

      gapsToCreate.push({
        employee_id: employeeId,
        company_id: employee.company_id,
        capability_id: score.item_id,
        capability_name: score.item_name || required.name,
        required_level: required.level,
        current_level: Math.round(currentLevel),
        priority,
        source: 'appraisal',
        source_reference_id: participantId,
        recommended_actions: generateRecommendations(score.item_name, gapScore),
        status: 'open'
      });
    }
  }

  // Insert gaps (trigger will auto-create IDP items for high/critical)
  if (gapsToCreate.length > 0) {
    const { error } = await supabase
      .from('employee_skill_gaps')
      .insert(gapsToCreate);

    if (error) {
      console.error('Error creating skill gaps:', error);
      throw error;
    }
  }

  console.log(`Created ${gapsToCreate.length} skill gaps from appraisal`);
  return { gapsCreated: gapsToCreate.length, gaps: gapsToCreate };
}

async function analyzeEmployeeGaps(supabase: any, employeeId: string, companyId: string) {
  console.log(`Full skill gap analysis for employee: ${employeeId}`);

  // Get all job requirements for the employee's positions
  const { data: jobRequirements } = await supabase
    .from('employee_positions')
    .select(`
      position:positions!inner(
        job:jobs!inner(
          job_competencies(
            competency_id,
            proficiency_level,
            is_required,
            competency:competencies(name, category)
          ),
          job_skills(
            skill_id,
            proficiency_level,
            is_required,
            skill:skills_competencies(name, category)
          )
        )
      )
    `)
    .eq('employee_id', employeeId)
    .eq('is_active', true);

  // Get employee's current competency assessments
  const { data: employeeCompetencies } = await supabase
    .from('employee_competency_assessments')
    .select('competency_id, proficiency_level')
    .eq('employee_id', employeeId)
    .order('assessed_at', { ascending: false });

  // Get employee's current skills
  const { data: employeeSkills } = await supabase
    .from('employee_skills')
    .select('skill_id, proficiency_level')
    .eq('employee_id', employeeId);

  // Build current levels maps
  const currentCompetencyLevels: Record<string, number> = {};
  const currentSkillLevels: Record<string, number> = {};

  for (const ec of employeeCompetencies || []) {
    if (!currentCompetencyLevels[ec.competency_id]) {
      currentCompetencyLevels[ec.competency_id] = ec.proficiency_level || 0;
    }
  }

  for (const es of employeeSkills || []) {
    currentSkillLevels[es.skill_id] = es.proficiency_level || 0;
  }

  // Analyze gaps
  const gapsToCreate = [];

  for (const ep of jobRequirements || []) {
    const job = ep.position?.job;
    if (!job) continue;

    // Check competency gaps
    for (const jc of job.job_competencies || []) {
      if (!jc.is_required) continue;
      
      const currentLevel = currentCompetencyLevels[jc.competency_id] || 0;
      const requiredLevel = jc.proficiency_level || 3;
      
      if (currentLevel < requiredLevel) {
        const gapScore = requiredLevel - currentLevel;
        gapsToCreate.push({
          employee_id: employeeId,
          company_id: companyId,
          capability_id: jc.competency_id,
          capability_name: jc.competency?.name || 'Unknown Competency',
          required_level: requiredLevel,
          current_level: currentLevel,
          priority: gapScore >= 3 ? 'critical' : gapScore >= 2 ? 'high' : 'medium',
          source: 'job_requirement',
          recommended_actions: generateRecommendations(jc.competency?.name, gapScore),
          status: 'open'
        });
      }
    }

    // Check skill gaps
    for (const js of job.job_skills || []) {
      if (!js.is_required) continue;
      
      const currentLevel = currentSkillLevels[js.skill_id] || 0;
      const requiredLevel = js.proficiency_level || 3;
      
      if (currentLevel < requiredLevel) {
        const gapScore = requiredLevel - currentLevel;
        gapsToCreate.push({
          employee_id: employeeId,
          company_id: companyId,
          capability_id: js.skill_id,
          capability_name: js.skill?.name || 'Unknown Skill',
          required_level: requiredLevel,
          current_level: currentLevel,
          priority: gapScore >= 3 ? 'critical' : gapScore >= 2 ? 'high' : 'medium',
          source: 'job_requirement',
          recommended_actions: generateRecommendations(js.skill?.name, gapScore),
          status: 'open'
        });
      }
    }
  }

  // Insert gaps
  if (gapsToCreate.length > 0) {
    const { error } = await supabase
      .from('employee_skill_gaps')
      .insert(gapsToCreate);

    if (error) {
      console.error('Error creating skill gaps:', error);
      throw error;
    }
  }

  return { gapsCreated: gapsToCreate.length };
}

async function bulkProcessCycle(supabase: any, cycleId: string, companyId: string) {
  console.log(`Bulk processing skill gaps for cycle: ${cycleId}`);

  // Get all completed participants in the cycle
  const { data: participants } = await supabase
    .from('appraisal_participants')
    .select('id, employee_id')
    .eq('cycle_id', cycleId)
    .in('status', ['completed', 'reviewed']);

  if (!participants || participants.length === 0) {
    return { processed: 0, message: 'No completed appraisals found' };
  }

  let totalGaps = 0;
  const errors = [];

  for (const participant of participants) {
    try {
      const result = await analyzeAppraisalGaps(supabase, participant.id, participant.employee_id);
      totalGaps += result.gapsCreated;
    } catch (error: any) {
      console.error(`Error processing participant ${participant.id}:`, error);
      errors.push({ participantId: participant.id, error: error?.message || 'Unknown error' });
    }
  }

  return {
    processed: participants.length,
    gapsCreated: totalGaps,
    errors: errors.length > 0 ? errors : undefined
  };
}

function generateRecommendations(capabilityName: string | undefined, gapScore: number): any[] {
  const recommendations = [];
  
  if (gapScore >= 2) {
    recommendations.push({
      type: 'training',
      title: `Enroll in ${capabilityName} training program`,
      priority: 'high'
    });
  }
  
  recommendations.push({
    type: 'mentoring',
    title: `Find a mentor experienced in ${capabilityName}`,
    priority: gapScore >= 2 ? 'high' : 'medium'
  });
  
  if (gapScore >= 3) {
    recommendations.push({
      type: 'assignment',
      title: `Take on stretch assignments to develop ${capabilityName}`,
      priority: 'high'
    });
  }
  
  recommendations.push({
    type: 'self_study',
    title: `Complete self-paced learning for ${capabilityName}`,
    priority: 'medium'
  });
  
  return recommendations;
}
