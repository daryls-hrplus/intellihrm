import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, CheckCircle2 } from 'lucide-react';

export function LndComplianceRegulatoryReports() {
  return (
    <section id="sec-5-17" data-manual-anchor="sec-5-17" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-500/10">
          <FileText className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.17 Regulatory Report Generation</h2>
          <p className="text-sm text-muted-foreground">
            OSHA 300A integration, standard templates, and export formats
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Generate OSHA 300A annual summary with training compliance data</li>
            <li>Configure standard regulatory report templates</li>
            <li>Schedule automatic report generation and distribution</li>
            <li>Export reports in regulator-accepted formats (PDF, XML, CSV)</li>
            <li>Link training gaps to incident/injury reports</li>
          </ul>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Standard Regulatory Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Regulatory Body</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Data Sources</TableHead>
                <TableHead>Formats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="destructive">OSHA 300A Summary</Badge></TableCell>
                <TableCell>US OSHA</TableCell>
                <TableCell>Annual (Feb 1)</TableCell>
                <TableCell>hse_incidents, hse_training_records</TableCell>
                <TableCell>PDF, XML</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Safety Training Matrix</Badge></TableCell>
                <TableCell>Multiple</TableCell>
                <TableCell>Monthly/On-demand</TableCell>
                <TableCell>compliance_training_assignments</TableCell>
                <TableCell>PDF, Excel</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-500">Certification Status</Badge></TableCell>
                <TableCell>Industry-specific</TableCell>
                <TableCell>Quarterly</TableCell>
                <TableCell>certifications, hse_training_records</TableCell>
                <TableCell>PDF, CSV</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">Compliance Gap Analysis</Badge></TableCell>
                <TableCell>Internal/External Audit</TableCell>
                <TableCell>On-demand</TableCell>
                <TableCell>All compliance tables</TableCell>
                <TableCell>PDF, Excel</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-500">Caribbean Labor Report</Badge></TableCell>
                <TableCell>Regional Labor Ministries</TableCell>
                <TableCell>Annual</TableCell>
                <TableCell>Region-specific training data</TableCell>
                <TableCell>PDF</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* OSHA 300A Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OSHA 300A Training Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     OSHA 300A TRAINING DATA INTEGRATION                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   hse_osha_logs                                                                  │
│   ├── log_year: INT                                                              │
│   ├── establishment_name: TEXT                                                   │
│   ├── naics_code: TEXT                                                           │
│   ├── total_hours_worked: DECIMAL                                                │
│   ├── injury_cases: JSONB                                                        │
│   └── illness_cases: JSONB                                                       │
│         │                                                                        │
│         │   Cross-Reference                                                      │
│         ▼                                                                        │
│   hse_training_records                                                           │
│   ├── For each incident in OSHA log:                                             │
│   │   └── Check if employee had current training at incident_date               │
│   │                                                                              │
│   └── Training Gap Flagging:                                                     │
│       ├── expired_cert_at_incident: BOOLEAN                                      │
│       ├── missing_required_training: BOOLEAN                                     │
│       └── training_gap_type: TEXT                                                │
│                                                                                  │
│   Report Output:                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ OSHA 300A Supplemental: Training Compliance Summary                      │   │
│   │                                                                          │   │
│   │ Total Employees: 150                                                     │   │
│   │ Safety Training Completion Rate: 94.2%                                   │   │
│   │ Incidents with Training Gaps: 2 of 8 (25%)                               │   │
│   │ Certifications Expired at Incident: 1                                    │   │
│   │                                                                          │   │
│   │ ⚠ Corrective Actions Required: 3                                        │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Report Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Report Scheduling Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`compliance_report_schedules
├── id: UUID PK
├── company_id: UUID FK
├── report_type: TEXT (e.g., 'osha_300a', 'safety_matrix')
├── report_name: TEXT
├── frequency: TEXT ('daily', 'weekly', 'monthly', 'quarterly', 'annual')
├── day_of_week: INT (0-6, for weekly)
├── day_of_month: INT (1-31, for monthly)
├── month_of_year: INT (1-12, for annual)
├── time_of_day: TIME
├── timezone: TEXT
├── recipients: TEXT[] (email addresses)
├── cc_recipients: TEXT[]
├── formats: TEXT[] (e.g., ['pdf', 'excel'])
├── filters: JSONB
│   ├── departments[]
│   ├── locations[]
│   ├── compliance_categories[]
│   └── date_range
├── is_active: BOOLEAN
├── last_run_at: TIMESTAMP
├── next_run_at: TIMESTAMP
└── created_by: UUID FK`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Export Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Format Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Format</TableHead>
                <TableHead>Use Case</TableHead>
                <TableHead>Compliance Standard</TableHead>
                <TableHead>Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge>PDF</Badge></TableCell>
                <TableCell>Official submissions, archival</TableCell>
                <TableCell>PDF/A-3 (ISO 19005-3)</TableCell>
                <TableCell>Digital signature, embedded metadata</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">XML</Badge></TableCell>
                <TableCell>OSHA electronic filing</TableCell>
                <TableCell>OSHA ITA Schema</TableCell>
                <TableCell>Validated against XSD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-500">Excel (XLSX)</Badge></TableCell>
                <TableCell>Internal analysis, pivot tables</TableCell>
                <TableCell>—</TableCell>
                <TableCell>Multiple sheets, formulas preserved</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="secondary">CSV</Badge></TableCell>
                <TableCell>Data integration, bulk processing</TableCell>
                <TableCell>RFC 4180</TableCell>
                <TableCell>UTF-8 encoding, quoted fields</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Configuration Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Configuration Procedure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 1</Badge>
              <div>
                <p className="font-medium">Navigate to Compliance Reports</p>
                <p className="text-sm text-muted-foreground">Admin → L&D → Compliance → Reports & Schedules</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 2</Badge>
              <div>
                <p className="font-medium">Select Report Template</p>
                <p className="text-sm text-muted-foreground">Choose from standard templates or create custom report</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 3</Badge>
              <div>
                <p className="font-medium">Configure Filters</p>
                <p className="text-sm text-muted-foreground">Select departments, locations, date ranges, compliance categories</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 4</Badge>
              <div>
                <p className="font-medium">Set Schedule</p>
                <p className="text-sm text-muted-foreground">Define frequency, timing, and recipient list</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 5</Badge>
              <div>
                <p className="font-medium">Test & Activate</p>
                <p className="text-sm text-muted-foreground">Generate test report, verify output, activate schedule</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
