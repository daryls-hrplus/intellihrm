import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Target, Users, TrendingUp } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type Step,
  type ExampleConfig,
  type BusinessRule
} from '@/components/enablement/manual/components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndSetupEvaluations() {
  const learningObjectives = [
    'Create post-training evaluation forms',
    'Configure Kirkpatrick evaluation levels (1-4)',
    'Set up evaluation question templates',
    'Track training effectiveness over time'
  ];

  const evaluationFields: FieldDefinition[] = [
    {
      name: 'company_id',
      required: true,
      type: 'uuid',
      description: 'Company scope for evaluation form'
    },
    {
      name: 'name',
      required: true,
      type: 'text',
      description: 'Evaluation form name',
      validation: '3-200 characters'
    },
    {
      name: 'description',
      required: false,
      type: 'text',
      description: 'Form description and purpose',
      validation: 'Maximum 1000 characters'
    },
    {
      name: 'evaluation_level',
      required: true,
      type: 'number',
      description: 'Kirkpatrick level (1-4)',
      validation: '1, 2, 3, or 4'
    },
    {
      name: 'questions',
      required: true,
      type: 'json',
      description: 'Array of question definitions'
    },
    {
      name: 'timing',
      required: false,
      type: 'enum',
      description: 'When evaluation is triggered',
      defaultValue: 'immediate',
      validation: 'immediate, 30_days, 90_days'
    },
    {
      name: 'is_mandatory',
      required: false,
      type: 'boolean',
      description: 'Require completion for course certificate',
      defaultValue: 'false'
    },
    {
      name: 'is_active',
      required: true,
      type: 'boolean',
      description: 'Form availability',
      defaultValue: 'true'
    }
  ];

  const kirkpatrickLevels = [
    {
      level: 1,
      name: 'Reaction',
      focus: 'Learner satisfaction and engagement',
      timing: 'Immediately after training',
      questions: 'Course quality, instructor effectiveness, relevance',
      metrics: 'Satisfaction scores, Net Promoter Score'
    },
    {
      level: 2,
      name: 'Learning',
      focus: 'Knowledge and skill acquisition',
      timing: 'End of training (via assessment)',
      questions: 'Pre/post tests, skill demonstrations',
      metrics: 'Test scores, competency gains'
    },
    {
      level: 3,
      name: 'Behavior',
      focus: 'Application of learning on the job',
      timing: '30-90 days after training',
      questions: 'Behavior change, skill application, manager observations',
      metrics: 'Behavior change ratings, manager feedback'
    },
    {
      level: 4,
      name: 'Results',
      focus: 'Business impact and ROI',
      timing: '90+ days after training',
      questions: 'Performance metrics, business outcomes',
      metrics: 'Productivity, quality, revenue impact'
    }
  ];

  const createEvaluationSteps: Step[] = [
    {
      title: 'Navigate to Evaluation Management',
      description: 'Go to Training → Evaluations from the main navigation.',
      expectedResult: 'Evaluation forms list displays'
    },
    {
      title: 'Click Create Evaluation',
      description: 'Click "Add Evaluation" to create a new form.',
      expectedResult: 'Evaluation creation wizard opens'
    },
    {
      title: 'Enter Form Name',
      description: 'Create a descriptive name for the evaluation.',
      substeps: [
        '"Post-Training Satisfaction Survey (L1)"',
        '"Behavior Change Assessment (L3)"',
        '"Training Impact Evaluation (L4)"'
      ]
    },
    {
      title: 'Select Kirkpatrick Level',
      description: 'Choose the evaluation level (1-4).',
      notes: ['Level determines default question types and timing']
    },
    {
      title: 'Configure Timing',
      description: 'Set when the evaluation is triggered.',
      substeps: [
        'Immediate: Right after course completion',
        '30 days: One month later for behavior assessment',
        '90 days: Quarter later for results measurement'
      ]
    },
    {
      title: 'Add Questions',
      description: 'Build the evaluation questionnaire.',
      substeps: [
        'Use rating scales (1-5) for satisfaction',
        'Include open-ended questions for feedback',
        'Add manager assessment questions for L3/L4'
      ]
    },
    {
      title: 'Set Mandatory Status',
      description: 'Decide if evaluation must be completed for certificate.',
      notes: ['Mandatory L1 evaluations improve response rates']
    },
    {
      title: 'Save Evaluation',
      description: 'Save and activate the evaluation form.',
      expectedResult: 'Evaluation available for course assignment'
    }
  ];

  const evaluationExamples: ExampleConfig[] = [
    {
      title: 'Post-Training Satisfaction (L1)',
      context: 'Immediate feedback on training quality',
      values: [
        { field: 'Level', value: '1 (Reaction)' },
        { field: 'Timing', value: 'Immediate' },
        { field: 'Questions', value: '8 rating + 2 open-ended' },
        { field: 'Mandatory', value: 'true' }
      ],
      outcome: 'High response rates, actionable feedback on content quality'
    },
    {
      title: 'Knowledge Retention Check (L2)',
      context: 'Follow-up assessment 30 days after training',
      values: [
        { field: 'Level', value: '2 (Learning)' },
        { field: 'Timing', value: '30 days' },
        { field: 'Questions', value: '10 knowledge check questions' },
        { field: 'Mandatory', value: 'false' }
      ],
      outcome: 'Measures knowledge retention over time'
    },
    {
      title: 'Behavior Change Assessment (L3)',
      context: 'Manager assessment of skill application',
      values: [
        { field: 'Level', value: '3 (Behavior)' },
        { field: 'Timing', value: '90 days' },
        { field: 'Questions', value: '5 manager rating + 3 self-assessment' },
        { field: 'Mandatory', value: 'false' }
      ],
      outcome: 'Validates on-the-job application of training'
    }
  ];

  const evaluationRules: BusinessRule[] = [
    {
      rule: 'Evaluations triggered based on timing setting',
      enforcement: 'System',
      description: 'System automatically sends evaluation requests at configured intervals after completion.'
    },
    {
      rule: 'Mandatory evaluations block certificate',
      enforcement: 'System',
      description: 'If evaluation is mandatory, certificate is not issued until evaluation is submitted.'
    },
    {
      rule: 'L3/L4 evaluations may include manager',
      enforcement: 'Advisory',
      description: 'Behavior and results evaluations often require manager input for accurate assessment.'
    },
    {
      rule: 'Aggregated results used for course improvement',
      enforcement: 'Policy',
      description: 'Review evaluation analytics regularly to identify and address training gaps.'
    }
  ];

  return (
    <section id="sec-2-11" data-manual-anchor="sec-2-11" className="space-y-6">
      <h2 className="text-2xl font-bold">2.11 Training Evaluations</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Training evaluations measure the effectiveness of learning programs using the 
        Kirkpatrick Model. From immediate learner satisfaction (Level 1) to long-term 
        business impact (Level 4), evaluations provide data-driven insights for continuous 
        improvement.
      </p>

      {/* Kirkpatrick Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Kirkpatrick Evaluation Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-20">Level</TableHead>
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Focus</TableHead>
                  <TableHead className="font-medium">Timing</TableHead>
                  <TableHead className="font-medium">Key Metrics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kirkpatrickLevels.map((level) => (
                  <TableRow key={level.level}>
                    <TableCell>
                      <Badge 
                        variant={level.level <= 2 ? 'secondary' : 'default'}
                        className="font-bold"
                      >
                        L{level.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell className="text-sm">{level.focus}</TableCell>
                    <TableCell className="text-sm">{level.timing}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{level.metrics}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InfoCallout title="Industry Best Practice">
        Most organizations implement Level 1 evaluations for all courses, Level 2 for 
        certification programs, and Level 3/4 selectively for high-investment training. 
        Start with L1 and gradually add higher levels as your evaluation maturity grows.
      </InfoCallout>

      <FieldReferenceTable 
        fields={evaluationFields} 
        title="training_evaluations Table Schema" 
      />

      <StepByStep 
        steps={createEvaluationSteps} 
        title="Creating an Evaluation Form" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.11.1: Evaluation Form Builder"
        alt="Evaluation creation interface with question configuration"
      />

      <ConfigurationExample 
        examples={evaluationExamples}
        title="Evaluation Form Examples"
      />

      <BusinessRules 
        rules={evaluationRules}
        title="Evaluation Business Rules"
      />

      <TipCallout title="Evaluation Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Keep L1 evaluations short (5-10 questions) for high completion</li>
          <li>• Include at least one open-ended question for qualitative feedback</li>
          <li>• Use consistent rating scales across all evaluations</li>
          <li>• Share evaluation results with instructors for improvement</li>
          <li>• Track trends over time, not just individual scores</li>
        </ul>
      </TipCallout>
    </section>
  );
}
