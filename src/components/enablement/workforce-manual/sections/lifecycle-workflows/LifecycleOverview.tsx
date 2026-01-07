import { LearningObjectives } from './LearningObjectives';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, ArrowRight } from 'lucide-react';

export function LifecycleOverview() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        The Employee Lifecycle represents the complete journey from hire to retire. HRplus provides 
        comprehensive workflow automation for every stage, ensuring consistent processes, compliance, 
        and a positive employee experience throughout their tenure.
      </p>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Industry Benchmark:</strong> Organizations with structured lifecycle workflows 
          see 82% higher new hire retention and 70% faster time-to-productivity according to SHRM research.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Lifecycle Stages</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { stage: 'Pre-Hire', desc: 'Offer acceptance, background checks, pre-start coordination', color: 'bg-blue-500' },
            { stage: 'Onboarding', desc: '30-60-90 day integration, training, compliance', color: 'bg-green-500' },
            { stage: 'Active Employment', desc: 'Development, performance, career progression', color: 'bg-purple-500' },
            { stage: 'Offboarding', desc: 'Exit process, knowledge transfer, separation', color: 'bg-orange-500' }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className={`w-3 h-3 rounded-full ${item.color} mb-2`} />
              <h5 className="font-medium">{item.stage}</h5>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Lifecycle Workflow Architecture</h4>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">Offer Accepted</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">Pre-Boarding Tasks</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded">Day 1 Onboarding</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded">30-60-90 Milestones</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">Probation Complete</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">Active Employee</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Key Stakeholders by Stage</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2 text-left">Stage</th>
                <th className="border p-2 text-left">HR Ops</th>
                <th className="border p-2 text-left">Manager</th>
                <th className="border p-2 text-left">Employee</th>
                <th className="border p-2 text-left">IT/Facilities</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">Pre-Hire</td>
                <td className="border p-2">Background checks, offer letter</td>
                <td className="border p-2">Team preparation</td>
                <td className="border p-2">Document submission</td>
                <td className="border p-2">Equipment ordering</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Day 1</td>
                <td className="border p-2">Orientation, compliance</td>
                <td className="border p-2">Team introduction</td>
                <td className="border p-2">Self-service tasks</td>
                <td className="border p-2">Access provisioning</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">30-60-90</td>
                <td className="border p-2">Check-ins, compliance</td>
                <td className="border p-2">Performance reviews</td>
                <td className="border p-2">Training completion</td>
                <td className="border p-2">Additional access</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Offboarding</td>
                <td className="border p-2">Exit interview, clearance</td>
                <td className="border p-2">Knowledge transfer</td>
                <td className="border p-2">Asset return</td>
                <td className="border p-2">Access revocation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <LearningObjectives
        title="Lifecycle Workflow Integrations"
        items={[
          "Recruitment → Onboarding trigger on hire",
          "Performance → Probation reviews integration",
          "Learning → Mandatory training assignments",
          "IT/HR Hub → Access provisioning workflows"
        ]}
      />
    </div>
  );
}
