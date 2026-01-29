import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Users,
  Settings,
  CheckCircle2
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
    title: 'Navigate to Virtual Classroom Settings',
    description: 'Go to Learning → Setup → Virtual Classrooms to configure video platform integrations.',
    notes: ['Requires Admin role'],
    expectedResult: 'Virtual classroom provider list displays'
  },
  {
    title: 'Enable Video Platform',
    description: 'Select the video platform to integrate (Teams, Zoom, or Meet).',
    notes: [
      'Only one platform can be primary at a time',
      'Secondary platforms can be configured for specific use cases'
    ]
  },
  {
    title: 'Configure API Credentials',
    description: 'Enter OAuth credentials or API keys for the selected platform.',
    notes: [
      'Zoom: API Key + Secret from Zoom Marketplace',
      'Teams: Azure AD App Registration',
      'Meet: Google Workspace Admin credentials'
    ],
    expectedResult: 'Connection test succeeds'
  },
  {
    title: 'Set Default Meeting Options',
    description: 'Configure default settings for auto-created meetings.',
    notes: [
      'Waiting room enabled/disabled',
      'Recording auto-start preference',
      'Participant video default'
    ]
  },
  {
    title: 'Test Session Creation',
    description: 'Create a test ILT session and verify virtual meeting is auto-generated.',
    expectedResult: 'Session includes join URL and calendar invite with meeting link'
  }
];

export function LndIntegrationVirtualClassroom() {
  return (
    <section id="sec-8-9" data-manual-anchor="sec-8-9" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Video className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.9 Virtual Classroom Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect Microsoft Teams, Zoom, and Google Meet for virtual instructor-led training
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure video platform integration (Teams, Zoom, Meet)',
        'Enable automatic meeting creation for ILT sessions',
        'Set up attendance tracking from virtual sessions',
        'Configure recording and transcript sync'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Supported Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
                  T
                </div>
                <h4 className="font-medium">Microsoft Teams</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Auto meeting creation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Attendance tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Recording sync
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Transcript import
                </li>
              </ul>
              <Badge variant="outline" className="mt-3">Graph API</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">
                  Z
                </div>
                <h4 className="font-medium">Zoom</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Auto meeting creation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Attendance tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Recording sync
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Breakout rooms
                </li>
              </ul>
              <Badge variant="outline" className="mt-3">REST API</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-sm">
                  G
                </div>
                <h4 className="font-medium">Google Meet</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Auto meeting creation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Attendance tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Calendar integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-amber-600" />
                  Recording (Enterprise)
                </li>
              </ul>
              <Badge variant="outline" className="mt-3">Calendar API</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Session Creation Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When an instructor-led training (ILT) session is created with "Virtual" delivery method:
          </p>

          <div className="p-4 border rounded-lg bg-muted/50">
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Session Created</p>
                  <p className="text-muted-foreground">Admin creates ILT session with delivery_method = 'virtual'</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Meeting Auto-Generated</p>
                  <p className="text-muted-foreground">System calls video platform API to create meeting</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Links Stored</p>
                  <p className="text-muted-foreground">join_url and host_url saved to session record</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Calendar Events Created</p>
                  <p className="text-muted-foreground">Enrolled participants receive calendar invites with join link</p>
                </div>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Virtual session attendance is automatically tracked via platform APIs:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Platform</th>
                  <th className="text-left py-2 px-3">Data Captured</th>
                  <th className="text-left py-2 px-3">Sync Timing</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Teams</td>
                  <td className="py-2 px-3">Join time, leave time, duration, user identity</td>
                  <td className="py-2 px-3">Post-meeting via Graph API</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Zoom</td>
                  <td className="py-2 px-3">Join time, leave time, attention score, polling responses</td>
                  <td className="py-2 px-3">Webhook + post-meeting report</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Meet</td>
                  <td className="py-2 px-3">Join time, leave time, participant list</td>
                  <td className="py-2 px-3">Post-meeting via Admin SDK</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Attendance Completion Logic</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Minimum attendance threshold: <code>80%</code> of session duration (configurable)</li>
              <li>• Matched by email address to employee record</li>
              <li>• Unmatched attendees logged for manual review</li>
              <li>• Attendance → enrollment status updated automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={configSteps} title="Configuration Procedure" />

      <ScreenshotPlaceholder 
        title="Virtual Classroom Configuration"
        description="Shows the video platform settings with API credentials and default meeting options"
      />

      <TipCallout>
        <strong>Best Practice:</strong> Configure the platform that aligns with your organization's 
        primary collaboration tool. Most organizations choose Teams for Microsoft 365 environments 
        or Zoom for cross-platform accessibility.
      </TipCallout>

      <InfoCallout>
        For ILT session scheduling and enrollment management, refer to <strong>Chapter 4: 
        Operational Workflows</strong>, Section 4.8 (Instructor-Led Training).
      </InfoCallout>
    </section>
  );
}
