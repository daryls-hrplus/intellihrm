import {
  WorkflowCycleLifecycle,
  WorkflowParticipantEnrollment,
  WorkflowSelfAssessment,
  WorkflowGoalRating,
  WorkflowResponsibilityAssessment,
  WorkflowCompetencyAssessment,
  WorkflowValuesAssessment,
  WorkflowManagerEvaluation,
  WorkflowInterviewScheduling,
  WorkflowEmployeeResponse,
  WorkflowRoleChangeHandling,
  WorkflowFinalization,
  WorkflowRatingRelease,
  WorkflowRatingDispute
} from './sections/workflows';

export function ManualWorkflowsSection() {
  return (
    <div className="space-y-8">
      <section id="sec-3-1" data-manual-anchor="sec-3-1" className="scroll-mt-32">
        <WorkflowCycleLifecycle />
      </section>
      <section id="sec-3-2" data-manual-anchor="sec-3-2" className="scroll-mt-32">
        <WorkflowParticipantEnrollment />
      </section>
      <section id="sec-3-3" data-manual-anchor="sec-3-3" className="scroll-mt-32">
        <WorkflowSelfAssessment />
      </section>
      <section id="sec-3-4" data-manual-anchor="sec-3-4" className="scroll-mt-32">
        <WorkflowGoalRating />
      </section>
      <section id="sec-3-5" data-manual-anchor="sec-3-5" className="scroll-mt-32">
        <WorkflowResponsibilityAssessment />
      </section>
      <section id="sec-3-5a" data-manual-anchor="sec-3-5a" className="scroll-mt-32">
        <WorkflowCompetencyAssessment />
      </section>
      <section id="sec-3-6" data-manual-anchor="sec-3-6" className="scroll-mt-32">
        <WorkflowValuesAssessment />
      </section>
      <section id="sec-3-7" data-manual-anchor="sec-3-7" className="scroll-mt-32">
        <WorkflowManagerEvaluation />
      </section>
      <section id="sec-3-8" data-manual-anchor="sec-3-8" className="scroll-mt-32">
        <WorkflowInterviewScheduling />
      </section>
      <section id="sec-3-9" data-manual-anchor="sec-3-9" className="scroll-mt-32">
        <WorkflowEmployeeResponse />
      </section>
      <section id="sec-3-10" data-manual-anchor="sec-3-10" className="scroll-mt-32">
        <WorkflowRoleChangeHandling />
      </section>
      <section id="sec-3-11" data-manual-anchor="sec-3-11" className="scroll-mt-32">
        <WorkflowFinalization />
      </section>
      <section id="sec-3-12" data-manual-anchor="sec-3-12" className="scroll-mt-32">
        <WorkflowRatingRelease />
      </section>
      <section id="sec-3-13" data-manual-anchor="sec-3-13" className="scroll-mt-32">
        <WorkflowRatingDispute />
      </section>
    </div>
  );
}
