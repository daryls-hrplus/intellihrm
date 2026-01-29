import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldOff, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

export function LndComplianceExemptions() {
  return (
    <section id="sec-5-6" data-manual-anchor="sec-5-6" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <ShieldOff className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.6 Exemption Request Workflow</h2>
          <p className="text-muted-foreground">Exemption requests, approval process, and documentation</p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Submit and process compliance training exemption requests</li>
            <li>Configure multi-level exemption approval workflows</li>
            <li>Document exemption justifications for audit compliance</li>
            <li>Manage temporary vs permanent exemptions</li>
          </ul>
        </CardContent>
      </Card>

      {/* Exemption Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exemption Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Approval Level</TableHead>
                <TableHead>Audit Documentation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Temporary - Medical</TableCell>
                <TableCell>Until return from leave</TableCell>
                <TableCell>Manager + HR</TableCell>
                <TableCell>Medical documentation required</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Temporary - Leave</TableCell>
                <TableCell>Leave duration + 14 days</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Leave approval reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Temporary - External Cert</TableCell>
                <TableCell>Until external cert expires</TableCell>
                <TableCell>L&D Admin</TableCell>
                <TableCell>External certificate upload</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Permanent - Role-Based</TableCell>
                <TableCell>Indefinite (until role change)</TableCell>
                <TableCell>HR + Compliance</TableCell>
                <TableCell>Role justification memo</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Permanent - Disability</TableCell>
                <TableCell>Indefinite</TableCell>
                <TableCell>HR + Legal</TableCell>
                <TableCell>Accommodation documentation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Prior Learning</TableCell>
                <TableCell>Based on assessment</TableCell>
                <TableCell>L&D Admin</TableCell>
                <TableCell>Competency assessment results</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Exemption Request Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Exemption Request Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXEMPTION REQUEST WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   EMPLOYEE INITIATES                                                        │
│   ┌─────────────────┐                                                        │
│   │ Submit Request  │                                                        │
│   │ ├── Select assignment                                                   │
│   │ ├── Choose exemption type                                               │
│   │ ├── Provide justification                                               │
│   │ └── Upload supporting docs                                              │
│   └────────┬────────┘                                                        │
│            │                                                                 │
│            ▼                                                                 │
│   MANAGER REVIEW (Tier 1)                                                   │
│   ┌─────────────────┐                                                        │
│   │ Approve/Reject  │  SLA: 3 business days                                 │
│   │ ├── Review justification                                                │
│   │ ├── Verify documentation                                                │
│   │ └── Add manager notes                                                   │
│   └────────┬────────┘                                                        │
│            │                                                                 │
│      ┌─────┴─────┐                                                           │
│      ▼           ▼                                                           │
│  [Rejected]  [Approved]                                                      │
│      │           │                                                           │
│      │           ▼                                                           │
│      │   HR REVIEW (Tier 2) - For permanent exemptions                      │
│      │   ┌─────────────────┐                                                 │
│      │   │ Final Approval  │  SLA: 5 business days                          │
│      │   │ ├── Compliance check                                             │
│      │   │ ├── Risk assessment                                              │
│      │   │ └── Documentation review                                         │
│      │   └────────┬────────┘                                                 │
│      │            │                                                          │
│      │      ┌─────┴─────┐                                                    │
│      │      ▼           ▼                                                    │
│      │  [Rejected]  [Approved]                                               │
│      │      │           │                                                    │
│      ▼      ▼           ▼                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ OUTCOME                                                              │   │
│   │ ├── Rejected: Assignment remains active, employee notified          │   │
│   │ └── Approved: status = 'exempted', exemption_reason logged          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Database Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exemption-Related Database Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_status</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>none | pending | approved | rejected</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_type</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>temporary_medical | temporary_leave | permanent_role | prior_learning</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_reason</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Detailed justification text</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_start_date</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>Effective start of exemption</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_end_date</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>End date for temporary exemptions (null = permanent)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_approved_by</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell>Final approver profile ID</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_approved_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell>Approval timestamp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_documents</TableCell>
                <TableCell>JSONB</TableCell>
                <TableCell>Array of supporting document URLs</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approval Chain Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Table: compliance_exemption_approval_config

Configuration per exemption type:

{
  "temporary_medical": {
    "approval_levels": ["manager", "hr"],
    "documentation_required": true,
    "auto_expire_on_return": true,
    "sla_days": 3
  },
  "temporary_leave": {
    "approval_levels": ["manager"],
    "documentation_required": false,
    "link_to_leave_request": true,
    "extension_days_after_return": 14
  },
  "permanent_role": {
    "approval_levels": ["manager", "hr", "compliance_officer"],
    "documentation_required": true,
    "review_frequency_months": 12,
    "sla_days": 5
  },
  "prior_learning": {
    "approval_levels": ["lnd_admin"],
    "documentation_required": true,
    "requires_assessment": true,
    "sla_days": 5
  }
}`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Audit Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Audit Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            All exemptions are subject to regulatory audit. Ensure proper documentation is maintained.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit Element</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Retention Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Request Documentation</TableCell>
                <TableCell>Original request with timestamp</TableCell>
                <TableCell>7 years</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Supporting Documents</TableCell>
                <TableCell>Medical notes, certificates, memos</TableCell>
                <TableCell>7 years</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Approval Chain</TableCell>
                <TableCell>All approvers with timestamps and notes</TableCell>
                <TableCell>7 years</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rejection Reasons</TableCell>
                <TableCell>Detailed rejection justification</TableCell>
                <TableCell>7 years</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Periodic Reviews</TableCell>
                <TableCell>Annual review of permanent exemptions</TableCell>
                <TableCell>Duration of exemption</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-semibold text-destructive mb-2">Regulatory Warning</h4>
            <p className="text-sm">
              Exemptions for safety-critical training (HSE-linked) require additional documentation 
              and may be subject to external regulatory review. OSHA and regional labor authorities 
              may request exemption records during audits. See <strong>Section 5.22</strong> for 
              OSHA-specific exemption requirements.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exemption Notification Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Trigger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">EXEMPTION_REQUEST_SUBMITTED</TableCell>
                <TableCell>Next approver</TableCell>
                <TableCell>Employee submits request</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">EXEMPTION_PENDING_APPROVAL</TableCell>
                <TableCell>Approver</TableCell>
                <TableCell>Daily digest of pending requests</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">EXEMPTION_APPROVED</TableCell>
                <TableCell>Employee, Manager</TableCell>
                <TableCell>Final approval granted</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">EXEMPTION_REJECTED</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Request rejected</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">EXEMPTION_EXPIRING</TableCell>
                <TableCell>Employee, Manager</TableCell>
                <TableCell>14 days before temporary exemption ends</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">EXEMPTION_REVIEW_DUE</TableCell>
                <TableCell>HR, Compliance</TableCell>
                <TableCell>Annual review of permanent exemptions</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Exemption Management Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">&lt; 5%</div>
              <div className="text-sm text-muted-foreground">Target exemption rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3 days</div>
              <div className="text-sm text-muted-foreground">Approval SLA (temporary)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5 days</div>
              <div className="text-sm text-muted-foreground">Approval SLA (permanent)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Documentation compliance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
