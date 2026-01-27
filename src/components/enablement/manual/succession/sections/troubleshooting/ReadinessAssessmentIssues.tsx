import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Clock, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { LearningObjectives, InfoCallout, TipCallout } from '../../../components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const READINESS_ISSUES = [
  {
    id: 'RDY-001',
    symptom: 'Readiness form not loading for candidate',
    severity: 'High',
    cause: 'No form assigned to candidate\'s staff type, or form is inactive. The form selection algorithm requires staff_type match.',
    resolution: [
      'Identify candidate\'s staff type from position/job assignment',
      'Navigate to Succession Setup > Readiness Forms',
      'Verify form exists with matching staff_type',
      'Set is_active = true and save'
    ],
    prevention: 'Create forms for all staff types before enabling assessments. Use form coverage report from Section 2.5.',
    crossRef: 'See Section 2.5a for Staff Type Form Selection algorithm.'
  },
  {
    id: 'RDY-002',
    symptom: 'Overall readiness score calculation mismatch',
    severity: 'High',
    cause: 'Indicator weights not normalizing correctly, or skipped indicators affecting calculation. Multi-assessor weighting may be misconfigured.',
    resolution: [
      'Verify indicator weights in readiness_assessment_forms sum per category',
      'Check assessor type weights sum to 100%',
      'Review skipped indicators are excluded from normalization',
      'Recalculate using calculateOverallScore formula'
    ],
    prevention: 'Document weight structure in configuration guide. Test with sample assessment before go-live.',
    crossRef: 'See Section 4.6 for Score Calculation formula.'
  },
  {
    id: 'RDY-003',
    symptom: 'Multi-assessor variance flag showing unexpectedly',
    severity: 'Medium',
    cause: 'Assessor responses differ by more than configured variance threshold. This triggers calibration recommendation.',
    resolution: [
      'This is expected behavior for divergent assessments',
      'Review individual assessor responses for patterns',
      'Facilitate calibration discussion between assessors',
      'Document resolution in assessment notes'
    ],
    prevention: 'Train assessors on indicator BARS before assessment cycle. Set realistic variance thresholds.',
    crossRef: 'See Section 2.2a for Multi-Assessor Score Aggregation.'
  },
  {
    id: 'RDY-004',
    symptom: 'Completion workflow not triggering after submission',
    severity: 'High',
    cause: 'SUCCESSION_READINESS_APPROVAL workflow template not configured, or transaction type missing from company settings.',
    resolution: [
      'Navigate to HR Hub > Workflow Settings',
      'Add SUCCESSION_READINESS_APPROVAL transaction type',
      'Configure approval chain (Manager → HR → Executive)',
      'Test with sample completion event'
    ],
    prevention: 'Include workflow configuration in implementation checklist. Verify before launching assessments.',
    crossRef: 'See Section 6.10 for Workflow & Approval Configuration.'
  },
  {
    id: 'RDY-005',
    symptom: 'Readiness band not updating on succession_candidates after assessment',
    severity: 'High',
    cause: 'Sync trigger between readiness_assessment_responses and succession_candidates not firing. Integration may be disabled.',
    resolution: [
      'Verify integration rule for READINESS_COMPLETED exists',
      'Check appraisal_integration_log for errors',
      'Manually update succession_candidates.latest_readiness_band',
      'Enable integration rule if disabled'
    ],
    prevention: 'Test integration rule with sample assessment. Monitor integration logs during initial cycles.',
    crossRef: 'See Section 4.7 for Completion & Candidate Update workflow.'
  },
  {
    id: 'RDY-006',
    symptom: 'Historical assessments not showing in candidate timeline',
    severity: 'Medium',
    cause: 'Previous assessment events have status=cancelled or were deleted. Historical view requires completed events.',
    resolution: [
      'Query readiness_assessment_events for candidate_id',
      'Verify status = completed for historical records',
      'Check data retention policy hasn\'t purged records',
      'Restore from backup if accidentally deleted'
    ],
    prevention: 'Never delete assessment records; use status lifecycle. Configure 5-year retention minimum.',
    crossRef: 'See Section 4.8 for assessment completion and historical retention.'
  },
  {
    id: 'RDY-007',
    symptom: 'Skip indicator not recalculating category weight',
    severity: 'Medium',
    cause: 'Skipped indicator\'s weight not excluded from category total. Weight normalization logic may have bug.',
    resolution: [
      'Verify indicator has skip_allowed = true in form configuration',
      'Check response marked as skipped vs. null rating',
      'Recalculate category score excluding skipped indicator weight',
      'Report persistent issues to support'
    ],
    prevention: 'Use relative weights for automatic normalization. Test skip scenarios before go-live.',
    crossRef: 'See Section 2.4a for Weight Normalization Rules.'
  },
  {
    id: 'RDY-008',
    symptom: 'Assessor cannot access candidate for assessment',
    severity: 'High',
    cause: 'Assessor lacks manager relationship or HR role for candidate\'s company. RLS policy blocking access.',
    resolution: [
      'Verify assessor has appropriate role (Manager, HR, Executive)',
      'Check profiles.manager_id chain for direct reports',
      'Confirm assessor has company access for candidate\'s entity',
      'Add explicit assessment assignment if ad-hoc'
    ],
    prevention: 'Run access validation report before assessment cycle. Document ad-hoc assessor assignment process.',
    crossRef: 'See Section 11.8 for Security & Permission Issues.'
  },
  {
    id: 'RDY-009',
    symptom: 'Assessment event shows "No indicators" when loading form',
    severity: 'High',
    cause: 'Form has no indicators assigned, or indicator records are inactive. Form builder may have empty configuration.',
    resolution: [
      'Navigate to form builder for assigned form',
      'Add indicators from readiness_assessment_indicators',
      'Organize into categories with appropriate weights',
      'Activate form and retry assessment'
    ],
    prevention: 'Clone from template form rather than creating empty. Validate form completeness before assignment.',
    crossRef: 'See Section 2.4 for Readiness Indicators & BARS configuration.'
  },
  {
    id: 'RDY-010',
    symptom: 'BARS anchor descriptions not displaying for indicator',
    severity: 'Low',
    cause: 'rating_anchors JSONB field is null or malformed on indicator record. BARS requires 5-point scale anchors.',
    resolution: [
      'Edit indicator in Succession Setup > Indicators',
      'Add rating_anchors with 1-5 scale descriptions',
      'Use BARS template from Section 2.4 as reference',
      'Save and verify in assessment form'
    ],
    prevention: 'Include BARS anchors during initial indicator creation. Use indicator import template with anchors.',
    crossRef: 'See Section 2.4 for BARS behavioral anchors methodology.'
  },
];

const SCORE_CALCULATION = `
Overall Score = Σ (Assessor Weight × Σ (Category Weight × Σ (Indicator Weight × Rating)))

Where:
• Assessor weights from succession_assessor_types.weight_percentage
• Category weights from form configuration
• Indicator weights normalized within category (excluding skipped)
• Ratings on 1-5 scale converted to 0-100
`;

export function ReadinessAssessmentIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-4" data-manual-anchor="sec-11-4" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~12 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, HR Partner</span>
          </div>
          <h3 className="text-xl font-semibold">11.4 Readiness Assessment Issues</h3>
          <p className="text-muted-foreground mt-1">
            Form errors, scoring problems, multi-assessor conflicts, workflow triggers, and candidate sync issues
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Troubleshoot form loading and indicator display issues',
          'Diagnose score calculation mismatches and weight normalization',
          'Resolve multi-assessor variance and calibration triggers',
          'Fix workflow and candidate sync integration failures',
          'Understand the readiness score calculation formula'
        ]}
      />

      {/* Score Calculation Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            Score Calculation Formula Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre">
            {SCORE_CALCULATION}
          </pre>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-orange-600" />
            Detailed Issue Resolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {READINESS_ISSUES.map((issue) => (
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

      <TipCallout title="Multi-Assessor Best Practice">
        When variance flags appear, treat them as calibration opportunities rather than errors. 
        Schedule a 15-minute sync between assessors to discuss divergent ratings and document the resolution.
      </TipCallout>

      <InfoCallout title="Cross-Reference">
        For inline troubleshooting within the readiness workflow, see Chapter 4 sections 4.6 (Score Calculation) 
        and 4.8 (Completion & Candidate Update). This section consolidates quick-reference resolution paths.
      </InfoCallout>
    </div>
  );
}
