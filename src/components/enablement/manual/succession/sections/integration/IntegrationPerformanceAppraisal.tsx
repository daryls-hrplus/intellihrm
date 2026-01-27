import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardCheck, 
  ArrowRight, 
  Percent,
  Target,
  RefreshCw
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  StepByStep,
  type FieldDefinition,
  type Step 
} from '@/components/enablement/manual/components';

const triggerDataFields: FieldDefinition[] = [
  { name: 'participant_id', required: true, type: 'UUID', description: 'Appraisal participant being evaluated', defaultValue: '—', validation: 'References appraisal_participants.id' },
  { name: 'employee_id', required: true, type: 'UUID', description: 'Employee being appraised', defaultValue: '—', validation: 'References profiles.id' },
  { name: 'appraisal_cycle_id', required: true, type: 'UUID', description: 'Parent appraisal cycle', defaultValue: '—', validation: 'References appraisal_cycles.id' },
  { name: 'overall_score', required: false, type: 'numeric', description: 'Final weighted appraisal score (1-5)', defaultValue: 'null', validation: 'Calculated from section scores' },
  { name: 'category_code', required: false, type: 'text', description: 'Assigned performance category', defaultValue: 'null', validation: 'EE, ME, DE, NI, etc.' },
  { name: 'competency_score', required: false, type: 'numeric', description: 'Competency section average', defaultValue: 'null', validation: 'From appraisal_scores' },
  { name: 'goals_score', required: false, type: 'numeric', description: 'Goals section average', defaultValue: 'null', validation: 'From appraisal_scores' },
  { name: 'values_score', required: false, type: 'numeric', description: 'Values section average', defaultValue: 'null', validation: 'From appraisal_scores' },
  { name: 'calibration_adjusted', required: false, type: 'boolean', description: 'Whether score was adjusted in calibration', defaultValue: 'false', validation: '—' }
];

const configSteps: Step[] = [
  {
    title: 'Configure Rating Source Weights',
    description: 'Navigate to Succession → Setup → Nine-Box → Rating Sources and configure Performance axis weights.',
    notes: [
      'Appraisal Score: Typical weight 50%',
      'Goal Achievement: Typical weight 30%',
      'Competency Score: Typical weight 20%'
    ],
    expectedResult: 'Performance axis sources configured with weights totaling 100%'
  },
  {
    title: 'Create Integration Rule',
    description: 'Create a rule in Performance → Setup → Integration Rules for appraisal-to-Nine-Box updates.',
    notes: [
      'Trigger: appraisal_finalized',
      'Target: nine_box',
      'Action: update_performance'
    ]
  },
  {
    title: 'Map Performance Categories to Ratings',
    description: 'Define how performance categories (EE, ME, DE) translate to Nine-Box performance ratings (1-3).',
    notes: [
      'EE (Exceptional) → Rating 3 (High)',
      'ME (Meets) → Rating 2 (Medium)',
      'DE (Development) → Rating 1 (Low)'
    ],
    expectedResult: 'Category-to-rating mapping saved in action_config'
  },
  {
    title: 'Enable Approval Workflow',
    description: 'Set requires_approval=true for Nine-Box updates to ensure HR oversight.',
    expectedResult: 'Nine-Box updates require HR approval before execution'
  },
  {
    title: 'Test with Sample Appraisal',
    description: 'Finalize a test appraisal and verify Nine-Box update appears in approval queue.',
    expectedResult: 'Pending Nine-Box update visible in HR Hub → Pending Approvals'
  }
];

export function IntegrationPerformanceAppraisal() {
  return (
    <section id="sec-9-3" data-manual-anchor="sec-9-3" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <ClipboardCheck className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.3 Performance Appraisal Integration</h3>
          <p className="text-sm text-muted-foreground">
            Feed appraisal scores to Nine-Box Performance axis and succession readiness
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure appraisal score contribution to Nine-Box Performance axis',
        'Map performance categories to succession readiness levels',
        'Understand the appraisal-integration-orchestrator edge function',
        'Set up automatic candidate updates from performance outcomes'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Data Flow: Appraisal → Succession
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="font-medium">Appraisal Scores</p>
                <Badge variant="outline" className="mt-1">appraisal_participants</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Processor</p>
                <p className="font-medium">Orchestrator</p>
                <Badge variant="outline" className="mt-1">Edge Function</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-medium">Nine-Box / Succession</p>
                <Badge variant="outline" className="mt-1">nine_box_assessments</Badge>
              </div>
            </div>
          </div>

          <InfoCallout>
            The <code>appraisal-integration-orchestrator</code> edge function processes finalized appraisals, 
            evaluates matching integration rules, and executes configured actions. It's triggered automatically 
            when <code>participant_status</code> changes to <code>finalized</code>.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Performance Axis Weight Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Nine-Box Performance axis is calculated from multiple sources with configurable weights:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Source</th>
                  <th className="text-left py-2 px-3">Default Weight</th>
                  <th className="text-left py-2 px-3">Data Source</th>
                  <th className="text-left py-2 px-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Appraisal Score</td>
                  <td className="py-2 px-3"><Badge variant="secondary">50%</Badge></td>
                  <td className="py-2 px-3"><code>appraisal_participants.overall_score</code></td>
                  <td className="py-2 px-3">Final weighted score (1-5)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Goal Achievement</td>
                  <td className="py-2 px-3"><Badge variant="secondary">30%</Badge></td>
                  <td className="py-2 px-3"><code>goals.achievement_rate</code></td>
                  <td className="py-2 px-3">Average goal completion %</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Competency Score</td>
                  <td className="py-2 px-3"><Badge variant="secondary">20%</Badge></td>
                  <td className="py-2 px-3"><code>appraisal_scores.competencies</code></td>
                  <td className="py-2 px-3">Section average</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <h4 className="font-medium mb-2">Normalized Score Calculation</h4>
            <p className="text-sm font-mono">
              normalized_score = (appraisal × 0.5) + (goals × 0.3) + (competency × 0.2)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Result is 0-1 scale, converted to 1-3 rating via thresholds: &lt;0.33 = Low, &lt;0.67 = Medium, ≥0.67 = High
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Category-to-Readiness Mapping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Performance categories can automatically adjust succession candidate readiness levels:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Category Code</th>
                  <th className="text-left py-2 px-3">Category Name</th>
                  <th className="text-left py-2 px-3">Readiness Impact</th>
                  <th className="text-left py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-green-50 dark:bg-green-950/20">
                  <td className="py-2 px-3"><code>EE</code></td>
                  <td className="py-2 px-3">Exceeds Expectations</td>
                  <td className="py-2 px-3">+1 band (if applicable)</td>
                  <td className="py-2 px-3">Accelerate readiness timeline</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3"><code>ME</code></td>
                  <td className="py-2 px-3">Meets Expectations</td>
                  <td className="py-2 px-3">No change</td>
                  <td className="py-2 px-3">Maintain current trajectory</td>
                </tr>
                <tr className="border-b bg-amber-50 dark:bg-amber-950/20">
                  <td className="py-2 px-3"><code>DE</code></td>
                  <td className="py-2 px-3">Development Needed</td>
                  <td className="py-2 px-3">-1 band</td>
                  <td className="py-2 px-3">Flag for development focus</td>
                </tr>
                <tr className="border-b bg-red-50 dark:bg-red-950/20">
                  <td className="py-2 px-3"><code>NI</code></td>
                  <td className="py-2 px-3">Needs Improvement</td>
                  <td className="py-2 px-3">Remove from pool</td>
                  <td className="py-2 px-3">Review succession candidacy</td>
                </tr>
              </tbody>
            </table>
          </div>

          <WarningCallout>
            Readiness band changes based on performance should always require HR approval. Configure 
            <code>requires_approval = true</code> for rules that modify <code>succession_candidates.readiness_band</code>.
          </WarningCallout>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={triggerDataFields} 
        title="Appraisal Trigger Data (trigger_data JSONB)" 
      />

      <StepByStep steps={configSteps} title="Configuration Procedure" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Orchestrator Edge Function
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <code>appraisal-integration-orchestrator</code> function handles all appraisal-triggered integrations:
          </p>

          <div className="p-4 border rounded-lg font-mono text-xs">
            <p className="text-muted-foreground mb-2">// Invocation</p>
            <p>POST /functions/v1/appraisal-integration-orchestrator</p>
            <p className="mt-2 text-muted-foreground">// Request body</p>
            <pre className="mt-1">{`{
  "participant_id": "uuid",
  "trigger_event": "appraisal_finalized"
}`}</pre>
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Function responsibilities:</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• Query matching rules from <code>appraisal_integration_rules</code></li>
              <li>• Evaluate condition logic against participant data</li>
              <li>• Execute actions in priority order</li>
              <li>• Log results to <code>appraisal_integration_log</code></li>
              <li>• Queue approval-required actions for HR review</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <TipCallout>
        <strong>Calibration Impact:</strong> If calibration adjusts an employee's category, the integration 
        orchestrator re-evaluates rules with the new category. Ensure calibration completion triggers 
        <code>category_assigned</code> event for proper Nine-Box updates.
      </TipCallout>
    </section>
  );
}
