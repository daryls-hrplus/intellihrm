import { 
  DollarSign, 
  Calculator, 
  FileText, 
  Shield, 
  Building, 
  Wallet, 
  PiggyBank, 
  AlertTriangle, 
  Landmark, 
  CreditCard, 
  FileCheck, 
  RotateCcw, 
  Clock, 
  BarChart3 
} from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { RegionalBadge } from "../../components/RegionalBadge";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export function PayrollCapabilities() {
  const outcomes = [
    { metric: "99.99%", label: "Payroll Accuracy", description: "AI anomaly detection + validation" },
    { metric: "70% Faster", label: "Processing Time", description: "Automation vs. manual" },
    { metric: "100% Ready", label: "Compliance Audit", description: "Full audit trail + statutory reports" },
    { metric: "Real-Time", label: "Cost Allocation", description: "Automated GL integration" },
  ];

  const personas = [
    { role: "Payroll Administrator", value: "I process payroll with confidence knowing errors are caught before they matter" },
    { role: "Finance Controller", value: "GL entries and cost allocations are automatic and accurate" },
    { role: "Compliance Officer", value: "Every statutory filing is on time with full documentation" },
    { role: "Employee", value: "My pay is always correct, and I can see every detail on my payslip" },
  ];

  return (
    <ModuleCapabilityCard
      id="payroll"
      icon={DollarSign}
      title="Payroll"
      tagline="Multi-country payroll with Caribbean, Latin American, and African compliance built-in"
      overview="Enterprise payroll processing with gross-to-net calculations, statutory compliance, and comprehensive reporting for Caribbean, Latin American, and African markets."
      accentColor="bg-amber-500/10 text-amber-500"
      badge="150+ Capabilities"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Payroll errors destroy trust. A single mistake affects employee livelihoods, creates compliance nightmares, and generates weeks of manual corrections. Multi-country operations multiply the complexity—different tax tables, statutory deductions, and filing requirements across Jamaica, Trinidad, Dominican Republic, Ghana, Nigeria, and beyond. Without automation, payroll becomes an endless cycle of stress and risk."
          promise="Intelli HRM Payroll is your complete pay processing command center. From gross-to-net calculations with country-specific compliance for the Caribbean, Latin America, and Africa to GL integration and bank file generation, every payrun is accurate, auditable, and on time. AI-powered anomaly detection catches errors before they happen, while multi-country support means one system for your entire workforce—wherever they are."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Pay Run Processing" icon={Calculator}>
            <CapabilityItem>Scheduled and ad-hoc pay runs</CapabilityItem>
            <CapabilityItem>Multi-company consolidated runs</CapabilityItem>
            <CapabilityItem>Gross-to-net calculations</CapabilityItem>
            <CapabilityItem>Payroll simulation and preview</CapabilityItem>
            <CapabilityItem>Off-cycle payment processing</CapabilityItem>
            <CapabilityItem>Pay run approval workflows</CapabilityItem>
            <CapabilityItem>Batch operations with bulk processing</CapabilityItem>
            <CapabilityItem>Run comparison and variance detection</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Earnings Configuration" icon={DollarSign}>
            <CapabilityItem>Unlimited pay code/element configuration</CapabilityItem>
            <CapabilityItem>Formula-based earnings calculations</CapabilityItem>
            <CapabilityItem>Bonus and commission processing</CapabilityItem>
            <CapabilityItem>Tip pool distribution and management</CapabilityItem>
            <CapabilityItem>Variable compensation processing</CapabilityItem>
            <CapabilityItem>Shift differentials and premiums</CapabilityItem>
            <CapabilityItem>Allowances and period-based payments</CapabilityItem>
            <CapabilityItem>Recurring and one-time earnings</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Deductions & Garnishments" icon={FileText}>
            <CapabilityItem>Deduction configuration with priorities</CapabilityItem>
            <CapabilityItem>Court order/garnishment handling</CapabilityItem>
            <CapabilityItem>Loan deductions and tracking</CapabilityItem>
            <CapabilityItem>Union dues automation</CapabilityItem>
            <CapabilityItem>Voluntary deduction management</CapabilityItem>
            <CapabilityItem>Benefit deduction integration</CapabilityItem>
            <CapabilityItem>Employee regular deductions</CapabilityItem>
            <CapabilityItem>Period-specific deductions</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Statutory Compliance" icon={Shield}>
            <CapabilityItem>Caribbean: NIS, NHT, HEART, PAYE (Jamaica, Trinidad, Barbados)</CapabilityItem>
            <CapabilityItem>Latin America: AFP, TSS (Dominican Republic), IMSS (Mexico)</CapabilityItem>
            <CapabilityItem>Africa: SSNIT (Ghana), Pension (Nigeria)</CapabilityItem>
            <CapabilityItem>Tax bracket configuration by country</CapabilityItem>
            <CapabilityItem>Tax relief schemes and enrollments</CapabilityItem>
            <CapabilityItem>Statutory rate band management</CapabilityItem>
            <CapabilityItem>Tax allowance tracking</CapabilityItem>
            <CapabilityItem>Tax form generation (W-2, P60, IR56)</CapabilityItem>
            <CapabilityItem>Minimum wage compliance checking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Salary Advances" icon={Wallet}>
            <CapabilityItem>Advance type configuration</CapabilityItem>
            <CapabilityItem>Advance request and approval workflow</CapabilityItem>
            <CapabilityItem>Repayment schedule automation</CapabilityItem>
            <CapabilityItem>Payroll queue integration</CapabilityItem>
            <CapabilityItem>Balance tracking and limits</CapabilityItem>
            <CapabilityItem>Emergency advance processing</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Savings Programs" icon={PiggyBank}>
            <CapabilityItem>Savings program type configuration</CapabilityItem>
            <CapabilityItem>Employee enrollment management</CapabilityItem>
            <CapabilityItem>Balance tracking and statements</CapabilityItem>
            <CapabilityItem>Scheduled release processing</CapabilityItem>
            <CapabilityItem>Transaction history</CapabilityItem>
            <CapabilityItem>Payroll deduction integration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Overpayment Recovery" icon={AlertTriangle}>
            <CapabilityItem>Overpayment detection and recording</CapabilityItem>
            <CapabilityItem>Recovery plan configuration</CapabilityItem>
            <CapabilityItem>Payment tracking and reconciliation</CapabilityItem>
            <CapabilityItem>Status history and audit trail</CapabilityItem>
            <CapabilityItem>Employee notification automation</CapabilityItem>
            <CapabilityItem>Multi-period recovery scheduling</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="GL Integration" icon={Landmark}>
            <CapabilityItem>Chart of accounts mapping</CapabilityItem>
            <CapabilityItem>Cost center configuration with segments</CapabilityItem>
            <CapabilityItem>Cost reallocation rules</CapabilityItem>
            <CapabilityItem>Journal batch generation</CapabilityItem>
            <CapabilityItem>Override rules for exceptions</CapabilityItem>
            <CapabilityItem>Entity segment mappings</CapabilityItem>
            <CapabilityItem>Export to ERP systems</CapabilityItem>
            <CapabilityItem>Reconciliation reporting</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Bank File Generation" icon={CreditCard}>
            <CapabilityItem>Multi-format bank file configuration</CapabilityItem>
            <CapabilityItem>Net pay split management</CapabilityItem>
            <CapabilityItem>Multi-currency payments</CapabilityItem>
            <CapabilityItem>Bank file generation and history</CapabilityItem>
            <CapabilityItem>Payment validation and verification</CapabilityItem>
            <CapabilityItem>NACHA, BACS, and regional formats</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Payslips & Distribution" icon={FileCheck}>
            <CapabilityItem>Payslip template configuration</CapabilityItem>
            <CapabilityItem>Multi-format output (PDF, email)</CapabilityItem>
            <CapabilityItem>Employee self-service access</CapabilityItem>
            <CapabilityItem>Historical payslip archive</CapabilityItem>
            <CapabilityItem>Payslip branding customization</CapabilityItem>
            <CapabilityItem>Bulk distribution automation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Year-End Processing" icon={Building}>
            <CapabilityItem>Year-end closing workflows</CapabilityItem>
            <CapabilityItem>P60/W-2/IR56 generation</CapabilityItem>
            <CapabilityItem>Government submission files</CapabilityItem>
            <CapabilityItem>Balance rollover processing</CapabilityItem>
            <CapabilityItem>Archive and retention management</CapabilityItem>
            <CapabilityItem>Regulatory filing automation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Retroactive Pay" icon={RotateCcw}>
            <CapabilityItem>Retroactive configuration rules</CapabilityItem>
            <CapabilityItem>Automatic recalculation engine</CapabilityItem>
            <CapabilityItem>Period-spanning adjustments</CapabilityItem>
            <CapabilityItem>Approval workflow for retro pay</CapabilityItem>
            <CapabilityItem>Impact analysis and preview</CapabilityItem>
            <CapabilityItem>Audit trail documentation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Time & Attendance Integration" icon={Clock}>
            <CapabilityItem>Automated time data sync</CapabilityItem>
            <CapabilityItem>Overtime mapping and calculations</CapabilityItem>
            <CapabilityItem>Leave payment integration</CapabilityItem>
            <CapabilityItem>Shift payment rules</CapabilityItem>
            <CapabilityItem>Sync log and reconciliation</CapabilityItem>
            <CapabilityItem>Exception handling workflows</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Payroll Analytics & Reporting" icon={BarChart3}>
            <CapabilityItem>Payroll variance reports</CapabilityItem>
            <CapabilityItem>Cost analysis dashboards</CapabilityItem>
            <CapabilityItem>Compliance reporting suite</CapabilityItem>
            <CapabilityItem>AI-generated payroll reports</CapabilityItem>
            <CapabilityItem>Trend analysis and forecasting</CapabilityItem>
            <CapabilityItem>Audit trail and history</CapabilityItem>
          </CapabilityCategory>
        </div>

        <RegionalBadge regions={["Jamaica", "Trinidad", "Dominican Republic", "Ghana"]}>
          Full Caribbean statutory support (Jamaica NIS/NHT/PAYE/HEART, Trinidad NIS/PAYE), Latin American payroll (Dominican Republic AFP/TSS, Mexico IMSS), African payroll (Ghana SSNIT, Nigeria pension), multi-country tax tables, regional bank file formats
        </RegionalBadge>

        <AIFeatureHighlight>
          <AICapability type="automated">Anomaly detection in payroll data before processing</AICapability>
          <AICapability type="compliance">Pre-run validation with compliance checks</AICapability>
          <AICapability type="predictive">Budget forecasting and variance alerts</AICapability>
          <AICapability type="analytics">Error pattern detection across pay runs</AICapability>
          <AICapability type="prescriptive">Payroll cost predictions and optimal payment date recommendations</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Time & Attendance", description: "Hours worked and overtime data", bidirectional: true },
            { module: "Compensation", description: "Salary and pay grade information" },
            { module: "Benefits", description: "Deductions and employer contributions" },
            { module: "Finance/GL", description: "Journal entries and cost allocation" },
            { module: "Workforce", description: "Employee data and organizational structure" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
