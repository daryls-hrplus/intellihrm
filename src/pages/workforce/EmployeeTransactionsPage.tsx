import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTransactionsList } from "@/components/workforce/EmployeeTransactionsList";
import { TransactionFormDialog } from "@/components/workforce/TransactionFormDialog";
import { EmployeeTransaction, TransactionType } from "@/hooks/useEmployeeTransactions";
import { useWorkflow } from "@/hooks/useWorkflow";
import { toast } from "sonner";
import { FileText, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Company {
  id: string;
  name: string;
}

const workflowCodeMap: Record<TransactionType, string> = {
  HIRE: "employee_hire",
  CONFIRMATION: "probation_confirmation",
  PROBATION_EXT: "probation_extension",
  ACTING: "acting_assignment",
  PROMOTION: "promotion",
  TRANSFER: "transfer",
  SECONDMENT: "secondment",
  TERMINATION: "termination",
};

export default function EmployeeTransactionsPage() {
  const { t } = useLanguage();
  const { startWorkflow } = useWorkflow();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<EmployeeTransaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

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
        <Breadcrumbs items={[
          { label: t("navigation.workforce"), href: "/workforce" },
          { label: t("workforce.modules.transactions.title") },
        ]} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("workforce.modules.transactions.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("workforce.modules.transactions.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedCompanyId} onValueChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("common.allCompanies")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.allCompanies")}</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
              <DepartmentFilter
                companyId={selectedCompanyId !== "all" ? selectedCompanyId : ""}
                selectedDepartmentId={selectedDepartmentId}
                onDepartmentChange={setSelectedDepartmentId}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("common.dateRange")}:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "MMM d, yyyy") : t("common.from")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "MMM d, yyyy") : t("common.to")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {(fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFromDate(undefined); setToDate(undefined); }}
              >
                {t("common.clear")}
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("workforce.modules.transactions.allTransactions")}</CardTitle>
            <CardDescription>
              {t("workforce.modules.transactions.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeTransactionsList
              key={`${refreshKey}-${selectedCompanyId}-${selectedDepartmentId}-${fromDate?.toISOString()}-${toDate?.toISOString()}`}
              companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined}
              departmentId={selectedDepartmentId !== "all" ? selectedDepartmentId : undefined}
              fromDate={fromDate ? format(fromDate, "yyyy-MM-dd") : undefined}
              toDate={toDate ? format(toDate, "yyyy-MM-dd") : undefined}
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
