import {
  LndIntroduction,
  LndCoreConcepts,
  LndPersonas,
  LndArchitecture,
  LndCalendar,
  LndLegacyMigration
} from './sections/overview';

export function LndOverviewSection() {
  return (
    <div className="space-y-12">
      <LndIntroduction />
      <LndCoreConcepts />
      <LndPersonas />
      <LndArchitecture />
      <LndCalendar />
      <LndLegacyMigration />
    </div>
  );
}
