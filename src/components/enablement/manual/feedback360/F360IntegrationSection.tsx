import { Network } from 'lucide-react';
import {
  IntegrationArchitectureOverview,
  IntegrationAppraisalFeed,
  IntegrationTalentProfile,
  IntegrationNineBoxSuccession,
  IntegrationIDPDevelopment,
  IntegrationLearningRecommendations,
  IntegrationContinuousFeedback,
  IntegrationRulesConfiguration
} from './sections/integration';

export function F360IntegrationSection() {
  return (
    <div className="space-y-12">
      <div data-manual-anchor="part-7" id="part-7" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Network className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">7. Integration & Cross-Module Features</h2>
            <p className="text-muted-foreground">
              Comprehensive cross-module integration patterns connecting 360 Feedback with Appraisals, 
              Talent Management, Succession Planning, IDP, Learning, and Continuous Feedback systems.
            </p>
          </div>
        </div>
      </div>

      <IntegrationArchitectureOverview />
      <IntegrationAppraisalFeed />
      <IntegrationTalentProfile />
      <IntegrationNineBoxSuccession />
      <IntegrationIDPDevelopment />
      <IntegrationLearningRecommendations />
      <IntegrationContinuousFeedback />
      <IntegrationRulesConfiguration />
    </div>
  );
}
