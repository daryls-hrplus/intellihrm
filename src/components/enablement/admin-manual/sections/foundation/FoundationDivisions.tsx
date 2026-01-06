import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Building2, ArrowRight } from 'lucide-react';
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
import { FeatureStatusBadge } from '../../components';

const divisionFields: FieldDefinition[] = [
  {
    name: "Division Name",
    type: "Text",
    required: true,
    description: "Display name for the division",
    validation: "2-100 characters"
  },
  {
    name: "Division Code",
    type: "Text",
    required: true,
    description: "Short code for system reference",
    validation: "2-20 characters, uppercase"
  },
  {
    name: "Company",
    type: "Select",
    required: true,
    description: "Parent company for this division"
  },
  {
    name: "Division Head",
    type: "Employee Lookup",
    required: false,
    description: "Executive responsible for the division"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Purpose and scope of the division"
  },
  {
    name: "Cost Center",
    type: "Text",
    required: false,
    description: "Financial cost center code"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether the division is active",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Divisions",
    description: "Go to Admin → Organization → Divisions",
    expectedResult: "Divisions list page displays"
  },
  {
    title: "Click Create Division",
    description: "Click the 'Add Division' button",
    expectedResult: "Division creation form opens"
  },
  {
    title: "Select Parent Company",
    description: "Choose the company this division belongs to",
    expectedResult: "Company context is set"
  },
  {
    title: "Enter Division Details",
    description: "Fill in division name and code",
    substeps: [
      "Enter a descriptive name (e.g., 'Operations Division')",
      "Review or modify the auto-generated code",
      "Add description for clarity"
    ]
  },
  {
    title: "Assign Division Head (Optional)",
    description: "Select the executive leading this division",
    expectedResult: "Division head assigned for reporting hierarchy"
  },
  {
    title: "Save Division",
    description: "Click 'Create' to save the new division",
    expectedResult: "Division appears in the list"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Operations Division",
    context: "A large manufacturing company with distinct operational areas",
    values: [
      { field: "Division Name", value: "Operations Division" },
      { field: "Division Code", value: "OPS" },
      { field: "Company", value: "ABC Manufacturing Ltd" },
      { field: "Division Head", value: "John Smith (COO)" },
      { field: "Cost Center", value: "CC-OPS-001" }
    ],
    outcome: "Groups Production, Quality, and Maintenance departments"
  },
  {
    title: "Commercial Division",
    context: "Grouping all revenue-generating departments",
    values: [
      { field: "Division Name", value: "Commercial Division" },
      { field: "Division Code", value: "COMM" },
      { field: "Company", value: "ABC Manufacturing Ltd" },
      { field: "Division Head", value: "Jane Doe (CCO)" },
      { field: "Cost Center", value: "CC-COMM-001" }
    ],
    outcome: "Groups Sales, Marketing, and Business Development"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Division codes must be unique within a company",
    enforcement: "System",
    description: "Prevents duplicate identifiers"
  },
  {
    rule: "Division head must be an active employee in the company",
    enforcement: "System",
    description: "Ensures valid reporting relationships"
  },
  {
    rule: "Divisions are optional in the hierarchy",
    enforcement: "Advisory",
    description: "Can be skipped for simpler organizations"
  },
  {
    rule: "Deleting a division requires reassigning child departments",
    enforcement: "System",
    description: "Departments must be moved to another division or directly under company"
  }
];

export function FoundationDivisions() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand when to use divisions in your hierarchy",
          "Create and configure divisions within companies",
          "Assign division heads for executive oversight",
          "Decide whether to use or skip divisions"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Understanding Divisions
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Divisions are an <strong>optional</strong> organizational layer that sits 
            between Companies and Departments. They are useful for large enterprises 
            that need to group multiple departments under executive leadership areas.
          </p>
          
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              Hierarchy Position
              <FeatureStatusBadge status="implemented" size="sm" />
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">Company</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="secondary">Division (Optional)</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="outline">Department</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="outline">Section</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            When to Use Divisions
            <FeatureStatusBadge status="recommended" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Use Divisions When</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Company has 500+ employees</li>
                <li>• Multiple executive leadership areas exist</li>
                <li>• Need executive-level reporting roll-ups</li>
                <li>• Distinct business units within one legal entity</li>
                <li>• Separate P&L centers required</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">⊘ Skip Divisions When</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Company has fewer than 200 employees</li>
                <li>• Flat organizational structure</li>
                <li>• All departments report to one executive</li>
                <li>• Simplicity is preferred</li>
                <li>• No need for division-level analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable
        title="Division Field Reference"
        fields={divisionFields}
      />

      <StepByStep
        title="Creating a Division"
        steps={creationSteps}
      />

      <ConfigurationExample
        title="Division Configuration Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Division Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="Skipping Divisions">
        If you choose not to use divisions, departments will be created directly 
        under the company. This is perfectly valid and simplifies the hierarchy. 
        You can always add divisions later and reassign departments.
      </InfoCallout>

      <TipCallout title="Common Division Structures">
        Typical divisions include: Operations, Commercial, Finance, Corporate Services, 
        Human Resources, and Technology. The exact structure should mirror your 
        executive leadership team and strategic reporting needs.
      </TipCallout>
    </div>
  );
}
