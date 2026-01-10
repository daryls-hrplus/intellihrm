import { Award, FileText, Users, CheckCircle, Calendar, Shield, TrendingUp, BarChart3 } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const AppraisalsCapabilities = () => {
  const outcomes = [
    { metric: "98%+", label: "Review Completion", description: "Streamlined workflows" },
    { metric: "+40%", label: "Rating Consistency", description: "Calibration + AI bias detection" },
    { metric: "50%", label: "Faster Time-to-Complete", description: "Template + pre-population" },
    { metric: "85%+", label: "Employee Acceptance", description: "Fair, transparent process" },
  ];

  const personas = [
    { role: "Employee", value: "My review reflects my actual contributions and guides my growth" },
    { role: "Manager", value: "Templates and pre-populated data make reviews efficient" },
    { role: "HR Leader", value: "Calibration ensures fairness across the organization" },
    { role: "Compliance", value: "Every review is documented and defensible" },
  ];

  return (
    <ModuleCapabilityCard
      icon={Award}
      title="Performance Appraisals"
      tagline="Transform evaluation from annual burden to development catalyst"
      overview="Configurable review cycles, multi-section templates, competency-based ratings, and AI-assisted calibration ensure fair, consistent, and meaningful evaluations. Every appraisal becomes a growth conversation, not a judgment day."
      accentColor="bg-rose-500/10 text-rose-600"
      badge="50+ Capabilities"
      id="appraisals"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Annual reviews are dreaded rituals that look backward instead of forward. Managers rush through forms, ratings are inconsistent, and feedback arrives too late to change anything. The process consumes weeks of productivity while delivering minimal value—and often damages relationships instead of developing people."
          promise="HRplus Performance Appraisals transforms evaluation from annual burden to development catalyst. Configurable review cycles, multi-section templates, competency-based ratings, and AI-assisted calibration ensure fair, consistent, and meaningful evaluations. Every appraisal becomes a growth conversation, not a judgment day."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Appraisal Cycle Management" icon={Calendar}>
            <CapabilityItem>Configurable appraisal cycles (annual, semi-annual, quarterly)</CapabilityItem>
            <CapabilityItem>Cycle phase management (planning, active, review, closed)</CapabilityItem>
            <CapabilityItem>Timeline and deadline configuration with reminders</CapabilityItem>
            <CapabilityItem>Participant enrollment rules by department, role, tenure</CapabilityItem>
            <CapabilityItem>Cycle template library for rapid configuration</CapabilityItem>
            <CapabilityItem>Multi-cycle support for different employee groups</CapabilityItem>
            <CapabilityItem>Cycle status tracking and completion dashboards</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Form Template Configuration" icon={FileText}>
            <CapabilityItem>Multi-section form builder with drag-and-drop</CapabilityItem>
            <CapabilityItem>Rating scale configuration (1-5, descriptive, etc.)</CapabilityItem>
            <CapabilityItem>Question library management and reuse</CapabilityItem>
            <CapabilityItem>Section weighting for overall score calculation</CapabilityItem>
            <CapabilityItem>Conditional section logic based on role or level</CapabilityItem>
            <CapabilityItem>Template versioning with change tracking</CapabilityItem>
            <CapabilityItem>Position-based templates for role-specific reviews</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Competency-Based Evaluation" icon={Shield}>
            <CapabilityItem>Master competency library integration</CapabilityItem>
            <CapabilityItem>Competency level definitions (developing, proficient, expert)</CapabilityItem>
            <CapabilityItem>Behavioral anchor descriptions for each level</CapabilityItem>
            <CapabilityItem>Job-to-competency mappings for role-specific evaluation</CapabilityItem>
            <CapabilityItem>Competency rating capture with evidence</CapabilityItem>
            <CapabilityItem>Evidence collection and attachment</CapabilityItem>
            <CapabilityItem>Competency gap identification and reporting</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Review Execution" icon={CheckCircle}>
            <CapabilityItem>Self-assessment capture with guided prompts</CapabilityItem>
            <CapabilityItem>Manager evaluation workflow with due dates</CapabilityItem>
            <CapabilityItem>Score breakdown tracking by section</CapabilityItem>
            <CapabilityItem>Strengths identification and documentation</CapabilityItem>
            <CapabilityItem>Development gaps capture with action items</CapabilityItem>
            <CapabilityItem>Comment and narrative sections with AI suggestions</CapabilityItem>
            <CapabilityItem>Evidence attachment for accomplishments</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Appraisal Interviews" icon={Users}>
            <CapabilityItem>Interview scheduling with calendar integration</CapabilityItem>
            <CapabilityItem>Interview preparation guides for managers</CapabilityItem>
            <CapabilityItem>Discussion point templates and prompts</CapabilityItem>
            <CapabilityItem>Interview notes capture during or after</CapabilityItem>
            <CapabilityItem>Action item documentation and tracking</CapabilityItem>
            <CapabilityItem>Follow-up scheduling and reminders</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Approvals & Sign-off" icon={Shield}>
            <CapabilityItem>Multi-level approval workflows (skip-level, HR review)</CapabilityItem>
            <CapabilityItem>Digital signature capture for final sign-off</CapabilityItem>
            <CapabilityItem>Employee acknowledgment with comments</CapabilityItem>
            <CapabilityItem>Escalation rules for overdue approvals</CapabilityItem>
            <CapabilityItem>Override capability with audit trail</CapabilityItem>
            <CapabilityItem>HR review checkpoints before finalization</CapabilityItem>
            <CapabilityItem>Delegation support for approver absences</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Calibration Integration" icon={TrendingUp}>
            <CapabilityItem>Calibration session linking to appraisal cycle</CapabilityItem>
            <CapabilityItem>Rating adjustment tracking with justification</CapabilityItem>
            <CapabilityItem>Pre and post-calibration comparison views</CapabilityItem>
            <CapabilityItem>Calibration outcome integration into final ratings</CapabilityItem>
            <CapabilityItem>Manager alignment scoring across teams</CapabilityItem>
            <CapabilityItem>Rating distribution visualization</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Appraisal Analytics" icon={BarChart3}>
            <CapabilityItem>Rating distribution analysis by department, level</CapabilityItem>
            <CapabilityItem>Completion tracking dashboards with drill-down</CapabilityItem>
            <CapabilityItem>Quality assessment metrics (comment length, specificity)</CapabilityItem>
            <CapabilityItem>Trend analysis across review cycles</CapabilityItem>
            <CapabilityItem>AI-powered review quality insights</CapabilityItem>
            <CapabilityItem>Manager consistency scoring</CapabilityItem>
            <CapabilityItem>Competency gap reporting across organization</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="predictive">Bias detection in ratings and comments before finalization</AICapability>
          <AICapability type="prescriptive">Comment quality analysis with improvement suggestions</AICapability>
          <AICapability type="automated">Pre-populated performance summaries from continuous feedback</AICapability>
          <AICapability type="predictive">Rating consistency alerts for outlier detection</AICapability>
          <AICapability type="prescriptive">Development recommendation generation from gaps</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Goals Management", description: "Goal achievement feeds review ratings" },
            { module: "Continuous Performance", description: "Feedback and recognition inform evaluations" },
            { module: "Compensation", description: "Rating drives merit increase recommendations" },
            { module: "Succession Planning", description: "High performers identified for pipeline" },
            { module: "Learning", description: "Competency gaps trigger training recommendations" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
};
