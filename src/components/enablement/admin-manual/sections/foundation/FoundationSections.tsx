import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users2, Layers, ArrowRight } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  FieldReferenceTable,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  InfoCallout,
  type Step,
  type FieldDefinition,
  type ExampleConfig,
  type BusinessRule
} from '../../../manual/components';

const sectionFields: FieldDefinition[] = [
  {
    name: "Section Name",
    type: "Text",
    required: true,
    description: "Display name for the section",
    validation: "2-100 characters"
  },
  {
    name: "Section Code",
    type: "Text",
    required: true,
    description: "Short code for system reference",
    validation: "2-20 characters, uppercase"
  },
  {
    name: "Department",
    type: "Select",
    required: true,
    description: "Parent department for this section"
  },
  {
    name: "Section Supervisor",
    type: "Employee Lookup",
    required: false,
    description: "Team lead or supervisor for the section"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Purpose and scope of the section"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether the section is active",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Sections",
    description: "Go to Admin → Organization → Sections",
    expectedResult: "Sections list page displays"
  },
  {
    title: "Click Create Section",
    description: "Click the 'Add Section' button",
    expectedResult: "Section creation form opens"
  },
  {
    title: "Select Parent Department",
    description: "Choose the department this section belongs to",
    expectedResult: "Department context is set"
  },
  {
    title: "Enter Section Details",
    description: "Fill in section identification",
    substeps: [
      "Enter section name (e.g., 'Recruitment Team')",
      "Enter or modify the section code",
      "Add description of team functions"
    ]
  },
  {
    title: "Assign Section Supervisor",
    description: "Select the team leader (optional)",
    expectedResult: "Supervisor assigned for team reporting"
  },
  {
    title: "Save Section",
    description: "Click 'Create' to save the new section",
    expectedResult: "Section appears under the parent department"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "HR Recruitment Section",
    context: "Team within HR department focused on hiring",
    values: [
      { field: "Section Name", value: "Recruitment & Onboarding" },
      { field: "Section Code", value: "HR-REC" },
      { field: "Department", value: "Human Resources" },
      { field: "Section Supervisor", value: "Mary Johnson" }
    ],
    outcome: "Dedicated team for recruitment activities"
  },
  {
    title: "Night Shift Production Section",
    context: "Shift-based team in manufacturing",
    values: [
      { field: "Section Name", value: "Night Shift Team" },
      { field: "Section Code", value: "PROD-NS" },
      { field: "Department", value: "Production" },
      { field: "Section Supervisor", value: "Carlos Martinez" }
    ],
    outcome: "Enables shift-based scheduling and reporting"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Section codes must be unique within a department",
    enforcement: "System",
    description: "Prevents duplicate identifiers"
  },
  {
    rule: "Sections are optional in the hierarchy",
    enforcement: "Advisory",
    description: "Employees can be assigned directly to departments"
  },
  {
    rule: "Section supervisor must be in the same department",
    enforcement: "System",
    description: "Ensures valid reporting relationships"
  },
  {
    rule: "Deleting section requires reassigning employees",
    enforcement: "System",
    description: "Employees must be moved to department or another section"
  }
];

export function FoundationSections() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand when to use sections for team-level organization",
          "Create sections within departments",
          "Assign section supervisors for team leadership",
          "Decide whether sections add value for your organization"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            Understanding Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sections are <strong>optional</strong> sub-groupings within departments, 
            typically representing teams, units, or specialized work groups. They 
            provide an additional layer of organization for team-level management.
          </p>
          
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium mb-2">Hierarchy Position</h4>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <Badge variant="outline">Company</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="outline">Division</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="outline">Department</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="secondary">Section (Optional)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>When to Use Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Use Sections When</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Department has 15+ employees</li>
                <li>• Multiple team leads within a department</li>
                <li>• Shift-based work (Day/Night shifts)</li>
                <li>• Specialized sub-teams exist</li>
                <li>• Team-level performance tracking needed</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">⊘ Skip Sections When</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Small departments (under 15 employees)</li>
                <li>• Single manager per department</li>
                <li>• No distinct sub-teams</li>
                <li>• Simplicity is preferred</li>
                <li>• All employees work same schedule</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable
        title="Section Field Reference"
        fields={sectionFields}
      />

      <StepByStep
        title="Creating a Section"
        steps={creationSteps}
      />

      <ConfigurationExample
        title="Section Configuration Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Section Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="Sections vs Nested Departments">
        Use <strong>Sections</strong> for teams within a department that share the same 
        cost center. Use <strong>Nested Departments</strong> when sub-units need separate 
        cost tracking or have more formal organizational status.
      </InfoCallout>

      <TipCallout title="Common Section Patterns">
        Common section types include: Shift teams (Day/Night/Swing), Specialized units 
        (Recruitment, Payroll, Benefits within HR), Geographic teams (Region 1/2/3), 
        and Project teams (Implementation, Support).
      </TipCallout>
    </div>
  );
}
