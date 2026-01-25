import {
  WorkflowCycleLifecycle,
  WorkflowCycleCreation,
  WorkflowParticipantEnrollment,
  WorkflowPeerNomination,
  WorkflowRaterAssignment,
  WorkflowExternalRaters,
  WorkflowFeedbackCollection,
  WorkflowResponseMonitoring,
  WorkflowReminderManagement,
  WorkflowResultsProcessing,
  WorkflowResultsRelease,
  WorkflowInvestigationMode,
} from './sections/workflows';

export function F360WorkflowSection() {
  return (
    <div className="space-y-8">
      <section id="sec-3-1" data-manual-anchor="sec-3-1" className="scroll-mt-32">
        <WorkflowCycleLifecycle />
      </section>
      <section id="sec-3-2" data-manual-anchor="sec-3-2" className="scroll-mt-32">
        <WorkflowCycleCreation />
      </section>
      <section id="sec-3-3" data-manual-anchor="sec-3-3" className="scroll-mt-32">
        <WorkflowParticipantEnrollment />
      </section>
      <section id="sec-3-4" data-manual-anchor="sec-3-4" className="scroll-mt-32">
        <WorkflowPeerNomination />
      </section>
      <section id="sec-3-5" data-manual-anchor="sec-3-5" className="scroll-mt-32">
        <WorkflowRaterAssignment />
      </section>
      <section id="sec-3-6" data-manual-anchor="sec-3-6" className="scroll-mt-32">
        <WorkflowExternalRaters />
      </section>
      <section id="sec-3-7" data-manual-anchor="sec-3-7" className="scroll-mt-32">
        <WorkflowFeedbackCollection />
      </section>
      <section id="sec-3-8" data-manual-anchor="sec-3-8" className="scroll-mt-32">
        <WorkflowResponseMonitoring />
      </section>
      <section id="sec-3-9" data-manual-anchor="sec-3-9" className="scroll-mt-32">
        <WorkflowReminderManagement />
      </section>
      <section id="sec-3-10" data-manual-anchor="sec-3-10" className="scroll-mt-32">
        <WorkflowResultsProcessing />
      </section>
      <section id="sec-3-11" data-manual-anchor="sec-3-11" className="scroll-mt-32">
        <WorkflowResultsRelease />
      </section>
      <section id="sec-3-12" data-manual-anchor="sec-3-12" className="scroll-mt-32">
        <WorkflowInvestigationMode />
      </section>
    </div>
  );
}
