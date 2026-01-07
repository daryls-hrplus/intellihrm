import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Briefcase, UserCheck, ArrowRight } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type Step
} from '../../../manual/components';

const mappingSteps: Step[] = [
  {
    title: "Review Job Definitions",
    description: "Ensure all jobs are properly defined in Workforce → Jobs",
    expectedResult: "Jobs exist with complete configurations"
  },
  {
    title: "Create Positions",
    description: "Create positions that will be linked to jobs",
    substeps: [
      "Navigate to Workforce → Positions",
      "Add positions with appropriate department assignments",
      "Set authorized headcount for each position"
    ],
    expectedResult: "Positions exist in the organizational structure"
  },
  {
    title: "Link Position to Job",
    description: "Connect each position to its corresponding job",
    substeps: [
      "When creating/editing a position, select the Job field",
      "Choose the appropriate job from the job library",
      "The position inherits job-level requirements"
    ],
    expectedResult: "Position is linked to a job definition"
  },
  {
    title: "Verify Inheritance",
    description: "Confirm that job attributes flow to the position",
    substeps: [
      "Competencies from the job are visible at position level",
      "Responsibilities are inherited (can be overridden)",
      "Compensation model from job applies if not overridden"
    ],
    expectedResult: "Job-to-position inheritance is working"
  }
];

const oneToManyExamples = [
  { 
    job: 'Software Engineer I',
    positions: [
      'Software Engineer - Product Team A',
      'Software Engineer - Product Team B',
      'Software Engineer - Platform Team',
      'Software Engineer - Mobile Team'
    ]
  },
  { 
    job: 'Financial Analyst',
    positions: [
      'Financial Analyst - Treasury',
      'Financial Analyst - FP&A',
      'Financial Analyst - Reporting'
    ]
  },
  { 
    job: 'HR Business Partner',
    positions: [
      'HRBP - Technology Division',
      'HRBP - Operations Division',
      'HRBP - Corporate Functions'
    ]
  },
];

const inheritanceRules = [
  { attribute: 'Job Family', behavior: 'Inherited, read-only at position' },
  { attribute: 'Job Grade', behavior: 'Inherited, used for compensation' },
  { attribute: 'Job Level', behavior: 'Inherited, used for reporting/analytics' },
  { attribute: 'Competencies', behavior: 'Inherited, can add position-specific' },
  { attribute: 'Responsibilities', behavior: 'Inherited, weights can be adjusted' },
  { attribute: 'Skills', behavior: 'Inherited, can add position-specific' },
];

export function JobArchitectureMapping() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand the one-to-many relationship between jobs and positions",
          "Link positions to job definitions correctly",
          "Verify inheritance of job attributes to positions",
          "Manage position-level overrides when needed"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Job-to-Position Mapping Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The relationship between Jobs and Positions follows a one-to-many pattern. 
            A single Job definition serves as a template that can be used by multiple 
            Positions across different departments and locations.
          </p>
          
          <div className="flex items-center justify-center gap-4 p-6 rounded-lg border bg-muted/30">
            <div className="text-center">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">1 Job</p>
              <p className="text-xs text-muted-foreground">Template</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="text-center">
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-info" />
                  </div>
                ))}
              </div>
              <p className="font-medium mt-2">Many Positions</p>
              <p className="text-xs text-muted-foreground">Instances</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>One-to-Many Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {oneToManyExamples.map((example) => (
              <div key={example.job} className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-medium">Job: {example.job}</span>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {example.positions.map((position) => (
                    <div key={position} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserCheck className="h-3 w-3" />
                      {position}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Linking Jobs to Positions"
        steps={mappingSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.9.1: Position edit form showing job selection field"
        alt="Position form with job dropdown showing available job templates"
      />

      <Card>
        <CardHeader>
          <CardTitle>Inheritance Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            When a position is linked to a job, the following attributes are inherited:
          </p>
          <div className="space-y-2">
            {inheritanceRules.map((rule) => (
              <div key={rule.attribute} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="font-medium text-sm">{rule.attribute}</span>
                <Badge variant="outline" className="text-xs">{rule.behavior}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Position-Level Overrides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            While positions inherit from jobs, specific overrides are sometimes needed:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">When to Override</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Position requires additional competencies</li>
                <li>• Responsibility weights differ from standard</li>
                <li>• Location-specific requirements apply</li>
                <li>• Compensation deviates from job grade</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Override Best Practice</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Document the reason for override</li>
                <li>• Review overrides during annual job review</li>
                <li>• Consider if override indicates job variant needed</li>
                <li>• Maintain audit trail of changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 3.9.2: Org Chart showing positions with their linked job names"
        alt="Org chart visualization with position titles and underlying job names visible"
        aspectRatio="wide"
      />

      <InfoCallout title="Job Changes Impact">
        When a job definition is updated (e.g., new competency added), the change 
        propagates to all linked positions. Position-level overrides are preserved 
        unless explicitly cleared.
      </InfoCallout>

      <TipCallout title="When to Create a New Job">
        If you find yourself overriding many attributes on a position, consider 
        whether a new job variant is needed. For example, if "Software Engineer I" 
        positions in the Data team consistently need different competencies, create 
        a "Data Engineer I" job instead of overriding each position.
      </TipCallout>
    </div>
  );
}
