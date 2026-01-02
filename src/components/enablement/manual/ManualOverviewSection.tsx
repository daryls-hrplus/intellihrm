import { OverviewIntroduction } from './sections/OverviewIntroduction';
import { OverviewCoreConcepts } from './sections/OverviewCoreConcepts';
import { OverviewArchitecture } from './sections/OverviewArchitecture';
import { OverviewPersonas } from './sections/OverviewPersonas';
import { OverviewCalendar } from './sections/OverviewCalendar';

export function ManualOverviewSection() {
  return (
    <div className="space-y-8">
      {/* Section 1.1: Introduction */}
      <OverviewIntroduction />

      {/* Section 1.2: Core Concepts */}
      <OverviewCoreConcepts />

      {/* Section 1.3: System Architecture */}
      <OverviewArchitecture />

      {/* Section 1.4: User Personas & Journeys */}
      <OverviewPersonas />

      {/* Section 1.5: Performance Management Calendar */}
      <OverviewCalendar />
    </div>
  );
}
