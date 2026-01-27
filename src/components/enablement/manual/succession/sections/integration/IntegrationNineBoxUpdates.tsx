import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3, 
  RefreshCw,
  Sparkles,
  History,
  FileCheck
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  StepByStep,
  BusinessRules,
  type Step,
  type BusinessRule
} from '@/components/enablement/manual/components';

const configSteps: Step[] = [
  {
    title: 'Configure Rating Sources',
    description: 'Navigate to Succession → Setup → Nine-Box → Rating Sources.',
    notes: [
      'Performance axis: Appraisal (50%), Goals (30%), Competency (20%)',
      'Potential axis: Leadership signals (40%), Assessment (40%), Values (20%)'
    ],
    expectedResult: 'Rating sources configured with weights totaling 100% per axis'
  },
  {
    title: 'Enable Automatic Updates',
    description: 'Create integration rules that trigger Nine-Box recalculation.',
    notes: [
      'Trigger: appraisal_finalized → Action: refresh_assessment',
      'Trigger: 360_cycle_completed → Action: update_potential'
    ]
  },
  {
    title: 'Configure Approval Requirement',
    description: 'Set requires_approval=true for rating changes.',
    notes: ['All Nine-Box placement changes should require HR review'],
    expectedResult: 'Rating changes queue for HR approval before execution'
  },
  {
    title: 'Enable AI Suggestions',
    description: 'Configure AI-suggested ratings visibility in assessment forms.',
    notes: [
      'AI suggestions appear as reference, not auto-applied',
      'Assessors can accept, modify, or ignore suggestions'
    ]
  },
  {
    title: 'Set Evidence Capture Rules',
    description: 'Configure automatic evidence source linking for audit trail.',
    notes: ['Each rating change captures source signals and confidence scores'],
    expectedResult: 'nine_box_evidence_sources records created with each assessment'
  }
];

const businessRules: BusinessRule[] = [
  { rule: 'One current assessment per employee', enforcement: 'System', description: 'Only one nine_box_assessment with is_current=true per employee at any time' },
  { rule: 'Archive before create', enforcement: 'System', description: 'Previous current assessment archived (is_current=false) before new assessment created' },
  { rule: 'Override requires reason', enforcement: 'Policy', description: 'Manual overrides of AI-suggested ratings must include justification text' },
  { rule: 'Evidence automatically captured', enforcement: 'System', description: 'Source signals and confidence scores stored in nine_box_evidence_sources' },
  { rule: 'Approval required for rating changes', enforcement: 'Policy', description: 'Performance/Potential rating changes should route through HR approval workflow' }
];

export function IntegrationNineBoxUpdates() {
  return (
    <section id="sec-9-6" data-manual-anchor="sec-9-6" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Grid3X3 className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.6 Nine-Box Automatic Updates</h3>
          <p className="text-sm text-muted-foreground">
            Automated Nine-Box placement from integrated performance and potential signals
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure automatic Nine-Box updates from Performance and 360 data',
        'Manage is_current flag lifecycle for assessment history',
        'Enable AI-suggested ratings and override workflows',
        'Capture evidence sources for SOC 2 compliance'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Automatic Update Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Source Event Triggers</p>
                  <p className="text-muted-foreground">Appraisal finalized, 360 completed, or readiness assessment updated</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Signal Snapshots Created/Updated</p>
                  <p className="text-muted-foreground">New talent_signal_snapshots with is_current=true replace previous</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Axis Scores Calculated</p>
                  <p className="text-muted-foreground">Weighted aggregation per nine_box_signal_mappings configuration</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Rating Change Detected</p>
                  <p className="text-muted-foreground">Compare new ratings to current assessment; if changed, queue action</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">5</Badge>
                <div>
                  <p className="font-medium">Approval or Auto-Execute</p>
                  <p className="text-muted-foreground">Based on rule configuration, either execute immediately or queue for HR approval</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">6</Badge>
                <div>
                  <p className="font-medium">Assessment Created with Evidence</p>
                  <p className="text-muted-foreground">New nine_box_assessments record with linked evidence sources</p>
                </div>
              </li>
            </ol>
          </div>

          <InfoCallout>
            The integration ensures Nine-Box placements stay synchronized with the latest performance and 
            potential signals while maintaining a complete audit trail of all changes.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            is_current Flag Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <code>is_current</code> flag on <code>nine_box_assessments</code> ensures only one active 
            placement per employee while preserving history:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Current Assessment</h4>
              <ul className="text-sm space-y-1">
                <li><code>is_current = true</code></li>
                <li>Used in all Nine-Box grids</li>
                <li>Feeds succession planning dashboards</li>
                <li>Only one per employee</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-950/20">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Historical Assessments</h4>
              <ul className="text-sm space-y-1">
                <li><code>is_current = false</code></li>
                <li>Preserved for audit trail</li>
                <li>Accessible in employee history view</li>
                <li>Used for trend analysis</li>
              </ul>
            </div>
          </div>

          <WarningCallout>
            Never delete historical assessments. They form the audit trail for succession decisions 
            and are required for SOC 2 compliance. Use the <code>is_current</code> flag to control 
            which assessment is active.
          </WarningCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Suggested Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The system can provide AI-suggested Nine-Box placements based on signal analysis:
          </p>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">AI Suggestion Display</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 border rounded bg-background">
                <p className="font-medium">Suggested Performance</p>
                <p className="text-2xl font-bold text-primary mt-1">3</p>
                <p className="text-xs text-muted-foreground">Based on appraisal + goals</p>
                <Badge variant="outline" className="mt-2">87% confidence</Badge>
              </div>
              <div className="p-3 border rounded bg-background">
                <p className="font-medium">Suggested Potential</p>
                <p className="text-2xl font-bold text-primary mt-1">2</p>
                <p className="text-xs text-muted-foreground">Based on 360 + readiness</p>
                <Badge variant="outline" className="mt-2">73% confidence</Badge>
              </div>
              <div className="p-3 border rounded bg-background">
                <p className="font-medium">Suggested Box</p>
                <p className="text-2xl font-bold text-primary mt-1">6</p>
                <p className="text-xs text-muted-foreground">"Core Player"</p>
                <Badge variant="secondary" className="mt-2">Review recommended</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">Assessor Actions:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Accept</strong> - Use AI suggestion as submitted rating</li>
              <li>• <strong>Modify</strong> - Adjust ratings with override reason</li>
              <li>• <strong>Ignore</strong> - Enter manual ratings independently</li>
            </ul>
          </div>

          <TipCallout>
            AI suggestions are advisory only. Human assessors always make final placement decisions. 
            All overrides are logged with the assessor's justification for compliance tracking.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Evidence Source Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each Nine-Box assessment automatically captures evidence sources in <code>nine_box_evidence_sources</code>:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Field</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-left py-2 px-3">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">source_type</td>
                  <td className="py-2 px-3">Type of evidence</td>
                  <td className="py-2 px-3">signal_snapshot, appraisal, 360_cycle</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">source_id</td>
                  <td className="py-2 px-3">Reference to source record</td>
                  <td className="py-2 px-3">UUID of source snapshot</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">contribution_axis</td>
                  <td className="py-2 px-3">Which axis this supports</td>
                  <td className="py-2 px-3">performance, potential</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">contribution_weight</td>
                  <td className="py-2 px-3">Weight applied</td>
                  <td className="py-2 px-3">0.5 (50%)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">confidence_score</td>
                  <td className="py-2 px-3">Confidence at capture time</td>
                  <td className="py-2 px-3">0.87</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">captured_at</td>
                  <td className="py-2 px-3">Timestamp of capture</td>
                  <td className="py-2 px-3">2026-01-15T10:30:00Z</td>
                </tr>
              </tbody>
            </table>
          </div>

          <InfoCallout>
            Evidence capture ensures full traceability of Nine-Box decisions. Auditors can trace any 
            placement back to the specific signals, scores, and data points that informed the rating.
          </InfoCallout>
        </CardContent>
      </Card>

      <StepByStep steps={configSteps} title="Configuration Procedure" />

      <BusinessRules rules={businessRules} />
    </section>
  );
}
