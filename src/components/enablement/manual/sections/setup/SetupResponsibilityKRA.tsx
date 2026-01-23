import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Briefcase, Target, Scale, CheckCircle, Settings } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  StepByStep, 
  FieldReferenceTable,
  BusinessRules,
  ConfigurationExample,
  TroubleshootingSection,
  TipCallout,
  InfoCallout,
  WarningCallout,
  RelatedTopics
} from '../../components';

const SETUP_STEPS = [
  {
    title: 'Navigate to Job Profiles',
    description: 'Access the job responsibility configuration area',
    substeps: [
      'Go to Performance → Setup → Job Profiles',
      'Select the job title to configure',
      'Click on the "Responsibilities" tab'
    ],
    expectedResult: 'Job responsibility list displayed with existing entries'
  },
  {
    title: 'Add or Edit a Responsibility',
    description: 'Create or modify job responsibilities',
    substeps: [
      'Click "Add Responsibility" or edit an existing one',
      'Enter responsibility name and description',
      'Set the weight (percentage of total job score)',
      'Choose assessment mode: auto, kra_based, or hybrid'
    ],
    expectedResult: 'Responsibility created with assessment configuration'
  },
  {
    title: 'Configure KRAs for the Responsibility',
    description: 'Add Key Result Areas with measurable targets',
    substeps: [
      'Click "Manage KRAs" on the responsibility',
      'Add each KRA with name and description',
      'Set target metric and measurement method',
      'Assign weight within the responsibility (must total 100%)',
      'Mark required KRAs that must be rated'
    ],
    expectedResult: 'KRAs configured with weights totaling 100%'
  },
  {
    title: 'Validate Weight Distribution',
    description: 'Ensure all weights are properly configured',
    substeps: [
      'Review responsibility weights (should total 100% for job)',
      'Review KRA weights within each responsibility (must total 100%)',
      'Check for validation warnings',
      'Save configuration when valid'
    ],
    expectedResult: 'All weights validated, configuration saved'
  },
  {
    title: 'Set Sequence Order',
    description: 'Define display order for appraisal forms',
    substeps: [
      'Drag responsibilities to reorder, or set sequence numbers',
      'Reorder KRAs within each responsibility',
      'Save the final ordering'
    ],
    expectedResult: 'Responsibilities and KRAs display in desired order'
  }
];

const FIELDS = [
  { name: 'name', required: true, type: 'Text', description: 'KRA name', validation: 'Max 100 characters' },
  { name: 'description', required: false, type: 'Text', description: 'Detailed description of what is measured', validation: 'Max 500 characters' },
  { name: 'target_metric', required: false, type: 'Text', description: 'Specific target value or outcome', validation: 'E.g., "95% on-time delivery"' },
  { name: 'measurement_method', required: true, type: 'Enum', description: 'How achievement is measured', validation: 'quantitative, qualitative, milestone, percentage, rating_scale' },
  { name: 'weight', required: true, type: 'Decimal', description: 'Weight within responsibility (0-100)', validation: 'All KRA weights must sum to 100' },
  { name: 'sequence_order', required: true, type: 'Integer', description: 'Display order', defaultValue: 'Auto-incremented' },
  { name: 'is_required', required: true, type: 'Boolean', description: 'Whether KRA must be rated', defaultValue: 'true' },
  { name: 'is_active', required: true, type: 'Boolean', description: 'Whether KRA is active', defaultValue: 'true' }
];

const BUSINESS_RULES = [
  { rule: 'KRA weights must total 100%', enforcement: 'System' as const, description: 'Cannot save responsibility if KRA weights do not sum to 100%.' },
  { rule: 'Responsibility weights must total 100%', enforcement: 'System' as const, description: 'All responsibility weights for a job must sum to 100% for accurate scoring.' },
  { rule: 'At least one KRA per responsibility', enforcement: 'System' as const, description: 'Responsibilities with kra_based assessment must have at least one KRA defined.' },
  { rule: 'Required KRAs enforce rating', enforcement: 'System' as const, description: 'When is_required is true, employees and managers must rate the KRA to submit.' },
  { rule: 'Measurement method guides scoring', enforcement: 'Advisory' as const, description: 'Choose the method that best reflects how achievement can be objectively measured.' }
];

const EXAMPLES = [
  {
    title: 'Sales Manager - Revenue KRAs',
    context: 'Quarterly sales target tracking',
    values: [
      { field: 'Responsibility', value: 'Revenue Generation' },
      { field: 'KRA 1', value: 'Achieve Quarterly Revenue Target (50%)' },
      { field: 'KRA 2', value: 'New Account Acquisition (30%)' },
      { field: 'KRA 3', value: 'Pipeline Growth (20%)' },
      { field: 'Measurement Method', value: 'percentage' }
    ],
    outcome: 'Sales performance objectively scored against measurable targets'
  },
  {
    title: 'Software Developer - Delivery KRAs',
    context: 'Sprint-based development metrics',
    values: [
      { field: 'Responsibility', value: 'Software Delivery' },
      { field: 'KRA 1', value: 'On-time Feature Delivery (40%)' },
      { field: 'KRA 2', value: 'Code Quality Score (35%)' },
      { field: 'KRA 3', value: 'Documentation Completeness (25%)' },
      { field: 'Measurement Method', value: 'quantitative' }
    ],
    outcome: 'Technical contributions measured with clear quality gates'
  },
  {
    title: 'Customer Service Lead - Service KRAs',
    context: 'Customer satisfaction metrics',
    values: [
      { field: 'Responsibility', value: 'Customer Satisfaction' },
      { field: 'KRA 1', value: 'CSAT Score Target (45%)' },
      { field: 'KRA 2', value: 'First Call Resolution Rate (35%)' },
      { field: 'KRA 3', value: 'Response Time SLA (20%)' },
      { field: 'Measurement Method', value: 'percentage' }
    ],
    outcome: 'Service quality quantified through customer feedback metrics'
  }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot save - weight validation error', cause: 'KRA weights do not sum to 100%', solution: 'Review all KRA weights and adjust to total exactly 100%. Use the weight calculator tool if available.' },
  { issue: 'KRAs not appearing in appraisal form', cause: 'KRAs may be inactive or responsibility assessment mode is "auto"', solution: 'Check is_active flag on KRAs and verify responsibility assessment_mode is "kra_based" or "hybrid".' },
  { issue: 'Employees cannot rate some KRAs', cause: 'KRAs may have been added after appraisal enrollment', solution: 'KRAs are snapshotted at enrollment. New KRAs apply to future cycles only.' },
  { issue: 'Weight changes not reflected in scores', cause: 'Weight changes apply prospectively', solution: 'In-progress appraisals use weights from enrollment time. New weights apply to new enrollments.' }
];

export function SetupResponsibilityKRA() {
  return (
    <Card id="sec-2-4b">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.4b</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~15 min read
          </Badge>
          <Badge className="gap-1 bg-orange-600 text-white">
            <Users className="h-3 w-3" />
            Admin / Consultant
          </Badge>
          <Badge variant="destructive">Required</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-orange-500" />
          Responsibility & KRA Configuration
        </CardTitle>
        <CardDescription>
          Setting up job responsibilities and Key Result Areas for performance scoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Setup', 'Job Profiles', 'Responsibilities']} />

        <LearningObjectives
          objectives={[
            'Understand the relationship between job responsibilities and KRAs',
            'Configure KRAs with appropriate measurement methods and weights',
            'Validate weight distribution for accurate scoring',
            'Set up required vs optional KRAs for flexible assessment'
          ]}
        />

        {/* Concept Explanation */}
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Responsibilities vs KRAs
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Job Responsibilities</h5>
              <p className="text-muted-foreground">
                High-level accountability areas that define what a role is responsible for. 
                Example: "Revenue Generation" for a Sales Manager.
              </p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Key Result Areas (KRAs)</h5>
              <p className="text-muted-foreground">
                Specific, measurable outcomes within a responsibility. 
                Example: "Achieve 95% of quarterly sales target" under Revenue Generation.
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Modes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Assessment Modes
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { 
                mode: 'Auto', 
                desc: 'Single overall rating for the responsibility. Best for qualitative roles.',
                icon: '🎯'
              },
              { 
                mode: 'KRA-Based', 
                desc: 'Rate each KRA individually. Score calculated from weighted KRA ratings.',
                icon: '📊'
              },
              { 
                mode: 'Hybrid', 
                desc: 'Rate KRAs plus overall responsibility judgment. Most comprehensive.',
                icon: '⚖️'
              }
            ].map((item) => (
              <Card key={item.mode} className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h4 className="font-semibold">{item.mode}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Measurement Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Measurement Methods
          </h3>
          <div className="space-y-2">
            {[
              { method: 'Quantitative', desc: 'Numeric metrics (e.g., sales numbers, units produced)', example: '150 units vs 100 target = 150%' },
              { method: 'Qualitative', desc: 'Behavioral observation (e.g., leadership, communication)', example: 'Demonstrated effective team leadership' },
              { method: 'Milestone', desc: 'Deliverable-based (e.g., project phases completed)', example: '4 of 5 milestones completed' },
              { method: 'Percentage', desc: 'Achievement rate (e.g., 95% of target)', example: '92% customer satisfaction' },
              { method: 'Rating Scale', desc: 'Standard 1-5 proficiency rating', example: 'Level 4 - Exceeds Expectations' }
            ].map((item) => (
              <div key={item.method} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="w-32 font-medium text-sm">{item.method}</div>
                <div className="flex-1 text-sm text-muted-foreground">{item.desc}</div>
                <div className="w-48 text-xs text-muted-foreground italic hidden md:block">{item.example}</div>
              </div>
            ))}
          </div>
        </div>

        <InfoCallout title="Weight Validation">
          The system enforces that all KRA weights within a responsibility must total exactly 100%. 
          Similarly, all responsibility weights for a job must total 100% for proper score calculation.
          The "R" component in CRGV scoring comes from weighted responsibility/KRA ratings.
        </InfoCallout>

        <StepByStep steps={SETUP_STEPS} title="Configuration Steps" />

        <TipCallout title="Start with Job Analysis">
          Before configuring KRAs, conduct a job analysis with hiring managers to identify 
          the 4-6 most critical outcomes for each role. Focus on measurable results that 
          differentiate high performers from average performers.
        </TipCallout>

        <WarningCallout title="Snapshot Behavior">
          KRA configurations are "snapshotted" when an employee is enrolled in an appraisal cycle. 
          Changes made after enrollment only affect future cycles. Plan your KRA structure 
          before launching appraisal cycles.
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="KRA Field Reference" />
        <BusinessRules rules={BUSINESS_RULES} />
        <ConfigurationExample examples={EXAMPLES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-2-job-config', title: 'Job Assessment Configuration' },
            { sectionId: 'sec-3-5', title: 'Goal Rating Process' },
            { sectionId: 'sec-3-5a', title: 'Responsibility/KRA Assessment' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
