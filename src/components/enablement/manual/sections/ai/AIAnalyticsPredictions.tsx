import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, Brain, Shield, Link, BookOpen, Eye, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS, RELATED_TOPICS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';

const BUSINESS_RULES = [
  { rule: 'Predictions require minimum data threshold', enforcement: 'System' as const, description: 'AI predictions require at least 2 performance cycles and 6 months of data.' },
  { rule: 'Risk scores are confidential', enforcement: 'Policy' as const, description: 'Attrition risk scores are visible only to manager, HR, and authorized executives.' },
  { rule: 'Predictions cannot be sole basis for decisions', enforcement: 'Policy' as const, description: 'AI insights must be combined with human judgment for personnel actions.' },
  { rule: 'All AI predictions are explainable', enforcement: 'System' as const, description: 'ISO 42001 requires clear reasoning for every AI-generated insight.' },
  { rule: 'Key Insights auto-refresh on data change', enforcement: 'System' as const, description: 'AI insights panel regenerates when underlying analytics data is updated.' }
];

export function AIAnalyticsPredictions() {
  const relatedTopics = RELATED_TOPICS['sec-5-6'] || [];

  return (
    <Card id="sec-5-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.6</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR / Executive / Manager</Badge>
        </div>
        <CardTitle className="text-2xl">AI-Powered Analytics Overview</CardTitle>
        <CardDescription>How AI enhances analytics across the Performance Intelligence Hub</CardDescription>
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
            <li>Understand how AI is embedded throughout the Intelligence Hub</li>
            <li>Apply appropriate governance when acting on AI predictions</li>
            <li>Interpret AI confidence scores and explainability indicators</li>
            <li>Know when AI recommendations require human review</li>
          </ul>
        </div>

        {/* Introduction */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Throughout the Intelligence Hub
          </h3>
          <p className="text-muted-foreground">
            AI capabilities are embedded throughout the Performance Intelligence Hub, not isolated to a single section. 
            This overview explains how AI enhances analytics and the governance principles that apply when using AI-generated insights.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Where AI Appears in the Hub</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• <strong>Key Insights Panel:</strong> AI-generated summary of critical risks and recommendations (all sections)</li>
              <li>• <strong>Predictive AI Tab:</strong> Performance risks, high potentials, trajectory predictions</li>
              <li>• <strong>AI Reports Tab:</strong> AI-powered executive summaries in exported reports</li>
              <li>• <strong>Trend Analysis:</strong> AI-driven pattern recognition and forecasting</li>
            </ul>
          </div>
        </div>

        {/* Cross-Reference to Part 6 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Related Documentation
          </h3>
          <p className="text-muted-foreground">
            For detailed coverage of the Intelligence Hub interface, metrics, and analytics features, see Part 6: Analytics & Reporting.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-500/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold">Section 6.1: Intelligence Hub Dashboard</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete navigation guide, section overview, KPIs, and Key Insights AI Panel details.
                </p>
              </CardContent>
            </Card>
            <Card className="border-purple-500/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold">Section 6.4: Trend Analysis & Predictions</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Predictive AI tab deep dive, attrition risk analysis, performance forecasting, and AI reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Governance Principles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            AI Governance Principles
          </h3>
          <p className="text-muted-foreground">
            All AI-powered features in the Intelligence Hub adhere to ISO 42001 AI governance standards:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Transparency</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All AI insights show confidence scores</li>
                  <li>• Explainability available for every prediction</li>
                  <li>• Data sources clearly identified</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Human Oversight</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI never makes decisions autonomously</li>
                  <li>• Human approval required for actions</li>
                  <li>• Override capability for all predictions</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold">Accountability</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full audit trail of AI interactions</li>
                  <li>• Bias monitoring and detection</li>
                  <li>• Regular model performance reviews</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Understanding AI Confidence */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Understanding AI Confidence Scores
          </h3>
          <p className="text-muted-foreground">
            Every AI-generated insight includes a confidence score indicating the reliability of the prediction:
          </p>
          <div className="space-y-3">
            {[
              { range: '85-100%', label: 'High Confidence', color: 'bg-success/10 border-success/30 text-success', guidance: 'Reliable prediction based on strong data patterns. Suitable for decision support.' },
              { range: '70-84%', label: 'Moderate Confidence', color: 'bg-amber-500/10 border-amber-500/30 text-amber-600', guidance: 'Reasonable prediction with some uncertainty. Verify with additional context before acting.' },
              { range: '50-69%', label: 'Low Confidence', color: 'bg-orange-500/10 border-orange-500/30 text-orange-600', guidance: 'Prediction has significant uncertainty. Use as one input among many, not primary guidance.' },
              { range: 'Below 50%', label: 'Insufficient Data', color: 'bg-destructive/10 border-destructive/30 text-destructive', guidance: 'Not enough data for reliable prediction. System will indicate data gaps to address.' }
            ].map((item) => (
              <div key={item.range} className={`p-4 rounded-lg border ${item.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{item.range}</span>
                  <Badge variant="outline" className={item.color}>{item.label}</Badge>
                </div>
                <p className="text-sm">{item.guidance}</p>
              </div>
            ))}
          </div>
        </div>

        {/* When Human Review is Required */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            When Human Review is Required
          </h3>
          <p className="text-muted-foreground">
            Certain AI predictions trigger mandatory human review before any action can be taken:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold text-destructive">Always Requires Review</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• High attrition risk predictions (&gt;75%)</li>
                <li>• Performance Improvement Plan recommendations</li>
                <li>• Succession planning nominations</li>
                <li>• Compensation adjustment suggestions</li>
                <li>• Any prediction affecting employment status</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold text-amber-600">Review Recommended</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Training recommendations (high investment)</li>
                <li>• Workload redistribution suggestions</li>
                <li>• Goal adjustment recommendations</li>
                <li>• Team restructuring insights</li>
                <li>• Any prediction with &lt;70% confidence</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips and Warnings */}
        <TipCallout>
          AI predictions become more accurate over time. The system requires at least 2 complete performance cycles 
          to generate reliable predictions. New organizations should expect 6-12 months before predictive features 
          reach full accuracy.
        </TipCallout>

        <WarningCallout>
          <strong>Legal Compliance:</strong> AI predictions must never be the sole basis for adverse employment decisions. 
          Always document human review and the additional factors considered when taking action based on AI insights.
        </WarningCallout>

        {/* Business Rules */}
        <BusinessRules rules={BUSINESS_RULES} />

        {/* Related Topics */}
        {relatedTopics.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Related Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((topic) => (
                <a 
                  key={topic.sectionId} 
                  href={`#${topic.sectionId}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
                >
                  <Link className="h-3 w-3" />
                  {topic.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
