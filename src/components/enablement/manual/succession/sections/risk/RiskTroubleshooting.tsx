import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { 
  HelpCircle, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function RiskTroubleshooting() {
  const objectives = [
    'Diagnose common risk management issues',
    'Resolve data quality and calculation problems',
    'Address governance compliance gaps',
    'Troubleshoot integration-related issues'
  ];

  const commonIssues: TroubleshootingItem[] = [
    {
      issue: 'Risk level not updating after reassessment',
      cause: 'New assessment created but is_current flag not set properly, or previous assessment not marked as historical.',
      solution: 'Verify the FlightRiskTab.tsx logic marks previous assessments with is_current = false before creating new ones. Check database for duplicate is_current = true records for the same employee.'
    },
    {
      issue: 'Employee not appearing in flight risk list',
      cause: 'Employee may be inactive, missing company_id, or no current assessment exists.',
      solution: 'Confirm employee is_active = true in profiles table, company_id matches filter, and at least one flight_risk_assessment with is_current = true exists.'
    },
    {
      issue: 'Retention actions not saving',
      cause: 'Text field may have validation issues or database connection problem.',
      solution: 'Check browser console for API errors. Verify retention_actions column accepts text type. Ensure user has write permission to flight_risk_assessments table.'
    },
    {
      issue: 'Risk factors array saving as empty',
      cause: 'UI toggles not properly updating form state, or JSONB array not serializing correctly.',
      solution: 'Debug the toggleFactor function in FlightRiskTab.tsx. Ensure risk_factors is sent as a proper JSONB array (not text[]) in the payload. Column type is jsonb with default \'[]\'::jsonb.'
    },
    {
      issue: 'Next review date not triggering reminders',
      cause: 'Reminder event type not configured, or notification system not processing risk_review_reminder events.',
      solution: 'Configure reminder_rules for risk_review_reminder event type. Verify notifications system is enabled and processing scheduled reminders.'
    },
    {
      issue: 'Key position not showing in vacancy risk dashboard',
      cause: 'Job not marked as is_key_position = true, or position not linked to the key job.',
      solution: 'Verify jobs.is_key_position = true for the relevant job. Ensure position has job_id reference to a key job. Check company filter alignment.'
    },
    {
      issue: 'Historical assessments not visible for trend analysis',
      cause: 'Query filtering to is_current = true only, hiding historical records.',
      solution: 'For trend analysis, modify query to include all assessments (remove is_current filter) and order by assessment_date.'
    },
    {
      issue: 'RetentionRiskMatrix showing wrong risk level',
      cause: 'Criticality or replacement_difficulty values not matching expected enum values.',
      solution: 'Verify position_criticality uses values: most_critical, critical, important. Verify replacement_difficulty uses: difficult, moderate, easy. Check getRiskLevel function in RetentionRiskMatrix.tsx.'
    },
    {
      issue: 'Assessment statistics showing incorrect counts',
      cause: 'Company filter not applied consistently, or is_current not filtered.',
      solution: 'Ensure all summary queries filter by company_id and is_current = true. Check for stale cache in React Query if using data caching.'
    },
    {
      issue: 'AI risk predictions not appearing',
      cause: 'Insufficient data in talent_signal_snapshots, or AI agent not configured.',
      solution: 'Verify talent signals exist for the employee with recent captured_at dates. Check AI agent status in ai_agents table. Ensure minimum confidence threshold is met (≥0.60).'
    },
    {
      issue: 'Assessed_by field not captured on new assessments',
      cause: 'User session not retrieved before payload construction.',
      solution: 'Verify FlightRiskTab.tsx includes assessed_by: user?.id in the insert/update payload. Ensure supabase.auth.getUser() is called and resolves before submission.'
    },
    {
      issue: 'Analytics "Impact Level Distribution" chart empty',
      cause: 'Prior bug referenced non-existent impact_level field on flight_risk_assessments table.',
      solution: 'This bug was fixed. Impact of Loss is derived from succession_plans.position_criticality, not flight_risk_assessments. Update to latest version of SuccessionAnalytics.tsx.'
    },
  ];

  const faqs = [
    {
      question: 'How often should flight risk assessments be updated?',
      answer: 'Critical: bi-weekly, High: monthly, Medium: quarterly, Low: semi-annually. Always update when significant changes occur (performance review, compensation change, manager change).'
    },
    {
      question: 'Can I delete a flight risk assessment?',
      answer: 'No. Historical assessments should be retained for audit trail and trend analysis. Mark assessments as is_current = false instead of deleting.'
    },
    {
      question: 'Who can see flight risk assessments?',
      answer: 'Access is controlled by RLS policies. Typically HR Partners, HR Directors, and direct managers can view assessments for their company/team scope.'
    },
    {
      question: 'How does flight risk relate to key position risk?',
      answer: 'Flight risk is employee-level (flight_risk_assessments). Key position risk is position-level (key_position_risks) with a flight_risk boolean flag. When a key position incumbent has high flight risk, mark flight_risk = true on the position risk record.'
    },
    {
      question: 'What happens when an employee leaves despite retention efforts?',
      answer: 'Conduct post-departure analysis. Update the assessment notes with departure outcome. Use the data to improve future detection and intervention strategies.'
    },
    {
      question: 'Can I bulk-import flight risk assessments?',
      answer: 'Not through the standard UI. For bulk operations, use direct database insert with proper is_current lifecycle management. Ensure only one is_current = true per employee.'
    },
  ];

  return (
    <section id="sec-7-10" data-manual-anchor="sec-7-10" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.10 Risk Management Troubleshooting</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Common issues, resolutions, and frequently asked questions
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* Common Issues */}
      <TroubleshootingSection 
        items={commonIssues}
        title="Common Issues & Solutions"
      />

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h5 className="font-medium text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                {faq.question}
              </h5>
              <p className="text-sm text-muted-foreground mt-2 pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Quality Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            Data Quality Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use this checklist to validate risk management data quality:
          </p>

          <div className="space-y-2">
            {[
              { check: 'Each employee has at most one is_current = true assessment', category: 'Integrity' },
              { check: 'All assessments have valid company_id and employee_id', category: 'Referential' },
              { check: 'Risk level values are valid enum (low, medium, high, critical)', category: 'Validation' },
              { check: 'Assessment_date is not in the future', category: 'Temporal' },
              { check: 'High/Critical assessments have retention_actions documented', category: 'Completeness' },
              { check: 'Next_review_date is set for High/Critical cases', category: 'Governance' },
              { check: 'Historical assessments are preserved (not deleted)', category: 'Audit' },
              { check: 'Key position risks align with jobs.is_key_position', category: 'Consistency' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border rounded">
                <input type="checkbox" className="h-4 w-4" />
                <span className="text-sm flex-1">{item.check}</span>
                <Badge variant="outline" className="text-xs">{item.category}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support Resources */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800 dark:text-blue-300">
            <HelpCircle className="h-5 w-5" />
            Support Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { resource: 'Chapter 6.3', desc: 'Position Risk Assessment configuration', link: '#sec-6-3' },
              { resource: 'Chapter 10.4', desc: 'Flight Risk & Retention Analytics', link: '#sec-10-4' },
              { resource: 'Chapter 3.3', desc: 'Signal Mappings for AI integration', link: '#sec-3-3' },
              { resource: 'RetentionRiskMatrix.tsx', desc: 'Risk matrix calculation logic', link: 'src/components/succession/' },
            ].map((item) => (
              <div key={item.resource} className="p-3 border rounded-lg bg-background">
                <h5 className="font-medium text-sm">{item.resource}</h5>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
