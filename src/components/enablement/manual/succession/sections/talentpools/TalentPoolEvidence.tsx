import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Database, 
  Settings, 
  ChevronRight, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  Layers
} from 'lucide-react';

export function TalentPoolEvidence() {
  const signalSummaryFormulas = [
    {
      name: 'Overall Score',
      formula: 'sum(signal_value) / signal_count',
      description: 'Average score across all active talent signals',
      example: '(4.2 + 3.8 + 4.5 + 3.9) / 4 = 4.1'
    },
    {
      name: 'Average Confidence',
      formula: 'sum(confidence_score) / signal_count',
      description: 'Mean confidence level across all signals',
      example: '(0.85 + 0.72 + 0.90 + 0.68) / 4 = 0.79 (79%)'
    },
    {
      name: 'Top Strengths',
      formula: 'signals WHERE score >= 3.5 ORDER BY score DESC LIMIT 3',
      description: 'Highest scoring signals that represent core competencies',
      example: 'Strategic Thinking (4.5), Leadership (4.2), Innovation (4.0)'
    },
    {
      name: 'Development Areas',
      formula: 'signals WHERE score < 2.5 ORDER BY score ASC LIMIT 3',
      description: 'Lowest scoring signals indicating growth opportunities',
      example: 'Delegation (2.3), Conflict Resolution (2.4)'
    },
    {
      name: 'Bias Risk Level',
      formula: 'highBiasCount / totalResponses',
      description: 'Percentage of responses flagged as potentially biased',
      example: '>30% = High, 10-30% = Medium, <10% = Low'
    }
  ];

  return (
    <section id="sec-5-7" data-manual-anchor="sec-5-7" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.7 Evidence-Based Decision Support</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Talent signals, evidence snapshots, and decision algorithms
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Understand how talent signals are aggregated into evidence summaries',
          'Interpret signal summary calculations and confidence metrics',
          'Apply evidence-based criteria to validate pool membership decisions',
          'Identify and address bias risk in talent data'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">HR Hub</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Talent Pools</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">[Review Packet]</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Evidence Summary</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Summary Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Evidence Summary Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The evidence summary aggregates data from the talent profile, providing a 
            consolidated view for decision-making. This data is captured as a 
            point-in-time snapshot when the review packet is generated.
          </p>
          
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h5 className="font-medium text-sm">Pool Criteria Validation</h5>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Minimum score threshold check</li>
                <li>• Minimum confidence threshold check</li>
                <li>• Required signals presence verification</li>
                <li>• Role/tenure exclusion validation</li>
              </ul>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h5 className="font-medium text-sm">Signal Aggregation</h5>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Overall score calculation</li>
                <li>• Average confidence computation</li>
                <li>• Top 3 strengths extraction</li>
                <li>• Development areas identification</li>
              </ul>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-primary" />
                <h5 className="font-medium text-sm">Evidence Sources</h5>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Performance appraisals</li>
                <li>• 360 feedback responses</li>
                <li>• Goal achievements</li>
                <li>• Skills assessments</li>
                <li>• Competency evaluations</li>
              </ul>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h5 className="font-medium text-sm">Risk Indicators</h5>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Bias risk level assessment</li>
                <li>• Data freshness status</li>
                <li>• Source diversity score</li>
                <li>• Rater relationship flags</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signal Summary Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-primary" />
            Signal Summary Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The following formulas are used to calculate signal summaries from the 
            underlying talent signal data. These calculations power the evidence 
            summary displayed in review packets.
          </p>
          
          <div className="space-y-3">
            {signalSummaryFormulas.map((item) => (
              <div key={item.name} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{item.name}</h5>
                  <Badge variant="outline" className="font-mono text-xs">{item.formula}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="mt-2 p-2 bg-muted/50 rounded">
                  <span className="text-xs font-medium">Example: </span>
                  <span className="text-xs text-muted-foreground">{item.example}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leadership Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Leadership Indicator Extraction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Leadership indicators are extracted specifically for leadership pipeline 
            and high potential pools, focusing on behavioral signals that predict 
            future leadership success.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h5 className="text-sm font-medium mb-2">Extraction Algorithm</h5>
            <pre className="text-xs overflow-x-auto">
{`// Filter signals by leadership category
leadershipSignals = signals.filter(s => s.category === 'leadership')

// Extract for each indicator
for each signal in leadershipSignals:
  result.push({
    name: signal.definition_name,
    score: signal.computed_value,
    confidence: signal.confidence_score,
    trend: calculateTrend(signal.historical_values),
    sources: signal.source_count
  })

// Sort by impact and return top indicators
return result.sortBy(r => r.score * r.confidence).limit(8)`}
            </pre>
          </div>

          <div className="grid gap-2 md:grid-cols-4">
            {[
              'Strategic Vision',
              'People Development',
              'Change Leadership',
              'Decision Quality',
              'Influence & Impact',
              'Executive Presence',
              'Results Orientation',
              'Cross-Functional Collaboration'
            ].map((indicator) => (
              <div key={indicator} className="p-2 border rounded text-center">
                <span className="text-xs">{indicator}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evidence Snapshot Versioning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evidence Snapshot Versioning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Evidence snapshots are point-in-time captures of talent data. This ensures 
            decisions are based on the data available at the time of review, while 
            maintaining a historical record for audit purposes.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="mt-0.5">Capture</Badge>
              <div>
                <h5 className="font-medium text-sm">When Snapshot is Created</h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A new snapshot is generated when a review packet is created. 
                  This happens automatically when HR accesses a pending nomination.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="mt-0.5">Immutable</Badge>
              <div>
                <h5 className="font-medium text-sm">Snapshot Immutability</h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Once created, snapshots cannot be modified. If updated evidence is 
                  needed, a new review packet with a fresh snapshot must be generated.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="mt-0.5">Retention</Badge>
              <div>
                <h5 className="font-medium text-sm">Historical Retention</h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All snapshots are retained for audit compliance. Historical snapshots 
                  can be compared to track talent development over time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration with Talent Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integration with Talent Profile Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Evidence summaries pull data from the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">talent_profile_evidence</code> table, 
            which aggregates evidence from multiple source modules.
          </p>
          
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Source Modules</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Performance Management (appraisals, goals)</li>
                <li>• 360 Feedback (multi-rater assessments)</li>
                <li>• Skills Management (certifications, proficiencies)</li>
                <li>• Learning & Development (completions, assessments)</li>
                <li>• Succession (readiness assessments, Nine-Box)</li>
              </ul>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Evidence Types</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• performance_rating</li>
                <li>• goal_achievement</li>
                <li>• feedback_score</li>
                <li>• competency_assessment</li>
                <li>• skill_certification</li>
                <li>• learning_completion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supporting Tables Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Supporting Database Tables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The evidence system relies on three interconnected tables. For complete field-level 
            documentation, refer to the respective module manuals.
          </p>
          
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm font-mono">talent_profile_evidence</h5>
                <Badge variant="outline" className="text-xs">13 fields</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Stores aggregated evidence from source systems. Key fields include: 
                <code className="bg-muted px-1 rounded">evidence_type</code>, 
                <code className="bg-muted px-1 rounded">source_table</code>, 
                <code className="bg-muted px-1 rounded">evidence_summary</code>, 
                <code className="bg-muted px-1 rounded">confidence_score</code>, 
                <code className="bg-muted px-1 rounded">is_current</code>.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm font-mono">talent_signal_snapshots</h5>
                <Badge variant="outline" className="text-xs">~18 fields</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Point-in-time captures of talent signals. Key fields include: 
                <code className="bg-muted px-1 rounded">signal_value</code>, 
                <code className="bg-muted px-1 rounded">normalized_score</code>, 
                <code className="bg-muted px-1 rounded">confidence_score</code>, 
                <code className="bg-muted px-1 rounded">bias_risk_level</code>, 
                <code className="bg-muted px-1 rounded">is_current</code>.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm font-mono">talent_signal_definitions</h5>
                <Badge variant="outline" className="text-xs">~15 fields</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Configuration of signal types and categories. Key fields include: 
                <code className="bg-muted px-1 rounded">signal_code</code>, 
                <code className="bg-muted px-1 rounded">signal_category</code> (e.g., leadership, performance), 
                <code className="bg-muted px-1 rounded">weight_percentage</code>, 
                <code className="bg-muted px-1 rounded">bias_adjustment_factor</code>.
              </p>
            </div>
          </div>
          
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Cross-Reference:</strong> For complete schema documentation of these tables, 
                see the Talent Management Module Manual and Nine-Box Assessment Configuration (Chapter 3.3).
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
            Evidence-Based Decision Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Prioritize decisions based on multiple corroborating evidence sources',
              'Weight recent evidence (< 6 months) more heavily than older data',
              'Flag and investigate high bias risk before making approval decisions',
              'Consider development trends, not just point-in-time scores',
              'Document any exceptions to evidence-based criteria in review notes',
              'Request updated assessments when data is stale (> 90 days)'
            ].map((practice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Industry Context */}
      <Card>
        <CardContent className="pt-4">
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Industry Standard:</strong> Evidence-based talent decisions reduce 
                subjective bias by 40% and improve prediction of high-performer success 
                by 35% (McKinsey Talent Management Study 2024).
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
