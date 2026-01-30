import { formatDateForDisplay } from "@/utils/dateUtils";
import { Eye, Edit, Trash2, PlayCircle, DollarSign, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionModuleBadge } from "./TransactionModuleBadge";
import { TransactionStatusProgress } from "./TransactionStatusProgress";
import { EmployeeTransaction, TransactionStatus } from "@/hooks/useEmployeeTransactions";
import { cn } from "@/lib/utils";

interface TransactionCardViewProps {
  transactions: EmployeeTransaction[];
  onView: (transaction: EmployeeTransaction) => void;
  onEdit: (transaction: EmployeeTransaction) => void;
  onDelete: (transaction: EmployeeTransaction) => void;
  onStartWorkflow: (transaction: EmployeeTransaction) => void;
  onSetCompensation: (transaction: EmployeeTransaction) => void;
  hasCompensation: (transactionId: string) => boolean;
  getRelevantPositionId: (transaction: EmployeeTransaction) => string | null;
}

const statusColors: Record<TransactionStatus, string> = {
  draft: "border-l-muted-foreground",
  pending_approval: "border-l-warning",
  approved: "border-l-success",
  rejected: "border-l-destructive",
  completed: "border-l-primary",
  cancelled: "border-l-muted",
};

export function TransactionCardView({
  transactions,
  onView,
  onEdit,
  onDelete,
  onStartWorkflow,
  onSetCompensation,
  hasCompensation,
  getRelevantPositionId,
}: TransactionCardViewProps) {
  const { t } = useLanguage();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("workforce.modules.transactions.noTransactionsFound")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {transactions.map((transaction) => {
        const typeCode = transaction.transaction_type?.code;
        const canEdit = transaction.status === "draft";
        const canSetCompensation =
          getRelevantPositionId(transaction) &&
          typeCode !== "TERMINATION" &&
          (transaction.status === "approved" || transaction.status === "completed" || transaction.status === "draft");

        return (
          <Card
            key={transaction.id}
            className={cn(
              "border-l-4 hover:shadow-md transition-shadow cursor-pointer",
              statusColors[transaction.status]
            )}
            onClick={() => onView(transaction)}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {transaction.transaction_number}
                    </span>
                    {hasCompensation(transaction.id) && (
                      <DollarSign className="h-3.5 w-3.5 text-success" />
                    )}
                  </div>
                  <TransactionModuleBadge
                    typeCode={typeCode || ""}
                    typeName={transaction.transaction_type?.name}
                    size="sm"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover z-50">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(transaction); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(transaction); }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canSetCompensation && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetCompensation(transaction); }}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Set Compensation
                      </DropdownMenuItem>
                    )}
                    {canEdit && transaction.requires_workflow && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStartWorkflow(transaction); }}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Submit for Approval
                      </DropdownMenuItem>
                    )}
                    {canEdit && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDelete(transaction); }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Employee Info */}
              <div className="space-y-2 mb-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Employee:</span>{" "}
                  <span className="font-medium">
                    {transaction.employee?.full_name || transaction.employee?.email || "N/A"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Position:</span>{" "}
                  <span className="font-medium">
                    {(() => {
                      if (["TRANSFER", "BULK_TRANSFER", "PROMOTION"].includes(typeCode || "")) {
                        const toPos = (transaction as any).to_position?.title;
                        if (toPos) return `→ ${toPos}`;
                      }
                      if (typeCode === "ACTING") {
                        const actingPos = (transaction as any).acting_position?.title;
                        if (actingPos) return `→ ${actingPos}`;
                      }
                      if (typeCode === "SECONDMENT") {
                        const secondmentPos = (transaction as any).secondment_position?.title;
                        if (secondmentPos) return `→ ${secondmentPos}`;
                      }
                      return transaction.position?.title || "—";
                    })()}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div>
                  <span>Effective:</span>{" "}
                  <span className="font-medium text-foreground">
                    {formatDateForDisplay(transaction.effective_date, "MMM d, yyyy")}
                  </span>
                </div>
                <div>
                  <span>Created:</span>{" "}
                  <span className="font-medium text-foreground">
                    {formatDateForDisplay(transaction.created_at, "MMM d")}
                  </span>
                </div>
              </div>

              {/* Status Progress */}
              <div className="pt-2 border-t">
                <TransactionStatusProgress
                  status={transaction.status}
                  requiresWorkflow={transaction.requires_workflow}
                  size="sm"
                />
              </div>

              {/* Quick Actions for Draft */}
              {canEdit && transaction.requires_workflow && (
                <div className="mt-3 pt-3 border-t">
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartWorkflow(transaction);
                    }}
                  >
                    <PlayCircle className="h-4 w-4" />
                    Submit for Approval
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
