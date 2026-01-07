import { 
  TipCallout, 
  LearningObjectives, 
  ScreenshotPlaceholder 
} from '@/components/enablement/manual/components';
import { Settings } from 'lucide-react';

export function OnboardingWorkflowDesign() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Onboarding templates define the structured process for integrating new employees. HRplus supports 
        multiple templates per company, job family, or role type, enabling tailored experiences while 
        maintaining compliance and consistency.
      </p>

      <TipCallout title="Best Practice">
        Create role-specific templates (Executive, Professional, Field Worker) rather than 
        one-size-fits-all to improve relevance and completion rates.
      </TipCallout>

      <div className="space-y-4">
        <h4 className="font-semibold">Template Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Template Properties</h5>
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• <strong>Name:</strong> Descriptive template name</li>
              <li>• <strong>Company:</strong> Company-specific or global template</li>
              <li>• <strong>Job Family:</strong> Optional job family linkage</li>
              <li>• <strong>Duration:</strong> Default 30/60/90 day timeline</li>
              <li>• <strong>Start Date Mode:</strong> Hire date or custom trigger</li>
              <li>• <strong>Active Status:</strong> Enable/disable template</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Task Categories</h5>
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• <strong>Compliance:</strong> Mandatory legal/regulatory tasks</li>
              <li>• <strong>Orientation:</strong> Culture and company introduction</li>
              <li>• <strong>Technical:</strong> Systems access and training</li>
              <li>• <strong>Role-Specific:</strong> Job-related onboarding</li>
              <li>• <strong>Social:</strong> Team integration activities</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">30-60-90 Day Framework</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2 text-left">Phase</th>
                <th className="border p-2 text-left">Days</th>
                <th className="border p-2 text-left">Focus Area</th>
                <th className="border p-2 text-left">Key Milestones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">Learn</td>
                <td className="border p-2">1-30</td>
                <td className="border p-2">Understanding role, culture, systems</td>
                <td className="border p-2">Complete all compliance training, meet key stakeholders</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Contribute</td>
                <td className="border p-2">31-60</td>
                <td className="border p-2">Beginning to add value</td>
                <td className="border p-2">First independent deliverables, 30-day check-in</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Own</td>
                <td className="border p-2">61-90</td>
                <td className="border p-2">Full productivity</td>
                <td className="border p-2">Probation review, goal setting, full integration</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Creating an Onboarding Template</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to <strong>Workforce → Employee Onboarding → Templates</strong></li>
          <li>Click <strong>Create Template</strong> to open the template dialog</li>
          <li>Enter template name, description, and select target company</li>
          <li>Optionally link to specific job or job family</li>
          <li>Set default duration and milestone dates</li>
          <li>Save template, then add tasks to each phase</li>
          <li>For each task, specify owner (HR, Manager, Employee, IT), due date offset, and dependencies</li>
          <li>Mark compliance-critical tasks as mandatory</li>
          <li>Activate template when ready for use</li>
        </ol>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.2a: Onboarding template creation dialog with phase and task configuration"
        alt="Template setup form showing 30-60-90 day framework options"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Task Assignment Rules</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { owner: 'HR Tasks', examples: 'Benefits enrollment, policy acknowledgments, compliance training', icon: '👥' },
            { owner: 'Manager Tasks', examples: 'Team introductions, goal setting, check-ins, equipment setup', icon: '👤' },
            { owner: 'Employee Tasks', examples: 'Profile completion, self-paced training, acknowledgments', icon: '🙋' }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h5 className="font-medium">{item.owner}</h5>
              <p className="text-sm text-muted-foreground">{item.examples}</p>
            </div>
          ))}
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.2b: Task assignment rules by owner type (HR, Manager, Employee)"
        alt="Onboarding task categories with example tasks for each stakeholder"
      />

      <LearningObjectives
        objectives={[
          "Create and configure onboarding templates by role type",
          "Design 30-60-90 day milestone frameworks",
          "Assign tasks with appropriate owners and due dates",
          "Link templates to jobs or job families for auto-assignment"
        ]}
      />
    </div>
  );
}
