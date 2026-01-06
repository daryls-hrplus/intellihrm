import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
  finalizationId: string;
  approverId: string;
  action: 'approve' | 'reject' | 'return';
  comments?: string;
}

interface PayElementSummary {
  employeeId: string;
  payElement: string;
  hours: number;
  rate: number;
  multiplier: number;
  grossAmount: number;
  sourceRecords: any[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { finalizationId, approverId, action, comments }: ApprovalRequest = await req.json();

    console.log('Processing approval:', { finalizationId, approverId, action });

    // Get the finalization record
    const { data: finalization, error: finError } = await supabase
      .from('timekeeper_period_finalizations')
      .select('*')
      .eq('id', finalizationId)
      .single();

    if (finError || !finalization) {
      throw new Error('Finalization record not found');
    }

    // Verify approver is authorized for current level
    const { data: approverAuth, error: authError } = await supabase
      .from('shift_approval_levels')
      .select('*')
      .eq('company_id', finalization.company_id)
      .eq('approver_id', approverId)
      .eq('approval_level', finalization.current_approval_level)
      .eq('is_active', true);

    if (authError) {
      console.error('Auth check error:', authError);
    }

    // Also check if user is the designated current approver
    const isCurrentApprover = finalization.current_approver_id === approverId;
    const hasShiftApproval = approverAuth && approverAuth.length > 0;

    if (!isCurrentApprover && !hasShiftApproval) {
      throw new Error('User is not authorized to approve at this level');
    }

    // Record the approval action
    const { error: historyError } = await supabase
      .from('timesheet_approval_history')
      .insert({
        finalization_id: finalizationId,
        approval_level: finalization.current_approval_level,
        approver_id: approverId,
        action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned',
        comments
      });

    if (historyError) {
      console.error('History insert error:', historyError);
    }

    if (action === 'reject') {
      // Reject the entire batch
      const { error: rejectError } = await supabase
        .from('timekeeper_period_finalizations')
        .update({
          workflow_status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: approverId,
          rejection_reason: comments
        })
        .eq('id', finalizationId);

      if (rejectError) throw rejectError;

      return new Response(JSON.stringify({
        success: true,
        message: 'Timesheet batch rejected',
        status: 'rejected'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'return') {
      // Return to previous level
      const newLevel = Math.max(1, finalization.current_approval_level - 1);
      
      // Get the approver for the previous level
      const { data: prevApprover } = await supabase
        .from('shift_approval_levels')
        .select('approver_id')
        .eq('company_id', finalization.company_id)
        .eq('approval_level', newLevel)
        .eq('is_active', true)
        .limit(1)
        .single();

      const { error: returnError } = await supabase
        .from('timekeeper_period_finalizations')
        .update({
          current_approval_level: newLevel,
          workflow_status: `pending_level_${newLevel}`,
          current_approver_id: prevApprover?.approver_id || finalization.timekeeper_id
        })
        .eq('id', finalizationId);

      if (returnError) throw returnError;

      return new Response(JSON.stringify({
        success: true,
        message: `Returned to approval level ${newLevel}`,
        status: `pending_level_${newLevel}`
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Approve action - check if there are more levels
    const nextLevel = finalization.current_approval_level + 1;
    
    if (nextLevel <= finalization.max_approval_levels) {
      // Move to next approval level
      const { data: nextApprover } = await supabase
        .from('shift_approval_levels')
        .select('approver_id')
        .eq('company_id', finalization.company_id)
        .eq('approval_level', nextLevel)
        .eq('is_active', true)
        .limit(1)
        .single();

      const { error: updateError } = await supabase
        .from('timekeeper_period_finalizations')
        .update({
          current_approval_level: nextLevel,
          workflow_status: `pending_level_${nextLevel}`,
          current_approver_id: nextApprover?.approver_id,
          next_approver_id: null // Will be set when checking level after next
        })
        .eq('id', finalizationId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        success: true,
        message: `Approved and sent to level ${nextLevel} approver`,
        status: `pending_level_${nextLevel}`,
        nextApprover: nextApprover?.approver_id
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // No more approval levels - generate payroll summary and send to payroll
    console.log('All approvals complete, generating payroll summary...');

    // Get time entries for the period
    const employeeIds = finalization.employee_ids || [];
    
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_clock_entries')
      .select(`
        *,
        profiles:employee_id (
          id,
          first_name,
          last_name
        )
      `)
      .in('employee_id', employeeIds)
      .gte('clock_in', finalization.period_start)
      .lte('clock_in', finalization.period_end + 'T23:59:59');

    if (timeError) {
      console.error('Time entries fetch error:', timeError);
    }

    // Get employee compensation rates
    const { data: compensations, error: compError } = await supabase
      .from('employee_compensation')
      .select('*')
      .in('employee_id', employeeIds)
      .eq('is_active', true);

    if (compError) {
      console.error('Compensation fetch error:', compError);
    }

    // Get overtime multipliers from payroll rules
    const { data: payrollRules } = await supabase
      .from('payroll_rules')
      .select('*')
      .eq('company_id', finalization.company_id)
      .eq('rule_type', 'overtime')
      .eq('is_active', true);

    const overtimeMultipliers = {
      tier1: 1.5,
      tier2: 2.0,
      tier3: 3.0
    };

    if (payrollRules && payrollRules.length > 0) {
      const rule = payrollRules[0];
      if (rule.rule_value?.tier1_multiplier) overtimeMultipliers.tier1 = rule.rule_value.tier1_multiplier;
      if (rule.rule_value?.tier2_multiplier) overtimeMultipliers.tier2 = rule.rule_value.tier2_multiplier;
      if (rule.rule_value?.tier3_multiplier) overtimeMultipliers.tier3 = rule.rule_value.tier3_multiplier;
    }

    // Build pay element summaries per employee
    const payElementSummaries: PayElementSummary[] = [];
    const compensationMap = new Map(compensations?.map(c => [c.employee_id, c]) || []);

    // Group time entries by employee
    const entriesByEmployee = new Map<string, any[]>();
    (timeEntries || []).forEach(entry => {
      const empId = entry.employee_id;
      if (!entriesByEmployee.has(empId)) {
        entriesByEmployee.set(empId, []);
      }
      entriesByEmployee.get(empId)!.push(entry);
    });

    // Process each employee
    for (const [employeeId, entries] of entriesByEmployee) {
      const comp = compensationMap.get(employeeId);
      const hourlyRate = comp?.base_amount || 0;

      let regularHours = 0;
      let ot1Hours = 0;
      let ot2Hours = 0;
      let ot3Hours = 0;
      const regularRecords: any[] = [];
      const ot1Records: any[] = [];
      const ot2Records: any[] = [];
      const ot3Records: any[] = [];

      // Calculate hours from entries
      entries.forEach(entry => {
        const totalHours = entry.total_hours || 0;
        const overtimeHours = entry.overtime_hours || 0;
        const regularEntryHours = totalHours - overtimeHours;

        // Regular time
        regularHours += regularEntryHours;
        if (regularEntryHours > 0) {
          regularRecords.push({ entryId: entry.id, hours: regularEntryHours, date: entry.clock_in });
        }

        // Overtime categorization (simplified - using tier thresholds)
        if (overtimeHours > 0) {
          // First 4 OT hours = 1.5x, next 4 = 2x, beyond = 3x
          const tier1 = Math.min(overtimeHours, 4);
          const tier2 = Math.min(Math.max(overtimeHours - 4, 0), 4);
          const tier3 = Math.max(overtimeHours - 8, 0);

          if (tier1 > 0) {
            ot1Hours += tier1;
            ot1Records.push({ entryId: entry.id, hours: tier1, date: entry.clock_in });
          }
          if (tier2 > 0) {
            ot2Hours += tier2;
            ot2Records.push({ entryId: entry.id, hours: tier2, date: entry.clock_in });
          }
          if (tier3 > 0) {
            ot3Hours += tier3;
            ot3Records.push({ entryId: entry.id, hours: tier3, date: entry.clock_in });
          }
        }
      });

      // Add regular time summary
      if (regularHours > 0) {
        payElementSummaries.push({
          employeeId,
          payElement: 'regular_time',
          hours: regularHours,
          rate: hourlyRate,
          multiplier: 1.0,
          grossAmount: regularHours * hourlyRate,
          sourceRecords: regularRecords
        });
      }

      // Add OT 1.5x summary
      if (ot1Hours > 0) {
        payElementSummaries.push({
          employeeId,
          payElement: 'overtime_1_5x',
          hours: ot1Hours,
          rate: hourlyRate,
          multiplier: overtimeMultipliers.tier1,
          grossAmount: ot1Hours * hourlyRate * overtimeMultipliers.tier1,
          sourceRecords: ot1Records
        });
      }

      // Add OT 2x summary
      if (ot2Hours > 0) {
        payElementSummaries.push({
          employeeId,
          payElement: 'overtime_2x',
          hours: ot2Hours,
          rate: hourlyRate,
          multiplier: overtimeMultipliers.tier2,
          grossAmount: ot2Hours * hourlyRate * overtimeMultipliers.tier2,
          sourceRecords: ot2Records
        });
      }

      // Add OT 3x summary
      if (ot3Hours > 0) {
        payElementSummaries.push({
          employeeId,
          payElement: 'overtime_3x',
          hours: ot3Hours,
          rate: hourlyRate,
          multiplier: overtimeMultipliers.tier3,
          grossAmount: ot3Hours * hourlyRate * overtimeMultipliers.tier3,
          sourceRecords: ot3Records
        });
      }
    }

    // Get leave transactions for the period
    const { data: leaveTransactions } = await supabase
      .from('leave_payroll_transactions')
      .select('*')
      .eq('company_id', finalization.company_id)
      .in('employee_id', employeeIds)
      .gte('leave_date', finalization.period_start)
      .lte('leave_date', finalization.period_end);

    // Add leave pay elements
    (leaveTransactions || []).forEach(lt => {
      const payElement = lt.transaction_type === 'paid_leave' ? 'paid_leave' : 
                         lt.transaction_type === 'sick_leave_statutory' ? 'sick_leave' :
                         lt.transaction_type === 'unpaid_deduction' ? 'unpaid_deduction' : 'other';

      payElementSummaries.push({
        employeeId: lt.employee_id,
        payElement,
        hours: lt.hours || 8,
        rate: lt.daily_rate || 0,
        multiplier: (lt.payment_percentage || 100) / 100,
        grossAmount: lt.gross_amount || 0,
        sourceRecords: [{ leaveTransactionId: lt.id, leaveDate: lt.leave_date }]
      });
    });

    // Insert payroll summary records
    const summaryInserts = payElementSummaries.map(s => ({
      company_id: finalization.company_id,
      employee_id: s.employeeId,
      finalization_id: finalizationId,
      period_start: finalization.period_start,
      period_end: finalization.period_end,
      pay_element: s.payElement,
      hours: s.hours,
      rate: s.rate,
      multiplier: s.multiplier,
      gross_amount: s.grossAmount,
      source_records: s.sourceRecords
    }));

    if (summaryInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('payroll_summary_records')
        .insert(summaryInserts);

      if (insertError) {
        console.error('Summary insert error:', insertError);
        throw insertError;
      }
    }

    // Update finalization status to approved for payroll
    const { error: finalUpdateError } = await supabase
      .from('timekeeper_period_finalizations')
      .update({
        workflow_status: 'approved_for_payroll',
        payroll_summary_created_at: new Date().toISOString(),
        status: 'sent_to_payroll'
      })
      .eq('id', finalizationId);

    if (finalUpdateError) throw finalUpdateError;

    console.log(`Created ${summaryInserts.length} payroll summary records`);

    return new Response(JSON.stringify({
      success: true,
      message: 'All approvals complete. Payroll summary created.',
      status: 'approved_for_payroll',
      summaryRecords: summaryInserts.length,
      payElements: [...new Set(summaryInserts.map(s => s.pay_element))]
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    console.error('Error processing approval:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
