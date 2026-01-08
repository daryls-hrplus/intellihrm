import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, Globe, Shield, Landmark } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  FieldReferenceTable,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  WarningCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type Step,
  type FieldDefinition,
  type ExampleConfig,
  type BusinessRule
} from '../../../manual/components';
import { FeatureStatusBadge } from '../../components';

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
    description: "Short code for system reference",
    validation: "2-20 characters, uppercase"
  },
  {
    name: "Company Group",
    type: "Select",
    required: false,
    description: "Parent company group for this entity"
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
    description: "Tax registration number"
  },
  {
    name: "Address",
    type: "Address Group",
    required: true,
    description: "Registered business address"
  },
  {
    name: "Industry",
    type: "Select",
    required: true,
    description: "Primary industry classification"
  },
  {
    name: "Company Type",
    type: "Select",
    required: true,
    description: "Legal entity type (Limited, LLC, etc.)"
  },
  {
    name: "Base Currency",
    type: "Select",
    required: true,
    description: "Primary operating currency"
  },
  {
    name: "Fiscal Year Start",
    type: "Date",
    required: true,
    description: "First day of fiscal year (e.g., January 1)"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether company is active",
    defaultValue: "True"
  }
];

const statutoryFields: FieldDefinition[] = [
  {
    name: "NIS Employer Number",
    type: "Text",
    required: false,
    description: "National Insurance Scheme employer registration (Caribbean)"
  },
  {
    name: "NHT Employer Number",
    type: "Text",
    required: false,
    description: "National Housing Trust registration (Jamaica)"
  },
  {
    name: "SSNIT Employer Number",
    type: "Text",
    required: false,
    description: "Social Security registration (Ghana)"
  },
  {
    name: "PAYE Number",
    type: "Text",
    required: false,
    description: "Pay As You Earn tax registration"
  },
  {
    name: "Pension Trustee",
    type: "Select",
    required: false,
    description: "Pension fund administrator"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Companies",
    description: "Go to Admin → Organization → Companies",
    expectedResult: "Companies list page displays"
  },
  {
    title: "Click Create Company",
    description: "Click the 'Add Company' button",
    expectedResult: "Company creation wizard opens"
  },
  {
    title: "Enter Basic Information",
    description: "Fill in company legal details",
    substeps: [
      "Enter the exact legal company name",
      "Enter registration number as shown on certificate",
      "Enter tax identification number",
      "Select the country of registration"
    ]
  },
  {
    title: "Configure Address",
    description: "Enter the registered business address",
    substeps: [
      "Enter street address lines",
      "Select city/parish/state",
      "Enter postal code",
      "Verify country matches registration"
    ]
  },
  {
    title: "Set Financial Details",
    description: "Configure currency and fiscal settings",
    substeps: [
      "Select base operating currency",
      "Set fiscal year start date",
      "Enable multi-currency if needed"
    ]
  },
  {
    title: "Add Statutory Registrations",
    description: "Enter statutory body registrations",
    substeps: [
      "Enter NIS/SSNIT employer numbers",
      "Enter pension registrations",
      "Add other country-specific registrations"
    ],
    expectedResult: "All statutory fields populated"
  },
  {
    title: "Review and Save",
    description: "Verify all information and save",
    expectedResult: "Company created with 'Active' status"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Jamaican Limited Company",
    context: "A manufacturing company registered in Jamaica",
    values: [
      { field: "Company Name", value: "ABC Manufacturing Limited" },
      { field: "Company Code", value: "ABCMFG-JM" },
      { field: "Country", value: "Jamaica" },
      { field: "Registration Number", value: "123456" },
      { field: "Tax ID (TRN)", value: "123-456-789" },
      { field: "NIS Number", value: "NIS-12345" },
      { field: "NHT Number", value: "NHT-67890" },
      { field: "Base Currency", value: "JMD" },
      { field: "Fiscal Year Start", value: "April 1" }
    ],
    outcome: "Company configured with all Jamaica-specific statutory requirements"
  },
  {
    title: "Ghana Limited Liability Company",
    context: "A services company operating in Ghana",
    values: [
      { field: "Company Name", value: "XYZ Services Ghana Ltd" },
      { field: "Company Code", value: "XYZSVC-GH" },
      { field: "Country", value: "Ghana" },
      { field: "Registration Number", value: "CS123456789" },
      { field: "Tax ID (TIN)", value: "C0012345678" },
      { field: "SSNIT Number", value: "SSNIT-98765" },
      { field: "Base Currency", value: "GHS" },
      { field: "Fiscal Year Start", value: "January 1" }
    ],
    outcome: "Company configured for Ghana regulatory compliance"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Company code must be unique across the entire system",
    enforcement: "System",
    description: "Ensures unique identification for integrations"
  },
  {
    rule: "Country selection determines available statutory fields",
    enforcement: "System",
    description: "System shows only relevant statutory registrations"
  },
  {
    rule: "Registration and Tax ID formats are validated by country",
    enforcement: "Policy",
    description: "Warning if format doesn't match expected pattern"
  },
  {
    rule: "At least one department must be created after company setup",
    enforcement: "Advisory",
    description: "Required before employees can be assigned"
  },
  {
    rule: "Company deactivation requires no active employees",
    enforcement: "System",
    description: "All employees must be terminated or transferred first"
  }
];

export function FoundationCompanies() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create and configure legal entity companies in Intelli HRM",
          "Enter correct statutory body registrations by country",
          "Configure financial settings including currency and fiscal year",
          "Understand country-specific requirements for Caribbean and Africa"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Understanding Companies
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Companies in Intelli HRM represent individual legal entities - the registered 
            businesses where employees are hired and paid. Each company has its own 
            statutory registrations, payroll configuration, and compliance requirements.
          </p>
          
          <WarningCallout title="Accuracy is Critical">
            Company details are used for statutory reporting and payroll. Ensure all 
            registration numbers match official documents exactly. Errors may cause 
            compliance issues with tax authorities and statutory bodies.
          </WarningCallout>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.4.1: Companies list view showing all legal entities"
        alt="Companies data grid with columns for name, code, country, registration number, and status"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Company Core Fields"
        fields={companyFields}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Statutory Registration Fields
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Fields displayed vary based on selected country. All statutory fields support regional compliance.
          </p>
        </CardContent>
      </Card>

      <FieldReferenceTable
        title="Statutory Registration Fields (Country-Specific)"
        fields={statutoryFields}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Country-Specific Requirements
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="outline">Jamaica</Badge>
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• TRN (Tax Registration Number)</li>
                <li>• NIS (National Insurance Scheme)</li>
                <li>• NHT (National Housing Trust)</li>
                <li>• HEART Trust/NTA</li>
                <li>• Fiscal year often April-March</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="outline">Trinidad & Tobago</Badge>
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• BIR (Board of Inland Revenue) File No.</li>
                <li>• NIS Employer Registration</li>
                <li>• PAYE Registration</li>
                <li>• Fiscal year January-December</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="outline">Ghana</Badge>
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• TIN (Tax Identification Number)</li>
                <li>• SSNIT Employer Number</li>
                <li>• Tier 2 Pension Trustee</li>
                <li>• GRA Registration</li>
                <li>• Fiscal year January-December</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Badge variant="outline">Nigeria</Badge>
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• TIN (Tax Identification Number)</li>
                <li>• Pension Fund Administrator (PFA)</li>
                <li>• NSITF Registration</li>
                <li>• ITF Registration</li>
                <li>• Fiscal year January-December</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Company"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.4.2: Company creation wizard - Basic Information step"
        alt="Company creation form showing legal name, registration number, tax ID, and country selection fields"
        aspectRatio="wide"
      />

      <ScreenshotPlaceholder
        caption="Figure 2.4.3: Company creation wizard - Statutory Registrations step"
        alt="Form showing country-specific statutory fields like NIS, NHT, SSNIT based on selected country"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Company Configuration Examples"
        examples={configExamples}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.4.4: Completed company with all statutory registrations"
        alt="Company detail view showing all configured fields including statutory body registrations"
        aspectRatio="wide"
      />

      <BusinessRules
        title="Company Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="Multi-Currency Operations">
        If your company operates in multiple currencies (e.g., paying some employees 
        in USD and others in local currency), enable multi-currency during setup. This 
        is common in Caribbean operations where USD is used alongside local currencies.
      </InfoCallout>

      <TipCallout title="Next Steps After Company Setup">
        After creating a company, proceed to create: (1) At least one Department, 
        (2) Branch Locations for physical offices, (3) Positions for roles. These 
        are required before employees can be onboarded.
      </TipCallout>
    </div>
  );
}
