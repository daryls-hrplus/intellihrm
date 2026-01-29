import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, FileCheck, Download, Clock, CheckCircle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsComplianceReporting() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Compliance Reporting provides visibility into mandatory training status across the organization.
          Data is sourced from <code>compliance_training_assignments</code> with escalation tracking,
          exemption management, and audit-ready exports via <code>compliance_audit_log</code>.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Compliance Dashboard Access</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Navigate to <strong>Training → Compliance → Dashboard</strong> to access the risk dashboard:
        </p>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="success" icon={CheckCircle} title="Compliant">
            <p className="text-sm mt-2">Completed before due date</p>
            <code className="text-xs block mt-1">status = 'completed'</code>
          </FeatureCard>
          <FeatureCard variant="warning" icon={Clock} title="Due Soon">
            <p className="text-sm mt-2">Due within 30 days</p>
            <code className="text-xs block mt-1">due_date ≤ NOW() + 30 days</code>
          </FeatureCard>
          <FeatureCard variant="primary" icon={AlertTriangle} title="Overdue">
            <p className="text-sm mt-2">Past due date, not completed</p>
            <code className="text-xs block mt-1">due_date &lt; NOW() AND status ≠ 'completed'</code>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Compliance Risk Score</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Risk scores (0-100) are calculated per employee and aggregated at department/org level:
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Score Range</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Criteria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge variant="default">0-25</Badge></TableCell>
                  <TableCell>Low</TableCell>
                  <TableCell>All assignments current, no overdue items</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge variant="secondary">26-50</Badge></TableCell>
                  <TableCell>Medium</TableCell>
                  <TableCell>Some items due soon, no critical overdue</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge variant="outline">51-75</Badge></TableCell>
                  <TableCell>High</TableCell>
                  <TableCell>Overdue non-critical items present</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge variant="destructive">76-100</Badge></TableCell>
                  <TableCell>Critical</TableCell>
                  <TableCell>Critical compliance items overdue</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.12.1: Compliance Risk Dashboard with department heatmap"
        alt="Dashboard showing org compliance rate gauge, department heatmap, and overdue list"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Escalation Tracking</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Overdue assignments escalate through a 4-tier system:
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tier</TableHead>
              <TableHead>Days Overdue</TableHead>
              <TableHead>Notification Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><Badge>Tier 1</Badge></TableCell>
              <TableCell>1-7 days</TableCell>
              <TableCell>Employee + direct manager</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="secondary">Tier 2</Badge></TableCell>
              <TableCell>8-14 days</TableCell>
              <TableCell>Department head + HR partner</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="outline">Tier 3</Badge></TableCell>
              <TableCell>15-30 days</TableCell>
              <TableCell>VP/Director + Compliance officer</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="destructive">Tier 4</Badge></TableCell>
              <TableCell>&gt;30 days</TableCell>
              <TableCell>Executive team + Legal</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Exemption Management</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Supported exemption types for compliance training:
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">role_not_applicable</Badge>
          <Badge variant="outline">medical_accommodation</Badge>
          <Badge variant="outline">prior_certification</Badge>
          <Badge variant="outline">leave_of_absence</Badge>
          <Badge variant="outline">pending_termination</Badge>
          <Badge variant="outline">other</Badge>
        </div>
      </section>

      <TipCallout title="Bulk Operations">
        Use the Bulk Operations tab in Compliance Training to process multiple assignments via
        CSV import/export for large-scale compliance initiatives.
      </TipCallout>
    </div>
  );
}

export function LndAnalyticsAuditExports() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Regulatory Audit Exports generate audit-ready reports with tamper-proof evidence from
          the <code>compliance_audit_log</code>. Each record includes SHA-256 checksum chains
          ensuring data integrity for regulatory submissions.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Audit Log Structure</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purpose</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code>id</code></TableCell>
              <TableCell>uuid</TableCell>
              <TableCell>Unique log entry identifier</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>action_type</code></TableCell>
              <TableCell>text</TableCell>
              <TableCell>Action performed (assignment, completion, exemption, escalation)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>old_values</code></TableCell>
              <TableCell>jsonb</TableCell>
              <TableCell>State before action (for updates)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>new_values</code></TableCell>
              <TableCell>jsonb</TableCell>
              <TableCell>State after action</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>performed_by</code></TableCell>
              <TableCell>uuid</TableCell>
              <TableCell>User who performed the action</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>checksum</code></TableCell>
              <TableCell>text</TableCell>
              <TableCell>SHA-256 hash for integrity verification</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>previous_checksum</code></TableCell>
              <TableCell>text</TableCell>
              <TableCell>Hash chain link to previous record</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Export Formats</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="primary" icon={Download} title="CSV Export">
            <p className="text-sm mt-2">Spreadsheet format for analysis and manipulation</p>
          </FeatureCard>
          <FeatureCard variant="info" icon={FileCheck} title="PDF Report">
            <p className="text-sm mt-2">Formatted report with signatures for submission</p>
          </FeatureCard>
          <FeatureCard variant="success" icon={Shield} title="XML/JSON">
            <p className="text-sm mt-2">Structured data for system integration</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.13.1: Audit Trail Viewer with checksum verification"
        alt="Audit log table with action types, timestamps, user info, and verification status"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Regulatory Templates</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Pre-configured export templates for common regulatory requirements:
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Fields Included</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>OSHA Training Records</TableCell>
                  <TableCell>US</TableCell>
                  <TableCell>Employee, Training Type, Completion Date, Instructor, Duration</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>GDPR Awareness Audit</TableCell>
                  <TableCell>EU</TableCell>
                  <TableCell>Employee, Completion Date, Assessment Score, Certification</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Industry Certification Proof</TableCell>
                  <TableCell>Global</TableCell>
                  <TableCell>Employee, Certification, Issue Date, Expiry, Verification Code</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Annual Training Summary</TableCell>
                  <TableCell>Global</TableCell>
                  <TableCell>Aggregated completions by category, department, quarter</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <WarningCallout title="Data Integrity">
        The audit log uses an append-only pattern with immutability triggers. Records cannot be 
        modified or deleted after creation. Any attempt to alter records will fail at the database level.
      </WarningCallout>

      <InfoCallout title="Checksum Verification">
        To verify audit log integrity, run the checksum validation from 
        <strong> Admin → Compliance → Audit Trail → Verify Chain</strong>.
        Any breaks in the hash chain indicate potential data tampering.
      </InfoCallout>
    </div>
  );
}
