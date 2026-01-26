import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Calculator, 
  Link2, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  type FieldDefinition,
  type Step,
  type BusinessRule 
} from '@/components/enablement/manual/components';

const appraisalIntegrationFields: FieldDefinition[] = [
  {
    name: 'feedback_360_weight',
    required: false,
    type: 'integer',
    description: 'Percentage weight of 360 score in final appraisal calculation (0-50)',
    defaultValue: '0',
    validation: 'Must be 0-50%; sum of CRGV+360 weights must equal 100%'
  },
  {
    name: 'feedback_360_score',
    required: false,
    type: 'numeric(5,2)',
    description: 'Captured 360 feedback score for this participant',
    defaultValue: 'null',
    validation: 'Populated from linked 360 cycle results'
  },
  {
    name: 'feedback_360_completion_rate',
    required: false,
    type: 'numeric(5,2)',
    description: 'Percentage of 360 feedback requests completed',
    defaultValue: 'null',
    validation: 'Minimum 70% required for score inclusion'
  },
  {
    name: 'appraisal_cycle_id',
    required: false,
    type: 'UUID',
    description: 'Links 360 cycle to parent appraisal cycle',
    defaultValue: 'null',
    validation: 'Must reference valid appraisal_cycles.id'
  },
  {
    name: 'feed_to_appraisal',
    required: false,
    type: 'boolean',
    description: 'Enables automatic score contribution',
    defaultValue: 'false',
    validation: 'Requires appraisal_cycle_id to be set'
  }
];

const linkingSteps: Step[] = [
  {
    title: 'Create or Select Appraisal Cycle',
    description: 'Ensure an active appraisal cycle exists with CRGV+360 weight configuration.',
    notes: ['360 weight configured in review_cycle_settings', 'Total weights must sum to 100%']
  },
  {
    title: 'Create 360 Feedback Cycle',
    description: 'Create a new 360 cycle with timing that completes before appraisal finalization.',
    notes: ['360 end date should be 2-4 weeks before appraisal deadline']
  },
  {
    title: 'Link Cycles',
    description: 'Set appraisal_cycle_id on the 360 cycle to create the linkage.',
    notes: ['This establishes the parent-child relationship']
  },
  {
    title: 'Enable Feed',
    description: 'Set feed_to_appraisal = true to enable automatic score contribution.',
    notes: ['Without this flag, linkage is informational only']
  },
  {
    title: 'Configure Weight',
    description: 'Verify 360 weight in appraisal cycle settings matches your scoring model.',
    notes: ['Typical range: 10-30% for 360 component']
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: '360 cycle must complete before appraisal finalization',
    enforcement: 'System',
    description: 'Appraisal cannot be finalized if linked 360 cycle is still collecting feedback'
  },
  {
    rule: 'Minimum 70% completion rate for score inclusion',
    enforcement: 'Policy',
    description: 'Participants with <70% 360 response rate may have 360 component excluded'
  },
  {
    rule: '360 weight cannot exceed 50%',
    enforcement: 'System',
    description: 'Prevents over-reliance on multi-rater feedback vs direct manager assessment'
  },
  {
    rule: 'Score normalization uses 1-5 scale',
    enforcement: 'System',
    description: 'All 360 scores normalized to match appraisal rating scale before contribution'
  },
  {
    rule: 'One 360 cycle per appraisal cycle',
    enforcement: 'Advisory',
    description: 'Best practice to avoid score confusion; system supports multiple but not recommended'
  }
];

export function IntegrationAppraisalFeed() {
  return (
    <section id="sec-7-2" data-manual-anchor="sec-7-2" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">7.2 Appraisal Integration</h3>
          <p className="text-sm text-muted-foreground">
            CRGV+360 model integration for multi-source performance evaluation
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Link 360 Feedback cycles to appraisal cycles',
        'Configure 360 weight in the CRGV+360 scoring model',
        'Understand score normalization and contribution calculation',
        'Manage timing dependencies between 360 and appraisal workflows'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            CRGV+360 Scoring Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <strong>CRGV+360</strong> model extends the standard performance appraisal with 
            multi-source feedback as a fifth evaluation component:
          </p>

          <div className="grid md:grid-cols-5 gap-2">
            {[
              { code: 'C', name: 'Competencies', typical: '20%' },
              { code: 'R', name: 'Responsibilities (KRAs)', typical: '30%' },
              { code: 'G', name: 'Goals', typical: '25%' },
              { code: 'V', name: 'Values', typical: '10%' },
              { code: '360', name: 'Feedback', typical: '15%' }
            ].map(component => (
              <div key={component.code} className="p-3 border rounded-lg text-center">
                <Badge variant="outline" className="text-lg font-bold mb-2">{component.code}</Badge>
                <p className="text-xs text-muted-foreground">{component.name}</p>
                <p className="text-sm font-medium mt-1">{component.typical}</p>
              </div>
            ))}
          </div>

          <InfoCallout>
            Weights are configurable per cycle. The 360 component typically ranges from 10-30% 
            depending on organizational culture and the strategic importance of peer feedback.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Score Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg font-mono text-sm">
            <p className="mb-2">// Score normalization (from useFeedback360Score.ts)</p>
            <p className="text-primary">
              normalizedScore = ((360_score - sourceMin) / (sourceMax - sourceMin)) × (targetMax - targetMin) + targetMin
            </p>
            <p className="mt-4 mb-2">// Contribution to final appraisal</p>
            <p className="text-primary">
              360_contribution = (normalized_360_score × weight) / 100
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <h4 className="font-medium mb-2">Example Calculation</h4>
            <ul className="space-y-1 text-sm">
              <li><strong>Raw 360 Score:</strong> 4.2 (on 1-5 scale)</li>
              <li><strong>360 Weight:</strong> 15%</li>
              <li><strong>Appraisal Scale:</strong> 1-5</li>
              <li><strong>Normalized Score:</strong> 4.2 (same scale, no conversion)</li>
              <li><strong>Contribution:</strong> 4.2 × 0.15 = <strong>0.63 points</strong></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={linkingSteps} 
        title="Cycle Linking Procedure" 
      />

      <FieldReferenceTable 
        fields={appraisalIntegrationFields} 
        title="Appraisal Integration Database Fields" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timing Dependencies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WarningCallout>
            <strong>Critical:</strong> 360 Feedback collection must complete and results must be 
            processed before the linked appraisal cycle enters finalization phase. Plan for a 
            2-4 week buffer between 360 close and appraisal deadline.
          </WarningCallout>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <Badge variant="outline">Week 1-4</Badge>
              <span className="text-sm">360 Feedback collection period</span>
            </div>
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <Badge variant="outline">Week 5</Badge>
              <span className="text-sm">360 cycle closes, AI processing runs</span>
            </div>
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <Badge variant="outline">Week 6-8</Badge>
              <span className="text-sm">Appraisal self-assessment and manager review</span>
            </div>
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <Badge variant="outline">Week 9-10</Badge>
              <span className="text-sm">Calibration and finalization (includes 360 scores)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />

      <TipCallout>
        Use the <code>normalize360Score()</code> utility from <code>useFeedback360Score.ts</code> 
        to ensure consistent score transformation when building custom integrations or reports.
      </TipCallout>
    </section>
  );
}
