import { DollarSign, Calculator, FileText, Building, Users, Shield } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { RegionalBadge } from "../../components/RegionalBadge";

export function PayrollCapabilities() {
  return (
    <ModuleCapabilityCard
      id="payroll"
      icon={DollarSign}
      title="Payroll"
      tagline="Multi-country payroll with regional compliance built-in"
      overview="Enterprise payroll processing with gross-to-net calculations, statutory compliance, and comprehensive reporting for Caribbean and African markets."
      accentColor="bg-amber-500/10 text-amber-500"
      badge="50+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Pay Processing" icon={Calculator}>
            <CapabilityItem>Scheduled and ad-hoc pay runs</CapabilityItem>
            <CapabilityItem>Gross-to-net calculations</CapabilityItem>
            <CapabilityItem>Multi-currency support</CapabilityItem>
            <CapabilityItem>Retroactive pay calculations</CapabilityItem>
            <CapabilityItem>Off-cycle payments</CapabilityItem>
            <CapabilityItem>Payroll simulation/preview</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Earnings & Deductions" icon={DollarSign}>
            <CapabilityItem>Unlimited pay code configuration</CapabilityItem>
            <CapabilityItem>Formula-based calculations</CapabilityItem>
            <CapabilityItem>Court order/garnishment handling</CapabilityItem>
            <CapabilityItem>Loan deductions and tracking</CapabilityItem>
            <CapabilityItem>Bonus and commission processing</CapabilityItem>
            <CapabilityItem>Tip pool distribution</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Statutory Compliance" icon={Shield}>
            <CapabilityItem>NIS contributions (Jamaica, Trinidad)</CapabilityItem>
            <CapabilityItem>NHT calculations (Jamaica)</CapabilityItem>
            <CapabilityItem>PAYE tax processing</CapabilityItem>
            <CapabilityItem>SSNIT contributions (Ghana)</CapabilityItem>
            <CapabilityItem>Pension fund compliance</CapabilityItem>
            <CapabilityItem>Statutory tax relief schemes</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Reporting & Output" icon={FileText}>
            <CapabilityItem>Payroll journals and GL integration</CapabilityItem>
            <CapabilityItem>Bank file generation</CapabilityItem>
            <CapabilityItem>Government submission files</CapabilityItem>
            <CapabilityItem>Payslip generation and distribution</CapabilityItem>
            <CapabilityItem>Year-end processing (P60, IR56)</CapabilityItem>
            <CapabilityItem>Variance and audit reports</CapabilityItem>
          </CapabilityCategory>
        </div>

        <RegionalBadge regions={["Jamaica", "Trinidad", "Ghana"]}>
          Full Caribbean statutory support (Jamaica NIS/NHT/PAYE/HEART, Trinidad NIS/PAYE), African payroll (Ghana SSNIT, Nigeria pension), multi-country tax tables
        </RegionalBadge>

        <AIFeatureHighlight>
          <AICapability type="automated">Anomaly detection in payroll data</AICapability>
          <AICapability type="compliance">Pre-run validation and compliance checks</AICapability>
          <AICapability type="predictive">Budget forecasting and variance alerts</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Time & Attendance", description: "Hours worked and overtime data", bidirectional: true },
            { module: "Compensation", description: "Salary and pay grade information" },
            { module: "Benefits", description: "Deductions and employer contributions" },
            { module: "Finance/GL", description: "Journal entries and cost allocation" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
