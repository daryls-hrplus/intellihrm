import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { History, Search, Plus, TrendingUp, TrendingDown, Minus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { AddCompensationHistoryDialog } from "@/components/compensation/AddCompensationHistoryDialog";
import { EditCompensationHistoryDialog } from "@/components/compensation/EditCompensationHistoryDialog";
import { DeleteCompensationHistoryDialog } from "@/components/compensation/DeleteCompensationHistoryDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Company {
  id: string;
  name: string;
}

interface PayGroup {
  id: string;
  name: string;
}

export default function CompensationHistoryPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>("all");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedPayGroupId, setSelectedPayGroupId] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      // @ts-ignore - Supabase type instantiation issue
      const { data } = await supabase.from("companies").select("id, name").eq("is_active", true).order("name");
      if (data && data.length > 0) {
        setCompanies(data as Company[]);
        setSelectedCompanyId(data[0].id);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchPayGroups = async () => {
      if (!selectedCompanyId) {
        setPayGroups([]);
        return;
      }
      // @ts-ignore - Supabase type instantiation issue
      const { data } = await supabase
        .from("pay_groups")
        .select("id, name")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      if (data) {
        setPayGroups(data as PayGroup[]);
      }
    };
    fetchPayGroups();
    setSelectedPayGroupId("all");
  }, [selectedCompanyId]);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["compensation-history", changeTypeFilter, selectedCompanyId, selectedPayGroupId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      // If filtering by pay group, we need to get employee IDs from employee_positions first
      let employeeIds: string[] | null = null;
      if (selectedPayGroupId !== "all") {
        // @ts-ignore - Supabase type instantiation issue
        const { data: empPositions } = await supabase
          .from("employee_positions")
          .select("employee_id")
          .eq("pay_group_id", selectedPayGroupId)
          .eq("is_active", true);
        
        if (empPositions && empPositions.length > 0) {
          employeeIds = [...new Set(empPositions.map((ep: any) => ep.employee_id))];
        } else {
          return []; // No employees in this pay group
        }
      }
      
      // @ts-ignore - Supabase type instantiation issue
      let query = supabase
        .from("compensation_history")
        .select(`
          *,
          employee:profiles!compensation_history_employee_id_fkey(full_name, email),
          approver:profiles!compensation_history_approved_by_fkey(full_name),
          position:positions!compensation_history_position_id_fkey(title)
        `)
        .eq("company_id", selectedCompanyId)
        .order("effective_date", { ascending: false });

      if (changeTypeFilter !== "all") {
        query = query.eq("change_type", changeTypeFilter);
      }
      
      if (employeeIds) {
        query = query.in("employee_id", employeeIds);
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
              <SelectTrigger className="w-[180px]">
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
            <Select value={selectedPayGroupId} onValueChange={setSelectedPayGroupId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("common.selectPayGroup")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allPayGroups")}</SelectItem>
                {payGroups.map((pg) => (
                  <SelectItem key={pg.id} value={pg.id}>
                    {pg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setAddDialogOpen(true)}>
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
                    <TableHead>{t("common.position")}</TableHead>
                    <TableHead>{t("compensation.history.effectiveDate")}</TableHead>
                    <TableHead>{t("compensation.history.type")}</TableHead>
                    <TableHead className="text-right">{t("compensation.history.previous")}</TableHead>
                    <TableHead className="text-right">{t("compensation.history.new")}</TableHead>
                    <TableHead className="text-right">{t("compensation.history.change")}</TableHead>
                    <TableHead>{t("compensation.history.approvedBy")}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        {t("compensation.history.noHistory")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employee?.full_name}</TableCell>
                        <TableCell>{record.position?.title || "-"}</TableCell>
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("common.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("common.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AddCompensationHistoryDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          companyId={selectedCompanyId}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["compensation-history"] })}
        />

        <EditCompensationHistoryDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          record={selectedRecord}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["compensation-history"] })}
        />

        <DeleteCompensationHistoryDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          record={selectedRecord}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["compensation-history"] })}
        />
      </div>
    </AppLayout>
  );
}
