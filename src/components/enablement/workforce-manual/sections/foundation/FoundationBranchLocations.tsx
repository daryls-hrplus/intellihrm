import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Clock, Navigation } from 'lucide-react';
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

const branchFields: FieldDefinition[] = [
  {
    name: "Branch Name",
    type: "Text",
    required: true,
    description: "Display name for the location (e.g., 'Head Office')",
    validation: "2-100 characters"
  },
  {
    name: "Branch Code",
    type: "Text",
    required: true,
    description: "Short code for system reference",
    validation: "2-20 characters, uppercase, unique per company"
  },
  {
    name: "Address",
    type: "Text",
    required: false,
    description: "Street address"
  },
  {
    name: "City",
    type: "Text",
    required: false,
    description: "City or town"
  },
  {
    name: "State/Province",
    type: "Text",
    required: false,
    description: "State, province, or parish"
  },
  {
    name: "Country",
    type: "Text",
    required: false,
    description: "Country (often inherits from company)"
  },
  {
    name: "Postal Code",
    type: "Text",
    required: false,
    description: "Postal or ZIP code"
  },
  {
    name: "Phone",
    type: "Text",
    required: false,
    description: "Main office phone number"
  },
  {
    name: "Email",
    type: "Email",
    required: false,
    description: "Location contact email"
  },
  {
    name: "Is Headquarters",
    type: "Toggle",
    required: true,
    description: "Mark as company headquarters",
    defaultValue: "False"
  },
  {
    name: "Start Date",
    type: "Date",
    required: true,
    description: "When this location becomes effective"
  },
  {
    name: "End Date",
    type: "Date",
    required: false,
    description: "For office closures or relocations"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Active locations appear in employee assignments",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Companies",
    description: "Go to Admin & Security → Companies",
    expectedResult: "Companies list displays"
  },
  {
    title: "Access Branch Locations",
    description: "Click the row menu (⋮) on a company → 'Branch Locations'",
    expectedResult: "Branch Locations dialog opens for selected company"
  },
  {
    title: "Click Add Branch",
    description: "Click 'Add Branch' button",
    expectedResult: "Branch creation form opens"
  },
  {
    title: "Enter Branch Details",
    description: "Fill in location information",
    substeps: [
      "Enter location name (e.g., 'Kingston Head Office')",
      "Enter unique code within company (e.g., 'HQ')",
      "Enter complete address details",
      "Add phone and email for the location"
    ]
  },
  {
    title: "Configure Settings",
    description: "Set headquarters and status flags",
    substeps: [
      "Toggle 'Headquarters' if this is the main office",
      "Set start date for when location opens",
      "Leave end date blank for ongoing locations"
    ]
  },
  {
    title: "Save Branch",
    description: "Click 'Create' to save",
    expectedResult: "Branch appears in company's location list"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Company Headquarters",
    context: "Primary office location for legal and HR operations",
    values: [
      { field: "Branch Name", value: "Kingston Head Office" },
      { field: "Branch Code", value: "HQ" },
      { field: "Address", value: "123 King Street" },
      { field: "City", value: "Kingston" },
      { field: "Is Headquarters", value: "Yes" }
    ],
    outcome: "Marked as HQ; default location for new employees in this company"
  },
  {
    title: "Manufacturing Plant",
    context: "Production facility with shift-based workforce",
    values: [
      { field: "Branch Name", value: "Spanish Town Factory" },
      { field: "Branch Code", value: "STF" },
      { field: "City", value: "Spanish Town, St. Catherine" },
      { field: "Is Headquarters", value: "No" }
    ],
    outcome: "Available for employee work location assignment; enables plant-specific scheduling"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Branch codes must be unique within a company",
    enforcement: "System",
    description: "Same code can exist in different companies"
  },
  {
    rule: "Only one location can be marked as Headquarters per company",
    enforcement: "System",
    description: "Setting a new HQ removes flag from previous"
  },
  {
    rule: "Branches with assigned employees cannot be deleted",
    enforcement: "System",
    description: "Must reassign employees to another location first"
  },
  {
    rule: "Active branches appear in employee location dropdowns",
    enforcement: "System",
    description: "Inactive branches hidden from new assignments"
  }
];

export function FoundationBranchLocations() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create physical office locations for each company",
          "Designate headquarters for legal and correspondence purposes",
          "Prepare location data for geofencing integration",
          "Enable location-based employee assignment and scheduling"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Understanding Branch Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Branch locations represent physical office sites where employees work. 
            They enable location-based reporting, time zone assignment, and 
            geofencing for mobile attendance.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-500" />
                Location Management
              </h4>
              <p className="text-sm text-muted-foreground">
                Track all physical offices, factories, and work sites
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                Time Zone Support
              </h4>
              <p className="text-sm text-muted-foreground">
                Locations inherit country time zones for scheduling
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Navigation className="h-4 w-4 text-amber-500" />
                Geofencing Ready
              </h4>
              <p className="text-sm text-muted-foreground">
                GPS coordinates added via Geofence Management
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WarningCallout title="Geofencing Configuration">
        Branch locations defined here provide basic address data. For GPS-based 
        attendance, configure geofences separately in Time & Attendance → 
        Geofence Management. Geofences require precise coordinates and radius settings.
      </WarningCallout>

      <ScreenshotPlaceholder
        caption="Figure 2.8.1: Branch Locations dialog showing company offices"
        alt="Branch locations list showing headquarters badge, addresses, and status"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Branch Location Field Reference"
        fields={branchFields}
      />

      <StepByStep
        title="Creating a Branch Location"
        steps={creationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.8.2: Branch creation form with address fields"
        alt="Branch creation form showing all fields including headquarters toggle"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Branch Location Configuration Examples"
        examples={configExamples}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Geofencing Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            For mobile attendance with GPS verification:
          </p>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <Badge variant="outline">1</Badge>
              <div>
                <p className="font-medium text-sm">Create Branch Location</p>
                <p className="text-sm text-muted-foreground">Define the office here with address details</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Badge variant="outline">2</Badge>
              <div>
                <p className="font-medium text-sm">Configure Geofence</p>
                <p className="text-sm text-muted-foreground">
                  Go to Time & Attendance → Geofence Management to add GPS coordinates and radius
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Badge variant="outline">3</Badge>
              <div>
                <p className="font-medium text-sm">Assign Employees</p>
                <p className="text-sm text-muted-foreground">Link employees to geofenced locations for mobile clock-in validation</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <BusinessRules
        title="Branch Location Business Rules"
        rules={businessRules}
      />

      <TipCallout title="Multi-Site Organizations">
        For companies with many locations (retail chains, banks), use the HR Hub 
        import feature for bulk branch creation. The template supports all fields 
        including headquarters designation.
      </TipCallout>
    </div>
  );
}
