import { Shield, Users, Lock, Eye, Settings, FileText, Key, Database, Building, GitBranch, Bot, CheckCircle } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

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
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="User Lifecycle Management" icon={Users}>
            <CapabilityItem>User creation with configurable provisioning workflows and approval routing</CapabilityItem>
            <CapabilityItem>Bulk user import/export with field mapping validation and error handling</CapabilityItem>
            <CapabilityItem>Employee status transitions (active, inactive, terminated) with cascading access removal</CapabilityItem>
            <CapabilityItem>Access expiry scheduling with automatic deactivation and notification alerts</CapabilityItem>
            <CapabilityItem>Profile management with company-specific configurable fields</CapabilityItem>
            <CapabilityItem>Badge number pattern configuration per company with auto-generation</CapabilityItem>
            <CapabilityItem>User-to-company, department, and section assignments with effective dating</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Authentication & Identity" icon={Key}>
            <CapabilityItem>Multi-factor authentication (TOTP, SMS, Email) with configurable enrollment periods</CapabilityItem>
            <CapabilityItem>MFA grace periods and mandatory re-authentication for sensitive operations</CapabilityItem>
            <CapabilityItem>Password policy configuration (length, complexity, history, special characters)</CapabilityItem>
            <CapabilityItem>Password expiry with forced rotation and first-login change enforcement</CapabilityItem>
            <CapabilityItem>Single Sign-On integration (SAML 2.0, OIDC) with attribute mapping</CapabilityItem>
            <CapabilityItem>Session management with configurable timeout and concurrent session limits</CapabilityItem>
            <CapabilityItem>Device binding, browser close logout, and remember-me token management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Role-Based Access Control" icon={Lock}>
            <CapabilityItem>Granular permission management (View/Create/Edit/Delete) per function</CapabilityItem>
            <CapabilityItem>Module, tab, and card-level permission controls</CapabilityItem>
            <CapabilityItem>Container-based access scoping for multi-tenant environments</CapabilityItem>
            <CapabilityItem>Role inheritance hierarchies with seeded vs. custom role classification</CapabilityItem>
            <CapabilityItem>Role type classification (Super Admin, Admin, Business, Self-Service)</CapabilityItem>
            <CapabilityItem>Role duplication and templating for rapid deployment</CapabilityItem>
            <CapabilityItem>Multi-tenant role visibility controls with activation/deactivation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Data Access & PII Protection" icon={Database}>
            <CapabilityItem>PII access levels (None/Limited/Full) configurable per role and domain</CapabilityItem>
            <CapabilityItem>Domain-specific PII controls: Personal, Compensation, Banking, Medical, Disciplinary</CapabilityItem>
            <CapabilityItem>Field-level data masking with just-in-time (JIT) access for sensitive data</CapabilityItem>
            <CapabilityItem>Approval workflows for full PII access with time-limited grants</CapabilityItem>
            <CapabilityItem>PII export restrictions and access logging with real-time alerts</CapabilityItem>
            <CapabilityItem>GDPR data subject request handling with right to erasure support</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Organizational Scope Controls" icon={Building}>
            <CapabilityItem>Company-level access restrictions for multi-entity deployments</CapabilityItem>
            <CapabilityItem>Division, department, and section-level permission scoping</CapabilityItem>
            <CapabilityItem>Pay group and company tag-based access controls</CapabilityItem>
            <CapabilityItem>Position type exclusions for sensitive role categories</CapabilityItem>
            <CapabilityItem>Hierarchical reporting line visibility controls</CapabilityItem>
            <CapabilityItem>Cross-entity permission management for shared services</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Approval Workflows & Delegation" icon={GitBranch}>
            <CapabilityItem>Configurable multi-step approval workflows with parallel/sequential routing</CapabilityItem>
            <CapabilityItem>Approval delegation with date ranges and workflow type restrictions</CapabilityItem>
            <CapabilityItem>Auto-escalation with SLA enforcement and reminder notifications</CapabilityItem>
            <CapabilityItem>Auto-approval rules for low-risk actions based on configurable thresholds</CapabilityItem>
            <CapabilityItem>Digital signature integration for critical approvals</CapabilityItem>
            <CapabilityItem>Substitute approver configuration with delegation audit trails</CapabilityItem>
            <CapabilityItem>Workflow analytics with bottleneck detection and optimization recommendations</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Audit, Compliance & Monitoring" icon={Eye}>
            <CapabilityItem>Complete activity logging with before/after value comparison (diff view)</CapabilityItem>
            <CapabilityItem>Risk-level classification for audit events with priority alerting</CapabilityItem>
            <CapabilityItem>Module-based audit filtering with export and long-term archival</CapabilityItem>
            <CapabilityItem>Security audit reports and real-time compliance dashboards</CapabilityItem>
            <CapabilityItem>Data retention policy configuration with automated enforcement</CapabilityItem>
            <CapabilityItem>Investigation request tracking with approval workflows</CapabilityItem>
            <CapabilityItem>Access certification campaigns and compliance framework alignment (ISO 27001, SOC 2)</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="AI Security & Governance" icon={Bot}>
            <CapabilityItem>AI security violation detection with unauthorized data access monitoring</CapabilityItem>
            <CapabilityItem>Role escalation attempt detection and PII query blocking</CapabilityItem>
            <CapabilityItem>AI response audit trails with explainability logging</CapabilityItem>
            <CapabilityItem>False positive review workflows with severity-based alert routing</CapabilityItem>
            <CapabilityItem>AI guardrails configuration with budget limit enforcement</CapabilityItem>
            <CapabilityItem>Model registry with approved/prohibited use case management</CapabilityItem>
          </CapabilityCategory>
        </div>

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
