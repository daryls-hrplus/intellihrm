import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, MapPin } from 'lucide-react';
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

const territoryFields: FieldDefinition[] = [
  {
    name: "Territory Name",
    type: "Text",
    required: true,
    description: "Display name for the territory (e.g., 'Caribbean Region')",
    validation: "2-100 characters, must be unique"
  },
  {
    name: "Territory Code",
    type: "Text",
    required: true,
    description: "Short code for system reference and reporting",
    validation: "2-20 characters, uppercase, alphanumeric"
  },
  {
    name: "Region Type",
    type: "Select",
    required: true,
    description: "Classification: Geographic, Business, or Regulatory"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Detailed description of territory scope and purpose"
  },
  {
    name: "Parent Territory",
    type: "Select",
    required: false,
    description: "For nested territory structures (e.g., Americas → Caribbean)"
  },
  {
    name: "Start Date",
    type: "Date",
    required: true,
    description: "When this territory becomes effective"
  },
  {
    name: "End Date",
    type: "Date",
    required: false,
    description: "Leave blank for indefinite; set for planned reorganizations"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Active territories appear in company assignments",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Territories",
    description: "Go to Admin & Security → Territories",
    expectedResult: "Territories list page displays with existing territories"
  },
  {
    title: "Click Add Territory",
    description: "Click the 'Add Territory' button in the header",
    expectedResult: "Territory creation dialog opens"
  },
  {
    title: "Enter Territory Details",
    description: "Fill in the territory information",
    substeps: [
      "Enter a descriptive name (e.g., 'Caribbean Operations')",
      "Enter or accept auto-generated code (e.g., 'CARIB')",
      "Select region type based on purpose",
      "Add description for documentation"
    ]
  },
  {
    title: "Configure Hierarchy",
    description: "Set parent territory if using nested structure",
    expectedResult: "Parent relationship established for reporting rollup"
  },
  {
    title: "Set Validity Dates",
    description: "Enter start date; leave end date blank for ongoing",
    expectedResult: "Territory effective dates defined"
  },
  {
    title: "Save Territory",
    description: "Click 'Create' to save the new territory",
    expectedResult: "Territory appears in list with company count of 0"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Caribbean Multi-Island Operations",
    context: "A company operating across multiple Caribbean territories",
    values: [
      { field: "Territory Name", value: "Caribbean" },
      { field: "Territory Code", value: "CARIB" },
      { field: "Region Type", value: "Geographic" },
      { field: "Parent Territory", value: "None" },
      { field: "Description", value: "Caribbean operations across Jamaica, Trinidad & Tobago, and Barbados" }
    ],
    outcome: "Enables consolidated Caribbean reporting while respecting island-specific compliance"
  },
  {
    title: "West Africa Regulatory Zone",
    context: "Grouping countries with similar regulatory requirements",
    values: [
      { field: "Territory Name", value: "West Africa" },
      { field: "Territory Code", value: "WAFRICA" },
      { field: "Region Type", value: "Regulatory" },
      { field: "Description", value: "ECOWAS member states with harmonized labor regulations" }
    ],
    outcome: "Supports regional compliance aggregation and policy inheritance"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Territory codes must be unique across the system",
    enforcement: "System",
    description: "Prevents duplicate codes for integration reliability"
  },
  {
    rule: "Territories with assigned companies cannot be deleted",
    enforcement: "System",
    description: "Must reassign companies before deletion"
  },
  {
    rule: "Start date must be before or equal to today for immediate use",
    enforcement: "System",
    description: "Future-dated territories won't appear in company dropdowns"
  },
  {
    rule: "Circular parent references are prevented",
    enforcement: "System",
    description: "A territory cannot be its own ancestor"
  }
];

export function FoundationTerritories() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand when and why to use territories",
          "Create and configure territories for geographic grouping",
          "Apply best practices for multi-country operations",
          "Set up territory hierarchies for regional reporting"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Understanding Territories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Territories represent the highest optional level of organizational hierarchy, 
            grouping multiple countries or regions. They enable consolidated reporting, 
            regional compliance management, and policy inheritance across company groups.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2">Purpose</h4>
              <p className="text-sm text-muted-foreground">
                Regional grouping for cross-country reporting and compliance boundaries
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2">Hierarchy Position</h4>
              <p className="text-sm text-muted-foreground">
                Top level: Territory → Company Group → Company
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2">When to Use</h4>
              <p className="text-sm text-muted-foreground">
                Multi-country operations with regional management structure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.2.1: Territories list showing active territories with company counts"
        alt="Territories data grid with columns for name, code, type, parent, companies, and status"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Territory Field Reference"
        fields={territoryFields}
      />

      <StepByStep
        title="Creating a Territory"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.2.2: Territory creation form with region type selector"
        alt="Territory creation dialog showing all fields and region type dropdown"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Territory Configuration Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Territory Business Rules"
        rules={businessRules}
      />

      <WarningCallout title="Multi-Country Compliance">
        Territories group countries for convenience but do not override country-specific 
        labor laws. Company-level configurations always take precedence for statutory 
        requirements. Use territories for reporting, not compliance enforcement.
      </WarningCallout>

      <TipCallout title="When to Skip Territories">
        If your organization operates in a single country or only 2-3 countries, 
        you can skip territories entirely. Start directly with Company Groups or 
        Companies. Territories can be added later as you expand internationally.
      </TipCallout>
    </div>
  );
}
