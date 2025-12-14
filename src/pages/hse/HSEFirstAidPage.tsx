import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Stethoscope, AlertTriangle, CheckCircle, Package } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function HSEFirstAidPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: treatments, isLoading: treatmentsLoading } = useQuery({
    queryKey: ["hse-medical-treatments", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_medical_treatments").select("*").order("treatment_date", { ascending: false });
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const { data: kits, isLoading: kitsLoading } = useQuery({
    queryKey: ["hse-first-aid-kits", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_first_aid_kits").select("*").order("location");
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const filteredTreatments = treatments?.filter(t =>
    t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.treatment_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityBadge = (severity: string | null) => {
    const colors: Record<string, string> = {
      minor: "bg-emerald-500/10 text-emerald-600",
      moderate: "bg-amber-500/10 text-amber-600",
      severe: "bg-destructive/10 text-destructive",
    };
    return <Badge className={colors[severity || "minor"] || "bg-muted text-muted-foreground"}>{severity || "Minor"}</Badge>;
  };

  const stats = [
    { label: t("hseModule.firstAid.stats.totalTreatments"), value: treatments?.length || 0, icon: Stethoscope, color: "bg-primary/10 text-primary" },
    { label: t("hseModule.firstAid.stats.firstAidKits"), value: kits?.length || 0, icon: Package, color: "bg-sky-500/10 text-sky-600" },
    { label: t("hseModule.firstAid.stats.needsRestocking"), value: kits?.filter(k => k.status === "needs_restocking").length || 0, icon: AlertTriangle, color: "bg-amber-500/10 text-amber-600" },
    { label: t("hseModule.firstAid.stats.treatmentsThisMonth"), value: treatments?.filter(t => t.treatment_date && new Date(t.treatment_date).getMonth() === new Date().getMonth()).length || 0, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("hseModule.firstAid.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.firstAid.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter selectedCompanyId={selectedCompanyId} onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} />
            <DepartmentFilter companyId={selectedCompanyId} selectedDepartmentId={selectedDepartmentId} onDepartmentChange={setSelectedDepartmentId} />
            <Button><Plus className="h-4 w-4 mr-2" />{t("hseModule.firstAid.logTreatment")}</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      {treatmentsLoading || kitsLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold">{stat.value}</p>}
                    </div>
                    <div className={`rounded-lg p-3 ${stat.color}`}><Icon className="h-5 w-5" /></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="treatments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="treatments">{t("hseModule.firstAid.tabs.treatments")}</TabsTrigger>
            <TabsTrigger value="kits">{t("hseModule.firstAid.tabs.kits")}</TabsTrigger>
          </TabsList>

          <TabsContent value="treatments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("hseModule.firstAid.treatmentsList")}</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t("hseModule.firstAid.searchTreatments")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.firstAid.treatmentNumber")}</TableHead>
                      <TableHead>{t("hseModule.firstAid.treatmentDate")}</TableHead>
                      <TableHead>{t("hseModule.firstAid.treatmentType")}</TableHead>
                      <TableHead>{t("hseModule.firstAid.severity")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatmentsLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ) : !filteredTreatments?.length ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("hseModule.firstAid.noTreatments")}</TableCell></TableRow>
                    ) : (
                      filteredTreatments?.map((treatment) => (
                        <TableRow key={treatment.id}>
                          <TableCell className="font-medium">{treatment.id.slice(0, 8)}</TableCell>
                          <TableCell>{treatment.treatment_date ? format(new Date(treatment.treatment_date), "MMM dd, yyyy") : "-"}</TableCell>
                          <TableCell>{treatment.treatment_type || "-"}</TableCell>
                          <TableCell>{treatment.injury_description || "-"}</TableCell>
                          <TableCell><Button variant="ghost" size="sm">{t("common.view")}</Button></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kits">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("hseModule.firstAid.kitsList")}</CardTitle>
                  <Button variant="outline"><Plus className="h-4 w-4 mr-2" />{t("hseModule.firstAid.addKit")}</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.firstAid.kitCode")}</TableHead>
                      <TableHead>{t("hseModule.firstAid.kitType")}</TableHead>
                      <TableHead>{t("hseModule.common.location")}</TableHead>
                      <TableHead>{t("hseModule.firstAid.lastInspection")}</TableHead>
                      <TableHead>{t("hseModule.firstAid.needsRestocking")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kitsLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ) : !kits?.length ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("hseModule.firstAid.noKits")}</TableCell></TableRow>
                    ) : (
                      kits?.map((kit) => (
                        <TableRow key={kit.id}>
                          <TableCell className="font-medium">{kit.kit_number}</TableCell>
                          <TableCell>{kit.kit_type || "-"}</TableCell>
                          <TableCell>{kit.location || "-"}</TableCell>
                          <TableCell>{kit.last_inspection_date ? format(new Date(kit.last_inspection_date), "MMM dd, yyyy") : "-"}</TableCell>
                          <TableCell>
                            {kit.status === "needs_restocking" ? (
                              <Badge variant="destructive">{t("common.yes")}</Badge>
                            ) : (
                              <Badge variant="secondary">{t("common.no")}</Badge>
                            )}
                          </TableCell>
                          <TableCell><Button variant="ghost" size="sm">{t("common.edit")}</Button></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
