import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Copy, Trash2, Eye } from 'lucide-react';
import { 
  LearningObjectives, 
  StepByStep, 
  FieldReferenceTable, 
  BusinessRules,
  TipCallout, 
  WarningCallout,
  ScreenshotPlaceholder 
} from '../../../manual/components';
import type { Step, FieldDefinition, BusinessRule } from '../../../manual/components';

const roleFields: FieldDefinition[] = [
  {
    name: "Role Name",
    type: "Text",
    required: true,
    description: "Display name for the role",
    validation: "2-100 characters, must be unique"
  },
  {
    name: "Role Code",
    type: "Text",
    required: true,
    description: "System identifier for the role",
    validation: "2-30 characters, uppercase, no spaces"
  },
  {
    name: "Role Type",
    type: "Select",
    required: true,
    description: "System, Seeded, or Custom",
    defaultValue: "Custom"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Purpose and scope of the role"
  },
  {
    name: "Parent Role",
    type: "Select",
    required: false,
    description: "Role to inherit permissions from"
  },
  {
    name: "Tenant Visibility",
    type: "Select",
    required: true,
    description: "Global or specific companies",
    defaultValue: "Global"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether the role is available for assignment",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Roles",
    description: "Go to Admin → Security → Roles",
    expectedResult: "Roles list page displays with existing roles"
  },
  {
    title: "Click Create Role",
    description: "Click the 'Add Role' button or clone an existing role",
    expectedResult: "Role creation wizard opens"
  },
  {
    title: "Enter Role Details",
    description: "Complete the basic role information",
    substeps: [
      "Enter a descriptive role name (e.g., 'Regional HR Manager')",
      "Enter or modify the role code",
      "Add description explaining the role purpose",
      "Select parent role if using inheritance"
    ]
  },
  {
    title: "Configure Menu Access",
    description: "Select which modules and menu items are visible",
    substeps: [
      "Expand each module category",
      "Check/uncheck individual menu items",
      "Review inherited permissions (shown in gray)"
    ],
    expectedResult: "Menu access configured"
  },
  {
    title: "Configure Container Access",
    description: "Define data scope boundaries",
    substeps: [
      "Select accessible companies",
      "Select accessible departments (or 'All')",
      "Configure location access if needed"
    ],
    expectedResult: "Data scope defined"
  },
  {
    title: "Configure Action Permissions",
    description: "Set CRUD permissions for each entity",
    substeps: [
      "For each module, set View/Create/Edit/Delete permissions",
      "Configure special actions (Approve, Export, etc.)",
      "Review inherited permissions"
    ]
  },
  {
    title: "Configure PII Access",
    description: "Set sensitive data viewing permissions",
    substeps: [
      "Enable/disable access to each PII category",
      "Set masking rules (Full, Partial, None)",
      "Document justification for PII access"
    ]
  },
  {
    title: "Review and Save",
    description: "Verify all settings and save the role",
    expectedResult: "Role created and available for assignment"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Role codes must be unique across the system",
    enforcement: "System",
    description: "Prevents duplicate identifiers"
  },
  {
    rule: "System roles cannot be modified or deleted",
    enforcement: "System",
    description: "Protects core functionality"
  },
  {
    rule: "Roles with assigned users cannot be deleted",
    enforcement: "System",
    description: "Must unassign users first"
  },
  {
    rule: "PII access requires documented justification",
    enforcement: "Policy",
    description: "Audit requirement for GDPR compliance"
  },
  {
    rule: "Role changes are logged with before/after values",
    enforcement: "System",
    description: "Full audit trail maintained"
  }
];

export function UsersRoleManagement() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Create new custom roles with appropriate permissions",
          "Clone existing roles as starting templates",
          "Configure menu, container, action, and PII access",
          "Manage role lifecycle (create, modify, deprecate)"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Role Management Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Role management is a critical security function. Properly configured roles 
            ensure users have exactly the access they need—no more, no less.
          </p>
          
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg border bg-muted/30 text-center">
              <Plus className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-medium text-sm">Create New</h4>
              <p className="text-xs text-muted-foreground">Build from scratch</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30 text-center">
              <Copy className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Clone Existing</h4>
              <p className="text-xs text-muted-foreground">Copy and modify</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30 text-center">
              <Eye className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Review Access</h4>
              <p className="text-xs text-muted-foreground">Audit permissions</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30 text-center">
              <Trash2 className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Deprecate</h4>
              <p className="text-xs text-muted-foreground">Retire old roles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 3.3.1: Roles list page showing role management actions"
        alt="Roles data grid with columns for name, type, users count, and action buttons for view, clone, and delete"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Role Field Reference"
        fields={roleFields}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.3.2: Role creation wizard showing permission configuration tabs"
        alt="Role creation form with tabs for Basic Info, Menu Access, Container Access, Action Permissions, and PII Access"
        aspectRatio="wide"
      />

      <StepByStep
        title="Creating a New Role"
        steps={creationSteps}
      />

      <Card>
        <CardHeader>
          <CardTitle>Cloning Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Cloning is the recommended approach when creating roles similar to existing ones. 
            It saves time and ensures consistency.
          </p>
          
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium mb-2">Clone Process</h4>
            <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
              <li>Find the role to clone in the roles list</li>
              <li>Click the "Clone" action (or use the dropdown menu)</li>
              <li>Enter a new name and code for the cloned role</li>
              <li>Review and modify permissions as needed</li>
              <li>Save the new role</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <BusinessRules
        title="Role Management Business Rules"
        rules={businessRules}
      />

      <WarningCallout title="Testing Before Production">
        Always test new roles with a test user account before deploying to production users. 
        Verify the role provides exactly the intended access—no more, no less.
      </WarningCallout>

      <TipCallout title="Role Documentation">
        Maintain a role matrix document that maps job titles to roles. This simplifies 
        onboarding and ensures consistent access provisioning.
      </TipCallout>
    </div>
  );
}
