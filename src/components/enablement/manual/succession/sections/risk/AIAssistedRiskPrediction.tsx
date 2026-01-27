import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Bot, 
  CheckCircle,
  Info,
  TrendingDown,
  Lightbulb,
  Shield,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

export function AIAssistedRiskPrediction() {
  const objectives = [
    'Understand how talent signals feed into risk prediction',
    'Interpret AI-generated risk scores and confidence levels',
    'Apply human override capability with proper documentation',
    'Monitor AI prediction accuracy and calibration'
  ];

  const signalCategories = [
    { 
      category: 'Performance Signals', 
      signals: ['perf_rating_trend', 'goal_achievement_rate', 'competency_score'],
      descriptions: ['Rating change over 3 cycles', 'Completed/total goals', 'Competency assessment average'],
      weight: '30%',
      freshness: '90 days'
    },
    { 
      category: 'Engagement Signals', 
      signals: ['engagement_score', 'survey_participation', 'recognition_count'],
      descriptions: ['Latest engagement survey score', 'Survey response rate', 'Recognition frequency'],
      weight: '25%',
      freshness: '30 days'
    },
    { 
      category: 'Career Signals', 
      signals: ['time_in_role_months', 'promotion_history', 'lateral_moves', 'skills_growth'],
      descriptions: ['Months in current position', 'Promotions in last 5 years', 'Role changes', 'New skills acquired'],
      weight: '20%',
      freshness: '180 days'
    },
    { 
      category: 'Compensation Signals', 
      signals: ['compa_ratio', 'market_position', 'equity_vesting'],
      descriptions: ['Salary / midpoint ratio', 'Percentile in market data', 'Unvested equity timeline'],
      weight: '15%',
      freshness: 'Annual'
    },
    { 
      category: 'Tenure Signals', 
      signals: ['tenure_years', 'tenure_milestone', 'project_end_date'],
      descriptions: ['Years of service', 'Approaching milestone (5yr, 10yr)', 'Current project completion'],
      weight: '10%',
      freshness: '30 days'
    },
  ];

  const confidenceThresholds = [
    { level: 'High Confidence', range: '≥ 0.80', action: 'AI recommendation can guide decisions', color: 'bg-green-500' },
    { level: 'Medium Confidence', range: '0.60 - 0.79', action: 'Human review recommended', color: 'bg-amber-500' },
    { level: 'Low Confidence', range: '< 0.60', action: 'Insufficient data for reliable prediction', color: 'bg-red-500' },
  ];

  return (
    <section id="sec-7-8" data-manual-anchor="sec-7-8" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.8 AI-Assisted Risk Prediction</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Predictive indicators, talent signal integration, and confidence scoring
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* Cross-Reference */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Cross-Reference: Chapter 3.3</AlertTitle>
        <AlertDescription>
          For detailed configuration of signal-to-axis mappings and bias adjustment, 
          see <strong>Section 3.3: Signal Mappings</strong>. This section focuses on 
          operational use of AI predictions for risk management.
        </AlertDescription>
      </Alert>

      {/* Signal Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-primary" />
            Talent Signal Integration for Risk Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            AI risk prediction uses data from <code>talent_signal_snapshots</code> to identify 
            leading indicators of flight risk. Signals are categorized and weighted:
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Signal Codes</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Freshness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signalCategories.map((cat) => (
                <TableRow key={cat.category}>
                  <TableCell className="font-medium">{cat.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cat.signals.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-mono">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {cat.descriptions.map((d, i) => (
                        <div key={i}>{d}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell><Badge>{cat.weight}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{cat.freshness}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confidence Scoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Confidence Scoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            AI predictions include a confidence score (0.0 - 1.0) based on data completeness, 
            recency, and model certainty. Use confidence thresholds to guide decision-making:
          </p>

          <div className="space-y-3">
            {confidenceThresholds.map((t) => (
              <div key={t.level} className="p-3 border rounded-lg flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${t.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{t.level}</span>
                    <Badge variant="outline" className="text-xs">{t.range}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.action}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI-Generated Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When available, AI can provide proactive recommendations based on risk signals:
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { type: 'Early Warning', desc: 'Identifies employees showing early risk signals before human detection', example: 'Declining engagement trend detected over 3 months' },
              { type: 'Intervention Suggestion', desc: 'Recommends specific retention actions based on risk factors', example: 'Compensation review suggested based on compa-ratio decline' },
              { type: 'Timing Optimization', desc: 'Suggests optimal timing for retention conversations', example: 'Vesting cliff approaching in 45 days - recommend conversation now' },
              { type: 'Risk Correlation', desc: 'Identifies risk patterns across related employees', example: 'Team-level engagement decline detected in Department X' },
            ].map((rec) => (
              <div key={rec.type} className="p-3 border rounded-lg">
                <h5 className="font-medium text-sm mb-1">{rec.type}</h5>
                <p className="text-xs text-muted-foreground mb-2">{rec.desc}</p>
                <div className="p-2 bg-muted rounded text-xs italic">Example: {rec.example}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Human Override */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Human Override Capability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>ISO 42001 Compliance: Human-in-the-Loop</AlertTitle>
            <AlertDescription>
              AI risk predictions are suggestions only. All final risk assessments require 
              human review and approval. Overrides must be documented with justification.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h5 className="font-medium text-sm">Override Documentation Requirements:</h5>
            <ul className="space-y-2">
              {[
                'Original AI-suggested risk level',
                'Human-assigned risk level (the override)',
                'Override reason (free text justification)',
                'Reviewer ID and timestamp',
                'Contextual information AI may not have access to'
              ].map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Model Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            AI Model Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Track AI prediction accuracy to maintain model calibration:
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { metric: 'Prediction Accuracy', def: 'Correct predictions / Total predictions', target: '≥ 80%' },
                { metric: 'False Positive Rate', def: 'Predicted high risk but stayed / Total high predictions', target: '< 20%' },
                { metric: 'False Negative Rate', def: 'Departed but predicted low risk / Total departures', target: '< 10%' },
                { metric: 'Override Rate', def: 'Human overrides / Total AI predictions', target: '< 15%' },
              ].map((m) => (
                <TableRow key={m.metric}>
                  <TableCell className="font-medium">{m.metric}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.def}</TableCell>
                  <TableCell><Badge variant="outline">{m.target}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            AI-Assisted Risk Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Treat AI predictions as inputs, not final decisions',
              'Always review confidence scores before acting on predictions',
              'Document overrides with clear justification for audit purposes',
              'Monitor model accuracy monthly and escalate drift concerns',
              'Ensure data freshness — stale signals reduce prediction quality',
              'Use AI for early warning, not replacement of human judgment',
              'Report bias patterns if certain groups are disproportionately flagged'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
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
