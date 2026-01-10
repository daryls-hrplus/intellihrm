import { 
  Gift, 
  Users, 
  FileText, 
  Heart, 
  DollarSign, 
  Settings,
  Building,
  Shield,
  Calendar,
  UserPlus,
  Receipt,
  BarChart3
} from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { RegionalBadge } from "../../components/RegionalBadge";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export function BenefitsCapabilities() {
  const outcomes = [
    { metric: "99.9%", label: "Enrollment Accuracy", description: "Eligibility automation" },
    { metric: "75% Faster", label: "Claims Processing", description: "Digital workflows" },
    { metric: "+40%", label: "Employee Understanding", description: "Plan comparison + AI guidance" },
    { metric: "80% Reduced", label: "Admin Time", description: "Self-service + automation" },
  ];

  const personas = [
    { role: "Employee", value: "I understand my benefits and can easily choose what's right for my family" },
    { role: "HR Benefits Admin", value: "Enrollment and claims run themselves with minimal intervention" },
    { role: "Finance", value: "Complete visibility into benefit costs and liability forecasting" },
    { role: "Compliance Officer", value: "Every enrollment is documented and audit-ready" },
  ];

  return (
    <ModuleCapabilityCard
      id="benefits"
      icon={Gift}
      title="Benefits Administration"
      tagline="Comprehensive benefits from enrollment to claims"
      overview="Full lifecycle benefits management including plan configuration, open enrollment, life events, claims processing, and cost analysis."
      accentColor="bg-amber-500/10 text-amber-500"
      badge="95+ Capabilities"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Benefits administration is a compliance minefield. Paper enrollments get lost, life events trigger confusion, and employees don't understand what they're signing up for. Open enrollment becomes an annual crisis, claims processing takes weeks, and HR spends more time on benefits administration than strategic workforce planning. Meanwhile, rising healthcare costs demand smarter decisions."
          promise="HRplus Benefits Administration delivers complete lifecycle management from enrollment to claims. Configurable plans, automated eligibility, life event processing, and self-service enrollment empower employees while reducing HR burden. AI-powered plan recommendations help employees make optimal choices, while cost analytics enable data-driven decisions on benefit offerings."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Plan Configuration" icon={Settings}>
            <CapabilityItem>Health, life, dental, vision plans</CapabilityItem>
            <CapabilityItem>Pension and retirement plans</CapabilityItem>
            <CapabilityItem>Voluntary benefit options</CapabilityItem>
            <CapabilityItem>Multi-tier coverage structures (Employee, Employee+Spouse, Family)</CapabilityItem>
            <CapabilityItem>Contribution rules and formulas</CapabilityItem>
            <CapabilityItem>Plan versioning and renewals</CapabilityItem>
            <CapabilityItem>Plan effective date management</CapabilityItem>
            <CapabilityItem>Benefit category organization</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Provider Management" icon={Building}>
            <CapabilityItem>Provider registration and tracking</CapabilityItem>
            <CapabilityItem>Contact and contract management</CapabilityItem>
            <CapabilityItem>Service level configuration</CapabilityItem>
            <CapabilityItem>Provider performance tracking</CapabilityItem>
            <CapabilityItem>Rate negotiation history</CapabilityItem>
            <CapabilityItem>Multi-provider support</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Eligibility & Rules" icon={Shield}>
            <CapabilityItem>Eligibility rule configuration</CapabilityItem>
            <CapabilityItem>Dependent eligibility rules</CapabilityItem>
            <CapabilityItem>Auto-enrollment rule setup</CapabilityItem>
            <CapabilityItem>Waiting period management</CapabilityItem>
            <CapabilityItem>Evidence of insurability tracking</CapabilityItem>
            <CapabilityItem>Eligibility audit trails</CapabilityItem>
            <CapabilityItem>Age and service requirements</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Enrollment Management" icon={Users}>
            <CapabilityItem>Open enrollment campaigns</CapabilityItem>
            <CapabilityItem>Self-service enrollment portal</CapabilityItem>
            <CapabilityItem>Enrollment period configuration</CapabilityItem>
            <CapabilityItem>Enrollment confirmation generation</CapabilityItem>
            <CapabilityItem>Benefit election tracking</CapabilityItem>
            <CapabilityItem>Enrollment status monitoring</CapabilityItem>
            <CapabilityItem>Batch enrollment processing</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Life Event Processing" icon={Calendar}>
            <CapabilityItem>Life event type configuration</CapabilityItem>
            <CapabilityItem>Qualifying event verification</CapabilityItem>
            <CapabilityItem>Event-triggered enrollment windows</CapabilityItem>
            <CapabilityItem>Documentation requirements</CapabilityItem>
            <CapabilityItem>Workflow automation</CapabilityItem>
            <CapabilityItem>Event audit tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Dependent Management" icon={UserPlus}>
            <CapabilityItem>Dependent registration and verification</CapabilityItem>
            <CapabilityItem>Dependent eligibility tracking</CapabilityItem>
            <CapabilityItem>Age-out automation</CapabilityItem>
            <CapabilityItem>Student verification</CapabilityItem>
            <CapabilityItem>Domestic partner support</CapabilityItem>
            <CapabilityItem>Dependent document collection</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Claims Processing" icon={FileText}>
            <CapabilityItem>Claim submission portal</CapabilityItem>
            <CapabilityItem>Adjudication workflows</CapabilityItem>
            <CapabilityItem>Payment tracking and reconciliation</CapabilityItem>
            <CapabilityItem>Appeals management</CapabilityItem>
            <CapabilityItem>EOB generation</CapabilityItem>
            <CapabilityItem>Claim history and reporting</CapabilityItem>
            <CapabilityItem>Fraud detection alerts</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Expense Claims" icon={Receipt}>
            <CapabilityItem>Expense claim submission</CapabilityItem>
            <CapabilityItem>Receipt upload and verification</CapabilityItem>
            <CapabilityItem>Approval workflows</CapabilityItem>
            <CapabilityItem>Reimbursement tracking</CapabilityItem>
            <CapabilityItem>Category-based limits</CapabilityItem>
            <CapabilityItem>Payroll integration for reimbursement</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Payroll Integration" icon={DollarSign}>
            <CapabilityItem>Deduction mapping and automation</CapabilityItem>
            <CapabilityItem>Contribution calculations</CapabilityItem>
            <CapabilityItem>Employer match processing</CapabilityItem>
            <CapabilityItem>Pre/post-tax handling</CapabilityItem>
            <CapabilityItem>Payroll sync validation</CapabilityItem>
            <CapabilityItem>Arrears processing</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Cost Analysis & Projections" icon={Heart}>
            <CapabilityItem>Utilization analysis</CapabilityItem>
            <CapabilityItem>Cost trend reporting</CapabilityItem>
            <CapabilityItem>Renewal forecasting</CapabilityItem>
            <CapabilityItem>Employee cost modeling</CapabilityItem>
            <CapabilityItem>Plan cost comparison</CapabilityItem>
            <CapabilityItem>Budget vs. actual tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Compliance & Reporting" icon={Shield}>
            <CapabilityItem>Compliance reporting suite</CapabilityItem>
            <CapabilityItem>ACA compliance (US)</CapabilityItem>
            <CapabilityItem>Regional statutory compliance</CapabilityItem>
            <CapabilityItem>Eligibility audit reports</CapabilityItem>
            <CapabilityItem>Benefit liability reporting</CapabilityItem>
            <CapabilityItem>Regulatory filing support</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Benefits Analytics" icon={BarChart3}>
            <CapabilityItem>Benefits dashboards</CapabilityItem>
            <CapabilityItem>Enrollment analytics</CapabilityItem>
            <CapabilityItem>Claims analytics</CapabilityItem>
            <CapabilityItem>Provider utilization</CapabilityItem>
            <CapabilityItem>Cost driver analysis</CapabilityItem>
            <CapabilityItem>AI-powered optimization recommendations</CapabilityItem>
          </CapabilityCategory>
        </div>

        <RegionalBadge regions={["Caribbean", "Africa"]}>
          Caribbean health scheme integration, African pension requirements, regional statutory benefit compliance, multi-country provider networks
        </RegionalBadge>

        <AIFeatureHighlight>
          <AICapability type="prescriptive">Personalized plan recommendations based on employee profile</AICapability>
          <AICapability type="predictive">Cost and utilization predictions</AICapability>
          <AICapability type="analytics">Optimization opportunity identification</AICapability>
          <AICapability type="automated">Claims anomaly detection</AICapability>
          <AICapability type="compliance">Enrollment pattern analysis and renewal cost forecasting</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Payroll", description: "Deduction calculations and contributions", bidirectional: true },
            { module: "Workforce", description: "Dependent and eligibility data" },
            { module: "ESS", description: "Self-service enrollment and claims" },
            { module: "Onboarding", description: "New hire benefit enrollment" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
