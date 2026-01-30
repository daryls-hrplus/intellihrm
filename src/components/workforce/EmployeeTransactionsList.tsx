import { useState, useEffect } from "react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Plus, Eye, Edit, Trash2, PlayCircle, Loader2, DollarSign, ChevronRight, ChevronDown, X, Filter } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionTypePicker } from "./TransactionTypePicker";
import { TransactionModuleFilter } from "./TransactionModuleFilter";
import { TransactionModuleBadge } from "./TransactionModuleBadge";
import { getTypesForModule } from "@/constants/transactionModuleCategories";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useEmployeeTransactions,
  EmployeeTransaction,
  TransactionStatus,
  TransactionType,
  LookupValue,
} from "@/hooks/useEmployeeTransactions";
import { TransactionEmployeeCompensationDialog } from "@/components/compensation/TransactionEmployeeCompensationDialog";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeCompensationRecord {
  id: string;
  pay_element_id: string;
  pay_element?: { name: string; code: string };
  amount: number;
  currency: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  is_override: boolean;
  notes: string | null;
}

interface EmployeeTransactionsListProps {
  companyId?: string;
  departmentId?: string;
  fromDate?: string;
  toDate?: string;
  moduleFilter?: string;
  onModuleFilterChange?: (module: string) => void;
  onCreateNew: (type: string) => void;
  onView: (transaction: EmployeeTransaction) => void;
  onEdit: (transaction: EmployeeTransaction) => void;
  onStartWorkflow: (transaction: EmployeeTransaction) => void;
  onTransactionsLoaded?: (transactions: EmployeeTransaction[]) => void;
}

const statusColors: Record<TransactionStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
  rejected: "bg-destructive/20 text-destructive",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-muted text-muted-foreground",
};

export function EmployeeTransactionsList({
  companyId,
  departmentId,
  fromDate,
  toDate,
  moduleFilter: externalModuleFilter,
  onModuleFilterChange,
  onCreateNew,
  onView,
  onEdit,
  onStartWorkflow,
  onTransactionsLoaded,
}: EmployeeTransactionsListProps) {
  const { t } = useLanguage();
  const { fetchTransactions, deleteTransaction, fetchLookupValues, isLoading } =
    useEmployeeTransactions();
  const [transactions, setTransactions] = useState<EmployeeTransaction[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<LookupValue[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [internalModuleFilter, setInternalModuleFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<EmployeeTransaction | null>(null);
  const [compensationDialogOpen, setCompensationDialogOpen] = useState(false);
  const [selectedForCompensation, setSelectedForCompensation] = useState<EmployeeTransaction | null>(null);
  const [transactionCompensation, setTransactionCompensation] = useState<Record<string, EmployeeCompensationRecord[]>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingCompensation, setEditingCompensation] = useState<{record: EmployeeCompensationRecord; transaction: EmployeeTransaction} | null>(null);
  const [deleteCompensationDialogOpen, setDeleteCompensationDialogOpen] = useState(false);
  const [compensationToDelete, setCompensationToDelete] = useState<{id: string; transactionId: string} | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<TransactionType[]>(() => {
    try {
      const stored = localStorage.getItem("recentTransactionTypes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Use external module filter if provided, otherwise use internal
  const moduleFilter = externalModuleFilter !== undefined ? externalModuleFilter : internalModuleFilter;
  const setModuleFilter = onModuleFilterChange || setInternalModuleFilter;

  const handleSelectTransactionType = (type: TransactionType) => {
    // Update recent transactions
    const updated = [type, ...recentTransactions.filter((t) => t !== type)].slice(0, 5);
    setRecentTransactions(updated);
    localStorage.setItem("recentTransactionTypes", JSON.stringify(updated));
    
    // Trigger the create flow
    onCreateNew(type);
  };

  // Get filtered type options based on module selection
  const filteredTypeOptions = moduleFilter !== "all" 
    ? transactionTypes.filter(t => getTypesForModule(moduleFilter).includes(t.code as TransactionType))
    : transactionTypes;

  // Reset type filter when module changes
  useEffect(() => {
    if (moduleFilter !== "all") {
      const moduleTypes = getTypesForModule(moduleFilter);
      if (typeFilter !== "all" && !moduleTypes.includes(typeFilter as TransactionType)) {
        setTypeFilter("all");
      }
    }
  }, [moduleFilter]);

  useEffect(() => {
    loadData();
    loadLookupValues();
  }, [statusFilter, typeFilter, moduleFilter, companyId, departmentId, fromDate, toDate]);

  const loadData = async () => {
    const filters: any = {};
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }
    if (typeFilter !== "all") {
      filters.transactionType = typeFilter;
    }
    if (companyId) {
      filters.companyId = companyId;
    }
    if (departmentId) {
      filters.departmentId = departmentId;
    }
    if (fromDate) {
      filters.fromDate = fromDate;
    }
    if (toDate) {
      filters.toDate = toDate;
    }
    const data = await fetchTransactions(filters);
    setTransactions(data);
    onTransactionsLoaded?.(data);
    
    // Load compensation data for all transactions
    if (data.length > 0) {
      await loadCompensationData(data);
    }
  };

  const loadCompensationData = async (txns: EmployeeTransaction[]) => {
    // Get all unique employee/position/effective_date combinations to check for compensation
    const checks = txns.map(t => ({
      id: t.id,
      employee_id: t.employee_id,
      position_id: getRelevantPositionId(t),
      effective_date: t.effective_date,
    })).filter(c => c.employee_id && c.position_id);

    if (checks.length === 0) return;

    // Fetch employee compensation records matching these transactions
    const { data: compData } = await supabase
      .from("employee_compensation")
      .select(`
        id, employee_id, position_id, pay_element_id, amount, currency, frequency, 
        start_date, end_date, is_active, is_override, notes,
        pay_element:pay_elements(name, code)
      `)
      .in("employee_id", [...new Set(checks.map(c => c.employee_id).filter(Boolean))])
      .in("position_id", [...new Set(checks.map(c => c.position_id).filter(Boolean))])
      .order("start_date", { ascending: false });

    if (!compData) return;

    // Map compensation records to transactions by employee_id, position_id, AND matching effective_date with start_date
    const compMap: Record<string, EmployeeCompensationRecord[]> = {};
    for (const txn of checks) {
      // Only match compensation records where the start_date equals the transaction's effective_date
      const matching = compData.filter(c => 
        c.employee_id === txn.employee_id && 
        c.position_id === txn.position_id &&
        c.start_date === txn.effective_date
      );
      if (matching.length > 0) {
        compMap[txn.id] = matching.map(c => ({
          id: c.id,
          pay_element_id: c.pay_element_id,
          pay_element: c.pay_element as { name: string; code: string } | undefined,
          amount: c.amount,
          currency: c.currency,
          frequency: c.frequency,
          start_date: c.start_date,
          end_date: c.end_date,
          is_active: c.is_active,
          is_override: c.is_override,
          notes: c.notes
        }));
      }
    }
    setTransactionCompensation(compMap);
  };

  const loadLookupValues = async () => {
    const types = await fetchLookupValues("transaction_type");
    // Sort to put SECONDMENT at the bottom
    const sorted = [...types].sort((a, b) => {
      if (a.code === "SECONDMENT") return 1;
      if (b.code === "SECONDMENT") return -1;
      return 0; // Preserve existing order
    });
    setTransactionTypes(sorted);
  };

  const handleDelete = async () => {
    if (transactionToDelete) {
      const success = await deleteTransaction(transactionToDelete.id);
      if (success) {
        loadData();
      }
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const toggleRowExpanded = (transactionId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(transactionId)) {
        next.delete(transactionId);
      } else {
        next.add(transactionId);
      }
      return next;
    });
  };

  const hasCompensation = (transactionId: string) => {
    return transactionCompensation[transactionId] && transactionCompensation[transactionId].length > 0;
  };

  const handleEditCompensation = (record: EmployeeCompensationRecord, transaction: EmployeeTransaction) => {
    setEditingCompensation({ record, transaction });
    setSelectedForCompensation(transaction);
    setCompensationDialogOpen(true);
  };

  const handleDeleteCompensation = async () => {
    if (!compensationToDelete) return;
    
    const { error } = await supabase
      .from("employee_compensation")
      .delete()
      .eq("id", compensationToDelete.id);
    
    if (error) {
      console.error("Failed to delete compensation:", error);
      return;
    }
    
    // Remove from local state
    setTransactionCompensation(prev => ({
      ...prev,
      [compensationToDelete.transactionId]: prev[compensationToDelete.transactionId].filter(c => c.id !== compensationToDelete.id)
    }));
    
    setDeleteCompensationDialogOpen(false);
    setCompensationToDelete(null);
  };

  // Filter by module first, then by search
  const moduleFilteredTransactions = moduleFilter !== "all"
    ? transactions.filter(t => {
        const typeCode = t.transaction_type?.code;
        return typeCode && getTypesForModule(moduleFilter).includes(typeCode as TransactionType);
      })
    : transactions;

  const filteredTransactions = moduleFilteredTransactions.filter((t) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.transaction_number.toLowerCase().includes(search) ||
      t.employee?.full_name?.toLowerCase().includes(search) ||
      t.employee?.email?.toLowerCase().includes(search)
    );
  });

  // Helper to get the relevant position ID based on transaction type
  const getRelevantPositionId = (transaction: EmployeeTransaction): string | null => {
    const typeCode = transaction.transaction_type?.code;
    switch (typeCode) {
      case "HIRE":
      case "REHIRE":
        return transaction.position_id;
      case "ACTING":
        return transaction.acting_position_id;
      case "PROMOTION":
        return transaction.to_position_id || transaction.from_position_id;
      case "TRANSFER":
        return transaction.position_id;
      case "SALARY_CHANGE":
        return transaction.position_id;
      case "RATE_CHANGE":
        return transaction.position_id;
      default:
        return transaction.position_id;
    }
  };

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all" || moduleFilter !== "all" || searchTerm;

  const clearAllFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setModuleFilter("all");
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder={t("workforce.modules.transactions.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[200px]"
            />
            <TransactionModuleFilter
              value={moduleFilter}
              onChange={setModuleFilter}
              className="w-full sm:w-auto"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("workforce.modules.transactions.transactionType")} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">{t("workforce.modules.transactions.allTypes")}</SelectItem>
                {filteredTypeOptions.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t("common.status")} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">{t("workforce.modules.transactions.allStatuses")}</SelectItem>
                <SelectItem value="draft">{t("workforce.modules.transactions.statuses.draft")}</SelectItem>
                <SelectItem value="pending_approval">{t("workforce.modules.transactions.statuses.pending_approval")}</SelectItem>
                <SelectItem value="approved">{t("workforce.modules.transactions.statuses.approved")}</SelectItem>
                <SelectItem value="rejected">{t("workforce.modules.transactions.statuses.rejected")}</SelectItem>
                <SelectItem value="completed">{t("workforce.modules.transactions.statuses.completed")}</SelectItem>
                <SelectItem value="cancelled">{t("workforce.modules.transactions.statuses.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
          <Button
            onClick={() => setPickerOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          >
            <Plus className="h-4 w-4" />
            {t("workforce.modules.transactions.newTransaction")}
          </Button>
        </div>
      </div>

      {/* Transaction Type Picker Dialog */}
      <TransactionTypePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelectTransactionType}
        recentTransactions={recentTransactions}
      />

      {/* Transactions Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>{t("workforce.modules.transactions.transactionNumber")}</TableHead>
              <TableHead>{t("workforce.modules.transactions.transactionType")}</TableHead>
              <TableHead>{t("common.employee")}</TableHead>
              <TableHead>{t("common.position")}</TableHead>
              <TableHead>{t("workforce.modules.transactions.effectiveDate")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("workforce.modules.transactions.created")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t("workforce.modules.transactions.noTransactionsFound")}
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <>
                  <TableRow key={transaction.id} className={hasCompensation(transaction.id) ? "cursor-pointer hover:bg-muted/50" : ""}>
                    <TableCell className="w-8 p-2">
                      {hasCompensation(transaction.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleRowExpanded(transaction.id)}
                        >
                          {expandedRows.has(transaction.id) ? (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {transaction.transaction_number}
                        {hasCompensation(transaction.id) && (
                          <Tooltip>
                            <TooltipTrigger>
                              <DollarSign className="h-3.5 w-3.5 text-success" />
                            </TooltipTrigger>
                            <TooltipContent>
                              {t("compensation.history.hasCompensation")}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TransactionModuleBadge 
                        typeCode={transaction.transaction_type?.code || ""}
                        typeName={transaction.transaction_type?.name}
                      />
                    </TableCell>
                    <TableCell>
                      {transaction.employee?.full_name ||
                        transaction.employee?.email ||
                        "N/A"}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const typeCode = transaction.transaction_type?.code;
                        // For movement transactions, show destination position with arrow
                        if (["TRANSFER", "BULK_TRANSFER", "PROMOTION"].includes(typeCode || "")) {
                          const toPos = (transaction as any).to_position?.title;
                          if (toPos) {
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground text-xs">→</span>
                                <span>{toPos}</span>
                              </div>
                            );
                          }
                        }
                        // For ACTING transactions
                        if (typeCode === "ACTING") {
                          const actingPos = (transaction as any).acting_position?.title;
                          if (actingPos) {
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground text-xs">→</span>
                                <span>{actingPos}</span>
                              </div>
                            );
                          }
                        }
                        // For SECONDMENT transactions
                        if (typeCode === "SECONDMENT") {
                          const secondmentPos = (transaction as any).secondment_position?.title;
                          if (secondmentPos) {
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground text-xs">→</span>
                                <span>{secondmentPos}</span>
                              </div>
                            );
                          }
                        }
                        // Default to position
                        return transaction.position?.title || "—";
                      })()}
                    </TableCell>
                    <TableCell>
                      {formatDateForDisplay(transaction.effective_date, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[transaction.status]}>
                        {t(`workforce.modules.transactions.statuses.${transaction.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateForDisplay(transaction.created_at, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(transaction)}
                              className="h-8 px-2"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="hidden lg:inline">View</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="lg:hidden">View</TooltipContent>
                        </Tooltip>
                        {/* Compensation button - show for transactions with relevant position (employee_id optional for HIRE) */}
                        {getRelevantPositionId(transaction) && 
                         transaction.transaction_type?.code !== "TERMINATION" &&
                         (transaction.status === "approved" || transaction.status === "completed" || transaction.status === "draft") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedForCompensation(transaction);
                                  setCompensationDialogOpen(true);
                                }}
                                className="h-8 px-2"
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span className="hidden lg:inline">Pay</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t("workforce.modules.transactions.form.setCompensation")}
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {transaction.status === "draft" && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEdit(transaction)}
                                  className="h-8 px-2"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  <span className="hidden lg:inline">Edit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="lg:hidden">Edit</TooltipContent>
                            </Tooltip>
                            {transaction.requires_workflow && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onStartWorkflow(transaction)}
                                    className="h-8 px-2 text-primary border-primary/30 hover:bg-primary/10"
                                  >
                                    <PlayCircle className="h-4 w-4 mr-1" />
                                    <span className="hidden lg:inline">Submit</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Start Approval Workflow</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setTransactionToDelete(transaction);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Expanded compensation details row */}
                  {expandedRows.has(transaction.id) && hasCompensation(transaction.id) && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={9} className="py-3 px-4">
                        <div className="ml-8">
                          <p className="text-sm font-medium mb-2 text-muted-foreground">
                            {t("compensation.employeeCompensation.title", "Employee Compensation")}
                          </p>
                          <div className="space-y-2">
                            {transactionCompensation[transaction.id].map((comp) => (
                              <div key={comp.id} className="flex items-center justify-between text-sm bg-background rounded-md px-3 py-2 border">
                                <div className="flex items-center gap-6">
                                  <div>
                                    <span className="text-muted-foreground">{t("compensation.employeeCompensation.payElement", "Pay Element")}:</span>{" "}
                                    <Badge variant="outline" className="ml-1">{comp.pay_element?.name || comp.pay_element_id}</Badge>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">{t("compensation.employeeCompensation.amount", "Amount")}:</span>{" "}
                                    <span className="font-medium">{comp.currency} {comp.amount.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">{t("compensation.employeeCompensation.frequencyLabel", "Frequency")}:</span>{" "}
                                    <span className="font-medium capitalize">{comp.frequency}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">{t("common.startDate")}:</span>{" "}
                                    <span className="font-medium">{formatDateForDisplay(comp.start_date, "MMM d, yyyy")}</span>
                                  </div>
                                  {comp.end_date && (
                                    <div>
                                      <span className="text-muted-foreground">{t("common.endDate")}:</span>{" "}
                                      <span className="font-medium">{formatDateForDisplay(comp.end_date, "MMM d, yyyy")}</span>
                                    </div>
                                  )}
                                  {comp.is_override && (
                                    <Badge variant="secondary" className="text-xs">Override</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={comp.is_active ? "default" : "outline"} className="text-xs">
                                    {comp.is_active ? t("common.active") : t("common.inactive")}
                                  </Badge>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => handleEditCompensation(comp, transaction)}
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{t("common.edit")}</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => {
                                          setCompensationToDelete({ id: comp.id, transactionId: transaction.id });
                                          setDeleteCompensationDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{t("common.delete")}</TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("workforce.modules.transactions.deleteTransaction")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("workforce.modules.transactions.deleteConfirmation", { number: transactionToDelete?.transaction_number })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Compensation Confirmation */}
      <AlertDialog open={deleteCompensationDialogOpen} onOpenChange={setDeleteCompensationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("compensation.employeeCompensation.deleteCompensation", "Delete Compensation")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("compensation.employeeCompensation.deleteConfirmation", "Are you sure you want to delete this compensation record? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompensation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Compensation Dialog */}
      {selectedForCompensation && selectedForCompensation.employee_id && getRelevantPositionId(selectedForCompensation) && (
        <TransactionEmployeeCompensationDialog
          open={compensationDialogOpen}
          onOpenChange={(open) => {
            setCompensationDialogOpen(open);
            if (!open) {
              setSelectedForCompensation(null);
              setEditingCompensation(null);
            }
          }}
          employeeId={selectedForCompensation.employee_id}
          employeeName={selectedForCompensation.employee?.full_name || selectedForCompensation.employee?.email || ""}
          positionId={getRelevantPositionId(selectedForCompensation)!}
          positionTitle={selectedForCompensation.position?.title || ""}
          companyId={selectedForCompensation.company_id || ""}
          transactionType={(selectedForCompensation.transaction_type?.code as TransactionType) || "HIRE"}
          defaultStartDate={
            (selectedForCompensation.transaction_type?.code === "ACTING")
              ? selectedForCompensation.acting_start_date || selectedForCompensation.effective_date || ""
              : selectedForCompensation.effective_date || ""
          }
          defaultEndDate={
            (selectedForCompensation.transaction_type?.code === "ACTING")
              ? selectedForCompensation.acting_end_date
              : undefined
          }
          editingRecord={editingCompensation?.record}
          onSuccess={() => {
            loadData();
            setEditingCompensation(null);
          }}
        />
      )}
    </div>
  );
}
