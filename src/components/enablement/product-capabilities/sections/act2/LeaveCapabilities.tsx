import { Calendar, Clock, Settings, BarChart3, Users, FileText, DollarSign, AlertTriangle, Heart, Globe, Shield, Wallet } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { RegionalBadge } from "../../components/RegionalBadge";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export function LeaveCapabilities() {
  return (
    <ModuleCapabilityCard
      id="leave"
      icon={Calendar}
      title="Leave Management"
      tagline="Flexible leave policies for every scenario"
      overview="Comprehensive leave administration with configurable types, accrual rules, self-service requests, compliance tracking, and liability forecasting—handling every leave scenario across multiple countries."
      accentColor="bg-emerald-500/10 text-emerald-500"
      badge="80+ Capabilities"
    >
      <div className="space-y-6">
        {/* Value Story Header */}
        <ValueStoryHeader
          challenge="Leave management is a compliance minefield. Manual balance tracking leads to errors, policy variations by country create confusion, and coverage gaps during peak vacation seasons cripple operations. Employees don't know their entitlements; managers don't know who's available; HR doesn't know their liability exposure."
          promise="Intelli HRM Leave Management handles every leave scenario with precision. From statutory entitlements to custom policies, from accrual calculations to liability forecasting—every leave type, every country, every rule. Employees see real-time balances; managers maintain coverage; compliance is automatic."
          outcomes={[
            { metric: "100%", label: "Balance Accuracy", description: "Automated accrual calculations" },
            { metric: "Same Day", label: "Request Processing", description: "Self-service + auto-routing" },
            { metric: "~0", label: "Coverage Gaps", description: "Conflict detection + blackouts" },
            { metric: "Zero", label: "Compliance Risk", description: "Statutory leave automation" },
          ]}
          personas={[
            { role: "Employee", value: "I know exactly what leave I have and can request it instantly" },
            { role: "Manager", value: "I always have coverage and can plan around absences" },
            { role: "Payroll Administrator", value: "Leave pay calculations are automatic and accurate" },
            { role: "HR Compliance Officer", value: "Statutory leave requirements are always met" },
          ]}
        />

        {/* Capability Categories */}
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Leave Types Configuration" icon={Settings}>
            <CapabilityItem>30+ configurable leave types</CapabilityItem>
            <CapabilityItem>Paid vs. unpaid leave designation</CapabilityItem>
            <CapabilityItem>Gender-specific leave types (maternity, paternity)</CapabilityItem>
            <CapabilityItem>Accrual-based vs. entitlement-based types</CapabilityItem>
            <CapabilityItem>Leave that accrues while on leave tracking</CapabilityItem>
            <CapabilityItem>Negative balance allowance with limits</CapabilityItem>
            <CapabilityItem>Payment method configuration per type</CapabilityItem>
            <CapabilityItem>Documentation requirements per leave type</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Accrual Engine" icon={Clock}>
            <CapabilityItem>Multiple accrual rule engines</CapabilityItem>
            <CapabilityItem>Service-based entitlement tiers</CapabilityItem>
            <CapabilityItem>Pro-ration for mid-year joins</CapabilityItem>
            <CapabilityItem>Accrual frequency configuration</CapabilityItem>
            <CapabilityItem>Accrual caps and limits</CapabilityItem>
            <CapabilityItem>Accrual log and history tracking</CapabilityItem>
            <CapabilityItem>Balance recalculation tools</CapabilityItem>
            <CapabilityItem>Tenure-based bonus entitlements</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Rollover & Expiry" icon={AlertTriangle}>
            <CapabilityItem>Carry-forward rules by leave type</CapabilityItem>
            <CapabilityItem>Maximum rollover limits</CapabilityItem>
            <CapabilityItem>Use-it-or-lose-it enforcement</CapabilityItem>
            <CapabilityItem>Expiry date configuration</CapabilityItem>
            <CapabilityItem>Rollover schedule automation</CapabilityItem>
            <CapabilityItem>Grace period configuration</CapabilityItem>
            <CapabilityItem>Expiry notification alerts</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Request & Approval Workflow" icon={Users}>
            <CapabilityItem>Self-service leave requests</CapabilityItem>
            <CapabilityItem>Multi-level approval workflows</CapabilityItem>
            <CapabilityItem>Delegation during absence</CapabilityItem>
            <CapabilityItem>Escalation rules with SLA</CapabilityItem>
            <CapabilityItem>Bulk approval actions</CapabilityItem>
            <CapabilityItem>Request cancellation handling</CapabilityItem>
            <CapabilityItem>Document attachment support</CapabilityItem>
            <CapabilityItem>Approval history and audit trail</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Balance Management" icon={Wallet}>
            <CapabilityItem>Real-time balance display</CapabilityItem>
            <CapabilityItem>Future balance projections</CapabilityItem>
            <CapabilityItem>Entitlement summaries by type</CapabilityItem>
            <CapabilityItem>Balance adjustments with approval</CapabilityItem>
            <CapabilityItem>Year-end processing automation</CapabilityItem>
            <CapabilityItem>Balance audit trail</CapabilityItem>
            <CapabilityItem>Leave liability calculations</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Leave Encashment" icon={DollarSign}>
            <CapabilityItem>Encashment eligibility rules</CapabilityItem>
            <CapabilityItem>Encashment request workflow</CapabilityItem>
            <CapabilityItem>Payment tier configuration</CapabilityItem>
            <CapabilityItem>Encashment rate by leave type</CapabilityItem>
            <CapabilityItem>Annual encashment limits</CapabilityItem>
            <CapabilityItem>Payroll integration for payout</CapabilityItem>
            <CapabilityItem>Encashment history tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Maternity & Special Leave" icon={Heart}>
            <CapabilityItem>Maternity leave workflow with phases</CapabilityItem>
            <CapabilityItem>Paternity leave configuration</CapabilityItem>
            <CapabilityItem>Medical leave with documentation</CapabilityItem>
            <CapabilityItem>Return-to-work scheduling</CapabilityItem>
            <CapabilityItem>Phased return support</CapabilityItem>
            <CapabilityItem>Special leave types (bereavement, jury duty)</CapabilityItem>
            <CapabilityItem>Compassionate leave management</CapabilityItem>
            <CapabilityItem>Study leave configuration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Calendar & Scheduling" icon={Calendar}>
            <CapabilityItem>Team absence calendar</CapabilityItem>
            <CapabilityItem>Company-wide leave calendar</CapabilityItem>
            <CapabilityItem>Leave schedule configuration</CapabilityItem>
            <CapabilityItem>Schedule run automation</CapabilityItem>
            <CapabilityItem>Calendar export and sync (iCal, Outlook)</CapabilityItem>
            <CapabilityItem>Visual leave planner</CapabilityItem>
            <CapabilityItem>Department calendar views</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Blackout & Conflict Management" icon={Shield}>
            <CapabilityItem>Blackout period configuration</CapabilityItem>
            <CapabilityItem>Coverage requirement rules</CapabilityItem>
            <CapabilityItem>Conflict detection and alerts</CapabilityItem>
            <CapabilityItem>Minimum staffing enforcement</CapabilityItem>
            <CapabilityItem>Peak period restrictions</CapabilityItem>
            <CapabilityItem>Department-level blackouts</CapabilityItem>
            <CapabilityItem>Exception approval workflows</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Public Holidays" icon={Globe}>
            <CapabilityItem>Public holiday calendar by country</CapabilityItem>
            <CapabilityItem>Holiday observance rules</CapabilityItem>
            <CapabilityItem>Substitute holiday configuration</CapabilityItem>
            <CapabilityItem>Regional holiday variations</CapabilityItem>
            <CapabilityItem>Holiday pay rules integration</CapabilityItem>
            <CapabilityItem>Floating holiday management</CapabilityItem>
            <CapabilityItem>Company-specific holidays</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Compliance & Liability" icon={FileText}>
            <CapabilityItem>Statutory leave compliance tracking</CapabilityItem>
            <CapabilityItem>Compliance alerts and notifications</CapabilityItem>
            <CapabilityItem>Leave liability snapshot reporting</CapabilityItem>
            <CapabilityItem>Policy acknowledgment tracking</CapabilityItem>
            <CapabilityItem>Policy version management</CapabilityItem>
            <CapabilityItem>Country-specific compliance rules</CapabilityItem>
            <CapabilityItem>Audit-ready documentation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Analytics & Reporting" icon={BarChart3}>
            <CapabilityItem>Leave analytics dashboard</CapabilityItem>
            <CapabilityItem>Absence pattern detection</CapabilityItem>
            <CapabilityItem>Leave liability reporting</CapabilityItem>
            <CapabilityItem>Staffing impact predictions</CapabilityItem>
            <CapabilityItem>Year-over-year comparisons</CapabilityItem>
            <CapabilityItem>Department utilization analysis</CapabilityItem>
            <CapabilityItem>Cost analysis by leave type</CapabilityItem>
            <CapabilityItem>Trend forecasting</CapabilityItem>
          </CapabilityCategory>
        </div>

        <RegionalBadge regions={["Caribbean", "Africa"]}>
          Caribbean statutory leave (vacation, sick, maternity/paternity by country), African public holidays, Latin American labor laws, regional compliance automation
        </RegionalBadge>

        <AIFeatureHighlight>
          <AICapability type="predictive">Staffing impact predictions from leave patterns</AICapability>
          <AICapability type="automated">Optimal approval routing based on coverage</AICapability>
          <AICapability type="analytics">Absence pattern detection and anomaly alerts</AICapability>
          <AICapability type="prescriptive">Leave balance projection with recommendations</AICapability>
          <AICapability type="predictive">Liability forecasting for financial planning</AICapability>
          <AICapability type="automated">Compliance risk detection and alerts</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Time & Attendance", description: "Absence records and time tracking", bidirectional: true },
            { module: "Payroll", description: "Leave pay calculations" },
            { module: "Workforce", description: "Coverage and staffing levels" },
            { module: "ESS", description: "Employee self-service requests" },
            { module: "MSS", description: "Manager approvals and calendars" },
            { module: "Wellness", description: "Sick leave patterns and alerts" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
