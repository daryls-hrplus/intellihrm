import { F360Introduction } from './sections/F360Introduction';
import { F360CoreConcepts } from './sections/F360CoreConcepts';
import { F360Personas } from './sections/F360Personas';
import { F360Architecture } from './sections/F360Architecture';
import { F360Calendar } from './sections/F360Calendar';

export function F360OverviewSection() {
  return (
    <div className="space-y-8">
      <section id="sec-1-1" data-manual-anchor="sec-1-1" className="scroll-mt-32">
        <F360Introduction />
      </section>

      <section id="sec-1-2" data-manual-anchor="sec-1-2" className="scroll-mt-32">
        <F360CoreConcepts />
      </section>

      <section id="sec-1-3" data-manual-anchor="sec-1-3" className="scroll-mt-32">
        <F360Personas />
      </section>

      <section id="sec-1-4" data-manual-anchor="sec-1-4" className="scroll-mt-32">
        <F360Architecture />
      </section>

      <section id="sec-1-5" data-manual-anchor="sec-1-5" className="scroll-mt-32">
        <F360Calendar />
      </section>
    </div>
  );
}
