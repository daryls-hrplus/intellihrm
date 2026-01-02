import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';
import { 
  GraduationCap, Lightbulb, AlertTriangle, Info, BookOpen,
  Target, TrendingUp, ArrowRight, Zap
} from 'lucide-react';

export function LearningIntegrationSection() {
  const learningDiagram = `
graph TB
    subgraph Appraisal["Appraisal Process"]
        A[Competency Scores] --> B[Identify Low Scores]
        C[Development Gaps] --> D[Extract Skill Gaps]
    end
    
    subgraph GapAnalysis["Skill Gap Detection"]
        B --> E[Create employee_skill_gaps]
        D --> E
        E --> F[Trigger: auto_create_idp_from_skill_gap]
    end
    
    subgraph IdpCreation["IDP Goal Creation"]
        F --> G[Generate IDP Goals]
        G --> H[Map to Competency Framework]
    end
    
    subgraph Learning["Learning Path Assignment"]
        H --> I[Manager Reviews IDP]
        I --> J[Assign Learning Resources]
        J --> K[LMS Course Enrollment]
    end
    
    subgraph Progress["Progress Tracking"]
        K --> L[Employee Completes Training]
        L --> M[Skills Updated]
        M --> N[Next Appraisal Reflects Growth]
    end
  `;

  const skillGapFields = [
    { name: 'employee_id', required: true, type: 'UUID', description: 'Employee with the identified skill gap' },
    { name: 'skill_id', required: true, type: 'UUID', description: 'Reference to the skill in the competency framework' },
    { name: 'current_level', required: true, type: 'Number', description: 'Employee\'s current proficiency level' },
    { name: 'required_level', required: true, type: 'Number', description: 'Level required for their role' },
    { name: 'gap_score', required: true, type: 'Number', description: 'Difference between required and current', defaultValue: 'Calculated' },
    { name: 'source', required: true, type: 'Enum', description: 'How the gap was identified', defaultValue: 'appraisal' },
    { name: 'source_reference_id', required: false, type: 'UUID', description: 'Reference to source appraisal' },
    { name: 'priority', required: false, type: 'Enum', description: 'Priority for development', defaultValue: 'Based on gap size' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'When gap was identified' },
  ];

  const learningFields = [
    { name: 'gap_area', required: true, type: 'Text', description: 'Skill or competency area needing development' },
    { name: 'recommended_training', required: false, type: 'Text[]', description: 'Suggested courses or programs' },
    { name: 'learning_path_id', required: false, type: 'UUID', description: 'Pre-defined learning path assignment' },
    { name: 'target_completion', required: false, type: 'Date', description: 'Expected completion date' },
    { name: 'progress_percentage', required: false, type: 'Number', description: 'Current progress (0-100)', defaultValue: '0' },
  ];

  const businessRules = [
    { rule: 'Competency scores below threshold create skill gaps', enforcement: 'System' as const, description: 'Low competency ratings automatically populate skill gap records' },
    { rule: 'Skill gaps trigger IDP goal creation via database trigger', enforcement: 'System' as const, description: 'auto_create_idp_from_skill_gap function generates development goals' },
    { rule: 'Learning assignment requires manager action', enforcement: 'Policy' as const, description: 'Specific course enrollment is done manually by manager/HR' },
    { rule: 'Gap priority based on difference from required level', enforcement: 'System' as const, description: 'Larger gaps receive higher development priority' },
    { rule: 'Skills refresh upon next appraisal', enforcement: 'Advisory' as const, description: 'Progress tracked and gaps reassessed in subsequent cycles' },
  ];

  const steps: Step[] = [
    {
      title: 'Complete Appraisal with Competency Ratings',
      description: 'Evaluate employee competencies during appraisal',
      substeps: [
        'Access the competency section of the appraisal form',
        'Rate each competency against required levels',
        'Add development comments for low-scoring competencies',
        'Submit the appraisal for finalization'
      ],
      expectedResult: 'Competency scores recorded with development notes'
    },
    {
      title: 'Skill Gaps Automatically Detected',
      description: 'System identifies development needs',
      substeps: [
        'Upon finalization, system compares scores to required levels',
        'Gaps are created in employee_skill_gaps table',
        'Database trigger fires to create IDP goals',
        'Employee receives notification of development plan'
      ],
      expectedResult: 'Skill gaps populated and IDP goals created'
    },
    {
      title: 'Manager Reviews Development Plan',
      description: 'Manager customizes the development approach',
      substeps: [
        'Navigate to employee\'s IDP',
        'Review auto-generated goals from skill gaps',
        'Add specific learning resources or courses',
        'Set realistic target completion dates'
      ],
      expectedResult: 'IDP refined with specific learning recommendations'
    },
    {
      title: 'Assign Learning Resources',
      description: 'Connect development goals to learning content',
      substeps: [
        'Access the Learning module',
        'Search for relevant courses or learning paths',
        'Assign courses to employee',
        'Link assignments to IDP goals for tracking'
      ],
      expectedResult: 'Employee enrolled in relevant training'
    },
    {
      title: 'Track Progress to Next Appraisal',
      description: 'Monitor development and prepare for reassessment',
      substeps: [
        'Employee completes assigned training',
        'Progress updates in IDP and learning records',
        'Next appraisal cycle: reassess competencies',
        'Compare new scores to previous gaps'
      ],
      expectedResult: 'Development tracked and growth measured in next appraisal'
    },
  ];

  const troubleshootingItems = [
    { issue: 'Skill gaps not created', cause: 'Competency section may not be enabled in appraisal template', solution: 'Verify appraisal cycle includes competencies and required levels are defined' },
    { issue: 'IDP goals not generated', cause: 'Database trigger may not be active', solution: 'Check auto_create_idp_from_skill_gap trigger is enabled in database' },
    { issue: 'No learning recommendations', cause: 'Learning content not mapped to competencies', solution: 'Ensure learning paths are tagged with relevant competency/skill areas' },
    { issue: 'Progress not updating', cause: 'LMS integration may be missing', solution: 'Manually update progress or configure LMS sync if available' },
  ];

  return (
    <div className="space-y-8">
      {/* Section 7.5 Header */}
      <Card id="sec-7-5">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 7.5</Badge>
          </div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Learning & Development Links
          </CardTitle>
          <CardDescription>
            Connect appraisal outcomes to skill development and learning paths
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-7-5']} />

          {/* Learning Objectives */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand how competency scores drive skill gap detection</li>
                <li>Learn the flow from appraisal gaps to IDP goals</li>
                <li>Connect development goals to learning resources</li>
                <li>Track progress from appraisal to skill improvement</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* How It Works */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5" />
              How Learning Integration Works
            </h3>
            <p className="text-muted-foreground">
              The learning integration follows an indirect but powerful path: appraisal competency 
              scores and development gaps feed into the skill gap system, which automatically 
              generates IDP goals. Managers then connect these goals to specific learning resources.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-6 bg-muted/30 rounded-lg">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">Competency Scores</p>
                <p className="text-xs text-muted-foreground">Low ratings identified</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">Skill Gaps</p>
                <p className="text-xs text-muted-foreground">Gaps auto-created</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">IDP Goals</p>
                <p className="text-xs text-muted-foreground">Goals generated</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">Learning</p>
                <p className="text-xs text-muted-foreground">Courses assigned</p>
              </div>
            </div>
          </div>

          {/* Workflow Diagram */}
          <WorkflowDiagram 
            title="Appraisal to Learning Flow"
            description="How appraisal outcomes drive learning and development"
            diagram={learningDiagram}
          />

          {/* Key Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Skill Gap Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  When competency scores fall below required levels, skill gaps are automatically 
                  recorded. This provides visibility into development needs across the organization.
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Source</Badge>
                    <span>Appraisal competency ratings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Trigger</Badge>
                    <span>Score below required level</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Output</Badge>
                    <span>employee_skill_gaps record</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  IDP Goal Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  A database trigger automatically creates IDP goals from skill gaps, ensuring 
                  every development need has an actionable plan.
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Trigger</Badge>
                    <span>auto_create_idp_from_skill_gap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Creates</Badge>
                    <span>IDP with development goals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Status</Badge>
                    <span>Draft (for manager review)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Field References */}
          <FieldReferenceTable 
            fields={skillGapFields} 
            title="Skill Gap Record Fields"
          />

          <FieldReferenceTable 
            fields={learningFields} 
            title="Learning Assignment Fields"
          />

          {/* Step by Step */}
          <StepByStep 
            steps={steps}
            title="From Appraisal to Learning"
          />

          {/* Business Rules */}
          <BusinessRules 
            rules={businessRules}
            title="Learning Integration Rules"
          />

          {/* Troubleshooting */}
          <TroubleshootingSection 
            items={troubleshootingItems}
            title="Common Issues"
          />

          {/* Current Limitations */}
          <Alert variant="default" className="border-2 border-amber-500 bg-amber-500/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-bold">Current Implementation</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Learning integration currently follows an <strong>indirect path</strong> through IDP goals:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Skill gaps are detected and IDP goals are auto-generated</li>
                <li>Managers manually assign specific courses from the Learning module</li>
                <li>Direct LMS course assignment from integration rules is not yet available</li>
              </ul>
              <p className="mt-2 text-sm">
                A future enhancement will add a "learning" target module to the Integration Orchestrator 
                for direct course recommendations based on appraisal outcomes.
              </p>
            </AlertDescription>
          </Alert>

          {/* Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Best Practices</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ensure competency framework includes required proficiency levels</li>
                <li>Tag learning content with relevant competency areas for easy discovery</li>
                <li>Review auto-generated IDP goals before activating plans</li>
                <li>Track completion rates to measure learning program effectiveness</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
