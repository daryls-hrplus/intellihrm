import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, GitBranch } from "lucide-react";
import { TransactionWorkflowSettingsGrid } from "@/components/hr-hub/TransactionWorkflowSettingsGrid";

interface Company {
  id: string;
  name: string;
}

export default function TransactionWorkflowSettingsPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      setCompanies(data || []);
      if (data && data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    };
    fetchCompanies();
  }, []);

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: t("hrHub.transactionWorkflowSettings.title") || "Transaction Workflow Settings" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t("hrHub.transactionWorkflowSettings.title") || "Transaction Workflow Settings"}
              </h1>
              <p className="text-muted-foreground">
                {t("hrHub.transactionWorkflowSettings.subtitle") ||
                  "Configure which employee transaction types require workflow approval by company"}
              </p>
            </div>
          </div>

          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={t("common.selectCompany") || "Select Company"} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCompanyId ? (
          <TransactionWorkflowSettingsGrid companyId={selectedCompanyId} />
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">
                  {t("hrHub.transactionWorkflowSettings.selectCompanyPrompt") ||
                    "Select a Company"}
                </h3>
                <p className="text-muted-foreground">
                  {t("hrHub.transactionWorkflowSettings.selectCompanyDescription") ||
                    "Choose a company from the dropdown above to configure transaction workflow settings."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
