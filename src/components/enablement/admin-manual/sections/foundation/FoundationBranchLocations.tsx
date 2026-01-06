import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Building2, Globe, Navigation } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  FieldReferenceTable,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  WarningCallout,
  InfoCallout,
  type Step,
  type FieldDefinition,
  type ExampleConfig,
  type BusinessRule
} from '../../../manual/components';

const locationFields: FieldDefinition[] = [
  {
    name: "Location Name",
    type: "Text",
    required: true,
    description: "Display name for the branch location",
    validation: "2-150 characters"
  },
  {
    name: "Location Code",
    type: "Text",
    required: true,
    description: "Short code for system reference",
    validation: "2-20 characters, uppercase"
  },
  {
    name: "Company",
    type: "Select",
    required: true,
    description: "Company this location belongs to"
  },
  {
    name: "Location Type",
    type: "Select",
    required: true,
    description: "Type of location (HQ, Branch, Warehouse, etc.)"
  },
  {
    name: "Address Line 1",
    type: "Text",
    required: true,
    description: "Street address"
  },
  {
    name: "Address Line 2",
    type: "Text",
    required: false,
    description: "Additional address details"
  },
  {
    name: "City/Town",
    type: "Text",
    required: true,
    description: "City or town name"
  },
  {
    name: "Parish/State",
    type: "Select",
    required: true,
    description: "Administrative region"
  },
  {
    name: "Country",
    type: "Select",
    required: true,
    description: "Country location"
  },
  {
    name: "Postal Code",
    type: "Text",
    required: false,
    description: "Postal/ZIP code"
  },
  {
    name: "Timezone",
    type: "Select",
    required: true,
    description: "Timezone for attendance tracking"
  },
  {
    name: "Latitude",
    type: "Number",
    required: false,
    description: "GPS latitude for geofencing"
  },
  {
    name: "Longitude",
    type: "Number",
    required: false,
    description: "GPS longitude for geofencing"
  },
  {
    name: "Geofence Radius",
    type: "Number",
    required: false,
    description: "Radius in meters for clock-in validation",
    defaultValue: "100"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether the location is active",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Branch Locations",
    description: "Go to Admin → Organization → Branch Locations",
    expectedResult: "Locations list page displays"
  },
  {
    title: "Click Create Location",
    description: "Click the 'Add Location' button",
    expectedResult: "Location creation form opens"
  },
  {
    title: "Enter Location Details",
    description: "Fill in location identification",
    substeps: [
      "Enter location name (e.g., 'Kingston Head Office')",
      "Enter or modify the location code",
      "Select the location type"
    ]
  },
  {
    title: "Enter Full Address",
    description: "Complete the address fields",
    substeps: [
      "Enter street address lines",
      "Select city/parish/state",
      "Select country",
      "Enter postal code if applicable"
    ]
  },
  {
    title: "Configure Timezone",
    description: "Set the timezone for attendance tracking",
    expectedResult: "Correct timezone for shift calculations"
  },
  {
    title: "Set Up Geofencing (Optional)",
    description: "Configure GPS coordinates for mobile clock-in",
    substeps: [
      "Use 'Find on Map' to set coordinates",
      "Or enter latitude and longitude manually",
      "Set geofence radius (typically 50-200 meters)"
    ]
  },
  {
    title: "Save Location",
    description: "Click 'Create' to save the new location",
    expectedResult: "Location appears in the list"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Corporate Head Office",
    context: "Main office location with strict attendance",
    values: [
      { field: "Location Name", value: "Kingston Head Office" },
      { field: "Location Code", value: "KGN-HQ" },
      { field: "Location Type", value: "Headquarters" },
      { field: "Address", value: "10 Knutsford Blvd, New Kingston" },
      { field: "City", value: "Kingston" },
      { field: "Parish", value: "St. Andrew" },
      { field: "Timezone", value: "America/Jamaica (EST)" },
      { field: "Geofence Radius", value: "100 meters" }
    ],
    outcome: "HQ with GPS-validated clock-in capability"
  },
  {
    title: "Remote Sales Office",
    context: "Field office with flexible attendance",
    values: [
      { field: "Location Name", value: "Montego Bay Sales Office" },
      { field: "Location Code", value: "MBJ-SALES" },
      { field: "Location Type", value: "Branch Office" },
      { field: "Address", value: "Shop 5, Bay West Centre" },
      { field: "City", value: "Montego Bay" },
      { field: "Parish", value: "St. James" },
      { field: "Geofence Radius", value: "200 meters" }
    ],
    outcome: "Branch office with larger geofence for flexibility"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Location codes must be unique within a company",
    enforcement: "System",
    description: "Required for attendance and reporting"
  },
  {
    rule: "Timezone is required for attendance calculations",
    enforcement: "System",
    description: "Ensures shift times are calculated correctly"
  },
  {
    rule: "Geofencing requires valid GPS coordinates",
    enforcement: "System",
    description: "Latitude must be -90 to 90, Longitude -180 to 180"
  },
  {
    rule: "At least one location recommended before employees",
    enforcement: "Advisory",
    description: "Enables accurate attendance tracking"
  },
  {
    rule: "Deactivating location requires reassigning employees",
    enforcement: "Policy",
    description: "Warning if employees are assigned"
  }
];

const locationTypes = [
  { type: "Headquarters", description: "Main corporate office, typically one per company" },
  { type: "Branch Office", description: "Regional or local office" },
  { type: "Warehouse", description: "Storage and distribution facility" },
  { type: "Manufacturing Plant", description: "Production facility" },
  { type: "Retail Store", description: "Customer-facing retail location" },
  { type: "Remote Site", description: "Project or temporary location" }
];

export function FoundationBranchLocations() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create and configure physical branch locations",
          "Set up timezone configuration for accurate attendance",
          "Configure geofencing for mobile clock-in validation",
          "Understand multi-location considerations"
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
            Branch Locations represent physical workplaces where employees report 
            to work. They are essential for attendance tracking, geofencing validation, 
            timezone management, and location-based reporting.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <Clock className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm">Timezone Accuracy</h4>
              <p className="text-xs text-muted-foreground">
                Correct timezone ensures shift times and overtime are calculated properly
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <Navigation className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm">Geofencing</h4>
              <p className="text-xs text-muted-foreground">
                GPS validation ensures employees clock in from valid locations
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <Globe className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm">Multi-Location</h4>
              <p className="text-xs text-muted-foreground">
                Support for employees working across multiple locations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {locationTypes.map((loc) => (
              <div key={loc.type} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium text-sm">{loc.type}</h4>
                  <p className="text-sm text-muted-foreground">{loc.description}</p>
                </div>
                <Badge variant="secondary">{loc.type.charAt(0)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable
        title="Location Field Reference"
        fields={locationFields}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Geofencing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Geofencing uses GPS coordinates to validate that employees are physically 
            at the workplace when clocking in via mobile devices.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Recommended Radius</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>50-100m:</strong> Small office buildings</li>
                <li>• <strong>100-200m:</strong> Standard offices, warehouses</li>
                <li>• <strong>200-500m:</strong> Large campuses, manufacturing</li>
                <li>• <strong>500m+:</strong> Large industrial complexes</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">GPS Accuracy Notes</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Indoor locations may have reduced accuracy</li>
                <li>• Consider building size when setting radius</li>
                <li>• Too small radius causes clock-in failures</li>
                <li>• Too large radius defeats purpose</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Branch Location"
        steps={creationSteps}
      />

      <ConfigurationExample
        title="Location Configuration Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Location Business Rules"
        rules={businessRules}
      />

      <WarningCallout title="Multi-Timezone Operations">
        For companies operating across multiple timezones (e.g., Caribbean islands), 
        ensure each location has the correct timezone set. Shift times, overtime 
        calculations, and reports all depend on accurate timezone configuration.
      </WarningCallout>

      <TipCallout title="Finding GPS Coordinates">
        To find coordinates: (1) Use Google Maps, right-click on the location, 
        and copy coordinates, or (2) Use the 'Find on Map' feature in the location 
        form, or (3) Use a GPS app on your phone at the location.
      </TipCallout>
    </div>
  );
}
