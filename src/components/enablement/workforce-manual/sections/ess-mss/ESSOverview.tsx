import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { User, Shield, Clock, ArrowRight } from 'lucide-react';

export const ESSOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          Employee Self-Service (ESS) empowers employees to manage their own workforce data, reducing 
          administrative burden on HR while increasing data accuracy and employee engagement. The ESS 
          portal provides controlled access to personal information, qualifications, and career tools.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <User className="h-8 w-8 text-blue-600 mb-3" />
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Employee Empowerment</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Direct access to update personal details, view history, and manage career development
          </p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <Shield className="h-8 w-8 text-green-600 mb-3" />
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Controlled Access</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Role-based permissions ensure employees see only what they're authorized to access
          </p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <Clock className="h-8 w-8 text-purple-600 mb-3" />
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Real-Time Updates</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Changes flow through approval workflows and update core records immediately upon approval
          </p>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">ESS Module Components</h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-sm"><strong>My Profile:</strong> Personal & contact information</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-sm"><strong>My Qualifications:</strong> Certifications & education</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-sm"><strong>My Transactions:</strong> Employment history & changes</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-sm"><strong>My Career:</strong> Career paths & progression</span>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="ESS Dashboard - Employee's central hub for self-service actions"
        alt="Screenshot of the Employee Self-Service dashboard showing quick actions and pending items"
      />

      <Alert>
        <AlertDescription>
          <strong>Cross-Module Integration:</strong> ESS connects to Leave Management, Benefits Enrollment, 
          Learning Portal, and Performance modules for a unified employee experience.
        </AlertDescription>
      </Alert>
    </div>
  );
};
