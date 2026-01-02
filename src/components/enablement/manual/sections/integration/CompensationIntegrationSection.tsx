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
  DollarSign, Lightbulb, AlertTriangle, Info, TrendingUp,
  Percent, Calendar, Clock, CheckCircle2, XCircle
} from 'lucide-react';

export function CompensationIntegrationSection() {
  const compensationDiagram = `
graph TB
    subgraph Trigger["Appraisal Finalization"]
        A[Appraisal Complete] --> B[Category Assigned]
    end
    
    subgraph Mapping["Recommendation Mapping"]
        B --> C{Performance Category}
        C -->|exceptional| D[10% Increase]
        C -->|exceeds| E[5% Increase]
        C -->|meets| F[3% Review]
        C -->|needs_improvement| G[Hold]
        C -->|unsatisfactory| H[No Increase]
    end
    
    subgraph FlagCreation["Compensation Flag"]
        D & E & F & G & H --> I[Create Review Flag]
        I --> J[Set Priority]
        J --> K[Set Expiration 90 days]
    end
    
    subgraph Queue["Compensation Queue"]
        K --> L[Flag Visible in Comp Module]
        L --> M[HR/Manager Review]
        M --> N{Decision}
        N -->|Approved| O[Process Increase]
        N -->|Denied| P[Document Reason]
    end
  `;

  const fields = [
    { name: 'employee_id', required: true, type: 'UUID', description: 'Employee receiving the compensation review flag' },
    { name: 'source_appraisal_id', required: true, type: 'UUID', description: 'Appraisal that triggered the flag' },
    { name: 'action_type', required: true, type: 'Enum', description: 'Type of compensation action recommended' },
    { name: 'recommended_percentage', required: false, type: 'Number', description: 'Suggested increase percentage' },
    { name: 'priority', required: true, type: 'Enum', description: 'Processing priority (high/medium/low)', defaultValue: 'Based on category' },
    { name: 'notes', required: false, type: 'Text', description: 'Context from appraisal for compensation decision' },
    { name: 'expires_at', required: true, type: 'Date', description: 'Flag expiration date', defaultValue: '90 days from creation' },
    { name: 'status', required: true, type: 'Enum', description: 'Current status of the flag', defaultValue: 'pending' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'When the flag was created' },
  ];

  const businessRules = [
    { rule: 'Exceptional performance → 10% increase recommendation', enforcement: 'Advisory' as const, description: 'Top performers receive highest merit increase recommendation' },
    { rule: 'Exceeds expectations → 5% increase recommendation', enforcement: 'Advisory' as const, description: 'Above-average performers receive substantial increase' },
    { rule: 'Meets expectations → 3% review recommendation', enforcement: 'Advisory' as const, description: 'Standard performers receive cost-of-living adjustment consideration' },
    { rule: 'Needs improvement → Hold recommendation', enforcement: 'Advisory' as const, description: 'Underperformers typically receive no increase until improvement shown' },
    { rule: 'Flags expire after 90 days if not actioned', enforcement: 'System' as const, description: 'Ensures flags don\'t persist indefinitely without review' },
    { rule: 'Priority set based on performance category', enforcement: 'System' as const, description: 'High priority for exceptional, low for needs improvement' },
    { rule: 'Flags link to source appraisal for context', enforcement: 'System' as const, description: 'Compensation reviewers can access full appraisal details' },
  ];

  const configExamples = [
    {
      title: 'High Performer Merit Increase',
      context: 'Flag exceptional performers for immediate compensation review',
      values: [
        { field: 'Target Module', value: 'compensation' },
        { field: 'Condition Type', value: 'category_match' },
        { field: 'Category Codes', value: 'exceptional' },
        { field: 'Action Type', value: 'create_merit_flag' },
        { field: 'Action Parameters', value: '{"recommended_percentage": 10, "priority": "high"}' },
      ],
      outcome: 'High-priority compensation flag created with 10% recommendation'
    },
    {
      title: 'Standard Merit Review',
      context: 'Create review flags for all meeting expectations or above',
      values: [
        { field: 'Target Module', value: 'compensation' },
        { field: 'Condition Type', value: 'category_match' },
        { field: 'Category Codes', value: 'meets_expectations, exceeds_expectations, exceptional' },
        { field: 'Action Type', value: 'create_merit_flag' },
        { field: 'Requires Approval', value: 'No' },
      ],
      outcome: 'Flags created automatically for merit cycle processing'
    },
    {
      title: 'Underperformer Hold',
      context: 'Flag underperformers for compensation hold review',
      values: [
        { field: 'Target Module', value: 'compensation' },
        { field: 'Condition Type', value: 'score_range' },
        { field: 'Min Score', value: '0' },
        { field: 'Max Score', value: '2.0' },
        { field: 'Action Type', value: 'create_hold_flag' },
        { field: 'Requires Approval', value: 'Yes' },
      ],
      outcome: 'Hold flag created and queued for HR approval before processing'
    },
  ];

  const steps: Step[] = [
    {
      title: 'Configure Compensation Integration Rule',
      description: 'Set up the trigger for compensation review flags',
      substeps: [
        'Navigate to Performance → Setup → Integration',
        'Click "Add Rule"',
        'Select "compensation" as the Target Module',
        'Choose condition type (category_match recommended)'
      ],
      expectedResult: 'Rule form configured for compensation target'
    },
    {
      title: 'Define Category Mappings',
      description: 'Map performance categories to compensation actions',
      substeps: [
        'Select performance categories for the rule',
        'Configure recommended percentage in action parameters',
        'Set priority level (high/medium/low)',
        'Consider creating separate rules for different categories'
      ],
      expectedResult: 'Category-to-compensation mapping configured'
    },
    {
      title: 'Set Approval Requirements',
      description: 'Determine which flags require approval',
      substeps: [
        'Enable "Requires Approval" for sensitive decisions',
        'Typically require approval for: large increases, holds, exceptions',
        'Auto-approve standard merit reviews to reduce overhead'
      ],
      expectedResult: 'Approval workflow configured'
    },
    {
      title: 'Test Integration',
      description: 'Verify flags are created correctly',
      substeps: [
        'Finalize a test appraisal with matching conditions',
        'Check integration logs for successful execution',
        'Verify flag appears in database (compensation_review_flags table)',
        'Confirm priority and expiration are set correctly'
      ],
      expectedResult: 'Compensation flag created with correct parameters'
    },
    {
      title: 'Process in Merit Cycle',
      description: 'Review flags during compensation cycle',
      substeps: [
        'During merit cycle, HR reviews flagged employees',
        'Reference source appraisal for context',
        'Approve, modify, or reject recommendations',
        'Process approved increases through payroll'
      ],
      expectedResult: 'Compensation decisions made based on performance data'
    },
  ];

  const troubleshootingItems = [
    { issue: 'Flag not created', cause: 'Rule conditions may not match appraisal category', solution: 'Verify category codes match exactly between rule and appraisal' },
    { issue: 'Wrong percentage recommendation', cause: 'Action parameters not configured correctly', solution: 'Check action_parameters JSON format and recommended_percentage value' },
    { issue: 'Flag expired before review', cause: '90-day expiration reached', solution: 'Process flags within expiration window; consider extending duration in rule parameters' },
    { issue: 'Priority incorrect', cause: 'Priority not specified in action parameters', solution: 'Explicitly set priority in action_parameters or rely on category-based defaults' },
  ];

  return (
    <div className="space-y-8">
      {/* Section 7.4 Header */}
      <Card id="sec-7-4">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 7.4</Badge>
          </div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Compensation Integration
          </CardTitle>
          <CardDescription>
            Link appraisal outcomes to merit reviews and compensation decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-7-4']} />

          {/* Learning Objectives */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Configure automatic compensation review flags based on performance</li>
                <li>Understand the category-to-recommendation mapping</li>
                <li>Manage flag priorities and expiration</li>
                <li>Process flags during merit review cycles</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Recommendation Matrix */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Recommended Increase Matrix
            </h3>
            <p className="text-muted-foreground">
              The integration maps performance categories to compensation recommendations. These are 
              suggestions that guide HR and managers during merit reviews—actual increases may vary 
              based on budget, market data, and individual circumstances.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Card className="border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">10%</div>
                  <div className="text-sm font-medium">Exceptional</div>
                  <Badge variant="outline" className="mt-2 text-green-700 border-green-300">High Priority</Badge>
                </CardContent>
              </Card>
              <Card className="border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">5%</div>
                  <div className="text-sm font-medium">Exceeds</div>
                  <Badge variant="outline" className="mt-2 text-blue-700 border-blue-300">Medium Priority</Badge>
                </CardContent>
              </Card>
              <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">3%</div>
                  <div className="text-sm font-medium">Meets</div>
                  <Badge variant="outline" className="mt-2 text-amber-700 border-amber-300">Standard</Badge>
                </CardContent>
              </Card>
              <Card className="border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">Hold</div>
                  <div className="text-sm font-medium">Needs Improvement</div>
                  <Badge variant="outline" className="mt-2 text-orange-700 border-orange-300">Review Required</Badge>
                </CardContent>
              </Card>
              <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">0%</div>
                  <div className="text-sm font-medium">Unsatisfactory</div>
                  <Badge variant="outline" className="mt-2 text-red-700 border-red-300">No Increase</Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Workflow Diagram */}
          <WorkflowDiagram 
            title="Compensation Flag Flow"
            description="From appraisal finalization to compensation decision"
            diagram={compensationDiagram}
          />

          {/* Flag Lifecycle */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Flag Lifecycle
            </h3>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Pending Review</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Approved</span>
              </div>
              <span className="text-muted-foreground">or</span>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Expired (90 days)</span>
              </div>
            </div>
          </div>

          {/* Field Reference */}
          <FieldReferenceTable 
            fields={fields} 
            title="Compensation Review Flag Fields"
          />

          {/* Step by Step */}
          <StepByStep 
            steps={steps}
            title="Configuring Compensation Integration"
          />

          {/* Configuration Examples */}
          <ConfigurationExample 
            examples={configExamples}
            title="Compensation Rule Examples"
          />

          {/* Business Rules */}
          <BusinessRules 
            rules={businessRules}
            title="Compensation Integration Rules"
          />

          {/* Troubleshooting */}
          <TroubleshootingSection 
            items={troubleshootingItems}
            title="Common Issues"
          />

          {/* Future Enhancement Notice */}
          <Alert variant="default" className="border-2 border-blue-500 bg-blue-500/20">
            <Lightbulb className="h-4 w-4" />
            <AlertTitle className="font-bold">Future Enhancement: Compensation Actions Queue</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                A dedicated "Performance-Linked Actions" queue will be added to the Compensation module to:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Display all pending compensation review flags with source appraisal context</li>
                <li>Allow bulk processing during merit cycles</li>
                <li>Provide analytics on flag-to-decision conversion rates</li>
                <li>Enable direct navigation from flag to employee compensation record</li>
              </ul>
              <p className="mt-2 text-sm">
                Currently, flags are stored in the <code className="bg-muted px-1 rounded">compensation_review_flags</code> table and can be 
                queried via database tools or custom reports.
              </p>
            </AlertDescription>
          </Alert>

          {/* Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Best Practices</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Align flag creation timing with your merit review calendar</li>
                <li>Use separate rules for different job levels or regions with varying budgets</li>
                <li>Review expired flags to identify process bottlenecks</li>
                <li>Document deviation reasons when actual increases differ from recommendations</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
