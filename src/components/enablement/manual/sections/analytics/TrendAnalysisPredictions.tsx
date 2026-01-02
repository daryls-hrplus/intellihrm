import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Users, CheckCircle, Brain, LineChart, BarChart3, AlertTriangle, Target, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';

const FIELD_REFERENCES = [
  { fieldName: 'Predictive AI Section', location: 'Intelligence Hub → Predictive AI Tab', required: false, description: 'AI-powered predictions and risk analysis' },
  { fieldName: 'Performance Risks', location: 'Predictive AI → Risks Tab', required: false, description: 'Dashboard showing employees with declining performance patterns' },
  { fieldName: 'High Potentials', location: 'Predictive AI → High Potentials Tab', required: false, description: 'AI-identified high-potential employees for succession planning' },
  { fieldName: 'Predictive Insights', location: 'Predictive AI → Insights Tab', required: false, description: 'AI-generated forecasts and trend predictions' },
  { fieldName: 'Risk Flags', location: 'Predictive AI → Risk Flags Tab', required: false, description: 'Early warning indicators for performance decline' },
  { fieldName: 'Trend Indicators', location: 'Key Insights Panel', required: false, description: 'Up/down/stable arrows showing metric direction' }
];

const BUSINESS_RULES = [
  { rule: 'Minimum data for predictions', enforcement: 'System' as const, description: 'AI predictions require at least 2 performance cycles and 6 months of data.' },
  { rule: 'Predictions are guidance only', enforcement: 'Policy' as const, description: 'AI insights must be combined with human judgment for personnel decisions.' },
  { rule: 'Trend calculations use 3+ cycles', enforcement: 'System' as const, description: 'Year-over-year trends require minimum 3 cycles for statistical significance.' },
  { rule: 'AI outputs are explainable', enforcement: 'System' as const, description: 'All predictions include confidence scores and decision factors (ISO 42001).' }
];

const TREND_WORKFLOW = `graph TB
    subgraph Historical Data
        A[Cycle 1 Scores] --> E[Trend Engine]
        B[Cycle 2 Scores] --> E
        C[Cycle 3 Scores] --> E
        D[Goal Progress] --> E
    end
    
    subgraph Analysis
        E --> F[Calculate Trends]
        E --> G[Detect Patterns]
        E --> H[Generate Predictions]
    end
    
    subgraph AI Insights
        F --> I[YoY Comparisons]
        G --> J[Risk Detection]
        H --> K[Future Projections]
    end
    
    subgraph Outputs
        I --> L[Trend Charts]
        J --> M[Risk Alerts]
        K --> N[Recommendations]
    end
    
    style E fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style H fill:#8b5cf6,stroke:#7c3aed,color:#fff`;

export function TrendAnalysisPredictions() {
  return (
    <Card id="sec-6-4">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.4</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~15 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR User / Admin / Executive</Badge>
        </div>
        <CardTitle className="text-2xl">Trend Analysis & Predictions</CardTitle>
        <CardDescription>Leveraging historical data and AI for performance forecasting and strategic insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-6-4']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Interpret year-over-year performance trends</li>
            <li>Understand AI prediction capabilities and limitations</li>
            <li>Use trend data for strategic workforce planning</li>
            <li>Identify performance risks before they escalate</li>
            <li>Leverage predictive insights for proactive talent management</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Understanding Trend Analysis
          </h3>
          <p className="text-muted-foreground">
            Trend analysis examines performance data across multiple cycles to identify patterns, 
            predict future outcomes, and surface risks early. The <strong>Predictive AI</strong> section 
            in the Intelligence Hub provides AI-powered trend analysis and forecasting.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Strategic Value</p>
            <p className="text-sm text-muted-foreground mt-1">
              Organizations using predictive talent analytics reduce unwanted attrition by 20-30% 
              and identify emerging leaders 2x faster than those relying on point-in-time reviews.
            </p>
          </div>
        </div>

        <WorkflowDiagram 
          title="Trend & Prediction Flow" 
          diagram={TREND_WORKFLOW}
        />

        {/* Trend Indicators */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Reading Trend Indicators
          </h3>
          <p className="text-muted-foreground">
            The Key Insights AI Panel and analytics displays use directional indicators:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { 
                icon: ArrowUp, 
                color: 'text-green-600 bg-green-500/10', 
                label: 'Improving', 
                description: 'Metric trending upward compared to previous period. Continue current approach.' 
              },
              { 
                icon: ArrowDown, 
                color: 'text-red-600 bg-red-500/10', 
                label: 'Declining', 
                description: 'Metric trending downward. Investigate root causes and consider interventions.' 
              },
              { 
                icon: Minus, 
                color: 'text-muted-foreground bg-muted/50', 
                label: 'Stable', 
                description: 'Metric relatively unchanged. Monitor for any emerging patterns.' 
              }
            ].map((item) => (
              <Card key={item.label} className={item.color.split(' ')[1]}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`h-6 w-6 ${item.color.split(' ')[0]}`} />
                    <h4 className="font-semibold">{item.label}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Predictive AI Capabilities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Predictive AI Capabilities
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { 
                tab: 'Performance Risks', 
                icon: AlertTriangle,
                color: 'text-red-600',
                description: 'Identifies employees with declining performance trajectories based on rating trends, goal completion patterns, and engagement signals.',
                outputs: ['Risk severity classification', 'Contributing factors', 'Intervention recommendations']
              },
              { 
                tab: 'High Potentials', 
                icon: Target,
                color: 'text-amber-600',
                description: 'AI detection of high-potential employees based on performance consistency, growth velocity, and leadership indicators.',
                outputs: ['Potential rating', 'Development readiness', 'Succession pool eligibility']
              },
              { 
                tab: 'Predictive Insights', 
                icon: LineChart,
                color: 'text-blue-600',
                description: 'AI-generated forecasts for key metrics including completion rates, average scores, and distribution patterns.',
                outputs: ['Next cycle predictions', 'Confidence intervals', 'Scenario modeling']
              },
              { 
                tab: 'Risk Flags', 
                icon: AlertTriangle,
                color: 'text-orange-600',
                description: 'Early warning indicators that surface before full risk materialization. Enables proactive intervention.',
                outputs: ['Flight risk indicators', 'Burnout signals', 'Engagement drops']
              }
            ].map((item) => (
              <Card key={item.tab}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <h4 className="font-semibold">{item.tab}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div>
                    <p className="text-xs font-medium mb-1">Key Outputs:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.outputs.map((output, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{output}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Year-over-Year Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Year-over-Year Analysis
          </h3>
          <p className="text-muted-foreground">
            Compare key metrics across cycles to identify long-term trends:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 border-b">Metric</th>
                  <th className="text-center p-3 border-b">2023</th>
                  <th className="text-center p-3 border-b">2024</th>
                  <th className="text-center p-3 border-b">2025</th>
                  <th className="text-center p-3 border-b">Trend</th>
                  <th className="text-left p-3 border-b">Insight</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: 'Avg Score', y1: '3.2', y2: '3.4', y3: '3.5', trend: 'up', insight: 'Consistent improvement—training investments paying off' },
                  { metric: 'Completion Rate', y1: '88%', y2: '92%', y3: '95%', trend: 'up', insight: 'Process improvements and manager accountability working' },
                  { metric: 'On-Time Rate', y1: '82%', y2: '85%', y3: '84%', trend: 'stable', insight: 'Plateau reached—consider deadline adjustments' },
                  { metric: 'Calibrated %', y1: '75%', y2: '80%', y3: '87%', trend: 'up', insight: 'Calibration adoption increasing' },
                  { metric: 'High Performers', y1: '22%', y2: '25%', y3: '28%', trend: 'up', insight: 'Potential rating inflation—review with calibration' }
                ].map((row, i) => (
                  <tr key={row.metric} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 border-b font-medium">{row.metric}</td>
                    <td className="p-3 border-b text-center">{row.y1}</td>
                    <td className="p-3 border-b text-center">{row.y2}</td>
                    <td className="p-3 border-b text-center">{row.y3}</td>
                    <td className="p-3 border-b text-center">
                      {row.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-600 mx-auto" />}
                      {row.trend === 'down' && <ArrowDown className="h-4 w-4 text-red-600 mx-auto" />}
                      {row.trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </td>
                    <td className="p-3 border-b text-muted-foreground">{row.insight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Using Predictions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Acting on Predictive Insights</h3>
          <div className="space-y-3">
            {[
              { 
                prediction: 'High Attrition Risk', 
                actions: ['Schedule stay interview within 2 weeks', 'Review compensation competitiveness', 'Discuss career development opportunities', 'Consider retention incentives if key talent'],
                urgency: 'High'
              },
              { 
                prediction: 'Declining Performance Trajectory', 
                actions: ['Identify root causes (skills, motivation, context)', 'Increase check-in frequency', 'Provide targeted coaching or training', 'Adjust goals if unrealistic'],
                urgency: 'Medium'
              },
              { 
                prediction: 'High Potential Identified', 
                actions: ['Add to succession planning pipeline', 'Assign stretch projects', 'Increase executive visibility', 'Invest in leadership development'],
                urgency: 'Opportunity'
              },
              { 
                prediction: 'Burnout Risk Flag', 
                actions: ['Review workload distribution', 'Consider temporary support', 'Discuss work-life balance', 'Monitor for continued signs'],
                urgency: 'Medium'
              }
            ].map((item) => (
              <div key={item.prediction} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{item.prediction}</h4>
                  <Badge variant={item.urgency === 'High' ? 'destructive' : item.urgency === 'Opportunity' ? 'default' : 'secondary'}>
                    {item.urgency}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.actions.map((action, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{action}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Data Requirements for Predictions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 border-b">Prediction Type</th>
                  <th className="text-left p-3 border-b">Minimum Data</th>
                  <th className="text-left p-3 border-b">Optimal Data</th>
                  <th className="text-left p-3 border-b">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Attrition Risk', min: '6 months, 1 cycle', optimal: '2+ years, 3+ cycles', accuracy: '75-85%' },
                  { type: 'Performance Trajectory', min: '2 cycles', optimal: '4+ cycles with goals', accuracy: '70-80%' },
                  { type: 'High Potential', min: '2 cycles, consistent scores', optimal: '3+ cycles, 360 feedback', accuracy: '80-90%' },
                  { type: 'YoY Trends', min: '3 cycles', optimal: '5+ cycles', accuracy: 'N/A (descriptive)' }
                ].map((row, i) => (
                  <tr key={row.type} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 border-b font-medium">{row.type}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.min}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.optimal}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.accuracy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        <TipCallout title="Strategic Planning Use">
          Share trend analysis with executive leadership during strategic planning cycles. 
          Use predictions to inform headcount planning, training investments, and succession priorities.
        </TipCallout>

        <WarningCallout title="Prediction Limitations">
          AI predictions are probabilistic, not deterministic. Never use predictions as the sole 
          basis for employment decisions. Always combine with human judgment and document reasoning.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
