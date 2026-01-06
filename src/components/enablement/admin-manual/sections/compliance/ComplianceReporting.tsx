import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function ComplianceReporting() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Compliance reporting provides evidence of control effectiveness for auditors and regulators. 
        HRplus generates reports aligned with SOC 2, ISO 27001, and regional compliance frameworks.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Audit-Ready Documentation</AlertTitle>
        <AlertDescription>
          All compliance reports are designed to meet auditor requirements with proper evidence trails, 
          timestamps, and attestation records. Export reports in auditor-friendly formats.
        </AlertDescription>
      </Alert>

      <ScreenshotPlaceholder
        caption="Figure 7.4.1: Compliance reporting dashboard"
        alt="Main compliance dashboard showing framework status, control health, and report generation"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Framework Alignment</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Framework</TableHead>
              <TableHead>Control Areas</TableHead>
              <TableHead>HRplus Coverage</TableHead>
              <TableHead>Report Types</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">SOC 2 Type II</TableCell>
              <TableCell>Security, Availability, Confidentiality</TableCell>
              <TableCell><Badge className="bg-green-500">Full</Badge></TableCell>
              <TableCell>Control matrix, evidence packages</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">ISO 27001</TableCell>
              <TableCell>Information Security Management</TableCell>
              <TableCell><Badge className="bg-green-500">Full</Badge></TableCell>
              <TableCell>ISMS documentation, control status</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">ISO 42001</TableCell>
              <TableCell>AI Management System</TableCell>
              <TableCell><Badge className="bg-green-500">Full</Badge></TableCell>
              <TableCell>AI governance, risk assessment</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">GDPR</TableCell>
              <TableCell>Data Protection</TableCell>
              <TableCell><Badge className="bg-green-500">Full</Badge></TableCell>
              <TableCell>DPIA, processing records, consent logs</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Audit Readiness Dashboard
        </h4>
        <p className="text-sm text-muted-foreground">
          Real-time visibility into control health and audit preparedness.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Control Status
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Operating effectiveness %</li>
              <li>• Controls with exceptions</li>
              <li>• Remediation progress</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Evidence Collection
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Automated evidence capture</li>
              <li>• Evidence completeness %</li>
              <li>• Missing documentation alerts</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Audit Timeline
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Days until audit</li>
              <li>• Open findings count</li>
              <li>• Preparation checklist</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 7.4.2: Control matrix with evidence mapping"
        alt="Detailed control matrix showing SOC 2 controls mapped to HRplus features and evidence"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Available Reports</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Format</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Access Control Summary</TableCell>
              <TableCell>User access and privileges overview</TableCell>
              <TableCell>Monthly / On-demand</TableCell>
              <TableCell>PDF, Excel</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Security Event Report</TableCell>
              <TableCell>Security incidents and responses</TableCell>
              <TableCell>Monthly / On-demand</TableCell>
              <TableCell>PDF, Excel</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Change Management Log</TableCell>
              <TableCell>System configuration changes</TableCell>
              <TableCell>On-demand</TableCell>
              <TableCell>PDF, Excel, JSON</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Data Processing Inventory</TableCell>
              <TableCell>GDPR Article 30 compliance</TableCell>
              <TableCell>Quarterly</TableCell>
              <TableCell>PDF, Excel</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">AI Governance Report</TableCell>
              <TableCell>AI usage, bias incidents, human reviews</TableCell>
              <TableCell>Monthly</TableCell>
              <TableCell>PDF, Excel</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Certification Evidence Pack</TableCell>
              <TableCell>Complete audit evidence package</TableCell>
              <TableCell>Pre-audit</TableCell>
              <TableCell>ZIP archive</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 7.4.3: Report generation and scheduling interface"
        alt="Report builder showing template selection, date range, and delivery options"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Generating Audit Evidence</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to Admin → Compliance → Reporting</li>
          <li>Select the compliance framework (SOC 2, ISO 27001, etc.)</li>
          <li>Choose the audit period date range</li>
          <li>Select controls to include in evidence package</li>
          <li>Generate report and review for completeness</li>
          <li>Export in auditor-requested format</li>
          <li>Store copy in document management for records</li>
        </ol>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Pre-Audit Preparation</AlertTitle>
        <AlertDescription>
          Generate and review all compliance reports at least 30 days before scheduled audits. 
          Address any control gaps or missing evidence before auditor arrival. Use the audit readiness 
          checklist to ensure all documentation is complete.
        </AlertDescription>
      </Alert>
    </div>
  );
}
