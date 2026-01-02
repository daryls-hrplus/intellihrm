import {
  WorkflowCycleLifecycle,
  WorkflowParticipantEnrollment,
  WorkflowManagerEvaluation,
  WorkflowSelfAssessment,
  WorkflowGoalRating,
  WorkflowCompetencyAssessment,
  WorkflowEmployeeResponse,
  WorkflowInterviewScheduling,
  WorkflowRoleChangeHandling,
  WorkflowFinalization
} from './sections/workflows';

export function ManualWorkflowsSection() {
  return (
    <div className="space-y-8">
      <WorkflowCycleLifecycle />
      <WorkflowParticipantEnrollment />
      <WorkflowManagerEvaluation />
      <WorkflowSelfAssessment />
      <WorkflowGoalRating />
      <WorkflowCompetencyAssessment />
      <WorkflowEmployeeResponse />
      <WorkflowInterviewScheduling />
      <WorkflowRoleChangeHandling />
      <WorkflowFinalization />
    </div>
  );
}
