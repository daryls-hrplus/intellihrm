import { Settings, Shield, Workflow, BarChart3, Smartphone, Plug, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeatureCategory = ({ 
  icon: Icon, 
  title, 
  features 
}: { 
  icon: React.ElementType; 
  title: string; 
  features: string[];
}) => (
  <Card className="border-border/50">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-1.5">
        {features.map((feature, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            {feature}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export const PlatformFeatures = () => {
  return (
    <section id="platform-features" className="space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mb-2">Enterprise Platform</Badge>
        <h2 className="text-2xl font-bold">Platform Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Built on enterprise-grade infrastructure with security, scalability, and flexibility at its core
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCategory
          icon={Shield}
          title="Security & Access Control"
          features={[
            "Role-based access control (RBAC)",
            "Field-level security and PII protection",
            "Complete audit trails",
            "Data encryption at rest and in transit",
            "SSO (SAML 2.0, OAuth 2.0)",
            "Multi-factor authentication (MFA)"
          ]}
        />

        <FeatureCategory
          icon={Workflow}
          title="Workflow Engine"
          features={[
            "Multi-step approval workflows",
            "Delegation and proxy support",
            "Automatic escalation rules",
            "Digital signature integration",
            "Parallel and sequential approvals",
            "Configurable business rules"
          ]}
        />

        <FeatureCategory
          icon={BarChart3}
          title="Analytics & Reporting"
          features={[
            "Interactive BI dashboards",
            "AI-powered report writer",
            "Monte Carlo workforce forecasting",
            "Custom report builder",
            "Scheduled report distribution",
            "Export to PDF, Excel, PowerPoint"
          ]}
        />

        <FeatureCategory
          icon={Smartphone}
          title="Mobile Experience"
          features={[
            "Fully responsive design",
            "Progressive Web App (PWA)",
            "Offline capability",
            "Push notifications",
            "Mobile clock-in/out with GPS",
            "Native app-like experience"
          ]}
        />

        <FeatureCategory
          icon={Plug}
          title="Integration Capabilities"
          features={[
            "RESTful API with full documentation",
            "Webhook event notifications",
            "File import/export (CSV, Excel)",
            "Pre-built ERP connectors",
            "Custom integration support",
            "Real-time data sync"
          ]}
        />

        <FeatureCategory
          icon={Globe}
          title="Multi-Entity Support"
          features={[
            "Multi-company configuration",
            "Multi-currency handling",
            "Multi-language (EN, ES, FR, AR)",
            "Consolidated reporting",
            "Entity-specific policies",
            "Shared services model support"
          ]}
        />
      </div>
    </section>
  );
};
