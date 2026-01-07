import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Users, Building2, DollarSign } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  WarningCallout,
  type Step
} from '../../../manual/components';

const createPositionSteps: Step[] = [
  {
    title: "Navigate to Positions",
    description: "Go to Workforce → Positions from the main navigation",
    expectedResult: "Positions page displays with company selector"
  },
  {
    title: "Select Company",
    description: "Choose the company for which you want to create positions",
    expectedResult: "Existing positions for selected company are listed"
  },
  {
    title: "Click Add Position",
    description: "Click the '+ Add Position' button",
    expectedResult: "Position creation dialog opens"
  },
  {
    title: "Enter Position Header",
    description: "Fill in the main position details",
    substeps: [
      "Code: Unique position code (e.g., POS-ENG-001)",
      "Title: Position title (may differ from job title)",
      "Department: The department this position belongs to",
      "Reports To: The position this role reports to"
    ],
    expectedResult: "Position is identified in the org structure"
  },
  {
    title: "Configure Headcount",
    description: "Set the authorized headcount for this position",
    substeps: [
      "Authorized Headcount: Number of employees that can fill this position",
      "Multiple employees can share the same position (e.g., 5 Software Engineers)"
    ],
    expectedResult: "Headcount budget is established"
  },
  {
    title: "Set Compensation Model",
    description: "Choose how compensation is determined",
    substeps: [
      "Salary Grade: Link to a salary grade for range-based pay",
      "Pay Spine: Link to a pay spine for point-based progression",
      "Custom: Manual compensation without grade linkage"
    ],
    expectedResult: "Compensation framework is configured"
  },
  {
    title: "Configure Work Settings",
    description: "Set employment and scheduling parameters",
    substeps: [
      "Pay Type: Salaried, Hourly, Commission",
      "Employment Status: Active, On Leave, etc.",
      "Employment Type: Full-time, Part-time, Contract",
      "Overtime Status: Exempt, Non-exempt",
      "Default Scheduled Hours: Standard hours per period"
    ],
    expectedResult: "Work parameters are defined"
  },
  {
    title: "Set Dates and Status",
    description: "Configure effective dates",
    substeps: [
      "Start Date: When position becomes active",
      "End Date: Optional, for sunset positions",
      "Is Active: Toggle to activate/deactivate"
    ],
    expectedResult: "Position lifecycle is configured"
  },
  {
    title: "Save Position",
    description: "Click Save to create the position",
    expectedResult: "Position appears in the list and org chart"
  }
];

const assignEmployeeSteps: Step[] = [
  {
    title: "Expand Position Row",
    description: "Click the chevron on a position row to expand",
    expectedResult: "Assigned employees section is visible"
  },
  {
    title: "Click Assign Employee",
    description: "Click '+ Assign Employee' button",
    expectedResult: "Employee assignment dialog opens"
  },
  {
    title: "Select Employee",
    description: "Search and select the employee to assign",
    expectedResult: "Employee is selected for assignment"
  },
  {
    title: "Configure Assignment",
    description: "Set assignment details",
    substeps: [
      "Assignment Type: Primary, Acting, Interim, Secondary, Secondment",
      "Start Date: When assignment begins",
      "End Date: Optional, for temporary assignments",
      "Is Primary: Whether this is the employee's main position"
    ],
    expectedResult: "Assignment parameters are configured"
  },
  {
    title: "Set Compensation",
    description: "Configure employee-specific compensation",
    substeps: [
      "Compensation Amount: Salary or hourly rate",
      "Currency: Payment currency",
      "Frequency: Monthly, Bi-weekly, etc.",
      "Spinal Point: If using pay spine model",
      "Pay Group: Assigned pay group for payroll"
    ],
    expectedResult: "Compensation is linked to the assignment"
  },
  {
    title: "Save Assignment",
    description: "Click Save to complete the assignment",
    expectedResult: "Employee appears in position's assigned list"
  }
];

const assignmentTypes = [
  { type: 'Primary', description: 'The employee\'s main position and reporting line' },
  { type: 'Acting', description: 'Temporary coverage while incumbent is absent' },
  { type: 'Interim', description: 'Filling vacancy while recruitment is in progress' },
  { type: 'Secondary', description: 'Additional position (dual roles)' },
  { type: 'Secondment', description: 'Temporary assignment to another department/company' },
];

export function JobArchitecturePositions() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create and configure positions linked to jobs and departments",
          "Understand position control and headcount management",
          "Assign employees to positions with appropriate assignment types",
          "Configure position-level compensation"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Position Control Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Position Control is a methodology where every employee must be assigned to 
            an authorized position. This enables headcount governance, budget control, 
            and accurate workforce planning.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h5 className="font-medium">Department</h5>
              <p className="text-xs text-muted-foreground">Where the work happens</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h5 className="font-medium">Position</h5>
              <p className="text-xs text-muted-foreground">The authorized seat</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h5 className="font-medium">Employee</h5>
              <p className="text-xs text-muted-foreground">Who fills the seat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Position"
        steps={createPositionSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.7.1: Position creation dialog with department and compensation settings"
        alt="Position form showing code, title, department, reports-to, headcount, and compensation fields"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Assignment Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {assignmentTypes.map((item) => (
              <div key={item.type} className="flex items-center gap-4 p-3 rounded-lg border">
                <Badge variant="outline" className="min-w-[100px]">{item.type}</Badge>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Assigning Employees to Positions"
        steps={assignEmployeeSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.7.2: Employee assignment dialog with compensation configuration"
        alt="Assignment form showing employee selection, assignment type, dates, and compensation"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Compensation Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Salary Grade</h5>
              <p className="text-sm text-muted-foreground">
                Compensation is within a defined min/max range based on the assigned 
                salary grade. Supports market-based pay structures.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Pay Spine</h5>
              <p className="text-sm text-muted-foreground">
                Progression through defined spinal points with automatic annual 
                increments. Common in public sector and union environments.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Custom</h5>
              <p className="text-sm text-muted-foreground">
                Direct compensation amount without grade linkage. Used for executives 
                or roles with negotiated packages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WarningCallout title="Headcount Exceeding">
        When assigning more employees than the authorized headcount, the system will 
        display a warning. You can proceed but this will be flagged in headcount 
        variance reports. Always seek HR approval before exceeding authorized headcount.
      </WarningCallout>

      <InfoCallout title="Multi-Position Employees">
        An employee can hold multiple positions simultaneously (e.g., primary role 
        plus a secondary project role). Each assignment tracks its own compensation, 
        dates, and status.
      </InfoCallout>

      <TipCallout title="Position vs. Job Titles">
        Position titles can differ from job titles when the local context requires it. 
        For example, the job might be "Financial Analyst" but the position title could 
        be "Senior Financial Analyst - Treasury" to reflect the specific assignment.
      </TipCallout>
    </div>
  );
}
