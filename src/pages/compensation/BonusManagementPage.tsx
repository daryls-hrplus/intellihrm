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

interface Company {
  id: string;
  name: string;
}

export default function BonusManagementPage() {
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
            { label: "Compensation", href: "/compensation" },
            { label: "Bonus Management" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bonus Management</h1>
              <p className="text-muted-foreground">Manage bonus plans and awards</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Company" />
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
              {activeTab === "plans" ? "New Plan" : "New Award"}
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
                  <p className="text-sm text-muted-foreground">Active Plans</p>
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
                  <p className="text-sm text-muted-foreground">Pending Awards</p>
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
                  <p className="text-sm text-muted-foreground">Total Paid</p>
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
                  <p className="text-sm text-muted-foreground">Recipients</p>
                  <p className="text-2xl font-bold">{new Set(awards.map((a: any) => a.employee_id)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="plans">Bonus Plans</TabsTrigger>
            <TabsTrigger value="awards">Bonus Awards</TabsTrigger>
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
                        <TableHead>Plan Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Target %</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No bonus plans found
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
                                {plan.is_active ? "Active" : "Inactive"}
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
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Award Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {awards.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No bonus awards found
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
