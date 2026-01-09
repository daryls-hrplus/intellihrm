import { User, FileText, Clock, Target, Bell, CreditCard } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";

export function ESSCapabilities() {
  return (
    <ModuleCapabilityCard
      id="ess"
      icon={User}
      title="Employee Self-Service (ESS)"
      tagline="Empower employees with 24/7 HR access"
      overview="Comprehensive self-service portal enabling employees to manage their personal information, time, pay, and career development independently."
      accentColor="bg-emerald-500/10 text-emerald-500"
      badge="30+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Personal Information" icon={User}>
            <CapabilityItem>Profile and contact management</CapabilityItem>
            <CapabilityItem>Emergency contact updates</CapabilityItem>
            <CapabilityItem>Photo upload and management</CapabilityItem>
            <CapabilityItem>Banking details (with approval)</CapabilityItem>
            <CapabilityItem>Dependents and beneficiaries</CapabilityItem>
            <CapabilityItem>Government ID viewing</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Time & Leave" icon={Clock}>
            <CapabilityItem>Clock in/out with geofencing</CapabilityItem>
            <CapabilityItem>Leave request submission</CapabilityItem>
            <CapabilityItem>Balance viewing and projections</CapabilityItem>
            <CapabilityItem>Schedule and shift viewing</CapabilityItem>
            <CapabilityItem>Timesheet submission</CapabilityItem>
            <CapabilityItem>Team calendar access</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Pay & Benefits" icon={CreditCard}>
            <CapabilityItem>Payslip viewing and download</CapabilityItem>
            <CapabilityItem>Tax document access</CapabilityItem>
            <CapabilityItem>Benefit election management</CapabilityItem>
            <CapabilityItem>Claims submission</CapabilityItem>
            <CapabilityItem>Total rewards statement</CapabilityItem>
            <CapabilityItem>Expense claim submission</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Career & Development" icon={Target}>
            <CapabilityItem>Goals viewing and progress</CapabilityItem>
            <CapabilityItem>Training enrollment</CapabilityItem>
            <CapabilityItem>Internal job applications</CapabilityItem>
            <CapabilityItem>Skill profile management</CapabilityItem>
            <CapabilityItem>Development plan access</CapabilityItem>
            <CapabilityItem>Feedback submission</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight compact>
          <AICapability type="prescriptive">Personalized dashboard with smart task prioritization</AICapability>
          <AICapability type="conversational">AI chatbot for HR questions and policy lookup</AICapability>
        </AIFeatureHighlight>
      </div>
    </ModuleCapabilityCard>
  );
}
