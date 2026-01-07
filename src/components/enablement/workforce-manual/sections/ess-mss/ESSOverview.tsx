import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, IntegrationCallout } from '@/components/enablement/manual/components';
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

      <FeatureCardGrid columns={3}>
        <FeatureCard 
          variant="primary" 
          icon={User} 
          title="Employee Empowerment"
          description="Direct access to update personal details, view history, and manage career development"
        />
        <FeatureCard 
          variant="success" 
          icon={Shield} 
          title="Controlled Access"
          description="Role-based permissions ensure employees see only what they're authorized to access"
        />
        <FeatureCard 
          variant="purple" 
          icon={Clock} 
          title="Real-Time Updates"
          description="Changes flow through approval workflows and update core records immediately upon approval"
        />
      </FeatureCardGrid>

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

      <IntegrationCallout title="Cross-Module Integration">
        ESS connects to Leave Management, Benefits Enrollment, 
        Learning Portal, and Performance modules for a unified employee experience.
      </IntegrationCallout>
    </div>
  );
};
