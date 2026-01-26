import { PlayCircle, Clock } from 'lucide-react';
import {
  SuccessionPlanningOverview,
  KeyPositionIdentification,
  PositionRiskAssessment,
  SuccessionPlanCreation,
  CandidateNominationRanking,
  ReadinessAssessmentIntegration,
  DevelopmentPlanManagement,
  GapDevelopmentLinking,
  CandidateEvidenceCollection,
  WorkflowApprovalConfiguration
} from './sections/successionplans';

export function SuccessionPlansSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-6" data-manual-anchor="part-6" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <PlayCircle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">6. Succession Planning Workflow</h2>
            <p className="text-muted-foreground">
              End-to-end succession planning from key position identification to development plan execution,
              including candidate management, evidence collection, and workflow approvals
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

      {/* Section 6.1: Overview */}
      <SuccessionPlanningOverview />

      {/* Section 6.2: Key Position Identification */}
      <KeyPositionIdentification />

      {/* Section 6.3: Position Risk Assessment */}
      <PositionRiskAssessment />

      {/* Section 6.4: Succession Plan Creation */}
      <SuccessionPlanCreation />

      {/* Section 6.5: Candidate Nomination & Ranking */}
      <CandidateNominationRanking />

      {/* Section 6.6: Readiness Assessment Integration */}
      <ReadinessAssessmentIntegration />

      {/* Section 6.7: Development Plan Management */}
      <DevelopmentPlanManagement />

      {/* Section 6.8: Gap-Development Linking */}
      <GapDevelopmentLinking />

      {/* Section 6.9: Candidate Evidence Collection */}
      <CandidateEvidenceCollection />

      {/* Section 6.10: Workflow & Approval Configuration */}
      <WorkflowApprovalConfiguration />
    </div>
  );
}
