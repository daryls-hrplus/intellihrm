import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PositionsManagement } from "@/components/admin/PositionsManagement";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck, Building2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
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
  code: string;
}

export default function PositionsPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      
      if (data && data.length > 0) {
        setCompanies(data);
        setSelectedCompanyId(data[0].id);
      }
      setIsLoading(false);
    };
    fetchCompanies();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("workforce.title"), href: "/workforce" },
          { label: t("workforce.positions") }
        ]} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <UserCheck className="h-5 w-5 text-info" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("workforce.positions")}
              </h1>
              <p className="text-muted-foreground">
                {t("workforce.managePositions")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={t("workforce.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} ({company.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : selectedCompanyId ? (
          <PositionsManagement companyId={selectedCompanyId} />
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">{t("workforce.noCompaniesFound")}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
