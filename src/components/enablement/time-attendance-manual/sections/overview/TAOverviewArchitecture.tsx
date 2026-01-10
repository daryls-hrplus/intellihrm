import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Layers, ArrowRight, ArrowDown, Workflow, Plug, Database, Brain, Shield } from 'lucide-react';

export function TAOverviewArchitecture() {
  return (
    <Card id="ta-sec-1-3" data-manual-anchor="ta-sec-1-3" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.3</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl">System Architecture</CardTitle>
        <CardDescription>Technical architecture, integration points, and data flows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
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
            Module Integration Points
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                module: 'Workforce Module',
                direction: 'Inbound',
                color: 'blue',
                dataFlows: [
                  'Employee records and active status',
                  'Position assignments and departments',
                  'Manager relationships for approvals',
                  'Work location and cost center mapping'
                ]
              },
              {
                module: 'Payroll Module',
                direction: 'Outbound',
                color: 'green',
                dataFlows: [
                  'Regular hours and overtime hours',
                  'Shift differentials and premiums',
                  'Project time allocations',
                  'Approved timesheet data'
                ]
              },
              {
                module: 'Leave Module',
                direction: 'Bidirectional',
                color: 'purple',
                dataFlows: [
                  'Approved leave reduces expected hours',
                  'Absence data feeds Bradford Factor',
                  'Comp time conversions to leave balance',
                  'Leave requests affect schedule coverage'
                ]
              },
              {
                module: 'Analytics Module',
                direction: 'Outbound',
                color: 'orange',
                dataFlows: [
                  'Attendance metrics and trends',
                  'Overtime patterns and costs',
                  'Absenteeism rates by department',
                  'Schedule coverage and utilization'
                ]
              }
            ].map((integration, i) => (
              <div key={i} className={`p-4 border rounded-lg bg-${integration.color}-500/5 border-${integration.color}-500/20`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{integration.module}</h4>
                  <Badge variant="outline" className="text-xs">
                    {integration.direction}
                  </Badge>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {integration.dataFlows.map((flow, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 mt-1.5 text-primary shrink-0" />
                      <span>{flow}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            Core Data Flow
          </h3>
          <div className="p-6 bg-muted/30 border rounded-lg overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs text-center font-medium">
                  Clock-In<br />Event
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 flex items-center justify-center bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-center font-medium">
                  Validation<br />(GPS + Face)
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-center font-medium">
                  Rounding<br />Rules
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 flex items-center justify-center bg-green-500/10 border border-green-500/30 rounded-lg text-xs text-center font-medium">
                  Clock<br />Entry
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 flex items-center justify-center bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-center font-medium">
                  Timesheet<br />Aggregation
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 flex items-center justify-center bg-orange-500/10 border border-orange-500/30 rounded-lg text-xs text-center font-medium">
                  Manager<br />Approval
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 flex items-center justify-center bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-center font-medium">
                  Payroll<br />Sync
                </div>
              </div>
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
                'Role-based access control (RBAC) for all T&A functions',
                'Geofence and face verification for clock-in fraud prevention',
                'Manager approval workflows for sensitive changes',
                'Audit trail on all punch modifications and regularizations',
                'Data encryption at rest and in transit'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Shield className="h-3 w-3 mt-1 text-green-500 shrink-0" />
                  <span>{item}</span>
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
                'All clock-in/out events with method and location',
                'Timesheet modifications and approvals',
                'Regularization requests and resolutions',
                'Schedule changes and shift swaps',
                'Policy and configuration changes'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Database className="h-3 w-3 mt-1 text-blue-500 shrink-0" />
                  <span>{item}</span>
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
                description: 'Constraint-based schedule optimization with skill matching, preference handling, and fatigue management.'
              },
              {
                name: 'Wellness AI',
                description: 'Fatigue and burnout prediction based on overtime patterns, shift frequency, and break compliance.'
              },
              {
                name: 'Demand Forecast',
                description: 'Shift demand prediction using historical patterns, seasonality, and external factors.'
              }
            ].map((ai, i) => (
              <div key={i} className="p-3 bg-background/80 rounded-lg">
                <div className="font-medium text-sm mb-1">{ai.name}</div>
                <p className="text-xs text-muted-foreground">{ai.description}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
