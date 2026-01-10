import { 
  LogOut, 
  ClipboardList, 
  FileCheck, 
  UserMinus,
  CheckSquare, 
  Shield,
  BookOpen,
  MessageSquare,
  FileText, 
  Users,
  BarChart3,
  User,
  UserCog,
  Briefcase,
  Monitor
} from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";
import { RegionalAdvantage } from "../../components/RegionalAdvantage";
import { Separator } from "@/components/ui/separator";

export function OffboardingCapabilities() {
  return (
    <ModuleCapabilityCard
      id="offboarding"
      icon={LogOut}
      title="Offboarding"
      tagline="Graceful transitions that protect the organization and preserve relationships"
      overview="Comprehensive separation management with automated clearance workflows, knowledge transfer orchestration, exit insights, and alumni management that transforms departures from risk into opportunities."
      accentColor="bg-slate-500/10 text-slate-600"
      badge="55+ Capabilities"
    >
      <div className="space-y-6">
        {/* Value Story Header */}
        <ValueStoryHeader
          challenge="Employee departures are where organizations are most vulnerable. When exits are chaotic, knowledge walks out the door. Assets go missing. Access lingers for months. Exit interviews become perfunctory or forgotten. Legal exposure multiplies. And the door closes on potential boomerang employees forever. A bad exit creates risk, destroys relationships, and erases institutional memory."
          promise="HRplus Offboarding transforms exits from organizational risk into graceful transitions. Every departure is orchestrated—assets recovered, access revoked, knowledge transferred, and insights captured. Whether resignation, retirement, or termination, each employee leaves with dignity while the organization retains what matters. Former employees become alumni, not adversaries. And AI predicts which departures need extra attention."
          outcomes={[
            { metric: "98%+", label: "Asset Recovery", description: "Automated tracking and clearance" },
            { metric: "100%", label: "Access Revocation", description: "Same-day system deprovisioning" },
            { metric: "85%+", label: "Exit Interview Completion", description: "Structured insights capture" },
            { metric: "30%+", label: "Knowledge Retention", description: "Transfer documentation and handover" },
          ]}
          personas={[
            { role: "Departing Employee", value: "I left with dignity, clarity, and a positive final impression" },
            { role: "Manager", value: "Knowledge transfer happened smoothly; the team wasn't disrupted" },
            { role: "HR Operations", value: "Every exit is compliant, documented, and defensible" },
            { role: "IT/Security", value: "No lingering access—deprovisioning is automatic and immediate" },
          ]}
        />

        <Separator className="my-6" />

        {/* Capability Deep Dive */}
        <div className="space-y-1 mb-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Capability Deep Dive
          </h4>
          <p className="text-xs text-muted-foreground">
            Complete offboarding lifecycle from separation initiation to alumni management
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory 
            title="Offboarding Templates & Configuration" 
            icon={ClipboardList}
            context="Different separations require different processes. Templates ensure consistency while allowing flexibility for each situation."
          >
            <CapabilityItem>Template creation by separation type (resignation, retirement, termination, layoff, contract end)</CapabilityItem>
            <CapabilityItem>Department/role-specific template variations</CapabilityItem>
            <CapabilityItem>Task library management with reusable components</CapabilityItem>
            <CapabilityItem>Template versioning and activation controls</CapabilityItem>
            <CapabilityItem>Country/region-specific template variations</CapabilityItem>
            <CapabilityItem>Multi-company template inheritance</CapabilityItem>
            <CapabilityItem>Template effectiveness tracking and analytics</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Separation Initiation" 
            icon={UserMinus}
            context="Every departure starts somewhere. Structured initiation ensures the right process is triggered for the situation."
          >
            <CapabilityItem>Resignation processing workflows with manager approval</CapabilityItem>
            <CapabilityItem>Manager-initiated separation workflows</CapabilityItem>
            <CapabilityItem>HR-initiated separation workflows</CapabilityItem>
            <CapabilityItem>Contract end auto-triggering based on dates</CapabilityItem>
            <CapabilityItem>Probation period separation handling</CapabilityItem>
            <CapabilityItem>Retirement processing with pension coordination</CapabilityItem>
            <CapabilityItem>Mutual separation agreement workflows</CapabilityItem>
            <CapabilityItem>Last working date calculation and validation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Task Management & Orchestration" 
            icon={CheckSquare}
            context="Offboarding involves many stakeholders with time-sensitive tasks. Orchestration ensures nothing is missed."
          >
            <CapabilityItem>Multi-actor task assignment (HR, Manager, IT, Employee, Facilities)</CapabilityItem>
            <CapabilityItem>Due date automation relative to last working date</CapabilityItem>
            <CapabilityItem>Required vs. optional task designation</CapabilityItem>
            <CapabilityItem>Task dependencies and sequencing logic</CapabilityItem>
            <CapabilityItem>Parallel task execution for different stakeholders</CapabilityItem>
            <CapabilityItem>Overdue alerts and automatic escalations</CapabilityItem>
            <CapabilityItem>Completion tracking dashboard by employee</CapabilityItem>
            <CapabilityItem>Task reassignment and delegation workflows</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Clearance & Compliance" 
            icon={Shield}
            context="Proper clearance protects the organization legally and financially while ensuring a clean separation."
          >
            <CapabilityItem>Department-by-department clearance tracking</CapabilityItem>
            <CapabilityItem>Multi-approver clearance workflows</CapabilityItem>
            <CapabilityItem>Finance clearance (advances, loans, expense claims)</CapabilityItem>
            <CapabilityItem>IT clearance (equipment, access, data)</CapabilityItem>
            <CapabilityItem>Facilities clearance (keys, cards, parking)</CapabilityItem>
            <CapabilityItem>HR clearance (documentation, final settlement)</CapabilityItem>
            <CapabilityItem>Legal clearance (confidentiality, non-compete review)</CapabilityItem>
            <CapabilityItem>Clearance certificate generation</CapabilityItem>
            <CapabilityItem>Audit trail for compliance documentation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Knowledge Transfer" 
            icon={BookOpen}
            context="Institutional knowledge is an asset. Structured transfer preserves what the organization has learned."
          >
            <CapabilityItem>Handover documentation templates</CapabilityItem>
            <CapabilityItem>Project status documentation requirements</CapabilityItem>
            <CapabilityItem>Contact and relationship transfer checklists</CapabilityItem>
            <CapabilityItem>Process documentation requirements</CapabilityItem>
            <CapabilityItem>Successor assignment and briefing workflows</CapabilityItem>
            <CapabilityItem>Knowledge transfer meeting scheduling</CapabilityItem>
            <CapabilityItem>Documentation completeness tracking</CapabilityItem>
            <CapabilityItem>Critical knowledge identification and prioritization</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Exit Interviews" 
            icon={MessageSquare}
            context="Exit interviews are a goldmine of honest feedback. Structured capture turns departures into insights."
          >
            <CapabilityItem>Exit interview scheduling automation</CapabilityItem>
            <CapabilityItem>Questionnaire template configuration</CapabilityItem>
            <CapabilityItem>Multi-format interview support (in-person, video, written)</CapabilityItem>
            <CapabilityItem>Satisfaction rating capture (management, culture, compensation, growth)</CapabilityItem>
            <CapabilityItem>Departure reason categorization and trending</CapabilityItem>
            <CapabilityItem>Improvement suggestions capture</CapabilityItem>
            <CapabilityItem>Confidentiality controls and anonymization options</CapabilityItem>
            <CapabilityItem>Rehire eligibility assessment</CapabilityItem>
            <CapabilityItem>Would-rejoin tracking for engagement insights</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Final Settlement & Documentation" 
            icon={FileText}
            context="The final paycheck and documentation are the last tangible touchpoints. Getting them right matters."
          >
            <CapabilityItem>Final pay calculation coordination with payroll</CapabilityItem>
            <CapabilityItem>Leave encashment processing</CapabilityItem>
            <CapabilityItem>Gratuity/severance calculation triggers</CapabilityItem>
            <CapabilityItem>Experience letter generation with templates</CapabilityItem>
            <CapabilityItem>Reference letter workflows and approval</CapabilityItem>
            <CapabilityItem>Service certificate generation</CapabilityItem>
            <CapabilityItem>Tax clearance documentation</CapabilityItem>
            <CapabilityItem>Pension/retirement benefit coordination</CapabilityItem>
            <CapabilityItem>Final settlement statement generation</CapabilityItem>
            <CapabilityItem>Document delivery tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Alumni & Rehire" 
            icon={Users}
            context="Former employees can be future employees, customers, or brand ambassadors. Alumni management keeps the door open."
          >
            <CapabilityItem>Alumni network enrollment</CapabilityItem>
            <CapabilityItem>Rehire eligibility tracking and documentation</CapabilityItem>
            <CapabilityItem>Former employee database management</CapabilityItem>
            <CapabilityItem>Boomerang hiring fast-track workflows</CapabilityItem>
            <CapabilityItem>Alumni communication preferences</CapabilityItem>
            <CapabilityItem>Referral program participation</CapabilityItem>
            <CapabilityItem>Alumni event notifications</CapabilityItem>
            <CapabilityItem>Conditional rehire policies (waiting periods, approval requirements)</CapabilityItem>
            <CapabilityItem>Prior service credit rules</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Offboarding Analytics" 
            icon={BarChart3}
            context="Departure patterns reveal retention opportunities. Analytics turn exits into prevention strategies."
          >
            <CapabilityItem>Turnover analysis by reason, department, tenure</CapabilityItem>
            <CapabilityItem>Exit interview trend analysis</CapabilityItem>
            <CapabilityItem>Clearance completion time tracking</CapabilityItem>
            <CapabilityItem>Asset recovery rate monitoring</CapabilityItem>
            <CapabilityItem>Departure reason distribution</CapabilityItem>
            <CapabilityItem>Regrettable vs. non-regrettable turnover classification</CapabilityItem>
            <CapabilityItem>Cost-of-turnover estimates</CapabilityItem>
            <CapabilityItem>Manager-level turnover patterns</CapabilityItem>
            <CapabilityItem>Retention risk correlation from exit data</CapabilityItem>
          </CapabilityCategory>
        </div>

        {/* Regional Advantage */}
        <RegionalAdvantage
          regions={["Caribbean", "Africa", "LatAm"]}
          advantages={[
            "Statutory notice period calculations by country",
            "Severance/gratuity calculation rules by jurisdiction",
            "Mandatory exit documentation per country (NIS, pension notifications)",
            "Labor authority notification requirements",
            "Union notification requirements where applicable",
          ]}
        />

        <AIFeatureHighlight>
          <AICapability type="predictive">Flight risk identification before resignation occurs</AICapability>
          <AICapability type="prescriptive">Knowledge transfer priority recommendations based on role criticality</AICapability>
          <AICapability type="automated">Exit interview sentiment analysis and theme extraction</AICapability>
          <AICapability type="analytics">Turnover pattern detection and root cause identification</AICapability>
          <AICapability type="prescriptive">Rehire recommendation scoring based on exit data and performance history</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Onboarding", description: "Rehire triggers re-onboarding workflow", bidirectional: true },
            { module: "Payroll", description: "Final settlement and separation pay processing" },
            { module: "Benefits", description: "Benefits termination and continuation processing" },
            { module: "Time & Attendance", description: "Final timesheet submission and approval" },
            { module: "Learning", description: "Training completion records for exit documentation" },
            { module: "Company Property", description: "Asset return tracking and recovery", bidirectional: true },
            { module: "Employee Relations", description: "Exit interview data feeds ER analytics" },
            { module: "Workforce", description: "Position vacancy creation on departure" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
