import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuarterlyReport {
  period: string;
  executive_summary: {
    total_ai_interactions: number;
    compliance_score: number;
    risk_score_trend: string;
    key_achievements: string[];
    areas_of_concern: string[];
  };
  risk_management: {
    total_risk_assessments: number;
    high_risk_percentage: number;
    human_review_compliance: number;
    mitigation_effectiveness: number;
  };
  bias_governance: {
    total_incidents: number;
    resolution_rate: number;
    recurring_patterns: string[];
    remediation_actions_taken: number;
  };
  model_registry: {
    total_active_models: number;
    compliant_models: number;
    audits_completed: number;
    audits_overdue: number;
  };
  human_oversight: {
    total_reviews_required: number;
    reviews_completed: number;
    overrides_count: number;
    override_approval_rate: number;
  };
  recommendations: string[];
  compliance_status: 'fully_compliant' | 'partially_compliant' | 'non_compliant';
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

    console.log('Starting quarterly AI governance report generation...');
    
    const today = new Date();
    const quarterStart = new Date(today);
    quarterStart.setMonth(quarterStart.getMonth() - 3);
    
    const quarter = Math.floor((today.getMonth() + 3) / 3);
    const year = today.getFullYear();
    const periodLabel = `Q${quarter} ${year}`;

    // Get all companies
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name');

    if (companyError) {
      console.error('Error fetching companies:', companyError);
      throw companyError;
    }

    const reports = [];

    for (const company of companies || []) {
      console.log(`Generating quarterly report for: ${company.name}`);

      // Fetch all quarterly data
      const [
        riskData,
        biasData,
        modelData,
        overrideData,
        interactionData,
        metricsData
      ] = await Promise.all([
        supabase
          .from('ai_risk_assessments')
          .select('*')
          .eq('company_id', company.id)
          .gte('created_at', quarterStart.toISOString()),
        supabase
          .from('ai_bias_incidents')
          .select('*')
          .eq('company_id', company.id)
          .gte('created_at', quarterStart.toISOString()),
        supabase
          .from('ai_model_registry')
          .select('*')
          .eq('company_id', company.id)
          .eq('is_active', true),
        supabase
          .from('ai_human_overrides')
          .select('*')
          .eq('company_id', company.id)
          .gte('created_at', quarterStart.toISOString()),
        supabase
          .from('ai_interaction_logs')
          .select('id')
          .eq('company_id', company.id)
          .gte('created_at', quarterStart.toISOString()),
        supabase
          .from('ai_governance_metrics')
          .select('*')
          .eq('company_id', company.id)
          .eq('metric_type', 'daily')
          .gte('metric_date', quarterStart.toISOString().split('T')[0])
      ]);

      const risks = riskData.data || [];
      const biasIncidents = biasData.data || [];
      const models = modelData.data || [];
      const overrides = overrideData.data || [];
      const interactions = interactionData.data || [];
      const dailyMetrics = metricsData.data || [];

      // Calculate risk management metrics
      const highRiskCount = risks.filter(r => (r.risk_score || 0) >= 70).length;
      const reviewsRequired = risks.filter(r => r.human_review_required).length;
      const reviewsCompleted = risks.filter(r => r.human_review_completed).length;
      const mitigationsApplied = risks.filter(r => 
        r.mitigation_applied && (r.mitigation_applied as string[]).length > 0
      ).length;

      // Calculate bias governance metrics
      const resolvedBias = biasIncidents.filter(b => b.remediation_status === 'resolved').length;
      const biasPatterns = [...new Set(biasIncidents.map(b => b.bias_type))];
      const remediationActions = biasIncidents.filter(b => 
        b.remediation_actions && (b.remediation_actions as unknown[]).length > 0
      ).length;

      // Calculate model registry metrics
      const compliantModels = models.filter(m => m.compliance_status === 'compliant').length;
      const auditsCompleted = models.filter(m => {
        if (!m.last_audit_date) return false;
        return new Date(m.last_audit_date) >= quarterStart;
      }).length;
      const auditsOverdue = models.filter(m => {
        if (!m.next_audit_due) return false;
        return new Date(m.next_audit_due) < today;
      }).length;

      // Calculate human oversight metrics
      const approvedOverrides = overrides.filter(o => o.approval_status === 'approved').length;

      // Calculate risk score trend
      const avgRiskScores = dailyMetrics
        .filter(m => m.avg_risk_score !== null)
        .map(m => m.avg_risk_score as number);
      let riskTrend = 'stable';
      if (avgRiskScores.length >= 30) {
        const firstHalf = avgRiskScores.slice(0, Math.floor(avgRiskScores.length / 2));
        const secondHalf = avgRiskScores.slice(Math.floor(avgRiskScores.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (secondAvg > firstAvg * 1.1) riskTrend = 'increasing';
        else if (secondAvg < firstAvg * 0.9) riskTrend = 'decreasing';
      }

      // Calculate compliance score
      const riskCompliance = reviewsRequired > 0 ? (reviewsCompleted / reviewsRequired) : 1;
      const modelCompliance = models.length > 0 ? (compliantModels / models.length) : 1;
      const biasCompliance = biasIncidents.length > 0 ? (resolvedBias / biasIncidents.length) : 1;
      const auditCompliance = models.length > 0 ? ((models.length - auditsOverdue) / models.length) : 1;
      const complianceScore = Math.round(
        ((riskCompliance + modelCompliance + biasCompliance + auditCompliance) / 4) * 100
      );

      // Generate key achievements
      const achievements: string[] = [];
      if (reviewsCompleted > 0) achievements.push(`Completed ${reviewsCompleted} human reviews of high-risk AI interactions`);
      if (resolvedBias > 0) achievements.push(`Resolved ${resolvedBias} bias incidents`);
      if (auditsCompleted > 0) achievements.push(`Completed ${auditsCompleted} model audits`);
      if (mitigationsApplied > risks.length * 0.5 && risks.length > 0) {
        achievements.push('Applied risk mitigations to majority of flagged interactions');
      }

      // Generate areas of concern
      const concerns: string[] = [];
      if (auditsOverdue > 0) concerns.push(`${auditsOverdue} model audits are overdue`);
      if (highRiskCount > interactions.length * 0.1 && interactions.length > 0) {
        concerns.push('High proportion of interactions flagged as high-risk');
      }
      if (reviewsRequired > reviewsCompleted) {
        concerns.push(`${reviewsRequired - reviewsCompleted} pending human reviews`);
      }
      if (biasPatterns.length > 3) {
        concerns.push(`Multiple recurring bias patterns detected: ${biasPatterns.slice(0, 3).join(', ')}`);
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (auditsOverdue > 0) {
        recommendations.push('Prioritize completion of overdue model audits to maintain ISO 42001 compliance');
      }
      if (riskTrend === 'increasing') {
        recommendations.push('Review AI model configurations and guardrails to address increasing risk scores');
      }
      if (biasPatterns.length > 0) {
        recommendations.push(`Implement targeted bias mitigation for: ${biasPatterns.slice(0, 2).join(', ')}`);
      }
      if (reviewsCompleted < reviewsRequired * 0.9 && reviewsRequired > 0) {
        recommendations.push('Increase human review capacity to ensure timely oversight of high-risk interactions');
      }
      if (overrides.length > interactions.length * 0.05 && interactions.length > 0) {
        recommendations.push('High override rate suggests AI model retraining may be beneficial');
      }

      // Determine overall compliance status
      let complianceStatus: 'fully_compliant' | 'partially_compliant' | 'non_compliant' = 'fully_compliant';
      if (complianceScore < 70) complianceStatus = 'non_compliant';
      else if (complianceScore < 90) complianceStatus = 'partially_compliant';

      const report: QuarterlyReport = {
        period: periodLabel,
        executive_summary: {
          total_ai_interactions: interactions.length,
          compliance_score: complianceScore,
          risk_score_trend: riskTrend,
          key_achievements: achievements,
          areas_of_concern: concerns
        },
        risk_management: {
          total_risk_assessments: risks.length,
          high_risk_percentage: risks.length > 0 ? Math.round((highRiskCount / risks.length) * 100) : 0,
          human_review_compliance: Math.round(riskCompliance * 100),
          mitigation_effectiveness: risks.length > 0 ? Math.round((mitigationsApplied / risks.length) * 100) : 100
        },
        bias_governance: {
          total_incidents: biasIncidents.length,
          resolution_rate: Math.round(biasCompliance * 100),
          recurring_patterns: biasPatterns,
          remediation_actions_taken: remediationActions
        },
        model_registry: {
          total_active_models: models.length,
          compliant_models: compliantModels,
          audits_completed: auditsCompleted,
          audits_overdue: auditsOverdue
        },
        human_oversight: {
          total_reviews_required: reviewsRequired,
          reviews_completed: reviewsCompleted,
          overrides_count: overrides.length,
          override_approval_rate: overrides.length > 0 ? Math.round((approvedOverrides / overrides.length) * 100) : 100
        },
        recommendations,
        compliance_status: complianceStatus
      };

      // Store quarterly report
      const { error: insertError } = await supabase
        .from('ai_governance_metrics')
        .insert({
          company_id: company.id,
          metric_date: today.toISOString().split('T')[0],
          metric_type: 'quarterly_report',
          total_interactions: interactions.length,
          high_risk_interactions: highRiskCount,
          compliance_rate: complianceScore,
          human_reviews_required: reviewsRequired,
          human_reviews_completed: reviewsCompleted,
          bias_incidents_detected: biasIncidents.length,
          overrides_count: overrides.length
        });

      if (insertError) {
        console.error(`Error inserting quarterly report for ${company.id}:`, insertError);
      }

      // Store report document
      await supabase.from('company_documents').insert({
        company_id: company.id,
        document_type: 'ai_governance_report',
        title: `AI Governance Quarterly Report - ${periodLabel}`,
        description: `Comprehensive ISO 42001 compliance report for ${periodLabel}. Compliance Score: ${complianceScore}%`,
        content: JSON.stringify(report, null, 2),
        status: 'published',
        category: 'compliance',
        tags: ['ai-governance', 'iso-42001', 'quarterly-report', periodLabel.toLowerCase().replace(' ', '-')]
      });

      console.log(`Quarterly report generated for ${company.name}: Compliance Score ${complianceScore}%`);
      reports.push({ company_id: company.id, company_name: company.name, report });

      // Create reminder for report review
      await supabase.from('employee_reminders').insert({
        company_id: company.id,
        reminder_type: 'ai_quarterly_report',
        title: `AI Governance Quarterly Report Ready - ${periodLabel}`,
        description: `The ${periodLabel} AI governance report is now available. Compliance Score: ${complianceScore}%. Status: ${complianceStatus.replace('_', ' ')}`,
        priority: complianceStatus === 'non_compliant' ? 'critical' : 'medium',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Review within 1 week
        status: 'pending'
      });
    }

    console.log('Quarterly AI governance report generation completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        period: periodLabel,
        companies_reported: reports.length,
        reports 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in quarterly report generation:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
