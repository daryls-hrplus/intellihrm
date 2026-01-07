import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, UserCheck, FolderTree } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  FieldReferenceTable,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  WarningCallout,
  ScreenshotPlaceholder,
  type Step,
  type FieldDefinition,
  type ExampleConfig,
  type BusinessRule
} from '../../../manual/components';

const departmentFields: FieldDefinition[] = [
  {
    name: "Department Name",
    type: "Text",
    required: true,
    description: "Display name for the department (e.g., 'Human Resources')",
    validation: "2-100 characters"
  },
  {
    name: "Department Code",
    type: "Text",
    required: true,
    description: "Short code for system reference and payroll exports",
    validation: "2-20 characters, uppercase"
  },
  {
    name: "Company",
    type: "Select",
    required: true,
    description: "Company this department belongs to"
  },
  {
    name: "Division",
    type: "Select",
    required: false,
    description: "Parent division (if using divisions)"
  },
  {
    name: "Department Head",
    type: "Employee Lookup",
    required: false,
    description: "Manager responsible for the department"
  },
  {
    name: "Cost Center",
    type: "Text",
    required: true,
    description: "Financial cost center code for GL integration"
  },
  {
    name: "GL Account",
    type: "Text",
    required: false,
    description: "General ledger account for payroll posting"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Department function and responsibilities"
  },
  {
    name: "Headcount Budget",
    type: "Number",
    required: false,
    description: "Approved headcount for position control"
  },
  {
    name: "Parent Department",
    type: "Select",
    required: false,
    description: "For nested department hierarchies"
  },
  {
    name: "Start Date",
    type: "Date",
    required: true,
    description: "When this department becomes effective"
  },
  {
    name: "End Date",
    type: "Date",
    required: false,
    description: "For planned reorganizations"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Active departments appear in position assignments",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Departments",
    description: "Go to Workforce → Org Chart or Admin → Organization",
    expectedResult: "Department management interface displays"
  },
  {
    title: "Select Company Context",
    description: "Choose the company for this department",
    expectedResult: "Existing departments for company display"
  },
  {
    title: "Click Add Department",
    description: "Click the 'Add Department' button",
    expectedResult: "Department creation form opens"
  },
  {
    title: "Enter Department Details",
    description: "Fill in department information",
    substeps: [
      "Enter department name (e.g., 'Finance & Accounting')",
      "Enter unique code (e.g., 'FIN')",
      "Select division if applicable",
      "Assign department head"
    ]
  },
  {
    title: "Configure Financial Integration",
    description: "Set cost center and GL account",
    substeps: [
      "Enter cost center from Finance chart of accounts",
      "Optionally add GL account for payroll",
      "Set headcount budget if using position control"
    ]
  },
  {
    title: "Save Department",
    description: "Click 'Create' to save",
    expectedResult: "Department ready for position and section creation"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Core HR Department",
    context: "Standard HR department with cost center integration",
    values: [
      { field: "Department Name", value: "Human Resources" },
      { field: "Department Code", value: "HR" },
      { field: "Company", value: "ABC Jamaica Ltd" },
      { field: "Cost Center", value: "HR-100" },
      { field: "Department Head", value: "HR Director" },
      { field: "Headcount Budget", value: "15" }
    ],
    outcome: "Positions created under this department auto-inherit cost center HR-100"
  },
  {
    title: "Nested IT Structure",
    context: "IT department with sub-departments",
    values: [
      { field: "Department Name", value: "Information Technology" },
      { field: "Department Code", value: "IT" },
      { field: "Cost Center", value: "IT-000" }
    ],
    outcome: "Can create child departments: IT-Infrastructure (IT-100), IT-Applications (IT-200)"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Department codes must be unique within a company",
    enforcement: "System",
    description: "Same code can exist across different companies"
  },
  {
    rule: "Cost center is required for payroll integration",
    enforcement: "System",
    description: "GL exports require cost center mapping"
  },
  {
    rule: "Departments with active positions cannot be deleted",
    enforcement: "System",
    description: "Must reassign or end-date positions first"
  },
  {
    rule: "Nested departments inherit parent cost center as default",
    enforcement: "Policy",
    description: "Child departments can override with specific cost centers"
  },
  {
    rule: "Headcount budget enforces position control",
    enforcement: "Advisory",
    description: "Warning when creating positions beyond budget"
  }
];

export function FoundationDepartments() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create departments as mandatory organizational units",
          "Configure cost centers for financial integration",
          "Set up department heads and reporting structures",
          "Understand nested department capabilities"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            Understanding Departments
            <Badge variant="default">Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Departments are the core organizational unit in HRplus, representing 
            functional business units with cost center ownership. Every company 
            must have at least one department, and all positions are assigned 
            to departments.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Financial Integration
              </h4>
              <p className="text-sm text-muted-foreground">
                Cost centers link departments to GL accounts for payroll posting 
                and budget tracking. Required for financial reporting.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-500" />
                Position Control
              </h4>
              <p className="text-sm text-muted-foreground">
                Headcount budgets enable position control, alerting when 
                departments exceed approved staffing levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WarningCallout title="Cost Center Alignment">
        Coordinate with Finance to ensure department cost centers match the 
        chart of accounts. Misaligned cost centers cause payroll export 
        rejections and budget tracking failures. Get Finance sign-off before configuration.
      </WarningCallout>

      <ScreenshotPlaceholder
        caption="Figure 2.6.1: Departments list with headcount and cost center indicators"
        alt="Departments data grid showing name, code, cost center, headcount actual vs budget"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Department Field Reference"
        fields={departmentFields}
      />

      <StepByStep
        title="Creating a Department"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.6.2: Department creation form with cost center and GL fields"
        alt="Department form showing all fields including financial integration options"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Department Configuration Examples"
        examples={configExamples}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Nested Departments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HRplus supports multi-level department hierarchies. Use Parent Department 
            to create structures like:
          </p>
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
            <div>IT (IT-000)</div>
            <div className="ml-4">├── IT Infrastructure (IT-100)</div>
            <div className="ml-4">├── IT Applications (IT-200)</div>
            <div className="ml-4">│   ├── Web Development (IT-210)</div>
            <div className="ml-4">│   └── Mobile Development (IT-220)</div>
            <div className="ml-4">└── IT Security (IT-300)</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Rollup reporting aggregates headcount and costs up the hierarchy. 
            Positions can be assigned at any level.
          </p>
        </CardContent>
      </Card>

      <BusinessRules
        title="Department Business Rules"
        rules={businessRules}
      />

      <TipCallout title="Bulk Import">
        For organizations with many departments, use HR Hub → Data Import → 
        Company Structure → Departments. The template includes parent references 
        for creating nested structures in a single import operation.
      </TipCallout>
    </div>
  );
}
