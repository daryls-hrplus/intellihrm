import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Layers, CheckCircle2 } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  FieldReferenceTable,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
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
    description: "Display name for the section (e.g., 'Payroll Team')",
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
    description: "Parent department this section belongs to"
  },
  {
    name: "Section Head",
    type: "Employee Lookup",
    required: false,
    description: "Team leader or supervisor"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Section responsibilities and scope"
  },
  {
    name: "Cost Center Override",
    type: "Text",
    required: false,
    description: "Override department cost center if section has its own"
  },
  {
    name: "Start Date",
    type: "Date",
    required: true,
    description: "When this section becomes effective"
  },
  {
    name: "End Date",
    type: "Date",
    required: false,
    description: "Leave blank for indefinite"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Active sections appear in position assignments",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Sections",
    description: "Go to Workforce → Org Chart or access via department management",
    expectedResult: "Section management interface displays"
  },
  {
    title: "Select Parent Department",
    description: "Choose the department for this section",
    expectedResult: "Existing sections for department display"
  },
  {
    title: "Click Add Section",
    description: "Click the 'Add Section' button",
    expectedResult: "Section creation form opens"
  },
  {
    title: "Enter Section Details",
    description: "Fill in section information",
    substeps: [
      "Enter section name (e.g., 'Benefits Administration')",
      "Enter unique code within department (e.g., 'BENEFITS')",
      "Optionally assign section head",
      "Add description of team responsibilities"
    ]
  },
  {
    title: "Configure Cost Center",
    description: "Override department cost center if needed",
    expectedResult: "Section-specific costing enabled"
  },
  {
    title: "Save Section",
    description: "Click 'Create' to save",
    expectedResult: "Section available for position assignment"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "HR Sub-Teams",
    context: "HR department with specialized functional teams",
    values: [
      { field: "Section Name", value: "Payroll & Benefits" },
      { field: "Section Code", value: "PAYROLL" },
      { field: "Department", value: "Human Resources" },
      { field: "Section Head", value: "Payroll Manager" }
    ],
    outcome: "Payroll staff positions assigned to this section for team-level reporting"
  },
  {
    title: "Production Shift Teams",
    context: "Manufacturing sections by shift",
    values: [
      { field: "Section Name", value: "Day Shift - Line A" },
      { field: "Section Code", value: "DAY-A" },
      { field: "Department", value: "Production" },
      { field: "Section Head", value: "Shift Supervisor - Day A" }
    ],
    outcome: "Enables shift-based scheduling and performance tracking"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Section codes must be unique within a department",
    enforcement: "System",
    description: "Same code can exist across different departments"
  },
  {
    rule: "Sections inherit department cost center by default",
    enforcement: "Policy",
    description: "Override only if section has distinct financial tracking"
  },
  {
    rule: "Sections with active positions cannot be deleted",
    enforcement: "System",
    description: "Must reassign positions first"
  },
  {
    rule: "Section head must report to department head",
    enforcement: "Advisory",
    description: "Recommended for proper reporting hierarchy"
  }
];

const sectionUseCases = [
  { useCase: "HR with Payroll, Recruitment, Benefits teams", recommended: true },
  { useCase: "Manufacturing with shift-based crews", recommended: true },
  { useCase: "Sales with regional teams under one department", recommended: true },
  { useCase: "IT with infrastructure, development, support teams", recommended: true },
  { useCase: "Small departments (<10 people)", recommended: false },
  { useCase: "Flat team structures", recommended: false }
];

export function FoundationSections() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand when sections add organizational value",
          "Create sections for team-level grouping within departments",
          "Assign section heads for supervisory clarity",
          "Enable section-level reporting and scheduling"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Understanding Sections
            <Badge variant="secondary">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sections represent sub-department teams within a department. They provide 
            granular grouping for team management, shift-based scheduling, and 
            supervisor assignment without creating full department structures.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2">Purpose</h4>
              <p className="text-sm text-muted-foreground">
                Team-level grouping for supervision and scheduling
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2">Hierarchy Position</h4>
              <p className="text-sm text-muted-foreground">
                Department → Section → Positions
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2">Typical Use</h4>
              <p className="text-sm text-muted-foreground">
                Functional teams, shift crews, regional sub-teams
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>When to Use Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {sectionUseCases.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  item.recommended ? 'bg-green-500/5' : 'bg-muted/30'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${
                  item.recommended ? 'text-green-500' : 'text-muted-foreground'
                }`} />
                <span className="text-sm flex-1">{item.useCase}</span>
                <Badge variant={item.recommended ? "default" : "secondary"} className="text-xs">
                  {item.recommended ? "Use Sections" : "Skip"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.7.1: Sections within a department showing team structure"
        alt="Department expanded to show sections with employee counts and section heads"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Section Field Reference"
        fields={sectionFields}
      />

      <StepByStep
        title="Creating a Section"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.7.2: Section creation form with department context"
        alt="Section creation form showing parent department, section head lookup, and cost center override"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Section Configuration Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Section Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="Section vs. Nested Departments">
        Use sections for simple team groupings without financial separation. 
        Use nested departments when teams need distinct cost centers, headcount 
        budgets, or appear as separate units in org charts.
      </InfoCallout>

      <TipCallout title="Time & Attendance Integration">
        Sections are particularly useful for shift-based scheduling. The Time & 
        Attendance module can filter schedules by section, enabling shift-level 
        management without complex department structures.
      </TipCallout>
    </div>
  );
}
