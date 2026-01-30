import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Calendar,
  Mail,
  Clock,
  Settings
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  StepByStep,
  type Step
} from '@/components/enablement/manual/components';
import { ScreenshotPlaceholder } from '@/components/enablement/shared/ScreenshotPlaceholder';

const configSteps: Step[] = [
  {
    title: 'Navigate to Notification Settings',
    description: 'Go to Settings → Notifications → Training Events to configure L&D notifications.',
    notes: ['Requires Admin role'],
    expectedResult: 'Training notification event list displays'
  },
  {
    title: 'Enable/Disable Event Types',
    description: 'Toggle specific notification events based on organization needs.',
    notes: [
      'Essential: Enrollment confirmation, Overdue alerts, Certificate expiry',
      'Optional: Progress stalled, Quiz failure, Session reminders'
    ]
  },
  {
    title: 'Configure Reminder Timing',
    description: 'Set days_before values for reminder notifications.',
    notes: [
      'Certificate expiry: 30, 14, 7 days before',
      'Session reminders: 7, 1 day before',
      'Compliance due: 14, 7, 1 day before'
    ],
    expectedResult: 'Reminder schedule configured'
  },
  {
    title: 'Customize Email Templates',
    description: 'Edit email templates to match organization branding and tone.',
    notes: [
      'Use placeholders: {employee_name}, {course_name}, {due_date}',
      'Include action links where applicable'
    ]
  },
  {
    title: 'Test Notifications',
    description: 'Use the "Send Test" feature to verify email delivery and formatting.',
    expectedResult: 'Test email received with correct content'
  }
];

export function LndIntegrationNotifications() {
  return (
    <section id="sec-8-7" data-manual-anchor="sec-8-7" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.7 Notification & Calendar Integration</h3>
          <p className="text-sm text-muted-foreground">
            Email reminders, in-app notifications, and calendar sync for training events
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand the 34 training-related notification event types',
        'Configure reminder timing and email templates',
        'Set up calendar sync for training sessions (Google/Outlook)',
        'Customize notification preferences by user role'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Training Notification Event Types (34 Total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Enrollment</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <code>LMS_ENROLLMENT_CONFIRMATION</code></li>
                  <li>• <code>LMS_ENROLLMENT_CANCELLED</code></li>
                  <li>• <code>LMS_ENROLLMENT_EXPIRING</code></li>
                  <li>• <code>LMS_WAITLIST_ADDED</code></li>
                  <li>• <code>LMS_WAITLIST_PROMOTED</code></li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Progress</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <code>LMS_PROGRESS_STALLED</code></li>
                  <li>• <code>LMS_OVERDUE_TRAINING</code></li>
                  <li>• <code>LMS_MILESTONE_REACHED</code></li>
                  <li>• <code>LMS_PATH_STAGE_COMPLETED</code></li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Completion</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <code>LMS_COURSE_COMPLETED</code></li>
                  <li>• <code>LMS_CERTIFICATE_ISSUED</code></li>
                  <li>• <code>LMS_LEARNING_PATH_COMPLETED</code></li>
                  <li>• <code>LMS_BADGE_EARNED</code></li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Compliance</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <code>COMPLIANCE_TRAINING_DUE</code></li>
                  <li>• <code>COMPLIANCE_TRAINING_OVERDUE</code></li>
                  <li>• <code>LMS_RECERTIFICATION_DUE</code></li>
                  <li>• <code>LMS_CERTIFICATE_EXPIRING</code></li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Requests</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <code>TRAINING_REQUEST_SUBMITTED</code></li>
                  <li>• <code>TRAINING_REQUEST_APPROVED</code></li>
                  <li>• <code>TRAINING_REQUEST_REJECTED</code></li>
                  <li>• <code>TRAINING_REQUEST_PENDING_APPROVAL</code></li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Sessions & Vendor</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <code>VENDOR_SESSION_REMINDER</code></li>
                  <li>• <code>VENDOR_SESSION_CANCELLED</code></li>
                  <li>• <code>VENDOR_SESSION_RESCHEDULED</code></li>
                  <li>• <code>VENDOR_SESSION_CONFIRMED</code></li>
                  <li>• <code>VENDOR_SESSION_REG_DEADLINE</code></li>
                  <li>• <code>ILT_SESSION_REMINDER</code></li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Cross-Module</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <code>EXTERNAL_CERT_EXPIRING</code></li>
                  <li>• <code>safety_training_expiry</code></li>
                  <li>• <code>skill_expiry</code></li>
                  <li>• <code>BACKGROUND_CHECK_EXPIRY</code></li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Quiz & Assessment</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <code>LMS_QUIZ_FAILED</code></li>
                  <li>• <code>LMS_QUIZ_PASSED</code></li>
                  <li>• <code>LMS_ASSESSMENT_DUE</code></li>
                  <li>• <code>LMS_EVALUATION_REQUEST</code></li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Template Placeholders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Employee Fields</h4>
              <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                <li>{'{employee_name}'}</li>
                <li>{'{employee_email}'}</li>
                <li>{'{manager_name}'}</li>
                <li>{'{department_name}'}</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Training Fields</h4>
              <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                <li>{'{course_name}'}</li>
                <li>{'{progress_percent}'}</li>
                <li>{'{due_date}'}</li>
                <li>{'{certificate_expiry}'}</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Session Fields</h4>
              <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                <li>{'{session_date}'}</li>
                <li>{'{session_time}'}</li>
                <li>{'{session_location}'}</li>
                <li>{'{instructor_name}'}</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Quiz Fields</h4>
              <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                <li>{'{quiz_score}'}</li>
                <li>{'{passing_score}'}</li>
                <li>{'{retakes_remaining}'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Training sessions can sync with employee calendars via multiple methods:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Google Calendar</h4>
              <p className="text-sm text-muted-foreground mb-2">
                OAuth integration for automatic event creation.
              </p>
              <Badge variant="outline">Auto-sync</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Outlook/O365</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Microsoft Graph API for Exchange calendars.
              </p>
              <Badge variant="outline">Auto-sync</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">iCal Export</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Download .ics file for manual import.
              </p>
              <Badge variant="secondary">Manual</Badge>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Calendar Event Fields</h4>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li>• Event title: Course/Session name</li>
              <li>• Date/Time: Session schedule</li>
              <li>• Location: Room or virtual link</li>
              <li>• Description: Course details + join link</li>
              <li>• Reminder: 1 day and 1 hour before</li>
              <li>• Status: Tentative until confirmed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reminder Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Event Type</th>
                  <th className="text-left py-2 px-3">Recommended Timing</th>
                  <th className="text-left py-2 px-3">Recipients</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Certificate Expiry</td>
                  <td className="py-2 px-3">30, 14, 7, 1 days before</td>
                  <td className="py-2 px-3">Employee + Manager</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Compliance Training Due</td>
                  <td className="py-2 px-3">14, 7, 3, 1 days before</td>
                  <td className="py-2 px-3">Employee + Manager + HR</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Session Reminder</td>
                  <td className="py-2 px-3">7 days, 1 day, 1 hour before</td>
                  <td className="py-2 px-3">Enrolled employees</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Progress Stalled</td>
                  <td className="py-2 px-3">After 7 days of no activity</td>
                  <td className="py-2 px-3">Employee</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Overdue Training</td>
                  <td className="py-2 px-3">1, 3, 7 days after due date</td>
                  <td className="py-2 px-3">Employee + Manager</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={configSteps} title="Configuration Procedure" />

      <ScreenshotPlaceholder 
        title="Notification Event Configuration"
        description="Shows the notification settings with event toggles and timing configuration"
      />

      <TipCallout>
        <strong>Best Practice:</strong> Don't over-notify. Start with essential notifications 
        (enrollment, overdue, expiry) and add others based on user feedback. Too many notifications 
        lead to alert fatigue.
      </TipCallout>

      <InfoCallout>
        The notification system is powered by the <code>process-reminders</code> edge function, 
        which evaluates <code>reminder_rules</code> and sends notifications via the configured 
        email provider. For technical details, see <strong>Platform Administration Manual</strong>.
      </InfoCallout>
    </section>
  );
}
