import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Workflow, Database, Zap } from 'lucide-react';

export function LndComplianceIncidentTraining() {
  return (
    <section id="sec-5-21" data-manual-anchor="sec-5-21" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.21 Incident-Triggered Training</h2>
          <p className="text-sm text-muted-foreground">
            Automated remedial training from HSE incident corrective actions
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Configure incident-to-training trigger rules based on incident type</li>
            <li>Auto-enroll employees in remedial training from corrective actions</li>
            <li>Track training completion as part of incident closure</li>
            <li>Escalate incomplete remedial training with incident linkage</li>
            <li>Generate incident-training correlation reports for root cause analysis</li>
          </ul>
        </CardContent>
      </Card>

      {/* Incident-Training Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Incident → Training Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     INCIDENT-TRIGGERED TRAINING WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   HSE Incident Reported                                                          │
│   (hse_incidents)                                                                │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ Investigation Complete                                                   │   │
│   │ ├── incident_type: 'near_miss' | 'injury' | 'illness' | 'property'      │   │
│   │ ├── is_recordable: BOOLEAN                                               │   │
│   │ ├── is_osha_reportable: BOOLEAN                                          │   │
│   │ └── root_cause_category: TEXT                                            │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ Corrective Actions Defined (hse_incidents.corrective_actions JSONB)      │   │
│   │                                                                          │   │
│   │ {                                                                        │   │
│   │   "actions": [                                                           │   │
│   │     {                                                                    │   │
│   │       "type": "training",                                                │   │
│   │       "scope": "individual" | "department" | "site",                     │   │
│   │       "training_type": "refresher" | "remedial" | "new_procedure",       │   │
│   │       "lms_course_id": "uuid-of-course",                                 │   │
│   │       "target_employees": ["uuid1", "uuid2"],  // if individual          │   │
│   │       "target_department": "uuid",             // if department          │   │
│   │       "due_within_days": 14,                                             │   │
│   │       "priority": "high"                                                 │   │
│   │     }                                                                    │   │
│   │   ]                                                                      │   │
│   │ }                                                                        │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐                                                            │
│   │ Training        │  For each corrective action with type='training':          │
│   │ Request         │  ├── Create training_requests record                       │
│   │ Created         │  │   source_type = 'incident'                              │
│   │                 │  │   source_reference_id = incident.id                     │
│   └────────┬────────┘  └── priority = 'high'                                     │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ LMS Enrollment  │  Auto-created enrollment:                                  │
│   │ Auto-Created    │  ├── enrollment_source = 'incident_corrective_action'      │
│   │                 │  ├── due_date = incident_date + due_within_days            │
│   └────────┬────────┘  └── linked to training_requests                           │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ Completion Tracking                                                      │   │
│   │                                                                          │   │
│   │ When lms_enrollment.status = 'completed':                                │   │
│   │ ├── Update training_requests.status = 'completed'                        │   │
│   │ ├── Update corrective_action status in incident                          │   │
│   │ ├── If all training actions complete → incident.remediation_status =     │   │
│   │ │   'training_complete'                                                  │   │
│   │ └── Notify HSE Officer                                                   │   │
│   │                                                                          │   │
│   │ If past due_date and not completed:                                      │   │
│   │ ├── Escalate to Compliance with incident reference                       │   │
│   │ └── Block incident closure until training complete                       │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Trigger Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Auto-Trigger Configuration Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident Type</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Auto-Trigger Training</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Due Within</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline">Near Miss</Badge></TableCell>
                <TableCell>Any reported</TableCell>
                <TableCell>Safety Awareness Refresher</TableCell>
                <TableCell>Individual</TableCell>
                <TableCell>14 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">First Aid Injury</Badge></TableCell>
                <TableCell>is_recordable = false</TableCell>
                <TableCell>Job-specific safety refresher</TableCell>
                <TableCell>Individual + Supervisor</TableCell>
                <TableCell>7 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-500">Recordable Injury</Badge></TableCell>
                <TableCell>is_recordable = true</TableCell>
                <TableCell>Full safety retraining</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>7 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">OSHA Reportable</Badge></TableCell>
                <TableCell>is_osha_reportable = true</TableCell>
                <TableCell>Comprehensive certification review</TableCell>
                <TableCell>Site-wide</TableCell>
                <TableCell>3 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">Fatality</Badge></TableCell>
                <TableCell>incident_type = 'fatality'</TableCell>
                <TableCell>Full safety stand-down + retraining</TableCell>
                <TableCell>Organization-wide</TableCell>
                <TableCell>Immediate</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Database Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-4 w-4" />
            Relevant hse_incidents Fields
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`hse_incidents (Key Fields for Training Integration)
├── id: UUID PK
├── incident_number: TEXT (e.g., INC-2025-0042)
├── incident_type: TEXT
│   ├── 'near_miss'
│   ├── 'first_aid'
│   ├── 'medical_treatment'
│   ├── 'lost_time'
│   ├── 'restricted_duty'
│   ├── 'fatality'
│   └── 'property_damage'
├── incident_date: DATE
├── reported_by: UUID FK → profiles.id
├── employees_involved: UUID[] (array of employee IDs)
├── department_id: UUID FK
├── location_id: UUID FK
├── is_recordable: BOOLEAN (OSHA recordable)
├── is_osha_reportable: BOOLEAN (must report within 24hrs)
├── root_cause_category: TEXT
│   ├── 'training_deficiency'
│   ├── 'equipment_failure'
│   ├── 'procedure_violation'
│   ├── 'ppe_issue'
│   └── 'environmental'
├── corrective_actions: JSONB (see workflow above)
├── remediation_status: TEXT
│   ├── 'pending'
│   ├── 'training_assigned'
│   ├── 'training_in_progress'
│   ├── 'training_complete'
│   └── 'closed'
├── training_requests_generated: UUID[] (links to training_requests)
└── investigation_complete: BOOLEAN

training_requests (Source Linkage)
├── source_type: TEXT ('incident', 'appraisal', 'manager', 'self', 'hse')
├── source_reference_id: UUID (hse_incidents.id when source_type='incident')
└── incident_corrective_action_index: INT (which action in the JSONB array)`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Configuration Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 1</Badge>
              <div>
                <p className="font-medium">Configure Auto-Trigger Rules</p>
                <p className="text-sm text-muted-foreground">Admin → HSE → Settings → Incident Training Rules</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 2</Badge>
              <div>
                <p className="font-medium">Map Incident Types to Training</p>
                <p className="text-sm text-muted-foreground">For each incident type, specify default remedial course(s)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 3</Badge>
              <div>
                <p className="font-medium">Set Due Date Policies</p>
                <p className="text-sm text-muted-foreground">Configure due_within_days for each severity level</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 4</Badge>
              <div>
                <p className="font-medium">Configure Escalation</p>
                <p className="text-sm text-muted-foreground">Link incident-triggered training to compliance escalation tiers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card className="border-amber-500/50">
        <CardHeader>
          <CardTitle className="text-lg">Critical Business Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm">Incidents with root_cause_category = 'training_deficiency' require mandatory retraining—no exemptions</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm">Incident cannot be closed (status = 'closed') until all training corrective actions are complete</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm">OSHA reportable incidents automatically copy training gaps to OSHA 300A supplemental report</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm">If employee had expired certification at time of incident, flag is_training_gap = true</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
