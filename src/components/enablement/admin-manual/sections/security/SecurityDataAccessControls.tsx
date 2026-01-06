import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Eye, EyeOff, Lock, Download, AlertTriangle } from 'lucide-react';

export function SecurityDataAccessControls() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Data access controls protect sensitive employee information through role-based viewing permissions,
        data masking, and export restrictions. Configure these controls to comply with GDPR and regional data protection laws.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>GDPR Article 25: Data Protection by Design</AlertTitle>
        <AlertDescription>
          Implement data minimization by ensuring users only see the data necessary for their role.
          PII fields should be masked or hidden from users who don't require access.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Data Classification Levels</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Classification</TableHead>
              <TableHead>Examples</TableHead>
              <TableHead>Access Level</TableHead>
              <TableHead>Export Allowed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <Badge variant="outline">Public</Badge>
              </TableCell>
              <TableCell>Company name, job titles, department names</TableCell>
              <TableCell>All authenticated users</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge variant="secondary">Internal</Badge>
              </TableCell>
              <TableCell>Employee names, work email, office location</TableCell>
              <TableCell>All employees</TableCell>
              <TableCell>Limited</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge variant="default">Confidential</Badge>
              </TableCell>
              <TableCell>Salary, personal email, phone numbers</TableCell>
              <TableCell>HR, Managers (direct reports)</TableCell>
              <TableCell>Restricted</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge variant="destructive">Restricted</Badge>
              </TableCell>
              <TableCell>National ID, bank details, medical records</TableCell>
              <TableCell>HR Admin, Payroll only</TableCell>
              <TableCell>Audit required</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">PII Field Masking</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              Masking Options
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Full Mask:</strong> ••••••••••</li>
              <li>• <strong>Partial Mask:</strong> •••-••-1234</li>
              <li>• <strong>Hidden:</strong> Field not visible at all</li>
              <li>• <strong>Click to Reveal:</strong> Logged access</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Reveal Access Logging
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• User who viewed the data</li>
              <li>• Timestamp of access</li>
              <li>• Employee record accessed</li>
              <li>• Business justification (if required)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Export Restrictions</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Export Type</TableHead>
              <TableHead>Permission Required</TableHead>
              <TableHead>Audit Trail</TableHead>
              <TableHead>Approval Workflow</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                Public Data Export
              </TableCell>
              <TableCell>Standard user</TableCell>
              <TableCell>Logged</TableCell>
              <TableCell>None</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Confidential Data Export</TableCell>
              <TableCell>HR Admin + Export Permission</TableCell>
              <TableCell>Logged with details</TableCell>
              <TableCell>Optional</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Bulk Employee Export</TableCell>
              <TableCell>HR Admin + Bulk Export</TableCell>
              <TableCell>Full audit</TableCell>
              <TableCell>Manager approval</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Restricted Data Export</TableCell>
              <TableCell>Super Admin only</TableCell>
              <TableCell>Full audit + alert</TableCell>
              <TableCell>Dual approval</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Data Subject Access Requests (DSAR)</AlertTitle>
        <AlertDescription>
          Under GDPR, employees can request all data held about them. Use the DSAR report feature
          in Admin → Compliance → Data Subject Requests to generate complete employee data packages.
        </AlertDescription>
      </Alert>
    </div>
  );
}
