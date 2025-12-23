import { useState, useEffect } from "react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Plus, Filter, Eye, Edit, Trash2, PlayCircle, Loader2, DollarSign } from "lucide-react";
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
import { TransactionCompensationDialog } from "@/components/compensation/TransactionCompensationDialog";

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

  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.transaction_number.toLowerCase().includes(search) ||
      t.employee?.full_name?.toLowerCase().includes(search) ||
      t.employee?.email?.toLowerCase().includes(search)
    );
  });

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
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t("workforce.modules.transactions.noTransactionsFound")}
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.transaction_number}
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
                      {/* Compensation button - show for approved/completed transactions with employee and position */}
                      {transaction.employee_id && transaction.position_id && 
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
      {selectedForCompensation && selectedForCompensation.employee_id && selectedForCompensation.position_id && (
        <TransactionCompensationDialog
          open={compensationDialogOpen}
          onOpenChange={(open) => {
            setCompensationDialogOpen(open);
            if (!open) setSelectedForCompensation(null);
          }}
          employeeId={selectedForCompensation.employee_id}
          employeeName={selectedForCompensation.employee?.full_name || selectedForCompensation.employee?.email || ""}
          positionId={selectedForCompensation.position_id}
          positionTitle={selectedForCompensation.position?.title || ""}
          companyId={selectedForCompensation.company_id || ""}
          effectiveDate={selectedForCompensation.effective_date}
          transactionType={(selectedForCompensation.transaction_type?.code as TransactionType) || "HIRE"}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
