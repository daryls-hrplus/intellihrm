import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Eye,
  Send,
  RefreshCw,
  BarChart3,
  Smartphone,
  ListChecks,
  Plus,
  Filter,
  Search,
  History,
  Play,
  Pause
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout,
  SuccessCallout 
} from '@/components/enablement/manual/components';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const notificationFlowDiagram = `flowchart TD
    A[Event Triggered] --> B{Rule Match?}
    B -->|No| C[No Action]
    B -->|Yes| D[Load Template]
    D --> E[Resolve Recipients]
    E --> F[Populate Variables]
    F --> G{Delivery Channel}
    G -->|Email| H[Send Email]
    G -->|In-App| I[Push Notification]
    G -->|SMS| J[Send SMS]
    H --> K{Delivered?}
    I --> L[Mark Read/Unread]
    J --> K
    K -->|Yes| M[Log Success]
    K -->|No| N{Retry < Max?}
    N -->|Yes| O[Schedule Retry]
    N -->|No| P[Log Failure]
    O --> G

    classDef startEnd fill:#10b981,stroke:#059669,color:#fff
    classDef process fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef decision fill:#f59e0b,stroke:#d97706,color:#fff
    classDef error fill:#ef4444,stroke:#dc2626,color:#fff
    
    class A,M,L startEnd
    class D,E,F,H,I,J,O process
    class B,G,K,N decision
    class C,P error`;

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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle>Notifications & Reminders</CardTitle>
                <Badge variant="outline" className="text-xs">Section 5.2</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>~15 min</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered automation rules, email templates, delivery tracking, and in-app alerts
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The Notifications & Reminders module provides a comprehensive system for proactive HR 
            communication. Configure automated reminders for document expirations, performance reviews, 
            compliance deadlines, and more. AI-powered rule creation simplifies setup while email 
            templates ensure consistent messaging.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-700 dark:text-purple-300">AI Dashboard</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time insights and intelligent recommendations
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Templates</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Pre-built email content with variable placeholders
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Automation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Event-triggered rules with configurable intervals
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Send className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Delivery</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Email and SMS tracking with retry capabilities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Dashboard Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Dashboard Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The AI Dashboard provides real-time visibility into your reminder system's health and 
            performance. It's always visible at the top of the Reminders page for quick access.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Active Rules
              </h5>
              <p className="text-sm text-muted-foreground">
                Count of currently active automation rules with quick navigation links
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending Reminders
              </h5>
              <p className="text-sm text-muted-foreground">
                Number of scheduled reminders waiting to be sent
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Recommendations
              </h5>
              <p className="text-sm text-muted-foreground">
                Suggested rule optimizations and coverage gaps detected
              </p>
            </div>
          </div>

          <SuccessCallout title="AI-Powered Insights">
            The dashboard analyzes your employee data and existing rules to suggest new automation 
            opportunities, such as upcoming document expirations not covered by current rules.
          </SuccessCallout>
        </CardContent>
      </Card>

      {/* Email Templates Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Email Templates Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Email templates provide consistent messaging for reminder notifications. Each template 
            supports variable placeholders that are automatically populated with employee and event data.
          </p>

          {/* Template Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold">Template Categories</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Document Expiry', color: 'blue', count: 5 },
                { name: 'Performance', color: 'green', count: 4 },
                { name: 'Compliance', color: 'amber', count: 3 },
                { name: 'Contracts', color: 'purple', count: 3 }
              ].map(cat => (
                <div key={cat.name} className="p-3 rounded-lg border bg-card text-center">
                  <Badge variant="secondary" className="mb-2">{cat.count}</Badge>
                  <p className="text-sm font-medium">{cat.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Variable Placeholders */}
          <div className="space-y-4">
            <h4 className="font-semibold">Variable Placeholders</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Placeholder</th>
                    <th className="text-left py-2 px-3 font-medium">Description</th>
                    <th className="text-left py-2 px-3 font-medium">Example Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">{'{employee_name}'}</code></td>
                    <td className="py-2 px-3 text-muted-foreground">Full name of employee</td>
                    <td className="py-2 px-3 text-muted-foreground">John Smith</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">{'{employee_first_name}'}</code></td>
                    <td className="py-2 px-3 text-muted-foreground">First name only</td>
                    <td className="py-2 px-3 text-muted-foreground">John</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">{'{event_date}'}</code></td>
                    <td className="py-2 px-3 text-muted-foreground">Date of the event</td>
                    <td className="py-2 px-3 text-muted-foreground">March 15, 2026</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">{'{days_until}'}</code></td>
                    <td className="py-2 px-3 text-muted-foreground">Days remaining</td>
                    <td className="py-2 px-3 text-muted-foreground">30</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">{'{document_type}'}</code></td>
                    <td className="py-2 px-3 text-muted-foreground">Type of document expiring</td>
                    <td className="py-2 px-3 text-muted-foreground">Passport</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">{'{manager_name}'}</code></td>
                    <td className="py-2 px-3 text-muted-foreground">Direct manager's name</td>
                    <td className="py-2 px-3 text-muted-foreground">Jane Doe</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><code className="text-xs bg-muted px-1 rounded">{'{company_name}'}</code></td>
                    <td className="py-2 px-3 text-muted-foreground">Organization name</td>
                    <td className="py-2 px-3 text-muted-foreground">Acme Corp</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Using Templates */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Using Templates
            </h4>
            <div className="p-4 rounded-lg border bg-muted/30">
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Navigate to Reminders → Templates tab</li>
                <li>Browse templates by category or search</li>
                <li>Click "Use Template" on the desired template</li>
                <li>System auto-navigates to rule creation with template pre-selected</li>
                <li>Complete the rule configuration and save</li>
              </ol>
            </div>
          </div>

          <TipCallout title="Custom Templates">
            While pre-built templates cover common scenarios, you can create custom templates 
            for organization-specific needs. Include all relevant placeholders for personalization.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Automation Rules Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Automation Rules Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Automation rules define when and how reminders are sent. Use AI-powered natural 
            language input for quick setup or manually configure each field.
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
              <div className="space-y-2">
                <div className="p-3 rounded bg-background border text-sm italic text-muted-foreground">
                  "Send a reminder to employees 30 days before their passport expires, 
                  and copy their manager"
                </div>
                <div className="p-3 rounded bg-background border text-sm italic text-muted-foreground">
                  "Remind managers 7 days before performance reviews are due with high priority"
                </div>
                <div className="p-3 rounded bg-background border text-sm italic text-muted-foreground">
                  "Alert HR 90, 60, and 30 days before work permits expire"
                </div>
              </div>
            </div>
            <SuccessCallout title="AI Suggestions">
              The AI interprets your description and pre-fills all rule fields. Review 
              and adjust as needed before saving. The AI also suggests additional rules 
              based on data patterns.
            </SuccessCallout>
          </div>

          {/* Notification Flow Diagram */}
          <WorkflowDiagram
            title="Notification Delivery Flow"
            description="This diagram illustrates how notifications are processed from event trigger through multi-channel delivery with retry logic."
            diagram={notificationFlowDiagram}
          />

          {/* Rule Fields Reference */}
          <div className="space-y-4">
            <h4 className="font-semibold">Rule Fields Reference</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Field</th>
                    <th className="text-left py-2 px-3 font-medium">Required</th>
                    <th className="text-left py-2 px-3 font-medium">Description</th>
                    <th className="text-left py-2 px-3 font-medium">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-3 font-medium">Rule Name</td>
                    <td className="py-2 px-3"><Badge>Required</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">Descriptive identifier</td>
                    <td className="py-2 px-3 text-muted-foreground">"Passport Expiry Warning"</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Description</td>
                    <td className="py-2 px-3"><Badge variant="outline">Optional</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">Purpose and scope</td>
                    <td className="py-2 px-3 text-muted-foreground">"Notifies about expiring travel documents"</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Event Type</td>
                    <td className="py-2 px-3"><Badge>Required</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">What triggers the reminder</td>
                    <td className="py-2 px-3 text-muted-foreground">Document Expiry - Passport</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Reminder Intervals</td>
                    <td className="py-2 px-3"><Badge>Required</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">Days before event (multiple)</td>
                    <td className="py-2 px-3 text-muted-foreground">90, 60, 30, 7 days</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Recipients</td>
                    <td className="py-2 px-3"><Badge>Required</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">Who receives notifications</td>
                    <td className="py-2 px-3 text-muted-foreground">Employee, Manager, HR</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Notification Method</td>
                    <td className="py-2 px-3"><Badge>Required</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">Delivery channel</td>
                    <td className="py-2 px-3 text-muted-foreground">In-App, Email, Both</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Priority</td>
                    <td className="py-2 px-3"><Badge variant="secondary">Default: Medium</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">Urgency level</td>
                    <td className="py-2 px-3 text-muted-foreground">Low, Medium, High, Critical</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Email Template</td>
                    <td className="py-2 px-3"><Badge variant="outline">Optional</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">Pre-defined email content</td>
                    <td className="py-2 px-3 text-muted-foreground">"Passport Expiry Notice"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rule Status */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Rule Activation
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
                <Play className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-300">Active</span>
              </div>
              <span className="text-muted-foreground">↔</span>
              <div className="flex items-center gap-2 p-3 rounded-lg border">
                <Pause className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Inactive</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Toggle rules on/off without deleting them. Inactive rules stop generating 
              new reminders but preserve configuration for future use.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Event Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Event Types Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Event types determine what triggers a reminder. Select the appropriate category 
            when creating automation rules.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Document Events
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Passport Expiry</li>
                <li>• Visa Expiry</li>
                <li>• Driver's License Expiry</li>
                <li>• Professional Certification Expiry</li>
                <li>• Work Permit Expiry</li>
                <li>• Medical Clearance Expiry</li>
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
                <li>• Mid-Year Check-in</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500" />
                Compliance Events
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Training Certification Due</li>
                <li>• Policy Acknowledgment Required</li>
                <li>• Background Check Renewal</li>
                <li>• Compliance Attestation Due</li>
                <li>• Safety Training Expiry</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Contract Events
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Probation End Date</li>
                <li>• Contract Renewal Due</li>
                <li>• Fixed-Term Contract End</li>
                <li>• Benefits Enrollment Window</li>
                <li>• Salary Review Due</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Queue Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Reminder Queue Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            The Reminder Queue shows all scheduled and completed reminders. Monitor upcoming 
            notifications and review delivery history.
          </p>

          {/* Queue Views */}
          <div className="space-y-4">
            <h4 className="font-semibold">Queue Views</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <h5 className="font-medium text-amber-700 dark:text-amber-300">Pending</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reminders scheduled to be sent. View upcoming notifications, their 
                  scheduled dates, and associated rules.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <h5 className="font-medium text-green-700 dark:text-green-300">Completed</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Historical log of sent reminders. Track when notifications were 
                  delivered and to whom.
                </p>
              </div>
            </div>
          </div>

          {/* Filtering */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtering Options
            </h4>
            <div className="flex flex-wrap gap-2">
              {['By Rule', 'By Event Type', 'By Employee', 'By Date Range', 'By Status'].map(filter => (
                <Badge key={filter} variant="outline">{filter}</Badge>
              ))}
            </div>
          </div>

          <InfoCallout title="Queue Processing">
            Reminders are processed automatically based on scheduled dates. The system 
            checks for pending reminders multiple times daily to ensure timely delivery.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Email Delivery Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Email Delivery Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Track the delivery status of all email notifications. Monitor successful 
            deliveries, identify failures, and retry when needed.
          </p>

          {/* Delivery Statuses */}
          <div className="space-y-4">
            <h4 className="font-semibold">Delivery Statuses</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-card text-center">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-sm font-medium">Delivered</p>
                <p className="text-xs text-muted-foreground">Successfully sent</p>
              </div>
              <div className="p-3 rounded-lg border bg-card text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                <p className="text-sm font-medium">Pending</p>
                <p className="text-xs text-muted-foreground">Awaiting delivery</p>
              </div>
              <div className="p-3 rounded-lg border bg-card text-center">
                <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                <p className="text-sm font-medium">Failed</p>
                <p className="text-xs text-muted-foreground">Delivery error</p>
              </div>
              <div className="p-3 rounded-lg border bg-card text-center">
                <RefreshCw className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-sm font-medium">Retrying</p>
                <p className="text-xs text-muted-foreground">Retry in progress</p>
              </div>
            </div>
          </div>

          {/* Retry Capabilities */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Failed Deliveries
            </h4>
            <p className="text-sm text-muted-foreground">
              Failed deliveries can be retried manually or automatically. The system 
              attempts up to 3 automatic retries before marking as permanently failed.
            </p>
            <div className="p-4 rounded-lg border bg-muted/30">
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Navigate to Reminders → Email Delivery tab</li>
                <li>Filter by "Failed" status</li>
                <li>Select the failed delivery record</li>
                <li>Click "Retry" to attempt redelivery</li>
                <li>Monitor status update</li>
              </ol>
            </div>
          </div>

          <WarningCallout title="Common Failure Reasons">
            Failed deliveries typically occur due to invalid email addresses, full 
            mailboxes, or spam filter rejections. Verify employee email addresses 
            in their profiles to prevent delivery issues.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            In-App Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            In-app notifications appear in the employee's notification bell in real-time. 
            They provide immediate visibility without requiring email access.
          </p>

          {/* Notification Log */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <History className="h-4 w-4" />
              Notification Log
            </h4>
            <p className="text-sm text-muted-foreground">
              View the complete history of in-app notifications sent through automation rules:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Column</th>
                    <th className="text-left py-2 px-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-3 font-medium">Recipient</td>
                    <td className="py-2 px-3 text-muted-foreground">Employee who received the notification</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Title</td>
                    <td className="py-2 px-3 text-muted-foreground">Notification headline</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Sent At</td>
                    <td className="py-2 px-3 text-muted-foreground">Date and time delivered</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Read Status</td>
                    <td className="py-2 px-3 text-muted-foreground">Whether employee has viewed it</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Source Rule</td>
                    <td className="py-2 px-3 text-muted-foreground">Automation rule that triggered it</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Priority Indicators */}
          <div className="space-y-4">
            <h4 className="font-semibold">Priority Indicators</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-card flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm">Low</span>
              </div>
              <div className="p-3 rounded-lg border bg-card flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Medium</span>
              </div>
              <div className="p-3 rounded-lg border bg-card flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">High</span>
              </div>
              <div className="p-3 rounded-lg border bg-card flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Critical</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              High and Critical priority notifications display prominently in the 
              notification panel with distinct visual indicators.
            </p>
          </div>

          <TipCallout title="Notification Preferences">
            Employees can configure their notification preferences in their profile settings. 
            Respect these preferences while ensuring critical compliance notifications 
            are always delivered.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Rule Design</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use multiple intervals (90, 60, 30, 7 days)</li>
                <li>• Include managers for accountability</li>
                <li>• Match priority to business impact</li>
                <li>• Name rules descriptively</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Template Content</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use personalization placeholders</li>
                <li>• Include clear action items</li>
                <li>• Add links to relevant resources</li>
                <li>• Keep messages concise</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Monitoring</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review AI dashboard weekly</li>
                <li>• Check delivery failures regularly</li>
                <li>• Act on AI recommendations</li>
                <li>• Audit rule effectiveness quarterly</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Compliance</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cover all expiring documents</li>
                <li>• Set up performance review reminders</li>
                <li>• Include training certification alerts</li>
                <li>• Don't forget contract renewals</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
