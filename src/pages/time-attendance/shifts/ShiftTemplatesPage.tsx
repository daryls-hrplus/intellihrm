import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { ShiftTemplatesTab } from "@/components/time-attendance/shifts/ShiftTemplatesTab";

interface Company {
  id: string;
  name: string;
}

export default function ShiftTemplatesPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

  const breadcrumbItems = [
    { label: t("nav.timeAttendance"), href: "/time-attendance" },
    { label: t("timeAttendance.modules.shifts.title"), href: "/time-attendance/shifts" },
    { label: t("timeAttendance.shifts.templatesLabel") }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Copy className="h-6 w-6 text-cyan-600" />
            <h1 className="text-2xl font-bold">{t("timeAttendance.shifts.templatesLabel")}</h1>
          </div>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCompany && (
          <Card>
            <CardHeader>
              <CardTitle>{t("timeAttendance.shifts.templatesLabel")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ShiftTemplatesTab companyId={selectedCompany} />
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
