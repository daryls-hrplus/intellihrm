import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, ComplianceCallout } from '@/components/enablement/manual/components';
import { UserMinus, ClipboardList, Key, FileText } from 'lucide-react';

export const TeamOffboardingOversight: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          When team members depart, managers are responsible for ensuring smooth knowledge transfer, 
          asset recovery, and maintaining team continuity. The Team Offboarding Oversight feature 
          guides managers through their responsibilities in the exit process.
        </p>
      </div>

      <FeatureCardGrid columns={2}>
        <FeatureCard variant="warning" icon={UserMinus} title="Departure Visibility">
          <ul className="space-y-1 mt-2">
            <li>• Departing employees list</li>
            <li>• Last working day countdown</li>
            <li>• Resignation vs. termination type</li>
            <li>• Exit reason categories</li>
          </ul>
        </FeatureCard>
        <FeatureCard variant="orange" icon={ClipboardList} title="Manager Checklist">
          <ul className="space-y-1 mt-2">
            <li>• Knowledge transfer plan</li>
            <li>• Work redistribution</li>
            <li>• Client handover</li>
            <li>• Exit interview scheduling</li>
          </ul>
        </FeatureCard>
      </FeatureCardGrid>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Manager Offboarding Responsibilities</h4>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="neutral" icon={Key} title="Access & Assets">
            <ul className="text-xs space-y-1 mt-2">
              <li>• Confirm equipment return</li>
              <li>• Verify access revocation</li>
              <li>• Collect badges/keys</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="neutral" icon={FileText} title="Documentation">
            <ul className="text-xs space-y-1 mt-2">
              <li>• Process documentation</li>
              <li>• Project status notes</li>
              <li>• Contact handover</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="neutral" icon={UserMinus} title="Team Impact">
            <ul className="text-xs space-y-1 mt-2">
              <li>• Team communication</li>
              <li>• Workload rebalancing</li>
              <li>• Backfill request</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </div>

      <ScreenshotPlaceholder 
        caption="Team Offboarding Oversight - Manager's departing employee dashboard"
        alt="Screenshot showing manager's view of departing team members with task completion tracking"
      />

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b">
          <h4 className="font-semibold text-sm">Offboarding Timeline</h4>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-20 text-xs font-medium">Notice Day</div>
              <div className="flex-1 text-sm">Resignation accepted, offboarding initiated</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-xs font-medium">Week 1-2</div>
              <div className="flex-1 text-sm">Knowledge transfer, documentation</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-xs font-medium">Final Week</div>
              <div className="flex-1 text-sm">Asset return, exit interview</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-xs font-medium">Last Day</div>
              <div className="flex-1 text-sm">Farewell, access deactivation</div>
            </div>
          </div>
        </div>
      </div>

      <ComplianceCallout title="Compliance">
        Manager task completion is tracked for compliance reporting. 
        Incomplete offboarding tasks trigger escalation workflows.
      </ComplianceCallout>
    </div>
  );
};
