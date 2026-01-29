import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, Shield, Lock, FileSearch, Eye, Download, Calendar } from 'lucide-react';

export function LndComplianceExternalAuditor() {
  return (
    <section id="sec-5-26" data-manual-anchor="sec-5-26" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <UserCheck className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.26 External Auditor Access</h2>
          <p className="text-sm text-muted-foreground">
            Third-party audit scheduling, scoped access controls, and evidence export
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Configure time-limited auditor accounts with scoped permissions</li>
            <li>Schedule external audits with automated access provisioning</li>
            <li>Generate evidence packages for regulatory and certification audits</li>
            <li>Track auditor activities with comprehensive audit logging</li>
            <li>Manage multi-auditor engagements with firm-level access controls</li>
          </ul>
        </CardContent>
      </Card>

      {/* Access Control Model */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Auditor Access Control Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Access Level</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Typical Use Case</TableHead>
                <TableHead>Restrictions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <Badge className="bg-blue-600">Read-Only Auditor</Badge>
                </TableCell>
                <TableCell>View compliance records, export reports</TableCell>
                <TableCell>Regulatory compliance verification</TableCell>
                <TableCell>No PII access, no download of raw data</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <Badge className="bg-purple-600">Evidence Reviewer</Badge>
                </TableCell>
                <TableCell>View + download evidence packages</TableCell>
                <TableCell>ISO/SOC certification audits</TableCell>
                <TableCell>Scoped to selected requirements only</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <Badge className="bg-amber-600">Full Auditor</Badge>
                </TableCell>
                <TableCell>All compliance data, audit logs, employee records</TableCell>
                <TableCell>Internal audit, forensic investigation</TableCell>
                <TableCell>Requires executive approval, full logging</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <Badge className="bg-green-600">External Firm</Badge>
                </TableCell>
                <TableCell>Firm-scoped access for multiple auditors</TableCell>
                <TableCell>Big 4 engagements, multi-year contracts</TableCell>
                <TableCell>Named individuals, firm IP whitelisting</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Audit Scheduling & Provisioning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Schedule external audits with automated access provisioning and de-provisioning.
            The system creates time-limited accounts that expire automatically after the audit period.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`external_audit_engagements
├── id: UUID PK
├── company_id: UUID FK
├── audit_name: TEXT NOT NULL (e.g., 'ISO 27001 Surveillance Audit 2026')
├── audit_type: TEXT ('regulatory' | 'certification' | 'internal' | 'investigation')
├── auditing_firm: TEXT (e.g., 'Deloitte', 'KPMG')
├── lead_auditor_email: TEXT NOT NULL
├── scheduled_start: DATE NOT NULL
├── scheduled_end: DATE NOT NULL
├── access_start: TIMESTAMPTZ -- Typically 1-2 days before audit
├── access_end: TIMESTAMPTZ -- Auto-revoke after this time
├── scope_description: TEXT
├── compliance_requirements: UUID[] -- Which requirements are in scope
├── status: TEXT ('scheduled' | 'in_progress' | 'completed' | 'cancelled')
├── created_by: UUID FK → profiles.id
├── approved_by: UUID FK → profiles.id
├── created_at: TIMESTAMPTZ DEFAULT now()
└── metadata: JSONB DEFAULT '{}'

external_auditor_accounts
├── id: UUID PK
├── engagement_id: UUID FK → external_audit_engagements.id
├── auditor_email: TEXT NOT NULL
├── auditor_name: TEXT NOT NULL
├── auditor_firm: TEXT
├── access_level: TEXT ('read_only' | 'evidence_reviewer' | 'full_auditor')
├── scoped_requirements: UUID[] -- Subset of engagement scope (nullable = all)
├── account_created_at: TIMESTAMPTZ
├── last_login: TIMESTAMPTZ
├── access_revoked_at: TIMESTAMPTZ
├── ip_whitelist: INET[] -- Optional IP restrictions
├── mfa_required: BOOLEAN DEFAULT true
├── activity_log_retention_days: INT DEFAULT 365
└── notes: TEXT

auditor_activity_log
├── id: UUID PK
├── auditor_account_id: UUID FK → external_auditor_accounts.id
├── activity_timestamp: TIMESTAMPTZ NOT NULL DEFAULT now()
├── activity_type: TEXT ('login' | 'view' | 'export' | 'download' | 'logout')
├── entity_type: TEXT ('requirement' | 'assignment' | 'audit_log' | 'report')
├── entity_id: UUID
├── ip_address: INET
├── user_agent: TEXT
├── details: JSONB
└── checksum: TEXT -- Tamper-proof logging

-- Trigger: Auto-create accounts when engagement starts
CREATE OR REPLACE FUNCTION provision_auditor_access()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'in_progress' AND OLD.status = 'scheduled' THEN
    -- Send invitation emails to all auditors on engagement
    -- Create temporary accounts with scoped permissions
    PERFORM pg_notify('auditor_provisioning', json_build_object(
      'engagement_id', NEW.id,
      'action', 'provision'
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-revoke when engagement ends
CREATE OR REPLACE FUNCTION revoke_auditor_access()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    UPDATE external_auditor_accounts
    SET access_revoked_at = now()
    WHERE engagement_id = NEW.id
      AND access_revoked_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            Evidence Package Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate comprehensive evidence packages for auditors containing all required
            documentation in a structured, exportable format.
          </p>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Component</TableHead>
                <TableHead>Contents</TableHead>
                <TableHead>Format</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Training Matrix</TableCell>
                <TableCell>All compliance requirements with target audiences</TableCell>
                <TableCell>Excel, PDF</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Completion Records</TableCell>
                <TableCell>Employee-by-employee completion status with dates</TableCell>
                <TableCell>Excel, CSV</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Certificates</TableCell>
                <TableCell>All issued completion certificates</TableCell>
                <TableCell>PDF bundle</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Audit Trail</TableCell>
                <TableCell>Full change history with checksums</TableCell>
                <TableCell>JSON, Excel</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Exemption Records</TableCell>
                <TableCell>All exemptions with approvals and documentation</TableCell>
                <TableCell>PDF with attachments</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Escalation History</TableCell>
                <TableCell>Escalation events and resolution records</TableCell>
                <TableCell>Excel</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Course Content Summary</TableCell>
                <TableCell>Course descriptions, versions, learning objectives</TableCell>
                <TableCell>PDF</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="p-3 border rounded-lg bg-muted/30">
            <p className="font-medium text-sm">Package Integrity</p>
            <p className="text-xs text-muted-foreground mt-1">
              Each evidence package includes a SHA-256 manifest of all contents, generation
              timestamp, and digital signature to ensure tampering can be detected.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auditor Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Auditor Portal Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Compliance Summary Dashboard</p>
              <p className="text-sm text-muted-foreground">
                High-level metrics: Overall compliance rate, overdue count, exemption stats.
                Scoped to audit engagement only.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Requirement Drill-Down</p>
              <p className="text-sm text-muted-foreground">
                Click into any requirement to see all assignments, completions, and evidence.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Employee Sampling Tool</p>
              <p className="text-sm text-muted-foreground">
                Random sampling feature to select employees for detailed record review.
                Auditors can request specific employee records within scope.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Export Center</p>
              <p className="text-sm text-muted-foreground">
                One-click export of pre-built evidence packages or custom report builder
                for specific data extracts.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Audit Notes</p>
              <p className="text-sm text-muted-foreground">
                Auditors can add observations and findings that are visible to internal
                compliance team for remediation tracking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security & Compliance Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Control</TableHead>
                <TableHead>Implementation</TableHead>
                <TableHead>Compliance Standard</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Time-Limited Access</TableCell>
                <TableCell>Automatic account expiry after engagement end date</TableCell>
                <TableCell>ISO 27001 A.9.2.6</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">MFA Required</TableCell>
                <TableCell>Mandatory multi-factor authentication for all auditors</TableCell>
                <TableCell>SOC 2 CC6.1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">IP Whitelisting</TableCell>
                <TableCell>Optional restriction to auditing firm IP ranges</TableCell>
                <TableCell>ISO 27001 A.9.4.2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Activity Logging</TableCell>
                <TableCell>Immutable log of all auditor actions with checksums</TableCell>
                <TableCell>SOC 2 CC7.2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Data Minimization</TableCell>
                <TableCell>Scoped access limited to in-scope requirements only</TableCell>
                <TableCell>GDPR Art. 5(1)(c)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Executive Approval</TableCell>
                <TableCell>Full Auditor access requires designated officer sign-off</TableCell>
                <TableCell>SOX 404</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            UI Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Schedule Audit Engagement</p>
              <code className="text-xs text-muted-foreground">
                Admin → Security → External Access → Audit Engagements → Schedule New
              </code>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Add Auditors to Engagement</p>
              <code className="text-xs text-muted-foreground">
                Admin → Security → External Access → [Engagement] → Auditors tab → Add Auditor
              </code>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Generate Evidence Package</p>
              <code className="text-xs text-muted-foreground">
                Training → Compliance Training → Audit Trail → Export → Generate Evidence Package
              </code>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">View Auditor Activity</p>
              <code className="text-xs text-muted-foreground">
                Admin → Security → External Access → [Engagement] → Activity Log
              </code>
            </div>
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="font-medium text-sm">Auditor Portal (External)</p>
              <code className="text-xs text-muted-foreground">
                [Auditor receives invitation link] → Login with MFA → Auditor Dashboard
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
