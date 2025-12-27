import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleRequest {
  companyId: string;
  startDate: string;
  endDate: string;
  departmentId?: string;
  optimizationGoal: 'cost' | 'coverage' | 'preference' | 'balanced';
  runId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, startDate, endDate, departmentId, optimizationGoal, runId } = await req.json() as ScheduleRequest;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update run status to running
    await supabase
      .from('ai_schedule_runs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', runId);

    console.log(`Starting AI scheduling for company ${companyId}, dates ${startDate} to ${endDate}`);

    // Fetch employees
    let employeesQuery = supabase
      .from('profiles')
      .select('id, full_name, employee_id, hire_date')
      .eq('company_id', companyId)
      .eq('is_active', true);
    
    if (departmentId) {
      employeesQuery = employeesQuery.eq('department_id', departmentId);
    }
    
    const { data: employees, error: empError } = await employeesQuery;
    if (empError) throw empError;

    // Fetch shifts
    const { data: shifts, error: shiftError } = await supabase
      .from('shifts')
      .select('id, name, code, start_time, end_time, minimum_hours, is_overnight, color')
      .eq('company_id', companyId)
      .eq('is_active', true);
    if (shiftError) throw shiftError;

    // Fetch existing assignments
    const { data: existingAssignments, error: assignError } = await supabase
      .from('employee_shift_assignments')
      .select('employee_id, shift_id, effective_date, end_date')
      .eq('company_id', companyId)
      .or(`end_date.is.null,end_date.gte.${startDate}`);
    if (assignError) throw assignError;

    // Fetch employee preferences
    const { data: preferences, error: prefError } = await supabase
      .from('employee_scheduling_preferences')
      .select('*')
      .eq('company_id', companyId);
    if (prefError) console.log('No preferences found:', prefError);

    // Fetch constraints
    const { data: constraints, error: constError } = await supabase
      .from('ai_scheduling_constraints')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);
    if (constError) console.log('No constraints found:', constError);

    // Fetch demand forecasts
    const { data: forecasts, error: forecastError } = await supabase
      .from('shift_demand_forecasts')
      .select('*')
      .eq('company_id', companyId)
      .gte('forecast_date', startDate)
      .lte('forecast_date', endDate);
    if (forecastError) console.log('No forecasts found:', forecastError);

    // Fetch fatigue rules
    const { data: fatigueRules, error: fatigueError } = await supabase
      .from('fatigue_management_rules')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);
    if (fatigueError) console.log('No fatigue rules found:', fatigueError);

    // Build context for AI
    const schedulingContext = {
      dateRange: { start: startDate, end: endDate },
      employees: employees?.map(e => ({
        id: e.id,
        name: e.full_name,
        employeeId: e.employee_id,
        hireDate: e.hire_date
      })) || [],
      shifts: shifts?.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        startTime: s.start_time,
        endTime: s.end_time,
        minimumHours: s.minimum_hours,
        isOvernight: s.is_overnight
      })) || [],
      existingAssignments: existingAssignments || [],
      preferences: preferences || [],
      constraints: constraints || [],
      demandForecasts: forecasts || [],
      fatigueRules: fatigueRules || [],
      optimizationGoal
    };

    // Build system prompt
    const systemPrompt = `You are an AI-powered shift scheduling optimizer for a workforce management system. Your task is to generate optimal shift schedules that balance multiple objectives.

OPTIMIZATION GOALS:
- cost: Minimize labor costs (prefer part-time, avoid overtime)
- coverage: Maximize shift coverage (ensure all shifts are staffed)
- preference: Maximize employee preference matching
- balanced: Balance all factors equally

CONSTRAINTS TO RESPECT:
1. Hard constraints MUST be satisfied (is_hard_constraint = true)
2. Soft constraints should be satisfied when possible
3. Fatigue rules must be respected (max hours, min rest between shifts)
4. Employee availability and preferences should be considered
5. Skills and qualifications if specified

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "recommendations": [
    {
      "employeeId": "uuid",
      "employeeName": "string",
      "shiftId": "uuid",
      "shiftName": "string",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "confidenceScore": 0.0-1.0,
      "reasoning": "Brief explanation"
    }
  ],
  "summary": {
    "totalRecommendations": number,
    "coverageScore": 0-100,
    "preferenceScore": 0-100,
    "estimatedWeeklyHours": number,
    "constraintViolations": number,
    "warnings": ["any issues found"]
  }
}

Be practical and realistic. If there aren't enough employees to cover all shifts, note this in warnings.`;

    const userPrompt = `Generate an optimal shift schedule for the following context:

DATE RANGE: ${startDate} to ${endDate}
OPTIMIZATION GOAL: ${optimizationGoal}

AVAILABLE EMPLOYEES (${schedulingContext.employees.length}):
${JSON.stringify(schedulingContext.employees, null, 2)}

AVAILABLE SHIFTS (${schedulingContext.shifts.length}):
${JSON.stringify(schedulingContext.shifts, null, 2)}

EXISTING ASSIGNMENTS:
${JSON.stringify(schedulingContext.existingAssignments, null, 2)}

EMPLOYEE PREFERENCES:
${JSON.stringify(schedulingContext.preferences, null, 2)}

SCHEDULING CONSTRAINTS:
${JSON.stringify(schedulingContext.constraints, null, 2)}

DEMAND FORECASTS:
${JSON.stringify(schedulingContext.demandForecasts, null, 2)}

FATIGUE RULES:
${JSON.stringify(schedulingContext.fatigueRules, null, 2)}

Generate the optimal schedule with one recommendation per employee per day they should work. Consider all constraints and preferences.`;

    console.log('Calling Lovable AI for schedule optimization...');

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        await supabase
          .from('ai_schedule_runs')
          .update({ 
            status: 'failed', 
            error_message: 'Rate limit exceeded. Please try again later.',
            completed_at: new Date().toISOString()
          })
          .eq('id', runId);
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (aiResponse.status === 402) {
        await supabase
          .from('ai_schedule_runs')
          .update({ 
            status: 'failed', 
            error_message: 'AI credits exhausted. Please add credits.',
            completed_at: new Date().toISOString()
          })
          .eq('id', runId);
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received, parsing...');

    // Parse AI response - extract JSON from markdown if needed
    let scheduleResult;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      scheduleResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Insert recommendations
    const recommendations = scheduleResult.recommendations || [];
    const insertedRecs = [];

    for (const rec of recommendations) {
      // Validate employee and shift exist
      const employee = employees?.find(e => e.id === rec.employeeId);
      const shift = shifts?.find(s => s.id === rec.shiftId);

      if (employee && shift) {
        const { data: inserted, error: insertError } = await supabase
          .from('ai_schedule_recommendations')
          .insert({
            schedule_run_id: runId,
            employee_id: rec.employeeId,
            shift_id: rec.shiftId,
            recommended_date: rec.date,
            start_time: rec.startTime || shift.start_time,
            end_time: rec.endTime || shift.end_time,
            confidence_score: rec.confidenceScore || 0.8,
            reasoning: rec.reasoning || 'AI recommended based on optimization goal'
          })
          .select()
          .single();

        if (!insertError && inserted) {
          insertedRecs.push(inserted);
        } else if (insertError) {
          console.error('Error inserting recommendation:', insertError);
        }
      }
    }

    const summary = scheduleResult.summary || {};

    // Update run with results
    await supabase
      .from('ai_schedule_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        ai_model_used: 'google/gemini-2.5-flash',
        ai_response_raw: scheduleResult,
        total_recommendations: insertedRecs.length,
        coverage_score: summary.coverageScore || null,
        preference_score: summary.preferenceScore || null,
        constraint_violations: summary.constraintViolations || 0
      })
      .eq('id', runId);

    console.log(`Scheduling complete. Generated ${insertedRecs.length} recommendations.`);

    return new Response(JSON.stringify({
      success: true,
      runId,
      totalRecommendations: insertedRecs.length,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Shift Scheduler error:', error);
    
    // Try to update run status if we have the runId
    try {
      const { runId } = await req.clone().json();
      if (runId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        await supabase
          .from('ai_schedule_runs')
          .update({ 
            status: 'failed', 
            error_message: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', runId);
      }
    } catch (e) {
      console.error('Failed to update run status:', e);
    }

    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
