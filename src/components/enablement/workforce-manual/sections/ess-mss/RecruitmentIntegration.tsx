import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, IntegrationCallout } from '@/components/enablement/manual/components';
import { UserSearch, ClipboardCheck, Calendar, ThumbsUp } from 'lucide-react';

export const RecruitmentIntegration: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          Managers are key stakeholders in the hiring process. The Recruitment Integration feature 
          within MSS allows managers to participate in hiring activities for their team, from 
          requisition creation through candidate selection and offer approval.
        </p>
      </div>

      <FeatureCardGrid columns={4}>
        <FeatureCard 
          variant="primary" 
          icon={UserSearch} 
          title="Requisitions"
          description="Create & track job requests"
          centered
        />
        <FeatureCard 
          variant="success" 
          icon={ClipboardCheck} 
          title="Candidates"
          description="Review applicant profiles"
          centered
        />
        <FeatureCard 
          variant="purple" 
          icon={Calendar} 
          title="Interviews"
          description="Schedule & provide feedback"
          centered
        />
        <FeatureCard 
          variant="orange" 
          icon={ThumbsUp} 
          title="Decisions"
          description="Approve offers & hires"
          centered
        />
      </FeatureCardGrid>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Manager Hiring Activities</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-sm mb-2">Requisition Management</h5>
            <ul className="text-sm space-y-1">
              <li>• Create new position requests</li>
              <li>• Define job requirements</li>
              <li>• Set hiring criteria</li>
              <li>• Track requisition status</li>
              <li>• Request budget approval</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-sm mb-2">Candidate Evaluation</h5>
            <ul className="text-sm space-y-1">
              <li>• View candidate profiles</li>
              <li>• Access resumes & assessments</li>
              <li>• Schedule interviews</li>
              <li>• Submit interview feedback</li>
              <li>• Make hiring recommendations</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="Recruitment Integration - Manager's hiring dashboard within MSS"
        alt="Screenshot showing manager's recruitment view with open positions, candidates, and interview schedules"
      />

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b">
          <h4 className="font-semibold text-sm">Hiring Pipeline View</h4>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
              <div className="text-xs text-muted-foreground">Applied</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">5</div>
              <div className="text-xs text-muted-foreground">Screened</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">3</div>
              <div className="text-xs text-muted-foreground">Interview</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">1</div>
              <div className="text-xs text-muted-foreground">Offer</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <IntegrationCallout title="Recruitment Module Link">
          Full recruitment functionality is available in 
          the Recruitment & Onboarding module. MSS provides a streamlined manager view.
        </IntegrationCallout>
        <IntegrationCallout title="Position Control">
          Requisitions are linked to approved positions from 
          Position Control (Chapter 6) ensuring headcount governance.
        </IntegrationCallout>
      </div>
    </div>
  );
};
