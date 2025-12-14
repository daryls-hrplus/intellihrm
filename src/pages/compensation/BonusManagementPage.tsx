import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Gift, Plus, DollarSign, Award, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface Company {
  id: string;
  name: string;
}

export default function BonusManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("plans");
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

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["bonus-plans", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("bonus_plans")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const { data: awards = [], isLoading: awardsLoading } = useQuery({
    queryKey: ["bonus-awards", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("bonus_awards")
        .select(`
          *,
          employee:profiles!bonus_awards_employee_id_fkey(full_name)
        `)
        .eq("company_id", selectedCompanyId)
        .order("award_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-600",
      approved: "bg-sky-500/10 text-sky-600",
      paid: "bg-emerald-500/10 text-emerald-600",
      cancelled: "bg-red-500/10 text-red-600",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status}</Badge>;
  };

  const getBonusTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      performance: "bg-violet-500/10 text-violet-600",
      spot: "bg-amber-500/10 text-amber-600",
      retention: "bg-sky-500/10 text-sky-600",
      signing: "bg-emerald-500/10 text-emerald-600",
      referral: "bg-pink-500/10 text-pink-600",
      holiday: "bg-rose-500/10 text-rose-600",
      profit_sharing: "bg-indigo-500/10 text-indigo-600",
    };
    return <Badge className={colors[type] || "bg-muted"}>{type.replace("_", " ")}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("compensation.title"), href: "/compensation" },
            { label: t("compensation.bonus.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("compensation.bonus.title")}</h1>
              <p className="text-muted-foreground">{t("compensation.bonus.subtitle")}</p>
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
              {activeTab === "plans" ? t("compensation.bonus.newPlan") : t("compensation.bonus.newAward")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.bonus.activePlans")}</p>
                  <p className="text-2xl font-bold">{plans.filter((p: any) => p.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.bonus.pendingAwards")}</p>
                  <p className="text-2xl font-bold">{awards.filter((a: any) => a.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.bonus.totalPaid")}</p>
                  <p className="text-2xl font-bold">
                    ${awards.filter((a: any) => a.status === "paid").reduce((sum: number, a: any) => sum + (a.final_amount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-sky-500/10 p-3">
                  <Users className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.bonus.recipients")}</p>
                  <p className="text-2xl font-bold">{new Set(awards.map((a: any) => a.employee_id)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="plans">{t("compensation.bonus.bonusPlans")}</TabsTrigger>
            <TabsTrigger value="awards">{t("compensation.bonus.bonusAwards")}</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <Card>
              <CardContent className="pt-6">
                {plansLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("compensation.bonus.planName")}</TableHead>
                        <TableHead>{t("compensation.bonus.type")}</TableHead>
                        <TableHead>{t("compensation.bonus.frequency")}</TableHead>
                        <TableHead>{t("compensation.bonus.targetPercent")}</TableHead>
                        <TableHead>{t("compensation.bonus.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            {t("compensation.bonus.noPlans")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        plans.map((plan: any) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>{getBonusTypeBadge(plan.bonus_type)}</TableCell>
                            <TableCell className="capitalize">{plan.frequency}</TableCell>
                            <TableCell>{plan.target_percentage ? `${plan.target_percentage}%` : "-"}</TableCell>
                            <TableCell>
                              <Badge className={plan.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted"}>
                                {plan.is_active ? t("common.active") : t("common.inactive")}
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
          </TabsContent>

          <TabsContent value="awards">
            <Card>
              <CardContent className="pt-6">
                {awardsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("compensation.bonus.employee")}</TableHead>
                        <TableHead>{t("compensation.bonus.type")}</TableHead>
                        <TableHead>{t("compensation.bonus.awardDate")}</TableHead>
                        <TableHead className="text-right">{t("compensation.bonus.amount")}</TableHead>
                        <TableHead>{t("compensation.bonus.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {awards.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            {t("compensation.bonus.noAwards")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        awards.map((award: any) => (
                          <TableRow key={award.id}>
                            <TableCell className="font-medium">{award.employee?.full_name}</TableCell>
                            <TableCell>{getBonusTypeBadge(award.bonus_type)}</TableCell>
                            <TableCell>{format(new Date(award.award_date), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">${award.final_amount?.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(award.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
