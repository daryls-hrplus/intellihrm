import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeBankAccountsTab } from "@/components/employee/EmployeeBankAccountsTab";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MyBankingPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Please log in to view your banking information.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: t("ess.modules.banking.title", "Banking") },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            {t("ess.modules.banking.title", "My Banking Information")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.banking.description", "Manage your bank accounts for payroll deposits")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("ess.modules.banking.accountsTitle", "Bank Accounts")}</CardTitle>
            <CardDescription>
              {t("ess.modules.banking.accountsDescription", "Add or update your bank account information for salary payments")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeBankAccountsTab employeeId={user.id} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
