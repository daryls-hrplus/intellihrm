import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function AccessCertification() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Access certification (also called User Access Review) is the periodic process of verifying that users 
        have appropriate access rights. This control helps prevent privilege accumulation and ensures least-privilege principles.
      </p>

      <Alert>
        <UserCheck className="h-4 w-4" />
        <AlertTitle>SOC 2 Control</AlertTitle>
        <AlertDescription>
          Periodic access reviews are a key control for SOC 2 Type II certification. Intelli HRM automates 
          the certification workflow to ensure timely completion and proper documentation.
        </AlertDescription>
      </Alert>

      <ScreenshotPlaceholder
        caption="Figure 7.3.1: Access certification campaign dashboard"
        alt="Certification campaign overview showing progress, pending reviews, and deadlines"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Certification Campaigns</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Certifier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Manager Certification</TableCell>
              <TableCell>Quarterly</TableCell>
              <TableCell>Direct reports' access</TableCell>
              <TableCell>People Manager</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Privileged Access</TableCell>
              <TableCell>Quarterly</TableCell>
              <TableCell>Admin roles, sensitive modules</TableCell>
              <TableCell>Security Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Application Access</TableCell>
              <TableCell>Semi-annual</TableCell>
              <TableCell>All users per application</TableCell>
              <TableCell>App Owner</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Full Enterprise</TableCell>
              <TableCell>Annual</TableCell>
              <TableCell>All users, all access</TableCell>
              <TableCell>Multiple certifiers</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Campaign Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Campaign Settings</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Duration:</strong> 14-30 days typical</li>
              <li>• <strong>Reminders:</strong> 7 days, 3 days, 1 day before deadline</li>
              <li>• <strong>Escalation:</strong> To manager's manager after deadline</li>
              <li>• <strong>Auto-revoke:</strong> Optional for unreviewed access</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Certifier Actions</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Approve:</strong> Confirm access is appropriate</li>
              <li>• <strong>Revoke:</strong> Request access removal</li>
              <li>• <strong>Modify:</strong> Adjust access level</li>
              <li>• <strong>Delegate:</strong> Assign to another reviewer</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 7.3.2: Certifier review interface"
        alt="Review screen showing user access details with approve/revoke/modify options"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Manager Certification Process</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Manager receives notification when campaign starts</li>
          <li>Review list of direct reports and their current access</li>
          <li>For each user, verify access is still required for their role</li>
          <li>Select action: Approve, Revoke, or Modify</li>
          <li>Provide justification for any non-standard decisions</li>
          <li>Submit certification before deadline</li>
          <li>Revoked access is automatically removed within 24 hours</li>
        </ol>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Remediation Workflow
        </h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Decision</TableHead>
              <TableHead>Action Taken</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Audit Record</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Approved</TableCell>
              <TableCell>No change to access</TableCell>
              <TableCell>Immediate</TableCell>
              <TableCell>Certification recorded</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Revoked</TableCell>
              <TableCell>Access removed automatically</TableCell>
              <TableCell>Within 24 hours</TableCell>
              <TableCell>Revocation + justification</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Modified</TableCell>
              <TableCell>Workflow to HR/Security</TableCell>
              <TableCell>Per approval workflow</TableCell>
              <TableCell>Change request created</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Not Reviewed</TableCell>
              <TableCell>Escalation or auto-revoke</TableCell>
              <TableCell>After deadline</TableCell>
              <TableCell>Non-compliance flagged</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 7.3.3: Certification campaign analytics"
        alt="Analytics dashboard showing completion rates, revocation trends, and compliance metrics"
        aspectRatio="wide"
      />

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Incomplete Certifications</AlertTitle>
        <AlertDescription>
          Uncompleted certifications are flagged as audit findings. If auto-revoke is enabled, 
          unreviewed privileged access will be automatically removed after the deadline to maintain security.
        </AlertDescription>
      </Alert>
    </div>
  );
}
