import { Target, TrendingUp, BarChart3, Users, CheckCircle, Link, AlertTriangle } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const GoalsCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={Target}
      title="Goals Management"
      tagline="Connect every individual effort to organizational strategy"
      overview="From OKRs to SMART goals, from cascading alignment to real-time progress tracking, every goal is visible, measurable, and connected. AI-powered coaching helps employees set better goals and stay on track toward what matters most."
      accentColor="bg-amber-500/10 text-amber-600"
      badge="45+ Capabilities"
      id="goals"
    >
      <ValueStoryHeader
        challenge="Goals set in January are forgotten by March. Strategic objectives never cascade to frontline teams. Individual efforts don't connect to company priorities. Without goal alignment, organizations waste resources on work that doesn't matter—while critical objectives go unmet."
        promise="HRplus Goals Management connects every individual effort to organizational strategy. From OKRs to SMART goals, from cascading alignment to real-time progress tracking, every goal is visible, measurable, and connected. AI-powered coaching helps employees set better goals and stay on track."
        outcomes={[
          { metric: "95%+", label: "Goal Alignment", description: "Cascading visibility to strategy" },
          { metric: "80%+", label: "Goal Completion", description: "AI coaching + milestones" },
          { metric: "SMART", label: "Goal Quality", description: "AI quality assessments" },
          { metric: "Real-time", label: "Manager Visibility", description: "Progress dashboards" },
        ]}
        personas={[
          { role: "Employee", value: "I know exactly how my work connects to company success" },
          { role: "Manager", value: "I see goal progress without asking for status updates" },
          { role: "HR Leader", value: "Goals drive performance conversations, not paperwork" },
          { role: "Executive", value: "Strategic priorities cascade to every team" },
        ]}
      />

      <CapabilityCategory title="Goal Frameworks & Configuration" icon={Target}>
        <li>OKR (Objectives & Key Results) framework support</li>
        <li>SMART goal framework with validation</li>
        <li>Goal cycle configuration (annual, quarterly, continuous)</li>
        <li>Goal template library for common objectives</li>
        <li>Weighting and priority rules per goal type</li>
        <li>Goal rating scale configuration (1-5, percentage, etc.)</li>
        <li>Goal approval workflow configuration</li>
        <li>Locking rules by cycle phase (draft, active, closed)</li>
      </CapabilityCategory>

      <CapabilityCategory title="Goal Creation & Management" icon={CheckCircle}>
        <li>Individual and team goal creation</li>
        <li>Goal duplication and template application</li>
        <li>Goal ownership assignment (single and multi-owner)</li>
        <li>Multi-owner goal support with shared accountability</li>
        <li>Goal visibility rules (private, team, public)</li>
        <li>Goal tagging and categorization</li>
        <li>Draft and publish workflows with review</li>
        <li>Goal archiving and historical access</li>
      </CapabilityCategory>

      <CapabilityCategory title="Goal Alignment & Cascading" icon={Link}>
        <li>Cascading goals from company strategy to individual</li>
        <li>Parent-child goal linking with inheritance</li>
        <li>Alignment visualization (tree view, network view)</li>
        <li>Cross-team goal connections and dependencies</li>
        <li>Department and division goal dashboards</li>
        <li>Company-wide goal visibility for transparency</li>
        <li>Alignment gap detection and alerts</li>
        <li>Strategic objective tracking across levels</li>
      </CapabilityCategory>

      <CapabilityCategory title="Progress & Milestones" icon={TrendingUp}>
        <li>Milestone configuration with due dates</li>
        <li>Progress tracking with percentage completion</li>
        <li>Sub-metric value tracking (KPIs within goals)</li>
        <li>Check-in scheduling (weekly, bi-weekly, monthly)</li>
        <li>Progress override rules for exceptions</li>
        <li>Completion criteria configuration</li>
        <li>Evidence and artifact attachment</li>
        <li>Progress history and trend visualization</li>
      </CapabilityCategory>

      <CapabilityCategory title="Goal Quality & Coaching" icon={AlertTriangle}>
        <li>SMART quality assessments with scoring</li>
        <li>AI-powered goal coaching nudges</li>
        <li>Goal risk assessments (off-track, at-risk, on-track)</li>
        <li>Goal improvement suggestions from AI</li>
        <li>Writing quality analysis for clarity</li>
        <li>Goal interview and review support</li>
        <li>Best practice recommendations by goal type</li>
      </CapabilityCategory>

      <CapabilityCategory title="Goal Dependencies & Adjustments" icon={Users}>
        <li>Goal dependencies tracking across teams</li>
        <li>Goal adjustment workflows with approval</li>
        <li>Change audit trail for all modifications</li>
        <li>Mid-cycle goal modifications with justification</li>
        <li>Goal cancellation with impact analysis</li>
        <li>Dependency impact alerts when goals change</li>
      </CapabilityCategory>

      <CapabilityCategory title="Goal Analytics" icon={BarChart3}>
        <li>Goal completion dashboards by period</li>
        <li>Alignment metrics and coverage analysis</li>
        <li>Progress trend analysis across cycles</li>
        <li>Department and team comparison views</li>
        <li>AI-powered goal insights and recommendations</li>
        <li>Goal achievement distribution reports</li>
        <li>Cycle-over-cycle performance comparison</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Goal achievement likelihood scoring based on progress patterns</AICapability>
        <AICapability type="prescriptive">AI-suggested objectives based on role and company strategy</AICapability>
        <AICapability type="automated">Goal quality assessment with SMART improvement suggestions</AICapability>
        <AICapability type="predictive">Risk identification for off-track goals with intervention prompts</AICapability>
        <AICapability type="conversational">Natural language goal creation and refinement</AICapability>
      </AIFeatureHighlight>

      <ModuleIntegrations
        integrations={[
          { module: "Performance Appraisals", description: "Goal achievement feeds review ratings" },
          { module: "Compensation", description: "Goal completion drives variable pay" },
          { module: "Learning", description: "Skill goals link to training recommendations" },
          { module: "Succession Planning", description: "Leadership goal tracking for successors" },
        ]}
      />
    </ModuleCapabilityCard>
  );
};
