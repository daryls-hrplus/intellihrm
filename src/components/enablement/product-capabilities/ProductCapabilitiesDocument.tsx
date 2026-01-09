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
      />

      <section id="recruitment" className="scroll-mt-20">
        <RecruitmentCapabilities />
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