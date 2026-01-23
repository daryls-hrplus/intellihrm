import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Clock, Users, CheckCircle, Target, FileText, Upload, User, UserCheck } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  StepByStep, 
  FieldReferenceTable,
  BusinessRules,
  ScreenshotPlaceholder,
  TipCallout,
  InfoCallout,
  WarningCallout,
  TroubleshootingSection,
  RelatedTopics
} from '../../components';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';

const SELF_ASSESSMENT_STEPS = [
  {
    title: 'Access Responsibilities Section',
    description: 'Navigate to job responsibilities in your appraisal',
    substeps: [
      'Open your appraisal from ESS → My Appraisals',
      'Click on the "Responsibilities" tab or scroll to that section',
      'Review the list of job responsibilities assigned to your role'
    ],
    expectedResult: 'Responsibilities section visible with your assigned KRAs'
  },
  {
    title: 'Expand a Responsibility',
    description: 'View the KRAs within each responsibility',
    substeps: [
      'Click on a responsibility card to expand it',
      'Review the KRAs listed with their targets and weights',
      'Note the measurement method for each KRA'
    ],
    expectedResult: 'KRAs displayed with target metrics and weights'
  },
  {
    title: 'Rate Each KRA',
    description: 'Provide self-ratings based on your achievement',
    substeps: [
      'For each KRA, select the rating that reflects your achievement',
      'Reference the target metric when determining your rating',
      'Consider quantitative evidence (numbers, percentages) where applicable'
    ],
    expectedResult: 'All KRAs rated with appropriate scores'
  },
  {
    title: 'Add Achievement Notes',
    description: 'Document your accomplishments for each KRA',
    substeps: [
      'Enter specific achievements in the comments field',
      'Include measurable outcomes (e.g., "Achieved 112% of target")',
      'Note any challenges overcome or context needed'
    ],
    expectedResult: 'Achievement documentation completed for each KRA'
  },
  {
    title: 'Upload Supporting Evidence',
    description: 'Attach documents that prove your achievement',
    substeps: [
      'Click "Add Evidence" for relevant KRAs',
      'Upload reports, dashboards, certificates, or acknowledgments',
      'Add descriptions explaining each attachment'
    ],
    expectedResult: 'Evidence attached to support your ratings'
  },
  {
    title: 'Review Responsibility Score',
    description: 'Check the calculated score before moving on',
    substeps: [
      'Review the weighted score displayed for the responsibility',
      'Verify all required KRAs are rated',
      'Proceed to the next responsibility or section'
    ],
    expectedResult: 'Responsibility score calculated and displayed'
  }
];

const MANAGER_ASSESSMENT_STEPS = [
  {
    title: 'Review Employee Self-Ratings',
    description: 'Understand the employee\'s perspective first',
    substeps: [
      'Open the employee\'s appraisal from MSS → Team Appraisals',
      'Navigate to the Responsibilities section',
      'Review each KRA self-rating and the evidence provided'
    ],
    expectedResult: 'Clear understanding of employee\'s self-assessment'
  },
  {
    title: 'Evaluate Each KRA',
    description: 'Provide your rating based on observed performance',
    substeps: [
      'Compare actual results against the target metric',
      'Rate each KRA based on evidence and observation',
      'Note where your rating differs from self-assessment'
    ],
    expectedResult: 'All KRAs rated from manager perspective'
  },
  {
    title: 'Add Manager Comments',
    description: 'Document rationale for your ratings',
    substeps: [
      'Provide specific examples supporting your rating',
      'Acknowledge achievements and highlight development areas',
      'Use STAR method for behavioral observations'
    ],
    expectedResult: 'Manager comments added with clear rationale'
  },
  {
    title: 'Prepare for Discussion',
    description: 'Note items to discuss in appraisal interview',
    substeps: [
      'Flag any significant rating gaps (2+ points difference)',
      'Prepare examples for both achievements and development areas',
      'Plan constructive feedback for improvement areas'
    ],
    expectedResult: 'Ready for productive performance discussion'
  }
];

const FIELDS = [
  { name: 'self_rating', required: true, type: 'Integer', description: 'Employee\'s KRA rating (1-5)', validation: 'Required for submission' },
  { name: 'manager_rating', required: true, type: 'Integer', description: 'Manager\'s KRA rating (1-5)', validation: 'Required for finalization' },
  { name: 'self_comments', required: false, type: 'Text', description: 'Employee achievement notes', validation: 'Max 1000 characters' },
  { name: 'manager_comments', required: false, type: 'Text', description: 'Manager evaluation comments', validation: 'Max 1000 characters' },
  { name: 'achievement_notes', required: false, type: 'Text', description: 'Specific accomplishments documented', validation: 'Max 2000 characters' },
  { name: 'evidence_urls', required: false, type: 'Array', description: 'Uploaded supporting documents', validation: 'Max 5 files per KRA' },
  { name: 'weight_adjusted_score', required: false, type: 'Decimal', description: 'Calculated score × weight', defaultValue: 'System calculated' },
  { name: 'status', required: true, type: 'Enum', description: 'Rating progress state', defaultValue: 'pending', validation: 'pending, self_rated, manager_rated, completed' }
];

const BUSINESS_RULES = [
  { rule: 'All required KRAs must be rated', enforcement: 'System' as const, description: 'Cannot submit if any required KRA is unrated. Check is_required flag on KRA configuration.' },
  { rule: 'Weight-adjusted scoring', enforcement: 'System' as const, description: 'Each KRA score is multiplied by its weight percentage to calculate responsibility score.' },
  { rule: 'Score aggregates to R component', enforcement: 'System' as const, description: 'Responsibility scores feed into the "R" component of the CRGV overall score.' },
  { rule: 'Evidence encouraged for high ratings', enforcement: 'Advisory' as const, description: 'Ratings of 4 or 5 should be supported by concrete evidence for calibration credibility.' },
  { rule: 'KRA snapshots frozen at enrollment', enforcement: 'System' as const, description: 'The KRA structure from enrollment is used throughout the cycle. Mid-cycle KRA changes apply to future cycles.' }
];

const TROUBLESHOOTING = [
  { issue: 'No KRAs appearing for a responsibility', cause: 'Assessment mode may be "auto" or KRAs inactive', solution: 'Check job profile configuration. Verify assessment_mode is "kra_based" or "hybrid" and KRAs are active.' },
  { issue: 'Cannot submit - missing ratings', cause: 'Required KRAs not rated', solution: 'Expand each responsibility and rate all KRAs marked as required. Check for any collapsed sections.' },
  { issue: 'Weights not totaling 100%', cause: 'Configuration issue in job profile', solution: 'Contact HR Admin to fix KRA weights. In-progress appraisals will use current snapshot weights.' },
  { issue: 'Evidence upload failed', cause: 'File size or format restriction', solution: 'Ensure files are under 5MB and in supported formats (PDF, DOC, XLS, JPG, PNG).' }
];

export function WorkflowResponsibilityAssessment() {
  return (
    <Card id="sec-3-5a">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.5a</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge className="gap-1 bg-orange-600 text-white">
            <Users className="h-3 w-3" />
            Employee / Manager
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-orange-500" />
          Responsibility/KRA Assessment
        </CardTitle>
        <CardDescription>
          Rating job responsibilities and Key Result Areas during the appraisal process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Appraisals', 'Responsibility Assessment']} />

        <LearningObjectives
          objectives={[
            'Navigate the responsibility/KRA rating interface',
            'Rate KRAs with appropriate evidence and documentation',
            'Understand how KRA weights affect responsibility scores',
            'Complete both self-assessment and manager evaluation for responsibilities'
          ]}
        />

        {/* Workflow Diagram */}
        <WorkflowDiagram
          title="Responsibility/KRA Assessment Flow"
          description="Process for rating job responsibilities and individual KRAs"
          diagram={`flowchart TD
    subgraph Employee["👤 Employee Self-Assessment"]
        A[Review Job Responsibilities] --> B[Expand Responsibility]
        B --> C[View KRAs & Targets]
        C --> D[Rate Each KRA]
        D --> E[Add Achievement Notes]
        E --> F[Upload KRA Evidence]
        F --> G{More KRAs?}
        G -->|Yes| D
        G -->|No| H{More Responsibilities?}
        H -->|Yes| B
        H -->|No| I[Review R Score]
    end
    
    subgraph Manager["👔 Manager Evaluation"]
        J[Review Self-Ratings] --> K[Compare to Targets]
        K --> L[Rate Each KRA]
        L --> M[Add Manager Comments]
        M --> N[Flag Discussion Items]
    end
    
    I --> J
    N --> O[Calculate Final R Score]`}
        />

        {/* CRGV Context */}
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            The "R" in CRGV
          </h4>
          <p className="text-sm text-muted-foreground">
            <strong>Responsibilities</strong> form the "R" component of the CRGV appraisal model. 
            KRA ratings are weighted and aggregated to produce the responsibility score, 
            which typically accounts for <strong>20-30%</strong> of the overall appraisal score. 
            This component measures <em>how well</em> you perform the core functions of your role.
          </p>
        </div>

        {/* Dual Perspective Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold">Employee Responsibility</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Rate each KRA honestly based on achievement</li>
              <li>Provide evidence with metrics where possible</li>
              <li>Document challenges and context</li>
              <li>Complete before manager evaluation window</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">Manager Responsibility</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Review self-ratings and evidence first</li>
              <li>Rate based on observed performance vs targets</li>
              <li>Provide constructive feedback in comments</li>
              <li>Flag significant gaps for interview discussion</li>
            </ul>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 3.5a.1: KRA rating interface showing target metrics, rating selector, and evidence upload"
          alt="KRA assessment interface"
        />

        {/* Employee Self-Assessment Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            For Employees: Self-Assessment
          </h3>
          <StepByStep steps={SELF_ASSESSMENT_STEPS} title="Self-Assessment Steps" />
        </div>

        <TipCallout title="Quantify Your Achievements">
          Whenever possible, include numbers: percentages, dollar amounts, time saved, 
          customer scores. "Exceeded target by 15%" is more compelling than "performed well."
        </TipCallout>

        {/* Manager Evaluation Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            For Managers: Evaluation
          </h3>
          <StepByStep steps={MANAGER_ASSESSMENT_STEPS} title="Manager Evaluation Steps" />
        </div>

        <ScreenshotPlaceholder
          caption="Figure 3.5a.2: Manager view showing self-rating vs manager rating comparison"
          alt="Manager KRA comparison view"
        />

        <InfoCallout title="Weight Calculation">
          Each KRA score is multiplied by its weight percentage. For example, if a KRA has 
          40% weight and receives a rating of 4, it contributes 1.6 points (4 × 0.40) to the 
          responsibility score. All weighted KRA scores are summed for the responsibility total.
        </InfoCallout>

        <WarningCallout title="High Ratings Need Evidence">
          Ratings of 4 (Exceeds Expectations) or 5 (Exceptional) are scrutinized during calibration. 
          Always support high ratings with concrete evidence—documents, metrics, or specific examples. 
          Unsupported high ratings may be adjusted during calibration.
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="KRA Rating Fields" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-2-4b', title: 'Responsibility & KRA Configuration' },
            { sectionId: 'sec-3-4', title: 'Self-Assessment Process' },
            { sectionId: 'sec-3-5', title: 'Goal Rating Process' },
            { sectionId: 'sec-3-6', title: 'Competency Assessment' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
