import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users2, 
  ArrowRightLeft,
  BarChart3,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  BusinessRules,
  StepByStep,
  type BusinessRule,
  type Step
} from '@/components/enablement/manual/components';

const calibrationSteps: Step[] = [
  {
    title: 'Schedule Calibration Session',
    description: 'Create a calibration session in HR Hub → Talent → Calibration Sessions.',
    notes: ['Define participant list (managers, HR, executives)', 'Set session date and agenda'],
    expectedResult: 'Calibration session created with status "scheduled"'
  },
  {
    title: 'Prepare Nine-Box Data',
    description: 'System auto-loads current Nine-Box placements for employees in scope.',
    notes: ['Only employees with is_current = true assessments are included', 'Data freshness indicators shown per employee'],
    expectedResult: 'Calibration grid displays with current placements'
  },
  {
    title: 'Conduct Live Calibration',
    description: 'Facilitator leads discussion; participants propose placement adjustments.',
    notes: ['Use drag-and-drop to move employees between boxes', 'All changes logged with proposer and timestamp'],
    expectedResult: 'Proposed changes marked as "pending_calibration"'
  },
  {
    title: 'Capture Discussion Notes',
    description: 'Document rationale for each significant placement change.',
    notes: ['Required for moves of 2+ boxes', 'Links to evidence for audit trail'],
    expectedResult: 'Calibration notes saved with each adjustment'
  },
  {
    title: 'Finalize Calibrations',
    description: 'HR Lead approves final calibrated placements.',
    notes: ['Bulk approval or individual review options', 'Changes trigger succession candidate updates'],
    expectedResult: 'Nine-Box assessments updated with calibrated values'
  },
  {
    title: 'Trigger Downstream Updates',
    description: 'System automatically updates succession and talent pool data.',
    notes: ['Readiness bands recalculated', 'Talent pool eligibility refreshed'],
    expectedResult: 'Succession candidates reflect calibrated Nine-Box positions'
  }
];

const calibrationRules: BusinessRule[] = [
  { rule: 'Cross-calibration adjustments require justification', enforcement: 'System', description: 'Any movement of 2+ boxes requires written rationale and evidence linkage' },
  { rule: 'Manager attendance is mandatory', enforcement: 'Policy', description: 'Managers must attend calibration sessions for their direct reports' },
  { rule: 'HR facilitates, does not dictate', enforcement: 'Policy', description: 'HR ensures fair process but does not override manager assessments without cause' },
  { rule: 'Calibration history is immutable', enforcement: 'System', description: 'All calibration changes stored with full audit trail (who, when, why)' },
  { rule: 'Time-bound sessions', enforcement: 'Policy', description: 'Calibration sessions should not exceed 2 hours; prioritize by impact' },
  { rule: 'Bias checks integrated', enforcement: 'System', description: 'System flags potential bias patterns (e.g., all one team in same box)' }
];

export function IntegrationCalibration() {
  return (
    <section id="sec-9-13" data-manual-anchor="sec-9-13" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Users2 className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.13 Calibration Meeting Integration</h3>
          <p className="text-sm text-muted-foreground">
            Talent review sessions that update Nine-Box and succession data (SAP/Workday pattern)
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Schedule and conduct calibration sessions with cross-functional stakeholders',
        'Understand calibration-triggered Nine-Box updates and audit requirements',
        'Configure downstream succession candidate re-ranking',
        'Apply bias detection during live calibration'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Calibration → Succession Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Calibration meetings bridge performance data with talent planning decisions:
          </p>

          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-medium text-sm">Initial Placement</h4>
              <p className="text-xs text-muted-foreground mt-1">System-calculated from signals</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-medium text-sm">Calibration Review</h4>
              <p className="text-xs text-muted-foreground mt-1">Manager + HR discussion</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-green-600">3</span>
              </div>
              <h4 className="font-medium text-sm">Finalized Rating</h4>
              <p className="text-xs text-muted-foreground mt-1">Approved calibrated value</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-orange-600">4</span>
              </div>
              <h4 className="font-medium text-sm">Succession Update</h4>
              <p className="text-xs text-muted-foreground mt-1">Readiness recalculated</p>
            </div>
          </div>

          <InfoCallout>
            Calibration sessions should be scheduled after appraisal cycles complete but before 
            succession planning reviews. This ensures Nine-Box data reflects calibrated values.
          </InfoCallout>
        </CardContent>
      </Card>

      <StepByStep steps={calibrationSteps} title="Calibration Session Workflow" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Calibration Impact on Succession
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Calibration changes automatically trigger these succession updates:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Nine-Box Box Change
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>Readiness band recalculated</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>Succession plan priority adjusted</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>Talent pool eligibility re-evaluated</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                Potential Rating Upgrade
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-amber-600" />
                  <span>Candidate rank may increase</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-amber-600" />
                  <span>Development plan priorities shift</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-amber-600" />
                  <span>Mentor/mentee matching refreshed</span>
                </li>
              </ul>
            </div>
          </div>

          <WarningCallout>
            Calibration changes to Nine-Box ratings are logged with full audit trail. 
            Large-scale recalibrations may require executive approval per company policy.
          </WarningCallout>
        </CardContent>
      </Card>

      <BusinessRules rules={calibrationRules} />

      <Card>
        <CardHeader>
          <CardTitle>Integration Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Configure calibration → succession integration rules:
          </p>

          <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
            <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
              Calibration Finalized → Update Succession
            </h4>
            <div className="text-xs space-y-1 font-mono">
              <p>trigger_event: 'calibration_session_completed'</p>
              <p>condition_type: 'always'</p>
              <p>target_module: 'succession'</p>
              <p>action_type: 'recalculate_readiness'</p>
              <p>action_config: {"{ scope: 'session_employees' }"}</p>
              <p>auto_execute: true</p>
            </div>
          </div>

          <TipCallout>
            Enable the <strong>Calibration Session</strong> feature flag in 
            <strong>Governance → Feature Management</strong> to access calibration meeting 
            functionality in HR Hub.
          </TipCallout>
        </CardContent>
      </Card>
    </section>
  );
}
