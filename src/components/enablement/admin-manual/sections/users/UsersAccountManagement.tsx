import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserMinus, RefreshCw, Lock, Mail, Key } from 'lucide-react';
import { 
  LearningObjectives, 
  StepByStep, 
  FieldReferenceTable,
  BusinessRules,
  TipCallout, 
  WarningCallout,
  InfoCallout 
} from '../../../manual/components';
import type { Step, FieldDefinition, BusinessRule } from '../../../manual/components';

const userFields: FieldDefinition[] = [
  {
    name: "Email Address",
    type: "Email",
    required: true,
    description: "Primary login identifier and communication address",
    validation: "Valid email format, unique in system"
  },
  {
    name: "Employee Record",
    type: "Employee Lookup",
    required: true,
    description: "Link to employee profile"
  },
  {
    name: "Username",
    type: "Text",
    required: false,
    description: "Alternative login identifier (if SSO not used)",
    defaultValue: "Same as email"
  },
  {
    name: "Roles",
    type: "Multi-Select",
    required: true,
    description: "Assigned security roles"
  },
  {
    name: "Permission Groups",
    type: "Multi-Select",
    required: false,
    description: "Group-based role assignments"
  },
  {
    name: "MFA Required",
    type: "Toggle",
    required: true,
    description: "Enforce multi-factor authentication",
    defaultValue: "Based on role policy"
  },
  {
    name: "Account Status",
    type: "Select",
    required: true,
    description: "Active, Locked, Suspended, or Disabled"
  },
  {
    name: "Password Expiry",
    type: "Date",
    required: false,
    description: "When password must be changed"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to User Accounts",
    description: "Go to Admin → Security → User Accounts",
    expectedResult: "User accounts list displays"
  },
  {
    title: "Click Create User",
    description: "Click the 'Add User' button",
    expectedResult: "User creation form opens"
  },
  {
    title: "Link Employee Record",
    description: "Search and select the employee",
    substeps: [
      "Search by name or employee ID",
      "Select the correct employee record",
      "Verify employee details are correct"
    ],
    expectedResult: "Employee linked, email auto-populated"
  },
  {
    title: "Assign Roles",
    description: "Select security roles for the user",
    substeps: [
      "Search available roles",
      "Select appropriate role(s)",
      "Review combined permissions"
    ]
  },
  {
    title: "Configure Authentication",
    description: "Set login and security options",
    substeps: [
      "Confirm email address",
      "Set MFA requirement (if not policy-enforced)",
      "Set password policy (or SSO)"
    ]
  },
  {
    title: "Send Welcome Email",
    description: "Generate temporary password and send invitation",
    substeps: [
      "Review welcome email content",
      "Click 'Create and Send Invitation'",
      "Confirm user receives email"
    ],
    expectedResult: "User created with pending activation"
  }
];

const lifecycleActions = [
  { action: 'Create', icon: UserPlus, color: 'text-green-500', when: 'New hire onboarding' },
  { action: 'Modify', icon: RefreshCw, color: 'text-blue-500', when: 'Role change, transfer, promotion' },
  { action: 'Lock', icon: Lock, color: 'text-amber-500', when: 'Security concern, extended leave' },
  { action: 'Disable', icon: UserMinus, color: 'text-red-500', when: 'Termination, resignation' }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Email addresses must be unique",
    enforcement: "System",
    description: "No duplicate login identifiers allowed"
  },
  {
    rule: "User must be linked to an employee record",
    enforcement: "System",
    description: "Orphan user accounts are not permitted"
  },
  {
    rule: "At least one role must be assigned",
    enforcement: "System",
    description: "Users without roles cannot access the system"
  },
  {
    rule: "Terminated employees must have accounts disabled within 24 hours",
    enforcement: "Policy",
    description: "Security requirement for offboarding"
  },
  {
    rule: "Password reset requires identity verification",
    enforcement: "Policy",
    description: "Prevent social engineering attacks"
  }
];

export function UsersAccountManagement() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create user accounts linked to employee records",
          "Manage the user account lifecycle (create, modify, disable)",
          "Handle password resets and account lockouts",
          "Implement secure offboarding procedures"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            User Account Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            User accounts in HRplus are always linked to employee records. The account 
            lifecycle follows the employee journey from onboarding through offboarding.
          </p>
          
          <div className="grid gap-4 md:grid-cols-4">
            {lifecycleActions.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.action} className="p-4 rounded-lg border">
                  <IconComponent className={`h-6 w-6 mb-2 ${item.color}`} />
                  <h4 className="font-medium">{item.action}</h4>
                  <p className="text-xs text-muted-foreground">{item.when}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable
        title="User Account Field Reference"
        fields={userFields}
      />

      <StepByStep
        title="Creating a User Account"
        steps={creationSteps}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Password Reset Procedures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Self-Service Reset</h4>
              <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                <li>User clicks "Forgot Password" on login page</li>
                <li>System sends reset link to registered email</li>
                <li>User clicks link and sets new password</li>
                <li>MFA required on next login (if enabled)</li>
              </ol>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Admin-Initiated Reset</h4>
              <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Admin verifies user identity (callback, manager confirm)</li>
                <li>Admin clicks "Reset Password" in user account</li>
                <li>System generates temporary password</li>
                <li>User must change on first login</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Account Status Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left font-medium">Status</th>
                  <th className="border p-2 text-left font-medium">Description</th>
                  <th className="border p-2 text-left font-medium">User Can Login?</th>
                  <th className="border p-2 text-left font-medium">When to Use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2"><Badge className="bg-green-100 text-green-700">Active</Badge></td>
                  <td className="border p-2 text-muted-foreground">Normal operational status</td>
                  <td className="border p-2">Yes</td>
                  <td className="border p-2 text-muted-foreground">Standard working employees</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-2"><Badge className="bg-amber-100 text-amber-700">Locked</Badge></td>
                  <td className="border p-2 text-muted-foreground">Temporary lockout</td>
                  <td className="border p-2">No (until unlocked)</td>
                  <td className="border p-2 text-muted-foreground">Failed login attempts, security investigation</td>
                </tr>
                <tr>
                  <td className="border p-2"><Badge className="bg-blue-100 text-blue-700">Suspended</Badge></td>
                  <td className="border p-2 text-muted-foreground">Extended temporary block</td>
                  <td className="border p-2">No</td>
                  <td className="border p-2 text-muted-foreground">Long leave, disciplinary action</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-2"><Badge className="bg-red-100 text-red-700">Disabled</Badge></td>
                  <td className="border p-2 text-muted-foreground">Permanently deactivated</td>
                  <td className="border p-2">No (cannot reactivate)</td>
                  <td className="border p-2 text-muted-foreground">Termination, resignation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <BusinessRules
        title="User Account Business Rules"
        rules={businessRules}
      />

      <WarningCallout title="Offboarding Security">
        When an employee is terminated, their user account must be disabled immediately—
        ideally before they are informed of the termination. Coordinate with IT and 
        HR to execute a synchronized offboarding process.
      </WarningCallout>

      <TipCallout title="Bulk User Creation">
        For large onboarding events (new office, acquisition), use the bulk import feature. 
        Prepare a CSV with employee IDs and roles, then import to create multiple accounts at once.
      </TipCallout>

      <InfoCallout title="SSO Integration">
        If SSO is enabled, users authenticate through your identity provider. Password 
        management is handled externally, but role assignment and account status are 
        still managed in HRplus.
      </InfoCallout>
    </div>
  );
}
