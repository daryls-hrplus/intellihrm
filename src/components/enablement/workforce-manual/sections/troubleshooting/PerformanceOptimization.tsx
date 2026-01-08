import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gauge, Database, Clock, AlertTriangle, 
  CheckCircle, Lightbulb, Zap, HardDrive
} from 'lucide-react';
import { TroubleshootingSection } from '@/components/enablement/manual/components/TroubleshootingSection';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';

const performanceIssues = [
  {
    issue: 'Organization chart loading slowly (>5 seconds)',
    cause: 'Large hierarchy (>5000 nodes) loading all at once, or excessive custom fields on employee cards.',
    solution: 'Enable lazy loading in Settings → Performance → Org Chart. Limit visible levels to 3 initially. Reduce custom fields shown on org chart cards to essential data only.'
  },
  {
    issue: 'Bulk employee import timing out',
    cause: 'Import file too large (>10,000 rows), or complex validation rules running on each row.',
    solution: 'Split import into batches of 5,000 rows maximum. Use the Bulk Import Scheduler for off-peak processing. Temporarily disable non-critical validation rules during import.'
  },
  {
    issue: 'Reports taking too long to generate (>30 seconds)',
    cause: 'Report spanning too much data (all employees, all history), or too many calculated fields.',
    solution: 'Add date range filters to limit scope. Pre-calculate metrics using scheduled snapshots. Use summary reports instead of detail reports for large datasets.'
  },
  {
    issue: 'Employee search returning slowly',
    cause: 'Search index outdated, or search includes too many fields including large text fields.',
    solution: 'Run index rebuild from Settings → System → Search Index. Configure search to exclude notes and large text fields. Use filtered search with department/status pre-filters.'
  },
  {
    issue: 'Dashboard widgets loading inconsistently',
    cause: 'Too many widgets querying live data, or widgets using complex calculations.',
    solution: 'Reduce active widgets to 6-8 maximum. Configure widgets to use cached data (refreshed hourly). Move complex analytics to dedicated reports instead of dashboards.'
  },
  {
    issue: 'Workflow list page slow to render',
    cause: 'Displaying too many pending workflows, or loading full workflow history for each item.',
    solution: 'Paginate workflow list to 25 items per page. Add status and date filters to reduce result set. Configure to show summary view, not expanded details.'
  }
];

const healthMetrics = [
  { metric: 'Page Load Time', target: '<2 sec', warning: '2-5 sec', critical: '>5 sec' },
  { metric: 'Search Response', target: '<1 sec', warning: '1-3 sec', critical: '>3 sec' },
  { metric: 'Report Generation', target: '<10 sec', warning: '10-30 sec', critical: '>30 sec' },
  { metric: 'Bulk Import Rate', target: '>500/min', warning: '200-500/min', critical: '<200/min' },
  { metric: 'API Response', target: '<500ms', warning: '500ms-1sec', critical: '>1 sec' },
  { metric: 'Database Query', target: '<200ms', warning: '200-500ms', critical: '>500ms' }
];

const maintenanceSchedule = [
  { task: 'Search Index Rebuild', frequency: 'Weekly (Sunday)', owner: 'System', impact: 'None (background)' },
  { task: 'Report Cache Refresh', frequency: 'Daily (2 AM)', owner: 'System', impact: 'None (background)' },
  { task: 'Database Statistics Update', frequency: 'Weekly (Saturday)', owner: 'System', impact: 'Minimal' },
  { task: 'Audit Log Archival', frequency: 'Monthly (1st)', owner: 'Admin', impact: 'None (background)' },
  { task: 'Storage Cleanup', frequency: 'Quarterly', owner: 'Admin', impact: '5 min read-only' },
  { task: 'Performance Review', frequency: 'Monthly', owner: 'Admin', impact: 'None' }
];

export function PerformanceOptimization() {
  return (
    <div className="space-y-6" data-manual-anchor="wf-troubleshooting-performance">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Gauge className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>10.7 Performance Optimization</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Managing large organizations, bulk operations, and system performance tuning
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">Admin</Badge>
            <Badge variant="outline">Est. 12 min</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <TroubleshootingSection 
            items={performanceIssues}
            title="Performance Troubleshooting Guide"
          />

          {/* Health Metrics Table */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Gauge className="h-5 w-5 text-blue-500" />
              System Health Metrics Reference
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Metric</th>
                    <th className="text-left p-3 font-medium">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" /> Target
                      </span>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" /> Warning
                      </span>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" /> Critical
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {healthMetrics.map((metric) => (
                    <tr key={metric.metric}>
                      <td className="p-3 font-medium">{metric.metric}</td>
                      <td className="p-3">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                          {metric.target}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                          {metric.warning}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                          {metric.critical}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optimization Strategies */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-amber-500" />
              Optimization Strategies by Category
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <FeatureCard
                variant="primary"
                icon={Database}
                title="Data Management"
              >
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Archive terminated employees after 2 years</li>
                  <li>• Purge temporary/test data quarterly</li>
                  <li>• Limit custom fields to essential data</li>
                  <li>• Use lookup tables vs. free text</li>
                </ul>
              </FeatureCard>
              <FeatureCard
                variant="success"
                icon={Clock}
                title="Bulk Operations"
              >
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Schedule imports during off-peak hours</li>
                  <li>• Batch updates in groups of 1,000</li>
                  <li>• Use async processing for large jobs</li>
                  <li>• Monitor job queue for bottlenecks</li>
                </ul>
              </FeatureCard>
              <FeatureCard
                variant="info"
                icon={HardDrive}
                title="Large Organizations"
              >
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Enable org chart lazy loading</li>
                  <li>• Partition data by legal entity</li>
                  <li>• Use role-based data scoping</li>
                  <li>• Implement hierarchical caching</li>
                </ul>
              </FeatureCard>
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-purple-500" />
              Recommended Maintenance Schedule
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Task</th>
                    <th className="text-left p-3 font-medium">Frequency</th>
                    <th className="text-left p-3 font-medium">Owner</th>
                    <th className="text-left p-3 font-medium">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {maintenanceSchedule.map((item) => (
                    <tr key={item.task}>
                      <td className="p-3 font-medium">{item.task}</td>
                      <td className="p-3 text-muted-foreground">{item.frequency}</td>
                      <td className="p-3 text-muted-foreground">{item.owner}</td>
                      <td className="p-3 text-muted-foreground">{item.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Large Org Thresholds */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <h4 className="font-semibold mb-4">Large Organization Thresholds</h4>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">1,000+</div>
                <p className="text-xs text-muted-foreground">Employees: Enable pagination</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">5,000+</div>
                <p className="text-xs text-muted-foreground">Employees: Lazy load org chart</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">10,000+</div>
                <p className="text-xs text-muted-foreground">Employees: Partition by entity</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">50,000+</div>
                <p className="text-xs text-muted-foreground">Employees: Dedicated infrastructure</p>
              </div>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Enable the Performance Monitor dashboard (Settings → System → 
              Performance) to track real-time metrics. Set up alerts for when metrics exceed warning 
              thresholds so you can address issues before they impact users.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            caption="Figure 10.7: Performance Monitor Dashboard showing system health metrics and trend analysis"
          />

        </CardContent>
      </Card>
    </div>
  );
}
