import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Archive, Calendar, Shield, Search } from 'lucide-react';

export function LndComplianceHistoricalRecords() {
  return (
    <section id="sec-5-19" data-manual-anchor="sec-5-19" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-500/10">
          <Archive className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.19 Historical Compliance Records</h2>
          <p className="text-sm text-muted-foreground">
            Data archival, retention schedules, and GDPR compliance
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Configure data retention policies per compliance category and jurisdiction</li>
            <li>Manage archival workflows for aged compliance data</li>
            <li>Handle GDPR/privacy requests for historical training records</li>
            <li>Query archived data for regulatory or legal requests</li>
            <li>Implement secure data destruction after retention period</li>
          </ul>
        </CardContent>
      </Card>

      {/* Retention Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Retention Schedule by Jurisdiction</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Training Type</TableHead>
                <TableHead>Retention Period</TableHead>
                <TableHead>Legal Basis</TableHead>
                <TableHead>Archive Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge>United States</Badge></TableCell>
                <TableCell>OSHA Safety</TableCell>
                <TableCell>Duration of employment + 30 years</TableCell>
                <TableCell>29 CFR 1910.1020</TableCell>
                <TableCell>Cold (Glacier)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge>United States</Badge></TableCell>
                <TableCell>General HR Training</TableCell>
                <TableCell>7 years</TableCell>
                <TableCell>EEOC, State laws</TableCell>
                <TableCell>Warm (S3-IA)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">EU/UK</Badge></TableCell>
                <TableCell>All Training</TableCell>
                <TableCell>6 years (max without consent)</TableCell>
                <TableCell>GDPR Art. 17</TableCell>
                <TableCell>With erasure rights</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-500">Jamaica</Badge></TableCell>
                <TableCell>Safety Training</TableCell>
                <TableCell>10 years</TableCell>
                <TableCell>OSHA Jamaica Act</TableCell>
                <TableCell>Regional DC</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-500">Trinidad</Badge></TableCell>
                <TableCell>OSH Training</TableCell>
                <TableCell>7 years</TableCell>
                <TableCell>OSH Act 2004</TableCell>
                <TableCell>Regional DC</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Archival Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Archival Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     DATA ARCHIVAL LIFECYCLE                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Active Data (Hot Storage)                                                      │
│   └── compliance_training_assignments                                            │
│       └── Criteria: created_at < (NOW() - archival_threshold)                    │
│                     AND status IN ('completed', 'expired', 'exempted')           │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ Nightly Archival Job                                                     │   │
│   │                                                                          │   │
│   │ 1. Identify records past archival_threshold                              │   │
│   │ 2. Verify no active legal holds                                          │   │
│   │ 3. Check GDPR deletion requests                                          │   │
│   │ 4. Export to archival format (Parquet with compression)                  │   │
│   │ 5. Generate integrity checksum                                           │   │
│   │ 6. Upload to archival storage tier                                       │   │
│   │ 7. Update source record with archive_reference                           │   │
│   │ 8. After 30-day verification, delete from active storage                 │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   Archived Data (Cold Storage)                                                   │
│   └── compliance_archive_index                                                   │
│       ├── original_record_id                                                     │
│       ├── archive_path                                                           │
│       ├── archived_at                                                            │
│       ├── retention_until                                                        │
│       └── checksum                                                               │
│         │                                                                        │
│         ▼ (After retention_until)                                                │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ Secure Destruction                                                       │   │
│   │ 1. Verify no legal holds                                                 │   │
│   │ 2. Generate destruction certificate                                      │   │
│   │ 3. Cryptographic erasure (key destruction)                               │   │
│   │ 4. Log destruction event                                                 │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            GDPR & Privacy Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Right to Access (Art. 15)</p>
              <p className="text-sm text-muted-foreground">
                Employees can request export of all their training records, including archived data.
                System generates comprehensive PDF with all compliance history within 30 days.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Right to Erasure (Art. 17)</p>
              <p className="text-sm text-muted-foreground">
                Deletion requests honored unless: legal hold exists, regulatory retention applies, 
                or ongoing disciplinary action references the training record.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Right to Rectification (Art. 16)</p>
              <p className="text-sm text-muted-foreground">
                Employees can request correction of inaccurate training records. Changes logged 
                with before/after audit trail.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Data Portability (Art. 20)</p>
              <p className="text-sm text-muted-foreground">
                Training records exportable in machine-readable format (JSON, CSV) for transfer 
                to another employer's system.
              </p>
            </div>
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
            <pre>{`compliance_archive_index
├── id: UUID PK
├── original_table: TEXT
├── original_record_id: UUID
├── company_id: UUID FK
├── employee_id: UUID (for GDPR lookups)
├── archive_path: TEXT (S3/storage path)
├── archive_format: TEXT ('parquet', 'json')
├── archived_at: TIMESTAMP
├── archived_by: TEXT ('system', user_id)
├── retention_category: TEXT
├── retention_until: DATE
├── legal_hold: BOOLEAN
├── legal_hold_reference: TEXT
├── gdpr_erasure_requested: BOOLEAN
├── gdpr_erasure_blocked_reason: TEXT
├── checksum: TEXT (SHA-256)
├── destruction_date: DATE (NULL until destroyed)
├── destruction_certificate_id: UUID
└── metadata: JSONB (key searchable fields)

compliance_retention_policies
├── id: UUID PK
├── company_id: UUID FK
├── jurisdiction: TEXT
├── compliance_category: TEXT
├── retention_years: INT
├── retention_basis: TEXT (legal reference)
├── archival_threshold_days: INT (when to move to archive)
├── requires_legal_review: BOOLEAN
└── is_active: BOOLEAN`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Historical Query */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-4 w-4" />
            Querying Historical Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Archived records can be queried through the Compliance Historical Search interface.
            Retrieval from cold storage may take up to 12 hours for Glacier-archived data.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`-- Search archived compliance records
SELECT 
  cai.original_record_id,
  cai.archived_at,
  cai.retention_until,
  cai.metadata->>'training_title' as training,
  cai.metadata->>'completion_date' as completed
FROM compliance_archive_index cai
WHERE cai.employee_id = '[employee_uuid]'
  AND cai.original_table = 'compliance_training_assignments'
  AND cai.metadata->>'compliance_category' = 'safety'
ORDER BY cai.archived_at DESC;

-- Initiate retrieval from cold storage
INSERT INTO archive_retrieval_requests (
  archive_index_id, 
  requested_by, 
  urgency,
  reason
) VALUES (
  '[archive_id]', 
  auth.uid(), 
  'standard',  -- 'expedited' for 4-hour retrieval
  'Regulatory audit request'
);`}</pre>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
