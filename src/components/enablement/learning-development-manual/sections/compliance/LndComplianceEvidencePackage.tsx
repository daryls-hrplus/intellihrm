import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FolderArchive, FileCheck, Shield, Download } from 'lucide-react';

export function LndComplianceEvidencePackage() {
  return (
    <section id="sec-5-18" data-manual-anchor="sec-5-18" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <FolderArchive className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.18 Evidence Package Preparation</h2>
          <p className="text-sm text-muted-foreground">
            Audit preparation workflows, evidence assembly, and regulator interface
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Assemble comprehensive evidence packages for regulatory audits</li>
            <li>Collect training records, certificates, and attendance logs</li>
            <li>Generate certification attestations with digital signatures</li>
            <li>Create audit-ready documentation bundles</li>
            <li>Prepare regulator-specific evidence formats</li>
          </ul>
        </CardContent>
      </Card>

      {/* Evidence Package Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Standard Evidence Package Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Source Table</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Certification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Training Completion Records</TableCell>
                <TableCell>lms_enrollments, hse_training_records</TableCell>
                <TableCell>PDF with signatures</TableCell>
                <TableCell>System-generated attestation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Certificates Issued</TableCell>
                <TableCell>certifications</TableCell>
                <TableCell>PDF (original format)</TableCell>
                <TableCell>Issuing authority signature</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Assessment Scores</TableCell>
                <TableCell>lms_quiz_attempts</TableCell>
                <TableCell>CSV + Summary PDF</TableCell>
                <TableCell>Hash verification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Attendance Logs</TableCell>
                <TableCell>lms_session_attendance</TableCell>
                <TableCell>PDF with timestamps</TableCell>
                <TableCell>Instructor sign-off</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Compliance Status History</TableCell>
                <TableCell>compliance_audit_log</TableCell>
                <TableCell>PDF + XML</TableCell>
                <TableCell>Checksum chain verified</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Exemption Documentation</TableCell>
                <TableCell>compliance_exemptions</TableCell>
                <TableCell>PDF with approvals</TableCell>
                <TableCell>Approver digital signature</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Evidence Assembly Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evidence Assembly Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     EVIDENCE PACKAGE ASSEMBLY WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Audit Request Received                                                         │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Create Evidence Request                                               │   │
│   │    ├── audit_type: 'osha', 'internal', 'external', 'insurance'           │   │
│   │    ├── scope: departments[], date_range, training_types[]                │   │
│   │    ├── requestor: regulator_name, contact_info                           │   │
│   │    └── deadline: DATE                                                     │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Auto-Discovery                                                         │   │
│   │    ├── Query all relevant training records                                │   │
│   │    ├── Collect certificates matching scope                                │   │
│   │    ├── Pull assessment data                                               │   │
│   │    ├── Extract attendance logs                                            │   │
│   │    └── Compile exemption documentation                                    │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Gap Analysis                                                           │   │
│   │    ├── Flag missing records                                               │   │
│   │    ├── Identify expired certifications within scope                       │   │
│   │    ├── Note incomplete training                                           │   │
│   │    └── Generate pre-audit risk report                                     │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Package Generation                                                     │   │
│   │    ├── Create table of contents                                           │   │
│   │    ├── Organize by employee or by training type                           │   │
│   │    ├── Add summary statistics                                             │   │
│   │    ├── Include data integrity attestation                                 │   │
│   │    └── Generate checksum manifest                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ 5. Review & Approval                                                      │   │
│   │    ├── Compliance Officer reviews package                                 │   │
│   │    ├── Legal/HR sign-off if required                                      │   │
│   │    ├── Digital signature applied                                          │   │
│   │    └── Package sealed (no further modifications)                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐                                                            │
│   │ 6. Delivery     │  Via secure portal or encrypted email                      │
│   │    & Tracking   │  Log: delivery_timestamp, recipient_ack                    │
│   └─────────────────┘                                                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Database Field Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`compliance_evidence_packages
├── id: UUID PK
├── company_id: UUID FK
├── package_name: TEXT
├── audit_type: TEXT ('osha', 'internal', 'external', 'insurance', 'legal')
├── requestor_name: TEXT
├── requestor_email: TEXT
├── requestor_organization: TEXT
├── scope: JSONB
│   ├── departments: UUID[]
│   ├── locations: UUID[]
│   ├── date_range: {start, end}
│   ├── training_types: TEXT[]
│   └── employees: UUID[] (optional, for targeted requests)
├── request_date: DATE
├── deadline: DATE
├── status: TEXT ('draft', 'assembling', 'review', 'approved', 'delivered', 'closed')
├── gap_analysis: JSONB (pre-audit findings)
├── documents_included: INT
├── total_size_bytes: BIGINT
├── checksum_manifest: JSONB
├── approved_by: UUID FK → profiles.id
├── approved_at: TIMESTAMP
├── digital_signature: TEXT
├── delivery_method: TEXT ('portal', 'email', 'physical')
├── delivered_at: TIMESTAMP
├── recipient_acknowledged: BOOLEAN
├── storage_path: TEXT (encrypted package location)
├── retention_until: DATE
└── created_at, updated_at: TIMESTAMP`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security & Integrity Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Digital Signature</p>
              <p className="text-sm text-muted-foreground">Package signed with organization's PKI certificate, verifiable by regulators</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Checksum Manifest</p>
              <p className="text-sm text-muted-foreground">SHA-256 hash of each document, plus overall package hash for integrity verification</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Encryption at Rest</p>
              <p className="text-sm text-muted-foreground">AES-256 encryption for stored packages; decryption key held by Compliance Officer</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Access Logging</p>
              <p className="text-sm text-muted-foreground">All access to evidence packages logged with timestamp, user, and action</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Sealed Package</p>
              <p className="text-sm text-muted-foreground">Once approved, package is immutable; any changes require new package version</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            Quick Package Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Use Case</TableHead>
                <TableHead>Typical Contents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="destructive">OSHA Inspection</Badge></TableCell>
                <TableCell>Workplace safety audit</TableCell>
                <TableCell>Safety training, OSHA 10/30, incident-related training</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-500">Insurance Renewal</Badge></TableCell>
                <TableCell>Annual insurance review</TableCell>
                <TableCell>All safety certs, completion rates, incident history</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">Employee-Specific</Badge></TableCell>
                <TableCell>Individual compliance verification</TableCell>
                <TableCell>All training records for single employee</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-500">Department Audit</Badge></TableCell>
                <TableCell>Internal compliance review</TableCell>
                <TableCell>Departmental training matrix, gaps, completion</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
