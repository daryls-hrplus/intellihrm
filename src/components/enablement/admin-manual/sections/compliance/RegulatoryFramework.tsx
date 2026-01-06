import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, FileText, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function RegulatoryFramework() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        HRplus operates across multiple regulatory jurisdictions, each with specific data protection and labor law requirements.
        This section provides an overview of key regulations and how HRplus supports compliance.
      </p>

      <Alert>
        <Globe className="h-4 w-4" />
        <AlertTitle>Multi-Jurisdictional Compliance</AlertTitle>
        <AlertDescription>
          HRplus is designed to support compliance across Caribbean, African, and international regulatory frameworks.
          Country-specific settings automatically apply relevant requirements.
        </AlertDescription>
      </Alert>

      <ScreenshotPlaceholder
        caption="Figure 7.1.1: Regulatory compliance dashboard showing status by jurisdiction"
        alt="Compliance dashboard with jurisdiction selector and regulation status indicators"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Data Protection Regulations</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Regulation</TableHead>
              <TableHead>Jurisdiction</TableHead>
              <TableHead>Key Requirements</TableHead>
              <TableHead>HRplus Controls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">GDPR</TableCell>
              <TableCell>European Union</TableCell>
              <TableCell>Consent, data portability, right to erasure</TableCell>
              <TableCell>Consent management, data export, deletion workflows</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Jamaica DPA</TableCell>
              <TableCell>Jamaica</TableCell>
              <TableCell>Fair processing, data security, breach notification</TableCell>
              <TableCell>Processing records, encryption, incident response</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ghana DPA</TableCell>
              <TableCell>Ghana</TableCell>
              <TableCell>Registration, cross-border transfer rules</TableCell>
              <TableCell>Data residency options, transfer safeguards</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Nigeria NDPR</TableCell>
              <TableCell>Nigeria</TableCell>
              <TableCell>Consent, local storage requirements</TableCell>
              <TableCell>Granular consent, regional data centers</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Trinidad DPA</TableCell>
              <TableCell>Trinidad & Tobago</TableCell>
              <TableCell>Data quality, security measures</TableCell>
              <TableCell>Validation rules, access controls</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Labor Law Compliance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Caribbean Region</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Minimum wage tracking by territory</li>
              <li>• Statutory leave entitlements</li>
              <li>• Termination procedures and notice periods</li>
              <li>• Union agreement integration</li>
              <li>• Gratuity and severance calculations</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">African Region</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Pension contribution requirements</li>
              <li>• Tax withholding compliance</li>
              <li>• Employment contract standards</li>
              <li>• Workplace safety regulations</li>
              <li>• Local content requirements</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 7.1.2: Country-specific compliance configuration"
        alt="Settings page for configuring jurisdiction-specific compliance rules"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Industry-Specific Requirements</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Industry</TableHead>
              <TableHead>Regulatory Body</TableHead>
              <TableHead>Key Compliance Areas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Financial Services</TableCell>
              <TableCell>Central Banks, FSC</TableCell>
              <TableCell>Background checks, fit & proper assessments</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Healthcare</TableCell>
              <TableCell>Medical Councils</TableCell>
              <TableCell>License verification, credential tracking</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Oil & Gas</TableCell>
              <TableCell>Energy Ministries</TableCell>
              <TableCell>Local content, safety certifications</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Government</TableCell>
              <TableCell>Public Service Commissions</TableCell>
              <TableCell>Merit-based hiring, transparency</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Regulatory Updates</AlertTitle>
        <AlertDescription>
          Regulations change frequently. Subscribe to HRplus regulatory updates to receive notifications when 
          compliance requirements are updated. Review the compliance dashboard quarterly for any changes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
