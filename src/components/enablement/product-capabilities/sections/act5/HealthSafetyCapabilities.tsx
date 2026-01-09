import { Shield, AlertTriangle, ClipboardCheck, Heart, HardHat, FileText } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { RegionalBadge } from "../../components/RegionalBadge";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export const HealthSafetyCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={Shield}
      title="Health & Safety (HSE)"
      tagline="Proactive safety management with compliance built-in"
      overview="Comprehensive occupational health and safety management from incident reporting to wellness programs. Maintain regulatory compliance while fostering a culture of safety."
      accentColor="red"
    >
      <CapabilityCategory title="Incident Management" icon={AlertTriangle}>
        <li>Multi-channel incident reporting (web, mobile, kiosk)</li>
        <li>Investigation workflow with root cause analysis</li>
        <li>Corrective action tracking and verification</li>
        <li>Witness statement collection</li>
        <li>Incident classification and severity rating</li>
        <li>Near-miss reporting and trending</li>
      </CapabilityCategory>

      <CapabilityCategory title="Risk Assessment" icon={ClipboardCheck}>
        <li>Hazard identification workflows</li>
        <li>Risk matrices with likelihood/severity scoring</li>
        <li>Control measure documentation</li>
        <li>Residual risk tracking</li>
        <li>Job safety analysis (JSA) templates</li>
        <li>Risk register management</li>
      </CapabilityCategory>

      <CapabilityCategory title="Inspections & Audits" icon={FileText}>
        <li>Scheduled inspection management</li>
        <li>Customizable inspection checklists</li>
        <li>Finding tracking and resolution</li>
        <li>Photo and evidence attachments</li>
        <li>Compliance audit scheduling</li>
        <li>Corrective action follow-up</li>
      </CapabilityCategory>

      <CapabilityCategory title="PPE Management" icon={HardHat}>
        <li>PPE assignment by role/location</li>
        <li>Inventory tracking and reorder alerts</li>
        <li>Maintenance and inspection records</li>
        <li>Expiry date monitoring</li>
        <li>Employee acknowledgment tracking</li>
      </CapabilityCategory>

      <CapabilityCategory title="Wellness Programs" icon={Heart}>
        <li>Health screening management</li>
        <li>Ergonomic assessment tracking</li>
        <li>Fitness and wellness program enrollment</li>
        <li>Mental health resources</li>
        <li>Return-to-work program management</li>
      </CapabilityCategory>

      <CapabilityCategory title="Emergency Management" icon={Shield}>
        <li>Emergency response plan documentation</li>
        <li>Drill scheduling and execution tracking</li>
        <li>Emergency contact trees</li>
        <li>Evacuation procedure management</li>
        <li>Crisis communication templates</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Incident likelihood prediction by location/role</AICapability>
        <AICapability type="prescriptive">Risk mitigation recommendations</AICapability>
        <AICapability type="automated">Compliance deadline alerts and escalations</AICapability>
      </AIFeatureHighlight>

      <RegionalBadge regions={["Caribbean", "Africa"]}>
        OSHA compliance reporting, regional health & safety regulations, and multi-country incident classification standards
      </RegionalBadge>

      <ModuleIntegrations
        integrations={[
          { module: "Workforce", description: "Employee job and location data" },
          { module: "Time & Attendance", description: "Work hours for exposure tracking" },
          { module: "Learning", description: "Safety training compliance" }
        ]}
      />
    </ModuleCapabilityCard>
  );
};
