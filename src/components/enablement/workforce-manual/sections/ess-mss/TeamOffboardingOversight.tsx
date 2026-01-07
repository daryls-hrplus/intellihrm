import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <UserMinus className="h-6 w-6 text-red-600 mb-2" />
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Departure Visibility</h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            <li>• Departing employees list</li>
            <li>• Last working day countdown</li>
            <li>• Resignation vs. termination type</li>
            <li>• Exit reason categories</li>
          </ul>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <ClipboardList className="h-6 w-6 text-amber-600 mb-2" />
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Manager Checklist</h4>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            <li>• Knowledge transfer plan</li>
            <li>• Work redistribution</li>
            <li>• Client handover</li>
            <li>• Exit interview scheduling</li>
          </ul>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Manager Offboarding Responsibilities</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 bg-background rounded border">
            <Key className="h-5 w-5 text-primary mb-2" />
            <h5 className="font-medium text-sm mb-1">Access & Assets</h5>
            <ul className="text-xs space-y-1">
              <li>• Confirm equipment return</li>
              <li>• Verify access revocation</li>
              <li>• Collect badges/keys</li>
            </ul>
          </div>
          <div className="p-3 bg-background rounded border">
            <FileText className="h-5 w-5 text-primary mb-2" />
            <h5 className="font-medium text-sm mb-1">Documentation</h5>
            <ul className="text-xs space-y-1">
              <li>• Process documentation</li>
              <li>• Project status notes</li>
              <li>• Contact handover</li>
            </ul>
          </div>
          <div className="p-3 bg-background rounded border">
            <UserMinus className="h-5 w-5 text-primary mb-2" />
            <h5 className="font-medium text-sm mb-1">Team Impact</h5>
            <ul className="text-xs space-y-1">
              <li>• Team communication</li>
              <li>• Workload rebalancing</li>
              <li>• Backfill request</li>
            </ul>
          </div>
        </div>
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

      <Alert>
        <AlertDescription>
          <strong>Compliance:</strong> Manager task completion is tracked for compliance reporting. 
          Incomplete offboarding tasks trigger escalation workflows.
        </AlertDescription>
      </Alert>
    </div>
  );
};
