import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart3, Users, Brain, Settings, TrendingUp, Users2, FileText, Link, Sparkles, FileBarChart } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  ScreenshotPlaceholder,
  TipCallout,
  InfoCallout,
  RelatedTopics
} from '../../components';

const HUB_TABS = [
  {
    name: 'Operations',
    icon: Settings,
    description: 'Cycle health and execution metrics',
    metrics: ['Completion rates by department', 'On-time submission %', 'Goal quality scores', 'Alignment cascade depth']
  },
  {
    name: 'Workforce',
    icon: Users2,
    description: 'People analytics and trends',
    metrics: ['Role change impact analysis', 'Skill gap heatmaps', 'Level vs. expectation comparison', 'Tenure-performance correlation']
  },
  {
    name: 'Appraisals',
    icon: FileText,
    description: 'Rating distributions and patterns',
    metrics: ['Score distribution curves', 'Competency heatmaps', 'Manager scoring patterns', 'Calibration adjustment rates']
  },
  {
    name: 'Integrations',
    icon: Link,
    description: 'Cross-module activity status',
    metrics: ['IDP/PIP creation rates', 'Succession nominations', 'Learning assignments', 'Compensation linkages']
  },
  {
    name: 'Predictive AI',
    icon: Sparkles,
    description: 'Risk and potential forecasting',
    metrics: ['Performance risk dashboard', 'High-potential identification', 'Attrition risk signals', 'Promotion readiness scores']
  },
  {
    name: 'AI Reports',
    icon: FileBarChart,
    description: 'Generated insights and exports',
    metrics: ['Executive summaries', 'Department comparisons', 'Trend narratives', 'Export to PDF/PowerPoint']
  }
];

export function PerformanceIntelligenceHubSection() {
  return (
    <Card id="sec-6-5">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.5</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~18 min read
          </Badge>
          <Badge className="gap-1 bg-blue-600 text-white">
            <Users className="h-3 w-3" />
            HR User / Admin
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          Performance Intelligence Hub
        </CardTitle>
        <CardDescription>
          Unified analytics and predictive insights dashboard for performance management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Intelligence Hub']} />

        <LearningObjectives
          objectives={[
            'Navigate the six Intelligence Hub sections effectively',
            'Interpret key performance metrics and trends',
            'Use AI-powered predictive insights for decision-making',
            'Generate and export executive reports'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            What is the Performance Intelligence Hub?
          </h4>
          <p className="text-muted-foreground">
            The Performance Intelligence Hub is your central command center for performance analytics. 
            It consolidates operational metrics, workforce trends, rating distributions, integration 
            status, and AI-powered predictions into a single, filterable interface. Move beyond 
            reactive reporting to proactive, data-driven performance management.
          </p>
        </div>

        {/* Hub Structure */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-4">Hub Navigation</h4>
          <div className="grid md:grid-cols-3 gap-4">
            {HUB_TABS.map((tab) => (
              <div key={tab.name} className="p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <tab.icon className="h-5 w-5 text-blue-600" />
                  <h5 className="font-medium">{tab.name}</h5>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{tab.description}</p>
                <div className="space-y-1">
                  {tab.metrics.slice(0, 3).map((metric, i) => (
                    <p key={i} className="text-xs flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      {metric}
                    </p>
                  ))}
                  {tab.metrics.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{tab.metrics.length - 3} more</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 6.5.1: Performance Intelligence Hub main dashboard with tab navigation"
          alt="Intelligence Hub dashboard"
        />

        {/* Filter Controls */}
        <div>
          <h4 className="font-medium mb-3">Global Filter Controls</h4>
          <p className="text-sm text-muted-foreground mb-3">
            All hub views can be filtered using consistent controls at the top of the page:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 border rounded-lg text-center">
              <p className="font-medium text-sm">Company</p>
              <p className="text-xs text-muted-foreground">Filter by legal entity</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <p className="font-medium text-sm">Department</p>
              <p className="text-xs text-muted-foreground">Drill into org units</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <p className="font-medium text-sm">Cycle</p>
              <p className="text-xs text-muted-foreground">Select appraisal period</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <p className="font-medium text-sm">Date Range</p>
              <p className="text-xs text-muted-foreground">Custom time window</p>
            </div>
          </div>
        </div>

        {/* Key Insights Panel */}
        <div>
          <h4 className="font-medium mb-3">AI Key Insights Panel</h4>
          <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-medium mb-2">AI-Generated Insights</p>
                <p className="text-sm text-muted-foreground">
                  The Key Insights panel uses AI to analyze current data and surface the most 
                  important observations automatically. Examples include:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• "Sales department completion rate 15% below company average"</li>
                  <li>• "3 high-potential employees flagged with engagement risk"</li>
                  <li>• "Manager scoring leniency detected in Marketing team"</li>
                  <li>• "12% increase in 'Exceeds Expectations' ratings vs last year"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 6.5.2: Predictive AI tab showing risk dashboard and high-potential identification"
          alt="Predictive AI analysis"
        />

        {/* Export Features */}
        <div>
          <h4 className="font-medium mb-3">Export & Report Generation</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Generate executive-ready reports from the AI Reports tab:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium mb-1">PDF Export</h5>
              <p className="text-xs text-muted-foreground">
                Formatted report with charts, tables, and AI narrative summaries
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium mb-1">PowerPoint Export</h5>
              <p className="text-xs text-muted-foreground">
                Presentation-ready slides for leadership meetings
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium mb-1">Excel Data</h5>
              <p className="text-xs text-muted-foreground">
                Raw data export for custom analysis
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium mb-1">Scheduled Reports</h5>
              <p className="text-xs text-muted-foreground">
                Configure automatic report delivery to stakeholders
              </p>
            </div>
          </div>
        </div>

        <TipCallout title="Maximize Hub Value">
          Bookmark specific filter combinations you use frequently. The Hub retains your last 
          filter selection, making it easy to return to your preferred view. Use the "Save View" 
          feature for complex filter combinations.
        </TipCallout>

        <InfoCallout title="Data Freshness">
          Most metrics update in real-time as appraisals progress. Predictive AI insights 
          are recalculated daily. The "Last Updated" timestamp in each section shows data currency.
        </InfoCallout>

        <RelatedTopics
          topics={[
            { sectionId: 'sec-6-1', title: 'Appraisal Analytics Dashboard' },
            { sectionId: 'sec-5-8', title: 'Performance Risk Detection' },
            { sectionId: 'sec-6-6', title: 'Talent Unified Dashboard' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
