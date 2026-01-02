import {
  IntegrationOverviewSection,
  NineBoxSuccessionSection,
  IdpPipSection,
  CompensationIntegrationSection,
  LearningIntegrationSection,
  NotificationOrchestrationSection
} from './sections/integration';

export function ManualIntegrationSection() {
  return (
    <div className="space-y-8">
      <IntegrationOverviewSection />
      <NineBoxSuccessionSection />
      <IdpPipSection />
      <CompensationIntegrationSection />
      <LearningIntegrationSection />
      <NotificationOrchestrationSection />
    </div>
  );
}
