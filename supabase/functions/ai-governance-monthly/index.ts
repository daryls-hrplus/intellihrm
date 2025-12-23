import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Log job start
  const { data: jobRun, error: jobRunError } = await supabase
    .from('ai_scheduled_job_runs')
    .insert({
      job_name: 'Monthly Audit Check',
      job_type: 'monthly',
      status: 'running',
      triggered_by: req.headers.get('x-triggered-by') || 'scheduled'
    })
    .select()
    .single();

  if (jobRunError) {
    console.error('Error creating job run record:', jobRunError);
  }

  try {
    console.log('Starting monthly AI model registry audit check...');
    
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Get all companies
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name');

    if (companyError) {
      console.error('Error fetching companies:', companyError);
      throw companyError;
    }

    const results = [];

    for (const company of companies || []) {
      console.log(`Checking model audits for: ${company.name}`);

      // Get models with overdue or upcoming audits
      const { data: models, error: modelError } = await supabase
        .from('ai_model_registry')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true);

      if (modelError) {
        console.error(`Error fetching models for ${company.id}:`, modelError);
        continue;
      }

      const overdueAudits = [];
      const upcomingAudits = [];
      const nonCompliantModels = [];

      for (const model of models || []) {
        // Check for overdue audits
        if (model.next_audit_due) {
          const auditDue = new Date(model.next_audit_due);
          if (auditDue < today) {
            overdueAudits.push({
              model_id: model.id,
              display_name: model.display_name,
              days_overdue: Math.floor((today.getTime() - auditDue.getTime()) / (1000 * 60 * 60 * 24)),
              risk_classification: model.risk_classification
            });
          } else if (auditDue < thirtyDaysFromNow) {
            upcomingAudits.push({
              model_id: model.id,
              display_name: model.display_name,
              days_until_due: Math.floor((auditDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
              audit_due: model.next_audit_due
            });
          }
        }

        // Check compliance status
        if (model.compliance_status === 'non_compliant') {
          nonCompliantModels.push({
            model_id: model.id,
            display_name: model.display_name,
            provider: model.provider,
            risk_classification: model.risk_classification
          });
        }
      }

      // Create reminders for overdue audits
      for (const overdue of overdueAudits) {
        const priority = overdue.risk_classification === 'high' || overdue.risk_classification === 'critical' 
          ? 'critical' 
          : 'high';

        await supabase.from('employee_reminders').insert({
          company_id: company.id,
          reminder_type: 'ai_audit_overdue',
          title: `AI Model Audit Overdue: ${overdue.display_name}`,
          description: `Model "${overdue.display_name}" audit is ${overdue.days_overdue} days overdue. Risk level: ${overdue.risk_classification}. Immediate action required for ISO 42001 compliance.`,
          priority,
          due_date: today.toISOString(),
          status: 'pending',
          metadata: { model_id: overdue.model_id }
        });

        console.log(`Created overdue audit reminder for model: ${overdue.display_name}`);
      }

      // Create reminders for upcoming audits
      for (const upcoming of upcomingAudits) {
        await supabase.from('employee_reminders').insert({
          company_id: company.id,
          reminder_type: 'ai_audit_upcoming',
          title: `AI Model Audit Due Soon: ${upcoming.display_name}`,
          description: `Model "${upcoming.display_name}" audit is due in ${upcoming.days_until_due} days (${upcoming.audit_due}). Schedule audit to maintain ISO 42001 compliance.`,
          priority: upcoming.days_until_due < 14 ? 'high' : 'medium',
          due_date: upcoming.audit_due,
          status: 'pending',
          metadata: { model_id: upcoming.model_id }
        });

        console.log(`Created upcoming audit reminder for model: ${upcoming.display_name}`);
      }

      // Create compliance gap entries for non-compliant models
      for (const nonCompliant of nonCompliantModels) {
        // Check if compliance item already exists
        const { data: existingItem } = await supabase
          .from('hse_compliance_requirements')
          .select('id')
          .eq('company_id', company.id)
          .eq('requirement_code', `AI-MODEL-${nonCompliant.model_id.substring(0, 8)}`)
          .single();

        if (!existingItem) {
          await supabase.from('hse_compliance_requirements').insert({
            company_id: company.id,
            requirement_code: `AI-MODEL-${nonCompliant.model_id.substring(0, 8)}`,
            requirement_name: `AI Model Compliance: ${nonCompliant.display_name}`,
            description: `AI model "${nonCompliant.display_name}" from provider ${nonCompliant.provider} is marked as non-compliant. Review and remediate to meet ISO 42001 requirements.`,
            category: 'ai_governance',
            priority: nonCompliant.risk_classification === 'critical' ? 'critical' : 'high',
            status: 'non_compliant',
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks
          });

          console.log(`Created compliance requirement for non-compliant model: ${nonCompliant.display_name}`);
        }
      }

      // Store monthly audit summary
      const { error: insertError } = await supabase
        .from('ai_governance_metrics')
        .insert({
          company_id: company.id,
          metric_date: today.toISOString().split('T')[0],
          metric_type: 'monthly_audit_summary',
          total_interactions: models?.length || 0,
          high_risk_interactions: overdueAudits.length,
          compliance_rate: models?.length 
            ? ((models.length - nonCompliantModels.length) / models.length) * 100 
            : 100
        });

      if (insertError) {
        console.error(`Error inserting monthly summary for ${company.id}:`, insertError);
      }

      results.push({
        company_id: company.id,
        company_name: company.name,
        total_models: models?.length || 0,
        overdue_audits: overdueAudits.length,
        upcoming_audits: upcomingAudits.length,
        non_compliant_models: nonCompliantModels.length,
        reminders_created: overdueAudits.length + upcomingAudits.length
      });
    }

    console.log('Monthly AI model registry audit check completed');

    // Update job run record
    if (jobRun?.id) {
      await supabase
        .from('ai_scheduled_job_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          companies_processed: results.length,
          metrics_generated: { date: today.toISOString().split('T')[0], results_count: results.length }
        })
        .eq('id', jobRun.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        date: today.toISOString().split('T')[0],
        companies_checked: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in monthly audit check:', error);

    // Update job run record with failure
    if (jobRun?.id) {
      await supabase
        .from('ai_scheduled_job_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage
        })
        .eq('id', jobRun.id);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
