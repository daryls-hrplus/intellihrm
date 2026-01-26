import { LearningObjectives } from '../../../components/LearningObjectives';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { Link2, AlertTriangle, RefreshCw, Target } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Diagnose appraisal integration sync failures',
  'Troubleshoot Nine-Box and succession update issues',
  'Resolve IDP theme linking problems',
  'Fix talent signal processing failures'
];

const appraisalIntegrationIssues: TroubleshootingItem[] = [
  {
    issue: '360 score not appearing in appraisal',
    cause: 'Cycle not linked to appraisal cycle, feed_to_appraisal disabled, or appraisal already finalized',
    solution: 'Verify feedback_360_cycles.appraisal_cycle_id is set, ensure feed_to_appraisal = true, check appraisal status is not finalized, and trigger manual score sync.'
  },
  {
    issue: '360 completion not reflected in appraisal workflow',
    cause: 'Integration rule not configured, or completion event not triggered',
    solution: 'Check appraisal_integration_rules for "360_cycle_completed" trigger, verify cycle status transitioned to completed, and check integration_logs for event processing.'
  },
  {
    issue: 'Score weight not applied correctly',
    cause: 'Weight percentage misconfigured, or calculation order incorrect',
    solution: 'Verify review_cycle_settings.feedback_360_weight value (0-50% typical), ensure total weights sum to 100%, and check score normalization is applied before weighting.'
  },
  {
    issue: 'Appraisal showing stale 360 data',
    cause: 'Cache not refreshed after 360 update, or snapshot taken before cycle completion',
    solution: 'Clear appraisal score cache, re-trigger 360 score aggregation, verify snapshot timestamp is after cycle completion, and check for manual override that froze values.'
  }
];

const nineBoxSuccessionIssues: TroubleshootingItem[] = [
  {
    issue: 'Nine-Box performance axis not updating from 360',
    cause: 'Feed to Nine-Box disabled, or signal mapping not configured',
    solution: 'Verify feedback_360_cycles.feed_to_nine_box = true, check nine_box_signal_mappings for 360 source, and ensure score-to-rating threshold mapping is defined.'
  },
  {
    issue: 'Succession readiness not recalculated after 360',
    cause: 'Integration rule action not triggered, or candidate not in succession pool',
    solution: 'Check appraisal_integration_rules for "update_succession_readiness" action, verify employee is in succession_candidates table, and manually trigger readiness recalculation.'
  },
  {
    issue: 'Performance rating showing incorrect value',
    cause: 'Score threshold mapping mismatch, or aggregate calculation error',
    solution: 'Review score-to-rating thresholds: ≥4.0 = High, 2.5-3.9 = Medium, <2.5 = Low. Verify aggregated score calculation, and check for rater category exclusions affecting total.'
  },
  {
    issue: 'Historical 360 data not available in talent card',
    cause: 'Signal snapshots not created, or snapshot retention policy deleted old data',
    solution: 'Check talent_signal_snapshots for source_type = "feedback_360", verify snapshot_date corresponds to cycle completion, and extend retention policy if historical data needed.'
  }
];

const idpLinkingIssues: TroubleshootingItem[] = [
  {
    issue: 'Development themes not linking to IDP goals',
    cause: 'Theme not confirmed, IDP not created, or linking permission denied',
    solution: 'Verify development_themes.status = "confirmed", ensure employee has IDP created, check IDP permissions allow theme linking, and manually create link if auto-link failed.'
  },
  {
    issue: 'Theme-to-goal link type incorrect',
    cause: 'Auto-classification error, or link_type override not applied',
    solution: 'Review link types: "derived" (AI created), "informed" (suggested), "validated" (confirmed). Allow manager to override link_type in IDP review workflow.'
  },
  {
    issue: 'IDP goals created but not visible to employee',
    cause: 'Goal status is draft, or manager approval pending',
    solution: 'Check idp_items.status for linked goals, verify manager approval workflow completed, and ensure employee notification sent after goal creation.'
  },
  {
    issue: 'Multiple themes linking to same goal',
    cause: 'Competency overlap, or theme consolidation not applied',
    solution: 'Review theme competency mappings, consolidate related themes before linking, and configure unique constraint on theme-goal relationship if needed.'
  }
];

const signalProcessingIssues: TroubleshootingItem[] = [
  {
    issue: 'Signal processing status stuck at "processing"',
    cause: 'Edge function timeout, insufficient response data, or processing error',
    solution: 'Check signal_processing_status timestamp (stale if > 30 min), review edge function logs for errors, verify minimum response threshold met, and retry signal extraction.'
  },
  {
    issue: 'Talent signals not appearing in profile',
    cause: 'Signal generation consent not granted, or k-anonymity threshold not met',
    solution: 'Check feedback_consent_records for signal_generation consent, verify aggregation meets anonymity threshold, and display consent request if missing.'
  },
  {
    issue: 'Signal confidence scores unexpectedly low',
    cause: 'Conflicting feedback, low response volume, or data quality issues',
    solution: 'Review signal calculation: confidence = f(agreement, volume, recency). Check for outlier responses affecting agreement, and consider excluding incomplete responses.'
  },
  {
    issue: 'Cross-module signal routing failed',
    cause: 'Target module not enabled, or routing rule misconfigured',
    solution: 'Verify target module (succession, learning, performance) is enabled, check ai_signal_routing_rules for correct source-target mapping, and review error logs for specific failure.'
  }
];

const diagnosticSteps: Step[] = [
  {
    title: 'Identify Integration Point',
    description: 'Determine which integration is failing.',
    substeps: [
      'Check which target module is affected (appraisal, nine-box, IDP, learning)',
      'Review feedback_360_cycles integration flags',
      'Check appraisal_integration_rules for configured rules',
      'Identify last successful integration timestamp'
    ],
    expectedResult: 'Specific integration point and rule identified'
  },
  {
    title: 'Review Integration Logs',
    description: 'Check processing logs for errors.',
    substeps: [
      'Query integration_logs for cycle_id and target_module',
      'Check status: success, failed, pending',
      'Review error_message for specific failure reason',
      'Check retry_count and last_attempted_at'
    ],
    expectedResult: 'Root cause identified from log messages'
  },
  {
    title: 'Verify Data Requirements',
    description: 'Ensure prerequisite data exists.',
    substeps: [
      'Check cycle status = completed for most integrations',
      'Verify target records exist (appraisal, succession candidate, IDP)',
      'Confirm consent gates passed for signal-based integrations',
      'Validate score aggregation completed'
    ],
    expectedResult: 'All prerequisites confirmed or gaps identified'
  },
  {
    title: 'Trigger Manual Sync',
    description: 'Execute manual integration with monitoring.',
    substeps: [
      'Use admin integration panel to trigger sync',
      'Monitor processing in real-time',
      'Verify target module updated correctly',
      'Document resolution for future reference'
    ],
    expectedResult: 'Integration successful or escalation required'
  }
];

const databaseFields: FieldDefinition[] = [
  { name: 'feedback_360_cycles.appraisal_cycle_id', required: false, type: 'uuid', description: 'Link to appraisal cycle' },
  { name: 'feedback_360_cycles.feed_to_appraisal', required: true, type: 'boolean', description: 'Enable appraisal score contribution' },
  { name: 'feedback_360_cycles.feed_to_nine_box', required: true, type: 'boolean', description: 'Enable Nine-Box integration' },
  { name: 'appraisal_integration_rules.trigger_event', required: true, type: 'enum', description: 'Event that triggers rule' },
  { name: 'appraisal_integration_rules.target_module', required: true, type: 'enum', description: 'Target module for action' },
  { name: 'appraisal_integration_rules.action_config', required: true, type: 'jsonb', description: 'Action configuration' },
  { name: 'talent_signal_snapshots.source_type', required: true, type: 'enum', description: 'Signal source (feedback_360)' },
  { name: 'development_themes.idp_id', required: false, type: 'uuid', description: 'Linked IDP reference' },
  { name: 'development_themes.link_type', required: false, type: 'enum', description: 'Theme-to-IDP link type' },
  { name: 'nine_box_signal_mappings.signal_definition_id', required: true, type: 'uuid', description: 'Signal mapping for Nine-Box' },
];

export function F360IntegrationFailures() {
  return (
    <section id="sec-8-6" data-manual-anchor="sec-8-6" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          8.6 Integration Failures
        </h3>
        <p className="text-muted-foreground mt-2">
          Troubleshooting cross-module integration issues with appraisals, Nine-Box, IDP, and talent signals.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <Alert className="border-purple-500 bg-purple-50 dark:bg-purple-950">
        <RefreshCw className="h-4 w-4 text-purple-600" />
        <AlertTitle className="text-purple-800 dark:text-purple-200">Integration Architecture</AlertTitle>
        <AlertDescription className="text-purple-700 dark:text-purple-300">
          360 Feedback integrates with multiple modules via event-driven rules defined in <code>appraisal_integration_rules</code>.
          Rules execute in order with first-match behavior. Failed rules are logged for retry.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Appraisal Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-xs">High Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              360 scores not contributing to appraisals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Nine-Box/Succession
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-xs">High Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Performance axis or readiness not updating
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4 text-purple-500" />
              IDP Linking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Themes not linking to development goals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-gray-500" />
              Signal Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Talent signals not generated or routed
            </p>
          </CardContent>
        </Card>
      </div>

      <TroubleshootingSection
        items={appraisalIntegrationIssues}
        title="Appraisal Integration Issues"
      />

      <TroubleshootingSection
        items={nineBoxSuccessionIssues}
        title="Nine-Box & Succession Issues"
      />

      <TroubleshootingSection
        items={idpLinkingIssues}
        title="IDP Theme Linking Problems"
      />

      <TroubleshootingSection
        items={signalProcessingIssues}
        title="Signal Processing Failures"
      />

      <StepByStep
        steps={diagnosticSteps}
        title="Integration Failure Diagnostic Procedure"
      />

      <FieldReferenceTable
        fields={databaseFields}
        title="Integration Database Fields"
      />
    </section>
  );
}
