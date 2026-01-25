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
  email_template_id: string | null;
  notification_method: string;
  effective_from: string | null;
  effective_to: string | null;
  event_type: {
    code: string;
    name: string;
    category: string;
  };
}

interface CompanySettings {
  timezone: string | null;
  business_hours_start: string | null;
  business_hours_end: string | null;
}

// Get current date in a specific timezone
function getDateInTimezone(timezone: string): { date: Date; dateStr: string } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = formatter.format(now); // YYYY-MM-DD format
  return { date: now, dateStr };
}

// Check if a rule is effective for a given date
function isRuleEffective(rule: ReminderRule, dateStr: string): boolean {
  if (rule.effective_from && dateStr < rule.effective_from) {
    return false;
  }
  if (rule.effective_to && dateStr > rule.effective_to) {
    return false;
  }
  return true;
}

// Calculate expiration date (event date + 7 days by default)
function calculateExpiresAt(eventDate: string, daysAfter: number = 7): string {
  const expiry = new Date(eventDate);
  expiry.setDate(expiry.getDate() + daysAfter);
  return expiry.toISOString();
}

interface EmailTemplate {
  id: string;
  category: string;
  name: string;
  subject: string;
  body: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  company_id: string;
  hire_date: string | null;
  probation_end_date: string | null;
  current_contract_end_date: string | null;
  date_of_birth: string | null;
  retirement_date?: string | null;
  separation_date?: string | null;
  last_working_date?: string | null;
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
    employeeFirstName?: string;
    eventDate: string;
    daysUntil: number;
    eventTypeName: string;
    itemName?: string;
    companyName?: string;
  }
): string {
  // Format the date nicely
  const formattedDate = new Date(data.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const firstName = data.employeeFirstName || data.employeeName.split(' ')[0];

  return template
    // Single curly brace format (in-app)
    .replace(/{employee_name}/gi, data.employeeName)
    .replace(/{employee_first_name}/gi, firstName)
    .replace(/{event_date}/gi, formattedDate)
    .replace(/{days_until}/gi, data.daysUntil.toString())
    .replace(/{event_type}/gi, data.eventTypeName)
    .replace(/{item_name}/gi, data.itemName || data.eventTypeName)
    .replace(/{company_name}/gi, data.companyName || '')
    // Double curly brace format (email templates)
    .replace(/\{\{employee_name\}\}/gi, data.employeeName)
    .replace(/\{\{employee_full_name\}\}/gi, data.employeeName)
    .replace(/\{\{employee_first_name\}\}/gi, firstName)
    .replace(/\{\{event_date\}\}/gi, formattedDate)
    .replace(/\{\{days_until\}\}/gi, data.daysUntil.toString())
    .replace(/\{\{event_type\}\}/gi, data.eventTypeName)
    .replace(/\{\{event_title\}\}/gi, data.itemName || data.eventTypeName)
    .replace(/\{\{item_name\}\}/gi, data.itemName || data.eventTypeName)
    .replace(/\{\{company_name\}\}/gi, data.companyName || '');
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

    // Get all active reminder rules with email_template_id, effective_from, effective_to
    const { data: rules, error: rulesError } = await supabase
      .from('reminder_rules')
      .select(`
        *,
        event_type:reminder_event_types(code, name, category)
      `)
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching rules:', rulesError);
      throw rulesError;
    }

    console.log(`Found ${rules?.length || 0} active reminder rules`);

    // Cache company timezones to avoid repeated lookups
    const companyTimezones: Record<string, string> = {};
    const companySettings: Record<string, CompanySettings> = {};

    const remindersCreated: string[] = [];
    const emailsSent: string[] = [];

    for (const rule of (rules as ReminderRule[]) || []) {
      // Fetch company timezone if not cached
      if (!companyTimezones[rule.company_id]) {
        const { data: company } = await supabase
          .from('companies')
          .select('timezone, business_hours_start, business_hours_end')
          .eq('id', rule.company_id)
          .single();
        
        companyTimezones[rule.company_id] = company?.timezone || 'UTC';
        companySettings[rule.company_id] = {
          timezone: company?.timezone || 'UTC',
          business_hours_start: company?.business_hours_start || null,
          business_hours_end: company?.business_hours_end || null,
        };
      }

      const timezone = companyTimezones[rule.company_id];
      const { dateStr: todayStr } = getDateInTimezone(timezone);

      // Check if rule is effective for today's date
      if (!isRuleEffective(rule, todayStr)) {
        console.log(`Rule ${rule.id} skipped - not effective (from: ${rule.effective_from}, to: ${rule.effective_to}, today: ${todayStr})`);
        continue;
      }

      // Calculate target date in company timezone
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + rule.days_before);
      const targetFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const targetDateStr = targetFormatter.format(targetDate);

      console.log(`Processing rule for ${rule.event_type?.code} (company TZ: ${timezone}), target date: ${targetDateStr}, days_before: ${rule.days_before}`);

      let records: RecordWithEmployee[] = [];

      // Fetch records based on event type - now fetching individual records with their details
      switch (rule.event_type?.code) {
        // ========================
        // WORKFORCE EVENTS - NEW HIRE & REHIRE
        // ========================
        case 'NEW_HIRE_STARTING':
        case 'REHIRE_STARTING': {
          const isRehire = rule.event_type?.code === 'REHIRE_STARTING';
          // Query employee_transactions for HIRE or REHIRE types
          const { data: transactions } = await supabase
            .from('employee_transactions')
            .select(`
              id, effective_date, transaction_type_id,
              transaction_type:transaction_type_id(code, name),
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
            `)
            .eq('company_id', rule.company_id)
            .eq('effective_date', targetDateStr)
            .eq('status', 'approved');
          
          records = (transactions || [])
            .filter((t: any) => {
              const typeCode = t.transaction_type?.code?.toUpperCase();
              return isRehire ? typeCode === 'REHIRE' : typeCode === 'HIRE';
            })
            .map((t: any) => ({
              id: t.id,
              employee: t.profiles,
              eventDate: t.effective_date,
              itemName: isRehire ? 'Rehire Start' : 'New Hire Start',
              sourceTable: 'employee_transactions'
            }));
          break;
        }

        // ========================
        // WORKFORCE EVENTS - PROBATION
        // ========================
        case 'PROBATION_END':
        case 'probation_end': {
          const { data: probationEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .eq('probation_end_date', targetDateStr);
          
          records = (probationEmps || []).map((emp: Employee) => ({
            id: emp.id,
            employee: emp,
            eventDate: emp.probation_end_date!,
            itemName: 'Probation Period',
            sourceTable: 'profiles'
          }));
          break;
        }

        case 'PROBATION_REVIEW_DUE': {
          // Same as probation_end but with different messaging for manager to review
          const { data: probationEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .eq('probation_end_date', targetDateStr);
          
          records = (probationEmps || []).map((emp: Employee) => ({
            id: emp.id,
            employee: emp,
            eventDate: emp.probation_end_date!,
            itemName: 'Probation Review',
            sourceTable: 'profiles'
          }));
          break;
        }

        // ========================
        // WORKFORCE EVENTS - ACTING & SECONDMENT
        // ========================
        case 'ACTING_ASSIGNMENT_ENDING': {
          const { data: positions } = await supabase
            .from('employee_positions')
            .select(`
              id, end_date, assignment_type, position_title,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
            `)
            .eq('assignment_type', 'acting')
            .eq('end_date', targetDateStr)
            .eq('is_active', true);
          
          records = (positions || [])
            .filter((p: any) => p.profiles?.company_id === rule.company_id)
            .map((p: any) => ({
              id: p.id,
              employee: p.profiles,
              eventDate: p.end_date,
              itemName: `Acting Assignment - ${p.position_title || 'Position'}`,
              sourceTable: 'employee_positions'
            }));
          break;
        }

        case 'SECONDMENT_ENDING': {
          const { data: positions } = await supabase
            .from('employee_positions')
            .select(`
              id, end_date, assignment_type, position_title,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
            `)
            .eq('assignment_type', 'secondment')
            .eq('end_date', targetDateStr)
            .eq('is_active', true);
          
          records = (positions || [])
            .filter((p: any) => p.profiles?.company_id === rule.company_id)
            .map((p: any) => ({
              id: p.id,
              employee: p.profiles,
              eventDate: p.end_date,
              itemName: `Secondment - ${p.position_title || 'Position'}`,
              sourceTable: 'employee_positions'
            }));
          break;
        }

        // ========================
        // WORKFORCE EVENTS - POSITION/SALARY/STATUS CHANGES
        // ========================
        case 'POSITION_CHANGE_EFFECTIVE': {
          const { data: transactions } = await supabase
            .from('employee_transactions')
            .select(`
              id, effective_date, transaction_type_id,
              transaction_type:transaction_type_id(code, name),
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
            `)
            .eq('company_id', rule.company_id)
            .eq('effective_date', targetDateStr)
            .eq('status', 'approved');
          
          records = (transactions || [])
            .filter((t: any) => {
              const typeCode = t.transaction_type?.code?.toUpperCase();
              return ['PROMOTION', 'DEMOTION', 'POSITION_CHANGE'].includes(typeCode);
            })
            .map((t: any) => ({
              id: t.id,
              employee: t.profiles,
              eventDate: t.effective_date,
              itemName: t.transaction_type?.name || 'Position Change',
              sourceTable: 'employee_transactions'
            }));
          break;
        }

        case 'TRANSFER_EFFECTIVE': {
          const { data: transactions } = await supabase
            .from('employee_transactions')
            .select(`
              id, effective_date, transaction_type_id,
              transaction_type:transaction_type_id(code, name),
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
            `)
            .eq('company_id', rule.company_id)
            .eq('effective_date', targetDateStr)
            .eq('status', 'approved');
          
          records = (transactions || [])
            .filter((t: any) => {
              const typeCode = t.transaction_type?.code?.toUpperCase();
              return ['TRANSFER', 'BULK_TRANSFER', 'INTER_COMPANY_TRANSFER'].includes(typeCode);
            })
            .map((t: any) => ({
              id: t.id,
              employee: t.profiles,
              eventDate: t.effective_date,
              itemName: t.transaction_type?.name || 'Transfer',
              sourceTable: 'employee_transactions'
            }));
          break;
        }

        case 'SALARY_CHANGE_EFFECTIVE': {
          const { data: transactions } = await supabase
            .from('employee_transactions')
            .select(`
              id, effective_date, transaction_type_id,
              transaction_type:transaction_type_id(code, name),
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
            `)
            .eq('company_id', rule.company_id)
            .eq('effective_date', targetDateStr)
            .eq('status', 'approved');
          
          records = (transactions || [])
            .filter((t: any) => {
              const typeCode = t.transaction_type?.code?.toUpperCase();
              return ['SALARY_CHANGE', 'RATE_CHANGE', 'SALARY_ADJUSTMENT'].includes(typeCode);
            })
            .map((t: any) => ({
              id: t.id,
              employee: t.profiles,
              eventDate: t.effective_date,
              itemName: t.transaction_type?.name || 'Salary Change',
              sourceTable: 'employee_transactions'
            }));
          break;
        }

        case 'STATUS_CHANGE_EFFECTIVE': {
          const { data: transactions } = await supabase
            .from('employee_transactions')
            .select(`
              id, effective_date, transaction_type_id,
              transaction_type:transaction_type_id(code, name),
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
            `)
            .eq('company_id', rule.company_id)
            .eq('effective_date', targetDateStr)
            .eq('status', 'approved');
          
          records = (transactions || [])
            .filter((t: any) => {
              const typeCode = t.transaction_type?.code?.toUpperCase();
              return ['STATUS_CHANGE', 'EMPLOYMENT_STATUS_CHANGE'].includes(typeCode);
            })
            .map((t: any) => ({
              id: t.id,
              employee: t.profiles,
              eventDate: t.effective_date,
              itemName: t.transaction_type?.name || 'Status Change',
              sourceTable: 'employee_transactions'
            }));
          break;
        }

        // ========================
        // WORKFORCE EVENTS - CONTRACT & RETIREMENT
        // ========================
        case 'CONTRACT_END':
        case 'contract_end': {
          const { data: contractEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .eq('current_contract_end_date', targetDateStr);
          
          records = (contractEmps || []).map((emp: any) => ({
            id: emp.id,
            employee: emp,
            eventDate: emp.current_contract_end_date!,
            itemName: 'Employment Contract',
            sourceTable: 'profiles'
          }));
          break;
        }

        case 'CONTRACT_EXTENSION_DUE': {
          // Same query as contract_end but different messaging for extension review
          const { data: contractEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .eq('current_contract_end_date', targetDateStr);
          
          records = (contractEmps || []).map((emp: any) => ({
            id: emp.id,
            employee: emp,
            eventDate: emp.current_contract_end_date!,
            itemName: 'Contract Extension Review',
            sourceTable: 'profiles'
          }));
          break;
        }

        case 'RETIREMENT': {
          const { data: retirementEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, retirement_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('is_active', true)
            .eq('retirement_date', targetDateStr);
          
          records = (retirementEmps || []).map((emp: any) => ({
            id: emp.id,
            employee: emp,
            eventDate: emp.retirement_date!,
            itemName: 'Retirement',
            sourceTable: 'profiles'
          }));
          break;
        }

        // ========================
        // WORKFORCE EVENTS - SEPARATION & OFFBOARDING
        // ========================
        case 'SEPARATION_EFFECTIVE': {
          const { data: separationEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, separation_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('separation_date', targetDateStr);
          
          records = (separationEmps || []).map((emp: any) => ({
            id: emp.id,
            employee: emp,
            eventDate: emp.separation_date!,
            itemName: 'Employee Separation',
            sourceTable: 'profiles'
          }));
          break;
        }

        case 'LAST_WORKING_DAY': {
          const { data: lwdEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, last_working_date, date_of_birth')
            .eq('company_id', rule.company_id)
            .eq('last_working_date', targetDateStr);
          
          records = (lwdEmps || []).map((emp: any) => ({
            id: emp.id,
            employee: emp,
            eventDate: emp.last_working_date!,
            itemName: 'Last Working Day',
            sourceTable: 'profiles'
          }));
          break;
        }

        case 'OFFBOARDING_TASK_DUE': {
          const { data: tasks } = await supabase
            .from('offboarding_instance_tasks')
            .select(`
              id, due_date, title, task_type, status,
              offboarding_instance:instance_id(
                id,
                profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
              )
            `)
            .eq('due_date', targetDateStr)
            .neq('status', 'completed');
          
          records = (tasks || [])
            .filter((t: any) => t.offboarding_instance?.profiles?.company_id === rule.company_id)
            .map((t: any) => ({
              id: t.id,
              employee: t.offboarding_instance?.profiles,
              eventDate: t.due_date,
              itemName: t.title || 'Offboarding Task',
              sourceTable: 'offboarding_instance_tasks'
            }));
          break;
        }

        case 'EQUIPMENT_RETURN_DUE': {
          const { data: tasks } = await supabase
            .from('offboarding_instance_tasks')
            .select(`
              id, due_date, title, task_type, status,
              offboarding_instance:instance_id(
                id,
                profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
              )
            `)
            .eq('due_date', targetDateStr)
            .eq('task_type', 'equipment')
            .neq('status', 'completed');
          
          records = (tasks || [])
            .filter((t: any) => t.offboarding_instance?.profiles?.company_id === rule.company_id)
            .map((t: any) => ({
              id: t.id,
              employee: t.offboarding_instance?.profiles,
              eventDate: t.due_date,
              itemName: t.title || 'Equipment Return',
              sourceTable: 'offboarding_instance_tasks'
            }));
          break;
        }

        case 'KNOWLEDGE_TRANSFER_DUE': {
          const { data: tasks } = await supabase
            .from('offboarding_instance_tasks')
            .select(`
              id, due_date, title, task_type, status,
              offboarding_instance:instance_id(
                id,
                profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
              )
            `)
            .eq('due_date', targetDateStr)
            .eq('task_type', 'knowledge_transfer')
            .neq('status', 'completed');
          
          records = (tasks || [])
            .filter((t: any) => t.offboarding_instance?.profiles?.company_id === rule.company_id)
            .map((t: any) => ({
              id: t.id,
              employee: t.offboarding_instance?.profiles,
              eventDate: t.due_date,
              itemName: t.title || 'Knowledge Transfer',
              sourceTable: 'offboarding_instance_tasks'
            }));
          break;
        }

        case 'EXIT_INTERVIEW_SCHEDULED': {
          const { data: instances } = await supabase
            .from('offboarding_instances')
            .select(`
              id, exit_interview_date, status,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, date_of_birth)
            `)
            .eq('exit_interview_date', targetDateStr)
            .eq('status', 'in_progress');
          
          records = (instances || [])
            .filter((i: any) => i.profiles?.company_id === rule.company_id)
            .map((i: any) => ({
              id: i.id,
              employee: i.profiles,
              eventDate: i.exit_interview_date,
              itemName: 'Exit Interview',
              sourceTable: 'offboarding_instances'
            }));
          break;
        }

        // ========================
        // WORKFORCE EVENTS - VACANCY & HEADCOUNT
        // ========================
        case 'VACANCY_CREATED': {
          // Query positions that recently became vacant (incumbent left)
          const { data: vacancies } = await supabase
            .from('positions')
            .select(`
              id, title, status, updated_at,
              department:department_id(id, name, company_id)
            `)
            .is('incumbent_id', null)
            .eq('status', 'active');
          
          // Filter to company and recently updated (within days_before window)
          const targetDateObj = new Date(targetDateStr);
          records = (vacancies || [])
            .filter((v: any) => {
              if (v.department?.company_id !== rule.company_id) return false;
              const updatedAt = new Date(v.updated_at);
              const diffDays = Math.floor((targetDateObj.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays <= 1;
            })
            .map((v: any) => ({
              id: v.id,
              employee: {
                id: v.id,
                full_name: `${v.title} Vacancy`,
                email: '',
                company_id: v.department?.company_id,
                hire_date: null,
                probation_end_date: null,
                current_contract_end_date: null,
                date_of_birth: null
              },
              eventDate: targetDateStr,
              itemName: `Position Vacancy: ${v.title}`,
              sourceTable: 'positions'
            }));
          break;
        }

        case 'HEADCOUNT_REQUEST_PENDING': {
          const { data: requests } = await supabase
            .from('headcount_requests')
            .select(`
              id, created_at, position_title, status, requested_by,
              company_id
            `)
            .eq('company_id', rule.company_id)
            .eq('status', 'pending');
          
          // Create reminders for pending requests that have been waiting
          records = (requests || []).map((r: any) => ({
            id: r.id,
            employee: {
              id: r.requested_by || r.id,
              full_name: `Headcount Request: ${r.position_title}`,
              email: '',
              company_id: r.company_id,
              hire_date: null,
              probation_end_date: null,
              current_contract_end_date: null,
              date_of_birth: null
            },
            eventDate: r.created_at.split('T')[0],
            itemName: `Pending Headcount: ${r.position_title}`,
            sourceTable: 'headcount_requests'
          }));
          break;
        }

        // ========================
        // WORKFORCE EVENTS - MILESTONES (moved from milestone category)
        // ========================
        case 'BIRTHDAY':
        case 'birthday': {
          const monthDay = targetDateStr.substring(5); // MM-DD
          const { data: birthdayEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth')
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

        case 'WORK_ANNIVERSARY':
        case 'work_anniversary': {
          const anniversaryMonthDay = targetDateStr.substring(5);
          const { data: anniversaryEmps } = await supabase
            .from('profiles')
            .select('id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth')
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

        // ========================
        // LEAVE EVENTS
        // ========================
        case 'leave_start': {
          const { data: leaveRecords } = await supabase
            .from('leave_requests')
            .select(`
              id,
              start_date,
              leave_type:leave_types(name),
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
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
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
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

        // ========================
        // DOCUMENT & COMPLIANCE EVENTS
        // ========================
        case 'license_expiry': {
          const { data: licenseRecords } = await supabase
            .from('employee_licenses')
            .select(`
              id,
              license_name,
              license_type,
              expiry_date,
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
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
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
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
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
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
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
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
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
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
              profiles:employee_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
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

        // ========================
        // 360 FEEDBACK EVENTS
        // ========================
        case '360_FEEDBACK_DUE': {
          // Query feedback_360_requests with upcoming due dates for non-self raters
          const { data: feedbackRequests } = await supabase
            .from('feedback_360_requests')
            .select(`
              id,
              due_date,
              status,
              rater_category_id,
              subject_employee_id,
              rater_id,
              feedback_360_cycles!inner(id, name, company_id, status),
              subject:subject_employee_id(id, full_name),
              rater:rater_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
            `)
            .eq('status', 'pending')
            .eq('due_date', targetDateStr)
            .eq('feedback_360_cycles.status', 'active');

          // Get rater categories to filter out self-reviews
          const { data: raterCategories } = await supabase
            .from('rater_categories')
            .select('id, name')
            .ilike('name', '%self%');
          
          const selfCategoryIds = new Set((raterCategories || []).map((c: any) => c.id));
          
          records = (feedbackRequests || [])
            .filter((r: any) => !selfCategoryIds.has(r.rater_category_id)) // Exclude self-reviews
            .filter((r: any) => r.rater?.company_id === rule.company_id)
            .map((r: any) => ({
              id: r.id,
              employee: r.rater,
              eventDate: r.due_date,
              itemName: `360 Feedback for ${r.subject?.full_name || 'Employee'}`,
              sourceTable: 'feedback_360_requests'
            }));
          break;
        }

        case '360_SELF_REVIEW_DUE': {
          // Query feedback_360_requests with upcoming due dates for self-reviews only
          const { data: selfReviewRequests } = await supabase
            .from('feedback_360_requests')
            .select(`
              id,
              due_date,
              status,
              rater_category_id,
              subject_employee_id,
              rater_id,
              feedback_360_cycles!inner(id, name, company_id, status),
              subject:subject_employee_id(id, full_name),
              rater:rater_id(id, full_name, email, company_id, hire_date, probation_end_date, current_contract_end_date, date_of_birth)
            `)
            .eq('status', 'pending')
            .eq('due_date', targetDateStr)
            .eq('feedback_360_cycles.status', 'active');

          // Get self rater categories
          const { data: selfCategories } = await supabase
            .from('rater_categories')
            .select('id, name')
            .ilike('name', '%self%');
          
          const selfCatIds = new Set((selfCategories || []).map((c: any) => c.id));
          
          records = (selfReviewRequests || [])
            .filter((r: any) => selfCatIds.has(r.rater_category_id)) // Only self-reviews
            .filter((r: any) => r.rater?.company_id === rule.company_id)
            .map((r: any) => ({
              id: r.id,
              employee: r.rater,
              eventDate: r.due_date,
              itemName: `360 Self-Assessment for ${r.subject?.full_name || 'yourself'}`,
              sourceTable: 'feedback_360_requests'
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
          .eq('reminder_date', todayStr)
          .maybeSingle();

        if (existing) {
          console.log(`Reminder already exists for ${record.employee.full_name} - ${record.itemName}`);
          continue;
        }

        // Prepare placeholder data
        const placeholderData = {
          employeeName: record.employee.full_name,
          employeeFirstName: record.employee.full_name.split(' ')[0],
          eventDate: record.eventDate,
          daysUntil: rule.days_before,
          eventTypeName: rule.event_type?.name || 'Event',
          itemName: record.itemName,
          companyName: 'Your Company', // Could be fetched from companies table if needed
        };

        // Build the in-app reminder message using message_template or default
        const defaultInAppTemplate = `Dear {employee_name},\n\nThis is a reminder that your {item_name} will expire on {event_date} ({days_until} days from now).\n\nPlease take the necessary steps.\n\nFrom HR Department`;
        const inAppTemplate = rule.message_template || defaultInAppTemplate;
        const processedMessage = replaceMessagePlaceholders(inAppTemplate, placeholderData);

        // Create title with specific item name
        const reminderTitle = `${record.itemName} - ${rule.event_type?.name}`;

        // Determine if we should send in-app and/or email based on notification_method
        const shouldSendInApp = rule.notification_method === 'in_app' || rule.notification_method === 'both';
        const shouldSendEmail = rule.notification_method === 'email' || rule.notification_method === 'both';

        // Calculate expiration date for the reminder
        const expiresAt = calculateExpiresAt(record.eventDate, 7);

        // Get employee's timezone preference for delivery
        const { data: empProfile } = await supabase
          .from('profiles')
          .select('timezone')
          .eq('id', record.employee.id)
          .single();
        const deliveryTimezone = empProfile?.timezone || timezone;

        // Create in-app reminder if enabled
        if (shouldSendInApp) {
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
              reminder_date: todayStr,
              status: 'pending',
              created_by_role: 'system',
              expires_at: expiresAt,
              delivery_timezone: deliveryTimezone,
            });

          if (reminderError) {
            console.error(`Error creating reminder for ${record.employee.full_name}:`, reminderError);
          } else {
            remindersCreated.push(`${record.employee.full_name} - ${record.itemName}`);
            console.log(`Created reminder for ${record.employee.full_name}: ${record.itemName} expiring ${record.eventDate}`);
          }
        }

        // Send email if enabled
        if (shouldSendEmail && record.employee.email) {
          // Fetch email template: first try linked template, then category match, then default
          let emailTemplate: EmailTemplate | null = null;
          
          if (rule.email_template_id) {
            const { data: linkedTemplate } = await supabase
              .from('reminder_email_templates')
              .select('id, category, name, subject, body')
              .eq('id', rule.email_template_id)
              .eq('is_active', true)
              .single();
            emailTemplate = linkedTemplate;
          }
          
          // If no linked template, try to find one by category
          if (!emailTemplate && rule.event_type?.category) {
            const { data: categoryTemplates } = await supabase
              .from('reminder_email_templates')
              .select('id, category, name, subject, body')
              .eq('category', rule.event_type.category)
              .eq('is_active', true)
              .or(`is_default.eq.true,company_id.eq.${rule.company_id}`)
              .order('is_default', { ascending: true }) // Company templates first
              .limit(1);
            
            if (categoryTemplates && categoryTemplates.length > 0) {
              emailTemplate = categoryTemplates[0];
            }
          }

          // Build email content
          let emailSubject = `Reminder: ${reminderTitle}`;
          let emailBody = processedMessage;
          
          if (emailTemplate) {
            emailSubject = replaceMessagePlaceholders(emailTemplate.subject, placeholderData);
            emailBody = replaceMessagePlaceholders(emailTemplate.body, placeholderData);
            console.log(`Using email template "${emailTemplate.name}" for ${record.employee.email}`);
          } else {
            console.log(`No email template found for category ${rule.event_type?.category}, using in-app message`);
          }

          // Log email send attempt (actual sending would use Resend or similar)
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
            console.log(`Email logged for ${record.employee.email}: ${emailSubject}`);
          }
        }
      }
    }

    // Update sent reminders status - use current UTC date
    const currentDate = new Date().toISOString().split('T')[0];
    const { error: updateError } = await supabase
      .from('employee_reminders')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('status', 'pending')
      .lte('reminder_date', currentDate);

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
