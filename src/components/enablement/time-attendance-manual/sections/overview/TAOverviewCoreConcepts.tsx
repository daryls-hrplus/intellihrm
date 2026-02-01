import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, ArrowRight, Info, Layers, Timer, Calendar, MapPin, Shield, FileText, Brain, Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { TipCallout, InfoCallout } from '@/components/enablement/manual/components/Callout';

export function TAOverviewCoreConcepts() {
  // Organized by domain with database table references
  const termsByDomain = [
    {
      domain: 'Clock-In & Time Capture',
      icon: Timer,
      color: 'indigo',
      terms: [
        {
          term: 'Clock Entry',
          table: 'time_clock_entries',
          definition: 'A single punch record capturing clock-in or clock-out time, method, location, and verification status. Contains 68 fields including GPS coordinates, face match score, and device reference.',
          example: 'Employee clocks in at 08:02 via mobile GPS at HQ location, face verified with 97% confidence.',
          related: ['Punch Queue', 'Face Verification', 'Geofence Validation']
        },
        {
          term: 'Punch Queue',
          table: 'timeclock_punch_queue',
          definition: 'Temporary holding area for punches awaiting processing. Handles offline device syncs and batch imports with automatic retry logic.',
          example: 'Mobile app submits punch while offline; queued locally and synced when connection restored.',
          related: ['Clock Entry', 'Timeclock Device', 'Punch Import']
        },
        {
          term: 'Timeclock Device',
          table: 'timeclock_devices',
          definition: 'Physical or virtual time capture endpoint. Includes biometric readers, card swipes, mobile apps, and web portals.',
          example: 'Biometric fingerprint reader at warehouse entrance, model ZKTeco UA760.',
          related: ['Clock Entry', 'Device Type', 'Punch Queue']
        },
        {
          term: 'Break Record',
          table: 'time_clock_breaks',
          definition: 'Tracked break period within a work session. Can be paid or unpaid, with configurable duration and timing rules.',
          example: '30-minute unpaid lunch break starting at 12:00, auto-deducted from total hours.',
          related: ['Clock Entry', 'Attendance Policy', 'Timesheet']
        },
        {
          term: 'Clock Method',
          table: 'time_clock_entries.clock_method',
          definition: 'The verification method used for a punch: biometric, face, mobile_gps, web, card, or import.',
          example: 'clock_method = "mobile_gps" indicates punch from smartphone with location.',
          related: ['Clock Entry', 'Face Verification', 'Geofence']
        },
        {
          term: 'Punch Import',
          table: 'punch_import_batches',
          definition: 'Batch upload of clock entries from external systems via CSV, Excel, or API. Supports legacy migration and third-party devices.',
          example: 'Import 500 punches from legacy system with field mapping and duplicate detection.',
          related: ['Clock Entry', 'Punch Queue', 'Legacy Migration']
        }
      ]
    },
    {
      domain: 'Shift Management',
      icon: Calendar,
      color: 'blue',
      terms: [
        {
          term: 'Shift',
          table: 'shifts',
          definition: 'A defined work period instance with actual start time, end time, break rules, and associated policies. Created from templates.',
          example: 'Morning Shift on Jan 15: 06:00-14:00 with 30-min unpaid lunch at 10:00.',
          related: ['Shift Template', 'Shift Assignment', 'Shift Differential']
        },
        {
          term: 'Shift Template',
          table: 'shift_templates',
          definition: 'A reusable shift definition that can be applied across multiple schedules and locations. Contains timing, break, and policy configurations.',
          example: 'Standard Day Shift template: 09:00-17:00, 60-min lunch, applies to all admin staff.',
          related: ['Shift Template Entry', 'Shift', 'Rotation Pattern']
        },
        {
          term: 'Shift Template Entry',
          table: 'shift_template_entries',
          definition: 'Individual time segments within a shift template, defining work periods and break windows.',
          example: 'Entry 1: Work 09:00-12:00, Entry 2: Lunch 12:00-13:00, Entry 3: Work 13:00-17:00.',
          related: ['Shift Template', 'Break Record', 'Shift']
        },
        {
          term: 'Shift Assignment',
          table: 'employee_shift_assignments',
          definition: 'The mapping of a specific employee to a specific shift on a specific date. Includes eligibility checks and coverage validation.',
          example: 'John Smith assigned to Night Shift on January 15th, 2026.',
          related: ['Shift', 'Schedule', 'Shift Swap']
        },
        {
          term: 'Work Schedule',
          table: 'work_schedules',
          definition: 'A collection of shift assignments for a specific period, typically weekly or monthly. Defines expected work patterns.',
          example: 'Week 3 schedule assigns 15 employees across 5 shifts with rotation.',
          related: ['Shift Assignment', 'Rotation Pattern', 'Employee Schedule']
        },
        {
          term: 'Rotation Pattern',
          table: 'shift_rotation_patterns',
          definition: 'Automated shift cycling pattern (4x4, Panama, 5x2, DuPont). Generates assignments based on configured cycle rules.',
          example: '4x4 pattern: 4 days on, 4 days off, rotating between day and night shifts.',
          related: ['Schedule', 'Shift Template', 'Fatigue Management']
        },
        {
          term: 'Shift Differential',
          table: 'shift_differentials',
          definition: 'Additional pay for working specific shifts (night, weekend, holiday). Configured as percentage or fixed amount.',
          example: 'Night differential: +15% for hours worked between 22:00-06:00.',
          related: ['Shift', 'Payment Rules', 'Payroll Sync']
        },
        {
          term: 'Shift Swap',
          table: 'shift_swap_requests',
          definition: 'Employee-initiated request to exchange shifts with a colleague. Requires manager approval and eligibility validation.',
          example: 'Sarah requests to swap her Monday shift with Tom\'s Tuesday shift.',
          related: ['Shift Assignment', 'Open Shift', 'Coverage Snapshot']
        },
        {
          term: 'Open Shift',
          table: 'open_shifts',
          definition: 'Unassigned shift posted for employee self-selection. Used for coverage gaps and voluntary overtime.',
          example: 'Saturday overtime shift posted for claims; 3 eligible employees notified.',
          related: ['Open Shift Claim', 'Shift Bidding', 'Coverage Snapshot']
        },
        {
          term: 'Shift Bid',
          table: 'shift_bids',
          definition: 'Employee submission of preferred shift rankings during bidding periods. Seniority and performance may influence selection.',
          example: 'Employee ranks Day Shift #1, Evening #2, Night #3 for Q2 schedule.',
          related: ['Shift Bidding Period', 'Open Shift', 'Preference']
        }
      ]
    },
    {
      domain: 'Attendance Policy',
      icon: Shield,
      color: 'green',
      terms: [
        {
          term: 'Attendance Policy',
          table: 'attendance_policies',
          definition: 'Master configuration for time rules including rounding, grace periods, OT thresholds, and break requirements. Applied at company or location level.',
          example: 'HQ Policy: 5-min grace, round to nearest 15 min, OT after 40 weekly hours.',
          related: ['Rounding Rule', 'Grace Period', 'Overtime Threshold']
        },
        {
          term: 'Rounding Rule',
          table: 'shift_rounding_rules',
          definition: 'Policy for adjusting raw punch times to scheduled or rounded values. Can round up, down, or to nearest increment.',
          example: 'Round to nearest 15 minutes: 08:07 becomes 08:00, 08:08 becomes 08:15.',
          related: ['Grace Period', 'Clock Entry', 'Attendance Policy']
        },
        {
          term: 'Grace Period',
          table: 'attendance_policies.grace_period_minutes',
          definition: 'Allowed time variance before marking an employee as late or early. Separate settings for clock-in and clock-out.',
          example: '5-minute grace period: arrival by 09:05 is not flagged as late for 09:00 start.',
          related: ['Rounding Rule', 'Attendance Exception', 'Late Arrival']
        },
        {
          term: 'Attendance Exception',
          table: 'attendance_exceptions',
          definition: 'Anomaly requiring review: missed punch, early departure, unauthorized OT, or policy violation. Auto-detected or manually flagged.',
          example: 'Missing clock-out exception raised for employee who clocked in but has no clock-out.',
          related: ['Regularization Request', 'Exception Type', 'Auto-Detection']
        },
        {
          term: 'Regularization Request',
          table: 'attendance_regularization_requests',
          definition: 'Employee-initiated correction for missing or incorrect time entries. Follows approval workflow with audit trail.',
          example: 'Employee requests adding missed clock-out at 17:00 with manager approval.',
          related: ['Attendance Exception', 'Approval Workflow', 'Audit Trail']
        },
        {
          term: 'Bradford Factor',
          table: 'employee_bradford_scores',
          definition: 'Industry-standard formula measuring absence patterns: S² × D where S=spell count, D=total days. Higher scores indicate disruptive patterns.',
          example: 'Employee with 4 separate absences totaling 8 days: 4² × 8 = 128 Bradford score.',
          related: ['Bradford Threshold', 'Absenteeism', 'Wellness Indicator']
        },
        {
          term: 'Bradford Threshold',
          table: 'bradford_factor_thresholds',
          definition: 'Configurable trigger levels for Bradford Factor alerts and actions. Multiple tiers for warnings, reviews, and escalations.',
          example: 'Tier 1 (>50): Verbal warning | Tier 2 (>200): Written warning | Tier 3 (>500): Review.',
          related: ['Bradford Factor', 'Alert', 'HR Action']
        },
        {
          term: 'Attendance Summary',
          table: 'attendance_summary',
          definition: 'Aggregated attendance statistics per employee per period. Includes total hours, absences, late arrivals, and early departures.',
          example: 'January summary: 160 hours worked, 2 late arrivals, 1 absence, 8 OT hours.',
          related: ['Clock Entry', 'Timesheet', 'Analytics']
        }
      ]
    },
    {
      domain: 'Time Verification',
      icon: MapPin,
      color: 'teal',
      terms: [
        {
          term: 'Geofence Location',
          table: 'geofence_locations',
          definition: 'Virtual geographic boundary defining valid clock-in/out zones. Configured with center coordinates, radius, and active hours.',
          example: 'Office geofence with 100m radius centered on building entrance, active 06:00-22:00.',
          related: ['Geofence Validation', 'GPS Coordinates', 'Remote Work Zone']
        },
        {
          term: 'Geofence Validation',
          table: 'geofence_validations',
          definition: 'Record of GPS verification against geofence boundaries at clock time. Includes distance from center and pass/fail status.',
          example: 'Validation passed: employee 45m from geofence center (within 100m radius).',
          related: ['Geofence Location', 'Clock Entry', 'Geofence Violation']
        },
        {
          term: 'Geofence Violation',
          table: 'geofence_violations',
          definition: 'Record of clock attempt outside configured geofence boundary. Triggers alert and may block punch based on policy.',
          example: 'Violation: Employee attempted clock-in 250m from allowed zone.',
          related: ['Geofence Validation', 'Exception', 'Alert']
        },
        {
          term: 'Face Enrollment',
          table: 'employee_face_enrollments',
          definition: 'Stored biometric face template for employee identity verification. Multiple angles captured during enrollment process.',
          example: 'Enrollment captures 5 face angles with liveness check for anti-spoofing.',
          related: ['Face Template', 'Face Verification Log', 'Liveness Detection']
        },
        {
          term: 'Face Verification Log',
          table: 'face_verification_logs',
          definition: 'Record of face matching attempts with confidence scores and pass/fail status. Includes anti-spoofing check results.',
          example: 'Verification passed: 97% confidence match, liveness confirmed.',
          related: ['Face Enrollment', 'Clock Entry', 'Match Threshold']
        },
        {
          term: 'Verification Threshold',
          table: 'attendance_policies.face_match_threshold',
          definition: 'Minimum confidence score (0-100%) required for face verification to pass. Higher thresholds increase security but may cause false rejections.',
          example: 'Threshold set to 85%: matches below 85% confidence are rejected.',
          related: ['Face Verification Log', 'Security Policy', 'False Rejection']
        }
      ]
    },
    {
      domain: 'Overtime & Compliance',
      icon: Shield,
      color: 'amber',
      terms: [
        {
          term: 'Overtime Request',
          table: 'overtime_requests',
          definition: 'Pre-approval request for planned overtime. Can be manager-initiated or employee-requested with justification.',
          example: 'Manager requests 4 hours OT for team on Saturday for project deadline.',
          related: ['Overtime Rate Tier', 'Overtime Alert', 'Pre-Approval']
        },
        {
          term: 'Overtime Rate Tier',
          table: 'overtime_rate_tiers',
          definition: 'Configurable overtime pay multipliers based on hours or conditions. Supports multiple tiers (1.5x, 2x, 3x).',
          example: 'Tier 1: 1.5x for hours 41-50 | Tier 2: 2x for hours 51+ | Holiday: 2.5x.',
          related: ['Overtime Request', 'Payment Rules', 'CBA Rules']
        },
        {
          term: 'Overtime Risk Alert',
          table: 'overtime_risk_alerts',
          definition: 'Proactive warning when employee approaches OT threshold. Triggers before OT occurs to enable pre-approval.',
          example: 'Alert at 36 hours: Employee on track to exceed 40-hour threshold.',
          related: ['Overtime Request', 'Threshold', 'Predictive']
        },
        {
          term: 'CBA Time Rule',
          table: 'cba_time_rules',
          definition: 'Collective Bargaining Agreement provision governing work hours, OT, rest periods, and premium pay.',
          example: 'Union rule: minimum 11 hours rest between shifts, double-time after 10 hours.',
          related: ['CBA Violation', 'Rest Period', 'Labor Compliance']
        },
        {
          term: 'CBA Violation',
          table: 'cba_violations',
          definition: 'Detected breach of CBA time rule. Logged with violation type, affected employee, and remediation status.',
          example: 'Violation: Only 9 hours between shifts (minimum 11 required).',
          related: ['CBA Time Rule', 'Compliance Alert', 'Audit']
        },
        {
          term: 'Rest Period',
          table: 'cba_time_rules.rest_period_hours',
          definition: 'Minimum required break between consecutive shifts. Enforced per labor law or CBA requirements.',
          example: '11-hour minimum rest between shifts per EU Working Time Directive.',
          related: ['CBA Time Rule', 'Fatigue Management', 'Compliance']
        },
        {
          term: 'Comp Time',
          table: 'comp_time_balances',
          definition: 'Time off earned in lieu of overtime pay, banked for future use. Accrual rate may differ from OT rate.',
          example: '8 hours OT at 1.5x = 12 hours comp time accrued.',
          related: ['Overtime', 'Comp Time Earned', 'Leave Balance']
        }
      ]
    },
    {
      domain: 'Timesheet & Payroll',
      icon: FileText,
      color: 'rose',
      terms: [
        {
          term: 'Timesheet Submission',
          table: 'timesheet_submissions',
          definition: 'Employee submittal of aggregated time for a pay period. Contains summary hours, status, and approval chain.',
          example: 'Weekly timesheet submitted: 40 regular + 5 OT hours, pending manager approval.',
          related: ['Timesheet Entry', 'Approval History', 'Payroll Sync']
        },
        {
          term: 'Timesheet Entry',
          table: 'timesheet_entries',
          definition: 'Individual line item within a timesheet showing date, hours, type (regular/OT/project), and cost allocation.',
          example: 'Entry: Jan 15, 8 hours regular, Project ABC, Cost Center 1001.',
          related: ['Timesheet Submission', 'Clock Entry', 'Project Time']
        },
        {
          term: 'Timesheet Approval History',
          table: 'timesheet_approval_history',
          definition: 'Audit log of approval actions on timesheets. Records approver, action, timestamp, and comments.',
          example: 'Approved by Manager Smith on Jan 20 at 14:30 with comment "Verified OT".',
          related: ['Timesheet Submission', 'Approval Workflow', 'Audit Trail']
        },
        {
          term: 'Timekeeper Assignment',
          table: 'timekeeper_assignments',
          definition: 'Delegation of time management responsibilities to designated employees. Can manage punch corrections for assigned group.',
          example: 'Floor supervisor assigned as timekeeper for warehouse team (20 employees).',
          related: ['Period Finalization', 'Exception Management', 'Delegation']
        },
        {
          term: 'Period Finalization',
          table: 'timekeeper_period_finalizations',
          definition: 'Formal closure of a pay period by timekeeper. Locks all time records and prepares for payroll sync.',
          example: 'Period Jan 1-15 finalized by HR on Jan 16, ready for payroll processing.',
          related: ['Timekeeper Assignment', 'Payroll Sync', 'Lock Period']
        },
        {
          term: 'Payroll Sync',
          table: 'payroll_time_sync_logs',
          definition: 'Transfer of approved time data to payroll system. Includes hours, differentials, allocations, and sync status.',
          example: 'Sync completed: 150 timesheets, 4,200 regular hours, 180 OT hours to payroll.',
          related: ['Timesheet Submission', 'Period Finalization', 'Integration']
        }
      ]
    },
    {
      domain: 'Project Time',
      icon: Layers,
      color: 'purple',
      terms: [
        {
          term: 'Project Time Entry',
          table: 'project_time_entries',
          definition: 'Time logged against a specific project, phase, or task. Supports billing integration and cost allocation.',
          example: 'Entry: 4 hours on Project XYZ, Phase 2, Task "Development", billable at $150/hr.',
          related: ['Cost Allocation', 'Rate Card', 'Billable Hours']
        },
        {
          term: 'Cost Allocation',
          table: 'project_time_entries.cost_allocation',
          definition: 'Distribution of time costs across projects, departments, or cost centers. Supports split allocations.',
          example: 'Split: 60% Project A, 40% Project B for shared resource time.',
          related: ['Project Time Entry', 'Cost Center', 'GL Integration']
        },
        {
          term: 'Rate Card',
          table: 'project_rate_cards',
          definition: 'Hourly rates for billing or internal cost tracking. Can vary by role, project, or client.',
          example: 'Senior Developer rate: $150/hr external, $85/hr internal cost.',
          related: ['Project Time Entry', 'Billable Hours', 'Margin']
        },
        {
          term: 'Billable Hours',
          table: 'project_time_entries.is_billable',
          definition: 'Time that can be invoiced to clients. Distinguished from non-billable internal or administrative time.',
          example: 'Project has 120 billable hours and 20 non-billable (meetings, admin).',
          related: ['Rate Card', 'Utilization', 'Revenue']
        }
      ]
    },
    {
      domain: 'AI & Analytics',
      icon: Brain,
      color: 'violet',
      terms: [
        {
          term: 'AI Schedule Run',
          table: 'ai_schedule_runs',
          definition: 'Execution of AI-powered schedule optimization. Considers constraints, preferences, skills, and demand forecasts.',
          example: 'Run optimized 50 assignments across 10 shifts, 92% preference match, 0 violations.',
          related: ['AI Recommendation', 'Schedule Constraint', 'Demand Forecast']
        },
        {
          term: 'AI Schedule Recommendation',
          table: 'ai_schedule_recommendations',
          definition: 'AI-suggested assignment with confidence score and reasoning. Requires human approval before application.',
          example: 'Recommend: Assign Sarah to Night Shift (95% confidence, skill match, preference #1).',
          related: ['AI Schedule Run', 'Assignment', 'Human Override']
        },
        {
          term: 'Demand Forecast',
          table: 'shift_demand_forecasts',
          definition: 'Predicted staffing needs based on historical patterns, seasonality, and external factors.',
          example: 'Forecast: 12 staff needed Saturday (vs normal 8) due to holiday weekend.',
          related: ['AI Scheduler', 'Coverage Snapshot', 'Staffing Level']
        },
        {
          term: 'Wellness Indicator',
          table: 'employee_wellness_indicators',
          definition: 'AI-computed risk scores for fatigue, burnout, and disengagement based on time patterns.',
          example: 'High fatigue risk (score 78): 3 weeks of OT, limited breaks, short rest periods.',
          related: ['Bradford Factor', 'Overtime Pattern', 'Burnout Prediction']
        },
        {
          term: 'Shift Cost Projection',
          table: 'shift_cost_projections',
          definition: 'Estimated labor cost for scheduled shifts including base pay, differentials, and projected OT.',
          example: 'Week 3 projection: $45,000 base + $6,000 differentials + $3,000 OT = $54,000.',
          related: ['Shift Schedule', 'Labor Cost', 'Budget']
        },
        {
          term: 'Coverage Snapshot',
          table: 'shift_coverage_snapshots',
          definition: 'Point-in-time view of staffing vs requirements. Identifies gaps, overstaffing, and skill shortages.',
          example: 'Saturday PM: 2 staff short, 1 supervisor gap, 3 qualified employees available.',
          related: ['Demand Forecast', 'Open Shift', 'Staffing Gap']
        }
      ]
    }
  ];

  return (
    <Card id="ta-sec-1-2" data-manual-anchor="ta-sec-1-2" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.2</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>18 min read</span>
        </div>
        <CardTitle className="text-2xl">Core Concepts & Terminology</CardTitle>
        <CardDescription>Essential definitions across 8 domains with database table references</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={[
          'Define 50+ core T&A terms and their database table mappings',
          'Understand the shift hierarchy from templates to assignments',
          'Explain the verification chain for clock events (GPS + Face)',
          'Describe the timesheet flow from entries to payroll sync',
          'Identify key AI-powered analytics and predictions'
        ]} />

        {/* Domain Navigation */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Terminology Domains (8 Categories, 50+ Terms)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {termsByDomain.map((domain, i) => (
              <a 
                key={i} 
                href={`#domain-${i}`}
                className={`p-3 rounded-lg border bg-${domain.color}-500/5 border-${domain.color}-500/20 hover:bg-${domain.color}-500/10 transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <domain.icon className={`h-4 w-4 text-${domain.color}-600`} />
                  <span className="text-sm font-medium">{domain.domain}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{domain.terms.length} terms</div>
              </a>
            ))}
          </div>
        </div>

        {/* Terms by Domain */}
        {termsByDomain.map((domain, domainIdx) => (
          <div key={domainIdx} id={`domain-${domainIdx}`} className="scroll-mt-24">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 text-${domain.color}-700 dark:text-${domain.color}-400`}>
              <domain.icon className="h-5 w-5" />
              {domain.domain}
              <Badge variant="outline" className="ml-2 text-xs">{domain.terms.length} terms</Badge>
            </h3>
            <Accordion type="multiple" className="space-y-2">
              {domain.terms.map((item, i) => (
                <AccordionItem key={i} value={`${domainIdx}-term-${i}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="secondary" className="font-mono text-xs shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </Badge>
                      <span className="font-medium">{item.term}</span>
                      <Badge variant="outline" className="ml-auto mr-4 text-xs font-mono hidden md:inline-flex">
                        {item.table}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-3 pl-10">
                      <Badge variant="outline" className="text-xs font-mono md:hidden">{item.table}</Badge>
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
        ))}

        {/* Data Model Hierarchies */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Model Hierarchies
          </h3>
          <div className="p-6 bg-muted/30 border rounded-lg space-y-6">
            {/* Shift Hierarchy */}
            <div>
              <h4 className="font-medium mb-3 text-sm text-muted-foreground">Shift Management Hierarchy</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className="px-3 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg font-medium">
                  <div className="text-xs text-indigo-600 mb-1">attendance_policies</div>
                  Attendance Policy
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg font-medium">
                  <div className="text-xs text-blue-600 mb-1">shift_templates</div>
                  Shift Template
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg font-medium">
                  <div className="text-xs text-cyan-600 mb-1">work_schedules</div>
                  Work Schedule
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg font-medium">
                  <div className="text-xs text-teal-600 mb-1">employee_shift_assignments</div>
                  Shift Assignment
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg font-medium">
                  <div className="text-xs text-green-600 mb-1">profiles</div>
                  Employee
                </div>
              </div>
            </div>

            {/* Verification Chain */}
            <div>
              <h4 className="font-medium mb-3 text-sm text-muted-foreground">Time Verification Chain</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg font-medium">
                  <div className="text-xs text-amber-600 mb-1">timeclock_devices</div>
                  Clock Event
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg font-medium">
                  <div className="text-xs text-orange-600 mb-1">geofence_validations</div>
                  GPS Check
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg font-medium">
                  <div className="text-xs text-rose-600 mb-1">face_verification_logs</div>
                  Face Match
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg font-medium">
                  <div className="text-xs text-red-600 mb-1">time_clock_entries</div>
                  Punch Record
                </div>
              </div>
            </div>

            {/* Timesheet Flow */}
            <div>
              <h4 className="font-medium mb-3 text-sm text-muted-foreground">Timesheet to Payroll Flow</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg font-medium">
                  <div className="text-xs text-purple-600 mb-1">time_clock_entries</div>
                  Clock Entries
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-violet-500/10 border border-violet-500/30 rounded-lg font-medium">
                  <div className="text-xs text-violet-600 mb-1">timesheet_entries</div>
                  Aggregation
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg font-medium">
                  <div className="text-xs text-fuchsia-600 mb-1">timesheet_submissions</div>
                  Timesheet
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-pink-500/10 border border-pink-500/30 rounded-lg font-medium">
                  <div className="text-xs text-pink-600 mb-1">timesheet_approval_history</div>
                  Approval
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg font-medium">
                  <div className="text-xs text-emerald-600 mb-1">payroll_time_sync_logs</div>
                  Payroll Sync
                </div>
              </div>
            </div>

            {/* Compliance Flow */}
            <div>
              <h4 className="font-medium mb-3 text-sm text-muted-foreground">Compliance Enforcement Flow</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className="px-3 py-2 bg-sky-500/10 border border-sky-500/30 rounded-lg font-medium">
                  <div className="text-xs text-sky-600 mb-1">time_clock_entries</div>
                  Time Entry
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg font-medium">
                  <div className="text-xs text-blue-600 mb-1">cba_time_rules</div>
                  CBA Rule Check
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg font-medium">
                  <div className="text-xs text-amber-600 mb-1">cba_violations</div>
                  Violation Alert
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg font-medium">
                  <div className="text-xs text-green-600 mb-1">time_attendance_audit_log</div>
                  Resolution
                </div>
              </div>
            </div>
          </div>
        </div>

        <TipCallout title="Navigation Tip">
          Each term includes its backing database table as a <Badge variant="outline" className="text-xs font-mono mx-1">monospace badge</Badge>. 
          Use these references when reviewing field-level documentation in later chapters.
        </TipCallout>

        {/* Section Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Estimated reading time: 15-18 minutes</span>
          </div>
          <Badge variant="outline">Section 1.2 of 1.6</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
