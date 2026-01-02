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
  Target, Users, Lightbulb, AlertTriangle, Info, CheckCircle2,
  TrendingUp, Award, Grid3X3
} from 'lucide-react';

export function NineBoxSuccessionSection() {
  const nineBoxDiagram = `
graph LR
    subgraph Input["Appraisal Data"]
        A[Final Score] --> B[Category Code]
    end
    
    subgraph Mapping["Score Mapping"]
        B --> C{Map to Rating}
        C -->|Score ≥ 4.0| D[Rating: 3 High]
        C -->|Score 2.5-3.9| E[Rating: 2 Medium]
        C -->|Score < 2.5| F[Rating: 1 Low]
    end
    
    subgraph NineBox["Nine-Box Update"]
        D & E & F --> G[Performance Rating]
        H[Existing Potential] --> I[Nine-Box Position]
        G --> I
    end
    
    subgraph Output["Result"]
        I --> J[Assessment Created/Updated]
        J --> K[Historical Archive]
    end
  `;

  const successionDiagram = `
graph TB
    subgraph Trigger["Integration Trigger"]
        A[Appraisal Finalized] --> B[Category Evaluated]
    end
    
    subgraph Mapping["Readiness Mapping"]
        B --> C{Performance Category}
        C -->|exceptional| D[ready_now]
        C -->|exceeds| E[ready_1_year]
        C -->|meets| F[ready_2_years]
        C -->|needs_improvement| G[not_ready]
    end
    
    subgraph Update["Succession Update"]
        D & E & F & G --> H[Find Succession Candidate]
        H --> I[Update Readiness Level]
        I --> J[Update Last Assessment Date]
    end
  `;

  const nineBoxFields = [
    { name: 'employee_id', required: true, type: 'UUID', description: 'Employee receiving the Nine-Box assessment' },
    { name: 'performance_rating', required: true, type: 'Number (1-3)', description: 'Performance axis rating derived from appraisal score', defaultValue: '2' },
    { name: 'potential_rating', required: false, type: 'Number (1-3)', description: 'Potential axis rating (unchanged by integration)', defaultValue: 'Existing value' },
    { name: 'assessment_date', required: true, type: 'Date', description: 'Date of the assessment', defaultValue: 'Current date' },
    { name: 'assessed_by', required: true, type: 'UUID', description: 'User who triggered the assessment', defaultValue: 'System' },
    { name: 'is_current', required: true, type: 'Boolean', description: 'Whether this is the active assessment', defaultValue: 'true' },
    { name: 'notes', required: false, type: 'Text', description: 'Auto-generated note referencing source appraisal' },
  ];

  const successionFields = [
    { name: 'readiness_level', required: true, type: 'Enum', description: 'Updated readiness based on performance category' },
    { name: 'last_assessment_date', required: true, type: 'Date', description: 'Date of the appraisal that triggered update', defaultValue: 'Current date' },
    { name: 'development_actions', required: false, type: 'Text[]', description: 'Recommended development areas from appraisal' },
  ];

  const businessRules = [
    { rule: 'Performance rating maps: ≥4.0→3, 2.5-3.9→2, <2.5→1', enforcement: 'System' as const, description: 'Appraisal scores convert to 1-3 Nine-Box performance scale' },
    { rule: 'Potential rating is preserved, not overwritten', enforcement: 'System' as const, description: 'Integration only updates performance axis; potential requires separate assessment' },
    { rule: 'Previous assessment marked as historical', enforcement: 'System' as const, description: 'is_current set to false on existing assessments before creating new one' },
    { rule: 'Succession readiness follows category mapping', enforcement: 'System' as const, description: 'exceptional→ready_now, exceeds→ready_1_year, meets→ready_2_years, below→not_ready' },
    { rule: 'Only existing succession candidates are updated', enforcement: 'System' as const, description: 'Integration does not create new succession nominations' },
    { rule: 'Assessment notes include appraisal reference', enforcement: 'Advisory' as const, description: 'Auto-generated notes link back to source appraisal for traceability' },
  ];

  const configExamples = [
    {
      title: 'High Performer Nine-Box Update',
      context: 'Automatically update Nine-Box when employee achieves exceptional rating',
      values: [
        { field: 'Target Module', value: 'nine_box' },
        { field: 'Condition Type', value: 'category_match' },
        { field: 'Category Codes', value: 'exceptional, exceeds_expectations' },
        { field: 'Action Type', value: 'update_assessment' },
        { field: 'Requires Approval', value: 'No' },
      ],
      outcome: 'Nine-Box performance rating automatically updated to 3 (High) upon appraisal finalization'
    },
    {
      title: 'Succession Readiness Update',
      context: 'Update succession candidate readiness based on performance category',
      values: [
        { field: 'Target Module', value: 'succession' },
        { field: 'Condition Type', value: 'category_match' },
        { field: 'Category Codes', value: 'exceptional' },
        { field: 'Action Type', value: 'update_readiness' },
        { field: 'Action Parameters', value: '{"readiness_level": "ready_now"}' },
      ],
      outcome: 'Succession candidate readiness updated to "Ready Now" for exceptional performers'
    },
    {
      title: 'Low Performer Flag',
      context: 'Flag underperformers in succession pipeline with approval workflow',
      values: [
        { field: 'Target Module', value: 'succession' },
        { field: 'Condition Type', value: 'score_range' },
        { field: 'Min Score', value: '0' },
        { field: 'Max Score', value: '2.0' },
        { field: 'Requires Approval', value: 'Yes' },
      ],
      outcome: 'Succession readiness downgrade queued for HR approval before execution'
    },
  ];

  const steps: Step[] = [
    {
      title: 'Navigate to Integration Rules',
      description: 'Access the integration configuration panel',
      substeps: [
        'Go to Performance → Setup',
        'Select the "Integration" tab',
        'Click "Add Rule" to create a new integration rule'
      ],
      expectedResult: 'Integration rule form opens'
    },
    {
      title: 'Configure Nine-Box Rule',
      description: 'Set up the rule to update Nine-Box assessments',
      substeps: [
        'Enter a descriptive rule name (e.g., "Update Nine-Box on Finalization")',
        'Select "nine_box" as the Target Module',
        'Choose "category_match" as Condition Type',
        'Select applicable performance categories'
      ],
      expectedResult: 'Rule configuration shows Nine-Box as target'
    },
    {
      title: 'Set Action Parameters',
      description: 'Define what happens when the rule triggers',
      substeps: [
        'Select "update_assessment" as Action Type',
        'Optionally configure action parameters in JSON format',
        'Set "Requires Approval" based on your governance needs'
      ],
      expectedResult: 'Action configuration complete'
    },
    {
      title: 'Set Execution Order',
      description: 'Determine when this rule runs relative to others',
      substeps: [
        'Assign an execution order number',
        'Lower numbers execute first',
        'Consider dependencies between rules'
      ],
      expectedResult: 'Execution order assigned'
    },
    {
      title: 'Activate and Test',
      description: 'Enable the rule and verify behavior',
      substeps: [
        'Toggle the rule to Active',
        'Finalize a test appraisal',
        'Check Nine-Box assessments for the employee',
        'Review integration logs for execution details'
      ],
      expectedResult: 'Nine-Box assessment updated with new performance rating'
    },
  ];

  const troubleshootingItems = [
    { issue: 'Nine-Box not updating', cause: 'Employee may not have an existing Nine-Box record', solution: 'Verify employee has at least one Nine-Box assessment; integration creates/updates assessments' },
    { issue: 'Wrong performance rating', cause: 'Score-to-rating mapping may not match expectations', solution: 'Review the mapping logic: ≥4.0→3, 2.5-3.9→2, <2.5→1; adjust thresholds if needed' },
    { issue: 'Succession candidate not found', cause: 'Employee is not in the succession pipeline', solution: 'Integration only updates existing succession candidates; add employee to succession first' },
    { issue: 'Historical assessment not archived', cause: 'No previous assessment existed', solution: 'This is expected for first-time assessments; archiving only applies to updates' },
  ];

  return (
    <div className="space-y-8">
      {/* Section 7.2 Header */}
      <Card id="sec-7-2">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 7.2</Badge>
          </div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Grid3X3 className="h-6 w-6" />
            Nine-Box & Succession Integration
          </CardTitle>
          <CardDescription>
            Automatically update talent management assessments based on appraisal outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-7-2']} />

          {/* Learning Objectives */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Configure automatic Nine-Box performance rating updates</li>
                <li>Understand the score-to-rating mapping logic</li>
                <li>Set up succession readiness level updates</li>
                <li>Implement approval workflows for sensitive talent decisions</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Nine-Box Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Nine-Box Integration
            </h3>
            <p className="text-muted-foreground">
              The Nine-Box integration automatically updates an employee's performance rating on the 
              Nine-Box grid based on their finalized appraisal score. The potential rating remains 
              unchanged, as it requires separate managerial assessment.
            </p>

            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">Performance Rating Mapping</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">3</div>
                    <div className="text-sm text-muted-foreground">Score ≥ 4.0</div>
                    <div className="text-xs">High Performance</div>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">2</div>
                    <div className="text-sm text-muted-foreground">Score 2.5 - 3.9</div>
                    <div className="text-xs">Medium Performance</div>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-red-700 dark:text-red-400">1</div>
                    <div className="text-sm text-muted-foreground">Score &lt; 2.5</div>
                    <div className="text-xs">Low Performance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <WorkflowDiagram 
            title="Nine-Box Update Flow"
            description="How appraisal scores translate to Nine-Box performance ratings"
            diagram={nineBoxDiagram}
          />

          {/* Succession Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Succession Integration
            </h3>
            <p className="text-muted-foreground">
              For employees who are succession candidates, the integration can automatically update 
              their readiness level based on their performance category. This ensures succession 
              plans reflect current performance data.
            </p>

            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">Readiness Level Mapping</h4>
                <div className="space-y-2">
                  {[
                    { category: 'Exceptional', readiness: 'Ready Now', color: 'text-green-600' },
                    { category: 'Exceeds Expectations', readiness: 'Ready in 1 Year', color: 'text-blue-600' },
                    { category: 'Meets Expectations', readiness: 'Ready in 2 Years', color: 'text-amber-600' },
                    { category: 'Needs Improvement', readiness: 'Not Ready', color: 'text-red-600' },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between p-2 bg-background rounded">
                      <span className="font-medium">{item.category}</span>
                      <span className={`${item.color} font-medium`}>→ {item.readiness}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <WorkflowDiagram 
            title="Succession Readiness Update Flow"
            description="How performance categories map to succession readiness levels"
            diagram={successionDiagram}
          />

          {/* Field References */}
          <FieldReferenceTable 
            fields={nineBoxFields} 
            title="Nine-Box Assessment Fields"
          />

          <FieldReferenceTable 
            fields={successionFields} 
            title="Succession Candidate Fields Updated"
          />

          {/* Step by Step */}
          <StepByStep 
            steps={steps}
            title="Configuring Nine-Box Integration"
          />

          {/* Configuration Examples */}
          <ConfigurationExample 
            examples={configExamples}
            title="Integration Rule Examples"
          />

          {/* Business Rules */}
          <BusinessRules 
            rules={businessRules}
            title="Nine-Box & Succession Business Rules"
          />

          {/* Troubleshooting */}
          <TroubleshootingSection 
            items={troubleshootingItems}
            title="Common Issues"
          />

          {/* Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Best Practices</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use approval workflows for succession readiness downgrades to ensure HR review</li>
                <li>Schedule Nine-Box calibration sessions after bulk appraisal finalization</li>
                <li>Consider separate rules for different job levels with different thresholds</li>
                <li>Archive historical assessments for trend analysis and audit compliance</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
