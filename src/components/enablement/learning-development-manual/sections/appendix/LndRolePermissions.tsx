import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, X, Minus } from 'lucide-react';

const PERMISSIONS = [
  // Course & Content
  { feature: 'View Course Catalog', employee: 'full', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'Self-Enroll in Courses', employee: 'full', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'Create/Edit Courses', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'limited', consultant: 'full', executive: 'none' },
  { feature: 'Publish/Unpublish Courses', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'none', consultant: 'full', executive: 'none' },
  { feature: 'Delete Courses', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'none', consultant: 'full', executive: 'none' },
  { feature: 'Manage Course Categories', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'none', consultant: 'full', executive: 'none' },
  { feature: 'Upload SCORM/xAPI Content', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'none', consultant: 'full', executive: 'none' },
  
  // Enrollments
  { feature: 'View Own Enrollments', employee: 'full', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'View Team Enrollments', employee: 'none', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'View All Enrollments', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'limited', consultant: 'full', executive: 'limited' },
  { feature: 'Assign Training to Team', employee: 'none', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'none' },
  { feature: 'Bulk Enrollment', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'none' },
  { feature: 'Cancel Enrollments', employee: 'limited', manager: 'limited', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'none' },
  
  // Compliance
  { feature: 'View Own Compliance Status', employee: 'full', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'View Team Compliance', employee: 'none', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'Configure Compliance Rules', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'none', consultant: 'full', executive: 'none' },
  { feature: 'Grant Exemptions', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'limited', consultant: 'full', executive: 'none' },
  { feature: 'Manage Recertification', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'none', consultant: 'full', executive: 'none' },
  
  // Vendors & External
  { feature: 'View Vendor Catalog', employee: 'full', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'Manage Vendors', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'limited', consultant: 'full', executive: 'none' },
  { feature: 'Submit External Training', employee: 'full', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'Approve External Training', employee: 'none', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'none' },
  
  // Analytics & Reports
  { feature: 'View Personal Dashboard', employee: 'full', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'View Team Analytics', employee: 'none', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'View Organization Analytics', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'limited', consultant: 'full', executive: 'full' },
  { feature: 'Export Reports', employee: 'limited', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'Configure Dashboards', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'none', consultant: 'full', executive: 'none' },
  
  // Budgets
  { feature: 'View Training Budget', employee: 'none', manager: 'limited', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'Manage Training Budget', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'limited', consultant: 'full', executive: 'none' },
  
  // AI Features
  { feature: 'View AI Recommendations', employee: 'full', manager: 'full', ldAdmin: 'full', hrPartner: 'full', consultant: 'full', executive: 'full' },
  { feature: 'Configure AI Settings', employee: 'none', manager: 'none', ldAdmin: 'full', hrPartner: 'none', consultant: 'full', executive: 'none' },
];

const getPermissionIcon = (level: string) => {
  if (level === 'full') return <Check className="h-4 w-4 text-green-600" />;
  if (level === 'limited') return <Minus className="h-4 w-4 text-amber-600" />;
  return <X className="h-4 w-4 text-muted-foreground/50" />;
};

const getPermissionBadge = (level: string) => {
  if (level === 'full') return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">Full</Badge>;
  if (level === 'limited') return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs">Limited</Badge>;
  return <Badge variant="outline" className="text-xs text-muted-foreground">None</Badge>;
};

export function LndRolePermissions() {
  return (
    <section id="app-f" data-manual-anchor="app-f" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Shield className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Appendix F: Role-Based Permissions Matrix</h2>
          <p className="text-muted-foreground">Granular permission breakdown for all L&D features by role</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              {getPermissionBadge('full')}
              <span className="text-sm">Full access to feature</span>
            </div>
            <div className="flex items-center gap-2">
              {getPermissionBadge('limited')}
              <span className="text-sm">Restricted access (own data or team only)</span>
            </div>
            <div className="flex items-center gap-2">
              {getPermissionBadge('none')}
              <span className="text-sm">No access</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>L&D Permissions Matrix</CardTitle>
          <CardDescription>31 features across 6 roles</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-48">Feature</TableHead>
                <TableHead className="text-center">Employee</TableHead>
                <TableHead className="text-center">Manager</TableHead>
                <TableHead className="text-center">L&D Admin</TableHead>
                <TableHead className="text-center">HR Partner</TableHead>
                <TableHead className="text-center">Consultant</TableHead>
                <TableHead className="text-center">Executive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS.map((perm, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{perm.feature}</TableCell>
                  <TableCell className="text-center">{getPermissionIcon(perm.employee)}</TableCell>
                  <TableCell className="text-center">{getPermissionIcon(perm.manager)}</TableCell>
                  <TableCell className="text-center">{getPermissionIcon(perm.ldAdmin)}</TableCell>
                  <TableCell className="text-center">{getPermissionIcon(perm.hrPartner)}</TableCell>
                  <TableCell className="text-center">{getPermissionIcon(perm.consultant)}</TableCell>
                  <TableCell className="text-center">{getPermissionIcon(perm.executive)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Employee</h4>
              <p className="text-sm text-muted-foreground">Self-service access to own training, enrollments, and compliance status.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Manager</h4>
              <p className="text-sm text-muted-foreground">Team oversight including training assignments, approvals, and team analytics.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">L&D Admin</h4>
              <p className="text-sm text-muted-foreground">Full administrative access to course management, compliance, and system configuration.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">HR Partner</h4>
              <p className="text-sm text-muted-foreground">Cross-departmental access with limited configuration, focused on enrollment and reporting.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Consultant</h4>
              <p className="text-sm text-muted-foreground">Implementation-level access for system configuration and advanced setup.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Executive</h4>
              <p className="text-sm text-muted-foreground">Strategic oversight with read-only access to organization-wide analytics and dashboards.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
