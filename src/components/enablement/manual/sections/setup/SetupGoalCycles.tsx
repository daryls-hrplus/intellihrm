import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
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
  { name: 'Cycle Name', required: true, type: 'Text', description: 'Display name for the goal cycle', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Code', required: true, type: 'Text', description: 'Unique identifier for integrations', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Start Date', required: true, type: 'Date', description: 'When goal setting period begins', defaultValue: '—', validation: 'Must be future or current date' },
  { name: 'End Date', required: true, type: 'Date', description: 'When goal cycle concludes', defaultValue: '—', validation: 'Must be after start date' },
  { name: 'Goal Setting Deadline', required: true, type: 'Date', description: 'Last date employees can submit goals', defaultValue: '30 days from start', validation: 'Must be within cycle dates' },
  { name: 'Mid-Cycle Review Date', required: false, type: 'Date', description: 'Optional checkpoint for progress review', defaultValue: 'None', validation: 'Must be within cycle dates' },
  { name: 'Cycle Type', required: true, type: 'Select', description: 'Annual, Semi-Annual, Quarterly, or Custom', defaultValue: 'Annual', validation: 'From predefined list' },
  { name: 'Linked Appraisal Cycle', required: false, type: 'Reference', description: 'Appraisal cycle that will evaluate these goals', defaultValue: 'None', validation: 'Must be active cycle' },
  { name: 'Department Scope', required: false, type: 'Multi-select', description: 'Limit cycle to specific departments', defaultValue: 'All departments', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether cycle is currently active', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Goal Cycles',
    description: 'Go to Performance → Setup → Goals → Goal Cycles',
    expectedResult: 'Goal Cycles management page displays with existing cycles'
  },
  {
    title: 'Click "Add Goal Cycle"',
    description: 'Click the primary action button to create a new cycle',
    expectedResult: 'Goal Cycle creation form opens'
  },
  {
    title: 'Enter Cycle Details',
    description: 'Provide basic cycle information',
    substeps: [
      'Name: Enter descriptive name (e.g., "FY2024 Annual Goals")',
      'Code: Enter unique identifier or accept auto-generated',
      'Cycle Type: Select the duration type (Annual, Quarterly, etc.)'
    ],
    expectedResult: 'Basic information captured'
  },
  {
    title: 'Set Cycle Dates',
    description: 'Define the timeline for the goal cycle',
    substeps: [
      'Start Date: When employees can begin goal setting',
      'End Date: When the cycle concludes',
      'Goal Setting Deadline: Last day for goal submission',
      'Mid-Cycle Review Date: Optional checkpoint date'
    ],
    expectedResult: 'Timeline established with all key dates'
  },
  {
    title: 'Configure Scope',
    description: 'Define which employees are included',
    substeps: [
      'Select departments if limiting scope',
      'Leave empty to include all active employees',
      'Consider employee eligibility criteria'
    ],
    expectedResult: 'Participant scope defined'
  },
  {
    title: 'Link to Appraisal (Optional)',
    description: 'Connect this goal cycle to an appraisal cycle for evaluation',
    substeps: [
      'Select the appraisal cycle that will assess these goals',
      'Verify date alignment between cycles',
      'Goals will automatically populate appraisal forms'
    ],
    expectedResult: 'Goal-appraisal linkage established'
  },
  {
    title: 'Save and Launch',
    description: 'Save the cycle and make it active',
    expectedResult: 'Cycle created and visible to eligible employees'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Annual Goal Cycle',
    context: 'Standard yearly goal setting aligned with fiscal year.',
    values: [
      { field: 'Cycle Type', value: 'Annual' },
      { field: 'Start Date', value: 'January 1' },
      { field: 'End Date', value: 'December 31' },
      { field: 'Goal Setting Deadline', value: 'January 31' },
      { field: 'Mid-Cycle Review', value: 'July 15' }
    ],
    outcome: 'Full-year goal cycle with mid-year checkpoint for progress review.'
  },
  {
    title: 'Quarterly OKR Cycle',
    context: 'Agile organizations using quarterly objectives.',
    values: [
      { field: 'Cycle Type', value: 'Quarterly' },
      { field: 'Duration', value: '3 months' },
      { field: 'Goal Setting Deadline', value: 'Week 1' },
      { field: 'Linked Appraisal', value: 'None (tracked separately)' }
    ],
    outcome: 'Rapid iteration with quarterly goal refresh and review.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Only one active annual cycle per department', enforcement: 'System' as const, description: 'Prevents overlapping goal cycles that could confuse employees.' },
  { rule: 'Goal setting deadline must precede mid-cycle date', enforcement: 'System' as const, description: 'Goals must be finalized before review checkpoints.' },
  { rule: 'Linked appraisal dates must overlap goal cycle', enforcement: 'System' as const, description: 'Ensures goals are evaluated within the appropriate time frame.' },
  { rule: 'Notify employees 2 weeks before deadlines', enforcement: 'Policy' as const, description: 'System sends automatic reminders to prompt action.' },
  { rule: 'Align with organizational planning calendar', enforcement: 'Advisory' as const, description: 'Coordinate goal cycles with strategic planning and budget cycles.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Employees cannot see goal cycle',
    cause: 'Employee not in scope (department filter) or employment status not active.',
    solution: 'Verify cycle scope includes the employee\'s department. Check employment status in Core HR.'
  },
  {
    issue: 'Goals not appearing in appraisal',
    cause: 'Goal cycle not linked to appraisal cycle, or link dates misaligned.',
    solution: 'Edit goal cycle to link appropriate appraisal cycle. Verify date ranges overlap correctly.'
  },
  {
    issue: 'Cannot extend goal setting deadline',
    cause: 'Deadline has already passed or cycle is locked.',
    solution: 'HR Admin can unlock cycle and modify deadline. Consider communication to affected employees.'
  }
];

export function SetupGoalCycles() {
  return (
    <Card id="sec-2-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.6</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~10 min read
          </Badge>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Per cycle
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Goal Cycles
        </CardTitle>
        <CardDescription>
          Create and manage goal setting periods with deadlines and appraisal linkages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Goals', 'Goal Cycles']} />

        <LearningObjectives
          objectives={[
            'Understand goal cycle types and their use cases',
            'Create goal cycles with appropriate timelines',
            'Link goal cycles to appraisal cycles for evaluation',
            'Configure scope and participant eligibility'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Organizational calendar and fiscal year defined',
            'Department structure configured in Core HR',
            'Understanding of goal setting timeline requirements'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Goal Cycles?</h4>
          <p className="text-muted-foreground">
            Goal cycles define the time periods during which employees set, track, and achieve objectives. 
            Each cycle includes key dates for goal submission, progress reviews, and final evaluation. 
            Goal cycles can be linked to appraisal cycles to ensure goal achievement is factored into 
            performance ratings.
          </p>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.6.1: Goal Cycles list showing active and upcoming cycles"
          alt="Goal Cycles management page"
        />

        <StepByStep steps={STEPS} title="Creating a Goal Cycle: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}
