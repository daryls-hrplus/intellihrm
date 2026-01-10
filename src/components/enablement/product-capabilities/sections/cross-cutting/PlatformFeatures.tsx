import { 
  Settings, 
  Shield, 
  Workflow, 
  BarChart3, 
  Smartphone, 
  Plug, 
  Globe,
  FileCheck,
  Bell,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { ChallengePromise } from "../../components/ChallengePromise";
import { KeyOutcomeMetrics } from "../../components/KeyOutcomeMetrics";

export const PlatformFeatures = () => {
  return (
    <section id="platform-features" className="space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mb-2">Enterprise Platform</Badge>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold">Platform Features</h2>
          <Badge className="bg-primary/10 text-primary border-primary/20">70+</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Built on enterprise-grade infrastructure with security, scalability, and flexibility at its core
        </p>
      </div>

      <ChallengePromise
        challenge="Enterprise software fails when the foundation is weak. Security becomes an afterthought. Workflows break under complexity. Reporting requires IT intervention. Mobile access is an afterthought. Integrations become custom nightmares. Without a robust platform, every new feature becomes technical debt."
        promise="Intelli HRM Platform is enterprise-grade from day one. Security that meets the strictest audits. Workflows that adapt to any approval chain. Analytics that answer questions before they're asked. Mobile that works like native. Integrations that connect, not complicate. This is the foundation that lets HR focus on people, not technology."
      />

      <KeyOutcomeMetrics
        outcomes={[
          { value: "100%", label: "Audit Compliance", description: "Complete audit trails" },
          { value: "99.9%", label: "Uptime SLA", description: "Enterprise reliability" },
          { value: "<3 sec", label: "Page Load", description: "Performance at scale" },
          { value: "Zero", label: "Integration Failures", description: "Robust API architecture" }
        ]}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-lg bg-muted/30">
        <div className="text-center p-3">
          <p className="text-sm font-medium">Admin</p>
          <p className="text-xs text-muted-foreground italic">"I configure without code and trust the audit trail"</p>
        </div>
        <div className="text-center p-3">
          <p className="text-sm font-medium">CISO</p>
          <p className="text-xs text-muted-foreground italic">"Security meets our strictest requirements"</p>
        </div>
        <div className="text-center p-3">
          <p className="text-sm font-medium">IT Director</p>
          <p className="text-xs text-muted-foreground italic">"Integrations work reliably at scale"</p>
        </div>
        <div className="text-center p-3">
          <p className="text-sm font-medium">CFO</p>
          <p className="text-xs text-muted-foreground italic">"Multi-entity reporting without manual consolidation"</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CapabilityCategory title="Security & Access Control" icon={Shield} accentColor="text-blue-500">
          <CapabilityItem>Role-based access control (RBAC)</CapabilityItem>
          <CapabilityItem>Attribute-based access control (ABAC)</CapabilityItem>
          <CapabilityItem>Field-level security and PII protection</CapabilityItem>
          <CapabilityItem>Complete audit trails for all actions</CapabilityItem>
          <CapabilityItem>Data encryption at rest and in transit</CapabilityItem>
          <CapabilityItem>SSO (SAML 2.0, OAuth 2.0, OIDC)</CapabilityItem>
          <CapabilityItem>Multi-factor authentication (MFA)</CapabilityItem>
          <CapabilityItem>Session management and timeout</CapabilityItem>
          <CapabilityItem>IP whitelisting and geo-restrictions</CapabilityItem>
          <CapabilityItem>Password policy configuration</CapabilityItem>
          <CapabilityItem>Security violation monitoring</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Workflow Engine" icon={Workflow} accentColor="text-purple-500">
          <CapabilityItem>Visual workflow designer</CapabilityItem>
          <CapabilityItem>Multi-step approval workflows</CapabilityItem>
          <CapabilityItem>Parallel and sequential approvals</CapabilityItem>
          <CapabilityItem>Delegation and proxy support</CapabilityItem>
          <CapabilityItem>Automatic escalation rules</CapabilityItem>
          <CapabilityItem>Digital signature integration</CapabilityItem>
          <CapabilityItem>Conditional routing logic</CapabilityItem>
          <CapabilityItem>Time-based triggers</CapabilityItem>
          <CapabilityItem>Workflow versioning</CapabilityItem>
          <CapabilityItem>Workflow analytics</CapabilityItem>
          <CapabilityItem>Letter generation from workflows</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Audit & Compliance" icon={FileCheck} accentColor="text-green-500">
          <CapabilityItem>Complete action audit trails</CapabilityItem>
          <CapabilityItem>User session tracking</CapabilityItem>
          <CapabilityItem>Data change history</CapabilityItem>
          <CapabilityItem>Audit report generation</CapabilityItem>
          <CapabilityItem>Retention policy management</CapabilityItem>
          <CapabilityItem>Compliance evidence export</CapabilityItem>
          <CapabilityItem>Suspicious activity detection</CapabilityItem>
          <CapabilityItem>Audit coverage dashboards</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Analytics & Reporting" icon={BarChart3} accentColor="text-amber-500">
          <CapabilityItem>Interactive BI dashboards</CapabilityItem>
          <CapabilityItem>AI-powered report writer</CapabilityItem>
          <CapabilityItem>Monte Carlo workforce forecasting</CapabilityItem>
          <CapabilityItem>Custom report builder</CapabilityItem>
          <CapabilityItem>Scheduled report distribution</CapabilityItem>
          <CapabilityItem>Dashboard sharing and collaboration</CapabilityItem>
          <CapabilityItem>Export to PDF, Excel, PowerPoint</CapabilityItem>
          <CapabilityItem>Data visualization library</CapabilityItem>
          <CapabilityItem>Saved report configurations</CapabilityItem>
          <CapabilityItem>Drill-down capabilities</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Mobile Experience" icon={Smartphone} accentColor="text-pink-500">
          <CapabilityItem>Fully responsive design</CapabilityItem>
          <CapabilityItem>Progressive Web App (PWA)</CapabilityItem>
          <CapabilityItem>Offline capability with sync</CapabilityItem>
          <CapabilityItem>Push notifications</CapabilityItem>
          <CapabilityItem>Mobile clock-in/out with GPS</CapabilityItem>
          <CapabilityItem>Native app-like experience</CapabilityItem>
          <CapabilityItem>Biometric authentication</CapabilityItem>
          <CapabilityItem>Mobile-optimized workflows</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Integration Capabilities" icon={Plug} accentColor="text-cyan-500">
          <CapabilityItem>RESTful API with full documentation</CapabilityItem>
          <CapabilityItem>GraphQL API support</CapabilityItem>
          <CapabilityItem>Webhook event notifications</CapabilityItem>
          <CapabilityItem>File import/export (CSV, Excel, XML)</CapabilityItem>
          <CapabilityItem>Pre-built ERP connectors</CapabilityItem>
          <CapabilityItem>Pre-built payroll connectors</CapabilityItem>
          <CapabilityItem>Pre-built accounting connectors</CapabilityItem>
          <CapabilityItem>Real-time data sync</CapabilityItem>
          <CapabilityItem>API rate limiting and throttling</CapabilityItem>
          <CapabilityItem>Integration health monitoring</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Multi-Entity Support" icon={Globe} accentColor="text-teal-500">
          <CapabilityItem>Multi-company configuration</CapabilityItem>
          <CapabilityItem>Multi-currency handling</CapabilityItem>
          <CapabilityItem>Multi-language (EN, ES, FR, AR)</CapabilityItem>
          <CapabilityItem>Consolidated reporting</CapabilityItem>
          <CapabilityItem>Entity-specific policies</CapabilityItem>
          <CapabilityItem>Shared services model support</CapabilityItem>
          <CapabilityItem>Inter-company transfers</CapabilityItem>
          <CapabilityItem>Cost center hierarchies</CapabilityItem>
          <CapabilityItem>Cross-entity visibility controls</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Configuration Management" icon={Settings} accentColor="text-slate-500">
          <CapabilityItem>No-code configuration</CapabilityItem>
          <CapabilityItem>Custom field creation</CapabilityItem>
          <CapabilityItem>Lookup value management</CapabilityItem>
          <CapabilityItem>Business rule configuration</CapabilityItem>
          <CapabilityItem>Policy configuration</CapabilityItem>
          <CapabilityItem>Template management</CapabilityItem>
          <CapabilityItem>Configuration versioning</CapabilityItem>
          <CapabilityItem>Environment comparison</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Notification System" icon={Bell} accentColor="text-orange-500">
          <CapabilityItem>Multi-channel notifications (email, SMS, push, in-app)</CapabilityItem>
          <CapabilityItem>Notification preferences by user</CapabilityItem>
          <CapabilityItem>Template management with variables</CapabilityItem>
          <CapabilityItem>Scheduled and triggered notifications</CapabilityItem>
          <CapabilityItem>Digest and bundling options</CapabilityItem>
          <CapabilityItem>Delivery tracking</CapabilityItem>
          <CapabilityItem>Notification analytics</CapabilityItem>
        </CapabilityCategory>

        <CapabilityCategory title="Performance & Scalability" icon={Zap} accentColor="text-yellow-500">
          <CapabilityItem>Horizontal scaling architecture</CapabilityItem>
          <CapabilityItem>CDN for static assets</CapabilityItem>
          <CapabilityItem>Database connection pooling</CapabilityItem>
          <CapabilityItem>Caching strategies</CapabilityItem>
          <CapabilityItem>Load balancing</CapabilityItem>
          <CapabilityItem>Performance monitoring</CapabilityItem>
          <CapabilityItem>Auto-scaling capabilities</CapabilityItem>
          <CapabilityItem>Disaster recovery</CapabilityItem>
        </CapabilityCategory>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Enterprise-Grade Foundation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Built from the ground up for enterprise scale, security, and compliance. Every platform feature is designed to support thousands of users, complex organizational structures, and the strictest regulatory requirements.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">ISO 27001 Aligned</Badge>
                <Badge variant="secondary">SOC 2 Type II</Badge>
                <Badge variant="secondary">GDPR Compliant</Badge>
                <Badge variant="secondary">99.9% SLA</Badge>
                <Badge variant="secondary">24/7 Monitoring</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
