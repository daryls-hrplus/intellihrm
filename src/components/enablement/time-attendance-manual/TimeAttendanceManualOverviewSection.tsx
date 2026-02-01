import { 
  TAOverviewIntroduction,
  TAOverviewCoreConcepts,
  TAOverviewArchitecture,
  TAOverviewPersonas,
  TAOverviewCalendar,
  TAOverviewMigration,
  TAOverviewTermIndex,
  TAOverviewSecurityModel
} from './sections/overview';

export function TimeAttendanceManualOverviewSection() {
  return (
    <div className="space-y-8">
      {/* Section 1.1: Introduction */}
      <section id="ta-sec-1-1" data-manual-anchor="ta-sec-1-1" className="scroll-mt-32">
        <TAOverviewIntroduction />
      </section>

      {/* Section 1.2: Core Concepts & Terminology */}
      <section id="ta-sec-1-2" data-manual-anchor="ta-sec-1-2" className="scroll-mt-32">
        <TAOverviewCoreConcepts />
      </section>

      {/* Section 1.3: System Architecture */}
      <section id="ta-sec-1-3" data-manual-anchor="ta-sec-1-3" className="scroll-mt-32">
        <TAOverviewArchitecture />
      </section>

      {/* Section 1.4: User Personas & Journeys */}
      <section id="ta-sec-1-4" data-manual-anchor="ta-sec-1-4" className="scroll-mt-32">
        <TAOverviewPersonas />
      </section>

      {/* Section 1.5: Time Management Calendar */}
      <section id="ta-sec-1-5" data-manual-anchor="ta-sec-1-5" className="scroll-mt-32">
        <TAOverviewCalendar />
      </section>

      {/* Section 1.6: Legacy Migration Guide */}
      <section id="ta-sec-1-6" data-manual-anchor="ta-sec-1-6" className="scroll-mt-32">
        <TAOverviewMigration />
      </section>

      {/* Section 1.7: Terminology Index (A-Z) - NEW */}
      <section id="ta-sec-1-7" data-manual-anchor="ta-sec-1-7" className="scroll-mt-32">
        <TAOverviewTermIndex />
      </section>

      {/* Section 1.8: Security & Authorization Model - NEW */}
      <section id="ta-sec-1-8" data-manual-anchor="ta-sec-1-8" className="scroll-mt-32">
        <TAOverviewSecurityModel />
      </section>
    </div>
  );
}
