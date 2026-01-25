import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { Calculator, Lock, Eye, FileBarChart } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Understand the results processing pipeline after feedback collection closes',
  'Configure score aggregation rules and anonymity thresholds',
  'Review and validate calculated results before release',
  'Handle edge cases like insufficient responses or anonymity violations',
  'Generate individual and aggregate reports'
];

const PROCESSING_DIAGRAM = `
flowchart TD
    subgraph Trigger["Processing Trigger"]
        A[Cycle End Date Reached] --> B[Lock Submissions]
        B --> C[Status: Completed]
    end
    
    subgraph Aggregation["Score Aggregation"]
        C --> D[Collect All Responses]
        D --> E[Group by Rater Type]
        E --> F[Calculate Category Averages]
        F --> G[Apply Weighting if configured]
        G --> H[Calculate Overall Scores]
    end
    
    subgraph Anonymity["Anonymity Enforcement"]
        H --> I{Check Thresholds}
        I -->|Met| J[Include Breakdown]
        I -->|Not Met| K[Suppress Category]
        K --> L[Show Combined Only]
        J --> M[Apply Visibility Rules]
        L --> M
    end
    
    subgraph Reports["Report Generation"]
        M --> N[Generate Individual Reports]
        N --> O[Generate Manager Summaries]
        O --> P[Generate HR Analytics]
        P --> Q[Status: Ready for Release]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style Q fill:#10b981,stroke:#059669,color:#fff
    style K fill:#f59e0b,stroke:#d97706
`;

const AGGREGATION_RULES = [
  { rule: 'Self-Assessment', calculation: 'Single score (not averaged)', inclusion: 'Separate display, optionally excluded from overall' },
  { rule: 'Manager', calculation: 'Direct manager score (single rater)', inclusion: 'Always included if provided' },
  { rule: 'Peers', calculation: 'Average of all peer responses', inclusion: 'Only if >= anonymity_threshold responses' },
  { rule: 'Direct Reports', calculation: 'Average of all DR responses', inclusion: 'Only if >= anonymity_threshold responses' },
  { rule: 'External', calculation: 'Average of all external responses', inclusion: 'Only if >= anonymity_threshold responses' },
  { rule: 'Overall', calculation: 'Weighted average across categories', inclusion: 'Self may be excluded based on settings' }
];

const FIELDS: FieldDefinition[] = [
  {
    name: 'signal_processing_status',
    required: true,
    type: 'enum',
    description: 'Current state of results processing',
    defaultValue: 'pending',
    validation: 'pending | processing | completed | failed'
  },
  {
    name: 'signals_processed_at',
    required: false,
    type: 'timestamp',
    description: 'When processing completed',
    defaultValue: '—',
    validation: 'Set on successful completion'
  },
  {
    name: 'anonymity_threshold',
    required: true,
    type: 'integer',
    description: 'Minimum responses per category for breakdown',
    defaultValue: '3',
    validation: '2-5, set at cycle level'
  },
  {
    name: 'exclude_self_from_average',
    required: true,
    type: 'boolean',
    description: 'Whether self-assessment is in overall average',
    defaultValue: 'true',
    validation: '—'
  },
  {
    name: 'hide_rating_points',
    required: true,
    type: 'boolean',
    description: 'Show only labels, not numeric scores',
    defaultValue: 'false',
    validation: 'Affects report display'
  },
  {
    name: 'report_template_config',
    required: false,
    type: 'jsonb',
    description: 'Configuration for report generation',
    defaultValue: 'Default template',
    validation: 'Valid template reference'
  },
  {
    name: 'results_visibility_rules',
    required: true,
    type: 'jsonb',
    description: 'Who can see what level of detail',
    defaultValue: 'Standard visibility',
    validation: 'Valid visibility configuration'
  }
];

const STEPS: Step[] = [
  {
    title: 'Monitor Processing Status',
    description: 'Track the automated processing after deadline.',
    substeps: [
      'Cycle automatically moves to "Completed" status at end_date',
      'Processing job begins (typically within 1 hour)',
      'View status in cycle details → "Results" tab',
      'Status shows: Pending → Processing → Completed',
      'If failed, error message indicates issue'
    ],
    expectedResult: 'Processing completes successfully, status shows "Completed"'
  },
  {
    title: 'Review Aggregated Results',
    description: 'Validate calculated scores before release.',
    substeps: [
      'Navigate to cycle → "Results Preview"',
      'Review overall statistics: response rate, average scores',
      'Check score distributions by competency',
      'Identify any outliers or unexpected patterns',
      'Verify anonymity thresholds are properly applied'
    ],
    expectedResult: 'Results validated and ready for release decision'
  },
  {
    title: 'Handle Anonymity Threshold Violations',
    description: 'Manage cases where category responses are too few.',
    substeps: [
      'System flags categories below threshold',
      'For suppressed categories, only "Others" combined shown',
      'Review which participants are affected',
      'Decide whether to extend for more responses (if feasible)',
      'Document any decisions for audit'
    ],
    expectedResult: 'All anonymity violations handled per policy'
  },
  {
    title: 'Generate Reports',
    description: 'Create individual and aggregate reports.',
    substeps: [
      'Click "Generate Reports" in Results tab',
      'Select report template to use',
      'Choose scope: All participants or selected',
      'System generates PDF/downloadable reports',
      'Reports saved and ready for release'
    ],
    expectedResult: 'Reports generated and stored for distribution'
  },
  {
    title: 'Quality Check Sample Reports',
    description: 'Review sample reports before mass release.',
    substeps: [
      'Download 2-3 sample participant reports',
      'Verify data accuracy against source responses',
      'Check formatting and visualization clarity',
      'Ensure anonymity is properly maintained',
      'Confirm all sections are populated correctly'
    ],
    expectedResult: 'Reports pass quality review, approved for release'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Processing stuck in "Pending" status',
    cause: 'Processing job may not have triggered or failed silently',
    solution: 'Check job queue status. If stuck, HR Admin can trigger manual reprocessing. Contact support if persistent.'
  },
  {
    issue: 'All peer scores showing as "Insufficient Data"',
    cause: 'Fewer than anonymity_threshold peer responses for most participants',
    solution: 'Review actual response counts. If near threshold, consider temporary threshold reduction (with governance approval).'
  },
  {
    issue: 'Scores seem incorrect compared to raw responses',
    cause: 'Weighting rules or exclusions may be applied',
    solution: 'Review cycle configuration for weighting. Check exclude_self_from_average setting. Verify correct response filtering.'
  },
  {
    issue: 'Report generation failing for some participants',
    cause: 'Template may have issues with edge case data',
    solution: 'Check error logs for specific participants. May need to regenerate individually or update template to handle edge cases.'
  }
];

export function WorkflowResultsProcessing() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.10</Badge>
          <Badge variant="secondary">~12 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Results Processing
        </CardTitle>
        <CardDescription>
          Score aggregation, anonymity enforcement, and report generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', '[Cycle Name]', 'Results']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="Results Processing Pipeline"
          description="From cycle closure through aggregation, anonymity enforcement, and report generation"
          diagram={PROCESSING_DIAGRAM}
        />

        {/* Aggregation Rules */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Aggregation Rules by Rater Type
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Rater Type</th>
                  <th className="text-left p-3 font-medium">Calculation</th>
                  <th className="text-left p-3 font-medium">Inclusion Rule</th>
                </tr>
              </thead>
              <tbody>
                {AGGREGATION_RULES.map((rule, index) => (
                  <tr key={rule.rule} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 font-medium">{rule.rule}</td>
                    <td className="p-3 text-muted-foreground">{rule.calculation}</td>
                    <td className="p-3">{rule.inclusion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TipCallout title="Anonymity Protection">
          The anonymity threshold is critical for maintaining trust. Never reduce it below 3 responses
          per category without explicit governance approval and communication to participants.
        </TipCallout>

        <StepByStep steps={STEPS} title="Processing Procedures" />

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Processing Configuration Fields" 
        />

        <WarningCallout title="Data Integrity">
          Once processing is complete and verified, the underlying response data should not be modified.
          Any changes would require full reprocessing and may affect audit compliance.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
