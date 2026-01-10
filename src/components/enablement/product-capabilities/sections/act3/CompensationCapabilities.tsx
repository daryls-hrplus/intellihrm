import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Scale, 
  Award, 
  Calculator,
  Target,
  Gift,
  Briefcase,
  LineChart,
  Users,
  PieChart
} from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export function CompensationCapabilities() {
  const outcomes = [
    { metric: "<2%", label: "Pay Equity Gap", description: "AI-powered equity analysis" },
    { metric: "60% Faster", label: "Merit Cycle Time", description: "Streamlined workflows" },
    { metric: "98%+", label: "Budget Accuracy", description: "Real-time controls + forecasting" },
    { metric: "20%+", label: "Turnover Reduction", description: "Competitive positioning" },
  ];

  const personas = [
    { role: "Compensation Analyst", value: "I make decisions with real market data, not guesswork" },
    { role: "HR Business Partner", value: "I can explain any pay decision with confidence" },
    { role: "Manager", value: "Merit worksheets guide me to fair, defensible decisions" },
    { role: "CFO", value: "Complete visibility into compensation costs and forecasts" },
  ];

  return (
    <ModuleCapabilityCard
      id="compensation"
      icon={TrendingUp}
      title="Compensation"
      tagline="Strategic compensation planning with market intelligence"
      overview="Comprehensive compensation management including salary structures, planning cycles, market benchmarking, and pay equity analysis."
      accentColor="bg-amber-500/10 text-amber-500"
      badge="100+ Capabilities"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Compensation decisions made in spreadsheets lead to pay inequity, budget overruns, and talent attrition. Without market data, organizations overpay for some roles while losing top performers in others. Annual merit cycles become political battles without objective criteria. The cost of getting compensation wrong? Millions in turnover and morale damage."
          promise="Intelli HRM Compensation Management brings strategic intelligence to every pay decision. From salary structures and market benchmarking to equity grants and merit cycles, every compensation action is data-driven, compliant, and aligned with your talent strategy. AI-powered pay equity analysis ensures fairness, while budget controls keep costs in check."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Pay Elements & Structure" icon={DollarSign}>
            <CapabilityItem>Unlimited pay element configuration</CapabilityItem>
            <CapabilityItem>Earnings and deduction code setup</CapabilityItem>
            <CapabilityItem>Element categorization and grouping</CapabilityItem>
            <CapabilityItem>Frequency and calculation rules</CapabilityItem>
            <CapabilityItem>Tax treatment configuration</CapabilityItem>
            <CapabilityItem>Payroll mapping integration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Salary Grades & Bands" icon={TrendingUp}>
            <CapabilityItem>Grade and band configuration</CapabilityItem>
            <CapabilityItem>Salary ranges with min/mid/max</CapabilityItem>
            <CapabilityItem>Geographic differentials</CapabilityItem>
            <CapabilityItem>Multi-currency handling</CapabilityItem>
            <CapabilityItem>Spinal point systems with increments</CapabilityItem>
            <CapabilityItem>Job family alignment</CapabilityItem>
            <CapabilityItem>Grade progression rules</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Position Compensation" icon={Briefcase}>
            <CapabilityItem>Position-level salary assignment</CapabilityItem>
            <CapabilityItem>Budget vs. actual tracking</CapabilityItem>
            <CapabilityItem>Position cost components</CapabilityItem>
            <CapabilityItem>FTE-based calculations</CapabilityItem>
            <CapabilityItem>Position compensation history</CapabilityItem>
            <CapabilityItem>Vacancy cost projections</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Employee Compensation" icon={Users}>
            <CapabilityItem>Individual compensation records</CapabilityItem>
            <CapabilityItem>Compensation history tracking</CapabilityItem>
            <CapabilityItem>Change request workflows</CapabilityItem>
            <CapabilityItem>Multi-currency support</CapabilityItem>
            <CapabilityItem>Effective dating management</CapabilityItem>
            <CapabilityItem>Total compensation view</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Merit Cycles" icon={Calculator}>
            <CapabilityItem>Merit cycle configuration</CapabilityItem>
            <CapabilityItem>Budget allocation by department</CapabilityItem>
            <CapabilityItem>Manager worksheet generation</CapabilityItem>
            <CapabilityItem>Recommendation capture and approval</CapabilityItem>
            <CapabilityItem>Calibration session support</CapabilityItem>
            <CapabilityItem>Merit allocation tracking</CapabilityItem>
            <CapabilityItem>Review flag management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Bonus Management" icon={Gift}>
            <CapabilityItem>Bonus plan configuration</CapabilityItem>
            <CapabilityItem>Target and payout formulas</CapabilityItem>
            <CapabilityItem>Individual bonus awards</CapabilityItem>
            <CapabilityItem>Performance-linked bonuses</CapabilityItem>
            <CapabilityItem>Discretionary bonus tracking</CapabilityItem>
            <CapabilityItem>Payout scheduling</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Equity Management" icon={Award}>
            <CapabilityItem>Equity plan configuration (ISO, NSO, RSU)</CapabilityItem>
            <CapabilityItem>Grant management and tracking</CapabilityItem>
            <CapabilityItem>Vesting schedule automation</CapabilityItem>
            <CapabilityItem>Equity transaction history</CapabilityItem>
            <CapabilityItem>Exercise and sale tracking</CapabilityItem>
            <CapabilityItem>Equity value reporting</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Market Benchmarking" icon={BarChart3}>
            <CapabilityItem>Market benchmark data integration</CapabilityItem>
            <CapabilityItem>Compa-ratio calculations</CapabilityItem>
            <CapabilityItem>Quartile positioning analysis</CapabilityItem>
            <CapabilityItem>Market movement tracking</CapabilityItem>
            <CapabilityItem>Survey data import</CapabilityItem>
            <CapabilityItem>Job matching and leveling</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Pay Equity Analysis" icon={Scale}>
            <CapabilityItem>Multi-factor pay equity analysis</CapabilityItem>
            <CapabilityItem>Gender pay gap reporting</CapabilityItem>
            <CapabilityItem>Demographic analysis</CapabilityItem>
            <CapabilityItem>Equity risk identification</CapabilityItem>
            <CapabilityItem>Remediation recommendations</CapabilityItem>
            <CapabilityItem>Historical equity tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Total Rewards" icon={Target}>
            <CapabilityItem>Total rewards statement generation</CapabilityItem>
            <CapabilityItem>Benefit valuation integration</CapabilityItem>
            <CapabilityItem>Comprehensive compensation view</CapabilityItem>
            <CapabilityItem>Statement distribution automation</CapabilityItem>
            <CapabilityItem>Custom statement templates</CapabilityItem>
            <CapabilityItem>Year-over-year comparisons</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Position Budgeting & Planning" icon={LineChart}>
            <CapabilityItem>Position budget planning</CapabilityItem>
            <CapabilityItem>What-if scenario modeling</CapabilityItem>
            <CapabilityItem>Budget approval workflows</CapabilityItem>
            <CapabilityItem>Cost component configuration</CapabilityItem>
            <CapabilityItem>Vacancy cost projections</CapabilityItem>
            <CapabilityItem>Headcount vs. budget analysis</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Compensation Analytics" icon={PieChart}>
            <CapabilityItem>Compensation dashboards</CapabilityItem>
            <CapabilityItem>Cost trend analysis</CapabilityItem>
            <CapabilityItem>Minimum wage compliance monitoring</CapabilityItem>
            <CapabilityItem>Budget vs. actual reporting</CapabilityItem>
            <CapabilityItem>AI-powered insights</CapabilityItem>
            <CapabilityItem>Predictive cost modeling</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="prescriptive">Market-based adjustment recommendations</AICapability>
          <AICapability type="analytics">Pay equity risk identification and alerts</AICapability>
          <AICapability type="predictive">Budget optimization scenarios</AICapability>
          <AICapability type="automated">Merit increase recommendations based on performance</AICapability>
          <AICapability type="compliance">Compa-ratio trend forecasting and competitive positioning</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Payroll", description: "Salary changes and effective dates", bidirectional: true },
            { module: "Performance", description: "Rating-based increase guidelines" },
            { module: "Recruitment", description: "Offer salary benchmarking" },
            { module: "Budgeting", description: "Position cost planning" },
            { module: "Succession", description: "High-potential compensation planning" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
