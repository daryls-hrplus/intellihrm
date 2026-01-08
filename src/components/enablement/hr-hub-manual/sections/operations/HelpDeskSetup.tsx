import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Ticket, 
  Clock, 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  FileText, 
  Users,
  MessageSquare,
  Star,
  Zap,
  FolderOpen,
  ArrowUpRight,
  CheckCircle2,
  Archive,
  Plus,
  Eye
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout,
  SuccessCallout 
} from '@/components/enablement/manual/components';

export function HelpDeskSetup() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle>Help Desk</CardTitle>
                <Badge variant="outline" className="text-xs">Section 6.1</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>~12 min</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete HR Help Desk administration and ticket management
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The HR Help Desk provides a centralized ticket-based system for managing employee 
            inquiries, requests, and issues. It includes SLA tracking, canned responses, 
            escalation rules, and comprehensive analytics.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">SLA Tracking</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Priority-based response and resolution targets with breach alerts
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Automation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Canned responses, auto-assignment, and escalation rules
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-700 dark:text-purple-300">Analytics</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Performance metrics, satisfaction scores, and SLA compliance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Desk Tabs */}
      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Ticket Queue Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Creating Tickets */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Creating Tickets
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-2">Manual Ticket Creation</h5>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Click "New Ticket" button</li>
                      <li>Select category from dropdown</li>
                      <li>Enter subject and description</li>
                      <li>Set priority level</li>
                      <li>Optionally assign to specific agent</li>
                      <li>Click Create to submit</li>
                    </ol>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-2">On Behalf Of Employee</h5>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Enable "On behalf of" toggle</li>
                      <li>Search and select employee</li>
                      <li>Complete ticket details as normal</li>
                      <li>Ticket will show employee as requester</li>
                    </ol>
                  </div>
                </div>
                
                <TipCallout title="Mass Ticket Creation">
                  Use the "Mass Create" feature for company-wide actions like annual policy 
                  acknowledgments. Select multiple employees and create tickets with a single template.
                </TipCallout>
              </div>

              {/* Ticket Details */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Ticket Detail View
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Element</th>
                        <th className="text-left py-2 px-3 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 px-3 font-medium">Status Badge</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          Current state: Open, In Progress, Pending, Resolved, Closed
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Priority Indicator</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          Color-coded: Low (blue), Medium (yellow), High (orange), Critical (red)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">SLA Timer</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          Countdown to response/resolution deadline with breach warnings
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Assigned Agent</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          Current owner with option to reassign
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comments System */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments System
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                    <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Public Replies</h5>
                    <p className="text-sm text-muted-foreground">
                      Visible to the employee who submitted the ticket. Use for official 
                      responses and status updates.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                    <h5 className="font-medium text-amber-700 dark:text-amber-300 mb-2">Internal Notes</h5>
                    <p className="text-sm text-muted-foreground">
                      HR team only. Use for internal discussion, handoff notes, and 
                      sensitive information not shared with employee.
                    </p>
                  </div>
                </div>
              </div>

              {/* Canned Response Insertion */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Using Canned Responses
                </h4>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>In the reply editor, click the "Insert Template" button</li>
                    <li>Browse or search available templates by category</li>
                    <li>Click to insert—variables auto-populate:
                      <ul className="ml-6 mt-1 space-y-1 list-disc">
                        <li><code className="text-xs bg-muted px-1 rounded">{'{employee_name}'}</code> → Requester's name</li>
                        <li><code className="text-xs bg-muted px-1 rounded">{'{ticket_number}'}</code> → Ticket ID</li>
                        <li><code className="text-xs bg-muted px-1 rounded">{'{category}'}</code> → Ticket category</li>
                        <li><code className="text-xs bg-muted px-1 rounded">{'{submitted_date}'}</code> → Creation date</li>
                        <li><code className="text-xs bg-muted px-1 rounded">{'{company_name}'}</code> → Organization name</li>
                      </ul>
                    </li>
                    <li>Edit as needed before sending</li>
                  </ol>
                </div>
              </div>

              {/* Archiving */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Ticket Archiving
                </h4>
                <p className="text-sm text-muted-foreground">
                  Closed tickets can be archived to reduce queue clutter while maintaining 
                  full audit history. Archived tickets remain searchable and can be restored if needed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Agent Performance Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Track individual and team performance metrics including tickets handled, 
                average resolution time, satisfaction ratings, and SLA compliance rates.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tickets Closed', icon: CheckCircle2 },
                  { label: 'Avg. Resolution', icon: Clock },
                  { label: 'Satisfaction', icon: Star },
                  { label: 'SLA Compliance', icon: BarChart3 }
                ].map((metric) => (
                  <div key={metric.label} className="p-3 rounded-lg border bg-card text-center">
                    <metric.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                The Monitoring tab provides real-time visibility into Help Desk performance 
                with SLA metrics, satisfaction analytics, and trend analysis.
              </p>

              {/* SLA Metrics */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  SLA Metrics Dashboard
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-3">Response SLA</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        On-time first response rate
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Average first response time
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Breach count and patterns
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-3">Resolution SLA</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        On-time resolution rate
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Average resolution time
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Overdue ticket aging
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Satisfaction Analytics */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Satisfaction Analytics
                </h4>
                <div className="p-4 rounded-lg border bg-card">
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Survey response collection after ticket resolution</li>
                    <li>• Rating distribution (1-5 stars)</li>
                    <li>• Satisfaction trends over time</li>
                    <li>• Agent-specific satisfaction scores</li>
                    <li>• Category-based satisfaction breakdown</li>
                  </ul>
                </div>
              </div>

              <InfoCallout title="Breach Indicators">
                Tickets approaching SLA breach show amber warnings. Breached tickets display 
                red indicators with time-past-breach. Use filters to quickly identify and 
                prioritize at-risk tickets.
              </InfoCallout>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Category Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure ticket categories to organize incoming requests and enable 
                accurate routing and reporting.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Field</th>
                      <th className="text-left py-2 px-3 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 px-3 font-medium">Category Name</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        Display name shown to employees when submitting tickets
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Description</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        Help text to guide category selection
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Default Priority</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        Auto-assigned priority for new tickets in this category
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Auto-Assign To</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        Default agent or team for routing
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* SLA Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                SLA Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Define Service Level Agreements by priority to ensure timely responses 
                and resolutions.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Priority</th>
                      <th className="text-left py-2 px-3 font-medium">First Response</th>
                      <th className="text-left py-2 px-3 font-medium">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 px-3"><Badge variant="destructive">Critical</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">1 hour</td>
                      <td className="py-2 px-3 text-muted-foreground">4 hours</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3"><Badge className="bg-orange-500">High</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">4 hours</td>
                      <td className="py-2 px-3 text-muted-foreground">1 business day</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3"><Badge className="bg-yellow-500">Medium</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">8 hours</td>
                      <td className="py-2 px-3 text-muted-foreground">3 business days</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3"><Badge className="bg-blue-500">Low</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">24 hours</td>
                      <td className="py-2 px-3 text-muted-foreground">5 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <WarningCallout title="Business Hours">
                SLA timers only count during configured business hours. Ensure your 
                organization's working hours and holidays are correctly set in Organization Settings.
              </WarningCallout>
            </CardContent>
          </Card>

          {/* Canned Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Canned Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pre-written response templates to ensure consistent communication and 
                reduce response time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <h5 className="font-medium mb-2">Creating Templates</h5>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Navigate to Configuration → Canned Responses</li>
                    <li>Click "Add Response"</li>
                    <li>Enter title and category</li>
                    <li>Write response with variables</li>
                    <li>Save and activate</li>
                  </ol>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h5 className="font-medium mb-2">Best Practices</h5>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Use clear, professional language</li>
                    <li>Include relevant variables</li>
                    <li>Organize by category</li>
                    <li>Review and update quarterly</li>
                    <li>Test variable substitution</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escalation Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-primary" />
                Escalation Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Automatic escalation ensures urgent issues receive timely attention 
                when initial response targets are at risk.
              </p>
              <div className="p-4 rounded-lg border bg-muted/30">
                <h5 className="font-medium mb-3">Escalation Triggers</h5>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span><strong>Warning (75% SLA elapsed):</strong> Notify assigned agent and team lead</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span><strong>Breach:</strong> Escalate to manager, reassign if needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-700 mt-0.5" />
                    <span><strong>Critical Breach (2x SLA):</strong> Escalate to HR Director</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
