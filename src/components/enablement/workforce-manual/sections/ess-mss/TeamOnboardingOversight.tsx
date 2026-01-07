import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, IntegrationCallout } from '@/components/enablement/manual/components';
import { UserPlus, CheckSquare, Calendar, MessageSquare } from 'lucide-react';

export const TeamOnboardingOversight: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-none">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Overview</h3>
        <p className="text-foreground leading-relaxed">
          Managers play a critical role in onboarding success. The Team Onboarding Oversight feature 
          provides managers with visibility into new hire progress, assigned tasks, and tools to 
          actively participate in welcoming and integrating new team members.
        </p>
      </div>

      <FeatureCardGrid columns={2}>
        <FeatureCard variant="primary" icon={UserPlus} title="New Hire Visibility">
          <ul className="space-y-1 mt-2">
            <li>• Upcoming new hires with start dates</li>
            <li>• Pre-boarding status indicators</li>
            <li>• Document completion tracking</li>
            <li>• IT provisioning status</li>
          </ul>
        </FeatureCard>
        <FeatureCard variant="success" icon={CheckSquare} title="Manager Tasks">
          <ul className="space-y-1 mt-2">
            <li>• Assign onboarding buddy</li>
            <li>• Schedule welcome meeting</li>
            <li>• Review job expectations</li>
            <li>• Complete 30/60/90 day check-ins</li>
          </ul>
        </FeatureCard>
      </FeatureCardGrid>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Onboarding Journey Tracking</h4>
        <div className="relative">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm mx-auto">✓</div>
              <div className="text-xs mt-1">Pre-boarding</div>
            </div>
            <div className="flex-1 h-1 bg-emerald-500 mx-2"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm mx-auto">✓</div>
              <div className="text-xs mt-1">Day 1</div>
            </div>
            <div className="flex-1 h-1 bg-blue-500 mx-2"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mx-auto">●</div>
              <div className="text-xs mt-1">Week 1</div>
            </div>
            <div className="flex-1 h-1 bg-muted mx-2"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm mx-auto">○</div>
              <div className="text-xs mt-1">30 Days</div>
            </div>
            <div className="flex-1 h-1 bg-muted mx-2"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm mx-auto">○</div>
              <div className="text-xs mt-1">90 Days</div>
            </div>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="Team Onboarding Oversight - Manager view of new hire onboarding progress"
        alt="Screenshot showing manager's onboarding dashboard with new hire cards and task completion status"
      />

      <FeatureCardGrid columns={2}>
        <FeatureCard variant="neutral" icon={Calendar} title="Milestone Meetings">
          <ul className="space-y-1 mt-2">
            <li>• Day 1 welcome meeting</li>
            <li>• Week 1 check-in</li>
            <li>• 30-day review</li>
            <li>• 60-day progress review</li>
            <li>• 90-day probation review</li>
          </ul>
        </FeatureCard>
        <FeatureCard variant="neutral" icon={MessageSquare} title="Feedback Collection">
          <ul className="space-y-1 mt-2">
            <li>• New hire pulse surveys</li>
            <li>• Manager onboarding feedback</li>
            <li>• Buddy feedback forms</li>
            <li>• Onboarding experience rating</li>
          </ul>
        </FeatureCard>
      </FeatureCardGrid>

      <IntegrationCallout title="Integration">
        Links to Lifecycle Workflows (Chapter 5) for complete onboarding 
        process design and task automation.
      </IntegrationCallout>
    </div>
  );
};
