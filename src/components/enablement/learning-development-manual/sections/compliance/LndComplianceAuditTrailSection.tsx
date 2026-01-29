import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSearch, Database, Lock, Clock } from 'lucide-react';

export function LndComplianceAuditTrailSection() {
  return (
    <section id="sec-5-16" data-manual-anchor="sec-5-16" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-500/10">
          <FileSearch className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.16 Compliance Audit Trail</h2>
          <p className="text-sm text-muted-foreground">
            Tamper-proof logging, retention policies, and query patterns
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Understand compliance audit log schema and immutability guarantees</li>
            <li>Configure retention policies per regulatory jurisdiction</li>
            <li>Query audit logs for regulatory inspections and internal reviews</li>
            <li>Export audit data in regulator-accepted formats</li>
            <li>Integrate with enterprise SIEM for security monitoring</li>
          </ul>
        </CardContent>
      </Card>

      {/* Audit Log Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Log Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`compliance_audit_log (Append-Only Table)
├── id: UUID PK
├── company_id: UUID FK
├── event_timestamp: TIMESTAMP WITH TIME ZONE (NOT NULL)
├── event_type: TEXT
│   ├── 'assignment_created'
│   ├── 'assignment_completed'
│   ├── 'assignment_overdue'
│   ├── 'escalation_triggered'
│   ├── 'extension_requested'
│   ├── 'extension_approved'
│   ├── 'extension_denied'
│   ├── 'exemption_granted'
│   ├── 'status_changed'
│   ├── 'enforcement_action'
│   ├── 'intervention_created'
│   └── 'intervention_resolved'
├── entity_type: TEXT ('assignment', 'employee', 'training', 'escalation')
├── entity_id: UUID (reference to affected record)
├── actor_id: UUID FK → profiles.id (user who performed action)
├── actor_type: TEXT ('employee', 'manager', 'hr', 'system', 'compliance_officer')
├── actor_ip: INET
├── actor_user_agent: TEXT
├── old_values: JSONB (previous state)
├── new_values: JSONB (new state)
├── metadata: JSONB (additional context)
│   ├── training_title
│   ├── compliance_category
│   ├── escalation_tier
│   └── justification
├── checksum: TEXT (SHA-256 of record for tamper detection)
└── previous_checksum: TEXT (chain integrity)

-- Immutability enforced via:
-- 1. No UPDATE/DELETE permissions on table
-- 2. Row-level trigger prevents modifications
-- 3. Checksum chain validates integrity`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Retention Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Retention Policy Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compliance Category</TableHead>
                <TableHead>Retention Period</TableHead>
                <TableHead>Regulatory Basis</TableHead>
                <TableHead>Archive Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="destructive">OSHA/Safety</Badge></TableCell>
                <TableCell>5 years + employment</TableCell>
                <TableCell>29 CFR 1904.33</TableCell>
                <TableCell>Cold storage (S3 Glacier)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Financial Services</Badge></TableCell>
                <TableCell>7 years</TableCell>
                <TableCell>SOX, SEC Rule 17a-4</TableCell>
                <TableCell>WORM storage</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-500">Healthcare (HIPAA)</Badge></TableCell>
                <TableCell>6 years</TableCell>
                <TableCell>45 CFR 164.530</TableCell>
                <TableCell>Encrypted archive</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">General HR</Badge></TableCell>
                <TableCell>3 years + employment</TableCell>
                <TableCell>EEOC, State laws</TableCell>
                <TableCell>Standard archive</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-500">Caribbean Regional</Badge></TableCell>
                <TableCell>10 years (Jamaica), 7 years (Trinidad)</TableCell>
                <TableCell>Local labor codes</TableCell>
                <TableCell>Regional data center</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Query Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Audit Query Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`-- 1. All compliance events for specific employee (regulator request)
SELECT * FROM compliance_audit_log
WHERE entity_type = 'assignment'
  AND metadata->>'employee_id' = '[employee_uuid]'
ORDER BY event_timestamp DESC;

-- 2. Escalation history for audit period
SELECT event_timestamp, event_type, 
       metadata->>'training_title' as training,
       metadata->>'escalation_tier' as tier,
       actor_id
FROM compliance_audit_log
WHERE event_type LIKE 'escalation%'
  AND event_timestamp BETWEEN '[start_date]' AND '[end_date]'
  AND company_id = '[company_uuid]';

-- 3. Override/exemption audit (for compliance review)
SELECT * FROM compliance_audit_log
WHERE event_type IN ('extension_approved', 'exemption_granted')
  AND metadata->>'requires_justification' = 'true'
ORDER BY event_timestamp DESC;

-- 4. Integrity verification (detect tampering)
SELECT id, event_timestamp,
       checksum = SHA256(CONCAT(id, event_timestamp, event_type, entity_id, ...)) as valid
FROM compliance_audit_log
WHERE previous_checksum != LAG(checksum) OVER (ORDER BY id);`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Tamper Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Tamper Protection Mechanisms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">1. Append-Only Table Structure</p>
              <p className="text-sm text-muted-foreground">No UPDATE or DELETE operations permitted. All changes create new records.</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">2. Cryptographic Chaining</p>
              <p className="text-sm text-muted-foreground">Each record's checksum includes the previous record's checksum, creating a blockchain-like chain.</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">3. Database Triggers</p>
              <p className="text-sm text-muted-foreground">BEFORE UPDATE/DELETE triggers raise exceptions, preventing direct modification.</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">4. Role-Based Access</p>
              <p className="text-sm text-muted-foreground">Only service accounts can INSERT; no human users have write access to audit tables.</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">5. External Backup Verification</p>
              <p className="text-sm text-muted-foreground">Daily checksum verification against off-site backup to detect unauthorized modifications.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
