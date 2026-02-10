import { 
  Scale, FileText, Users, AlertCircle, Handshake, LogOut, 
  Award, ClipboardList, Heart, Gavel, ClipboardCheck, ShieldCheck,
  HeartHandshake, BarChart3, MessageSquare, Brain, UserCheck, Briefcase
} from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { RegionalBadge } from "../../components/RegionalBadge";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const EmployeeRelationsCapabilities = () => {
  const outcomes = [
    { metric: "70%+", label: "Case Resolution in SLA", description: "Streamlined workflows" },
    { metric: "40%+", label: "Reduction in Escalations", description: "Early intervention" },
    { metric: "85%+", label: "Exit Interview Completion", description: "Insights for retention" },
    { metric: "100%", label: "Documentation Compliance", description: "Audit-ready records" },
  ];

  const personas = [
    { role: "Employee", value: "My concerns are heard and addressed fairly" },
    { role: "Manager", value: "I handle issues consistently with HR guidance" },
    { role: "HR Partner", value: "Every case is documented and defensible" },
    { role: "Legal Counsel", value: "Complete records protect the organization" },
  ];

  return (
    <ModuleCapabilityCard
      icon={Scale}
      title="Employee Relations"
      tagline="Fair, consistent, and compliant employee management"
      overview="Manage the full spectrum of employee relations from grievances to disciplinary actions. From recognition programs to wellness initiatives, from exit insights to union relations—every case is documented, every decision is defensible, and every pattern is visible. AI detects emerging issues before they escalate."
      accentColor="bg-red-500/10 text-red-600"
      badge="130+ Capabilities"
      id="employee-relations"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Employee issues fester when they're not addressed fairly and promptly. Grievances escalate to lawsuits. Disciplinary actions become discrimination claims. Exit interviews reveal problems too late to fix. Without structured employee relations, organizations face legal exposure, damaged culture, and preventable turnover."
          promise="Intelli HRM Employee Relations ensures fairness, consistency, and compliance in every employee interaction. From grievance handling to disciplinary processes, from recognition programs to exit insights—every case is documented, every decision is defensible, and every pattern is visible. AI detects emerging issues before they escalate, while regional compliance keeps you protected."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Case Management" icon={FileText}>
            <CapabilityItem>Centralized case tracking system</CapabilityItem>
            <CapabilityItem>Case type and category configuration</CapabilityItem>
            <CapabilityItem>Investigation workflow management</CapabilityItem>
            <CapabilityItem>Evidence and document collection</CapabilityItem>
            <CapabilityItem>Timeline and milestone tracking</CapabilityItem>
            <CapabilityItem>Resolution documentation</CapabilityItem>
            <CapabilityItem>Case notes and activity logging</CapabilityItem>
            <CapabilityItem>Confidentiality controls</CapabilityItem>
            <CapabilityItem>Case trending and analytics</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Grievance Management" icon={AlertCircle}>
            <CapabilityItem>Multi-channel grievance submission</CapabilityItem>
            <CapabilityItem>Grievance procedure configuration</CapabilityItem>
            <CapabilityItem>Step-by-step processing tracking</CapabilityItem>
            <CapabilityItem>Escalation path configuration</CapabilityItem>
            <CapabilityItem>Mediation scheduling and tracking</CapabilityItem>
            <CapabilityItem>Outcome documentation</CapabilityItem>
            <CapabilityItem>Appeal process management</CapabilityItem>
            <CapabilityItem>SLA monitoring and alerts</CapabilityItem>
            <CapabilityItem>Document attachment management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Disciplinary Management" icon={Scale}>
            <CapabilityItem>Progressive discipline framework configuration</CapabilityItem>
            <CapabilityItem>Warning letter generation and templates</CapabilityItem>
            <CapabilityItem>Hearing scheduling and documentation</CapabilityItem>
            <CapabilityItem>Appeal process workflows</CapabilityItem>
            <CapabilityItem>Policy violation tracking</CapabilityItem>
            <CapabilityItem>Corrective action monitoring</CapabilityItem>
            <CapabilityItem>Employee acknowledgment capture</CapabilityItem>
            <CapabilityItem>Expiry and purge scheduling</CapabilityItem>
            <CapabilityItem>Disciplinary history tracking</CapabilityItem>
            <CapabilityItem>Compliance document generation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Recognition Programs" icon={Award}>
            <CapabilityItem>Recognition type configuration</CapabilityItem>
            <CapabilityItem>Award category management</CapabilityItem>
            <CapabilityItem>Nomination and approval workflows</CapabilityItem>
            <CapabilityItem>Monetary and non-monetary awards</CapabilityItem>
            <CapabilityItem>Public recognition feed</CapabilityItem>
            <CapabilityItem>Peer-to-peer recognition</CapabilityItem>
            <CapabilityItem>Manager recognition tools</CapabilityItem>
            <CapabilityItem>Recognition analytics</CapabilityItem>
            <CapabilityItem>Values-aligned recognition</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Pulse Surveys & Sentiment Analysis" icon={MessageSquare}>
            <CapabilityItem>Survey template creation and deployment</CapabilityItem>
            <CapabilityItem>Pulse survey scheduling (recurring/one-time)</CapabilityItem>
            <CapabilityItem>Anonymous response collection</CapabilityItem>
            <CapabilityItem>Real-time sentiment dashboard</CapabilityItem>
            <CapabilityItem>Employee Net Promoter Score (eNPS) analytics</CapabilityItem>
            <CapabilityItem>Manager coaching nudges from survey data</CapabilityItem>
            <CapabilityItem>Response rate tracking and reminders</CapabilityItem>
            <CapabilityItem>Trend analysis and benchmarking</CapabilityItem>
            <CapabilityItem>Action planning from survey results</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Wellness Programs" icon={Heart}>
            <CapabilityItem>Wellness program configuration</CapabilityItem>
            <CapabilityItem>Program enrollment management</CapabilityItem>
            <CapabilityItem>Participation tracking</CapabilityItem>
            <CapabilityItem>Health initiative campaigns</CapabilityItem>
            <CapabilityItem>Wellness challenge management</CapabilityItem>
            <CapabilityItem>Outcome measurement</CapabilityItem>
            <CapabilityItem>Vendor integration</CapabilityItem>
            <CapabilityItem>Wellness analytics</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Union & Labor Relations" icon={Users}>
            <CapabilityItem>Collective bargaining agreement (CBA) tracking</CapabilityItem>
            <CapabilityItem>CBA version control and history</CapabilityItem>
            <CapabilityItem>Union dues management</CapabilityItem>
            <CapabilityItem>Grievance handling per CBA terms</CapabilityItem>
            <CapabilityItem>Negotiation documentation</CapabilityItem>
            <CapabilityItem>Union representative management</CapabilityItem>
            <CapabilityItem>Union membership tracking</CapabilityItem>
            <CapabilityItem>Meeting and negotiation scheduling</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="CBA Intelligence" icon={Brain}>
            <CapabilityItem>AI-powered CBA document import wizard</CapabilityItem>
            <CapabilityItem>Automated article and clause extraction</CapabilityItem>
            <CapabilityItem>Rule and time-rule detection</CapabilityItem>
            <CapabilityItem>Unsupported rule flagging and review</CapabilityItem>
            <CapabilityItem>CBA violation tracking and alerts</CapabilityItem>
            <CapabilityItem>Negotiation round management</CapabilityItem>
            <CapabilityItem>Proposal and counter-proposal tracking</CapabilityItem>
            <CapabilityItem>Amendment and extension workflows</CapabilityItem>
            <CapabilityItem>CBA compliance scoring</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Industrial Relations" icon={Handshake}>
            <CapabilityItem>Labor dispute tracking</CapabilityItem>
            <CapabilityItem>Agreement version control</CapabilityItem>
            <CapabilityItem>Compliance monitoring</CapabilityItem>
            <CapabilityItem>Work council management</CapabilityItem>
            <CapabilityItem>Industrial action documentation</CapabilityItem>
            <CapabilityItem>Strike contingency planning</CapabilityItem>
            <CapabilityItem>Labor relations calendar</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Court Judgements & Legal" icon={Gavel}>
            <CapabilityItem>Court case tracking</CapabilityItem>
            <CapabilityItem>Judgement documentation</CapabilityItem>
            <CapabilityItem>Legal precedent library</CapabilityItem>
            <CapabilityItem>Case outcome analysis</CapabilityItem>
            <CapabilityItem>Cost tracking</CapabilityItem>
            <CapabilityItem>Settlement management</CapabilityItem>
            <CapabilityItem>Compliance implications tracking</CapabilityItem>
            <CapabilityItem>Keyword search and precedent matching</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Exit Management" icon={LogOut}>
            <CapabilityItem>Resignation processing workflows</CapabilityItem>
            <CapabilityItem>Exit interview scheduling and forms</CapabilityItem>
            <CapabilityItem>Multi-dimension satisfaction scoring (6 areas)</CapabilityItem>
            <CapabilityItem>Final settlement tracking</CapabilityItem>
            <CapabilityItem>Knowledge transfer documentation</CapabilityItem>
            <CapabilityItem>Exit survey analysis</CapabilityItem>
            <CapabilityItem>Departure reason trending</CapabilityItem>
            <CapabilityItem>Rehire eligibility tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Employee Self-Service (ESS)" icon={UserCheck}>
            <CapabilityItem>View personal cases and track status</CapabilityItem>
            <CapabilityItem>Submit workplace concerns (with confidential option)</CapabilityItem>
            <CapabilityItem>View recognition received</CapabilityItem>
            <CapabilityItem>Respond to active pulse surveys</CapabilityItem>
            <CapabilityItem>Browse and enroll in wellness programs</CapabilityItem>
            <CapabilityItem>Summary KPI cards (cases, recognition, surveys, wellness)</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Manager Self-Service (MSS)" icon={Briefcase}>
            <CapabilityItem>View team cases and case status</CapabilityItem>
            <CapabilityItem>Give recognition to direct reports</CapabilityItem>
            <CapabilityItem>Team recognition history</CapabilityItem>
            <CapabilityItem>Team case summary KPIs</CapabilityItem>
            <CapabilityItem>Cross-module drill-down to employee profiles</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Offboarding Workflows" icon={ClipboardCheck}>
            <CapabilityItem>Offboarding template configuration</CapabilityItem>
            <CapabilityItem>Task assignment by role/department</CapabilityItem>
            <CapabilityItem>Checklist completion tracking</CapabilityItem>
            <CapabilityItem>System access revocation</CapabilityItem>
            <CapabilityItem>Asset return coordination</CapabilityItem>
            <CapabilityItem>Final document generation</CapabilityItem>
            <CapabilityItem>Stakeholder notifications</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Policy & Compliance" icon={ShieldCheck}>
            <CapabilityItem>Employee handbook management</CapabilityItem>
            <CapabilityItem>Policy acknowledgment tracking</CapabilityItem>
            <CapabilityItem>Compliance documentation</CapabilityItem>
            <CapabilityItem>Regional labor law requirements</CapabilityItem>
            <CapabilityItem>Statutory termination requirements</CapabilityItem>
            <CapabilityItem>Documentation retention rules</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Employee Support" icon={HeartHandshake}>
            <CapabilityItem>Employee assistance referrals</CapabilityItem>
            <CapabilityItem>Conflict resolution resources</CapabilityItem>
            <CapabilityItem>Workplace accommodation tracking</CapabilityItem>
            <CapabilityItem>Return-to-work coordination</CapabilityItem>
            <CapabilityItem>Coaching and counseling records</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="ER Analytics" icon={BarChart3}>
            <CapabilityItem>Case volume and trending</CapabilityItem>
            <CapabilityItem>Resolution time analysis</CapabilityItem>
            <CapabilityItem>Grievance patterns by department</CapabilityItem>
            <CapabilityItem>Exit reason analysis</CapabilityItem>
            <CapabilityItem>Recognition distribution</CapabilityItem>
            <CapabilityItem>Engagement score tracking</CapabilityItem>
            <CapabilityItem>AI-powered risk identification</CapabilityItem>
            <CapabilityItem>Dashboard with 8 real-time KPI cards</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="predictive">Case outcome probability scoring</AICapability>
          <AICapability type="prescriptive">Escalation recommendations based on case type</AICapability>
          <AICapability type="automated">Sentiment analysis in exit interview and survey feedback</AICapability>
          <AICapability type="predictive">Pattern detection in grievances by manager/department</AICapability>
          <AICapability type="prescriptive">Retention risk correlation from ER data</AICapability>
          <AICapability type="automated">Suggested resolutions based on similar cases</AICapability>
          <AICapability type="automated">AI-powered CBA document extraction and rule parsing</AICapability>
          <AICapability type="prescriptive">Manager coaching nudges from pulse survey trends</AICapability>
          <AICapability type="predictive">eNPS trend forecasting and engagement risk alerts</AICapability>
        </AIFeatureHighlight>

        <RegionalBadge regions={["Caribbean", "Africa"]}>
          Regional labor law compliance, statutory termination requirements, and industrial relations frameworks
        </RegionalBadge>

        <ModuleIntegrations
          integrations={[
            { module: "Workforce", description: "Employee profile drill-down from all ER pages" },
            { module: "Payroll", description: "Final settlement calculations" },
            { module: "Company Property", description: "Asset return tracking" },
            { module: "Health & Safety", description: "Workers' comp coordination" },
            { module: "Performance", description: "Disciplinary context" },
            { module: "ESS Portal", description: "Employee case submission and survey response" },
            { module: "MSS Portal", description: "Team case oversight and recognition" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
};
