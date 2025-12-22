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

    // Fetch all event types
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

    const today = new Date();
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);
    const in90Days = new Date(today);
    in90Days.setDate(in90Days.getDate() + 90);

    const analyses: EventTypeAnalysis[] = [];
    const recommendations: Recommendation[] = [];

    // Analyze each event type
    for (const eventType of eventTypes || []) {
      const rulesForType = (existingRules || []).filter(r => r.event_type_id === eventType.id);
      
      let upcomingExpirations = 0;
      let expiringIn30Days = 0;
      let expiringIn90Days = 0;

      // Query source table for upcoming expirations
      if (eventType.source_table && eventType.date_field) {
        try {
          // Get employees for this company
          const { data: companyEmployees } = await supabase
            .from('profiles')
            .select('id')
            .eq('company_id', companyId);

          const employeeIds = (companyEmployees || []).map(e => e.id);

          if (employeeIds.length > 0) {
            // Query the source table for records belonging to company employees
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

      // Generate recommendations
      if (!analysis.hasActiveRules) {
        // No rules configured for this event type
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
        // High volume with only short-notice reminders
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

    // Sort recommendations by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Generate summary using AI if available
    let aiSummary = '';
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (LOVABLE_API_KEY && recommendations.length > 0) {
      try {
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
                content: 'You are an HR compliance assistant. Provide a brief, actionable summary (2-3 sentences) of reminder rule recommendations. Focus on risk and priority.'
              },
              {
                role: 'user',
                content: `Summarize these reminder rule recommendations for HR:\n${JSON.stringify(recommendations.slice(0, 5), null, 2)}`
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
        summary: {
          totalEventTypes: analyses.length,
          coveredEventTypes: analyses.filter(a => a.hasActiveRules).length,
          uncoveredEventTypes: analyses.filter(a => !a.hasActiveRules).length,
          totalUpcomingExpirations: analyses.reduce((sum, a) => sum + a.upcomingExpirations, 0),
          criticalRecommendations: recommendations.filter(r => r.priority === 'critical').length,
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

function getIndustryStandardIntervals(eventCode: string): number[] {
  // Industry-standard intervals based on compliance requirements
  const complianceCritical = ['certificate_expiry', 'license_expiry', 'visa_expiry', 'work_permit_expiry'];
  const documentBased = ['contract_end', 'membership_expiry', 'id_expiry', 'passport_expiry'];
  const hrEvents = ['probation_end', 'birthday', 'work_anniversary'];

  if (complianceCritical.includes(eventCode)) {
    return [90, 60, 30, 14, 7, 3]; // Extended notice for compliance
  } else if (documentBased.includes(eventCode)) {
    return [60, 30, 14, 7]; // Standard document renewal
  } else if (hrEvents.includes(eventCode)) {
    return [30, 7, 1]; // Shorter notice for celebrations/reviews
  }
  return [30, 14, 7]; // Default
}

function getSuggestedRecipients(eventCode: string): { employee: boolean; manager: boolean; hr: boolean } {
  const complianceCritical = ['certificate_expiry', 'license_expiry', 'visa_expiry', 'work_permit_expiry'];
  const managerInvolved = ['probation_end', 'contract_end'];

  if (complianceCritical.includes(eventCode)) {
    return { employee: true, manager: true, hr: true };
  } else if (managerInvolved.includes(eventCode)) {
    return { employee: true, manager: true, hr: false };
  }
  return { employee: true, manager: false, hr: false };
}

function getSuggestedPriority(eventCode: string): 'low' | 'medium' | 'high' | 'critical' {
  const critical = ['visa_expiry', 'work_permit_expiry'];
  const high = ['certificate_expiry', 'license_expiry', 'contract_end'];
  const medium = ['probation_end', 'membership_expiry', 'id_expiry'];

  if (critical.includes(eventCode)) return 'critical';
  if (high.includes(eventCode)) return 'high';
  if (medium.includes(eventCode)) return 'medium';
  return 'low';
}

function generateMessageTemplate(eventName: string, eventCode: string): string {
  const templates: Record<string, string> = {
    certificate_expiry: `Reminder: {employee_name}'s certification will expire on {event_date} ({days_until} days remaining). Please ensure renewal is completed to maintain compliance.`,
    license_expiry: `Important: {employee_name}'s professional license expires on {event_date}. Action required within {days_until} days to avoid service interruption.`,
    visa_expiry: `URGENT: {employee_name}'s visa expires on {event_date} ({days_until} days). Immediate action required to maintain work authorization.`,
    work_permit_expiry: `CRITICAL: Work permit for {employee_name} expires on {event_date}. {days_until} days to complete renewal process.`,
    probation_end: `Reminder: {employee_name}'s probation period ends on {event_date}. Please complete the performance review within {days_until} days.`,
    contract_end: `Notice: {employee_name}'s contract ends on {event_date} ({days_until} days). Review renewal or offboarding requirements.`,
    membership_expiry: `Reminder: {employee_name}'s professional membership expires on {event_date}. {days_until} days to renew.`,
  };

  return templates[eventCode] || `Reminder: ${eventName} for {employee_name} is scheduled for {event_date} ({days_until} days remaining).`;
}
