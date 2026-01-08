import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, UserCheck, DollarSign } from 'lucide-react';
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
import { FeatureStatusBadge } from '../../components';

const departmentFields: FieldDefinition[] = [
  {
    name: "Department Name",
    type: "Text",
    required: true,
    description: "Display name for the department",
    validation: "2-100 characters"
  },
  {
    name: "Department Code",
    type: "Text",
    required: true,
    description: "Short code for system reference and payroll",
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
    description: "Financial cost center code for budgeting"
  },
  {
    name: "GL Code",
    type: "Text",
    required: false,
    description: "General ledger code for financial integration"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Purpose and functions of the department"
  },
  {
    name: "Headcount Budget",
    type: "Number",
    required: false,
    description: "Approved number of positions"
  },
  {
    name: "Parent Department",
    type: "Select",
    required: false,
    description: "For nested department structures"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether the department is active",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Departments",
    description: "Go to Admin → Organization → Departments",
    expectedResult: "Departments list page displays"
  },
  {
    title: "Click Create Department",
    description: "Click the 'Add Department' button",
    expectedResult: "Department creation form opens"
  },
  {
    title: "Select Organizational Context",
    description: "Choose the company and optionally division",
    substeps: [
      "Select the parent company",
      "Select parent division if applicable",
      "Select parent department for nested structures"
    ]
  },
  {
    title: "Enter Department Details",
    description: "Fill in department identification",
    substeps: [
      "Enter department name (e.g., 'Human Resources')",
      "Enter or modify the department code",
      "Add description of department functions"
    ]
  },
  {
    title: "Configure Financial Codes",
    description: "Set up cost center and GL integration",
    substeps: [
      "Enter the cost center code from finance",
      "Enter GL code for payroll integration",
      "Set headcount budget if applicable"
    ]
  },
  {
    title: "Assign Department Head",
    description: "Select the department manager",
    expectedResult: "Reporting hierarchy established"
  },
  {
    title: "Save Department",
    description: "Click 'Create' to save the new department",
    expectedResult: "Department appears in the list and org chart"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Human Resources Department",
    context: "Core HR department for a mid-size company",
    values: [
      { field: "Department Name", value: "Human Resources" },
      { field: "Department Code", value: "HR" },
      { field: "Company", value: "ABC Ltd" },
      { field: "Division", value: "Corporate Services" },
      { field: "Cost Center", value: "CC-HR-001" },
      { field: "GL Code", value: "6100" },
      { field: "Headcount Budget", value: "15" }
    ],
    outcome: "HR department with full financial integration"
  },
  {
    title: "Nested Production Departments",
    context: "Manufacturing with specialized production areas",
    values: [
      { field: "Department Name", value: "Assembly Line 1" },
      { field: "Department Code", value: "PROD-AL1" },
      { field: "Parent Department", value: "Production" },
      { field: "Cost Center", value: "CC-PROD-AL1" },
      { field: "Headcount Budget", value: "45" }
    ],
    outcome: "Sub-department under main Production department"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Department codes must be unique within a company",
    enforcement: "System",
    description: "Required for payroll and reporting accuracy"
  },
  {
    rule: "Cost center is required for payroll integration",
    enforcement: "System",
    description: "Enables cost allocation in financial systems"
  },
  {
    rule: "Department head must be an employee in the same company",
    enforcement: "System",
    description: "Ensures valid organizational reporting"
  },
  {
    rule: "At least one department required before adding employees",
    enforcement: "System",
    description: "Employees must be assigned to a department"
  },
  {
    rule: "Circular parent relationships are prevented",
    enforcement: "System",
    description: "A department cannot be its own ancestor"
  },
  {
    rule: "Deleting department requires reassigning employees",
    enforcement: "System",
    description: "All employees must be moved first"
  }
];

export function FoundationDepartments() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create and configure departments as core organizational units",
          "Set up cost centers for financial integration",
          "Establish department management and reporting structures",
          "Understand nested department capabilities"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Understanding Departments
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Departments are the <strong>mandatory core organizational units</strong> in Intelli HRM. 
            They represent functional areas where employees work, managers lead, and costs 
            are tracked. Every employee must be assigned to a department.
          </p>
          
          <WarningCallout title="Required Before Employees">
            You must create at least one department before adding any employees to the 
            system. Departments are fundamental to org structure, payroll, and reporting.
          </WarningCallout>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.6.1: Departments navigation in Admin → Organization menu"
        alt="Admin menu with Organization submenu expanded and Departments option highlighted"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Financial Integration
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Cost Center
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <p className="text-sm text-muted-foreground">
                Links to your finance system for cost allocation. All employee costs 
                (salary, benefits, training) are charged to this code.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                GL Code
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <p className="text-sm text-muted-foreground">
                General Ledger code for payroll journal entries. Enables automated 
                posting to your accounting system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable
        title="Department Field Reference"
        fields={departmentFields}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.6.2: Departments list with tree view showing nested structure"
        alt="Departments data grid with expandable tree showing parent-child relationships and cost centers"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Nested Department Structures
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Intelli HRM supports nested departments for complex organizations. Use the 
            "Parent Department" field to create hierarchies within departments.
          </p>
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium mb-2">Example Nested Structure</h4>
            <div className="text-sm font-mono space-y-1">
              <div>📁 Production</div>
              <div className="ml-4">📁 Assembly</div>
              <div className="ml-8">📁 Assembly Line 1</div>
              <div className="ml-8">📁 Assembly Line 2</div>
              <div className="ml-4">📁 Quality Control</div>
              <div className="ml-4">📁 Packaging</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Department"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.6.3: Department creation form with cost center configuration"
        alt="Department creation form showing name, code, parent department, cost center, and GL code fields"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Department Configuration Examples"
        examples={configExamples}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.6.4: Nested department structure in org chart view"
        alt="Visual org chart showing Production department with nested Assembly and Quality Control sub-departments"
        aspectRatio="wide"
      />

      <BusinessRules
        title="Department Business Rules"
        rules={businessRules}
      />

      <TipCallout title="Naming Conventions">
        Establish consistent naming conventions early: "Human Resources" vs "HR", 
        "Information Technology" vs "IT". Use full names for clarity and short codes 
        for the department code field.
      </TipCallout>
    </div>
  );
}
