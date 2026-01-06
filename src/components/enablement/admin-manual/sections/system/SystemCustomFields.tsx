import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusSquare, Type, List, Calendar, ToggleLeft } from 'lucide-react';
import { LearningObjectives, StepByStep, TipCallout, WarningCallout, ScreenshotPlaceholder } from '../../../manual/components';
import type { Step } from '../../../manual/components';

const creationSteps: Step[] = [
  {
    title: "Navigate to Custom Fields",
    description: "Go to Admin → System → Custom Fields",
    expectedResult: "Custom fields configuration page displays"
  },
  {
    title: "Select Entity",
    description: "Choose which entity (Employee, Position, etc.) to extend",
    expectedResult: "Existing custom fields for that entity display"
  },
  {
    title: "Add Custom Field",
    description: "Click 'Add Field' and configure",
    substeps: [
      "Enter field label and internal name",
      "Select field type (Text, Number, Date, Dropdown, etc.)",
      "Set validation rules if needed",
      "Configure visibility and editability by role"
    ]
  },
  {
    title: "Test and Activate",
    description: "Preview the field in forms and activate",
    expectedResult: "Field appears in relevant forms and reports"
  }
];

const fieldTypes = [
  { type: "Text", icon: Type, description: "Single or multi-line text input" },
  { type: "Number", icon: Type, description: "Numeric values with precision" },
  { type: "Date", icon: Calendar, description: "Date picker with format options" },
  { type: "Dropdown", icon: List, description: "Single selection from options" },
  { type: "Multi-Select", icon: List, description: "Multiple selections allowed" },
  { type: "Toggle", icon: ToggleLeft, description: "Yes/No or On/Off switch" }
];

export function SystemCustomFields() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create custom fields to extend HRplus entities",
          "Configure field types and validation rules",
          "Set up role-based field visibility",
          "Include custom fields in reports and exports"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusSquare className="h-5 w-5 text-primary" />
            Custom Fields Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Custom Fields allow you to extend HRplus entities with organization-specific 
            data points without requiring code changes. These fields integrate seamlessly 
            with forms, reports, and workflows.
          </p>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 5.4.1: Custom Fields configuration interface"
        alt="Custom fields page showing entity selector, field list, and field configuration form"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle>Supported Field Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {fieldTypes.map((field) => {
              const IconComponent = field.icon;
              return (
                <div key={field.type} className="flex items-start gap-3 p-3 rounded-lg border">
                  <IconComponent className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">{field.type}</h4>
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extensible Entities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {[
              { entity: "Employee", examples: "Badge number, Locker assignment, Emergency contact relationship" },
              { entity: "Position", examples: "Budget code, Approval matrix level, Remote work eligible" },
              { entity: "Job Requisition", examples: "Hiring priority, Internal only flag, Referral bonus amount" },
              { entity: "Leave Request", examples: "Coverage plan, Handover notes required, Project impact" },
              { entity: "Training Course", examples: "CPE credits, Certification validity, Provider rating" }
            ].map((item) => (
              <div key={item.entity} className="flex items-center justify-between p-3 rounded-lg border">
                <Badge variant="secondary">{item.entity}</Badge>
                <span className="text-sm text-muted-foreground">{item.examples}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Custom Field"
        steps={creationSteps}
      />

      <WarningCallout title="Field Naming">
        Use clear, descriptive field names. Once created, internal field names 
        cannot be changed (only labels). Plan your naming convention before 
        creating fields.
      </WarningCallout>

      <TipCallout title="Role-Based Visibility">
        Configure field visibility and edit permissions per role. Sensitive 
        custom fields (like union membership) should only be visible to 
        authorized roles.
      </TipCallout>
    </div>
  );
}
