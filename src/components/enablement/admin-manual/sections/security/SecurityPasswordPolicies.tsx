import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Lock, CheckCircle, XCircle } from 'lucide-react';

export function SecurityPasswordPolicies() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configure password policies to ensure strong authentication while maintaining usability.
        HRplus follows NIST 800-63B guidelines for modern password security standards.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>NIST 800-63B Guidelines</AlertTitle>
        <AlertDescription>
          Modern password guidelines emphasize length over complexity. A 12+ character password is more secure
          than an 8-character password with complex requirements that users write down.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Password Requirements</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setting</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Recommended</TableHead>
              <TableHead>Range</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Minimum Length</TableCell>
              <TableCell>12 characters</TableCell>
              <TableCell>12-16 characters</TableCell>
              <TableCell>8-128</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Require Uppercase</TableCell>
              <TableCell>Optional</TableCell>
              <TableCell>Optional</TableCell>
              <TableCell>Yes/No</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Require Numbers</TableCell>
              <TableCell>Optional</TableCell>
              <TableCell>Optional</TableCell>
              <TableCell>Yes/No</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Require Special Characters</TableCell>
              <TableCell>Optional</TableCell>
              <TableCell>Optional</TableCell>
              <TableCell>Yes/No</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Password History</TableCell>
              <TableCell>12 passwords</TableCell>
              <TableCell>12-24 passwords</TableCell>
              <TableCell>1-50</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Password Expiry Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Expiry Configuration</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Expiry Period:</strong> 90 days (or never for MFA-enabled accounts)</li>
              <li>• <strong>Warning Period:</strong> 14 days before expiry</li>
              <li>• <strong>Grace Period:</strong> 7 days after expiry</li>
              <li>• <strong>Force Change:</strong> On first login option</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Lockout Policy</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Failed Attempts:</strong> 5 attempts</li>
              <li>• <strong>Lockout Duration:</strong> 15-30 minutes</li>
              <li>• <strong>Reset Counter:</strong> After 30 minutes</li>
              <li>• <strong>Admin Unlock:</strong> Available</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Blocked Passwords</h4>
        <p className="text-sm text-muted-foreground">
          HRplus maintains a blocklist of commonly compromised passwords. Users cannot set passwords that:
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Appear in known breach databases</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Contain username or email</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Match common patterns (Password123!)</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Contain company name or HRplus</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Configuration Steps</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to Admin → Security → Password Policies</li>
          <li>Set minimum password length (12+ recommended)</li>
          <li>Configure complexity requirements if needed</li>
          <li>Set password history and expiry settings</li>
          <li>Configure account lockout policy</li>
          <li>Enable compromised password checking</li>
          <li>Save and apply to all users or specific groups</li>
        </ol>
      </div>
    </div>
  );
}
