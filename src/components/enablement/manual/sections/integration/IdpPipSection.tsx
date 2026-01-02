import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { ConfigurationExample } from '../../components/ConfigurationExample';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';
import { 
  BookOpen, FileText, Lightbulb, AlertTriangle, Info, 
  TrendingDown, TrendingUp, Target, CheckCircle2
} from 'lucide-react';

export function IdpPipSection() {
  const idpPipDiagram = `
graph TB
    subgraph Trigger["Appraisal Finalization"]
        A[Appraisal Complete] --> B{Check Category}
    end
    
    subgraph Evaluation["Plan Type Determination"]
        B -->|needs_improvement / unsatisfactory| C[Create PIP]
        B -->|meets / exceeds / exceptional| D[Create IDP]
    end
    
    subgraph GapAnalysis["Gap Analysis"]
        C --> E[Extract Development Gaps]
        D --> E
        E --> F[Convert Gaps to Goals]
    end
    
    subgraph PlanCreation["Plan Creation"]
        F --> G[Create Development Plan]
        G --> H[Link to Source Appraisal]
        H --> I[Set Status: Draft]
        I --> J[Notify Manager]
    end
  `;

  const fields = [
    { name: 'plan_type', required: true, type: 'Enum', description: 'Type of development plan created', defaultValue: 'idp or pip based on category' },
    { name: 'employee_id', required: true, type: 'UUID', description: 'Employee receiving the development plan' },
    { name: 'source_appraisal_id', required: true, type: 'UUID', description: 'Appraisal that triggered the plan creation' },
    { name: 'status', required: true, type: 'Enum', description: 'Initial status of the plan', defaultValue: 'draft' },
    { name: 'start_date', required: false, type: 'Date', description: 'When the plan should begin', defaultValue: 'Current date' },
    { name: 'target_end_date', required: false, type: 'Date', description: 'Expected completion date', defaultValue: '90 days for PIP, 12 months for IDP' },
    { name: 'goals', required: false, type: 'Goal[]', description: 'Auto-generated goals from appraisal gaps' },
    { name: 'created_by', required: true, type: 'UUID', description: 'User/system that created the plan', defaultValue: 'System' },
  ];

  const goalFields = [
    { name: 'goal_title', required: true, type: 'Text', description: 'Title derived from development gap area' },
    { name: 'goal_description', required: true, type: 'Text', description: 'Description from gap improvement suggestion' },
    { name: 'target_date', required: false, type: 'Date', description: 'Goal completion target', defaultValue: 'Plan end date' },
    { name: 'priority', required: false, type: 'Enum', description: 'Goal priority level', defaultValue: 'medium' },
    { name: 'source_gap_id', required: true, type: 'UUID', description: 'Reference to original appraisal gap' },
  ];

  const businessRules = [
    { rule: 'PIP created for needs_improvement and unsatisfactory categories', enforcement: 'System' as const, description: 'Performance Improvement Plans are mandatory remediation tools for underperformers' },
    { rule: 'IDP created for meets, exceeds, and exceptional categories', enforcement: 'System' as const, description: 'Individual Development Plans focus on growth and career advancement' },
    { rule: 'Plans start in draft status for manager review', enforcement: 'System' as const, description: 'Auto-created plans require manager review before activation' },
    { rule: 'Goals auto-populated from appraisal development gaps', enforcement: 'System' as const, description: 'Gap areas become plan goals with improvement suggestions as descriptions' },
    { rule: 'PIP default duration is 90 days', enforcement: 'Advisory' as const, description: 'Standard remediation period; can be adjusted based on policy' },
    { rule: 'IDP default duration is 12 months', enforcement: 'Advisory' as const, description: 'Aligns with typical annual development cycle' },
    { rule: 'Source appraisal is linked for traceability', enforcement: 'System' as const, description: 'Audit trail maintained between plan and triggering appraisal' },
  ];

  const configExamples = [
    {
      title: 'Automatic PIP for Underperformers',
      context: 'Create Performance Improvement Plan when employee receives low rating',
      values: [
        { field: 'Target Module', value: 'idp_pip' },
        { field: 'Condition Type', value: 'category_match' },
        { field: 'Category Codes', value: 'needs_improvement, unsatisfactory' },
        { field: 'Action Type', value: 'create_pip' },
        { field: 'Action Parameters', value: '{"duration_days": 90}' },
        { field: 'Requires Approval', value: 'Yes' },
      ],
      outcome: 'PIP created with 90-day timeline and goals from appraisal gaps; queued for HR approval'
    },
    {
      title: 'Growth IDP for High Performers',
      context: 'Create development plan for employees exceeding expectations',
      values: [
        { field: 'Target Module', value: 'idp_pip' },
        { field: 'Condition Type', value: 'category_match' },
        { field: 'Category Codes', value: 'exceeds_expectations, exceptional' },
        { field: 'Action Type', value: 'create_idp' },
        { field: 'Action Parameters', value: '{"focus": "career_growth"}' },
      ],
      outcome: 'IDP created with 12-month development goals focused on advancement'
    },
    {
      title: 'Score-Based PIP Trigger',
      context: 'Create PIP for any score below 2.0 regardless of category',
      values: [
        { field: 'Target Module', value: 'idp_pip' },
        { field: 'Condition Type', value: 'score_range' },
        { field: 'Min Score', value: '0' },
        { field: 'Max Score', value: '2.0' },
        { field: 'Action Type', value: 'create_pip' },
        { field: 'Requires Approval', value: 'Yes' },
      ],
      outcome: 'PIP created for any employee scoring below 2.0'
    },
  ];

  const steps: Step[] = [
    {
      title: 'Configure IDP/PIP Integration Rule',
      description: 'Set up the trigger conditions for automatic plan creation',
      substeps: [
        'Navigate to Performance → Setup → Integration',
        'Click "Add Rule"',
        'Select "idp_pip" as the Target Module',
        'Choose condition type (category_match or score_range)'
      ],
      expectedResult: 'Rule form configured for IDP/PIP target'
    },
    {
      title: 'Define Trigger Conditions',
      description: 'Specify when plans should be created',
      substeps: [
        'For PIP: Select "needs_improvement" and "unsatisfactory" categories',
        'For IDP: Select "meets_expectations", "exceeds_expectations", or "exceptional"',
        'Alternatively, use score ranges for more granular control'
      ],
      expectedResult: 'Conditions properly configured'
    },
    {
      title: 'Set Action Parameters',
      description: 'Configure the plan creation details',
      substeps: [
        'Select action type: "create_pip" or "create_idp"',
        'Optionally specify duration in action parameters',
        'Enable "Requires Approval" for PIP (recommended)'
      ],
      expectedResult: 'Action parameters defined'
    },
    {
      title: 'Test with Sample Appraisal',
      description: 'Verify the integration works correctly',
      substeps: [
        'Finalize a test appraisal with matching conditions',
        'Check IDP/PIP module for new plan',
        'Verify goals were created from appraisal gaps',
        'Confirm source appraisal linkage'
      ],
      expectedResult: 'Development plan created with correct goals and linkage'
    },
    {
      title: 'Review and Activate Plan',
      description: 'Manager reviews auto-created plan',
      substeps: [
        'Navigate to the employee\'s development plans',
        'Review auto-generated goals and adjust if needed',
        'Add any additional goals or milestones',
        'Change status from "draft" to "active"'
      ],
      expectedResult: 'Plan activated and visible to employee'
    },
  ];

  const troubleshootingItems = [
    { issue: 'Plan not created', cause: 'No development gaps recorded in appraisal', solution: 'Ensure appraisal has strengths/gaps section completed before finalization' },
    { issue: 'Goals empty', cause: 'Gap improvement suggestions not provided', solution: 'Review appraisal template to ensure improvement suggestions are required fields' },
    { issue: 'Wrong plan type created', cause: 'Category mapping may differ from expected', solution: 'Verify the category code assigned to the appraisal matches rule conditions' },
    { issue: 'Approval stuck in queue', cause: 'No approver configured or notified', solution: 'Check notification rules and ensure HR/manager is aware of pending approvals' },
    { issue: 'Duplicate plans created', cause: 'Multiple rules matching same condition', solution: 'Review rule execution order and ensure only one IDP/PIP rule matches each scenario' },
  ];

  return (
    <div className="space-y-8">
      {/* Section 7.3 Header */}
      <Card id="sec-7-3">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 7.3</Badge>
          </div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            IDP/PIP Auto-Creation
          </CardTitle>
          <CardDescription>
            Automatically generate development and improvement plans from appraisal outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-7-3']} />

          {/* Learning Objectives */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand when PIP vs IDP is automatically created</li>
                <li>Configure rules to trigger plan creation based on performance</li>
                <li>Learn how appraisal gaps become plan goals</li>
                <li>Manage the approval workflow for auto-created plans</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Plan Type Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  <TrendingDown className="h-5 w-5" />
                  Performance Improvement Plan (PIP)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-red-600" />
                    <span>Triggered by: <strong>needs_improvement</strong> or <strong>unsatisfactory</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-red-600" />
                    <span>Default duration: <strong>90 days</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-red-600" />
                    <span>Focus: Remediation and minimum standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-red-600" />
                    <span>Typically requires HR approval</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  Individual Development Plan (IDP)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Triggered by: <strong>meets</strong>, <strong>exceeds</strong>, or <strong>exceptional</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Default duration: <strong>12 months</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Focus: Growth, skills, and career advancement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Usually auto-approved for manager review</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Diagram */}
          <WorkflowDiagram 
            title="IDP/PIP Creation Flow"
            description="How appraisal outcomes determine plan type and populate goals"
            diagram={idpPipDiagram}
          />

          {/* Gap to Goal Mapping */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Gap-to-Goal Mapping
            </h3>
            <p className="text-muted-foreground">
              Development gaps identified during the appraisal are automatically converted into 
              actionable goals in the created plan. Each gap becomes a goal with the improvement 
              suggestion as the description.
            </p>
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
                    <Badge variant="outline" className="min-w-[140px]">Appraisal Gap</Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="secondary" className="min-w-[100px]">Plan Goal</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
                    <span className="text-sm min-w-[140px]">Gap Area</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm">Goal Title</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
                    <span className="text-sm min-w-[140px]">Improvement Suggestion</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm">Goal Description</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
                    <span className="text-sm min-w-[140px]">Priority Level</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm">Goal Priority</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Field References */}
          <FieldReferenceTable 
            fields={fields} 
            title="Development Plan Fields"
          />

          <FieldReferenceTable 
            fields={goalFields} 
            title="Auto-Generated Goal Fields"
          />

          {/* Step by Step */}
          <StepByStep 
            steps={steps}
            title="Configuring IDP/PIP Auto-Creation"
          />

          {/* Configuration Examples */}
          <ConfigurationExample 
            examples={configExamples}
            title="IDP/PIP Rule Examples"
          />

          {/* Business Rules */}
          <BusinessRules 
            rules={businessRules}
            title="IDP/PIP Creation Rules"
          />

          {/* Troubleshooting */}
          <TroubleshootingSection 
            items={troubleshootingItems}
            title="Common Issues"
          />

          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Consideration</AlertTitle>
            <AlertDescription>
              PIPs are legally significant documents in many jurisdictions. Always require HR approval 
              for auto-created PIPs and ensure they are reviewed before activation. The auto-creation 
              feature is intended to accelerate the process, not bypass governance.
            </AlertDescription>
          </Alert>

          {/* Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Best Practices</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Always enable approval workflow for PIPs to ensure HR oversight</li>
                <li>Review auto-generated goals before activating plans</li>
                <li>Ensure appraisal templates require development gaps for goal population</li>
                <li>Use consistent naming conventions for plan templates</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
