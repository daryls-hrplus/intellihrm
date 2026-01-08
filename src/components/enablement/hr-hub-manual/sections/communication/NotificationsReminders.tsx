import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Clock, 
  Zap,
  Settings,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Repeat,
  MessageSquare,
  Sparkles,
  Eye
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout,
  SuccessCallout 
} from '@/components/enablement/manual/components';

export function NotificationsReminders() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>2.4 Notifications & Reminders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Employee notification preferences and automated reminder rules
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The notification system ensures employees and managers stay informed about 
            important HR events, approvals, and deadlines. Configure employee preferences 
            and set up automated reminder rules for proactive communication.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">In-App</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time notifications within the application
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Email</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Email notifications for important updates
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-700 dark:text-purple-300">Automated</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Scheduled reminders for upcoming deadlines
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Tabs */}
      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notification Preferences
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reminder Rules
          </TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Employee Notification Preferences (ESS)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Employees can customize their notification preferences from their profile settings. 
                Administrators can view and manage default settings.
              </p>

              {/* Master Email Toggle */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Master Email Toggle
                </h4>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">
                    A global toggle that enables or disables all email notifications. 
                    When disabled, employees still receive in-app notifications but no emails.
                  </p>
                </div>
                <WarningCallout title="Critical Notifications">
                  Even with email disabled, certain critical notifications (e.g., password reset, 
                  security alerts) may still be sent via email for security purposes.
                </WarningCallout>
              </div>

              {/* Workflow Notifications */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Workflow Notifications
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Notification Type</th>
                        <th className="text-left py-2 px-3 font-medium">Description</th>
                        <th className="text-left py-2 px-3 font-medium">Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 px-3 font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          Pending Approval
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">Request awaiting action</td>
                        <td className="py-2 px-3"><Badge className="bg-green-500">On</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Approved
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">Request has been approved</td>
                        <td className="py-2 px-3"><Badge className="bg-green-500">On</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Rejected
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">Request has been declined</td>
                        <td className="py-2 px-3"><Badge className="bg-green-500">On</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Escalated
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">Request escalated to higher level</td>
                        <td className="py-2 px-3"><Badge className="bg-green-500">On</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium flex items-center gap-2">
                          <Repeat className="h-4 w-4 text-blue-500" />
                          Returned
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">Request returned for revision</td>
                        <td className="py-2 px-3"><Badge className="bg-green-500">On</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Completed
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">Workflow fully completed</td>
                        <td className="py-2 px-3"><Badge className="bg-green-500">On</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Other Notifications */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Other Notifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-3">Communication</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center justify-between">
                        <span>System Announcements</span>
                        <Badge variant="outline">Configurable</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Ticket Updates</span>
                        <Badge variant="outline">Configurable</Badge>
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-3">HR Events</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center justify-between">
                        <span>Performance Reviews</span>
                        <Badge variant="outline">Configurable</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Leave Requests</span>
                        <Badge variant="outline">Configurable</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Training Requests</span>
                        <Badge variant="outline">Configurable</Badge>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Reminder Rules Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Automated reminder rules proactively notify employees and managers about 
                upcoming deadlines, expiring documents, and scheduled events.
              </p>

              {/* AI Natural Language Input */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI-Powered Rule Creation
                </h4>
                <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
                  <p className="text-sm text-muted-foreground mb-3">
                    Describe your reminder rule in natural language, and AI will generate 
                    the configuration for you.
                  </p>
                  <div className="p-3 rounded bg-background border text-sm italic text-muted-foreground">
                    "Send a reminder to employees 30 days before their passport expires, 
                    and copy their manager"
                  </div>
                </div>
                <SuccessCallout title="AI Suggestions">
                  The AI interprets your description and pre-fills rule fields. Review 
                  and adjust as needed before saving.
                </SuccessCallout>
              </div>

              {/* Rule Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold">Reminder Rule Fields</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Field</th>
                        <th className="text-left py-2 px-3 font-medium">Description</th>
                        <th className="text-left py-2 px-3 font-medium">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 px-3 font-medium">Rule Name</td>
                        <td className="py-2 px-3 text-muted-foreground">Descriptive identifier</td>
                        <td className="py-2 px-3 text-muted-foreground">"Passport Expiry Warning"</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Description</td>
                        <td className="py-2 px-3 text-muted-foreground">Purpose of the reminder</td>
                        <td className="py-2 px-3 text-muted-foreground">"Notifies about expiring travel documents"</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Event Type</td>
                        <td className="py-2 px-3 text-muted-foreground">What triggers the reminder</td>
                        <td className="py-2 px-3 text-muted-foreground">Document Expiry, Performance Review, etc.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Reminder Intervals</td>
                        <td className="py-2 px-3 text-muted-foreground">Days before event to send</td>
                        <td className="py-2 px-3 text-muted-foreground">90, 60, 30, 7 days</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Recipients</td>
                        <td className="py-2 px-3 text-muted-foreground">Who receives the reminder</td>
                        <td className="py-2 px-3 text-muted-foreground">Employee, Manager, HR</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Notification Method</td>
                        <td className="py-2 px-3 text-muted-foreground">Delivery channel</td>
                        <td className="py-2 px-3 text-muted-foreground">In-App, Email, Both</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Priority</td>
                        <td className="py-2 px-3 text-muted-foreground">Urgency level</td>
                        <td className="py-2 px-3 text-muted-foreground">Low, Medium, High, Critical</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Event Types */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Types Reference
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Document Events
                    </h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Passport Expiry</li>
                      <li>• Visa Expiry</li>
                      <li>• License Expiry</li>
                      <li>• Certification Expiry</li>
                      <li>• Work Permit Expiry</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      Performance Events
                    </h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Review Period Start</li>
                      <li>• Self-Assessment Due</li>
                      <li>• Manager Assessment Due</li>
                      <li>• Calibration Deadline</li>
                      <li>• Goal Setting Due</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-500" />
                      Compliance Events
                    </h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Training Due Date</li>
                      <li>• Policy Acknowledgment</li>
                      <li>• Health Check Due</li>
                      <li>• Safety Certification</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Contract Events
                    </h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Probation End Date</li>
                      <li>• Contract End Date</li>
                      <li>• Benefits Enrollment</li>
                      <li>• Anniversary Date</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Cycle Type Filters */}
              <div className="space-y-4">
                <h4 className="font-semibold">Performance Cycle Filters</h4>
                <p className="text-sm text-muted-foreground">
                  For performance-related events, optionally filter by cycle type:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Annual Review</Badge>
                  <Badge variant="outline">Mid-Year Review</Badge>
                  <Badge variant="outline">Quarterly Check-in</Badge>
                  <Badge variant="outline">Probation Review</Badge>
                  <Badge variant="outline">Project Review</Badge>
                </div>
              </div>

              {/* Email Templates */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Email Template Options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-2">System Templates</h5>
                    <p className="text-sm text-muted-foreground">
                      Select from pre-built email templates that automatically include 
                      relevant details like employee name, document type, and expiry date.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-2">Custom Message</h5>
                    <p className="text-sm text-muted-foreground">
                      Write a custom message with variable placeholders. Useful for 
                      organization-specific language or additional context.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affected Records Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Testing Reminder Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Before activating a rule, preview which employees will be affected.
              </p>
              
              <div className="p-4 rounded-lg border bg-muted/30">
                <h5 className="font-medium mb-3">Affected Records Preview</h5>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Configure your reminder rule (event type, intervals, recipients)</li>
                  <li>Click "Preview Affected Records" button</li>
                  <li>Review the list of employees who match the criteria</li>
                  <li>Verify the reminder would reach the intended audience</li>
                  <li>Adjust criteria if needed before activating</li>
                </ol>
              </div>

              <TipCallout title="Test with Inactive Status">
                Create rules in inactive status first, preview affected records, 
                then activate when confirmed correct. This prevents unintended 
                notifications during setup.
              </TipCallout>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Best Practices */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Notification Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">Reminder Strategy</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use multiple intervals for critical items (90, 60, 30, 7 days)</li>
                <li>• Increase priority as deadline approaches</li>
                <li>• Include manager for items requiring action</li>
                <li>• Use both email and in-app for critical reminders</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Avoiding Notification Fatigue</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Don't over-notify—choose meaningful intervals</li>
                <li>• Consolidate related reminders where possible</li>
                <li>• Reserve "Critical" priority for truly urgent items</li>
                <li>• Review and prune unused rules quarterly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
