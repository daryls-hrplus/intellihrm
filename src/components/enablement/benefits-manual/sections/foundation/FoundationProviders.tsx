import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Clock, Network, Globe } from "lucide-react";
import { 
  LearningObjectives,
  FieldReferenceTable,
  StepByStep,
  ConfigurationExample,
  TipCallout,
  InfoCallout,
  IntegrationCallout,
  type FieldDefinition,
  type Step,
  type ExampleConfig
} from '../../../manual/components';
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

const providerFields: FieldDefinition[] = [
  {
    name: "Provider Name",
    required: true,
    type: "Text",
    description: "Legal or trading name of the provider",
    defaultValue: "—",
    validation: "Max 100 characters"
  },
  {
    name: "Provider Code",
    required: true,
    type: "Text",
    description: "Unique identifier for integration and reporting",
    defaultValue: "—",
    validation: "Alphanumeric, no spaces"
  },
  {
    name: "Provider Type",
    required: true,
    type: "Select",
    description: "Classification of provider (Insurer, TPA, Vendor)",
    defaultValue: "Insurer",
    validation: "Must select one option"
  },
  {
    name: "Tax ID / Registration",
    required: false,
    type: "Text",
    description: "Government registration or tax identification number",
    defaultValue: "—",
    validation: "Format varies by country"
  },
  {
    name: "Website",
    required: false,
    type: "URL",
    description: "Provider's main website",
    defaultValue: "—",
    validation: "Valid URL format"
  },
  {
    name: "Portal URL",
    required: false,
    type: "URL",
    description: "Employee/Employer portal for claims and enrollment",
    defaultValue: "—",
    validation: "Valid URL format"
  },
  {
    name: "Categories Served",
    required: true,
    type: "Multi-Select",
    description: "Which benefit categories this provider covers",
    defaultValue: "—",
    validation: "At least one category required"
  },
  {
    name: "Status",
    required: true,
    type: "Select",
    description: "Active or Inactive for new enrollments",
    defaultValue: "Active",
    validation: "—"
  },
  {
    name: "Country/Region",
    required: true,
    type: "Select",
    description: "Primary operating region for the provider",
    defaultValue: "—",
    validation: "Must match legal entity region"
  }
];

const providerSetupSteps: Step[] = [
  {
    title: "Navigate to Providers",
    description: "Access the provider management screen.",
    substeps: [
      "Go to Benefits → Configuration → Providers",
      "Review existing providers if any"
    ],
    expectedResult: "Provider list screen displayed"
  },
  {
    title: "Add New Provider",
    description: "Create a new provider record.",
    substeps: [
      "Click 'Add Provider' button",
      "Enter provider name and code",
      "Select provider type",
      "Enter tax ID or registration number"
    ],
    expectedResult: "Provider basic info captured"
  },
  {
    title: "Configure Contact Information",
    description: "Add portal URLs and communication details.",
    substeps: [
      "Enter provider website URL",
      "Add employer portal URL",
      "Add employee portal URL (if different)",
      "Note any SSO or integration requirements"
    ],
    expectedResult: "Provider accessible via configured URLs"
  },
  {
    title: "Assign Categories",
    description: "Link provider to benefit categories they serve.",
    substeps: [
      "Select all applicable categories",
      "Verify categories match contract scope",
      "Consider regional category variations"
    ],
    expectedResult: "Provider linked to correct categories"
  },
  {
    title: "Configure Integration",
    description: "Set up data exchange settings if applicable.",
    substeps: [
      "Select integration method (EDI, API, File)",
      "Configure enrollment feed schedule",
      "Set up eligibility file format",
      "Test connection if available"
    ],
    expectedResult: "Integration ready for enrollment data"
  },
  {
    title: "Activate Provider",
    description: "Complete setup and make provider available.",
    substeps: [
      "Set status to Active",
      "Save provider record",
      "Verify provider appears in plan setup"
    ],
    expectedResult: "Provider available for plan configuration"
  }
];

const providerExamples: ExampleConfig[] = [
  {
    title: "US Health Insurer",
    context: "Major national health insurance carrier for medical and dental",
    values: [
      { field: "Provider Name", value: "Blue Cross Blue Shield" },
      { field: "Provider Code", value: "BCBS" },
      { field: "Provider Type", value: "Insurer" },
      { field: "Categories Served", value: "Medical, Dental" },
      { field: "Country/Region", value: "United States" }
    ],
    outcome: "Provider available for all US medical and dental plans"
  },
  {
    title: "Caribbean Group Insurer",
    context: "Regional insurer serving multiple Caribbean territories",
    values: [
      { field: "Provider Name", value: "Guardian Life Caribbean" },
      { field: "Provider Code", value: "GLC-CAR" },
      { field: "Provider Type", value: "Insurer" },
      { field: "Categories Served", value: "Group Health, Life Insurance" },
      { field: "Country/Region", value: "Caribbean" }
    ],
    outcome: "Provider available for Caribbean group health and life plans"
  },
  {
    title: "Ghana Pension Administrator",
    context: "SSNIT tier-2 pension scheme administrator",
    values: [
      { field: "Provider Name", value: "Enterprise Trustees" },
      { field: "Provider Code", value: "ENT-GH" },
      { field: "Provider Type", value: "TPA" },
      { field: "Categories Served", value: "Retirement" },
      { field: "Country/Region", value: "Ghana" }
    ],
    outcome: "Provider linked to Ghana tier-2 pension contributions"
  },
  {
    title: "Wellness Vendor",
    context: "Global wellness platform for employee programs",
    values: [
      { field: "Provider Name", value: "Virgin Pulse" },
      { field: "Provider Code", value: "VP-WELL" },
      { field: "Provider Type", value: "Vendor" },
      { field: "Categories Served", value: "Wellness" },
      { field: "Country/Region", value: "Global" }
    ],
    outcome: "Wellness provider available across all regions"
  }
];

export function FoundationProviders() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div id="ben-sec-2-3" className="border-b border-border pb-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="font-medium">Part 2</span>
          <span>•</span>
          <span>Section 2.3</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Benefit Providers Setup</h2>
            <p className="text-muted-foreground mt-1">
              Insurance carriers, retirement plan administrators, wellness vendors
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            18 min read
          </Badge>
          <Badge variant="outline" className="text-xs">Foundation</Badge>
          <Badge variant="outline" className="text-xs">Integration</Badge>
        </div>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Configure provider records for insurance carriers and vendors",
          "Link providers to appropriate benefit categories",
          "Set up integration settings for enrollment data exchange",
          "Manage regional providers for Caribbean and African operations"
        ]}
      />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="h-5 w-5 text-primary" />
            Provider Ecosystem
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            Providers are the insurance companies, third-party administrators (TPAs), and vendors 
            that deliver benefit services. Each provider record stores key information for 
            administration, integration, and employee communication.
          </p>
        </CardContent>
      </Card>

      {/* Provider Types Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Insurers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Insurance companies that underwrite and administer health, life, and disability coverage.</p>
            <ul className="mt-2 space-y-1">
              <li>• Health insurance carriers</li>
              <li>• Life/AD&D insurers</li>
              <li>• Disability carriers</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">TPAs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Third-party administrators that manage plans, claims, or contributions.</p>
            <ul className="mt-2 space-y-1">
              <li>• 401(k) recordkeepers</li>
              <li>• FSA/HSA administrators</li>
              <li>• COBRA administrators</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vendors</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Service providers offering supplemental benefit programs.</p>
            <ul className="mt-2 space-y-1">
              <li>• Wellness platforms</li>
              <li>• EAP providers</li>
              <li>• Discount programs</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Field Reference */}
      <FieldReferenceTable
        fields={providerFields}
        title="Provider Configuration Fields"
      />

      {/* Step-by-Step */}
      <StepByStep
        steps={providerSetupSteps}
        title="Provider Setup Steps"
      />

      {/* Configuration Examples */}
      <ConfigurationExample
        examples={providerExamples}
        title="Provider Configuration Examples"
      />

      {/* Integration Callout */}
      <IntegrationCallout title="Integration Architecture">
        <div className="space-y-2 text-sm">
          <p><strong>EDI (Electronic Data Interchange):</strong> Standard 834 enrollment files 
          for US health insurers. Scheduled daily or weekly transmission.</p>
          <p><strong>API Integration:</strong> Real-time eligibility verification and enrollment 
          confirmation for modern carriers and TPAs.</p>
          <p><strong>File-Based:</strong> CSV or Excel exports for smaller providers or regional 
          carriers without electronic integration.</p>
        </div>
      </IntegrationCallout>

      {/* Regional Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Regional Provider Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Caribbean</h4>
            <p className="text-muted-foreground">
              Multi-island operations often require separate provider relationships per territory. 
              Common regional carriers include Guardian Life Caribbean, Sagicor, and CLICO. 
              Ensure providers are licensed in each territory where employees are based.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Ghana</h4>
            <p className="text-muted-foreground">
              SSNIT manages tier-1 pension. Tier-2 requires licensed trustees like Enterprise Trustees 
              or NTHC. NHIS provides national health coverage with private top-up options available.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Nigeria</h4>
            <p className="text-muted-foreground">
              PenCom-licensed Pension Fund Administrators (PFAs) manage retirement contributions. 
              NHIS-accredited HMOs provide health coverage. Ensure RSA (Retirement Savings Account) 
              integration for pension remittances.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        title="Provider Configuration"
        description="Provider setup form showing company information, contact details, categories served, and integration settings"
        height="h-48"
      />

      {/* Tips */}
      <TipCallout title="Provider Management Best Practices">
        Maintain provider records even after contract termination for historical reporting. 
        Set terminated providers to Inactive rather than deleting. Schedule annual provider 
        information reviews to ensure portal URLs and contacts remain current.
      </TipCallout>

      <InfoCallout title="Provider vs. Plan Relationship">
        One provider can offer multiple plans across different categories. For example, a major 
        insurer might provide Medical, Dental, Vision, and Life plans. Link the provider once, 
        then associate specific plans during plan configuration.
      </InfoCallout>
    </div>
  );
}
