import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Users, CheckCircle, TrendingUp, AlertTriangle, Brain, LineChart, PieChart, Activity, Eye, Shield } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { FieldReference } from '../../components/FieldReference';
import { BusinessRules } from '../../components/BusinessRules';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';

const FIELD_REFERENCES = [
  { fieldName: 'AI Analytics Dashboard', location: 'Performance → Analytics → AI Insights', required: false, description: 'Central hub for AI-generated performance predictions and trends' },
  { fieldName: 'Attrition Risk Indicator', location: 'Employee Profile / Manager Dashboard', required: false, description: 'AI-calculated probability of employee departure in next 6-12 months' },
  { fieldName: 'Performance Trajectory', location: 'Employee Analytics', required: false, description: 'Predicted performance trend based on historical patterns' },
  { fieldName: 'Bias Pattern Alert', location: 'HR Analytics / Manager Dashboard', required: false, description: 'AI detection of systematic rating patterns that may indicate bias' },
  { fieldName: 'Talent Risk Summary', location: 'Executive Dashboard', required: false, description: 'Aggregated view of high-risk employees and intervention recommendations' }
];

const BUSINESS_RULES = [
  { rule: 'Predictions require minimum data threshold', enforcement: 'System' as const, description: 'AI predictions require at least 2 performance cycles and 6 months of data.' },
  { rule: 'Risk scores are confidential', enforcement: 'Policy' as const, description: 'Attrition risk scores are visible only to manager, HR, and authorized executives.' },
  { rule: 'Predictions cannot be sole basis for decisions', enforcement: 'Policy' as const, description: 'AI insights must be combined with human judgment for personnel actions.' },
  { rule: 'All AI predictions are explainable', enforcement: 'System' as const, description: 'ISO 42001 requires clear reasoning for every AI-generated insight.' }
];

const WORKFLOW_DEFINITION = `graph TB
    subgraph Data Collection
        A[Performance Ratings] --> D[AI Analysis Engine]
        B[Goal Progress] --> D
        C[Engagement Signals] --> D
        E[Tenure & Demographics] --> D
    end
    
    subgraph AI Processing
        D --> F[Pattern Recognition]
        F --> G[Predictive Modeling]
        G --> H[Risk Scoring]
    end
    
    subgraph Outputs
        H --> I[Attrition Predictions]
        H --> J[Performance Forecasts]
        H --> K[Bias Alerts]
        H --> L[Development Insights]
    end
    
    subgraph Human Actions
        I --> M[Manager Review]
        J --> M
        K --> N[HR Investigation]
        L --> O[IDP Updates]
        M --> P[Intervention Planning]
    end
    
    style D fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style G fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style H fill:#8b5cf6,stroke:#7c3aed,color:#fff`;

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
        <CardDescription>Predictive intelligence for talent risk, performance trends, and strategic workforce insights</CardDescription>
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
            <li>Understand AI-powered talent analytics capabilities</li>
            <li>Interpret attrition risk scores and performance predictions</li>
            <li>Use AI insights for proactive talent management</li>
            <li>Apply appropriate governance when acting on predictions</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Analytics Overview
          </h3>
          <p className="text-muted-foreground">
            AI Analytics transforms performance data into actionable predictions. By analyzing patterns 
            across ratings, goal progress, engagement signals, and historical trends, the system 
            identifies risks and opportunities that might otherwise go unnoticed.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Strategic Value</p>
            <p className="text-sm text-muted-foreground mt-1">
              Organizations using predictive talent analytics reduce unwanted attrition by 20-30% 
              and identify high-potential employees 2x faster than traditional methods.
            </p>
          </div>
        </div>

        {/* Key Prediction Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Key Prediction Types</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { 
                icon: AlertTriangle, 
                title: 'Attrition Risk', 
                desc: 'Probability of employee departure within 6-12 months',
                signals: ['Declining engagement', 'Stagnant performance', 'Limited career movement', 'Market demand for skills'],
                color: 'text-red-600'
              },
              { 
                icon: TrendingUp, 
                title: 'Performance Trajectory', 
                desc: 'Predicted performance trend for coming periods',
                signals: ['Historical improvement rate', 'Goal achievement patterns', 'Skill development velocity', 'Manager effectiveness'],
                color: 'text-green-600'
              },
              { 
                icon: Eye, 
                title: 'Bias Pattern Detection', 
                desc: 'Systematic rating anomalies across demographics',
                signals: ['Rating distribution variance', 'Demographic disparities', 'Manager-level patterns', 'Calibration adjustment frequency'],
                color: 'text-amber-600'
              },
              { 
                icon: Activity, 
                title: 'Development Readiness', 
                desc: 'Likelihood of successful skill acquisition',
                signals: ['Learning completion rates', 'Skill gap closure velocity', 'Self-directed learning', 'Feedback receptivity'],
                color: 'text-blue-600'
              }
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <h4 className="font-semibold">{item.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Key Signals:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {item.signals.map((signal, i) => (
                        <li key={i}>• {signal}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <WorkflowDiagram 
          title="AI Analytics Data Flow" 
          diagram={WORKFLOW_DEFINITION}
        />

        {/* Attrition Risk Deep Dive */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Understanding Attrition Risk Scores
          </h3>
          <div className="space-y-3">
            {[
              { range: '0-25%', label: 'Low Risk', color: 'bg-green-100 text-green-800 border-green-300', guidance: 'Employee shows strong engagement and commitment signals. Standard retention practices apply.' },
              { range: '26-50%', label: 'Moderate Risk', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', guidance: 'Some warning signals present. Consider check-in conversation and career pathing discussion.' },
              { range: '51-75%', label: 'High Risk', color: 'bg-orange-100 text-orange-800 border-orange-300', guidance: 'Multiple risk factors detected. Proactive intervention recommended—retention bonus, role change, or development investment.' },
              { range: '76-100%', label: 'Critical Risk', color: 'bg-red-100 text-red-800 border-red-300', guidance: 'Departure highly likely without intervention. Immediate stay conversation and counteroffer planning if key talent.' }
            ].map((item) => (
              <div key={item.range} className={`p-4 rounded-lg border ${item.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm font-bold">{item.range}</span>
                  <Badge className={item.color}>{item.label}</Badge>
                </div>
                <p className="text-sm">{item.guidance}</p>
              </div>
            ))}
          </div>
        </div>

        <FieldReference fields={FIELD_REFERENCES} />

        {/* Analytics Dashboard Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics Dashboard Features
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: PieChart, title: 'Distribution Analysis', desc: 'Rating distribution across teams, departments, and demographics' },
              { icon: LineChart, title: 'Trend Visualization', desc: 'Historical performance trends with projected trajectories' },
              { icon: Activity, title: 'Risk Heat Map', desc: 'Visual representation of talent risk by organization unit' }
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-4 text-center">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Acting on Predictions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Acting on AI Predictions</h3>
          <div className="space-y-3">
            {[
              { prediction: 'High Attrition Risk', actions: ['Schedule stay interview', 'Review compensation competitiveness', 'Discuss career development', 'Consider retention incentives'] },
              { prediction: 'Declining Performance Trajectory', actions: ['Identify root causes (skills, motivation, context)', 'Provide targeted coaching', 'Adjust goals if needed', 'Increase check-in frequency'] },
              { prediction: 'Bias Pattern Detected', actions: ['Review flagged evaluations', 'Conduct manager coaching', 'Consider recalibration', 'Document investigation'] },
              { prediction: 'High Development Potential', actions: ['Accelerate stretch assignments', 'Add to succession pool', 'Invest in leadership development', 'Increase visibility with executives'] }
            ].map((item) => (
              <div key={item.prediction} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{item.prediction}</h4>
                <div className="flex flex-wrap gap-2">
                  {item.actions.map((action, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{action}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explainability */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            AI Explainability (ISO 42001)
          </h3>
          <p className="text-muted-foreground text-sm">
            Every AI prediction includes an explainability record showing:
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
          Use AI predictions for pattern recognition and early warning, not as definitive judgments. 
          The most effective organizations combine AI insights with manager intuition and HR expertise.
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
