import {
  LndIntegrationArchitecture,
  LndIntegrationOnboarding,
  LndIntegrationAppraisal,
  LndIntegrationCompetency,
  LndIntegrationSuccessionCareer,
  LndIntegrationWorkflow,
  LndIntegrationNotifications,
  LndIntegrationExternalLMS,
  LndIntegrationVirtualClassroom,
  LndIntegrationAPI,
  LndIntegrationAudit,
  LndIntegrationTroubleshooting
} from './sections/integration';

interface LndIntegrationSectionProps {
  sectionId?: string;
}

export function LndIntegrationSection({ sectionId }: LndIntegrationSectionProps) {
  // If a specific section is requested, render only that section
  if (sectionId) {
    const sectionMap: Record<string, React.ReactNode> = {
      'sec-8-1': <LndIntegrationArchitecture />,
      'sec-8-2': <LndIntegrationOnboarding />,
      'sec-8-3': <LndIntegrationAppraisal />,
      'sec-8-4': <LndIntegrationCompetency />,
      'sec-8-5': <LndIntegrationSuccessionCareer />,
      'sec-8-6': <LndIntegrationWorkflow />,
      'sec-8-7': <LndIntegrationNotifications />,
      'sec-8-8': <LndIntegrationExternalLMS />,
      'sec-8-9': <LndIntegrationVirtualClassroom />,
      'sec-8-10': <LndIntegrationAPI />,
      'sec-8-11': <LndIntegrationAudit />,
      'sec-8-12': <LndIntegrationTroubleshooting />,
    };
    return <>{sectionMap[sectionId] || null}</>;
  }

  // Render all sections
  return (
    <div className="space-y-12">
      <LndIntegrationArchitecture />
      <LndIntegrationOnboarding />
      <LndIntegrationAppraisal />
      <LndIntegrationCompetency />
      <LndIntegrationSuccessionCareer />
      <LndIntegrationWorkflow />
      <LndIntegrationNotifications />
      <LndIntegrationExternalLMS />
      <LndIntegrationVirtualClassroom />
      <LndIntegrationAPI />
      <LndIntegrationAudit />
      <LndIntegrationTroubleshooting />
    </div>
  );
}
