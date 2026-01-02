import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Users, CheckCircle, TrendingUp, AlertTriangle, Brain, LineChart, PieChart, Activity, Eye, Shield, Layers, Lightbulb, FileText, Target, Network, GitBranch, Star, RefreshCw } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';

const FIELD_REFERENCES = [
  { fieldName: 'Performance Intelligence Hub', location: 'Performance → Intelligence Hub', required: false, description: 'Unified analytics dashboard consolidating all performance insights, AI predictions, and reports' },
  { fieldName: 'Key Insights AI Panel', location: 'Intelligence Hub (Top Section)', required: false, description: 'AI-generated summary of critical risks, trending metrics, and actionable recommendations' },
  { fieldName: 'Operations Analytics', location: 'Intelligence Hub → Operations Tab', required: false, description: 'Goal completion, quality metrics, alignment cascade, and workload analysis' },
  { fieldName: 'Workforce Insights', location: 'Intelligence Hub → Workforce Tab', required: false, description: 'Role impact, level gaps, skill gaps, and employee voice analytics' },
  { fieldName: 'Appraisals Analytics', location: 'Intelligence Hub → Appraisals Tab', required: false, description: 'Performance distribution, competency heatmaps, and manager scoring patterns (filterable by cycle)' },
  { fieldName: 'Predictive AI Section', location: 'Intelligence Hub → Predictive AI Tab', required: false, description: 'Performance risks, high potentials, predictive insights, and risk flags' },
  { fieldName: 'AI Reports', location: 'Intelligence Hub → AI Reports Tab', required: false, description: 'Export Intelligence Reports (PDF) and AI-powered report builders' }
];

const BUSINESS_RULES = [
  { rule: 'Predictions require minimum data threshold', enforcement: 'System' as const, description: 'AI predictions require at least 2 performance cycles and 6 months of data.' },
  { rule: 'Risk scores are confidential', enforcement: 'Policy' as const, description: 'Attrition risk scores are visible only to manager, HR, and authorized executives.' },
  { rule: 'Predictions cannot be sole basis for decisions', enforcement: 'Policy' as const, description: 'AI insights must be combined with human judgment for personnel actions.' },
  { rule: 'All AI predictions are explainable', enforcement: 'System' as const, description: 'ISO 42001 requires clear reasoning for every AI-generated insight.' },
  { rule: 'Key Insights auto-refresh on data change', enforcement: 'System' as const, description: 'AI insights panel regenerates when underlying analytics data is updated.' }
];

const HUB_ARCHITECTURE = `graph TB
    subgraph Performance Intelligence Hub
        A[Key Insights AI Panel] --> B[Section Navigation]
        
        B --> C[Operations]
        B --> D[Workforce]
        B --> E[Appraisals]
        B --> F[Predictive AI]
        B --> G[AI Reports]
    end
    
    subgraph Operations Section
        C --> C1[Overview Dashboard]
        C --> C2[Completion Rates]
        C --> C3[Goal Quality]
        C --> C4[Alignment Cascade]
        C --> C5[Workload Analysis]
    end
    
    subgraph Predictive AI Section
        F --> F1[Performance Risks]
        F --> F2[High Potentials]
        F --> F3[Predictive Insights]
        F --> F4[Risk Flags]
    end
    
    subgraph AI Reports Section
        G --> G1[Export Intelligence Report]
        G --> G2[Banded Reports]
        G --> G3[BI Reports]
    end
    
    style A fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style F fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style G1 fill:#3b82f6,stroke:#2563eb,color:#fff`;

const KEY_INSIGHTS_DIAGRAM = `graph LR
    subgraph Data Sources
        A[Goal Completion] --> E[AI Analysis Engine]
        B[Quality Metrics] --> E
        C[Alignment Data] --> E
        D[Workload Data] --> E
    end
    
    subgraph Key Insights Panel
        E --> F[Critical Risks]
        E --> G[Trending Metrics]
        E --> H[Recommendations]
    end
    
    subgraph Actions
        F --> I[Review & Address]
        G --> J[Monitor Trends]
        H --> K[Implement Changes]
    end
    
    style E fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style F fill:#ef4444,stroke:#dc2626,color:#fff
    style G fill:#3b82f6,stroke:#2563eb,color:#fff
    style H fill:#f59e0b,stroke:#d97706,color:#fff`;

export function AIAnalyticsPredictions() {
  return (
    <Card id="sec-5-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.6</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~15 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR / Executive / Manager</Badge>
        </div>
        <CardTitle className="text-2xl">AI Analytics & Predictions</CardTitle>
        <CardDescription>Performance Intelligence Hub with unified analytics, AI-powered insights, and predictive capabilities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-6']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Navigate the Performance Intelligence Hub and its unified analytics sections</li>
            <li>Interpret AI-generated key insights, risks, and recommendations</li>
            <li>Use predictive analytics for proactive talent management</li>
            <li>Export comprehensive intelligence reports with AI-powered executive summaries</li>
            <li>Apply appropriate governance when acting on AI predictions</li>
          </ul>
        </div>

        {/* Performance Intelligence Hub Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Performance Intelligence Hub Overview
          </h3>
          <p className="text-muted-foreground">
            The <strong>Performance Intelligence Hub</strong> is the unified analytics center that consolidates 
            all performance-related insights, metrics, and AI-powered predictions into a single, navigable interface. 
            It replaces fragmented analytics pages with a cohesive experience organized into five key sections.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Strategic Value</p>
            <p className="text-sm text-muted-foreground mt-1">
              The Intelligence Hub reduces time-to-insight by 60% by eliminating navigation between multiple 
              analytics pages. AI-generated key insights surface critical risks automatically, enabling 
              proactive intervention before issues escalate.
            </p>
          </div>
        </div>

        {/* Hub Architecture */}
        <WorkflowDiagram 
          title="Intelligence Hub Architecture" 
          diagram={HUB_ARCHITECTURE}
        />

        {/* Hub Sections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Intelligence Hub Sections
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                icon: BarChart3, 
                title: 'Operations', 
                desc: 'Core performance operations analytics',
                tabs: ['Overview Dashboard', 'Completion Rates', 'Goal Quality', 'Alignment Cascade', 'Workload Analysis'],
                color: 'text-blue-600'
              },
              { 
                icon: Users, 
                title: 'Workforce', 
                desc: 'Role and skill insights',
                tabs: ['Role Impact', 'Level Gaps', 'Skill Gaps', 'Employee Voice'],
                color: 'text-green-600'
              },
              { 
                icon: PieChart, 
                title: 'Appraisals', 
                desc: 'Cycle-based outcomes (with cycle filter)',
                tabs: ['Distribution', 'Competency Heatmap', 'Manager Patterns'],
                color: 'text-amber-600'
              },
              { 
                icon: Brain, 
                title: 'Predictive AI', 
                desc: 'AI-powered predictions and risk analysis',
                tabs: ['Performance Risks', 'High Potentials', 'Predictive Insights', 'Risk Flags'],
                color: 'text-purple-600'
              },
              { 
                icon: FileText, 
                title: 'AI Reports', 
                desc: 'Generated reports and exports',
                tabs: ['Export Intelligence Report', 'Banded Reports', 'BI Reports'],
                color: 'text-primary'
              }
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <h4 className="font-semibold">{item.title}</h4>
                    {item.title === 'Predictive AI' && (
                      <Badge variant="secondary" className="text-xs">AI</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tabs.map((tab, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{tab}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Insights AI Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Key Insights AI Panel
          </h3>
          <p className="text-muted-foreground">
            The <strong>Key Insights AI Panel</strong> appears at the top of the Intelligence Hub and provides 
            an AI-generated summary of the most important findings across all analytics sections. It automatically 
            analyzes goal completion, quality metrics, alignment data, and workload information to surface:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-destructive/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h4 className="font-semibold">Critical Risks</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Employee overload warnings</li>
                  <li>• Goal quality issues</li>
                  <li>• Broken alignment chains</li>
                  <li>• Performance decline patterns</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold">Trending Metrics</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Goal completion rate + trend</li>
                  <li>• Quality score trajectory</li>
                  <li>• Strategic alignment rate</li>
                  <li>• Workforce health indicators</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h4 className="font-semibold">Recommendations</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Boost goal completion tactics</li>
                  <li>• Alignment improvement steps</li>
                  <li>• Workload redistribution</li>
                  <li>• Training recommendations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <WorkflowDiagram 
          title="Key Insights AI Panel Data Flow" 
          diagram={KEY_INSIGHTS_DIAGRAM}
        />

        {/* Export Intelligence Report */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Export Intelligence Report
          </h3>
          <p className="text-muted-foreground">
            The <strong>Export Intelligence Report</strong> feature (in AI Reports section) generates a 
            comprehensive PDF document containing:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">Report Contents</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Cover Page:</strong> Report title, date, included sections</li>
                <li>• <strong>AI Executive Summary:</strong> AI-generated narrative overview</li>
                <li>• <strong>Operations Analytics:</strong> Goals, completion rates, quality</li>
                <li>• <strong>Workforce Insights:</strong> Workload distribution, capacity</li>
                <li>• <strong>Alignment Analytics:</strong> Cascade metrics, broken chains</li>
                <li>• <strong>Predictive Intelligence:</strong> Risk summary, health score</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">Customization Options</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select/deselect individual sections</li>
                <li>• Enable/disable AI Executive Summary</li>
                <li>• Filter by company (if multi-tenant)</li>
                <li>• Progress indicator during generation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Predictive AI Capabilities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Predictive AI Capabilities
          </h3>
          <p className="text-muted-foreground">
            The Predictive AI section provides advanced analytics powered by machine learning:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { 
                icon: AlertTriangle, 
                title: 'Performance Risk Dashboard', 
                desc: 'Real-time risk assessment across the organization with intervention recommendations',
                color: 'text-red-600'
              },
              { 
                icon: Star, 
                title: 'High Potential Identification', 
                desc: 'AI-powered detection of high-potential employees for succession planning',
                color: 'text-amber-600'
              },
              { 
                icon: TrendingUp, 
                title: 'Predictive Insights', 
                desc: 'Performance trajectory predictions based on historical patterns',
                color: 'text-green-600'
              },
              { 
                icon: Eye, 
                title: 'Risk Flags', 
                desc: 'Early warning indicators for performance decline or engagement issues',
                color: 'text-orange-600'
              }
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <h4 className="font-semibold">{item.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Attrition Risk Deep Dive */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Understanding Attrition Risk Scores
          </h3>
          <div className="space-y-3">
            {[
              { range: '0-25%', label: 'Low Risk', color: 'bg-success/10 border-success/30 text-success', guidance: 'Employee shows strong engagement and commitment signals. Standard retention practices apply.' },
              { range: '26-50%', label: 'Moderate Risk', color: 'bg-warning/10 border-warning/30 text-warning', guidance: 'Some warning signals present. Consider check-in conversation and career pathing discussion.' },
              { range: '51-75%', label: 'High Risk', color: 'bg-orange-500/10 border-orange-500/30 text-orange-500', guidance: 'Multiple risk factors detected. Proactive intervention recommended—retention bonus, role change, or development investment.' },
              { range: '76-100%', label: 'Critical Risk', color: 'bg-destructive/10 border-destructive/30 text-destructive', guidance: 'Departure highly likely without intervention. Immediate stay conversation and counteroffer planning if key talent.' }
            ].map((item) => (
              <div key={item.range} className={`p-4 rounded-lg border ${item.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm font-bold text-foreground">{item.range}</span>
                  <Badge className={`border ${item.color}`}>{item.label}</Badge>
                </div>
                <p className="text-sm text-foreground/80">{item.guidance}</p>
              </div>
            ))}
          </div>
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

        {/* Cycle Filtering */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Appraisal Cycle Filtering
          </h3>
          <p className="text-muted-foreground">
            When viewing the <strong>Appraisals</strong> section, a <strong>Cycle Filter</strong> dropdown 
            appears in the header. This allows you to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>View analytics for a specific appraisal cycle</li>
            <li>Compare metrics across different cycles (select "All Cycles")</li>
            <li>Active cycles are highlighted with a badge for easy identification</li>
            <li>Distribution, competency heatmap, and manager patterns update based on selection</li>
          </ul>
        </div>

        {/* AI Explainability */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            AI Explainability (ISO 42001)
          </h3>
          <p className="text-muted-foreground text-sm">
            Every AI prediction and insight includes an explainability record showing:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { element: 'Confidence Score', desc: 'Percentage indicating model certainty (higher = more reliable)' },
              { element: 'Decision Factors', desc: 'Key inputs that influenced the prediction, weighted by importance' },
              { element: 'Source Data Summary', desc: 'Overview of data points considered (e.g., 3 performance cycles, 12 months engagement data)' },
              { element: 'Limitations', desc: 'Known constraints or data gaps that may affect accuracy' },
              { element: 'Model Version', desc: 'AI model identifier for audit trail' },
              { element: 'Human Review Status', desc: 'Whether prediction has been reviewed by HR or manager' }
            ].map((item) => (
              <div key={item.element} className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm">{item.element}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Data Requirements for Predictions</h3>
          <p className="text-muted-foreground text-sm">
            AI predictions become more accurate with more data. Here are the minimum thresholds:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 border-b">Prediction Type</th>
                  <th className="text-left p-3 border-b">Minimum Data</th>
                  <th className="text-left p-3 border-b">Optimal Data</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Attrition Risk', min: '6 months tenure, 1 cycle', optimal: '2+ years, 3+ cycles' },
                  { type: 'Performance Trajectory', min: '2 performance cycles', optimal: '4+ cycles with goals' },
                  { type: 'Bias Patterns', min: '20 evaluations per manager', optimal: '50+ evaluations' },
                  { type: 'Key Insights Panel', min: '1 complete cycle with goals', optimal: 'Multiple cycles with full data' },
                  { type: 'Development Readiness', min: '1 IDP with progress', optimal: '2+ IDPs, LMS data' }
                ].map((row, i) => (
                  <tr key={row.type} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 border-b font-medium">{row.type}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.min}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.optimal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TipCallout title="Strategic Use">
          The Key Insights AI Panel provides a quick overview—use the Refresh button to regenerate insights 
          after significant data changes. For deep analysis, explore individual section tabs where you can 
          drill down into specific metrics and trends.
        </TipCallout>

        <WarningCallout title="Critical Governance">
          AI predictions must never be the sole basis for adverse employment actions (termination, 
          demotion, PIP). Always document human decision-making process when using AI insights.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
