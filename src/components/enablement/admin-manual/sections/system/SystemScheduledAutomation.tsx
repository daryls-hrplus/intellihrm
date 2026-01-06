import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Bell, FileText, RefreshCw, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const SCHEDULED_REPORTS = [
  { report: "Headcount Summary", frequency: "Weekly", recipients: "HR Leadership", format: "PDF, Excel" },
  { report: "Leave Liability", frequency: "Monthly", recipients: "Finance, HR", format: "Excel" },
  { report: "Overtime Analysis", frequency: "Bi-weekly", recipients: "Department Heads", format: "PDF" },
  { report: "Compliance Audit", frequency: "Quarterly", recipients: "Compliance Team", format: "PDF" },
  { report: "Birthday/Anniversary", frequency: "Weekly", recipients: "Managers", format: "Email" },
  { report: "Expiring Certifications", frequency: "Monthly", recipients: "HR, Employees", format: "Email" },
];

const REMINDER_RULES = [
  { rule: "Probation Review Due", trigger: "30 days before end date", recipients: "Manager, HR" },
  { rule: "Contract Expiry", trigger: "60, 30, 14 days before", recipients: "HR, Employee" },
  { rule: "Performance Review Start", trigger: "7 days before cycle", recipients: "All participants" },
  { rule: "Leave Balance Warning", trigger: "Balance < 5 days", recipients: "Employee, Manager" },
  { rule: "Goal Setting Deadline", trigger: "7, 3, 1 days before", recipients: "Employee" },
  { rule: "Training Completion", trigger: "14 days before due", recipients: "Employee, Manager" },
];

const AUTOMATION_JOBS = [
  { job: "Calculate Leave Accruals", schedule: "1st of month, 2:00 AM", status: "Active" },
  { job: "Sync Organization Data", schedule: "Daily, 6:00 AM", status: "Active" },
  { job: "Archive Old Records", schedule: "Sunday, 3:00 AM", status: "Active" },
  { job: "Refresh Dashboards", schedule: "Every 4 hours", status: "Active" },
  { job: "Send Digest Emails", schedule: "Daily, 8:00 AM", status: "Paused" },
  { job: "Update Currency Rates", schedule: "Daily, 7:00 AM", status: "Active" },
];

export function SystemScheduledAutomation() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configure scheduled reports, automated reminders, and background jobs that run 
        on defined schedules to reduce manual administrative tasks.
      </p>

      {/* Scheduled Reports */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          Scheduled Reports
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Report</th>
                <th className="text-left p-3 font-medium">Frequency</th>
                <th className="text-left p-3 font-medium">Recipients</th>
                <th className="text-left p-3 font-medium">Format</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULED_REPORTS.map((report, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">{report.report}</td>
                  <td className="p-3">
                    <Badge variant="outline">{report.frequency}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{report.recipients}</td>
                  <td className="p-3">{report.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.11.1: Scheduled report configuration with frequency and recipient settings"
        alt="Report scheduler showing cron expression, recipient groups, and format selection"
      />

      {/* Reminder Rules */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-500" />
          Automated Reminder Rules
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Reminder Rule</th>
                <th className="text-left p-3 font-medium">Trigger</th>
                <th className="text-left p-3 font-medium">Recipients</th>
              </tr>
            </thead>
            <tbody>
              {REMINDER_RULES.map((rule, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">{rule.rule}</td>
                  <td className="p-3 text-muted-foreground">{rule.trigger}</td>
                  <td className="p-3">{rule.recipients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.11.2: Reminder rule configuration with trigger conditions and notification settings"
        alt="Reminder configuration panel showing date-based triggers and recipient selection"
      />

      {/* System Jobs */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-purple-500" />
          System Automation Jobs
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Job Name</th>
                <th className="text-left p-3 font-medium">Schedule</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {AUTOMATION_JOBS.map((job, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">{job.job}</td>
                  <td className="p-3 text-muted-foreground">{job.schedule}</td>
                  <td className="p-3">
                    <Badge 
                      variant={job.status === "Active" ? "default" : "secondary"}
                      className={job.status === "Active" ? "bg-green-500/10 text-green-700 border-green-500/30" : ""}
                    >
                      {job.status === "Active" ? (
                        <PlayCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <PauseCircle className="h-3 w-3 mr-1" />
                      )}
                      {job.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="cursor-pointer text-xs">Run Now</Badge>
                      <Badge variant="secondary" className="cursor-pointer text-xs">History</Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.11.3: Job execution history with run times and status logs"
        alt="Job history panel showing execution timestamps, duration, and success/failure status"
      />

      {/* Schedule Configuration */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-green-500" />
          Schedule Configuration
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-2">Frequency Options</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Hourly (every X hours)</li>
              <li>• Daily (specific time)</li>
              <li>• Weekly (specific days)</li>
              <li>• Monthly (specific date or last day)</li>
              <li>• Custom cron expression</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-2">Timezone Handling</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• All schedules use company timezone</li>
              <li>• Recipients see times in their local zone</li>
              <li>• DST transitions handled automatically</li>
              <li>• Holiday calendar exclusions supported</li>
            </ul>
          </div>
        </div>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> Schedule resource-intensive jobs (large reports, data syncs) during 
          off-peak hours (typically 2-6 AM local time) to minimize impact on system performance.
        </AlertDescription>
      </Alert>
    </div>
  );
}
