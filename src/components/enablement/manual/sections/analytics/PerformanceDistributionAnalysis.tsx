import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Clock, Users, CheckCircle, BarChart3, AlertTriangle, Target, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';

const FIELD_REFERENCES = [
  { fieldName: 'Distribution Chart', location: 'Appraisals → Distribution Tab', required: false, description: 'Bar and pie charts showing rating category breakdown' },
  { fieldName: 'Total Participants', location: 'Distribution Tab Header', required: false, description: 'Count of completed evaluations in current filter scope' },
  { fieldName: 'Average Score', location: 'Distribution Tab Header', required: false, description: 'Mean score across all completed evaluations' },
  { fieldName: 'Category Breakdown', location: 'Distribution Chart', required: false, description: 'Count and percentage per performance category' },
  { fieldName: 'Target Distribution', location: 'Benchmark Comparison', required: false, description: 'Expected distribution based on configured benchmarks' }
];

const BUSINESS_RULES = [
  { rule: 'Only completed appraisals count', enforcement: 'System' as const, description: 'Distribution only includes evaluations with status "Completed" or post-calibration scores.' },
  { rule: 'Categories are company-configurable', enforcement: 'Advisory' as const, description: 'Performance categories and their score ranges are defined in Setup → Performance Categories.' },
  { rule: 'Distribution alerts at 40%+ threshold', enforcement: 'System' as const, description: 'System flags when any single category exceeds 40% of total distribution.' },
  { rule: 'Post-calibration scores take precedence', enforcement: 'System' as const, description: 'If calibrated, post-calibration score is used; otherwise pre-calibration score.' }
];

const DISTRIBUTION_WORKFLOW = `graph TB
    subgraph Data Collection
        A[Completed Evaluations] --> D[Score Aggregation]
        B[Pre-Calibration Scores] --> D
        C[Post-Calibration Scores] --> D
    end
    
    subgraph Categorization
        D --> E{Score Range Check}
        E -->|4.5-5.0| F[Exceptional]
        E -->|3.5-4.49| G[Exceeds]
        E -->|2.5-3.49| H[Meets]
        E -->|1.5-2.49| I[Needs Improvement]
        E -->|1.0-1.49| J[Unsatisfactory]
    end
    
    subgraph Visualization
        F --> K[Distribution Chart]
        G --> K
        H --> K
        I --> K
        J --> K
        K --> L[Benchmark Comparison]
    end
    
    style D fill:#3b82f6,stroke:#2563eb,color:#fff
    style K fill:#8b5cf6,stroke:#7c3aed,color:#fff`;

export function PerformanceDistributionAnalysis() {
  return (
    <Card id="sec-6-2">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.2</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR User / Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Performance Distribution Analysis</CardTitle>
        <CardDescription>Analyzing rating distributions to identify patterns and ensure calibration effectiveness</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-6-2']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Interpret performance distribution charts and statistics</li>
            <li>Compare actual distributions to target benchmarks</li>
            <li>Identify distribution anomalies requiring investigation</li>
            <li>Use distribution insights for calibration planning</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Understanding Performance Distribution
          </h3>
          <p className="text-muted-foreground">
            Performance distribution analysis shows how employees are rated across performance categories. 
            A healthy distribution typically follows a bell curve with most employees in the middle categories. 
            Skewed distributions may indicate rating inflation, deflation, or need for calibration.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Why Distribution Matters</p>
            <p className="text-sm text-muted-foreground mt-1">
              Consistent distribution across the organization ensures fair differentiation and supports 
              merit-based compensation decisions. Abnormal patterns often reveal unconscious biases or 
              misunderstanding of rating criteria.
            </p>
          </div>
        </div>

        <WorkflowDiagram 
          title="Distribution Calculation Flow" 
          diagram={DISTRIBUTION_WORKFLOW}
        />

        {/* Standard Categories */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Standard Performance Categories</h3>
          <p className="text-muted-foreground text-sm">
            The system calculates distribution based on final scores mapped to configured categories:
          </p>
          <div className="space-y-3">
            {[
              { category: 'Exceptional', range: '4.5 - 5.0', target: '5-10%', color: 'bg-green-500', desc: 'Significantly exceeds all expectations. Role model performance.' },
              { category: 'Exceeds Expectations', range: '3.5 - 4.49', target: '15-25%', color: 'bg-blue-500', desc: 'Consistently exceeds requirements in most areas.' },
              { category: 'Meets Expectations', range: '2.5 - 3.49', target: '50-60%', color: 'bg-primary', desc: 'Fully meets job requirements. Solid, reliable performer.' },
              { category: 'Needs Improvement', range: '1.5 - 2.49', target: '10-20%', color: 'bg-amber-500', desc: 'Partially meets expectations. Development plan required.' },
              { category: 'Unsatisfactory', range: '1.0 - 1.49', target: '0-5%', color: 'bg-red-500', desc: 'Does not meet minimum requirements. PIP consideration.' }
            ].map((item) => (
              <div key={item.category} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.category}</span>
                    <Badge variant="outline" className="text-xs font-mono">{item.range}</Badge>
                    <Badge variant="secondary" className="text-xs">Target: {item.target}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step: Viewing Distribution */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step-by-Step: Viewing Distribution Analysis</h3>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground ml-2">
            <li>
              <strong>Navigate to Intelligence Hub</strong>
              <p className="ml-6 text-sm mt-1">Go to <strong>Performance → Intelligence Hub</strong>.</p>
            </li>
            <li>
              <strong>Select Appraisals Section</strong>
              <p className="ml-6 text-sm mt-1">Click the <strong>Appraisals</strong> button in the section navigation bar.</p>
            </li>
            <li>
              <strong>Choose Distribution Tab</strong>
              <p className="ml-6 text-sm mt-1">The Distribution tab is selected by default. View the bar and pie charts.</p>
            </li>
            <li>
              <strong>Apply Cycle Filter (Optional)</strong>
              <p className="ml-6 text-sm mt-1">Use the <strong>Cycle Filter</strong> dropdown to analyze a specific appraisal cycle.</p>
            </li>
            <li>
              <strong>Review Summary Statistics</strong>
              <p className="ml-6 text-sm mt-1">Note the <strong>Total Participants</strong> count and <strong>Average Score</strong> in the header.</p>
            </li>
            <li>
              <strong>Analyze Category Breakdown</strong>
              <p className="ml-6 text-sm mt-1">Hover over chart segments to see exact counts and percentages per category.</p>
            </li>
          </ol>
        </div>

        {/* Distribution Patterns */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Common Distribution Patterns
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { 
                pattern: 'Healthy Bell Curve', 
                indicator: TrendingUp,
                indicatorColor: 'text-green-600',
                description: 'Majority in "Meets" (50-60%), balanced tails. Indicates proper calibration.',
                action: 'No immediate action needed. Continue monitoring.'
              },
              { 
                pattern: 'Leniency Bias (Right Skew)', 
                indicator: AlertTriangle,
                indicatorColor: 'text-amber-600',
                description: '70%+ in top categories (Exceeds/Exceptional). Ratings may be inflated.',
                action: 'Consider calibration session. Review rating criteria training.'
              },
              { 
                pattern: 'Strictness Bias (Left Skew)', 
                indicator: AlertTriangle,
                indicatorColor: 'text-amber-600',
                description: '40%+ in bottom categories. May indicate overly harsh standards.',
                action: 'Review manager coaching. Calibrate against peer groups.'
              },
              { 
                pattern: 'Central Tendency', 
                indicator: TrendingDown,
                indicatorColor: 'text-red-600',
                description: '80%+ in "Meets" category. Lack of differentiation.',
                action: 'Manager training on using full scale. Calibration required.'
              }
            ].map((item) => (
              <Card key={item.pattern}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <item.indicator className={`h-5 w-5 ${item.indicatorColor}`} />
                    <h4 className="font-semibold">{item.pattern}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Recommended Action:</strong> {item.action}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Benchmark Comparison
          </h3>
          <p className="text-muted-foreground">
            Compare your organization's distribution against configured benchmarks:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 border-b">Category</th>
                  <th className="text-center p-3 border-b">Target %</th>
                  <th className="text-center p-3 border-b">Example Actual</th>
                  <th className="text-center p-3 border-b">Variance</th>
                  <th className="text-left p-3 border-b">Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { category: 'Exceptional', target: '8%', actual: '12%', variance: '+4%', interpretation: 'Above target - review if justified' },
                  { category: 'Exceeds', target: '20%', actual: '25%', variance: '+5%', interpretation: 'Slightly high - monitor next cycle' },
                  { category: 'Meets', target: '55%', actual: '48%', variance: '-7%', interpretation: 'Below target - may indicate leniency' },
                  { category: 'Needs Improvement', target: '12%', actual: '10%', variance: '-2%', interpretation: 'Within tolerance' },
                  { category: 'Unsatisfactory', target: '5%', actual: '5%', variance: '0%', interpretation: 'On target' }
                ].map((row, i) => (
                  <tr key={row.category} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 border-b font-medium">{row.category}</td>
                    <td className="p-3 border-b text-center">{row.target}</td>
                    <td className="p-3 border-b text-center">{row.actual}</td>
                    <td className="p-3 border-b text-center font-mono">{row.variance}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.interpretation}</td>
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

        <TipCallout title="Pre-Calibration Analysis">
          Run distribution analysis before calibration sessions to identify which departments 
          or managers show patterns that need discussion. Share charts in calibration meetings.
        </TipCallout>

        <WarningCallout title="Small Sample Sizes">
          Distribution percentages may be misleading for small groups (under 20 employees). 
          Consider combining smaller departments for meaningful analysis.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
