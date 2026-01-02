import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, Link2, ArrowRight } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  StepByStep, 
  ConfigurationExample,
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  PrerequisiteAlert
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Integration Name', required: true, type: 'Text', description: 'Descriptive name for the integration', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Source Module', required: true, type: 'Select', description: 'Module sending data (Performance)', defaultValue: 'Performance', validation: '—' },
  { name: 'Target Module', required: true, type: 'Select', description: 'Module receiving data', defaultValue: '—', validation: '—' },
  { name: 'Trigger Event', required: true, type: 'Select', description: 'When integration fires (Cycle Complete, Score Finalized)', defaultValue: '—', validation: '—' },
  { name: 'Data Mapping', required: true, type: 'Config', description: 'Field mappings between modules', defaultValue: '—', validation: 'All required fields mapped' },
  { name: 'Execution Mode', required: true, type: 'Select', description: 'Real-time, Scheduled, or Manual', defaultValue: 'Real-time', validation: '—' },
  { name: 'Schedule', required: false, type: 'Cron', description: 'Schedule for batch execution', defaultValue: 'Daily 2 AM', validation: 'Valid cron expression' },
  { name: 'Retry Policy', required: true, type: 'Select', description: 'How failures are handled', defaultValue: '3 retries', validation: '—' },
  { name: 'Error Notification', required: true, type: 'Email', description: 'Who receives error alerts', defaultValue: 'IT Admin', validation: 'Valid email' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether integration is active', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Integration Rules',
    description: 'Go to Performance → Setup → Integration → Integration Rules',
    expectedResult: 'Integration Rules page displays'
  },
  {
    title: 'Click "Create Integration"',
    description: 'Start configuring a new integration rule',
    expectedResult: 'Integration configuration wizard opens'
  },
  {
    title: 'Select Target Module',
    description: 'Choose where performance data should flow',
    substeps: [
      'Compensation: Send scores for merit planning',
      'Succession: Send ratings for talent review',
      'Learning: Trigger development recommendations',
      'Analytics: Export to reporting warehouse'
    ],
    expectedResult: 'Target module selected'
  },
  {
    title: 'Define Trigger Event',
    description: 'Specify when the integration should fire',
    substeps: [
      'Cycle Complete: When appraisal cycle is closed',
      'Score Finalized: When individual score is finalized',
      'Calibration Complete: After calibration session',
      'On Demand: Manual trigger only'
    ],
    expectedResult: 'Trigger event configured'
  },
  {
    title: 'Configure Data Mapping',
    description: 'Map source fields to target fields',
    substeps: [
      'Overall Score → Merit Eligibility Score',
      'Performance Category → Talent Rating',
      'Manager Comments → Development Notes',
      'Configure any required transformations'
    ],
    expectedResult: 'All required fields mapped'
  },
  {
    title: 'Set Execution Mode',
    description: 'Choose when integration runs',
    substeps: [
      'Real-time: Immediate upon trigger',
      'Scheduled: Batch processing on schedule',
      'Manual: Triggered by administrator'
    ],
    expectedResult: 'Execution mode configured'
  },
  {
    title: 'Configure Error Handling',
    description: 'Set up failure recovery and notifications',
    substeps: [
      'Set retry count and interval',
      'Configure error notification recipients',
      'Define fallback behavior'
    ],
    expectedResult: 'Error handling configured'
  },
  {
    title: 'Test and Activate',
    description: 'Validate integration with test data',
    substeps: [
      'Run integration in test mode',
      'Verify data appears correctly in target',
      'Activate for production use'
    ],
    expectedResult: 'Integration tested and activated'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Performance to Compensation',
    context: 'Feed performance scores to merit planning module.',
    values: [
      { field: 'Target', value: 'Compensation → Merit Cycles' },
      { field: 'Trigger', value: 'Calibration Complete' },
      { field: 'Data', value: 'Overall Score, Category, Manager Recommendation' },
      { field: 'Mode', value: 'Scheduled (nightly after calibration)' }
    ],
    outcome: 'Merit planning receives calibrated scores for budget allocation.'
  },
  {
    title: 'Performance to Succession',
    context: 'Update talent profiles with latest performance data.',
    values: [
      { field: 'Target', value: 'Succession → Talent Profiles' },
      { field: 'Trigger', value: 'Score Finalized' },
      { field: 'Data', value: 'Overall Rating, Potential Indicator, Competency Scores' },
      { field: 'Mode', value: 'Real-time' }
    ],
    outcome: 'Talent profiles always reflect current performance standing.'
  },
  {
    title: 'Performance to Learning',
    context: 'Generate development recommendations based on competency gaps.',
    values: [
      { field: 'Target', value: 'Learning → Skill Gap Analysis' },
      { field: 'Trigger', value: 'Cycle Complete' },
      { field: 'Data', value: 'Competency Scores, Development Areas' },
      { field: 'Mode', value: 'Scheduled (weekly)' }
    ],
    outcome: 'LMS receives competency data for personalized learning paths.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Integrations respect data security boundaries', enforcement: 'System' as const, description: 'Only data the target module is authorized to receive is transmitted.' },
  { rule: 'Failed integrations retry automatically', enforcement: 'System' as const, description: 'Transient failures retry based on configured policy before alerting.' },
  { rule: 'Integration logs retained for audit', enforcement: 'System' as const, description: 'All integration executions logged with timestamps and data snapshots.' },
  { rule: 'Compensation integration requires calibration', enforcement: 'Policy' as const, description: 'Scores should only feed to compensation after calibration is complete.' },
  { rule: 'Test integrations in non-production first', enforcement: 'Advisory' as const, description: 'Validate data mappings in staging environment before production activation.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Integration not triggering',
    cause: 'Trigger event not occurring or integration inactive.',
    solution: 'Verify integration is active. Confirm trigger event (e.g., cycle closure) has actually occurred. Check event logs.'
  },
  {
    issue: 'Data not appearing in target module',
    cause: 'Mapping error or target module data issue.',
    solution: 'Review field mappings for accuracy. Check target module is ready to receive data. Examine integration error logs.'
  },
  {
    issue: 'Duplicate records in target',
    cause: 'Integration running multiple times or missing duplicate check.',
    solution: 'Enable duplicate detection in integration settings. Add unique identifier to prevent duplicates.'
  },
  {
    issue: 'Performance data stale in compensation',
    cause: 'Scheduled integration timing or execution failure.',
    solution: 'Check integration schedule. Verify last successful execution time. Run manual sync if needed.'
  }
];

export function SetupIntegrationRules() {
  return (
    <Card id="sec-2-9">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.9</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~15 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl">Integration Rules Configuration</CardTitle>
        <CardDescription>
          Configure how appraisal data flows to Compensation, Succession, Learning, and other modules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Integration', 'Integration Rules']} />

        <LearningObjectives
          objectives={[
            'Configure data flow from Performance to Compensation module',
            'Set up Succession module integration for talent reviews',
            'Link performance data to Learning for development recommendations',
            'Manage integration schedules and error handling'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Compensation module configured (if integrating)',
            'Succession module configured (if integrating)',
            'Calibration process defined',
            'IT/Admin access for integration configuration'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Integration Rules?</h4>
          <p className="text-muted-foreground">
            Integration rules define how appraisal data flows to other HRplus modules. When 
            performance cycles complete, scores and ratings can automatically feed into 
            Compensation for merit planning, Succession for talent reviews, and Learning for 
            development recommendations. Well-configured integrations eliminate manual data 
            transfer and ensure downstream processes have timely, accurate performance data.
          </p>
        </div>

        <div className="p-4 border-l-4 border-l-indigo-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Link2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Integration Flow</h4>
              <div className="flex items-center gap-2 text-sm text-foreground mt-1">
                <span>Appraisals</span>
                <ArrowRight className="h-3 w-3" />
                <span>Calibration</span>
                <ArrowRight className="h-3 w-3" />
                <span>Compensation / Succession / Learning</span>
              </div>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.9.1: Integration Rules configuration with target modules"
          alt="Integration Rules setup page"
        />

        <StepByStep steps={STEPS} title="Creating an Integration Rule: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}
