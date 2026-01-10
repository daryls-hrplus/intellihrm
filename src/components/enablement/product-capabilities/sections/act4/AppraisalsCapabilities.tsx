import { Award, FileText, Users, CheckCircle, Calendar, Shield, TrendingUp, BarChart3 } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const AppraisalsCapabilities = () => {
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
      <ValueStoryHeader
        challenge="Annual reviews are dreaded rituals that look backward instead of forward. Managers rush through forms, ratings are inconsistent, and feedback arrives too late to change anything. The process consumes weeks of productivity while delivering minimal value—and often damages relationships instead of developing people."
        promise="HRplus Performance Appraisals transforms evaluation from annual burden to development catalyst. Configurable review cycles, multi-section templates, competency-based ratings, and AI-assisted calibration ensure fair, consistent, and meaningful evaluations. Every appraisal becomes a growth conversation, not a judgment day."
        outcomes={[
          { metric: "98%+", label: "Review Completion", description: "Streamlined workflows" },
          { metric: "+40%", label: "Rating Consistency", description: "Calibration + AI bias detection" },
          { metric: "50%", label: "Faster Time-to-Complete", description: "Template + pre-population" },
          { metric: "85%+", label: "Employee Acceptance", description: "Fair, transparent process" },
        ]}
        personas={[
          { role: "Employee", value: "My review reflects my actual contributions and guides my growth" },
          { role: "Manager", value: "Templates and pre-populated data make reviews efficient" },
          { role: "HR Leader", value: "Calibration ensures fairness across the organization" },
          { role: "Compliance", value: "Every review is documented and defensible" },
        ]}
      />

      <CapabilityCategory title="Appraisal Cycle Management" icon={Calendar}>
        <li>Configurable appraisal cycles (annual, semi-annual, quarterly)</li>
        <li>Cycle phase management (planning, active, review, closed)</li>
        <li>Timeline and deadline configuration with reminders</li>
        <li>Participant enrollment rules by department, role, tenure</li>
        <li>Cycle template library for rapid configuration</li>
        <li>Multi-cycle support for different employee groups</li>
        <li>Cycle status tracking and completion dashboards</li>
        <li>Late submission handling with escalation</li>
      </CapabilityCategory>

      <CapabilityCategory title="Form Template Configuration" icon={FileText}>
        <li>Multi-section form builder with drag-and-drop</li>
        <li>Rating scale configuration (1-5, descriptive, etc.)</li>
        <li>Question library management and reuse</li>
        <li>Section weighting for overall score calculation</li>
        <li>Conditional section logic based on role or level</li>
        <li>Template versioning with change tracking</li>
        <li>Position-based templates for role-specific reviews</li>
        <li>Required vs. optional section configuration</li>
      </CapabilityCategory>

      <CapabilityCategory title="Competency-Based Evaluation" icon={Shield}>
        <li>Master competency library integration</li>
        <li>Competency level definitions (developing, proficient, expert)</li>
        <li>Behavioral anchor descriptions for each level</li>
        <li>Job-to-competency mappings for role-specific evaluation</li>
        <li>Competency rating capture with evidence</li>
        <li>Evidence collection and attachment</li>
        <li>Competency gap identification and reporting</li>
        <li>Historical competency rating tracking</li>
      </CapabilityCategory>

      <CapabilityCategory title="Review Execution" icon={CheckCircle}>
        <li>Self-assessment capture with guided prompts</li>
        <li>Manager evaluation workflow with due dates</li>
        <li>Score breakdown tracking by section</li>
        <li>Strengths identification and documentation</li>
        <li>Development gaps capture with action items</li>
        <li>Comment and narrative sections with AI suggestions</li>
        <li>Evidence attachment for accomplishments</li>
        <li>Save draft and resume later functionality</li>
      </CapabilityCategory>

      <CapabilityCategory title="Appraisal Interviews" icon={Users}>
        <li>Interview scheduling with calendar integration</li>
        <li>Interview preparation guides for managers</li>
        <li>Discussion point templates and prompts</li>
        <li>Interview notes capture during or after</li>
        <li>Action item documentation and tracking</li>
        <li>Follow-up scheduling and reminders</li>
        <li>Employee pre-meeting preparation forms</li>
      </CapabilityCategory>

      <CapabilityCategory title="Approvals & Sign-off" icon={Shield}>
        <li>Multi-level approval workflows (skip-level, HR review)</li>
        <li>Digital signature capture for final sign-off</li>
        <li>Employee acknowledgment with comments</li>
        <li>Escalation rules for overdue approvals</li>
        <li>Override capability with audit trail</li>
        <li>HR review checkpoints before finalization</li>
        <li>Bulk approval for managers with large teams</li>
        <li>Delegation support for approver absences</li>
      </CapabilityCategory>

      <CapabilityCategory title="Calibration Integration" icon={TrendingUp}>
        <li>Calibration session linking to appraisal cycle</li>
        <li>Rating adjustment tracking with justification</li>
        <li>Pre and post-calibration comparison views</li>
        <li>Calibration outcome integration into final ratings</li>
        <li>Manager alignment scoring across teams</li>
        <li>Rating distribution visualization</li>
        <li>Forced distribution enforcement (if configured)</li>
      </CapabilityCategory>

      <CapabilityCategory title="Appraisal Analytics" icon={BarChart3}>
        <li>Rating distribution analysis by department, level</li>
        <li>Completion tracking dashboards with drill-down</li>
        <li>Quality assessment metrics (comment length, specificity)</li>
        <li>Trend analysis across review cycles</li>
        <li>AI-powered review quality insights</li>
        <li>Manager consistency scoring</li>
        <li>Rating inflation/deflation detection</li>
        <li>Competency gap reporting across organization</li>
      </CapabilityCategory>

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
    </ModuleCapabilityCard>
  );
};
