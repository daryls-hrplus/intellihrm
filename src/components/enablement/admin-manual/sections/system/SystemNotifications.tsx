import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { LearningObjectives, TipCallout, InfoCallout, ScreenshotPlaceholder } from '../../../manual/components';

export function SystemNotifications() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Configure notification templates for system events",
          "Set up delivery channels (email, in-app, SMS)",
          "Customize notification content and branding",
          "Manage notification preferences and frequency"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Configuration Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Intelli HRM sends notifications for workflow events, approvals, deadlines, 
            and system alerts. Configure templates and delivery preferences to 
            ensure effective communication without notification fatigue.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <Mail className="h-5 w-5 text-blue-500 mb-2" />
              <h4 className="font-medium text-sm">Email</h4>
              <p className="text-xs text-muted-foreground">
                Primary channel for detailed notifications
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <MessageSquare className="h-5 w-5 text-green-500 mb-2" />
              <h4 className="font-medium text-sm">In-App</h4>
              <p className="text-xs text-muted-foreground">
                Real-time alerts within Intelli HRM
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <Smartphone className="h-5 w-5 text-purple-500 mb-2" />
              <h4 className="font-medium text-sm">SMS/Push</h4>
              <p className="text-xs text-muted-foreground">
                Urgent notifications for mobile users
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 5.5.1: Notification template configuration"
        alt="Notification settings page showing template editor, delivery channel options, and preview"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left font-medium">Category</th>
                  <th className="border p-2 text-left font-medium">Examples</th>
                  <th className="border p-2 text-center font-medium">Email</th>
                  <th className="border p-2 text-center font-medium">In-App</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-medium">Approvals</td>
                  <td className="border p-2 text-muted-foreground">Leave requests, expenses, access requests</td>
                  <td className="border p-2 text-center">✓</td>
                  <td className="border p-2 text-center">✓</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-2 font-medium">Reminders</td>
                  <td className="border p-2 text-muted-foreground">Task deadlines, appraisal due dates</td>
                  <td className="border p-2 text-center">✓</td>
                  <td className="border p-2 text-center">✓</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">Confirmations</td>
                  <td className="border p-2 text-muted-foreground">Request approved/rejected, submission received</td>
                  <td className="border p-2 text-center">✓</td>
                  <td className="border p-2 text-center">✓</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border p-2 font-medium">Alerts</td>
                  <td className="border p-2 text-muted-foreground">Security events, compliance warnings</td>
                  <td className="border p-2 text-center">✓</td>
                  <td className="border p-2 text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <InfoCallout title="User Preferences">
        Users can customize their notification preferences in personal settings. 
        System-critical notifications (security alerts) cannot be disabled.
      </InfoCallout>

      <TipCallout title="Template Variables">
        Use template variables like {'{employee_name}'}, {'{request_type}'}, and 
        {'{due_date}'} to personalize notifications. Test templates with sample 
        data before deployment.
      </TipCallout>
    </div>
  );
}
