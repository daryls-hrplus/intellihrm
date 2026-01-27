import { Network, Clock } from 'lucide-react';
import {
  IntegrationArchitectureOverview,
  IntegrationRulesEngine,
  IntegrationPerformanceAppraisal,
  Integration360Feedback,
  IntegrationTalentSignals,
  IntegrationNineBoxUpdates,
  IntegrationLearningDevelopment,
  IntegrationWorkforcePosition,
  IntegrationCompensation,
  IntegrationHRHub,
  IntegrationExecutionAudit,
  IntegrationTroubleshooting
} from './sections/integration';

export function SuccessionIntegrationSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-9" data-manual-anchor="part-9" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Network className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9. Integration & Cross-Module Features</h2>
            <p className="text-muted-foreground">
              Performance, 360 Feedback, Talent Signals, Learning, Workforce, Compensation, and HR Hub integration patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~135 min read
          </span>
          <span>Target: Admin, Consultant</span>
        </div>
      </section>

      {/* Section Components */}
      <IntegrationArchitectureOverview />
      <IntegrationRulesEngine />
      <IntegrationPerformanceAppraisal />
      <Integration360Feedback />
      <IntegrationTalentSignals />
      <IntegrationNineBoxUpdates />
      <IntegrationLearningDevelopment />
      <IntegrationWorkforcePosition />
      <IntegrationCompensation />
      <IntegrationHRHub />
      <IntegrationExecutionAudit />
      <IntegrationTroubleshooting />
    </div>
  );
}
