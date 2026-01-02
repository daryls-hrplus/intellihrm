import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, Users, CheckCircle, Calendar, UserPlus, FileText, AlertTriangle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const SESSION_SETUP_STEPS = [
  {
    title: 'Navigate to Calibration Sessions',
    description: 'Access the calibration module from Performance menu.',
    substeps: [
      'Go to Performance → Calibration → Sessions',
      'Click "Create Session" button',
      'Select the appraisal cycle to calibrate'
    ],
    expectedResult: 'New session creation form opens'
  },
  {
    title: 'Configure Session Details',
    description: 'Set up the session parameters and scope.',
    substeps: [
      'Enter session name (e.g., "Q4 2024 Sales Calibration")',
      'Select session date and time',
      'Set session duration (recommended: 2-3 hours)',
      'Choose session type (Department, Cross-functional, Executive)'
    ],
    expectedResult: 'Session details saved'
  },
  {
    title: 'Define Participant Scope',
    description: 'Select which employees will be reviewed in this session.',
    substeps: [
      'Choose scope: Department, Manager, or Custom selection',
      'Apply filters (location, job level, rating range)',
      'Review participant count',
      'Confirm minimum threshold met (3+ participants)'
    ],
    expectedResult: 'Participant list generated with count displayed'
  },
  {
    title: 'Invite Session Attendees',
    description: 'Add managers and facilitators to the session.',
    substeps: [
      'Click "Manage Attendees"',
      'Add HR Facilitator (required)',
      'Add Session Chair (required)',
      'Add all managers whose direct reports are included',
      'Optionally add observers (view-only access)'
    ],
    expectedResult: 'Attendees receive calendar invitations'
  },
  {
    title: 'Configure Session Settings',
    description: 'Set up visibility, voting, and documentation options.',
    substeps: [
      'Enable/disable anonymous suggestions',
      'Configure AI assistance level',
      'Set voting method (consensus, majority, chair decides)',
      'Enable real-time documentation'
    ],
    expectedResult: 'Session ready for launch'
  }
];

const FIELDS = [
  { name: 'session_name', required: true, type: 'String', description: 'Descriptive name for the calibration session', validation: 'Max 100 characters' },
  { name: 'cycle_id', required: true, type: 'UUID', description: 'Link to the appraisal cycle being calibrated', validation: 'Cycle must be in Completed status' },
  { name: 'session_date', required: true, type: 'DateTime', description: 'Scheduled date and time for the session', validation: 'Must be future date' },
  { name: 'duration_minutes', required: true, type: 'Integer', description: 'Expected session length in minutes', defaultValue: '120', validation: '30-480 minutes' },
  { name: 'session_type', required: true, type: 'Enum', description: 'Department, Cross-functional, or Executive', defaultValue: 'Department' },
  { name: 'status', required: true, type: 'Enum', description: 'Scheduled, In Progress, Completed, Cancelled', defaultValue: 'Scheduled' },
  { name: 'facilitator_id', required: true, type: 'UUID', description: 'HR user responsible for running the session' },
  { name: 'chair_id', required: true, type: 'UUID', description: 'Senior leader who chairs the session' },
  { name: 'ai_enabled', required: false, type: 'Boolean', description: 'Enable AI-powered calibration assistance', defaultValue: 'true' },
  { name: 'voting_method', required: true, type: 'Enum', description: 'How rating changes are approved', defaultValue: 'consensus' }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot create session - "Cycle not ready for calibration"', cause: 'The appraisal cycle is not in Completed status.', solution: 'Ensure all evaluations are submitted. Check cycle status in Performance → Appraisals → Cycles.' },
  { issue: 'Minimum participant threshold not met', cause: 'Fewer than 3 employees match the selected criteria.', solution: 'Expand the scope (e.g., add more departments) or combine with another session.' },
  { issue: 'Manager not receiving calendar invitation', cause: 'Email notification settings or calendar integration issue.', solution: 'Verify manager email in their profile. Check integration settings in Admin → Integrations → Calendar.' },
  { issue: 'AI assistance not available', cause: 'AI features not enabled for the organization or session.', solution: 'Contact HR Admin to enable AI features. Check session settings for AI toggle.' }
];

export function CalibrationSessionSetup() {
  return (
    <Card id="sec-4-2">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.2</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Settings className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Calibration Session Setup</CardTitle>
        <CardDescription>Creating and configuring calibration sessions for effective performance reviews</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-4-2'] || ['Performance', 'Calibration', 'Sessions', 'Create']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Create and schedule calibration sessions</li>
            <li>Define participant scope and filtering criteria</li>
            <li>Configure session attendees and their roles</li>
            <li>Set up session parameters including AI assistance</li>
          </ul>
        </div>

        {/* Prerequisites */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Prerequisites</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Calendar, title: 'Cycle Completed', desc: 'Appraisal cycle must be in "Completed" status with all evaluations submitted' },
              { icon: Users, title: 'Minimum Participants', desc: 'At least 3 employees must be included in the session scope' },
              { icon: UserPlus, title: 'Attendee Availability', desc: 'All required attendees (facilitator, chair, presenting managers) must be available' },
              { icon: FileText, title: 'Documentation Ready', desc: 'Performance evidence and ratings must be finalized in the system' }
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-3 border rounded-lg">
                <item.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Session Types</h3>
          <div className="space-y-3">
            {[
              { type: 'Department Calibration', scope: 'Single department or team', participants: '10-30 employees', duration: '2-3 hours', useCase: 'Most common. Used for functional teams with similar roles.' },
              { type: 'Cross-Functional Calibration', scope: 'Multiple departments', participants: '30-100 employees', duration: '3-4 hours', useCase: 'Aligns standards across different functions. Often at division level.' },
              { type: 'Executive Calibration', scope: 'Senior leadership team', participants: '10-20 executives', duration: '2-3 hours', useCase: 'Reviews director-level and above. Typically chaired by CHRO or CEO.' }
            ].map((item) => (
              <div key={item.type} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-semibold">{item.type}</h4>
                <div className="grid md:grid-cols-4 gap-2 text-sm">
                  <div><strong>Scope:</strong> {item.scope}</div>
                  <div><strong>Size:</strong> {item.participants}</div>
                  <div><strong>Duration:</strong> {item.duration}</div>
                </div>
                <p className="text-sm text-muted-foreground">{item.useCase}</p>
              </div>
            ))}
          </div>
        </div>

        <StepByStep steps={SESSION_SETUP_STEPS} title="Creating a Calibration Session" />

        {/* Attendee Roles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Session Attendee Roles</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Role</th>
                  <th className="text-left py-2 px-3 font-medium">Required</th>
                  <th className="text-left py-2 px-3 font-medium">Permissions</th>
                  <th className="text-left py-2 px-3 font-medium">Typical Person</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'Facilitator', required: 'Yes', permissions: 'Control session flow, document decisions, manage time', person: 'HR Business Partner' },
                  { role: 'Session Chair', required: 'Yes', permissions: 'Final decision on disputed ratings, approve all changes', person: 'VP/Director level' },
                  { role: 'Presenting Manager', required: 'Yes', permissions: 'Present and justify ratings, propose adjustments', person: 'Direct manager of reviewed employees' },
                  { role: 'Peer Manager', required: 'No', permissions: 'Vote on adjustments, challenge ratings', person: 'Other managers in scope' },
                  { role: 'Observer', required: 'No', permissions: 'View only, no voting or comments', person: 'HR Analysts, Leadership development' }
                ].map((item) => (
                  <tr key={item.role} className="border-b">
                    <td className="py-2 px-3 font-medium">{item.role}</td>
                    <td className="py-2 px-3">{item.required}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.permissions}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.person}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TipCallout title="Best Practice">
          Schedule calibration sessions 1-2 weeks after the evaluation deadline. This gives managers time to complete 
          all evaluations while keeping performance discussions fresh.
        </TipCallout>

        <WarningCallout title="Important Consideration">
          Avoid scheduling sessions longer than 4 hours. Calibration fatigue leads to rushed decisions in later discussions. 
          Split large populations across multiple sessions instead.
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="Session Configuration Fields" />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
