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
  GoalsCapabilities,
  AppraisalsCapabilities,
  Feedback360Capabilities,
  ContinuousPerformanceCapabilities,
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
        narrative="With the foundation set and talent onboard, the real work begins. But here's the paradox: HR can't scale by adding more HR people. The only way to serve thousands is to empower everyone to serve themselves. When employees and managers have the right tools, HR transforms from gatekeeper to enabler."
        themes={[
          { title: "Self-Service First", description: "24/7 access to HR services" },
          { title: "Manager Enablement", description: "Real-time team insights and actions" },
          { title: "Time Precision", description: "Every hour captured accurately" },
          { title: "Leave Intelligence", description: "Coverage, compliance, and control" },
        ]}
        outcomes={[
          "80% reduction in HR routine inquiries",
          "Managers detect team risks 3 months earlier",
          "99.9% time accuracy with geofencing",
          "Zero compliance violations on leave",
        ]}
        modules={["Employee Self-Service", "Manager Self-Service", "Time & Attendance", "Leave Management"]}
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
        narrative="Act 3 is where commitment becomes compensation. From the precision of payroll processing to the strategy of total rewards, these modules ensure every employee is paid accurately, fairly, and on time. This is the financial backbone of the employment relationship—where trust is built or broken with every paycheck."
        themes={[
          { title: "Financial Accuracy", description: "99.99% payroll precision" },
          { title: "Multi-Country Compliance", description: "Caribbean & African statutory support" },
          { title: "Strategic Total Rewards", description: "Beyond salary to complete compensation" },
          { title: "Data-Driven Decisions", description: "Market benchmarking and equity analysis" },
        ]}
        outcomes={[
          "99.99% payroll accuracy with AI anomaly detection",
          "Pay equity analysis that identifies and closes gaps",
          "Complete benefits lifecycle from enrollment to claims",
          "Real-time GL integration and cost allocation",
        ]}
        modules={["Payroll", "Compensation", "Benefits Administration"]}
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
        narrative="Act 4 is where potential becomes performance, and today's contributors become tomorrow's leaders. With the foundation set, people onboarded, and rewards flowing, organizations must now invest in growth. Learning fuels capability. Performance management provides the compass. Succession planning secures the future. This is where organizations build the workforce of tomorrow—today."
        themes={[
          { title: "Continuous Development", description: "Learning never stops" },
          { title: "Performance Culture", description: "Feedback flows constantly" },
          { title: "Leadership Pipeline", description: "Future leaders identified and developed" },
          { title: "AI-Powered Talent", description: "Intelligence at every decision point" },
        ]}
        outcomes={[
          "85%+ training completion through gamification and personalization",
          "Real-time performance visibility replacing annual reviews",
          "90%+ critical position coverage with identified successors",
          "Flight risk detection 6 months before resignation",
        ]}
        modules={["Learning & LMS (130+)", "Goals (45+)", "Appraisals (50+)", "360 Feedback (35+)", "Continuous Performance (55+)", "Succession (95+)"]}
      />

      <section id="learning" className="scroll-mt-20">
        <LearningCapabilities />
      </section>

      <section id="goals" className="scroll-mt-20">
        <GoalsCapabilities />
      </section>

      <section id="appraisals" className="scroll-mt-20">
        <AppraisalsCapabilities />
      </section>

      <section id="feedback-360" className="scroll-mt-20">
        <Feedback360Capabilities />
      </section>

      <section id="continuous-performance" className="scroll-mt-20">
        <ContinuousPerformanceCapabilities />
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