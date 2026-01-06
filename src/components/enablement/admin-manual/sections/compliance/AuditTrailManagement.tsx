import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSearch, Clock, Lock, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function AuditTrailManagement() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Audit trails provide immutable records of all system activities, enabling forensic investigation,
        compliance verification, and security monitoring. This section covers audit log management and investigation procedures.
      </p>

      <Alert>
        <FileSearch className="h-4 w-4" />
        <AlertTitle>Immutable Logging</AlertTitle>
        <AlertDescription>
          All audit logs are cryptographically signed and stored in append-only storage. 
          Logs cannot be modified or deleted, ensuring chain of custody for legal and compliance purposes.
        </AlertDescription>
      </Alert>

      <ScreenshotPlaceholder
        caption="Figure 7.2.1: Audit trail search and filtering interface"
        alt="Audit log viewer with date range, user, and event type filters"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Audited Event Types</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Events Captured</TableHead>
              <TableHead>Data Recorded</TableHead>
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Authentication</TableCell>
              <TableCell>Login, logout, MFA, password changes</TableCell>
              <TableCell>User, IP, device, location, outcome</TableCell>
              <TableCell><Badge>High</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Data Access</TableCell>
              <TableCell>View, export, print of sensitive data</TableCell>
              <TableCell>User, record type, fields accessed</TableCell>
              <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Data Modification</TableCell>
              <TableCell>Create, update, delete operations</TableCell>
              <TableCell>Before/after values, change reason</TableCell>
              <TableCell><Badge>High</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Configuration</TableCell>
              <TableCell>Settings changes, role updates</TableCell>
              <TableCell>Setting name, old/new values</TableCell>
              <TableCell><Badge className="bg-red-500">Critical</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">AI Interactions</TableCell>
              <TableCell>Queries, responses, overrides</TableCell>
              <TableCell>Prompt, response, user feedback</TableCell>
              <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Retention Policies
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Standard Retention</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Security events:</strong> 7 years</li>
              <li>• <strong>Data modifications:</strong> 7 years</li>
              <li>• <strong>Access logs:</strong> 3 years</li>
              <li>• <strong>Session logs:</strong> 1 year</li>
              <li>• <strong>AI interactions:</strong> 5 years</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Extended Retention</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Legal holds extend retention indefinitely</li>
              <li>• Regulatory requirements may extend periods</li>
              <li>• Litigation preservation overrides deletion</li>
              <li>• Export before deletion for archival</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 7.2.2: Retention policy configuration"
        alt="Settings page for configuring audit log retention periods by category"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Investigation Procedures</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to Admin → Compliance → Audit Trail</li>
          <li>Set the date range for the investigation period</li>
          <li>Filter by user, event type, or affected record</li>
          <li>Review event details including before/after values</li>
          <li>Export filtered results for documentation</li>
          <li>Create investigation report with findings</li>
          <li>Apply legal hold if litigation is anticipated</li>
        </ol>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Legal Holds
        </h4>
        <p className="text-sm text-muted-foreground">
          Legal holds preserve audit records beyond normal retention when litigation or investigation is anticipated.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Who Can Perform</TableHead>
              <TableHead>Process</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Create Legal Hold</TableCell>
              <TableCell>Super Admin, Legal Counsel</TableCell>
              <TableCell>Define scope, set matter ID, notify custodians</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Extend Hold</TableCell>
              <TableCell>Super Admin, Legal Counsel</TableCell>
              <TableCell>Update expiry, add records to scope</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Release Hold</TableCell>
              <TableCell>Legal Counsel only</TableCell>
              <TableCell>Requires written authorization</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 7.2.3: Legal hold management interface"
        alt="Legal hold dashboard showing active holds, scope, and affected records"
        aspectRatio="wide"
      />

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Investigation Best Practices</AlertTitle>
        <AlertDescription>
          Always create a legal hold before beginning any formal investigation. Document your search criteria 
          and export results immediately. Never attempt to modify or delete audit records during an investigation.
        </AlertDescription>
      </Alert>
    </div>
  );
}
