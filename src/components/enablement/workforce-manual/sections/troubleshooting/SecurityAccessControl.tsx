import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Lightbulb, Key } from 'lucide-react';
import { TroubleshootingSection } from '@/components/enablement/manual/components/TroubleshootingSection';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';

const securityIssues = [
  {
    issue: 'User cannot access Workforce module at all',
    cause: 'User not assigned a role with Workforce module permissions, or role assignment has expired.',
    solution: 'Navigate to Security → User Roles and verify the user has an active role with Workforce access. Check the role assignment\'s effective and expiry dates. Extend or reassign as needed.'
  },
  {
    issue: 'Manager cannot view their team\'s employee data',
    cause: 'Manager-employee relationship not established in system, or RLS (Row-Level Security) policy blocking access.',
    solution: 'Verify the manager is set as "Reports To" on their direct reports\' position assignments. Check that the employee records are in the manager\'s assigned organizational scope.'
  },
  {
    issue: 'Sensitive fields visible to users who should not see them',
    cause: 'Field-level security not configured, or user has a role with broader access than intended.',
    solution: 'Go to Security → Field Security and review visibility rules for sensitive fields (salary, national ID, bank details). Restrict to specific roles. Check for inherited permissions from parent roles.'
  },
  {
    issue: 'PII appearing in exported reports or downloads',
    cause: 'Export permissions include PII fields, or masking rules not applied to report templates.',
    solution: 'Review the report template\'s field selections. Apply data masking rules in Settings → Security → Data Masking. Restrict export permissions to roles that legitimately need PII.'
  },
  {
    issue: 'Former employee still showing access in security audit',
    cause: 'User account not deactivated when employment ended, or audit report includes historical data.',
    solution: 'Verify the user account is deactivated (not just the employee record). Filter security audit to show only active accounts. Review offboarding checklist to ensure access revocation.'
  },
  {
    issue: 'Delegate cannot approve on behalf of manager',
    cause: 'Delegation not properly configured, or delegate lacks the underlying permission for the action.',
    solution: 'Check Settings → Security → Delegation. Verify the delegation is active and within date range. The delegate must have at least the same base role as the delegator for the delegated actions.'
  }
];

const rolePermissionMatrix = [
  { role: 'Employee (ESS)', view: 'Own record only', edit: 'Limited personal info', approve: 'None', admin: 'None' },
  { role: 'Manager (MSS)', view: 'Direct reports + own', edit: 'Own record only', approve: 'Team requests', admin: 'None' },
  { role: 'HR Partner', view: 'Assigned departments', edit: 'Assigned employees', approve: 'HR workflows', admin: 'Limited config' },
  { role: 'HR Administrator', view: 'All employees', edit: 'All employees', approve: 'All HR workflows', admin: 'Full module config' },
  { role: 'System Admin', view: 'All + security logs', edit: 'All + system settings', approve: 'All + security', admin: 'Full system' }
];

export function SecurityAccessControl() {
  return (
    <div className="space-y-6" data-manual-anchor="wf-troubleshooting-security">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle>10.5 Security & Access Control</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Troubleshooting permission configuration, RLS policies, and PII protection
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">Admin</Badge>
            <Badge variant="outline">Est. 12 min</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <TroubleshootingSection 
            items={securityIssues}
            title="Security & Access Troubleshooting Guide"
          />

          {/* Security Checklist */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Security Configuration Checklist
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  Access Control
                </h5>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>☑️ Role-based access configured</li>
                  <li>☑️ Manager hierarchy established</li>
                  <li>☑️ Organizational scope defined</li>
                  <li>☑️ Delegation rules documented</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  Data Protection
                </h5>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>☑️ PII fields identified and secured</li>
                  <li>☑️ Field-level security applied</li>
                  <li>☑️ Data masking rules active</li>
                  <li>☑️ Export restrictions configured</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-amber-500" />
                  Authentication
                </h5>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>☑️ Password policy enforced</li>
                  <li>☑️ Session timeout configured</li>
                  <li>☑️ MFA enabled for admin roles</li>
                  <li>☑️ SSO integration verified</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Role Permission Matrix */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-blue-500" />
              Role Permission Matrix - Workforce Module
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">View Access</th>
                    <th className="text-left p-3 font-medium">Edit Access</th>
                    <th className="text-left p-3 font-medium">Approve</th>
                    <th className="text-left p-3 font-medium">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rolePermissionMatrix.map((row) => (
                    <tr key={row.role}>
                      <td className="p-3 font-medium">{row.role}</td>
                      <td className="p-3 text-muted-foreground">{row.view}</td>
                      <td className="p-3 text-muted-foreground">{row.edit}</td>
                      <td className="p-3 text-muted-foreground">{row.approve}</td>
                      <td className="p-3 text-muted-foreground">{row.admin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PII Handling Guidelines */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-purple-500" />
              PII Handling Guidelines for Caribbean & Africa
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                variant="info"
                title="Caribbean Jurisdictions"
              >
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• <strong>Jamaica:</strong> Data Protection Act 2020 compliance</li>
                  <li>• <strong>Trinidad:</strong> Data Protection Act 2011 requirements</li>
                  <li>• <strong>Barbados:</strong> Data Protection Bill guidelines</li>
                  <li>• Apply strictest standard across multi-island operations</li>
                </ul>
              </FeatureCard>
              <FeatureCard
                variant="warning"
                title="African Jurisdictions"
              >
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• <strong>Ghana:</strong> Data Protection Act 2012 (Act 843)</li>
                  <li>• <strong>Nigeria:</strong> NDPR 2019 requirements</li>
                  <li>• <strong>Kenya:</strong> Data Protection Act 2019</li>
                  <li>• Cross-border data transfer restrictions apply</li>
                </ul>
              </FeatureCard>
            </div>

            <div className="mt-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h5 className="font-medium text-red-900 dark:text-red-100 flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                High-Sensitivity Fields (Always Restrict)
              </h5>
              <div className="flex flex-wrap gap-2">
                {['National ID', 'Tax ID', 'Bank Account', 'Salary', 'Medical Info', 'Emergency Contact', 'Home Address', 'Date of Birth', 'Marital Status', 'Dependents'].map((field) => (
                  <Badge key={field} variant="outline" className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Run a monthly Security Access Review report that lists all users 
              with elevated permissions. Verify each user still requires their access level and remove 
              stale permissions to maintain principle of least privilege.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            caption="Figure 10.5: Permission Audit Dashboard showing role assignments and access patterns"
          />

        </CardContent>
      </Card>
    </div>
  );
}
