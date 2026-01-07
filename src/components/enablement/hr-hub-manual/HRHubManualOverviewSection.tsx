import {
  HRHubIntroduction,
  HRHubConcepts,
  HRHubArchitecture,
  HRHubPersonas
} from './sections/overview';

export function HRHubManualOverviewSection() {
  return (
    <div className="space-y-8">
      <HRHubIntroduction />
      <HRHubConcepts />
      <HRHubArchitecture />
      <HRHubPersonas />
    </div>
  );
}
