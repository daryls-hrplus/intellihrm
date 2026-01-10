import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Target, AlertCircle, Star, User, UserCheck, Settings, FileCheck, Calculator, Shield } from 'lucide-react';

export function TAOverviewPersonas() {
  const personas = [
    {
      id: 'employee',
      title: 'Employee (ESS)',
      icon: User,
      color: 'blue',
      description: 'Self-service access for personal time and attendance tasks',
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
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">User Personas & Journeys</CardTitle>
        <CardDescription>Key user roles and their Time & Attendance workflows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          The Time & Attendance module serves diverse user roles with distinct needs and workflows. 
          Understanding these personas helps ensure the right features are accessible to the right users.
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
                  { action: 'Set Shift Schedules', roles: ['○', '●', '●', '○', '○', '○'] },
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
      </CardContent>
    </Card>
  );
}
