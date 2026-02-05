import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const PayrollDashboardPage = lazy(() => import("@/pages/payroll/PayrollDashboardPage"));
const TaxAllowancesPage = lazy(() => import("@/pages/payroll/TaxAllowancesPage"));
const CountryPayrollYearSetupPage = lazy(() => import("@/pages/payroll/CountryPayrollYearSetupPage"));
const BankFileBuilderPage = lazy(() => import("@/pages/payroll/BankFileBuilderPage"));
const PayGroupsPage = lazy(() => import("@/pages/payroll/PayGroupsPage"));
const SemiMonthlyPayrollRulesPage = lazy(() => import("@/pages/payroll/SemiMonthlyPayrollRulesPage"));
const CountryTaxSettingsPage = lazy(() => import("@/pages/payroll/CountryTaxSettingsPage"));
const TipPoolManagementPage = lazy(() => import("@/pages/payroll/TipPoolManagementPage"));
const StatutoryTaxReliefPage = lazy(() => import("@/pages/payroll/StatutoryTaxReliefPage"));
const TaxReliefSchemesPage = lazy(() => import("@/pages/payroll/TaxReliefSchemesPage"));
const PayPeriodsPage = lazy(() => import("@/pages/payroll/PayPeriodsPage"));
const PayrollProcessingPage = lazy(() => import("@/pages/payroll/PayrollProcessingPage"));
const OffCyclePayrollPage = lazy(() => import("@/pages/payroll/OffCyclePayrollPage"));
const TaxConfigPage = lazy(() => import("@/pages/payroll/TaxConfigPage"));
const PayrollReportsPage = lazy(() => import("@/pages/payroll/PayrollReportsPage"));
const YearEndProcessingPage = lazy(() => import("@/pages/payroll/YearEndProcessingPage"));
const YearEndPayrollClosingPage = lazy(() => import("@/pages/payroll/YearEndPayrollClosingPage"));
const StatutoryDeductionTypesPage = lazy(() => import("@/pages/payroll/StatutoryDeductionTypesPage"));
const PayslipsPage = lazy(() => import("@/pages/payroll/PayslipsPage"));
const PayPeriodPayrollEntriesPage = lazy(() => import("@/pages/payroll/PayPeriodPayrollEntriesPage"));
const EmployeeRegularDeductionsPage = lazy(() => import("@/pages/payroll/EmployeeRegularDeductionsPage"));
const OverpaymentRecoveryPage = lazy(() => import("@/pages/payroll/OverpaymentRecoveryPage"));
const LeavePaymentConfigPage = lazy(() => import("@/pages/payroll/LeavePaymentConfigPage"));
const LeaveBalanceBuyoutPage = lazy(() => import("@/pages/payroll/LeaveBalanceBuyoutPage"));
const PayslipTemplateConfigPage = lazy(() => import("@/pages/payroll/PayslipTemplateConfigPage"));
const PayrollExpenseClaimsPage = lazy(() => import("@/pages/payroll/PayrollExpenseClaimsPage"));
const PayrollArchiveSettingsPage = lazy(() => import("@/pages/payroll/PayrollArchiveSettingsPage"));
const MexicoPayrollPage = lazy(() => import("@/pages/payroll/MexicoPayrollPage"));
const BenefitPayrollMappingsPage = lazy(() => import("@/pages/payroll/BenefitPayrollMappingsPage"));
const EmployeeTransactionPayrollMappingsPage = lazy(() => import("@/pages/payroll/EmployeeTransactionPayrollMappingsPage"));
const StatutoryPayElementMappingsPage = lazy(() => import("@/pages/payroll/StatutoryPayElementMappingsPage"));
const PayrollHolidaysPage = lazy(() => import("@/pages/payroll/PayrollHolidaysPage"));
const OpeningBalancesPage = lazy(() => import("@/pages/payroll/OpeningBalancesPage"));
const HistoricalPayrollImportPage = lazy(() => import("@/pages/payroll/HistoricalPayrollImportPage"));
const RetroactivePayConfigPage = lazy(() => import("@/pages/payroll/RetroactivePayConfigPage"));
const RetroactivePayGeneratePage = lazy(() => import("@/pages/payroll/RetroactivePayGeneratePage"));
const PayrollCountryDocumentationPage = lazy(() => import("@/pages/payroll/PayrollCountryDocumentationPage"));
const SalaryAdvancesPage = lazy(() => import("@/pages/payroll/SalaryAdvancesPage"));
const SavingsProgramsPage = lazy(() => import("@/pages/payroll/SavingsProgramsPage"));
const TimePayrollSyncPage = lazy(() => import("@/pages/payroll/TimePayrollSyncPage"));
const PaymentRulesConfigPage = lazy(() => import("@/pages/payroll/PaymentRulesConfigPage"));
const MultiCompanyConsolidationPage = lazy(() => import("@/pages/payroll/MultiCompanyConsolidationPage"));
const PayrollLoansPage = lazy(() => import("@/pages/payroll/PayrollLoansPage"));
const VariableCompensationPage = lazy(() => import("@/pages/payroll/VariableCompensationPage"));
const TimeAttendanceIntegrationPage = lazy(() => import("@/pages/payroll/TimeAttendanceIntegrationPage"));
const PayrollBudgetingPage = lazy(() => import("@/pages/payroll/PayrollBudgetingPage"));
const PayrollSimulationsPage = lazy(() => import("@/pages/payroll/PayrollSimulationsPage"));
const BatchOperationsPage = lazy(() => import("@/pages/payroll/BatchOperationsPage"));
const VacationManagerPage = lazy(() => import("@/pages/payroll/VacationManagerPage"));
const SeveranceCalculatorPage = lazy(() => import("@/pages/payroll/SeveranceCalculatorPage"));
const PayrollTemplatesPage = lazy(() => import("@/pages/payroll/PayrollTemplatesPage"));
const IntegrationWebhooksPage = lazy(() => import("@/pages/payroll/IntegrationWebhooksPage"));
const GLDashboardPage = lazy(() => import("@/pages/payroll/gl/GLDashboardPage"));
const GLAccountsPage = lazy(() => import("@/pages/payroll/gl/GLAccountsPage"));
const CostCenterSegmentsPage = lazy(() => import("@/pages/payroll/gl/CostCenterSegmentsPage"));
const CostCentersPage = lazy(() => import("@/pages/payroll/gl/CostCentersPage"));
const CostReallocationsPage = lazy(() => import("@/pages/payroll/gl/CostReallocationsPage"));
const GLAccountMappingsPage = lazy(() => import("@/pages/payroll/gl/GLAccountMappingsPage"));
const GLJournalBatchesPage = lazy(() => import("@/pages/payroll/gl/GLJournalBatchesPage"));
const EntitySegmentMappingsPage = lazy(() => import("@/pages/payroll/gl/EntitySegmentMappingsPage"));
const GLOverrideRulesPage = lazy(() => import("@/pages/payroll/gl/GLOverrideRulesPage"));

export function PayrollRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/payroll", moduleCode: "payroll", Component: PayrollDashboardPage },
        { path: "/payroll/tax-allowances", moduleCode: "payroll", Component: TaxAllowancesPage },
        { path: "/payroll/country-year-setup", moduleCode: "payroll", Component: CountryPayrollYearSetupPage },
        { path: "/payroll/bank-file-builder", moduleCode: "payroll", Component: BankFileBuilderPage },
        { path: "/payroll/pay-groups", moduleCode: "payroll", Component: PayGroupsPage },
        { path: "/payroll/semi-monthly-rules", moduleCode: "payroll", Component: SemiMonthlyPayrollRulesPage },
        { path: "/payroll/country-tax-settings", moduleCode: "payroll", Component: CountryTaxSettingsPage },
        { path: "/payroll/tip-pool", moduleCode: "payroll", Component: TipPoolManagementPage },
        { path: "/payroll/statutory-tax-relief", moduleCode: "payroll", Component: StatutoryTaxReliefPage },
        { path: "/payroll/tax-relief-schemes", moduleCode: "payroll", Component: TaxReliefSchemesPage },
        { path: "/payroll/pay-periods", moduleCode: "payroll", Component: PayPeriodsPage },
        { path: "/payroll/processing", moduleCode: "payroll", Component: PayrollProcessingPage },
        { path: "/payroll/off-cycle", moduleCode: "payroll", Component: OffCyclePayrollPage },
        { path: "/payroll/tax-config", moduleCode: "payroll", Component: TaxConfigPage },
        { path: "/payroll/reports", moduleCode: "payroll", Component: PayrollReportsPage },
        { path: "/payroll/year-end", moduleCode: "payroll", Component: YearEndProcessingPage },
        { path: "/payroll/year-end-closing", moduleCode: "payroll", Component: YearEndPayrollClosingPage },
        { path: "/payroll/statutory-deduction-types", moduleCode: "payroll", Component: StatutoryDeductionTypesPage },
        { path: "/payroll/payslips", moduleCode: "payroll", Component: PayslipsPage },
        { path: "/payroll/entries", moduleCode: "payroll", Component: PayPeriodPayrollEntriesPage },
        { path: "/payroll/regular-deductions", moduleCode: "payroll", Component: EmployeeRegularDeductionsPage },
        { path: "/payroll/overpayment-recovery", moduleCode: "payroll", Component: OverpaymentRecoveryPage },
        { path: "/payroll/leave-payment-config", moduleCode: "payroll", Component: LeavePaymentConfigPage },
        { path: "/payroll/leave-balance-buyout", moduleCode: "payroll", Component: LeaveBalanceBuyoutPage },
        { path: "/payroll/payslip-template", moduleCode: "payroll", Component: PayslipTemplateConfigPage },
        { path: "/payroll/expense-claims", moduleCode: "payroll", Component: PayrollExpenseClaimsPage },
        { path: "/payroll/archive-settings", moduleCode: "payroll", Component: PayrollArchiveSettingsPage },
        { path: "/payroll/mexico", moduleCode: "payroll", Component: MexicoPayrollPage },
        { path: "/payroll/benefit-mappings", moduleCode: "payroll", Component: BenefitPayrollMappingsPage },
        { path: "/payroll/transaction-mappings", moduleCode: "payroll", Component: EmployeeTransactionPayrollMappingsPage },
        { path: "/payroll/statutory-pay-element-mappings", moduleCode: "payroll", Component: StatutoryPayElementMappingsPage },
        { path: "/payroll/holidays", moduleCode: "payroll", Component: PayrollHolidaysPage },
        { path: "/payroll/opening-balances", moduleCode: "payroll", Component: OpeningBalancesPage },
        { path: "/payroll/historical-import", moduleCode: "payroll", Component: HistoricalPayrollImportPage },
        { path: "/payroll/retroactive-pay", moduleCode: "payroll", Component: RetroactivePayConfigPage },
        { path: "/payroll/retroactive-pay/generate", moduleCode: "payroll", Component: RetroactivePayGeneratePage },
        { path: "/payroll/country-documentation", moduleCode: "payroll", Component: PayrollCountryDocumentationPage },
        { path: "/payroll/salary-advances", moduleCode: "payroll", Component: SalaryAdvancesPage },
        { path: "/payroll/savings-programs", moduleCode: "payroll", Component: SavingsProgramsPage },
        { path: "/payroll/time-sync", moduleCode: "payroll", Component: TimePayrollSyncPage },
        { path: "/payroll/payment-rules", moduleCode: "payroll", Component: PaymentRulesConfigPage },
        { path: "/payroll/multi-company", moduleCode: "payroll", Component: MultiCompanyConsolidationPage },
        { path: "/payroll/loans", moduleCode: "payroll", Component: PayrollLoansPage },
        { path: "/payroll/variable-compensation", moduleCode: "payroll", Component: VariableCompensationPage },
        { path: "/payroll/time-integration", moduleCode: "payroll", Component: TimeAttendanceIntegrationPage },
        { path: "/payroll/budgeting", moduleCode: "payroll", Component: PayrollBudgetingPage },
        { path: "/payroll/simulations", moduleCode: "payroll", Component: PayrollSimulationsPage },
        { path: "/payroll/batch-operations", moduleCode: "payroll", Component: BatchOperationsPage },
        { path: "/payroll/vacation-manager", moduleCode: "payroll", Component: VacationManagerPage },
        { path: "/payroll/severance-calculator", moduleCode: "payroll", Component: SeveranceCalculatorPage },
        { path: "/payroll/templates", moduleCode: "payroll", Component: PayrollTemplatesPage },
        { path: "/payroll/webhooks", moduleCode: "payroll", Component: IntegrationWebhooksPage },
        { path: "/payroll/gl", moduleCode: "payroll", Component: GLDashboardPage },
        { path: "/payroll/gl/accounts", moduleCode: "payroll", Component: GLAccountsPage },
        { path: "/payroll/gl/cost-center-segments", moduleCode: "payroll", Component: CostCenterSegmentsPage },
        { path: "/payroll/gl/cost-centers", moduleCode: "payroll", Component: CostCentersPage },
        { path: "/payroll/gl/cost-reallocations", moduleCode: "payroll", Component: CostReallocationsPage },
        { path: "/payroll/gl/account-mappings", moduleCode: "payroll", Component: GLAccountMappingsPage },
        { path: "/payroll/gl/journal-batches", moduleCode: "payroll", Component: GLJournalBatchesPage },
        { path: "/payroll/gl/entity-segment-mappings", moduleCode: "payroll", Component: EntitySegmentMappingsPage },
        { path: "/payroll/gl/override-rules", moduleCode: "payroll", Component: GLOverrideRulesPage },
      ])}
    </>
  );
}
