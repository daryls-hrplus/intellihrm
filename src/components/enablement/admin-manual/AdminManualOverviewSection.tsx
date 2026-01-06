import {
  AdminOverviewIntroduction,
  AdminOverviewCoreConcepts,
  AdminOverviewArchitecture,
  AdminOverviewPersonas,
  AdminOverviewSecurityCalendar
} from './sections/overview';

export function AdminManualOverviewSection() {
  return (
    <div className="space-y-8">
      <AdminOverviewIntroduction />
      <AdminOverviewCoreConcepts />
      <AdminOverviewArchitecture />
      <AdminOverviewPersonas />
      <AdminOverviewSecurityCalendar />
    </div>
  );
}
