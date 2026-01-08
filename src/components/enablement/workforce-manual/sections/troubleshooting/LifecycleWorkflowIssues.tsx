import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Clock, AlertTriangle, CheckCircle, Lightbulb, RotateCcw } from 'lucide-react';
import { TroubleshootingSection } from '@/components/enablement/manual/components/TroubleshootingSection';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const lifecycleIssues = [
  {
    issue: 'Onboarding workflow stuck in pending status',
    cause: 'Assigned approver is inactive, on leave, or has been terminated. Alternatively, a required task has no assignee.',
    solution: 'Navigate to Workflows → Pending and locate the workflow. Check the current step\'s assigned approver. Use "Reassign Task" to assign to an active user, or enable delegation for the approver\'s role.'
  },
  {
    issue: 'Offboarding clearance tasks not completing',
    cause: 'One or more department clearance tasks assigned to inactive users, or external system (IT, Finance) integration timeout.',
    solution: 'Open the offboarding case and review the Clearance Checklist. Identify stuck tasks and reassign to active department heads. For integration tasks, check Integration Hub for connection status.'
  },
  {
    issue: 'Rehire data not loading correctly from previous employment',
    cause: 'Previous employment record was archived or merged, or rehire rules are not configured to import historical data.',
    solution: 'Verify the rehire rules in Settings → Lifecycle → Rehire Configuration. Enable "Import Previous Employment Data". If archived, restore the previous record before initiating rehire.'
  },
  {
    issue: 'Exit interview not triggering automatically',
    cause: 'Exit interview workflow trigger not configured for the termination reason used, or employee email is invalid.',
    solution: 'Check Settings → Lifecycle → Exit Interview. Verify the trigger conditions include the termination reason. Ensure the employee has a valid email for survey delivery.'
  },
  {
    issue: 'Manager onboarding tasks not appearing in dashboard',
    cause: 'Manager not linked to the new hire\'s position, or notification preferences disabled for workflow tasks.',
    solution: 'Verify the new hire\'s position has the manager\'s position as "Reports To". Check the manager\'s notification settings to ensure workflow tasks are enabled.'
  },
  {
    issue: 'Probation period not calculating correctly',
    cause: 'Probation rules configured at wrong level (job vs entity), or start date entered incorrectly.',
    solution: 'Review probation settings in Settings → Lifecycle → Probation. Probation length should be defined at the job level or entity level. Verify the employee\'s start date is correct.'
  },
  {
    issue: 'Transfer workflow showing position availability error',
    cause: 'Target position is at full headcount, or has a future-dated termination blocking availability.',
    solution: 'Check the target position\'s current headcount vs. budgeted headcount. If at capacity, either increase budgeted headcount or wait for planned vacancy.'
  },
  {
    issue: 'Promotion effective date cannot be set to past date',
    cause: 'System is configured to prevent backdated transactions, or pay period is already closed.',
    solution: 'For legitimate backdated promotions, request admin override (requires audit justification). If pay period closed, work with Payroll to process adjustment separately.'
  }
];

const workflowStatusCodes = [
  { code: 'INIT', meaning: 'Workflow initiated, awaiting first action', action: 'Complete first task to progress' },
  { code: 'PEND', meaning: 'Waiting for approver action', action: 'Notify approver or reassign if delayed' },
  { code: 'HOLD', meaning: 'Manually paused by administrator', action: 'Resume workflow when ready' },
  { code: 'ESCD', meaning: 'Escalated to next approval level', action: 'Higher-level approver must act' },
  { code: 'REJT', meaning: 'Rejected, requires initiator revision', action: 'Edit and resubmit or withdraw' },
  { code: 'COMP', meaning: 'All tasks complete, workflow finished', action: 'None - archived automatically' },
  { code: 'CANC', meaning: 'Cancelled by initiator or admin', action: 'Cannot be resumed; start new workflow' },
  { code: 'EXPR', meaning: 'Expired due to timeout threshold', action: 'Restart workflow or extend deadline' }
];

export function LifecycleWorkflowIssues() {
  return (
    <div className="space-y-6" data-manual-anchor="wf-troubleshooting-lifecycle">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <UserPlus className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>10.3 Lifecycle Workflow Issues</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Resolving stalled onboarding, incomplete offboarding, and workflow processing problems
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">HR Ops</Badge>
            <Badge variant="outline">Est. 10 min</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <TroubleshootingSection 
            items={lifecycleIssues}
            title="Lifecycle Workflow Troubleshooting Guide"
          />

          {/* Workflow Status Codes */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-500" />
              Workflow Status Codes Reference
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium w-20">Code</th>
                    <th className="text-left p-3 font-medium">Meaning</th>
                    <th className="text-left p-3 font-medium">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {workflowStatusCodes.map((status) => (
                    <tr key={status.code}>
                      <td className="p-3">
                        <code className="px-2 py-1 bg-muted rounded text-xs font-mono">{status.code}</code>
                      </td>
                      <td className="p-3 text-muted-foreground">{status.meaning}</td>
                      <td className="p-3">{status.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Escalation Steps */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Escalation Steps for Stalled Workflows
            </h4>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Identify the Blocker', desc: 'Open the workflow and review the current pending task. Note the assigned approver and how long the task has been pending.' },
                { step: '2', title: 'Check Approver Availability', desc: 'Verify the approver is active in the system. Check their out-of-office status and delegation settings.' },
                { step: '3', title: 'Attempt Reassignment', desc: 'If approver is unavailable, use the Reassign function to move the task to their backup or manager.' },
                { step: '4', title: 'Apply Admin Override', desc: 'For critical workflows (>5 days pending), HR Admin can use the Override function with documented justification.' },
                { step: '5', title: 'Document & Communicate', desc: 'Record the intervention in workflow notes and notify affected parties of the resolution.' }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold">
                    {item.step}
                  </div>
                  <div>
                    <span className="font-medium text-sm">{item.title}</span>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-900 dark:text-blue-100">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              Quick Recovery Actions
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>Restart Workflow:</strong> Cancels current instance and creates new with same data</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>Skip Task:</strong> Bypasses single task (admin only, requires justification)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>Force Complete:</strong> Marks workflow done regardless of pending tasks (emergency only)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>Rollback:</strong> Reverts workflow to previous step for re-processing</span>
              </div>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Configure automatic escalation rules for workflows pending more than 3 days. 
              Navigate to Settings → Workflows → Escalation Rules to set up time-based escalations that 
              automatically notify managers or reassign tasks.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            caption="Figure 10.3: Workflow Monitor showing pending workflows with age indicators and escalation status"
          />

        </CardContent>
      </Card>
    </div>
  );
}
