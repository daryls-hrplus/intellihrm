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
      <CommonIssuesSection />
      <BestPracticesSection />
      <SecurityAccessControlSection />
      <ComplianceAuditSection />
      <IntegrationTroubleshootingSection />
      <PerformanceOptimizationSection />
      <DataQualitySection />
      <EscalationProceduresSection />
    </div>
  );
}
