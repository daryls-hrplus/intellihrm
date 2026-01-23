import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Clock, CheckCircle, Settings, Bell, Eye, Users, Lock, Unlock } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, SuccessCallout, NoteCallout } from '../../components/Callout';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const RELEASE_STEPS = [
  {
    title: 'Access Release Ratings Dialog',
    description: 'HR/Admin opens the release ratings interface from the cycle administration.',
    substeps: [
      'Navigate to Performance → Appraisal Administration',
      'Select the finalized cycle from the list',
      'Click "Release Ratings" button in cycle actions menu',
      'Verify you have HR Admin or appropriate permissions'
    ],
    expectedResult: 'Release Ratings dialog opens showing eligible participants'
  },
  {
    title: 'Review Finalized Participants',
    description: 'Verify which participants are eligible for rating release.',
    substeps: [
      'Review list of participants with finalized status',
      'Check completion rate and any exceptions',
      'Verify calibration has been applied if required',
      'Note any participants with pending issues'
    ],
    expectedResult: 'Clear understanding of release scope and any exclusions'
  },
  {
    title: 'Select Participants for Release',
    description: 'Choose which employees will receive their ratings.',
    substeps: [
      'Use "Select All" for bulk release, OR',
      'Select individual employees for phased release',
      'Filter by department or manager if needed',
      'Review selection count before proceeding'
    ],
    expectedResult: 'Selected participants highlighted for release'
  },
  {
    title: 'Configure Notification Settings',
    description: 'Set up how employees will be notified of their ratings.',
    substeps: [
      'Enable/disable in-app notifications',
      'Enable/disable email notifications',
      'Preview notification message',
      'Set acknowledgment deadline if applicable'
    ],
    expectedResult: 'Notification preferences configured'
  },
  {
    title: 'Confirm and Release',
    description: 'Execute the rating release with final confirmation.',
    substeps: [
      'Review the release summary',
      'Check the confirmation checkbox',
      'Click "Release Ratings" button',
      'Wait for system to process release'
    ],
    expectedResult: 'Ratings released, employees notified, status updated to "released"'
  }
];

const FIELDS = [
  { name: 'released_at', required: true, type: 'Timestamp', description: 'When ratings were released to the employee', validation: 'System-set on release action' },
  { name: 'released_by', required: true, type: 'UUID', description: 'HR Admin who released the ratings', validation: 'Must have release permission' },
  { name: 'participant_status', required: true, type: 'Enum', description: 'Participant lifecycle status', validation: 'finalized → released transition' },
  { name: 'acknowledgment_deadline', required: false, type: 'Date', description: 'Due date for employee to acknowledge their rating' },
  { name: 'employee_response_status', required: false, type: 'Enum', description: 'Tracking of employee acknowledgment', defaultValue: 'pending', validation: 'pending, acknowledged, disputed' }
];

const BUSINESS_RULES = [
  { rule: 'Only finalized participants can be released', enforcement: 'System' as const, description: 'Ratings must be finalized (calibration complete, scores locked) before release to employees.' },
  { rule: 'Release is irreversible for individual participants', enforcement: 'System' as const, description: 'Once ratings are released, employees can view them. Cannot undo visibility without cycle unlock.' },
  { rule: 'Notifications sent automatically on release', enforcement: 'System' as const, description: 'In-app and email notifications are triggered based on configuration when ratings are released.' },
  { rule: 'Acknowledgment deadline enforced if set', enforcement: 'Policy' as const, description: 'If deadline is configured, employees must respond by the due date. Escalation may apply.' },
  { rule: 'Manager interview recommended before release', enforcement: 'Advisory' as const, description: 'Best practice is to conduct performance interview before employee sees final rating in ESS.' }
];

const TROUBLESHOOTING = [
  { issue: 'Release Ratings button not available', cause: 'Cycle may not be finalized, or you lack release permissions.', solution: 'Verify cycle status is "Finalized" or "Completed". Check your role includes rating release permission.' },
  { issue: 'Some participants not showing in release list', cause: 'Participants may not have finalized status or have pending issues.', solution: 'Check individual participant status. Finalize any pending evaluations before attempting release.' },
  { issue: 'Employee did not receive notification', cause: 'Email delivery issues or notification settings disabled.', solution: 'Verify employee email in profile. Check notification preferences. Resend notification from participant details.' },
  { issue: 'Need to undo a release', cause: 'Ratings released prematurely or to wrong participants.', solution: 'Contact HR Admin for cycle unlock. Requires HR Director approval. All undo actions are logged.' }
];

export function WorkflowRatingRelease() {
  return (
    <Card id="sec-3-11">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.11</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Settings className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Rating Release Workflow</CardTitle>
        <CardDescription>Releasing finalized ratings to employees and managing the acknowledgment process</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-11'] || ['Performance', 'Appraisals', 'Rating Release']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the rating release process and its timing</li>
            <li>Release ratings to individuals or in bulk</li>
            <li>Configure notification and acknowledgment settings</li>
            <li>Track employee acknowledgment status</li>
          </ul>
        </div>

        {/* Workflow Diagram */}
        <WorkflowDiagram 
          title="Rating Release Workflow"
          description="Flow from finalization through release to employee acknowledgment"
          diagram={`flowchart TD
    subgraph HR["🔧 HR Admin Actions"]
        A[Verify Finalization Complete] --> B[Access Release Dialog]
        B --> C[Select Participants]
        C --> D[Configure Notifications]
        D --> E[Confirm Release]
    end
    
    subgraph System["⚙️ System Processing"]
        F[Update Status to Released]
        G[Send In-App Notification]
        H[Send Email Notification]
        I[Set Acknowledgment Deadline]
    end
    
    subgraph ESS["👤 Employee Self-Service"]
        J[View Rating in My Appraisals]
        K[Review Score & Feedback]
        L{Acknowledge?}
        L -->|Agree| M[Submit Acknowledgment]
        L -->|Disagree| N[Submit Response/Dispute]
    end
    
    E --> F
    F --> G
    F --> H
    F --> I
    G --> J
    J --> K
    K --> L`}
        />

        {/* Release vs Finalization */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Finalization vs Release: Key Differences</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold">Finalization</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Locks manager ratings and calibration</li>
                <li>• Scores become immutable</li>
                <li>• Still invisible to employee</li>
                <li>• Allows HR to prepare communications</li>
              </ul>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Release</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Makes ratings visible to employee</li>
                <li>• Triggers notification workflow</li>
                <li>• Starts acknowledgment timeline</li>
                <li>• Enables ESS rating view</li>
              </ul>
            </div>
          </div>
        </div>

        <NoteCallout title="Best Practice: Performance Interview First">
          We recommend scheduling the performance interview with the employee BEFORE releasing ratings. This allows managers to discuss feedback face-to-face before the employee sees their score in the system.
        </NoteCallout>

        {/* Release Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Release Options
          </h3>
          <div className="space-y-3">
            {[
              { option: 'Bulk Release', icon: Send, desc: 'Release all finalized participants at once', useCase: 'Standard approach after company-wide calibration' },
              { option: 'Phased Release', icon: Clock, desc: 'Release by department, location, or manager', useCase: 'When different areas complete at different times' },
              { option: 'Individual Release', icon: Eye, desc: 'Release ratings one employee at a time', useCase: 'Special cases, early high performers, or exception handling' }
            ].map((item) => (
              <div key={item.option} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                <item.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">{item.option}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Use when:</strong> {item.useCase}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <StepByStep steps={RELEASE_STEPS} title="Rating Release Process" />

        {/* Notification Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-600" />
            Notification Options
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: 'In-App Notification', desc: 'Appears in employee notification center', default: 'Enabled', recommended: true },
              { type: 'Email Notification', desc: 'Sent to employee work email', default: 'Enabled', recommended: true },
              { type: 'Manager Copy', desc: 'Manager notified when their reports receive ratings', default: 'Optional', recommended: false },
              { type: 'Deadline Reminder', desc: 'Reminder before acknowledgment deadline', default: '3 days before', recommended: true }
            ].map((item) => (
              <div key={item.type} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{item.type}</h4>
                  {item.recommended && <Badge className="bg-green-600 text-white text-xs">Recommended</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                <p className="text-xs text-muted-foreground mt-1"><strong>Default:</strong> {item.default}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ESS Experience After Release */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-600" />
            Employee Experience After Release
          </h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">
              Once ratings are released, employees can access their appraisal through <strong>ESS → My Appraisals</strong>. They will see:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Overall rating and score breakdown</li>
              <li>Goal ratings with manager comments</li>
              <li>Competency ratings and feedback</li>
              <li>Manager's overall comments and development suggestions</li>
              <li>Comparison with their self-assessment (if enabled)</li>
              <li>Option to acknowledge or submit response</li>
            </ul>
          </div>
        </div>

        <SuccessCallout title="After Release">
          Track acknowledgment progress in the cycle dashboard. The system monitors response rates and can send automatic reminders as the deadline approaches.
        </SuccessCallout>

        <TipCallout title="Timing Recommendation">
          Release ratings on a Tuesday or Wednesday mid-morning. This gives employees time to process and ask questions while managers are available, avoiding Friday releases.
        </TipCallout>

        <WarningCallout title="Release Cannot Be Undone">
          Once ratings are released, employees can see them immediately. Ensure all calibration and manager reviews are complete before releasing. Undoing a release requires HR Director approval.
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="Release Tracking Fields" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
