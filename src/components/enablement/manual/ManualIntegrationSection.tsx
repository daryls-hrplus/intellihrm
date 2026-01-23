import {
  IntegrationOverviewSection,
  NineBoxSuccessionSection,
  IdpPipSection,
  CompensationIntegrationSection,
  LearningIntegrationSection,
  NotificationOrchestrationSection,
  IntegrationAnalyticsSection,
  IntegrationRuleConfiguration,
  ComplianceDocumentSection,
  WorkflowIntegration
} from './sections/integration';

export function ManualIntegrationSection() {
  return (
    <div className="space-y-8">
      <section id="sec-7-1" data-manual-anchor="sec-7-1" className="scroll-mt-32">
        <IntegrationOverviewSection />
      </section>
      <section id="sec-7-2" data-manual-anchor="sec-7-2" className="scroll-mt-32">
        <NineBoxSuccessionSection />
      </section>
      <section id="sec-7-3" data-manual-anchor="sec-7-3" className="scroll-mt-32">
        <IdpPipSection />
      </section>
      <section id="sec-7-4" data-manual-anchor="sec-7-4" className="scroll-mt-32">
        <CompensationIntegrationSection />
      </section>
      <section id="sec-7-5" data-manual-anchor="sec-7-5" className="scroll-mt-32">
        <LearningIntegrationSection />
      </section>
      <section id="sec-7-6" data-manual-anchor="sec-7-6" className="scroll-mt-32">
        <NotificationOrchestrationSection />
      </section>
      <section id="sec-7-7" data-manual-anchor="sec-7-7" className="scroll-mt-32">
        <IntegrationAnalyticsSection />
      </section>
      <section id="sec-7-8" data-manual-anchor="sec-7-8" className="scroll-mt-32">
        <IntegrationRuleConfiguration />
      </section>
      <section id="sec-7-9" data-manual-anchor="sec-7-9" className="scroll-mt-32">
        <ComplianceDocumentSection />
      </section>
      <section id="sec-7-10" data-manual-anchor="sec-7-10" className="scroll-mt-32">
        <WorkflowIntegration />
      </section>
    </div>
  );
}
