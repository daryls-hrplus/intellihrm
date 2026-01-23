import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, Users, CheckCircle, Star, User, UserCheck } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  StepByStep, 
  BusinessRules,
  ScreenshotPlaceholder,
  TipCallout,
  InfoCallout,
  RelatedTopics
} from '../../components';

const SELF_ASSESSMENT_STEPS = [
  {
    title: 'Access Values Section',
    description: 'Navigate to the Values tab in your appraisal form',
    substeps: [
      'Open your appraisal from My Performance → Appraisals',
      'Click on the "Values" tab or scroll to Values section',
      'Review the company values listed for assessment'
    ],
    expectedResult: 'Values section visible with rating options'
  },
  {
    title: 'Review Behavioral Indicators',
    description: 'For each value, review the behavioral examples',
    substeps: [
      'Click on a value to expand behavioral indicators',
      'Read descriptions for each rating level (1-5)',
      'Consider how your behaviors align with each level'
    ],
    expectedResult: 'Clear understanding of rating criteria'
  },
  {
    title: 'Rate Yourself on Each Value',
    description: 'Select the rating that best reflects your behaviors',
    substeps: [
      'Click the rating that matches your typical behavior',
      'Add optional comments with specific examples',
      'Repeat for each company value'
    ],
    expectedResult: 'All values self-assessed with ratings'
  },
  {
    title: 'Submit Self-Assessment',
    description: 'Complete the values self-assessment',
    substeps: [
      'Review all ratings before submission',
      'Ensure comments support your ratings',
      'Click Save or Submit as appropriate'
    ],
    expectedResult: 'Values self-assessment recorded'
  }
];

const MANAGER_ASSESSMENT_STEPS = [
  {
    title: 'Review Employee Self-Assessment',
    description: 'View how the employee rated themselves on values',
    substeps: [
      'Open the employee\'s appraisal in Manager Self-Service',
      'Navigate to the Values section',
      'Review employee self-ratings and comments'
    ],
    expectedResult: 'Understanding of employee\'s self-perception'
  },
  {
    title: 'Assess Each Value',
    description: 'Rate the employee based on observed behaviors',
    substeps: [
      'For each value, consider observed behaviors over the period',
      'Reference behavioral indicators for each rating level',
      'Select the rating that reflects consistent behavior'
    ],
    expectedResult: 'All values rated by manager'
  },
  {
    title: 'Add Behavioral Evidence',
    description: 'Provide specific examples supporting your ratings',
    substeps: [
      'Add comments with concrete behavioral examples',
      'Reference specific situations where value was demonstrated',
      'Note any patterns or changes over the evaluation period'
    ],
    expectedResult: 'Documented rationale for values ratings'
  },
  {
    title: 'Address Gaps',
    description: 'When your rating differs significantly from self-assessment',
    substeps: [
      'Note where ratings differ by 2+ points',
      'Prepare to discuss during appraisal interview',
      'Document specific observations that led to your rating'
    ],
    expectedResult: 'Ready for constructive conversation about values alignment'
  }
];

const BUSINESS_RULES = [
  { rule: 'Values assessment optional by cycle', enforcement: 'System' as const, description: 'Only appears if "Include Values Assessment" is enabled in cycle settings.' },
  { rule: 'Behavioral indicators guide ratings', enforcement: 'Advisory' as const, description: 'Reference indicators when rating to ensure consistency across evaluators.' },
  { rule: 'Values contribute to CRGV score', enforcement: 'System' as const, description: 'Values score is weighted according to cycle configuration (typically 10-20%).' },
  { rule: 'Both self and manager assessment captured', enforcement: 'System' as const, description: 'When enabled, both perspectives are recorded for calibration visibility.' }
];

export function WorkflowValuesAssessment() {
  return (
    <Card id="sec-3-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.6</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~10 min read
          </Badge>
          <Badge className="gap-1 bg-pink-600 text-white">
            <Users className="h-3 w-3" />
            Employee / Manager
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Heart className="h-6 w-6 text-pink-500" />
          Values Assessment Process
        </CardTitle>
        <CardDescription>
          Employee self-assessment and manager evaluation of company values alignment (the "V" in CRGV)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Appraisals', 'Values Assessment']} />

        <LearningObjectives
          objectives={[
            'Complete self-assessment on company values',
            'Use behavioral indicators for accurate rating',
            'Conduct manager values assessment with evidence',
            'Understand how values impact overall appraisal score'
          ]}
        />

        {/* Values Overview */}
        <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
          <h4 className="font-semibold text-pink-700 dark:text-pink-300 mb-3">Why Values Assessment Matters</h4>
          <p className="text-sm text-muted-foreground">
            Values assessment ensures performance is measured not just by <em>what</em> employees achieve, 
            but <em>how</em> they achieve it. This promotes a culture where results and behaviors are 
            equally important, and helps identify "toxic high performers" who deliver results at the 
            expense of cultural health.
          </p>
        </div>

        {/* Dual Perspective */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold">Employee Self-Assessment</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Employees reflect on how they embody company values, providing their 
              perspective with specific examples.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">Manager Assessment</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Managers evaluate based on observed behaviors, using 
              concrete examples to support their ratings.
            </p>
          </div>
        </div>

        {/* Example Value Card */}
        <div>
          <h4 className="font-medium mb-3">Example: Value Rating Card</h4>
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-5 w-5 text-pink-500" />
              <h5 className="font-semibold">Collaboration</h5>
              <Badge variant="outline">Core Value</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Works effectively with others, shares knowledge, and contributes to team success.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star 
                      key={n} 
                      className={`h-4 w-4 ${n <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">4 - Consistently Demonstrated</span>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Behavioral Indicator: "Proactively shares knowledge and mentors team members; 
                leads cross-functional initiatives; builds bridges across departments."
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 3.12.1: Values Assessment tab in appraisal form with behavioral indicators"
          alt="Values Assessment interface"
        />

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            For Employees: Self-Assessment
          </h3>
          <StepByStep steps={SELF_ASSESSMENT_STEPS} title="Self-Assessment Steps" />
        </div>

        <TipCallout title="Self-Assessment Tip">
          Be honest and realistic in your self-assessment. Providing specific examples makes 
          your self-assessment more credible and helps your manager understand your perspective. 
          Avoid overrating—calibration will catch inconsistencies.
        </TipCallout>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            For Managers: Values Evaluation
          </h3>
          <StepByStep steps={MANAGER_ASSESSMENT_STEPS} title="Manager Evaluation Steps" />
        </div>

        <ScreenshotPlaceholder
          caption="Figure 3.12.2: Manager view comparing self-assessment vs manager rating"
          alt="Manager values comparison view"
        />

        <InfoCallout title="Score Impact">
          Values scores are weighted according to cycle configuration (typically 10-20% of overall). 
          A significant values gap (e.g., rating 2 or below) may trigger calibration review or 
          flag the employee for coaching conversations about cultural alignment.
        </InfoCallout>

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-2-15', title: 'Values Assessment Configuration' },
            { sectionId: 'sec-4-1', title: 'Calibration Sessions' },
            { sectionId: 'sec-5-8', title: 'Performance Risk Detection' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
