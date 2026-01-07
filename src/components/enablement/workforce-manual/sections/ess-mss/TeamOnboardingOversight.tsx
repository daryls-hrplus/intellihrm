import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { UserPlus, CheckSquare, Calendar, MessageSquare } from 'lucide-react';

export const TeamOnboardingOversight: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          Managers play a critical role in onboarding success. The Team Onboarding Oversight feature 
          provides managers with visibility into new hire progress, assigned tasks, and tools to 
          actively participate in welcoming and integrating new team members.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <UserPlus className="h-6 w-6 text-blue-600 mb-2" />
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">New Hire Visibility</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Upcoming new hires with start dates</li>
            <li>• Pre-boarding status indicators</li>
            <li>• Document completion tracking</li>
            <li>• IT provisioning status</li>
          </ul>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <CheckSquare className="h-6 w-6 text-green-600 mb-2" />
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Manager Tasks</h4>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Assign onboarding buddy</li>
            <li>• Schedule welcome meeting</li>
            <li>• Review job expectations</li>
            <li>• Complete 30/60/90 day check-ins</li>
          </ul>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Onboarding Journey Tracking</h4>
        <div className="relative">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mx-auto">✓</div>
              <div className="text-xs mt-1">Pre-boarding</div>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-2"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mx-auto">✓</div>
              <div className="text-xs mt-1">Day 1</div>
            </div>
            <div className="flex-1 h-1 bg-blue-500 mx-2"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mx-auto">●</div>
              <div className="text-xs mt-1">Week 1</div>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-sm mx-auto">○</div>
              <div className="text-xs mt-1">30 Days</div>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-sm mx-auto">○</div>
              <div className="text-xs mt-1">90 Days</div>
            </div>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="Team Onboarding Oversight - Manager view of new hire onboarding progress"
        alt="Screenshot showing manager's onboarding dashboard with new hire cards and task completion status"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <Calendar className="h-5 w-5 text-primary mb-2" />
          <h4 className="font-semibold mb-2">Milestone Meetings</h4>
          <ul className="text-sm space-y-1">
            <li>• Day 1 welcome meeting</li>
            <li>• Week 1 check-in</li>
            <li>• 30-day review</li>
            <li>• 60-day progress review</li>
            <li>• 90-day probation review</li>
          </ul>
        </div>
        <div className="p-4 border rounded-lg">
          <MessageSquare className="h-5 w-5 text-primary mb-2" />
          <h4 className="font-semibold mb-2">Feedback Collection</h4>
          <ul className="text-sm space-y-1">
            <li>• New hire pulse surveys</li>
            <li>• Manager onboarding feedback</li>
            <li>• Buddy feedback forms</li>
            <li>• Onboarding experience rating</li>
          </ul>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Integration:</strong> Links to Lifecycle Workflows (Chapter 5) for complete onboarding 
          process design and task automation.
        </AlertDescription>
      </Alert>
    </div>
  );
};
