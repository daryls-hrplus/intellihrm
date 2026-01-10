import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, ArrowRight, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function TAOverviewCoreConcepts() {
  const coreTerms = [
    {
      term: 'Clock Entry',
      definition: 'A single punch record capturing clock-in or clock-out time, method, location, and verification status.',
      example: 'Employee clocks in at 08:02 via mobile GPS at HQ location, face verified.',
      related: ['Time Clock Device', 'Geofence', 'Face Verification']
    },
    {
      term: 'Shift',
      definition: 'A defined work period with start time, end time, break rules, and associated policies.',
      example: 'Morning Shift: 06:00-14:00 with 30-min unpaid lunch at 10:00.',
      related: ['Shift Template', 'Shift Differential', 'Rounding Rule']
    },
    {
      term: 'Shift Template',
      definition: 'A reusable shift definition that can be applied across multiple schedules and locations.',
      example: 'Standard Day Shift template used by all departments for regular hours.',
      related: ['Shift', 'Schedule', 'Rotation Pattern']
    },
    {
      term: 'Schedule',
      definition: 'A collection of shift assignments for a specific period, typically weekly or monthly.',
      example: 'Week 3 schedule assigns 15 employees across 5 shifts with rotation.',
      related: ['Shift Assignment', 'Rotation Pattern', 'AI Scheduler']
    },
    {
      term: 'Shift Assignment',
      definition: 'The mapping of a specific employee to a specific shift on a specific date.',
      example: 'John Smith assigned to Night Shift on January 15th, 2026.',
      related: ['Schedule', 'Employee', 'Shift Swap']
    },
    {
      term: 'Timesheet',
      definition: 'An aggregated view of an employee\'s clock entries for a pay period, ready for approval.',
      example: 'Weekly timesheet showing 40 regular hours + 5 overtime hours.',
      related: ['Clock Entry', 'Approval Workflow', 'Payroll Sync']
    },
    {
      term: 'Geofence',
      definition: 'A virtual geographic boundary defining valid clock-in/out locations with configurable radius.',
      example: 'Office geofence with 100m radius centered on building entrance.',
      related: ['GPS Validation', 'Clock Entry', 'Mobile Clock']
    },
    {
      term: 'Face Verification',
      definition: 'Biometric verification comparing a captured photo against enrolled face templates.',
      example: 'Clock-in requires 95% match against employee\'s enrolled face template.',
      related: ['Face Enrollment', 'Verification Threshold', 'Anti-Spoofing']
    },
    {
      term: 'Rounding Rule',
      definition: 'Policy for adjusting raw punch times to scheduled or rounded values.',
      example: 'Round to nearest 15 minutes: 08:07 becomes 08:00, 08:08 becomes 08:15.',
      related: ['Grace Period', 'Clock Entry', 'Attendance Policy']
    },
    {
      term: 'Grace Period',
      definition: 'Allowed time variance before marking an employee as late or early.',
      example: '5-minute grace period: arrival by 08:05 is not flagged as late.',
      related: ['Rounding Rule', 'Attendance Exception', 'Policy']
    },
    {
      term: 'Overtime',
      definition: 'Hours worked beyond standard hours, subject to premium pay rates.',
      example: 'After 40 weekly hours, employee earns 1.5x rate for overtime.',
      related: ['Overtime Rate', 'OT Request', 'OT Alert', 'CBA Rules']
    },
    {
      term: 'Shift Differential',
      definition: 'Additional pay for working specific shifts (e.g., night, weekend, holiday).',
      example: 'Night differential: +15% for hours worked between 22:00-06:00.',
      related: ['Shift', 'Payroll', 'Premium Pay']
    },
    {
      term: 'Regularization',
      definition: 'Process of correcting missing or incorrect time entries with manager approval.',
      example: 'Employee forgot to clock out; regularization request submitted for 17:00.',
      related: ['Exception', 'Approval Workflow', 'Audit Trail']
    },
    {
      term: 'Bradford Factor',
      definition: 'Formula measuring absence patterns: S² × D where S=spell count, D=total days.',
      example: 'Employee with 4 absences totaling 8 days: 4² × 8 = 128 Bradford score.',
      related: ['Absenteeism', 'Threshold', 'Alert', 'Wellness']
    },
    {
      term: 'Comp Time',
      definition: 'Time off earned in lieu of overtime pay, banked for future use.',
      example: '8 hours OT at 1.5x = 12 hours comp time accrued.',
      related: ['Overtime', 'Flex Time', 'Leave Balance']
    },
    {
      term: 'CBA Time Rules',
      definition: 'Collective Bargaining Agreement provisions governing work hours, OT, and rest periods.',
      example: 'Union rule: minimum 11 hours rest between shifts.',
      related: ['Labor Compliance', 'Rest Period', 'Union Agreement']
    }
  ];

  return (
    <Card id="ta-sec-1-2" data-manual-anchor="ta-sec-1-2" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.2</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">Core Concepts & Terminology</CardTitle>
        <CardDescription>Essential definitions and data model understanding</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Core Terminology */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Core Terminology
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Understanding these terms is essential for configuring and using the Time & Attendance module effectively.
          </p>
          <Accordion type="multiple" className="space-y-2">
            {coreTerms.map((item, i) => (
              <AccordionItem key={i} value={`term-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </Badge>
                    <span className="font-medium">{item.term}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3 pl-10">
                    <p className="text-muted-foreground">{item.definition}</p>
                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">Example: </span>
                          <span className="text-muted-foreground">{item.example}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">Related:</span>
                      {item.related.map((rel, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {rel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Data Model Hierarchy */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Model Hierarchy
          </h3>
          <div className="p-6 bg-muted/30 border rounded-lg">
            <div className="space-y-6">
              {/* Scheduling Flow */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Scheduling Hierarchy</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="px-3 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg font-medium">
                    Attendance Policy
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg font-medium">
                    Shift Template
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg font-medium">
                    Shift Schedule
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg font-medium">
                    Shift Assignment
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg font-medium">
                    Employee
                  </div>
                </div>
              </div>

              {/* Time Capture Flow */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Time Capture Flow</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg font-medium">
                    Time Clock Device
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg font-medium">
                    Clock Entry
                  </div>
                  <span className="text-xs text-muted-foreground">(+ Geofence + Face)</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg font-medium">
                    Timesheet
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg font-medium">
                    Payroll
                  </div>
                </div>
              </div>

              {/* Project Time Flow */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Project Time Flow</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg font-medium">
                    Project
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-violet-500/10 border border-violet-500/30 rounded-lg font-medium">
                    Time Entry
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg font-medium">
                    Cost Allocation
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 bg-pink-500/10 border border-pink-500/30 rounded-lg font-medium">
                    Project Billing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Relationships */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Entity Relationships
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Shifts & Schedules',
                items: [
                  'Shift Templates define reusable shift patterns',
                  'Schedules contain multiple Shift Assignments',
                  'Rotation Patterns automate schedule generation',
                  'AI Scheduler optimizes assignments with constraints'
                ]
              },
              {
                title: 'Clock Entries & Verification',
                items: [
                  'Clock Entries link to Geofence Locations for GPS validation',
                  'Face Enrollments store reference templates per employee',
                  'Verification Logs track all biometric attempts',
                  'Devices map to physical locations and verification methods'
                ]
              },
              {
                title: 'Timesheets & Payroll',
                items: [
                  'Timesheets aggregate Clock Entries per pay period',
                  'Overtime calculations apply rate tiers and CBA rules',
                  'Shift Differentials add premium pay for specific shifts',
                  'Approved timesheets sync to Payroll for processing'
                ]
              },
              {
                title: 'Analytics & Wellness',
                items: [
                  'Bradford Factor scores calculate from absence patterns',
                  'Wellness Indicators track fatigue and burnout risk',
                  'Overtime Alerts trigger from threshold breaches',
                  'CBA Compliance monitors rest periods and weekly limits'
                ]
              }
            ].map((section, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">{section.title}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 mt-1.5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Key Tables Reference */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Key Database Tables
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            {[
              'time_clock_entries', 'time_clock_breaks', 'shifts', 'shift_templates',
              'employee_shift_assignments', 'shift_schedules', 'attendance_policies', 'attendance_exceptions',
              'geofence_locations', 'geofence_validations', 'employee_face_enrollments', 'face_verification_logs',
              'shift_differentials', 'shift_rounding_rules', 'overtime_requests', 'overtime_rate_tiers',
              'cba_time_rules', 'employee_bradford_scores', 'employee_wellness_indicators', 'timesheet_submissions'
            ].map((table, i) => (
              <Badge key={i} variant="outline" className="justify-start font-mono text-xs">
                {table}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
