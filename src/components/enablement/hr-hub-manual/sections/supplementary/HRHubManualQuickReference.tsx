import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, BookOpen, Workflow, MessageSquare, Calendar, BarChart3,
  ArrowRight, CheckCircle2, Clock, AlertCircle, Info
} from 'lucide-react';

interface QuickRefItem {
  action: string;
  steps: string[];
  notes?: string;
}

interface QuickRefCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: QuickRefItem[];
}

const QUICK_REF_CATEGORIES: QuickRefCategory[] = [
  {
    id: 'helpdesk',
    title: 'Help Desk Operations',
    icon: <HelpCircle className="h-4 w-4" />,
    items: [
      {
        action: 'Create New Ticket',
        steps: ['HR Hub → Help Desk', 'Click "New Ticket"', 'Select category & priority', 'Enter subject & description', 'Assign agent (optional)', 'Click "Create"'],
        notes: 'Tickets auto-assign if category has default agent configured'
      },
      {
        action: 'Add Canned Response',
        steps: ['HR Hub → Help Desk → Settings', 'Click "Canned Responses"', 'Click "Add Response"', 'Enter title & response text', 'Select applicable categories', 'Save'],
        notes: 'Use {{name}} for dynamic placeholders'
      },
      {
        action: 'View SLA Dashboard',
        steps: ['HR Hub → Help Desk', 'Click "SLA Dashboard" tab', 'Review metrics by priority', 'Drill down into breached tickets'],
      },
      {
        action: 'Escalate Ticket',
        steps: ['Open ticket details', 'Click "Escalate"', 'Select escalation level', 'Add escalation reason', 'Confirm'],
        notes: 'Escalation notifies next-level support automatically'
      },
      {
        action: 'Export Ticket Report',
        steps: ['HR Hub → Help Desk → Reports', 'Select date range', 'Choose columns to include', 'Click "Export CSV" or "Export PDF"'],
      }
    ]
  },
  {
    id: 'knowledge',
    title: 'Knowledge & SOPs',
    icon: <BookOpen className="h-4 w-4" />,
    items: [
      {
        action: 'Create Knowledge Article',
        steps: ['HR Hub → Knowledge Base', 'Click "New Article"', 'Select category', 'Enter title & content', 'Add tags for searchability', 'Set visibility (All/Managers/HR)', 'Publish or Save Draft'],
      },
      {
        action: 'Manage Article Categories',
        steps: ['HR Hub → Knowledge Base → Settings', 'Click "Categories"', 'Add/Edit/Reorder categories', 'Set category permissions', 'Save changes'],
      },
      {
        action: 'Generate SOP with AI',
        steps: ['HR Hub → SOPs', 'Click "Generate with AI"', 'Enter process description', 'Provide context & examples', 'Review generated content', 'Edit as needed', 'Publish'],
        notes: 'AI uses organizational patterns for consistency'
      },
      {
        action: 'Track Acknowledgments',
        steps: ['Open SOP or Policy', 'Click "Acknowledgments" tab', 'View completion status', 'Send reminders to pending', 'Export acknowledgment report'],
      },
      {
        action: 'Create New Version',
        steps: ['Open existing SOP/Article', 'Click "Edit"', 'Make changes', 'Click "Save as New Version"', 'Add version notes', 'Publish'],
        notes: 'Previous versions remain accessible in history'
      }
    ]
  },
  {
    id: 'workflow',
    title: 'Workflow Management',
    icon: <Workflow className="h-4 w-4" />,
    items: [
      {
        action: 'Create Workflow Template',
        steps: ['HR Hub → Workflows', 'Click "New Template"', 'Name the workflow', 'Add approval steps', 'Configure conditions', 'Set notifications', 'Activate'],
      },
      {
        action: 'Configure Approval Policy',
        steps: ['HR Hub → Workflows → Policies', 'Click "New Policy"', 'Select trigger type', 'Define conditions (amount, dept, etc.)', 'Assign approvers', 'Set SLA timeframes', 'Enable'],
      },
      {
        action: 'Set Up Delegation',
        steps: ['HR Hub → Workflows → Delegations', 'Click "Add Delegation"', 'Select delegator', 'Select delegate', 'Set date range', 'Choose scope (all/specific)', 'Save'],
        notes: 'Delegator receives notification copies'
      },
      {
        action: 'Monitor Pending Approvals',
        steps: ['HR Hub → Approvals Dashboard', 'Filter by status/type', 'View aging requests', 'Send reminders', 'Escalate if needed'],
      },
      {
        action: 'View Workflow History',
        steps: ['Open any approved/rejected item', 'Click "History" tab', 'Review all approval steps', 'See timestamps & comments', 'Export audit trail'],
      }
    ]
  },
  {
    id: 'communication',
    title: 'Communications',
    icon: <MessageSquare className="h-4 w-4" />,
    items: [
      {
        action: 'Post Announcement',
        steps: ['HR Hub → Announcements', 'Click "New Announcement"', 'Enter title & content', 'Select audience (All/Dept/Location)', 'Enable acknowledgment if needed', 'Set publish date', 'Publish'],
      },
      {
        action: 'Schedule Notification',
        steps: ['HR Hub → Notifications', 'Click "Schedule"', 'Select template', 'Choose recipients', 'Set send date/time', 'Preview', 'Confirm'],
      },
      {
        action: 'Configure Reminder Rule',
        steps: ['HR Hub → Reminders', 'Click "New Rule"', 'Select trigger event', 'Set timing (X days before/after)', 'Choose notification channels', 'Define recipient rules', 'Activate'],
        notes: 'Common triggers: probation end, contract expiry, birthday'
      },
      {
        action: 'Manage Photo Gallery',
        steps: ['HR Hub → Gallery', 'Click "New Album"', 'Name album & add description', 'Upload photos', 'Set visibility', 'Publish'],
      },
      {
        action: 'Publish Blog Post',
        steps: ['HR Hub → Blog', 'Click "New Post"', 'Enter title & content', 'Add featured image', 'Select category', 'Preview', 'Publish or Schedule'],
      }
    ]
  },
  {
    id: 'operations',
    title: 'Daily Operations',
    icon: <Calendar className="h-4 w-4" />,
    items: [
      {
        action: 'Create HR Task',
        steps: ['HR Hub → Tasks', 'Click "New Task"', 'Enter title & description', 'Assign to team member', 'Set due date & priority', 'Add to project (optional)', 'Save'],
      },
      {
        action: 'Set Up Recurring Task',
        steps: ['Create new task', 'Enable "Recurring"', 'Set frequency (daily/weekly/monthly)', 'Define end condition', 'Save'],
        notes: 'New instances auto-create based on schedule'
      },
      {
        action: 'Add Calendar Event',
        steps: ['HR Hub → Calendar', 'Click on date or "New Event"', 'Enter event details', 'Set time & duration', 'Add attendees', 'Set reminders', 'Save'],
      },
      {
        action: 'View Upcoming Milestones',
        steps: ['HR Hub → Milestones', 'Select milestone type filter', 'Choose date range', 'Review upcoming dates', 'Configure notifications'],
      },
      {
        action: 'Process ESS Request',
        steps: ['HR Hub → ESS Requests', 'Open pending request', 'Review requested changes', 'Check supporting documents', 'Approve/Reject with comments', 'Submit decision'],
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reporting',
    icon: <BarChart3 className="h-4 w-4" />,
    items: [
      {
        action: 'View Sentiment Dashboard',
        steps: ['HR Hub → Analytics → Sentiment', 'Review overall score', 'Analyze trends over time', 'Drill into department scores', 'Identify focus areas'],
      },
      {
        action: 'Configure Pulse Survey',
        steps: ['HR Hub → Surveys', 'Click "New Pulse Survey"', 'Select question template', 'Define audience', 'Set frequency', 'Configure anonymity', 'Launch'],
      },
      {
        action: 'Access Recognition Leaderboard',
        steps: ['HR Hub → Recognition', 'Click "Leaderboard"', 'Select time period', 'Filter by department', 'View top recognized employees'],
      },
      {
        action: 'Schedule Automated Report',
        steps: ['HR Hub → Reports', 'Select report type', 'Configure filters', 'Click "Schedule"', 'Set frequency & recipients', 'Choose format (PDF/Excel)', 'Activate'],
      },
      {
        action: 'Export Data',
        steps: ['Navigate to any data view', 'Apply desired filters', 'Click "Export"', 'Select format', 'Choose columns', 'Download'],
      }
    ]
  }
];

const STATUS_INDICATORS = [
  { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, label: 'Active / Completed', description: 'Item is active or task is complete' },
  { icon: <Clock className="h-4 w-4 text-amber-500" />, label: 'Pending / In Progress', description: 'Awaiting action or currently processing' },
  { icon: <AlertCircle className="h-4 w-4 text-red-500" />, label: 'Attention Required', description: 'Action needed or error state' },
  { icon: <Info className="h-4 w-4 text-blue-500" />, label: 'Information', description: 'Additional context available' },
];

export const HRHubManualQuickReference = () => {
  const [activeTab, setActiveTab] = useState('helpdesk');

  return (
    <div className="space-y-6">
      <div data-manual-anchor="quick-ref" id="quick-ref">
        <h2 className="text-2xl font-bold mb-4">Quick Reference Cards</h2>
        <p className="text-muted-foreground mb-6">
          Step-by-step guides for common HR Hub administrative tasks.
          Select a category to view available quick reference cards.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
          {QUICK_REF_CATEGORIES.map(cat => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="flex items-center gap-2">
                {cat.icon}
                {cat.title}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {QUICK_REF_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {category.items.map((item, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {category.icon}
                      {item.action}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {item.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start gap-2 text-sm">
                          <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs shrink-0">
                            {stepIdx + 1}
                          </Badge>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                    {item.notes && (
                      <div className="mt-3 flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                        <Info className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{item.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Status Indicators Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATUS_INDICATORS.map((indicator, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {indicator.icon}
                <div>
                  <p className="text-sm font-medium">{indicator.label}</p>
                  <p className="text-xs text-muted-foreground">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Task Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Set Up New Help Desk Category</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Settings</span>
                <ArrowRight className="h-3 w-3" />
                <span>Categories</span>
                <ArrowRight className="h-3 w-3" />
                <span>Add</span>
                <ArrowRight className="h-3 w-3" />
                <span>Assign Agents</span>
                <ArrowRight className="h-3 w-3" />
                <span>Set SLA</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Create ESS Approval Policy</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Workflows</span>
                <ArrowRight className="h-3 w-3" />
                <span>ESS Policies</span>
                <ArrowRight className="h-3 w-3" />
                <span>New</span>
                <ArrowRight className="h-3 w-3" />
                <span>Set Risk</span>
                <ArrowRight className="h-3 w-3" />
                <span>Assign</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Configure Milestone Notifications</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Milestones</span>
                <ArrowRight className="h-3 w-3" />
                <span>Settings</span>
                <ArrowRight className="h-3 w-3" />
                <span>Notifications</span>
                <ArrowRight className="h-3 w-3" />
                <span>Template</span>
                <ArrowRight className="h-3 w-3" />
                <span>Timing</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Set Up Compliance Tracking</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Compliance</span>
                <ArrowRight className="h-3 w-3" />
                <span>Items</span>
                <ArrowRight className="h-3 w-3" />
                <span>Add</span>
                <ArrowRight className="h-3 w-3" />
                <span>Deadlines</span>
                <ArrowRight className="h-3 w-3" />
                <span>Alerts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
