import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, FutureCallout } from '@/components/enablement/manual/components';
import { TrendingUp, Target, BookOpen, Compass } from 'lucide-react';

export const MyCareerPaths: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-none">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Overview</h3>
        <p className="text-foreground leading-relaxed">
          My Career Paths enables employees to explore progression opportunities within the organization. 
          Based on their current role, skills, and qualifications, employees can view potential next roles, 
          understand skill gaps, and access development resources.
        </p>
      </div>

      <FeatureCardGrid columns={2}>
        <FeatureCard 
          variant="primary" 
          icon={Compass} 
          title="Career Explorer"
          description="Interactive visualization of potential career paths from current position, showing both vertical and lateral movement options"
        />
        <FeatureCard 
          variant="success" 
          icon={Target} 
          title="Gap Analysis"
          description="Clear comparison of current skills vs. target role requirements, with percentage readiness scores"
        />
        <FeatureCard 
          variant="purple" 
          icon={BookOpen} 
          title="Learning Paths"
          description="Recommended courses and certifications linked to career goals, integrated with LMS"
        />
        <FeatureCard 
          variant="orange" 
          icon={TrendingUp} 
          title="Progress Tracking"
          description="Monitor development progress over time with milestones and achievements"
        />
      </FeatureCardGrid>

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

      <FutureCallout title="AI-Powered Suggestions">
        The system uses AI to recommend career paths based 
        on skill profiles, performance history, and organizational needs, providing personalized 
        progression recommendations.
      </FutureCallout>
    </div>
  );
};
