import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Bell, Clock, Users } from 'lucide-react';

export function LndComplianceEscalationRules() {
  return (
    <section id="sec-5-12" data-manual-anchor="sec-5-12" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.12 Escalation Rules & Tier Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Multi-tier escalation chains for non-compliance management
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Configure 4-tier escalation rules based on overdue duration</li>
            <li>Define SLA thresholds and notification recipients per tier</li>
            <li>Map escalation chains to organizational hierarchy</li>
            <li>Track escalation_level field transitions in compliance_training_assignments</li>
            <li>Integrate escalation triggers with notification events</li>
          </ul>
        </CardContent>
      </Card>

      {/* Escalation Tier Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escalation Tier Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Notification Recipients</TableHead>
                <TableHead>Actions Triggered</TableHead>
                <TableHead>SLA Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline">Tier 1</Badge></TableCell>
                <TableCell>1-7 days</TableCell>
                <TableCell>Employee, Direct Manager</TableCell>
                <TableCell>Reminder email, dashboard alert</TableCell>
                <TableCell>24 hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Tier 2</Badge></TableCell>
                <TableCell>8-14 days</TableCell>
                <TableCell>Manager, HR Business Partner</TableCell>
                <TableCell>Manager notification, ESS restriction warning</TableCell>
                <TableCell>48 hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-500">Tier 3</Badge></TableCell>
                <TableCell>15-30 days</TableCell>
                <TableCell>Department Head, HR Manager, Compliance Officer</TableCell>
                <TableCell>Access restrictions, formal warning</TableCell>
                <TableCell>72 hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">Tier 4</Badge></TableCell>
                <TableCell>30+ days</TableCell>
                <TableCell>CHRO, Legal, Executive Sponsor</TableCell>
                <TableCell>Suspension, disciplinary action</TableCell>
                <TableCell>Immediate</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Database Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Database Field Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`compliance_training_assignments
├── escalation_level: INT (1-4)
├── escalation_started_at: TIMESTAMP
├── last_escalation_at: TIMESTAMP
├── escalation_notes: TEXT
└── escalation_resolved_by: UUID FK → profiles.id

compliance_escalation_rules (Configuration Table)
├── id: UUID PK
├── company_id: UUID FK
├── tier_level: INT (1-4)
├── days_overdue_min: INT
├── days_overdue_max: INT
├── notification_roles: TEXT[] (e.g., ['manager', 'hr_partner'])
├── notification_template_id: UUID FK → notification_templates.id
├── sla_hours: INT
├── actions: JSONB (e.g., {restrict_access: true, flag_hr: true})
├── is_active: BOOLEAN
└── created_at, updated_at: TIMESTAMP`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Workflow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escalation Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     COMPLIANCE ESCALATION WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Training Due Date Passes                                                       │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐     status = 'overdue'                                     │
│   │ Daily Scheduler │     escalation_level = 1                                   │
│   │ Checks Overdue  │     escalation_started_at = NOW()                          │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ Calculate days_overdue = CURRENT_DATE - due_date                         │   │
│   │                                                                          │   │
│   │ Match to compliance_escalation_rules WHERE:                              │   │
│   │   days_overdue BETWEEN days_overdue_min AND days_overdue_max             │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Tier Changed?   │──── No ────> Continue monitoring                           │
│   └────────┬────────┘                                                            │
│            │ Yes                                                                 │
│            ▼                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Update escalation_level                                               │   │
│   │ 2. Set last_escalation_at = NOW()                                        │   │
│   │ 3. Fire notification events per notification_roles[]                     │   │
│   │ 4. Execute actions from JSONB (restrict access, flag HR, etc.)           │   │
│   │ 5. Log to compliance_audit_log                                           │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ SLA Timer       │  If no response within sla_hours:                          │
│   │ Started         │  → Auto-escalate to next tier                              │
│   └─────────────────┘                                                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Configuration Procedure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 1</Badge>
              <div>
                <p className="font-medium">Navigate to Escalation Settings</p>
                <p className="text-sm text-muted-foreground">Admin → L&D Configuration → Compliance → Escalation Rules</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 2</Badge>
              <div>
                <p className="font-medium">Define Tier Thresholds</p>
                <p className="text-sm text-muted-foreground">Set days_overdue_min and days_overdue_max for each tier (no gaps or overlaps)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 3</Badge>
              <div>
                <p className="font-medium">Configure Notification Recipients</p>
                <p className="text-sm text-muted-foreground">Select roles from: employee, manager, hr_partner, dept_head, compliance_officer, chro</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 4</Badge>
              <div>
                <p className="font-medium">Set SLA Response Times</p>
                <p className="text-sm text-muted-foreground">Define sla_hours for each tier (e.g., Tier 1: 24h, Tier 4: 4h)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 5</Badge>
              <div>
                <p className="font-medium">Define Tier Actions</p>
                <p className="text-sm text-muted-foreground">Configure JSONB actions: restrict_access, flag_hr, block_promotion, suspend_access</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-4 w-4" />
            Access Control Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>View Rules</TableHead>
                <TableHead>Edit Rules</TableHead>
                <TableHead>Override Escalation</TableHead>
                <TableHead>Resolve Escalation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>L&D Administrator</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>Tier 1-2</TableCell>
                <TableCell>✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Compliance Officer</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>All Tiers</TableCell>
                <TableCell>✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>HR Manager</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>—</TableCell>
                <TableCell>Tier 1-3</TableCell>
                <TableCell>✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Manager (MSS)</TableCell>
                <TableCell>Team Only</TableCell>
                <TableCell>—</TableCell>
                <TableCell>Tier 1</TableCell>
                <TableCell>Team Only</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
