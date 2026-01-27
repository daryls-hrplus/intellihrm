import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  TrendingDown, 
  Settings, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  User
} from 'lucide-react';

export function FlightRiskWorkflow() {
  const objectives = [
    'Execute the complete flight risk assessment workflow',
    'Navigate the FlightRiskTab.tsx interface for assessment creation and updates',
    'Apply the is_current flag lifecycle for historical tracking',
    'Document retention actions and schedule follow-up reviews'
  ];

  const flightRiskFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Company scope for multi-tenant isolation' },
    { name: 'employee_id', required: true, type: 'UUID', description: 'Reference to profiles.id (employee being assessed)' },
    { name: 'risk_level', required: true, type: 'enum', description: 'Current risk classification', defaultValue: 'medium', validation: 'low | medium | high | critical' },
    { name: 'risk_factors', required: false, type: 'text[]', description: 'Array of selected risk factor strings from standard list' },
    { name: 'retention_actions', required: false, type: 'text', description: 'Free-text field for planned or completed retention interventions' },
    { name: 'assessed_by', required: false, type: 'UUID', description: 'User who performed the assessment (profiles.id)' },
    { name: 'assessment_date', required: true, type: 'date', description: 'Date when assessment was performed' },
    { name: 'next_review_date', required: false, type: 'date', description: 'Scheduled date for next review (governance compliance)' },
    { name: 'notes', required: false, type: 'text', description: 'Additional context, observations, or confidential notes' },
    { name: 'is_current', required: true, type: 'boolean', description: 'Current assessment flag - only one per employee', defaultValue: 'true' },
    { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last modification timestamp', defaultValue: 'now()' },
  ];

  const assessmentSteps: Step[] = [
    {
      title: 'Access Flight Risk Assessment',
      description: 'Navigate to the Flight Risk interface and select the target company.',
      substeps: [
        'Go to Performance → Succession → Flight Risk',
        'Select the company from the company filter dropdown',
        'Review the summary statistics cards showing risk distribution'
      ],
      expectedResult: 'Flight Risk page displays with current assessments and statistics'
    },
    {
      title: 'Create New Assessment',
      description: 'Initiate a new flight risk assessment for an employee.',
      substeps: [
        'Click "New Assessment" button',
        'Select the employee from the dropdown list',
        'Note: Only active employees for the selected company are shown'
      ],
      notes: [
        'If employee already has a current assessment, creating a new one will mark the previous as historical (is_current = false)'
      ],
      expectedResult: 'Assessment dialog opens with employee selected'
    },
    {
      title: 'Set Risk Level',
      description: 'Evaluate and assign the appropriate risk level.',
      substeps: [
        'Review risk level options: Low, Medium, High, Critical',
        'Consider probability of departure and timeline',
        'Select the risk level that matches the assessment criteria'
      ],
      notes: [
        'Critical: Likely to leave within 30 days, may have external offer',
        'High: Actively looking, 3-6 month timeline',
        'Medium: Warning signs, 6-12 month timeline',
        'Low: Stable, no immediate concern'
      ],
      expectedResult: 'Risk level is set with appropriate classification'
    },
    {
      title: 'Select Risk Factors',
      description: 'Document the specific factors contributing to the risk assessment.',
      substeps: [
        'Review the standard risk factors displayed as selectable badges',
        'Click each applicable factor to toggle selection (highlighted when selected)',
        'Multiple factors can be selected to build a comprehensive profile'
      ],
      notes: [
        'Risk factors are stored as a text array in flight_risk_assessments.risk_factors',
        'Standard factors include: Low engagement scores, Compensation below market, Limited growth opportunities, etc.'
      ],
      expectedResult: 'Relevant risk factors are selected and highlighted'
    },
    {
      title: 'Document Retention Actions',
      description: 'Record planned or completed retention interventions.',
      substeps: [
        'Enter retention actions in the text area',
        'Include specific actions, owners, and timelines',
        'Document both planned and completed interventions'
      ],
      notes: [
        'For High/Critical risk: Retention actions are strongly recommended within 48 hours',
        'Examples: Compensation review, career conversation, executive meeting, development opportunity'
      ],
      expectedResult: 'Retention actions are documented'
    },
    {
      title: 'Schedule Review Date',
      description: 'Set the next review date for governance compliance.',
      substeps: [
        'Set the assessment date (defaults to today)',
        'Set the next review date based on risk level',
        'Critical/High: 2-4 weeks; Medium: 1-3 months; Low: Quarterly'
      ],
      expectedResult: 'Review dates are set for follow-up tracking'
    },
    {
      title: 'Save Assessment',
      description: 'Complete and save the flight risk assessment.',
      substeps: [
        'Add any additional notes if needed',
        'Click "Create" or "Update" to save',
        'Verify the assessment appears in the list with correct risk level badge'
      ],
      expectedResult: 'Assessment is saved and visible in the assessment table'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'One current assessment per employee', enforcement: 'System', description: 'When a new assessment is created, the previous is_current assessment is set to false.' },
    { rule: 'Assessment date required', enforcement: 'System', description: 'Every assessment must have an assessment_date value.' },
    { rule: 'Risk level default', enforcement: 'System', description: 'Risk level defaults to "medium" if not specified.' },
    { rule: 'Risk factors stored as array', enforcement: 'System', description: 'Selected risk factors are stored as a text array (risk_factors column).' },
    { rule: 'Company scope required', enforcement: 'System', description: 'All assessments must be scoped to a company_id for multi-tenant isolation.' },
    { rule: 'Historical retention', enforcement: 'Policy', description: 'Historical assessments (is_current = false) are retained for audit and trend analysis.' },
    { rule: 'Next review scheduling', enforcement: 'Policy', description: 'High/Critical risk assessments should have next_review_date within 30 days.' },
  ];

  return (
    <section id="sec-7-3" data-manual-anchor="sec-7-3" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.3 Employee Flight Risk Assessment Workflow</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Operational workflow for detecting, assessing, documenting, and acting on flight risk
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Performance</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Flight Risk</Badge>
          </div>
        </CardContent>
      </Card>

      {/* UI Component Reference */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800 dark:text-blue-300">
            <Info className="h-5 w-5" />
            UI Component Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h5 className="font-medium text-sm mb-2">FlightRiskTab.tsx</h5>
              <p className="text-xs text-muted-foreground">
                Main assessment interface with employee selection, risk factor badges, 
                retention action text area, and date pickers.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-2">FlightRiskPage.tsx</h5>
              <p className="text-xs text-muted-foreground">
                Page wrapper with company selector, breadcrumb navigation, and 
                the FlightRiskTab component.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Lifecycle Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-primary" />
            Assessment Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Flight risk assessments follow a continuous lifecycle from identification to resolution:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 p-4 border rounded-lg bg-muted/30">
            {[
              { label: 'Identify', icon: AlertTriangle, desc: 'Detect risk signals' },
              { label: 'Assess', icon: TrendingDown, desc: 'Set risk level' },
              { label: 'Document', icon: User, desc: 'Record factors & actions' },
              { label: 'Review', icon: Clock, desc: 'Schedule follow-up' },
              { label: 'Resolve', icon: CheckCircle, desc: 'Close or continue' },
            ].map((stage, index, arr) => (
              <div key={stage.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center p-3 border rounded-lg bg-background min-w-[100px]">
                  <stage.icon className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm font-medium">{stage.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{stage.desc}</span>
                </div>
                {index < arr.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* is_current Flag Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            is_current Flag Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Concept: Assessment Currency</AlertTitle>
            <AlertDescription>
              The <code className="px-1 py-0.5 bg-muted rounded text-xs">is_current</code> flag 
              ensures only one active assessment per employee while preserving historical data.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm flex items-center gap-2">
                <Badge className="bg-green-500 text-white">is_current = true</Badge>
                Active Assessment
              </h5>
              <p className="text-xs text-muted-foreground mt-1">
                The current, valid assessment used for reporting and dashboards.
                Each employee has exactly one active assessment.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm flex items-center gap-2">
                <Badge className="bg-muted text-muted-foreground">is_current = false</Badge>
                Historical Assessment
              </h5>
              <p className="text-xs text-muted-foreground mt-1">
                Previous assessments retained for audit trail and trend analysis.
                Automatically set when a new assessment is created for the same employee.
              </p>
            </div>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm">
              <strong>Code Reference:</strong> When creating a new assessment in FlightRiskTab.tsx, 
              the existing current assessment is updated to <code>is_current = false</code> before 
              the new record is inserted.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Assessment Workflow Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={assessmentSteps} title="" />
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-primary" />
            flight_risk_assessments Table Reference (13 fields)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={flightRiskFields} />
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Assessment Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Always document specific risk factors, not just the overall level',
              'Set next_review_date based on risk severity (Critical: 2 weeks, High: 1 month)',
              'Include planned retention actions with owners and timelines',
              'Review historical assessments before creating new ones for context',
              'Update assessments when circumstances change, not just at review dates',
              'Involve managers in assessment input where appropriate (engagement signals)',
              'Mark assessments as Low risk when risks are resolved (don\'t delete)'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
