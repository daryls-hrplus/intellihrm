import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3, 
  TrendingUp, 
  Users, 
  Target, 
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  BusinessRules,
  StepByStep,
  type FieldDefinition,
  type BusinessRule,
  type Step 
} from '@/components/enablement/manual/components';

const nineBoxMappingFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the mapping rule',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Company owning this mapping configuration',
    defaultValue: '—',
    validation: 'Must reference valid companies.id'
  },
  {
    name: 'signal_source',
    required: true,
    type: 'text',
    description: 'Source of signal data (e.g., feedback_360)',
    defaultValue: '—',
    validation: 'Enum: feedback_360, appraisal, goal_completion'
  },
  {
    name: 'min_score',
    required: true,
    type: 'numeric(3,2)',
    description: 'Minimum score for this rating band',
    defaultValue: '—',
    validation: 'Must be < max_score'
  },
  {
    name: 'max_score',
    required: true,
    type: 'numeric(3,2)',
    description: 'Maximum score for this rating band',
    defaultValue: '—',
    validation: 'Must be > min_score'
  },
  {
    name: 'performance_rating',
    required: true,
    type: 'text',
    description: 'Nine-Box performance axis rating',
    defaultValue: '—',
    validation: 'Enum: High, Medium, Low'
  },
  {
    name: 'is_active',
    required: false,
    type: 'boolean',
    description: 'Whether this mapping is currently active',
    defaultValue: 'true',
    validation: '—'
  }
];

const successionUpdateFields: FieldDefinition[] = [
  {
    name: 'readiness_level',
    required: false,
    type: 'text',
    description: 'Succession readiness indicator updated from 360 signals',
    defaultValue: 'null',
    validation: 'Enum: Ready Now, Ready 1-2 Years, Ready 3+ Years, Development Needed'
  },
  {
    name: 'last_360_score',
    required: false,
    type: 'numeric(5,2)',
    description: 'Most recent 360 feedback score for this candidate',
    defaultValue: 'null',
    validation: 'Auto-updated from integration rules'
  },
  {
    name: 'last_360_date',
    required: false,
    type: 'date',
    description: 'Date of most recent 360 score update',
    defaultValue: 'null',
    validation: 'Auto-updated'
  }
];

const mappingSteps: Step[] = [
  {
    title: 'Define Score Bands',
    description: 'Configure score ranges that map to High, Medium, Low performance ratings.',
    notes: ['Example: 4.0-5.0 = High, 2.5-3.9 = Medium, 1.0-2.4 = Low']
  },
  {
    title: 'Enable Integration Rule',
    description: 'Create an integration rule with trigger "360_cycle_completed" and target "nine_box".',
    notes: ['Set condition to match desired score ranges', 'Configure action to update performance rating']
  },
  {
    title: 'Test with Sample Data',
    description: 'Run a test 360 cycle and verify Nine-Box updates correctly.',
    notes: ['Check nine_box_assessments table for updated records']
  },
  {
    title: 'Enable for Production',
    description: 'Activate the integration rule for live cycles.',
    notes: ['Monitor integration logs for any failures']
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: '360 updates Performance axis only',
    enforcement: 'System',
    description: 'Potential axis requires separate assessment; 360 cannot update potential ratings'
  },
  {
    rule: 'Only existing Nine-Box records updated',
    enforcement: 'System',
    description: '360 integration updates existing assessments; does not create new Nine-Box records'
  },
  {
    rule: 'Most recent cycle takes precedence',
    enforcement: 'System',
    description: 'If multiple 360 cycles complete, latest score overwrites previous'
  },
  {
    rule: 'Succession candidates auto-refresh',
    enforcement: 'Advisory',
    description: 'Recommend running succession refresh after 360 integration updates'
  },
  {
    rule: 'HR approval for rating downgrades',
    enforcement: 'Policy',
    description: 'Performance rating decreases should trigger HR review workflow'
  }
];

export function IntegrationNineBoxSuccession() {
  return (
    <section id="sec-7-4" data-manual-anchor="sec-7-4" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Grid3X3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">7.4 Nine-Box & Succession Integration</h3>
          <p className="text-sm text-muted-foreground">
            Performance axis mapping and succession readiness updates from 360 feedback
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure score-to-rating mappings for Nine-Box integration',
        'Understand the separation of Performance vs Potential axes',
        'Set up integration rules for automatic Nine-Box updates',
        'Manage succession candidate readiness indicators'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Nine-Box Integration Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            360 Feedback scores contribute to the <strong>Performance axis</strong> of the Nine-Box grid. 
            The Potential axis remains a separate, manager-assessed dimension.
          </p>

          <div className="grid grid-cols-3 gap-2 p-4 border rounded-lg">
            {/* Nine-Box Grid Visualization */}
            <div className="col-span-3 text-center text-sm font-medium mb-2">
              ← Potential →
            </div>
            {[
              { perf: 'High', pot: 'Low', label: 'Core Player', color: 'bg-yellow-100' },
              { perf: 'High', pot: 'Medium', label: 'High Performer', color: 'bg-green-100' },
              { perf: 'High', pot: 'High', label: 'Star', color: 'bg-emerald-200' },
              { perf: 'Medium', pot: 'Low', label: 'Average', color: 'bg-gray-100' },
              { perf: 'Medium', pot: 'Medium', label: 'Key Player', color: 'bg-blue-100' },
              { perf: 'Medium', pot: 'High', label: 'High Potential', color: 'bg-purple-100' },
              { perf: 'Low', pot: 'Low', label: 'Risk', color: 'bg-red-100' },
              { perf: 'Low', pot: 'Medium', label: 'Inconsistent', color: 'bg-orange-100' },
              { perf: 'Low', pot: 'High', label: 'Enigma', color: 'bg-pink-100' }
            ].map((cell, i) => (
              <div key={i} className={`p-3 rounded text-center text-xs ${cell.color}`}>
                <p className="font-medium">{cell.label}</p>
                <p className="text-muted-foreground">P: {cell.perf}</p>
              </div>
            ))}
            <div className="col-span-3 text-center text-sm font-medium mt-2 -rotate-90 absolute -left-6 top-1/2">
              ↑ Performance
            </div>
          </div>

          <InfoCallout>
            <strong>360 updates Performance axis:</strong> Scores ≥4.0 → High, 2.5-3.9 → Medium, &lt;2.5 → Low. 
            These thresholds are configurable per company.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Score-to-Rating Mapping Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Configure the mapping rules that translate 360 scores into Nine-Box performance ratings:
          </p>

          <div className="space-y-2">
            {[
              { rating: 'High', range: '4.0 - 5.0', color: 'bg-green-600' },
              { rating: 'Medium', range: '2.5 - 3.9', color: 'bg-yellow-600' },
              { rating: 'Low', range: '1.0 - 2.4', color: 'bg-red-600' }
            ].map(band => (
              <div key={band.rating} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${band.color}`} />
                  <Badge variant="outline">{band.rating} Performance</Badge>
                </div>
                <span className="font-mono text-sm">{band.range}</span>
              </div>
            ))}
          </div>

          <WarningCallout>
            Changing score bands after 360 cycles have been processed will not retroactively update 
            existing Nine-Box assessments. Apply changes before the next 360 cycle begins.
          </WarningCallout>
        </CardContent>
      </Card>

      <StepByStep steps={mappingSteps} title="Integration Setup Procedure" />

      <FieldReferenceTable 
        fields={nineBoxMappingFields} 
        title="nine_box_signal_mappings Table Fields" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Succession Candidate Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            360 feedback signals can trigger updates to succession candidate readiness levels:
          </p>

          <FieldReferenceTable 
            fields={successionUpdateFields} 
            title="succession_candidates Integration Fields" 
          />

          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <ArrowUpRight className="h-4 w-4" />
              Readiness Level Mapping
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Badge className="bg-green-600">Ready Now</Badge>
                <span>360 score ≥ 4.5 + existing "Ready 1-2 Years" status</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge className="bg-blue-600">Ready 1-2 Years</Badge>
                <span>360 score ≥ 4.0 + positive trend</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge className="bg-yellow-600">Ready 3+ Years</Badge>
                <span>360 score 3.0-3.9 + development themes assigned</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge className="bg-red-600">Development Needed</Badge>
                <span>360 score &lt; 3.0 or significant gaps identified</span>
              </li>
            </ul>
          </div>

          <TipCallout>
            Run the "Succession Pool Refresh" job after 360 cycles complete to ensure all 
            candidate readiness levels reflect the latest feedback signals.
          </TipCallout>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />
    </section>
  );
}
