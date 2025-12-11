import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTransactionsList } from "@/components/workforce/EmployeeTransactionsList";
import { TransactionFormDialog } from "@/components/workforce/TransactionFormDialog";
import { EmployeeTransaction, TransactionType } from "@/hooks/useEmployeeTransactions";
import { useWorkflow } from "@/hooks/useWorkflow";
import { toast } from "sonner";
import { FileText } from "lucide-react";

const breadcrumbs = [
  { label: "Workforce", href: "/workforce" },
  { label: "Employee Transactions" },
];

const workflowCodeMap: Record<TransactionType, string> = {
  HIRE: "employee_hire",
  CONFIRMATION: "probation_confirmation",
  PROBATION_EXT: "probation_extension",
  ACTING: "acting_assignment",
  PROMOTION: "promotion",
  TRANSFER: "transfer",
  TERMINATION: "termination",
};

export default function EmployeeTransactionsPage() {
  const { startWorkflow } = useWorkflow();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<EmployeeTransaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateNew = (typeCode: string) => {
    setSelectedTransactionType(typeCode as TransactionType);
    setSelectedTransaction(null);
    setFormDialogOpen(true);
  };

  const handleView = (transaction: EmployeeTransaction) => {
    setSelectedTransaction(transaction);
    setSelectedTransactionType(transaction.transaction_type?.code as TransactionType);
    setFormDialogOpen(true);
  };

  const handleEdit = (transaction: EmployeeTransaction) => {
    setSelectedTransaction(transaction);
    setSelectedTransactionType(transaction.transaction_type?.code as TransactionType);
    setFormDialogOpen(true);
  };

  const handleStartWorkflow = async (transaction: EmployeeTransaction) => {
    const typeCode = transaction.transaction_type?.code as TransactionType;
    const workflowCode = workflowCodeMap[typeCode];
    
    if (!workflowCode) {
      toast.error("No workflow configured for this transaction type");
      return;
    }

    const instance = await startWorkflow(
      workflowCode,
      "employee_transaction",
      transaction.id,
      {
        transaction_number: transaction.transaction_number,
        transaction_type: transaction.transaction_type?.name,
        employee_name: transaction.employee?.full_name,
      }
    );

    if (instance) {
      setRefreshKey((k) => k + 1);
    }
  };

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Employee Transactions
            </h1>
            <p className="text-muted-foreground">
              Manage employee lifecycle transactions
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              View and manage employee hires, confirmations, promotions, transfers, and terminations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeTransactionsList
              key={refreshKey}
              onCreateNew={handleCreateNew}
              onView={handleView}
              onEdit={handleEdit}
              onStartWorkflow={handleStartWorkflow}
            />
          </CardContent>
        </Card>

        <TransactionFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          transactionType={selectedTransactionType}
          existingTransaction={selectedTransaction}
          onSuccess={handleSuccess}
        />
      </div>
    </AppLayout>
  );
}
