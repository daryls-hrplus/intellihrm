import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, AlertTriangle, Lightbulb, Settings, Percent, Target } from 'lucide-react';
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
  { name: 'Job Title', required: true, type: 'Text', description: 'Name of the job being validated', defaultValue: 'From job master', validation: '—' },
  { name: 'Assessment Mode', required: true, type: 'Enum', description: 'How responsibilities are evaluated: auto, kra_based, or hybrid', defaultValue: 'auto', validation: 'Valid enum value' },
  { name: 'Responsibility Weight Total', required: true, type: 'Percentage', description: 'Sum of all responsibility weights for the job', defaultValue: '0%', validation: 'Must equal 100%' },
  { name: 'KRA Weight Total', required: true, type: 'Percentage', description: 'Sum of KRA weights within each responsibility', defaultValue: '0%', validation: 'Must equal 100% per responsibility' },
  { name: 'Validation Status', required: true, type: 'Status', description: 'Whether the job configuration is complete for appraisals', defaultValue: 'Incomplete', validation: 'Valid/Warning/Error' },
  { name: 'Issue Count', required: false, type: 'Number', description: 'Number of configuration issues found', defaultValue: '0', validation: '≥ 0' },
];

const STEPS = [
  {
    title: 'Navigate to Job Assessment Configuration',
    description: 'Go to Performance → Setup → Appraisals → Job Assessment Config',
    expectedResult: 'Job validation panel displays with list of all active jobs'
  },
  {
    title: 'Review Job List and Status',
    description: 'Scan the job list for validation status badges',
    substeps: [
      'Green: Job is ready for appraisal evaluation',
      'Yellow: Job has minor issues (weights not optimized)',
      'Red: Job has critical issues (missing responsibilities or weights ≠ 100%)'
    ],
    expectedResult: 'Understanding of which jobs need attention'
  },
  {
    title: 'Expand Job Details',
    description: 'Click on a job row to see detailed responsibility and KRA breakdown',
    substeps: [
      'View each responsibility and its assigned weight',
      'View KRAs under each responsibility (if kra_based mode)',
      'Check weight totals for each level'
    ],
    expectedResult: 'Detailed view of job assessment structure'
  },
  {
    title: 'Understand Assessment Modes',
    description: 'Review the assessment mode for each job',
    substeps: [
      'Auto: System calculates responsibility scores from competency alignment',
      'KRA-Based: Managers rate specific KRAs, rolled up to responsibilities',
      'Hybrid: Combines competency-based and KRA-based scoring'
    ],
    expectedResult: 'Understanding of how each job will be evaluated'
  },
  {
    title: 'Navigate to Fix Issues',
    description: 'Click "Edit Job" to navigate to the Workforce module for corrections',
    substeps: [
      'Add missing responsibilities if total is 0%',
      'Adjust responsibility weights to sum to 100%',
      'For KRA-based jobs, ensure each responsibility has KRAs totaling 100%'
    ],
    expectedResult: 'Direct navigation to job management for corrections'
  },
  {
    title: 'Verify Corrections',
    description: 'Return to Job Assessment Config to confirm issues resolved',
    substeps: [
      'Job should now show green status',
      'Weight totals should display 100%',
      'Issue count should be 0'
    ],
    expectedResult: 'Job validated and ready for appraisal cycles'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Sales Manager - KRA-Based Assessment',
    context: 'Job with clear measurable outcomes evaluated through specific KRAs.',
    values: [
      { field: 'Assessment Mode', value: 'kra_based' },
      { field: 'Revenue Generation (40%)', value: 'KRAs: Quota Attainment (60%), Pipeline Growth (40%)' },
      { field: 'Team Leadership (35%)', value: 'KRAs: Team Retention (50%), Coaching Hours (30%), Team Quota (20%)' },
      { field: 'Client Relationships (25%)', value: 'KRAs: NPS Score (70%), Account Expansion (30%)' }
    ],
    outcome: 'Managers rate specific KRAs; system calculates responsibility scores automatically.'
  },
  {
    title: 'Software Engineer - Auto Assessment',
    context: 'Technical role where competencies drive performance evaluation.',
    values: [
      { field: 'Assessment Mode', value: 'auto' },
      { field: 'Technical Delivery (50%)', value: 'Linked competencies: Problem Solving, Code Quality' },
      { field: 'Collaboration (30%)', value: 'Linked competencies: Communication, Teamwork' },
      { field: 'Innovation (20%)', value: 'Linked competencies: Creativity, Technical Leadership' }
    ],
    outcome: 'Responsibility scores calculated from linked competency ratings.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Responsibility weights must sum to 100%', enforcement: 'System' as const, description: 'System validates that all responsibility weights for a job total exactly 100%. Jobs with other totals cannot be used in appraisals.' },
  { rule: 'KRA weights must sum to 100% per responsibility', enforcement: 'System' as const, description: 'When using KRA-based assessment, each responsibility\'s KRAs must total 100% for proper score calculation.' },
  { rule: 'At least one responsibility required', enforcement: 'System' as const, description: 'Jobs without responsibilities cannot be evaluated. System flags these as critical errors.' },
  { rule: 'Assessment mode determines evaluation UI', enforcement: 'System' as const, description: 'The selected mode changes the manager evaluation form: auto shows competencies, kra_based shows KRAs.' },
  { rule: 'Inactive jobs excluded from validation', enforcement: 'System' as const, description: 'Only active jobs with assigned employees are validated. Inactive jobs are not shown.' },
  { rule: 'Changes require template refresh', enforcement: 'Policy' as const, description: 'If job structure changes mid-cycle, affected participants may need form template refresh.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Job shows 0% total weight',
    cause: 'No responsibilities have been assigned to the job.',
    solution: 'Navigate to Workforce → Jobs → Edit Job to add responsibilities with appropriate weights.'
  },
  {
    issue: 'Weights sum to more than 100%',
    cause: 'Multiple responsibilities have been assigned weights that exceed 100% total.',
    solution: 'Edit the job and reduce individual responsibility weights until total equals 100%.'
  },
  {
    issue: 'KRA weights showing errors',
    cause: 'Within a responsibility, KRA weights do not total 100%.',
    solution: 'Edit the responsibility and adjust KRA weights to sum to exactly 100%.'
  },
  {
    issue: 'Job not appearing in list',
    cause: 'Job may be inactive or have no employees assigned.',
    solution: 'Check job status in Workforce module. Only active jobs with at least one employee appear in this panel.'
  },
  {
    issue: '"Edit Job" button disabled',
    cause: 'User lacks permission to modify job definitions.',
    solution: 'Contact Workforce Administrator to request job editing permissions or have them make the corrections.'
  }
];

export function SetupJobAssessmentConfig() {
  return (
    <Card id="sec-2-job-config">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.1b</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl">Job Assessment Configuration</CardTitle>
        <CardDescription>
          Validate job responsibility weights and KRA structures for accurate appraisal scoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Job Assessment Config']} />

        <LearningObjectives
          objectives={[
            'Understand responsibility and KRA weight requirements for appraisals',
            'Identify jobs with configuration issues using the validation panel',
            'Navigate to job management to fix weight distribution problems',
            'Differentiate between auto, kra_based, and hybrid assessment modes'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Jobs created in Workforce module with responsibilities defined',
            'Understanding of KRAs and responsibility-based evaluation'
          ]}
        />

        {/* What is Job Assessment Config */}
        <div>
          <h4 className="font-medium mb-2">What is Job Assessment Configuration?</h4>
          <p className="text-muted-foreground">
            The Job Assessment Configuration panel validates that each job in your organization has properly 
            weighted responsibilities and KRAs for accurate performance scoring. During appraisals, the 
            overall "Responsibilities" component score is calculated by weighting individual responsibility 
            ratings—<strong>if those weights don't sum to 100%, scores will be incorrect</strong>.
          </p>
        </div>

        <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Why Weight Validation Matters</h4>
              <p className="text-sm text-foreground">
                If a job has three responsibilities weighted at 30%, 30%, and 30% (total: 90%), the calculated 
                responsibility score will only account for 90% of possible points. This creates unfair 
                comparisons across jobs and impacts downstream processes like Nine-Box placement and 
                compensation planning. Always ensure weights total exactly 100%.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.1b.1: Job Assessment Configuration panel showing job validation status and weight breakdowns"
          alt="Job Assessment Config panel with job list and status indicators"
        />

        {/* Assessment Modes Explained */}
        <div>
          <h4 className="font-medium mb-3">Assessment Modes</h4>
          <p className="text-muted-foreground mb-4">
            Each job can be configured with one of three assessment modes that determine how the 
            Responsibilities component score is calculated:
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                  <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">Auto</span>
                <Badge variant="outline" className="ml-auto">Default</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Responsibility scores are calculated from linked competency ratings. Best for roles 
                where behavioral competencies directly reflect job performance.
              </p>
              <p className="text-xs text-muted-foreground italic">
                Example: Software Engineer, HR Coordinator
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900/30">
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium">KRA-Based</span>
                <Badge variant="default" className="ml-auto">Recommended</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Managers rate specific Key Result Areas within each responsibility. Scores roll up 
                mathematically. Best for results-oriented roles.
              </p>
              <p className="text-xs text-muted-foreground italic">
                Example: Sales Manager, Operations Director
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                  <Percent className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">Hybrid</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Combines competency-based and KRA-based scoring. Some responsibilities use competencies, 
                others use KRAs. Requires careful weight balancing.
              </p>
              <p className="text-xs text-muted-foreground italic">
                Example: Product Manager, Clinical Supervisor
              </p>
            </div>
          </div>
        </div>

        {/* Weight Validation Example */}
        <div>
          <h4 className="font-medium mb-3">Weight Validation Example</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Responsibility</th>
                  <th className="text-center p-3 font-medium">Weight</th>
                  <th className="text-left p-3 font-medium">KRAs (if applicable)</th>
                  <th className="text-center p-3 font-medium">KRA Weight</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3" rowSpan={2}>Revenue Generation</td>
                  <td className="p-3 text-center" rowSpan={2}>40%</td>
                  <td className="p-3">Quota Attainment</td>
                  <td className="p-3 text-center">60%</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">Pipeline Growth</td>
                  <td className="p-3 text-center">40%</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-3" rowSpan={2}>Team Leadership</td>
                  <td className="p-3 text-center" rowSpan={2}>35%</td>
                  <td className="p-3">Team Retention</td>
                  <td className="p-3 text-center">50%</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-3">Coaching Completion</td>
                  <td className="p-3 text-center">50%</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">Client Relationships</td>
                  <td className="p-3 text-center">25%</td>
                  <td className="p-3">NPS Score</td>
                  <td className="p-3 text-center">100%</td>
                </tr>
                <tr className="border-t bg-green-50 dark:bg-green-950/30 font-medium">
                  <td className="p-3">Total</td>
                  <td className="p-3 text-center text-green-600">100% ✓</td>
                  <td className="p-3 text-muted-foreground" colSpan={2}>Each responsibility KRAs total 100% ✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <StepByStep steps={STEPS} title="Validating Job Configuration: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <Separator />

        {/* Cross-Module Impact */}
        <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Cross-Module Integration</h4>
              <p className="text-sm text-foreground mt-1">
                Job Assessment Configuration connects the Workforce module to Performance:
              </p>
              <ul className="mt-2 text-sm space-y-1 text-foreground">
                <li>• <strong>Workforce:</strong> Define responsibilities and KRAs in job profiles</li>
                <li>• <strong>Performance:</strong> Validate weights here before launching cycles</li>
                <li>• <strong>Evaluation:</strong> Managers see the configured structure when rating</li>
                <li>• <strong>Analytics:</strong> Responsibility scores feed into overall CRGV calculation</li>
              </ul>
            </div>
          </div>
        </div>

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />

        <Separator />

        {/* Best Practices */}
        <div>
          <h4 className="font-medium mb-3">Best Practices</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Validate job weights annually as part of cycle preparation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use KRA-based assessment for sales, operations, and other measurable roles</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Involve hiring managers when defining responsibility weights for new jobs</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Document weight rationale for audit and calibration discussions</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
