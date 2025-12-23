import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertPayload {
  alert_type: 'high_risk_no_review' | 'bias_incident' | 'audit_overdue' | 'unusual_pattern' | 'security_violation';
  company_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  entity_id?: string;
  entity_type?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { alert_type, trigger_data } = await req.json();
    
    console.log(`Processing AI governance alert: ${alert_type}`);

    const alerts: AlertPayload[] = [];

    switch (alert_type) {
      case 'check_pending_reviews': {
        // Check for high-risk responses without human review within SLA
        const slaHours = 24;
        const slaDeadline = new Date(Date.now() - slaHours * 60 * 60 * 1000);

        const { data: pendingReviews, error } = await supabase
          .from('ai_risk_assessments')
          .select('*, ai_interaction_logs(user_message)')
          .eq('human_review_required', true)
          .eq('human_review_completed', false)
          .gte('risk_score', 70)
          .lt('created_at', slaDeadline.toISOString());

        if (error) throw error;

        for (const review of pendingReviews || []) {
          alerts.push({
            alert_type: 'high_risk_no_review',
            company_id: review.company_id,
            severity: review.risk_score >= 90 ? 'critical' : 'high',
            title: 'High-Risk AI Response Awaiting Review',
            description: `A high-risk AI interaction (score: ${review.risk_score}) has exceeded the ${slaHours}h review SLA. Immediate human review required.`,
            entity_id: review.id,
            entity_type: 'ai_risk_assessment',
            metadata: {
              risk_score: review.risk_score,
              risk_category: review.risk_category,
              created_at: review.created_at
            }
          });
        }
        break;
      }

      case 'bias_incident_detected': {
        // Immediate notification for new bias incident
        const { incident } = trigger_data || {};
        if (incident) {
          alerts.push({
            alert_type: 'bias_incident',
            company_id: incident.company_id,
            severity: incident.severity === 'critical' ? 'critical' : 'high',
            title: 'AI Bias Incident Detected',
            description: `Bias type: ${incident.bias_type}. Detection method: ${incident.detection_method}. Affected characteristic: ${incident.affected_characteristic || 'Not specified'}. Immediate investigation recommended.`,
            entity_id: incident.id,
            entity_type: 'ai_bias_incident',
            metadata: incident
          });
        }
        break;
      }

      case 'check_overdue_audits': {
        // Check for models with overdue audits
        const { data: overdueModels, error } = await supabase
          .from('ai_model_registry')
          .select('*')
          .eq('is_active', true)
          .lt('next_audit_due', new Date().toISOString());

        if (error) throw error;

        for (const model of overdueModels || []) {
          const daysOverdue = Math.floor(
            (Date.now() - new Date(model.next_audit_due).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          alerts.push({
            alert_type: 'audit_overdue',
            company_id: model.company_id,
            severity: daysOverdue > 30 ? 'critical' : daysOverdue > 14 ? 'high' : 'medium',
            title: `AI Model Audit Overdue: ${model.display_name}`,
            description: `Model "${model.display_name}" audit is ${daysOverdue} days overdue. Risk classification: ${model.risk_classification}. ISO 42001 compliance at risk.`,
            entity_id: model.id,
            entity_type: 'ai_model_registry',
            metadata: {
              days_overdue: daysOverdue,
              risk_classification: model.risk_classification,
              provider: model.provider,
              last_audit_date: model.last_audit_date
            }
          });
        }
        break;
      }

      case 'check_unusual_patterns': {
        // Detect unusual usage patterns
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        // Check for spike in high-risk interactions
        const { data: recentHighRisk, error: riskError } = await supabase
          .from('ai_risk_assessments')
          .select('company_id, risk_score')
          .gte('risk_score', 70)
          .gte('created_at', hourAgo.toISOString());

        if (riskError) throw riskError;

        // Group by company
        const companyRiskCounts = new Map<string, number>();
        for (const risk of recentHighRisk || []) {
          const count = companyRiskCounts.get(risk.company_id) || 0;
          companyRiskCounts.set(risk.company_id, count + 1);
        }

        // Alert if any company has more than 10 high-risk in the last hour
        for (const [companyId, count] of companyRiskCounts) {
          if (count >= 10) {
            alerts.push({
              alert_type: 'unusual_pattern',
              company_id: companyId,
              severity: count >= 20 ? 'critical' : 'high',
              title: 'Unusual AI Risk Pattern Detected',
              description: `${count} high-risk AI interactions detected in the last hour. This is significantly above normal levels. Possible security concern or model issue.`,
              metadata: {
                high_risk_count_last_hour: count,
                threshold: 10
              }
            });
          }
        }

        // Check for spike in security violations
        const { data: recentViolations, error: violationError } = await supabase
          .from('ai_security_violations')
          .select('company_id, severity, violation_type')
          .gte('created_at', hourAgo.toISOString());

        if (violationError) throw violationError;

        const companyViolationCounts = new Map<string, number>();
        for (const violation of recentViolations || []) {
          const count = companyViolationCounts.get(violation.company_id) || 0;
          companyViolationCounts.set(violation.company_id, count + 1);
        }

        for (const [companyId, count] of companyViolationCounts) {
          if (count >= 5) {
            alerts.push({
              alert_type: 'security_violation',
              company_id: companyId,
              severity: 'critical',
              title: 'AI Security Violation Spike',
              description: `${count} AI security violations detected in the last hour. Possible attack or misuse. Immediate investigation required.`,
              metadata: {
                violation_count_last_hour: count,
                threshold: 5
              }
            });
          }
        }
        break;
      }

      default:
        console.log(`Unknown alert type: ${alert_type}`);
    }

    // Process and store alerts
    const processedAlerts = [];
    for (const alert of alerts) {
      console.log(`Creating alert: ${alert.title} (${alert.severity})`);

      // Create reminder for responsible parties
      const { data: reminder, error: reminderError } = await supabase
        .from('employee_reminders')
        .insert({
          company_id: alert.company_id,
          reminder_type: `ai_alert_${alert.alert_type}`,
          title: alert.title,
          description: alert.description,
          priority: alert.severity,
          due_date: new Date().toISOString(),
          status: 'pending',
          metadata: {
            alert_type: alert.alert_type,
            entity_id: alert.entity_id,
            entity_type: alert.entity_type,
            ...alert.metadata
          }
        })
        .select()
        .single();

      if (reminderError) {
        console.error('Error creating reminder:', reminderError);
        continue;
      }

      // For critical alerts, also create a security log entry
      if (alert.severity === 'critical') {
        await supabase.from('audit_logs').insert({
          entity_type: 'ai_governance_alert',
          entity_id: alert.entity_id || reminder.id,
          action: 'create',
          new_values: alert,
          metadata: {
            alert_type: alert.alert_type,
            severity: alert.severity,
            automated: true
          }
        });
      }

      processedAlerts.push({
        alert,
        reminder_id: reminder.id
      });
    }

    console.log(`Processed ${processedAlerts.length} alerts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts_processed: processedAlerts.length,
        alerts: processedAlerts 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in AI governance alerts:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
