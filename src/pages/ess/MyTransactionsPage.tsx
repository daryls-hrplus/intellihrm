import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, DollarSign, ChevronRight, ChevronDown } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePositionCompensationDrilldown } from "@/components/workforce/EmployeePositionCompensationDrilldown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Transaction {
  id: string;
  transaction_number: string;
  transaction_type: { code: string; name: string } | null;
  effective_date: string;
  status: string;
  created_at: string;
  position: { title: string } | null;
  position_id: string | null;
  from_position_id: string | null;
  to_position_id: string | null;
  acting_position_id: string | null;
  notes: string | null;
}

interface LookupValue {
  id: string;
  code: string;
  name: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
  rejected: "bg-destructive/20 text-destructive",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-muted text-muted-foreground",
};

export default function MyTransactionsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["my-transactions", profile?.id, statusFilter, typeFilter],
    queryFn: async (): Promise<Transaction[]> => {
      if (!profile?.id) return [];
      
      let query: any = supabase
        .from("employee_transactions")
        .select(`
          id,
          transaction_number,
          transaction_type:lookup_values!employee_transactions_transaction_type_id_fkey(code, name),
          effective_date,
          status,
          created_at,
          position:positions!employee_transactions_position_id_fkey(title),
          position_id,
          from_position_id,
          to_position_id,
          acting_position_id,
          notes
        `)
        .eq("employee_id", profile.id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (typeFilter !== "all") {
        query = query.eq("transaction_type_id", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: transactionTypes = [] } = useQuery({
    queryKey: ["transaction-types"],
    queryFn: async (): Promise<LookupValue[]> => {
      const result: any = await supabase
        .from("lookup_values")
        .select("id, code, name")
        .eq("lookup_type", "transaction_type")
        .eq("is_active", true)
        .order("display_order");
      if (result.error) throw result.error;
      return result.data || [];
    },
  });

  const getRelevantPositionId = (transaction: Transaction): string | null => {
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

  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.transaction_number.toLowerCase().includes(search) ||
      t.transaction_type?.name?.toLowerCase().includes(search)
    );
  });

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: t("ess.modules.transactions.title", "My Transactions") },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ess.modules.transactions.title", "My Transactions")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.transactions.description", "View your employment transaction history")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("workforce.modules.transactions.title", "Transactions")}</CardTitle>
            <CardDescription>
              {t("ess.modules.transactions.subtitle", "Your employment changes and updates")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
              <Input
                placeholder={t("workforce.modules.transactions.searchPlaceholder", "Search transactions...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("common.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("workforce.modules.transactions.allStatuses", "All Statuses")}</SelectItem>
                  <SelectItem value="draft">{t("workforce.modules.transactions.statuses.draft", "Draft")}</SelectItem>
                  <SelectItem value="pending_approval">{t("workforce.modules.transactions.statuses.pending_approval", "Pending Approval")}</SelectItem>
                  <SelectItem value="approved">{t("workforce.modules.transactions.statuses.approved", "Approved")}</SelectItem>
                  <SelectItem value="rejected">{t("workforce.modules.transactions.statuses.rejected", "Rejected")}</SelectItem>
                  <SelectItem value="completed">{t("workforce.modules.transactions.statuses.completed", "Completed")}</SelectItem>
                  <SelectItem value="cancelled">{t("workforce.modules.transactions.statuses.cancelled", "Cancelled")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("workforce.modules.transactions.transactionType", "Transaction Type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("workforce.modules.transactions.allTypes", "All Types")}</SelectItem>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
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
                    <TableHead>{t("workforce.modules.transactions.transactionNumber", "Transaction #")}</TableHead>
                    <TableHead>{t("workforce.modules.transactions.transactionType", "Type")}</TableHead>
                    <TableHead>{t("common.position", "Position")}</TableHead>
                    <TableHead>{t("workforce.modules.transactions.effectiveDate", "Effective Date")}</TableHead>
                    <TableHead>{t("common.status", "Status")}</TableHead>
                    <TableHead>{t("workforce.modules.transactions.created", "Created")}</TableHead>
                    <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
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
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {t("workforce.modules.transactions.noTransactionsFound", "No transactions found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => {
                      const positionId = getRelevantPositionId(transaction);
                      const canExpand = positionId && profile?.id;
                      
                      return (
                        <>
                          <TableRow 
                            key={transaction.id} 
                            className={canExpand ? "cursor-pointer hover:bg-muted/50" : ""}
                          >
                            <TableCell className="w-8 p-2">
                              {canExpand && (
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
                                {canExpand && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <DollarSign className="h-3.5 w-3.5 text-success" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t("compensation.history.viewCompensation", "View Compensation Details")}
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
                              {transaction.position?.title || "—"}
                            </TableCell>
                            <TableCell>
                              {formatDateForDisplay(transaction.effective_date, "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[transaction.status] || statusColors.draft}>
                                {t(`workforce.modules.transactions.statuses.${transaction.status}`, transaction.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDateForDisplay(transaction.created_at, "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleView(transaction)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          {/* Expanded compensation details row */}
                          {expandedRows.has(transaction.id) && canExpand && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={8} className="py-3 px-4">
                                <div className="ml-8">
                                  <EmployeePositionCompensationDrilldown
                                    employeeId={profile.id}
                                    positionId={positionId}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Transaction Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {t("workforce.modules.transactions.viewTransaction", "Transaction Details")}
              </DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("workforce.modules.transactions.transactionNumber", "Transaction #")}</p>
                    <p className="font-medium">{selectedTransaction.transaction_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("workforce.modules.transactions.transactionType", "Type")}</p>
                    <Badge variant="outline">{selectedTransaction.transaction_type?.name || "Unknown"}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("workforce.modules.transactions.effectiveDate", "Effective Date")}</p>
                    <p className="font-medium">{formatDateForDisplay(selectedTransaction.effective_date, "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("common.status", "Status")}</p>
                    <Badge className={statusColors[selectedTransaction.status] || statusColors.draft}>
                      {t(`workforce.modules.transactions.statuses.${selectedTransaction.status}`, selectedTransaction.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("common.position", "Position")}</p>
                    <p className="font-medium">{selectedTransaction.position?.title || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("workforce.modules.transactions.created", "Created")}</p>
                    <p className="font-medium">{formatDateForDisplay(selectedTransaction.created_at, "MMM d, yyyy")}</p>
                  </div>
                </div>
                {selectedTransaction.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("common.notes", "Notes")}</p>
                    <p className="font-medium">{selectedTransaction.notes}</p>
                  </div>
                )}

                {/* Compensation Drilldown in Dialog */}
                {profile?.id && getRelevantPositionId(selectedTransaction) && (
                  <div className="pt-4 border-t">
                    <EmployeePositionCompensationDrilldown
                      employeeId={profile.id}
                      positionId={getRelevantPositionId(selectedTransaction)!}
                    />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
