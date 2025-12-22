import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventTypeAnalysis {
  id: string;
  name: string;
  code: string;
  category: string;
  sourceTable: string;
  dateField: string;
  hasActiveRules: boolean;
  activeRuleCount: number;
  upcomingExpirations: number;
  expiringIn30Days: number;
  expiringIn90Days: number;
}

interface Recommendation {
  eventTypeId: string;
  eventTypeName: string;
  eventTypeCode: string;
  type: 'missing_rule' | 'insufficient_coverage' | 'high_volume';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedIntervals: number[];
  affectedEmployees: number;
  suggestedRecipients: {
    employee: boolean;
    manager: boolean;
    hr: boolean;
  };
  suggestedPriority: 'low' | 'medium' | 'high' | 'critical';
  suggestedTemplate: string;
}

interface DiscoveredEventType {
  tableName: string;
  dateField: string;
  potentialEventName: string;
  suggestedCode: string;
  suggestedCategory: string;
  recordCount: number;
  urgentRecords: number;
  hasEmployeeLink: boolean;
}

// Tables to scan for date fields that could trigger reminders
const SCANNABLE_TABLES = [
  { table: 'employee_certifications', dateField: 'expiry_date', name: 'Certification Expiry', code: 'certification_expiry', category: 'document' },
  { table: 'employee_licenses', dateField: 'expiry_date', name: 'License Expiry', code: 'license_expiry', category: 'document' },
  { table: 'employee_visas', dateField: 'expiry_date', name: 'Visa Expiry', code: 'visa_expiry', category: 'compliance' },
  { table: 'employee_work_permits', dateField: 'expiry_date', name: 'Work Permit Expiry', code: 'work_permit_expiry', category: 'compliance' },
  { table: 'employee_passports', dateField: 'expiry_date', name: 'Passport Expiry', code: 'passport_expiry', category: 'document' },
  { table: 'employee_ids', dateField: 'expiry_date', name: 'ID Card Expiry', code: 'id_expiry', category: 'document' },
  { table: 'employee_memberships', dateField: 'end_date', name: 'Professional Membership Expiry', code: 'membership_expiry', category: 'document' },
  { table: 'union_memberships', dateField: 'leave_date', name: 'Union Membership Ending', code: 'union_membership_end', category: 'document' },
  { table: 'employee_skills', dateField: 'expiry_date', name: 'Skill Certification Expiry', code: 'skill_expiry', category: 'training' },
  { table: 'learning_assignments', dateField: 'due_date', name: 'Training Due', code: 'training_due', category: 'training' },
  { table: 'benefit_enrollment_periods', dateField: 'end_date', name: 'Benefits Enrollment Deadline', code: 'benefit_enrollment_deadline', category: 'benefits' },
  { table: 'benefit_enrollments', dateField: 'termination_date', name: 'Insurance Policy Expiry', code: 'insurance_expiry', category: 'benefits' },
  { table: 'appraisal_cycles', dateField: 'evaluation_deadline', name: 'Appraisal Deadline', code: 'appraisal_deadline', category: 'performance' },
  { table: 'employee_documents', dateField: 'expiry_date', name: 'Document Expiry', code: 'document_expiry', category: 'document' },
  { table: 'employee_contracts', dateField: 'end_date', name: 'Contract Ending', code: 'contract_end', category: 'hr' },
  { table: 'profiles', dateField: 'probation_end_date', name: 'Probation Ending', code: 'probation_end', category: 'hr' },
  { table: 'employee_medical_records', dateField: 'next_checkup_date', name: 'Medical Checkup Due', code: 'medical_checkup_due', category: 'wellness' },
  { table: 'employee_vaccinations', dateField: 'expiry_date', name: 'Vaccination Expiry', code: 'vaccination_expiry', category: 'wellness' },
  { table: 'safety_training_records', dateField: 'expiry_date', name: 'Safety Training Expiry', code: 'safety_training_expiry', category: 'compliance' },
  { table: 'equipment_assignments', dateField: 'return_date', name: 'Equipment Return Due', code: 'equipment_return_due', category: 'hr' },
  { table: 'vehicle_assignments', dateField: 'end_date', name: 'Vehicle Assignment Ending', code: 'vehicle_assignment_end', category: 'hr' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return new Response(
        JSON.stringify({ error: 'companyId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all configured event types
    const { data: eventTypes, error: eventTypesError } = await supabase
      .from('reminder_event_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (eventTypesError) {
      console.error('Error fetching event types:', eventTypesError);
      throw eventTypesError;
    }

    // Fetch existing rules for this company
    const { data: existingRules, error: rulesError } = await supabase
      .from('reminder_rules')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching rules:', rulesError);
      throw rulesError;
    }

    // Get company employees
    const { data: companyEmployees } = await supabase
      .from('profiles')
      .select('id')
      .eq('company_id', companyId);

    const employeeIds = (companyEmployees || []).map(e => e.id);

    const today = new Date();
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);
    const in90Days = new Date(today);
    in90Days.setDate(in90Days.getDate() + 90);

    const analyses: EventTypeAnalysis[] = [];
    const recommendations: Recommendation[] = [];
    const discoveredEventTypes: DiscoveredEventType[] = [];

    // Create a map of configured event types by code
    const configuredEventCodes = new Set((eventTypes || []).map(et => et.code));
    const configuredSourceTables = new Set((eventTypes || []).map(et => `${et.source_table}:${et.date_field}`));

    // Analyze each configured event type
    for (const eventType of eventTypes || []) {
      const rulesForType = (existingRules || []).filter(r => r.event_type_id === eventType.id);
      
      let upcomingExpirations = 0;
      let expiringIn30Days = 0;
      let expiringIn90Days = 0;

      // Query source table for upcoming expirations
      if (eventType.source_table && eventType.date_field && employeeIds.length > 0) {
        try {
          const { data: records, error: recordsError } = await supabase
            .from(eventType.source_table)
            .select(`employee_id, ${eventType.date_field}`)
            .in('employee_id', employeeIds)
            .gte(eventType.date_field, today.toISOString().split('T')[0])
            .lte(eventType.date_field, in90Days.toISOString().split('T')[0]);

          if (!recordsError && records) {
            for (const record of records) {
              const dateValue = record[eventType.date_field];
              if (dateValue) {
                const recordDate = new Date(dateValue);
                upcomingExpirations++;
                if (recordDate <= in30Days) {
                  expiringIn30Days++;
                }
                if (recordDate <= in90Days) {
                  expiringIn90Days++;
                }
              }
            }
          }
        } catch (err) {
          console.log(`Could not query ${eventType.source_table}:`, err);
        }
      }

      const analysis: EventTypeAnalysis = {
        id: eventType.id,
        name: eventType.name,
        code: eventType.code,
        category: eventType.category,
        sourceTable: eventType.source_table || '',
        dateField: eventType.date_field || '',
        hasActiveRules: rulesForType.length > 0,
        activeRuleCount: rulesForType.length,
        upcomingExpirations,
        expiringIn30Days,
        expiringIn90Days,
      };

      analyses.push(analysis);

      // Generate recommendations for configured event types
      if (!analysis.hasActiveRules) {
        const isHighPriority = ['certificate_expiry', 'license_expiry', 'membership_expiry', 'visa_expiry', 'work_permit_expiry']
          .includes(eventType.code);
        
        recommendations.push({
          eventTypeId: eventType.id,
          eventTypeName: eventType.name,
          eventTypeCode: eventType.code,
          type: 'missing_rule',
          priority: expiringIn30Days > 0 ? 'critical' : (isHighPriority ? 'high' : 'medium'),
          title: `No reminder rules for "${eventType.name}"`,
          description: expiringIn30Days > 0 
            ? `${expiringIn30Days} employees have ${eventType.name.toLowerCase()} events in the next 30 days with no automated reminders.`
            : `Configure automated reminders for ${eventType.name.toLowerCase()} to ensure timely notifications.`,
          suggestedIntervals: getIndustryStandardIntervals(eventType.code),
          affectedEmployees: upcomingExpirations,
          suggestedRecipients: getSuggestedRecipients(eventType.code),
          suggestedPriority: getSuggestedPriority(eventType.code),
          suggestedTemplate: generateMessageTemplate(eventType.name, eventType.code),
        });
      } else if (expiringIn30Days > 5 && rulesForType.every(r => r.days_before < 30)) {
        recommendations.push({
          eventTypeId: eventType.id,
          eventTypeName: eventType.name,
          eventTypeCode: eventType.code,
          type: 'insufficient_coverage',
          priority: 'high',
          title: `Extend reminder intervals for "${eventType.name}"`,
          description: `${expiringIn30Days} employees have events in 30 days, but reminders only start ${Math.max(...rulesForType.map(r => r.days_before))} days before.`,
          suggestedIntervals: [90, 60, 30, 14, 7],
          affectedEmployees: expiringIn30Days,
          suggestedRecipients: getSuggestedRecipients(eventType.code),
          suggestedPriority: 'high',
          suggestedTemplate: generateMessageTemplate(eventType.name, eventType.code),
        });
      }
    }

    // Discover unconfigured event types by scanning tables
    console.log('Scanning for unconfigured event types...');
    for (const scanConfig of SCANNABLE_TABLES) {
      const tableKey = `${scanConfig.table}:${scanConfig.dateField}`;
      
      // Skip if already configured
      if (configuredSourceTables.has(tableKey)) {
        continue;
      }

      try {
        // Check if table exists and has the date field
        let recordCount = 0;
        let urgentRecords = 0;
        let hasEmployeeLink = false;

        if (employeeIds.length > 0) {
          // Try to query with employee_id filter
          const { data: records, error } = await supabase
            .from(scanConfig.table)
            .select('*')
            .in('employee_id', employeeIds)
            .gte(scanConfig.dateField, today.toISOString().split('T')[0])
            .lte(scanConfig.dateField, in90Days.toISOString().split('T')[0]);

          if (!error && records && Array.isArray(records)) {
            hasEmployeeLink = true;
            recordCount = records.length;
            for (const record of records) {
              const rec = record as { [key: string]: unknown };
              const dateValue = rec[scanConfig.dateField];
              if (dateValue && typeof dateValue === 'string') {
                const recordDate = new Date(dateValue);
                if (recordDate <= in30Days) {
                  urgentRecords++;
                }
              }
            }
          }
        }

        // If no employee link or no records, try company_id filter
        if (!hasEmployeeLink) {
          const { data: records, error } = await supabase
            .from(scanConfig.table)
            .select('*')
            .eq('company_id', companyId)
            .gte(scanConfig.dateField, today.toISOString().split('T')[0])
            .lte(scanConfig.dateField, in90Days.toISOString().split('T')[0]);

          if (!error && records && Array.isArray(records)) {
            recordCount = records.length;
            for (const record of records) {
              const rec = record as { [key: string]: unknown };
              const dateValue = rec[scanConfig.dateField];
              if (dateValue && typeof dateValue === 'string') {
                const recordDate = new Date(dateValue);
                if (recordDate <= in30Days) {
                  urgentRecords++;
                }
              }
            }
          }
        }

        // Only report if there are records or if the event type looks important
        if (recordCount > 0 || isImportantEventType(scanConfig.code)) {
          discoveredEventTypes.push({
            tableName: scanConfig.table,
            dateField: scanConfig.dateField,
            potentialEventName: scanConfig.name,
            suggestedCode: scanConfig.code,
            suggestedCategory: scanConfig.category,
            recordCount,
            urgentRecords,
            hasEmployeeLink,
          });
        }
      } catch (err) {
        // Table doesn't exist or query failed - skip silently
        console.log(`Table ${scanConfig.table} not found or query failed:`, err);
      }
    }

    // Sort recommendations by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    // Sort discovered event types by urgency
    discoveredEventTypes.sort((a, b) => b.urgentRecords - a.urgentRecords);

    // Generate summary using AI if available
    let aiSummary = '';
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (LOVABLE_API_KEY && (recommendations.length > 0 || discoveredEventTypes.length > 0)) {
      try {
        const aiPrompt = `Summarize these HR reminder recommendations:
        
Configured event types missing rules: ${recommendations.filter(r => r.type === 'missing_rule').length}
Event types needing better coverage: ${recommendations.filter(r => r.type === 'insufficient_coverage').length}
Discovered unconfigured data sources: ${discoveredEventTypes.length}
Most urgent gaps: ${discoveredEventTypes.filter(d => d.urgentRecords > 0).map(d => `${d.potentialEventName} (${d.urgentRecords} urgent)`).join(', ') || 'None'}

Top recommendations: ${JSON.stringify(recommendations.slice(0, 3).map(r => r.title))}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are an HR compliance assistant. Provide a brief, actionable summary (2-3 sentences) of reminder rule gaps and discovery findings. Focus on risk, priority, and the most impactful actions to take.'
              },
              {
                role: 'user',
                content: aiPrompt
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiSummary = aiData.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.log('AI summary generation failed:', err);
      }
    }

    return new Response(
      JSON.stringify({
        analyses,
        recommendations,
        discoveredEventTypes,
        summary: {
          totalEventTypes: analyses.length,
          coveredEventTypes: analyses.filter(a => a.hasActiveRules).length,
          uncoveredEventTypes: analyses.filter(a => !a.hasActiveRules).length,
          totalUpcomingExpirations: analyses.reduce((sum, a) => sum + a.upcomingExpirations, 0),
          criticalRecommendations: recommendations.filter(r => r.priority === 'critical').length,
          discoveredDataSources: discoveredEventTypes.length,
          urgentDiscoveries: discoveredEventTypes.filter(d => d.urgentRecords > 0).length,
          aiSummary,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-reminder-analysis:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function isImportantEventType(code: string): boolean {
  const important = [
    'visa_expiry', 'work_permit_expiry', 'license_expiry', 'certification_expiry',
    'contract_end', 'probation_end', 'safety_training_expiry'
  ];
  return important.includes(code);
}

function getIndustryStandardIntervals(eventCode: string): number[] {
  const complianceCritical = ['certificate_expiry', 'license_expiry', 'visa_expiry', 'work_permit_expiry', 'certification_expiry'];
  const documentBased = ['contract_end', 'membership_expiry', 'id_expiry', 'passport_expiry', 'document_expiry'];
  const hrEvents = ['probation_end', 'birthday', 'work_anniversary'];
  const trainingEvents = ['training_due', 'skill_expiry', 'safety_training_expiry'];

  if (complianceCritical.includes(eventCode)) {
    return [90, 60, 30, 14, 7, 3];
  } else if (documentBased.includes(eventCode)) {
    return [60, 30, 14, 7];
  } else if (hrEvents.includes(eventCode)) {
    return [30, 7, 1];
  } else if (trainingEvents.includes(eventCode)) {
    return [30, 14, 7, 1];
  }
  return [30, 14, 7];
}

function getSuggestedRecipients(eventCode: string): { employee: boolean; manager: boolean; hr: boolean } {
  const complianceCritical = ['certificate_expiry', 'license_expiry', 'visa_expiry', 'work_permit_expiry', 'certification_expiry', 'safety_training_expiry'];
  const managerInvolved = ['probation_end', 'contract_end', 'training_due', 'appraisal_deadline'];
  const hrOnly = ['benefit_enrollment_deadline', 'insurance_expiry'];

  if (complianceCritical.includes(eventCode)) {
    return { employee: true, manager: true, hr: true };
  } else if (hrOnly.includes(eventCode)) {
    return { employee: true, manager: false, hr: true };
  } else if (managerInvolved.includes(eventCode)) {
    return { employee: true, manager: true, hr: false };
  }
  return { employee: true, manager: false, hr: false };
}

function getSuggestedPriority(eventCode: string): 'low' | 'medium' | 'high' | 'critical' {
  const critical = ['visa_expiry', 'work_permit_expiry', 'safety_training_expiry'];
  const high = ['certificate_expiry', 'license_expiry', 'contract_end', 'certification_expiry'];
  const medium = ['probation_end', 'membership_expiry', 'id_expiry', 'training_due', 'appraisal_deadline'];

  if (critical.includes(eventCode)) return 'critical';
  if (high.includes(eventCode)) return 'high';
  if (medium.includes(eventCode)) return 'medium';
  return 'low';
}

function generateMessageTemplate(eventName: string, eventCode: string): string {
  const templates: Record<string, string> = {
    certificate_expiry: `Reminder: {employee_name}'s certification will expire on {event_date} ({days_until} days remaining). Please ensure renewal is completed to maintain compliance.`,
    certification_expiry: `Reminder: {employee_name}'s certification will expire on {event_date} ({days_until} days remaining). Please ensure renewal is completed to maintain compliance.`,
    license_expiry: `Important: {employee_name}'s professional license expires on {event_date}. Action required within {days_until} days to avoid service interruption.`,
    visa_expiry: `URGENT: {employee_name}'s visa expires on {event_date} ({days_until} days). Immediate action required to maintain work authorization.`,
    work_permit_expiry: `CRITICAL: Work permit for {employee_name} expires on {event_date}. {days_until} days to complete renewal process.`,
    probation_end: `Reminder: {employee_name}'s probation period ends on {event_date}. Please complete the performance review within {days_until} days.`,
    contract_end: `Notice: {employee_name}'s contract ends on {event_date} ({days_until} days). Review renewal or offboarding requirements.`,
    membership_expiry: `Reminder: {employee_name}'s professional membership expires on {event_date}. {days_until} days to renew.`,
    training_due: `Training Reminder: {employee_name} has required training due on {event_date} ({days_until} days remaining).`,
    skill_expiry: `Skill Renewal: {employee_name}'s skill certification expires on {event_date}. {days_until} days to recertify.`,
    appraisal_deadline: `Appraisal Due: Performance review for {employee_name} is due by {event_date} ({days_until} days).`,
    safety_training_expiry: `SAFETY ALERT: {employee_name}'s safety training expires on {event_date}. Renewal required within {days_until} days.`,
    document_expiry: `Document Alert: {employee_name}'s document expires on {event_date} ({days_until} days remaining).`,
    benefit_enrollment_deadline: `Benefits Enrollment: Open enrollment ends on {event_date}. {days_until} days remaining to make selections.`,
    insurance_expiry: `Insurance Notice: {employee_name}'s insurance coverage ends on {event_date}. Review options within {days_until} days.`,
  };

  return templates[eventCode] || `Reminder: ${eventName} for {employee_name} is scheduled for {event_date} ({days_until} days remaining).`;
}
