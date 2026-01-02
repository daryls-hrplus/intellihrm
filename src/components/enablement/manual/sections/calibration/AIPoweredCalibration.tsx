import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, Users, CheckCircle, AlertTriangle, TrendingUp, Shield, Lightbulb, BarChart3, Eye } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, InfoCallout } from '../../components/Callout';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const BUSINESS_RULES = [
  { rule: 'AI suggestions require human approval', enforcement: 'System' as const, description: 'No AI recommendation is automatically applied. A human must review and accept each suggestion.' },
  { rule: 'AI must explain reasoning', enforcement: 'System' as const, description: 'Every AI suggestion includes a natural language explanation of why it was generated.' },
  { rule: 'Bias detection is mandatory', enforcement: 'Policy' as const, description: 'AI bias detection runs automatically on all calibration sessions. Findings are logged.' },
  { rule: 'AI confidence thresholds apply', enforcement: 'System' as const, description: 'Suggestions below 70% confidence are flagged as low-confidence and require additional review.' }
];

const TROUBLESHOOTING = [
  { issue: 'AI insights panel shows "No insights available"', cause: 'Insufficient data for analysis or AI features disabled.', solution: 'Ensure at least 10 participants in session. Check AI is enabled in session settings.' },
  { issue: 'Bias detection shows unexpected results', cause: 'Small sample sizes or legitimate performance differences.', solution: 'Review the statistical significance indicators. Small groups may show false patterns.' },
  { issue: 'AI suggestions seem incorrect', cause: 'AI works on patterns and may miss context.', solution: 'This is expected—AI is a decision support tool, not a decision maker. Always apply human judgment.' },
  { issue: 'AI features are slow to load', cause: 'Complex analysis on large datasets.', solution: 'Wait for processing (typically 10-30 seconds). Check connection status.' }
];

export function AIPoweredCalibration() {
  return (
    <Card id="sec-4-4">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.4</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin / Facilitators</Badge>
        </div>
        <CardTitle className="text-2xl">AI-Powered Calibration Features</CardTitle>
        <CardDescription>Leveraging artificial intelligence for bias detection, anomaly identification, and calibration assistance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Calibration', 'Sessions', '[Session Name]', 'AI Insights']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand AI capabilities in calibration sessions</li>
            <li>Interpret AI-generated insights and suggestions</li>
            <li>Use bias detection to ensure fair outcomes</li>
            <li>Apply AI recommendations responsibly with human oversight</li>
          </ul>
        </div>

        {/* AI Capabilities Overview */}
        <WorkflowDiagram 
          title="AI Calibration Assistant Architecture"
          description="How AI analyzes data and provides calibration support"
          diagram={`flowchart LR
    subgraph Input["📊 Data Inputs"]
        I1[Rating Data]
        I2[Historical Trends]
        I3[Demographic Data]
        I4[Manager Patterns]
    end
    
    subgraph AI["🤖 AI Analysis Engine"]
        A1[Anomaly Detection]
        A2[Bias Detection]
        A3[Pattern Recognition]
        A4[Suggestion Generation]
    end
    
    subgraph Output["💡 AI Outputs"]
        O1[Flagged Employees]
        O2[Bias Alerts]
        O3[Adjustment Suggestions]
        O4[Confidence Scores]
    end
    
    subgraph Human["👤 Human Decision"]
        H1[Review & Approve]
        H2[Modify & Accept]
        H3[Reject with Reason]
    end
    
    Input --> AI
    AI --> Output
    Output --> Human`}
        />

        <InfoCallout title="AI Governance">
          All AI features in HRPlus comply with ISO 30409:2024 standards for HR AI governance. 
          Human oversight is mandatory—AI augments, never replaces, human decision-making.
        </InfoCallout>

        {/* AI Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI Feature Categories</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: AlertTriangle, title: 'Anomaly Detection', desc: 'Identifies ratings that deviate significantly from expected patterns based on historical performance, peer comparison, and goal achievement.', color: 'text-amber-600' },
              { icon: Shield, title: 'Bias Detection', desc: 'Analyzes rating distributions across demographic groups (gender, age, tenure, location) to identify potential systemic bias patterns.', color: 'text-red-600' },
              { icon: TrendingUp, title: 'Trend Analysis', desc: 'Compares current ratings against historical trends for individuals and teams. Flags unusual year-over-year changes.', color: 'text-blue-600' },
              { icon: Lightbulb, title: 'Smart Suggestions', desc: 'Proposes rating adjustments based on evidence analysis, peer comparison, and organizational distribution targets.', color: 'text-green-600' }
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Anomaly Detection Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Anomaly Detection
          </h3>
          <p className="text-muted-foreground">
            The AI analyzes multiple data points to identify ratings that warrant closer review. 
            Anomalies are not necessarily incorrect—they require human verification.
          </p>
          <div className="space-y-3">
            {[
              { type: 'Rating-Goal Mismatch', description: 'High rating but low goal achievement (or vice versa)', example: '"Exceeds Expectations" rating with only 65% goal completion' },
              { type: 'Manager Pattern Deviation', description: 'Rating differs significantly from manager\'s typical distribution', example: 'Manager usually rates 60% "Meets", but this employee is only "Needs Improvement"' },
              { type: 'Peer Comparison Outlier', description: 'Rating differs significantly from peers with similar performance data', example: 'Lower rating than peers with equivalent goal scores and competency ratings' },
              { type: 'Historical Trend Break', description: 'Significant rating change without corresponding performance change', example: 'Rating dropped from 4.5 to 2.5 with no documented performance issues' },
              { type: 'Component Score Conflict', description: 'Large variance between different evaluation components', example: 'Goals: 4.8, Competencies: 2.1 (unusual gap)' }
            ].map((item) => (
              <div key={item.type} className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                <h4 className="font-semibold text-amber-800">{item.type}</h4>
                <p className="text-sm text-amber-700">{item.description}</p>
                <p className="text-xs text-amber-600 italic">Example: {item.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bias Detection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Bias Detection & Fairness Analysis
          </h3>
          <p className="text-muted-foreground">
            AI continuously monitors rating distributions across protected characteristics to identify 
            potential bias patterns that may not be visible in individual reviews.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Analysis Type</th>
                  <th className="text-left py-2 px-3 font-medium">What It Measures</th>
                  <th className="text-left py-2 px-3 font-medium">Alert Threshold</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Gender Distribution', measure: 'Rating average by gender', threshold: '>0.3 point difference' },
                  { type: 'Age Group Analysis', measure: 'Rating patterns across age bands', threshold: 'Statistically significant variance' },
                  { type: 'Tenure Impact', measure: 'Correlation between tenure and ratings', threshold: 'R² > 0.4 correlation' },
                  { type: 'Manager Consistency', measure: 'Rating variance across managers for similar roles', threshold: '>0.5 point standard deviation' },
                  { type: 'Department Comparison', measure: 'Rating distributions across departments', threshold: 'Distribution significantly differs from org average' }
                ].map((item) => (
                  <tr key={item.type} className="border-b">
                    <td className="py-2 px-3 font-medium">{item.type}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.measure}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Suggestion Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-600" />
            Understanding AI Suggestions
          </h3>
          <div className="p-4 border rounded-lg bg-green-50 border-green-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-green-800">AI Suggestion: Adjust Rating Upward</h4>
              <Badge className="bg-green-600 text-white">85% Confidence</Badge>
            </div>
            <div className="text-sm text-green-700 space-y-2">
              <p><strong>Employee:</strong> John Smith • <strong>Current:</strong> Meets Expectations • <strong>Suggested:</strong> Exceeds Expectations</p>
              <div className="p-3 bg-green-100 rounded">
                <p className="font-medium">AI Reasoning:</p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li>Goal achievement: 115% (significantly above average)</li>
                  <li>Competency scores: 4.3/5.0 (highest in peer group)</li>
                  <li>Manager's other "Exceeds" ratings show similar patterns</li>
                  <li>Previous year rating: "Exceeds" with consistent performance trend</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-green-100">Accept Suggestion</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-amber-100">Modify & Accept</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-red-100">Reject</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Every AI suggestion includes confidence level, reasoning, and supporting data. 
            Facilitators can accept, modify, or reject each suggestion with documented rationale.
          </p>
        </div>

        {/* Confidence Levels */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Confidence Level Interpretation</h3>
          <div className="space-y-2">
            {[
              { level: 'High (85-100%)', color: 'bg-green-600', description: 'Strong evidence supports the suggestion. Multiple data points align. Recommended for straightforward acceptance.' },
              { level: 'Medium (70-84%)', color: 'bg-amber-600', description: 'Good supporting evidence but some factors require human review. Suggested for discussion before decision.' },
              { level: 'Low (<70%)', color: 'bg-red-600', description: 'Limited evidence or conflicting data. Suggestion requires careful human analysis. Not recommended for direct acceptance.' }
            ].map((item) => (
              <div key={item.level} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge className={`${item.color} text-white min-w-[120px] justify-center`}>{item.level}</Badge>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Best Practice">
          Start each calibration session by reviewing AI-flagged anomalies. This ensures potential issues 
          are discussed early when facilitators and attendees have the most energy and focus.
        </TipCallout>

        <WarningCallout title="Important Limitation">
          AI cannot understand organizational context, politics, or nuanced situations. A low-confidence 
          AI suggestion may still be correct, and a high-confidence suggestion may miss important context. 
          Always apply human judgment.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
