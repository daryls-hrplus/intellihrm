import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FlaskConical, 
  Plus, 
  Search, 
  FileText,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

export default function HSEChemicalsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chemicals");

  const { data: chemicals, isLoading: chemicalsLoading } = useQuery({
    queryKey: ["hse-chemicals", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_chemicals")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const { data: exposures, isLoading: exposuresLoading } = useQuery({
    queryKey: ["hse-chemical-exposures", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_chemical_exposures")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("exposure_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const filteredChemicals = chemicals?.filter((chem) =>
    chem.chemical_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chem.cas_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHazardBadge = (level: string | null) => {
    if (!level) return <Badge variant="secondary">-</Badge>;
    const colors: Record<string, string> = {
      low: "bg-emerald-500/10 text-emerald-600",
      medium: "bg-amber-500/10 text-amber-600",
      high: "bg-orange-500/10 text-orange-600",
      extreme: "bg-destructive/10 text-destructive",
    };
    return <Badge className={colors[level] || "bg-muted text-muted-foreground"}>{level}</Badge>;
  };

  const stats = [
    { 
      label: t("hseModule.chemicals.stats.totalChemicals"), 
      value: chemicals?.length || 0, 
      icon: FlaskConical, 
      color: "bg-primary/10 text-primary" 
    },
    { 
      label: t("hseModule.chemicals.stats.highHazard"), 
      value: chemicals?.filter(c => (c.hazard_classification as string[])?.some(h => h.includes("high"))).length || 0, 
      icon: AlertTriangle, 
      color: "bg-destructive/10 text-destructive" 
    },
    { 
      label: t("hseModule.chemicals.stats.withSDS"), 
      value: chemicals?.filter(c => c.sds_document_url).length || 0, 
      icon: FileText, 
      color: "bg-sky-500/10 text-sky-600" 
    },
    { 
      label: t("hseModule.chemicals.stats.exposureIncidents"), 
      value: exposures?.length || 0, 
      icon: AlertTriangle, 
      color: "bg-amber-500/10 text-amber-600" 
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.chemicals.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <FlaskConical className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("hseModule.chemicals.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("hseModule.chemicals.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} 
            />
            <DepartmentFilter
              companyId={selectedCompanyId}
              selectedDepartmentId={selectedDepartmentId}
              onDepartmentChange={setSelectedDepartmentId}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                    </div>
                    <div className={`rounded-lg p-3 ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="chemicals">{t("hseModule.chemicals.tabs.chemicals")}</TabsTrigger>
              <TabsTrigger value="exposures">{t("hseModule.chemicals.tabs.exposures")}</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "chemicals" ? t("hseModule.chemicals.addChemical") : t("hseModule.chemicals.logExposure")}
            </Button>
          </div>

          <TabsContent value="chemicals" className="mt-4 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("hseModule.chemicals.searchChemicals")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.chemicals.chemicalRegistry")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("hseModule.chemicals.casNumber")}</TableHead>
                      <TableHead>{t("hseModule.chemicals.hazardLevel")}</TableHead>
                      <TableHead>{t("common.location")}</TableHead>
                      <TableHead>{t("hseModule.chemicals.sds")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chemicalsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredChemicals?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.chemicals.noChemicals")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredChemicals?.map((chem) => (
                        <TableRow key={chem.id}>
                          <TableCell className="font-medium">{chem.chemical_name}</TableCell>
                          <TableCell>{chem.cas_number || "-"}</TableCell>
                          <TableCell>{(chem.hazard_classification as string[])?.join(", ") || "-"}</TableCell>
                          <TableCell>{chem.storage_requirements || "-"}</TableCell>
                          <TableCell>
                            {chem.sds_document_url ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">{t("common.view")}</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exposures" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.chemicals.exposureLog")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.chemicals.exposureDate")}</TableHead>
                      <TableHead>{t("hseModule.chemicals.chemical")}</TableHead>
                      <TableHead>{t("hseModule.chemicals.exposureType")}</TableHead>
                      <TableHead>{t("hseModule.chemicals.duration")}</TableHead>
                      <TableHead>{t("hseModule.chemicals.treatmentProvided")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exposuresLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : exposures?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.chemicals.noExposures")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      exposures?.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell>{exp.exposure_date ? formatDateForDisplay(exp.exposure_date, "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell className="font-medium">-</TableCell>
                          <TableCell>{exp.exposure_type || "-"}</TableCell>
                          <TableCell>{exp.duration_minutes ? `${exp.duration_minutes} min` : "-"}</TableCell>
                          <TableCell>{exp.treatment_provided || "-"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">{t("common.view")}</Button>
                          </TableCell>
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
