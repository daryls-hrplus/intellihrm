import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gauge, Clock, Database, Zap, Archive, CheckCircle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { TroubleshootingSection, TroubleshootingItem } from '@/components/enablement/manual/components/TroubleshootingSection';

const performanceIssues: TroubleshootingItem[] = [
  {
    issue: "Dashboard loading slowly or timing out",
    cause: "Excessive data volume, complex widget calculations, or too many active filters causing heavy database queries.",
    solution: "Reduce the date range for dashboard data. Limit dashboard to 5-7 widgets maximum. Use scheduled reports instead of real-time for large datasets. Contact IT to review query performance."
  },
  {
    issue: "Knowledge Base search returning slowly",
    cause: "Large article corpus without proper indexing, or search queries are too broad.",
    solution: "Encourage users to use specific search terms. Archive outdated articles. If persistent, request a search index rebuild from IT."
  },
  {
    issue: "File uploads failing or timing out",
    cause: "Files exceeding size limits, unstable network connections, or storage quota exceeded.",
    solution: "Check file size limits in Settings → Storage. For large files, use the chunked upload option if available. Verify storage quota and archive old documents if needed."
  },
  {
    issue: "Workflow approvals processing slowly",
    cause: "High volume of concurrent approvals, complex workflow conditions, or database contention during peak hours.",
    solution: "Schedule batch approvals during off-peak hours. Simplify complex workflow conditions. Review workflow design for optimization opportunities."
  },
  {
    issue: "Reports taking too long to generate",
    cause: "Reports spanning large date ranges, including too many data points, or running during peak usage times.",
    solution: "Narrow the date range. Use filters to limit data scope. Schedule reports for overnight generation. Consider breaking large reports into smaller, focused reports."
  },
  {
    issue: "Real-time notifications delayed",
    cause: "Notification queue backlog, email service throttling, or recipient's email server applying greylisting.",
    solution: "Check Notification Logs for delivery status. For urgent communications, use in-app notifications instead of email. Review notification volume—consider digest options."
  }
];

const OPTIMIZATION_STRATEGIES = [
  {
    category: "Data Management",
    icon: Database,
    items: [
      "Archive tickets older than 24 months",
      "Remove draft articles that won't be published",
      "Consolidate duplicate knowledge base categories",
      "Clean up unused SOP versions",
      "Remove test data from production"
    ]
  },
  {
    category: "Report Optimization",
    icon: Clock,
    items: [
      "Use scheduled reports instead of on-demand for large datasets",
      "Limit dashboard date ranges to 90 days",
      "Create role-specific dashboards with relevant widgets only",
      "Use summary views instead of detailed breakdowns where possible",
      "Archive completed scheduled report configurations"
    ]
  },
  {
    category: "Workflow Efficiency",
    icon: Zap,
    items: [
      "Simplify approval chains (max 5 steps recommended)",
      "Use parallel approvals where order doesn't matter",
      "Configure appropriate escalation timeouts",
      "Review and deactivate unused workflow templates",
      "Use delegation rules to prevent approval bottlenecks"
    ]
  },
  {
    category: "Storage Management",
    icon: Archive,
    items: [
      "Compress images before uploading to articles",
      "Remove duplicate file attachments",
      "Archive inactive document versions",
      "Set up automatic cleanup policies for temporary files",
      "Use document linking instead of duplicating across articles"
    ]
  }
];

const HEALTH_METRICS = [
  { metric: "Average Page Load Time", target: "< 3 seconds", warning: "3-5 seconds", critical: "> 5 seconds" },
  { metric: "Report Generation Time", target: "< 30 seconds", warning: "30-60 seconds", critical: "> 60 seconds" },
  { metric: "Search Response Time", target: "< 1 second", warning: "1-3 seconds", critical: "> 3 seconds" },
  { metric: "Workflow Processing Time", target: "< 5 seconds", warning: "5-15 seconds", critical: "> 15 seconds" },
  { metric: "Notification Delivery", target: "< 1 minute", warning: "1-5 minutes", critical: "> 5 minutes" },
  { metric: "File Upload Success Rate", target: "> 99%", warning: "95-99%", critical: "< 95%" }
];

const MAINTENANCE_SCHEDULE = [
  { task: "Review and archive old tickets", frequency: "Monthly", owner: "HR Admin" },
  { task: "Clean up draft/unpublished articles", frequency: "Quarterly", owner: "Knowledge Manager" },
  { task: "Audit and optimize workflow templates", frequency: "Quarterly", owner: "Workflow Admin" },
  { task: "Storage quota review and cleanup", frequency: "Monthly", owner: "IT Admin" },
  { task: "Review and archive inactive SOPs", frequency: "Semi-annually", owner: "Compliance" },
  { task: "Performance baseline assessment", frequency: "Quarterly", owner: "IT Admin" }
];

export function TroubleshootingPerformance() {
  return (
    <div className="space-y-8">
      <Card id="hh-sec-8-2" data-manual-anchor="hh-sec-8-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Gauge className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>8.2 Performance Optimization</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                System performance tips, data cleanup guidelines, and archiving best practices
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">HR Admin</Badge>
            <Badge variant="outline">IT</Badge>
            <Badge variant="outline">System Admin</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Performance Issues */}
          <div id="hh-sec-8-2-1" data-manual-anchor="hh-sec-8-2-1">
            <TroubleshootingSection 
              items={performanceIssues}
              title="Performance Issues & Solutions"
            />
          </div>

          {/* Health Metrics */}
          <div id="hh-sec-8-2-2" data-manual-anchor="hh-sec-8-2-2">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-500" />
              Performance Health Metrics
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Metric</th>
                    <th className="text-left p-3 font-medium">
                      <span className="text-green-600">Target</span>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <span className="text-amber-600">Warning</span>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <span className="text-destructive">Critical</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {HEALTH_METRICS.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 font-medium">{item.metric}</td>
                      <td className="p-3 text-green-600">{item.target}</td>
                      <td className="p-3 text-amber-600">{item.warning}</td>
                      <td className="p-3 text-destructive">{item.critical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.2.1: Performance Monitoring Dashboard showing key metrics and trends"
            alt="Dashboard displaying page load times, query performance, and system health indicators"
          />

          {/* Optimization Strategies */}
          <div id="hh-sec-8-2-3" data-manual-anchor="hh-sec-8-2-3">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Optimization Strategies by Category
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {OPTIMIZATION_STRATEGIES.map((strategy) => (
                <div key={strategy.category} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <strategy.icon className="h-4 w-4 text-primary" />
                    <h5 className="font-medium text-sm">{strategy.category}</h5>
                  </div>
                  <ul className="space-y-2">
                    {strategy.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div id="hh-sec-8-2-4" data-manual-anchor="hh-sec-8-2-4">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recommended Maintenance Schedule
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Task</th>
                    <th className="text-left p-3 font-medium">Frequency</th>
                    <th className="text-left p-3 font-medium">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {MAINTENANCE_SCHEDULE.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.task}</td>
                      <td className="p-3">
                        <Badge variant="outline">{item.frequency}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{item.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.2.2: Data Cleanup Wizard for archiving old records"
            alt="Interface showing data cleanup options with preview of records to be archived"
          />

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Best Practice:</strong> Establish a quarterly performance review cadence. Track key metrics over time to identify trends and proactively address degradation before users are impacted.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
