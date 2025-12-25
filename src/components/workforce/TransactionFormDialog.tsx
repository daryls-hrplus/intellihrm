import { useState, useEffect } from "react";
import { CalendarIcon, Loader2, DollarSign } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
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

  // Form state
  const [formData, setFormData] = useState<Partial<EmployeeTransaction>>({
    effective_date: getTodayString(),
    status: "draft",
    requires_workflow: false,
    notes: "",
  });

  // Compensation dialog state
  const [compensationDialogOpen, setCompensationDialogOpen] = useState(false);

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

  useEffect(() => {
    if (existingTransaction) {
      setFormData(existingTransaction);
    } else {
      setFormData({
        effective_date: getTodayString(),
        status: "draft",
        requires_workflow: false,
        notes: "",
      });
    }
  }, [existingTransaction]);

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
      supabase.from("departments").select("id, name").eq("is_active", true).order("name"),
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
    };

    let success;
    if (existingTransaction) {
      success = await updateTransaction(existingTransaction.id, submitData);
    } else {
      success = await createTransaction(submitData);
    }

    if (success) {
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
          </>
        );

      case "CONFIRMATION":
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
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.transfer.fromCompany")}</Label>
                <Select
                  value={formData.from_company_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, from_company_id: v })}
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
                <Label>{t("workforce.modules.transactions.form.transfer.toCompany")}</Label>
                <Select
                  value={formData.to_company_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, to_company_id: v })}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.transfer.fromDepartment")}</Label>
                <Select
                  value={formData.from_department_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, from_department_id: v })}
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
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.transfer.toDepartment")}</Label>
                <Select
                  value={formData.to_department_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, to_department_id: v })}
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
              <Label>{t("workforce.modules.transactions.form.transfer.transferReason")}</Label>
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
                    : <SelectItem value="" disabled>No hourly/daily positions found</SelectItem>
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

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.requires_workflow || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, requires_workflow: checked })
              }
            />
            <Label>{t("workforce.modules.transactions.form.requiresWorkflow")}</Label>
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
            <Button onClick={handleSubmit} disabled={isLoading}>
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
