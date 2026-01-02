import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Users, CheckCircle, Target, TrendingUp, Eye, AlertTriangle, RefreshCw, Filter, Download, PieChart, Layers, Brain } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';

const FIELD_REFERENCES = [
  { fieldName: 'Intelligence Hub', location: 'Performance → Intelligence Hub', required: false, description: 'Unified analytics dashboard consolidating all performance insights' },
  { fieldName: 'Company Filter', location: 'Hub Header (Top Right)', required: false, description: 'Filter all analytics by company for multi-tenant environments' },
  { fieldName: 'Department Filter', location: 'Hub Header (Operations/Workforce)', required: false, description: 'Drill down to specific departments for detailed analysis' },
  { fieldName: 'Cycle Filter', location: 'Hub Header (Appraisals Section)', required: false, description: 'Filter appraisal analytics by specific review cycle' },
  { fieldName: 'Key Insights Panel', location: 'Hub Top Section', required: false, description: 'AI-generated summary of risks, trends, and recommendations' },
  { fieldName: 'Section Tabs', location: 'Hub Navigation Bar', required: false, description: 'Operations, Workforce, Appraisals, Predictive AI, AI Reports' }
];

const BUSINESS_RULES = [
  { rule: 'Analytics require completed appraisals', enforcement: 'System' as const, description: 'Only evaluations with status "Completed" are included in analytics calculations.' },
  { rule: 'Distribution percentages are auto-calculated', enforcement: 'System' as const, description: 'System calculates distribution against total completed evaluations per cycle.' },
  { rule: 'KPI thresholds are configurable', enforcement: 'Advisory' as const, description: 'Administrators can set target thresholds for completion rates and timing.' },
  { rule: 'Analytics respect RLS policies', enforcement: 'System' as const, description: 'Users only see data for employees within their access scope.' }
];

const DASHBOARD_WORKFLOW = `graph LR
    subgraph Data Sources
        A[Appraisal Cycles] --> E[Analytics Engine]
        B[Score Breakdowns] --> E
        C[Participants] --> E
        D[Categories] --> E
    end
    
    subgraph Intelligence Hub
        E --> F[Key Insights AI Panel]
        E --> G[Section Analytics]
    end
    
    subgraph Sections
        G --> H[Operations]
        G --> I[Workforce]
        G --> J[Appraisals]
        G --> K[Predictive AI]
        G --> L[AI Reports]
    end
    
    style E fill:#3b82f6,stroke:#2563eb,color:#fff
    style F fill:#8b5cf6,stroke:#7c3aed,color:#fff`;

export function AppraisalAnalyticsDashboard() {
  return (
    <Card id="sec-6-1">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.1</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~12 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR User / Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Appraisal Analytics Dashboard</CardTitle>
        <CardDescription>Understanding and navigating the Performance Intelligence Hub for comprehensive analytics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-6-1']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Navigate the Performance Intelligence Hub interface</li>
            <li>Understand key performance indicators (KPIs) and their targets</li>
            <li>Use filters to drill down into specific data segments</li>
            <li>Interpret AI-generated key insights</li>
            <li>Export analytics reports for stakeholders</li>
          </ul>
        </div>

        {/* Intelligence Hub Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Performance Intelligence Hub Overview
          </h3>
          <p className="text-muted-foreground">
            The <strong>Performance Intelligence Hub</strong> is the centralized analytics destination that 
            consolidates all performance-related metrics, trends, and AI-powered insights. Access it via 
            <strong> Performance → Intelligence Hub</strong> from the main navigation.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Hub Benefits</p>
            <p className="text-sm text-muted-foreground mt-1">
              Eliminates navigation between fragmented analytics pages. All 18 analytics components 
              are organized into 5 intuitive sections with AI-powered summaries.
            </p>
          </div>
        </div>

        <WorkflowDiagram 
          title="Intelligence Hub Architecture" 
          diagram={DASHBOARD_WORKFLOW}
        />

        {/* Key Performance Indicators */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Key Performance Indicators (KPIs)
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                label: 'Completion Rate', 
                target: '95%+', 
                description: 'Percentage of evaluations submitted vs. total enrolled',
                icon: CheckCircle,
                color: 'text-green-600'
              },
              { 
                label: 'On-Time Rate', 
                target: '90%+', 
                description: 'Percentage submitted before evaluation deadline',
                icon: Clock,
                color: 'text-blue-600'
              },
              { 
                label: 'Average Rating', 
                target: '3.0-3.5', 
                description: 'Organization-wide average on 5-point scale',
                icon: BarChart3,
                color: 'text-primary'
              },
              { 
                label: 'Calibrated %', 
                target: '85%+', 
                description: 'Percentage of ratings reviewed in calibration',
                icon: Users,
                color: 'text-purple-600'
              }
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    <span className="font-semibold">{kpi.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-1">{kpi.target}</p>
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Hub Sections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Hub Section Navigation
          </h3>
          <p className="text-muted-foreground">
            The Intelligence Hub organizes analytics into five main sections, each with nested tabs:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 border-b">Section</th>
                  <th className="text-left p-3 border-b">Purpose</th>
                  <th className="text-left p-3 border-b">Key Tabs</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { section: 'Operations', purpose: 'Core goal and workflow metrics', tabs: 'Overview, Completion Rates, Goal Quality, Alignment, Workload' },
                  { section: 'Workforce', purpose: 'Role and skill insights', tabs: 'Role Impact, Level Gaps, Skill Gaps, Employee Voice' },
                  { section: 'Appraisals', purpose: 'Cycle-based outcomes', tabs: 'Distribution, Competency Heatmap, Manager Patterns' },
                  { section: 'Predictive AI', purpose: 'AI-powered predictions', tabs: 'Performance Risks, High Potentials, Insights, Risk Flags' },
                  { section: 'AI Reports', purpose: 'Generated reports & exports', tabs: 'Export Intelligence Report, Banded Reports, BI Reports' }
                ].map((row, i) => (
                  <tr key={row.section} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 border-b font-medium">{row.section}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.purpose}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.tabs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights AI Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Key Insights AI Panel
          </h3>
          <p className="text-muted-foreground">
            At the top of the Intelligence Hub, the <strong>Key Insights AI Panel</strong> provides 
            an AI-generated summary organized into three columns:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h4 className="font-semibold">Critical Risks</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Employee overload warnings, goal quality issues, broken alignment chains
              </p>
            </div>
            <div className="p-4 border rounded-lg border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">Trending Metrics</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Goal completion trends, quality scores, strategic alignment with directional indicators
              </p>
            </div>
            <div className="p-4 border rounded-lg border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-amber-500" />
                <h4 className="font-semibold">Recommendations</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Actionable suggestions for improving completion, alignment, and workload balance
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step: Accessing Analytics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step-by-Step: Accessing the Intelligence Hub</h3>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground ml-2">
            <li>
              <strong>Navigate to Performance Module</strong>
              <p className="ml-6 text-sm mt-1">From the main navigation, click <strong>Performance</strong> in the sidebar.</p>
            </li>
            <li>
              <strong>Click Intelligence Hub</strong>
              <p className="ml-6 text-sm mt-1">Select <strong>Intelligence Hub</strong> from the Performance dashboard cards or navigation.</p>
            </li>
            <li>
              <strong>Select Company (if multi-tenant)</strong>
              <p className="ml-6 text-sm mt-1">Use the <strong>Company Filter</strong> dropdown in the header to select your organization.</p>
            </li>
            <li>
              <strong>Review Key Insights Panel</strong>
              <p className="ml-6 text-sm mt-1">The AI panel auto-generates insights. Click <strong>Refresh</strong> to regenerate after data changes.</p>
            </li>
            <li>
              <strong>Navigate Section Tabs</strong>
              <p className="ml-6 text-sm mt-1">Click section buttons (Operations, Workforce, Appraisals, etc.) to switch between analytics categories.</p>
            </li>
            <li>
              <strong>Apply Additional Filters</strong>
              <p className="ml-6 text-sm mt-1">Use Department or Cycle filters where available to narrow your analysis.</p>
            </li>
          </ol>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Available Filters
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { filter: 'Company', applies: 'All Sections', desc: 'Filters all data by selected company. Required for multi-tenant deployments.' },
              { filter: 'Department', applies: 'Operations, Workforce', desc: 'Drill down to specific departments for workload and skill analysis.' },
              { filter: 'Appraisal Cycle', applies: 'Appraisals Section', desc: 'Filter by specific review cycle. Active cycles show green badge.' }
            ].map((item) => (
              <Card key={item.filter}>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-1">{item.filter} Filter</h4>
                  <Badge variant="outline" className="text-xs mb-2">{item.applies}</Badge>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Intelligence Reports
          </h3>
          <p className="text-muted-foreground">
            The <strong>AI Reports</strong> section includes the <strong>Export Intelligence Report</strong> feature 
            which generates comprehensive PDF documents with:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Cover page with report metadata and included sections</li>
            <li>AI-generated executive summary (optional)</li>
            <li>Operations analytics with metrics and progress bars</li>
            <li>Workforce insights with workload distribution</li>
            <li>Alignment analytics with department breakdowns</li>
            <li>Predictive intelligence summary with health scores</li>
          </ul>
        </div>

        {/* Field References */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Key Interface Elements</h3>
          <div className="space-y-2">
            {FIELD_REFERENCES.map((field, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{field.fieldName}</span>
                  <Badge variant="outline" className="text-xs">{field.location}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Best Practice">
          Review the Intelligence Hub weekly during active appraisal cycles to catch completion 
          issues early. The AI Key Insights panel highlights urgent items requiring attention.
        </TipCallout>

        <WarningCallout title="Data Freshness">
          Analytics are calculated from completed evaluations only. In-progress appraisals are 
          not reflected until the manager submits their evaluation.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
