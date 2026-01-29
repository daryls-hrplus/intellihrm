import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function LndComplianceCalendar() {
  return (
    <section id="sec-5-3" data-manual-anchor="sec-5-3" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-500/10">
          <Calendar className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.3 Compliance Calendar & Deadlines</h2>
          <p className="text-muted-foreground">Annual planning, deadline management, and schedule optimization</p>
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
            <li>Plan annual compliance training calendar aligned with regulatory deadlines</li>
            <li>Configure automated assignment scheduling based on calendar events</li>
            <li>Manage seasonal peaks and avoid bottleneck periods</li>
            <li>Integrate compliance deadlines with organizational calendars</li>
          </ul>
        </CardContent>
      </Card>

      {/* Annual Compliance Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Standard Annual Compliance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Training Focus</TableHead>
                <TableHead>Regulatory Driver</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">January</TableCell>
                <TableCell>Annual refresher assignments, New year policy updates</TableCell>
                <TableCell>Fiscal year alignment</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">February</TableCell>
                <TableCell>OSHA 300A posting deadline preparation</TableCell>
                <TableCell>OSHA reporting (US)</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">March</TableCell>
                <TableCell>Q1 compliance review, Data protection refresher</TableCell>
                <TableCell>GDPR anniversary</TableCell>
                <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">April</TableCell>
                <TableCell>Safety month preparation, HSE training push</TableCell>
                <TableCell>World Day for Safety (April 28)</TableCell>
                <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">May</TableCell>
                <TableCell>Mental health awareness, Harassment prevention</TableCell>
                <TableCell>Mental Health Awareness Month</TableCell>
                <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">June</TableCell>
                <TableCell>Mid-year compliance audit, Recertification wave</TableCell>
                <TableCell>Mid-year review cycle</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">July</TableCell>
                <TableCell>Summer safety (heat stress, outdoor work)</TableCell>
                <TableCell>Seasonal hazards</TableCell>
                <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">August</TableCell>
                <TableCell>Caribbean hurricane preparedness</TableCell>
                <TableCell>Hurricane season (Caribbean)</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">September</TableCell>
                <TableCell>Cybersecurity awareness preparation</TableCell>
                <TableCell>Cybersecurity Awareness Month (Oct)</TableCell>
                <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">October</TableCell>
                <TableCell>Cybersecurity training, IT compliance</TableCell>
                <TableCell>Cybersecurity Awareness Month</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">November</TableCell>
                <TableCell>Year-end compliance push, Overdue resolution</TableCell>
                <TableCell>Fiscal year closing</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">December</TableCell>
                <TableCell>Annual completion deadline, Next year planning</TableCell>
                <TableCell>Annual compliance close</TableCell>
                <TableCell><Badge variant="destructive">High</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deadline Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Deadline Configuration Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEADLINE CALCULATION METHODS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Method 1: FIXED DATE                                                       │
│   ├── due_date_type: 'fixed'                                                │
│   ├── fixed_due_date: '2026-12-31'                                          │
│   └── Use case: Annual compliance with calendar year deadline               │
│                                                                              │
│   Method 2: RELATIVE TO HIRE DATE                                           │
│   ├── due_date_type: 'relative_hire'                                        │
│   ├── due_days_from_hire: 30                                                │
│   └── Use case: New hire orientation, probation training                    │
│                                                                              │
│   Method 3: RELATIVE TO ASSIGNMENT                                          │
│   ├── due_date_type: 'relative_assignment'                                  │
│   ├── due_days_from_assignment: 14                                          │
│   └── Use case: Ad-hoc assignments, incident-triggered training             │
│                                                                              │
│   Method 4: RELATIVE TO LAST COMPLETION                                     │
│   ├── due_date_type: 'relative_completion'                                  │
│   ├── frequency_months: 12                                                  │
│   └── Use case: Annual recertification, periodic refresher                  │
│                                                                              │
│   Method 5: RELATIVE TO CERTIFICATION EXPIRY                                │
│   ├── due_date_type: 'relative_expiry'                                      │
│   ├── due_days_before_expiry: 30                                            │
│   └── Use case: Recertification before external cert expires                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deadline Type</TableHead>
                <TableHead>Database Field</TableHead>
                <TableHead>Calculation</TableHead>
                <TableHead>Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Fixed Date</TableCell>
                <TableCell className="font-mono text-xs">fixed_due_date</TableCell>
                <TableCell>Exact date</TableCell>
                <TableCell>Annual compliance due Dec 31</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Hire + Days</TableCell>
                <TableCell className="font-mono text-xs">due_days_from_hire</TableCell>
                <TableCell>profiles.start_date + N days</TableCell>
                <TableCell>Orientation within 7 days of hire</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Assignment + Days</TableCell>
                <TableCell className="font-mono text-xs">due_days_from_assignment</TableCell>
                <TableCell>assignment.created_at + N days</TableCell>
                <TableCell>Complete within 14 days of assignment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Last Completion + Months</TableCell>
                <TableCell className="font-mono text-xs">frequency_months</TableCell>
                <TableCell>last_completed_at + N months</TableCell>
                <TableCell>Annual refresher every 12 months</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Expiry - Days</TableCell>
                <TableCell className="font-mono text-xs">due_days_before_expiry</TableCell>
                <TableCell>expiry_date - N days</TableCell>
                <TableCell>Recertify 30 days before license expires</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Peak Period Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Peak Period Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Avoid overwhelming employees during high-volume periods by staggering assignments 
            and managing capacity constraints.
          </p>

          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Peak Period Mitigation Strategies:

1. STAGGERED ASSIGNMENTS
   ├── Divide employees into cohorts
   ├── Assign different due dates per cohort
   └── Example: Q4 compliance split into Oct/Nov/Dec waves

2. BLACKOUT PERIODS
   ├── Configure organization blackout dates
   ├── System delays assignment notifications during blackouts
   └── Example: No assignments during year-end close (Dec 20-Jan 5)

3. CAPACITY LIMITS
   ├── Set maximum concurrent assignments per employee
   ├── Queue additional assignments until capacity available
   └── Default: max_concurrent_compliance = 3

4. PRIORITY SEQUENCING
   ├── Mandatory before recommended
   ├── Regulatory before organizational
   ├── Expiring certs before new requirements
   └── HSE safety before general compliance`}</pre>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-amber-600 mb-2">Capacity Planning Formula</h4>
            <p className="text-sm font-mono">
              Available Training Hours = (Work Days × Avg Daily Training Time) - Blackout Days<br/>
              Required Hours = Σ(Course Duration × Target Audience Size)<br/>
              Capacity Ratio = Available / Required (Target: &gt; 1.2 for buffer)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Integration</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Data Synced</TableHead>
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Outlook/Exchange</TableCell>
                <TableCell>OAuth 2.0 / Graph API</TableCell>
                <TableCell>Training deadlines as tasks</TableCell>
                <TableCell>Real-time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Google Calendar</TableCell>
                <TableCell>OAuth 2.0 / Calendar API</TableCell>
                <TableCell>Training sessions as events</TableCell>
                <TableCell>Real-time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">iCal Export</TableCell>
                <TableCell>ICS file download</TableCell>
                <TableCell>All assignments with due dates</TableCell>
                <TableCell>On-demand</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Training Calendar View</TableCell>
                <TableCell>Native L&D module</TableCell>
                <TableCell>Sessions, deadlines, completions</TableCell>
                <TableCell>Real-time</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <p className="text-sm text-muted-foreground">
            See <strong>Section 8.9 Calendar Sync</strong> for detailed OAuth configuration 
            and <strong>Section 4.30 Calendar Integration</strong> for session scheduling.
          </p>
        </CardContent>
      </Card>

      {/* Automated Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Automated Assignment Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Scheduled Job: compliance-assignment-scheduler
Frequency: Daily at 02:00 UTC
Scope: All active compliance_training rules

Process:
1. Identify employees matching target criteria
2. Check existing assignments (avoid duplicates)
3. Calculate due_date based on configuration
4. Create compliance_training_assignments records
5. Trigger COMPLIANCE_TRAINING_ASSIGNED notification
6. Log assignment batch in audit trail

Trigger Events:
├── New employee matching criteria → Immediate assignment
├── Employee role change → Re-evaluate all rules
├── Rule activation → Bulk assignment to all targets
└── Recertification due → 30 days before expiry`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Regional Calendar Variations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regional Calendar Variations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Fiscal Year</TableHead>
                <TableHead>Key Regulatory Dates</TableHead>
                <TableHead>Blackout Periods</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Trinidad & Tobago</TableCell>
                <TableCell>Oct 1 - Sep 30</TableCell>
                <TableCell>OSH Act anniversary (Aug)</TableCell>
                <TableCell>Carnival (Feb), Independence (Aug)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jamaica</TableCell>
                <TableCell>Apr 1 - Mar 31</TableCell>
                <TableCell>OSHA Jamaica reviews (Q1)</TableCell>
                <TableCell>Independence (Aug), Christmas</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Barbados</TableCell>
                <TableCell>Apr 1 - Mar 31</TableCell>
                <TableCell>Safety inspections (Q2)</TableCell>
                <TableCell>Crop Over (Aug), Independence (Nov)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dominican Republic</TableCell>
                <TableCell>Jan 1 - Dec 31</TableCell>
                <TableCell>SISALRIL audits (quarterly)</TableCell>
                <TableCell>Semana Santa, Christmas/New Year</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">United States</TableCell>
                <TableCell>Jan 1 - Dec 31</TableCell>
                <TableCell>OSHA 300A (Feb 1), Form 300 (year-end)</TableCell>
                <TableCell>Thanksgiving, Christmas/New Year</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Calendar Planning Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">30 days</div>
              <div className="text-sm text-muted-foreground">Min. lead time for mandatory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">60 days</div>
              <div className="text-sm text-muted-foreground">Optimal recertification notice</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Q4</div>
              <div className="text-sm text-muted-foreground">Highest compliance volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Max concurrent assignments</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
