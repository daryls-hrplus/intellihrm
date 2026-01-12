import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  ArrowRight,
  Check,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { formatDateForDisplay, toDateString, getTodayString } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { BulkEmployeeSelector, BulkEmployee } from "./BulkEmployeeSelector";
import { BulkTransferMappingStep } from "./BulkTransferMappingStep";
import { useEmployeeTransactions, LookupValue } from "@/hooks/useEmployeeTransactions";
import { useAuth } from "@/contexts/AuthContext";

interface BulkTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Company {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  company_id: string | null;
}

interface PayGroup {
  id: string;
  name: string;
  code: string;
}

type WizardStep = "source" | "employees" | "destination" | "mapping" | "review" | "executing";

const STEPS: WizardStep[] = ["source", "employees", "destination", "mapping", "review"];

export function BulkTransferDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkTransferDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { fetchLookupValues } = useEmployeeTransactions();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>("source");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionResults, setExecutionResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });

  // Data
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);
  const [transferReasons, setTransferReasons] = useState<LookupValue[]>([]);

  // Form state
  const [sourceCompanyId, setSourceCompanyId] = useState<string>("");
  const [sourceDepartmentId, setSourceDepartmentId] = useState<string>("");
  const [selectedEmployees, setSelectedEmployees] = useState<BulkEmployee[]>([]);
  const [destinationCompanyId, setDestinationCompanyId] = useState<string>("");
  const [destinationDepartmentId, setDestinationDepartmentId] = useState<string>("");
  const [destinationPayGroupId, setDestinationPayGroupId] = useState<string>("");
  const [transferReasonId, setTransferReasonId] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>(getTodayString());
  const [notes, setNotes] = useState<string>("");
  const [requiresWorkflow, setRequiresWorkflow] = useState(false);
  const [mappingMode, setMappingMode] = useState<"same" | "individual">("individual");

  // Load initial data
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  // Load destination departments and pay groups when destination company changes
  useEffect(() => {
    if (destinationCompanyId) {
      loadDestinationDepartments();
      loadDestinationPayGroups();
    } else {
      setPayGroups([]);
      setDestinationPayGroupId("");
    }
  }, [destinationCompanyId]);

  const loadInitialData = async () => {
    const companiesRes = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    setCompanies(companiesRes.data || []);

    // Load transfer reasons
    const reasons = await fetchLookupValues("transfer_reason");
    setTransferReasons(reasons);
  };

  const loadDestinationPayGroups = async () => {
    const { data } = await supabase
      .from("pay_groups")
      .select("id, name, code")
      .eq("company_id", destinationCompanyId)
      .eq("is_active", true)
      .order("name");

    setPayGroups(data || []);
    setDestinationPayGroupId(""); // Reset selection when company changes
  };

  const loadDestinationDepartments = async () => {
    const { data } = await supabase
      .from("departments")
      .select("id, name, company_id")
      .eq("company_id", destinationCompanyId)
      .eq("is_active", true)
      .order("name");

    setDepartments(data || []);
  };

  const resetForm = () => {
    setCurrentStep("source");
    setSourceCompanyId("");
    setSourceDepartmentId("");
    setSelectedEmployees([]);
    setDestinationCompanyId("");
    setDestinationDepartmentId("");
    setDestinationPayGroupId("");
    setTransferReasonId("");
    setEffectiveDate(getTodayString());
    setNotes("");
    setRequiresWorkflow(false);
    setMappingMode("individual");
    setIsExecuting(false);
    setExecutionProgress(0);
    setExecutionResults({ success: 0, failed: 0, errors: [] });
  };

  const handleClose = () => {
    if (!isExecuting) {
      resetForm();
      onOpenChange(false);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case "source":
        return !!sourceCompanyId;
      case "employees":
        return selectedEmployees.length > 0;
      case "destination":
        return !!destinationCompanyId && !!transferReasonId && !!effectiveDate;
      case "mapping":
        // In individual mode, all employees must have department and position
        if (mappingMode === "individual") {
          return selectedEmployees.every(e => e.to_department_id && e.to_position_id);
        }
        // In same mode, default department must be set
        return !!destinationDepartmentId && destinationDepartmentId !== "_keep";
      case "review":
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const executeTransfer = async () => {
    if (!user) {
      toast.error(t("common.notAuthenticated"));
      return;
    }

    setCurrentStep("executing");
    setIsExecuting(true);
    setExecutionProgress(0);
    setExecutionResults({ success: 0, failed: 0, errors: [] });

    // Get the BULK_TRANSFER transaction type
    const { data: bulkTransferType } = await supabase
      .from("lookup_values")
      .select("id")
      .eq("category", "transaction_type")
      .eq("code", "BULK_TRANSFER")
      .single();

    if (!bulkTransferType) {
      toast.error("Bulk Transfer transaction type not found");
      setIsExecuting(false);
      return;
    }

    // Generate a group ID to link all transactions
    const bulkGroupId = crypto.randomUUID();
    const totalEmployees = selectedEmployees.length;
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedEmployees.length; i++) {
      const employee = selectedEmployees[i];

      try {
        // Generate transaction number: BULK-YYYYMMDD-XXXX-NNN
        const dateStr = effectiveDate.replace(/-/g, "");
        const shortGroupId = bulkGroupId.slice(0, 4).toUpperCase();
        const transactionNumber = `BULK-${dateStr}-${shortGroupId}-${String(i + 1).padStart(3, "0")}`;

        // Determine destination department and position based on mapping mode
        const toDepartmentId = mappingMode === "individual" 
          ? employee.to_department_id 
          : (destinationDepartmentId && destinationDepartmentId !== "_keep" ? destinationDepartmentId : null);
        
        const toPositionId = mappingMode === "individual" 
          ? employee.to_position_id 
          : null;

        // Create the transaction
        const { error } = await supabase
          .from("employee_transactions")
          .insert([{
            transaction_number: transactionNumber,
            transaction_type_id: bulkTransferType.id,
            employee_id: employee.id,
            effective_date: effectiveDate,
            status: requiresWorkflow ? "pending_approval" : "draft",
            notes: notes || null,
            from_company_id: employee.company_id,
            to_company_id: destinationCompanyId,
            from_department_id: employee.department_id,
            to_department_id: toDepartmentId,
            from_position_id: employee.position_id,
            to_position_id: toPositionId,
            transfer_reason_id: transferReasonId || null,
            pay_group_id: destinationPayGroupId && destinationPayGroupId !== "_none" ? destinationPayGroupId : null,
            requires_workflow: requiresWorkflow,
            created_by: user.id,
            is_bulk_transaction: true,
            bulk_transaction_group_id: bulkGroupId,
            bulk_transaction_count: totalEmployees,
          }]);

        if (error) throw error;

        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`${employee.full_name || employee.email}: ${err.message || "Unknown error"}`);
      }

      // Update progress
      setExecutionProgress(Math.round(((i + 1) / totalEmployees) * 100));
      setExecutionResults({ success: successCount, failed: failedCount, errors });
    }

    setIsExecuting(false);

    if (successCount > 0) {
      toast.success(
        t("workforce.modules.transactions.bulkTransfer.successMessage", {
          count: successCount,
        })
      );
      onSuccess();
    }

    if (failedCount > 0) {
      toast.error(
        t("workforce.modules.transactions.bulkTransfer.failedMessage", {
          count: failedCount,
        })
      );
    }
  };

  const getStepTitle = (): string => {
    switch (currentStep) {
      case "source":
        return t("workforce.modules.transactions.bulkTransfer.step1Title");
      case "employees":
        return t("workforce.modules.transactions.bulkTransfer.step2Title");
      case "destination":
        return t("workforce.modules.transactions.bulkTransfer.step3Title");
      case "mapping":
        return t("workforce.modules.transactions.bulkTransfer.step5Title");
      case "review":
        return t("workforce.modules.transactions.bulkTransfer.step6Title");
      case "executing":
        return t("workforce.modules.transactions.bulkTransfer.executing");
      default:
        return "";
    }
  };

  const renderStepIndicator = () => {
    const stepIndex = STEPS.indexOf(currentStep);

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                index < stepIndex
                  ? "bg-primary text-primary-foreground"
                  : index === stepIndex
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < stepIndex ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-1",
                  index < stepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "source":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.bulkTransfer.sourceCompany")} *</Label>
              <Select value={sourceCompanyId} onValueChange={setSourceCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectCompany")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.bulkTransfer.filterByDepartment")}</Label>
              <Select value={sourceDepartmentId} onValueChange={setSourceDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common.allDepartments")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">{t("common.allDepartments")}</SelectItem>
                  {departments
                    .filter((d) => d.company_id === sourceCompanyId)
                    .map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "employees":
        return (
          <BulkEmployeeSelector
            sourceCompanyId={sourceCompanyId}
            sourceDepartmentId={sourceDepartmentId && sourceDepartmentId !== "_all" ? sourceDepartmentId : null}
            selectedEmployees={selectedEmployees}
            onSelectionChange={setSelectedEmployees}
          />
        );

      case "destination":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.bulkTransfer.destinationCompany")} *</Label>
              <Select value={destinationCompanyId} onValueChange={setDestinationCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.form.selectCompany")} />
                </SelectTrigger>
                <SelectContent>
                  {companies
                    .filter((c) => c.id !== sourceCompanyId)
                    .map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mapping Mode Selection */}
            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t("workforce.modules.transactions.bulkTransfer.mappingMode")}
              </Label>
              <RadioGroup
                value={mappingMode}
                onValueChange={(value) => setMappingMode(value as "same" | "individual")}
                className="space-y-2"
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="font-normal cursor-pointer">
                    <div className="font-medium">{t("workforce.modules.transactions.bulkTransfer.mapIndividually")}</div>
                    <div className="text-xs text-muted-foreground">
                      {t("workforce.modules.transactions.bulkTransfer.step5Title")}
                    </div>
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="same" id="same" />
                  <Label htmlFor="same" className="font-normal cursor-pointer">
                    <div className="font-medium">{t("workforce.modules.transactions.bulkTransfer.sameForAll")}</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Default Department (shown only in same mode or as optional default) */}
            <div className="space-y-2">
              <Label>
                {t("workforce.modules.transactions.bulkTransfer.defaultDepartment")}
                {mappingMode === "same" && " *"}
              </Label>
              <Select value={destinationDepartmentId} onValueChange={setDestinationDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder={mappingMode === "same" 
                    ? t("workforce.modules.transactions.form.selectDepartment")
                    : t("workforce.modules.transactions.bulkTransfer.keepCurrentMapping")
                  } />
                </SelectTrigger>
                <SelectContent>
                  {mappingMode === "individual" && (
                    <SelectItem value="_keep">{t("workforce.modules.transactions.bulkTransfer.keepCurrentMapping")}</SelectItem>
                  )}
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.form.payGroup")}</Label>
              <Select value={destinationPayGroupId} onValueChange={setDestinationPayGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("workforce.modules.transactions.bulkTransfer.noChange")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">{t("workforce.modules.transactions.bulkTransfer.noChange")}</SelectItem>
                  {payGroups.map((pg) => (
                    <SelectItem key={pg.id} value={pg.id}>
                      {pg.name} ({pg.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.form.transfer.reason")} *</Label>
                <Select value={transferReasonId} onValueChange={setTransferReasonId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.modules.transactions.form.selectReason")} />
                  </SelectTrigger>
                  <SelectContent>
                    {transferReasons.map((reason) => (
                      <SelectItem key={reason.id} value={reason.id}>
                        {reason.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("workforce.modules.transactions.effectiveDate")} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !effectiveDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {effectiveDate
                        ? formatDateForDisplay(effectiveDate, "PPP")
                        : t("workforce.modules.transactions.form.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={effectiveDate ? new Date(effectiveDate) : undefined}
                      onSelect={(date) => setEffectiveDate(date ? toDateString(date) : "")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("common.notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("workforce.modules.transactions.form.notesPlaceholder")}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={requiresWorkflow}
                onCheckedChange={setRequiresWorkflow}
              />
              <Label>{t("workforce.modules.transactions.form.requiresWorkflow")}</Label>
            </div>
          </div>
        );

      case "mapping":
        return (
          <BulkTransferMappingStep
            employees={selectedEmployees}
            destinationCompanyId={destinationCompanyId}
            defaultDepartmentId={destinationDepartmentId}
            onMappingChange={setSelectedEmployees}
          />
        );

      case "review":
        const sourceCompany = companies.find((c) => c.id === sourceCompanyId);
        const destCompany = companies.find((c) => c.id === destinationCompanyId);
        const reason = transferReasons.find((r) => r.id === transferReasonId);

        return (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5 text-primary" />
                {t("workforce.modules.transactions.bulkTransfer.transferSummary")}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("common.from")}:</span>
                  <span className="ml-2 font-medium">{sourceCompany?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("common.to")}:</span>
                  <span className="ml-2 font-medium">{destCompany?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("workforce.modules.transactions.effectiveDate")}:</span>
                  <span className="ml-2 font-medium">{formatDateForDisplay(effectiveDate, "PPP")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("workforce.modules.transactions.form.transfer.reason")}:</span>
                  <span className="ml-2 font-medium">{reason?.name}</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{selectedEmployees.length} {t("workforce.modules.transactions.bulkTransfer.employeesToTransfer")}</span>
                </div>
              </div>
            </div>

            {/* Employee List with Mappings */}
            <div className="space-y-2">
              <Label>{t("workforce.modules.transactions.bulkTransfer.selectedEmployees")}</Label>
              <ScrollArea className="h-[250px] border rounded-lg">
                <div className="divide-y">
                  {/* Header */}
                  <div className="flex items-center gap-4 p-3 bg-muted/50 text-xs font-medium sticky top-0">
                    <div className="flex-1">{t("workforce.common.employee")}</div>
                    <div className="w-48 text-center">{t("workforce.modules.transactions.bulkTransfer.mapping.current")}</div>
                    <div className="w-4"></div>
                    <div className="w-48 text-center">{t("workforce.modules.transactions.bulkTransfer.mapping.newAssignment")}</div>
                  </div>
                  {selectedEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-4 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{employee.full_name || employee.email}</div>
                        <div className="text-xs text-muted-foreground truncate">{employee.email}</div>
                      </div>
                      <div className="w-48 text-center">
                        <div className="text-sm truncate">{employee.position_title || "—"}</div>
                        <div className="text-xs text-muted-foreground truncate">{employee.department_name || "—"}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="w-48 text-center">
                        {mappingMode === "individual" ? (
                          <>
                            <div className="text-sm font-medium text-primary truncate">
                              {employee.to_position_title || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {employee.to_department_name || "—"}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-primary truncate">
                              {destCompany?.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {departments.find(d => d.id === destinationDepartmentId)?.name || "—"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {requiresWorkflow && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  {t("workforce.modules.transactions.bulkTransfer.workflowWarning")}
                </span>
              </div>
            )}
          </div>
        );

      case "executing":
        return (
          <div className="space-y-6 py-8">
            <div className="text-center">
              {isExecuting ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <div className="text-lg font-medium mb-2">
                    {t("workforce.modules.transactions.bulkTransfer.processingTransfers")}
                  </div>
                </>
              ) : (
                <>
                  <Check className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-lg font-medium mb-2">
                    {t("workforce.modules.transactions.bulkTransfer.transferComplete")}
                  </div>
                </>
              )}
            </div>

            <Progress value={executionProgress} className="w-full" />

            <div className="flex justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{executionResults.success}</div>
                <div className="text-muted-foreground">{t("common.successful")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{executionResults.failed}</div>
                <div className="text-muted-foreground">{t("common.failed")}</div>
              </div>
            </div>

            {executionResults.errors.length > 0 && (
              <div className="mt-4">
                <Label className="text-destructive">{t("common.errors")}:</Label>
                <ScrollArea className="h-[100px] mt-2 border rounded-lg p-2">
                  {executionResults.errors.map((error, i) => (
                    <div key={i} className="text-sm text-destructive py-1">
                      {error}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t("workforce.modules.transactions.bulkTransfer.title")}
          </DialogTitle>
          <DialogDescription>
            {getStepTitle()}
          </DialogDescription>
        </DialogHeader>

        {currentStep !== "executing" && renderStepIndicator()}

        <div className="py-4">{renderStepContent()}</div>

        <DialogFooter className="gap-2 sm:gap-0">
          {currentStep !== "executing" && (
            <>
              {currentStep !== "source" && (
                <Button variant="outline" onClick={goBack}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t("common.back")}
                </Button>
              )}
              <Button variant="outline" onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              {currentStep === "review" ? (
                <Button onClick={executeTransfer} disabled={!canProceed()}>
                  <Users className="h-4 w-4 mr-2" />
                  {t("workforce.modules.transactions.bulkTransfer.executeTransfer")}
                </Button>
              ) : (
                <Button onClick={goNext} disabled={!canProceed()}>
                  {t("common.next")}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </>
          )}
          {currentStep === "executing" && !isExecuting && (
            <Button onClick={handleClose}>
              {t("common.close")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
