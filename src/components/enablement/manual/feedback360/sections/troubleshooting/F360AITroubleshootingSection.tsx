import { LearningObjectives } from '../../../components/LearningObjectives';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { Brain, AlertTriangle, Lightbulb, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Diagnose signal extraction and processing failures',
  'Troubleshoot development theme generation issues',
  'Resolve coaching prompt and bias detection problems',
  'Handle AI explainability and human override scenarios'
];

const signalExtractionIssues: TroubleshootingItem[] = [
  {
    issue: 'Signal extraction not starting after cycle completion',
    cause: 'AI processing not triggered, insufficient response count, or consent not granted',
    solution: 'Verify cycle status = completed, check minimum response threshold (typically 5+), confirm signal_generation consent, and manually trigger extraction if automated trigger failed.'
  },
  {
    issue: 'Signal extraction stuck in processing state',
    cause: 'Edge function timeout (>30 min), AI model unavailable, or processing error',
    solution: 'Check feedback_ai_action_logs for error messages, verify AI model health, restart extraction with smaller batch size, and escalate if persistent.'
  },
  {
    issue: 'Extracted signals have low confidence scores',
    cause: 'Conflicting feedback, sparse data, or ambiguous response text',
    solution: 'Review response volume per competency (minimum 3 recommended), check for outlier responses, consider excluding incomplete responses, and adjust confidence thresholds.'
  },
  {
    issue: 'Signal extraction returns empty results',
    cause: 'No text responses to analyze, or all responses filtered by quality checks',
    solution: 'Verify feedback_360_responses contain text comments, check writing_quality_score thresholds, and ensure at least one analyzable response per competency.'
  }
];

const themeGenerationIssues: TroubleshootingItem[] = [
  {
    issue: 'Development themes not generated after signal extraction',
    cause: 'Theme generation disabled, insufficient signal strength, or AI processing failed',
    solution: 'Check cycle.auto_generate_themes setting, verify at least 2 signals with confidence > 0.6, review feedback_ai_action_logs for generation errors.'
  },
  {
    issue: 'Generated themes are too generic or not actionable',
    cause: 'Insufficient contextual data, or competency framework too broad',
    solution: 'Provide more specific competency definitions, include behavioral indicators in framework, and use industry-specific prompt templates.'
  },
  {
    issue: 'Theme confidence score lower than expected',
    cause: 'Low agreement among raters, or mixed positive/negative signals',
    solution: 'Review theme confidence factors in development_themes.confidence_factors, check for conflicting signals, and flag for manager review if confidence < 0.5.'
  },
  {
    issue: 'Duplicate themes generated for same competency',
    cause: 'Theme consolidation not applied, or signals processed in separate batches',
    solution: 'Enable theme deduplication in AI config, run consolidation pass after generation, and merge similar themes with combined evidence.'
  }
];

const coachingPromptIssues: TroubleshootingItem[] = [
  {
    issue: 'Coaching prompts not appearing for manager',
    cause: 'Prompt generation disabled, manager role not recognized, or theme not confirmed',
    solution: 'Verify cycle.generate_coaching_prompts = true, confirm manager relationship in org hierarchy, ensure development_themes.status = confirmed, and check manager permissions.'
  },
  {
    issue: 'Coaching prompts not relevant to development themes',
    cause: 'Prompt-theme mapping incorrect, or prompt library outdated',
    solution: 'Review feedback_coaching_prompts.theme_id linkage, update prompt library with current competency framework, and regenerate prompts from confirmed themes.'
  },
  {
    issue: 'Manager cannot dismiss or customize prompts',
    cause: 'Prompt interaction logging not enabled, or UI not reflecting state',
    solution: 'Verify coaching_prompt_interactions table exists, check UI component for dismiss/customize actions, and ensure manager has COACHING_PROMPT_EDIT permission.'
  }
];

const biasDetectionIssues: TroubleshootingItem[] = [
  {
    issue: 'Bias detection false positives',
    cause: 'Keyword matching too aggressive, or cultural context not considered',
    solution: 'Review flagged text for context, adjust bias detection sensitivity, add cultural/regional exceptions, and log false positive for model improvement.'
  },
  {
    issue: 'Bias not detected in obviously problematic response',
    cause: 'Subtle bias patterns, or detection model limitations',
    solution: 'Report missed case for model training, consider human review for edge cases, and update bias detection rules with new patterns.'
  },
  {
    issue: 'Bias alerts overwhelming HR review queue',
    cause: 'Threshold too sensitive, or widespread language issues',
    solution: 'Adjust bias_alert_threshold to reduce noise, implement tiered severity levels, and consider pre-submission guidance to reduce problematic responses.'
  }
];

const explainabilityIssues: TroubleshootingItem[] = [
  {
    issue: 'AI decision explanation not available',
    cause: 'Explainability logging disabled, or explanation generation failed',
    solution: 'Verify ai_explainability_logs table has entries, check explanation_generated field, and ensure ISO 42001 compliance logging is enabled.'
  },
  {
    issue: 'Human override not recorded properly',
    cause: 'Override form validation failed, or audit logging error',
    solution: 'Check ai_human_overrides table for entry, verify override_reason meets minimum length, and review audit trail for recording failures.'
  },
  {
    issue: 'Model version drift not detected',
    cause: 'Version tracking disabled, or drift monitoring not configured',
    solution: 'Verify ai_model_registry has version entries, check ai_governance_metrics for drift scores, and configure alerting for drift threshold breaches.'
  }
];

const diagnosticSteps: Step[] = [
  {
    title: 'Check AI Processing Status',
    description: 'Review current AI feature processing state.',
    substeps: [
      'Check feedback_360_cycles.signal_processing_status',
      'Review feedback_ai_action_logs for recent entries',
      'Verify AI model availability in ai_agents table',
      'Check for any active processing locks'
    ],
    expectedResult: 'Clear understanding of AI processing state'
  },
  {
    title: 'Review Input Data Quality',
    description: 'Verify data quality for AI processing.',
    substeps: [
      'Check response count meets minimum threshold',
      'Verify text responses exist (not just numeric ratings)',
      'Review writing_quality_scores for responses',
      'Check consent status for signal generation'
    ],
    expectedResult: 'Input data quality issues identified'
  },
  {
    title: 'Examine AI Logs',
    description: 'Analyze AI processing logs for errors.',
    substeps: [
      'Query feedback_ai_action_logs for error_message',
      'Check edge function logs for AI endpoints',
      'Review ai_agent_executions for completion status',
      'Look for timeout or rate limit errors'
    ],
    expectedResult: 'Specific AI failure reason identified'
  },
  {
    title: 'Apply Fix and Reprocess',
    description: 'Execute remediation and retry AI processing.',
    substeps: [
      'Apply identified fix (data, config, or model)',
      'Clear any stuck processing locks',
      'Trigger manual AI reprocessing',
      'Monitor for successful completion'
    ],
    expectedResult: 'AI features functioning correctly'
  }
];

const databaseFields: FieldDefinition[] = [
  { name: 'feedback_360_cycles.signal_processing_status', required: true, type: 'enum', description: 'Signal extraction status' },
  { name: 'talent_signal_snapshots.signal_value', required: true, type: 'decimal', description: 'Extracted signal value' },
  { name: 'talent_signal_snapshots.confidence_score', required: true, type: 'decimal', description: 'Signal confidence (0-1)' },
  { name: 'development_themes.theme_name', required: true, type: 'text', description: 'AI-generated theme title' },
  { name: 'development_themes.confidence_factors', required: false, type: 'jsonb', description: 'Confidence calculation factors' },
  { name: 'feedback_coaching_prompts.prompt_text', required: true, type: 'text', description: 'Generated coaching prompt' },
  { name: 'feedback_ai_action_logs.action_type', required: true, type: 'enum', description: 'AI action type' },
  { name: 'feedback_ai_action_logs.error_message', required: false, type: 'text', description: 'Error details if failed' },
  { name: 'ai_explainability_logs.explanation_generated', required: false, type: 'text', description: 'AI decision explanation' },
  { name: 'ai_human_overrides.override_reason', required: true, type: 'text', description: 'Human override justification' },
];

export function F360AITroubleshootingSection() {
  return (
    <section id="sec-8-7" data-manual-anchor="sec-8-7" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          8.7 AI Feature Troubleshooting
        </h3>
        <p className="text-muted-foreground mt-2">
          Troubleshooting signal extraction, theme generation, coaching prompts, bias detection, and AI explainability.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
        <Brain className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">ISO 42001 Compliance</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          All AI features include explainability logging and human override capabilities per ISO 42001 requirements.
          Review <code>ai_explainability_logs</code> for decision transparency.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              Signal Extraction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-xs">High Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Signal processing stuck or failing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Theme Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Themes not generated or low quality
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-purple-500" />
              Coaching/Bias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Prompts missing or bias detection issues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              Explainability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">Low Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Explanation or override logging issues
            </p>
          </CardContent>
        </Card>
      </div>

      <TroubleshootingSection
        items={signalExtractionIssues}
        title="Signal Extraction Issues"
      />

      <TroubleshootingSection
        items={themeGenerationIssues}
        title="Theme Generation Issues"
      />

      <TroubleshootingSection
        items={coachingPromptIssues}
        title="Coaching Prompt Issues"
      />

      <TroubleshootingSection
        items={biasDetectionIssues}
        title="Bias Detection Issues"
      />

      <TroubleshootingSection
        items={explainabilityIssues}
        title="Explainability & Override Issues"
      />

      <StepByStep
        steps={diagnosticSteps}
        title="AI Feature Diagnostic Procedure"
      />

      <FieldReferenceTable
        fields={databaseFields}
        title="AI Feature Database Fields"
      />
    </section>
  );
}
