import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Settings, Link, Layers } from 'lucide-react';
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

const companyGroupFields: FieldDefinition[] = [
  {
    name: "Group Name",
    type: "Text",
    required: true,
    description: "Display name for the company group (e.g., 'ABC Holdings')",
    validation: "2-150 characters, must be unique"
  },
  {
    name: "Group Code",
    type: "Text",
    required: true,
    description: "Short code for system reference",
    validation: "2-20 characters, uppercase, alphanumeric"
  },
  {
    name: "Territory",
    type: "Select",
    required: false,
    description: "Parent territory (if using territories)"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Purpose and scope of the company group"
  },
  {
    name: "Logo",
    type: "Image Upload",
    required: false,
    description: "Group logo for consolidated reports"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Active groups appear in company assignments",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Company Groups",
    description: "Go to Admin & Security → Company Groups",
    expectedResult: "Company Groups list page displays"
  },
  {
    title: "Click Add Company Group",
    description: "Click the 'Add Company Group' button",
    expectedResult: "Company group creation dialog opens"
  },
  {
    title: "Enter Group Details",
    description: "Fill in the group information",
    substeps: [
      "Enter a descriptive name (e.g., 'XYZ Holdings Limited')",
      "Enter or accept auto-generated code",
      "Select parent territory if applicable",
      "Add description explaining the group purpose"
    ]
  },
  {
    title: "Upload Group Logo",
    description: "Optional: Upload logo for branding",
    expectedResult: "Logo appears in group profile and reports"
  },
  {
    title: "Save Company Group",
    description: "Click 'Create' to save",
    expectedResult: "Company group appears in list ready for company assignment"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Multi-Company Holding Structure",
    context: "A holding company with multiple operating subsidiaries across Caribbean",
    values: [
      { field: "Group Name", value: "Caribbean Holdings Ltd" },
      { field: "Group Code", value: "CARIBHOLD" },
      { field: "Territory", value: "Caribbean" },
      { field: "Description", value: "Parent holding company for Jamaica, Trinidad, and Barbados operations" }
    ],
    outcome: "Subsidiaries share group branding while maintaining operational independence; enables M&A support"
  },
  {
    title: "Single Operating Entity",
    context: "A standalone company without holding structure",
    values: [
      { field: "Group Name", value: "ABC Manufacturing" },
      { field: "Group Code", value: "ABCMFG" },
      { field: "Territory", value: "None" },
      { field: "Description", value: "Standalone manufacturing operation" }
    ],
    outcome: "Simplified structure for single-entity operations; can be expanded later"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Company group codes must be unique across the system",
    enforcement: "System",
    description: "Prevents duplicate identifiers for integration"
  },
  {
    rule: "Groups with active companies cannot be deleted",
    enforcement: "System",
    description: "Must reassign or archive child companies first"
  },
  {
    rule: "Group settings cascade to child companies as defaults",
    enforcement: "Policy",
    description: "Companies can override inherited settings where needed"
  }
];

const sharedSettingsOptions = [
  { setting: "Leave Policies", description: "Standardize leave types and accrual rules" },
  { setting: "Security Settings", description: "Unified password and MFA policies" },
  { setting: "AI Governance", description: "Common AI usage limits and guardrails" },
  { setting: "Notification Templates", description: "Consistent communication branding" },
  { setting: "Approval Workflows", description: "Standardized approval routing" }
];

export function FoundationCompanyGroups() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand the role of company groups in holding structures",
          "Configure company groups for multi-entity organizations",
          "Enable settings inheritance for policy consistency",
          "Support M&A and consolidated reporting scenarios"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Understanding Company Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Company Groups organize related legal entities under a common umbrella, 
            enabling consolidated reporting and settings inheritance. They are essential 
            for holding company structures and support M&A activities.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Link className="h-4 w-4 text-blue-500" />
                Holding Company Mode
              </h4>
              <p className="text-sm text-muted-foreground">
                For parent companies with subsidiaries. Enables consolidated views, 
                cross-company transfers, and group-level governance.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-500" />
                Settings Inheritance
              </h4>
              <p className="text-sm text-muted-foreground">
                Shared settings cascade to child companies, ensuring consistency 
                while allowing local overrides where needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.3.1: Company Groups list showing holding structure with company counts"
        alt="Company Groups data grid with columns for name, code, territory, and child companies"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Company Group Field Reference"
        fields={companyGroupFields}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Inheritable Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            These settings can be defined at group level and inherited by all companies:
          </p>
          <div className="grid gap-3">
            {sharedSettingsOptions.map((opt) => (
              <div key={opt.setting} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium text-sm">{opt.setting}</h4>
                  <p className="text-sm text-muted-foreground">{opt.description}</p>
                </div>
                <Badge variant="secondary">Inheritable</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Company Group"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.3.2: Company Group creation form with logo upload"
        alt="Company Group form showing name, code, territory selector, and logo upload area"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Company Group Configuration Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Company Group Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="When to Use Company Groups">
        Use company groups when you have: (1) Multiple legal entities, (2) Holding company 
        structure, (3) Need for consolidated reporting, or (4) Cross-company employee 
        movements. Single-entity organizations can skip directly to Company setup.
      </InfoCallout>

      <TipCallout title="M&A Readiness">
        Even single-company organizations benefit from a group structure for future M&A. 
        Creating a group wrapper now makes acquiring or being acquired significantly easier.
      </TipCallout>
    </div>
  );
}
