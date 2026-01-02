import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, Users, Clock, Monitor, AlertTriangle, CheckCircle, Server, Globe, Gauge } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LARGE_DATASET_GUIDELINES = [
  {
    scenario: 'Cycle with 1,000+ participants',
    challenge: 'Participant list loading time',
    optimization: 'Use pagination (50 per page default), apply filters before loading',
    benchmark: '< 3 seconds load time'
  },
  {
    scenario: 'Bulk enrollment operations',
    challenge: 'Timeout during mass enrollment',
    optimization: 'Batch enrollment in groups of 500, run during off-peak hours',
    benchmark: '100 employees per minute'
  },
  {
    scenario: 'Analytics dashboard with 3+ years history',
    challenge: 'Chart rendering performance',
    optimization: 'Use date range filters, limit to relevant cycles',
    benchmark: '< 5 seconds for trend charts'
  },
  {
    scenario: 'Calibration session with 100+ participants',
    challenge: 'Grid view responsiveness',
    optimization: 'Use department filters, virtual scrolling enabled',
    benchmark: 'Smooth scrolling at 60fps'
  },
  {
    scenario: 'Export of full cycle data',
    challenge: 'Browser memory limits',
    optimization: 'Use server-side export (background job), download as file',
    benchmark: 'No browser freeze, background processing'
  },
  {
    scenario: 'Integration logs for high-volume cycles',
    challenge: 'Log table query performance',
    optimization: 'Filter by status/date before querying, paginate results',
    benchmark: '< 2 seconds for filtered results'
  }
];

const BROWSER_COMPATIBILITY = [
  { browser: 'Chrome 90+', status: 'Fully Supported', notes: 'Recommended browser for best performance' },
  { browser: 'Firefox 88+', status: 'Fully Supported', notes: 'Full feature compatibility' },
  { browser: 'Safari 14+', status: 'Fully Supported', notes: 'macOS and iOS' },
  { browser: 'Edge 90+', status: 'Fully Supported', notes: 'Chromium-based version' },
  { browser: 'Mobile Safari', status: 'Supported', notes: 'Responsive design, some features limited' },
  { browser: 'Mobile Chrome', status: 'Supported', notes: 'Responsive design, some features limited' },
  { browser: 'Internet Explorer', status: 'Not Supported', notes: 'EOL - upgrade required' }
];

const NETWORK_OPTIMIZATIONS = [
  {
    issue: 'Slow loading on mobile networks',
    solution: 'Enable data compression, use progressive loading',
    userAction: 'Switch to WiFi for bulk operations'
  },
  {
    issue: 'Timeout on large data operations',
    solution: 'Background processing with status polling',
    userAction: 'Wait for completion notification, do not refresh'
  },
  {
    issue: 'Frequent disconnections',
    solution: 'Auto-save every 30 seconds, reconnect handling',
    userAction: 'Ensure stable connection, look for auto-saved drafts'
  },
  {
    issue: 'High latency regions',
    solution: 'CDN for static assets, regional database replicas',
    userAction: 'Contact admin if consistently slow'
  }
];

const BULK_OPERATION_TIPS = [
  {
    operation: 'Mass Participant Enrollment',
    bestPractice: 'Use eligibility-based enrollment instead of manual selection',
    avoid: 'Selecting 500+ employees individually',
    timing: 'Off-peak hours (before 9 AM or after 6 PM)'
  },
  {
    operation: 'Bulk Score Export',
    bestPractice: 'Apply filters first, then export visible data only',
    avoid: 'Exporting entire company without filters',
    timing: 'Any time - runs in background'
  },
  {
    operation: 'Mass Status Updates',
    bestPractice: 'Process in batches of 100, verify after each batch',
    avoid: 'Updating all participants simultaneously',
    timing: 'During low-usage periods'
  },
  {
    operation: 'Integration Bulk Retry',
    bestPractice: 'Filter to specific error codes, retry in groups',
    avoid: 'Retrying all failures at once (may recreate same errors)',
    timing: 'After root cause is fixed'
  },
  {
    operation: 'Report Generation',
    bestPractice: 'Schedule reports for overnight generation',
    avoid: 'Running multiple complex reports simultaneously',
    timing: 'Overnight batch processing recommended'
  }
];

const PERFORMANCE_METRICS = [
  { metric: 'Page Load Time', target: '< 3 seconds', critical: '> 8 seconds', measurement: 'First Contentful Paint' },
  { metric: 'API Response Time', target: '< 500ms', critical: '> 2 seconds', measurement: '95th percentile' },
  { metric: 'Form Save Time', target: '< 1 second', critical: '> 5 seconds', measurement: 'User-perceived delay' },
  { metric: 'Search Results', target: '< 2 seconds', critical: '> 5 seconds', measurement: 'Results displayed' },
  { metric: 'Chart Rendering', target: '< 3 seconds', critical: '> 10 seconds', measurement: 'Fully interactive' },
  { metric: 'Export Completion', target: '< 30 seconds', critical: '> 5 minutes', measurement: 'For <1000 records' }
];

export function PerformanceOptimizationSection() {
  return (
    <div className="space-y-8">
      <Card id="sec-8-6">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 8.6</Badge>
            <Badge variant="secondary">Reference</Badge>
          </div>
          <CardTitle className="text-2xl">Performance Optimization</CardTitle>
          <CardDescription>
            Guidelines for optimal system performance with large datasets, bulk operations, and browser compatibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-8-6']} />

          {/* Performance KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <Gauge className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold">{'<'}3s</div>
              <div className="text-xs text-muted-foreground">Page Load Target</div>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
              <Server className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold">{'<'}500ms</div>
              <div className="text-xs text-muted-foreground">API Response Target</div>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold">5,000+</div>
              <div className="text-xs text-muted-foreground">Max Participants/Cycle</div>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
              <Database className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <div className="text-lg font-bold">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime SLA</div>
            </div>
          </div>

          <Tabs defaultValue="large-datasets" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="large-datasets">Large Datasets</TabsTrigger>
              <TabsTrigger value="bulk-operations">Bulk Operations</TabsTrigger>
              <TabsTrigger value="browser">Browser</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <TabsContent value="large-datasets" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Large Dataset Handling</h3>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Scenario</TableHead>
                      <TableHead>Challenge</TableHead>
                      <TableHead>Optimization</TableHead>
                      <TableHead className="w-32">Benchmark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LARGE_DATASET_GUIDELINES.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-sm">{item.scenario}</TableCell>
                        <TableCell className="text-sm">{item.challenge}</TableCell>
                        <TableCell className="text-sm">{item.optimization}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.benchmark}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Pro Tips for Large Cycles
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Always use filters before loading participant lists</li>
                  <li>• Prefer department-based views over company-wide views</li>
                  <li>• Use the search function instead of scrolling through lists</li>
                  <li>• Export data for offline analysis when working with 3+ years of history</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="bulk-operations" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Bulk Operation Best Practices</h3>
              </div>

              <div className="space-y-4">
                {BULK_OPERATION_TIPS.map((tip, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{tip.operation}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {tip.timing}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                          <CheckCircle className="h-4 w-4" />
                          Best Practice
                        </div>
                        <p className="text-sm text-muted-foreground">{tip.bestPractice}</p>
                      </div>
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-1 text-sm font-medium text-destructive mb-1">
                          <AlertTriangle className="h-4 w-4" />
                          Avoid
                        </div>
                        <p className="text-sm text-muted-foreground">{tip.avoid}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="browser" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Monitor className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Browser Compatibility</h3>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Browser</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BROWSER_COMPATIBILITY.map((browser, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{browser.browser}</TableCell>
                        <TableCell>
                          <Badge variant={
                            browser.status === 'Fully Supported' ? 'default' :
                            browser.status === 'Supported' ? 'secondary' : 'destructive'
                          }>
                            {browser.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{browser.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Browser Performance Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep browser updated to latest version</li>
                  <li>• Clear cache if experiencing issues after updates</li>
                  <li>• Disable browser extensions that may interfere</li>
                  <li>• Allocate sufficient memory (8GB+ recommended for large datasets)</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Network Optimization</h3>
              </div>

              <div className="space-y-4">
                {NETWORK_OPTIMIZATIONS.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      {item.issue}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">System Solution: </span>
                        <span>{item.solution}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">User Action: </span>
                        <span>{item.userAction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Metrics Table */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  Performance Targets
                </h4>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Metric</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Critical Threshold</TableHead>
                        <TableHead>Measurement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PERFORMANCE_METRICS.map((metric, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{metric.metric}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600">{metric.target}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-destructive">{metric.critical}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{metric.measurement}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
