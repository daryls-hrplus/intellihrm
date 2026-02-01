import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Layers, ArrowRight, ArrowDown, Workflow, Plug, Database, Brain, Shield, Timer, Calendar, MapPin, FileText, Users, TrendingUp, Settings } from 'lucide-react';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { InfoCallout, IntegrationCallout } from '@/components/enablement/manual/components/Callout';

export function TAOverviewArchitecture() {
  const domainTableCounts = [
    { domain: 'Clock-In & Time Capture', tables: 8, primary: 'time_clock_entries', icon: Timer, color: 'indigo' },
    { domain: 'Shift Management', tables: 16, primary: 'shifts', icon: Calendar, color: 'blue' },
    { domain: 'Attendance Policies', tables: 7, primary: 'attendance_policies', icon: Shield, color: 'green' },
    { domain: 'Geofencing', tables: 5, primary: 'geofence_locations', icon: MapPin, color: 'teal' },
    { domain: 'Face Verification', tables: 3, primary: 'employee_face_enrollments', icon: Users, color: 'cyan' },
    { domain: 'Overtime & Requests', tables: 4, primary: 'overtime_requests', icon: TrendingUp, color: 'amber' },
    { domain: 'CBA & Compliance', tables: 12, primary: 'cba_time_rules', icon: Shield, color: 'rose' },
    { domain: 'Timesheets', tables: 8, primary: 'timesheet_submissions', icon: FileText, color: 'purple' },
    { domain: 'Project Time', tables: 3, primary: 'project_time_entries', icon: Layers, color: 'violet' },
    { domain: 'AI & Analytics', tables: 6, primary: 'ai_schedule_runs', icon: Brain, color: 'fuchsia' },
  ];

  const integrationMatrix = [
    {
      module: 'Workforce Module',
      direction: 'Inbound',
      color: 'blue',
      icon: Users,
      dataFlows: [
        { flow: 'Employee records and active status', table: 'profiles' },
        { flow: 'Position assignments and departments', table: 'positions' },
        { flow: 'Manager relationships for approvals', table: 'reporting_relationships' },
        { flow: 'Work location and cost center mapping', table: 'work_locations' },
        { flow: 'Employee eligibility and certifications', table: 'employee_certifications' }
      ]
    },
    {
      module: 'Payroll Module',
      direction: 'Outbound',
      color: 'green',
      icon: TrendingUp,
      dataFlows: [
        { flow: 'Regular hours and overtime hours', table: 'timesheet_submissions' },
        { flow: 'Shift differentials and premiums', table: 'shift_differentials' },
        { flow: 'Project time allocations', table: 'project_time_entries' },
        { flow: 'Approved timesheet data', table: 'payroll_time_sync_logs' },
        { flow: 'Comp time conversions', table: 'comp_time_used' }
      ]
    },
    {
      module: 'Leave Module',
      direction: 'Bidirectional',
      color: 'purple',
      icon: Calendar,
      dataFlows: [
        { flow: 'Approved leave reduces expected hours', table: 'leave_requests' },
        { flow: 'Absence data feeds Bradford Factor', table: 'employee_bradford_scores' },
        { flow: 'Comp time conversions to leave balance', table: 'comp_time_balances' },
        { flow: 'Leave requests affect schedule coverage', table: 'shift_coverage_snapshots' },
        { flow: 'Sick leave triggers wellness alerts', table: 'employee_wellness_indicators' }
      ]
    },
    {
      module: 'Analytics Module',
      direction: 'Outbound',
      color: 'orange',
      icon: TrendingUp,
      dataFlows: [
        { flow: 'Attendance metrics and trends', table: 'attendance_summary' },
        { flow: 'Overtime patterns and costs', table: 'overtime_rate_tiers' },
        { flow: 'Absenteeism rates by department', table: 'employee_bradford_scores' },
        { flow: 'Schedule coverage and utilization', table: 'shift_coverage_snapshots' },
        { flow: 'Labor cost projections', table: 'shift_cost_projections' }
      ]
    }
  ];

  return (
    <Card id="ta-sec-1-3" data-manual-anchor="ta-sec-1-3" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.3</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>12 min read</span>
        </div>
        <CardTitle className="text-2xl">System Architecture</CardTitle>
        <CardDescription>Technical architecture, 87 database tables across 10 domains, and integration points</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={[
          'Understand the 5-layer T&A architecture from clock-in to integration',
          'Identify the 10 functional domains and their primary database tables',
          'Explain data flows between T&A and other modules (Workforce, Payroll, Leave)',
          'Describe security controls and audit trail coverage',
          'Recognize AI components and their roles in scheduling and wellness'
        ]} />

        {/* Database Domain Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Database Domains (10 Domains, 87 Tables)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {domainTableCounts.map((domain, i) => (
              <div key={i} className={`p-3 border rounded-lg bg-${domain.color}-500/5 border-${domain.color}-500/20`}>
                <domain.icon className={`h-5 w-5 text-${domain.color}-600 mb-2`} />
                <div className="text-sm font-medium">{domain.domain}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{domain.tables} tables</Badge>
                </div>
                <Badge variant="outline" className="text-xs font-mono mt-2">{domain.primary}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Database Coverage</span>
            <div className="flex items-center gap-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">87 Tables</Badge>
              <Badge variant="outline">10 Domains</Badge>
            </div>
          </div>
        </div>

        {/* Architecture Layers */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Architecture Layers
          </h3>
          <div className="space-y-4">
            {/* Clock-In Layer */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30">
                  Layer 1
                </Badge>
                <span className="font-medium">Clock-In Layer</span>
                <Badge variant="outline" className="ml-auto text-xs font-mono">timeclock_devices, time_clock_entries</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {['Biometric Devices', 'Face Recognition', 'Mobile GPS App', 'Web Clock Portal', 'Card Readers', 'Punch Import'].map((item, i) => (
                  <div key={i} className="px-3 py-2 bg-background/80 rounded text-sm text-center border">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* Processing Layer */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border-blue-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                  Layer 2
                </Badge>
                <span className="font-medium">Processing Layer</span>
                <Badge variant="outline" className="ml-auto text-xs font-mono">attendance_policies, shift_rounding_rules</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {['Punch Validation', 'Time Rounding', 'Geofence Check', 'Face Matching', 'Break Calculation'].map((item, i) => (
                  <div key={i} className="px-3 py-2 bg-background/80 rounded text-sm text-center border">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* Data Layer */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border-green-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                  Layer 3
                </Badge>
                <span className="font-medium">Data Layer</span>
                <Badge variant="outline" className="ml-auto text-xs font-mono">shifts, timesheet_submissions</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {['Clock Entries', 'Shifts & Schedules', 'Timesheets', 'Exceptions', 'Audit Trail'].map((item, i) => (
                  <div key={i} className="px-3 py-2 bg-background/80 rounded text-sm text-center border">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* Intelligence Layer */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30">
                  Layer 4
                </Badge>
                <span className="font-medium">Intelligence Layer</span>
                <Badge variant="outline" className="ml-auto text-xs font-mono">ai_schedule_runs, employee_wellness_indicators</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {['AI Scheduler', 'Wellness AI', 'Bradford Engine', 'Demand Forecast', 'OT Prediction'].map((item, i) => (
                  <div key={i} className="px-3 py-2 bg-background/80 rounded text-sm text-center border">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* Integration Layer */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30">
                  Layer 5
                </Badge>
                <span className="font-medium">Integration Layer</span>
                <Badge variant="outline" className="ml-auto text-xs font-mono">payroll_time_sync_logs</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {['Payroll Sync', 'Workforce Sync', 'Leave Integration', 'Reporting API', 'External Systems'].map((item, i) => (
                  <div key={i} className="px-3 py-2 bg-background/80 rounded text-sm text-center border">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Module Integration Points */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plug className="h-5 w-5 text-primary" />
            Module Integration Matrix
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {integrationMatrix.map((integration, i) => (
              <div key={i} className={`p-4 border rounded-lg bg-${integration.color}-500/5 border-${integration.color}-500/20`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <integration.icon className={`h-5 w-5 text-${integration.color}-600`} />
                    <h4 className="font-medium">{integration.module}</h4>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {integration.direction}
                  </Badge>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {integration.dataFlows.map((flow, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 mt-1.5 text-primary shrink-0" />
                      <div className="flex-1">
                        <span>{flow.flow}</span>
                        <Badge variant="outline" className="ml-2 text-xs font-mono">{flow.table}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <IntegrationCallout title="Cross-Module Dependencies">
          Time & Attendance requires active Workforce data (employees, positions, departments) before clock-in can function. 
          Ensure Workforce module is configured first during implementation.
        </IntegrationCallout>

        {/* Data Flow Diagram */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            Core Data Flow
          </h3>
          <div className="p-6 bg-muted/30 border rounded-lg overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {[
                { label: 'Clock-In\nEvent', table: 'timeclock_devices', color: 'indigo' },
                { label: 'Validation\n(GPS + Face)', table: 'geofence_validations', color: 'blue' },
                { label: 'Rounding\nRules', table: 'shift_rounding_rules', color: 'cyan' },
                { label: 'Clock\nEntry', table: 'time_clock_entries', color: 'green' },
                { label: 'Timesheet\nAggregation', table: 'timesheet_entries', color: 'amber' },
                { label: 'Manager\nApproval', table: 'timesheet_approval_history', color: 'orange' },
                { label: 'Payroll\nSync', table: 'payroll_time_sync_logs', color: 'rose' }
              ].map((step, i, arr) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-28 h-20 flex flex-col items-center justify-center bg-${step.color}-500/10 border border-${step.color}-500/30 rounded-lg text-xs text-center font-medium p-2`}>
                      <span className="whitespace-pre-line">{step.label}</span>
                      <Badge variant="outline" className="text-[10px] font-mono mt-1">{step.table}</Badge>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Audit */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Security Controls
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { control: 'Role-based access control (RBAC) for all T&A functions', scope: 'All entities' },
                { control: 'Geofence and face verification for clock-in fraud prevention', scope: 'Clock entries' },
                { control: 'Manager approval workflows for sensitive changes', scope: 'Timesheets, exceptions' },
                { control: 'Audit trail on all punch modifications and regularizations', scope: 'All changes' },
                { control: 'Data encryption at rest (AES-256) and in transit (TLS 1.3)', scope: 'All data' },
                { control: 'IP-based restrictions for web clock access', scope: 'Clock entries' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Shield className="h-3 w-3 mt-1 text-green-500 shrink-0" />
                  <div>
                    <span>{item.control}</span>
                    <Badge variant="outline" className="ml-2 text-xs">{item.scope}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Audit Trail Coverage
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { event: 'All clock-in/out events with method and location', table: 'time_clock_entries' },
                { event: 'Timesheet modifications and approvals', table: 'timesheet_approval_history' },
                { event: 'Regularization requests and resolutions', table: 'attendance_regularization_requests' },
                { event: 'Schedule changes and shift swaps', table: 'shift_swap_requests' },
                { event: 'Policy and configuration changes', table: 'time_attendance_audit_log' },
                { event: 'Face enrollment and verification attempts', table: 'face_verification_logs' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Database className="h-3 w-3 mt-1 text-blue-500 shrink-0" />
                  <div>
                    <span>{item.event}</span>
                    <Badge variant="outline" className="ml-2 text-xs font-mono">{item.table}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Components */}
        <div className="p-4 border rounded-lg bg-purple-500/5 border-purple-500/20">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            AI Components in Time & Attendance
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: 'AI Scheduler',
                table: 'ai_schedule_runs',
                description: 'Constraint-based schedule optimization with skill matching, preference handling, and fatigue management.'
              },
              {
                name: 'Wellness AI',
                table: 'employee_wellness_indicators',
                description: 'Fatigue and burnout prediction based on overtime patterns, shift frequency, and break compliance.'
              },
              {
                name: 'Demand Forecast',
                table: 'shift_demand_forecasts',
                description: 'Shift demand prediction using historical patterns, seasonality, and external factors.'
              }
            ].map((ai, i) => (
              <div key={i} className="p-3 bg-background/80 rounded-lg">
                <div className="font-medium text-sm mb-1">{ai.name}</div>
                <Badge variant="outline" className="text-xs font-mono mb-2">{ai.table}</Badge>
                <p className="text-xs text-muted-foreground">{ai.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Estimated reading time: 10-12 minutes</span>
          </div>
          <Badge variant="outline">Section 1.3 of 1.6</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
