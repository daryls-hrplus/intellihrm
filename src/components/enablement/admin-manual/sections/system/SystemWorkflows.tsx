import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Workflow, Users, Clock, GitBranch, CheckCircle, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const WORKFLOW_TYPES = [
  { type: "Leave Approval", steps: "2-4", description: "Configurable approval chain based on leave type and duration" },
  { type: "Expense Approval", steps: "2-3", description: "Amount-based routing with budget owner approval" },
  { type: "Job Requisition", steps: "3-5", description: "HR, Finance, and hiring manager approval chain" },
  { type: "Offer Approval", steps: "2-4", description: "Compensation review with HR and executive sign-off" },
  { type: "Performance Review", steps: "3-4", description: "Self → Manager → Calibration → HR review" },
  { type: "Termination", steps: "3-5", description: "Multi-level approval with legal and compliance checks" },
  { type: "Data Change Request", steps: "1-2", description: "Self-service changes requiring HR verification" },
];

const ROUTING_CONDITIONS = [
  "Department/Division hierarchy",
  "Request amount thresholds",
  "Employee grade or level",
  "Leave type or duration",
  "Geographic location",
  "Cost center ownership",
  "Custom field values"
];

export function SystemWorkflows() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configure approval workflows that route requests through the appropriate chain of approvers. 
        Workflows can be customized based on request type, amount, employee attributes, and organizational structure.
      </p>

      {/* Available Workflows */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Workflow className="h-4 w-4 text-blue-500" />
          Standard Workflow Types
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Workflow Type</th>
                <th className="text-left p-3 font-medium">Steps</th>
                <th className="text-left p-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {WORKFLOW_TYPES.map((wf, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">{wf.type}</td>
                  <td className="p-3">
                    <Badge variant="outline">{wf.steps}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{wf.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.10.1: Workflow designer with drag-and-drop step configuration"
        alt="Visual workflow builder showing approval steps, conditions, and routing rules"
      />

      {/* Routing Configuration */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-purple-500" />
          Routing Conditions
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-3">Available Routing Criteria</h5>
            <ul className="text-sm space-y-2 text-muted-foreground">
              {ROUTING_CONDITIONS.map((condition, index) => (
                <li key={index}>• {condition}</li>
              ))}
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-3">Routing Logic</h5>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• AND/OR condition combinations</li>
              <li>• Threshold-based branching</li>
              <li>• Parallel approval paths</li>
              <li>• Skip conditions (auto-approve)</li>
              <li>• Escalation on timeout</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Approver Configuration */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-green-500" />
          Approver Configuration
        </h4>
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-2">Approver Types</h5>
            <div className="grid gap-3 md:grid-cols-3 mt-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="font-medium text-sm">Direct Manager</p>
                <p className="text-xs text-muted-foreground">Based on reporting line</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="font-medium text-sm">Role-Based</p>
                <p className="text-xs text-muted-foreground">Anyone with specified role</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="font-medium text-sm">Specific User</p>
                <p className="text-xs text-muted-foreground">Named individual approver</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="font-medium text-sm">Department Head</p>
                <p className="text-xs text-muted-foreground">Based on org structure</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="font-medium text-sm">Cost Center Owner</p>
                <p className="text-xs text-muted-foreground">Based on budget ownership</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="font-medium text-sm">Dynamic Rule</p>
                <p className="text-xs text-muted-foreground">Custom logic-based assignment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.10.2: Approver assignment configuration with delegation settings"
        alt="Approver configuration panel showing role selection, delegation, and backup approvers"
      />

      {/* Timeout & Escalation */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Timeout & Escalation Rules
        </h4>
        <div className="border rounded-lg p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-medium text-sm mb-2">Reminder Settings</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• First reminder after X hours/days</li>
                <li>• Repeat reminders at intervals</li>
                <li>• Include pending count in reminder</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-sm mb-2">Escalation Actions</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Escalate to manager's manager</li>
                <li>• Reassign to backup approver</li>
                <li>• Auto-approve (with conditions)</li>
                <li>• Notify HR/Admin</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.10.3: Escalation rules configuration with timing and notification options"
        alt="Escalation settings panel showing timeout thresholds and escalation actions"
      />

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Changes to active workflows will only affect new requests. 
          Existing in-progress requests will continue using the workflow version from when they were submitted.
        </AlertDescription>
      </Alert>
    </div>
  );
}
