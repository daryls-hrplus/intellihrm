import { Clock, GitBranch } from 'lucide-react';
import {
  NineBoxOverview,
  NineBoxRatingSources,
  NineBoxSignalMappings,
  NineBoxIndicatorLabels,
  NineBoxPerformanceAxis,
  NineBoxPotentialAxis,
  NineBoxAssessmentWorkflow,
  NineBoxEvidenceAudit
} from './sections/ninebox';

export function SuccessionNineBoxSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-3" data-manual-anchor="part-3" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <GitBranch className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">3. Nine-Box Assessment Configuration</h2>
            <p className="text-muted-foreground">
              Complete Nine-Box grid setup including rating sources, signal mappings, axis configuration, quadrant labels, and assessment workflows
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~140 min read
          </span>
          <span>Target: Admin, Consultant</span>
        </div>
      </section>

      {/* Section 3.1: Nine-Box Model Overview */}
      <section id="sec-3-1" data-manual-anchor="sec-3-1" className="scroll-mt-32">
        <NineBoxOverview />
      </section>

      {/* Section 3.2: Rating Sources Configuration */}
      <section id="sec-3-2" data-manual-anchor="sec-3-2" className="scroll-mt-32">
        <NineBoxRatingSources />
      </section>

      {/* Section 3.3: Signal Mappings */}
      <section id="sec-3-3" data-manual-anchor="sec-3-3" className="scroll-mt-32">
        <NineBoxSignalMappings />
      </section>

      {/* Section 3.4: Box Labels & Descriptions */}
      <section id="sec-3-4" data-manual-anchor="sec-3-4" className="scroll-mt-32">
        <NineBoxIndicatorLabels />
      </section>

      {/* Section 3.5: Performance Axis Configuration */}
      <section id="sec-3-5" data-manual-anchor="sec-3-5" className="scroll-mt-32">
        <NineBoxPerformanceAxis />
      </section>

      {/* Section 3.6: Potential Axis Configuration */}
      <section id="sec-3-6" data-manual-anchor="sec-3-6" className="scroll-mt-32">
        <NineBoxPotentialAxis />
      </section>

      {/* Section 3.7: Nine-Box Assessment Workflow */}
      <section id="sec-3-7" data-manual-anchor="sec-3-7" className="scroll-mt-32">
        <NineBoxAssessmentWorkflow />
      </section>

      {/* Section 3.8: Evidence & Audit Trail */}
      <section id="sec-3-8" data-manual-anchor="sec-3-8" className="scroll-mt-32">
        <NineBoxEvidenceAudit />
      </section>
    </div>
  );
}
