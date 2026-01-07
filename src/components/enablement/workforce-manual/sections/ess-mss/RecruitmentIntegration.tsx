import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
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

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
          <UserSearch className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Requisitions</h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Create & track job requests</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 text-center">
          <ClipboardCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-green-900 dark:text-green-100">Candidates</h4>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">Review applicant profiles</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 text-center">
          <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Interviews</h4>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Schedule & provide feedback</p>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
          <ThumbsUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-orange-900 dark:text-orange-100">Decisions</h4>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Approve offers & hires</p>
        </div>
      </div>

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
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-muted-foreground">Applied</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-xs text-muted-foreground">Screened</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-amber-600">3</div>
              <div className="text-xs text-muted-foreground">Interview</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-xs text-muted-foreground">Offer</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Alert>
          <AlertDescription>
            <strong>Recruitment Module Link:</strong> Full recruitment functionality is available in 
            the Recruitment & Onboarding module. MSS provides a streamlined manager view.
          </AlertDescription>
        </Alert>
        <Alert>
          <AlertDescription>
            <strong>Position Control:</strong> Requisitions are linked to approved positions from 
            Position Control (Chapter 6) ensuring headcount governance.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
