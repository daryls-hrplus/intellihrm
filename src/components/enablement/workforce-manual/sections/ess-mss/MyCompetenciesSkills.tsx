import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, IntegrationCallout } from '@/components/enablement/manual/components';
import { Brain, Target, TrendingUp, Sparkles } from 'lucide-react';
import { SeeAlsoReference } from '@/components/enablement/shared/CrossModuleReference';

export const MyCompetenciesSkills: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-none">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Overview</h3>
        <p className="text-foreground leading-relaxed">
          The My Competencies & Skills section in ESS allows employees to view their assessed competencies, 
          self-rate their skills, identify skill gaps, and express interests in developing new capabilities. 
          This directly integrates with the Workforce Module's Skills & Competencies Library (Part 3).
        </p>
      </div>

      <FeatureCardGrid columns={2}>
        <FeatureCard 
          variant="primary" 
          icon={Brain} 
          title="Competency Assessment"
          description="View competencies linked to your job profile and current proficiency levels"
        />
        <FeatureCard 
          variant="success" 
          icon={Target} 
          title="Skill Gap Analysis"
          description="Compare current skills against role requirements and career aspirations"
        />
        <FeatureCard 
          variant="purple" 
          icon={TrendingUp} 
          title="Development Tracking"
          description="Monitor progress on skill development through training and experience"
        />
        <FeatureCard 
          variant="warning" 
          icon={Sparkles} 
          title="Skill Interests"
          description="Express interest in learning new skills for career growth opportunities"
        />
      </FeatureCardGrid>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-foreground">Workforce Data Linkages</h4>
        <div className="space-y-2 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <span className="font-medium min-w-32">Skills Library:</span>
            <span>Skills displayed come from Part 3.1 Skills & Competencies Framework configuration</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium min-w-32">Job Competencies:</span>
            <span>Role-required competencies defined in Part 3.4 Job Titles competency mapping</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium min-w-32">Proficiency Scales:</span>
            <span>Rating scales configured in Part 3.2 Proficiency Levels</span>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="My Competencies - Employee view of skills and competency assessments"
        alt="Screenshot of the My Competencies page showing skill ratings and gap analysis"
      />

      <SeeAlsoReference
        moduleCode="WF"
        moduleName="Workforce"
        sectionId="wf-sec-3-1"
        sectionTitle="Skills & Competencies Framework"
        description="Configure the skills library and competency framework that powers ESS skill tracking"
        manualPath="/enablement/manuals/workforce"
      />

      <IntegrationCallout title="Full ESS Manual">
        For comprehensive coverage of all My Competencies features including self-assessments, 
        skill endorsements, and interest surveys, see the dedicated ESS Manual.
      </IntegrationCallout>
    </div>
  );
};
