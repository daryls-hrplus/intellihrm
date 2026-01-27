import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Signal, 
  Database,
  Calculator,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';

const signalDefinitionFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'company_id', required: false, type: 'uuid', description: 'Company scope (null for system signals)', defaultValue: 'null', validation: 'References companies.id' },
  { name: 'signal_code', required: true, type: 'text', description: 'Unique signal code (e.g., leadership_consistency)', defaultValue: '—', validation: 'snake_case, max 50 chars' },
  { name: 'signal_name', required: true, type: 'text', description: 'Display name for signal', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'signal_name_en', required: false, type: 'text', description: 'English translation of signal name', defaultValue: 'null', validation: '—' },
  { name: 'description', required: false, type: 'text', description: 'Detailed signal description', defaultValue: 'null', validation: '—' },
  { name: 'category', required: true, type: 'enum', description: 'Signal category', defaultValue: '—', validation: 'leadership | teamwork | technical | values | general' },
  { name: 'source_module', required: false, type: 'text', description: 'Primary data source module', defaultValue: 'null', validation: 'performance | feedback_360 | competency | goals' },
  { name: 'calculation_method', required: true, type: 'enum', description: 'Score aggregation method', defaultValue: '—', validation: 'weighted_average | simple_average | median | max | min' },
  { name: 'weight_default', required: false, type: 'numeric(5,2)', description: 'Default weight in calculations', defaultValue: '1.0', validation: '0-10 scale' },
  { name: 'confidence_threshold', required: true, type: 'numeric(3,2)', description: 'Minimum confidence for signal validity', defaultValue: '0.6', validation: '0-1 scale' },
  { name: 'bias_risk_factors', required: false, type: 'text[]', description: 'Known bias risk factors for this signal', defaultValue: '[]', validation: 'Array of bias identifiers' },
  { name: 'is_system_defined', required: true, type: 'boolean', description: 'System-provided vs. company-defined', defaultValue: 'false', validation: '—' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Active status for calculations', defaultValue: 'true', validation: '—' },
  { name: 'display_order', required: false, type: 'integer', description: 'UI display ordering', defaultValue: '0', validation: 'Positive integer' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()', validation: 'Auto-set' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()', validation: 'Auto-set on update' }
];

const snapshotFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'employee_id', required: true, type: 'uuid', description: 'Target employee reference', defaultValue: '—', validation: 'References profiles.id' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company scope', defaultValue: '—', validation: 'References companies.id' },
  { name: 'signal_definition_id', required: true, type: 'uuid', description: 'Reference to signal definition', defaultValue: '—', validation: 'References talent_signal_definitions.id' },
  { name: 'source_cycle_id', required: false, type: 'uuid', description: 'Source cycle (appraisal, 360, etc.)', defaultValue: 'null', validation: 'References cycle table' },
  { name: 'source_record_type', required: true, type: 'text', description: 'Type of source record', defaultValue: '—', validation: 'appraisal | feedback_360 | competency_assessment | goal' },
  { name: 'source_record_id', required: false, type: 'uuid', description: 'Specific source record reference', defaultValue: 'null', validation: 'e.g., appraisal_participant.id' },
  { name: 'snapshot_version', required: true, type: 'integer', description: 'Version number for this snapshot', defaultValue: '1', validation: 'Auto-incremented' },
  { name: 'signal_value', required: false, type: 'numeric(5,2)', description: 'Final computed signal value (0-100 scale)', defaultValue: 'null', validation: '0-100' },
  { name: 'raw_value', required: false, type: 'numeric(5,2)', description: 'Raw score before normalization', defaultValue: 'null', validation: 'Depends on source' },
  { name: 'normalized_score', required: false, type: 'numeric(5,4)', description: 'Normalized score (0-1 scale)', defaultValue: 'null', validation: '0-1' },
  { name: 'confidence_score', required: false, type: 'numeric(3,2)', description: 'Confidence level (0-1 scale)', defaultValue: 'null', validation: '0-1' },
  { name: 'bias_risk_level', required: true, type: 'enum', description: 'Assessed bias risk', defaultValue: 'low', validation: 'low | medium | high' },
  { name: 'bias_factors', required: false, type: 'text[]', description: 'Detected bias factors', defaultValue: '[]', validation: 'Array of bias identifiers' },
  { name: 'evidence_count', required: true, type: 'integer', description: 'Number of evidence sources', defaultValue: '0', validation: 'Non-negative integer' },
  { name: 'evidence_summary', required: false, type: 'jsonb', description: 'Summary of evidence (response_count, rater_group_count, score_range)', defaultValue: '{}', validation: 'Structured JSON' },
  { name: 'rater_breakdown', required: false, type: 'jsonb', description: 'Breakdown by rater category (avg, count per category)', defaultValue: '{}', validation: 'Structured JSON' },
  { name: 'data_freshness_days', required: false, type: 'integer', description: 'Days since data capture (computed)', defaultValue: 'Computed', validation: 'Generated column' },
  { name: 'effective_from', required: true, type: 'timestamptz', description: 'Start of validity period', defaultValue: 'now()', validation: 'Auto-set' },
  { name: 'expires_at', required: false, type: 'timestamptz', description: 'End of validity period (null = current)', defaultValue: 'null', validation: 'Based on freshness rules' },
  { name: 'is_current', required: true, type: 'boolean', description: 'Current snapshot flag', defaultValue: 'true', validation: 'Only one current per employee/signal' },
  { name: 'captured_at', required: true, type: 'timestamptz', description: 'When signal was computed', defaultValue: 'now()', validation: 'Auto-set' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()', validation: 'Auto-set' },
  { name: 'created_by', required: false, type: 'uuid', description: 'User or system that created snapshot', defaultValue: 'null', validation: 'References profiles.id' }
];

const signalMappingFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company context', defaultValue: '—', validation: 'References companies.id' },
  { name: 'signal_definition_id', required: true, type: 'uuid', description: 'Which signal to map', defaultValue: '—', validation: 'References talent_signal_definitions.id' },
  { name: 'contributes_to', required: true, type: 'text', description: 'Target axis or assessment', defaultValue: '—', validation: 'performance | potential | readiness' },
  { name: 'weight', required: true, type: 'numeric(5,2)', description: 'Contribution weight', defaultValue: '1.0', validation: 'Relative weight within axis' },
  { name: 'min_confidence', required: false, type: 'numeric(3,2)', description: 'Minimum confidence to include', defaultValue: '0.5', validation: '0-1 scale' },
  { name: 'bias_multiplier', required: false, type: 'numeric(3,2)', description: 'Adjustment for known bias', defaultValue: '1.0', validation: '0.5-1.5 typical range' },
  { name: 'is_active', required: false, type: 'boolean', description: 'Whether mapping is enabled', defaultValue: 'true', validation: '—' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()', validation: 'Auto-set' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()', validation: 'Auto-set on update' }
];

export function IntegrationTalentSignals() {
  return (
    <section id="sec-9-5" data-manual-anchor="sec-9-5" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Signal className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.5 Talent Signal Processing</h3>
          <p className="text-sm text-muted-foreground">
            Signal definitions, snapshots, and axis contribution mappings
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Master the talent_signal_definitions table structure (17 fields)',
        'Understand talent_signal_snapshots lifecycle and is_current flag management (24 fields)',
        'Configure nine_box_signal_mappings for axis contribution (11 fields)',
        'Apply bias multipliers and confidence thresholds'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Signal Processing Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Talent signals flow through a three-layer architecture: definitions, snapshots, and mappings.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary">1</span>
              </div>
              <h4 className="font-medium">Definitions</h4>
              <p className="text-xs text-muted-foreground mt-1">Signal types and calculation methods</p>
              <Badge variant="outline" className="mt-2">talent_signal_definitions</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary">2</span>
              </div>
              <h4 className="font-medium">Snapshots</h4>
              <p className="text-xs text-muted-foreground mt-1">Point-in-time signal values per employee</p>
              <Badge variant="outline" className="mt-2">talent_signal_snapshots</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary">3</span>
              </div>
              <h4 className="font-medium">Mappings</h4>
              <p className="text-xs text-muted-foreground mt-1">Contribution to Nine-Box axes</p>
              <Badge variant="outline" className="mt-2">nine_box_signal_mappings</Badge>
            </div>
          </div>

          <InfoCallout>
            Signals are captured as immutable snapshots. When new data is available, a new snapshot is created 
            with <code>is_current = true</code>, and the previous snapshot's <code>is_current</code> is set to 
            <code>false</code>. This preserves audit history.
          </InfoCallout>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={signalDefinitionFields} 
        title="talent_signal_definitions Table (17 Fields)" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Default Signal Definitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Signal Code</th>
                  <th className="text-left py-2 px-3">Category</th>
                  <th className="text-left py-2 px-3">Source Module</th>
                  <th className="text-left py-2 px-3">Contributes To</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">PERF_APPRAISAL</td>
                  <td className="py-2 px-3"><Badge variant="outline">performance</Badge></td>
                  <td className="py-2 px-3">appraisals</td>
                  <td className="py-2 px-3">Performance axis</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">PERF_GOALS</td>
                  <td className="py-2 px-3"><Badge variant="outline">performance</Badge></td>
                  <td className="py-2 px-3">goals</td>
                  <td className="py-2 px-3">Performance axis</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">POT_LEADERSHIP</td>
                  <td className="py-2 px-3"><Badge variant="secondary">potential</Badge></td>
                  <td className="py-2 px-3">360_feedback</td>
                  <td className="py-2 px-3">Potential axis</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">POT_LEARNING_AGILITY</td>
                  <td className="py-2 px-3"><Badge variant="secondary">potential</Badge></td>
                  <td className="py-2 px-3">readiness_assessment</td>
                  <td className="py-2 px-3">Potential axis</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">RISK_FLIGHT</td>
                  <td className="py-2 px-3"><Badge variant="destructive">risk</Badge></td>
                  <td className="py-2 px-3">talent_risk_analyzer</td>
                  <td className="py-2 px-3">Risk dashboard</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">DEV_COMPETENCY_GAP</td>
                  <td className="py-2 px-3"><Badge variant="outline">development</Badge></td>
                  <td className="py-2 px-3">competencies</td>
                  <td className="py-2 px-3">Development plans</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={snapshotFields} 
        title="talent_signal_snapshots Table (24 Fields)" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            is_current Flag Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <code>is_current</code> flag ensures only the latest signal snapshot contributes to Nine-Box calculations:
          </p>

          <div className="p-4 border rounded-lg">
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <span>New source data triggers snapshot creation (e.g., appraisal finalized)</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <span>System queries existing snapshots for same employee + signal_definition_id</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <span>All existing snapshots set to <code>is_current = false</code></span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <span>New snapshot inserted with <code>is_current = true</code></span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">5</Badge>
                <span>Nine-Box recalculation uses only <code>is_current = true</code> snapshots</span>
              </li>
            </ol>
          </div>

          <WarningCallout>
            Never delete old snapshots. They form the audit trail for succession decisions. Use the 
            <code>is_current</code> flag to exclude stale data from calculations while preserving history.
          </WarningCallout>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={signalMappingFields} 
        title="nine_box_signal_mappings Table (11 Fields)" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Axis Score Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <h4 className="font-medium mb-2">Weighted Signal Aggregation</h4>
            <p className="text-sm font-mono">
              axis_score = Σ(signal_value × weight × bias_multiplier) / Σ(weight)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Only signals with confidence ≥ min_confidence and is_current = true are included
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Bias Multiplier</h4>
              <p className="text-sm text-muted-foreground">
                Adjusts signal contribution for known bias patterns:
              </p>
              <ul className="text-xs mt-2 space-y-1">
                <li><code>1.0</code> = No adjustment (default)</li>
                <li><code>0.8</code> = Reduce weight (high bias signal)</li>
                <li><code>1.2</code> = Increase weight (reliable signal)</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Rating Conversion</h4>
              <p className="text-sm text-muted-foreground">
                Normalized 0-1 score converts to 1-3 Nine-Box rating:
              </p>
              <ul className="text-xs mt-2 space-y-1">
                <li><code>&lt; 0.33</code> = Rating 1 (Low)</li>
                <li><code>&lt; 0.67</code> = Rating 2 (Medium)</li>
                <li><code>≥ 0.67</code> = Rating 3 (High)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout>
        Use the <strong>Succession → Analytics → Signal Health</strong> dashboard to monitor signal 
        freshness, confidence distribution, and data gaps across your talent population.
      </TipCallout>
    </section>
  );
}
