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
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HardHat, 
  Plus, 
  Search, 
  Package,
  Users,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

export default function HSEPPEManagementPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("types");

  const { data: ppeTypes, isLoading: typesLoading } = useQuery({
    queryKey: ["hse-ppe-types", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_ppe_types")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["hse-ppe-inventory", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_ppe_inventory")
        .select("*, hse_ppe_types(name, category)")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const { data: issuances, isLoading: issuancesLoading } = useQuery({
    queryKey: ["hse-ppe-issuances", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_ppe_issuances")
        .select("*, hse_ppe_inventory(*, hse_ppe_types(name))")
        .eq("company_id", selectedCompanyId)
        .order("issued_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const totalInventory = inventory?.length || 0;
  const lowStockItems = inventory?.filter(item => !item.is_active).length || 0;
  const activeIssuances = issuances?.filter(i => !i.returned_date).length || 0;

  const stats = [
    { 
      label: t("hseModule.ppeManagement.stats.ppeTypes"), 
      value: ppeTypes?.length || 0, 
      icon: HardHat, 
      color: "bg-primary/10 text-primary" 
    },
    { 
      label: t("hseModule.ppeManagement.stats.totalInventory"), 
      value: totalInventory, 
      icon: Package, 
      color: "bg-sky-500/10 text-sky-600" 
    },
    { 
      label: t("hseModule.ppeManagement.stats.activeIssuances"), 
      value: activeIssuances, 
      icon: Users, 
      color: "bg-emerald-500/10 text-emerald-600" 
    },
    { 
      label: t("hseModule.ppeManagement.stats.lowStock"), 
      value: lowStockItems, 
      icon: AlertTriangle, 
      color: "bg-destructive/10 text-destructive" 
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.ppeManagement.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <HardHat className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("hseModule.ppeManagement.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("hseModule.ppeManagement.subtitle")}
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
              <TabsTrigger value="types">{t("hseModule.ppeManagement.tabs.types")}</TabsTrigger>
              <TabsTrigger value="inventory">{t("hseModule.ppeManagement.tabs.inventory")}</TabsTrigger>
              <TabsTrigger value="issuances">{t("hseModule.ppeManagement.tabs.issuances")}</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "types" && t("hseModule.ppeManagement.addType")}
              {activeTab === "inventory" && t("hseModule.ppeManagement.addInventory")}
              {activeTab === "issuances" && t("hseModule.ppeManagement.issuePPE")}
            </Button>
          </div>

          <TabsContent value="types" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.ppeManagement.ppeTypes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("common.category")}</TableHead>
                      <TableHead>{t("hseModule.ppeManagement.lifespan")}</TableHead>
                      <TableHead>{t("hseModule.ppeManagement.inspectionFrequency")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : ppeTypes?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.ppeManagement.noTypes")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      ppeTypes?.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell className="font-medium">{type.name}</TableCell>
                          <TableCell>{type.category || "-"}</TableCell>
                          <TableCell>{type.replacement_frequency_days ? `${type.replacement_frequency_days} ${t("hseModule.ppeManagement.days")}` : "-"}</TableCell>
                          <TableCell>{type.inspection_frequency_days ? `${type.inspection_frequency_days} ${t("hseModule.ppeManagement.days")}` : "-"}</TableCell>
                          <TableCell>
                            <Badge variant={type.is_active ? "default" : "secondary"}>
                              {type.is_active ? t("common.active") : t("common.inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">{t("common.edit")}</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.ppeManagement.inventory")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.ppeManagement.ppeType")}</TableHead>
                      <TableHead>{t("common.location")}</TableHead>
                      <TableHead>{t("hseModule.ppeManagement.quantity")}</TableHead>
                      <TableHead>{t("hseModule.ppeManagement.reorderLevel")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : inventory?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.ppeManagement.noInventory")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventory?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{(item as any).hse_ppe_types?.name || "-"}</TableCell>
                          <TableCell>{item.location || "-"}</TableCell>
                          <TableCell>{item.serial_number || "-"}</TableCell>
                          <TableCell>{item.condition || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={item.is_active ? "default" : "destructive"}>
                              {item.is_active ? t("hseModule.ppeManagement.inStock") : t("common.inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">{t("common.edit")}</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issuances" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.ppeManagement.issuances")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.ppeManagement.ppeItem")}</TableHead>
                      <TableHead>{t("common.employee")}</TableHead>
                      <TableHead>{t("hseModule.ppeManagement.issuedDate")}</TableHead>
                      <TableHead>{t("hseModule.ppeManagement.expiryDate")}</TableHead>
                      <TableHead>{t("hseModule.ppeManagement.returnedDate")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuancesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : issuances?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.ppeManagement.noIssuances")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      issuances?.map((issuance) => (
                        <TableRow key={issuance.id}>
                          <TableCell className="font-medium">
                            {(issuance as any).hse_ppe_inventory?.hse_ppe_types?.name || "-"}
                          </TableCell>
                          <TableCell>{issuance.employee_id || "-"}</TableCell>
                          <TableCell>{issuance.issued_date ? formatDateForDisplay(issuance.issued_date, "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell>{issuance.quantity || "-"}</TableCell>
                          <TableCell>{issuance.returned_date ? formatDateForDisplay(issuance.returned_date, "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              {issuance.returned_date ? t("common.view") : t("hseModule.ppeManagement.return")}
                            </Button>
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
