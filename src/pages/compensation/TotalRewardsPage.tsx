import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Receipt, Plus, Search, Eye, Download, DollarSign, FileText, ChevronRight, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TotalRewardsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: statements = [], isLoading } = useQuery({
    queryKey: ["total-rewards-statements", companyFilter],
    queryFn: async () => {
      let query = supabase
        .from("total_rewards_statements")
        .select(`
          *,
          employee:profiles!total_rewards_statements_employee_id_fkey(full_name, email)
        `)
        .order("statement_year", { ascending: false });
      if (companyFilter !== "all") {
        query = query.eq("company_id", companyFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const filteredStatements = statements.filter((s: any) =>
    s.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/compensation" className="hover:text-foreground transition-colors">{t("compensation.title")}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{t("compensation.totalRewards.title")}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("compensation.totalRewards.title")}</h1>
              <p className="text-muted-foreground">{t("compensation.totalRewards.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {companies.map((company: any) => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("compensation.totalRewards.generateStatements")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.totalRewards.totalStatements")}</p>
                  <p className="text-2xl font-bold">{statements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <Eye className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.totalRewards.published")}</p>
                  <p className="text-2xl font-bold">{statements.filter((s: any) => s.is_published).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-sky-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.totalRewards.avgTotalComp")}</p>
                  <p className="text-2xl font-bold">
                    ${statements.length > 0 
                      ? Math.round(statements.reduce((sum: number, s: any) => sum + (s.total_compensation || 0), 0) / statements.length).toLocaleString()
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <Eye className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.totalRewards.viewed")}</p>
                  <p className="text-2xl font-bold">{statements.filter((s: any) => s.viewed_at).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("compensation.totalRewards.searchEmployee")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                    <TableHead>{t("compensation.totalRewards.employee")}</TableHead>
                    <TableHead>{t("compensation.totalRewards.year")}</TableHead>
                    <TableHead className="text-right">{t("compensation.totalRewards.baseSalary")}</TableHead>
                    <TableHead className="text-right">{t("compensation.totalRewards.bonus")}</TableHead>
                    <TableHead className="text-right">{t("compensation.totalRewards.benefits")}</TableHead>
                    <TableHead className="text-right">{t("compensation.totalRewards.total")}</TableHead>
                    <TableHead>{t("compensation.totalRewards.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStatements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {t("compensation.totalRewards.noStatements")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStatements.map((statement: any) => (
                      <TableRow key={statement.id}>
                        <TableCell className="font-medium">{statement.employee?.full_name}</TableCell>
                        <TableCell>{statement.statement_year}</TableCell>
                        <TableCell className="text-right">${statement.base_salary?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right">${statement.bonus_earned?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right">${statement.benefits_value?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right font-medium">${statement.total_compensation?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <Badge className={statement.is_published ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                            {statement.is_published ? t("compensation.totalRewards.published") : t("compensation.totalRewards.draft")}
                          </Badge>
                        </TableCell>
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
