import { 
  InfoCallout, 
  LearningObjectives, 
  ScreenshotPlaceholder,
  FeatureCard,
  FeatureCardGrid
} from '@/components/enablement/manual/components';
import { ArrowRight } from 'lucide-react';

export function LifecycleOverview() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        The Employee Lifecycle represents the complete journey from hire to retire. Intelli HRM provides 
        comprehensive workflow automation for every stage, ensuring consistent processes, compliance, 
        and a positive employee experience throughout their tenure.
      </p>

      <InfoCallout title="Industry Benchmark">
        Organizations with structured lifecycle workflows see 82% higher new hire retention 
        and 70% faster time-to-productivity according to SHRM research.
      </InfoCallout>

      <div className="space-y-4">
        <h4 className="font-semibold">Lifecycle Stages</h4>
        <FeatureCardGrid columns={4}>
          <FeatureCard variant="primary" title="Pre-Hire">
            Offer acceptance, background checks, pre-start coordination
          </FeatureCard>
          <FeatureCard variant="success" title="Onboarding">
            30-60-90 day integration, training, compliance
          </FeatureCard>
          <FeatureCard variant="purple" title="Active Employment">
            Development, performance, career progression
          </FeatureCard>
          <FeatureCard variant="warning" title="Offboarding">
            Exit process, knowledge transfer, separation
          </FeatureCard>
        </FeatureCardGrid>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Lifecycle Workflow Architecture</h4>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded">Offer Accepted</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-primary/10 text-primary rounded">Pre-Boarding Tasks</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-success/10 text-success rounded">Day 1 Onboarding</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-success/10 text-success rounded">30-60-90 Milestones</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded">Probation Complete</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded">Active Employee</span>
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

      <ScreenshotPlaceholder
        caption="Figure 5.1: Employee Lifecycle workflow overview showing stages from pre-hire to offboarding"
        alt="Lifecycle workflow diagram with stakeholder responsibilities at each stage"
      />

      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Lifecycle Workflow Integrations</h4>
        <LearningObjectives
          objectives={[
            "Recruitment → Onboarding trigger on hire",
            "Performance → Probation reviews integration",
            "Learning → Mandatory training assignments",
            "IT/HR Hub → Access provisioning workflows"
          ]}
        />
      </div>
    </div>
  );
}
