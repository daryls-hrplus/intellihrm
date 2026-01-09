import { Clock, Calendar, MapPin, FileText, AlertTriangle, DollarSign } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { RegionalBadge } from "../../components/RegionalBadge";

export function TimeAttendanceCapabilities() {
  return (
    <ModuleCapabilityCard
      id="time-attendance"
      icon={Clock}
      title="Time & Attendance"
      tagline="Accurate time tracking with intelligent compliance"
      overview="Comprehensive time management with multiple clock methods, shift scheduling, overtime control, and seamless payroll integration."
      accentColor="bg-emerald-500/10 text-emerald-500"
      badge="50+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Clock Operations" icon={Clock}>
            <CapabilityItem>Web, mobile, and kiosk clocking</CapabilityItem>
            <CapabilityItem>Biometric device integration</CapabilityItem>
            <CapabilityItem>GPS and geofencing validation</CapabilityItem>
            <CapabilityItem>Offline clock support with sync</CapabilityItem>
            <CapabilityItem>Photo capture on clock</CapabilityItem>
            <CapabilityItem>Break tracking and enforcement</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Shift Management" icon={Calendar}>
            <CapabilityItem>Shift pattern configuration</CapabilityItem>
            <CapabilityItem>Rotation schedule management</CapabilityItem>
            <CapabilityItem>Shift swap requests</CapabilityItem>
            <CapabilityItem>Coverage planning tools</CapabilityItem>
            <CapabilityItem>Open shift broadcasting</CapabilityItem>
            <CapabilityItem>Schedule conflict detection</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Overtime Control" icon={AlertTriangle}>
            <CapabilityItem>Country-specific OT rules (1.5x/2x)</CapabilityItem>
            <CapabilityItem>Pre-approval workflows</CapabilityItem>
            <CapabilityItem>Budget and threshold alerts</CapabilityItem>
            <CapabilityItem>Compensatory time tracking</CapabilityItem>
            <CapabilityItem>Weekly/daily hour limits</CapabilityItem>
            <CapabilityItem>Overtime reports and analytics</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Compliance & Integration" icon={FileText}>
            <CapabilityItem>Work hour limit enforcement</CapabilityItem>
            <CapabilityItem>Audit trail for all changes</CapabilityItem>
            <CapabilityItem>Union rule compliance</CapabilityItem>
            <CapabilityItem>Automatic pay code mapping</CapabilityItem>
            <CapabilityItem>Exception processing</CapabilityItem>
            <CapabilityItem>Timesheet approval workflows</CapabilityItem>
          </CapabilityCategory>
        </div>

        <RegionalBadge regions={["Caribbean", "Africa"]}>
          Caribbean overtime rules (1.5x regular, 2x holidays), African shift patterns, regional public holiday calendars
        </RegionalBadge>

        <AIFeatureHighlight>
          <AICapability type="predictive">Overtime budget predictions and alerts</AICapability>
          <AICapability type="automated">Anomaly detection in clock patterns</AICapability>
          <AICapability type="prescriptive">Optimal scheduling suggestions</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Payroll", description: "Automatic hours and pay code transfer", bidirectional: true },
            { module: "Leave", description: "Absence integration and balance updates" },
            { module: "Wellness", description: "Burnout risk indicators from hours worked" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
