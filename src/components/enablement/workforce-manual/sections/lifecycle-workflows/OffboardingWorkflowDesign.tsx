import { LearningObjectives } from './LearningObjectives';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Key, Package, FileText, UserMinus } from 'lucide-react';

export function OffboardingWorkflowDesign() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Offboarding templates ensure consistent, compliant separation processes. HRplus supports 
        multiple templates for different separation types (resignation, termination, retirement, 
        contract end) with appropriate workflows for each.
      </p>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Compliance Critical:</strong> Offboarding workflows include access revocation, 
          asset recovery, and final pay calculations. Incomplete offboarding creates security 
          and legal risks.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Offboarding Template Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'Voluntary Resignation', desc: 'Standard notice period process', color: 'bg-blue-100 text-blue-800' },
            { type: 'Involuntary Termination', desc: 'Immediate separation process', color: 'bg-red-100 text-red-800' },
            { type: 'Retirement', desc: 'Extended transition process', color: 'bg-green-100 text-green-800' },
            { type: 'Contract End', desc: 'Scheduled separation process', color: 'bg-purple-100 text-purple-800' }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${item.color}`}>{item.type}</span>
              <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Standard Offboarding Checklist Categories</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Access & Security</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• System access revocation</li>
              <li>• Badge/keycard collection</li>
              <li>• Password resets</li>
              <li>• Email forwarding setup</li>
              <li>• VPN/remote access removal</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Asset Recovery</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Laptop/equipment return</li>
              <li>• Company phone</li>
              <li>• Company vehicle</li>
              <li>• Credit cards</li>
              <li>• Keys and access devices</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Documentation</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Resignation letter (if voluntary)</li>
              <li>• Exit interview completion</li>
              <li>• Non-compete acknowledgment</li>
              <li>• Benefits continuation forms</li>
              <li>• Final pay confirmation</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserMinus className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Knowledge Transfer</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Project handover documentation</li>
              <li>• Client/contact transition</li>
              <li>• Pending work status</li>
              <li>• Training of replacement</li>
              <li>• Access to files/folders</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Creating an Offboarding Template</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to <strong>Workforce → Offboarding → Templates</strong></li>
          <li>Click <strong>Create Template</strong></li>
          <li>Select separation type (resignation, termination, etc.)</li>
          <li>Choose target company or make it global</li>
          <li>Define standard notice period duration</li>
          <li>Add clearance tasks with owners (HR, IT, Manager, Finance)</li>
          <li>Set dependencies (e.g., asset return before final pay)</li>
          <li>Configure escalation rules for overdue items</li>
          <li>Activate template when ready</li>
        </ol>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Task Timeline Example</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2 text-left">Day Offset</th>
                <th className="border p-2 text-left">Task</th>
                <th className="border p-2 text-left">Owner</th>
                <th className="border p-2 text-left">Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Day 0</td>
                <td className="border p-2">Record resignation/termination</td>
                <td className="border p-2">HR</td>
                <td className="border p-2">Critical</td>
              </tr>
              <tr>
                <td className="border p-2">Day 1</td>
                <td className="border p-2">Schedule exit interview</td>
                <td className="border p-2">HR</td>
                <td className="border p-2">High</td>
              </tr>
              <tr>
                <td className="border p-2">Last Week</td>
                <td className="border p-2">Knowledge transfer complete</td>
                <td className="border p-2">Manager</td>
                <td className="border p-2">High</td>
              </tr>
              <tr>
                <td className="border p-2">Last Day</td>
                <td className="border p-2">Asset return & clearance</td>
                <td className="border p-2">IT/Facilities</td>
                <td className="border p-2">Critical</td>
              </tr>
              <tr>
                <td className="border p-2">Last Day</td>
                <td className="border p-2">Access revocation</td>
                <td className="border p-2">IT</td>
                <td className="border p-2">Critical</td>
              </tr>
              <tr>
                <td className="border p-2">Last Day +1</td>
                <td className="border p-2">Final pay processing</td>
                <td className="border p-2">Payroll</td>
                <td className="border p-2">Critical</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <LearningObjectives
        items={[
          "Create offboarding templates by separation type",
          "Configure clearance checklists with appropriate owners",
          "Set up access revocation and asset recovery workflows",
          "Understand legal and compliance requirements"
        ]}
      />
    </div>
  );
}
