import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, FileText, Database, Award } from 'lucide-react';

export function LndComplianceOSHA() {
  return (
    <section id="sec-5-22" data-manual-anchor="sec-5-22" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.22 OSHA & Safety Certification</h2>
          <p className="text-sm text-muted-foreground">
            OSHA 10/30-Hour, certification tracking, and OSHA 300A training integration
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Track OSHA 10-Hour and 30-Hour certification requirements</li>
            <li>Integrate training data with OSHA 300A annual summary</li>
            <li>Flag training gaps in incident reports using is_osha_reportable</li>
            <li>Configure OSHA-specific certification types and renewal cycles</li>
            <li>Generate OSHA ITA electronic submission data</li>
          </ul>
        </CardContent>
      </Card>

      {/* OSHA Training Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OSHA Training Requirements Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Training</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Certification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="destructive">OSHA 10-Hour</Badge></TableCell>
                <TableCell>Entry-level workers</TableCell>
                <TableCell>10 hours</TableCell>
                <TableCell>One-time (recommended refresh 3yr)</TableCell>
                <TableCell>DOL Card</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">OSHA 30-Hour</Badge></TableCell>
                <TableCell>Supervisors, Safety Personnel</TableCell>
                <TableCell>30 hours</TableCell>
                <TableCell>One-time (recommended refresh 5yr)</TableCell>
                <TableCell>DOL Card</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Hazard Communication</Badge></TableCell>
                <TableCell>All employees</TableCell>
                <TableCell>1-2 hours</TableCell>
                <TableCell>Annual + when new hazards</TableCell>
                <TableCell>Completion record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Lockout/Tagout (LOTO)</Badge></TableCell>
                <TableCell>Authorized employees</TableCell>
                <TableCell>2-4 hours</TableCell>
                <TableCell>Annual + when procedures change</TableCell>
                <TableCell>Practical assessment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Confined Space</Badge></TableCell>
                <TableCell>Permit-required entrants</TableCell>
                <TableCell>4-8 hours</TableCell>
                <TableCell>Annual</TableCell>
                <TableCell>Certification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Bloodborne Pathogens</Badge></TableCell>
                <TableCell>At-risk employees</TableCell>
                <TableCell>1-2 hours</TableCell>
                <TableCell>Annual</TableCell>
                <TableCell>Completion record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-500">Forklift Operator</Badge></TableCell>
                <TableCell>Forklift operators</TableCell>
                <TableCell>8 hours initial</TableCell>
                <TableCell>Every 3 years</TableCell>
                <TableCell>Operator license</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-500">Aerial Lift</Badge></TableCell>
                <TableCell>Lift operators</TableCell>
                <TableCell>4 hours initial</TableCell>
                <TableCell>Every 3 years</TableCell>
                <TableCell>Operator license</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* hse_osha_logs Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-4 w-4" />
            hse_osha_logs Field Reference (22 Fields)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`hse_osha_logs
├── id: UUID PK
├── company_id: UUID FK
├── log_year: INT (e.g., 2025)
├── establishment_name: TEXT
├── establishment_address: TEXT
├── city: TEXT
├── state: TEXT
├── zip: TEXT
├── naics_code: TEXT (industry classification)
├── sic_code: TEXT (legacy)
├── annual_average_employees: INT
├── total_hours_worked: DECIMAL
├── 
├── -- Injury/Illness Summary Counts
├── total_deaths: INT
├── total_days_away_from_work: INT
├── total_days_job_transfer_restriction: INT
├── total_other_recordable_cases: INT
├── 
├── -- Detailed Case Breakdowns
├── injury_cases: JSONB
│   ├── total: INT
│   ├── by_type: {cuts: INT, fractures: INT, burns: INT, ...}
│   └── training_gap_cases: INT (cases where training was expired/missing)
├── illness_cases: JSONB
│   ├── skin_disorders: INT
│   ├── respiratory: INT
│   ├── poisoning: INT
│   ├── hearing_loss: INT
│   └── other: INT
├── 
├── -- Certification & Status
├── certification_date: DATE
├── certified_by: UUID FK → profiles.id
├── certifier_title: TEXT
├── status: TEXT ('draft', 'pending_review', 'certified', 'submitted', 'amended')
├── 
├── -- Training Gap Analysis (LMS Integration)
├── training_compliance_summary: JSONB
│   ├── total_employees: INT
│   ├── fully_compliant: INT
│   ├── partial_compliance: INT
│   ├── non_compliant: INT
│   ├── incidents_with_training_gaps: INT
│   └── gap_details: [{incident_id, training_type, gap_description}]
├── 
├── electronic_submission_data: JSONB (OSHA ITA format)
└── created_at, updated_at: TIMESTAMP`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* OSHA 300A Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-4 w-4" />
            OSHA 300A Training Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     OSHA 300A TRAINING GAP ANALYSIS                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   During OSHA 300A Generation:                                                   │
│                                                                                  │
│   1. For each recordable incident in the year:                                   │
│      ┌─────────────────────────────────────────────────────────────────────┐    │
│      │ SELECT i.id, i.incident_date, i.employees_involved                   │    │
│      │ FROM hse_incidents i                                                 │    │
│      │ WHERE i.is_recordable = true                                         │    │
│      │   AND EXTRACT(YEAR FROM i.incident_date) = [log_year]                │    │
│      └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│   2. For each involved employee, check training status at incident_date:         │
│      ┌─────────────────────────────────────────────────────────────────────┐    │
│      │ SELECT htr.status, htr.expiry_date                                   │    │
│      │ FROM hse_training_records htr                                        │    │
│      │ JOIN hse_safety_training hst ON htr.training_id = hst.id            │    │
│      │ WHERE htr.employee_id IN (incident.employees_involved)               │    │
│      │   AND hst.is_mandatory = true                                        │    │
│      │   AND (htr.expiry_date < incident.incident_date                      │    │
│      │        OR htr.status != 'completed')                                 │    │
│      └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│   3. If training gap found:                                                      │
│      ├── Flag incident with is_training_gap = true                              │
│      ├── Increment training_compliance_summary.incidents_with_training_gaps     │
│      └── Add to gap_details array for reporting                                 │
│                                                                                  │
│   4. Generate Training Supplemental Section:                                     │
│      ┌─────────────────────────────────────────────────────────────────────┐    │
│      │ OSHA 300A SUPPLEMENTAL: Training Compliance Analysis                 │    │
│      │                                                                      │    │
│      │ Period: January 1 - December 31, 2025                                │    │
│      │ Establishment: [establishment_name]                                  │    │
│      │                                                                      │    │
│      │ TRAINING COMPLIANCE METRICS                                          │    │
│      │ ├── Total Employees Evaluated: 150                                   │    │
│      │ ├── Fully Compliant at Year End: 142 (94.7%)                         │    │
│      │ ├── With Training Gaps: 8 (5.3%)                                     │    │
│      │                                                                      │    │
│      │ INCIDENT CORRELATION                                                 │    │
│      │ ├── Total Recordable Incidents: 8                                    │    │
│      │ ├── Incidents with Training Gaps: 2 (25%)                            │    │
│      │ └── Gap Types: LOTO (1), Forklift (1)                                │    │
│      │                                                                      │    │
│      │ CORRECTIVE ACTIONS                                                   │    │
│      │ ├── Remedial Training Assigned: 15 employees                         │    │
│      │ └── Completion Status: 14 completed, 1 in progress                   │    │
│      └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Certification Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OSHA Certification Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cert Type</TableHead>
                <TableHead>Issuing Authority</TableHead>
                <TableHead>Card Number Field</TableHead>
                <TableHead>Expiry Tracking</TableHead>
                <TableHead>Renewal Alert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>OSHA 10-Hour Card</TableCell>
                <TableCell>US Department of Labor</TableCell>
                <TableCell>certifications.external_id</TableCell>
                <TableCell>No expiry (refresh recommended)</TableCell>
                <TableCell>3 years from issue</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OSHA 30-Hour Card</TableCell>
                <TableCell>US Department of Labor</TableCell>
                <TableCell>certifications.external_id</TableCell>
                <TableCell>No expiry (refresh recommended)</TableCell>
                <TableCell>5 years from issue</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Forklift Operator License</TableCell>
                <TableCell>Employer</TableCell>
                <TableCell>certifications.certificate_number</TableCell>
                <TableCell>3 years from evaluation</TableCell>
                <TableCell>90/30/7 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Confined Space Entry</TableCell>
                <TableCell>Training Provider</TableCell>
                <TableCell>certifications.certificate_number</TableCell>
                <TableCell>Annual</TableCell>
                <TableCell>60/30/14 days</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 1</Badge>
              <div>
                <p className="font-medium">Create OSHA Course Templates</p>
                <p className="text-sm text-muted-foreground">Admin → LMS → Courses → Create courses for OSHA 10, 30, HazCom, etc.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 2</Badge>
              <div>
                <p className="font-medium">Link to HSE Requirements</p>
                <p className="text-sm text-muted-foreground">HSE → Safety Training → Link each requirement to LMS course</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 3</Badge>
              <div>
                <p className="font-medium">Configure Certification Types</p>
                <p className="text-sm text-muted-foreground">Admin → Certifications → Create OSHA cert types with DOL card tracking</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 4</Badge>
              <div>
                <p className="font-medium">Set Up 300A Generation</p>
                <p className="text-sm text-muted-foreground">HSE → OSHA Logs → Configure establishment data and enable training gap analysis</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
