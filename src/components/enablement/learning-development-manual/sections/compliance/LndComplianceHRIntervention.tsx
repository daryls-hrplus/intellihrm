import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCog, Workflow, FileText, CheckSquare } from 'lucide-react';

export function LndComplianceHRIntervention() {
  return (
    <section id="sec-5-15" data-manual-anchor="sec-5-15" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <UserCog className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.15 HR Intervention Workflows</h2>
          <p className="text-sm text-muted-foreground">
            Disciplinary linkage, intervention tracking, and escalation resolution
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Integrate compliance escalations with Employee Relations module</li>
            <li>Trigger HR workflow cases from Tier 3-4 escalations</li>
            <li>Link compliance non-compliance to disciplinary action templates</li>
            <li>Track intervention outcomes and resolution metrics</li>
            <li>Document de-escalation and remediation pathways</li>
          </ul>
        </CardContent>
      </Card>

      {/* HR Integration Points */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">HR Module Integration Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     COMPLIANCE → HR INTERVENTION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Compliance Module                        Employee Relations Module             │
│   ┌─────────────────────┐                  ┌─────────────────────┐              │
│   │ Tier 3 Escalation   │                  │ er_cases            │              │
│   │ (15+ days overdue)  │─────────────────▶│                     │              │
│   └─────────────────────┘   Auto-Create    │ case_type:          │              │
│                             Case           │ 'compliance_breach' │              │
│   ┌─────────────────────┐                  │                     │              │
│   │ Tier 4 Escalation   │                  │ source_module:      │              │
│   │ (30+ days overdue)  │─────────────────▶│ 'lnd_compliance'    │              │
│   └─────────────────────┘   Priority:      │                     │              │
│                             High           │ source_record_id:   │              │
│   ┌─────────────────────┐                  │ assignment.id       │              │
│   │ Safety Training     │                  └─────────────────────┘              │
│   │ Expired + On Duty   │───────────────────────────┬─────────────────────────  │
│   └─────────────────────┘   Immediate               │                           │
│                             Suspension              ▼                           │
│                                            ┌─────────────────────┐              │
│                                            │ disciplinary_actions│              │
│                                            │                     │              │
│                                            │ action_type:        │              │
│                                            │ 'verbal_warning' |  │              │
│                                            │ 'written_warning' | │              │
│                                            │ 'suspension' |      │              │
│                                            │ 'termination'       │              │
│                                            └─────────────────────┘              │
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
            <pre>{`compliance_hr_interventions
├── id: UUID PK
├── assignment_id: UUID FK → compliance_training_assignments.id
├── employee_id: UUID FK → profiles.id
├── company_id: UUID FK
├── escalation_tier: INT (tier that triggered intervention)
├── intervention_type: TEXT
│   ├── 'manager_counseling'
│   ├── 'hr_meeting'
│   ├── 'formal_warning'
│   ├── 'pip_initiation'
│   ├── 'suspension'
│   └── 'termination_process'
├── er_case_id: UUID FK → er_cases.id (if ER case created)
├── disciplinary_action_id: UUID FK → disciplinary_actions.id
├── assigned_hr_partner: UUID FK → profiles.id
├── status: TEXT ('initiated', 'in_progress', 'resolved', 'closed')
├── resolution_type: TEXT
│   ├── 'training_completed'
│   ├── 'exemption_granted'
│   ├── 'role_change'
│   ├── 'disciplinary_action'
│   └── 'employment_ended'
├── resolution_notes: TEXT
├── resolution_date: TIMESTAMP
├── days_to_resolve: INT (calculated)
└── created_at, updated_at: TIMESTAMP`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Intervention Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intervention Decision Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     HR INTERVENTION DECISION TREE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Compliance Escalation Reaches Tier 3+                                          │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐                                                            │
│   │ First Offense?  │──── Yes ───> Manager Counseling                            │
│   └────────┬────────┘              (intervention_type = 'manager_counseling')    │
│            │ No                                                                  │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Second Offense? │──── Yes ───> HR Meeting + Verbal Warning                   │
│   └────────┬────────┘              (intervention_type = 'hr_meeting')            │
│            │ No                                                                  │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Third Offense?  │──── Yes ───> Written Warning + PIP Consideration           │
│   └────────┬────────┘              (intervention_type = 'formal_warning')        │
│            │ No                                                                  │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ 4+ Offenses OR  │                                                            │
│   │ Safety-Critical │──── Yes ───> Suspension + Termination Review               │
│   └─────────────────┘              (intervention_type = 'suspension')            │
│                                                                                  │
│   Special Cases:                                                                 │
│   ├── If employee.is_on_probation: Escalate directly to termination review      │
│   ├── If training.is_safety_critical: HR meeting minimum even for first offense │
│   └── If employee.union_member: Include union representative notification       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Pathways */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Resolution Pathways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resolution Type</TableHead>
                <TableHead>Trigger Condition</TableHead>
                <TableHead>System Actions</TableHead>
                <TableHead>Follow-Up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-green-500">Training Completed</Badge></TableCell>
                <TableCell>Employee completes overdue training</TableCell>
                <TableCell>Auto-close intervention, clear flags</TableCell>
                <TableCell>None (standard path)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">Exemption Granted</Badge></TableCell>
                <TableCell>Valid exemption approved by Compliance</TableCell>
                <TableCell>Mark exempt, close intervention</TableCell>
                <TableCell>Document exemption reason</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-500">Role Change</Badge></TableCell>
                <TableCell>Employee moved to role not requiring training</TableCell>
                <TableCell>Remove assignment, close intervention</TableCell>
                <TableCell>Verify new role requirements</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Disciplinary Action</Badge></TableCell>
                <TableCell>Formal warning issued per policy</TableCell>
                <TableCell>Link to disciplinary record</TableCell>
                <TableCell>Monitor for repeat offense</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">Employment Ended</Badge></TableCell>
                <TableCell>Termination or resignation</TableCell>
                <TableCell>Close all active interventions</TableCell>
                <TableCell>Exit interview if applicable</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SLA Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Intervention SLA Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Measurement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Time to First Contact</TableCell>
                <TableCell>24 hours from escalation</TableCell>
                <TableCell>created_at → first HR touchpoint</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Resolution Time (Standard)</TableCell>
                <TableCell>7 business days</TableCell>
                <TableCell>created_at → resolution_date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Resolution Time (Safety-Critical)</TableCell>
                <TableCell>3 business days</TableCell>
                <TableCell>created_at → resolution_date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Intervention Success Rate</TableCell>
                <TableCell>≥85% resolved without termination</TableCell>
                <TableCell>resolution_type != 'employment_ended'</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Repeat Offense Rate</TableCell>
                <TableCell>≤10% within 12 months</TableCell>
                <TableCell>Same employee, new intervention within year</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
