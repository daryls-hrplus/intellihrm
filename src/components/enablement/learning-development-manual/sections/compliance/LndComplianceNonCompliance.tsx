import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ban, AlertOctagon, Scale, FileWarning } from 'lucide-react';

export function LndComplianceNonCompliance() {
  return (
    <section id="sec-5-14" data-manual-anchor="sec-5-14" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <Ban className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.14 Non-Compliance Consequences</h2>
          <p className="text-sm text-muted-foreground">
            Policy enforcement actions, system flags, and HR linkage
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertOctagon className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Define consequence matrix based on non-compliance severity and duration</li>
            <li>Configure system-enforced restrictions (access blocks, workflow holds)</li>
            <li>Link compliance status to HR actions (performance flags, promotion blocks)</li>
            <li>Document legal liability considerations for safety-critical non-compliance</li>
            <li>Integrate with employee relations for formal disciplinary processes</li>
          </ul>
        </CardContent>
      </Card>

      {/* Consequence Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Non-Compliance Consequence Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Trigger Condition</TableHead>
                <TableHead>System Actions</TableHead>
                <TableHead>HR Actions</TableHead>
                <TableHead>Legal Exposure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline">Low</Badge></TableCell>
                <TableCell>1-7 days overdue, non-critical training</TableCell>
                <TableCell>Dashboard warning, reminder emails</TableCell>
                <TableCell>None</TableCell>
                <TableCell>None</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Medium</Badge></TableCell>
                <TableCell>8-30 days overdue, or any HSE training</TableCell>
                <TableCell>ESS restrictions, blocked approvals</TableCell>
                <TableCell>Manager counseling, PIP consideration</TableCell>
                <TableCell>Internal audit flag</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-500">High</Badge></TableCell>
                <TableCell>30+ days overdue, or regulatory training</TableCell>
                <TableCell>System access suspension, role restrictions</TableCell>
                <TableCell>Formal warning, promotion block</TableCell>
                <TableCell>Regulatory reporting risk</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
                <TableCell>Safety cert expired + active job duties</TableCell>
                <TableCell>Immediate access revocation</TableCell>
                <TableCell>Suspension pending completion</TableCell>
                <TableCell>OSHA liability, insurance void</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Enforcement Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Enforcement Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`profiles (Employee Record)
├── compliance_status: TEXT ('compliant', 'at_risk', 'non_compliant', 'suspended')
├── compliance_block_flags: JSONB
│   ├── block_ess_requests: BOOLEAN (e.g., leave requests blocked)
│   ├── block_expense_claims: BOOLEAN
│   ├── block_self_service: BOOLEAN
│   ├── block_approvals: BOOLEAN (cannot approve others' requests)
│   └── block_system_access: BOOLEAN (full lockout)
├── compliance_restriction_reason: TEXT
├── compliance_restriction_started: TIMESTAMP
└── compliance_last_reviewed: TIMESTAMP

compliance_enforcement_actions
├── id: UUID PK
├── employee_id: UUID FK → profiles.id
├── assignment_id: UUID FK → compliance_training_assignments.id
├── action_type: TEXT ('warning', 'restriction', 'suspension', 'termination_flag')
├── action_details: JSONB
├── effective_from: TIMESTAMP
├── effective_until: TIMESTAMP (NULL = indefinite)
├── enforced_by: TEXT ('system', 'manager', 'hr', 'compliance_officer')
├── reversed_at: TIMESTAMP
├── reversed_by: UUID FK
├── reversal_reason: TEXT
└── created_at: TIMESTAMP`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Enforcement Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Automated Enforcement Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     NON-COMPLIANCE ENFORCEMENT WORKFLOW                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Daily Compliance Check (Scheduled Job)                                         │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ For each employee with overdue assignments:                              │   │
│   │                                                                          │   │
│   │ 1. Calculate overall compliance_status:                                  │   │
│   │    ├── 'compliant': No overdue assignments                               │   │
│   │    ├── 'at_risk': Overdue < 7 days (Tier 1)                              │   │
│   │    ├── 'non_compliant': Overdue 7-30 days (Tier 2-3)                     │   │
│   │    └── 'suspended': Overdue 30+ days OR critical safety (Tier 4)         │   │
│   │                                                                          │   │
│   │ 2. Apply compliance_block_flags based on severity                        │   │
│   │                                                                          │   │
│   │ 3. Create compliance_enforcement_actions record                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐                                                            │
│   │ Status Changed? │──── No ────> Log and exit                                  │
│   └────────┬────────┘                                                            │
│            │ Yes                                                                 │
│            ▼                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ Notification Cascade:                                                    │   │
│   │ ├── Employee: Status change notification                                 │   │
│   │ ├── Manager: Team member compliance alert                                │   │
│   │ ├── HR: If action_type = 'suspension' or 'termination_flag'              │   │
│   │ └── Compliance Officer: Daily summary of all status changes              │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐     If training completed:                                 │
│   │ Auto-Reversal   │     ├── Clear compliance_block_flags                       │
│   │ Check           │     ├── Set compliance_status = 'compliant'                │
│   └─────────────────┘     └── Log reversal with reversed_by = 'system'           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* HR Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileWarning className="h-4 w-4" />
            HR System Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Compliance status integrates with core HR processes to enforce organizational accountability.
          </p>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>HR Process</TableHead>
                <TableHead>Compliance Check</TableHead>
                <TableHead>Non-Compliant Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Promotion/Transfer</TableCell>
                <TableCell>compliance_status != 'non_compliant'</TableCell>
                <TableCell>Workflow blocked, HR notified</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Performance Appraisal</TableCell>
                <TableCell>All mandatory training complete</TableCell>
                <TableCell>Flag on appraisal form, manager alert</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bonus/Incentive</TableCell>
                <TableCell>compliance_status = 'compliant'</TableCell>
                <TableCell>Bonus deferral, proration consideration</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Probation Completion</TableCell>
                <TableCell>Onboarding compliance 100%</TableCell>
                <TableCell>Probation extension, termination risk</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Contract Renewal</TableCell>
                <TableCell>No Tier 4 escalations in period</TableCell>
                <TableCell>Renewal review flag</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legal Considerations */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Legal Liability Considerations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm font-medium">Safety-Critical Non-Compliance</p>
            <p className="text-xs text-muted-foreground mt-1">
              Employees performing safety-sensitive duties without current certification expose the 
              organization to: OSHA penalties, workers' compensation liability, insurance claim denials, 
              and potential criminal negligence charges in incident investigations.
            </p>
          </div>
          
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <p className="text-sm font-medium">Regulatory Reporting</p>
            <p className="text-xs text-muted-foreground mt-1">
              Certain compliance gaps must be reported to regulators. The system flags when 
              is_reportable = true and compliance is missed, triggering compliance officer review 
              and potential external disclosure.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
