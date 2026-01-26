import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Sparkles, 
  Shield, 
  Camera, 
  TrendingUp,
  CheckCircle2,
  Lock,
  Eye
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  BusinessRules,
  type FieldDefinition,
  type BusinessRule 
} from '@/components/enablement/manual/components';

const talentSignalFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the signal snapshot',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'employee_id',
    required: true,
    type: 'UUID',
    description: 'Subject employee receiving the talent signal',
    defaultValue: '—',
    validation: 'Must reference valid profiles.id'
  },
  {
    name: 'source_type',
    required: true,
    type: 'text',
    description: 'Origin module of the signal',
    defaultValue: '—',
    validation: 'Enum: feedback_360, appraisal, goal, competency'
  },
  {
    name: 'source_reference_id',
    required: false,
    type: 'UUID',
    description: 'Reference to source record (e.g., cycle ID)',
    defaultValue: 'null',
    validation: 'For traceability and versioning'
  },
  {
    name: 'signal_value',
    required: true,
    type: 'numeric(5,2)',
    description: 'Normalized signal score (1-5 scale)',
    defaultValue: '—',
    validation: 'Must be within configured scale range'
  },
  {
    name: 'confidence_score',
    required: false,
    type: 'numeric(3,2)',
    description: 'AI confidence in signal accuracy (0-1)',
    defaultValue: '0.8',
    validation: 'Based on response count and consistency'
  },
  {
    name: 'signal_metadata',
    required: false,
    type: 'jsonb',
    description: 'Additional context (rater categories, response count)',
    defaultValue: '{}',
    validation: 'Structured JSON'
  },
  {
    name: 'created_at',
    required: true,
    type: 'timestamp',
    description: 'When signal was captured',
    defaultValue: 'now()',
    validation: 'Auto-generated'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Signal generation requires employee consent',
    enforcement: 'System',
    description: 'Consent gate checks signal_generation consent before creating snapshots'
  },
  {
    rule: 'Minimum 5 responses for signal creation',
    enforcement: 'System',
    description: 'K-anonymity threshold protects rater identity in aggregated signals'
  },
  {
    rule: 'Signals are versioned per cycle',
    enforcement: 'System',
    description: 'Each 360 cycle creates a new snapshot; historical signals preserved'
  },
  {
    rule: 'Confidence score reflects data quality',
    enforcement: 'Advisory',
    description: 'Lower confidence (<0.6) should trigger manual review before use'
  },
  {
    rule: 'Talent card displays latest signal only',
    enforcement: 'System',
    description: 'UI shows most recent; historical available in detailed view'
  }
];

export function IntegrationTalentProfile() {
  return (
    <section id="sec-7-3" data-manual-anchor="sec-7-3" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">7.3 Talent Profile Integration</h3>
          <p className="text-sm text-muted-foreground">
            Signal snapshot generation for talent cards and talent management
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand how 360 feedback creates talent signals',
        'Configure signal generation consent and thresholds',
        'Interpret confidence scores and metadata',
        'View historical signal trends on talent profiles'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Signal Snapshot Concept
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When a 360 Feedback cycle completes, the system captures a <strong>talent signal snapshot</strong> 
            for each subject employee. This snapshot represents a point-in-time view of multi-rater 
            perception that feeds into the broader Talent Profile.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium">AI Processing</h4>
              <p className="text-sm text-muted-foreground">
                Raw responses aggregated and normalized
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium">Snapshot Creation</h4>
              <p className="text-sm text-muted-foreground">
                Signal value + confidence stored
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium">Trend Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Historical signals enable trajectory analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consent Gate Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WarningCallout>
            Signal generation is consent-gated. The system checks the employee's consent record 
            before creating any talent signals from 360 feedback data. Without consent, no signals 
            are created even if the 360 cycle completes successfully.
          </WarningCallout>

          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4" />
              Consent Check Flow
            </h4>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>360 cycle completes for subject employee</li>
              <li>System checks <code>employee_consents</code> for <code>signal_generation</code> consent</li>
              <li>If consent = true → create talent_signal_snapshot</li>
              <li>If consent = false or missing → skip signal creation, log event</li>
              <li>HR can view consent status in employee profile</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={talentSignalFields} 
        title="talent_signal_snapshots Table Fields" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Talent Card Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The talent card on employee profiles displays the latest 360 signal alongside other 
            talent indicators:
          </p>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Sample Talent Card Section</h4>
              <Badge variant="outline">360 Signal</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Latest Score</p>
                <p className="text-2xl font-bold text-primary">4.2</p>
              </div>
              <div>
                <p className="text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold text-green-600">85%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Source</p>
                <p className="font-medium">Q4 2024 360 Cycle</p>
              </div>
              <div>
                <p className="text-muted-foreground">Response Count</p>
                <p className="font-medium">8 raters</p>
              </div>
            </div>
          </div>

          <TipCallout>
            Click "View History" on the talent card to see signal trends across multiple 360 cycles. 
            This helps identify trajectory patterns for succession and development planning.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Signal Aggregation by Rater Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The signal metadata captures category-level breakdowns while respecting anonymity:
          </p>

          <div className="space-y-2">
            {[
              { category: 'Manager', score: 4.5, weight: 30, responses: 1 },
              { category: 'Peer', score: 4.1, weight: 25, responses: 4 },
              { category: 'Direct Report', score: 4.3, weight: 20, responses: 3 },
              { category: 'Cross-Functional', score: 3.9, weight: 15, responses: 2 },
              { category: 'Self', score: 4.0, weight: 10, responses: 1 }
            ].map(cat => (
              <div key={cat.category} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{cat.category}</Badge>
                  <span className="text-sm text-muted-foreground">({cat.responses} responses)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{cat.score.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">× {cat.weight}%</span>
                </div>
              </div>
            ))}
          </div>

          <InfoCallout>
            Category scores with fewer than 3 responses are shown as "Not enough responses" in 
            individual reports to protect anonymity, but still contribute to the weighted aggregate.
          </InfoCallout>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />
    </section>
  );
}
