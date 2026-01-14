import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Clock, Mail, MessageSquare, Lightbulb, AlertTriangle } from 'lucide-react';

export function SetupNotifications() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  2.4b Notification Templates Configuration
                  <Badge variant="secondary">Recommended</Badge>
                </CardTitle>
                <CardDescription>
                  Configure notification triggers, templates, and delivery channels for performance events
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              ~15 min
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview */}
          <div>
            <h4 className="font-semibold mb-3">Overview</h4>
            <p className="text-muted-foreground">
              Performance notifications keep all stakeholders informed throughout the appraisal lifecycle. 
              Configure automated notifications for cycle launches, evaluation reminders, deadline alerts, 
              and completion confirmations to ensure timely action and high participation rates.
            </p>
          </div>

          {/* Notification Types */}
          <div>
            <h4 className="font-semibold mb-3">Notification Types</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Cycle Launch Notifications</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Announce new appraisal cycles to participants, managers, and HR
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Deadline Reminders</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automated reminders before key deadlines (self-assessment, manager review)
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Escalation Alerts</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Notify supervisors when deadlines are missed or actions are overdue
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Completion Confirmations</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Confirm successful submission and acknowledgment of appraisals
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Configuration Table */}
          <div>
            <h4 className="font-semibold mb-3">Configuration Options</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setting</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Best Practice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Reminder Frequency</TableCell>
                  <TableCell>Daily, Weekly, Custom intervals</TableCell>
                  <TableCell>Weekly until 3 days before deadline, then daily</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Delivery Channel</TableCell>
                  <TableCell>Email, In-app, SMS (if enabled)</TableCell>
                  <TableCell>Email + In-app for important notifications</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Recipient Rules</TableCell>
                  <TableCell>By role, by relationship, custom groups</TableCell>
                  <TableCell>Auto-detect based on appraisal relationships</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Escalation Timing</TableCell>
                  <TableCell>1-7 days after deadline</TableCell>
                  <TableCell>Escalate to skip-level after 3 days overdue</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* AI Insight */}
          <Alert className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
            <Lightbulb className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-purple-800 dark:text-purple-200">AI Insight</AlertTitle>
            <AlertDescription className="text-purple-700 dark:text-purple-300">
              The AI can analyze historical completion patterns to recommend optimal reminder timing 
              and identify employees who may need earlier intervention to meet deadlines.
            </AlertDescription>
          </Alert>

          {/* Navigation */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <span className="text-sm font-medium">Admin Route:</span>
            <code className="text-sm bg-muted px-2 py-1 rounded">/admin/performance-notifications</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
