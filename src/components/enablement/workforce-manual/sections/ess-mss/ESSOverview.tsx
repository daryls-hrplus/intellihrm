import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, IntegrationCallout, InfoCallout } from '@/components/enablement/manual/components';
import { User, Shield, Clock, ArrowRight, BookOpen } from 'lucide-react';

export const ESSOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-none">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Overview</h3>
        <p className="text-foreground leading-relaxed">
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
        <h4 className="font-semibold mb-3 text-foreground">ESS Module Components</h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground"><strong>My Profile:</strong> Personal & contact information</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground"><strong>My Qualifications:</strong> Certifications & education</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground"><strong>My Transactions:</strong> Employment history & changes</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground"><strong>My Career:</strong> Career paths & progression</span>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="ESS Dashboard - Employee's central hub for self-service actions"
        alt="Screenshot of the Employee Self-Service dashboard showing quick actions and pending items"
      />

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Workforce Manual Linkages
        </h4>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-foreground">
          <div><strong>Part 2:</strong> Org structure powers hierarchy display</div>
          <div><strong>Part 3:</strong> Job architecture defines career paths</div>
          <div><strong>Part 4:</strong> Employee data is source for My Profile</div>
          <div><strong>Part 5:</strong> Lifecycle events shown in My Transactions</div>
        </div>
      </div>

      <IntegrationCallout title="Cross-Module Integration">
        ESS connects to Leave Management, Benefits Enrollment, 
        Learning Portal, and Performance modules for a unified employee experience.
      </IntegrationCallout>

      <InfoCallout title="Full ESS Manual">
        This section covers workforce-related ESS features. For comprehensive coverage of all 
        ESS capabilities including pay, benefits, leave, and performance, see the dedicated ESS Manual.
      </InfoCallout>
    </div>
  );
};
