import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { Brain, Database, TrendingUp, Gauge } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Understand how feedback responses are transformed into talent signals',
  'Configure aggregation methods and confidence thresholds',
  'Interpret signal snapshots and evidence summaries',
  'Identify and address low-confidence or biased signals'
];

const signalDefinitionFields: FieldDefinition[] = [
  {
    name: 'code',
    required: true,
    type: 'text',
    description: 'Unique identifier for the signal type',
    defaultValue: '—',
    validation: 'Alphanumeric with underscores'
  },
  {
    name: 'name',
    required: true,
    type: 'text',
    description: 'Display name for the talent signal',
    defaultValue: '—',
    validation: 'Max 100 characters'
  },
  {
    name: 'signal_category',
    required: true,
    type: 'enum',
    description: 'Classification: leadership, teamwork, technical, values, general',
    defaultValue: 'general',
    validation: 'Valid category'
  },
  {
    name: 'aggregation_method',
    required: true,
    type: 'enum',
    description: 'How to combine multiple data points: weighted_average, simple_average, median, max, min',
    defaultValue: 'weighted_average',
    validation: 'Valid method'
  },
  {
    name: 'confidence_threshold',
    required: true,
    type: 'decimal',
    description: 'Minimum confidence score for signal to be considered valid',
    defaultValue: '0.7',
    validation: '0.0 - 1.0'
  },
  {
    name: 'bias_risk_factors',
    required: false,
    type: 'text[]',
    description: 'Known bias risks for this signal type',
    defaultValue: '[]',
    validation: 'Array of strings'
  }
];

const snapshotFields: FieldDefinition[] = [
  {
    name: 'signal_value',
    required: false,
    type: 'decimal',
    description: 'Calculated signal score (1-5 scale typically)',
    defaultValue: 'null',
    validation: 'Numeric'
  },
  {
    name: 'normalized_score',
    required: false,
    type: 'decimal',
    description: 'Score normalized to 0-100 scale for comparison',
    defaultValue: 'null',
    validation: '0-100'
  },
  {
    name: 'confidence_score',
    required: false,
    type: 'decimal',
    description: 'AI confidence in the signal accuracy (0-1)',
    defaultValue: 'null',
    validation: '0.0 - 1.0'
  },
  {
    name: 'bias_risk_level',
    required: true,
    type: 'enum',
    description: 'Assessed bias risk: low, medium, high',
    defaultValue: 'low',
    validation: 'Valid level'
  },
  {
    name: 'evidence_count',
    required: true,
    type: 'integer',
    description: 'Number of data points contributing to this signal',
    defaultValue: '0',
    validation: 'Non-negative'
  },
  {
    name: 'rater_breakdown',
    required: false,
    type: 'JSONB',
    description: 'Signal contribution by rater category',
    defaultValue: '{}',
    validation: 'Valid JSON'
  }
];

const aggregationMethods = [
  {
    method: 'weighted_average',
    description: 'Applies rater category weights (e.g., manager 1.2x, peer 1.0x)',
    useCase: 'Most competency signals',
    formula: 'Σ(score × weight) / Σ(weights)'
  },
  {
    method: 'simple_average',
    description: 'Equal weight to all responses',
    useCase: 'General feedback questions',
    formula: 'Σ(scores) / count'
  },
  {
    method: 'median',
    description: 'Middle value, resistant to outliers',
    useCase: 'When outlier protection needed',
    formula: 'Middle value of sorted scores'
  },
  {
    method: 'max',
    description: 'Highest score received',
    useCase: 'Strength identification',
    formula: 'max(scores)'
  },
  {
    method: 'min',
    description: 'Lowest score received',
    useCase: 'Risk identification',
    formula: 'min(scores)'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Signal shows low confidence score (<0.5)',
    cause: 'Insufficient evidence or high variance in responses',
    solution: 'Check evidence_count; if <3 responses, signal may not be reliable. Consider waiting for more data.'
  },
  {
    issue: 'Signal marked as high bias risk',
    cause: 'Bias factors detected in source data or pattern analysis',
    solution: 'Review bias_factors array; investigate specific responses contributing to the signal.'
  },
  {
    issue: 'Signal snapshot not generated',
    cause: 'Cycle not completed or signal processing failed',
    solution: 'Verify cycle status is Completed; check AI action logs for processing errors.'
  },
  {
    issue: 'Rater breakdown shows unexpected weighting',
    cause: 'Custom rater_category_weights configured',
    solution: 'Review talent_signal_rules table for weight configuration.'
  }
];

export function AISignalProcessingEngine() {
  return (
    <section id="sec-5-2" data-manual-anchor="sec-5-2" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          5.2 Signal Processing Engine
        </h3>
        <p className="text-muted-foreground mt-2">
          Understanding how feedback responses are transformed into quantified talent signals with confidence scoring and bias detection.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Signal Processing Flow */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Database className="h-4 w-4" />
            Signal Processing Pipeline
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SIGNAL PROCESSING PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ Feedback       │                                                         │
│  │ Responses      │                                                         │
│  │ (Raw Scores)   │                                                         │
│  └───────┬────────┘                                                         │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐          │
│  │ Question-to-   │────▶│ Rater Category │────▶│ Aggregation    │          │
│  │ Signal Mapping │     │ Weighting      │     │ Method Applied │          │
│  └────────────────┘     └────────────────┘     └───────┬────────┘          │
│                                                         │                   │
│          ┌──────────────────────────────────────────────┘                   │
│          │                                                                   │
│          ▼                                                                   │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐          │
│  │ Confidence     │────▶│ Bias Risk      │────▶│ Normalization  │          │
│  │ Calculation    │     │ Assessment     │     │ (0-100 Scale)  │          │
│  └────────────────┘     └────────────────┘     └───────┬────────┘          │
│                                                         │                   │
│          ┌──────────────────────────────────────────────┘                   │
│          │                                                                   │
│          ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    TALENT_SIGNAL_SNAPSHOTS                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │ signal_value │  │ confidence   │  │ bias_risk    │               │   │
│  │  │ normalized   │  │ evidence_cnt │  │ rater_breakdown│              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                              │                                               │
│          ┌───────────────────┼───────────────────┐                          │
│          ▼                   ▼                   ▼                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Succession   │    │ Nine-Box     │    │ Talent       │                  │
│  │ Planning     │    │ Grid         │    │ Analytics    │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Aggregation Methods */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4" />
          Aggregation Methods
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Method</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-left p-3 font-medium">Use Case</th>
                <th className="text-left p-3 font-medium">Formula</th>
              </tr>
            </thead>
            <tbody>
              {aggregationMethods.map((m) => (
                <tr key={m.method} className="border-t">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded">{m.method}</code>
                  </td>
                  <td className="p-3 text-muted-foreground">{m.description}</td>
                  <td className="p-3">{m.useCase}</td>
                  <td className="p-3 font-mono text-xs">{m.formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confidence Scoring */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Gauge className="h-4 w-4" />
            Confidence Score Calculation
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Confidence scores reflect the reliability of a signal based on multiple factors:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Factors Increasing Confidence</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Higher response count (evidence_count)</li>
                <li>• Multiple rater categories represented</li>
                <li>• Low variance in scores</li>
                <li>• Alignment with historical signals</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Factors Decreasing Confidence</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Few responses (&lt;3)</li>
                <li>• Single rater category</li>
                <li>• High score variance</li>
                <li>• Bias risk factors detected</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm">
              <strong>Recommendation:</strong> Signals with confidence &lt;0.7 should be treated as 
              directional indicators only. Use the <Badge variant="outline">evidence_summary</Badge> field 
              to understand data limitations.
            </p>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={signalDefinitionFields} 
        title="Signal Definition Fields (talent_signal_definitions)" 
      />

      <FieldReferenceTable 
        fields={snapshotFields} 
        title="Signal Snapshot Fields (talent_signal_snapshots)" 
      />

      <TroubleshootingSection items={troubleshootingItems} />
    </section>
  );
}
