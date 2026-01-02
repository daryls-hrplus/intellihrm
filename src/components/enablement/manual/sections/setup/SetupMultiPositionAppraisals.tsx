import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, Users, Briefcase } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  StepByStep, 
  ConfigurationExample,
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  PrerequisiteAlert
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Multi-Position Mode', required: true, type: 'Select', description: 'How multi-position employees are evaluated', defaultValue: 'Aggregate', validation: '—' },
  { name: 'Position Weight Method', required: true, type: 'Select', description: 'How position weights are determined', defaultValue: 'FTE Percentage', validation: '—' },
  { name: 'Primary Position Weight', required: false, type: 'Number', description: 'Weight for primary position in aggregate mode', defaultValue: '60%', validation: 'Min 50%' },
  { name: 'Secondary Position Weight', required: false, type: 'Number', description: 'Weight for secondary position(s)', defaultValue: '40%', validation: 'Sum to 100% with primary' },
  { name: 'Allow Manager Override', required: false, type: 'Boolean', description: 'Whether managers can adjust position weights', defaultValue: 'true', validation: '—' },
  { name: 'Separate Evaluation Mode', required: false, type: 'Boolean', description: 'Create separate appraisals per position', defaultValue: 'false', validation: '—' },
  { name: 'Evaluator Assignment', required: true, type: 'Select', description: 'Who evaluates each position', defaultValue: 'Position Supervisor', validation: '—' },
  { name: 'Competency Source', required: true, type: 'Select', description: 'Which position competencies to use', defaultValue: 'Primary Position', validation: '—' },
  { name: 'Goal Allocation', required: true, type: 'Select', description: 'How goals are distributed across positions', defaultValue: 'Combined', validation: '—' },
  { name: 'Final Score Calculation', required: true, type: 'Select', description: 'How overall score is computed', defaultValue: 'Weighted by FTE', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether multi-position handling is enabled', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Appraisal Cycles',
    description: 'Go to Performance → Setup → Appraisals → Appraisal Cycles',
    expectedResult: 'Appraisal Cycles configuration page displays'
  },
  {
    title: 'Select or Create Cycle',
    description: 'Edit an existing cycle or create a new one',
    expectedResult: 'Cycle configuration form opens'
  },
  {
    title: 'Locate Multi-Position Settings',
    description: 'Navigate to the Multi-Position Configuration section',
    expectedResult: 'Multi-position settings panel visible'
  },
  {
    title: 'Select Evaluation Mode',
    description: 'Choose how multi-position employees will be evaluated',
    substeps: [
      'Aggregate: Single appraisal combining all positions',
      'Separate: Individual appraisal per position',
      'Primary Only: Evaluate only primary position'
    ],
    expectedResult: 'Evaluation mode selected'
  },
  {
    title: 'Configure Position Weights',
    description: 'Set how positions contribute to final score',
    substeps: [
      'FTE Percentage: Use actual FTE allocation',
      'Equal Weight: All positions weighted equally',
      'Custom: Manual weight assignment',
      'Set primary vs. secondary position weights'
    ],
    expectedResult: 'Position weights configured'
  },
  {
    title: 'Set Evaluator Assignment',
    description: 'Determine who evaluates each position',
    substeps: [
      'Position Supervisor: Each position evaluated by its supervisor',
      'Primary Supervisor: Primary manager evaluates all positions',
      'Committee: Multiple evaluators for multi-position employees'
    ],
    expectedResult: 'Evaluator rules configured'
  },
  {
    title: 'Configure Competency Sources',
    description: 'Specify which competencies apply',
    substeps: [
      'Primary Position: Use competencies from primary job',
      'All Positions: Combine competencies from all positions',
      'Weighted: Proportional competencies based on FTE'
    ],
    expectedResult: 'Competency source configured'
  },
  {
    title: 'Configure Goal Allocation',
    description: 'Determine how goals are handled',
    substeps: [
      'Combined: Single goal set for all positions',
      'Position-Specific: Separate goals per position',
      'Weighted: Goals proportional to position FTE'
    ],
    expectedResult: 'Goal allocation configured'
  },
  {
    title: 'Save Configuration',
    description: 'Save the multi-position settings',
    expectedResult: 'Settings saved and applied to cycle'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'FTE-Based Aggregate Evaluation',
    context: 'Employee holds 60% Manager, 40% Specialist role.',
    values: [
      { field: 'Mode', value: 'Aggregate' },
      { field: 'Weight Method', value: 'FTE Percentage' },
      { field: 'Evaluator', value: 'Position Supervisor (each supervisor rates their portion)' },
      { field: 'Final Score', value: 'Weighted by FTE (60/40 split)' }
    ],
    outcome: 'Single appraisal with proportional contribution from each role.'
  },
  {
    title: 'Separate Evaluations per Position',
    context: 'Distinct roles requiring independent assessment.',
    values: [
      { field: 'Mode', value: 'Separate' },
      { field: 'Evaluator', value: 'Position Supervisor' },
      { field: 'Competencies', value: 'Position-Specific' },
      { field: 'Goals', value: 'Position-Specific' }
    ],
    outcome: 'Two distinct appraisals, each with own score and development plan.'
  },
  {
    title: 'Primary Position Focus',
    context: 'Secondary role is minimal time commitment.',
    values: [
      { field: 'Mode', value: 'Aggregate' },
      { field: 'Weight Method', value: 'Custom (80/20)' },
      { field: 'Competencies', value: 'Primary Position Only' },
      { field: 'Goals', value: 'Combined with primary focus' }
    ],
    outcome: 'Evaluation emphasizes primary role while acknowledging secondary.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Position weights must sum to 100%', enforcement: 'System' as const, description: 'Combined weight of all positions for an employee must equal 100%.' },
  { rule: 'Each position requires assigned evaluator', enforcement: 'System' as const, description: 'Separate evaluation mode requires evaluator for each position.' },
  { rule: 'FTE changes during cycle handled gracefully', enforcement: 'System' as const, description: 'If FTE allocation changes mid-cycle, weights are prorated based on time in each allocation.' },
  { rule: 'Separate evaluations create distinct records', enforcement: 'System' as const, description: 'Separate mode creates independent appraisal records per position for compliance and reporting.' },
  { rule: 'Primary position must be designated', enforcement: 'Policy' as const, description: 'For aggregate mode, one position must be marked as primary for competency and goal defaulting.' },
  { rule: 'Review multi-position configurations annually', enforcement: 'Advisory' as const, description: 'Validate multi-position settings align with current organizational structure.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Multi-position employee not receiving appraisal',
    cause: 'Position assignments or FTE not configured correctly.',
    solution: 'Verify employee has correct position assignments in workforce module. Confirm FTE percentages sum to 100%. Check eligibility criteria include multi-position employees.'
  },
  {
    issue: 'Wrong evaluator assigned to position',
    cause: 'Supervisor assignment not updated for secondary position.',
    solution: 'Review position supervisor assignments. Update reporting relationships in workforce module. Regenerate participant list.'
  },
  {
    issue: 'Competencies missing for secondary position',
    cause: 'Competency source set to Primary Only.',
    solution: 'Change competency source setting to All Positions or Weighted. Verify competencies are assigned to secondary job profile.'
  },
  {
    issue: 'Final score calculation incorrect',
    cause: 'Weight configuration or calculation method mismatch.',
    solution: 'Verify position weights are correctly configured. Check final score calculation method. Review individual position scores for accuracy.'
  }
];

export function SetupMultiPositionAppraisals() {
  return (
    <Card id="sec-2-12">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.12</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~15 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl">Multi-Position Appraisals Setup</CardTitle>
        <CardDescription>
          Configure evaluations for employees holding multiple positions with different supervisors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Appraisal Cycles', 'Multi-Position']} />

        <LearningObjectives
          objectives={[
            'Understand aggregate vs. separate evaluation modes',
            'Configure position weights based on FTE allocation',
            'Assign appropriate evaluators for each position',
            'Handle competency and goal allocation across positions'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Workforce positions configured with FTE allocations',
            'Position supervisors assigned in org structure',
            'Appraisal cycles configured (Section 2.6)',
            'Understanding of multi-position employee population'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Multi-Position Appraisals?</h4>
          <p className="text-muted-foreground">
            Multi-Position Appraisals address the evaluation needs of employees who hold more than 
            one position—common in matrix organizations, shared services, or employees with split 
            roles. Rather than evaluating against only one role, the system can aggregate 
            performance across positions with appropriate weighting, or create separate evaluations 
            per position. This ensures fair, comprehensive assessment that reflects the full scope 
            of an employee's contributions.
          </p>
        </div>

        <div className="p-4 border-l-4 border-l-violet-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Common Scenarios</h4>
              <p className="text-sm text-foreground">
                Multi-position handling is essential for: matrix organizations with dotted-line 
                reporting, employees with split FTE across departments, project-based assignments 
                alongside core roles, and interim or acting positions during transitions.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.12.1: Multi-Position configuration in Appraisal Cycle settings"
          alt="Multi-Position Appraisals configuration page"
        />

        <StepByStep steps={STEPS} title="Configuring Multi-Position Appraisals: Step-by-Step" />

        <ScreenshotPlaceholder
          caption="Figure 2.12.2: Position weight allocation for multi-position employee"
          alt="Position weight configuration dialog"
        />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}
