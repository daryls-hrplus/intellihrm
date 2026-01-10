import { 
  Users, 
  Building2, 
  Briefcase, 
  GitBranch, 
  FileText,
  BarChart3,
  Target,
  Shield,
  Globe,
  Layers,
  User,
  UserCog,
  TrendingUp,
  Database
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

export function WorkforceCapabilities() {
  return (
    <ModuleCapabilityCard
      id="workforce"
      icon={Users}
      title="Workforce Management"
      tagline="The complete employee record, from hire to retire"
      overview="Comprehensive employee master data, organization structure, position management, job architecture, headcount planning, and workforce analytics. The single source of truth for your entire organization with 16+ configurable data tabs per employee."
      accentColor="bg-indigo-500/10 text-indigo-500"
      badge="150+ Capabilities"
    >
      <div className="space-y-6">
        {/* Challenge & Promise */}
        <ChallengePromise
          challenge="Employee data scattered across spreadsheets, siloed org charts that are always outdated, and manual position tracking create a governance nightmare. Without a single source of truth, strategic workforce decisions are based on gut feel, compliance risks multiply, and HR spends hours chasing data instead of driving strategy."
          promise="HRplus Workforce Management is your organization's living blueprint. Every employee, every position, every reporting relationship—unified in one intelligent system that automatically maintains accuracy, surfaces insights, and enables data-driven workforce planning across countries and entities."
        />

        {/* Key Outcomes */}
        <KeyOutcomeMetrics
          outcomes={[
            { value: "99.9%", label: "Data Accuracy", description: "Single source of truth", trend: "up" },
            { value: "80%", label: "Faster Reporting", description: "Real-time dashboards vs. manual", trend: "up" },
            { value: "Near Zero", label: "Compliance Risk", description: "Automated document tracking", trend: "down" },
            { value: "360°", label: "Workforce Visibility", description: "All dimensions, all countries", trend: "up" },
          ]}
        />

        {/* Persona Value Cards */}
        <PersonaGrid>
          <PersonaValueCard
            icon={UserCog}
            persona="HR Business Partner"
            benefit="I see my entire workforce at a glance with real insights"
            accentColor="text-indigo-500 bg-indigo-500/10"
            outcomes={[
              "Complete employee profiles across 16+ data tabs",
              "Real-time org structure with drill-down",
              "Attrition risk alerts and workforce trends",
            ]}
          />
          <PersonaValueCard
            icon={TrendingUp}
            persona="Compensation Analyst"
            benefit="Position data flows seamlessly into pay decisions"
            accentColor="text-blue-500 bg-blue-500/10"
            outcomes={[
              "Job architecture with salary grade linkage",
              "Position-based compensation planning",
              "Market data integration for benchmarking",
            ]}
          />
          <PersonaValueCard
            icon={Shield}
            persona="Compliance Officer"
            benefit="Every document tracked, every expiry alerted"
            accentColor="text-red-500 bg-red-500/10"
            outcomes={[
              "Document expiry tracking with alerts",
              "Work permit and certification monitoring",
              "Complete audit trail for all changes",
            ]}
          />
          <PersonaValueCard
            icon={Target}
            persona="Workforce Planner"
            benefit="Scenario modeling with real data, not spreadsheets"
            accentColor="text-emerald-500 bg-emerald-500/10"
            outcomes={[
              "Headcount requests and approval workflows",
              "Monte Carlo workforce forecasting",
              "Skills gap analysis and planning",
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
            Explore the comprehensive workforce management capabilities that power your HR operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory 
            title="Employee Master Data" 
            icon={Users}
            context="The employee record is the foundation of all HR operations. Complete, accurate data enables every downstream process."
          >
            <CapabilityItem>100+ standard fields with unlimited custom fields</CapabilityItem>
            <CapabilityItem>16+ configurable data tabs per employee</CapabilityItem>
            <CapabilityItem>Document attachments with expiry tracking</CapabilityItem>
            <CapabilityItem>Employment history and transaction log</CapabilityItem>
            <CapabilityItem>Government ID management (TRN, NIS, NHT, SSN, etc.)</CapabilityItem>
            <CapabilityItem>Dependent and emergency contact management</CapabilityItem>
            <CapabilityItem>Multi-currency payment support</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Employee Data Tabs" 
            icon={Database}
            context="Complete employee profiles across every dimension—from qualifications to immigration status to personal interests."
          >
            <CapabilityItem>Qualifications and certifications with expiry tracking</CapabilityItem>
            <CapabilityItem>Licenses and recertification management</CapabilityItem>
            <CapabilityItem>Professional memberships and affiliations</CapabilityItem>
            <CapabilityItem>Language proficiencies with history</CapabilityItem>
            <CapabilityItem>Skills and competency profiles</CapabilityItem>
            <CapabilityItem>Medical profile with confidential access controls</CapabilityItem>
            <CapabilityItem>Immigration, work permits, and travel documents</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Organization Structure" 
            icon={Building2}
            context="Interactive org charts that stay current automatically. Visualize your organization across any dimension."
          >
            <CapabilityItem>Multi-dimensional org visualization</CapabilityItem>
            <CapabilityItem>Date-effective org snapshots and history</CapabilityItem>
            <CapabilityItem>Department and division hierarchies</CapabilityItem>
            <CapabilityItem>Cost center management and allocation</CapabilityItem>
            <CapabilityItem>Multi-entity (company) structures</CapabilityItem>
            <CapabilityItem>Reporting relationship management</CapabilityItem>
            <CapabilityItem>Span of control analytics</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Position Management" 
            icon={Briefcase}
            context="Positions are the building blocks of your organization. Proper position management enables workforce planning and control."
          >
            <CapabilityItem>Job catalog with job families and subfamilies</CapabilityItem>
            <CapabilityItem>Position budgeting and headcount control</CapabilityItem>
            <CapabilityItem>Vacancy tracking and reporting</CapabilityItem>
            <CapabilityItem>Competency and skill requirements by position</CapabilityItem>
            <CapabilityItem>Headcount requests and approval workflows</CapabilityItem>
            <CapabilityItem>Position history and incumbent tracking</CapabilityItem>
            <CapabilityItem>Position types and classifications</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Job Architecture" 
            icon={Layers}
            context="Jobs define the work; positions define where it happens. A clear job architecture enables fair compensation and career paths."
          >
            <CapabilityItem>Job families and subfamilies structure</CapabilityItem>
            <CapabilityItem>Job responsibilities and KRAs</CapabilityItem>
            <CapabilityItem>Job goals and objectives framework</CapabilityItem>
            <CapabilityItem>Job capability requirements</CapabilityItem>
            <CapabilityItem>Competency frameworks by job level</CapabilityItem>
            <CapabilityItem>Level expectations and progression criteria</CapabilityItem>
            <CapabilityItem>Pay spine and salary grade linkage</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Lifecycle Transactions" 
            icon={GitBranch}
            context="Every employment event must be tracked, approved, and auditable. Proper lifecycle management ensures compliance and accuracy."
          >
            <CapabilityItem>Promotions with approval workflows</CapabilityItem>
            <CapabilityItem>Lateral moves and transfers across entities</CapabilityItem>
            <CapabilityItem>Terminations with exit workflows</CapabilityItem>
            <CapabilityItem>Rehire processing with history restoration</CapabilityItem>
            <CapabilityItem>Acting and temporary assignments</CapabilityItem>
            <CapabilityItem>Mass update capabilities for bulk changes</CapabilityItem>
            <CapabilityItem>Payroll mapping for transaction types</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Headcount Planning" 
            icon={Target}
            context="Plan your workforce, not just report on it. Proactive planning ensures you have the right people in the right roles."
          >
            <CapabilityItem>Headcount requests with business justification</CapabilityItem>
            <CapabilityItem>Multi-level approval workflows</CapabilityItem>
            <CapabilityItem>Position budget planning and tracking</CapabilityItem>
            <CapabilityItem>What-if scenario modeling</CapabilityItem>
            <CapabilityItem>Budget forecast vs. actuals reporting</CapabilityItem>
            <CapabilityItem>Cost component analysis (salary, benefits, etc.)</CapabilityItem>
            <CapabilityItem>Multi-year planning horizons</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Workforce Analytics" 
            icon={BarChart3}
            context="Transform data into workforce intelligence. Real-time analytics enable proactive, data-driven decisions."
          >
            <CapabilityItem>Headcount analytics dashboard</CapabilityItem>
            <CapabilityItem>Workforce forecasting (Monte Carlo simulation)</CapabilityItem>
            <CapabilityItem>Turnover and attrition analysis</CapabilityItem>
            <CapabilityItem>Bradford score calculation for absence patterns</CapabilityItem>
            <CapabilityItem>Tenure and demographics reporting</CapabilityItem>
            <CapabilityItem>Skills inventory and gap analysis</CapabilityItem>
            <CapabilityItem>Probation tracking and conversion rates</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Compliance & Documentation" 
            icon={FileText}
            context="Never miss an expiry, never fail an audit. Automated tracking ensures compliance with minimal manual effort."
          >
            <CapabilityItem>Document expiry tracking with automated alerts</CapabilityItem>
            <CapabilityItem>Certification recertification management</CapabilityItem>
            <CapabilityItem>Work permit and visa expiry monitoring</CapabilityItem>
            <CapabilityItem>Mandatory training compliance tracking</CapabilityItem>
            <CapabilityItem>Policy acknowledgment and signature tracking</CapabilityItem>
            <CapabilityItem>Complete audit trail for all changes</CapabilityItem>
            <CapabilityItem>Compliance dashboard with risk indicators</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory 
            title="Regional Data Support" 
            icon={Globe}
            context="Built for the Caribbean, Africa, and Latin America from day one. Native support for regional requirements."
          >
            <CapabilityItem>Caribbean statutory IDs (TRN, NIS, NHT)</CapabilityItem>
            <CapabilityItem>CSME certificate tracking for Caribbean</CapabilityItem>
            <CapabilityItem>African national ID formats (SSNIT, NHIF, etc.)</CapabilityItem>
            <CapabilityItem>Mexican employee data (IMSS, INFONAVIT, RFC)</CapabilityItem>
            <CapabilityItem>Multi-country employment support</CapabilityItem>
            <CapabilityItem>Data residency compliance by region</CapabilityItem>
            <CapabilityItem>Local address and contact format support</CapabilityItem>
          </CapabilityCategory>
        </div>

        {/* Regional Advantage */}
        <RegionalAdvantage
          regions={["Caribbean", "Africa", "LatAm"]}
          advantages={[
            "Pre-configured statutory ID types for 15+ Caribbean countries",
            "African national registration formats (Ghana SSNIT, Nigeria PFA, Kenya NHIF)",
            "Latin American tax and social security IDs (Mexico RFC, DR RNC)",
            "Multi-country employment with cross-border compliance",
          ]}
        />

        <AIFeatureHighlight>
          <AICapability type="predictive">Attrition risk scoring with early warning alerts</AICapability>
          <AICapability type="analytics">Monte Carlo workforce forecasting and scenario modeling</AICapability>
          <AICapability type="prescriptive">Org structure optimization recommendations</AICapability>
          <AICapability type="automated">Probation tracking with milestone alerts</AICapability>
          <AICapability type="predictive">Skills gap analysis with training recommendations</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Payroll", description: "Employee compensation and banking data", bidirectional: true },
            { module: "Time & Attendance", description: "Schedule assignments and time records" },
            { module: "Performance", description: "Manager relationships and goal owners" },
            { module: "Succession", description: "9-Box placement and career paths" },
            { module: "Recruitment", description: "Headcount control and vacancy management" },
            { module: "Compensation", description: "Position-based salary structures" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
