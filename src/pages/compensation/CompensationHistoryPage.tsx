import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { History, Search, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface Company {
  id: string;
  name: string;
}

export default function CompensationHistoryPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>("all");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase.from("companies").select("id, name").eq("is_active", true).order("name");
      if (data && data.length > 0) {
        setCompanies(data);
        setSelectedCompanyId(data[0].id);
      }
    };
    fetchCompanies();
  }, []);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["compensation-history", changeTypeFilter, selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      let query = supabase
        .from("compensation_history")
        .select(`
          *,
          employee:profiles!compensation_history_employee_id_fkey(full_name, email),
          approver:profiles!compensation_history_approved_by_fkey(full_name)
        `)
        .eq("company_id", selectedCompanyId)
        .order("effective_date", { ascending: false });

      if (changeTypeFilter !== "all") {
        query = query.eq("change_type", changeTypeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const filteredHistory = history.filter((h: any) =>
    h.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChangeIcon = (type: string, amount: number | null) => {
    if (amount === null) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (amount > 0) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (amount < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      hire: "bg-emerald-500/10 text-emerald-600",
      promotion: "bg-sky-500/10 text-sky-600",
      merit: "bg-violet-500/10 text-violet-600",
      adjustment: "bg-amber-500/10 text-amber-600",
      demotion: "bg-red-500/10 text-red-600",
      market: "bg-indigo-500/10 text-indigo-600",
    };
    return <Badge className={colors[type] || "bg-muted text-muted-foreground"}>{type}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("compensation.title"), href: "/compensation" },
            { label: t("compensation.history.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("compensation.history.title")}</h1>
              <p className="text-muted-foreground">{t("compensation.history.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("compensation.history.addRecord")}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("compensation.history.searchEmployee")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={changeTypeFilter} onValueChange={setChangeTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("compensation.history.changeType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("compensation.history.allTypes")}</SelectItem>
                  <SelectItem value="hire">{t("compensation.history.changeTypes.hire")}</SelectItem>
                  <SelectItem value="promotion">{t("compensation.history.changeTypes.promotion")}</SelectItem>
                  <SelectItem value="merit">{t("compensation.history.changeTypes.merit")}</SelectItem>
                  <SelectItem value="adjustment">{t("compensation.history.changeTypes.adjustment")}</SelectItem>
                  <SelectItem value="market">{t("compensation.history.changeTypes.market")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("compensation.history.employee")}</TableHead>
                    <TableHead>{t("compensation.history.effectiveDate")}</TableHead>
                    <TableHead>{t("compensation.history.type")}</TableHead>
                    <TableHead className="text-right">{t("compensation.history.previous")}</TableHead>
                    <TableHead className="text-right">{t("compensation.history.new")}</TableHead>
                    <TableHead className="text-right">{t("compensation.history.change")}</TableHead>
                    <TableHead>{t("compensation.history.approvedBy")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {t("compensation.history.noHistory")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employee?.full_name}</TableCell>
                        <TableCell>{format(new Date(record.effective_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{getChangeTypeBadge(record.change_type)}</TableCell>
                        <TableCell className="text-right">
                          {record.previous_salary ? `$${record.previous_salary.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">${record.new_salary?.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {getChangeIcon(record.change_type, record.change_amount)}
                            {record.change_percentage ? `${record.change_percentage}%` : "-"}
                          </div>
                        </TableCell>
                        <TableCell>{record.approver?.full_name || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
