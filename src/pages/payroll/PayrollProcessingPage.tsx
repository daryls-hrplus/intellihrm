import { useState, useEffect, Fragment, useRef } from "react";
import { createRoot } from "react-dom/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePayroll, PayrollRun, PayPeriod, EmployeePayroll } from "@/hooks/usePayroll";
import { checkPayrollExecutionLock, showPayrollLockMessage } from "@/hooks/usePayrollExecutionLock";
import { useGLCalculation } from "@/hooks/useGLCalculation";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { usePayslipTemplates, PayslipTemplate } from "@/hooks/usePayslipTemplates";
import { PayslipDocument } from "@/components/payroll/PayslipDocument";
import { BulkPayslipDistribution } from "@/components/payroll/BulkPayslipDistribution";
import { ExchangeRateSelectionDialog } from "@/components/payroll/ExchangeRateSelectionDialog";
import { usePayGroupMultiCurrency, usePayrollRunExchangeRates, calculateNetPaySplit, EmployeeCurrencyPreference } from "@/hooks/useMultiCurrencyPayroll";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Plus, 
  Play, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Download,
  Calculator,
  Users,
  Clock,
  Eye,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Printer,
  BookOpen,
  Mail,
  Globe,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface ExtendedPayrollRun extends PayrollRun {
  calculation_started_at?: string | null;
  is_locked?: boolean;
  locked_at?: string | null;
  recalculation_requested_by?: string | null;
  recalculation_approved_by?: string | null;
  recalculation_approved_at?: string | null;
}

// Net Pay component with currency preference split - displays payment distribution
function NetPayWithCurrencySplit({
  selectedEmployee,
  localCurrencyCode,
  companyLocalCurrencyId,
  currencyCodeMap,
  expandedRunId,
  selectedCompanyId,
  t,
  formatCurrency,
}: {
  selectedEmployee: EmployeePayroll;
  localCurrencyCode: string;
  companyLocalCurrencyId: string | null;
  currencyCodeMap: Map<string, string>;
  expandedRunId: string | null;
  selectedCompanyId: string;
  t: any;
  formatCurrency: (amount: number, currency?: string) => string;
}) {
  const [currencyPreference, setCurrencyPreference] = useState<EmployeeCurrencyPreference | null>(null);
  const [isLoadingPreference, setIsLoadingPreference] = useState(false);
  
  // Fetch exchange rates for this payroll run
  const { data: payrollExchangeRates = [] } = usePayrollRunExchangeRates(expandedRunId || undefined);
  
  // Fetch employee currency preference
  useEffect(() => {
    const loadPreference = async () => {
      if (!selectedEmployee?.employee_id || !selectedCompanyId) return;
      
      setIsLoadingPreference(true);
      try {
        const { data, error } = await supabase
          .from("employee_currency_preferences")
          .select(`
            *,
            primary_currency:currencies!employee_currency_preferences_primary_currency_id_fkey(*),
            secondary_currency:currencies!employee_currency_preferences_secondary_currency_id_fkey(*)
          `)
          .eq("employee_id", selectedEmployee.employee_id)
          .eq("company_id", selectedCompanyId)
          .order("effective_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!error && data) {
          setCurrencyPreference(data as EmployeeCurrencyPreference);
        }
      } catch (err) {
        console.error("Failed to load currency preference:", err);
      } finally {
        setIsLoadingPreference(false);
      }
    };
    
    loadPreference();
  }, [selectedEmployee?.employee_id, selectedCompanyId]);
  
  // Build exchange rates map for calculation
  const exchangeRatesMap = new Map<string, number>();
  payrollExchangeRates.forEach(r => {
    exchangeRatesMap.set(`${r.from_currency_id}_${r.to_currency_id}`, r.exchange_rate);
    // Also add inverse for lookups
    if (r.exchange_rate > 0) {
      exchangeRatesMap.set(`${r.to_currency_id}_${r.from_currency_id}`, 1 / r.exchange_rate);
    }
  });
  
  // Calculate the net pay split based on employee preferences
  const netPaySplits = currencyPreference && companyLocalCurrencyId
    ? calculateNetPaySplit(
        selectedEmployee.net_pay,
        companyLocalCurrencyId,
        currencyPreference,
        exchangeRatesMap
      )
    : null;
  
  // Get currency code by ID
  const getCurrencyCode = (currencyId: string) => {
    return currencyCodeMap.get(currencyId) || 'USD';
  };

  return (
    <div className="bg-success/10 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-lg">{t("payroll.processing.netPay")}</span>
        <span className="font-bold text-2xl text-success">{formatCurrency(selectedEmployee.net_pay, localCurrencyCode)}</span>
      </div>
      
      {/* Payment Distribution (based on employee preference) */}
      {netPaySplits && netPaySplits.length > 1 && (
        <div className="border-t border-success/30 pt-3 space-y-2">
          <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {t("payroll.processing.paymentDistribution", "Payment Distribution")}
          </p>
          
          {netPaySplits.map((split, idx) => {
            const currencyCode = split.currency?.code || getCurrencyCode(split.currency_id);
            const isLocalCurrency = split.currency_id === companyLocalCurrencyId;
            
            return (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {currencyCode}
                  {split.is_primary && <span className="ml-1 text-xs">(Primary)</span>}
                  {!split.is_primary && currencyPreference?.secondary_currency_percentage && (
                    <span className="ml-1 text-xs">({currencyPreference.secondary_currency_percentage}%)</span>
                  )}
                </span>
                <div className="text-right">
                  {!isLocalCurrency && split.exchange_rate_used && split.exchange_rate_used !== 1 && (
                    <span className="font-mono text-xs text-muted-foreground mr-2">
                      @ {split.exchange_rate_used.toFixed(4)}
                    </span>
                  )}
                  <span className="font-mono font-medium text-success">
                    {formatCurrency(split.amount, currencyCode)}
                  </span>
                  {!isLocalCurrency && split.local_currency_equivalent && (
                    <div className="text-xs text-muted-foreground">
                      ({formatCurrency(split.local_currency_equivalent, localCurrencyCode)} {localCurrencyCode})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Show loading state */}
      {isLoadingPreference && (
        <div className="border-t border-success/30 pt-3">
          <p className="text-xs text-muted-foreground">Loading currency preferences...</p>
        </div>
      )}
      
      {/* Show if no multi-currency preference but has foreign currency inputs */}
      {!netPaySplits && !isLoadingPreference && (() => {
        const calcDetails = selectedEmployee.calculation_details as any;
        const earnings = calcDetails?.earnings || [];
        const hasConversions = earnings.some((e: any) => e.original_currency_id && e.original_amount !== undefined);
        
        if (!hasConversions) return null;
        
        return (
          <div className="border-t border-success/30 pt-3">
            <p className="text-xs text-muted-foreground">
              {t("payroll.processing.allPaidInLocal", "Entire net pay will be paid in")} {localCurrencyCode}
            </p>
          </div>
        );
      })()}
    </div>
  );
}

export default function PayrollProcessingPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const { selectedCompanyId, setSelectedCompanyId, selectedPayGroupId, setSelectedPayGroupId } = usePayrollFilters();
  const {
    isLoading,
    fetchPayPeriods,
    fetchPayrollRuns,
    createPayrollRun,
    calculatePayroll,
    recalculatePayroll,
    requestRecalculationApproval,
    approveRecalculation,
    reopenPayroll,
    approvePayroll,
    processPayment,
    fetchEmployeePayroll,
    generatePayslips,
    generateBankFile,
    fetchBankFileConfig,
  } = usePayroll();

  const { fetchDefaultTemplate } = usePayslipTemplates();
  const { checkGLConfigured, checkGLCalculated, calculateGL, isCalculating: isGLCalculating } = useGLCalculation();
  const [payslipTemplate, setPayslipTemplate] = useState<PayslipTemplate | null>(null);
  const [companyInfo, setCompanyInfo] = useState<{ name: string; address?: string; logo_url?: string } | null>(null);

  const [periods, setPeriods] = useState<PayPeriod[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<ExtendedPayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ExtendedPayrollRun | null>(null);
  const [employeePayroll, setEmployeePayroll] = useState<EmployeePayroll[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [expandedEmployees, setExpandedEmployees] = useState<EmployeePayroll[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePayroll | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeeDetailOpen, setEmployeeDetailOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [recalcConfirmOpen, setRecalcConfirmOpen] = useState(false);
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false);
  const [runToRecalc, setRunToRecalc] = useState<ExtendedPayrollRun | null>(null);
  const [runToReopen, setRunToReopen] = useState<ExtendedPayrollRun | null>(null);
  const [payGroupGLConfigured, setPayGroupGLConfigured] = useState(false);
  const [bulkDistributionOpen, setBulkDistributionOpen] = useState(false);
  const [bulkDistributionRun, setBulkDistributionRun] = useState<ExtendedPayrollRun | null>(null);
  
  // Multi-currency state
  const [exchangeRateDialogOpen, setExchangeRateDialogOpen] = useState(false);
  const [runForExchangeRates, setRunForExchangeRates] = useState<ExtendedPayrollRun | null>(null);
  const [pendingRateAction, setPendingRateAction] = useState<{
    type: 'calculate' | 'recalculate';
    run: ExtendedPayrollRun;
  } | null>(null);
  const [foreignCurrencyIds, setForeignCurrencyIds] = useState<string[]>([]);
  const [companyLocalCurrencyId, setCompanyLocalCurrencyId] = useState<string | null>(null);
  const [groupBaseCurrencyId, setGroupBaseCurrencyId] = useState<string | null>(null);
  const [currencyCodeMap, setCurrencyCodeMap] = useState<Map<string, string>>(new Map());
  const [localCurrencyCode, setLocalCurrencyCode] = useState<string>('USD');

  // Check if pay group has multi-currency enabled
  const { data: payGroupSettings } = usePayGroupMultiCurrency(
    selectedPayGroupId !== "all" ? selectedPayGroupId : undefined
  );
  const isMultiCurrencyEnabled = payGroupSettings?.enable_multi_currency || false;

  const isAdmin = hasRole('admin');
  const isHRManager = hasRole('hr_manager');
  const canApproveSupervisor = isAdmin || isHRManager;

  const [createForm, setCreateForm] = useState({
    pay_period_id: "",
    run_type: "regular" as PayrollRun['run_type'],
    notes: "",
  });

  // Reset pay group when company changes
  useEffect(() => {
    setSelectedPayGroupId("all");
  }, [selectedCompanyId]);

  // Fetch payslip template and company info when company changes
  useEffect(() => {
    const loadTemplateAndCompany = async () => {
      if (!selectedCompanyId) return;
      
      const resolveLocalCurrencyId = async (countryCode: string) => {
        const { data: fiscal } = await supabase
          .from('country_fiscal_years')
          .select('currency_code')
          .eq('country_code', countryCode)
          .eq('is_active', true)
          .maybeSingle();

        if (!fiscal?.currency_code) return null;

        const { data: currency } = await supabase
          .from('currencies')
          .select('id')
          .eq('code', fiscal.currency_code)
          .eq('is_active', true)
          .maybeSingle();

        return currency?.id ?? null;
      };

      const [template, companyData, currenciesData] = await Promise.all([
        fetchDefaultTemplate(selectedCompanyId),
        supabase
          .from('companies')
          .select('name, address, logo_url, local_currency_id, group_id, country')
          .eq('id', selectedCompanyId)
          .single(),
        supabase
          .from('currencies')
          .select('id, code')
          .eq('is_active', true)
      ]);
      
      // Build currency ID to code map
      const codeMap = new Map<string, string>();
      (currenciesData.data || []).forEach((c: any) => {
        if (c?.id && c?.code) codeMap.set(c.id, c.code);
      });
      setCurrencyCodeMap(codeMap);
      
      setPayslipTemplate(template);
      if (companyData.data) {
        setCompanyInfo({
          name: companyData.data.name,
          address: companyData.data.address ?? undefined,
          logo_url: companyData.data.logo_url ?? undefined,
        });

        // Ensure company local currency is set (defaulted from country config)
        let localCurrencyId = companyData.data.local_currency_id as string | null;
        if (!localCurrencyId && companyData.data.country) {
          const resolved = await resolveLocalCurrencyId(companyData.data.country);
          if (resolved) {
            localCurrencyId = resolved;
            await supabase
              .from('companies')
              .update({ local_currency_id: resolved })
              .eq('id', selectedCompanyId);
          }
        }

        setCompanyLocalCurrencyId(localCurrencyId);
        if (localCurrencyId && codeMap.has(localCurrencyId)) {
          setLocalCurrencyCode(codeMap.get(localCurrencyId) || 'USD');
        }
        // Fetch group base currency if company is in a group
        if (companyData.data.group_id) {
          const { data: groupData } = await supabase
            .from('company_groups')
            .select('base_currency_id')
            .eq('id', companyData.data.group_id)
            .single();
          if (groupData?.base_currency_id) {
            setGroupBaseCurrencyId(groupData.base_currency_id);
          }
        }
      }
    };
    loadTemplateAndCompany();
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedCompanyId && selectedPayGroupId && selectedPayGroupId !== "all") {
      loadData();
      checkGLConfigured(selectedPayGroupId).then(setPayGroupGLConfigured);
    } else {
      setPeriods([]);
      setPayrollRuns([]);
      setPayGroupGLConfigured(false);
    }
  }, [selectedCompanyId, selectedPayGroupId]);

  const loadData = async () => {
    if (!selectedCompanyId || !selectedPayGroupId || selectedPayGroupId === "all") return;

    // Fetch pay periods for the selected pay group
    const { data: periodData } = await supabase
      .from('pay_periods')
      .select('*')
      .eq('pay_group_id', selectedPayGroupId)
      .order('period_start', { ascending: false });

    setPeriods((periodData || []) as PayPeriod[]);

    // Fetch payroll runs for the selected pay group
    const { data: runData } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        pay_period:pay_periods(*)
      `)
      .eq('company_id', selectedCompanyId)
      .eq('pay_group_id', selectedPayGroupId)
      .order('created_at', { ascending: false });

    setPayrollRuns((runData || []) as ExtendedPayrollRun[]);
  };

  const refreshExpandedEmployees = async (runId: string) => {
    if (expandedRunId !== runId) return;

    const empPayroll = await fetchEmployeePayroll(runId);
    setExpandedEmployees(empPayroll);

    if (employeeDetailOpen && selectedEmployeeId) {
      const updated = empPayroll.find((e) => e.id === selectedEmployeeId);
      if (updated) setSelectedEmployee(updated);
    }
  };

  const maybeOpenExchangeRateDialog = async (
    run: ExtendedPayrollRun,
    action: 'calculate' | 'recalculate'
  ) => {
    if (!isMultiCurrencyEnabled) return false;

    const localCurrencyId = companyLocalCurrencyId;
    if (!localCurrencyId) {
      toast.error("Company local currency is not configured. Please set it on the Company record.");
      return true; // block action
    }

    // Get employees in this pay group
    const { data: employeePositions } = await supabase
      .from('employee_positions')
      .select('employee_id')
      .eq('pay_group_id', run.pay_group_id)
      .eq('is_active', true);

    const employeeIds = Array.from(
      new Set((employeePositions || []).map((ep) => ep.employee_id).filter(Boolean))
    );

    // If there are no employees, no need to collect rates
    if (employeeIds.length === 0) return false;

    // Build a currency code -> id map so we can handle legacy employee_compensation.currency
    const [{ data: currencyRows }, { data: compensations }] = await Promise.all([
      supabase.from('currencies').select('id, code').eq('is_active', true),
      supabase
        .from('employee_compensation')
        .select('currency_id, currency')
        .eq('is_active', true)
        .in('employee_id', employeeIds)
    ]);

    const codeToId = new Map<string, string>();
    (currencyRows || []).forEach((c) => {
      if (c?.code && c?.id) codeToId.set(String(c.code).toUpperCase(), c.id);
    });

    // Find unique foreign currencies (not local)
    const foreignIds = new Set<string>();
    (compensations || []).forEach((c: any) => {
      const idFromCode = c.currency ? codeToId.get(String(c.currency).toUpperCase()) : undefined;
      const effectiveCurrencyId: string | undefined = c.currency_id || idFromCode;

      if (effectiveCurrencyId && effectiveCurrencyId !== localCurrencyId) {
        foreignIds.add(effectiveCurrencyId);
      }
    });

    const needsBaseRate = !!(groupBaseCurrencyId && groupBaseCurrencyId !== localCurrencyId);
    const needsDialog = foreignIds.size > 0 || needsBaseRate;

    if (!needsDialog) return false;

    setForeignCurrencyIds(Array.from(foreignIds));
    setRunForExchangeRates(run);
    setPendingRateAction({ type: action, run });
    setExchangeRateDialogOpen(true);
    return true;
  };

  const handleCalculate = async (run: ExtendedPayrollRun) => {
    if (!selectedCompanyId || !selectedPayGroupId) return;
    
    // Check for concurrent payroll execution
    const { isLocked, lockingRun } = await checkPayrollExecutionLock(run.pay_group_id, run.id);
    if (isLocked && lockingRun) {
      showPayrollLockMessage(lockingRun);
      return;
    }

    const blockedByRates = await maybeOpenExchangeRateDialog(run, 'calculate');
    if (blockedByRates) return;
    
    // Proceed with calculation
    await proceedWithCalculation(run);
  };

  const proceedWithCalculation = async (run: ExtendedPayrollRun) => {
    if (!selectedCompanyId || !selectedPayGroupId) return;
    
    const success = await calculatePayroll(run.id, selectedCompanyId, run.pay_period_id, selectedPayGroupId);
    if (success) {
      await loadData();
      await refreshExpandedEmployees(run.id);
    }
  };

  const proceedWithRecalculation = async (run: ExtendedPayrollRun) => {
    if (!selectedCompanyId) return;

    const runId = run.id;

    const success = await recalculatePayroll(
      run.id,
      selectedCompanyId,
      run.pay_period_id,
      run.pay_group_id
    );

    if (success) {
      await loadData();
      await refreshExpandedEmployees(runId);
    }
  };

  const handleExchangeRatesConfirmed = async () => {
    if (!pendingRateAction) return;

    const action = pendingRateAction;
    setPendingRateAction(null);
    setRunForExchangeRates(null);

    if (action.type === 'calculate') {
      await proceedWithCalculation(action.run);
    } else {
      await proceedWithRecalculation(action.run);
    }
  };

  const handleRecalculate = async (run: ExtendedPayrollRun) => {
    if (run.status === 'approved') {
      // For approved runs, need supervisor approval first
      if (canApproveSupervisor) {
        setRunToRecalc(run);
        setRecalcConfirmOpen(true);
      } else {
        // Request approval from supervisor
        const success = await requestRecalculationApproval(run.id);
        if (success) loadData();
      }
    } else if (run.status === 'calculated' || run.status === 'calculating' || run.status === 'failed') {
      // For calculated, stuck calculating, or failed runs, can recalculate directly
      setRunToRecalc(run);
      setRecalcConfirmOpen(true);
    }
  };

  const confirmRecalculate = async () => {
    if (!runToRecalc || !selectedCompanyId) return;

    const runId = runToRecalc.id;

    // Check for concurrent payroll execution
    const { isLocked, lockingRun } = await checkPayrollExecutionLock(runToRecalc.pay_group_id, runToRecalc.id);
    if (isLocked && lockingRun) {
      showPayrollLockMessage(lockingRun);
      setRecalcConfirmOpen(false);
      setRunToRecalc(null);
      return;
    }

    // If supervisor approving for approved run
    if (runToRecalc.status === 'approved' && canApproveSupervisor) {
      await approveRecalculation(runToRecalc.id);
    }

    // If multi-currency is enabled, allow user to lock exchange rates first
    const blockedByRates = await maybeOpenExchangeRateDialog(runToRecalc, 'recalculate');
    if (blockedByRates) {
      setRecalcConfirmOpen(false);
      setRunToRecalc(null);
      return;
    }

    const success = await recalculatePayroll(
      runToRecalc.id,
      selectedCompanyId,
      runToRecalc.pay_period_id,
      runToRecalc.pay_group_id
    );
    if (success) {
      setRecalcConfirmOpen(false);
      setRunToRecalc(null);
      await loadData();
      await refreshExpandedEmployees(runId);
    }
  };

  const handleReopen = async (run: ExtendedPayrollRun) => {
    setRunToReopen(run);
    setReopenConfirmOpen(true);
  };

  const confirmReopen = async () => {
    if (!runToReopen) return;
    const success = await reopenPayroll(runToReopen.id);
    if (success) {
      setReopenConfirmOpen(false);
      setRunToReopen(null);
      loadData();
    }
  };

  const handleCreateRun = async () => {
    if (!selectedCompanyId || !selectedPayGroupId || selectedPayGroupId === "all" || !createForm.pay_period_id) return;

    // Check for concurrent payroll execution before creating
    const { isLocked, lockingRun } = await checkPayrollExecutionLock(selectedPayGroupId);
    if (isLocked && lockingRun) {
      showPayrollLockMessage(lockingRun);
      return;
    }

    const result = await createPayrollRun({
      company_id: selectedCompanyId,
      pay_group_id: selectedPayGroupId,
      pay_period_id: createForm.pay_period_id,
      run_type: createForm.run_type,
      notes: createForm.notes,
      status: 'draft',
    });

    if (result) {
      setCreateDialogOpen(false);
      setCreateForm({ pay_period_id: "", run_type: "regular", notes: "" });
      loadData();
    }
  };

  const handleApprove = async (run: ExtendedPayrollRun) => {
    const success = await approvePayroll(run.id);
    if (success) loadData();
  };

  const handleProcessPayment = async (run: ExtendedPayrollRun) => {
    // Check for concurrent payroll execution
    const { isLocked, lockingRun } = await checkPayrollExecutionLock(run.pay_group_id, run.id);
    if (isLocked && lockingRun) {
      showPayrollLockMessage(lockingRun);
      return;
    }
    
    // If GL is configured, check if GL has been calculated
    if (payGroupGLConfigured) {
      const glCalculated = await checkGLCalculated(run.id);
      if (!glCalculated) {
        toast.error("GL entries must be calculated before processing payment. Click the GL button first.");
        return;
      }
    }
    
    const success = await processPayment(run.id);
    if (success) loadData();
  };

  const handleCalculateGL = async (run: ExtendedPayrollRun) => {
    if (!selectedCompanyId) return;
    const result = await calculateGL(run.id, selectedCompanyId);
    if (result) loadData();
  };

  const handleGeneratePayslips = async (run: ExtendedPayrollRun) => {
    const success = await generatePayslips(run.id);
    if (success) loadData();
  };

  const handleGenerateBankFile = async (run: ExtendedPayrollRun) => {
    if (!selectedCompanyId) return;
    
    const bankConfigs = await fetchBankFileConfig(selectedCompanyId);
    const primaryConfig = bankConfigs.find(c => c.is_primary) || bankConfigs[0];
    
    if (!primaryConfig) {
      toast.error(t("payroll.processing.configureBankFirst"));
      return;
    }
    
    const content = await generateBankFile(run.id, primaryConfig.id, selectedCompanyId);
    if (content) {
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${run.run_number}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const toggleRunExpand = async (run: ExtendedPayrollRun) => {
    if (expandedRunId === run.id) {
      setExpandedRunId(null);
      setExpandedEmployees([]);
      setSelectedRun(null);
      setSelectedEmployee(null);
      setSelectedEmployeeId(null);
      setEmployeeDetailOpen(false);
    } else {
      setExpandedRunId(run.id);
      setSelectedRun(run);
      const empPayroll = await fetchEmployeePayroll(run.id);
      setExpandedEmployees(empPayroll);
    }
  };

  const viewEmployeeDetails = (emp: EmployeePayroll) => {
    setSelectedEmployee(emp);
    setSelectedEmployeeId(emp.id);
    setEmployeeDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      calculating: "bg-warning/10 text-warning",
      calculated: "bg-primary/10 text-primary",
      pending_approval: "bg-warning/10 text-warning",
      approved: "bg-success/10 text-success",
      processing: "bg-warning/10 text-warning",
      paid: "bg-success/10 text-success",
      failed: "bg-destructive/10 text-destructive",
      cancelled: "bg-muted text-muted-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const showContent = selectedCompanyId && selectedPayGroupId && selectedPayGroupId !== "all";

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.payroll"), href: "/payroll" },
            { label: t("payroll.processing.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.processing.title")}</h1>
              <p className="text-muted-foreground">{t("payroll.processing.subtitle")}</p>
            </div>
          </div>
          {showContent && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("payroll.processing.newPayrollRun")}
            </Button>
          )}
        </div>

        {/* Company and Pay Group Filters */}
        <Card>
          <CardContent className="pt-6">
            <PayrollFilters
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
              selectedPayGroupId={selectedPayGroupId}
              onPayGroupChange={setSelectedPayGroupId}
              showPayGroupFilter={true}
            />
          </CardContent>
        </Card>

        {!showContent && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("payroll.processing.selectCompanyAndPayGroupPrompt")}
            </CardContent>
          </Card>
        )}

        {showContent && (
          <>
            {/* Lock Banner */}
            {payrollRuns.some(r => r.is_locked) && (
              <div className="flex items-center gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4">
                <Lock className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">{t("payroll.processing.payGroupLocked")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("payroll.processing.payGroupLockedDescription")}
                  </p>
                </div>
              </div>
            )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.processing.totalGrossPay")}</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(payrollRuns.reduce((sum, r) => sum + (r.total_gross_pay || 0), 0))}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.processing.totalNetPay")}</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(payrollRuns.reduce((sum, r) => sum + (r.total_net_pay || 0), 0))}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.processing.pending")}</p>
                <p className="text-xl font-semibold">
                  {payrollRuns.filter(r => ['draft', 'calculated', 'pending_approval'].includes(r.status)).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.processing.totalEmployees")}</p>
                <p className="text-xl font-semibold">
                  {payrollRuns.reduce((sum, r) => sum + r.employee_count, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Runs Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("payroll.processing.payrollRuns")}</CardTitle>
            <CardDescription>{t("payroll.processing.payrollRunsSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payroll.processing.runNumber")}</TableHead>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("payroll.processing.payPeriod")}</TableHead>
                  <TableHead>{t("payroll.processing.employees")}</TableHead>
                  <TableHead>{t("payroll.processing.grossPay")}</TableHead>
                  <TableHead>{t("payroll.processing.netPay")}</TableHead>
                  <TableHead>{t("payroll.processing.started")}</TableHead>
                  <TableHead>{t("payroll.processing.completed")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.map((run) => (
                  <Fragment key={run.id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium text-primary underline-offset-4 hover:underline flex items-center gap-2"
                          onClick={() => toggleRunExpand(run)}
                        >
                          {run.run_number}
                          {run.is_locked && (
                            <Lock className="h-3 w-3 text-warning" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="capitalize">{run.run_type.replace('_', ' ')}</TableCell>
                      <TableCell>
                        {run.pay_period && (
                          <span className="text-sm">
                            {formatDateForDisplay(run.pay_period.period_start, "MMM d")} - {formatDateForDisplay(run.pay_period.period_end, "MMM d, yyyy")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{run.employee_count}</TableCell>
                      <TableCell>{formatCurrency(run.total_gross_pay, run.currency)}</TableCell>
                      <TableCell>{formatCurrency(run.total_net_pay, run.currency)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {run.calculation_started_at ? formatDateForDisplay(run.calculation_started_at, "MMM d HH:mm") : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {run.calculated_at ? formatDateForDisplay(run.calculated_at, "MMM d HH:mm") : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={getStatusColor(run.status)}>
                            {run.status.replace('_', ' ').charAt(0).toUpperCase() + run.status.slice(1).replace('_', ' ')}
                          </Badge>
                          {run.recalculation_requested_by && !run.recalculation_approved_by && (
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {t("payroll.processing.recalcPending")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => toggleRunExpand(run)} title={t("payroll.processing.viewEmployees")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {run.status === 'draft' && (
                            <Button variant="ghost" size="sm" onClick={() => handleCalculate(run)} title={t("payroll.processing.calculate")} disabled={isLoading}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {(run.status === 'calculating' || run.status === 'failed') && (
                            <Button variant="ghost" size="sm" onClick={() => handleRecalculate(run)} title={t("payroll.processing.retryCalculation")} disabled={isLoading}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          {run.status === 'calculated' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleRecalculate(run)} title={t("payroll.processing.recalculate")} disabled={isLoading}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleApprove(run)} title={t("payroll.processing.approve")} disabled={isLoading}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {run.status === 'approved' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleRecalculate(run)} title={t("payroll.processing.requestRecalculation")} disabled={isLoading}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleGeneratePayslips(run)} title={t("payroll.processing.generatePayslips")} disabled={isLoading}>
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleGenerateBankFile(run)} title={t("payroll.processing.generateBankFile")} disabled={isLoading}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setBulkDistributionRun(run);
                                  setBulkDistributionOpen(true);
                                }} 
                                title="Bulk Payslip Distribution"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              {payGroupGLConfigured && (
                                <Button variant="ghost" size="sm" onClick={() => handleCalculateGL(run)} title="Calculate GL Entries" disabled={isLoading || isGLCalculating}>
                                  <BookOpen className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleProcessPayment(run)} title={t("payroll.processing.processPayment")} disabled={isLoading}>
                                <DollarSign className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleReopen(run)} title={t("payroll.processing.reopenForChanges")} disabled={isLoading}>
                                <Unlock className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {run.status === 'paid' && canApproveSupervisor && (
                            <Button variant="ghost" size="sm" onClick={() => handleReopen(run)} title={t("payroll.processing.reopenForChanges")} disabled={isLoading}>
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRunId === run.id && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={10} className="p-0">
                          <div className="p-4 border-l-4 border-primary">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-sm">{t("payroll.processing.employeesInRun", { count: expandedEmployees.length })}</h4>
                              {selectedRun && (
                                <div className="flex gap-4 text-sm">
                                  <span>{t("payroll.processing.grossPay")}: <strong>{formatCurrency(selectedRun.total_gross_pay)}</strong></span>
                                  <span>{t("payroll.processing.netPay")}: <strong>{formatCurrency(selectedRun.total_net_pay)}</strong></span>
                                </div>
                              )}
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("payroll.processing.employee")}</TableHead>
                                  <TableHead>{t("payroll.processing.hours")}</TableHead>
                                  <TableHead>{t("payroll.processing.grossPay")}</TableHead>
                                  <TableHead>{t("payroll.processing.taxes")}</TableHead>
                                  <TableHead>{t("payroll.processing.deductions")}</TableHead>
                                  <TableHead>{t("payroll.processing.netPay")}</TableHead>
                                  <TableHead>{t("common.status")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {expandedEmployees.map((emp) => (
                                  <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewEmployeeDetails(emp)}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium text-primary hover:underline">{emp.employee?.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{emp.employee?.email}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>{emp.regular_hours}</TableCell>
                                    <TableCell>{formatCurrency(emp.gross_pay)}</TableCell>
                                    <TableCell>{formatCurrency(emp.tax_deductions)}</TableCell>
                                    <TableCell>{formatCurrency(emp.total_deductions - emp.tax_deductions)}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(emp.net_pay)}</TableCell>
                                    <TableCell>
                                      <Badge className={getStatusColor(emp.status)}>
                                        {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {expandedEmployees.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                                      {t("payroll.processing.noEmployeeRecords")}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
                {payrollRuns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {t("payroll.processing.noPayrollRuns")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </>
        )}

        {/* Create Run Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("payroll.processing.createPayrollRun")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("payroll.processing.payPeriod")}</Label>
                <Select
                  value={createForm.pay_period_id}
                  onValueChange={(value) => setCreateForm({ ...createForm, pay_period_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("payroll.processing.selectPayPeriod")} />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.filter(p => p.status === 'open').map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.period_number} ({formatDateForDisplay(period.period_start, "MMM d")} - {formatDateForDisplay(period.period_end, "MMM d")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("payroll.processing.runType")}</Label>
                <Select
                  value={createForm.run_type}
                  onValueChange={(value) => setCreateForm({ ...createForm, run_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">{t("payroll.processing.regular")}</SelectItem>
                    <SelectItem value="supplemental">{t("payroll.processing.supplemental")}</SelectItem>
                    <SelectItem value="bonus">{t("payroll.processing.bonus")}</SelectItem>
                    <SelectItem value="correction">{t("payroll.processing.correction")}</SelectItem>
                    <SelectItem value="off_cycle">{t("payroll.processing.offCycle")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("payroll.processing.notes")}</Label>
                <Input
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder={t("payroll.processing.optionalNotes")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCreateRun} disabled={isLoading || !createForm.pay_period_id}>
                {t("payroll.processing.createRun")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Employee Pay Details Dialog */}
        <Dialog open={employeeDetailOpen} onOpenChange={setEmployeeDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-start justify-between">
              <div>
                <DialogTitle>{t("payroll.processing.employeePayDetails")}</DialogTitle>
                <DialogDescription>
                  {t("payroll.processing.payBreakdownDescription", "Complete breakdown of earnings and deductions")}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto mr-8"
                onClick={() => {
                  if (!selectedEmployee) return;
                  
                  // Get the current expanded run for pay period info
                  const currentRun = payrollRuns.find(r => r.id === expandedRunId);
                  const payPeriod = currentRun?.pay_period;
                  
                  // Build a payslip object from employee payroll data
                  const payslipData = {
                    id: selectedEmployee.id,
                    employee_payroll_id: selectedEmployee.id,
                    employee_id: selectedEmployee.employee_id,
                    payslip_number: `PS-${selectedEmployee.id.slice(0, 8).toUpperCase()}`,
                    pay_period_start: payPeriod?.period_start || new Date().toISOString(),
                    pay_period_end: payPeriod?.period_end || new Date().toISOString(),
                    pay_date: payPeriod?.pay_date || new Date().toISOString(),
                    gross_pay: selectedEmployee.gross_pay,
                    net_pay: selectedEmployee.net_pay,
                    total_deductions: selectedEmployee.total_deductions,
                    currency: selectedEmployee.currency || 'USD',
                    pdf_url: null,
                    pdf_generated_at: null,
                    is_viewable: true,
                    viewed_at: null,
                    downloaded_at: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  
                  // Build line items from calculation_details
                  const calcDetails = selectedEmployee.calculation_details as any;
                  const lineItems = {
                    earnings: (calcDetails?.earnings || []).map((e: any) => ({ 
                      name: e.name, 
                      amount: e.amount,
                      job_title: e.job_title,
                      is_prorated: e.is_prorated,
                      effective_start: e.effective_start,
                      effective_end: e.effective_end,
                    })),
                    deductions: (calcDetails?.period_deductions || []).map((d: any) => ({ 
                      name: d.name, 
                      amount: d.amount 
                    })),
                    taxes: (calcDetails?.statutory_deductions || []).map((t: any) => ({ 
                      name: t.name, 
                      amount: t.employee_amount || 0 
                    })),
                    employer: (calcDetails?.statutory_deductions || [])
                      .filter((t: any) => (t.employer_amount || 0) > 0)
                      .map((c: any) => ({ 
                        name: `Employer ${c.name}`, 
                        amount: c.employer_amount || 0 
                      })),
                  };
                  
                  // Create a container for React rendering
                  const container = document.createElement('div');
                  const root = createRoot(container);
                  root.render(
                    <PayslipDocument
                      payslip={payslipData}
                      template={payslipTemplate}
                      employee={{
                        full_name: selectedEmployee.employee?.full_name || '',
                        email: selectedEmployee.employee?.email || '',
                        position: selectedEmployee.position?.title,
                      }}
                      company={companyInfo || undefined}
                      lineItems={lineItems}
                    />
                  );
                  
                  // Wait for React to render, then print
                  setTimeout(() => {
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) {
                      root.unmount();
                      return;
                    }
                    
                    const template = payslipTemplate;
                    const primaryColor = template?.primary_color || '#1e40af';
                    const accentColor = template?.accent_color || '#059669';
                    
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Payslip - ${selectedEmployee.employee?.full_name}</title>
                          <style>
                            * { box-sizing: border-box; margin: 0; padding: 0; }
                            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px 20px 20px 20px; max-width: 800px; margin: 0 auto; background: white; color: #333; }
                            #payslip-document { padding: 24px; }
                            @media print {
                              body { padding: 0; margin: 0; }
                              @page { margin: 20mm 15mm 15mm 15mm; }
                            }
                            .bg-white { background: white; }
                            .bg-muted\\/50, .bg-muted\\/30 { background: #f8fafc; }
                            .bg-muted { background: #f1f5f9; }
                            .bg-card\\/50 { background: rgba(255,255,255,0.5); }
                            .bg-primary\\/5 { background: rgba(30,64,175,0.05); }
                            .border { border: 1px solid #e2e8f0; }
                            .border-b { border-bottom: 1px solid #e2e8f0; }
                            .border-t { border-top: 1px solid #e2e8f0; }
                            .border-border { border-color: #e2e8f0; }
                            .rounded-lg { border-radius: 8px; }
                            .rounded-md, .rounded { border-radius: 6px; }
                            .rounded-t-lg { border-radius: 8px 8px 0 0; }
                            .shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                            .p-3 { padding: 12px; }
                            .p-4 { padding: 16px; }
                            .p-6 { padding: 24px; }
                            .pt-4 { padding-top: 16px; }
                            .pb-3 { padding-bottom: 12px; }
                            .mb-2 { margin-bottom: 8px; }
                            .mb-3 { margin-bottom: 12px; }
                            .mt-2 { margin-top: 8px; }
                            .ml-2 { margin-left: 8px; }
                            .my-2 { margin-top: 8px; margin-bottom: 8px; }
                            .gap-4 { gap: 16px; }
                            .gap-x-8 { column-gap: 32px; }
                            .gap-y-1 { row-gap: 4px; }
                            .space-y-2 > * + * { margin-top: 8px; }
                            .space-y-6 > * + * { margin-top: 24px; }
                            .grid { display: grid; }
                            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
                            .flex { display: flex; }
                            .justify-between { justify-content: space-between; }
                            .items-start { align-items: flex-start; }
                            .items-center { align-items: center; }
                            .text-right { text-align: right; }
                            .text-center { text-align: center; }
                            .text-xs { font-size: 12px; }
                            .text-sm { font-size: 14px; }
                            .text-lg { font-size: 18px; }
                            .text-xl { font-size: 20px; }
                            .text-2xl { font-size: 24px; }
                            .font-medium { font-weight: 500; }
                            .font-semibold { font-weight: 600; }
                            .font-bold { font-weight: 700; }
                            .text-muted-foreground { color: #64748b; }
                            .text-destructive { color: #dc2626; }
                            .whitespace-pre-line { white-space: pre-line; }
                            .object-contain { object-fit: contain; }
                            .h-16 { height: 64px; }
                            .w-auto { width: auto; }
                            hr, [data-orientation="horizontal"] { border: none; border-top: 1px solid #e2e8f0; margin: 8px 0; }
                            img { max-width: 100%; }
                            @media print { 
                              body { padding: 0; } 
                              @page { margin: 1cm; }
                            }
                          </style>
                        </head>
                        <body>
                          ${container.innerHTML}
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                      printWindow.print();
                      printWindow.close();
                      root.unmount();
                    }, 100);
                  }, 100);
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                {t("common.print", "Print")}
              </Button>
            </DialogHeader>
            {selectedEmployee && (
              <div id="payslip-print-content" className="space-y-6">
                {/* Employee Header */}
                <div className="border-b pb-3 header">
                  <h2 className="font-semibold text-lg">{selectedEmployee.employee?.full_name}</h2>
                  <p className="text-sm text-muted-foreground meta">{selectedEmployee.employee?.email}</p>
                </div>

                {/* Hours Summary */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {t("payroll.processing.hoursWorked", "Hours Worked")}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">{t("payroll.processing.regularHours")}</p>
                      <p className="text-lg font-semibold">{selectedEmployee.regular_hours || 0}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">{t("payroll.processing.overtimeHours")}</p>
                      <p className="text-lg font-semibold">{selectedEmployee.overtime_hours || 0}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">{t("payroll.processing.otherHours", "Other Hours")}</p>
                      <p className="text-lg font-semibold">
                        {(selectedEmployee.holiday_hours || 0) + (selectedEmployee.sick_hours || 0) + (selectedEmployee.vacation_hours || 0) + (selectedEmployee.other_hours || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Earnings Section */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {t("payroll.processing.earnings", "Earnings")}
                  </h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    {/* Itemized earnings from calculation_details */}
                    {(selectedEmployee.calculation_details as any)?.earnings?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">{t("payroll.processing.payElement", "Pay Element")}</TableHead>
                            <TableHead className="text-xs text-right">{t("payroll.processing.originalAmount", "Original")}</TableHead>
                            <TableHead className="text-xs">{t("payroll.processing.currency", "Currency")}</TableHead>
                            <TableHead className="text-xs text-right">{t("payroll.processing.localAmount", "Local Amount")} ({localCurrencyCode})</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {((selectedEmployee.calculation_details as any)?.earnings || []).map((earning: any, idx: number) => {
                            const hasConversion = earning.original_currency_id && earning.original_amount !== undefined;
                            const originalCurrencyCode = hasConversion 
                              ? currencyCodeMap.get(earning.original_currency_id) || '—' 
                              : localCurrencyCode;
                            const originalAmount = hasConversion ? earning.original_amount : earning.amount;
                            
                            return (
                              <TableRow key={idx}>
                                <TableCell className="py-2">
                                  <div className="flex flex-col">
                                    <span className="text-sm">
                                      {earning.name}
                                      {earning.type === 'base_salary' && (
                                        <span className="ml-1 text-xs text-primary">(Base)</span>
                                      )}
                                    </span>
                                    {earning.job_title && (
                                      <span className="text-xs text-muted-foreground">{earning.job_title}</span>
                                    )}
                                    {earning.is_prorated && (
                                      <Badge variant="outline" className="w-fit mt-0.5 text-xs bg-warning/20 text-warning border-warning/30">
                                        Prorated
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                  {formatCurrency(originalAmount || 0, originalCurrencyCode)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {originalCurrencyCode}
                                  </Badge>
                                  {hasConversion && earning.exchange_rate_used && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      @ {earning.exchange_rate_used.toFixed(4)}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm font-medium">
                                  {formatCurrency(earning.amount || 0, localCurrencyCode)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="space-y-2">
                        {/* Fallback to summary fields if no itemized data */}
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.regularPay")}</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.regular_pay || 0, localCurrencyCode)}</span>
                        </div>
                        {(selectedEmployee.overtime_pay || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.overtimePay")}</span>
                            <span className="font-medium">{formatCurrency(selectedEmployee.overtime_pay, localCurrencyCode)}</span>
                          </div>
                        )}
                        {(selectedEmployee.bonus_pay || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.bonusPay")}</span>
                            <span className="font-medium">{formatCurrency(selectedEmployee.bonus_pay, localCurrencyCode)}</span>
                          </div>
                        )}
                        {(selectedEmployee.commission_pay || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.commissionPay", "Commission")}</span>
                            <span className="font-medium">{formatCurrency(selectedEmployee.commission_pay, localCurrencyCode)}</span>
                          </div>
                        )}
                        {(selectedEmployee.other_earnings || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.otherEarnings")}</span>
                            <span className="font-medium">{formatCurrency(selectedEmployee.other_earnings, localCurrencyCode)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Allowances */}
                    {((selectedEmployee.calculation_details as any)?.allowances || []).length > 0 && (
                      <>
                        <div className="border-t border-border mt-3 pt-3">
                          <p className="text-xs text-muted-foreground mb-2 uppercase">{t("payroll.processing.allowances", "Allowances")}</p>
                        </div>
                        {((selectedEmployee.calculation_details as any)?.allowances || []).map((allowance: any, idx: number) => (
                          <div key={idx} className="flex justify-between py-1">
                            <span className="text-muted-foreground">
                              {allowance.name}
                              {!allowance.is_taxable && (
                                <span className="ml-1 text-xs text-success">(Non-taxable)</span>
                              )}
                            </span>
                            <span className="font-medium">{formatCurrency(allowance.amount || 0, localCurrencyCode)}</span>
                          </div>
                        ))}
                      </>
                    )}

                    <div className="flex justify-between py-2 border-t border-border mt-3 pt-3">
                      <span className="font-semibold">{t("payroll.processing.grossPay")}</span>
                      <span className="font-bold text-primary">{formatCurrency(selectedEmployee.gross_pay, localCurrencyCode)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Section */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {t("payroll.processing.deductions")}
                  </h4>
                  <div className="bg-destructive/5 rounded-lg p-4 space-y-2">
                    {/* Itemized statutory deductions from calculation_details */}
                    {((selectedEmployee.calculation_details as any)?.statutory_deductions || []).length > 0 ? (
                      <>
                        <p className="text-xs text-muted-foreground uppercase mb-1">{t("payroll.processing.statutoryTaxes", "Statutory Taxes")}</p>
                        {((selectedEmployee.calculation_details as any)?.statutory_deductions || []).map((deduction: any, idx: number) => (
                          <div key={idx} className="flex justify-between py-1">
                            <span className="text-muted-foreground">{deduction.name}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(deduction.employee_amount || 0, localCurrencyCode)}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      (selectedEmployee.tax_deductions || 0) > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.statutoryTaxes", "Statutory Taxes")}</span>
                          <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.tax_deductions, localCurrencyCode)}</span>
                        </div>
                      )
                    )}

                    {/* Period deductions from calculation_details */}
                    {((selectedEmployee.calculation_details as any)?.period_deductions || []).length > 0 && (
                      <>
                        <div className="border-t border-destructive/20 mt-2 pt-2">
                          <p className="text-xs text-muted-foreground uppercase mb-1">{t("payroll.processing.otherDeductions")}</p>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">{t("payroll.processing.deduction", "Deduction")}</TableHead>
                              <TableHead className="text-xs text-right">{t("payroll.processing.originalAmount", "Original")}</TableHead>
                              <TableHead className="text-xs">{t("payroll.processing.currency", "Currency")}</TableHead>
                              <TableHead className="text-xs text-right">{t("payroll.processing.localAmount", "Local Amount")} ({localCurrencyCode})</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {((selectedEmployee.calculation_details as any)?.period_deductions || []).map((deduction: any, idx: number) => {
                              const hasConversion = deduction.original_currency_id && deduction.original_amount !== undefined && deduction.was_converted;
                              const originalCurrencyCode = hasConversion 
                                ? (deduction.original_currency || currencyCodeMap.get(deduction.original_currency_id) || '—')
                                : localCurrencyCode;
                              const originalAmount = hasConversion ? deduction.original_amount : deduction.amount;
                              
                              return (
                                <TableRow key={idx}>
                                  <TableCell className="py-2">
                                    <span className="text-sm">
                                      {deduction.name}
                                      {deduction.is_pretax && (
                                        <span className="ml-1 text-xs text-primary">(Pre-tax)</span>
                                      )}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-sm text-destructive">
                                    -{formatCurrency(originalAmount || 0, originalCurrencyCode)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {originalCurrencyCode}
                                    </Badge>
                                    {hasConversion && deduction.exchange_rate_used && (
                                      <div className="text-xs text-muted-foreground mt-0.5">
                                        @ {deduction.exchange_rate_used.toFixed(4)}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-sm font-medium text-destructive">
                                    -{formatCurrency(deduction.amount || 0, localCurrencyCode)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </>
                    )}

                    {/* Fallback to summary fields */}
                    {!((selectedEmployee.calculation_details as any)?.period_deductions || []).length && (
                      <>
                        {(selectedEmployee.benefit_deductions || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.benefitDeductions", "Benefits")}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.benefit_deductions, localCurrencyCode)}</span>
                          </div>
                        )}
                        {(selectedEmployee.retirement_deductions || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.retirementDeductions", "Retirement")}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.retirement_deductions, localCurrencyCode)}</span>
                          </div>
                        )}
                        {(selectedEmployee.garnishment_deductions || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.garnishments", "Garnishments")}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.garnishment_deductions, localCurrencyCode)}</span>
                          </div>
                        )}
                        {(selectedEmployee.other_deductions || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.otherDeductions")}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.other_deductions, localCurrencyCode)}</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-between py-2 border-t border-destructive/20 mt-2 pt-2">
                      <span className="font-semibold">{t("payroll.processing.totalDeductions", "Total Deductions")}</span>
                      <span className="font-bold text-destructive">-{formatCurrency(selectedEmployee.total_deductions, localCurrencyCode)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <NetPayWithCurrencySplit 
                  selectedEmployee={selectedEmployee}
                  localCurrencyCode={localCurrencyCode}
                  companyLocalCurrencyId={companyLocalCurrencyId}
                  currencyCodeMap={currencyCodeMap}
                  expandedRunId={expandedRunId}
                  selectedCompanyId={selectedCompanyId}
                  t={t}
                  formatCurrency={formatCurrency}
                />

                {/* Employer Contributions */}
                {((selectedEmployee.employer_taxes || 0) > 0 || (selectedEmployee.employer_benefits || 0) > 0) && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {t("payroll.processing.employerContributions", "Employer Contributions")}
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      {(selectedEmployee.employer_taxes || 0) > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.employerTaxes", "Employer Taxes")}</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.employer_taxes)}</span>
                        </div>
                      )}
                      {(selectedEmployee.employer_benefits || 0) > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.employerBenefits", "Employer Benefits")}</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.employer_benefits)}</span>
                        </div>
                      )}
                      {(selectedEmployee.employer_retirement || 0) > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.employerRetirement", "Employer Retirement")}</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.employer_retirement)}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-t border-border mt-2 pt-2">
                        <span className="font-semibold">{t("payroll.processing.totalEmployerCost", "Total Employer Cost")}</span>
                        <span className="font-bold">{formatCurrency(selectedEmployee.total_employer_cost || (selectedEmployee.gross_pay + (selectedEmployee.employer_taxes || 0) + (selectedEmployee.employer_benefits || 0)))}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-muted-foreground">{t("common.status")}</span>
                  <Badge className={getStatusColor(selectedEmployee.status)}>
                    {selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)}
                  </Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Recalculation Confirmation Dialog */}
        <Dialog open={recalcConfirmOpen} onOpenChange={setRecalcConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("payroll.processing.confirmRecalculation")}</DialogTitle>
              <DialogDescription>
                {runToRecalc?.status === 'approved' 
                  ? t("payroll.processing.recalcApprovedWarning")
                  : t("payroll.processing.recalcWarning")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRecalcConfirmOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={confirmRecalculate} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("payroll.processing.recalculate")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reopen Confirmation Dialog */}
        <Dialog open={reopenConfirmOpen} onOpenChange={setReopenConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("payroll.processing.reopenPayrollRun")}</DialogTitle>
              <DialogDescription>
                {t("payroll.processing.reopenWarning")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReopenConfirmOpen(false)}>{t("common.cancel")}</Button>
              <Button variant="destructive" onClick={confirmReopen} disabled={isLoading}>
                <Unlock className="h-4 w-4 mr-2" />
                {t("payroll.processing.reopenForChanges")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Payslip Distribution */}
        {bulkDistributionRun && selectedCompanyId && (
          <BulkPayslipDistribution
            open={bulkDistributionOpen}
            onOpenChange={setBulkDistributionOpen}
            payrollRunId={bulkDistributionRun.id}
            runNumber={bulkDistributionRun.run_number}
            companyId={selectedCompanyId}
            payslipTemplate={payslipTemplate}
            companyInfo={companyInfo}
          />
        )}

        {/* Multi-Currency Exchange Rate Selection */}
        {runForExchangeRates && companyLocalCurrencyId && (
          <ExchangeRateSelectionDialog
            open={exchangeRateDialogOpen}
            onOpenChange={setExchangeRateDialogOpen}
            payrollRunId={runForExchangeRates.id}
            localCurrencyId={companyLocalCurrencyId}
            baseCurrencyId={groupBaseCurrencyId || undefined}
            foreignCurrencyIds={foreignCurrencyIds}
            onRatesConfirmed={handleExchangeRatesConfirmed}
          />
        )}
      </div>
    </AppLayout>
  );
}
