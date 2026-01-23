import { OverviewIntroduction } from './sections/OverviewIntroduction';
import { OverviewCoreConcepts } from './sections/OverviewCoreConcepts';
import { OverviewArchitecture } from './sections/OverviewArchitecture';
import { OverviewPersonas } from './sections/OverviewPersonas';
import { OverviewCalendar } from './sections/OverviewCalendar';

export function ManualOverviewSection() {
  return (
    <div className="space-y-8">
      <section id="sec-1-1" data-manual-anchor="sec-1-1" className="scroll-mt-32">
        <OverviewIntroduction />
      </section>

      <section id="sec-1-2" data-manual-anchor="sec-1-2" className="scroll-mt-32">
        <OverviewCoreConcepts />
      </section>

      <section id="sec-1-3" data-manual-anchor="sec-1-3" className="scroll-mt-32">
        <OverviewPersonas />
      </section>

      <section id="sec-1-4" data-manual-anchor="sec-1-4" className="scroll-mt-32">
        <OverviewArchitecture />
      </section>

      <section id="sec-1-5" data-manual-anchor="sec-1-5" className="scroll-mt-32">
        <OverviewCalendar />
      </section>
    </div>
  );
}
