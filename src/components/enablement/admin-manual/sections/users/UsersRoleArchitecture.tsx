import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Lock, Copy, Settings, ArrowRight } from 'lucide-react';
import { LearningObjectives, TipCallout, WarningCallout, InfoCallout, ScreenshotPlaceholder } from '../../../manual/components';

const roleTypes = [
  {
    type: 'System',
    badge: 'system',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    description: 'Built-in roles that cannot be modified or deleted',
    examples: ['Super Admin', 'Security Admin', 'Employee Self-Service'],
    editable: false,
    deletable: false,
    clonable: true
  },
  {
    type: 'Seeded',
    badge: 'seeded',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    description: 'Pre-configured roles that can be modified but not deleted',
    examples: ['Payroll Admin', 'Recruitment Manager', 'L&D Admin', 'HR Business Partner'],
    editable: true,
    deletable: false,
    clonable: true
  },
  {
    type: 'Custom',
    badge: 'custom',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    description: 'Organization-specific roles created by administrators',
    examples: ['Regional HR Lead', 'Benefits Coordinator', 'Timekeeper'],
    editable: true,
    deletable: true,
    clonable: true
  }
];

const permissionLayers = [
  {
    layer: 'Menu Access',
    description: 'Controls which navigation items and modules are visible',
    examples: ['Admin menu visibility', 'Payroll module access', 'Reports section']
  },
  {
    layer: 'Container Access',
    description: 'Controls access to organizational data scopes',
    examples: ['Specific companies', 'Departments', 'Cost centers', 'Locations']
  },
  {
    layer: 'Action Permissions',
    description: 'Controls what operations can be performed',
    examples: ['View', 'Create', 'Edit', 'Delete', 'Export', 'Approve']
  },
  {
    layer: 'Field-Level Access',
    description: 'Controls visibility and editability of specific fields',
    examples: ['Salary visibility', 'SSN masking', 'Performance rating edit']
  },
  {
    layer: 'PII Access',
    description: 'Controls access to sensitive personal information',
    examples: ['Full SSN/TRN', 'Bank details', 'Medical information', 'Disciplinary records']
  }
];

export function UsersRoleArchitecture() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          'Distinguish between System, Seeded, and Custom roles',
          'Understand the five-layer permission model',
          'Apply role inheritance and tenant visibility rules',
          'Design effective role structures for your organization'
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Role Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {roleTypes.map((role) => (
              <div key={role.type} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={role.color}>{role.type}</Badge>
                    <span className="font-medium">{role.description}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={role.editable ? 'outline' : 'secondary'}>
                      {role.editable ? '✓ Editable' : '✗ Read-only'}
                    </Badge>
                    <Badge variant={role.deletable ? 'outline' : 'secondary'}>
                      {role.deletable ? '✓ Deletable' : '✗ Protected'}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Examples:</span>
                  {role.examples.map((ex, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{ex}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 3.2.1: Role types overview showing System, Seeded, and Custom role categories"
        alt="Roles list view with filter tabs for System, Seeded, and Custom roles with color-coded badges"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Five-Layer Permission Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HRplus uses a <strong>five-layer permission model</strong> that provides granular 
            control over what users can see and do. Each layer builds upon the previous, 
            creating a comprehensive security framework.
          </p>
          
          <div className="space-y-3">
            {permissionLayers.map((layer, index) => (
              <div key={layer.layer} className="p-4 rounded-lg border">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{layer.layer}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{layer.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {layer.examples.map((ex, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{ex}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Role Inheritance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Roles can inherit permissions from parent roles, reducing configuration effort 
            and ensuring consistency across similar roles.
          </p>
          
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium mb-3">Inheritance Example</h4>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">HR User (Base)</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="secondary">HR Officer</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="secondary">HR Manager</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge>HR Director</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Each role inherits all permissions from its parent, plus its own additional permissions.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Best Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Create a base role with common permissions</li>
                <li>• Add specific permissions at each level</li>
                <li>• Limit inheritance depth to 3-4 levels</li>
                <li>• Document inheritance chains</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">✗ Avoid</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Deep inheritance chains (5+ levels)</li>
                <li>• Circular inheritance references</li>
                <li>• Inheriting from unrelated roles</li>
                <li>• Overriding inherited restrictions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Tenant Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            In multi-company environments, roles can be scoped to specific tenants 
            (companies) or made available globally across all companies.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <Badge className="mb-2">Global Roles</Badge>
              <p className="text-sm text-muted-foreground">
                Available across all companies. Ideal for shared service centers 
                and corporate functions.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge variant="outline" className="mb-2">Company-Specific Roles</Badge>
              <p className="text-sm text-muted-foreground">
                Only available within assigned companies. Ideal for local HR teams 
                and country-specific roles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WarningCallout title="Role Proliferation">
        Avoid creating too many custom roles. A typical organization needs 15-25 roles. 
        More than 50 roles indicates over-customization and maintenance burden.
      </WarningCallout>

      <TipCallout title="Role Naming Convention">
        Use consistent naming: [Function] + [Level] format (e.g., "Payroll Manager", 
        "Recruitment Officer", "L&D Admin"). This makes roles easier to find and assign.
      </TipCallout>
    </div>
  );
}
