import { 
  HelpCircle, FileText, MessageSquare, BookOpen, 
  CheckSquare, Settings, BarChart3, Link2,
  Shield, Upload, UserCog, Briefcase, User, ClipboardList
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

export function HRHubCapabilities() {
  return (
    <ModuleCapabilityCard
      id="hr-hub"
      icon={HelpCircle}
      title="HR Hub"
      tagline="The central command center for all HR operations"
      overview="Unified hub for daily operations, documents, policies, communications, compliance tracking, workflow configuration, and cross-module integration. The single source of truth for HR operations with AI-powered insights and automation."
      accentColor="bg-purple-500/10 text-purple-500"
      badge="70+ Capabilities"
    >
      <div className="space-y-6">
        {/* Challenge & Promise */}
        <ChallengePromise
          challenge="HR teams juggle dozens of disconnected tools—ticketing systems, document repositories, policy libraries, compliance trackers—wasting hours on context-switching and manual coordination. Employees can't find answers, managers lack visibility, and compliance deadlines slip through the cracks."
          promise="HR Hub is your single command center for all HR operations. Every document, every policy, every ticket, every compliance deadline—unified in one intelligent workspace with AI that anticipates needs and automates routine work."
        />

        {/* Key Outcomes */}
        <KeyOutcomeMetrics
          outcomes={[
            { value: "70%", label: "Self-Service Resolution", description: "AI-powered knowledge base deflection", trend: "up" },
            { value: "100%", label: "Compliance Visibility", description: "Never miss a regulatory requirement", trend: "up" },
            { value: "5x", label: "Faster Document Search", description: "Semantic AI search vs. folder browsing", trend: "up" },
            { value: "40%", label: "HR Admin Time Saved", description: "Automation of routine operations", trend: "down" },
          ]}
        />

        {/* Persona Value Cards */}
        <PersonaGrid>
          <PersonaValueCard
            icon={UserCog}
            persona="HR Manager"
            benefit="Single dashboard, complete control"
            accentColor="text-purple-500 bg-purple-500/10"
            outcomes={[
              "Single dashboard for all team operations",
              "Real-time compliance and sentiment visibility",
              "Workflow automation without IT dependency",
            ]}
          />
          <PersonaValueCard
            icon={Briefcase}
            persona="HR Operations Specialist"
            benefit="Efficiency without complexity"
            accentColor="text-blue-500 bg-blue-500/10"
            outcomes={[
              "Help desk with SLA tracking and intelligent routing",
              "Document management with version control",
              "Bulk operations and data import wizards",
            ]}
          />
          <PersonaValueCard
            icon={User}
            persona="Employee"
            benefit="Answers when you need them"
            accentColor="text-emerald-500 bg-emerald-500/10"
            outcomes={[
              "Self-service answers without waiting for HR",
              "Easy policy access and acknowledgment",
              "Milestone celebrations and recognition",
            ]}
          />
          <PersonaValueCard
            icon={Shield}
            persona="Compliance Officer"
            benefit="Proactive compliance, not reactive panic"
            accentColor="text-red-500 bg-red-500/10"
            outcomes={[
              "Complete compliance tracker by category",
              "Automated deadline alerts and escalations",
              "Full audit trail for all policy distributions",
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
            Explore the unified operations platform that transforms HR delivery
          </p>
        </div>

        {/* Row 1: Daily Operations & Communication */}
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory 
            title="Daily Operations" 
            icon={CheckSquare}
            context="60% of HR time is spent on routine operational tasks. Automating these frees HR to focus on strategic initiatives."
          >
            <CapabilityItem>Help Desk with full ticketing, SLA management, escalation rules, agent performance tracking, and satisfaction surveys</CapabilityItem>
            <CapabilityItem>ESS Change Request management for address, banking, emergency contacts, qualifications, dependents, and government IDs</CapabilityItem>
            <CapabilityItem>HR Task Management with priorities, due dates, assignees, recurring schedules, comments, and completion tracking</CapabilityItem>
            <CapabilityItem>HR Calendar with event types (meetings, deadlines, training, holidays), company-specific views, and color-coded scheduling</CapabilityItem>
            <CapabilityItem>Milestones Dashboard tracking birthdays, work anniversaries, and probation endings with celebration automation</CapabilityItem>
            <CapabilityItem>Configurable approval modes per change type (auto-approve, HR review, full workflow) with risk-based routing</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Communication & Support" 
            icon={MessageSquare}
            context="Poor communication costs organizations 26% of productive time. Unified communications eliminate the chaos."
          >
            <CapabilityItem>Company announcements with targeted messaging by department, location, or employee group</CapabilityItem>
            <CapabilityItem>Notifications & Reminders with AI-powered automation rules, event triggers, and recipient targeting</CapabilityItem>
            <CapabilityItem>Email template management with versioning, category organization, and merge field support</CapabilityItem>
            <CapabilityItem>Multi-channel delivery tracking (email, SMS, in-app) with retry capability and delivery logs</CapabilityItem>
            <CapabilityItem>Real-time notification center for ESS approvals, workflow updates, and system alerts</CapabilityItem>
            <CapabilityItem>Scheduled communications with read receipt tracking and acknowledgment workflows</CapabilityItem>
          </CapabilityCategory>
        </div>

        {/* Row 2: Document Center & Knowledge Base */}
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory 
            title="Document Center" 
            icon={FileText}
            context="Employees spend 19% of their time searching for information. A smart document center cuts that to near zero."
          >
            <CapabilityItem>Company document library with categories, types, access controls, and version management</CapabilityItem>
            <CapabilityItem>Policy documents with version control, acknowledgment tracking, and compliance alerts</CapabilityItem>
            <CapabilityItem>Letter template builder with merge fields, bulk generation, and digital signature integration</CapabilityItem>
            <CapabilityItem>Employee document vault with secure storage, expiry tracking, and automated reminders</CapabilityItem>
            <CapabilityItem>Multi-language policy support with regulatory update notifications</CapabilityItem>
            <CapabilityItem>Forms library for configurable HR processes with workflow integration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Knowledge Base" 
            icon={BookOpen}
            context="Employees ask the same questions repeatedly. A smart knowledge base resolves 70% of queries before they become tickets."
          >
            <CapabilityItem>FAQ management with category and tag organization for easy navigation</CapabilityItem>
            <CapabilityItem>AI-powered semantic search across all HR content with natural language queries</CapabilityItem>
            <CapabilityItem>Ticket deflection analytics measuring self-service effectiveness</CapabilityItem>
            <CapabilityItem>Help article workflows with approval, publishing, and content freshness tracking</CapabilityItem>
            <CapabilityItem>SOP library with AI assistant integration for step-by-step guidance</CapabilityItem>
            <CapabilityItem>Content recommendations based on user queries and browsing patterns</CapabilityItem>
          </CapabilityCategory>
        </div>

        {/* Row 3: Compliance & Workflow Configuration */}
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory 
            title="Compliance & Governance" 
            icon={Shield}
            context="Non-compliance costs companies $14.82 million annually on average. Proactive tracking prevents costly surprises."
          >
            <CapabilityItem>Compliance Tracker with categories: Labor Law, Safety Regulations, Tax, Data Protection, Immigration, Benefits, Training, Licensing</CapabilityItem>
            <CapabilityItem>Deadline management with responsible party assignment and progress tracking</CapabilityItem>
            <CapabilityItem>Overall compliance rate calculation with visual indicators and trend analysis</CapabilityItem>
            <CapabilityItem>Status management (compliant, pending, in progress, overdue) with escalation alerts</CapabilityItem>
            <CapabilityItem>SOP Management with versioning, applicable roles, effective dates, and global vs company-specific scope</CapabilityItem>
            <CapabilityItem>Audit trail for all compliance actions with reporting capabilities</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Workflow Configuration" 
            icon={Settings}
            context="Every organization is unique. Configurable workflows ensure the system adapts to you, not the other way around."
          >
            <CapabilityItem>Reusable workflow templates for common approval patterns</CapabilityItem>
            <CapabilityItem>Transaction workflow settings with company-specific configuration for approval requirements</CapabilityItem>
            <CapabilityItem>Approval delegations with date ranges and workflow type restrictions</CapabilityItem>
            <CapabilityItem>ESS approval policies with configurable modes (auto-approve, HR review, workflow) per request type</CapabilityItem>
            <CapabilityItem>Risk-based policy routing (low/medium/high) for change requests</CapabilityItem>
            <CapabilityItem>Documentation requirements and notification settings per workflow step</CapabilityItem>
          </CapabilityCategory>
        </div>

        {/* Row 4: Organization & Analytics */}
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory 
            title="Organization & Configuration" 
            icon={Upload}
            context="Clean data is the foundation of everything. Smart import tools ensure accuracy from day one."
          >
            <CapabilityItem>Lookup values management for centralized master data (dropdowns, selections)</CapabilityItem>
            <CapabilityItem>Government ID types configuration with country-specific requirements (NIS, BIR, SSN, etc.)</CapabilityItem>
            <CapabilityItem>Data Import Wizard with AI validation, dependency checking, and error correction suggestions</CapabilityItem>
            <CapabilityItem>Import templates for company structure, positions, employees, and new hires</CapabilityItem>
            <CapabilityItem>Import history with full audit trail and status tracking</CapabilityItem>
            <CapabilityItem>Org structure visualization with drill-down capabilities</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Analytics & Insights" 
            icon={BarChart3}
            context="What gets measured gets managed. Real-time analytics transform reactive HR into strategic partnership."
          >
            <CapabilityItem>AI Sentiment Monitoring with eNPS scoring, organization trends, and department comparison</CapabilityItem>
            <CapabilityItem>Active alerts management with severity levels (critical, high, medium) and resolution tracking</CapabilityItem>
            <CapabilityItem>Recognition analytics with program effectiveness, leaderboards, and values alignment</CapabilityItem>
            <CapabilityItem>Scheduled reports with automated delivery and company/department filtering</CapabilityItem>
            <CapabilityItem>Radar charts for top sentiment themes and engagement drivers</CapabilityItem>
            <CapabilityItem>Help desk performance metrics with agent productivity and SLA compliance</CapabilityItem>
          </CapabilityCategory>
        </div>

        {/* Row 5: Integration Hub */}
        <div className="grid md:grid-cols-1 gap-4">
          <CapabilityCategory 
            title="Integration Hub" 
            icon={Link2}
            context="Disconnected modules create data silos. The Integration Hub ensures every action flows seamlessly across the platform."
          >
            <CapabilityItem>Cross-module integration dashboard monitoring data flows between Performance, Succession, IDP, PIP, and Compensation</CapabilityItem>
            <CapabilityItem>Pending approvals queue with bulk approve/reject capabilities for integration actions</CapabilityItem>
            <CapabilityItem>Failed integration retry with automatic and manual retry options</CapabilityItem>
            <CapabilityItem>By-module analytics showing success rates, activity volumes, and processing times</CapabilityItem>
          </CapabilityCategory>
        </div>

        {/* Regional Advantage */}
        <RegionalAdvantage
          regions={["Caribbean", "Africa", "Global"]}
          advantages={[
            "Pre-built compliance trackers for regional labor laws",
            "Multi-language policy support for diverse workforces",
            "Country-specific government ID configurations",
            "Local holiday calendars and cultural milestone recognition",
          ]}
        />

        <AIFeatureHighlight>
          <AICapability type="predictive">Sentiment trend forecasting and compliance deadline risk detection</AICapability>
          <AICapability type="automated">Auto-categorization for help desk tickets with intelligent routing</AICapability>
          <AICapability type="automated">SOP guidance integration for AI assistant responses</AICapability>
          <AICapability type="automated">Import data validation with correction suggestions</AICapability>
          <AICapability type="prescriptive">Content suggestions based on user queries and patterns</AICapability>
          <AICapability type="prescriptive">Reminder rule recommendations based on company behavior</AICapability>
          <AICapability type="conversational">Intelligent policy search and natural language Q&A</AICapability>
          <AICapability type="analytics">Recognition program effectiveness insights and participation analysis</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Help Center", description: "Published KB articles and FAQ content", bidirectional: true },
            { module: "ESS", description: "Policy acknowledgments, self-service changes, reminders", bidirectional: true },
            { module: "Onboarding", description: "Required policy completions and task checklists" },
            { module: "Performance", description: "Appraisal data flow to integration hub for IDP/PIP triggers" },
            { module: "Succession", description: "9-Box placement integration and talent pool feeds" },
            { module: "Compensation", description: "Salary change workflow integration and approval routing" },
            { module: "Workforce", description: "Org structure data and compliance tracker feeds" },
            { module: "Employee Relations", description: "Pulse surveys feeding sentiment analysis", bidirectional: true },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
