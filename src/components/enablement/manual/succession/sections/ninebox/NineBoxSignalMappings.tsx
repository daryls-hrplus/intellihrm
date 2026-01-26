// Section 3.3: Signal Mappings Configuration
// Map talent signals to Nine-Box axes with weighted calculations

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  FieldReferenceTable,
  StepByStep,
  TroubleshootingSection,
  type FieldDefinition,
  type Step,
  type TroubleshootingItem,
} from '../../../components';
import { GitBranch, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

const SIGNAL_MAPPINGS_FIELDS: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Primary key, auto-generated',
    defaultValue: 'gen_random_uuid()',
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to companies table',
    validation: 'Must reference valid company',
  },
  {
    name: 'signal_definition_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to talent_signal_definitions table',
    validation: 'Must reference active signal definition',
  },
  {
    name: 'contributes_to',
    required: true,
    type: "Text ('performance' | 'potential' | 'both')",
    description: 'Which Nine-Box axis this signal contributes to',
    validation: "Must be 'performance', 'potential', or 'both'",
  },
  {
    name: 'weight',
    required: true,
    type: 'Numeric(3,2)',
    description: 'Weight multiplier for signal contribution (0.0 to 1.0)',
    defaultValue: '1.0',
    validation: 'Must be between 0 and 1',
  },
  {
    name: 'minimum_confidence',
    required: true,
    type: 'Numeric(3,2)',
    description: 'Minimum confidence score required for signal inclusion',
    defaultValue: '0.6',
    validation: 'Must be between 0 and 1; signals below threshold are excluded',
  },
  {
    name: 'is_active',
    required: true,
    type: 'Boolean',
    description: 'Whether this mapping is currently active',
    defaultValue: 'true',
  },
  {
    name: 'created_at',
    required: true,
    type: 'Timestamp',
    description: 'Record creation timestamp',
    defaultValue: 'now()',
  },
  {
    name: 'updated_at',
    required: false,
    type: 'Timestamp',
    description: 'Last modification timestamp',
  },
];

const INITIALIZE_DEFAULTS_STEPS: Step[] = [
  {
    title: 'Navigate to Nine-Box Configuration',
    description: 'Access the Nine-Box setup from the Succession module.',
    substeps: [
      'Go to Performance → Succession → Setup',
      'Select the "Nine-Box Config" tab',
      'Choose the target company from the dropdown',
    ],
  },
  {
    title: 'Open Signal Mappings Panel',
    description: 'Locate the Signal Mappings configuration section.',
    substeps: [
      'Click the "Signal Mappings" tab in the configuration panel',
      'Review any existing mappings (should be empty for new setup)',
    ],
  },
  {
    title: 'Initialize Default Mappings',
    description: 'Create industry-standard signal-to-axis mappings.',
    substeps: [
      'Click "Initialize Defaults" button',
      'System will create mappings for all active talent signal definitions',
      'Each mapping follows the DEFAULT_SIGNAL_MAPPINGS configuration',
    ],
    expectedResult: 'System displays "Created X default signal mappings" success message.',
  },
  {
    title: 'Review and Adjust',
    description: 'Fine-tune mappings for your organization\'s needs.',
    substeps: [
      'Review each mapping\'s contributes_to assignment',
      'Adjust weights based on organizational priorities',
      'Set minimum_confidence thresholds (default: 0.6)',
      'Deactivate any irrelevant signal categories',
    ],
    notes: [
      'Leadership signals typically contribute to Potential (weight 1.0)',
      'Technical signals typically contribute to Performance (weight 1.0)',
      'Teamwork and general signals often contribute to Both (weight 0.5-0.7)',
    ],
  },
];

const TROUBLESHOOTING_ITEMS: TroubleshootingItem[] = [
  {
    issue: 'Signal not appearing in axis calculation',
    cause: 'Signal\'s confidence_score is below the mapping\'s minimum_confidence threshold',
    solution: 'Lower the minimum_confidence for that mapping, or investigate why signal confidence is low',
  },
  {
    issue: '"No signal definitions found" error when initializing',
    cause: 'No active talent signal definitions exist in the system',
    solution: 'First configure talent_signal_definitions in Performance → Signals before mapping',
  },
  {
    issue: 'Bias-adjusted scores are significantly lower than expected',
    cause: 'Multiple signals have high bias_risk_level, triggering aggressive adjustment',
    solution: 'Review 360 feedback collection methodology; high bias risk applies 0.7x multiplier',
  },
  {
    issue: 'Same signal contributing twice to an axis',
    cause: 'Both a direct mapping and "both" contributes_to exist for same signal',
    solution: 'Remove duplicate mappings; use "both" for signals that genuinely apply to both axes',
  },
];

export function NineBoxSignalMappings() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand how talent signals from 360 Feedback flow into Nine-Box axis calculations",
          "Configure signal-to-axis mappings with appropriate weights and confidence thresholds",
          "Initialize default industry-standard signal mappings for a new company",
          "Apply bias risk adjustments to ensure fair and objective assessments",
          "Troubleshoot signal mapping issues affecting Nine-Box ratings"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Succession → Setup → Nine-Box Config → Signal Mappings
        </code>
      </InfoCallout>

      {/* Field Reference Table */}
      <FieldReferenceTable
        title="nine_box_signal_mappings Table Schema"
        fields={SIGNAL_MAPPINGS_FIELDS}
      />

      {/* Default Signal Mappings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Default Signal-to-Axis Mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            These industry-standard mappings define how each signal category contributes to 
            Performance and/or Potential axes. Initialize these defaults for new companies.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Signal Category</th>
                  <th className="text-left py-3 px-4 font-medium">Contributes To</th>
                  <th className="text-left py-3 px-4 font-medium">Weight</th>
                  <th className="text-left py-3 px-4 font-medium">Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">leadership</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">Potential</Badge>
                  </td>
                  <td className="py-3 px-4">1.0</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Leadership capability indicates future readiness</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">people_leadership</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">Potential</Badge>
                  </td>
                  <td className="py-3 px-4">1.0</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Team development skills predict advancement</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">strategic_thinking</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">Potential</Badge>
                  </td>
                  <td className="py-3 px-4">1.0</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Strategic mindset for senior roles</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">influence</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">Potential</Badge>
                  </td>
                  <td className="py-3 px-4">1.0</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Ability to lead without authority</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">adaptability</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">Potential</Badge>
                  </td>
                  <td className="py-3 px-4">0.8</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Learning agility proxy</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">technical</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">Performance</Badge>
                  </td>
                  <td className="py-3 px-4">1.0</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Current role execution</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">customer_focus</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">Performance</Badge>
                  </td>
                  <td className="py-3 px-4">0.8</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Current role effectiveness</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">teamwork</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-purple-600">Both</Badge>
                  </td>
                  <td className="py-3 px-4">0.7</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Collaboration affects both axes</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">values</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">Potential</Badge>
                  </td>
                  <td className="py-3 px-4">0.6</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">Cultural fit for advancement</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">general</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-purple-600">Both</Badge>
                  </td>
                  <td className="py-3 px-4">0.5</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">General feedback applies to both</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bias Risk Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Bias Risk Adjustment Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Signals from 360 Feedback carry a bias_risk_level that adjusts their contribution 
            to ensure fair assessment. Higher bias risk results in reduced weight.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Bias Risk Level</th>
                  <th className="text-left py-3 px-4 font-medium">Multiplier</th>
                  <th className="text-left py-3 px-4 font-medium">Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge variant="destructive">High</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono">0.7x</td>
                  <td className="py-3 px-4 text-muted-foreground">Signal contribution reduced by 30%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-600">Medium</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono">0.85x</td>
                  <td className="py-3 px-4 text-muted-foreground">Signal contribution reduced by 15%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">Low</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono">1.0x</td>
                  <td className="py-3 px-4 text-muted-foreground">Full signal contribution (no reduction)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`// Bias-adjusted score calculation
const biasMultiplier = 
  signal.bias_risk_level === 'high' ? 0.7 :
  signal.bias_risk_level === 'medium' ? 0.85 : 
  1.0;

const adjustedScore = signal.normalized_score * biasMultiplier;
const contribution = adjustedScore * mapping.weight;`}
            </pre>
          </div>

          <WarningCallout title="High Bias Risk Signals">
            Signals with high bias risk are often from assessors who show patterns of 
            extreme ratings, recency bias, or halo effects. Review 360 Feedback 
            configuration if many signals have elevated bias risk.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Minimum Confidence Threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Minimum Confidence Threshold
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each signal snapshot has a confidence_score (0-1) indicating data quality. 
            The minimum_confidence threshold filters out low-quality signals from axis calculations.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-muted-foreground">0.4</div>
              <div className="text-xs text-muted-foreground">Lenient (more signals included)</div>
            </div>
            <div className="p-4 border rounded-lg text-center bg-primary/5">
              <div className="text-2xl font-bold text-primary">0.6</div>
              <div className="text-xs text-muted-foreground">Default (balanced)</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-muted-foreground">0.8</div>
              <div className="text-xs text-muted-foreground">Strict (only high-quality)</div>
            </div>
          </div>

          <TipCallout title="Threshold Selection Guidance">
            Use the default 0.6 threshold for most organizations. Lower to 0.4 if you have 
            limited feedback data. Increase to 0.8 for high-stakes assessments where data 
            quality is paramount.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Step-by-Step Procedure */}
      <StepByStep
        title="Initialize Default Signal Mappings"
        steps={INITIALIZE_DEFAULTS_STEPS}
      />

      {/* Troubleshooting */}
      <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />

      {/* Best Practices */}
      <TipCallout title="Signal Mapping Best Practices">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Initialize defaults first, then customize—don't start from scratch</li>
          <li>Leadership signals should always map to Potential (not Performance)</li>
          <li>Technical/execution signals should map to Performance</li>
          <li>Use "both" sparingly—only for signals that genuinely indicate both axes</li>
          <li>Review mappings annually during calibration cycle reviews</li>
          <li>Monitor bias risk distributions across the organization</li>
        </ul>
      </TipCallout>
    </div>
  );
}
