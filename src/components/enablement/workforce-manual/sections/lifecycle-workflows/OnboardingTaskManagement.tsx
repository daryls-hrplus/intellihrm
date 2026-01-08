import { 
  WarningCallout, 
  LearningObjectives, 
  ScreenshotPlaceholder 
} from '@/components/enablement/manual/components';
import { CheckCircle2, Clock, User, AlertTriangle } from 'lucide-react';

export function OnboardingTaskManagement() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Once an onboarding instance is initiated for an employee, tasks are distributed to the 
        appropriate stakeholders. Intelli HRM provides comprehensive task tracking, reminders, and 
        escalation to ensure timely completion.
      </p>

      <WarningCallout title="Critical">
        Overdue compliance tasks trigger automatic escalation to HR leadership. Ensure task 
        owners have proper notification settings enabled.
      </WarningCallout>

      <div className="space-y-4">
        <h4 className="font-semibold">Task Lifecycle</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { status: 'Pending', color: 'bg-gray-100 text-gray-800', icon: Clock },
            { status: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: User },
            { status: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
            { status: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
          ].map((item, idx) => (
            <div key={idx} className={`${item.color} px-3 py-2 rounded-lg flex items-center gap-2`}>
              <item.icon className="h-4 w-4" />
              <span className="font-medium">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Starting an Onboarding Instance</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to <strong>Workforce → Employee Onboarding → Active Onboarding</strong></li>
          <li>Click <strong>Start Onboarding</strong> button</li>
          <li>Select the employee from the dropdown</li>
          <li>Choose the appropriate onboarding template</li>
          <li>Set the start date (defaults to hire date)</li>
          <li>Click <strong>Start Onboarding</strong> to initiate</li>
          <li>Tasks are automatically created and assigned to respective owners</li>
          <li>Email notifications sent to all task owners</li>
        </ol>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.4a: Active onboarding instances list with progress tracking"
        alt="Onboarding dashboard showing employee cards with completion percentages"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Task Management Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium mb-2">Progress Tracking</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Visual progress bar per employee</li>
              <li>• Phase-based completion metrics</li>
              <li>• Overdue task highlighting</li>
              <li>• At-risk indicator for delayed items</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium mb-2">Notifications</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Task assignment alerts</li>
              <li>• Due date reminders (3, 1 day before)</li>
              <li>• Overdue escalations</li>
              <li>• Completion confirmations</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium mb-2">Task Dependencies</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Sequential task ordering</li>
              <li>• Prerequisite requirements</li>
              <li>• Automatic unlock on completion</li>
              <li>• Blocked task visibility</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium mb-2">Bulk Operations</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Mass task reassignment</li>
              <li>• Bulk date adjustments</li>
              <li>• Template modifications cascade</li>
              <li>• Export onboarding reports</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Completing Tasks</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2 text-left">Task Type</th>
                <th className="border p-2 text-left">Completion Method</th>
                <th className="border p-2 text-left">Evidence Required</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Document Upload</td>
                <td className="border p-2">Upload required file</td>
                <td className="border p-2">Attached document</td>
              </tr>
              <tr>
                <td className="border p-2">Acknowledgment</td>
                <td className="border p-2">Check confirmation box</td>
                <td className="border p-2">Timestamp + signature</td>
              </tr>
              <tr>
                <td className="border p-2">Training Course</td>
                <td className="border p-2">Complete linked LMS course</td>
                <td className="border p-2">Course completion record</td>
              </tr>
              <tr>
                <td className="border p-2">Manual Verification</td>
                <td className="border p-2">HR/Manager marks complete</td>
                <td className="border p-2">Verification notes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.4b: Task completion interface with evidence and verification options"
        alt="Task detail view showing completion methods and required documentation"
      />

      <LearningObjectives
        objectives={[
          "Initiate onboarding instances for new employees",
          "Monitor task progress and identify at-risk items",
          "Handle task escalations and reassignments",
          "Generate onboarding completion reports"
        ]}
      />
    </div>
  );
}
