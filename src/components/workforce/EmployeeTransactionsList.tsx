import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Filter, Eye, Edit, Trash2, PlayCircle, Loader2 } from "lucide-react";
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
  useEmployeeTransactions,
  EmployeeTransaction,
  TransactionStatus,
  LookupValue,
} from "@/hooks/useEmployeeTransactions";

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
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
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
            <SelectValue placeholder="New Transaction" />
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
              <TableHead>Transaction #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  No transactions found
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
                    {format(new Date(transaction.effective_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[transaction.status]}>
                      {transaction.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.created_at), "MMM d, yyyy")}
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
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete transaction{" "}
              {transactionToDelete?.transaction_number}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
