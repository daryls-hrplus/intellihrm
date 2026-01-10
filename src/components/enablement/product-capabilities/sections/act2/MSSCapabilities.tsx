import { Users, CheckSquare, Target, TrendingUp, Clock, Calendar, UserPlus, Award, BarChart3, Briefcase } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export function MSSCapabilities() {
  return (
    <ModuleCapabilityCard
      id="mss"
      icon={Users}
      title="Manager Self-Service (MSS)"
      tagline="Equip managers with real-time team insights"
      overview="Unified manager portal providing team oversight, unified approvals, performance management, and workforce action capabilities—with AI that surfaces risks before they become crises."
      accentColor="bg-emerald-500/10 text-emerald-500"
      badge="90+ Capabilities"
    >
      <div className="space-y-6">
        {/* Value Story Header */}
        <ValueStoryHeader
          challenge="Managers are flying blind. Team data is scattered across spreadsheets, approval requests pile up in email, and critical decisions about hiring, promotions, and performance happen without real-time insights. By the time managers notice problems—attrition, burnout, skill gaps—it's often too late to act."
          promise="Intelli HRM Manager Self-Service transforms managers into informed leaders. A single dashboard for team oversight, unified approvals, performance management, and workforce actions—with AI that surfaces risks before they become crises. Managers spend less time on admin and more time on leadership."
          outcomes={[
            { metric: "75%", label: "Faster Approval Cycle", description: "Unified inbox + mobile approvals" },
            { metric: "60%", label: "Manager Admin Time Reduced", description: "Consolidated workflows" },
            { metric: "3 mo", label: "Earlier Risk Detection", description: "AI-powered team alerts" },
            { metric: "+40%", label: "Decision Quality", description: "Data-driven recommendations" },
          ]}
          personas={[
            { role: "First-Line Manager", value: "I see my team's pulse at a glance and act before issues escalate" },
            { role: "Senior Manager", value: "I have visibility across teams with drill-down when needed" },
            { role: "HR Business Partner", value: "Managers are self-sufficient, freeing me for strategic work" },
            { role: "Executive", value: "Confident managers make better workforce decisions" },
          ]}
        />

        {/* Capability Categories */}
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Team Overview Dashboard" icon={Users}>
            <CapabilityItem>Team org chart with headcount and vacancy tracking</CapabilityItem>
            <CapabilityItem>Attendance summary with real-time status</CapabilityItem>
            <CapabilityItem>Leave calendar visualization with coverage gaps</CapabilityItem>
            <CapabilityItem>Direct reports quick access with profile cards</CapabilityItem>
            <CapabilityItem>Team demographics and tenure analysis</CapabilityItem>
            <CapabilityItem>Vacancy and open position tracking</CapabilityItem>
            <CapabilityItem>Probation and milestone alerts</CapabilityItem>
            <CapabilityItem>Team engagement pulse indicators</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Unified Approval Center" icon={CheckSquare}>
            <CapabilityItem>Consolidated approval inbox across all modules</CapabilityItem>
            <CapabilityItem>Leave, time-off, and overtime approvals</CapabilityItem>
            <CapabilityItem>Expense and benefit claims approvals</CapabilityItem>
            <CapabilityItem>Training request approvals with budget visibility</CapabilityItem>
            <CapabilityItem>Requisition and headcount approvals</CapabilityItem>
            <CapabilityItem>Compensation change approvals with impact analysis</CapabilityItem>
            <CapabilityItem>Bulk approval actions with delegation</CapabilityItem>
            <CapabilityItem>Auto-approval rule configuration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Performance Management" icon={Target}>
            <CapabilityItem>Team goal tracking with cascading alignment</CapabilityItem>
            <CapabilityItem>Feedback and recognition delivery tools</CapabilityItem>
            <CapabilityItem>Performance review initiation and completion</CapabilityItem>
            <CapabilityItem>Calibration session participation</CapabilityItem>
            <CapabilityItem>PIP creation, tracking, and milestone management</CapabilityItem>
            <CapabilityItem>1-on-1 meeting scheduling and notes</CapabilityItem>
            <CapabilityItem>360-degree review management</CapabilityItem>
            <CapabilityItem>Continuous feedback delivery and history</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Workforce Actions" icon={TrendingUp}>
            <CapabilityItem>Promotion and transfer requests with cost modeling</CapabilityItem>
            <CapabilityItem>Compensation change requests with impact analysis</CapabilityItem>
            <CapabilityItem>Disciplinary action initiation with documentation</CapabilityItem>
            <CapabilityItem>Termination requests with offboarding trigger</CapabilityItem>
            <CapabilityItem>Onboarding task management visibility</CapabilityItem>
            <CapabilityItem>Offboarding coordination and exit interviews</CapabilityItem>
            <CapabilityItem>Acting and interim assignment management</CapabilityItem>
            <CapabilityItem>Job requisition creation and approval</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Team Time & Attendance" icon={Clock}>
            <CapabilityItem>Team attendance dashboard with exceptions</CapabilityItem>
            <CapabilityItem>Overtime visibility and approval queue</CapabilityItem>
            <CapabilityItem>Schedule coverage management</CapabilityItem>
            <CapabilityItem>Timesheet approval queue with bulk actions</CapabilityItem>
            <CapabilityItem>Absence pattern alerts and trends</CapabilityItem>
            <CapabilityItem>Late arrival and early departure tracking</CapabilityItem>
            <CapabilityItem>Shift assignment and management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Team Leave Management" icon={Calendar}>
            <CapabilityItem>Leave request approval queue</CapabilityItem>
            <CapabilityItem>Team leave calendar with conflict detection</CapabilityItem>
            <CapabilityItem>Coverage gap identification and alerts</CapabilityItem>
            <CapabilityItem>Blackout period enforcement</CapabilityItem>
            <CapabilityItem>Leave balance overview by team member</CapabilityItem>
            <CapabilityItem>Leave encashment and cancellation approvals</CapabilityItem>
            <CapabilityItem>Holiday calendar visibility</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Recruitment & Hiring" icon={UserPlus}>
            <CapabilityItem>Requisition creation and tracking</CapabilityItem>
            <CapabilityItem>Candidate pipeline visibility</CapabilityItem>
            <CapabilityItem>Interview scheduling and feedback submission</CapabilityItem>
            <CapabilityItem>Offer approval participation</CapabilityItem>
            <CapabilityItem>Hiring progress dashboard</CapabilityItem>
            <CapabilityItem>Headcount budget tracking</CapabilityItem>
            <CapabilityItem>Position approval workflows</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Development & Succession" icon={Briefcase}>
            <CapabilityItem>Team development plans visibility</CapabilityItem>
            <CapabilityItem>Training enrollment approvals with budget tracking</CapabilityItem>
            <CapabilityItem>Skill gap analysis for team</CapabilityItem>
            <CapabilityItem>Succession planning participation</CapabilityItem>
            <CapabilityItem>9-Box review and calibration input</CapabilityItem>
            <CapabilityItem>High-potential identification and tracking</CapabilityItem>
            <CapabilityItem>Career path guidance for direct reports</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Recognition & Engagement" icon={Award}>
            <CapabilityItem>Recognition delivery and nomination tools</CapabilityItem>
            <CapabilityItem>Team recognition dashboard and history</CapabilityItem>
            <CapabilityItem>Points and awards management</CapabilityItem>
            <CapabilityItem>Recognition analytics and trends</CapabilityItem>
            <CapabilityItem>Values-aligned recognition badges</CapabilityItem>
            <CapabilityItem>Peer recognition visibility</CapabilityItem>
            <CapabilityItem>Celebration reminders (birthdays, anniversaries)</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Team Analytics" icon={BarChart3}>
            <CapabilityItem>Team metrics dashboard with KPIs</CapabilityItem>
            <CapabilityItem>Leave and absence analytics</CapabilityItem>
            <CapabilityItem>Attrition risk indicators with AI scoring</CapabilityItem>
            <CapabilityItem>Engagement trend analysis</CapabilityItem>
            <CapabilityItem>Workload distribution insights</CapabilityItem>
            <CapabilityItem>Cost center analytics and budget tracking</CapabilityItem>
            <CapabilityItem>Headcount trend visualization</CapabilityItem>
            <CapabilityItem>Performance distribution analysis</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="predictive">Team attrition and burnout risk alerts</AICapability>
          <AICapability type="prescriptive">Coaching recommendations based on team dynamics</AICapability>
          <AICapability type="analytics">Workload distribution and balance insights</AICapability>
          <AICapability type="automated">Optimal meeting time suggestions</AICapability>
          <AICapability type="predictive">Succession gap detection and readiness alerts</AICapability>
          <AICapability type="prescriptive">Compensation equity alerts and recommendations</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "ESS", description: "Employee requests and self-service actions", bidirectional: true },
            { module: "Performance", description: "Goals, reviews, and feedback" },
            { module: "Time & Attendance", description: "Timesheet and overtime approvals" },
            { module: "Leave", description: "Leave request approvals" },
            { module: "Recruitment", description: "Requisitions and hiring" },
            { module: "Compensation", description: "Salary change requests" },
            { module: "Succession", description: "9-Box and talent pool inputs" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
