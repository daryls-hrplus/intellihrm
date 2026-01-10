import { Shield, Users, Lock, Eye, Settings, Key, Database, Building, GitBranch, Bot, UserCog, Briefcase, User } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ChallengePromise } from "../../components/ChallengePromise";
import { PersonaValueCard, PersonaGrid } from "../../components/PersonaValueCard";
import { KeyOutcomeMetrics } from "../../components/KeyOutcomeMetrics";
import { RegionalAdvantage } from "../../components/RegionalAdvantage";
import { Separator } from "@/components/ui/separator";

export function AdminSecurityCapabilities() {
  return (
    <ModuleCapabilityCard
      id="admin-security"
      icon={Shield}
      title="Admin & Security"
      tagline="Enterprise-grade security that scales with you"
      overview="Foundation for all platform operations with comprehensive user lifecycle management, multi-factor authentication, granular role-based access control, PII protection, organizational scoping, approval workflows, and full audit capabilities with AI-powered security monitoring."
      accentColor="bg-red-500/10 text-red-500"
      badge="75+ Capabilities"
    >
      <div className="space-y-6">
        {/* Challenge & Promise */}
        <ChallengePromise
          challenge="Without robust, unified security controls, organizations face fragmented access management, compliance gaps, data breaches, and audit failures. Manual permission management across multiple systems creates security blind spots and consumes valuable HR and IT resources."
          promise="Intelli HRM delivers an enterprise-grade security foundation that centralizes authentication, authorization, and audit across all HR operations. From day one, you get the same security architecture trusted by global enterprises—configured for your regional compliance needs."
        />

        {/* Key Outcomes */}
        <KeyOutcomeMetrics
          outcomes={[
            { value: "90%", label: "Faster Access Provisioning", description: "Automated user lifecycle vs. manual", trend: "up" },
            { value: "75%", label: "Fewer Security Incidents", description: "With AI-powered anomaly detection", trend: "down" },
            { value: "100%", label: "Audit Ready", description: "Complete trails for every action", trend: "up" },
            { value: "60%", label: "Less Admin Overhead", description: "Self-service and automation", trend: "down" },
          ]}
        />

        {/* Persona Value Cards */}
        <PersonaGrid>
          <PersonaValueCard
            icon={Shield}
            persona="IT Security / Compliance Officer"
            benefit="Complete visibility, zero blind spots"
            accentColor="text-red-500 bg-red-500/10"
            outcomes={[
              "Complete audit trails with before/after comparisons",
              "Real-time anomaly detection and alerts",
              "Framework alignment (ISO 27001, SOC 2, GDPR)",
            ]}
          />
          <PersonaValueCard
            icon={UserCog}
            persona="HR Administrator"
            benefit="Configure once, enforce everywhere"
            accentColor="text-purple-500 bg-purple-500/10"
            outcomes={[
              "Self-service password resets and MFA enrollment",
              "Delegated approvals without security gaps",
              "Automated access provisioning on hire/term",
            ]}
          />
          <PersonaValueCard
            icon={Settings}
            persona="System Administrator"
            benefit="Enterprise power, startup simplicity"
            accentColor="text-blue-500 bg-blue-500/10"
            outcomes={[
              "SSO/SAML integration in hours, not weeks",
              "Granular permissions without complexity",
              "AI-assisted role optimization suggestions",
            ]}
          />
          <PersonaValueCard
            icon={User}
            persona="Employee"
            benefit="Seamless access, transparent security"
            accentColor="text-emerald-500 bg-emerald-500/10"
            outcomes={[
              "Single sign-on across all HR functions",
              "Secure self-service without friction",
              "Transparent access to their own data",
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
            Explore the comprehensive security features that protect your workforce data
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory 
            title="User Lifecycle Management" 
            icon={Users}
            context="Every access decision—from first login to final offboarding—must be tracked, auditable, and aligned with your policies."
          >
            <CapabilityItem>User creation with configurable provisioning workflows and approval routing</CapabilityItem>
            <CapabilityItem>Bulk user import/export with field mapping validation and error handling</CapabilityItem>
            <CapabilityItem>Employee status transitions (active, inactive, terminated) with cascading access removal</CapabilityItem>
            <CapabilityItem>Access expiry scheduling with automatic deactivation and notification alerts</CapabilityItem>
            <CapabilityItem>Profile management with company-specific configurable fields</CapabilityItem>
            <CapabilityItem>Badge number pattern configuration per company with auto-generation</CapabilityItem>
            <CapabilityItem>User-to-company, department, and section assignments with effective dating</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Authentication & Identity" 
            icon={Key}
            context="Identity is the new perimeter. Proper authentication prevents 80% of security incidents before they start."
          >
            <CapabilityItem>Multi-factor authentication (TOTP, SMS, Email) with configurable enrollment periods</CapabilityItem>
            <CapabilityItem>MFA grace periods and mandatory re-authentication for sensitive operations</CapabilityItem>
            <CapabilityItem>Password policy configuration (length, complexity, history, special characters)</CapabilityItem>
            <CapabilityItem>Password expiry with forced rotation and first-login change enforcement</CapabilityItem>
            <CapabilityItem>Single Sign-On integration (SAML 2.0, OIDC) with attribute mapping</CapabilityItem>
            <CapabilityItem>Session management with configurable timeout and concurrent session limits</CapabilityItem>
            <CapabilityItem>Device binding, browser close logout, and remember-me token management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Role-Based Access Control" 
            icon={Lock}
            context="The right people need the right access—nothing more, nothing less. Role sprawl is a compliance risk waiting to happen."
          >
            <CapabilityItem>Granular permission management (View/Create/Edit/Delete) per function</CapabilityItem>
            <CapabilityItem>Module, tab, and card-level permission controls</CapabilityItem>
            <CapabilityItem>Container-based access scoping for multi-tenant environments</CapabilityItem>
            <CapabilityItem>Role inheritance hierarchies with seeded vs. custom role classification</CapabilityItem>
            <CapabilityItem>Role type classification (Super Admin, Admin, Business, Self-Service)</CapabilityItem>
            <CapabilityItem>Role duplication and templating for rapid deployment</CapabilityItem>
            <CapabilityItem>Multi-tenant role visibility controls with activation/deactivation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Data Access & PII Protection" 
            icon={Database}
            context="Employee data is among the most sensitive in any organization. Protection isn't optional—it's fundamental."
          >
            <CapabilityItem>PII access levels (None/Limited/Full) configurable per role and domain</CapabilityItem>
            <CapabilityItem>Domain-specific PII controls: Personal, Compensation, Banking, Medical, Disciplinary</CapabilityItem>
            <CapabilityItem>Field-level data masking with just-in-time (JIT) access for sensitive data</CapabilityItem>
            <CapabilityItem>Approval workflows for full PII access with time-limited grants</CapabilityItem>
            <CapabilityItem>PII export restrictions and access logging with real-time alerts</CapabilityItem>
            <CapabilityItem>GDPR data subject request handling with right to erasure support</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Organizational Scope Controls" 
            icon={Building}
            context="Multi-entity organizations need security boundaries that mirror their business structure—not fight against it."
          >
            <CapabilityItem>Company-level access restrictions for multi-entity deployments</CapabilityItem>
            <CapabilityItem>Division, department, and section-level permission scoping</CapabilityItem>
            <CapabilityItem>Pay group and company tag-based access controls</CapabilityItem>
            <CapabilityItem>Position type exclusions for sensitive role categories</CapabilityItem>
            <CapabilityItem>Hierarchical reporting line visibility controls</CapabilityItem>
            <CapabilityItem>Cross-entity permission management for shared services</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Approval Workflows & Delegation" 
            icon={GitBranch}
            context="Security should enable business, not block it. Smart workflows balance control with speed."
          >
            <CapabilityItem>Configurable multi-step approval workflows with parallel/sequential routing</CapabilityItem>
            <CapabilityItem>Approval delegation with date ranges and workflow type restrictions</CapabilityItem>
            <CapabilityItem>Auto-escalation with SLA enforcement and reminder notifications</CapabilityItem>
            <CapabilityItem>Auto-approval rules for low-risk actions based on configurable thresholds</CapabilityItem>
            <CapabilityItem>Digital signature integration for critical approvals</CapabilityItem>
            <CapabilityItem>Substitute approver configuration with delegation audit trails</CapabilityItem>
            <CapabilityItem>Workflow analytics with bottleneck detection and optimization recommendations</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Audit, Compliance & Monitoring" 
            icon={Eye}
            context="When auditors come calling, you need answers in seconds—not days of manual log searching."
          >
            <CapabilityItem>Complete activity logging with before/after value comparison (diff view)</CapabilityItem>
            <CapabilityItem>Risk-level classification for audit events with priority alerting</CapabilityItem>
            <CapabilityItem>Module-based audit filtering with export and long-term archival</CapabilityItem>
            <CapabilityItem>Security audit reports and real-time compliance dashboards</CapabilityItem>
            <CapabilityItem>Data retention policy configuration with automated enforcement</CapabilityItem>
            <CapabilityItem>Investigation request tracking with approval workflows</CapabilityItem>
            <CapabilityItem>Access certification campaigns and compliance framework alignment (ISO 27001, SOC 2)</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="AI Security & Governance" 
            icon={Bot}
            context="AI amplifies both capabilities and risks. Governance ensures AI serves your security goals, not undermines them."
          >
            <CapabilityItem>AI security violation detection with unauthorized data access monitoring</CapabilityItem>
            <CapabilityItem>Role escalation attempt detection and PII query blocking</CapabilityItem>
            <CapabilityItem>AI response audit trails with explainability logging</CapabilityItem>
            <CapabilityItem>False positive review workflows with severity-based alert routing</CapabilityItem>
            <CapabilityItem>AI guardrails configuration with budget limit enforcement</CapabilityItem>
            <CapabilityItem>Model registry with approved/prohibited use case management</CapabilityItem>
          </CapabilityCategory>
        </div>

        {/* Regional Advantage */}
        <RegionalAdvantage
          regions={["Caribbean", "Africa", "Global"]}
          advantages={[
            "Pre-configured for regional data residency requirements",
            "Local compliance frameworks built-in (NIS, GDPR equivalents)",
            "Support for regional SSO providers and identity systems",
            "Multi-jurisdiction audit reporting for cross-border operations",
          ]}
        />

        <AIFeatureHighlight>
          <AICapability type="predictive">Anomaly detection in access patterns and attrition-related access behavior</AICapability>
          <AICapability type="analytics">Security risk scoring, role permission sprawl analysis, unused permission detection</AICapability>
          <AICapability type="automated">Suspicious activity flagging, auto-deactivation triggers, compliance gap alerts</AICapability>
          <AICapability type="prescriptive">Role optimization recommendations and access review suggestions</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "All Modules", description: "Central authentication, authorization, and audit backbone", bidirectional: true },
            { module: "Payroll", description: "Sensitive compensation data access controls and visibility rules" },
            { module: "HR Hub", description: "Policy enforcement and document access permissions" },
            { module: "Performance", description: "360 feedback and investigation access controls" },
            { module: "Compensation", description: "Salary data PII protection and approval workflows" },
            { module: "Employee Relations", description: "Disciplinary record access restrictions" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
