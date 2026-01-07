import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { Users, Eye, Bell, BarChart3 } from 'lucide-react';

export const ManagerTeamView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          Manager Self-Service (MSS) provides managers with a comprehensive view of their direct reports 
          and extended team. The Team View is the central hub for accessing employee information, 
          initiating transactions, and monitoring team health indicators.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">Team Roster</h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Direct & indirect reports</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 text-center">
          <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-semibold text-green-900 dark:text-green-100">Quick View</h4>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">Employee profiles at a glance</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 text-center">
          <Bell className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h4 className="font-semibold text-purple-900 dark:text-purple-100">Alerts</h4>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Pending actions & reminders</p>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
          <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <h4 className="font-semibold text-orange-900 dark:text-orange-100">Analytics</h4>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Team metrics & trends</p>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Manager Actions Available</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-sm mb-2">View & Monitor</h5>
            <ul className="text-sm space-y-1">
              <li>• Employee profiles and details</li>
              <li>• Team org chart visualization</li>
              <li>• Leave balances and calendars</li>
              <li>• Training completion status</li>
              <li>• Pending approvals queue</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-sm mb-2">Initiate Transactions</h5>
            <ul className="text-sm space-y-1">
              <li>• Request promotions/transfers</li>
              <li>• Initiate compensation changes</li>
              <li>• Assign training courses</li>
              <li>• Create performance notes</li>
              <li>• Start offboarding process</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="Manager Team View - Direct reports dashboard with quick actions"
        alt="Screenshot showing manager's team view with employee cards, pending actions, and team analytics"
      />

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b">
          <h4 className="font-semibold text-sm">Team Health Indicators</h4>
        </div>
        <div className="p-4 grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">92%</div>
            <div className="text-xs text-muted-foreground">Training Compliance</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">4.2</div>
            <div className="text-xs text-muted-foreground">Avg Performance Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">3</div>
            <div className="text-xs text-muted-foreground">Pending Approvals</div>
          </div>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Delegation Support:</strong> Managers can delegate MSS responsibilities to deputies 
          during absences, with full audit trail of delegated actions.
        </AlertDescription>
      </Alert>
    </div>
  );
};
