import { 
  UserPlus, 
  ClipboardList, 
  Mail, 
  CheckSquare, 
  Users, 
  GraduationCap, 
  FileText, 
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
import { ChallengePromise } from "../../components/ChallengePromise";
import { PersonaValueCard, PersonaGrid } from "../../components/PersonaValueCard";
import { KeyOutcomeMetrics } from "../../components/KeyOutcomeMetrics";
import { RegionalAdvantage } from "../../components/RegionalAdvantage";
import { Separator } from "@/components/ui/separator";

export function OnboardingCapabilities() {
  return (
    <ModuleCapabilityCard
      id="onboarding"
      icon={UserPlus}
      title="Onboarding"
      tagline="From offer acceptance to productive employee"
      overview="Comprehensive new hire experience with automated workflows, multi-actor task coordination, buddy systems, and training integration that creates exceptional first impressions and accelerates time-to-productivity."
      accentColor="bg-teal-500/10 text-teal-500"
      badge="55+ Capabilities"
    >
      <div className="space-y-6">
        {/* Challenge & Promise */}
        <ChallengePromise
          challenge="The gap between offer acceptance and productive employee is where 20% of new hires decide to quit. Paper-based checklists, forgotten system access, and disconnected onboarding experiences create confusion, delay productivity, and damage employer brand before day one even begins."
          promise="Intelli HRM Onboarding transforms the new hire journey from chaotic to choreographed. From the moment an offer is signed, automated workflows ensure every stakeholder—HR, IT, managers, buddies—knows exactly what to do and when, creating day-one readiness that accelerates time-to-productivity."
        />

        {/* Key Outcomes */}
        <KeyOutcomeMetrics
          outcomes={[
            { value: "40%", label: "Faster Time-to-Productivity", description: "Structured vs. ad-hoc onboarding", trend: "up" },
            { value: "82%+", label: "New Hire Retention", description: "Industry-leading 1-year retention", trend: "up" },
            { value: "75%", label: "Admin Time Reduction", description: "Automated task assignment", trend: "down" },
            { value: "100%", label: "Day-One Readiness", description: "Access, equipment, training ready", trend: "up" },
          ]}
        />

        {/* Persona Value Cards */}
        <PersonaGrid>
          <PersonaValueCard
            icon={User}
            persona="New Employee"
            benefit="I felt expected and prepared from day one"
            accentColor="text-teal-500 bg-teal-500/10"
            outcomes={[
              "Clear pre-boarding communications and expectations",
              "All systems access ready before first login",
              "Assigned buddy and structured first-week plan",
            ]}
          />
          <PersonaValueCard
            icon={Briefcase}
            persona="Hiring Manager"
            benefit="My new hire hit the ground running"
            accentColor="text-blue-500 bg-blue-500/10"
            outcomes={[
              "Visibility into onboarding task completion",
              "Equipment and access provisioned automatically",
              "Role-specific training automatically assigned",
            ]}
          />
          <PersonaValueCard
            icon={UserCog}
            persona="HR Operations"
            benefit="Onboarding runs itself with zero dropped balls"
            accentColor="text-purple-500 bg-purple-500/10"
            outcomes={[
              "Configurable templates by role/department",
              "Automated escalations for overdue tasks",
              "Complete audit trail for compliance",
            ]}
          />
          <PersonaValueCard
            icon={Monitor}
            persona="IT Administrator"
            benefit="Access provisioning happens automatically"
            accentColor="text-orange-500 bg-orange-500/10"
            outcomes={[
              "System access tasks triggered by hire date",
              "Asset assignment integrated with inventory",
              "Automated deprovisioning on separation",
            ]}
          />
        </PersonaGrid>

        <Separator className="my-6" />

        {/* Capability Deep Dive */}
        <div className="space-y-1 mb-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Capability Deep Dive
          </h4>
          <p className="text-xs text-muted-foreground">
            Complete onboarding lifecycle from offer acceptance to productive employee
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory 
            title="Onboarding Templates" 
            icon={ClipboardList}
            context="Consistency is the foundation of great onboarding. Templates ensure every hire gets the right experience for their role."
          >
            <CapabilityItem>Job-specific template creation with task libraries</CapabilityItem>
            <CapabilityItem>Multi-department template inheritance</CapabilityItem>
            <CapabilityItem>Template versioning and activation controls</CapabilityItem>
            <CapabilityItem>Country/region-specific template variations</CapabilityItem>
            <CapabilityItem>Template effectiveness analytics</CapabilityItem>
            <CapabilityItem>Reusable task components across templates</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Pre-Boarding Automation" 
            icon={Mail}
            context="The experience starts at offer acceptance, not day one. Pre-boarding sets the tone for the entire employment relationship."
          >
            <CapabilityItem>Offer-to-onboarding workflow trigger</CapabilityItem>
            <CapabilityItem>Pre-start document collection and e-signatures</CapabilityItem>
            <CapabilityItem>Welcome communications with personalized content</CapabilityItem>
            <CapabilityItem>Equipment provisioning request automation</CapabilityItem>
            <CapabilityItem>System access provisioning coordination</CapabilityItem>
            <CapabilityItem>Background check status integration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Task Management" 
            icon={CheckSquare}
            context="Onboarding involves many stakeholders. Clear task assignment and tracking ensures nothing falls through the cracks."
          >
            <CapabilityItem>Multi-actor task assignment (HR, Manager, IT, Buddy, Employee)</CapabilityItem>
            <CapabilityItem>Due date automation relative to start date</CapabilityItem>
            <CapabilityItem>Required vs. optional task designation</CapabilityItem>
            <CapabilityItem>Task dependencies and sequencing logic</CapabilityItem>
            <CapabilityItem>Overdue alerts and automatic escalations</CapabilityItem>
            <CapabilityItem>Completion tracking dashboard by new hire</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Buddy System" 
            icon={Users}
            context="Buddies accelerate cultural integration and reduce the isolation that leads to early attrition."
          >
            <CapabilityItem>Buddy assignment with skills/interest matching</CapabilityItem>
            <CapabilityItem>Buddy-specific task checklists</CapabilityItem>
            <CapabilityItem>Buddy effectiveness tracking and feedback</CapabilityItem>
            <CapabilityItem>Cultural integration activity suggestions</CapabilityItem>
            <CapabilityItem>Buddy training and certification tracking</CapabilityItem>
            <CapabilityItem>Mentorship program integration for longer-term development</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Training Integration" 
            icon={GraduationCap}
            context="New hires need the right skills from day one. Integrated training ensures compliance and role readiness."
          >
            <CapabilityItem>Mandatory training course assignment by role</CapabilityItem>
            <CapabilityItem>Compliance training scheduling with deadlines</CapabilityItem>
            <CapabilityItem>Learning path enrollment automation</CapabilityItem>
            <CapabilityItem>Certification tracking for required credentials</CapabilityItem>
            <CapabilityItem>Role-based curriculum assignment</CapabilityItem>
            <CapabilityItem>Training completion reporting and alerts</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Documents & Forms" 
            icon={FileText}
            context="Paperwork shouldn't slow down productivity. Digital documents with e-signatures eliminate administrative friction."
          >
            <CapabilityItem>Digital document signing with audit trails</CapabilityItem>
            <CapabilityItem>Policy acknowledgment tracking</CapabilityItem>
            <CapabilityItem>Benefits enrollment forms integration</CapabilityItem>
            <CapabilityItem>Tax form completion (W-4, regional equivalents)</CapabilityItem>
            <CapabilityItem>Required credential and certification uploads</CapabilityItem>
            <CapabilityItem>Employment agreement and contract management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Progress Tracking" 
            icon={BarChart3}
            context="Visibility drives accountability. Real-time tracking ensures onboarding stays on schedule."
          >
            <CapabilityItem>Real-time completion dashboards by new hire</CapabilityItem>
            <CapabilityItem>Manager visibility into team onboarding status</CapabilityItem>
            <CapabilityItem>HR oversight across all active onboardings</CapabilityItem>
            <CapabilityItem>Bottleneck identification and alerts</CapabilityItem>
            <CapabilityItem>Target vs. actual completion date tracking</CapabilityItem>
            <CapabilityItem>Onboarding effectiveness analytics</CapabilityItem>
          </CapabilityCategory>

        </div>

        {/* Regional Advantage */}
        <RegionalAdvantage
          regions={["Caribbean", "Africa", "LatAm"]}
          advantages={[
            "Region-specific document requirements built-in",
            "Local statutory form templates (NIS, TRN, SSNIT registration)",
            "Multi-language welcome communications",
            "Country-specific compliance training auto-assignment",
          ]}
        />

        <AIFeatureHighlight>
          <AICapability type="prescriptive">Intelligent buddy matching based on skills, interests, and availability</AICapability>
          <AICapability type="predictive">Onboarding risk detection for stalled tasks or missing completions</AICapability>
          <AICapability type="automated">Personalized welcome message and first-week plan generation</AICapability>
          <AICapability type="analytics">Onboarding effectiveness scoring with improvement recommendations</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Recruitment", description: "Offer acceptance triggers onboarding workflow", bidirectional: true },
            { module: "Offboarding", description: "Rehire triggers re-onboarding with prior context", bidirectional: true },
            { module: "Workforce", description: "Employee record creation and position assignment" },
            { module: "Learning", description: "Training course enrollment and curriculum assignment" },
            { module: "Time & Attendance", description: "Schedule assignment and time policy application" },
            { module: "Company Property", description: "Asset assignment and equipment provisioning" },
            { module: "Benefits", description: "Benefits enrollment eligibility and forms" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
