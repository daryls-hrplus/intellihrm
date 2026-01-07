import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, IntegrationCallout } from '@/components/enablement/manual/components';
import { GraduationCap, Award, FileCheck, Clock } from 'lucide-react';

export const MyQualifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          Employees can self-manage their qualifications including certifications, educational credentials, 
          professional licenses, and memberships. This creates a dynamic skills inventory that feeds into 
          workforce planning and career pathing.
        </p>
      </div>

      <FeatureCardGrid columns={2}>
        <FeatureCard variant="primary" icon={GraduationCap} title="Education">
          <ul className="space-y-1 mt-2">
            <li>• Degrees and diplomas</li>
            <li>• Institution and graduation date</li>
            <li>• Field of study / major</li>
            <li>• Upload transcripts</li>
          </ul>
        </FeatureCard>
        <FeatureCard variant="success" icon={Award} title="Certifications">
          <ul className="space-y-1 mt-2">
            <li>• Professional certifications</li>
            <li>• Issuing body and date earned</li>
            <li>• Expiration date tracking</li>
            <li>• Renewal reminders</li>
          </ul>
        </FeatureCard>
        <FeatureCard variant="purple" icon={FileCheck} title="Licenses">
          <ul className="space-y-1 mt-2">
            <li>• Professional licenses</li>
            <li>• License number and jurisdiction</li>
            <li>• Validity period</li>
            <li>• Compliance alerts</li>
          </ul>
        </FeatureCard>
        <FeatureCard variant="orange" icon={Clock} title="Memberships">
          <ul className="space-y-1 mt-2">
            <li>• Professional associations</li>
            <li>• Membership ID and level</li>
            <li>• Renewal tracking</li>
            <li>• Sponsorship records</li>
          </ul>
        </FeatureCard>
      </FeatureCardGrid>

      <ScreenshotPlaceholder 
        caption="My Qualifications - Managing certifications with expiry tracking"
        alt="Screenshot showing employee qualifications list with add/edit capabilities and expiration alerts"
      />

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Verification Workflow</h4>
        <p className="text-sm mb-2">
          When employees add new qualifications:
        </p>
        <ol className="text-sm list-decimal list-inside space-y-1">
          <li>Employee uploads credential and supporting documentation</li>
          <li>HR receives notification for verification</li>
          <li>HR validates against accrediting body or institution</li>
          <li>Credential status updated to "Verified" or "Pending Verification"</li>
        </ol>
      </div>

      <IntegrationCallout title="Skills Integration">
        Verified qualifications automatically map to the skills 
        framework, updating the employee's skill profile and competency levels.
      </IntegrationCallout>
    </div>
  );
};
