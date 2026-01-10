import { Target, TrendingUp, BarChart3, Users, CheckCircle, Link, AlertTriangle } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const GoalsCapabilities = () => {
  const outcomes = [
    { metric: "95%+", label: "Goal Alignment", description: "Cascading visibility to strategy" },
    { metric: "80%+", label: "Goal Completion", description: "AI coaching + milestones" },
    { metric: "SMART", label: "Goal Quality", description: "AI quality assessments" },
    { metric: "Real-time", label: "Manager Visibility", description: "Progress dashboards" },
  ];

  const personas = [
    { role: "Employee", value: "I know exactly how my work connects to company success" },
    { role: "Manager", value: "I see goal progress without asking for status updates" },
    { role: "HR Leader", value: "Goals drive performance conversations, not paperwork" },
    { role: "Executive", value: "Strategic priorities cascade to every team" },
  ];

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
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Goals set in January are forgotten by March. Strategic objectives never cascade to frontline teams. Individual efforts don't connect to company priorities. Without goal alignment, organizations waste resources on work that doesn't matter—while critical objectives go unmet."
          promise="Intelli HRM Goals Management connects every individual effort to organizational strategy. From OKRs to SMART goals, from cascading alignment to real-time progress tracking, every goal is visible, measurable, and connected. AI-powered coaching helps employees set better goals and stay on track."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Goal Frameworks & Configuration" icon={Target}>
            <CapabilityItem>OKR (Objectives & Key Results) framework support</CapabilityItem>
            <CapabilityItem>SMART goal framework with validation</CapabilityItem>
            <CapabilityItem>Goal cycle configuration (annual, quarterly, continuous)</CapabilityItem>
            <CapabilityItem>Goal template library for common objectives</CapabilityItem>
            <CapabilityItem>Weighting and priority rules per goal type</CapabilityItem>
            <CapabilityItem>Goal rating scale configuration (1-5, percentage, etc.)</CapabilityItem>
            <CapabilityItem>Goal approval workflow configuration</CapabilityItem>
            <CapabilityItem>Locking rules by cycle phase (draft, active, closed)</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Goal Creation & Management" icon={CheckCircle}>
            <CapabilityItem>Individual and team goal creation</CapabilityItem>
            <CapabilityItem>Goal duplication and template application</CapabilityItem>
            <CapabilityItem>Goal ownership assignment (single and multi-owner)</CapabilityItem>
            <CapabilityItem>Multi-owner goal support with shared accountability</CapabilityItem>
            <CapabilityItem>Goal visibility rules (private, team, public)</CapabilityItem>
            <CapabilityItem>Goal tagging and categorization</CapabilityItem>
            <CapabilityItem>Draft and publish workflows with review</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Goal Alignment & Cascading" icon={Link}>
            <CapabilityItem>Cascading goals from company strategy to individual</CapabilityItem>
            <CapabilityItem>Parent-child goal linking with inheritance</CapabilityItem>
            <CapabilityItem>Alignment visualization (tree view, network view)</CapabilityItem>
            <CapabilityItem>Cross-team goal connections and dependencies</CapabilityItem>
            <CapabilityItem>Department and division goal dashboards</CapabilityItem>
            <CapabilityItem>Company-wide goal visibility for transparency</CapabilityItem>
            <CapabilityItem>Alignment gap detection and alerts</CapabilityItem>
            <CapabilityItem>Strategic objective tracking across levels</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Progress & Milestones" icon={TrendingUp}>
            <CapabilityItem>Milestone configuration with due dates</CapabilityItem>
            <CapabilityItem>Progress tracking with percentage completion</CapabilityItem>
            <CapabilityItem>Sub-metric value tracking (KPIs within goals)</CapabilityItem>
            <CapabilityItem>Check-in scheduling (weekly, bi-weekly, monthly)</CapabilityItem>
            <CapabilityItem>Progress override rules for exceptions</CapabilityItem>
            <CapabilityItem>Completion criteria configuration</CapabilityItem>
            <CapabilityItem>Evidence and artifact attachment</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Goal Quality & Coaching" icon={AlertTriangle}>
            <CapabilityItem>SMART quality assessments with scoring</CapabilityItem>
            <CapabilityItem>AI-powered goal coaching nudges</CapabilityItem>
            <CapabilityItem>Goal risk assessments (off-track, at-risk, on-track)</CapabilityItem>
            <CapabilityItem>Goal improvement suggestions from AI</CapabilityItem>
            <CapabilityItem>Writing quality analysis for clarity</CapabilityItem>
            <CapabilityItem>Goal interview and review support</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Goal Dependencies & Adjustments" icon={Users}>
            <CapabilityItem>Goal dependencies tracking across teams</CapabilityItem>
            <CapabilityItem>Goal adjustment workflows with approval</CapabilityItem>
            <CapabilityItem>Change audit trail for all modifications</CapabilityItem>
            <CapabilityItem>Mid-cycle goal modifications with justification</CapabilityItem>
            <CapabilityItem>Goal cancellation with impact analysis</CapabilityItem>
            <CapabilityItem>Dependency impact alerts when goals change</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Goal Analytics" icon={BarChart3}>
            <CapabilityItem>Goal completion dashboards by period</CapabilityItem>
            <CapabilityItem>Alignment metrics and coverage analysis</CapabilityItem>
            <CapabilityItem>Progress trend analysis across cycles</CapabilityItem>
            <CapabilityItem>Department and team comparison views</CapabilityItem>
            <CapabilityItem>AI-powered goal insights and recommendations</CapabilityItem>
            <CapabilityItem>Goal achievement distribution reports</CapabilityItem>
            <CapabilityItem>Cycle-over-cycle performance comparison</CapabilityItem>
          </CapabilityCategory>
        </div>

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
      </div>
    </ModuleCapabilityCard>
  );
};
