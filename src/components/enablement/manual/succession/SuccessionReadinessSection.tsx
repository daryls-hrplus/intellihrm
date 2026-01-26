// Chapter 4: Readiness Assessment Workflow
// Operational lifecycle from initiation through completion

import { Target, Clock } from 'lucide-react';
import {
  ReadinessOverview,
  ReadinessEventCreation,
  ReadinessFormSelection,
  ReadinessManagerWorkflow,
  ReadinessHRWorkflow,
  ReadinessExecutiveWorkflow,
  ReadinessScoreCalculation,
  ReadinessCompletion
} from './sections/readiness';

export function SuccessionReadinessSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-4" data-manual-anchor="part-4" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Target className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">4. Readiness Assessment Workflow</h2>
            <p className="text-muted-foreground">
              Execute readiness assessments from initiation through completion, including multi-assessor workflows, score calculation, and candidate updates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~120 min read
          </span>
          <span>Target: Admin, HR Partner, Manager</span>
        </div>
      </section>

      {/* Section 4.1: Readiness Assessment Overview */}
      <section id="sec-4-1" data-manual-anchor="sec-4-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">4.1 Readiness Assessment Overview</h3>
          <p className="text-sm text-muted-foreground">Lifecycle, roles, strategic value, cross-module integration</p>
        </div>
        <ReadinessOverview />
      </section>

      {/* Section 4.2: Assessment Event Creation */}
      <section id="sec-4-2" data-manual-anchor="sec-4-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">4.2 Assessment Event Creation</h3>
          <p className="text-sm text-muted-foreground">Initiate assessments, workflow integration</p>
        </div>
        <ReadinessEventCreation />
      </section>

      {/* Section 4.3: Form Selection & Assignment */}
      <section id="sec-4-3" data-manual-anchor="sec-4-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">4.3 Form Selection & Assignment</h3>
          <p className="text-sm text-muted-foreground">Staff type matching, auto-detect logic</p>
        </div>
        <ReadinessFormSelection />
      </section>

      {/* Section 4.4: Manager Assessment Workflow */}
      <section id="sec-4-4" data-manual-anchor="sec-4-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">4.4 Manager Assessment Workflow</h3>
          <p className="text-sm text-muted-foreground">Direct manager completion, UI walkthrough</p>
        </div>
        <ReadinessManagerWorkflow />
      </section>

      {/* Section 4.5: HR Assessment Workflow */}
      <section id="sec-4-5" data-manual-anchor="sec-4-5" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">4.5 HR Assessment Workflow</h3>
          <p className="text-sm text-muted-foreground">HR Partner review, variance detection</p>
        </div>
        <ReadinessHRWorkflow />
      </section>

      {/* Section 4.6: Executive Assessment Workflow */}
      <section id="sec-4-6" data-manual-anchor="sec-4-6" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">4.6 Executive Assessment Workflow</h3>
          <p className="text-sm text-muted-foreground">Optional executive layer, calibration</p>
        </div>
        <ReadinessExecutiveWorkflow />
      </section>

      {/* Section 4.7: Score Calculation & Band Assignment */}
      <section id="sec-4-7" data-manual-anchor="sec-4-7" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">4.7 Score Calculation & Band Assignment</h3>
          <p className="text-sm text-muted-foreground">Weighted average, band mapping</p>
        </div>
        <ReadinessScoreCalculation />
      </section>

      {/* Section 4.8: Assessment Completion & Candidate Update */}
      <section id="sec-4-8" data-manual-anchor="sec-4-8" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">4.8 Assessment Completion & Candidate Update</h3>
          <p className="text-sm text-muted-foreground">Finalization, audit trail, sync</p>
        </div>
        <ReadinessCompletion />
      </section>
    </div>
  );
}
