import { Clock, Settings } from 'lucide-react';
import {
  FoundationPrerequisites,
  FoundationAssessorTypes,
  FoundationAssessorAggregation,
  FoundationReadinessBands,
  FoundationReadinessIndicators,
  FoundationWeightNormalization,
  FoundationReadinessForms,
  FoundationStaffTypeMapping,
  FoundationAvailabilityReasons,
  FoundationCompanySettings
} from './sections/foundation';

export function SuccessionFoundationSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-2" data-manual-anchor="part-2" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Settings className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">2. Foundation Setup</h2>
            <p className="text-muted-foreground">
              Prerequisites, assessor types, readiness bands, indicators, forms, availability reasons, and company settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~99 min read
          </span>
          <span>Target: Admin, Consultant</span>
        </div>
      </section>

      <section id="sec-2-1" data-manual-anchor="sec-2-1" className="scroll-mt-32">
        <FoundationPrerequisites />
      </section>

      <section id="sec-2-2" data-manual-anchor="sec-2-2" className="scroll-mt-32">
        <FoundationAssessorTypes />
      </section>

      <section id="sec-2-2a" data-manual-anchor="sec-2-2a" className="scroll-mt-32">
        <FoundationAssessorAggregation />
      </section>

      <section id="sec-2-3" data-manual-anchor="sec-2-3" className="scroll-mt-32">
        <FoundationReadinessBands />
      </section>

      <section id="sec-2-4" data-manual-anchor="sec-2-4" className="scroll-mt-32">
        <FoundationReadinessIndicators />
      </section>

      <section id="sec-2-4a" data-manual-anchor="sec-2-4a" className="scroll-mt-32">
        <FoundationWeightNormalization />
      </section>

      <section id="sec-2-5" data-manual-anchor="sec-2-5" className="scroll-mt-32">
        <FoundationReadinessForms />
      </section>

      <section id="sec-2-5a" data-manual-anchor="sec-2-5a" className="scroll-mt-32">
        <FoundationStaffTypeMapping />
      </section>

      <section id="sec-2-6" data-manual-anchor="sec-2-6" className="scroll-mt-32">
        <FoundationAvailabilityReasons />
      </section>

      <section id="sec-2-7" data-manual-anchor="sec-2-7" className="scroll-mt-32">
        <FoundationCompanySettings />
      </section>
    </div>
  );
}
