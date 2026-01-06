import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gauge, Zap, Database, Monitor, Clock, TrendingUp } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { TroubleshootingSection, TroubleshootingItem } from '@/components/enablement/manual/components/TroubleshootingSection';

const performanceIssues: TroubleshootingItem[] = [
  {
    issue: "Dashboard takes very long to load",
    cause: "Too many widgets configured, date ranges too broad, or underlying data queries are slow.",
    solution: "1) Reduce the number of dashboard widgets. 2) Narrow default date ranges for charts. 3) Check if specific widgets are the bottleneck by removing them temporarily. 4) Consider using cached dashboard data for historical metrics."
  },
  {
    issue: "Employee search is extremely slow",
    cause: "Large employee database combined with complex search filters, or search index may be outdated.",
    solution: "Use more specific search criteria to narrow results. If system-wide slowness, contact support to rebuild the search index. Consider implementing pagination for large result sets."
  },
  {
    issue: "Reports time out before completing",
    cause: "Report covers too much data, complex calculations, or concurrent report generation is overwhelming the system.",
    solution: "1) Reduce the date range or scope of the report. 2) Schedule large reports to run during off-peak hours. 3) Break large reports into smaller segments. 4) Use pre-aggregated data when possible."
  },
  {
    issue: "Permission calculations are slow for complex hierarchies",
    cause: "Deep organizational hierarchies with many inheritance levels cause cascading permission checks.",
    solution: "Review the organizational structure for unnecessary nesting. Consider flattening where possible. Enable permission caching for frequently accessed resources."
  },
  {
    issue: "Bulk operations (import/export) are failing",
    cause: "File too large, server timeout settings, or insufficient processing resources.",
    solution: "1) Break large files into smaller batches (max 5,000 records recommended). 2) Use async processing for large operations. 3) Schedule bulk operations during low-usage periods."
  },
  {
    issue: "Page refreshes lose unsaved work",
    cause: "Auto-save may be disabled, or the form doesn't implement draft saving.",
    solution: "Enable auto-save in user preferences where available. For long forms, save progress periodically. Consider implementing local storage drafts for critical forms."
  }
];

const OPTIMIZATION_TIPS = [
  {
    category: "Browser",
    tips: [
      "Clear browser cache regularly (Ctrl+Shift+Delete)",
      "Use Chrome or Edge for best performance",
      "Disable unnecessary browser extensions",
      "Ensure JavaScript is enabled",
      "Allow cookies for the application domain"
    ]
  },
  {
    category: "Network",
    tips: [
      "Minimum 10 Mbps recommended connection",
      "Use wired connection when possible for stability",
      "Check VPN performance if applicable",
      "Verify no proxy interference with HTTPS",
      "Test from different network to isolate issues"
    ]
  },
  {
    category: "Usage Patterns",
    tips: [
      "Avoid running multiple large reports simultaneously",
      "Close unused browser tabs to free memory",
      "Schedule heavy operations for off-peak hours",
      "Use filters to limit data loaded on screens",
      "Export only necessary columns in reports"
    ]
  }
];

const PERFORMANCE_METRICS = [
  { metric: "Page Load Time", acceptable: "< 3 seconds", warning: "3-5 seconds", critical: "> 5 seconds" },
  { metric: "Search Response", acceptable: "< 2 seconds", warning: "2-4 seconds", critical: "> 4 seconds" },
  { metric: "Report Generation", acceptable: "< 30 seconds", warning: "30-60 seconds", critical: "> 60 seconds" },
  { metric: "Dashboard Refresh", acceptable: "< 5 seconds", warning: "5-10 seconds", critical: "> 10 seconds" },
  { metric: "Bulk Import (1000 rows)", acceptable: "< 2 minutes", warning: "2-5 minutes", critical: "> 5 minutes" }
];

export function TroubleshootingPerformance() {
  return (
    <div className="space-y-8">
      <Card id="troubleshooting-8-3" data-manual-anchor="troubleshooting-8-3">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Gauge className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>8.3 Performance Optimization</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Diagnosing and resolving slow performance and timeout issues
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Common Performance Issues */}
          <TroubleshootingSection 
            items={performanceIssues}
            title="Common Performance Issues & Solutions"
          />

          <ScreenshotPlaceholder
            caption="Figure 8.3.1: System Performance Dashboard showing current metrics and trends"
            alt="Performance monitoring dashboard with load times, response times, and system resource usage"
          />

          {/* Performance Metrics Reference */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Performance Metrics Reference
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Metric</th>
                    <th className="text-left p-3 font-medium">
                      <span className="text-green-600">Acceptable</span>
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
                  {PERFORMANCE_METRICS.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 font-medium">{item.metric}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                          {item.acceptable}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                          {item.warning}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                          {item.critical}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optimization Tips */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Performance Optimization Tips
            </h4>
            <div className="grid gap-4 md:grid-cols-3">
              {OPTIMIZATION_TIPS.map((category, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                    {category.category === "Browser" && <Monitor className="h-4 w-4 text-blue-500" />}
                    {category.category === "Network" && <Zap className="h-4 w-4 text-green-500" />}
                    {category.category === "Usage Patterns" && <Clock className="h-4 w-4 text-purple-500" />}
                    {category.category}
                  </h5>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.3.2: Report scheduling interface for off-peak execution"
            alt="Report scheduler showing time slot selection with system load indicators"
          />

          {/* Large Organization Optimization */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              Large Organization Optimization Strategies
            </h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-background border rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-2">Data Partitioning</h5>
                  <p className="text-sm text-muted-foreground">
                    For organizations with 10,000+ employees, consider enabling data partitioning by legal entity or region. This isolates queries to relevant subsets of data.
                  </p>
                </div>
                <div className="bg-background border rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-2">Permission Caching</h5>
                  <p className="text-sm text-muted-foreground">
                    Enable aggressive permission caching for stable hierarchies. Set cache TTL based on how frequently your org structure changes (recommended: 1-4 hours).
                  </p>
                </div>
                <div className="bg-background border rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-2">Report Pre-computation</h5>
                  <p className="text-sm text-muted-foreground">
                    Schedule daily computation of common metrics and KPIs. Dashboards can then load from pre-computed data instead of running live queries.
                  </p>
                </div>
                <div className="bg-background border rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-2">Index Optimization</h5>
                  <p className="text-sm text-muted-foreground">
                    Request a database index review from support if experiencing consistent slow queries on specific data types (e.g., custom fields, skills, certifications).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.3.3: Cache management settings for performance optimization"
            alt="Admin settings panel showing cache configuration options and current cache statistics"
          />

          <Alert>
            <Gauge className="h-4 w-4" />
            <AlertDescription>
              <strong>Monitoring Tip:</strong> Enable performance monitoring alerts in Admin → System → Monitoring to receive notifications when key metrics exceed warning thresholds. This enables proactive optimization before users experience issues.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
