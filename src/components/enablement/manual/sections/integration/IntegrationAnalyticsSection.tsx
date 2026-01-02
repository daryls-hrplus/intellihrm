import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { 
  BarChart3, Filter, CheckCircle2, XCircle, Clock, 
  Lightbulb, Info, RefreshCw, Eye, ArrowRight
} from 'lucide-react';

export function IntegrationAnalyticsSection() {
  return (
    <div className="space-y-8">
      {/* Section 7.7 Header */}
      <Card id="sec-7-7">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 7.7</Badge>
          </div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Integration Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and analyze cross-module integration activity in the Performance Intelligence Hub
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-7-7'] || ['Performance', 'Intelligence Hub', 'Integrations']} />

          {/* Learning Objectives */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Navigate to and use the Integration Analytics dashboard</li>
                <li>Understand integration metrics and success rates</li>
                <li>Review and manage pending approval actions</li>
                <li>Troubleshoot failed integrations with retry capabilities</li>
                <li>Analyze integration activity by module and time period</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Dashboard Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Accessing the Dashboard
            </h3>
            <p className="text-muted-foreground">
              The Integration Analytics dashboard is located in the <strong>Performance Intelligence Hub</strong> under 
              the <strong>Integrations</strong> section. This provides a centralized view of all cross-module integration 
              activity triggered by appraisal outcomes.
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
              <Badge variant="outline">Path</Badge>
              <span>Performance → Intelligence Hub → Integrations</span>
            </div>
            <Alert variant="default" className="border-2 border-blue-500 bg-blue-500/20">
              <Info className="h-4 w-4" />
              <AlertDescription>
                A compact Integration Status widget is also available in <strong>Performance Setup → Appraisals → Integration Status</strong> tab 
                for quick at-a-glance monitoring. Click "View Full Analytics" to navigate to the full dashboard.
              </AlertDescription>
            </Alert>
          </div>

          {/* Dashboard Sections */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dashboard Components</h3>
            
            {/* Summary Cards */}
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Summary Cards
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  At the top of the dashboard, four key metrics provide an immediate health check:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 border-2 border-primary bg-primary/20 rounded-lg text-center">
                    <div className="text-2xl font-bold">Total</div>
                    <div className="text-xs">All executions (last 30 days)</div>
                  </div>
                  <div className="p-3 border-2 border-green-500 bg-green-500/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">Success</div>
                    <div className="text-xs">Successfully completed</div>
                  </div>
                  <div className="p-3 border-2 border-amber-500 bg-amber-500/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">Pending</div>
                    <div className="text-xs">Awaiting approval</div>
                  </div>
                  <div className="p-3 border-2 border-red-500 bg-red-500/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">Failed</div>
                    <div className="text-xs">Requires attention</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Dashboard Tabs
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 border-l-2 border-primary">
                    <Eye className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-sm">Overview</span>
                      <p className="text-xs text-muted-foreground">High-level statistics, trend charts, and module breakdown</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 border-l-2 border-muted">
                    <RefreshCw className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-sm">Activity Log</span>
                      <p className="text-xs text-muted-foreground">Full table of all integration events with search, filter, and sort</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 border-l-2 border-amber-500">
                    <Clock className="h-4 w-4 mt-0.5 text-amber-600" />
                    <div>
                      <span className="font-medium text-sm">Pending Approvals</span>
                      <p className="text-xs text-muted-foreground">Actions waiting for HR/Manager approval with bulk approve/reject</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 border-l-2 border-destructive">
                    <XCircle className="h-4 w-4 mt-0.5 text-destructive" />
                    <div>
                      <span className="font-medium text-sm">Failed</span>
                      <p className="text-xs text-muted-foreground">Failed integrations with error details and retry capability</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 border-l-2 border-muted">
                    <BarChart3 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-sm">By Module</span>
                      <p className="text-xs text-muted-foreground">Grouped view showing integration activity per target module</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Approve</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Approve pending integration actions individually or in bulk. Approved actions execute immediately.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <h4 className="font-medium">Reject</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reject actions that should not be executed. Rejection reason is logged for audit purposes.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Retry</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Retry failed integrations after resolving the underlying issue. Creates a new execution attempt.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filtering */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtering Options
            </h3>
            <p className="text-muted-foreground">
              Use the filter controls at the top of the dashboard to narrow down integration data:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 border-2 border-primary bg-primary/20 rounded-lg">
                <div className="font-semibold text-sm">Appraisal Cycle</div>
                <div className="text-xs">Filter by specific cycle</div>
              </div>
              <div className="p-3 border-2 border-primary bg-primary/20 rounded-lg">
                <div className="font-semibold text-sm">Target Module</div>
                <div className="text-xs">Nine-Box, Succession, IDP, etc.</div>
              </div>
              <div className="p-3 border-2 border-primary bg-primary/20 rounded-lg">
                <div className="font-semibold text-sm">Status</div>
                <div className="text-xs">Success, Pending, Failed</div>
              </div>
              <div className="p-3 border-2 border-primary bg-primary/20 rounded-lg">
                <div className="font-semibold text-sm">Date Range</div>
                <div className="text-xs">Custom time period</div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Best Practices</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check the Pending Approvals tab daily during active appraisal cycles</li>
                <li>Investigate failed integrations promptly to prevent data synchronization issues</li>
                <li>Use the By Module view to identify patterns in specific integration targets</li>
                <li>Review the Activity Log after bulk appraisal finalizations to verify expected behavior</li>
                <li>Monitor success rates over time to identify configuration or system issues</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
