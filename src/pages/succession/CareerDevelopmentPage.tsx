import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CareerDevelopmentTab } from "@/components/succession/CareerDevelopmentTab";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function CareerDevelopmentPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name, code')
      .eq('is_active', true)
      .order('name');
    
    if (data && data.length > 0) {
      setCompanies(data);
      setSelectedCompanyId(data[0].id);
    }
  };

  const breadcrumbItems = [
    { label: t("succession.dashboard.title"), href: "/succession" },
    { label: t("succession.tabs.careerDevelopment") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("succession.tabs.careerDevelopment")}
            </h1>
            <p className="text-muted-foreground">
              {t("succession.careerDevelopment.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("common.selectCompany")} />
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
          <CareerDevelopmentTab companyId={selectedCompanyId} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t("succession.dashboard.selectCompany")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
