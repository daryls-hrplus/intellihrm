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

interface ConversionRule {
  performance_rating: number;
  proficiency_change: number;
  condition: "if_below_max" | "if_above_min" | "maintain" | "always";
  label: string;
}

interface ProficiencyHistoryEntry {
  date: string;
  old_level: number;
  new_level: number;
  source: string;
  source_id: string;
  performance_rating: number;
  changed_by: string | null;
  reason: string;
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

/**
 * Fetches conversion rules for a company, falling back to defaults
 */
async function getConversionRules(supabase: any, companyId: string): Promise<ConversionRule[]> {
  // Try company-specific rules first
  const { data: companyRules } = await supabase
    .from('rating_proficiency_conversion_rules')
    .select('rules')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .maybeSingle();

  if (companyRules?.rules && Array.isArray(companyRules.rules)) {
    return companyRules.rules as ConversionRule[];
  }

  // Fall back to default rules
  const { data: defaultRules } = await supabase
    .from('rating_proficiency_conversion_rules')
    .select('rules')
    .eq('is_default', true)
    .eq('is_active', true)
    .maybeSingle();

  if (defaultRules?.rules && Array.isArray(defaultRules.rules)) {
    return defaultRules.rules as ConversionRule[];
  }

  // Ultimate fallback: industry-standard defaults
  return [
    { performance_rating: 5, proficiency_change: 1, condition: "if_below_max", label: "Exceptional - Proficiency Increased" },
    { performance_rating: 4, proficiency_change: 0, condition: "maintain", label: "Exceeds - Proficiency Maintained" },
    { performance_rating: 3, proficiency_change: 0, condition: "maintain", label: "Meets - Proficiency Maintained" },
    { performance_rating: 2, proficiency_change: -1, condition: "if_above_min", label: "Needs Improvement - May Decrease" },
    { performance_rating: 1, proficiency_change: -1, condition: "always", label: "Unsatisfactory - Proficiency Decreased" },
  ];
}

/**
 * Converts a performance rating to a proficiency level change using conversion rules
 */
function convertRatingToProficiency(
  rules: ConversionRule[],
  performanceRating: number,
  currentProficiency: number
): { newLevel: number; change: number; reason: string } {
  const roundedRating = Math.round(performanceRating);
  const rule = rules.find(r => r.performance_rating === roundedRating);

  if (!rule) {
    // No rule found, maintain current level
    return {
      newLevel: currentProficiency,
      change: 0,
      reason: 'No conversion rule found - maintaining current level'
    };
  }

  let change = rule.proficiency_change;
  let reason = rule.label;

  // Apply conditions
  switch (rule.condition) {
    case 'if_below_max':
      if (currentProficiency >= 5) {
        change = 0;
        reason = `${rule.label} (already at maximum)`;
      }
      break;
    case 'if_above_min':
      if (currentProficiency <= 1) {
        change = 0;
        reason = `${rule.label} (already at minimum)`;
      }
      break;
    case 'maintain':
      change = 0;
      break;
    case 'always':
      // Apply the change regardless
      break;
  }

  const newLevel = Math.max(1, Math.min(5, currentProficiency + change));

  return {
    newLevel,
    change: newLevel - currentProficiency,
    reason
  };
}

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

  // Fetch conversion rules for this company
  const conversionRules = await getConversionRules(supabase, employee.company_id);
  console.log(`Using ${conversionRules.length} conversion rules`);

  // Get appraisal scores for competencies
  const { data: scores } = await supabase
    .from('appraisal_scores')
    .select('item_id, item_name, rating, evaluation_type')
    .eq('participant_id', participantId)
    .eq('evaluation_type', 'competency');

  if (!scores || scores.length === 0) {
    console.log('No competency scores found for this appraisal');
    return { gapsCreated: 0, assessedUpdated: 0, proficiencyUpdates: [], message: 'No competency scores to analyze' };
  }

  // Get the manager who submitted the appraisal
  const { data: participant } = await supabase
    .from('appraisal_participants')
    .select('manager_id')
    .eq('id', participantId)
    .single();

  const managerId = participant?.manager_id || null;

  // Get current proficiency levels for all competencies
  const competencyIds = scores.map((s: any) => s.item_id).filter(Boolean);
  const { data: currentCompetencies } = await supabase
    .from('employee_competencies')
    .select('competency_id, assessed_proficiency_level, proficiency_history')
    .eq('employee_id', employeeId)
    .in('competency_id', competencyIds)
    .is('end_date', null);

  const currentLevels: Record<string, { level: number; history: any[] }> = {};
  for (const ec of currentCompetencies || []) {
    currentLevels[ec.competency_id] = {
      level: ec.assessed_proficiency_level || 3,
      history: ec.proficiency_history || []
    };
  }

  // UPDATE PROFICIENCY LEVELS USING CONVERSION LOGIC
  let assessedUpdated = 0;
  const proficiencyUpdates: any[] = [];

  for (const score of scores) {
    if (score.item_id && score.rating) {
      const current = currentLevels[score.item_id] || { level: 3, history: [] };
      const conversion = convertRatingToProficiency(
        conversionRules,
        score.rating,
        current.level
      );

      // Create history entry
      const historyEntry: ProficiencyHistoryEntry = {
        date: new Date().toISOString().split('T')[0],
        old_level: current.level,
        new_level: conversion.newLevel,
        source: 'appraisal',
        source_id: participantId,
        performance_rating: score.rating,
        changed_by: managerId,
        reason: conversion.reason
      };

      // Update with new proficiency and history
      const newHistory = [...current.history, historyEntry];

      const { error: updateError } = await supabase
        .from('employee_competencies')
        .update({
          assessed_proficiency_level: conversion.newLevel,
          assessed_date: new Date().toISOString().split('T')[0],
          assessed_by: managerId,
          assessment_source: 'appraisal',
          proficiency_history: newHistory
        })
        .eq('employee_id', employeeId)
        .eq('competency_id', score.item_id)
        .is('end_date', null);

      if (!updateError) {
        assessedUpdated++;
        proficiencyUpdates.push({
          competencyId: score.item_id,
          competencyName: score.item_name,
          performanceRating: score.rating,
          oldLevel: current.level,
          newLevel: conversion.newLevel,
          change: conversion.change,
          reason: conversion.reason
        });
        console.log(`Updated proficiency for ${score.item_name}: ${current.level} → ${conversion.newLevel} (rating: ${score.rating})`);
      }
    }
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

  // Analyze gaps based on NEW proficiency levels (after conversion)
  const gapsToCreate = [];
  
  for (const update of proficiencyUpdates) {
    const required = requiredLevels[update.competencyId];
    const currentLevel = update.newLevel;
    
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
        capability_id: update.competencyId,
        capability_name: update.competencyName || required.name,
        required_level: required.level,
        current_level: currentLevel,
        priority,
        source: 'appraisal',
        source_reference_id: participantId,
        recommended_actions: generateRecommendations(update.competencyName, gapScore),
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

  console.log(`Created ${gapsToCreate.length} skill gaps, updated ${assessedUpdated} proficiency levels with history`);
  return { 
    gapsCreated: gapsToCreate.length, 
    assessedUpdated, 
    proficiencyUpdates,
    gaps: gapsToCreate 
  };
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
  let totalProficiencyUpdates = 0;
  const errors = [];

  for (const participant of participants) {
    try {
      const result = await analyzeAppraisalGaps(supabase, participant.id, participant.employee_id);
      totalGaps += result.gapsCreated;
      totalProficiencyUpdates += result.assessedUpdated;
    } catch (error: any) {
      console.error(`Error processing participant ${participant.id}:`, error);
      errors.push({ participantId: participant.id, error: error?.message || 'Unknown error' });
    }
  }

  return {
    processed: participants.length,
    gapsCreated: totalGaps,
    proficiencyUpdates: totalProficiencyUpdates,
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
