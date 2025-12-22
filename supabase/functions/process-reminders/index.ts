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
  message_template: string | null;
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

interface RecordWithEmployee {
  id: string;
  employee: Employee;
  eventDate: string;
  itemName: string;
  sourceTable: string;
}

// Replace placeholders in message template with actual values
function replaceMessagePlaceholders(
  template: string,
  data: {
    employeeName: string;
    eventDate: string;
    daysUntil: number;
    eventTypeName: string;
    itemName?: string;
  }
): string {
  // Format the date nicely
  const formattedDate = new Date(data.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return template
    .replace(/{employee_name}/gi, data.employeeName)
    .replace(/{event_date}/gi, formattedDate)
    .replace(/{days_until}/gi, data.daysUntil.toString())
    .replace(/{event_type}/gi, data.eventTypeName)
    .replace(/{item_name}/gi, data.itemName || data.eventTypeName);
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

    // Get all active reminder rules with message_template
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

      console.log(`Processing rule for ${rule.event_type?.code}, target date: ${targetDateStr}, days_before: ${rule.days_before}`);

      let records: RecordWithEmployee[] = [];

      // Fetch records based on event type - now fetching individual records with their details
      switch (rule.event_type?.code) {
        case 'probation_end': {
          const { data: probationEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .eq('probation_end_date', targetDateStr);
          
          records = (probationEmps || []).map((emp: Employee) => ({
            id: emp.id, // Use employee id as source_record_id for profile-based events
            employee: emp,
            eventDate: emp.probation_end_date!,
            itemName: 'Probation Period',
            sourceTable: 'profiles'
          }));
          break;
        }

        case 'contract_end': {
          const { data: contractEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .eq('contract_end_date', targetDateStr);
          
          records = (contractEmps || []).map((emp: Employee) => ({
            id: emp.id,
            employee: emp,
            eventDate: emp.contract_end_date!,
            itemName: 'Employment Contract',
            sourceTable: 'profiles'
          }));
          break;
        }

        case 'leave_start': {
          const { data: leaveRecords } = await supabase
            .from('leave_requests')
            .select(`
              id,
              start_date,
              leave_type:leave_types(name),
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('status', 'approved')
            .eq('start_date', targetDateStr);
          
          records = (leaveRecords || [])
            .filter((l: any) => l.profiles?.company_id === rule.company_id)
            .map((l: any) => ({
              id: l.id,
              employee: l.profiles,
              eventDate: l.start_date,
              itemName: l.leave_type?.name || 'Leave',
              sourceTable: 'leave_requests'
            }));
          break;
        }

        case 'leave_end': {
          const { data: leaveRecords } = await supabase
            .from('leave_requests')
            .select(`
              id,
              end_date,
              leave_type:leave_types(name),
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('status', 'approved')
            .eq('end_date', targetDateStr);
          
          records = (leaveRecords || [])
            .filter((l: any) => l.profiles?.company_id === rule.company_id)
            .map((l: any) => ({
              id: l.id,
              employee: l.profiles,
              eventDate: l.end_date,
              itemName: l.leave_type?.name || 'Leave',
              sourceTable: 'leave_requests'
            }));
          break;
        }

        case 'license_expiry': {
          const { data: licenseRecords } = await supabase
            .from('employee_licenses')
            .select(`
              id,
              license_name,
              license_type,
              expiry_date,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('expiry_date', targetDateStr);
          
          records = (licenseRecords || [])
            .filter((l: any) => l.profiles?.company_id === rule.company_id)
            .map((l: any) => ({
              id: l.id,
              employee: l.profiles,
              eventDate: l.expiry_date,
              itemName: l.license_name || l.license_type || 'License',
              sourceTable: 'employee_licenses'
            }));
          break;
        }

        case 'certificate_expiry': {
          const { data: certRecords } = await supabase
            .from('employee_certificates')
            .select(`
              id,
              certificate_name,
              expiry_date,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('expiry_date', targetDateStr);
          
          records = (certRecords || [])
            .filter((c: any) => c.profiles?.company_id === rule.company_id)
            .map((c: any) => ({
              id: c.id,
              employee: c.profiles,
              eventDate: c.expiry_date,
              itemName: c.certificate_name || 'Certificate',
              sourceTable: 'employee_certificates'
            }));
          break;
        }

        case 'work_permit_expiry': {
          const { data: permitRecords } = await supabase
            .from('employee_work_permits')
            .select(`
              id,
              permit_type,
              expiry_date,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('expiry_date', targetDateStr);
          
          records = (permitRecords || [])
            .filter((p: any) => p.profiles?.company_id === rule.company_id)
            .map((p: any) => ({
              id: p.id,
              employee: p.profiles,
              eventDate: p.expiry_date,
              itemName: p.permit_type || 'Work Permit',
              sourceTable: 'employee_work_permits'
            }));
          break;
        }

        case 'training_due': {
          const { data: trainingRecords } = await supabase
            .from('training_enrollments')
            .select(`
              id,
              target_completion_date,
              training_course:training_courses(name),
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('target_completion_date', targetDateStr)
            .neq('status', 'completed');
          
          records = (trainingRecords || [])
            .filter((t: any) => t.profiles?.company_id === rule.company_id)
            .map((t: any) => ({
              id: t.id,
              employee: t.profiles,
              eventDate: t.target_completion_date,
              itemName: t.training_course?.name || 'Training',
              sourceTable: 'training_enrollments'
            }));
          break;
        }

        case 'membership_expiry': {
          const { data: membershipRecords } = await supabase
            .from('employee_memberships')
            .select(`
              id,
              membership_name,
              organization_name,
              expiry_date,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .eq('expiry_date', targetDateStr);
          
          records = (membershipRecords || [])
            .filter((m: any) => m.profiles?.company_id === rule.company_id)
            .map((m: any) => ({
              id: m.id,
              employee: m.profiles,
              eventDate: m.expiry_date,
              itemName: m.membership_name || m.organization_name || 'Membership',
              sourceTable: 'employee_memberships'
            }));
          break;
        }

        case 'document_expiry': {
          const { data: documentRecords } = await supabase
            .from('employee_documents')
            .select(`
              id,
              document_name,
              document_type,
              expiry_date,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth)
            `)
            .not('expiry_date', 'is', null)
            .eq('expiry_date', targetDateStr);
          
          records = (documentRecords || [])
            .filter((d: any) => d.profiles?.company_id === rule.company_id)
            .map((d: any) => ({
              id: d.id,
              employee: d.profiles,
              eventDate: d.expiry_date,
              itemName: d.document_name || d.document_type || 'Document',
              sourceTable: 'employee_documents'
            }));
          break;
        }

        case 'birthday': {
          const monthDay = targetDateStr.substring(5); // MM-DD
          const { data: birthdayEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .not('date_of_birth', 'is', null);
          
          records = (birthdayEmps || [])
            .filter((e: Employee) => e.date_of_birth && e.date_of_birth.substring(5) === monthDay)
            .map((emp: Employee) => ({
              id: emp.id,
              employee: emp,
              eventDate: targetDateStr,
              itemName: 'Birthday',
              sourceTable: 'profiles'
            }));
          break;
        }

        case 'work_anniversary': {
          const anniversaryMonthDay = targetDateStr.substring(5);
          const { data: anniversaryEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .not('hire_date', 'is', null);
          
          records = (anniversaryEmps || [])
            .filter((e: Employee) => e.hire_date && e.hire_date.substring(5) === anniversaryMonthDay)
            .map((emp: Employee) => ({
              id: emp.id,
              employee: emp,
              eventDate: targetDateStr,
              itemName: 'Work Anniversary',
              sourceTable: 'profiles'
            }));
          break;
        }

        default:
          console.log(`Unhandled event type: ${rule.event_type?.code}`);
      }

      console.log(`Found ${records.length} records for ${rule.event_type?.code}`);

      // Create reminders for each individual record
      for (const record of records) {
        if (!record?.employee?.id) continue;

        // Check if reminder already exists for THIS SPECIFIC RECORD
        const { data: existing } = await supabase
          .from('employee_reminders')
          .select('id')
          .eq('source_record_id', record.id)
          .eq('rule_id', rule.id)
          .eq('reminder_date', today.toISOString().split('T')[0])
          .maybeSingle();

        if (existing) {
          console.log(`Reminder already exists for ${record.employee.full_name} - ${record.itemName}`);
          continue;
        }

        // Build the reminder message using template or default
        const defaultTemplate = `Dear {employee_name},\n\nThis is a reminder that your {item_name} will expire on {event_date} ({days_until} days from now).\n\nPlease take the necessary steps.\n\nFrom HR Department`;
        const template = rule.message_template || defaultTemplate;
        
        const processedMessage = replaceMessagePlaceholders(template, {
          employeeName: record.employee.full_name,
          eventDate: record.eventDate,
          daysUntil: rule.days_before,
          eventTypeName: rule.event_type?.name || 'Event',
          itemName: record.itemName
        });

        // Create title with specific item name
        const reminderTitle = `${record.itemName} - ${rule.event_type?.name}`;

        // Create in-app reminder if enabled
        if (rule.send_in_app) {
          const { error: reminderError } = await supabase
            .from('employee_reminders')
            .insert({
              employee_id: record.employee.id,
              event_type_id: rule.event_type_id,
              rule_id: rule.id,
              source_record_id: record.id,
              source_table: record.sourceTable,
              title: reminderTitle,
              message: processedMessage,
              event_date: record.eventDate,
              reminder_date: today.toISOString().split('T')[0],
              status: 'pending',
              created_by_role: 'system',
            });

          if (reminderError) {
            console.error(`Error creating reminder for ${record.employee.full_name}:`, reminderError);
          } else {
            remindersCreated.push(`${record.employee.full_name} - ${record.itemName}`);
            console.log(`Created reminder for ${record.employee.full_name}: ${record.itemName} expiring ${record.eventDate}`);
          }
        }

        // Send email if enabled
        if (rule.send_email && record.employee.email) {
          const { error: historyError } = await supabase
            .from('reminder_history')
            .insert({
              employee_id: record.employee.id,
              event_type_id: rule.event_type_id,
              rule_id: rule.id,
              delivery_method: 'email',
              status: 'sent',
              sent_at: new Date().toISOString(),
            });

          if (!historyError) {
            emailsSent.push(record.employee.email);
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
