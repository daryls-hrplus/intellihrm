import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  Clock, 
  Plus,
  Users,
  Calendar,
  RefreshCw,
  Filter,
  AlertCircle,
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  Building2,
  MessageSquare,
  Bell
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout 
} from '@/components/enablement/manual/components';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const taskFlowDiagram = `flowchart TD
    subgraph Recurring["Recurring Task Generation"]
        R1[Recurring Rule Active] --> R2{Schedule Triggered?}
        R2 -->|Yes| R3[Generate New Task]
        R3 --> A
        R2 -->|No| R1
    end
    
    A[Task Created] --> B[To Do]
    B --> C{Work Started?}
    C -->|Yes| D[In Progress]
    C -->|No| E{Overdue?}
    E -->|Yes| F[Overdue Alert]
    F --> C
    E -->|No| C
    D --> G{Completed?}
    G -->|No| D
    G -->|Yes| H[Completed]
    H --> I[Log Completion Time]

    classDef recurring fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef todo fill:#64748b,stroke:#475569,color:#fff
    classDef inProgress fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef completed fill:#10b981,stroke:#059669,color:#fff
    classDef alert fill:#f59e0b,stroke:#d97706,color:#fff
    classDef decision fill:#f59e0b,stroke:#d97706,color:#fff
    
    class R1,R2,R3 recurring
    class A,B todo
    class D inProgress
    class H,I completed
    class F alert
    class C,E,G decision`;

export function HRTasksSetup() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle>HR Tasks</CardTitle>
                <Badge variant="outline" className="text-xs">Section 6.3</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>~10 min</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Centralized HR department task management and collaboration
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            HR Tasks provides a centralized workspace for managing department workload, 
            tracking assignments, and ensuring nothing falls through the cracks. Tasks can 
            be one-time or recurring, assigned to team members, and tracked through completion.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Create</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Quick task creation with details
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Assign</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Delegate to team members
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Recurring</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automate repeating tasks
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-700 dark:text-purple-300">Track</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor progress and completion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Task Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                  <th className="text-left py-2 px-3 font-medium">Required</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-medium">Title</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Clear, action-oriented task name
                  </td>
                  <td className="py-2 px-3"><Badge variant="default">Yes</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Description</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Detailed instructions, context, or requirements
                  </td>
                  <td className="py-2 px-3"><Badge variant="outline">No</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Priority</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Low, Medium, High, or Urgent
                  </td>
                  <td className="py-2 px-3"><Badge variant="default">Yes</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Status</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    To Do, In Progress, or Completed
                  </td>
                  <td className="py-2 px-3"><Badge variant="default">Yes</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Due Date</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Target completion date
                  </td>
                  <td className="py-2 px-3"><Badge variant="outline">No</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Assignee</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Team member responsible for task
                  </td>
                  <td className="py-2 px-3"><Badge variant="outline">No</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Company</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Associated company (for multi-entity)
                  </td>
                  <td className="py-2 px-3"><Badge variant="outline">No</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Priority Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Priority Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500">Low</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                No immediate deadline. Complete when time permits.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-500">Medium</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Standard priority. Complete within normal workflow.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-500">High</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Important deadline approaching. Prioritize completion.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Critical. Requires immediate attention today.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-primary" />
            Status Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 mb-2 inline-block">
                <Circle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">To Do</p>
            </div>
            <ArrowUpCircle className="h-5 w-5 text-muted-foreground rotate-90" />
            <div className="text-center">
              <div className="p-3 rounded-full bg-blue-200 dark:bg-blue-900 mb-2 inline-block">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium">In Progress</p>
            </div>
            <ArrowUpCircle className="h-5 w-5 text-muted-foreground rotate-90" />
            <div className="text-center">
              <div className="p-3 rounded-full bg-green-200 dark:bg-green-900 mb-2 inline-block">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium">Completed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">To Do</h5>
              <p className="text-sm text-muted-foreground">
                Task created but work has not started. Visible in task queue for pickup.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">In Progress</h5>
              <p className="text-sm text-muted-foreground">
                Work is actively being done. Indicates task is being handled.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Completed</h5>
              <p className="text-sm text-muted-foreground">
                Task finished. Logged with completion timestamp for audit.
              </p>
            </div>
          </div>

          {/* Task Flow Diagram */}
          <WorkflowDiagram
            title="Task Status Flow with Recurring Generation"
            description="This diagram shows task states, transitions, and how recurring tasks are automatically generated based on schedule rules."
            diagram={taskFlowDiagram}
          />
        </CardContent>
      </Card>

      {/* Recurring Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Recurring Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set up recurring tasks for regular HR activities. The system automatically 
            creates new task instances based on the configured schedule.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Frequency</th>
                  <th className="text-left py-2 px-3 font-medium">Example Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-medium">Daily</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Review pending leave requests, check attendance exceptions
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Weekly</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Team status meeting prep, timesheet review
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Biweekly</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Payroll preparation, benefits reconciliation
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Monthly</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    HR metrics report, compliance checklist
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Quarterly</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Performance review reminders, training compliance audit
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Yearly</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Annual leave balance reset, policy review cycle
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <TipCallout title="Recurring Task Best Practice">
            Set up recurring tasks for predictable HR activities like payroll prep, 
            compliance checks, and report generation. This ensures nothing is forgotten 
            and work is evenly distributed.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtering & Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use filters to focus on relevant tasks and manage your workload effectively:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Circle className="h-4 w-4" />
                By Status
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• To Do</li>
                <li>• In Progress</li>
                <li>• Completed</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                By Priority
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Low</li>
                <li>• Medium</li>
                <li>• High</li>
                <li>• Urgent</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                By Assignee
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• My Tasks</li>
                <li>• Unassigned</li>
                <li>• Specific team member</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                By Company
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All companies</li>
                <li>• Specific entity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Complete Task
              </h5>
              <p className="text-sm text-muted-foreground">
                Click the checkmark to mark a task complete. Adds completion timestamp 
                and moves to completed status.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-500" />
                Edit Task
              </h5>
              <p className="text-sm text-muted-foreground">
                Update title, description, priority, due date, or reassign to 
                another team member.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                Reassign
              </h5>
              <p className="text-sm text-muted-foreground">
                Transfer task ownership to a different team member. Previous 
                assignee notified of change.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                Delete Task
              </h5>
              <p className="text-sm text-muted-foreground">
                Remove task permanently. Use for duplicate or cancelled tasks.
                Requires confirmation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Details View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Task Detail View
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click on any task to open the detail view with additional options:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Comments & Collaboration</h5>
              <p className="text-sm text-muted-foreground">
                Add notes, updates, or questions for team visibility. Comments are 
                timestamped with author name.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Activity Log</h5>
              <p className="text-sm text-muted-foreground">
                View full history: creation, status changes, assignments, and 
                edits with timestamps.
              </p>
            </div>
          </div>

          <InfoCallout title="Multi-Entity Support">
            In multi-company environments, use the company filter to focus on tasks 
            for a specific entity. Tasks can be tagged to companies for accurate 
            workload tracking per entity.
          </InfoCallout>
        </CardContent>
      </Card>
    </div>
  );
}
