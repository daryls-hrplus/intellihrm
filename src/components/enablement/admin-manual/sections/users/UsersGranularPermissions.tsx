import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, Edit, Plus, Trash2, Download, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout, WarningCallout, InfoCallout, ScreenshotPlaceholder } from '../../../manual/components';

const crudPermissions = [
  { action: 'View', icon: Eye, color: 'text-blue-500', description: 'Read access to records' },
  { action: 'Create', icon: Plus, color: 'text-green-500', description: 'Add new records' },
  { action: 'Edit', icon: Edit, color: 'text-amber-500', description: 'Modify existing records' },
  { action: 'Delete', icon: Trash2, color: 'text-red-500', description: 'Remove records' },
  { action: 'Export', icon: Download, color: 'text-purple-500', description: 'Download data' },
  { action: 'Approve', icon: CheckCircle, color: 'text-teal-500', description: 'Workflow approvals' }
];

const modulePermissionExample = {
  module: 'Employee Management',
  entities: [
    { entity: 'Employee Profile', view: true, create: true, edit: true, delete: false, export: true },
    { entity: 'Employment History', view: true, create: true, edit: true, delete: false, export: false },
    { entity: 'Compensation', view: false, create: false, edit: false, delete: false, export: false },
    { entity: 'Documents', view: true, create: true, edit: false, delete: false, export: true }
  ]
};

const piiCategories = [
  { category: 'Government IDs', examples: 'SSN, TRN, Passport Number', sensitivity: 'critical' },
  { category: 'Financial Data', examples: 'Bank accounts, Salary details', sensitivity: 'critical' },
  { category: 'Medical Information', examples: 'Health conditions, Disabilities', sensitivity: 'critical' },
  { category: 'Contact Details', examples: 'Personal phone, Home address', sensitivity: 'high' },
  { category: 'Family Information', examples: 'Dependents, Emergency contacts', sensitivity: 'medium' },
  { category: 'Performance Data', examples: 'Ratings, Disciplinary records', sensitivity: 'high' }
];

export function UsersGranularPermissions() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Configure CRUD permissions at module and entity level",
          "Apply field-level security for sensitive data",
          "Set up PII access controls with masking rules",
          "Implement data scope restrictions by container"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Role-Based Permissions (RBP) Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Intelli HRM implements <strong>granular Role-Based Permissions (RBP)</strong> that control 
            access at multiple levels: module, entity, action, and field. This ensures users 
            see only what they need for their job functions.
          </p>
          
          <div className="grid gap-3 md:grid-cols-6">
            {crudPermissions.map((perm) => {
              const IconComponent = perm.icon;
              return (
                <div key={perm.action} className="p-3 rounded-lg border text-center">
                  <IconComponent className={`h-5 w-5 mx-auto mb-2 ${perm.color}`} />
                  <Badge variant="outline" className="text-xs">{perm.action}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{perm.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 3.5.1: Role permission configuration showing CRUD action toggles"
        alt="Permission matrix interface with entity rows and View/Create/Edit/Delete/Export columns with toggle switches"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle>Entity-Level Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Example permission configuration for an HR Officer role:
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left font-medium">Entity</th>
                  <th className="border p-2 text-center font-medium">View</th>
                  <th className="border p-2 text-center font-medium">Create</th>
                  <th className="border p-2 text-center font-medium">Edit</th>
                  <th className="border p-2 text-center font-medium">Delete</th>
                  <th className="border p-2 text-center font-medium">Export</th>
                </tr>
              </thead>
              <tbody>
                {modulePermissionExample.entities.map((entity, i) => (
                  <tr key={entity.entity} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-2 font-medium">{entity.entity}</td>
                    <td className="border p-2 text-center">
                      {entity.view ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="border p-2 text-center">
                      {entity.create ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="border p-2 text-center">
                      {entity.edit ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="border p-2 text-center">
                      {entity.delete ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="border p-2 text-center">
                      {entity.export ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Field-Level Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Beyond entity-level access, you can control visibility of specific fields. 
            This is essential for sensitive data like salary and performance ratings.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <Badge className="mb-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Visible</Badge>
              <p className="text-sm text-muted-foreground">
                Field is shown with full value. User can view the complete data.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge className="mb-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Masked</Badge>
              <p className="text-sm text-muted-foreground">
                Field is partially hidden (e.g., ***-**-1234). User knows data exists but cannot see full value.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge className="mb-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Hidden</Badge>
              <p className="text-sm text-muted-foreground">
                Field is completely invisible. User does not know the field exists.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PII Access Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Personally Identifiable Information (PII) is classified by sensitivity level. 
            Access to each category must be explicitly granted and justified.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left font-medium">Category</th>
                  <th className="border p-2 text-left font-medium">Examples</th>
                  <th className="border p-2 text-center font-medium">Sensitivity</th>
                </tr>
              </thead>
              <tbody>
                {piiCategories.map((cat, i) => (
                  <tr key={cat.category} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-2 font-medium">{cat.category}</td>
                    <td className="border p-2 text-muted-foreground">{cat.examples}</td>
                    <td className="border p-2 text-center">
                      <Badge 
                        className={
                          cat.sensitivity === 'critical' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : cat.sensitivity === 'high'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }
                      >
                        {cat.sensitivity.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Container-Based Data Scope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Container access restricts which organizational units a user can access, 
            even if they have the functional permission.
          </p>
          
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium mb-2">Example: HR Officer - Jamaica Operations</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Companies:</span>
                <Badge variant="secondary">ABC Jamaica Ltd only</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Departments:</span>
                <Badge variant="secondary">All departments</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Locations:</span>
                <Badge variant="secondary">Kingston, Montego Bay</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This user can manage employees in Jamaica only, across all departments, 
              but limited to Kingston and Montego Bay locations.
            </p>
          </div>
        </CardContent>
      </Card>

      <WarningCallout title="PII Access Audit">
        All PII access is logged and audited. Users who access PII without legitimate 
        business need may be subject to disciplinary action. Ensure PII access is 
        granted only when strictly necessary.
      </WarningCallout>

      <TipCallout title="Least Privilege Principle">
        Start with minimal permissions and add as needed. It's easier to grant additional 
        access than to remove excess permissions after the fact.
      </TipCallout>

      <InfoCallout title="Permission Inheritance">
        When using role inheritance, child roles receive all parent permissions. You cannot 
        remove inherited permissions—only add to them. Plan your hierarchy carefully.
      </InfoCallout>
    </div>
  );
}
