import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Shield, Clock, Bell, AlertTriangle } from 'lucide-react';

export function SecurityAuditLogging() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Comprehensive audit logging captures all security-relevant events for compliance reporting,
        incident investigation, and operational monitoring. Configure event categories, retention policies, and alert thresholds.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Compliance Requirements</AlertTitle>
        <AlertDescription>
          SOC 2 requires 90-day minimum log retention. Regulated industries (healthcare, finance)
          may require 7+ years. Configure retention based on your compliance obligations.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Audit Event Categories</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Events Logged</TableHead>
              <TableHead>Retention</TableHead>
              <TableHead>Alert Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Authentication</TableCell>
              <TableCell>Login, logout, failed attempts, MFA events</TableCell>
              <TableCell>90 days</TableCell>
              <TableCell><Badge variant="default">Yes</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Authorization</TableCell>
              <TableCell>Permission changes, role assignments, access denials</TableCell>
              <TableCell>1 year</TableCell>
              <TableCell><Badge variant="default">Yes</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Data Access</TableCell>
              <TableCell>PII views, exports, bulk downloads</TableCell>
              <TableCell>2 years</TableCell>
              <TableCell><Badge variant="default">Yes</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Data Modification</TableCell>
              <TableCell>Create, update, delete operations on HR records</TableCell>
              <TableCell>7 years</TableCell>
              <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">System Configuration</TableCell>
              <TableCell>Security settings, policy changes, integration updates</TableCell>
              <TableCell>7 years</TableCell>
              <TableCell><Badge variant="default">Yes</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Payroll Events</TableCell>
              <TableCell>Salary changes, bank updates, payment processing</TableCell>
              <TableCell>7 years</TableCell>
              <TableCell><Badge variant="default">Yes</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Audit Log Fields</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Standard Fields
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Timestamp (UTC)</li>
              <li>• User ID and email</li>
              <li>• IP address</li>
              <li>• User agent / device</li>
              <li>• Action performed</li>
              <li>• Target resource</li>
              <li>• Result (success/failure)</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Extended Context
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Session ID</li>
              <li>• Geolocation (if available)</li>
              <li>• Previous vs new values (for changes)</li>
              <li>• Related record IDs</li>
              <li>• Workflow/approval context</li>
              <li>• API vs UI source</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Alert Thresholds</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alert Type</TableHead>
              <TableHead>Default Threshold</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Notification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Failed Login Attempts
              </TableCell>
              <TableCell>5 attempts in 5 minutes</TableCell>
              <TableCell><Badge variant="default">Medium</Badge></TableCell>
              <TableCell>Email + Dashboard</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Unusual Access Location</TableCell>
              <TableCell>New country detected</TableCell>
              <TableCell><Badge variant="default">Medium</Badge></TableCell>
              <TableCell>Email + Dashboard</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Bulk Data Export</TableCell>
              <TableCell>100+ records exported</TableCell>
              <TableCell><Badge variant="destructive">High</Badge></TableCell>
              <TableCell>Immediate + SMS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Privilege Escalation</TableCell>
              <TableCell>Any Super Admin role change</TableCell>
              <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
              <TableCell>Immediate + SMS + SIEM</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Log Integrity</AlertTitle>
        <AlertDescription>
          Audit logs are tamper-evident and cannot be modified or deleted by any user, including Super Admins.
          Logs are cryptographically signed and can be exported for external SIEM integration.
        </AlertDescription>
      </Alert>
    </div>
  );
}
