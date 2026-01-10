import { User, Inbox, FileText, Clock, Target, CreditCard, Award, Bell, Briefcase } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export function ESSCapabilities() {
  return (
    <ModuleCapabilityCard
      id="ess"
      icon={User}
      title="Employee Self-Service (ESS)"
      tagline="Empower employees with 24/7 HR access"
      overview="Comprehensive self-service portal enabling employees to manage their personal information, time, pay, and career development independently—reducing HR burden while increasing employee satisfaction."
      accentColor="bg-emerald-500/10 text-emerald-500"
      badge="75+ Capabilities"
    >
      <div className="space-y-6">
        {/* Value Story Header */}
        <ValueStoryHeader
          challenge="HR is drowning in routine requests. Employees wait days for simple answers about their pay, leave balances, and benefits. Paper forms get lost, phone calls go to voicemail, and email inboxes overflow. Meanwhile, HR spends 70% of their time on transactional tasks instead of strategic initiatives."
          promise="HRplus Employee Self-Service puts the power of HR in every employee's pocket. A single, intuitive portal for everything—viewing payslips, requesting leave, updating personal information, tracking goals, and managing careers. Employees get instant answers; HR gets their time back."
          outcomes={[
            { metric: "80%", label: "HR Inquiries Reduced", description: "Self-service replaces routine questions" },
            { metric: "90%", label: "Faster Request Processing", description: "Digital workflows vs. paper forms" },
            { metric: "+25", label: "eNPS Improvement", description: "Employee satisfaction from self-service" },
            { metric: "15 hrs", label: "Admin Time Saved Weekly", description: "Per HR team member" },
          ]}
          personas={[
            { role: "Employee", value: "I can manage my work life without waiting for HR" },
            { role: "HR Operations", value: "I focus on strategy, not answering the same questions" },
            { role: "Manager", value: "My team is empowered to help themselves" },
            { role: "IT Administrator", value: "One portal, fewer support tickets" },
          ]}
        />

        {/* Capability Categories */}
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Unified Inbox & Tasks" icon={Inbox}>
            <CapabilityItem>Consolidated action center with urgency prioritization</CapabilityItem>
            <CapabilityItem>Category-based task organization (Time, Pay, Performance, Documents)</CapabilityItem>
            <CapabilityItem>Response-required vs. pending item separation</CapabilityItem>
            <CapabilityItem>Task completion tracking with due date visibility</CapabilityItem>
            <CapabilityItem>Smart task routing based on request type</CapabilityItem>
            <CapabilityItem>Notification preferences and quiet hours</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Personal Information" icon={User}>
            <CapabilityItem>Profile and contact management with change request workflows</CapabilityItem>
            <CapabilityItem>Emergency contact updates with approval routing</CapabilityItem>
            <CapabilityItem>Photo upload with face verification capability</CapabilityItem>
            <CapabilityItem>Banking details management with dual-approval security</CapabilityItem>
            <CapabilityItem>Dependents and beneficiaries with lifecycle tracking</CapabilityItem>
            <CapabilityItem>Government ID viewing (TRN, NIS, NHT, SSN, BIR)</CapabilityItem>
            <CapabilityItem>Address change with effective dating</CapabilityItem>
            <CapabilityItem>Professional certifications and qualifications</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Time & Leave" icon={Clock}>
            <CapabilityItem>Clock in/out with geofencing and photo capture</CapabilityItem>
            <CapabilityItem>Leave request submission with balance projection</CapabilityItem>
            <CapabilityItem>Real-time balance viewing across all leave types</CapabilityItem>
            <CapabilityItem>Schedule and shift viewing with swap requests</CapabilityItem>
            <CapabilityItem>Timesheet submission and approval tracking</CapabilityItem>
            <CapabilityItem>Team calendar access for coverage visibility</CapabilityItem>
            <CapabilityItem>Overtime request submission with pre-approval</CapabilityItem>
            <CapabilityItem>Compensatory time balance and usage</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Pay & Compensation" icon={CreditCard}>
            <CapabilityItem>Payslip viewing with drill-down details</CapabilityItem>
            <CapabilityItem>Tax document access and download (P45, P60, W-2)</CapabilityItem>
            <CapabilityItem>Compa-ratio visibility against market benchmarks</CapabilityItem>
            <CapabilityItem>Total rewards statement generation</CapabilityItem>
            <CapabilityItem>Compensation history timeline</CapabilityItem>
            <CapabilityItem>Currency preference configuration</CapabilityItem>
            <CapabilityItem>Salary advance requests with approval workflow</CapabilityItem>
            <CapabilityItem>Pay structure and grade visibility</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Benefits & Claims" icon={Briefcase}>
            <CapabilityItem>Benefits enrollment and annual elections</CapabilityItem>
            <CapabilityItem>Benefit claims submission with documentation</CapabilityItem>
            <CapabilityItem>Expense claim submission with receipt upload</CapabilityItem>
            <CapabilityItem>Claims status tracking and history</CapabilityItem>
            <CapabilityItem>Open enrollment period participation</CapabilityItem>
            <CapabilityItem>Dependent benefit coverage management</CapabilityItem>
            <CapabilityItem>Benefit plan comparison tools</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Career & Development" icon={Target}>
            <CapabilityItem>Goals viewing and progress updates</CapabilityItem>
            <CapabilityItem>Training enrollment with course catalog</CapabilityItem>
            <CapabilityItem>Internal job applications (career portal)</CapabilityItem>
            <CapabilityItem>Skill profile management and gap analysis</CapabilityItem>
            <CapabilityItem>Development plan access and tracking</CapabilityItem>
            <CapabilityItem>Career path visualization</CapabilityItem>
            <CapabilityItem>Mentorship program participation</CapabilityItem>
            <CapabilityItem>Evidence portfolio for competency tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Performance & Feedback" icon={Award}>
            <CapabilityItem>My Appraisals access and self-review submission</CapabilityItem>
            <CapabilityItem>360-degree feedback participation</CapabilityItem>
            <CapabilityItem>Continuous feedback viewing and history</CapabilityItem>
            <CapabilityItem>Goal interviews and check-in scheduling</CapabilityItem>
            <CapabilityItem>Recognition received and given tracking</CapabilityItem>
            <CapabilityItem>Competency self-assessment tools</CapabilityItem>
            <CapabilityItem>Performance trend visualization</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Communications & Documents" icon={Bell}>
            <CapabilityItem>Company announcements with read tracking</CapabilityItem>
            <CapabilityItem>Notification preferences configuration</CapabilityItem>
            <CapabilityItem>My Letters (offer, confirmation, promotion)</CapabilityItem>
            <CapabilityItem>Document vault with personal files</CapabilityItem>
            <CapabilityItem>Policy acknowledgment tracking</CapabilityItem>
            <CapabilityItem>Reminders and to-do lists</CapabilityItem>
            <CapabilityItem>Milestone celebrations (birthday, anniversary)</CapabilityItem>
            <CapabilityItem>Team directory and org chart navigation</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="prescriptive">Personalized dashboard with smart task prioritization</AICapability>
          <AICapability type="conversational">AI chatbot for HR questions and policy lookup</AICapability>
          <AICapability type="predictive">Leave balance projection with usage recommendations</AICapability>
          <AICapability type="automated">Career path suggestions based on skills and interests</AICapability>
          <AICapability type="analytics">Document summarization and intelligent search</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "HR Hub", description: "Policies, documents, and announcements", bidirectional: true },
            { module: "Time & Attendance", description: "Clock entries and timesheets" },
            { module: "Leave", description: "Balances and request workflows" },
            { module: "Payroll", description: "Payslips and tax documents" },
            { module: "Performance", description: "Goals, feedback, and appraisals" },
            { module: "Learning", description: "Course enrollment and progress" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
