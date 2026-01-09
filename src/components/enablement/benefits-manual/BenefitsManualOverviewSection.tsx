import {
  BenefitsOverviewIntroduction,
  BenefitsOverviewCoreConcepts,
  BenefitsOverviewArchitecture,
  BenefitsOverviewPersonas,
  BenefitsOverviewCalendar
} from './sections/overview';

export function BenefitsManualOverviewSection() {
  return (
    <div className="space-y-8">
      <BenefitsOverviewIntroduction />
      <BenefitsOverviewCoreConcepts />
      <BenefitsOverviewArchitecture />
      <BenefitsOverviewPersonas />
      <BenefitsOverviewCalendar />
    </div>
  );
}
