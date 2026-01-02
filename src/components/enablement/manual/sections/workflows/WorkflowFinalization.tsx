import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Clock, CheckCircle, Settings, Archive, Zap, FileCheck, AlertTriangle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, NoteCallout, SuccessCallout } from '../../components/Callout';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const FINALIZATION_STEPS = [
  {
    title: 'Review Cycle Completion Status',
    description: 'Verify all evaluations are complete before closing.',
    substeps: [
      'Navigate to HR Admin → Appraisal Cycles',
      'Select the cycle to finalize',
      'Review the completion dashboard',
      'Identify any pending evaluations'
    ],
    expectedResult: 'Clear view of cycle completion status'
  },
  {
    title: 'Handle Pending Evaluations',
    description: 'Resolve any incomplete evaluations.',
    substeps: [
      'Review list of pending evaluations',
      'Send final reminders to managers',
      'Decide on force-close vs. extension',
      'Document exceptions and approvals'
    ],
    expectedResult: 'All evaluations completed or handled with documented exceptions'
  },
  {
    title: 'Run Calibration (if applicable)',
    description: 'Ensure rating consistency across teams.',
    substeps: [
      'Access calibration dashboard',
      'Review rating distribution by department',
      'Identify and discuss outliers',
      'Apply approved calibration adjustments'
    ],
    expectedResult: 'Ratings calibrated and adjustments documented'
  },
  {
    title: 'Finalize Scores',
    description: 'Lock in final ratings and scores.',
    substeps: [
      'Review final score calculations',
      'Verify weighted averages are correct',
      'Confirm overall rating assignments',
      'Click "Finalize Scores"'
    ],
    expectedResult: 'All scores finalized and locked'
  },
  {
    title: 'Trigger Downstream Actions',
    description: 'Activate outcome-based workflows.',
    substeps: [
      'Review configured action rules',
      'Verify action triggers are ready',
      'Enable downstream integrations',
      'Monitor initial action execution'
    ],
    expectedResult: 'PIP, IDP, succession, and compensation triggers activated'
  },
  {
    title: 'Close the Cycle',
    description: 'Archive the cycle and complete the process.',
    substeps: [
      'Click "Close Cycle"',
      'Confirm closure in dialog',
      'Verify cycle status changes to "Closed"',
      'Document any final notes'
    ],
    expectedResult: 'Cycle archived with read-only access preserved'
  }
];

const FIELDS = [
  { name: 'cycle_status', required: true, type: 'Enum', description: 'Final lifecycle stage', validation: 'Completed → Closed' },
  { name: 'closed_at', required: true, type: 'Timestamp', description: 'When cycle was closed' },
  { name: 'closed_by', required: true, type: 'UUID', description: 'HR admin who closed cycle' },
  { name: 'final_completion_rate', required: true, type: 'Decimal', description: 'Percentage of evaluations completed', validation: '0-100%' },
  { name: 'forced_closures', required: false, type: 'Integer', description: 'Number of evaluations force-closed' },
  { name: 'calibration_applied', required: false, type: 'Boolean', description: 'Whether calibration was run' },
  { name: 'actions_triggered', required: false, type: 'JSON', description: 'List of downstream actions activated' },
  { name: 'retention_until', required: false, type: 'Date', description: 'Data retention deadline' }
];

const BUSINESS_RULES = [
  { rule: 'Cycle cannot close with pending manager evaluations', enforcement: 'System' as const, description: 'All evaluations must be submitted or force-closed before cycle closure.' },
  { rule: 'Calibration optional but recommended for large cycles', enforcement: 'Advisory' as const, description: 'Rating calibration ensures consistency across managers and departments.' },
  { rule: 'Closed cycles are read-only', enforcement: 'System' as const, description: 'No modifications allowed after closure without HR Director unlock.' },
  { rule: 'Downstream actions require explicit activation', enforcement: 'Policy' as const, description: 'PIP and succession triggers must be reviewed before automatic execution.' },
  { rule: 'Retention policy applies to closed cycles', enforcement: 'Policy' as const, description: 'Data retained per company policy (typically 7 years for compliance).' }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot close cycle - pending evaluations exist', cause: 'Managers have not submitted all evaluations.', solution: 'Use bulk reminder feature. If deadline passed, use force-close option with HR Director approval.' },
  { issue: 'Calibration shows unexpected distribution', cause: 'Natural variation or calibration data not yet loaded.', solution: 'Review by department and manager. Ensure all scores are finalized before calibration analysis.' },
  { issue: 'Downstream actions not triggering', cause: 'Action rules may be misconfigured or in draft status.', solution: 'Review action rules in cycle settings. Ensure rules are published and thresholds are correct.' },
  { issue: 'Need to reopen closed cycle', cause: 'Error discovered after closure or appeal requires adjustment.', solution: 'Request HR Director approval for unlock. All changes after unlock are logged.' }
];

export function WorkflowFinalization() {
  return (
    <Card id="sec-3-10">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.10</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Settings className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Finalization & Close-out</CardTitle>
        <CardDescription>Cycle close-out procedures, score finalization, and downstream action triggers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-10']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Close appraisal cycles properly with complete documentation</li>
            <li>Handle pending evaluations and exceptions</li>
            <li>Activate downstream integrations (PIP, IDP, Succession)</li>
            <li>Understand data retention and archival policies</li>
          </ul>
        </div>

        {/* Close-out Checklist */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-green-600" />
            Close-out Checklist
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { item: 'All manager evaluations submitted', status: 'Required' },
              { item: 'Employee responses collected (or deadline passed)', status: 'Required' },
              { item: 'Calibration review completed', status: 'Recommended' },
              { item: 'Exception documentation complete', status: 'If applicable' },
              { item: 'Downstream action rules reviewed', status: 'Recommended' },
              { item: 'Stakeholder notification sent', status: 'Optional' }
            ].map((item) => (
              <div key={item.item} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="flex-1 text-sm">{item.item}</span>
                <Badge variant="outline" className="text-xs">{item.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <StepByStep steps={FINALIZATION_STEPS} title="Finalization Process" />

        {/* Downstream Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Downstream Action Triggers
          </h3>
          <div className="space-y-3">
            {[
              { action: 'Performance Improvement Plan (PIP)', trigger: 'Overall rating ≤ 2.0', target: 'Underperforming employees', module: 'Talent Management' },
              { action: 'Individual Development Plan (IDP)', trigger: 'Any competency below expected', target: 'Employees with development needs', module: 'Learning & Development' },
              { action: 'Succession Nomination', trigger: 'Overall rating ≥ 4.5', target: 'High performers for pipeline', module: 'Succession Planning' },
              { action: 'Compensation Review Flag', trigger: 'Rating + tenure criteria met', target: 'Candidates for salary review', module: 'Compensation' },
              { action: 'Recognition Notification', trigger: 'Rating = 5.0 (Exceptional)', target: 'Outstanding performers', module: 'HR Operations' }
            ].map((item) => (
              <div key={item.action} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{item.action}</h4>
                  <Badge variant="outline" className="text-xs">{item.module}</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span><strong>Trigger:</strong> {item.trigger}</span>
                  <span><strong>Target:</strong> {item.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SuccessCallout title="Cycle Complete">
          Once closed, all evaluation data is preserved for historical reporting, trend analysis, and compliance audits. Employees can access their evaluations through ESS.
        </SuccessCallout>

        {/* Archival and Retention */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Archive className="h-5 w-5 text-slate-600" />
            Data Retention & Archival
          </h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium">Active Retention</h4>
                <p className="text-muted-foreground">Full data available for reporting and analysis</p>
                <Badge variant="outline" className="mt-2">7 years (configurable)</Badge>
              </div>
              <div>
                <h4 className="font-medium">Archived State</h4>
                <p className="text-muted-foreground">Compressed storage, available on request</p>
                <Badge variant="outline" className="mt-2">Post-retention period</Badge>
              </div>
            </div>
            <div className="text-xs text-muted-foreground border-t pt-3">
              <strong>Compliance Note:</strong> Retention periods may vary by jurisdiction. Consult your legal team for specific requirements.
            </div>
          </div>
        </div>

        <TipCallout title="Post-Cycle Analysis">
          After closing, run the cycle analytics report to identify trends, calibration effectiveness, and areas for process improvement in the next cycle.
        </TipCallout>

        <WarningCallout title="Irreversible Action">
          Cycle closure is difficult to reverse. Verify all evaluations are complete and reviewed before closing. Reopening requires HR Director approval and creates audit entries.
        </WarningCallout>

        <NoteCallout title="Notification Best Practice">
          Send a company-wide notification when the cycle closes, thanking participants and outlining next steps (development planning, goal setting for next period).
        </NoteCallout>

        <FieldReferenceTable fields={FIELDS} title="Finalization Fields" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
