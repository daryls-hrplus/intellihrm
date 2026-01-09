import { Scale, FileText, Users, AlertCircle, Handshake, LogOut } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { RegionalBadge } from "../../components/RegionalBadge";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export const EmployeeRelationsCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={Scale}
      title="Employee Relations"
      tagline="Fair, consistent, and compliant employee management"
      overview="Manage the full spectrum of employee relations from grievances to disciplinary actions. Ensure fair treatment, maintain compliance, and support positive workplace relationships."
      accentColor="red"
    >
      <CapabilityCategory title="Case Management" icon={FileText}>
        <li>Centralized case tracking system</li>
        <li>Investigation workflow management</li>
        <li>Evidence and document collection</li>
        <li>Timeline and milestone tracking</li>
        <li>Resolution documentation</li>
        <li>Case categorization and trending</li>
      </CapabilityCategory>

      <CapabilityCategory title="Grievance Management" icon={AlertCircle}>
        <li>Multi-channel grievance submission</li>
        <li>Escalation path configuration</li>
        <li>Mediation scheduling and tracking</li>
        <li>Outcome documentation</li>
        <li>Appeal process management</li>
        <li>SLA monitoring and alerts</li>
      </CapabilityCategory>

      <CapabilityCategory title="Disciplinary Management" icon={Scale}>
        <li>Progressive discipline framework</li>
        <li>Warning letter generation</li>
        <li>Hearing scheduling and documentation</li>
        <li>Appeal process workflows</li>
        <li>Policy violation tracking</li>
        <li>Corrective action monitoring</li>
      </CapabilityCategory>

      <CapabilityCategory title="Union & Labor Relations" icon={Users}>
        <li>Collective bargaining agreement (CBA) tracking</li>
        <li>Union dues management</li>
        <li>Grievance handling per CBA terms</li>
        <li>Negotiation documentation</li>
        <li>Union representative management</li>
      </CapabilityCategory>

      <CapabilityCategory title="Industrial Relations" icon={Handshake}>
        <li>Labor dispute tracking</li>
        <li>Agreement version control</li>
        <li>Compliance monitoring</li>
        <li>Work council management</li>
        <li>Industrial action documentation</li>
      </CapabilityCategory>

      <CapabilityCategory title="Exit Management" icon={LogOut}>
        <li>Resignation processing workflows</li>
        <li>Exit interview scheduling and forms</li>
        <li>Clearance checklist management</li>
        <li>Final settlement tracking</li>
        <li>Knowledge transfer documentation</li>
        <li>Alumni network management</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Case outcome probability scoring</AICapability>
        <AICapability type="prescriptive">Escalation recommendations based on case type</AICapability>
        <AICapability type="automated">Sentiment analysis in exit interview feedback</AICapability>
      </AIFeatureHighlight>

      <RegionalBadge regions={["Caribbean", "Africa"]}>
        Regional labor law compliance, statutory termination requirements, and industrial relations frameworks
      </RegionalBadge>

      <ModuleIntegrations
        integrations={[
          { module: "Workforce", description: "Employee and manager data" },
          { module: "Payroll", description: "Final settlement calculations" },
          { module: "Company Property", description: "Asset return tracking" }
        ]}
      />
    </ModuleCapabilityCard>
  );
};
