import { Clock, Calendar, MapPin, FileText, AlertTriangle, DollarSign, Settings, Smartphone, BarChart3, Users, Briefcase, Scale } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { RegionalBadge } from "../../components/RegionalBadge";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export function TimeAttendanceCapabilities() {
  return (
    <ModuleCapabilityCard
      id="time-attendance"
      icon={Clock}
      title="Time & Attendance"
      tagline="Accurate time tracking with intelligent compliance"
      overview="Comprehensive time management with multiple clock methods, geofencing validation, shift scheduling, overtime control, and seamless payroll integration—with AI-powered anomaly detection and compliance automation."
      accentColor="bg-emerald-500/10 text-emerald-500"
      badge="120+ Capabilities"
    >
      <div className="space-y-6">
        {/* Value Story Header */}
        <ValueStoryHeader
          challenge="Time theft, buddy punching, overtime abuse, and union compliance violations cost organizations millions annually. Manual timesheets are error-prone, shift scheduling is a nightmare, and payroll corrections consume weeks of HR time. Without accurate time data, labor costs spiral out of control."
          promise="HRplus Time & Attendance captures every hour with precision and intelligence. Multi-method clocking, geofencing validation, biometric verification, and AI-powered anomaly detection ensure accurate time records. Automated shift scheduling, overtime control, and seamless payroll integration transform time management from a liability into an asset."
          outcomes={[
            { metric: "99.9%", label: "Time Accuracy", description: "Geofencing + biometric verification" },
            { metric: "25%", label: "Overtime Costs Reduced", description: "Pre-approval + AI alerts" },
            { metric: "80%", label: "Faster Payroll Processing", description: "Automated time-to-pay flow" },
            { metric: "~0", label: "Compliance Violations", description: "Union rule automation" },
          ]}
          personas={[
            { role: "Employee", value: "Clocking is effortless, and my hours are always correct" },
            { role: "Supervisor", value: "I know exactly who's working and when, in real-time" },
            { role: "Payroll Administrator", value: "Time data flows to payroll without manual intervention" },
            { role: "HR Compliance Officer", value: "Labor law and CBA compliance is built-in, not bolted-on" },
          ]}
        />

        {/* Capability Categories */}
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Multi-Method Clocking" icon={Clock}>
            <CapabilityItem>Web, mobile, and kiosk clocking options</CapabilityItem>
            <CapabilityItem>Biometric device integration (fingerprint, facial recognition)</CapabilityItem>
            <CapabilityItem>GPS and geofencing validation with accuracy tracking</CapabilityItem>
            <CapabilityItem>Offline clock support with queue sync</CapabilityItem>
            <CapabilityItem>Photo capture on clock-in/out with face verification</CapabilityItem>
            <CapabilityItem>Break tracking with automatic enforcement</CapabilityItem>
            <CapabilityItem>Split shift and multi-punch support</CapabilityItem>
            <CapabilityItem>Project and task time allocation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Geofencing & Location" icon={MapPin}>
            <CapabilityItem>Geofence zone configuration with custom radius</CapabilityItem>
            <CapabilityItem>Multiple geofence support per location</CapabilityItem>
            <CapabilityItem>Geofence violation detection and alerts</CapabilityItem>
            <CapabilityItem>GPS accuracy tracking and validation</CapabilityItem>
            <CapabilityItem>Location history for compliance audits</CapabilityItem>
            <CapabilityItem>Remote work zone configuration</CapabilityItem>
            <CapabilityItem>Site-based clock restrictions</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Shift Management" icon={Calendar}>
            <CapabilityItem>Shift pattern configuration with templates</CapabilityItem>
            <CapabilityItem>Rotation schedule management</CapabilityItem>
            <CapabilityItem>Shift swap requests with approval workflow</CapabilityItem>
            <CapabilityItem>Coverage planning and gap detection</CapabilityItem>
            <CapabilityItem>Open shift broadcasting and bidding</CapabilityItem>
            <CapabilityItem>Schedule conflict detection</CapabilityItem>
            <CapabilityItem>Shift differentials by time/day configuration</CapabilityItem>
            <CapabilityItem>Shift rounding rules configuration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Overtime Control" icon={AlertTriangle}>
            <CapabilityItem>Country-specific OT rules (1.5x/2x/3x)</CapabilityItem>
            <CapabilityItem>Pre-approval workflows with budget check</CapabilityItem>
            <CapabilityItem>Budget and threshold alerts</CapabilityItem>
            <CapabilityItem>Weekly/daily hour limit enforcement</CapabilityItem>
            <CapabilityItem>Overtime risk alerts with trending analysis</CapabilityItem>
            <CapabilityItem>Overtime analytics and reporting</CapabilityItem>
            <CapabilityItem>Manager overtime dashboard</CapabilityItem>
            <CapabilityItem>Cost projection by overtime category</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Compensatory & Flex Time" icon={DollarSign}>
            <CapabilityItem>Compensatory time earning and tracking</CapabilityItem>
            <CapabilityItem>Comp time policy configuration</CapabilityItem>
            <CapabilityItem>Flex time balance management</CapabilityItem>
            <CapabilityItem>Flex time transactions with approval</CapabilityItem>
            <CapabilityItem>Time-in-lieu tracking</CapabilityItem>
            <CapabilityItem>Balance caps and expiry rules</CapabilityItem>
            <CapabilityItem>Flex schedule configuration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Union & CBA Compliance" icon={Scale}>
            <CapabilityItem>CBA agreement management and storage</CapabilityItem>
            <CapabilityItem>AI-powered CBA document parsing</CapabilityItem>
            <CapabilityItem>Union time rule configuration</CapabilityItem>
            <CapabilityItem>CBA rule simulation and testing</CapabilityItem>
            <CapabilityItem>Extension request workflow</CapabilityItem>
            <CapabilityItem>Unsupported rule tracking and alerts</CapabilityItem>
            <CapabilityItem>Complexity assessment scoring</CapabilityItem>
            <CapabilityItem>Union membership tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Attendance Policies & Exceptions" icon={Settings}>
            <CapabilityItem>Attendance policy configuration by group</CapabilityItem>
            <CapabilityItem>Exception detection and processing</CapabilityItem>
            <CapabilityItem>Regularization request workflow</CapabilityItem>
            <CapabilityItem>Bradford score calculation</CapabilityItem>
            <CapabilityItem>Absenteeism tracking and alerts</CapabilityItem>
            <CapabilityItem>Late arrival pattern detection</CapabilityItem>
            <CapabilityItem>Policy assignment by employee group</CapabilityItem>
            <CapabilityItem>Grace period configuration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Timesheets & Approvals" icon={FileText}>
            <CapabilityItem>Timesheet submission workflow</CapabilityItem>
            <CapabilityItem>Multi-level approval routing</CapabilityItem>
            <CapabilityItem>Timesheet correction requests</CapabilityItem>
            <CapabilityItem>Approval history and audit trail</CapabilityItem>
            <CapabilityItem>Bulk timesheet actions</CapabilityItem>
            <CapabilityItem>Period finalization controls</CapabilityItem>
            <CapabilityItem>Timesheet templates by job type</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Device & Hardware" icon={Smartphone}>
            <CapabilityItem>Timeclock device registration</CapabilityItem>
            <CapabilityItem>Device health monitoring</CapabilityItem>
            <CapabilityItem>Punch queue management</CapabilityItem>
            <CapabilityItem>Punch import capabilities</CapabilityItem>
            <CapabilityItem>Device assignment by location</CapabilityItem>
            <CapabilityItem>Offline sync status tracking</CapabilityItem>
            <CapabilityItem>Biometric template management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Scheduling & Forecasting" icon={Users}>
            <CapabilityItem>Work schedule configuration</CapabilityItem>
            <CapabilityItem>Employee schedule assignment</CapabilityItem>
            <CapabilityItem>AI schedule recommendations</CapabilityItem>
            <CapabilityItem>Shift demand forecasting</CapabilityItem>
            <CapabilityItem>Coverage snapshot tracking</CapabilityItem>
            <CapabilityItem>Cost projection by schedule</CapabilityItem>
            <CapabilityItem>Schedule optimization suggestions</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Project Time Tracking" icon={Briefcase}>
            <CapabilityItem>Project-based time allocation</CapabilityItem>
            <CapabilityItem>Task-level time capture</CapabilityItem>
            <CapabilityItem>Billable vs. non-billable tracking</CapabilityItem>
            <CapabilityItem>Project cost analysis</CapabilityItem>
            <CapabilityItem>Client billing integration</CapabilityItem>
            <CapabilityItem>Resource utilization reporting</CapabilityItem>
            <CapabilityItem>Project budget vs. actual tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Analytics & Reporting" icon={BarChart3}>
            <CapabilityItem>Live attendance dashboard</CapabilityItem>
            <CapabilityItem>Time audit trail with full history</CapabilityItem>
            <CapabilityItem>Labor compliance reporting</CapabilityItem>
            <CapabilityItem>Absenteeism cost analysis</CapabilityItem>
            <CapabilityItem>Wellness and burnout monitoring</CapabilityItem>
            <CapabilityItem>Payroll sync logs and reconciliation</CapabilityItem>
            <CapabilityItem>Exception analysis and trends</CapabilityItem>
            <CapabilityItem>Department comparison reports</CapabilityItem>
          </CapabilityCategory>
        </div>

        <RegionalBadge regions={["Caribbean", "Africa"]}>
          Caribbean overtime rules (1.5x regular, 2x holidays), African shift patterns, Latin American labor laws, regional public holiday calendars, and multi-currency support
        </RegionalBadge>

        <AIFeatureHighlight>
          <AICapability type="predictive">Overtime budget predictions and proactive alerts</AICapability>
          <AICapability type="automated">Anomaly detection in clock patterns (buddy punching, time theft)</AICapability>
          <AICapability type="prescriptive">Optimal scheduling suggestions based on demand</AICapability>
          <AICapability type="automated">CBA document parsing with rule extraction</AICapability>
          <AICapability type="analytics">Attendance pattern analysis and risk scoring</AICapability>
          <AICapability type="predictive">Burnout indicators from overtime trends</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Payroll", description: "Automatic hours and pay code transfer", bidirectional: true },
            { module: "Leave", description: "Absence integration and balance updates" },
            { module: "Wellness", description: "Burnout risk indicators from hours worked" },
            { module: "ESS", description: "Employee clock-in and timesheet submission" },
            { module: "MSS", description: "Manager approvals and team dashboards" },
            { module: "Workforce", description: "Position and department assignments" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
