// Section 4.5: HR Assessment Workflow
// HR Partner review process, independent vs. validation modes

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  IndustryCallout,
  FeatureCardGrid,
  PrimaryFeatureCard,
  SuccessFeatureCard,
  InfoFeatureCard,
  StepByStep,
} from '../../../components';
import { Step } from '../../../components/StepByStep';
import { 
  Shield, 
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Scale
} from 'lucide-react';

const hrSteps: Step[] = [
  {
    title: 'Receive Assessment Task',
    description: 'HR Partner receives task after Manager submits (if sequential), or simultaneously (if parallel).',
    substeps: [
      'Task appears in HR Hub → My Tasks',
      'Task shows candidate name, manager who assessed, and due date',
      'If sequential workflow, task appears only after Manager submission'
    ],
    expectedResult: 'Task visible with full context including Manager status.'
  },
  {
    title: 'Review Manager Responses (Optional)',
    description: 'In validation mode, HR can view Manager ratings before providing their own.',
    substeps: [
      'Click "View Manager Assessment" link in task',
      'Read-only view of Manager ratings and comments',
      'Note any ratings that seem inconsistent with employee record'
    ],
    notes: [
      'This step is optional; HR can assess independently without viewing',
      'Viewing Manager responses is logged for audit purposes'
    ],
    expectedResult: 'HR has context on Manager perspective (or chooses to skip).'
  },
  {
    title: 'Navigate to HR Assessment Form',
    description: 'Open the assessment form filtered to HR-specific indicators.',
    substeps: [
      'Click "Complete HR Assessment" in task',
      'Form loads with categories containing HR-applicable indicators',
      'Some indicators may be Manager-only and not appear'
    ],
    expectedResult: 'Form displays only indicators where applies_to includes "hr" assessor type.'
  },
  {
    title: 'Rate HR-Specific Indicators',
    description: 'Assess indicators related to HR oversight areas.',
    substeps: [
      'Performance history validation',
      'Policy compliance and conduct',
      'Flight risk and retention factors',
      'Career development trajectory'
    ],
    notes: [
      'HR has access to employee file data that Managers may not see',
      'Leverage disciplinary records, exit interview patterns, engagement data'
    ],
    expectedResult: 'All HR-specific indicators rated with evidence-based comments.'
  },
  {
    title: 'Identify Variance with Manager (If Viewing)',
    description: 'Note significant differences between HR and Manager ratings.',
    substeps: [
      'System highlights indicators where HR and Manager differ by 2+ points',
      'These variances may trigger calibration review',
      'Add comments explaining HR perspective on discrepancies'
    ],
    expectedResult: 'Variances documented; calibration flags set if needed.'
  },
  {
    title: 'Submit HR Assessment',
    description: 'Finalize and submit all HR responses.',
    substeps: [
      'Click "Submit HR Assessment"',
      'All responses saved with assessor_type = "hr"',
      'Event status may advance if HR is the final required assessor'
    ],
    expectedResult: 'HR responses submitted. If all required assessors complete, event moves to completed.'
  }
];

export function ReadinessHRWorkflow() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Differentiate between independent assessment and validation modes for HR",
          "Navigate to HR-specific indicators filtered by assessor type",
          "Leverage HR data sources (performance history, compliance) for objective ratings",
          "Identify and document variance with Manager ratings for calibration"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          HR Hub → My Tasks → [Readiness Assessment - HR Review]
        </code>
        <br />
        <span className="text-xs text-muted-foreground">Alternative:</span>
        <code className="text-xs bg-muted px-2 py-1 rounded ml-2">
          HR Hub → Talent Management → Readiness Assessments → [Pending HR Review]
        </code>
      </InfoCallout>

      {/* Assessment Modes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            HR Assessment Modes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HR Partners can assess candidates in two modes, depending on organization policy:
          </p>

          <FeatureCardGrid columns={2}>
            <PrimaryFeatureCard
              icon={Shield}
              title="Independent Assessment"
              description="HR rates indicators without viewing Manager responses first. Ensures unbiased, independent perspective. Recommended for calibration-focused organizations."
            />
            <InfoFeatureCard
              icon={Eye}
              title="Validation Mode"
              description="HR views Manager ratings before providing their own. Allows HR to focus on areas of disagreement. Faster but may introduce anchoring bias."
            />
          </FeatureCardGrid>

          <IndustryCallout>
            <strong>Enterprise Pattern:</strong> Enterprise implementations often use Independent mode 
            for initial assessments, then switch to Validation mode for calibration sessions where 
            the goal is to reconcile differing perspectives.
          </IndustryCallout>
        </CardContent>
      </Card>

      {/* HR-Specific Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            HR-Specific Indicator Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HR Partners typically assess indicators that require access to confidential employee data:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Sample Indicators</th>
                  <th className="text-left py-3 px-4 font-medium">HR Data Sources</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Performance History</td>
                  <td className="py-3 px-4">Consistent ratings over 3+ years, No PIPs</td>
                  <td className="py-3 px-4">Appraisal records, disciplinary files</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Compliance & Conduct</td>
                  <td className="py-3 px-4">Policy adherence, Ethics violations</td>
                  <td className="py-3 px-4">Incident reports, training completion</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Flight Risk</td>
                  <td className="py-3 px-4">Engagement score, Tenure risk, Market demand</td>
                  <td className="py-3 px-4">Exit interviews, compensation benchmarks</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Career Development</td>
                  <td className="py-3 px-4">Development plan progress, Aspiration alignment</td>
                  <td className="py-3 px-4">IDP records, career conversations</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Organizational Knowledge</td>
                  <td className="py-3 px-4">Cross-functional exposure, Network breadth</td>
                  <td className="py-3 px-4">Project assignments, rotation history</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Procedure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Step-by-Step: Complete HR Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={hrSteps} />
        </CardContent>
      </Card>

      {/* Variance Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Variance Detection & Calibration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When HR and Manager ratings differ significantly, the system flags for calibration:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Variance Level</th>
                  <th className="text-left py-3 px-4 font-medium">Point Difference</th>
                  <th className="text-left py-3 px-4 font-medium">System Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">Low</Badge>
                  </td>
                  <td className="py-3 px-4">0-1 points</td>
                  <td className="py-3 px-4">Normal—no flag</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-600">Moderate</Badge>
                  </td>
                  <td className="py-3 px-4">2 points</td>
                  <td className="py-3 px-4">Highlighted in report, optional discussion</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge variant="destructive">High</Badge>
                  </td>
                  <td className="py-3 px-4">3+ points</td>
                  <td className="py-3 px-4">Calibration meeting required before finalization</td>
                </tr>
              </tbody>
            </table>
          </div>

          <WarningCallout>
            <strong>Calibration Trigger:</strong> If more than 20% of indicators have High variance 
            between Manager and HR, the system automatically creates a calibration task in HR Hub 
            for the Succession Admin to facilitate a reconciliation meeting.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Expected Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Expected Results After HR Submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 rounded-lg">
              <p className="font-medium text-sm text-emerald-700 dark:text-emerald-400">Database Changes</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• All HR responses have submitted_at timestamp</li>
                <li>• assessor_type = 'hr' on all records</li>
                <li>• Variance flags calculated and stored</li>
              </ul>
            </div>
            <div className="p-3 border border-blue-500/30 bg-blue-500/10 rounded-lg">
              <p className="font-medium text-sm text-blue-700 dark:text-blue-400">Event Progression</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• If HR is final required: event → completed</li>
                <li>• If Executive enabled: task created for Executive</li>
                <li>• Score calculation triggered on completion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices for HR Assessments">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Review employee file before assessing to have full context on hand</li>
          <li>Use Independent mode for first-time assessments to avoid anchoring bias</li>
          <li>Document justification thoroughly for any rating that differs from Manager by 2+ points</li>
          <li>Leverage flight risk indicators from engagement surveys and exit interview patterns</li>
          <li>Coordinate with HRBP for the business unit if additional context is needed</li>
        </ul>
      </TipCallout>
    </div>
  );
}
