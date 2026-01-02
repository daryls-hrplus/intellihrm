import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Settings, AlertTriangle, CheckCircle, Lock, Unlock, RotateCcw } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const LAUNCH_STEPS = [
  {
    title: 'Verify Cycle Configuration',
    description: 'Ensure all cycle settings are complete before launch.',
    substeps: [
      'Confirm start and end dates are set correctly',
      'Verify rating scales are assigned',
      'Check component weights total 100%',
      'Review participant eligibility criteria'
    ],
    expectedResult: 'All configuration checks pass with green indicators'
  },
  {
    title: 'Preview Participant List',
    description: 'Review the employees who will be enrolled.',
    substeps: [
      'Click "Preview Participants" button',
      'Review the list for accuracy',
      'Check for any unexpected exclusions',
      'Verify manager assignments are correct'
    ],
    expectedResult: 'Participant count matches expected enrollment'
  },
  {
    title: 'Launch the Cycle',
    description: 'Activate the cycle and notify participants.',
    substeps: [
      'Click "Launch Cycle" button',
      'Confirm the launch in the dialog',
      'Select notification preferences',
      'Click "Confirm Launch"'
    ],
    expectedResult: 'Cycle status changes to "Active" and notifications are sent'
  }
];

const FIELDS = [
  { name: 'status', required: true, type: 'Enum', description: 'Current lifecycle stage of the cycle', defaultValue: 'Draft', validation: 'Must follow valid state transitions' },
  { name: 'start_date', required: true, type: 'Date', description: 'When the cycle becomes active for participants', validation: 'Cannot be in the past when launching' },
  { name: 'end_date', required: true, type: 'Date', description: 'When the cycle closes for new submissions', validation: 'Must be after start_date' },
  { name: 'evaluation_deadline', required: false, type: 'Date', description: 'Deadline for manager evaluations', validation: 'Must be between start_date and end_date' },
  { name: 'is_locked', required: true, type: 'Boolean', description: 'Prevents all modifications when true', defaultValue: 'false' },
  { name: 'locked_by', required: false, type: 'UUID', description: 'User who locked the cycle' },
  { name: 'locked_at', required: false, type: 'Timestamp', description: 'When the cycle was locked' }
];

const BUSINESS_RULES = [
  { rule: 'Status transitions must follow defined sequence', enforcement: 'System' as const, description: 'Draft → Active → In Progress → Completed → Closed. Skipping states is not allowed.' },
  { rule: 'Active cycles cannot be deleted', enforcement: 'System' as const, description: 'Once a cycle is launched, it can only be closed, not deleted.' },
  { rule: 'Locked cycles require HR approval to unlock', enforcement: 'Policy' as const, description: 'Prevents accidental modifications to finalized evaluations.' },
  { rule: 'Cycle dates cannot overlap for same participant', enforcement: 'System' as const, description: 'Employees cannot be enrolled in multiple active cycles simultaneously.' }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot launch cycle - "Configuration incomplete" error', cause: 'Missing required settings such as rating scales or weights.', solution: 'Navigate to cycle setup and complete all required fields marked with red indicators.' },
  { issue: 'Cycle stuck in "Active" status', cause: 'No participants have started self-assessments yet.', solution: 'Status changes to "In Progress" when first participant begins. Send reminder notifications.' },
  { issue: 'Cannot close cycle - pending evaluations exist', cause: 'Some managers have not submitted evaluations.', solution: 'Use the bulk action to either force-close pending items or extend the deadline.' }
];

export function WorkflowCycleLifecycle() {
  return (
    <Card id="sec-3-1">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.1</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Settings className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Appraisal Cycle Lifecycle</CardTitle>
        <CardDescription>Understanding and managing cycle status progression from creation to archival</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-1']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the five lifecycle stages of an appraisal cycle</li>
            <li>Learn the triggers and permissions for each status transition</li>
            <li>Master cycle locking and unlocking procedures</li>
            <li>Handle rollback scenarios and audit trail review</li>
          </ul>
        </div>

        {/* Interactive Workflow Diagram */}
        <WorkflowDiagram 
          title="Appraisal Cycle Lifecycle Workflow"
          description="Participant flow showing HR actions, system states, and participant interactions"
          diagram={`flowchart LR
    subgraph HR["🔧 HR Admin"]
        A[Create Cycle] --> B[Configure Settings]
        B --> C[Launch Cycle]
        H[Run Calibration] --> I[Close Cycle]
    end
    
    subgraph System["⚙️ System States"]
        D((Draft))
        E((Active))
        F((In Progress))
        G((Completed))
        J((Closed))
    end
    
    subgraph Participants["👥 Participants"]
        K[Employees Start Self-Assessment]
        L[Managers Submit Evaluations]
    end
    
    C --> D
    D -->|HR Launches| E
    E -->|First Self-Assessment| F
    K --> F
    F -->|All Submitted| G
    L --> G
    G -->|HR Closes| J
    H --> J`}
        />

        {/* Lifecycle Status Badges */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Status Progression</h3>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { status: 'Draft', icon: Unlock, color: 'bg-slate-600' },
              { status: 'Active', icon: CheckCircle, color: 'bg-blue-600' },
              { status: 'In Progress', icon: Clock, color: 'bg-amber-600' },
              { status: 'Completed', icon: CheckCircle, color: 'bg-green-600' },
              { status: 'Closed', icon: Lock, color: 'bg-slate-600' }
            ].map((item, i, arr) => (
              <div key={item.status} className="flex items-center gap-2">
                <Badge className={`${item.color} text-white py-1.5 px-3 gap-1`}>
                  <item.icon className="h-3 w-3" />
                  {item.status}
                </Badge>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>

        {/* Status Definitions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Status Definitions</h3>
          <div className="space-y-3">
            {[
              { status: 'Draft', desc: 'Cycle is being configured. Not visible to participants. All settings can be modified.', trigger: 'Cycle creation', permissions: 'HR Admin only' },
              { status: 'Active', desc: 'Cycle launched. Participants enrolled and can begin self-assessments. Limited modifications allowed.', trigger: 'HR launches cycle', permissions: 'HR Admin, participants (view)' },
              { status: 'In Progress', desc: 'At least one participant has started their evaluation. Self-assessments and manager evaluations underway.', trigger: 'First self-assessment started', permissions: 'Managers, employees (evaluate)' },
              { status: 'Completed', desc: 'All evaluations submitted. Calibration can begin. No new evaluations accepted.', trigger: 'All evaluations submitted OR deadline passed', permissions: 'HR Admin (calibrate)' },
              { status: 'Closed', desc: 'Cycle archived. Scores finalized and downstream actions triggered. Read-only access.', trigger: 'HR closes cycle', permissions: 'View only (all roles)' }
            ].map((item) => (
              <div key={item.status} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold min-w-[120px]">{item.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                <div className="flex gap-4 text-xs">
                  <span><strong>Trigger:</strong> {item.trigger}</span>
                  <span><strong>Access:</strong> {item.permissions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Best Practice">
          Always preview the participant list before launching a cycle. This prevents enrollment errors that are difficult to correct after launch.
        </TipCallout>

        <StepByStep steps={LAUNCH_STEPS} title="Launching a Cycle" />

        {/* Rollback Scenarios */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-amber-600" />
            Rollback Scenarios
          </h3>
          <WarningCallout title="Rollback Limitations">
            Rollbacks are only possible in limited scenarios and require HR Director approval. Once evaluations are submitted, they cannot be deleted—only amended with audit trail.
          </WarningCallout>
          <div className="space-y-3">
            {[
              { scenario: 'Revert Active → Draft', condition: 'No participants have started', action: 'HR Admin can revert from cycle settings' },
              { scenario: 'Extend Completed → In Progress', condition: 'Within 48 hours of completion', action: 'Reopen for late submissions with approval' },
              { scenario: 'Unlock Closed cycle', condition: 'Data correction required', action: 'Requires HR Director approval and creates audit entry' }
            ].map((item) => (
              <div key={item.scenario} className="flex gap-4 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">{item.scenario}</h4>
                  <p className="text-sm text-muted-foreground">Condition: {item.condition}</p>
                  <p className="text-sm text-muted-foreground">Action: {item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <FieldReferenceTable fields={FIELDS} title="Cycle Lifecycle Fields" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
