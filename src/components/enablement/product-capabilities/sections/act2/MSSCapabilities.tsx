import { Users, CheckSquare, Target, TrendingUp, Bell, BarChart3 } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";

export function MSSCapabilities() {
  return (
    <ModuleCapabilityCard
      id="mss"
      icon={Users}
      title="Manager Self-Service (MSS)"
      tagline="Equip managers with real-time team insights"
      overview="Unified manager portal providing team oversight, approval workflows, performance management, and workforce action capabilities."
      accentColor="bg-emerald-500/10 text-emerald-500"
      badge="35+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Team Overview" icon={Users}>
            <CapabilityItem>Team org chart and headcount</CapabilityItem>
            <CapabilityItem>Attendance summary dashboard</CapabilityItem>
            <CapabilityItem>Leave calendar visualization</CapabilityItem>
            <CapabilityItem>Direct reports management</CapabilityItem>
            <CapabilityItem>Team member profiles</CapabilityItem>
            <CapabilityItem>Vacancy and open position tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Unified Approvals" icon={CheckSquare}>
            <CapabilityItem>Consolidated approval inbox</CapabilityItem>
            <CapabilityItem>Leave and time-off approvals</CapabilityItem>
            <CapabilityItem>Expense and claims approvals</CapabilityItem>
            <CapabilityItem>Training request approvals</CapabilityItem>
            <CapabilityItem>Requisition approvals</CapabilityItem>
            <CapabilityItem>Bulk approval actions</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Performance Management" icon={Target}>
            <CapabilityItem>Team goal tracking and progress</CapabilityItem>
            <CapabilityItem>Feedback and recognition tools</CapabilityItem>
            <CapabilityItem>Performance review initiation</CapabilityItem>
            <CapabilityItem>Calibration session input</CapabilityItem>
            <CapabilityItem>PIP creation and tracking</CapabilityItem>
            <CapabilityItem>1-on-1 meeting scheduling</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Workforce Actions" icon={TrendingUp}>
            <CapabilityItem>Promotion and transfer requests</CapabilityItem>
            <CapabilityItem>Compensation change requests</CapabilityItem>
            <CapabilityItem>Disciplinary action initiation</CapabilityItem>
            <CapabilityItem>Termination requests</CapabilityItem>
            <CapabilityItem>Onboarding task management</CapabilityItem>
            <CapabilityItem>Offboarding coordination</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight compact>
          <AICapability type="predictive">Team attrition and burnout risk alerts</AICapability>
          <AICapability type="prescriptive">Coaching recommendations based on team dynamics</AICapability>
          <AICapability type="analytics">Workload distribution insights</AICapability>
        </AIFeatureHighlight>
      </div>
    </ModuleCapabilityCard>
  );
}
