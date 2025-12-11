import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
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
    effective_date: new Date().toISOString().split("T")[0],
    status: "draft",
    requires_workflow: false,
    notes: "",
  });

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
        effective_date: new Date().toISOString().split("T")[0],
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
    const submitData = {
      ...formData,
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
    const typeNames: Record<TransactionType, string> = {
      HIRE: "New Hire",
      CONFIRMATION: "Confirmation",
      PROBATION_EXT: "Probation Extension",
      ACTING: "Acting Assignment",
      PROMOTION: "Promotion",
      TRANSFER: "Transfer",
      TERMINATION: "Termination",
    };
    const prefix = existingTransaction ? "Edit" : "Create";
    return `${prefix} ${typeNames[transactionType!] || "Transaction"}`;
  };

  const renderTypeSpecificFields = () => {
    switch (transactionType) {
      case "HIRE":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hire Type</Label>
                <Select
                  value={formData.hire_type_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, hire_type_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hire type" />
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
                <Label>Employee Type</Label>
                <Select
                  value={formData.employment_type_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, employment_type_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee type" />
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
                <Label>Contract Type</Label>
                <Select
                  value={formData.contract_type_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, contract_type_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
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
                <Label>Probation End Date</Label>
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
                        ? format(new Date(formData.probation_end_date), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.probation_end_date ? new Date(formData.probation_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          probation_end_date: date?.toISOString().split("T")[0],
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={formData.position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, position_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
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
                <Label>Department</Label>
                <Select
                  value={formData.department_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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
              <Label>Company</Label>
              <Select
                value={formData.company_id || ""}
                onValueChange={(v) => setFormData({ ...formData, company_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
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
          </>
        );

      case "CONFIRMATION":
        return (
          <div className="space-y-2">
            <Label>Confirmation Date</Label>
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
                    ? format(new Date(formData.confirmation_date), "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.confirmation_date ? new Date(formData.confirmation_date) : undefined}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      confirmation_date: date?.toISOString().split("T")[0],
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
                <Label>Original End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.original_probation_end_date
                        ? format(new Date(formData.original_probation_end_date), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.original_probation_end_date ? new Date(formData.original_probation_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          original_probation_end_date: date?.toISOString().split("T")[0],
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>New End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.new_probation_end_date
                        ? format(new Date(formData.new_probation_end_date), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.new_probation_end_date ? new Date(formData.new_probation_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          new_probation_end_date: date?.toISOString().split("T")[0],
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Extension Days</Label>
                <Input
                  type="number"
                  value={formData.extension_days || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, extension_days: parseInt(e.target.value) || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Extension Reason</Label>
                <Select
                  value={formData.extension_reason_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, extension_reason_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
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
              <Label>Acting Position</Label>
              <Select
                value={formData.acting_position_id || ""}
                onValueChange={(v) => setFormData({ ...formData, acting_position_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
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
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.acting_start_date
                        ? format(new Date(formData.acting_start_date), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.acting_start_date ? new Date(formData.acting_start_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          acting_start_date: date?.toISOString().split("T")[0],
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.acting_end_date
                        ? format(new Date(formData.acting_end_date), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.acting_end_date ? new Date(formData.acting_end_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          acting_end_date: date?.toISOString().split("T")[0],
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Acting Reason</Label>
                <Select
                  value={formData.acting_reason_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, acting_reason_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
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
              <div className="space-y-2">
                <Label>Acting Allowance</Label>
                <Input
                  type="number"
                  value={formData.acting_allowance || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, acting_allowance: parseFloat(e.target.value) || null })
                  }
                />
              </div>
            </div>
          </>
        );

      case "PROMOTION":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Position</Label>
                <Select
                  value={formData.from_position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, from_position_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
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
                <Label>To Position</Label>
                <Select
                  value={formData.to_position_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, to_position_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
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
              <Label>Promotion Reason</Label>
              <Select
                value={formData.promotion_reason_id || ""}
                onValueChange={(v) => setFormData({ ...formData, promotion_reason_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
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
                <Label>Salary Adjustment</Label>
                <Input
                  type="number"
                  value={formData.salary_adjustment || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, salary_adjustment: parseFloat(e.target.value) || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <Select
                  value={formData.salary_adjustment_type || ""}
                  onValueChange={(v) => setFormData({ ...formData, salary_adjustment_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
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
                <Label>From Department</Label>
                <Select
                  value={formData.from_department_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, from_department_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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
                <Label>To Department</Label>
                <Select
                  value={formData.to_department_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, to_department_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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
                <Label>From Company</Label>
                <Select
                  value={formData.from_company_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, from_company_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
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
                <Label>To Company</Label>
                <Select
                  value={formData.to_company_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, to_company_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
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
              <Label>Transfer Reason</Label>
              <Select
                value={formData.transfer_reason_id || ""}
                onValueChange={(v) => setFormData({ ...formData, transfer_reason_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
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
                <Label>Termination Type</Label>
                <Select
                  value={formData.termination_type || ""}
                  onValueChange={(v) => setFormData({ ...formData, termination_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntary">Voluntary</SelectItem>
                    <SelectItem value="involuntary">Involuntary</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="end_of_contract">End of Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Termination Reason</Label>
                <Select
                  value={formData.termination_reason_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, termination_reason_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
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
                <Label>Last Working Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.last_working_date
                        ? format(new Date(formData.last_working_date), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.last_working_date ? new Date(formData.last_working_date) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          last_working_date: date?.toISOString().split("T")[0],
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
                <Label>Exit Interview Completed</Label>
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
            Fill in the transaction details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Common Fields */}
          {transactionType !== "HIRE" && (
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select
                value={formData.employee_id || ""}
                onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
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
            <Label>Effective Date *</Label>
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
                    ? format(new Date(formData.effective_date), "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.effective_date ? new Date(formData.effective_date) : undefined}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      effective_date: date?.toISOString().split("T")[0],
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
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
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
            <Label>Requires Workflow Approval</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingTransaction ? "Update" : "Create"} Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
