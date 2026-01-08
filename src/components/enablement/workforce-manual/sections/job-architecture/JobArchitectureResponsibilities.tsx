import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Sparkles, Layers } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type Step
} from '../../../manual/components';

const createResponsibilitySteps: Step[] = [
  {
    title: "Navigate to Responsibilities Library",
    description: "Go to Workforce → Jobs → expand any job → Responsibilities tab, or Administration → Responsibilities",
    expectedResult: "Responsibility management interface displays"
  },
  {
    title: "Add New Responsibility",
    description: "Click '+ Add Responsibility' to create a library entry",
    expectedResult: "Responsibility form opens"
  },
  {
    title: "Enter Responsibility Details",
    description: "Define the responsibility with clear, actionable language",
    substeps: [
      "Code: Unique identifier (e.g., RESP-001)",
      "Name: Short title (e.g., Project Delivery)",
      "Description: Detailed explanation of the responsibility",
      "Category: Classification (Core, Functional, Managerial, etc.)",
      "Type: KRA (Key Result Area) or Task-based"
    ],
    expectedResult: "Responsibility is defined in the library"
  },
  {
    title: "Set Applicability",
    description: "Define where this responsibility applies",
    substeps: [
      "Job Family: Optionally limit to specific families",
      "Job Level: Optionally limit to specific levels",
      "Is Active: Toggle availability"
    ],
    expectedResult: "Responsibility is scoped appropriately"
  },
  {
    title: "Save to Library",
    description: "Click Save to add to the master responsibility library",
    expectedResult: "Responsibility is available for linking to jobs"
  }
];

const linkToJobSteps: Step[] = [
  {
    title: "Expand Job Row",
    description: "In Workforce → Jobs, click the chevron to expand the target job",
    expectedResult: "Job detail tabs are visible"
  },
  {
    title: "Open Responsibilities Tab",
    description: "Click the Responsibilities tab",
    expectedResult: "Existing responsibilities are shown; inherited items are marked"
  },
  {
    title: "Add Responsibility",
    description: "Click '+ Add' and select from the library",
    expectedResult: "Responsibility is linked to the job"
  },
  {
    title: "Set Weight",
    description: "Assign a percentage weight reflecting importance",
    substeps: [
      "Weights indicate relative importance in performance assessment",
      "Total weights typically sum to 100% but can exceed for stretch",
      "Higher weights = higher impact on performance score"
    ],
    expectedResult: "Responsibility has appropriate weight"
  },
  {
    title: "Contextualize (Optional)",
    description: "Click the AI sparkle icon to contextualize for this specific job",
    expectedResult: "Generic responsibility is tailored to job context"
  }
];

const responsibilityCategories = [
  { category: 'Core', description: 'Fundamental duties that define the role', example: 'Deliver assigned projects on time and budget' },
  { category: 'Functional', description: 'Technical or specialized duties', example: 'Maintain financial reporting systems' },
  { category: 'Managerial', description: 'People leadership responsibilities', example: 'Develop and coach direct reports' },
  { category: 'Strategic', description: 'Planning and direction-setting', example: 'Define departmental strategy aligned with company goals' },
  { category: 'Compliance', description: 'Regulatory and policy adherence', example: 'Ensure team compliance with SOX controls' },
  { category: 'Stakeholder', description: 'Internal/external relationship management', example: 'Manage client relationships and satisfaction' },
];

export function JobArchitectureResponsibilities() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Build a master responsibility library for consistent role definitions",
          "Link responsibilities to jobs with appropriate weights",
          "Use AI to contextualize generic responsibilities",
          "Understand how responsibilities flow to performance management"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Responsibility Templates Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Responsibilities define the key duties and accountabilities for each job. 
            Intelli HRM uses a library approach where generic responsibilities are created 
            once and linked to multiple jobs, ensuring consistency while allowing 
            job-specific customization.
          </p>
          
          <div className="grid gap-3 md:grid-cols-2">
            {responsibilityCategories.map((item) => (
              <div key={item.category} className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                </div>
                <p className="text-sm font-medium">{item.description}</p>
                <p className="text-xs text-muted-foreground italic mt-1">"{item.example}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating Responsibility Templates"
        steps={createResponsibilitySteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.6.1: Responsibility creation form with category and type fields"
        alt="Responsibility form showing code, name, description, category, and type options"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Inheritance Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Responsibilities can be inherited at multiple levels:
          </p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border-l-4 border-l-primary bg-muted/30">
              <h5 className="font-medium">Job Family Defaults</h5>
              <p className="text-sm text-muted-foreground">
                Responsibilities defined at the job family level are inherited by all 
                jobs within that family.
              </p>
            </div>
            <div className="p-3 rounded-lg border-l-4 border-l-primary bg-muted/30">
              <h5 className="font-medium">Job-Specific</h5>
              <p className="text-sm text-muted-foreground">
                Additional responsibilities can be added at the job level, and 
                inherited responsibilities can have their weights adjusted.
              </p>
            </div>
            <div className="p-3 rounded-lg border-l-4 border-l-primary bg-muted/30">
              <h5 className="font-medium">Position Override</h5>
              <p className="text-sm text-muted-foreground">
                Individual positions can override job-level responsibilities when 
                the specific seat has unique requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Linking Responsibilities to Jobs"
        steps={linkToJobSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.6.2: Job Responsibilities tab with weights and contextualization options"
        alt="Job expanded view showing responsibilities list with percentage weights"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Contextualization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Generic responsibilities can be made more specific using AI:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Before (Generic)</h5>
              <p className="text-sm text-muted-foreground italic">
                "Deliver assigned projects on time and within budget"
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-primary/5">
              <h5 className="font-medium mb-2">After (Contextualized)</h5>
              <p className="text-sm text-muted-foreground italic">
                "Lead software development projects from requirements through 
                deployment, ensuring Sprint commitments are met and technical 
                debt is minimized"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <InfoCallout title="KRAs and Performance">
        Key Result Areas (KRAs) defined as responsibilities flow directly into the 
        Performance Management module. During appraisal cycles, employees and managers 
        rate performance against these responsibilities.
      </InfoCallout>

      <TipCallout title="Weight Guidelines">
        A typical job should have 5-8 responsibilities with weights totaling 100%. 
        No single responsibility should exceed 30% to ensure balanced accountability. 
        Managerial responsibilities should carry appropriate weight for leadership roles.
      </TipCallout>
    </div>
  );
}
