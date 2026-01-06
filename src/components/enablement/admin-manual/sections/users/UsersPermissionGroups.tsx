import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Filter, RefreshCw } from 'lucide-react';
import { 
  LearningObjectives, 
  StepByStep, 
  FieldReferenceTable, 
  ConfigurationExample,
  BusinessRules,
  TipCallout, 
  InfoCallout 
} from '../../../manual/components';
import type { Step, FieldDefinition, ExampleConfig, BusinessRule } from '../../../manual/components';

const groupFields: FieldDefinition[] = [
  {
    name: "Group Name",
    type: "Text",
    required: true,
    description: "Display name for the permission group",
    validation: "2-100 characters, must be unique"
  },
  {
    name: "Group Code",
    type: "Text",
    required: true,
    description: "System identifier for the group",
    validation: "2-30 characters, uppercase"
  },
  {
    name: "Group Type",
    type: "Select",
    required: true,
    description: "Static (manual) or Dynamic (rule-based)"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Purpose and membership criteria"
  },
  {
    name: "Membership Rules",
    type: "Rule Builder",
    required: false,
    description: "For dynamic groups: criteria for auto-membership"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether the group is active",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Permission Groups",
    description: "Go to Admin → Security → Permission Groups",
    expectedResult: "Permission groups list displays"
  },
  {
    title: "Click Create Group",
    description: "Click the 'Add Group' button",
    expectedResult: "Group creation form opens"
  },
  {
    title: "Select Group Type",
    description: "Choose Static or Dynamic membership",
    substeps: [
      "Static: Members are manually added/removed",
      "Dynamic: Members are automatically determined by rules"
    ]
  },
  {
    title: "Enter Group Details",
    description: "Complete group identification",
    substeps: [
      "Enter descriptive group name",
      "Enter group code",
      "Add description of membership criteria"
    ]
  },
  {
    title: "Configure Membership (Static)",
    description: "For static groups, add members manually",
    substeps: [
      "Search for users to add",
      "Select users from the list",
      "Click 'Add to Group'"
    ]
  },
  {
    title: "Configure Rules (Dynamic)",
    description: "For dynamic groups, define membership rules",
    substeps: [
      "Select attribute (Department, Job Level, Location, etc.)",
      "Select operator (Equals, Contains, Is In)",
      "Enter value(s)",
      "Add multiple rules with AND/OR logic"
    ]
  },
  {
    title: "Assign Permissions/Roles",
    description: "Attach roles or permissions to the group",
    expectedResult: "All group members receive the assigned access"
  },
  {
    title: "Save Group",
    description: "Click 'Create' to save the group",
    expectedResult: "Group created with members"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "All HR Department Staff",
    context: "Dynamic group for automatic HR access",
    values: [
      { field: "Group Name", value: "HR Department Access" },
      { field: "Group Type", value: "Dynamic" },
      { field: "Rule 1", value: "Department EQUALS 'Human Resources'" },
      { field: "Assigned Role", value: "HR User" }
    ],
    outcome: "All HR employees automatically get HR User role"
  },
  {
    title: "Senior Management",
    context: "Static group for executive dashboard access",
    values: [
      { field: "Group Name", value: "Executive Team" },
      { field: "Group Type", value: "Static" },
      { field: "Members", value: "CEO, CFO, COO, CHRO, CTO" },
      { field: "Assigned Role", value: "Executive Dashboard Viewer" }
    ],
    outcome: "Named executives have dashboard access"
  },
  {
    title: "Multi-Location Managers",
    context: "Dynamic group based on multiple criteria",
    values: [
      { field: "Group Name", value: "Location Managers" },
      { field: "Group Type", value: "Dynamic" },
      { field: "Rule 1", value: "Job Title CONTAINS 'Manager'" },
      { field: "Rule 2 (AND)", value: "Is People Manager = True" },
      { field: "Assigned Role", value: "Manager Self-Service Plus" }
    ],
    outcome: "All people managers get enhanced MSS access"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Group codes must be unique across the system",
    enforcement: "System",
    description: "Prevents duplicate identifiers"
  },
  {
    rule: "Dynamic group membership updates on user changes",
    enforcement: "System",
    description: "Membership recalculated when user attributes change"
  },
  {
    rule: "Users can belong to multiple groups",
    enforcement: "System",
    description: "Permissions are additive across groups"
  },
  {
    rule: "Group deletion requires no active permissions",
    enforcement: "System",
    description: "Must remove assigned roles first"
  }
];

export function UsersPermissionGroups() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create static and dynamic permission groups",
          "Configure rule-based membership for automation",
          "Assign roles to groups for bulk provisioning",
          "Manage group membership lifecycle"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Understanding Permission Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Permission Groups simplify access management by allowing you to assign 
            roles to groups of users rather than individuals. Changes to group 
            permissions automatically apply to all members.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                <Badge variant="secondary">Static Groups</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Members are manually added and removed. Best for small, 
                stable groups like executive teams or project committees.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-5 w-5 text-green-500" />
                <Badge variant="secondary">Dynamic Groups</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Members are automatically determined by rules. Best for 
                department-based or role-based access that changes frequently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Dynamic Group Rule Operators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left font-medium">Operator</th>
                  <th className="border p-2 text-left font-medium">Description</th>
                  <th className="border p-2 text-left font-medium">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2"><Badge variant="outline">EQUALS</Badge></td>
                  <td className="border p-2 text-muted-foreground">Exact match</td>
                  <td className="border p-2 text-muted-foreground">Department EQUALS "HR"</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-2"><Badge variant="outline">CONTAINS</Badge></td>
                  <td className="border p-2 text-muted-foreground">Partial match</td>
                  <td className="border p-2 text-muted-foreground">Job Title CONTAINS "Manager"</td>
                </tr>
                <tr>
                  <td className="border p-2"><Badge variant="outline">IS IN</Badge></td>
                  <td className="border p-2 text-muted-foreground">List membership</td>
                  <td className="border p-2 text-muted-foreground">Location IS IN ["KGN", "MBJ", "OCH"]</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-2"><Badge variant="outline">GREATER THAN</Badge></td>
                  <td className="border p-2 text-muted-foreground">Numeric comparison</td>
                  <td className="border p-2 text-muted-foreground">Job Level GREATER THAN 5</td>
                </tr>
                <tr>
                  <td className="border p-2"><Badge variant="outline">IS TRUE</Badge></td>
                  <td className="border p-2 text-muted-foreground">Boolean check</td>
                  <td className="border p-2 text-muted-foreground">Is People Manager IS TRUE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable
        title="Permission Group Field Reference"
        fields={groupFields}
      />

      <StepByStep
        title="Creating a Permission Group"
        steps={creationSteps}
      />

      <ConfigurationExample
        title="Permission Group Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Permission Group Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="Group vs Individual Assignment">
        Group assignment is preferred for scalability. Reserve individual role 
        assignment for exceptions and temporary access that doesn't fit group patterns.
      </InfoCallout>

      <TipCallout title="Testing Dynamic Groups">
        After creating a dynamic group, use the "Preview Members" button to verify 
        the rules capture the intended users before assigning sensitive permissions.
      </TipCallout>
    </div>
  );
}
