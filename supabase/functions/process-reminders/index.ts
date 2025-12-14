import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderRule {
  id: string;
  company_id: string;
  event_type_id: string;
  days_before: number;
  send_email: boolean;
  send_in_app: boolean;
  event_type: {
    code: string;
    name: string;
  };
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  company_id: string;
  hire_date: string | null;
  probation_end_date: string | null;
  contract_end_date: string | null;
  date_of_birth: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting reminder processing...');

    // Get all active reminder rules
    const { data: rules, error: rulesError } = await supabase
      .from('reminder_rules')
      .select(`
        *,
        event_type:reminder_event_types(code, name)
      `)
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching rules:', rulesError);
      throw rulesError;
    }

    console.log(`Found ${rules?.length || 0} active reminder rules`);

    const today = new Date();
    const remindersCreated: string[] = [];
    const emailsSent: string[] = [];

    for (const rule of (rules as ReminderRule[]) || []) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + rule.days_before);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      console.log(`Processing rule for ${rule.event_type?.code}, target date: ${targetDateStr}`);

      let employees: Employee[] = [];

      // Fetch employees based on event type
      switch (rule.event_type?.code) {
        case 'probation_end':
          const { data: probationEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .eq('probation_end_date', targetDateStr);
          employees = probationEmps || [];
          break;

        case 'contract_end':
        case 'retirement':
          const { data: contractEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .eq('contract_end_date', targetDateStr);
          employees = contractEmps || [];
          break;

        case 'leave_start':
          const { data: leaveStartEmps } = await supabase
            .from('leave_requests')
            .select(`
              employee_id,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('status', 'approved')
            .eq('start_date', targetDateStr);
          employees = (leaveStartEmps || [])
            .filter((l: any) => l.profiles?.company_id === rule.company_id)
            .map((l: any) => l.profiles);
          break;

        case 'leave_end':
          const { data: leaveEndEmps } = await supabase
            .from('leave_requests')
            .select(`
              employee_id,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('status', 'approved')
            .eq('end_date', targetDateStr);
          employees = (leaveEndEmps || [])
            .filter((l: any) => l.profiles?.company_id === rule.company_id)
            .map((l: any) => l.profiles);
          break;

        case 'license_expiry':
          const { data: licenseEmps } = await supabase
            .from('employee_licenses')
            .select(`
              employee_id,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('expiry_date', targetDateStr);
          employees = (licenseEmps || [])
            .filter((l: any) => l.profiles?.company_id === rule.company_id)
            .map((l: any) => l.profiles);
          break;

        case 'certificate_expiry':
          const { data: certEmps } = await supabase
            .from('employee_certificates')
            .select(`
              employee_id,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('expiry_date', targetDateStr);
          employees = (certEmps || [])
            .filter((c: any) => c.profiles?.company_id === rule.company_id)
            .map((c: any) => c.profiles);
          break;

        case 'work_permit_expiry':
          const { data: permitEmps } = await supabase
            .from('employee_work_permits')
            .select(`
              employee_id,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('expiry_date', targetDateStr);
          employees = (permitEmps || [])
            .filter((p: any) => p.profiles?.company_id === rule.company_id)
            .map((p: any) => p.profiles);
          break;

        case 'training_due':
          const { data: trainingEmps } = await supabase
            .from('training_enrollments')
            .select(`
              employee_id,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('target_completion_date', targetDateStr)
            .neq('status', 'completed');
          employees = (trainingEmps || [])
            .filter((t: any) => t.profiles?.company_id === rule.company_id)
            .map((t: any) => t.profiles);
          break;

        case 'birthday':
          // Check for birthdays matching month and day
          const monthDay = targetDateStr.substring(5); // MM-DD
          const { data: birthdayEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .not('date_of_birth', 'is', null);
          employees = (birthdayEmps || []).filter((e: Employee) => 
            e.date_of_birth && e.date_of_birth.substring(5) === monthDay
          );
          break;

        case 'work_anniversary':
          // Check for work anniversaries matching month and day
          const anniversaryMonthDay = targetDateStr.substring(5);
          const { data: anniversaryEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .not('hire_date', 'is', null);
          employees = (anniversaryEmps || []).filter((e: Employee) => 
            e.hire_date && e.hire_date.substring(5) === anniversaryMonthDay
          );
          break;

        default:
          console.log(`Unhandled event type: ${rule.event_type?.code}`);
      }

      console.log(`Found ${employees.length} employees for ${rule.event_type?.code}`);

      // Create reminders for each employee
      for (const employee of employees) {
        if (!employee?.id) continue;

        // Check if reminder already exists
        const { data: existing } = await supabase
          .from('employee_reminders')
          .select('id')
          .eq('employee_id', employee.id)
          .eq('event_type_id', rule.event_type_id)
          .eq('event_date', targetDateStr)
          .single();

        if (existing) {
          console.log(`Reminder already exists for ${employee.full_name}`);
          continue;
        }

        // Create in-app reminder if enabled
        if (rule.send_in_app) {
          const { error: reminderError } = await supabase
            .from('employee_reminders')
            .insert({
              employee_id: employee.id,
              event_type_id: rule.event_type_id,
              rule_id: rule.id,
              title: `${rule.event_type?.name} Reminder`,
              message: `Reminder: ${rule.event_type?.name} is coming up on ${targetDateStr}`,
              event_date: targetDateStr,
              reminder_date: today.toISOString().split('T')[0],
              status: 'pending',
              created_by_role: 'system',
            });

          if (!reminderError) {
            remindersCreated.push(`${employee.full_name} - ${rule.event_type?.name}`);
          }
        }

        // Send email if enabled
        if (rule.send_email && employee.email) {
          // Log email attempt (actual sending would use Resend or similar)
          const { error: historyError } = await supabase
            .from('reminder_history')
            .insert({
              employee_id: employee.id,
              event_type_id: rule.event_type_id,
              rule_id: rule.id,
              delivery_method: 'email',
              status: 'sent',
              sent_at: new Date().toISOString(),
            });

          if (!historyError) {
            emailsSent.push(employee.email);
          }
        }
      }
    }

    // Update sent reminders status
    const { error: updateError } = await supabase
      .from('employee_reminders')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('status', 'pending')
      .lte('reminder_date', today.toISOString().split('T')[0]);

    if (updateError) {
      console.error('Error updating reminder status:', updateError);
    }

    console.log(`Processing complete. Created ${remindersCreated.length} reminders, sent ${emailsSent.length} emails`);

    return new Response(
      JSON.stringify({
        success: true,
        remindersCreated: remindersCreated.length,
        emailsSent: emailsSent.length,
        details: { remindersCreated, emailsSent },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing reminders:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
