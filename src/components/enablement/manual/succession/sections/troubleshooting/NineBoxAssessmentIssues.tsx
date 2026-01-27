import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Clock, AlertCircle, CheckCircle, Calculator } from 'lucide-react';
import { LearningObjectives, InfoCallout, WarningCallout } from '../../../components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const NINEBOX_ISSUES = [
  {
    id: 'NBX-001',
    symptom: 'AI suggestion shows "No data" for performance axis',
    severity: 'High',
    cause: 'No valid performance data exists for the employee. The Nine-Box requires at least one completed appraisal cycle with ratings.',
    resolution: [
      'Verify employee has completed appraisal in current or recent cycle',
      'Check appraisal_participants.overall_rating is populated',
      'Ensure rating source nine_box_rating_sources includes appraisal source',
      'Manually enter rating if historical data unavailable'
    ],
    prevention: 'Configure Nine-Box only after Performance module has cycle data. Use data availability report before Nine-Box launch.',
    crossRef: 'See Section 3.5 for Performance Axis Configuration details.'
  },
  {
    id: 'NBX-002',
    symptom: 'AI suggestion shows "No data" for potential axis',
    severity: 'High',
    cause: 'No valid potential assessment data exists. The potential axis requires 360 feedback, leadership signals, or manual assessment.',
    resolution: [
      'Verify employee has 360 feedback or assessment data',
      'Check talent_signal_snapshots for potential-contributing signals',
      'Ensure nine_box_signal_mappings has contributes_to=potential entries',
      'Consider manual potential rating entry as fallback'
    ],
    prevention: 'Ensure 360 or talent assessment cycles precede Nine-Box assessment. Map at least 2 signal sources to potential axis.',
    crossRef: 'See Section 3.6 for Potential Axis Configuration details.'
  },
  {
    id: 'NBX-003',
    symptom: 'Historical assessments not visible in Nine-Box trend view',
    severity: 'Medium',
    cause: 'is_current flag lifecycle not properly maintained. Historical records may have been purged or lack assessment_period values.',
    resolution: [
      'Query nine_box_assessments for employee_id to verify history exists',
      'Check is_current=false records have valid assessment_date',
      'Verify trend view filter includes historical date range',
      'Contact support if records appear deleted'
    ],
    prevention: 'Configure data retention policy to preserve 3-5 years of assessment history. Never delete assessments; use is_current flag.',
    crossRef: 'See Section 3.7 for Assessment Workflow and is_current lifecycle.'
  },
  {
    id: 'NBX-004',
    symptom: 'Evidence sources not capturing in nine_box_evidence_sources',
    severity: 'Medium',
    cause: 'Evidence capture trigger not firing or source_type not configured. SOC 2 compliance requires evidence trail.',
    resolution: [
      'Verify trigger on nine_box_assessments INSERT/UPDATE exists',
      'Check talent_signal_snapshots have snapshot data',
      'Manually create evidence record with source_summary JSONB',
      'Review trigger error logs for failures'
    ],
    prevention: 'Test evidence capture with sample assessment before go-live. Include evidence audit in post-assessment validation.',
    crossRef: 'See Section 3.8 for Evidence & Audit Trail configuration.'
  },
  {
    id: 'NBX-005',
    symptom: 'Box label showing "Undefined" for Nine-Box quadrant',
    severity: 'Low',
    cause: 'nine_box_indicator_configs missing entry for specific performance_rating + potential_rating combination.',
    resolution: [
      'Navigate to Nine-Box Configuration',
      'Identify missing box combination (e.g., performance=2, potential=3)',
      'Create box label entry with display_name, color, and suggested_actions',
      'Refresh UI to load updated labels'
    ],
    prevention: 'Run "Initialize Defaults" to seed all 9 box configurations. Verify all 9 labels exist before go-live.',
    crossRef: 'See Section 3.4 for Box Labels & Descriptions configuration.'
  },
  {
    id: 'NBX-006',
    symptom: 'Signal mapping contribution weight not applying to axis calculation',
    severity: 'High',
    cause: 'Signal contribution_weight is null or contributes_to axis is misassigned. Weight normalization may be failing.',
    resolution: [
      'Check nine_box_signal_mappings.contribution_weight is set (default 1.0)',
      'Verify contributes_to matches intended axis (performance/potential)',
      'Ensure signal_code exists in talent_signal_definitions',
      'Test recalculation with useNineBoxAIAssessment hook'
    ],
    prevention: 'Document signal-to-axis mapping in configuration spreadsheet. Test with sample employee before go-live.',
    crossRef: 'See Section 3.3 for Signal Mappings configuration.'
  },
  {
    id: 'NBX-007',
    symptom: 'Performance axis showing 0 despite appraisal data existing',
    severity: 'High',
    cause: 'Rating source weight is 0 or source not enabled. Axis calculation formula requires non-zero weights.',
    resolution: [
      'Navigate to Nine-Box Setup > Rating Sources',
      'Verify source_weight > 0 for performance sources',
      'Check is_enabled = true for all intended sources',
      'Ensure source_type matches appraisal configuration'
    ],
    prevention: 'Use recommended weight template: Appraisal 50%, Goals 30%, Competency 20%. Test formula with known values.',
    crossRef: 'See Section 3.2 for Rating Sources Configuration.'
  },
  {
    id: 'NBX-008',
    symptom: 'Potential axis not updating after 360 feedback completion',
    severity: 'High',
    cause: '360 integration rule not triggering Nine-Box update. Event-driven sync may be disabled or erroring.',
    resolution: [
      'Check appraisal_integration_rules for 360 → Nine-Box rule',
      'Verify trigger_event = 360_COMPLETED and is_active = true',
      'Check appraisal_integration_log for execution errors',
      'Manually trigger Nine-Box recalculation if needed'
    ],
    prevention: 'Test integration rule with sample 360 before go-live. Monitor integration logs during initial cycles.',
    crossRef: 'See Section 9.4 for 360 Feedback Integration.'
  },
  {
    id: 'NBX-009',
    symptom: 'AI-suggested rating differs significantly from manual override',
    severity: 'Low',
    cause: 'Normal behavior when human judgment differs from algorithm. Override captures reason for audit compliance.',
    resolution: [
      'This is expected behavior - AI suggestions are guidance only',
      'Ensure override_reason is documented when saving',
      'Review deviation patterns quarterly for calibration',
      'Consult manager if pattern suggests data quality issue'
    ],
    prevention: 'Train managers on AI suggestion vs. human judgment roles. Document acceptable deviation ranges in governance.',
    crossRef: 'See Section 3.7 for override workflow and reason capture.'
  },
  {
    id: 'NBX-010',
    symptom: 'Bias risk indicator showing warning but unclear why',
    severity: 'Medium',
    cause: 'Signal mappings have high bias_risk_adjustment values or signal confidence is below threshold.',
    resolution: [
      'Review nine_box_signal_mappings.bias_risk_adjustment values',
      'Check minimum_confidence_threshold for flagged signals',
      'Identify which signals are triggering bias risk',
      'Consider recalibrating bias weights with HR'
    ],
    prevention: 'Set bias thresholds during initial configuration based on organizational tolerance. Review quarterly.',
    crossRef: 'See Section 3.3 for bias risk adjustment configuration.'
  },
];

const DIAGNOSTIC_CHECKLIST = [
  { check: 'At least one rating source is configured per axis', critical: true },
  { check: 'Source weights sum to 100% per axis', critical: true },
  { check: 'All 9 box label configurations exist', critical: false },
  { check: 'Signal mappings have contributes_to assigned', critical: true },
  { check: 'Source modules have data for target employees', critical: true },
  { check: 'Evidence capture trigger is active', critical: false },
  { check: 'Integration rules for 360/Performance exist', critical: false },
];

export function NineBoxAssessmentIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-3" data-manual-anchor="sec-11-3" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~15 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">11.3 Nine-Box & Talent Assessment Issues</h3>
          <p className="text-muted-foreground mt-1">
            Calculation errors, placement issues, signal mapping problems, evidence capture, and AI suggestion troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose "No data" errors on Nine-Box axes',
          'Troubleshoot signal mapping contribution failures',
          'Resolve evidence capture and audit trail issues',
          'Understand AI suggestion vs. override workflow',
          'Apply the Nine-Box diagnostic checklist systematically'
        ]}
      />

      {/* Diagnostic Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-orange-600" />
            Nine-Box Diagnostic Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DIAGNOSTIC_CHECKLIST.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg ${item.critical ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-muted/30'}`}>
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-xs">{idx + 1}</span>
                </div>
                <span className="text-sm flex-1">{item.check}</span>
                {item.critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-orange-600" />
            Detailed Issue Resolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {NINEBOX_ISSUES.map((issue) => (
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

      <WarningCallout title="Data Dependency">
        Nine-Box calculations require upstream module data. Before troubleshooting calculation issues, 
        verify that Performance Appraisals, 360 Feedback, or Talent Assessments have completed cycles 
        with valid ratings for target employees.
      </WarningCallout>

      <InfoCallout title="Cross-Reference">
        For inline troubleshooting within the Nine-Box workflow, see Chapter 3 sections 3.7 (Assessment Workflow) 
        and 3.8 (Evidence & Audit Trail). This section consolidates quick-reference resolution paths.
      </InfoCallout>
    </div>
  );
}
