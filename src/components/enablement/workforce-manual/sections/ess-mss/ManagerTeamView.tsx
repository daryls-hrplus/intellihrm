import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, TipCallout } from '@/components/enablement/manual/components';
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

      <FeatureCardGrid columns={4}>
        <FeatureCard 
          variant="primary" 
          icon={Users} 
          title="Team Roster"
          description="Direct & indirect reports"
          centered
        />
        <FeatureCard 
          variant="success" 
          icon={Eye} 
          title="Quick View"
          description="Employee profiles at a glance"
          centered
        />
        <FeatureCard 
          variant="purple" 
          icon={Bell} 
          title="Alerts"
          description="Pending actions & reminders"
          centered
        />
        <FeatureCard 
          variant="orange" 
          icon={BarChart3} 
          title="Analytics"
          description="Team metrics & trends"
          centered
        />
      </FeatureCardGrid>

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
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">92%</div>
            <div className="text-xs text-muted-foreground">Training Compliance</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4.2</div>
            <div className="text-xs text-muted-foreground">Avg Performance Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">3</div>
            <div className="text-xs text-muted-foreground">Pending Approvals</div>
          </div>
        </div>
      </div>

      <TipCallout title="Delegation Support">
        Managers can delegate MSS responsibilities to deputies 
        during absences, with full audit trail of delegated actions.
      </TipCallout>
    </div>
  );
};
