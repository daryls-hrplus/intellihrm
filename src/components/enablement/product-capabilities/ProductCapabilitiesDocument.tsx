import {
  Shield,
  Building2,
  UserSearch,
  Users,
  User,
  UserCog,
  Clock,
  CalendarDays,
  Wallet,
  HandCoins,
  Heart,
  GraduationCap,
  Target,
  TrendingUp,
  ShieldAlert,
  Scale,
  Package,
  HelpCircle,
  Layers,
  Globe,
  Brain,
} from "lucide-react";
import {
  ExecutiveOverview,
  PlatformAtGlance,
  AdminSecurityCapabilities,
  HRHubCapabilities,
  RecruitmentCapabilities,
  OnboardingCapabilities,
  WorkforceCapabilities,
  ESSCapabilities,
  MSSCapabilities,
  TimeAttendanceCapabilities,
  LeaveCapabilities,
  PayrollCapabilities,
  CompensationCapabilities,
  BenefitsCapabilities,
  LearningCapabilities,
  TalentCapabilities,
  SuccessionCapabilities,
  HealthSafetyCapabilities,
  EmployeeRelationsCapabilities,
  CompanyPropertyCapabilities,
  HelpCenterCapabilities,
  PlatformFeatures,
  RegionalCompliance,
  AIIntelligence,
  GettingStarted,
  ModuleIntegrationDiagram,
} from "./sections";
import { ActDivider } from "./components";

export function ProductCapabilitiesDocument() {
  return (
    <div className="space-y-12">
      {/* Executive Overview */}
      <section id="executive-overview">
        <ExecutiveOverview />
      </section>

      {/* Platform at a Glance */}
      <section id="platform-overview">
        <PlatformAtGlance />
      </section>

      {/* Module Integration Diagram */}
      <section id="integration-diagram" className="scroll-mt-20">
        <ModuleIntegrationDiagram />
      </section>

      {/* PROLOGUE: Setting the Stage */}
      <ActDivider
        act="prologue"
        title="Prologue: Setting the Stage"
        subtitle="The foundational modules that power everything else"
        icon={Shield}
        id="prologue"
        narrative="Before the first employee is hired, before the first paycheck is processed, before any growth can happen—there must be order. Security. Governance. A foundation that never wavers. This is where every successful HR transformation begins: with the invisible infrastructure that makes everything else possible."
        themes={[
          { title: "Security First", description: "Zero-trust architecture from day one" },
          { title: "Governance Foundation", description: "Policies, audits, and compliance built-in" },
          { title: "Operational Control", description: "Central command for all HR operations" },
          { title: "AI-Ready Infrastructure", description: "Foundation for intelligent automation" },
        ]}
        outcomes={[
          "Enterprise-grade security without enterprise complexity",
          "Complete audit trails for every action",
          "Central command center for HR operations",
          "Foundation for AI-powered decision support",
        ]}
        modules={["Admin & Security", "HR Hub"]}
      />

      <section id="admin-security" className="scroll-mt-20">
        <AdminSecurityCapabilities />
      </section>

      <section id="hr-hub" className="scroll-mt-20">
        <HRHubCapabilities />
      </section>

      {/* ACT 1: Attract & Onboard */}
      <ActDivider
        act="act1"
        title="Act 1: Attract & Onboard"
        subtitle="Find, hire, and welcome the best talent"
        icon={UserSearch}
        id="act1"
        narrative="Every great organization starts with great people. But finding them? That's an art backed by science. From the first job posting to the first day on the job, this act transforms talent acquisition from a scramble into a strategic advantage. The war for talent is won here."
        themes={[
          { title: "Strategic Sourcing", description: "AI-powered candidate discovery" },
          { title: "Candidate Experience", description: "Frictionless application journeys" },
          { title: "Seamless Transitions", description: "From offer letter to productive employee" },
          { title: "Workforce Architecture", description: "Positions, hierarchies, and org design" },
        ]}
        outcomes={[
          "50% reduction in time-to-hire",
          "Higher quality candidates through AI matching",
          "Day-one readiness for every new hire",
          "Complete visibility into workforce structure",
        ]}
        modules={["Recruitment", "Onboarding", "Workforce Management"]}
      />

      <section id="recruitment" className="scroll-mt-20">
        <RecruitmentCapabilities />
      </section>

      <section id="onboarding" className="scroll-mt-20">
        <OnboardingCapabilities />
      </section>

      <section id="workforce" className="scroll-mt-20">
        <WorkforceCapabilities />
      </section>

      {/* ACT 2: Enable & Engage */}
      <ActDivider
        act="act2"
        title="Act 2: Enable & Engage"
        subtitle="Empower employees and managers with self-service tools"
        icon={Users}
        id="act2"
      />

      <section id="ess" className="scroll-mt-20">
        <ESSCapabilities />
      </section>

      <section id="mss" className="scroll-mt-20">
        <MSSCapabilities />
      </section>

      <section id="time-attendance" className="scroll-mt-20">
        <TimeAttendanceCapabilities />
      </section>

      <section id="leave" className="scroll-mt-20">
        <LeaveCapabilities />
      </section>

      {/* ACT 3: Pay & Reward */}
      <ActDivider
        act="act3"
        title="Act 3: Pay & Reward"
        subtitle="Compensate fairly with regional compliance"
        icon={Wallet}
        id="act3"
      />

      <section id="payroll" className="scroll-mt-20">
        <PayrollCapabilities />
      </section>

      <section id="compensation" className="scroll-mt-20">
        <CompensationCapabilities />
      </section>

      <section id="benefits" className="scroll-mt-20">
        <BenefitsCapabilities />
      </section>

      {/* ACT 4: Develop & Grow */}
      <ActDivider
        act="act4"
        title="Act 4: Develop & Grow"
        subtitle="Build capabilities and nurture talent"
        icon={GraduationCap}
        id="act4"
      />

      <section id="learning" className="scroll-mt-20">
        <LearningCapabilities />
      </section>

      <section id="talent" className="scroll-mt-20">
        <TalentCapabilities />
      </section>

      <section id="succession" className="scroll-mt-20">
        <SuccessionCapabilities />
      </section>

      {/* ACT 5: Protect & Support */}
      <ActDivider
        act="act5"
        title="Act 5: Protect & Support"
        subtitle="Ensure safety, fairness, and accountability"
        icon={ShieldAlert}
        id="act5"
      />

      <section id="health-safety" className="scroll-mt-20">
        <HealthSafetyCapabilities />
      </section>

      <section id="employee-relations" className="scroll-mt-20">
        <EmployeeRelationsCapabilities />
      </section>

      <section id="company-property" className="scroll-mt-20">
        <CompanyPropertyCapabilities />
      </section>

      {/* EPILOGUE: Continuous Excellence */}
      <ActDivider
        act="epilogue"
        title="Epilogue: Continuous Excellence"
        subtitle="Support that never stops"
        icon={HelpCircle}
        id="epilogue"
      />

      <section id="help-center" className="scroll-mt-20">
        <HelpCenterCapabilities />
      </section>

      {/* Cross-Cutting Capabilities */}
      <div className="relative py-8 px-6 rounded-xl bg-gradient-to-r from-teal-600/20 via-teal-500/10 to-transparent">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-teal-600/20 text-teal-500">
            <Layers className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-teal-600">Cross-Cutting Capabilities</h2>
            <p className="text-muted-foreground">Features that span the entire platform</p>
          </div>
        </div>
      </div>

      <section id="platform-features" className="scroll-mt-20">
        <PlatformFeatures />
      </section>

      <section id="regional-compliance" className="scroll-mt-20">
        <RegionalCompliance />
      </section>

      <section id="ai-intelligence" className="scroll-mt-20">
        <AIIntelligence />
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="scroll-mt-20">
        <GettingStarted />
      </section>
    </div>
  );
}