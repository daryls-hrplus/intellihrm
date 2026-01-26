// Section 3.2: Rating Sources Configuration
// Configure appraisal scores, goal achievement, and custom sources as inputs

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
import { Settings, Database, Scale, AlertTriangle } from 'lucide-react';

const RATING_SOURCES_FIELDS: FieldDefinition[] = [
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
    name: 'axis',
    required: true,
    type: "Text ('performance' | 'potential')",
    description: 'Which Nine-Box axis this source contributes to',
    validation: "Must be 'performance' or 'potential'",
  },
  {
    name: 'source_type',
    required: true,
    type: 'Text',
    description: 'Type identifier for the data source (e.g., appraisal_overall_score, goal_achievement)',
    validation: 'Must match supported source types',
  },
  {
    name: 'source_config',
    required: false,
    type: 'JSONB',
    description: 'Custom configuration for the source (e.g., date ranges, filters)',
    defaultValue: '{}',
  },
  {
    name: 'weight',
    required: true,
    type: 'Numeric(3,2)',
    description: 'Weight factor for this source (0.0 to 1.0)',
    defaultValue: '1.0',
    validation: 'Must be between 0 and 1; weights per axis should sum to 1.0',
  },
  {
    name: 'is_active',
    required: true,
    type: 'Boolean',
    description: 'Whether this source is currently used in calculations',
    defaultValue: 'true',
  },
  {
    name: 'priority',
    required: true,
    type: 'Integer',
    description: 'Processing order when multiple sources exist for same axis',
    defaultValue: '0',
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

const ADD_SOURCE_STEPS: Step[] = [
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
    title: 'Open Rating Sources Panel',
    description: 'Locate the Rating Sources configuration section.',
    substeps: [
      'Click the "Rating Sources" tab in the configuration panel',
      'Review existing sources for both Performance and Potential axes',
    ],
  },
  {
    title: 'Add New Rating Source',
    description: 'Configure a new data source for axis calculation.',
    substeps: [
      'Click "Add Source" button',
      'Select the target axis (Performance or Potential)',
      'Choose the source type from the dropdown',
      'Set the weight (0.0 to 1.0)',
      'Set the priority order',
    ],
    expectedResult: 'New source appears in the sources list with the specified configuration.',
  },
  {
    title: 'Verify Weight Normalization',
    description: 'Ensure all weights for an axis sum to 1.0 for proper calculation.',
    substeps: [
      'Review the weight total displayed for each axis',
      'Adjust individual source weights if the total does not equal 1.0',
      'The system will auto-normalize if weights do not sum to 1.0',
    ],
    notes: [
      'If weights exceed 1.0, each source contribution is proportionally reduced',
      'If weights are below 1.0, missing data scenarios may affect confidence scores',
    ],
    expectedResult: 'Weight total displays 100% for optimal accuracy.',
  },
];

const TROUBLESHOOTING_ITEMS: TroubleshootingItem[] = [
  {
    issue: 'Axis score shows as empty even with data',
    cause: 'No active rating sources configured for the axis, or all sources have weight 0',
    solution: 'Add at least one rating source with is_active = true and weight > 0 for the axis',
  },
  {
    issue: 'Confidence score is very low (< 30%)',
    cause: 'Missing data from expected sources or weights not summing to 1.0',
    solution: 'Verify source data exists for the employee; check weight normalization; add fallback sources',
  },
  {
    issue: 'Rating calculation differs from expected',
    cause: 'Source priority order or weight configuration may be incorrect',
    solution: 'Review priority settings and weight distribution; verify source_config JSON is correct',
  },
  {
    issue: 'Duplicate source error on save',
    cause: 'Same source_type already exists for this company and axis',
    solution: 'Edit the existing source rather than creating a duplicate; use unique source_type values',
  },
];

export function NineBoxRatingSources() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Configure rating sources that feed data into Performance and Potential axis calculations",
          "Understand the weight normalization formula used when combining multiple sources",
          "Set up default performance sources: appraisal scores, goal achievement, competency averages",
          "Set up default potential sources: potential assessments, leadership signals, values signals",
          "Troubleshoot common rating source configuration issues"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Succession → Setup → Nine-Box Config → Rating Sources
        </code>
      </InfoCallout>

      {/* Field Reference Table */}
      <FieldReferenceTable
        title="nine_box_rating_sources Table Schema"
        fields={RATING_SOURCES_FIELDS}
      />

      {/* Default Performance Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Default Performance Axis Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            These sources are recommended for calculating the Performance axis rating. 
            Initialize these defaults when first configuring Nine-Box for a company.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Source Type</th>
                  <th className="text-left py-3 px-4 font-medium">Label</th>
                  <th className="text-left py-3 px-4 font-medium">Weight</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Data Source</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">appraisal_overall_score</td>
                  <td className="py-3 px-4">Appraisal Score</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">50%</Badge>
                  </td>
                  <td className="py-3 px-4">1</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">appraisal_participants.overall_score (1-5 scale → normalized)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">goal_achievement</td>
                  <td className="py-3 px-4">Goal Achievement</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">30%</Badge>
                  </td>
                  <td className="py-3 px-4">2</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">performance_goals.progress_percentage (0-100% → normalized)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">competency_average</td>
                  <td className="py-3 px-4">Competency Average</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">20%</Badge>
                  </td>
                  <td className="py-3 px-4">3</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">talent_signal_snapshots (technical, customer_focus categories)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Default Potential Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Default Potential Axis Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            These sources are recommended for calculating the Potential axis rating, 
            measuring future capability and growth capacity.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Source Type</th>
                  <th className="text-left py-3 px-4 font-medium">Label</th>
                  <th className="text-left py-3 px-4 font-medium">Weight</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Data Source</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">potential_assessment</td>
                  <td className="py-3 px-4">Potential Assessment</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">40%</Badge>
                  </td>
                  <td className="py-3 px-4">1</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">potential_assessments.calculated_rating (1-3 scale)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">leadership_signals</td>
                  <td className="py-3 px-4">Leadership Signals (360)</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">40%</Badge>
                  </td>
                  <td className="py-3 px-4">2</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">talent_signal_snapshots (leadership, people_leadership, strategic_thinking, influence)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">values_signals</td>
                  <td className="py-3 px-4">Values & Adaptability</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">20%</Badge>
                  </td>
                  <td className="py-3 px-4">3</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">talent_signal_snapshots (values, adaptability categories)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weight Normalization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Weight Normalization Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When multiple sources contribute to an axis, weights are normalized to ensure 
            accurate calculation even when some data is missing.
          </p>

          <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`// Axis score calculation with normalization
let totalScore = 0;
let totalWeight = 0;

for (const source of activeSources) {
  if (source.hasData) {
    totalScore += source.normalizedValue * source.weight;
    totalWeight += source.weight;
  }
}

// Normalize for missing data
const axisScore = totalWeight > 0 ? totalScore / totalWeight : 0;

// Convert to 1-3 rating scale
const rating = axisScore < 0.33 ? 1 : axisScore < 0.67 ? 2 : 3;

// Calculate confidence based on data coverage
const confidence = Math.min(totalWeight, 1.0);`}
            </pre>
          </div>

          <WarningCallout title="Missing Data Handling">
            If a source has no data for an employee, its weight is excluded from the total. 
            This ensures ratings are still calculated but with reduced confidence. 
            Always check the confidence score when data sources are incomplete.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Step-by-Step Procedure */}
      <StepByStep
        title="Add a New Rating Source"
        steps={ADD_SOURCE_STEPS}
      />

      {/* Troubleshooting */}
      <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />

      {/* Best Practices */}
      <TipCallout title="Configuration Best Practices">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Always ensure weights for each axis sum to 1.0 (100%)</li>
          <li>Use at least 2-3 sources per axis for balanced assessment</li>
          <li>Set priority order to control fallback behavior when sources are missing</li>
          <li>Review source effectiveness quarterly based on calibration outcomes</li>
          <li>Document custom source_config JSON for maintenance clarity</li>
        </ul>
      </TipCallout>
    </div>
  );
}
