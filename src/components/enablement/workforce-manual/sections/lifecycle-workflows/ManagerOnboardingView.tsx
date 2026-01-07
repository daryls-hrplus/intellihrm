import { IntegrationReference } from '@/components/enablement/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Users, ClipboardCheck, MessageSquare, Calendar } from 'lucide-react';

export function ManagerOnboardingView() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        The Manager Self-Service (MSS) onboarding view enables managers to oversee their new team 
        members' integration progress, complete manager-specific tasks, and ensure successful team integration.
      </p>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Manager Impact:</strong> Research shows that manager involvement in onboarding 
          increases new hire engagement by 3.4x. MSS makes this involvement structured and trackable.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Manager Dashboard Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, title: 'Team Overview', desc: 'See all new hires and their progress' },
            { icon: ClipboardCheck, title: 'My Tasks', desc: 'Manager-assigned onboarding tasks' },
            { icon: MessageSquare, title: 'Check-ins', desc: 'Schedule and document 1-on-1s' },
            { icon: Calendar, title: 'Milestones', desc: 'Track 30-60-90 day milestones' }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 text-center">
              <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <h5 className="font-medium">{item.title}</h5>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Manager Responsibilities</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2 text-left">Phase</th>
                <th className="border p-2 text-left">Manager Tasks</th>
                <th className="border p-2 text-left">Expected Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">Pre-Start</td>
                <td className="border p-2">Team preparation</td>
                <td className="border p-2">Announce new hire, prepare workspace, assign buddy</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Day 1</td>
                <td className="border p-2">Welcome & orientation</td>
                <td className="border p-2">Team introduction, workspace tour, initial 1-on-1</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Week 1</td>
                <td className="border p-2">Role clarification</td>
                <td className="border p-2">Set initial expectations, explain team dynamics</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Day 30</td>
                <td className="border p-2">First check-in</td>
                <td className="border p-2">30-day review, feedback, address concerns</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Day 60</td>
                <td className="border p-2">Progress review</td>
                <td className="border p-2">Performance feedback, goal adjustment</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Day 90</td>
                <td className="border p-2">Probation review</td>
                <td className="border p-2">Formal evaluation, confirmation decision</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Progress Visibility</h4>
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="font-medium">Sarah Johnson</h5>
              <p className="text-sm text-muted-foreground">Software Developer • Started Jan 15, 2025</p>
            </div>
            <span className="text-sm text-muted-foreground">Day 22 of 90</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>68%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
            <div>
              <div className="font-medium text-green-600">12</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="font-medium text-blue-600">4</div>
              <div className="text-muted-foreground">In Progress</div>
            </div>
            <div>
              <div className="font-medium text-gray-600">6</div>
              <div className="text-muted-foreground">Pending</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Completing Manager Tasks</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Access MSS via <strong>My Team → Onboarding</strong></li>
          <li>Review list of new hires and their current status</li>
          <li>Click on employee to see detailed task breakdown</li>
          <li>Complete assigned manager tasks with notes/evidence</li>
          <li>Schedule and document required check-in meetings</li>
          <li>Escalate concerns to HR if employee is struggling</li>
        </ol>
      </div>

      <IntegrationReference
        title="Learning Objectives"
        items={[
          "Navigate the manager onboarding dashboard",
          "Complete manager-assigned onboarding tasks",
          "Monitor new hire progress and identify at-risk employees",
          "Document check-ins and milestone reviews"
        ]}
      />
    </div>
  );
}
