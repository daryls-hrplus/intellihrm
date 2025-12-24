import { useState, useEffect } from "react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Plus, Filter, Eye, Edit, Trash2, PlayCircle, Loader2, DollarSign, ChevronRight, ChevronDown } from "lucide-react";
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
  onCreateNew: (type: string) => void;
  onView: (transaction: EmployeeTransaction) => void;
  onEdit: (transaction: EmployeeTransaction) => void;
  onStartWorkflow: (transaction: EmployeeTransaction) => void;
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
  onCreateNew,
  onView,
  onEdit,
  onStartWorkflow,
}: EmployeeTransactionsListProps) {
  const { t } = useLanguage();
  const { fetchTransactions, deleteTransaction, fetchLookupValues, isLoading } =
    useEmployeeTransactions();
  const [transactions, setTransactions] = useState<EmployeeTransaction[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<LookupValue[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<EmployeeTransaction | null>(null);
  const [compensationDialogOpen, setCompensationDialogOpen] = useState(false);
  const [selectedForCompensation, setSelectedForCompensation] = useState<EmployeeTransaction | null>(null);
  const [transactionCompensation, setTransactionCompensation] = useState<Record<string, EmployeeCompensationRecord[]>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    loadLookupValues();
  }, [statusFilter, typeFilter, companyId]);

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
    const data = await fetchTransactions(filters);
    setTransactions(data);
    
    // Load compensation data for all transactions
    if (data.length > 0) {
      await loadCompensationData(data);
    }
  };

  const loadCompensationData = async (txns: EmployeeTransaction[]) => {
    // Get all unique employee/position combinations to check for compensation
    const checks = txns.map(t => ({
      id: t.id,
      employee_id: t.employee_id,
      position_id: getRelevantPositionId(t),
      start_date: t.transaction_type?.code === "ACTING" ? t.acting_start_date : t.effective_date,
      end_date: t.transaction_type?.code === "ACTING" ? t.acting_end_date : null
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
      .order("start_date", { ascending: false });

    if (!compData) return;

    // Map compensation records to transactions
    const compMap: Record<string, EmployeeCompensationRecord[]> = {};
    for (const txn of checks) {
      const matching = compData.filter(c => 
        c.employee_id === txn.employee_id && 
        c.position_id === txn.position_id &&
        c.start_date === txn.start_date
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
    setTransactionTypes(types);
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

  const filteredTransactions = transactions.filter((t) => {
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
        return transaction.position_id;
      case "ACTING":
        return transaction.acting_position_id;
      case "PROMOTION":
        return transaction.to_position_id || transaction.from_position_id;
      case "TRANSFER":
        return transaction.position_id;
      default:
        return transaction.position_id;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder={t("workforce.modules.transactions.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("common.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("workforce.modules.transactions.allStatuses")}</SelectItem>
              <SelectItem value="draft">{t("workforce.modules.transactions.statuses.draft")}</SelectItem>
              <SelectItem value="pending_approval">{t("workforce.modules.transactions.statuses.pending_approval")}</SelectItem>
              <SelectItem value="approved">{t("workforce.modules.transactions.statuses.approved")}</SelectItem>
              <SelectItem value="rejected">{t("workforce.modules.transactions.statuses.rejected")}</SelectItem>
              <SelectItem value="completed">{t("workforce.modules.transactions.statuses.completed")}</SelectItem>
              <SelectItem value="cancelled">{t("workforce.modules.transactions.statuses.cancelled")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("workforce.modules.transactions.transactionType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("workforce.modules.transactions.allTypes")}</SelectItem>
              {transactionTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select onValueChange={onCreateNew}>
          <SelectTrigger className="w-48">
            <Plus className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t("workforce.modules.transactions.newTransaction")} />
          </SelectTrigger>
          <SelectContent>
            {transactionTypes.map((type) => (
              <SelectItem key={type.id} value={type.code}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>{t("workforce.modules.transactions.transactionNumber")}</TableHead>
              <TableHead>{t("workforce.modules.transactions.transactionType")}</TableHead>
              <TableHead>{t("common.employee")}</TableHead>
              <TableHead>{t("workforce.modules.transactions.effectiveDate")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("workforce.modules.transactions.created")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
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
                      <Badge variant="outline">
                        {transaction.transaction_type?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.employee?.full_name ||
                        transaction.employee?.email ||
                        "N/A"}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Compensation button - show for transactions with employee and relevant position */}
                        {transaction.employee_id && getRelevantPositionId(transaction) && 
                         transaction.transaction_type?.code !== "TERMINATION" &&
                         (transaction.status === "approved" || transaction.status === "completed" || transaction.status === "draft") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedForCompensation(transaction);
                                  setCompensationDialogOpen(true);
                                }}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t("workforce.modules.transactions.form.setCompensation")}
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {transaction.status === "draft" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {transaction.requires_workflow && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onStartWorkflow(transaction)}
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setTransactionToDelete(transaction);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Expanded compensation details row */}
                  {expandedRows.has(transaction.id) && hasCompensation(transaction.id) && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={8} className="py-3 px-4">
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
                                <Badge variant={comp.is_active ? "default" : "outline"} className="text-xs">
                                  {comp.is_active ? t("common.active") : t("common.inactive")}
                                </Badge>
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

      {/* Compensation Dialog */}
      {selectedForCompensation && selectedForCompensation.employee_id && getRelevantPositionId(selectedForCompensation) && (
        <TransactionEmployeeCompensationDialog
          open={compensationDialogOpen}
          onOpenChange={(open) => {
            setCompensationDialogOpen(open);
            if (!open) {
              setSelectedForCompensation(null);
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
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
