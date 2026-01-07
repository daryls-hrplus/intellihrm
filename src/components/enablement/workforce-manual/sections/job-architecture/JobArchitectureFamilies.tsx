import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderTree, Plus, Settings } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type Step
} from '../../../manual/components';

const createFamilySteps: Step[] = [
  {
    title: "Navigate to Job Families",
    description: "Go to Workforce → Job Families from the main navigation",
    expectedResult: "Job Families page displays with company selector"
  },
  {
    title: "Select Company",
    description: "Choose the company for which you want to create job families",
    expectedResult: "Existing job families for selected company are listed"
  },
  {
    title: "Click Add Job Family",
    description: "Click the '+ Add Job Family' button in the top right",
    expectedResult: "Job Family dialog opens with General and Default Responsibilities tabs"
  },
  {
    title: "Enter Basic Information",
    description: "Fill in the required fields",
    substeps: [
      "Code: Unique identifier (e.g., TECH, FIN, HR)",
      "Name: Full name of the job family (e.g., Technology, Finance)",
      "Description: Brief explanation of the career stream",
      "Start Date: When the job family becomes active"
    ],
    expectedResult: "Form validates required fields"
  },
  {
    title: "Set Status",
    description: "Toggle 'Active' switch to enable the job family",
    expectedResult: "Job family status set to active or inactive"
  },
  {
    title: "Save Job Family",
    description: "Click Save to create the job family",
    expectedResult: "Job family appears in the list with confirmation message"
  }
];

const defaultResponsibilitiesSteps: Step[] = [
  {
    title: "Open Default Responsibilities Tab",
    description: "While editing a job family, click the 'Default Responsibilities' tab",
    expectedResult: "Responsibility selection interface appears"
  },
  {
    title: "Add Responsibilities",
    description: "Select responsibilities from the library that apply to all jobs in this family",
    expectedResult: "Selected responsibilities appear with weight configuration"
  },
  {
    title: "Set Weights",
    description: "Assign percentage weights to each responsibility (total can exceed 100%)",
    expectedResult: "Weights are saved as defaults for new jobs in this family"
  },
  {
    title: "Save Changes",
    description: "Click Save to apply default responsibilities",
    expectedResult: "New jobs created in this family will inherit these responsibilities"
  }
];

const familyExamples = [
  { code: 'TECH', name: 'Technology', description: 'Software development, IT operations, data science' },
  { code: 'FIN', name: 'Finance', description: 'Accounting, financial planning, treasury' },
  { code: 'HR', name: 'Human Resources', description: 'Talent acquisition, employee relations, compensation' },
  { code: 'OPS', name: 'Operations', description: 'Manufacturing, logistics, quality control' },
  { code: 'SALES', name: 'Sales', description: 'Direct sales, account management, business development' },
  { code: 'MKT', name: 'Marketing', description: 'Brand management, digital marketing, communications' },
];

export function JobArchitectureFamilies() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create and configure job families as career streams",
          "Set up default responsibilities that cascade to jobs",
          "Understand job family best practices for career lattice design",
          "Manage job family lifecycle with effective dating"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            Understanding Job Families
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Job Families represent broad career streams or functional areas within your 
            organization. They group related jobs that share similar competencies, career 
            paths, and progression opportunities.
          </p>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {familyExamples.map((family) => (
              <div key={family.code} className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">{family.code}</Badge>
                  <span className="font-medium text-sm">{family.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{family.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Job Family"
        steps={createFamilySteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.2.1: Job Family creation dialog with General tab"
        alt="Job Family dialog showing code, name, description, and date fields"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Default Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Default Responsibilities are pre-configured responsibility sets that automatically 
            apply to all jobs created within a job family. This ensures consistency and 
            reduces manual configuration when creating new jobs.
          </p>
          <div className="p-4 rounded-lg border bg-muted/30">
            <h5 className="font-medium mb-2">How Inheritance Works</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Job Family defines default responsibilities with suggested weights</li>
              <li>• When a new Job is created, it inherits these defaults</li>
              <li>• Job-level overrides can modify inherited responsibilities</li>
              <li>• Changes to family defaults do not retroactively update existing jobs</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Configuring Default Responsibilities"
        steps={defaultResponsibilitiesSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.2.2: Default Responsibilities tab with responsibility selection and weight configuration"
        alt="Default Responsibilities interface showing selected responsibilities with percentage weights"
      />

      <InfoCallout title="AI-Powered Descriptions">
        Use the AI Generate button (sparkle icon) next to the Description field to 
        automatically generate a professional job family description based on the 
        family name and code.
      </InfoCallout>

      <TipCallout title="Career Lattice Design">
        Design job families to support both vertical (promotion) and lateral (transfer) 
        career moves. Employees should be able to see clear paths within their family 
        and understand how skills transfer to adjacent families.
      </TipCallout>
    </div>
  );
}
