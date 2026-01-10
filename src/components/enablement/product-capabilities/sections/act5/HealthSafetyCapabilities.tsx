import { 
  Shield, AlertTriangle, ClipboardCheck, HardHat, FileText, 
  Eye, Beaker, Lock, FileCheck, Users, Stethoscope, Siren, 
  Briefcase, ScrollText, BarChart3, AlertOctagon
} from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { RegionalBadge } from "../../components/RegionalBadge";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const HealthSafetyCapabilities = () => {
  const outcomes = [
    { metric: "60%+", label: "Incident Reduction", description: "Proactive hazard identification" },
    { metric: "100%", label: "Compliance Achievement", description: "Automated deadline tracking" },
    { metric: "90%+", label: "Training Completion", description: "Integrated safety training" },
    { metric: "Real-time", label: "Risk Visibility", description: "AI-powered safety insights" },
  ];

  const personas = [
    { role: "Employee", value: "I know how to work safely and can report hazards instantly" },
    { role: "Safety Manager", value: "I see risks before they become incidents" },
    { role: "HSE Director", value: "Compliance is automated, not a scramble" },
    { role: "Executive", value: "Safety performance drives operational excellence" },
  ];

  return (
    <ModuleCapabilityCard
      icon={Shield}
      title="Health & Safety (HSE)"
      tagline="Proactive safety management with compliance built-in"
      overview="Comprehensive occupational health and safety management from incident reporting to wellness programs. From chemical management to LOTO procedures, from behavioral observations to OSHA reporting—every safety touchpoint is captured, analyzed, and acted upon. AI predicts risks before they become incidents."
      accentColor="bg-red-500/10 text-red-600"
      badge="120+ Capabilities"
      id="health-safety"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Workplace injuries cost organizations millions in direct costs, lost productivity, and damaged morale. Safety incidents happen when hazards go unnoticed, training lapses occur, and compliance deadlines slip. Without a proactive safety culture, organizations react to accidents instead of preventing them—paying the price in human suffering and regulatory penalties."
          promise="HRplus Health & Safety transforms reactive incident response into proactive risk prevention. From chemical management to LOTO procedures, from behavioral observations to OSHA reporting—every safety touchpoint is captured, analyzed, and acted upon. AI predicts risks before they become incidents, compliance is automated, and a culture of safety becomes the foundation of operations."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Incident Management" icon={AlertTriangle}>
            <CapabilityItem>Multi-channel incident reporting (web, mobile, kiosk)</CapabilityItem>
            <CapabilityItem>Investigation workflow with root cause analysis (5-Why, Fishbone)</CapabilityItem>
            <CapabilityItem>Corrective action tracking and verification (CAPA)</CapabilityItem>
            <CapabilityItem>Witness statement collection and management</CapabilityItem>
            <CapabilityItem>Incident classification and severity rating</CapabilityItem>
            <CapabilityItem>OSHA recordability determination</CapabilityItem>
            <CapabilityItem>Lost time injury tracking</CapabilityItem>
            <CapabilityItem>Incident cost tracking and analysis</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Near-Miss Reporting" icon={AlertOctagon}>
            <CapabilityItem>Anonymous near-miss reporting</CapabilityItem>
            <CapabilityItem>Near-miss categorization and trending</CapabilityItem>
            <CapabilityItem>Corrective action assignment</CapabilityItem>
            <CapabilityItem>Learning opportunities identification</CapabilityItem>
            <CapabilityItem>Near-miss to incident correlation</CapabilityItem>
            <CapabilityItem>Recognition for reporting</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Safety Observations" icon={Eye}>
            <CapabilityItem>Behavioral safety observation programs</CapabilityItem>
            <CapabilityItem>Positive behavior reinforcement</CapabilityItem>
            <CapabilityItem>At-risk behavior tracking</CapabilityItem>
            <CapabilityItem>Observation scheduling and routing</CapabilityItem>
            <CapabilityItem>Trend analysis by area/behavior</CapabilityItem>
            <CapabilityItem>Coaching and feedback workflows</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Risk Assessment" icon={ClipboardCheck}>
            <CapabilityItem>Hazard identification workflows</CapabilityItem>
            <CapabilityItem>Risk matrices with likelihood/severity scoring</CapabilityItem>
            <CapabilityItem>Control measure documentation</CapabilityItem>
            <CapabilityItem>Residual risk tracking</CapabilityItem>
            <CapabilityItem>Job safety analysis (JSA) templates</CapabilityItem>
            <CapabilityItem>Risk register management</CapabilityItem>
            <CapabilityItem>Hierarchy of controls application</CapabilityItem>
            <CapabilityItem>Risk review scheduling</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Inspections & Audits" icon={FileText}>
            <CapabilityItem>Scheduled inspection management</CapabilityItem>
            <CapabilityItem>Customizable inspection checklists</CapabilityItem>
            <CapabilityItem>Finding tracking and resolution</CapabilityItem>
            <CapabilityItem>Photo and evidence attachments</CapabilityItem>
            <CapabilityItem>Compliance audit scheduling</CapabilityItem>
            <CapabilityItem>Corrective action follow-up</CapabilityItem>
            <CapabilityItem>Inspection scoring and trending</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Chemical Management" icon={Beaker}>
            <CapabilityItem>Chemical inventory management</CapabilityItem>
            <CapabilityItem>Safety Data Sheet (SDS) library</CapabilityItem>
            <CapabilityItem>GHS classification and pictograms</CapabilityItem>
            <CapabilityItem>Chemical exposure tracking</CapabilityItem>
            <CapabilityItem>Storage requirements management</CapabilityItem>
            <CapabilityItem>Spill response procedures</CapabilityItem>
            <CapabilityItem>Chemical disposal tracking</CapabilityItem>
            <CapabilityItem>Right-to-know compliance</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Lockout/Tagout (LOTO)" icon={Lock}>
            <CapabilityItem>LOTO procedure documentation</CapabilityItem>
            <CapabilityItem>Energy isolation verification</CapabilityItem>
            <CapabilityItem>Authorized employee tracking</CapabilityItem>
            <CapabilityItem>LOTO device inventory</CapabilityItem>
            <CapabilityItem>Application and removal logging</CapabilityItem>
            <CapabilityItem>Periodic inspection scheduling</CapabilityItem>
            <CapabilityItem>Group lockout coordination</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Permit-to-Work" icon={FileCheck}>
            <CapabilityItem>Permit type configuration</CapabilityItem>
            <CapabilityItem>Permit request and approval workflows</CapabilityItem>
            <CapabilityItem>Active permit tracking</CapabilityItem>
            <CapabilityItem>Permit holder management</CapabilityItem>
            <CapabilityItem>Expiry and renewal alerts</CapabilityItem>
            <CapabilityItem>Concurrent permit conflict detection</CapabilityItem>
            <CapabilityItem>Permit close-out verification</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="PPE Management" icon={HardHat}>
            <CapabilityItem>PPE type configuration by hazard</CapabilityItem>
            <CapabilityItem>PPE assignment by role/location</CapabilityItem>
            <CapabilityItem>Inventory tracking and reorder alerts</CapabilityItem>
            <CapabilityItem>Inspection and maintenance records</CapabilityItem>
            <CapabilityItem>Expiry date monitoring</CapabilityItem>
            <CapabilityItem>Employee acknowledgment tracking</CapabilityItem>
            <CapabilityItem>PPE issuance history</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Toolbox Talks & Safety Meetings" icon={Users}>
            <CapabilityItem>Meeting scheduling and planning</CapabilityItem>
            <CapabilityItem>Topic library management</CapabilityItem>
            <CapabilityItem>Attendance tracking</CapabilityItem>
            <CapabilityItem>Discussion documentation</CapabilityItem>
            <CapabilityItem>Meeting frequency monitoring</CapabilityItem>
            <CapabilityItem>Effectiveness assessment</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Safety Training" icon={Shield}>
            <CapabilityItem>Safety training requirements by role</CapabilityItem>
            <CapabilityItem>Training completion tracking</CapabilityItem>
            <CapabilityItem>Certification management</CapabilityItem>
            <CapabilityItem>Recertification reminders</CapabilityItem>
            <CapabilityItem>Training effectiveness measurement</CapabilityItem>
            <CapabilityItem>Integration with LMS</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="First Aid & Medical" icon={Stethoscope}>
            <CapabilityItem>First aid kit inventory and locations</CapabilityItem>
            <CapabilityItem>Kit inspection scheduling</CapabilityItem>
            <CapabilityItem>Treatment record tracking</CapabilityItem>
            <CapabilityItem>First aider certification tracking</CapabilityItem>
            <CapabilityItem>Medical treatment classification</CapabilityItem>
            <CapabilityItem>Clinic visit documentation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Emergency Management" icon={Siren}>
            <CapabilityItem>Emergency response plan documentation</CapabilityItem>
            <CapabilityItem>Drill scheduling and execution tracking</CapabilityItem>
            <CapabilityItem>Emergency contact trees</CapabilityItem>
            <CapabilityItem>Evacuation procedure management</CapabilityItem>
            <CapabilityItem>Crisis communication templates</CapabilityItem>
            <CapabilityItem>Muster point management</CapabilityItem>
            <CapabilityItem>Emergency equipment tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Workers' Compensation" icon={Briefcase}>
            <CapabilityItem>Claim initiation and documentation</CapabilityItem>
            <CapabilityItem>Claim status tracking</CapabilityItem>
            <CapabilityItem>Return-to-work coordination</CapabilityItem>
            <CapabilityItem>Cost tracking and analysis</CapabilityItem>
            <CapabilityItem>Claim closure management</CapabilityItem>
            <CapabilityItem>Third-party administrator integration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Safety Policies & Compliance" icon={ScrollText}>
            <CapabilityItem>Safety policy library</CapabilityItem>
            <CapabilityItem>Policy acknowledgment tracking</CapabilityItem>
            <CapabilityItem>Policy version control</CapabilityItem>
            <CapabilityItem>Compliance requirement management</CapabilityItem>
            <CapabilityItem>Regulatory deadline tracking</CapabilityItem>
            <CapabilityItem>OSHA log management (300/300A/301)</CapabilityItem>
            <CapabilityItem>Regional compliance configuration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="HSE Analytics" icon={BarChart3}>
            <CapabilityItem>Leading and lagging indicators</CapabilityItem>
            <CapabilityItem>Safety performance dashboards</CapabilityItem>
            <CapabilityItem>Incident trend analysis</CapabilityItem>
            <CapabilityItem>Compliance status overview</CapabilityItem>
            <CapabilityItem>Training gap identification</CapabilityItem>
            <CapabilityItem>AI-powered risk prediction</CapabilityItem>
            <CapabilityItem>Benchmarking and comparisons</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="predictive">Incident likelihood prediction by location/role/time</AICapability>
          <AICapability type="prescriptive">Risk mitigation recommendations based on historical data</AICapability>
          <AICapability type="automated">Compliance deadline alerts and escalations</AICapability>
          <AICapability type="predictive">Near-miss pattern detection</AICapability>
          <AICapability type="prescriptive">Training gap identification from incident analysis</AICapability>
          <AICapability type="automated">Optimal inspection scheduling</AICapability>
        </AIFeatureHighlight>

        <RegionalBadge regions={["Caribbean", "Africa"]}>
          OSHA compliance reporting, regional health & safety regulations, and multi-country incident classification standards
        </RegionalBadge>

        <ModuleIntegrations
          integrations={[
            { module: "Workforce", description: "Employee job and location data" },
            { module: "Time & Attendance", description: "Work hours for exposure tracking" },
            { module: "Learning", description: "Safety training compliance" },
            { module: "Employee Relations", description: "Workers' comp case coordination" },
            { module: "Company Property", description: "Equipment safety requirements" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
};
