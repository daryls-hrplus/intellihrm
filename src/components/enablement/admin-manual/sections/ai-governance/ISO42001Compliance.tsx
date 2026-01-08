import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, FileCheck, Scale, AlertTriangle, Eye } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function ISO42001Compliance() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        ISO/IEC 42001 is the international standard for AI Management Systems. Intelli HRM provides built-in tools 
        to help organizations achieve and maintain compliance with AI governance requirements.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>AI Management System (AIMS)</AlertTitle>
        <AlertDescription>
          ISO 42001 requires organizations to establish, implement, maintain, and continually improve an AI 
          management system. HRplus provides the framework and tools to support these requirements.
        </AlertDescription>
      </Alert>

      <ScreenshotPlaceholder
        caption="Figure 6.4.1: ISO 42001 Compliance Dashboard"
        alt="Compliance dashboard showing certification status, control areas, and audit readiness"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">AI Risk Assessment</h4>
        <p className="text-sm text-muted-foreground">
          Systematic identification and evaluation of risks associated with AI systems in HR processes.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Risk Category</TableHead>
              <TableHead>Assessment Criteria</TableHead>
              <TableHead>Mitigation Controls</TableHead>
              <TableHead>Review Frequency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Bias & Fairness</TableCell>
              <TableCell>Demographic parity, equal opportunity</TableCell>
              <TableCell>Bias detection, diverse training data</TableCell>
              <TableCell>Continuous</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Privacy</TableCell>
              <TableCell>Data minimization, consent, retention</TableCell>
              <TableCell>PII detection, anonymization</TableCell>
              <TableCell>Monthly</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Transparency</TableCell>
              <TableCell>Explainability, disclosure</TableCell>
              <TableCell>Decision logging, user notifications</TableCell>
              <TableCell>Per interaction</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Accountability</TableCell>
              <TableCell>Audit trails, responsibility</TableCell>
              <TableCell>Human oversight, approval workflows</TableCell>
              <TableCell>Continuous</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Scale className="h-4 w-4" />
          Bias Detection & Mitigation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Detection Methods</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Statistical parity testing</li>
              <li>• Protected class outcome analysis</li>
              <li>• Language sentiment analysis</li>
              <li>• Historical decision comparison</li>
              <li>• Automated fairness metrics</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Mitigation Actions</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Automatic flagging for review</li>
              <li>• Human-in-the-loop checkpoints</li>
              <li>• Model retraining triggers</li>
              <li>• Bias incident documentation</li>
              <li>• Remediation tracking</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 6.4.2: Bias detection monitoring dashboard"
        alt="Bias monitoring screen showing fairness metrics across protected characteristics"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          Model Governance
        </h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Governance Area</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Intelli HRM Implementation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Model Registry</TableCell>
              <TableCell>Catalog of all AI models in use</TableCell>
              <TableCell>Centralized registry with versioning</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Purpose Limitation</TableCell>
              <TableCell>Models used only for intended purposes</TableCell>
              <TableCell>Use case restrictions, approval workflow</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Performance Monitoring</TableCell>
              <TableCell>Ongoing accuracy and drift detection</TableCell>
              <TableCell>Automated metrics, alerting</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Lifecycle Management</TableCell>
              <TableCell>Controlled deployment, updates, retirement</TableCell>
              <TableCell>Version control, change management</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Audit Documentation
        </h4>
        <p className="text-sm text-muted-foreground">
          Comprehensive documentation required for ISO 42001 certification and ongoing audits.
        </p>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">AI Policy Documentation</span>
              <p className="text-muted-foreground">Governance policies, ethical guidelines</p>
            </div>
            <div>
              <span className="font-medium">Risk Assessment Records</span>
              <p className="text-muted-foreground">Impact assessments, risk registers</p>
            </div>
            <div>
              <span className="font-medium">Training Records</span>
              <p className="text-muted-foreground">Staff AI literacy, role-specific training</p>
            </div>
            <div>
              <span className="font-medium">Incident Reports</span>
              <p className="text-muted-foreground">Bias incidents, remediation actions</p>
            </div>
            <div>
              <span className="font-medium">Audit Logs</span>
              <p className="text-muted-foreground">All AI interactions, decisions, overrides</p>
            </div>
            <div>
              <span className="font-medium">Certification Evidence</span>
              <p className="text-muted-foreground">Control testing, compliance attestations</p>
            </div>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 6.4.3: Audit documentation and evidence repository"
        alt="Document management interface for ISO 42001 audit evidence and certification records"
        aspectRatio="wide"
      />

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Continuous Compliance</AlertTitle>
        <AlertDescription>
          ISO 42001 requires ongoing compliance, not just initial certification. Schedule quarterly reviews 
          of AI governance controls and annual comprehensive audits to maintain certification status.
        </AlertDescription>
      </Alert>
    </div>
  );
}
