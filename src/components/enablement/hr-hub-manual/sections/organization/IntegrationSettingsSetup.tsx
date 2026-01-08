import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Mail, Video, MapPin, FileText, 
  Calendar, BarChart3, AlertTriangle, Shield, Send,
  Eye, EyeOff, Save
} from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout, NoteCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';

const emailConfigSteps = [
  {
    title: 'Get Resend API Key',
    description: 'Create a free account at resend.com and generate an API key.',
    substeps: [
      'Go to resend.com and sign up',
      'Navigate to API Keys section',
      'Create new API key with appropriate permissions',
      'Copy the key (shown only once)'
    ],
    expectedResult: 'API key copied to clipboard'
  },
  {
    title: 'Configure in HR Hub',
    description: 'Navigate to Admin → Settings and locate the Email Configuration section.',
    expectedResult: 'Settings page displays with Email Configuration card'
  },
  {
    title: 'Enter API Key',
    description: 'Paste your Resend API key into the field. Use the eye icon to toggle visibility.',
    expectedResult: 'API key saved (shown as masked dots)'
  },
  {
    title: 'Test Configuration',
    description: 'Click "Send Test Alert" to verify the configuration works. A test email will be sent to your address.',
    expectedResult: 'Success message confirms test email sent'
  }
];

const scheduledReports = [
  {
    name: 'Weekly Permissions Report',
    description: 'Summary of user access rights, role changes, and permission modifications',
    schedule: 'Every Monday 7:00 AM',
    recipients: 'System Administrators'
  },
  {
    name: 'Weekly Headcount Report',
    description: 'Employee count by department, status changes, and hiring trends',
    schedule: 'Every Monday 7:00 AM',
    recipients: 'HR Administrators'
  },
  {
    name: 'Monthly Headcount Report',
    description: 'Comprehensive monthly workforce analytics with historical comparison',
    schedule: 'First Monday of month',
    recipients: 'HR Administrators'
  },
  {
    name: 'SLA Breach Warnings',
    description: 'Proactive alerts when help desk tickets approach SLA deadlines',
    schedule: 'Every 4 hours',
    recipients: 'Assigned ticket handlers'
  },
  {
    name: 'Weekly SLA Performance',
    description: 'Help desk SLA compliance rates and breach analysis',
    schedule: 'Every Monday 8:00 AM',
    recipients: 'HR Administrators'
  }
];

export function IntegrationSettingsSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-2-4">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 2.4</Badge>
            <Badge variant="secondary">10 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Integration Settings</h2>
          <p className="text-muted-foreground mt-1">
            Configure external service connections for email, video, maps, and scheduled reports
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            External Service Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HR Hub integrates with external services to provide email notifications, video 
            conferencing, and map visualizations. These integrations are optional but enable 
            powerful features across the platform.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Email (Resend)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Notifications, alerts, reports
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Video className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Video (Daily.co)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Interviews, meetings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Maps (Mapbox)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Branch locations, geofencing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Branding</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Copyright notice, footer
                </p>
              </div>
            </div>
          </div>

          <TipCallout title="Configure Email First">
            Email is the foundation for many features—notifications, scheduled reports, SLA 
            alerts, and password resets all depend on it. Configure Resend before other integrations.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Email Configuration (Resend)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HR Hub uses Resend for transactional email. Resend offers a generous free tier 
            (100 emails/day) and reliable delivery with analytics.
          </p>

          <div className="rounded-lg border p-4 bg-muted/30">
            <h4 className="font-medium mb-2">Email Features Enabled:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 grid grid-cols-2 gap-2">
              <li>• PII access alerts</li>
              <li>• SLA breach warnings</li>
              <li>• Weekly permissions reports</li>
              <li>• Headcount reports</li>
              <li>• Password reset emails</li>
              <li>• Approval notifications</li>
              <li>• Announcement delivery</li>
              <li>• Custom reminder emails</li>
            </ul>
          </div>

          <StepByStep steps={emailConfigSteps} />

          <NoteCallout title="Email Sender Address">
            By default, emails are sent from your Resend account's default sender address. 
            To use a custom domain (e.g., hr@yourcompany.com), verify your domain in Resend 
            first, then update the sender address in advanced settings.
          </NoteCallout>
        </CardContent>
      </Card>

      {/* Video Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-green-500" />
            Video Chat Configuration (Daily.co)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Daily.co powers video meetings for interviews, 1:1s, and virtual team meetings. 
            Rooms are created on-demand with participant access controls.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Setup Steps</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Create account at daily.co</li>
                <li>2. Navigate to Developers → API Keys</li>
                <li>3. Generate new API key</li>
                <li>4. Paste into Admin → Settings</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Features Enabled</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Interview video rooms</li>
                <li>• Manager 1:1 meetings</li>
                <li>• Training sessions</li>
                <li>• Recording (with consent)</li>
              </ul>
            </div>
          </div>

          <InfoCallout title="Meeting Links">
            When video is configured, users can create meeting rooms directly from the 
            interview scheduler, calendar events, and team collaboration features.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Maps Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-500" />
            Map Configuration (Mapbox)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Mapbox provides interactive maps for visualizing branch locations, employee 
            distribution, and geofencing for time & attendance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Setup Steps</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Create account at mapbox.com</li>
                <li>2. Navigate to Access Tokens</li>
                <li>3. Copy your default public token</li>
                <li>4. Paste into Admin → Settings</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Features Enabled</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Branch location maps</li>
                <li>• Employee distribution view</li>
                <li>• Geofence boundary visualization</li>
                <li>• Route optimization (future)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            Branding Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Customize system-wide branding elements that appear throughout the application.
          </p>

          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-2">Available Settings</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground w-32">Copyright Notice:</span>
                <span>Text displayed in the application footer (e.g., "© 2024 Your Company")</span>
              </li>
            </ul>
          </div>

          <NoteCallout title="Logo & Colors">
            Company-specific logos and color schemes are configured at the company level 
            in Admin → Companies → Branding. The settings here apply system-wide.
          </NoteCallout>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            With email configured, the system can send automated reports on a schedule. 
            These reports provide proactive visibility into system activity.
          </p>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Report</th>
                  <th className="text-left p-3 font-medium">Schedule</th>
                  <th className="text-left p-3 font-medium">Recipients</th>
                </tr>
              </thead>
              <tbody>
                {scheduledReports.map((report, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{report.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{report.description}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{report.schedule}</td>
                    <td className="p-3 text-muted-foreground">{report.recipients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TipCallout title="Manual Triggers">
            Each scheduled report can also be triggered manually from the Settings page. 
            Use this to test delivery or send ad-hoc updates.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Security Considerations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Security Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">API Key Storage</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keys stored encrypted at rest</li>
                <li>• Masked in UI (shown as dots)</li>
                <li>• Never exposed in client-side code</li>
                <li>• Rotation supported (enter new key)</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Audit Trail</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All setting changes logged</li>
                <li>• Who changed, when, what</li>
                <li>• Test emails tracked</li>
                <li>• Integration usage monitored</li>
              </ul>
            </div>
          </div>

          <WarningCallout title="Key Rotation">
            If you suspect an API key has been compromised, immediately generate a new key 
            in the provider's dashboard and update it in HR Hub. The old key should be 
            revoked in the provider's portal.
          </WarningCallout>
        </CardContent>
      </Card>
    </div>
  );
}
