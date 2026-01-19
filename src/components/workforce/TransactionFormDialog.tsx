import { useState, useEffect } from "react";
import { CalendarIcon, Loader2, DollarSign, ArrowRight, Building2, AlertTriangle, Armchair, Check } from "lucide-react";
import { EmployeeContextCard } from "@/components/workforce/EmployeeContextCard";
import { TransactionImpactSummary } from "@/components/workforce/TransactionImpactSummary";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { formatDateForDisplay, toDateString, getTodayString } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  useEmployeeTransactions,
  EmployeeTransaction,
  LookupValue,
  TransactionType,
  TransactionStatus,
} from "@/hooks/useEmployeeTransactions";
import { TransactionEmployeeCompensationDialog } from "@/components/compensation/TransactionEmployeeCompensationDialog";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionType: TransactionType | null;
  existingTransaction?: EmployeeTransaction | null;
  onSuccess: () => void;
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
}

interface Position {
  id: string;
  title: string;
  code: string;
  department_id?: string | null;
}

interface EmployeePosition {
  position_id: string;
  rate_type?: string | null;
  hourly_rate?: number | null;
  standard_hours_per_week?: number | null;
  compensation_amount?: number | null;
  compensation_currency?: string | null;
  position: {
    id: string;
    title: string;
    code: string;
  };
}

interface Department {
  id: string;
  name: string;
  company_id?: string | null;
}

interface TransferCurrentAssignment {
  company_id: string | null;
  company_name: string | null;
  department_id: string | null;
  department_name: string | null;
  position_id: string | null;
  position_title: string | null;
  pay_group_id: string | null;
  pay_group_name: string | null;
}

interface Company {
  id: string;
  name: string;
}

interface PayGroup {
  id: string;
  name: string;
  code: string;
  company_id: string;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transactionType,
  existingTransaction,
  onSuccess,
}: TransactionFormDialogProps) {
  const { t } = useLanguage();
  const { createTransaction, updateTransaction, fetchLookupValues, isLoading } =
    useEmployeeTransactions();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);
  const [transactionTypeId, setTransactionTypeId] = useState<string>("");
  const [employeePositions, setEmployeePositions] = useState<EmployeePosition[]>([]);

  // Lookup values
  const [hireTypes, setHireTypes] = useState<LookupValue[]>([]);
  const [employeeTypes, setEmployeeTypes] = useState<LookupValue[]>([]);
  const [contractTypes, setContractTypes] = useState<LookupValue[]>([]);
  const [extensionReasons, setExtensionReasons] = useState<LookupValue[]>([]);
  const [promotionReasons, setPromotionReasons] = useState<LookupValue[]>([]);
  const [transferReasons, setTransferReasons] = useState<LookupValue[]>([]);
  const [actingReasons, setActingReasons] = useState<LookupValue[]>([]);
  const [secondmentReasons, setSecondmentReasons] = useState<LookupValue[]>([]);
  const [terminationReasons, setTerminationReasons] = useState<LookupValue[]>([]);
  // New lookup values for additional transaction types
  const [demotionReasons, setDemotionReasons] = useState<LookupValue[]>([]);
  const [retirementTypes, setRetirementTypes] = useState<LookupValue[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<LookupValue[]>([]);
  const [contractExtensionReasons, setContractExtensionReasons] = useState<LookupValue[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<EmployeeTransaction>>({
    effective_date: getTodayString(),
    status: "draft",
    requires_workflow: false,
    notes: "",
  });

  // Workflow setting state
  const [workflowRequired, setWorkflowRequired] = useState(false);
  const [isLoadingWorkflowSetting, setIsLoadingWorkflowSetting] = useState(false);

  // Compensation dialog state
  const [compensationDialogOpen, setCompensationDialogOpen] = useState(false);

  // Transfer: current employee assignment state
  const [transferCurrentAssignment, setTransferCurrentAssignment] = useState<TransferCurrentAssignment | null>(null);
  const [loadingTransferAssignment, setLoadingTransferAssignment] = useState(false);

  // Transfer: destination seat availability state
  const [destinationSeatStatus, setDestinationSeatStatus] = useState<{
    isLoading: boolean;
    hasAvailableSeat: boolean;
    availableSeats: number;
    errorMessage: string | null;
  }>({
    isLoading: false,
    hasAvailableSeat: true,
    availableSeats: 0,
    errorMessage: null,
  });

  useEffect(() => {
    if (open) {
      loadMasterData();
      loadTransactionTypeId();
    }
  }, [open, transactionType]);

  // Load employee positions when employee is selected (for CONFIRMATION, PROBATION_EXT, SECONDMENT, TERMINATION, SALARY_CHANGE, and RATE_CHANGE transaction types)
  useEffect(() => {
    const loadEmployeePositions = async () => {
      if (formData.employee_id && (transactionType === "CONFIRMATION" || transactionType === "PROBATION_EXT" || transactionType === "SECONDMENT" || transactionType === "TERMINATION" || transactionType === "SALARY_CHANGE" || transactionType === "RATE_CHANGE")) {
        const { data } = await supabase
          .from("employee_positions")
          .select(`
            position_id,
            rate_type,
            hourly_rate,
            standard_hours_per_week,
            compensation_amount,
            compensation_currency,
            position:positions!employee_positions_position_id_fkey (
              id,
              title,
              code
            )
          `)
          .eq("employee_id", formData.employee_id)
          .eq("is_active", true);
        
        if (data) {
          setEmployeePositions(data as unknown as EmployeePosition[]);
          // Auto-select if only one position
          if (data.length === 1 && !formData.position_id) {
            setFormData(prev => ({ ...prev, position_id: data[0].position_id }));
          }
        }
      } else {
        setEmployeePositions([]);
      }
    };
    
    loadEmployeePositions();
  }, [formData.employee_id, transactionType]);

  // Load employee's current assignment for TRANSFER transactions
  useEffect(() => {
    const loadTransferAssignment = async () => {
      if (!formData.employee_id || transactionType !== "TRANSFER") {
        setTransferCurrentAssignment(null);
        return;
      }

      setLoadingTransferAssignment(true);
      try {
        // Get the employee's primary active position
        const { data: empPosition } = await supabase
          .from("employee_positions")
          .select("position_id")
          .eq("employee_id", formData.employee_id)
          .eq("is_active", true)
          .eq("is_primary", true)
          .single();

        if (!empPosition) {
          setTransferCurrentAssignment(null);
          setLoadingTransferAssignment(false);
          return;
        }

        // Get position details with department
        const { data: positionDetail } = await supabase
          .from("positions")
          .select("id, title, department_id")
          .eq("id", empPosition.position_id)
          .single();

        if (!positionDetail?.department_id) {
          setTransferCurrentAssignment(null);
          setLoadingTransferAssignment(false);
          return;
        }

        // Get department details with company
        const { data: deptDetail } = await supabase
          .from("departments")
          .select("id, name, company_id")
          .eq("id", positionDetail.department_id)
          .single();

        if (!deptDetail?.company_id) {
          setTransferCurrentAssignment(null);
          setLoadingTransferAssignment(false);
          return;
        }

        // Get company details
        const { data: companyDetail } = await supabase
          .from("companies")
          .select("id, name")
          .eq("id", deptDetail.company_id)
          .single();

        // Get employee's pay group assignment - use any to avoid deep type recursion in generated types
        const payGroupResult: any = await supabase
          .from("employee_pay_groups" as any)
          .select("pay_group_id")
          .eq("employee_id", formData.employee_id)
          .eq("is_active", true)
          .maybeSingle();
        const payGroupAssignment = payGroupResult?.data as { pay_group_id: string } | null;

        let payGroupName: string | null = null;
        if (payGroupAssignment?.pay_group_id) {
          const { data: pgDetail } = await supabase
            .from("pay_groups")
            .select("id, name")
            .eq("id", payGroupAssignment.pay_group_id)
            .single();
          payGroupName = pgDetail?.name || null;
        }

        if (companyDetail) {
          setTransferCurrentAssignment({
            company_id: companyDetail.id,
            company_name: companyDetail.name,
            department_id: deptDetail.id,
            department_name: deptDetail.name,
            position_id: positionDetail.id,
            position_title: positionDetail.title,
            pay_group_id: payGroupAssignment?.pay_group_id || null,
            pay_group_name: payGroupName,
          });

          // Auto-populate "from" fields
          setFormData(prev => ({
            ...prev,
            from_company_id: companyDetail.id,
            from_department_id: deptDetail.id,
            from_position_id: positionDetail.id,
          }));
        } else {
          setTransferCurrentAssignment(null);
        }
      } catch (error) {
        console.error("Error loading transfer assignment:", error);
        setTransferCurrentAssignment(null);
      } finally {
        setLoadingTransferAssignment(false);
      }
    };

    loadTransferAssignment();
  }, [formData.employee_id, transactionType]);

  // Check seat availability for destination position in TRANSFER, PROMOTION, and SECONDMENT transactions
  useEffect(() => {
    const checkDestinationSeat = async () => {
      // Determine which position field to check based on transaction type
      let targetPositionId: string | null = null;
      
      if (transactionType === "TRANSFER" || transactionType === "PROMOTION") {
        targetPositionId = formData.to_position_id || null;
      } else if (transactionType === "SECONDMENT") {
        targetPositionId = formData.secondment_position_id || null;
      }

      // Reset state if no target position or not a relevant transaction type
      if (!targetPositionId || !["TRANSFER", "PROMOTION", "SECONDMENT"].includes(transactionType || "")) {
        setDestinationSeatStatus({ 
          isLoading: false, 
          hasAvailableSeat: true, 
          availableSeats: 0, 
          errorMessage: null 
        });
        return;
      }

      setDestinationSeatStatus(prev => ({ ...prev, isLoading: true }));

      try {
        // Query seat_occupancy_summary for available seats in destination position
        const { data, error } = await supabase
          .from('seat_occupancy_summary')
          .select('seat_id, status, allocation_status, is_shared_seat, current_occupant_count, max_occupants')
          .eq('position_id', targetPositionId);

        if (error) {
          console.error("Error checking seat availability:", error);
          setDestinationSeatStatus({
            isLoading: false,
            hasAvailableSeat: false,
            availableSeats: 0,
            errorMessage: "Failed to check seat availability",
          });
          return;
        }

        // Find vacant or under-allocated seats
        const available = (data || []).filter(seat => 
          seat.status === 'VACANT' || 
          (seat.is_shared_seat && (seat.current_occupant_count || 0) < (seat.max_occupants || 1))
        );

        const transactionLabel = transactionType === "SECONDMENT" ? "secondment" : transactionType?.toLowerCase() || "transaction";

        setDestinationSeatStatus({
          isLoading: false,
          hasAvailableSeat: available.length > 0,
          availableSeats: available.length,
          errorMessage: available.length === 0 
            ? `No available seats in the selected position. The ${transactionLabel} cannot proceed.`
            : null,
        });
      } catch (err) {
        console.error("Error checking seat availability:", err);
        setDestinationSeatStatus({
          isLoading: false,
          hasAvailableSeat: false,
          availableSeats: 0,
          errorMessage: "Failed to check seat availability",
        });
      }
    };

    checkDestinationSeat();
  }, [formData.to_position_id, formData.secondment_position_id, transactionType]);

  useEffect(() => {
    if (existingTransaction) {
      setFormData(existingTransaction);
      // Check workflow setting for existing transaction's company
      const companyId = existingTransaction.to_company_id || existingTransaction.company_id;
      if (companyId && transactionType) {
        fetchWorkflowSetting(companyId, transactionType);
      }
    } else {
      setFormData({
        effective_date: getTodayString(),
        status: "draft",
        requires_workflow: false,
        notes: "",
      });
      // Reset transfer assignment when form resets
      setTransferCurrentAssignment(null);
      // Reset seat status
      setDestinationSeatStatus({
        isLoading: false,
        hasAvailableSeat: true,
        availableSeats: 0,
        errorMessage: null,
      });
      // Reset workflow setting
      setWorkflowRequired(false);
    }
  }, [existingTransaction]);

  // Fetch workflow setting when company changes
  useEffect(() => {
    // Determine the relevant company based on transaction type
    const targetCompanyId = formData.to_company_id || formData.company_id;
    if (targetCompanyId && transactionType && !existingTransaction) {
      fetchWorkflowSetting(targetCompanyId, transactionType);
    }
  }, [formData.to_company_id, formData.company_id, transactionType, existingTransaction]);

  // Fetch workflow setting from centralized config
  const fetchWorkflowSetting = async (companyId: string, txnType: TransactionType) => {
    setIsLoadingWorkflowSetting(true);
    try {
      // Get transaction type ID
      const { data: txnTypeData } = await supabase
        .from("lookup_values")
        .select("id")
        .eq("category", "transaction_type")
        .eq("code", txnType)
        .single();

      if (!txnTypeData) {
        setWorkflowRequired(false);
        return;
      }

      // Check company_transaction_workflow_settings
      const { data: workflowSetting } = await supabase
        .from("company_transaction_workflow_settings")
        .select("workflow_enabled")
        .eq("company_id", companyId)
        .eq("transaction_type_id", txnTypeData.id)
        .eq("is_active", true)
        .maybeSingle();

      const isRequired = workflowSetting?.workflow_enabled ?? false;
      setWorkflowRequired(isRequired);
      // Update formData to reflect the centralized setting
      setFormData(prev => ({ ...prev, requires_workflow: isRequired }));
    } catch (error) {
      console.error("Error fetching workflow setting:", error);
      setWorkflowRequired(false);
    } finally {
      setIsLoadingWorkflowSetting(false);
    }
  };

  const loadMasterData = async () => {
    const [
      employeesRes,
      positionsRes,
      departmentsRes,
      companiesRes,
      payGroupsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").order("full_name"),
      supabase.from("positions").select("id, title, code, department_id").eq("is_active", true).order("title"),
      supabase.from("departments").select("id, name, company_id").eq("is_active", true).order("name"),
      supabase.from("companies").select("id, name").eq("is_active", true).order("name"),
      supabase.from("pay_groups").select("id, name, code, company_id").eq("is_active", true).order("name"),
    ]);

    setEmployees(employeesRes.data || []);
    setPositions(positionsRes.data || []);
    setDepartments(departmentsRes.data || []);
    setCompanies(companiesRes.data || []);
    setPayGroups(payGroupsRes.data || []);

    // Load lookup values based on transaction type
    if (transactionType) {
      const [
        hireTypesData,
        employeeTypesData,
        contractTypesData,
        extensionReasonsData,
        promotionReasonsData,
        transferReasonsData,
        actingReasonsData,
        secondmentReasonsData,
        terminationReasonsData,
        demotionReasonsData,
        retirementTypesData,
        employmentStatusesData,
        contractExtensionReasonsData,
      ] = await Promise.all([
        fetchLookupValues("hire_type"),
        fetchLookupValues("employee_type"),
        fetchLookupValues("contract_type"),
        fetchLookupValues("probation_extension_reason"),
        fetchLookupValues("promotion_reason"),
        fetchLookupValues("transfer_reason"),
        fetchLookupValues("acting_reason"),
        fetchLookupValues("secondment_reason"),
        fetchLookupValues("termination_reason"),
        fetchLookupValues("demotion_reason"),
        fetchLookupValues("retirement_type"),
        fetchLookupValues("employment_status"),
        fetchLookupValues("contract_extension_reason"),
      ]);

      setHireTypes(hireTypesData);
      setEmployeeTypes(employeeTypesData);
      setContractTypes(contractTypesData);
      setExtensionReasons(extensionReasonsData);
      setPromotionReasons(promotionReasonsData);
      setTransferReasons(transferReasonsData);
      setActingReasons(actingReasonsData);
      setSecondmentReasons(secondmentReasonsData);
      setTerminationReasons(terminationReasonsData);
      setDemotionReasons(demotionReasonsData);
      setRetirementTypes(retirementTypesData);
      setEmploymentStatuses(employmentStatusesData);
      setContractExtensionReasons(contractExtensionReasonsData);
    }
  };

  const loadTransactionTypeId = async () => {
    if (transactionType) {
      const { data } = await supabase
        .from("lookup_values")
        .select("id")
        .eq("category", "transaction_type")
        .eq("code", transactionType)
        .single();
      if (data) {
        setTransactionTypeId(data.id);
      }
    }
  };

  const handleSubmit = async () => {
    // Pre-validation for TRANSFER, PROMOTION, and SECONDMENT transactions - block if no seats available
    if (["TRANSFER", "PROMOTION", "SECONDMENT"].includes(transactionType || "")) {
      // Block if seat check is still loading
      if (destinationSeatStatus.isLoading) {
        toast.warning("Please wait - checking seat availability...");
        return;
      }
      
      // Determine which position to check based on transaction type
      const targetPositionId = transactionType === "SECONDMENT" 
        ? formData.secondment_position_id 
        : formData.to_position_id;
      
      // Block if no seats available
      if (targetPositionId && !destinationSeatStatus.hasAvailableSeat) {
        const transactionLabel = transactionType === "SECONDMENT" ? "secondment" : transactionType?.toLowerCase() || "transaction";
        toast.error(`Cannot process ${transactionLabel}: No available seats in the destination position.`);
        return;
      }
    }

    // Strip out joined/virtual fields that shouldn't be sent to the database
    const { 
      transaction_type, 
      employee, 
      position, 
      department, 
      company,
      ...cleanFormData 
    } = formData as any;

    const submitData = {
      ...cleanFormData,
      transaction_type_id: transactionTypeId,
      // Use the user-selected approval status from the form
      status: formData.status || "draft",
    };

    let success;
    if (existingTransaction) {
      success = await updateTransaction(existingTransaction.id, submitData);
    } else {
      success = await createTransaction(submitData);
    }

    if (success) {
      // If transaction is approved (no workflow required) and is a TRANSFER type, execute immediately
      if (!workflowRequired && transactionType === "TRANSFER" && formData.employee_id) {
        // End current position assignment
        const { error: endPosError } = await supabase
          .from("employee_positions")
          .update({ 
            is_active: false, 
            end_date: formData.effective_date 
          })
          .eq("employee_id", formData.employee_id)
          .eq("is_active", true);

        if (endPosError) {
          console.error("Failed to end current position:", endPosError);
          toast.error(`Failed to end current position: ${endPosError.message}`);
        }

        // Create new position assignment at destination
        if (formData.to_position_id) {
          const { error: insertPosError } = await supabase
            .from("employee_positions")
            .insert({
              employee_id: formData.employee_id,
              position_id: formData.to_position_id,
              department_id: formData.to_department_id,
              start_date: formData.effective_date,
              is_active: true,
              is_primary: true,
            });

          if (insertPosError) {
            console.error("Failed to create new position:", insertPosError);
            toast.error(`Failed to create new position: ${insertPosError.message}`);
          }
        }

        // Update employee's company and department
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            company_id: formData.to_company_id,
            department_id: formData.to_department_id,
          })
          .eq("id", formData.employee_id);

        if (profileError) {
          console.error("Failed to update profile:", profileError);
          toast.error(`Failed to update employee profile: ${profileError.message}`);
        }
      }
      
      onSuccess();
      onOpenChange(false);
    }
  };

  const getTitle = () => {
    const typeKey = transactionType ? `workforce.modules.transactions.form.types.${transactionType}` : "";
    const typeName = transactionType ? t(typeKey) : t("workforce.modules.transactions.title");
    const prefix = existingTransaction ? t("common.edit") : t("common.create");
    return `${prefix} ${typeName}`;
  };

  const renderTypeSpecificFields = () => {
    switch (transactionType) {
      case "HIRE":
        return (
          <>
            <div className="space-y-2">
              <Label>{t("common.employee")}</Label>
              <Select
                value={formData.employee_id || ""}
                onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectEmployee")} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.full_name || e.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.hire.hireType")}</Label>
                <Select
                  value={formData.hire_type_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, hire_type_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.hire.selectHireType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {hireTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.hire.employeeType")}</Label>
                <Select
                  value={formData.employment_type_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, employment_type_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.hire.selectEmployeeType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.hire.contractType")}</Label>
                <Select
                  value={formData.contract_type_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, contract_type_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.hire.selectContractType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.hire.probationEndDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.probation_end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.probation_end_date
                        ? formatDateForDisplay(formData.probation_end_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.probation_end_date ? new Date(formData.probation_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          probation_end_date: date ? toDateString(date) : undefined,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.company")}</Label>
                <Select
                  value={formData.company_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, company_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectCompany")} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("common.department")}</Label>
                <Select
                  value={formData.department_id || ""}
                  onValueChange={(v) => {
                    // When department changes, clear position if it doesn't belong to the new department
                    const currentPosition = positions.find(p => p.id === formData.position_id);
                    const shouldClearPosition = currentPosition && currentPosition.department_id !== v;
                    setFormData({ 
                      ...formData, 
                      department_id: v,
                      position_id: shouldClearPosition ? undefined : formData.position_id
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectDepartment")} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("common.position")}</Label>
              <Select
                value={formData.position_id || ""}
                onValueChange={(v) => {
                  // When position is selected, auto-populate department if position has one
                  const selectedPosition = positions.find(p => p.id === v);
                  if (selectedPosition?.department_id && !formData.department_id) {
                    setFormData({ 
                      ...formData, 
                      position_id: v,
                      department_id: selectedPosition.department_id
                    });
                  } else {
                    setFormData({ ...formData, position_id: v });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                </SelectTrigger>
                <SelectContent>
                  {/* Filter positions by department if department is selected */}
                  {(formData.department_id 
                    ? positions.filter(p => p.department_id === formData.department_id || !p.department_id)
                    : positions
                  ).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.department_id && (
                <p className="text-xs text-muted-foreground">
                  {t("workforce.modules.transactions.form.hire.positionsFilteredByDepartment", "Showing positions in the selected department")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.payGroup", "Pay Group")}</Label>
              <Select
                value={formData.pay_group_id || ""}
                onValueChange={(v) => setFormData({ ...formData, pay_group_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectPayGroup", "Select pay group")} />
                </SelectTrigger>
                <SelectContent>
                  {payGroups
                    .filter(pg => !formData.company_id || pg.company_id === formData.company_id)
                    .map((pg) => (
                      <SelectItem key={pg.id} value={pg.id}>
                        {pg.name} ({pg.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={formData.has_adjusted_service || false}
                onCheckedChange={(checked) =>
                  setFormData({ 
                    ...formData, 
                    has_adjusted_service: checked,
                    adjusted_service_date: checked ? formData.adjusted_service_date : undefined
                  })
                }
              />
              <div>
                <Label>{t("workforce.modules.transactions.form.hire.adjustedService", "Adjusted Service Date")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("workforce.modules.transactions.form.hire.adjustedServiceDescription", "Enable if the new hire has negotiated credit for previous experience")}
                </p>
              </div>
            </div>
            {formData.has_adjusted_service && (
              <div className="space-y-2 ml-6 pl-4 border-l-2 border-primary/30">
                <Label>{t("workforce.modules.transactions.form.hire.adjustedServiceDate", "Adjusted Service Date")}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t("workforce.modules.transactions.form.hire.adjustedServiceDateDescription", "Set an earlier date to credit previous experience towards service calculations")}
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.adjusted_service_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.adjusted_service_date
                        ? formatDateForDisplay(formData.adjusted_service_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={formData.adjusted_service_date ? new Date(formData.adjusted_service_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          adjusted_service_date: date ? toDateString(date) : undefined,
                        })
                      }
                      disabled={(date) => {
                        const effectiveDate = formData.effective_date ? new Date(formData.effective_date) : new Date();
                        return date >= effectiveDate;
                      }}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </>
        );

      case "REHIRE":
        return (
          <>
            {/* Employee dropdown removed - using common employee dropdown above */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.hire.employeeType")}</Label>
                <Select
                  value={formData.employment_type_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, employment_type_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.hire.selectEmployeeType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.hire.contractType")}</Label>
                <Select
                  value={formData.contract_type_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, contract_type_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.hire.selectContractType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.company")}</Label>
                <Select
                  value={formData.company_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, company_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectCompany")} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("common.department")}</Label>
                <Select
                  value={formData.department_id || ""}
                  onValueChange={(v) => {
                    const currentPosition = positions.find(p => p.id === formData.position_id);
                    const shouldClearPosition = currentPosition && currentPosition.department_id !== v;
                    setFormData({ 
                      ...formData, 
                      department_id: v,
                      position_id: shouldClearPosition ? undefined : formData.position_id
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectDepartment")} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("common.position")}</Label>
              <Select
                value={formData.position_id || ""}
                onValueChange={(v) => {
                  const selectedPosition = positions.find(p => p.id === v);
                  if (selectedPosition?.department_id && !formData.department_id) {
                    setFormData({ 
                      ...formData, 
                      position_id: v,
                      department_id: selectedPosition.department_id
                    });
                  } else {
                    setFormData({ ...formData, position_id: v });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                </SelectTrigger>
                <SelectContent>
                  {(formData.department_id 
                    ? positions.filter(p => p.department_id === formData.department_id || !p.department_id)
                    : positions
                  ).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.payGroup", "Pay Group")}</Label>
                <Select
                  value={formData.pay_group_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, pay_group_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectPayGroup", "Select pay group")} />
                  </SelectTrigger>
                  <SelectContent>
                    {payGroups
                      .filter(pg => !formData.company_id || pg.company_id === formData.company_id)
                      .map((pg) => (
                        <SelectItem key={pg.id} value={pg.id}>
                          {pg.name} ({pg.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.hire.probationEndDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.probation_end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.probation_end_date
                        ? formatDateForDisplay(formData.probation_end_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.probation_end_date ? new Date(formData.probation_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          probation_end_date: date ? toDateString(date) : undefined,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={formData.adjust_continuous_service || false}
                onCheckedChange={(checked) =>
                  setFormData({ 
                    ...formData, 
                    adjust_continuous_service: checked,
                    continuous_service_date: checked ? formData.continuous_service_date : undefined
                  })
                }
              />
              <div>
                <Label>{t("workforce.modules.transactions.form.rehire.adjustContinuousService", "Adjust Continuous Service Date")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("workforce.modules.transactions.form.rehire.adjustContinuousServiceDescription", "Enable to specify a continuous service date to recover previous service")}
                </p>
              </div>
            </div>
            {formData.adjust_continuous_service && (
              <div className="space-y-2 ml-6 pl-4 border-l-2 border-primary/30">
                <Label>{t("workforce.modules.transactions.form.rehire.continuousServiceDate", "Continuous Service Date")}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t("workforce.modules.transactions.form.rehire.continuousServiceDateDescription", "Set a date before the rehire date to recover previous service time")}
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.continuous_service_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.continuous_service_date
                        ? formatDateForDisplay(formData.continuous_service_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={formData.continuous_service_date ? new Date(formData.continuous_service_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          continuous_service_date: date ? toDateString(date) : undefined,
                        })
                      }
                      disabled={(date) => {
                        const effectiveDate = formData.effective_date ? new Date(formData.effective_date) : new Date();
                        return date >= effectiveDate;
                      }}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </>
        );

        return (
          <div className="space-y-4">
            {/* Position Selection - shown when employee has positions */}
            {employeePositions.length > 0 && (
              <div className="space-y-2">
                <Label>{t("common.position")} *</Label>
                <Select
                  value={formData.position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, position_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employeePositions.map((ep) => (
                      <SelectItem key={ep.position_id} value={ep.position_id}>
                        {ep.position.title} ({ep.position.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {employeePositions.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {t("workforce.modules.transactions.form.confirmation.multiplePositionsNote", "Employee has multiple positions. Please select the position to confirm.")}
                  </p>
                )}
              </div>
            )}
            
            {/* Show message if employee selected but no positions */}
            {formData.employee_id && employeePositions.length === 0 && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {t("workforce.modules.transactions.form.confirmation.noPositions", "No active positions found for this employee.")}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.confirmation.confirmationDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.confirmation_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.confirmation_date
                      ? formatDateForDisplay(formData.confirmation_date, "PPP")
                      : t("workforce.modules.transactions.form.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.confirmation_date ? new Date(formData.confirmation_date) : undefined}
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        confirmation_date: date ? toDateString(date) : undefined,
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case "PROBATION_EXT":
        return (
          <>
            {/* Position Selection - shown when employee has positions */}
            {employeePositions.length > 0 && (
              <div className="space-y-2">
                <Label>{t("common.position")} *</Label>
                <Select
                  value={formData.position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, position_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employeePositions.map((ep) => (
                      <SelectItem key={ep.position_id} value={ep.position_id}>
                        {ep.position.title} ({ep.position.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {employeePositions.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {t("workforce.modules.transactions.form.probationExt.multiplePositionsNote", "Employee has multiple positions. Please select the position for probation extension.")}
                  </p>
                )}
              </div>
            )}
            
            {/* Show message if employee selected but no positions */}
            {formData.employee_id && employeePositions.length === 0 && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {t("workforce.modules.transactions.form.probationExt.noPositions", "No active positions found for this employee.")}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.probationExt.originalEndDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.original_probation_end_date
                        ? formatDateForDisplay(formData.original_probation_end_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.original_probation_end_date ? new Date(formData.original_probation_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          original_probation_end_date: date ? toDateString(date) : undefined,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.probationExt.newEndDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.new_probation_end_date
                        ? formatDateForDisplay(formData.new_probation_end_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.new_probation_end_date ? new Date(formData.new_probation_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          new_probation_end_date: date ? toDateString(date) : undefined,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.probationExt.extensionDays")}</Label>
                <Input
                  type="number"
                  value={formData.extension_days || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, extension_days: parseInt(e.target.value) || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.probationExt.extensionReason")}</Label>
                <Select
                  value={formData.extension_reason_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, extension_reason_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                  </SelectTrigger>
                  <SelectContent>
                    {extensionReasons.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case "ACTING":
        return (
          <>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.acting.actingPosition")}</Label>
              <Select
                value={formData.acting_position_id || ""}
                onValueChange={(v) => setFormData({ ...formData, acting_position_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.acting.startDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.acting_start_date
                        ? formatDateForDisplay(formData.acting_start_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.acting_start_date ? new Date(formData.acting_start_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          acting_start_date: date ? toDateString(date) : undefined,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.acting.endDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.acting_end_date
                        ? formatDateForDisplay(formData.acting_end_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.acting_end_date ? new Date(formData.acting_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          acting_end_date: date ? toDateString(date) : undefined,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.acting.actingReason")}</Label>
              <Select
                value={formData.acting_reason_id || ""}
                onValueChange={(v) => setFormData({ ...formData, acting_reason_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {actingReasons.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case "PROMOTION":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.promotion.fromPosition")}</Label>
                <Select
                  value={formData.from_position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, from_position_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.promotion.toPosition")}</Label>
                <Select
                  value={formData.to_position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, to_position_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Seat Availability Status for Promotion */}
                {formData.to_position_id && (
                  <div className={cn(
                    "rounded-lg border p-3 mt-2",
                    destinationSeatStatus.isLoading 
                      ? "border-muted bg-muted/30"
                      : destinationSeatStatus.hasAvailableSeat 
                        ? "border-green-500/30 bg-green-50 dark:bg-green-900/20"
                        : "border-destructive bg-destructive/10"
                  )}>
                    {destinationSeatStatus.isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("workforce.modules.transactions.form.transfer.checkingSeat", "Checking seat availability...")}
                      </div>
                    ) : destinationSeatStatus.hasAvailableSeat ? (
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <Armchair className="h-4 w-4" />
                        {t("workforce.modules.transactions.form.transfer.seatsAvailable", "{{count}} seat(s) available").replace("{{count}}", String(destinationSeatStatus.availableSeats))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {destinationSeatStatus.errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.promotion.promotionReason")}</Label>
              <Select
                value={formData.promotion_reason_id || ""}
                onValueChange={(v) => setFormData({ ...formData, promotion_reason_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {promotionReasons.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.payGroup", "Pay Group Assignment")}</Label>
              <Select
                value={formData.pay_group_id || ""}
                onValueChange={(v) => setFormData({ ...formData, pay_group_id: v || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectPayGroup", "Select pay group (optional)")} />
                </SelectTrigger>
                <SelectContent>
                  {payGroups.map((pg) => (
                    <SelectItem key={pg.id} value={pg.id}>
                      {pg.name} ({pg.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("workforce.modules.transactions.form.payGroupHint", "Leave empty to keep current pay group assignment")}
              </p>
            </div>
          </>
        );

      case "TRANSFER":
        // Filter departments and positions by selected "To Company"
        const filteredToDepartments = formData.to_company_id 
          ? departments.filter(d => d.company_id === formData.to_company_id)
          : departments;
        const filteredToPayGroups = formData.to_company_id
          ? payGroups.filter(pg => pg.company_id === formData.to_company_id)
          : payGroups;
        // Filter positions by selected "To Department"
        const filteredToPositions = formData.to_department_id
          ? positions.filter(p => p.department_id === formData.to_department_id)
          : [];

        // Get names for comparison panel
        const toCompanyName = companies.find(c => c.id === formData.to_company_id)?.name;
        const toDeptName = filteredToDepartments.find(d => d.id === formData.to_department_id)?.name;
        const toPositionTitle = positions.find(p => p.id === formData.to_position_id)?.title;
        const toPayGroupName = filteredToPayGroups.find(pg => pg.id === formData.pay_group_id)?.name;

        return (
          <>
            {/* Current Assignment Section (Read-Only) */}
            {loadingTransferAssignment ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {t("workforce.modules.transactions.form.transfer.loadingAssignment", "Loading current assignment...")}
                </span>
              </div>
            ) : transferCurrentAssignment ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {t("workforce.modules.transactions.form.transfer.currentAssignment", "Current Assignment")}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("workforce.modules.transactions.form.transfer.company", "Company")}:</span>
                    <span className="ml-2 font-medium">{transferCurrentAssignment.company_name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("workforce.modules.transactions.form.transfer.department", "Department")}:</span>
                    <span className="ml-2 font-medium">{transferCurrentAssignment.department_name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("workforce.modules.transactions.form.transfer.position", "Position")}:</span>
                    <span className="ml-2 font-medium">{transferCurrentAssignment.position_title || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("workforce.modules.transactions.form.transfer.payGroup", "Pay Group")}:</span>
                    <span className="ml-2 font-medium">{transferCurrentAssignment.pay_group_name || "—"}</span>
                  </div>
                </div>
              </div>
            ) : formData.employee_id ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                {t("workforce.modules.transactions.form.transfer.noAssignmentFound", "No active position found for this employee. Please ensure they have an active position assignment.")}
              </div>
            ) : null}

            {/* New Assignment Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ArrowRight className="h-4 w-4 text-primary" />
                {t("workforce.modules.transactions.form.transfer.newAssignment", "New Assignment")}
              </div>

              {/* To Company */}
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.transfer.toCompany")} *</Label>
                <Select
                  value={formData.to_company_id || ""}
                  onValueChange={(v) => setFormData({ 
                    ...formData, 
                    to_company_id: v,
                    to_department_id: undefined, // Reset dependent fields
                    to_position_id: undefined,
                    pay_group_id: undefined,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectCompany")} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Department */}
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.transfer.toDepartment")} *</Label>
                <Select
                  value={formData.to_department_id || ""}
                  onValueChange={(v) => setFormData({ 
                    ...formData, 
                    to_department_id: v,
                    to_position_id: undefined, // Reset dependent field
                  })}
                  disabled={!formData.to_company_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.to_company_id 
                        ? t("workforce.modules.transactions.form.transfer.selectCompanyFirst", "Select company first")
                        : t("workforce.modules.transactions.form.selectDepartment")
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredToDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.to_company_id && filteredToDepartments.length === 0 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    {t("workforce.modules.transactions.form.transfer.noDepartments", "No departments found for selected company")}
                  </p>
                )}
              </div>

              {/* To Position */}
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.transfer.toPosition", "New Position")}</Label>
                <Select
                  value={formData.to_position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, to_position_id: v })}
                  disabled={!formData.to_department_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.to_department_id 
                        ? t("workforce.modules.transactions.form.transfer.selectDepartmentFirst", "Select department first")
                        : t("workforce.modules.transactions.form.selectPosition")
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredToPositions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.to_department_id && filteredToPositions.length === 0 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    {t("workforce.modules.transactions.form.transfer.noPositions", "No positions found in selected department")}
                  </p>
                )}
                
                {/* Seat Availability Status */}
                {formData.to_position_id && (
                  <div className={cn(
                    "rounded-lg border p-3 mt-2",
                    destinationSeatStatus.isLoading 
                      ? "border-muted bg-muted/30"
                      : destinationSeatStatus.hasAvailableSeat 
                        ? "border-green-500/30 bg-green-50 dark:bg-green-900/20"
                        : "border-destructive bg-destructive/10"
                  )}>
                    {destinationSeatStatus.isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("workforce.modules.transactions.form.transfer.checkingSeat", "Checking seat availability...")}
                      </div>
                    ) : destinationSeatStatus.hasAvailableSeat ? (
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <Armchair className="h-4 w-4" />
                        {t("workforce.modules.transactions.form.transfer.seatsAvailable", "{{count}} seat(s) available").replace("{{count}}", String(destinationSeatStatus.availableSeats))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        {destinationSeatStatus.errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pay Group */}
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.payGroup", "Pay Group Assignment")}</Label>
                <Select
                  value={formData.pay_group_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, pay_group_id: v || null })}
                  disabled={!formData.to_company_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.to_company_id 
                        ? t("workforce.modules.transactions.form.transfer.selectCompanyFirst", "Select company first")
                        : t("workforce.modules.transactions.form.selectPayGroup", "Select pay group (optional)")
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredToPayGroups.map((pg) => (
                      <SelectItem key={pg.id} value={pg.id}>
                        {pg.name} ({pg.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("workforce.modules.transactions.form.payGroupHint", "Leave empty to keep current pay group assignment")}
                </p>
              </div>

              {/* Transfer Reason */}
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.transfer.transferReason")} *</Label>
                <Select
                  value={formData.transfer_reason_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, transfer_reason_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                  </SelectTrigger>
                  <SelectContent>
                    {transferReasons.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Comparison Panel - Show when we have both current and new assignments */}
            {transferCurrentAssignment && formData.to_company_id && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="text-sm font-medium text-primary">
                  {t("workforce.modules.transactions.form.transfer.changesSummary", "Transfer Summary")}
                </div>
                <div className="space-y-2 text-sm">
                  {/* Company Change */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-muted-foreground">{t("workforce.modules.transactions.form.transfer.company", "Company")}:</span>
                    <span className={cn(
                      "font-medium",
                      transferCurrentAssignment.company_id !== formData.to_company_id && "text-orange-600 dark:text-orange-400"
                    )}>
                      {transferCurrentAssignment.company_name}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(
                      "font-medium",
                      transferCurrentAssignment.company_id !== formData.to_company_id && "text-green-600 dark:text-green-400"
                    )}>
                      {toCompanyName || "—"}
                    </span>
                    {transferCurrentAssignment.company_id !== formData.to_company_id && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded dark:bg-orange-900 dark:text-orange-300">
                        {t("common.changed", "Changed")}
                      </span>
                    )}
                  </div>
                  {/* Department Change */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-muted-foreground">{t("workforce.modules.transactions.form.transfer.department", "Department")}:</span>
                    <span className="font-medium">{transferCurrentAssignment.department_name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(
                      "font-medium",
                      formData.to_department_id && transferCurrentAssignment.department_id !== formData.to_department_id && "text-green-600 dark:text-green-400"
                    )}>
                      {toDeptName || "—"}
                    </span>
                  </div>
                  {/* Position Change */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-muted-foreground">{t("workforce.modules.transactions.form.transfer.position", "Position")}:</span>
                    <span className="font-medium">{transferCurrentAssignment.position_title}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(
                      "font-medium",
                      formData.to_position_id && "text-green-600 dark:text-green-400"
                    )}>
                      {toPositionTitle || "—"}
                    </span>
                  </div>
                  {/* Pay Group Change */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-muted-foreground">{t("workforce.modules.transactions.form.transfer.payGroup", "Pay Group")}:</span>
                    <span className="font-medium">{transferCurrentAssignment.pay_group_name || "—"}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(
                      "font-medium",
                      formData.pay_group_id && transferCurrentAssignment.pay_group_id !== formData.pay_group_id && "text-green-600 dark:text-green-400"
                    )}>
                      {toPayGroupName || t("common.noChange", "(No change)")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      case "SECONDMENT":
        return (
          <>
            {/* Primary Position to Suspend */}
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.secondment.suspendedPosition", "Position to Suspend")} *</Label>
              <Select
                value={formData.suspended_position_id || ""}
                onValueChange={(v) => setFormData({ ...formData, suspended_position_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.secondment.selectPositionToSuspend", "Select current position to suspend")} />
                </SelectTrigger>
                <SelectContent>
                  {employeePositions.map((ep) => (
                    <SelectItem key={ep.position_id} value={ep.position_id}>
                      {ep.position.title} ({ep.position.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("workforce.modules.transactions.form.secondment.suspendedPositionHint", "This position will be marked as suspended during the secondment")}
              </p>
            </div>

            {/* Secondment Position */}
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.secondment.secondmentPosition", "Secondment Position")} *</Label>
              <Select
                value={formData.secondment_position_id || ""}
                onValueChange={(v) => setFormData({ ...formData, secondment_position_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Seat Availability Status for Secondment */}
              {formData.secondment_position_id && (
                <div className={cn(
                  "rounded-lg border p-3 mt-2",
                  destinationSeatStatus.isLoading 
                    ? "border-muted bg-muted/30"
                    : destinationSeatStatus.hasAvailableSeat 
                      ? "border-green-500/30 bg-green-50 dark:bg-green-900/20"
                      : "border-destructive bg-destructive/10"
                )}>
                  {destinationSeatStatus.isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("workforce.modules.transactions.form.transfer.checkingSeat", "Checking seat availability...")}
                    </div>
                  ) : destinationSeatStatus.hasAvailableSeat ? (
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                      <Armchair className="h-4 w-4" />
                      {t("workforce.modules.transactions.form.transfer.seatsAvailable", "{{count}} seat(s) available").replace("{{count}}", String(destinationSeatStatus.availableSeats))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      {destinationSeatStatus.errorMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Secondment Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.secondment.startDate", "Secondment Start Date")} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.secondment_start_date
                        ? formatDateForDisplay(formData.secondment_start_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.secondment_start_date ? new Date(formData.secondment_start_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          secondment_start_date: date ? toDateString(date) : undefined,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.secondment.endDate", "Expected End Date")} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.secondment_end_date
                        ? formatDateForDisplay(formData.secondment_end_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.secondment_end_date ? new Date(formData.secondment_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          secondment_end_date: date ? toDateString(date) : undefined,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Secondment Reason */}
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.secondment.reason", "Secondment Reason")}</Label>
              <Select
                value={formData.secondment_reason_id || ""}
                onValueChange={(v) => setFormData({ ...formData, secondment_reason_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {secondmentReasons.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case "TERMINATION":
        return (
          <>
            {/* Position Selection for Termination */}
            {employeePositions.length > 0 && (
              <div className="space-y-3">
                <Label>{t("workforce.modules.transactions.form.termination.positionsToTerminate", "Positions to Terminate")} *</Label>
                
                {/* Terminate All Option */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.terminate_all_positions || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // Select all position IDs when toggling on
                        setFormData({ 
                          ...formData, 
                          terminate_all_positions: true,
                          terminated_position_ids: employeePositions.map(ep => ep.position_id)
                        });
                      } else {
                        setFormData({ 
                          ...formData, 
                          terminate_all_positions: false,
                          terminated_position_ids: []
                        });
                      }
                    }}
                  />
                  <Label className="font-normal">
                    {t("workforce.modules.transactions.form.termination.terminateAllPositions", "Terminate all positions")}
                  </Label>
                </div>

                {/* Individual Position Selection */}
                {!formData.terminate_all_positions && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <p className="text-sm text-muted-foreground">
                      {t("workforce.modules.transactions.form.termination.selectPositionsNote", "Select specific positions to terminate:")}
                    </p>
                    {employeePositions.map((ep) => (
                      <div key={ep.position_id} className="flex items-center space-x-2">
                        <Switch
                          checked={(formData.terminated_position_ids || []).includes(ep.position_id)}
                          onCheckedChange={(checked) => {
                            const currentIds = formData.terminated_position_ids || [];
                            if (checked) {
                              setFormData({
                                ...formData,
                                terminated_position_ids: [...currentIds, ep.position_id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                terminated_position_ids: currentIds.filter(id => id !== ep.position_id)
                              });
                            }
                          }}
                        />
                        <Label className="font-normal">
                          {ep.position.title} ({ep.position.code})
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {employeePositions.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {t("workforce.modules.transactions.form.termination.multiplePositionsNote", "Employee has multiple positions. Select which positions to terminate.")}
                  </p>
                )}
              </div>
            )}
            
            {/* Show message if employee selected but no positions */}
            {formData.employee_id && employeePositions.length === 0 && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {t("workforce.modules.transactions.form.termination.noPositions", "No active positions found for this employee.")}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.termination.terminationType")}</Label>
                <Select
                  value={formData.termination_type || ""}
                  onValueChange={(v) => setFormData({ ...formData, termination_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntary">{t("workforce.modules.transactions.form.termination.voluntary")}</SelectItem>
                    <SelectItem value="involuntary">{t("workforce.modules.transactions.form.termination.involuntary")}</SelectItem>
                    <SelectItem value="retirement">{t("workforce.modules.transactions.form.termination.retirement")}</SelectItem>
                    <SelectItem value="end_of_contract">{t("workforce.modules.transactions.form.termination.endOfContract")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.termination.terminationReason")}</Label>
                <Select
                  value={formData.termination_reason_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, termination_reason_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                  </SelectTrigger>
                  <SelectContent>
                    {terminationReasons.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.termination.lastWorkingDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.last_working_date
                        ? formatDateForDisplay(formData.last_working_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.last_working_date ? new Date(formData.last_working_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          last_working_date: date ? toDateString(date) : undefined,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  checked={formData.exit_interview_completed || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, exit_interview_completed: checked })
                  }
                />
                <Label>{t("workforce.modules.transactions.form.termination.exitInterviewCompleted")}</Label>
              </div>
            </div>
          </>
        );

      case "SALARY_CHANGE": {
        // Filter to only show salaried positions
        const salariedPositions = employeePositions.filter(ep => !ep.rate_type || ep.rate_type === 'salaried');
        
        return (
          <>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.salaryChange.position", "Position")}</Label>
              <Select
                value={formData.position_id || ""}
                onValueChange={(v) => setFormData({ ...formData, position_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                </SelectTrigger>
                <SelectContent>
                  {salariedPositions.length > 0 
                    ? salariedPositions.map((ep) => (
                        <SelectItem key={ep.position_id} value={ep.position_id}>
                          {ep.position?.title} ({ep.position?.code})
                        </SelectItem>
                      ))
                    : positions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title} ({p.code})
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.salaryChange.reason", "Reason for Change")}</Label>
              <Select
                value={formData.promotion_reason_id || ""}
                onValueChange={(v) => setFormData({ ...formData, promotion_reason_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {promotionReasons.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 border border-border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {t("workforce.modules.transactions.form.salaryChange.compensationNote", "After saving, use the 'Manage Compensation' button to add or modify pay elements for this change.")}
              </p>
            </div>
          </>
        );
      }

      case "RATE_CHANGE": {
        // Filter to only show hourly/daily positions
        const ratePositions = employeePositions.filter(ep => ep.rate_type === 'hourly' || ep.rate_type === 'daily');
        const selectedPosition = ratePositions.find(ep => ep.position_id === formData.position_id);
        const rateType = selectedPosition?.rate_type || 'hourly';
        const currentRate = selectedPosition?.hourly_rate;
        const currency = selectedPosition?.compensation_currency || 'USD';
        
        const getRateTypeLabel = (type: string) => {
          return type === 'daily' 
            ? t("workforce.modules.transactions.form.rateChange.dailyRate", "Daily Rate Change")
            : t("workforce.modules.transactions.form.rateChange.hourlyRate", "Hourly Rate Change");
        };
        
        const getRateUnit = (type: string) => {
          return type === 'daily'
            ? t("workforce.modules.transactions.form.rateChange.perDay", "/day")
            : t("workforce.modules.transactions.form.rateChange.perHour", "/hour");
        };
        
        return (
          <>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.rateChange.position", "Position")}</Label>
              <Select
                value={formData.position_id || ""}
                onValueChange={(v) => setFormData({ ...formData, position_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                </SelectTrigger>
                <SelectContent>
                  {ratePositions.length > 0 
                    ? ratePositions.map((ep) => (
                        <SelectItem key={ep.position_id} value={ep.position_id}>
                          <div className="flex items-center gap-2">
                            <span>{ep.position?.title} ({ep.position?.code})</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              ep.rate_type === 'hourly' ? 'bg-blue-500/20 text-blue-600' :
                              'bg-orange-500/20 text-orange-600'
                            }`}>
                              {ep.rate_type === 'hourly' ? 'Hourly' : 'Daily'}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    : <div className="px-2 py-1.5 text-sm text-muted-foreground">No hourly/daily positions found</div>
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Rate Type Indicator - shows after position selection */}
            {formData.position_id && selectedPosition && (
              <div className={`p-4 rounded-lg border ${
                rateType === 'hourly' ? 'bg-blue-500/10 border-blue-500/30' :
                'bg-orange-500/10 border-orange-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      rateType === 'hourly' ? 'text-blue-600 dark:text-blue-400' :
                      'text-orange-600 dark:text-orange-400'
                    }`}>
                      {getRateTypeLabel(rateType)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("workforce.modules.transactions.form.rateChange.currentRateInfo", "Current rate information")}
                    </p>
                  </div>
                  {currentRate ? (
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {currency} {currentRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{getRateUnit(rateType)}</p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {t("workforce.modules.transactions.form.rateChange.noCurrentRate", "No rate set")}
                      </p>
                    </div>
                  )}
                </div>
                {rateType === 'hourly' && selectedPosition.standard_hours_per_week && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("workforce.modules.transactions.form.rateChange.standardHours", "Standard hours")}: {selectedPosition.standard_hours_per_week} {t("workforce.modules.transactions.form.rateChange.hoursPerWeek", "hrs/week")}
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.rateChange.reason", "Reason for Change")}</Label>
              <Select
                value={formData.promotion_reason_id || ""}
                onValueChange={(v) => setFormData({ ...formData, promotion_reason_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {promotionReasons.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 border border-border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {t("workforce.modules.transactions.form.rateChange.compensationNote", "After saving, use the 'Manage Compensation' button to add or modify pay elements for this change.")}
              </p>
            </div>
          </>
        );
      }

      case "DEMOTION":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.demotion.fromPosition", "From Position")}</Label>
                <Select
                  value={formData.from_position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, from_position_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title} ({p.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.demotion.toPosition", "To Position")}</Label>
                <Select
                  value={formData.to_position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, to_position_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectPosition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title} ({p.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.demotion.reason", "Demotion Reason")}</Label>
              <Select
                value={formData.demotion_reason_id || ""}
                onValueChange={(v) => setFormData({ ...formData, demotion_reason_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {demotionReasons.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_voluntary_demotion || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_voluntary_demotion: checked })}
              />
              <Label>{t("workforce.modules.transactions.form.demotion.voluntary", "Voluntary Demotion")}</Label>
            </div>
          </>
        );

      case "RETIREMENT":
        return (
          <>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.retirement.type", "Retirement Type")}</Label>
              <Select
                value={formData.retirement_type_id || ""}
                onValueChange={(v) => setFormData({ ...formData, retirement_type_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {retirementTypes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={formData.pension_eligible || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, pension_eligible: checked })}
                />
                <Label>{t("workforce.modules.transactions.form.retirement.pensionEligible", "Pension Eligible")}</Label>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={formData.exit_interview_completed || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, exit_interview_completed: checked })}
                />
                <Label>{t("workforce.modules.transactions.form.retirement.exitInterview", "Exit Interview Completed")}</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.retirement.finalSettlementDate", "Final Settlement Date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.final_settlement_date
                      ? formatDateForDisplay(formData.final_settlement_date, "PPP")
                      : t("workforce.modules.transactions.form.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.final_settlement_date ? new Date(formData.final_settlement_date) : undefined}
                    onSelect={(date) => setFormData({ ...formData, final_settlement_date: date ? toDateString(date) : undefined })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        );

      case "STATUS_CHANGE":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.statusChange.toStatus", "New Employment Status")}</Label>
                <Select
                  value={formData.to_employment_status_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, to_employment_status_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectStatus", "Select status")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentStatuses.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.statusChange.newWeeklyHours", "New Weekly Hours")}</Label>
                <Input
                  type="number"
                  value={formData.new_weekly_hours || ""}
                  onChange={(e) => setFormData({ ...formData, new_weekly_hours: parseFloat(e.target.value) || null })}
                  placeholder="40"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.benefits_change_required || false}
                onCheckedChange={(checked) => setFormData({ ...formData, benefits_change_required: checked })}
              />
              <Label>{t("workforce.modules.transactions.form.statusChange.benefitsChange", "Benefits Change Required")}</Label>
            </div>
          </>
        );

      case "CONTRACT_EXTENSION":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.contractExtension.currentEnd", "Current Contract End")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.current_contract_end_date
                        ? formatDateForDisplay(formData.current_contract_end_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.current_contract_end_date ? new Date(formData.current_contract_end_date) : undefined}
                      onSelect={(date) => setFormData({ ...formData, current_contract_end_date: date ? toDateString(date) : undefined })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.contractExtension.newEnd", "New Contract End")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.new_contract_end_date
                        ? formatDateForDisplay(formData.new_contract_end_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.new_contract_end_date ? new Date(formData.new_contract_end_date) : undefined}
                      onSelect={(date) => setFormData({ ...formData, new_contract_end_date: date ? toDateString(date) : undefined })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.contractExtension.reason", "Extension Reason")}</Label>
              <Select
                value={formData.contract_extension_reason_id || ""}
                onValueChange={(v) => setFormData({ ...formData, contract_extension_reason_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                </SelectTrigger>
                <SelectContent>
                  {contractExtensionReasons.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case "CONTRACT_CONVERSION":
        return (
          <>
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.contractConversion.newContractType", "New Contract Type")}</Label>
              <Select
                value={formData.new_contract_type_id || ""}
                onValueChange={(v) => setFormData({ ...formData, new_contract_type_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.probation_applies || false}
                onCheckedChange={(checked) => setFormData({ ...formData, probation_applies: checked })}
              />
              <Label>{t("workforce.modules.transactions.form.contractConversion.probationApplies", "New Probation Period Applies")}</Label>
            </div>
            {formData.probation_applies && (
              <div className="space-y-2 ml-6 pl-4 border-l-2 border-primary/30">
                <Label>{t("workforce.modules.transactions.form.hire.probationEndDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.probation_end_date
                        ? formatDateForDisplay(formData.probation_end_date, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.probation_end_date ? new Date(formData.probation_end_date) : undefined}
                      onSelect={(date) => setFormData({ ...formData, probation_end_date: date ? toDateString(date) : undefined })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {t("workforce.modules.transactions.form.fillDetails")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Common Fields */}
          {transactionType !== "HIRE" && (
            <>
              <div className="space-y-2">
                <Label>{t("common.employee")} *</Label>
                <Select
                  value={formData.employee_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectEmployee")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.full_name || e.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Context Card - shows current employment info */}
              {formData.employee_id && (
                <EmployeeContextCard 
                  employeeId={formData.employee_id} 
                  className="mt-2"
                  compact
                />
              )}
            </>
          )}

          <div className="space-y-2">
            <Label>{t("workforce.modules.transactions.effectiveDate")} *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.effective_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.effective_date
                    ? formatDateForDisplay(formData.effective_date, "PPP")
                    : t("workforce.modules.transactions.form.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.effective_date ? new Date(formData.effective_date) : undefined}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      effective_date: date ? toDateString(date) : undefined,
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Type-specific fields */}
          {renderTypeSpecificFields()}

          {/* Transaction Impact Summary - shows what will change */}
          {formData.employee_id && transactionType && 
           ["PROMOTION", "DEMOTION", "TRANSFER", "STATUS_CHANGE", "CONTRACT_EXTENSION", "CONTRACT_CONVERSION", "RETIREMENT"].includes(transactionType) && (
            <TransactionImpactSummary
              transactionType={transactionType}
              formData={{
                from_position_id: employeePositions[0]?.position_id,
                to_position_id: formData.to_position_id,
                to_company_id: formData.to_company_id,
                to_department_id: formData.to_department_id,
                pay_group_id: formData.pay_group_id,
                new_weekly_hours: formData.new_weekly_hours,
                benefits_change_required: formData.benefits_change_required,
                current_contract_end_date: formData.current_contract_end_date,
                new_contract_end_date: formData.new_contract_end_date,
                probation_applies: formData.probation_applies,
                pension_eligible: formData.pension_eligible,
              }}
              positions={positions}
              departments={departments}
              companies={companies}
              payGroups={payGroups}
              currentAssignment={transferCurrentAssignment}
              seatStatus={
                formData.to_position_id
                  ? {
                      hasAvailableSeat: destinationSeatStatus.hasAvailableSeat,
                      availableSeats: destinationSeatStatus.availableSeats,
                    }
                  : undefined
              }
              className="mt-4"
            />
          )}

          {/* Approval Status */}
          <div className="space-y-2">
            <Label>{t("workforce.modules.transactions.form.approvalStatus", "Approval Status")} *</Label>
            <Select
              value={formData.status || "draft"}
              onValueChange={(v) => setFormData({ ...formData, status: v as TransactionStatus })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("workforce.modules.transactions.form.selectApprovalStatus", "Select approval status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t("workforce.modules.transactions.status.draft", "Draft")}</SelectItem>
                <SelectItem value="approved">{t("workforce.modules.transactions.status.approved", "Approved")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Common fields continued */}
          <div className="space-y-2">
            <Label>{t("common.notes")}</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("workforce.modules.transactions.form.notesPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
            {isLoadingWorkflowSetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : workflowRequired ? (
              <>
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm">
                  {t("workforce.modules.transactions.workflowRequired")}
                </span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm">
                  {t("workforce.modules.transactions.noWorkflowRequired")}
                </span>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <div>
            {formData.employee_id && formData.position_id && transactionType !== "TERMINATION" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompensationDialogOpen(true)}
                className="gap-2"
              >
                <DollarSign className="h-4 w-4" />
                {t("workforce.modules.transactions.form.setCompensation")}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={
                isLoading || 
                (["TRANSFER", "PROMOTION"].includes(transactionType || "") && (
                  destinationSeatStatus.isLoading || 
                  (formData.to_position_id && !destinationSeatStatus.hasAvailableSeat)
                )) ||
                (transactionType === "SECONDMENT" && (
                  destinationSeatStatus.isLoading || 
                  (formData.secondment_position_id && !destinationSeatStatus.hasAvailableSeat)
                ))
              }
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingTransaction ? t("workforce.modules.transactions.form.updateTransaction") : t("workforce.modules.transactions.form.createTransaction")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Compensation Dialog */}
      {formData.employee_id && formData.position_id && transactionType && (
        <TransactionEmployeeCompensationDialog
          open={compensationDialogOpen}
          onOpenChange={setCompensationDialogOpen}
          employeeId={formData.employee_id}
          employeeName={employees.find(e => e.id === formData.employee_id)?.full_name || ""}
          positionId={formData.position_id}
          positionTitle={positions.find(p => p.id === formData.position_id)?.title || ""}
          companyId={formData.company_id || ""}
          transactionType={transactionType}
          defaultStartDate={
            transactionType === "ACTING" 
              ? formData.acting_start_date || formData.effective_date || "" 
              : formData.effective_date || ""
          }
          defaultEndDate={transactionType === "ACTING" ? formData.acting_end_date : undefined}
          onSuccess={() => {}}
        />
      )}
    </Dialog>
  );
}
