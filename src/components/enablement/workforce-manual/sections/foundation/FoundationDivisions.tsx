import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderTree, Building, CheckCircle2, AlertCircle } from 'lucide-react';
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

const divisionFields: FieldDefinition[] = [
  {
    name: "Division Name",
    type: "Text",
    required: true,
    description: "Display name for the division (e.g., 'Operations')",
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
    description: "Company this division belongs to"
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
    description: "Master cost center for the division"
  },
  {
    name: "Start Date",
    type: "Date",
    required: true,
    description: "When this division becomes effective"
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
    description: "Active divisions appear in department assignments",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Divisions",
    description: "Go to Workforce → Org Chart or use the import wizard",
    expectedResult: "Organization structure page displays"
  },
  {
    title: "Access Division Management",
    description: "Click 'Manage Divisions' or use HR Hub → Data Import → Divisions",
    expectedResult: "Division management interface opens"
  },
  {
    title: "Click Add Division",
    description: "Click the 'Add Division' button",
    expectedResult: "Division creation form opens"
  },
  {
    title: "Enter Division Details",
    description: "Fill in division information",
    substeps: [
      "Enter descriptive name (e.g., 'Manufacturing Operations')",
      "Enter unique code (e.g., 'MFG-OPS')",
      "Select the parent company",
      "Optionally assign division head"
    ]
  },
  {
    title: "Save Division",
    description: "Click 'Create' to save",
    expectedResult: "Division available for department assignment"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Large Manufacturing Enterprise",
    context: "500+ employee company with distinct business units",
    values: [
      { field: "Division Name", value: "Manufacturing Operations" },
      { field: "Division Code", value: "MFG-OPS" },
      { field: "Company", value: "ABC Manufacturing Ltd" },
      { field: "Division Head", value: "Chief Operating Officer" },
      { field: "Cost Center", value: "MFG-000" }
    ],
    outcome: "Departments like Production, Quality, and Maintenance can be grouped under this division"
  },
  {
    title: "Regional Business Unit",
    context: "Geographic division for localized management",
    values: [
      { field: "Division Name", value: "Caribbean Retail" },
      { field: "Division Code", value: "CARIB-RTL" },
      { field: "Company", value: "XYZ Holdings" },
      { field: "Division Head", value: "Regional VP - Caribbean" }
    ],
    outcome: "All Caribbean retail departments roll up to this division for regional reporting"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Division codes must be unique within a company",
    enforcement: "System",
    description: "Same code can exist in different companies"
  },
  {
    rule: "Divisions with active departments cannot be deleted",
    enforcement: "System",
    description: "Must reassign departments first"
  },
  {
    rule: "Division head must be an active employee",
    enforcement: "System",
    description: "Only active employees appear in lookup"
  },
  {
    rule: "Cost center cascades to departments as default",
    enforcement: "Policy",
    description: "Departments can override with specific cost centers"
  }
];

const whenToUse = [
  { scenario: "500+ employees across multiple business units", recommended: true, reason: "Divisions simplify management and reporting" },
  { scenario: "Distinct P&L centers", recommended: true, reason: "Map divisions to financial business units" },
  { scenario: "Regional or product-line structures", recommended: true, reason: "Natural grouping for geographic/product divisions" },
  { scenario: "Under 200 employees", recommended: false, reason: "Department-level grouping is sufficient" },
  { scenario: "Single business function", recommended: false, reason: "Adds unnecessary hierarchy layer" }
];

export function FoundationDivisions() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand when divisions add value to organizational structure",
          "Create divisions for large enterprise groupings",
          "Link departments to divisions for rollup reporting",
          "Recognize when to skip this optional layer"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            Understanding Divisions
            <Badge variant="secondary">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Divisions are an optional organizational layer between Company and Department, 
            designed for large enterprises with 500+ employees. They group departments 
            into distinct business units, enabling rollup reporting and executive oversight.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2">Purpose</h4>
              <p className="text-sm text-muted-foreground">
                Group departments into business units for executive management
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2">Hierarchy Position</h4>
              <p className="text-sm text-muted-foreground">
                Company → Division → Department → Section
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2">Typical Use</h4>
              <p className="text-sm text-muted-foreground">
                Large enterprises with distinct P&L centers or business units
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            When to Use Divisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {whenToUse.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  item.recommended ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/30'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${
                  item.recommended ? 'text-green-500' : 'text-muted-foreground'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.scenario}</p>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>
                <Badge variant={item.recommended ? "default" : "secondary"}>
                  {item.recommended ? "Recommended" : "Skip"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.5.1: Division structure showing linked departments"
        alt="Division tree view with expandable department nodes and headcount indicators"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Division Field Reference"
        fields={divisionFields}
      />

      <StepByStep
        title="Creating a Division"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.5.2: Division creation form with company selector"
        alt="Division creation form showing all fields and company dropdown"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Division Configuration Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Division Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="Import Support">
        Divisions can be bulk imported via HR Hub → Data Import → Company Structure → Divisions. 
        Download the template, populate with your data, and import in batch. This is faster 
        than manual creation for organizations with many divisions.
      </InfoCallout>

      <TipCallout title="Skipping Divisions">
        If your organization has fewer than 500 employees or a flat structure, skip divisions 
        entirely. Departments can link directly to companies. Divisions can be added later 
        as the organization grows—existing departments can be reassigned.
      </TipCallout>
    </div>
  );
}
