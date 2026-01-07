import {
  WorkforceOverviewIntroduction,
  WorkforceOverviewCoreConcepts,
  WorkforceOverviewArchitecture,
  WorkforceOverviewPersonas,
  WorkforceOverviewCalendar
} from './sections/overview';

export function WorkforceManualOverviewSection() {
  return (
    <div className="space-y-8">
      <WorkforceOverviewIntroduction />
      <WorkforceOverviewCoreConcepts />
      <WorkforceOverviewArchitecture />
      <WorkforceOverviewPersonas />
      <WorkforceOverviewCalendar />
    </div>
  );
}
