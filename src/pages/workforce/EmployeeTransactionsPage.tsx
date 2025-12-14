import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTransactionsList } from "@/components/workforce/EmployeeTransactionsList";
import { TransactionFormDialog } from "@/components/workforce/TransactionFormDialog";
import { EmployeeTransaction, TransactionType } from "@/hooks/useEmployeeTransactions";
import { useWorkflow } from "@/hooks/useWorkflow";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Company {
  id: string;
  name: string;
}

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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<EmployeeTransaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      setCompanies(data || []);
    };
    fetchCompanies();
  }, []);

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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              key={`${refreshKey}-${selectedCompanyId}`}
              companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined}
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
