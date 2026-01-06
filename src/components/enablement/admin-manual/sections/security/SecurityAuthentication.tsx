import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Key, AlertTriangle, CheckCircle } from 'lucide-react';

export function SecurityAuthentication() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configure Single Sign-On (SSO) authentication using industry-standard SAML 2.0 and OAuth 2.0 protocols.
        This section covers identity provider integration, certificate management, and authentication flow configuration.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Enterprise Security Standard</AlertTitle>
        <AlertDescription>
          SSO configuration aligns with SAML 2.0, OAuth 2.0, and OpenID Connect (OIDC) standards for enterprise-grade authentication.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Supported Identity Providers</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Configuration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Azure AD</TableCell>
              <TableCell>SAML 2.0 / OIDC</TableCell>
              <TableCell>Enterprise Application</TableCell>
              <TableCell><Badge variant="default">Supported</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Okta</TableCell>
              <TableCell>SAML 2.0 / OIDC</TableCell>
              <TableCell>SAML Application</TableCell>
              <TableCell><Badge variant="default">Supported</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Google Workspace</TableCell>
              <TableCell>SAML 2.0</TableCell>
              <TableCell>Custom SAML App</TableCell>
              <TableCell><Badge variant="default">Supported</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">ADFS</TableCell>
              <TableCell>SAML 2.0</TableCell>
              <TableCell>Relying Party Trust</TableCell>
              <TableCell><Badge variant="default">Supported</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">SSO Configuration Steps</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to Admin → Security → Authentication Settings</li>
          <li>Select your Identity Provider from the dropdown</li>
          <li>Download the HRplus SP metadata XML file</li>
          <li>Configure the IdP application using the SP metadata</li>
          <li>Upload the IdP metadata XML or enter details manually</li>
          <li>Configure attribute mappings (email, name, employee ID)</li>
          <li>Test the SSO connection with a test user</li>
          <li>Enable SSO for all users or specific groups</li>
        </ol>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Certificate Renewal</AlertTitle>
        <AlertDescription>
          SSO certificates typically expire every 1-3 years. Set calendar reminders 30 days before expiry
          to prevent authentication disruptions. Certificate rotation should follow your change management process.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Required Attribute Mappings</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>HRplus Attribute</TableHead>
              <TableHead>Common IdP Claim</TableHead>
              <TableHead>Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">email</TableCell>
              <TableCell>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress</TableCell>
              <TableCell><CheckCircle className="h-4 w-4 text-green-500" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">firstName</TableCell>
              <TableCell>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname</TableCell>
              <TableCell><CheckCircle className="h-4 w-4 text-green-500" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">lastName</TableCell>
              <TableCell>http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname</TableCell>
              <TableCell><CheckCircle className="h-4 w-4 text-green-500" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">employeeId</TableCell>
              <TableCell>Custom attribute (optional)</TableCell>
              <TableCell><Badge variant="outline">Optional</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
