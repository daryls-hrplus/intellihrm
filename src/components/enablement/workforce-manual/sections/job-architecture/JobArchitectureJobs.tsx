import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Sparkles, Copy, Upload } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  WarningCallout,
  type Step
} from '../../../manual/components';

const createJobSteps: Step[] = [
  {
    title: "Navigate to Jobs",
    description: "Go to Workforce → Jobs from the main navigation",
    expectedResult: "Jobs page displays with company selector and Jobs/Level Expectations tabs"
  },
  {
    title: "Select Company",
    description: "Choose the company for which you want to create jobs",
    expectedResult: "Existing jobs for selected company are listed"
  },
  {
    title: "Click Add Job",
    description: "Click the '+ Add Job' button",
    expectedResult: "Job creation dialog opens"
  },
  {
    title: "Enter Job Header Information",
    description: "Fill in the main job details",
    substeps: [
      "Code: Unique job code (e.g., SE-001, FA-002)",
      "Name: Job title (e.g., Software Engineer I)",
      "Job Family: Select the parent job family",
      "Description: Use AI Generate or write manually"
    ],
    expectedResult: "Job header information is captured"
  },
  {
    title: "Configure Job Classification",
    description: "Set the classification attributes",
    substeps: [
      "Job Level: Intern, Staff, Senior, Manager, Director, Executive",
      "Job Grade: GR1 through GR10 for compensation banding",
      "Critical Level: Low, Medium, High, Critical for succession focus",
      "Job Class: Technical, Administrative, Managerial, etc."
    ],
    expectedResult: "Job is classified for reporting and compensation"
  },
  {
    title: "Set Work Parameters",
    description: "Configure standard working arrangements",
    substeps: [
      "Standard Hours: Default weekly/monthly hours",
      "Work Period: Monthly, Bi-Monthly, Fortnightly, Weekly"
    ],
    expectedResult: "Work parameters are set for time management integration"
  },
  {
    title: "Configure Dates and Status",
    description: "Set effective dates and activation status",
    substeps: [
      "Start Date: When the job becomes active",
      "End Date: Optional, for retiring jobs",
      "Is Active: Toggle to activate/deactivate",
      "Is Key Position: Flag for succession planning"
    ],
    expectedResult: "Job lifecycle is configured"
  },
  {
    title: "Save Job",
    description: "Click Save to create the job",
    expectedResult: "Job is created and appears in the list"
  }
];

const expandedDetailsSteps: Step[] = [
  {
    title: "Expand Job Row",
    description: "Click the chevron icon on a job row to expand details",
    expectedResult: "Expanded section shows tabs: Competencies, Skills, Responsibilities, Goals"
  },
  {
    title: "Manage Competencies",
    description: "Add required competencies with proficiency levels",
    substeps: [
      "Click '+ Add' to select competencies from the library",
      "Set required proficiency level (1-5 scale)",
      "Mark as Required or Preferred",
      "Use AI suggestions for competency recommendations"
    ],
    expectedResult: "Competency requirements are linked to the job"
  },
  {
    title: "Manage Skills",
    description: "Add technical skills with proficiency requirements",
    expectedResult: "Skill requirements are linked to the job"
  },
  {
    title: "Manage Responsibilities",
    description: "Add or review inherited responsibilities",
    substeps: [
      "View responsibilities inherited from job family",
      "Add job-specific responsibilities",
      "Set weights for each responsibility",
      "Use AI to contextualize responsibilities"
    ],
    expectedResult: "Responsibility framework is complete"
  },
  {
    title: "Manage Goals",
    description: "Define standard goals for the job",
    expectedResult: "Default goals are configured for employees in this job"
  }
];

const jobLevels = [
  { level: 'Intern', description: 'Entry-level learning positions' },
  { level: 'Clerk/Operator', description: 'Task-focused operational roles' },
  { level: 'Officer/Staff', description: 'Individual contributor roles' },
  { level: 'Senior', description: 'Experienced individual contributors' },
  { level: 'Supervisor', description: 'First-line people leadership' },
  { level: 'Manager', description: 'Mid-level management' },
  { level: 'Director', description: 'Senior management' },
  { level: 'Executive', description: 'C-suite and top leadership' },
];

export function JobArchitectureJobs() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create and configure jobs with proper classification",
          "Understand job levels, grades, and critical levels",
          "Link competencies, skills, and responsibilities to jobs",
          "Use AI features for job description generation",
          "Copy jobs and perform bulk imports"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Configuration Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Jobs are the core building blocks of your job architecture. Each job represents 
            a specific role with defined requirements, classifications, and expectations. 
            Jobs are linked to job families and serve as templates for positions.
          </p>
          
          <div className="grid gap-2 md:grid-cols-2">
            {jobLevels.map((item) => (
              <div key={item.level} className="flex items-center gap-2 p-2 rounded border">
                <Badge variant="outline" className="text-xs">{item.level}</Badge>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Job"
        steps={createJobSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.3.1: Job creation dialog with classification fields"
        alt="Job dialog showing code, name, job family, level, grade, and classification fields"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HRplus includes AI capabilities to accelerate job configuration:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">AI Job Description</h5>
              <p className="text-sm text-muted-foreground">
                Generate professional job descriptions based on job name, family, 
                level, and grade. Click the sparkle icon next to the Description field.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">AI Competency Suggestions</h5>
              <p className="text-sm text-muted-foreground">
                Get AI-recommended competencies based on the job profile. 
                Available in the Competencies tab when expanding a job.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">AI Responsibility Contextualization</h5>
              <p className="text-sm text-muted-foreground">
                Contextualize generic responsibilities to be job-specific. 
                Makes responsibilities more relevant and actionable.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">AI Goal Generation</h5>
              <p className="text-sm text-muted-foreground">
                Generate SMART goals based on job responsibilities and 
                competency requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Managing Job Details (Expanded View)"
        steps={expandedDetailsSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.3.2: Expanded job view showing Competencies, Skills, Responsibilities, and Goals tabs"
        alt="Job expanded section with tabbed interface for managing job requirements"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Copy Job Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Quickly create new jobs by copying existing ones:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Click the copy icon on any job row</li>
            <li>• Enter a new code and name for the copied job</li>
            <li>• Choose what to copy: Competencies, Skills, Responsibilities, Goals</li>
            <li>• The new job inherits selected configurations</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Import multiple jobs at once using the Bulk Import feature:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Click the Upload icon in the Jobs toolbar</li>
            <li>• Download the Excel template</li>
            <li>• Fill in job data following the template format</li>
            <li>• Upload and preview the import</li>
            <li>• Resolve any validation errors before confirming</li>
          </ul>
        </CardContent>
      </Card>

      <InfoCallout title="O*NET Alignment">
        Consider aligning job codes and classifications with O*NET (Occupational 
        Information Network) standards for compatibility with industry benchmarking 
        and compensation surveys.
      </InfoCallout>

      <WarningCallout title="Job vs Position">
        A Job is a template; a Position is an instance. You may have one "Software 
        Engineer I" job but 10 positions with that job title across different departments.
        Never confuse job-level configuration with position-level assignments.
      </WarningCallout>

      <TipCallout title="Level Expectations">
        Use the Level Expectations tab (accessible at the top of the Jobs page) to 
        define behavioral expectations for each job level. This supports performance 
        management and career development conversations.
      </TipCallout>
    </div>
  );
}
