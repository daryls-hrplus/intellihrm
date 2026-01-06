import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Smartphone, Key, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function SecurityMFA() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Multi-Factor Authentication (MFA) adds an additional layer of security by requiring users to provide
        two or more verification factors. Configure MFA policies to protect sensitive HR data and meet compliance requirements.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Compliance Requirement</AlertTitle>
        <AlertDescription>
          MFA is required for SOC 2 Type II compliance and strongly recommended under GDPR for systems processing personal data.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Supported MFA Methods</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Security Level</TableHead>
              <TableHead>User Experience</TableHead>
              <TableHead>Recommended For</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Authenticator App (TOTP)
              </TableCell>
              <TableCell><Badge variant="default">High</Badge></TableCell>
              <TableCell>Good</TableCell>
              <TableCell>All users</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Hardware Security Key
              </TableCell>
              <TableCell><Badge className="bg-green-500">Highest</Badge></TableCell>
              <TableCell>Excellent</TableCell>
              <TableCell>Administrators, executives</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SMS Verification</TableCell>
              <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              <TableCell>Good</TableCell>
              <TableCell>Fallback only</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Email Verification</TableCell>
              <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              <TableCell>Good</TableCell>
              <TableCell>Fallback only</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 4.2.1: MFA policy configuration and enforcement settings"
        alt="MFA settings page showing enforcement options, allowed methods, and grace period configuration"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">MFA Policy Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Enforcement Options</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Required for All:</strong> All users must enroll</li>
              <li>• <strong>Role-Based:</strong> Required for specific roles</li>
              <li>• <strong>Optional:</strong> Users can opt-in</li>
              <li>• <strong>Conditional:</strong> Based on risk signals</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Risk-Based Triggers</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• New device or browser detected</li>
              <li>• Unusual login location</li>
              <li>• Accessing sensitive modules</li>
              <li>• After password reset</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Implementation Steps</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to Admin → Security → Multi-Factor Authentication</li>
          <li>Enable MFA at the company level</li>
          <li>Select allowed authentication methods</li>
          <li>Configure enforcement policy (all users or role-based)</li>
          <li>Set grace period for user enrollment (recommended: 7-14 days)</li>
          <li>Configure recovery options for lost devices</li>
          <li>Communicate rollout plan to users</li>
          <li>Monitor enrollment progress in the security dashboard</li>
        </ol>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Recovery Codes</AlertTitle>
        <AlertDescription>
          Ensure users save their recovery codes during MFA enrollment. Lost devices without recovery codes
          require administrator intervention to reset MFA, which involves identity verification procedures.
        </AlertDescription>
      </Alert>
    </div>
  );
}
