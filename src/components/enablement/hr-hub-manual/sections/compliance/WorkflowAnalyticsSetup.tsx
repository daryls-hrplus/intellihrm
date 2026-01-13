import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  Filter,
  Calendar,
  PieChart,
  Activity
} from 'lucide-react';
import { InfoCallout, TipCallout, SuccessCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const analyticsDiagram = `flowchart TD
    A[Workflow Instances] --> B{Filter by Date/Template}
    B --> C[Calculate Metrics]
    C --> D[Total Submitted]
    C --> E[Approval Rate %]
    C --> F[Avg Completion Hours]
    C --> G[Pending Count]
    C --> H[Trend Data]
    C --> I[Category Breakdown]
    C --> J[Approver Performance]
    
    D --> K[Executive KPIs Dashboard]
    E --> K
    F --> K
    G --> K
    
    H --> L[Trend Line Chart]
    I --> M[Category Pie Chart]
    J --> N[Approver Bar Chart]
    
    classDef metrics fill:#10b981,stroke:#059669,color:#fff
    classDef charts fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef process fill:#f59e0b,stroke:#d97706,color:#fff
    
    class D,E,F,G metrics
    class L,M,N charts
    class A,B,C process`;

const kpiMetrics = [
  { name: 'Total Submitted', description: 'Count of workflow instances created in the selected period', icon: Activity },
  { name: 'Approval Rate', description: 'Percentage of workflows that were approved vs. rejected', icon: CheckCircle },
  { name: 'Avg Completion Time', description: 'Average hours from submission to final decision', icon: Clock },
  { name: 'Pending Count', description: 'Number of workflows currently awaiting decision', icon: TrendingUp },
];

const chartTypes = [
  { 
    name: 'Submissions vs Completions Trend', 
    description: 'Line chart showing workflow volume over time, comparing new submissions against completed workflows',
    insight: 'Identify bottlenecks when submissions consistently outpace completions'
  },
  { 
    name: 'Category Breakdown', 
    description: 'Pie chart showing distribution of workflows by category (Leave, ESS Changes, etc.)',
    insight: 'Understand which processes drive the most approval volume'
  },
  { 
    name: 'Approver Performance', 
    description: 'Bar chart showing top approvers by volume with approve/reject split',
    insight: 'Identify approvers who may need support or training'
  },
];

const filterOptions = [
  { filter: '7 Days', description: 'Last week of data for quick operational review' },
  { filter: '30 Days', description: 'Monthly view for trend analysis' },
  { filter: '90 Days', description: 'Quarterly performance assessment' },
  { filter: '365 Days', description: 'Annual review for strategic planning' },
];

export function WorkflowAnalyticsSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-6-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 6.4</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          10 min read
        </Badge>
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">New in v1.4.0</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Workflow Analytics Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor approval efficiency, identify bottlenecks, and track approver performance
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground">
            The Workflow Analytics Dashboard provides comprehensive visibility into your organization's 
            approval processes. Use it to identify bottlenecks, measure SLA compliance, optimize 
            approver workloads, and demonstrate governance effectiveness to leadership.
          </p>

          <InfoCallout title="Accessing the Dashboard">
            Navigate to <strong>HR Hub → Workflow Templates</strong> and click the <strong>Analytics</strong> tab. 
            The dashboard aggregates data from all workflow instances across templates.
          </InfoCallout>

          {/* Executive KPIs */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Executive KPIs
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiMetrics.map((metric, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{metric.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Flow Diagram */}
          <WorkflowDiagram
            title="Analytics Data Flow"
            description="How workflow data is processed into actionable metrics and visualizations"
            diagram={analyticsDiagram}
          />

          {/* Filter Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtering Options
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filterOptions.map((option, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-muted/30 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-sm">{option.filter}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Additionally, filter by specific workflow template to analyze individual process performance.
            </p>
          </div>

          {/* Chart Types */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Visualization Types
            </h4>
            <div className="space-y-3">
              {chartTypes.map((chart, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-card">
                  <h5 className="font-medium mb-1">{chart.name}</h5>
                  <p className="text-sm text-muted-foreground mb-2">{chart.description}</p>
                  <div className="flex items-start gap-2 text-xs bg-primary/5 p-2 rounded">
                    <TrendingUp className="h-3 w-3 text-primary mt-0.5" />
                    <span className="text-muted-foreground"><strong>Insight:</strong> {chart.insight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Status Summary Cards</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 text-center">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="font-medium text-green-700 dark:text-green-300">Approved</p>
                <p className="text-xs text-muted-foreground">Completed successfully</p>
              </div>
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 text-center">
                <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="font-medium text-red-700 dark:text-red-300">Rejected</p>
                <p className="text-xs text-muted-foreground">Declined by approver</p>
              </div>
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                <p className="font-medium text-amber-700 dark:text-amber-300">Pending</p>
                <p className="text-xs text-muted-foreground">Awaiting decision</p>
              </div>
            </div>
          </div>

          <SuccessCallout title="Approver Performance Insights">
            Use the approver performance chart to identify team members with high rejection rates 
            who may benefit from training, or those with excellent approval velocity who could 
            mentor others.
          </SuccessCallout>

          {/* Use Cases */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Common Use Cases
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">Bottleneck Identification</h5>
                <p className="text-sm text-muted-foreground">
                  When pending count rises or completion times increase, drill into specific 
                  templates or approvers to identify where delays occur.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">SLA Compliance</h5>
                <p className="text-sm text-muted-foreground">
                  Track average completion times against internal SLA targets to ensure 
                  governance commitments are met.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">Workload Balancing</h5>
                <p className="text-sm text-muted-foreground">
                  Use approver performance data to redistribute approval responsibilities 
                  when individual workloads become imbalanced.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">Executive Reporting</h5>
                <p className="text-sm text-muted-foreground">
                  Export analytics data for inclusion in governance reports and 
                  board presentations.
                </p>
              </div>
            </div>
          </div>

          <TipCallout title="Weekly Review Cadence">
            Schedule a weekly 15-minute review of the workflow analytics dashboard. Focus on 
            pending count trends and any approvers with declining performance metrics.
          </TipCallout>
        </CardContent>
      </Card>
    </div>
  );
}
