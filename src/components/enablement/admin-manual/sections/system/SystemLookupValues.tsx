import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { List, Plus, Edit, Trash2 } from 'lucide-react';
import { LearningObjectives, StepByStep, TipCallout, WarningCallout, ScreenshotPlaceholder } from '../../../manual/components';
import type { Step } from '../../../manual/components';

const creationSteps: Step[] = [
  {
    title: "Navigate to Lookup Values",
    description: "Go to Admin → System → Lookup Values",
    expectedResult: "Lookup categories list displays"
  },
  {
    title: "Select Category",
    description: "Choose the lookup category to modify",
    expectedResult: "Values for that category display"
  },
  {
    title: "Add New Value",
    description: "Click 'Add Value' to create a new option",
    substeps: [
      "Enter the display label",
      "Enter the internal code (optional)",
      "Set display order",
      "Mark as active/inactive"
    ]
  },
  {
    title: "Save Changes",
    description: "Click Save to apply the new lookup value",
    expectedResult: "Value appears in dropdowns across the system"
  }
];

export function SystemLookupValues() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand the purpose of lookup values in Intelli HRM",
          "Add, modify, and deactivate lookup values",
          "Manage category-specific dropdown options",
          "Maintain data consistency across the system"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Lookup Values Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Lookup Values are the dropdown options used throughout Intelli HRM. 
            Standardizing these values ensures data consistency and enables 
            accurate reporting across your organization.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <Plus className="h-5 w-5 text-green-500 mb-2" />
              <h4 className="font-medium text-sm">Add Values</h4>
              <p className="text-xs text-muted-foreground">
                Create new options for dropdown fields
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <Edit className="h-5 w-5 text-blue-500 mb-2" />
              <h4 className="font-medium text-sm">Modify Values</h4>
              <p className="text-xs text-muted-foreground">
                Update labels and display order
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <Trash2 className="h-5 w-5 text-red-500 mb-2" />
              <h4 className="font-medium text-sm">Deactivate Values</h4>
              <p className="text-xs text-muted-foreground">
                Hide outdated options from selection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 5.2.1: Lookup Values management interface"
        alt="Lookup values page showing categories list and value management with add, edit, and reorder options"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle>Common Lookup Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[
              { category: "Employment Type", examples: "Full-time, Part-time, Contract, Temporary" },
              { category: "Termination Reason", examples: "Resignation, Retirement, Dismissal, End of Contract" },
              { category: "Leave Types", examples: "Annual, Sick, Maternity, Bereavement" },
              { category: "Education Level", examples: "High School, Bachelor's, Master's, Doctorate" },
              { category: "Marital Status", examples: "Single, Married, Divorced, Widowed" },
              { category: "Gender", examples: "Male, Female, Non-binary, Prefer not to say" }
            ].map((item) => (
              <div key={item.category} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="font-medium">{item.category}</span>
                <span className="text-sm text-muted-foreground">{item.examples}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Adding a Lookup Value"
        steps={creationSteps}
      />

      <WarningCallout title="Deactivate vs Delete">
        Never delete lookup values that have been used in records. Instead, 
        deactivate them to preserve data integrity while hiding them from 
        future selections.
      </WarningCallout>

      <TipCallout title="Consistent Naming">
        Use clear, standardized naming conventions. Avoid abbreviations that 
        users might not understand. "Full-time" is clearer than "FT".
      </TipCallout>
    </div>
  );
}
