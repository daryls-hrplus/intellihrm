import {
  CommonIssuesSection,
  BestPracticesSection,
  SecurityAccessControlSection,
  ComplianceAuditSection,
  IntegrationTroubleshootingSection,
  PerformanceOptimizationSection,
  DataQualitySection,
  EscalationProceduresSection
} from './sections/troubleshooting';

interface ManualTroubleshootingSectionProps {
  selectedSectionId?: string;
}

export function ManualTroubleshootingSection({ selectedSectionId }: ManualTroubleshootingSectionProps) {
  // If a specific section is selected, only render that section
  if (selectedSectionId) {
    switch (selectedSectionId) {
      case 'sec-8-1':
        return <CommonIssuesSection />;
      case 'sec-8-2':
        return <BestPracticesSection />;
      case 'sec-8-3':
        return <SecurityAccessControlSection />;
      case 'sec-8-4':
        return <ComplianceAuditSection />;
      case 'sec-8-5':
        return <IntegrationTroubleshootingSection />;
      case 'sec-8-6':
        return <PerformanceOptimizationSection />;
      case 'sec-8-7':
        return <DataQualitySection />;
      case 'sec-8-8':
        return <EscalationProceduresSection />;
      default:
        break;
    }
  }

  // Default: render all sections
  return (
    <div className="space-y-8">
      <section id="sec-8-1" data-manual-anchor="sec-8-1" className="scroll-mt-32">
        <CommonIssuesSection />
      </section>
      <section id="sec-8-2" data-manual-anchor="sec-8-2" className="scroll-mt-32">
        <BestPracticesSection />
      </section>
      <section id="sec-8-3" data-manual-anchor="sec-8-3" className="scroll-mt-32">
        <SecurityAccessControlSection />
      </section>
      <section id="sec-8-4" data-manual-anchor="sec-8-4" className="scroll-mt-32">
        <ComplianceAuditSection />
      </section>
      <section id="sec-8-5" data-manual-anchor="sec-8-5" className="scroll-mt-32">
        <IntegrationTroubleshootingSection />
      </section>
      <section id="sec-8-6" data-manual-anchor="sec-8-6" className="scroll-mt-32">
        <PerformanceOptimizationSection />
      </section>
      <section id="sec-8-7" data-manual-anchor="sec-8-7" className="scroll-mt-32">
        <DataQualitySection />
      </section>
      <section id="sec-8-8" data-manual-anchor="sec-8-8" className="scroll-mt-32">
        <EscalationProceduresSection />
      </section>
    </div>
  );
}
