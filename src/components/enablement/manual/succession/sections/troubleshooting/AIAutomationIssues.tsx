import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Clock, AlertCircle, CheckCircle, Sparkles, Brain } from 'lucide-react';
import { LearningObjectives, InfoCallout, TipCallout } from '../../../components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const AI_ISSUES = [
  {
    id: 'AIA-001',
    symptom: 'AI Nine-Box suggestions not appearing',
    severity: 'High',
    cause: 'Insufficient data for AI calculation, or AI feature disabled. Minimum data thresholds not met.',
    resolution: [
      'Verify employee has required data sources (appraisal, 360, or assessment)',
      'Check AI features enabled in company settings',
      'Review minimum_confidence_threshold configuration',
      'Fallback to manual assessment if data insufficient'
    ],
    prevention: 'Configure realistic data requirements. Communicate AI prerequisites to users.',
    crossRef: 'See Section 7.8 for AI-Assisted Risk Prediction configuration.'
  },
  {
    id: 'AIA-002',
    symptom: 'Signal confidence score below threshold consistently',
    severity: 'Medium',
    cause: 'Data freshness issues, sparse signal sources, or confidence formula weights misconfigured.',
    resolution: [
      'Check talent_signal_snapshots.data_freshness_days',
      'Verify multiple signal sources contribute to calculation',
      'Review ai_explainability_records.confidence_factors',
      'Adjust threshold if systematically too strict'
    ],
    prevention: 'Set thresholds based on actual data availability. Monitor confidence distribution.',
    crossRef: 'See Section 9.5 for Talent Signal Processing.'
  },
  {
    id: 'AIA-003',
    symptom: 'Bias detection flagging false positives',
    severity: 'Medium',
    cause: 'Bias detection rules too sensitive, or legitimate pattern triggering demographic correlation.',
    resolution: [
      'Review ai_bias_incidents for flagged patterns',
      'Analyze if correlation reflects valid business difference',
      'Adjust bias_risk_adjustment multipliers if appropriate',
      'Document false positive patterns for model tuning'
    ],
    prevention: 'Calibrate bias thresholds with HR. Periodic review of bias detection accuracy.',
    crossRef: 'See Section 9.5 for bias detection configuration.'
  },
  {
    id: 'AIA-004',
    symptom: 'Integration automation rule not executing',
    severity: 'High',
    cause: 'Rule is_active = false, trigger conditions not matching, or execution error.',
    resolution: [
      'Verify appraisal_integration_rules.is_active = true',
      'Check trigger_event matches expected event type',
      'Review condition_expression for logic errors',
      'Check appraisal_integration_log for execution errors'
    ],
    prevention: 'Test automation rules with sample data before go-live. Monitor execution logs.',
    crossRef: 'See Section 9.2 for Integration Rules Engine.'
  },
  {
    id: 'AIA-005',
    symptom: 'Integration action timing out during execution',
    severity: 'High',
    cause: 'Target system unresponsive, or action payload too large. Network latency exceeding timeout.',
    resolution: [
      'Check target system availability',
      'Review payload size in integration log',
      'Increase timeout configuration if justified',
      'Retry failed actions after target system recovery'
    ],
    prevention: 'Configure appropriate timeouts per integration. Implement retry logic.',
    crossRef: 'See Section 9.12 for integration troubleshooting.'
  },
  {
    id: 'AIA-006',
    symptom: 'AI-generated narrative quality issues (vague, repetitive)',
    severity: 'Low',
    cause: 'Insufficient context data for narrative generation, or prompt template needs refinement.',
    resolution: [
      'Review source data provided to narrative generator',
      'Enhance prompt templates with more specific guidance',
      'Provide example narratives for few-shot learning',
      'Enable manager editing for narrative refinement'
    ],
    prevention: 'Include narrative quality in AI governance review. Collect feedback for improvement.',
    crossRef: 'See AI governance documentation for narrative generation.'
  },
  {
    id: 'AIA-007',
    symptom: 'Signal snapshot not refreshing on schedule',
    severity: 'Medium',
    cause: 'Snapshot refresh job failed or disabled. Job scheduler configuration issue.',
    resolution: [
      'Check snapshot refresh job status in scheduler',
      'Review job execution logs for errors',
      'Manually trigger refresh for affected employees',
      'Re-enable job if accidentally disabled'
    ],
    prevention: 'Monitor snapshot job health. Alert on consecutive failures.',
    crossRef: 'See Section 9.5 for signal snapshot refresh configuration.'
  },
  {
    id: 'AIA-008',
    symptom: 'Minimum data requirements preventing AI assessment',
    severity: 'Medium',
    cause: 'AI model requires specific data points not available for employee. Onboarding or data collection gaps.',
    resolution: [
      'Identify which data points are missing',
      'Collect missing data through appropriate process',
      'Use manual assessment for employees with data gaps',
      'Consider reducing minimum requirements if too strict'
    ],
    prevention: 'Document AI data requirements. Include in employee onboarding checklist.',
    crossRef: 'See Section 7.8 for AI data requirements.'
  },
  {
    id: 'AIA-009',
    symptom: 'AI prediction accuracy declining over time',
    severity: 'Medium',
    cause: 'Model drift as workforce patterns change, or training data becoming stale.',
    resolution: [
      'Review ai_governance_metrics.performance_drift_score',
      'Compare recent predictions to actual outcomes',
      'Consider model retraining with updated data',
      'Enable human review for high-drift predictions'
    ],
    prevention: 'Monitor drift metrics. Schedule periodic model evaluation.',
    crossRef: 'See Section 7.8 for model monitoring.'
  },
  {
    id: 'AIA-010',
    symptom: 'Human override not being captured in audit trail',
    severity: 'High',
    cause: 'Override action bypassing audit trigger, or ai_human_overrides table not configured.',
    resolution: [
      'Verify ai_human_overrides table exists and has insert trigger',
      'Check override action includes reason capture',
      'Review application code for audit bypass',
      'Manually log identifiable overrides'
    ],
    prevention: 'Include override audit in ISO 42001 compliance testing. Test override flow.',
    crossRef: 'See Section 3.7 for override workflow and reason capture.'
  },
];

const AI_DATA_REQUIREMENTS = [
  { feature: 'Nine-Box AI Suggestion', requirements: 'At least 1 performance source + 1 potential source with data <12 months old' },
  { feature: 'Flight Risk Prediction', requirements: 'Tenure >6 months, 2+ signal snapshots, engagement survey within 12 months' },
  { feature: 'Readiness Trajectory', requirements: '2+ readiness assessments for trend, 3+ for trajectory prediction' },
  { feature: 'Succession AI Ranking', requirements: 'Complete readiness assessment + Nine-Box placement for all candidates' },
];

export function AIAutomationIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-9" data-manual-anchor="sec-11-9" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~12 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">11.9 AI & Automation Issues</h3>
          <p className="text-muted-foreground mt-1">
            AI suggestions, signal processing, bias detection, automation rules, and ISO 42001 compliance troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Troubleshoot AI suggestion data requirements and thresholds',
          'Resolve signal confidence and bias detection false positives',
          'Fix integration automation rule execution failures',
          'Diagnose AI model drift and performance degradation',
          'Ensure human override audit trail compliance'
        ]}
      />

      {/* AI Data Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-orange-600" />
            AI Feature Data Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AI_DATA_REQUIREMENTS.map((item) => (
              <div key={item.feature} className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  {item.feature}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{item.requirements}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-orange-600" />
            Detailed Issue Resolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {AI_ISSUES.map((issue) => (
              <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-4 w-4 flex-shrink-0 ${issue.severity === 'High' ? 'text-destructive' : issue.severity === 'Medium' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <Badge variant="outline" className="font-mono">{issue.id}</Badge>
                    <span className="text-sm font-medium">{issue.symptom}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pl-6">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Root Cause</span>
                      <p className="text-sm mt-1">{issue.cause}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resolution Steps</span>
                      <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                        {issue.resolution.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Prevention</span>
                        <p className="text-sm mt-1">{issue.prevention}</p>
                      </div>
                    </div>
                    {issue.crossRef && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        📖 {issue.crossRef}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <TipCallout title="Human-in-the-Loop">
        All AI predictions in succession planning require human review before action. This is an ISO 42001 
        compliance requirement. Configure human_review_required = true for high-stakes AI decisions.
      </TipCallout>

      <InfoCallout title="Model Monitoring">
        Monitor ai_governance_metrics.performance_drift_score weekly. Values above 0.15 indicate significant 
        model drift requiring attention. Values above 0.25 require immediate human review of AI predictions.
      </InfoCallout>
    </div>
  );
}
