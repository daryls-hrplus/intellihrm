import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { TrendingUp, Target, BookOpen, Compass } from 'lucide-react';

export const MyCareerPaths: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          My Career Paths enables employees to explore progression opportunities within the organization. 
          Based on their current role, skills, and qualifications, employees can view potential next roles, 
          understand skill gaps, and access development resources.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <Compass className="h-6 w-6 text-blue-600 mb-2" />
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Career Explorer</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Interactive visualization of potential career paths from current position, showing both 
            vertical and lateral movement options
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <Target className="h-6 w-6 text-green-600 mb-2" />
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Gap Analysis</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Clear comparison of current skills vs. target role requirements, with percentage 
            readiness scores
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Learning Paths</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Recommended courses and certifications linked to career goals, integrated with LMS
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
          <TrendingUp className="h-6 w-6 text-orange-600 mb-2" />
          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Progress Tracking</h4>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Monitor development progress over time with milestones and achievements
          </p>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="My Career Paths - Career progression visualization with skill gap analysis"
        alt="Screenshot showing career path explorer with potential next roles and readiness percentages"
      />

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Career Path Features</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="font-medium text-primary">→</span>
            <span><strong>Role Comparison:</strong> Side-by-side view of current vs target role requirements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-primary">→</span>
            <span><strong>Mentor Matching:</strong> Connect with employees who have traveled similar paths</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-primary">→</span>
            <span><strong>Internal Opportunities:</strong> View open positions that match career interests</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium text-primary">→</span>
            <span><strong>IDP Integration:</strong> Link career goals to Individual Development Plans</span>
          </li>
        </ul>
      </div>

      <Alert>
        <AlertDescription>
          <strong>AI-Powered Suggestions:</strong> The system uses AI to recommend career paths based 
          on skill profiles, performance history, and organizational needs, providing personalized 
          progression recommendations.
        </AlertDescription>
      </Alert>
    </div>
  );
};
