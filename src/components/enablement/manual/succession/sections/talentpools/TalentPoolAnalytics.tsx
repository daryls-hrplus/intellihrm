import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  BarChart3, 
  Settings, 
  ChevronRight, 
  TrendingUp,
  Users,
  GraduationCap,
  Clock,
  Target,
  CheckCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export function TalentPoolAnalytics() {
  const poolHealthMetrics = [
    { name: 'Total Members', description: 'Current active members across all pools', icon: Users, example: '156' },
    { name: 'Average Time in Pool', description: 'Mean duration of active memberships', icon: Clock, example: '14.2 months' },
    { name: 'Graduation Rate', description: 'Percentage of members promoted to succession candidates', icon: GraduationCap, example: '23%' },
    { name: 'Rejection Rate', description: 'Percentage of nominations declined during review', icon: ArrowDownRight, example: '12%' },
    { name: 'Fill Rate', description: 'Percentage of pool capacity utilized', icon: Target, example: '78%' },
    { name: 'Pipeline Velocity', description: 'Average time from nomination to graduation', icon: ArrowUpRight, example: '18.5 months' }
  ];

  const pipelineMetrics = [
    { metric: 'Pool → Succession Conversion', description: 'Pool members who became succession candidates', calculation: 'Graduated / Total Ever Active', benchmark: '20-30%' },
    { metric: 'Ready Now Ratio', description: 'Members immediately ready for target roles', calculation: 'Ready Now Band / Active Members', benchmark: '15-25%' },
    { metric: 'Cross-Pool Overlap', description: 'Members in multiple pools simultaneously', calculation: 'Multi-Pool Members / Total Members', benchmark: '<10%' },
    { metric: 'Stagnation Rate', description: 'Members with no status change in 12+ months', calculation: 'Stagnant Members / Active Members', benchmark: '<15%' },
    { metric: 'Attrition from Pool', description: 'Members who left company while in pool', calculation: 'Departed Members / Total Members', benchmark: '<8%' }
  ];

  return (
    <section id="sec-5-8" data-manual-anchor="sec-5-8" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.8 Pool Analytics & Reporting</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Pool health metrics, pipeline analytics, and reporting capabilities
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Monitor pool health using key performance indicators',
          'Analyze pipeline velocity and conversion metrics',
          'Generate reports for executive talent reviews',
          'Apply analytics insights to optimize pool strategy'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Performance</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Dashboard</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Talent Pool Analytics</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pool Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Pool Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These key metrics provide insight into the overall health and effectiveness 
            of talent pool management across the organization.
          </p>
          
          <div className="grid gap-3 md:grid-cols-3">
            {poolHealthMetrics.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <div key={metric.name} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{metric.name}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">{metric.example}</div>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pipeline Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pipeline metrics track the flow of talent through pools and into succession 
            plans, helping identify bottlenecks and optimization opportunities.
          </p>
          
          <div className="space-y-3">
            {pipelineMetrics.map((item) => (
              <div key={item.metric} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{item.metric}</h5>
                  <Badge variant="outline" className="text-xs">Benchmark: {item.benchmark}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="mt-2 p-2 bg-muted/50 rounded">
                  <span className="text-xs font-medium">Calculation: </span>
                  <span className="text-xs text-muted-foreground font-mono">{item.calculation}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard Integration Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Talent pool analytics integrate with the Succession Planning dashboard and 
            executive reporting to provide comprehensive pipeline visibility.
          </p>
          
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Succession Dashboard Widgets</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Pool membership by type (donut chart)</li>
                <li>• Graduation trend over time (line chart)</li>
                <li>• Status distribution (stacked bar)</li>
                <li>• Top pools by growth rate</li>
              </ul>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Executive Reports</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Quarterly Talent Pipeline Summary</li>
                <li>• Pool Health Scorecard</li>
                <li>• Succession Bench Strength Report</li>
                <li>• High Potential Cohort Analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Standard Pool Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm">Pool Membership Roster</h5>
                <Badge variant="secondary" className="text-xs">Operational</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Complete list of current members by pool with status, tenure, and readiness band. 
                Exportable to Excel/PDF for review meetings.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm">Nomination Activity Report</h5>
                <Badge variant="secondary" className="text-xs">Operational</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Nominations submitted, approved, and declined by time period and manager. 
                Identifies nomination patterns and quality trends.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm">Pipeline Velocity Analysis</h5>
                <Badge variant="outline" className="text-xs">Strategic</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Average time in pool, time to graduation, and stage-by-stage conversion rates. 
                Used for pipeline planning and development investment decisions.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm">Diversity in Talent Pools</h5>
                <Badge variant="outline" className="text-xs">Strategic</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Demographic breakdown of pool membership compared to overall workforce. 
                Supports diversity, equity, and inclusion talent initiatives.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm">Pool-to-Position Alignment</h5>
                <Badge variant="outline" className="text-xs">Strategic</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Maps pool members to potential key positions based on competency fit and 
                readiness. Supports proactive succession planning.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Cycle Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pool Review Cycle Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-lg font-bold text-primary mb-1">Monthly</div>
              <p className="text-xs text-muted-foreground">
                Nomination processing, new member onboarding, status updates
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-lg font-bold text-primary mb-1">Quarterly</div>
              <p className="text-xs text-muted-foreground">
                Pool health review, membership validation, development progress check
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-lg font-bold text-primary mb-1">Annually</div>
              <p className="text-xs text-muted-foreground">
                Strategic pool review, criteria updates, graduation decisions, pipeline planning
              </p>
            </div>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Industry Practice:</strong> High-performing organizations conduct 
                formal talent pool reviews quarterly, with monthly operational updates 
                and annual strategic realignment (Gartner Talent Management Study).
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Analytics Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Set clear targets for graduation rate (aim for 20-30% annually)',
              'Monitor stagnation rate monthly—members should show progress',
              'Investigate pools with rejection rates above 20%',
              'Balance pool size to maintain meaningful development focus',
              'Use diversity analytics to identify representation gaps early',
              'Share pipeline metrics with executive sponsors quarterly'
            ].map((practice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
