import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, SecurityCallout } from '@/components/enablement/manual/components';
import { History, Download } from 'lucide-react';

export const MyTransactionsHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          Employees can view their complete employment transaction history, providing transparency into 
          all changes that have occurred throughout their tenure. This includes role changes, transfers, 
          promotions, compensation adjustments, and organizational movements.
        </p>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Transaction Types Visible to Employees
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-sm mb-2">Position & Role Changes</h5>
            <ul className="text-sm space-y-1">
              <li>• Promotions and demotions</li>
              <li>• Lateral transfers</li>
              <li>• Department changes</li>
              <li>• Reporting line changes</li>
              <li>• Job title updates</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-sm mb-2">Employment Status</h5>
            <ul className="text-sm space-y-1">
              <li>• Hire and re-hire dates</li>
              <li>• Employment type changes</li>
              <li>• Leave of absence records</li>
              <li>• Contract renewals</li>
              <li>• Location assignments</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b">
          <h4 className="font-semibold text-sm">Sample Transaction Timeline</h4>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-4 items-start">
            <div className="w-24 text-xs text-muted-foreground">Jan 15, 2024</div>
            <div className="flex-1 text-sm">
              <span className="font-medium">Promotion</span> - Senior Analyst to Team Lead
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-24 text-xs text-muted-foreground">Aug 01, 2023</div>
            <div className="flex-1 text-sm">
              <span className="font-medium">Transfer</span> - Finance to Operations Department
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-24 text-xs text-muted-foreground">Mar 10, 2022</div>
            <div className="flex-1 text-sm">
              <span className="font-medium">Hire</span> - Initial employment as Analyst
            </div>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="My Transactions History - Employee timeline view"
        alt="Screenshot showing employee's employment transaction history in chronological timeline format"
      />

      <FeatureCard 
        variant="primary" 
        icon={Download} 
        title="Export Options"
        description="Employees can download their transaction history as PDF for personal records or employment verification purposes."
      />

      <SecurityCallout title="Privacy Note">
        Compensation details in transaction history respect company 
        privacy settings. Some organizations may choose to show or hide salary information in ESS.
      </SecurityCallout>
    </div>
  );
};
