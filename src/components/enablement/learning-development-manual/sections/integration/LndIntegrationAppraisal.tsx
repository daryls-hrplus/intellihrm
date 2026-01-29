import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  ArrowRight, 
  Zap,
  Code,
  Settings
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  StepByStep,
  type Step
} from '@/components/enablement/manual/components';
import { ScreenshotPlaceholder } from '@/components/enablement/shared/ScreenshotPlaceholder';

const configSteps: Step[] = [
  {
    title: 'Navigate to Integration Rules',
    description: 'Go to Performance → Setup → Integration Rules to configure appraisal-to-training automation.',
    notes: ['Requires Admin role'],
    expectedResult: 'Integration rules list displays'
  },
  {
    title: 'Create Training Integration Rule',
    description: 'Click "Add Rule" and configure with target_module = "training".',
    notes: [
      'Set trigger_event: "appraisal_finalized"',
      'Configure condition_type based on use case'
    ]
  },
  {
    title: 'Configure Trigger Conditions',
    description: 'Set conditions that determine when training actions fire.',
    notes: [
      'score_range: triggers on rating thresholds (e.g., score < 3)',
      'category: triggers on specific rating categories',
      'competency_gap: triggers when skill gaps detected'
    ],
    expectedResult: 'Condition logic configured'
  },
  {
    title: 'Select Training Action Type',
    description: 'Choose the action to execute when conditions are met.',
    notes: [
      'create_request: Creates pending training request',
      'auto_enroll: Direct enrollment (use cautiously)',
      'recommend: AI-powered course recommendations',
      'gap_based_enrollment: Enroll based on competency gaps'
    ]
  },
  {
    title: 'Configure Action Parameters',
    description: 'Set action_config JSON with specific parameters.',
    notes: [
      'For create_request: { priority, course_id, request_type }',
      'For auto_enroll: { course_id, learning_path_id }'
    ]
  },
  {
    title: 'Test Rule Execution',
    description: 'Finalize a test appraisal and verify training action triggers.',
    expectedResult: 'Training request or enrollment created with source_type = "appraisal"'
  }
];

export function LndIntegrationAppraisal() {
  return (
    <section id="sec-8-3" data-manual-anchor="sec-8-3" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.3 Performance & Appraisal Integration</h3>
          <p className="text-sm text-muted-foreground">
            Create training actions from performance appraisal outcomes
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure integration rules for appraisal-to-training automation',
        'Understand the appraisal-integration-orchestrator edge function',
        'Set up training action types: create_request, auto_enroll, recommend, gap_based_enrollment',
        'Track training requests with source_type = "appraisal" for reporting'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Data Flow: Appraisal → Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Event</p>
                <p className="font-medium">Appraisal Finalized</p>
                <Badge variant="outline" className="mt-1">appraisal_participants</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Orchestrator</p>
                <p className="font-medium">Integration Engine</p>
                <Badge variant="outline" className="mt-1">appraisal_integration_rules</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Action</p>
                <p className="font-medium">Training Created</p>
                <Badge variant="outline" className="mt-1">training_requests / lms_enrollments</Badge>
              </div>
            </div>
          </div>

          <InfoCallout>
            The integration is powered by the <code>appraisal-integration-orchestrator</code> edge 
            function, which evaluates all active rules when an appraisal is finalized and executes 
            matching training actions.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Training Action Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>create_request</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Creates a training request that requires approval before enrollment.
                </p>
                <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                  {`action_config: {
  "priority": "high",
  "course_id": "uuid",
  "request_type": "performance_improvement"
}`}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive">auto_enroll</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Immediately enrolls the employee in the specified course or learning path.
                </p>
                <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                  {`action_config: {
  "course_id": "uuid",
  "learning_path_id": "uuid"
}`}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">recommend</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Uses AI to recommend courses based on appraisal feedback and competency gaps.
                </p>
                <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                  {`action_config: {
  "max_recommendations": 5,
  "competency_focus": true
}`}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">gap_based_enrollment</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Enrolls in courses mapped to identified competency gaps from the appraisal.
                </p>
                <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                  {`action_config: {
  "min_gap_level": 2,
  "auto_approve": false
}`}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Common Rule Configurations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <h4 className="font-medium mb-2">Performance Improvement Plan (PIP)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Trigger: Rating ≤ 2 | Action: create_request with high priority
              </p>
              <div className="text-xs font-mono">
                condition_type: 'score_range', condition_value: 2, condition_operator: '≤'
              </div>
            </div>

            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium mb-2">Development Opportunity</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Trigger: Rating = 3-4 | Action: recommend courses for growth areas
              </p>
              <div className="text-xs font-mono">
                condition_type: 'score_range', condition_value: 3, condition_value_max: 4
              </div>
            </div>

            <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium mb-2">High Performer Advancement</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Trigger: Rating = 5 | Action: auto_enroll in leadership learning path
              </p>
              <div className="text-xs font-mono">
                condition_type: 'score_range', condition_value: 5, condition_operator: '='
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <WarningCallout>
        Use <code>auto_enroll</code> cautiously—it bypasses approval workflows. For sensitive 
        scenarios like PIPs, use <code>create_request</code> with <code>requires_approval = true</code> 
        to ensure HR review before enrollment.
      </WarningCallout>

      <StepByStep steps={configSteps} title="Configuration Procedure" />

      <ScreenshotPlaceholder 
        title="Integration Rule Configuration"
        description="Shows the rule form with trigger event, conditions, and action type selection"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Edge Function Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <code>appraisal-integration-orchestrator</code> edge function (959 lines) handles:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <span>Rule evaluation with multi-condition support (AND/OR logic)</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <span>Competency gap detection via employee_skill_gaps table</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <span>Course-competency matching via competency_course_mappings</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <span>Training request/enrollment creation with source tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">5</Badge>
              <span>Audit logging to appraisal_integration_log</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <TipCallout>
        <strong>Source Tracking:</strong> All training requests created by this integration have 
        <code>source_type = 'appraisal'</code> and <code>source_reference_id</code> pointing to the 
        appraisal_participants record. Use these fields for reporting on performance-driven training.
      </TipCallout>

      <InfoCallout>
        For the complete integration rules engine specification including all 28 fields in 
        <code>appraisal_integration_rules</code>, refer to the <strong>Succession Planning 
        Administrator Manual, Chapter 9.2</strong>.
      </InfoCallout>
    </section>
  );
}
