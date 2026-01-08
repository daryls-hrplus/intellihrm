import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Clock, CheckCircle, ArrowRightLeft, Activity, Bell, Filter } from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';
import { ModuleIntegrationMap } from '@/components/enablement/shared/ModuleIntegrationMap';

const integrationTypes = [
  { module: 'Employee Directory', dataFlow: 'Profile changes, assignments', direction: 'Bidirectional', status: 'Active' },
  { module: 'Leave Management', dataFlow: 'Leave requests, balances', direction: 'Outbound', status: 'Active' },
  { module: 'Payroll', dataFlow: 'Salary changes, deductions', direction: 'Outbound', status: 'Active' },
  { module: 'Performance', dataFlow: 'Appraisal results, goals', direction: 'Inbound', status: 'Active' },
  { module: 'Recruitment', dataFlow: 'New hire data, onboarding', direction: 'Inbound', status: 'Active' },
  { module: 'Learning & Development', dataFlow: 'Training completions, certifications', direction: 'Inbound', status: 'Active' }
];

const activityTypes = [
  { type: 'Workflow Completed', description: 'Multi-step approvals that have finished', icon: CheckCircle },
  { type: 'Pending Approval', description: 'Items waiting for approver action', icon: Clock },
  { type: 'Data Sync', description: 'Cross-module data updates', icon: ArrowRightLeft },
  { type: 'System Event', description: 'Automated triggers and scheduled jobs', icon: Activity }
];

const configurationSteps = [
  {
    title: 'Navigate to Integration Hub',
    description: 'Access HR Hub → Integration Hub from the main menu.',
    expectedResult: 'Integration Hub dashboard loads with activity feed'
  },
  {
    title: 'Review Activity Feed',
    description: 'The main panel shows recent cross-module activities. Each entry includes timestamp, module, action type, and affected entities.',
    expectedResult: 'Visibility into all module interactions'
  },
  {
    title: 'Filter by Module',
    description: 'Use the module filter dropdown to focus on specific integrations (e.g., only Payroll-related activities).',
    expectedResult: 'Filtered view of relevant activities'
  },
  {
    title: 'Filter by Activity Type',
    description: 'Select activity types to focus on workflows, syncs, or system events.',
    expectedResult: 'Targeted view based on action category'
  },
  {
    title: 'View Activity Details',
    description: 'Click any activity row to expand and see full details including affected records, timestamps, and related workflows.',
    expectedResult: 'Complete audit trail for any activity'
  },
  {
    title: 'Monitor Pending Items',
    description: 'The "Pending" tab shows all items awaiting action across modules. Use this to identify bottlenecks.',
    expectedResult: 'Actionable view of blocked processes'
  }
];

const activityFields = [
  { name: 'activity_type', type: 'Select', required: true, description: 'Type of integration activity (Workflow, Sync, Event)' },
  { name: 'source_module', type: 'Text', required: true, description: 'Module that initiated the activity' },
  { name: 'target_module', type: 'Text', required: false, description: 'Module receiving data (if applicable)' },
  { name: 'timestamp', type: 'DateTime', required: true, description: 'When the activity occurred' },
  { name: 'status', type: 'Select', required: true, description: 'Completed, Pending, Failed' },
  { name: 'affected_records', type: 'Number', required: false, description: 'Count of records involved' },
  { name: 'initiated_by', type: 'UUID', required: false, description: 'User who triggered the activity' }
];

export function IntegrationHubSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-3-7">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 3.7</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          6 min read
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
              <Link2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <CardTitle>Integration Hub</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Cross-module activity monitoring and approval tracking
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground">
            The Integration Hub provides a unified view of all cross-module activities within HR Hub. 
            Monitor data flows between modules, track pending approvals, and audit system events 
            from a single dashboard.
          </p>

          <InfoCallout title="Real-Time Monitoring">
            The Integration Hub updates in real-time, showing you exactly what's happening across 
            all HR modules. This is essential for identifying bottlenecks and ensuring data 
            consistency across the system.
          </InfoCallout>

          {/* Module Integrations */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Module Integrations
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Module</th>
                    <th className="border p-3 text-left font-medium">Data Flow</th>
                    <th className="border p-3 text-left font-medium">Direction</th>
                    <th className="border p-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {integrationTypes.map((integration, idx) => (
                    <tr key={idx}>
                      <td className="border p-3 font-medium">{integration.module}</td>
                      <td className="border p-3 text-muted-foreground">{integration.dataFlow}</td>
                      <td className="border p-3">
                        <Badge variant="outline">{integration.direction}</Badge>
                      </td>
                      <td className="border p-3">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                          {integration.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Types */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Types
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {activityTypes.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                  <activity.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium">{activity.type}</h5>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module Integration Map */}
          <ModuleIntegrationMap
            currentModule="hr_hub"
            integrations={[
              { 
                module: 'payroll', 
                points: [
                  { sourceSection: 'HR Hub', targetSection: 'Payroll', type: 'data_flow', label: 'Salary changes, deductions' }
                ] 
              },
              { 
                module: 'learning', 
                points: [
                  { sourceSection: 'HR Hub', targetSection: 'Learning', type: 'bidirectional', label: 'Training records' }
                ] 
              },
              { 
                module: 'recruitment', 
                points: [
                  { sourceSection: 'Recruitment', targetSection: 'HR Hub', type: 'data_flow', label: 'New hire data' }
                ] 
              },
              { 
                module: 'appraisals', 
                points: [
                  { sourceSection: 'Appraisals', targetSection: 'HR Hub', type: 'data_flow', label: 'Performance results' }
                ] 
              }
            ]}
            title="HR Hub Integration Points"
          />

          <WarningCallout title="Failed Activities">
            Failed activities are highlighted in red and require immediate attention. A failed 
            integration can cause data inconsistencies between modules. Check the activity 
            details for error messages and retry or escalate as needed.
          </WarningCallout>

          {/* Configuration Steps */}
          <StepByStep
            title="Using the Integration Hub"
            steps={configurationSteps}
          />

          {/* Field Reference */}
          <FieldReferenceTable
            title="Activity Fields"
            fields={activityFields}
          />

          <TipCallout title="Dashboard Filters">
            Save time by using filter combinations. For example, filter by "Payroll" module and 
            "Pending" status to see all payroll-related items waiting for action. Filters can 
            be combined to create focused views.
          </TipCallout>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Best Practices</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Review the Integration Hub daily to catch failed activities early</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Monitor pending items to identify approval bottlenecks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Use module filters to delegate monitoring to module owners</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Investigate any data sync failures before they affect payroll</span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Set up notifications for critical module integrations</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
