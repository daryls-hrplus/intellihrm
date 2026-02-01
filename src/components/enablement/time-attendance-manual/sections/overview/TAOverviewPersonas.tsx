import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Target, AlertCircle, Star, User, UserCheck, Settings, FileCheck, Calculator, Shield, GraduationCap, ArrowRight } from 'lucide-react';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { TipCallout } from '@/components/enablement/manual/components/Callout';

export function TAOverviewPersonas() {
  const personas = [
    {
      id: 'employee',
      title: 'Employee (ESS)',
      icon: User,
      color: 'blue',
      description: 'Self-service access for personal time and attendance tasks',
      learningObjectives: [
        'Clock in/out using mobile, web, or device',
        'View and submit personal timesheets',
        'Request shift swaps and claim open shifts',
        'Track flex time and comp time balances'
      ],
      dayInLife: [
        { time: '08:00', action: 'Clock in via mobile app with GPS + face verification' },
        { time: '12:00', action: 'Clock out for lunch (auto-tracked if configured)' },
        { time: '13:00', action: 'Clock in after lunch break' },
        { time: '15:00', action: 'Request shift swap for next week' },
        { time: '17:00', action: 'Clock out, review daily hours on dashboard' },
        { time: 'Friday', action: 'Submit weekly timesheet for approval' }
      ],
      goals: [
        'Quick and easy clock-in/out from any device',
        'View personal schedule and upcoming shifts',
        'Submit timesheets and track hours worked',
        'Request shift swaps and view leave balances'
      ],
      painPoints: [
        'Forgot to clock in/out and need correction',
        'Need to swap shifts on short notice',
        'Unclear how overtime is calculated',
        'Unsure of remaining flex time balance'
      ],
      keyFeatures: [
        'Mobile clock-in with GPS and face verification',
        'My Schedule view with shift details',
        'Timesheet submission and history',
        'Shift swap and open shift requests',
        'Personal attendance dashboard'
      ]
    },
    {
      id: 'manager',
      title: 'Manager (MSS)',
      icon: UserCheck,
      color: 'green',
      description: 'Team oversight, approvals, and schedule management',
      learningObjectives: [
        'Approve team timesheets and regularization requests',
        'Monitor live attendance and coverage status',
        'Manage overtime pre-approvals and alerts',
        'Create and adjust team schedules',
        'Review team Bradford Factor scores'
      ],
      dayInLife: [
        { time: '08:15', action: 'Review live attendance dashboard - who\'s in/late' },
        { time: '09:00', action: 'Approve 3 pending regularization requests' },
        { time: '11:00', action: 'Receive OT alert: team member approaching 40 hours' },
        { time: '14:00', action: 'Approve shift swap between two team members' },
        { time: '16:00', action: 'Review and approve weekly timesheets (bulk approval)' },
        { time: 'Weekly', action: 'Review team attendance summary and exceptions' }
      ],
      goals: [
        'Ensure adequate shift coverage at all times',
        'Approve timesheets accurately and on time',
        'Monitor team attendance and exceptions',
        'Prevent unauthorized overtime'
      ],
      painPoints: [
        'Last-minute callouts disrupt coverage',
        'Too many approval requests in queue',
        'Difficulty tracking overtime trends',
        'Scheduling conflicts between employees'
      ],
      keyFeatures: [
        'Team attendance dashboard with real-time status',
        'Timesheet approval queue',
        'Shift swap and regularization approvals',
        'Overtime alerts and pre-approval requests',
        'Team schedule management'
      ]
    },
    {
      id: 'time-admin',
      title: 'Time Administrator',
      icon: Settings,
      color: 'purple',
      description: 'Full T&A configuration, policies, and device management',
      learningObjectives: [
        'Configure attendance policies and rounding rules',
        'Set up and manage timeclock devices',
        'Configure geofence locations and face verification',
        'Create shift templates and rotation patterns',
        'Process bulk exceptions and regularizations',
        'Run AI scheduler and review recommendations',
        'Configure overtime rate tiers and CBA rules',
        'Manage punch imports and legacy migrations'
      ],
      dayInLife: [
        { time: '08:00', action: 'Review overnight punch queue for sync failures' },
        { time: '09:00', action: 'Process batch of attendance exceptions' },
        { time: '10:00', action: 'Configure new geofence for branch opening next month' },
        { time: '11:00', action: 'Run AI scheduler for next week, review recommendations' },
        { time: '14:00', action: 'Update shift differential rates for new policy' },
        { time: '15:00', action: 'Process punch import from legacy system' },
        { time: '16:00', action: 'Review device health dashboard, schedule maintenance' }
      ],
      goals: [
        'Maintain accurate time policies and rules',
        'Ensure all devices are operational',
        'Resolve exceptions efficiently',
        'Support compliance requirements'
      ],
      painPoints: [
        'Complex policy configurations across locations',
        'Device integration and sync issues',
        'High volume of exceptions to process',
        'Keeping up with labor law changes'
      ],
      keyFeatures: [
        'Attendance policy configuration',
        'Time clock device management',
        'Geofence and face verification setup',
        'Exception dashboard and bulk resolution',
        'Shift template and schedule builder',
        'Audit trail and compliance reports'
      ]
    },
    {
      id: 'hr-ops',
      title: 'HR Operations',
      icon: FileCheck,
      color: 'amber',
      description: 'Daily attendance monitoring and exception handling',
      learningObjectives: [
        'Monitor live attendance across the organization',
        'Process regularization requests efficiently',
        'Identify and escalate chronic absenteeism',
        'Generate attendance reports for leadership',
        'Support payroll with clean data'
      ],
      dayInLife: [
        { time: '08:00', action: 'Check live attendance - identify no-shows' },
        { time: '09:00', action: 'Process regularization queue (15-20 requests)' },
        { time: '10:00', action: 'Review Bradford Factor alerts, escalate to managers' },
        { time: '12:00', action: 'Run attendance exception report' },
        { time: '14:00', action: 'Prepare weekly attendance summary for leadership' },
        { time: '16:00', action: 'Validate timesheet data before payroll cutoff' }
      ],
      goals: [
        'Accurate attendance records for all employees',
        'Timely resolution of regularization requests',
        'Proactive identification of attendance issues',
        'Support payroll with clean data'
      ],
      painPoints: [
        'Missing punches and incomplete records',
        'Backlog of regularization requests',
        'Difficulty identifying chronic absenteeism',
        'Data quality issues affecting payroll'
      ],
      keyFeatures: [
        'Live attendance dashboard',
        'Regularization request processing',
        'Attendance exception management',
        'Bradford Factor monitoring',
        'Attendance reports and exports'
      ]
    },
    {
      id: 'payroll-admin',
      title: 'Payroll Administrator',
      icon: Calculator,
      color: 'rose',
      description: 'Hours verification, overtime calculation, and payroll sync',
      learningObjectives: [
        'Verify hours data before payroll processing',
        'Configure overtime rate tiers',
        'Set up shift differential calculations',
        'Manage payroll sync and troubleshoot errors'
      ],
      dayInLife: [
        { time: 'Cutoff Day', action: 'Run timesheet status report - identify unapproved' },
        { time: '', action: 'Escalate missing approvals to managers' },
        { time: '', action: 'Review overtime hours by department' },
        { time: '', action: 'Verify shift differential calculations' },
        { time: '', action: 'Initiate payroll sync, monitor for errors' },
        { time: '', action: 'Reconcile synced hours with payroll system' }
      ],
      goals: [
        'Accurate hours data for payroll processing',
        'Correct overtime and differential calculations',
        'Timely timesheet approvals before cutoff',
        'Smooth integration with payroll system'
      ],
      painPoints: [
        'Late timesheet approvals delay payroll',
        'Complex overtime and differential rules',
        'Discrepancies between T&A and payroll',
        'Manual corrections after pay runs'
      ],
      keyFeatures: [
        'Timesheet status tracking',
        'Overtime calculation rules',
        'Shift differential configuration',
        'Payroll sync and validation',
        'Hours reconciliation reports'
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance Officer',
      icon: Shield,
      color: 'indigo',
      description: 'Labor law compliance, CBA monitoring, and audit readiness',
      learningObjectives: [
        'Configure CBA time rules and monitor violations',
        'Set up rest period and weekly hour limit tracking',
        'Generate compliance reports for audits',
        'Review and remediate compliance violations',
        'Maintain audit documentation'
      ],
      dayInLife: [
        { time: 'Daily', action: 'Review CBA violation alerts from previous day' },
        { time: '', action: 'Verify rest period compliance for overnight shifts' },
        { time: 'Weekly', action: 'Generate labor compliance report by jurisdiction' },
        { time: '', action: 'Review overtime patterns for wage-hour compliance' },
        { time: 'Monthly', action: 'Prepare compliance summary for leadership' },
        { time: 'Quarterly', action: 'Conduct internal audit of time records' }
      ],
      goals: [
        'Ensure adherence to labor regulations',
        'Monitor CBA rule compliance',
        'Prepare for audits with documentation',
        'Track and mitigate compliance risks'
      ],
      painPoints: [
        'Multiple jurisdictions with different rules',
        'CBA violations not detected early',
        'Insufficient audit documentation',
        'Manual compliance checking'
      ],
      keyFeatures: [
        'CBA time rule configuration',
        'Labor compliance dashboard',
        'Rest period and weekly limit tracking',
        'Compliance violation alerts',
        'Audit trail and documentation'
      ]
    }
  ];

  return (
    <Card id="ta-sec-1-4" data-manual-anchor="ta-sec-1-4" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.4</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>15 min read</span>
        </div>
        <CardTitle className="text-2xl">User Personas & Journeys</CardTitle>
        <CardDescription>Key user roles, learning objectives, and day-in-the-life workflows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Learning Objectives */}
        <LearningObjectives objectives={[
          'Identify the 6 key user personas in the T&A module',
          'Understand each persona\'s goals, pain points, and key features',
          'Describe the day-in-the-life journey for each role',
          'Map persona learning objectives to manual sections',
          'Use the role interaction matrix to understand access patterns'
        ]} />

        <p className="text-muted-foreground">
          The Time & Attendance module serves diverse user roles with distinct needs and workflows. 
          Each persona section includes learning objectives, a day-in-the-life journey, and feature access.
        </p>

        <div className="grid gap-6">
          {personas.map((persona) => (
            <div 
              key={persona.id}
              className={`p-6 border rounded-lg bg-${persona.color}-500/5 border-${persona.color}-500/20`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-${persona.color}-500/10`}>
                  <persona.icon className={`h-6 w-6 text-${persona.color}-500`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{persona.title}</h3>
                    <Badge variant="outline" className="text-xs">{persona.id.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{persona.description}</p>

                  {/* Learning Objectives for this Persona */}
                  <div className="mb-4 p-3 bg-background/80 rounded-lg">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Learning Objectives
                    </h4>
                    <div className="grid md:grid-cols-2 gap-1">
                      {persona.learningObjectives.map((obj, i) => (
                        <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <Badge variant="outline" className="text-[10px] shrink-0">{i + 1}</Badge>
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day in the Life */}
                  <div className="mb-4 p-3 bg-background/80 rounded-lg">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Day in the Life
                    </h4>
                    <div className="space-y-1">
                      {persona.dayInLife.map((step, i) => (
                        <div key={i} className="text-xs flex items-start gap-2">
                          <Badge variant="secondary" className="text-[10px] shrink-0 min-w-[60px] justify-center">
                            {step.time || '—'}
                          </Badge>
                          <span className="text-muted-foreground">{step.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Goals */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        Goals
                      </h4>
                      <ul className="space-y-1">
                        {persona.goals.map((goal, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pain Points */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Pain Points
                      </h4>
                      <ul className="space-y-1">
                        {persona.painPoints.map((pain, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{pain}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        Key Features
                      </h4>
                      <ul className="space-y-1">
                        {persona.keyFeatures.map((feature, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Role Interaction Matrix */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Role Interaction Matrix
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Action</th>
                  <th className="text-center p-2 font-medium">Employee</th>
                  <th className="text-center p-2 font-medium">Manager</th>
                  <th className="text-center p-2 font-medium">Time Admin</th>
                  <th className="text-center p-2 font-medium">HR Ops</th>
                  <th className="text-center p-2 font-medium">Payroll</th>
                  <th className="text-center p-2 font-medium">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { action: 'Clock In/Out', roles: ['●', '●', '○', '○', '○', '○'] },
                  { action: 'Submit Timesheet', roles: ['●', '○', '○', '○', '○', '○'] },
                  { action: 'Approve Timesheet', roles: ['○', '●', '○', '○', '●', '○'] },
                  { action: 'Request Regularization', roles: ['●', '○', '○', '○', '○', '○'] },
                  { action: 'Approve Regularization', roles: ['○', '●', '●', '●', '○', '○'] },
                  { action: 'Configure Policies', roles: ['○', '○', '●', '○', '○', '○'] },
                  { action: 'Manage Devices', roles: ['○', '○', '●', '○', '○', '○'] },
                  { action: 'Configure Geofence', roles: ['○', '○', '●', '○', '○', '○'] },
                  { action: 'Set Face Verification', roles: ['○', '○', '●', '○', '○', '○'] },
                  { action: 'Process Punch Import', roles: ['○', '○', '●', '○', '○', '○'] },
                  { action: 'Set Shift Schedules', roles: ['○', '●', '●', '○', '○', '○'] },
                  { action: 'Run AI Scheduler', roles: ['○', '○', '●', '○', '○', '○'] },
                  { action: 'Manage Open Shifts', roles: ['○', '●', '●', '○', '○', '○'] },
                  { action: 'View Analytics', roles: ['○', '●', '●', '●', '●', '●'] },
                  { action: 'Configure CBA Rules', roles: ['○', '○', '●', '○', '○', '●'] },
                  { action: 'Audit Trail Access', roles: ['○', '○', '●', '●', '●', '●'] },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="p-2 font-medium">{row.action}</td>
                    {row.roles.map((role, j) => (
                      <td key={j} className="p-2 text-center">
                        <span className={role === '●' ? 'text-green-500' : 'text-muted-foreground/30'}>
                          {role}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ● = Primary access | ○ = No access (Some roles may have view-only access not shown)
          </p>
        </div>

        <TipCallout title="Navigation Tip">
          Use the persona cards to identify which manual sections are most relevant to your role. 
          The learning objectives per persona map directly to specific chapters.
        </TipCallout>

        {/* Section Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Estimated reading time: 12-15 minutes</span>
          </div>
          <Badge variant="outline">Section 1.4 of 1.6</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
