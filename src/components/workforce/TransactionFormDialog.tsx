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
}

interface Department {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
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
  const [transactionTypeId, setTransactionTypeId] = useState<string>("");

  // Lookup values
  const [hireTypes, setHireTypes] = useState<LookupValue[]>([]);
  const [employeeTypes, setEmployeeTypes] = useState<LookupValue[]>([]);
  const [contractTypes, setContractTypes] = useState<LookupValue[]>([]);
  const [extensionReasons, setExtensionReasons] = useState<LookupValue[]>([]);
  const [promotionReasons, setPromotionReasons] = useState<LookupValue[]>([]);
  const [transferReasons, setTransferReasons] = useState<LookupValue[]>([]);
  const [actingReasons, setActingReasons] = useState<LookupValue[]>([]);
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
    ] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").order("full_name"),
      supabase.from("positions").select("id, title, code").eq("is_active", true).order("title"),
      supabase.from("departments").select("id, name").eq("is_active", true).order("name"),
      supabase.from("companies").select("id, name").eq("is_active", true).order("name"),
    ]);

    setEmployees(employeesRes.data || []);
    setPositions(positionsRes.data || []);
    setDepartments(departmentsRes.data || []);
    setCompanies(companiesRes.data || []);

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
        terminationReasonsData,
      ] = await Promise.all([
        fetchLookupValues("hire_type"),
        fetchLookupValues("employee_type"),
        fetchLookupValues("contract_type"),
        fetchLookupValues("probation_extension_reason"),
        fetchLookupValues("promotion_reason"),
        fetchLookupValues("transfer_reason"),
        fetchLookupValues("acting_reason"),
        fetchLookupValues("termination_reason"),
      ]);

      setHireTypes(hireTypesData);
      setEmployeeTypes(employeeTypesData);
      setContractTypes(contractTypesData);
      setExtensionReasons(extensionReasonsData);
      setPromotionReasons(promotionReasonsData);
      setTransferReasons(transferReasonsData);
      setActingReasons(actingReasonsData);
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
                <Label>{t("common.position")}</Label>
                <Select
                  value={formData.position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, position_id: v })}
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
              <Label>{t("common.department")}</Label>
              <Select
                value={formData.department_id || ""}
                onValueChange={(v) => setFormData({ ...formData, department_id: v })}
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
          </>
        );

      case "CONFIRMATION":
        return (
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
        );

      case "PROBATION_EXT":
        return (
          <>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.promotion.salaryAdjustment")}</Label>
                <Input
                  type="number"
                  value={formData.salary_adjustment || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, salary_adjustment: parseFloat(e.target.value) || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.promotion.adjustmentType")}</Label>
                <Select
                  value={formData.salary_adjustment_type || ""}
                  onValueChange={(v) => setFormData({ ...formData, salary_adjustment_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">{t("workforce.modules.transactions.form.promotion.percentage")}</SelectItem>
                    <SelectItem value="fixed">{t("workforce.modules.transactions.form.promotion.fixedAmount")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case "TRANSFER":
        return (
          <>
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
          </>
        );

      case "TERMINATION":
        return (
          <>
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
