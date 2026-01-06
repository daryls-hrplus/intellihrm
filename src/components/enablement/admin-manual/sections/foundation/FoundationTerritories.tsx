import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Building2, AlertTriangle } from 'lucide-react';
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
import territoriesListMockup from '@/assets/manual-mockups/territories-list.png';

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
    description: "Short code for system reference",
    validation: "2-20 characters, uppercase, no spaces",
    defaultValue: "Auto-generated from name"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Detailed description of the territory scope"
  },
  {
    name: "Countries",
    type: "Multi-Select",
    required: true,
    description: "Countries included in this territory"
  },
  {
    name: "Default Currency",
    type: "Select",
    required: true,
    description: "Primary currency for the territory"
  },
  {
    name: "Default Timezone",
    type: "Select",
    required: true,
    description: "Primary timezone for territory-level operations"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether the territory is active",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Territories",
    description: "Go to Admin → Organization → Territories",
    expectedResult: "Territories list page displays"
  },
  {
    title: "Click Create Territory",
    description: "Click the 'Add Territory' button in the top right",
    expectedResult: "Territory creation form opens"
  },
  {
    title: "Enter Territory Details",
    description: "Fill in the territory name, code, and description",
    substeps: [
      "Enter a descriptive name (e.g., 'Caribbean Operations')",
      "Review or modify the auto-generated code",
      "Add description for clarity"
    ]
  },
  {
    title: "Select Countries",
    description: "Choose all countries that belong to this territory",
    expectedResult: "Selected countries appear as tags"
  },
  {
    title: "Configure Defaults",
    description: "Set the default currency and timezone",
    substeps: [
      "Select the primary currency used in the territory",
      "Choose the timezone for headquarters or most employees"
    ]
  },
  {
    title: "Save Territory",
    description: "Click 'Create' to save the new territory",
    expectedResult: "Territory appears in the list with 'Active' status"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Caribbean Multi-Island Territory",
    context: "A company operating across multiple Caribbean islands",
    values: [
      { field: "Territory Name", value: "Caribbean Region" },
      { field: "Territory Code", value: "CARIB" },
      { field: "Countries", value: "Jamaica, Trinidad & Tobago, Barbados, Bahamas" },
      { field: "Default Currency", value: "USD" },
      { field: "Default Timezone", value: "America/Jamaica (EST)" }
    ],
    outcome: "Centralizes Caribbean operations while respecting local regulations"
  },
  {
    title: "West Africa Territory",
    context: "Expansion into West African markets",
    values: [
      { field: "Territory Name", value: "West Africa Operations" },
      { field: "Territory Code", value: "WAFRICA" },
      { field: "Countries", value: "Ghana, Nigeria, Ivory Coast" },
      { field: "Default Currency", value: "USD" },
      { field: "Default Timezone", value: "Africa/Accra (GMT)" }
    ],
    outcome: "Groups regional operations for consolidated management"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "A country can only belong to one territory",
    enforcement: "System",
    description: "System prevents duplicate country assignments across territories"
  },
  {
    rule: "At least one country must be selected",
    enforcement: "System",
    description: "Territories cannot exist without assigned countries"
  },
  {
    rule: "Default currency must be available in all selected countries",
    enforcement: "Policy",
    description: "Warning displayed if currency may cause conversion issues"
  },
  {
    rule: "Territory deletion requires no active company groups",
    enforcement: "System",
    description: "Must reassign or delete child company groups first"
  }
];

export function FoundationTerritories() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand the purpose of territories in the organizational hierarchy",
          "Create and configure territories for your geographic footprint",
          "Assign countries and set appropriate defaults",
          "Apply best practices for multi-region operations"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Understanding Territories
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Territories represent the highest level of organizational hierarchy in HRplus, 
            grouping countries into manageable regions. They are particularly useful for 
            multinational organizations that need to aggregate reporting, manage regional 
            compliance, and set consistent defaults across countries.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Purpose
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <p className="text-sm text-muted-foreground">
                Regional grouping for reporting, compliance aggregation, and default settings
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Hierarchy Position
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <p className="text-sm text-muted-foreground">
                Top level: Territory → Company Group → Company → Division → Department
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Optional?
                <FeatureStatusBadge status="recommended" size="sm" />
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes - single-country operations can skip directly to Company Group
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.2.1: Navigating to Territories from Admin → Organization menu"
        alt="Admin menu expanded showing Organization submenu with Territories option highlighted"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Territory Field Reference"
        fields={territoryFields}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.2.2: Territories list view showing existing territories with countries"
        alt="Territories data grid with columns for name, code, countries, currency, and status"
        aspectRatio="wide"
        imageSrc={territoriesListMockup}
      />

      <StepByStep
        title="Creating a Territory"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.2.3: Territory creation form with country multi-select"
        alt="Territory creation form showing name, code, country selection dropdown, and currency/timezone fields"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Territory Configuration Examples"
        examples={configExamples}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.2.4: Successfully created territory with Active status"
        alt="Territory detail view showing Caribbean Region territory with assigned countries and settings"
        aspectRatio="wide"
      />

      <BusinessRules
        title="Territory Business Rules"
        rules={businessRules}
      />

      <WarningCallout title="Multi-Country Considerations">
        When a territory spans multiple countries with different labor laws, ensure that 
        Company-level configurations override territory defaults where legally required. 
        Territories provide convenience defaults, not compliance enforcement.
      </WarningCallout>

      <TipCallout title="When to Skip Territories">
        If your organization operates in a single country, you can skip territory 
        configuration entirely. Start with Company Groups or even directly with Companies 
        for simpler setups. Territories can be added later if you expand internationally.
      </TipCallout>
    </div>
  );
}
