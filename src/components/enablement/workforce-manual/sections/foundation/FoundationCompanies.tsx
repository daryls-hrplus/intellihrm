import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, Shield, Landmark, Calendar } from 'lucide-react';
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

const companyFields: FieldDefinition[] = [
  {
    name: "Company Name",
    type: "Text",
    required: true,
    description: "Legal registered name of the company",
    validation: "2-200 characters, must be unique"
  },
  {
    name: "Company Code",
    type: "Text",
    required: true,
    description: "Short code for system reference and payroll",
    validation: "2-20 characters, uppercase"
  },
  {
    name: "Company Group",
    type: "Select",
    required: false,
    description: "Parent company group for holding structures"
  },
  {
    name: "Country",
    type: "Select",
    required: true,
    description: "Country where company is legally registered"
  },
  {
    name: "Registration Number",
    type: "Text",
    required: true,
    description: "Company registration/incorporation number"
  },
  {
    name: "Tax ID (TIN/TRN)",
    type: "Text",
    required: true,
    description: "Tax registration number for payroll compliance"
  },
  {
    name: "Industry",
    type: "Select",
    required: true,
    description: "Primary industry classification (NAICS/ISIC)"
  },
  {
    name: "Company Type",
    type: "Select",
    required: true,
    description: "Legal entity type: Limited, LLC, Partnership, etc."
  },
  {
    name: "Base Currency",
    type: "Select",
    required: true,
    description: "Primary operating and reporting currency"
  },
  {
    name: "Fiscal Year Start",
    type: "Month Selector",
    required: true,
    description: "First month of fiscal year (January = 1)"
  },
  {
    name: "Default Timezone",
    type: "Select",
    required: true,
    description: "Headquarters timezone for scheduling defaults"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Active companies appear in all dropdowns",
    defaultValue: "True"
  }
];

const statutoryFields: FieldDefinition[] = [
  {
    name: "NIS Number",
    type: "Text",
    required: true,
    description: "National Insurance Scheme employer registration"
  },
  {
    name: "NHT Number",
    type: "Text",
    required: false,
    description: "National Housing Trust registration (Jamaica)"
  },
  {
    name: "HEART Number",
    type: "Text",
    required: false,
    description: "HEART/NSTA Trust registration (Jamaica)"
  },
  {
    name: "Pension Scheme ID",
    type: "Text",
    required: false,
    description: "Company pension scheme registration"
  },
  {
    name: "SSNIT Number",
    type: "Text",
    required: false,
    description: "Social Security (Ghana)"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Companies",
    description: "Go to Admin & Security → Companies",
    expectedResult: "Companies list page displays"
  },
  {
    title: "Click Add Company",
    description: "Click the 'Add Company' button",
    expectedResult: "Company creation form opens"
  },
  {
    title: "Enter Basic Information",
    description: "Fill in company identification details",
    substeps: [
      "Enter legal company name exactly as registered",
      "Enter unique company code (e.g., 'JAM01')",
      "Select company group if applicable",
      "Select country of registration"
    ]
  },
  {
    title: "Enter Registration Details",
    description: "Add legal and tax registration information",
    substeps: [
      "Enter company registration number",
      "Enter tax identification number",
      "Select industry classification",
      "Select legal entity type"
    ]
  },
  {
    title: "Configure Financial Settings",
    description: "Set currency and fiscal year",
    substeps: [
      "Select base currency",
      "Set fiscal year start month",
      "Configure default timezone"
    ]
  },
  {
    title: "Add Statutory Registrations",
    description: "Enter employer registrations for payroll",
    expectedResult: "Company ready for payroll configuration"
  },
  {
    title: "Save Company",
    description: "Click 'Create' to save",
    expectedResult: "Company appears in list; can now add departments"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Caribbean Operating Company",
    context: "A Jamaican legal entity with statutory requirements",
    values: [
      { field: "Company Name", value: "ABC Jamaica Limited" },
      { field: "Company Code", value: "ABCJAM" },
      { field: "Country", value: "Jamaica" },
      { field: "Registration Number", value: "123456-7" },
      { field: "Tax ID (TRN)", value: "123-456-789" },
      { field: "NIS Number", value: "E1234567" },
      { field: "Currency", value: "JMD" },
      { field: "Fiscal Year Start", value: "January" }
    ],
    outcome: "Fully configured for Jamaican payroll compliance with NIS, NHT, HEART"
  },
  {
    title: "Ghana Subsidiary",
    context: "West African subsidiary with local compliance",
    values: [
      { field: "Company Name", value: "ABC Ghana Ltd" },
      { field: "Company Code", value: "ABCGHA" },
      { field: "Country", value: "Ghana" },
      { field: "SSNIT Number", value: "GHA-12345678" },
      { field: "Currency", value: "GHS" },
      { field: "Fiscal Year Start", value: "January" }
    ],
    outcome: "Ready for Ghana statutory compliance with SSNIT pension"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Company codes must be unique across all company groups",
    enforcement: "System",
    description: "Prevents integration conflicts"
  },
  {
    rule: "Country selection determines available statutory fields",
    enforcement: "System",
    description: "Jamaica shows NIS/NHT, Ghana shows SSNIT, etc."
  },
  {
    rule: "Active companies require at least one department",
    enforcement: "Advisory",
    description: "Warning shown; doesn't block creation"
  },
  {
    rule: "Fiscal year changes require period-end processing",
    enforcement: "Policy",
    description: "Changing fiscal year mid-period affects reporting"
  }
];

export function FoundationCompanies() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create legal entities with complete registration details",
          "Configure country-specific statutory requirements",
          "Set up fiscal year and currency for financial integration",
          "Understand company as the foundation for all workforce data"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Understanding Companies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Companies represent individual legal entities in HRplus—the core unit for 
            payroll, compliance, and organizational structure. Each company must be 
            registered in a specific country and configured with local statutory requirements.
          </p>
          
          <WarningCallout title="Critical Configuration">
            Company setup directly impacts payroll calculations and statutory reporting. 
            Verify all registration numbers with legal/finance before configuration. 
            Incorrect TIN or NIS numbers cause compliance failures.
          </WarningCallout>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.4.1: Companies list with key compliance indicators"
        alt="Companies data grid showing name, code, country, currency, and compliance status badges"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Company Field Reference"
        fields={companyFields}
      />

      <FieldReferenceTable
        title="Statutory Registration Fields"
        fields={statutoryFields}
      />

      <StepByStep
        title="Creating a Company"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.4.2: Company creation form with statutory body registrations"
        alt="Multi-step company form showing basic info, registration, and statutory fields"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Company Configuration Examples"
        examples={configExamples}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Fiscal Year Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Companies can manage multiple fiscal years for historical reporting and 
            future planning. The Company Fiscal Years feature allows:
          </p>
          <ul className="grid gap-2 md:grid-cols-2">
            <li className="flex items-center gap-2 p-3 rounded-lg border">
              <Badge variant="outline">Historical</Badge>
              <span className="text-sm">Maintain closed fiscal year records</span>
            </li>
            <li className="flex items-center gap-2 p-3 rounded-lg border">
              <Badge variant="default">Current</Badge>
              <span className="text-sm">Active fiscal year for operations</span>
            </li>
            <li className="flex items-center gap-2 p-3 rounded-lg border">
              <Badge variant="secondary">Future</Badge>
              <span className="text-sm">Plan ahead for upcoming periods</span>
            </li>
            <li className="flex items-center gap-2 p-3 rounded-lg border">
              <Badge variant="outline">Closed</Badge>
              <span className="text-sm">Locked for audit compliance</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <BusinessRules
        title="Company Business Rules"
        rules={businessRules}
      />

      <TipCallout title="Branch Locations">
        After creating a company, add branch locations to define physical offices. 
        Branch locations are required for geofencing, time zone assignment, and 
        employee work location tracking. Access via the company row menu → Branches.
      </TipCallout>
    </div>
  );
}
