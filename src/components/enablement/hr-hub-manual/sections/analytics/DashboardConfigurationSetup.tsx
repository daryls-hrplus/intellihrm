import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar,
  Mail,
  Clock,
  Settings,
  Play,
  Pause,
  Trash2,
  Send,
  CheckCircle2,
  Users,
  Building2,
  LayoutDashboard,
  PenLine
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout,
  FutureCallout 
} from '@/components/enablement/manual/components';

export const DashboardConfigurationSetup: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div 
        id="hh-7-3" 
        data-manual-anchor="hh-7-3" 
        className="scroll-mt-36"
      >
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="text-sm font-medium">7.3</Badge>
          <h3 className="text-xl font-semibold text-foreground">Dashboard & Report Configuration</h3>
        </div>
        
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Automated Report Delivery & Dashboard Customization</h4>
                <p className="text-muted-foreground">
                  Configure scheduled reports to automatically deliver organizational insights to 
                  stakeholders via email. Set up daily, weekly, or monthly report cadences with 
                  customizable content and recipient lists to ensure leadership stays informed 
                  without manual intervention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <InfoCallout>
        <strong>Navigation:</strong> Access scheduled reports via HR Hub → Organization → Org Chart, 
        then click "Scheduled Reports" in the page header actions.
      </InfoCallout>

      {/* Scheduled Org Reports */}
      <Card id="hh-sec-7-3-1" data-manual-anchor="hh-sec-7-3-1" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Scheduled Organization Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Automate the delivery of organizational reports containing position data, employee 
            information, and change tracking to ensure stakeholders receive consistent updates.
          </p>

          {/* Schedule Options */}
          <div className="space-y-4">
            <h5 className="font-semibold">Report Schedule Options</h5>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold">Daily</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Report sent every day at the specified time. Ideal for operational teams 
                    needing current headcount data.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Use case:</strong> Shift planning, daily staffing reviews
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Weekly</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Report sent on a specific day of the week at the specified time. 
                    Best for manager updates and HR reviews.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Use case:</strong> Monday leadership briefings, Friday wrap-ups
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold">Monthly</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Report sent on a specific day of the month. Perfect for executive 
                    summaries and board-level updates.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Use case:</strong> First of month executive briefing
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Configuration Fields */}
          <div className="space-y-4">
            <h5 className="font-semibold">Schedule Configuration Fields</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Field</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Schedule Name</td>
                    <td className="py-3 px-4 text-muted-foreground">Descriptive name for the schedule</td>
                    <td className="py-3 px-4 text-muted-foreground">"Weekly HR Leadership Report"</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Frequency</td>
                    <td className="py-3 px-4 text-muted-foreground">Daily, Weekly, or Monthly</td>
                    <td className="py-3 px-4 text-muted-foreground">Weekly</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Day (Weekly/Monthly)</td>
                    <td className="py-3 px-4 text-muted-foreground">Day of week or day of month</td>
                    <td className="py-3 px-4 text-muted-foreground">Monday / 1st</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Time</td>
                    <td className="py-3 px-4 text-muted-foreground">Time of day for delivery</td>
                    <td className="py-3 px-4 text-muted-foreground">08:00 AM</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Recipients</td>
                    <td className="py-3 px-4 text-muted-foreground">Comma-separated email addresses</td>
                    <td className="py-3 px-4 text-muted-foreground">hr@company.com, ceo@company.com</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Company/Department</td>
                    <td className="py-3 px-4 text-muted-foreground">Scope of data included</td>
                    <td className="py-3 px-4 text-muted-foreground">Engineering Department</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content Options */}
      <Card id="hh-sec-7-3-2" data-manual-anchor="hh-sec-7-3-2" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Report Content Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Customize what data is included in each scheduled report by toggling content sections.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Include Positions</span>
                  <Badge variant="outline" className="ml-auto">Toggle</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Include position hierarchy data with job titles, reporting relationships, 
                  and position status (filled/vacant).
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Include Employees</span>
                  <Badge variant="outline" className="ml-auto">Toggle</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Include employee details such as names, hire dates, departments, 
                  and current assignments.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <PenLine className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Include Changes</span>
                  <Badge variant="outline" className="ml-auto">Toggle</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Include recent organizational changes such as new hires, terminations, 
                  transfers, and promotions.
                </p>
              </CardContent>
            </Card>
          </div>

          <TipCallout>
            For executive reports, enable all three options to provide a comprehensive view. 
            For operational reports, include only "Changes" to keep the report focused and brief.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Schedule Management */}
      <Card id="hh-sec-7-3-3" data-manual-anchor="hh-sec-7-3-3" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Schedule Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Manage your scheduled reports with these common actions available from the schedule list.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-semibold">Available Actions</h5>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Play className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Activate Schedule</p>
                    <p className="text-sm text-muted-foreground">Enable a paused schedule to resume automated delivery</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Pause className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Pause Schedule</p>
                    <p className="text-sm text-muted-foreground">Temporarily stop delivery without deleting configuration</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <PenLine className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Edit Schedule</p>
                    <p className="text-sm text-muted-foreground">Modify recipients, timing, or content options</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Delete Schedule</p>
                    <p className="text-sm text-muted-foreground">Permanently remove a schedule (cannot be undone)</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-semibold">Schedule Status Indicators</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>
                  <span className="text-sm text-muted-foreground">Schedule is running and will send at next scheduled time</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Paused</Badge>
                  <span className="text-sm text-muted-foreground">Schedule is temporarily disabled</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Badge variant="outline">Last Sent</Badge>
                  <span className="text-sm text-muted-foreground">Timestamp showing when report was last delivered</span>
                </div>
              </div>
            </div>
          </div>

          <WarningCallout>
            Deleting a schedule is permanent. If you need to temporarily stop a report, use the 
            Pause action instead to preserve your configuration.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Manual Report Sending */}
      <Card id="hh-sec-7-3-4" data-manual-anchor="hh-sec-7-3-4" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Manual Report Sending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            In addition to scheduled delivery, you can manually send reports on-demand for 
            ad-hoc requests or urgent updates.
          </p>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h5 className="font-semibold mb-3">Send Now Feature</h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">How to Use</p>
                <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Navigate to Scheduled Reports</li>
                  <li>Find the desired schedule</li>
                  <li>Click "Send Now" button</li>
                  <li>Report is immediately generated and sent</li>
                </ol>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Use Cases</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Board meeting preparation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Urgent executive request</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Testing new schedule configuration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Verifying recipient email delivery</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <TipCallout>
            Use "Send Now" to test a new schedule configuration before activating it. 
            This ensures recipients receive the expected content and format.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Report Customization Roadmap */}
      <Card id="hh-sec-7-3-5" data-manual-anchor="hh-sec-7-3-5" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Advanced Dashboard Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FutureCallout>
            The following features are planned for future releases to enhance dashboard 
            customization and reporting capabilities.
          </FutureCallout>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Custom Widgets</span>
                  <Badge variant="outline" className="ml-auto">Planned</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Drag-and-drop dashboard builder with customizable widget placement, 
                  KPI cards, charts, and data tables.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Role-Based Views</span>
                  <Badge variant="outline" className="ml-auto">Planned</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pre-configured dashboard layouts for different personas: Executive, 
                  HR Partner, Manager, Employee.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Report Templates</span>
                  <Badge variant="outline" className="ml-auto">Planned</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pre-built report templates for common use cases: Headcount, Turnover, 
                  Compensation, Diversity metrics.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Email Customization</span>
                  <Badge variant="outline" className="ml-auto">Planned</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Custom email templates with branding, executive summary text, 
                  and embedded charts.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Scheduled Reporting Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Audience</th>
                  <th className="text-left py-3 px-4 font-medium">Recommended Schedule</th>
                  <th className="text-left py-3 px-4 font-medium">Content Focus</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Executive Team</td>
                  <td className="py-3 px-4 text-muted-foreground">Monthly (1st of month, 8 AM)</td>
                  <td className="py-3 px-4 text-muted-foreground">All options: Positions, Employees, Changes</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">HR Leadership</td>
                  <td className="py-3 px-4 text-muted-foreground">Weekly (Monday, 7 AM)</td>
                  <td className="py-3 px-4 text-muted-foreground">Employees and Changes</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Department Heads</td>
                  <td className="py-3 px-4 text-muted-foreground">Weekly (Monday, 8 AM)</td>
                  <td className="py-3 px-4 text-muted-foreground">Department-scoped, Changes only</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Payroll Team</td>
                  <td className="py-3 px-4 text-muted-foreground">Semi-monthly (1st & 15th, 6 AM)</td>
                  <td className="py-3 px-4 text-muted-foreground">Employees and Changes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Operations</td>
                  <td className="py-3 px-4 text-muted-foreground">Daily (6 AM)</td>
                  <td className="py-3 px-4 text-muted-foreground">Positions only (for shift coverage)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <InfoCallout className="mt-4">
            Consider time zones when scheduling reports for distributed teams. Early morning 
            delivery ensures reports are available when stakeholders start their day.
          </InfoCallout>
        </CardContent>
      </Card>
    </div>
  );
};
