import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, CheckCircle, Users, ArrowRightLeft, Scale, AlertTriangle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, NoteCallout, InfoCallout } from '../../components/Callout';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';
import { ConfigurationExample } from '../../components/ConfigurationExample';

const ROLE_CHANGE_STEPS = [
  {
    title: 'Identify the Change Type',
    description: 'Determine what type of mid-cycle change occurred.',
    substeps: [
      'Position/role change (same manager)',
      'Manager change (same position)',
      'Both position and manager change',
      'Department/team transfer'
    ],
    expectedResult: 'Change type identified for appropriate handling'
  },
  {
    title: 'Determine Evaluation Approach',
    description: 'Decide how to handle the split evaluation.',
    substeps: [
      'Review company policy on mid-cycle changes',
      'Calculate time under each configuration',
      'Determine if time-weighted split is needed',
      'Consult HR for edge cases'
    ],
    expectedResult: 'Evaluation approach selected and documented'
  },
  {
    title: 'Collect Prior Manager Input',
    description: 'Obtain evaluation from previous manager if applicable.',
    substeps: [
      'Notify previous manager of evaluation need',
      'Request partial evaluation for period of responsibility',
      'Set deadline for prior manager input',
      'Document if prior manager is unavailable'
    ],
    expectedResult: 'Prior manager input collected or unavailability documented'
  },
  {
    title: 'Consolidate Evaluations',
    description: 'Combine inputs into final evaluation.',
    substeps: [
      'Current manager reviews prior manager input',
      'Apply time-weighted calculations if applicable',
      'Resolve any conflicting assessments',
      'Create consolidated evaluation narrative'
    ],
    expectedResult: 'Single consolidated evaluation ready for review'
  },
  {
    title: 'Document the Change',
    description: 'Record the role change handling for audit.',
    substeps: [
      'Note the effective dates of changes',
      'Document evaluation methodology used',
      'Record any special considerations applied',
      'Attach supporting documentation'
    ],
    expectedResult: 'Complete audit trail of role change handling'
  }
];

const FIELDS = [
  { name: 'position_at_enrollment', required: true, type: 'UUID', description: 'Position when cycle started', validation: 'Snapshot at enrollment' },
  { name: 'current_position', required: true, type: 'UUID', description: 'Current position', validation: 'May differ from enrollment position' },
  { name: 'position_changed_at', required: false, type: 'Date', description: 'When position change occurred' },
  { name: 'original_evaluator_id', required: true, type: 'UUID', description: 'Manager at enrollment' },
  { name: 'current_evaluator_id', required: true, type: 'UUID', description: 'Current assigned manager' },
  { name: 'evaluator_changed_at', required: false, type: 'Date', description: 'When manager change occurred' },
  { name: 'prior_manager_rating', required: false, type: 'JSON', description: 'Input from previous manager' },
  { name: 'time_weight_old', required: false, type: 'Decimal', description: 'Weight for prior period', validation: '0.0 to 1.0' },
  { name: 'time_weight_new', required: false, type: 'Decimal', description: 'Weight for current period', validation: 'Complement of time_weight_old' },
  { name: 'consolidation_method', required: false, type: 'Enum', description: 'How ratings were combined', validation: 'Time-weighted, Current Only, Prior Only' }
];

const BUSINESS_RULES = [
  { rule: 'Changes within 30 days of cycle end handled by current manager', enforcement: 'Policy' as const, description: 'Very recent changes do not trigger split evaluation.' },
  { rule: 'Prior manager input requested for changes after day 60', enforcement: 'Policy' as const, description: 'Significant time with prior manager warrants their input.' },
  { rule: 'Time-weighted calculation is default for mid-cycle changes', enforcement: 'Policy' as const, description: 'Fair representation of performance under each configuration.' },
  { rule: 'Unavailable prior manager documented, not blocking', enforcement: 'Advisory' as const, description: 'Evaluation proceeds with documentation if prior manager cannot provide input.' },
  { rule: 'Goal reassignment tracked separately', enforcement: 'System' as const, description: 'Goals from old role vs. new role are clearly distinguished.' }
];

const EXAMPLES = [
  {
    title: 'Manager Change at Mid-Cycle',
    context: 'Employee promoted to new team with new manager 5 months into 12-month cycle',
    values: [
      { field: 'Time with Prior Manager', value: '5 months (42%)' },
      { field: 'Time with Current Manager', value: '7 months (58%)' },
      { field: 'Consolidation Method', value: 'Time-weighted average' },
      { field: 'Prior Manager Rating', value: '3.8 (weighted 42%)' },
      { field: 'Current Manager Rating', value: '4.2 (weighted 58%)' },
      { field: 'Final Consolidated Score', value: '4.03' }
    ],
    outcome: 'Fair evaluation reflecting performance under both managers'
  },
  {
    title: 'Late Cycle Position Change',
    context: 'Employee transferred to new role 45 days before cycle end',
    values: [
      { field: 'Time with Prior Position', value: '10.5 months' },
      { field: 'Time with New Position', value: '1.5 months' },
      { field: 'Consolidation Method', value: 'Current manager evaluates full cycle' },
      { field: 'Prior Manager Input', value: 'Consulted but not formally weighted' },
      { field: 'Goal Handling', value: 'Old goals rated, new goals marked N/A' }
    ],
    outcome: 'Current manager provides evaluation with prior manager consultation'
  }
];

const TROUBLESHOOTING = [
  { issue: 'Prior manager has left the company', cause: 'Manager departed before providing input.', solution: 'Use available documentation, skip-level manager input, or peer feedback. Document the limitation.' },
  { issue: 'Goals from old role not applicable to new role', cause: 'Position change involved completely different responsibilities.', solution: 'Mark old goals as "Transferred" with partial ratings. Assign new goals with pro-rated expectations.' },
  { issue: 'Conflicting ratings from prior and current manager', cause: 'Different perspectives or observation periods.', solution: 'Apply time-weighted average. Current manager can add context in overall comments.' },
  { issue: 'Multiple manager changes during cycle', cause: 'Complex organizational changes.', solution: 'Consolidate all inputs with time-weighting. Document each segment separately.' }
];

export function WorkflowRoleChangeHandling() {
  return (
    <Card id="sec-3-9">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.9</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Role Change Handling</CardTitle>
        <CardDescription>Mid-cycle role changes, manager transfers, and time-weighted evaluation splits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-9']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Handle mid-cycle position and manager changes fairly</li>
            <li>Apply time-weighted evaluation calculations</li>
            <li>Collect and consolidate multi-manager input</li>
            <li>Document role changes for audit compliance</li>
          </ul>
        </div>

        {/* Change Type Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            Types of Mid-Cycle Changes
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: 'Position Change', desc: 'Employee moves to new role, may keep same manager', impact: 'Goals may need reassignment, competencies may change' },
              { type: 'Manager Change', desc: 'Employee gets new manager, same role', impact: 'Prior manager input needed for fair evaluation' },
              { type: 'Both Position + Manager', desc: 'Complete change (promotion, transfer)', impact: 'Full split evaluation typically required' },
              { type: 'Department Transfer', desc: 'Moves to different organizational unit', impact: 'May trigger new cycle enrollment decision' }
            ].map((item) => (
              <Card key={item.type} className="bg-muted/50">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-foreground">{item.type}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  <p className="text-xs text-muted-foreground mt-2"><strong>Impact:</strong> {item.impact}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <InfoCallout title="Fair Evaluation Principle">
          Employees should not be penalized for organizational changes. The goal is to capture accurate performance assessment across the full cycle, regardless of structural changes.
        </InfoCallout>

        <StepByStep steps={ROLE_CHANGE_STEPS} title="Role Change Handling Process" />

        {/* Time-Weighted Calculation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5 text-green-600" />
            Time-Weighted Calculation
          </h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">Formula for consolidated score:</p>
            <div className="font-mono text-sm p-3 bg-background rounded border">
              Final Score = (Prior Manager Score × Prior Weight) + (Current Manager Score × Current Weight)
            </div>
            <p className="text-sm text-muted-foreground mt-3">Example with 40/60 split:</p>
            <div className="font-mono text-sm p-3 bg-background rounded border">
              Final = (3.5 × 0.40) + (4.2 × 0.60) = 1.40 + 2.52 = 3.92
            </div>
          </div>
        </div>

        <TipCallout title="Communication is Key">
          When a role change occurs, proactively notify all parties about the evaluation approach. Clear expectations prevent confusion and disputes later.
        </TipCallout>

        <WarningCallout title="Don't Delay Prior Manager Input">
          Request prior manager input immediately after the change. Waiting until cycle end often results in forgotten details or unavailable managers.
        </WarningCallout>

        <NoteCallout title="Multi-Position Mode">
          For employees in multiple positions simultaneously, use the Multi-Position Mode setting in cycle configuration to handle separate evaluations per position.
        </NoteCallout>

        <FieldReferenceTable fields={FIELDS} title="Role Change Tracking Fields" />
        <ConfigurationExample examples={EXAMPLES} title="Role Change Scenarios" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
