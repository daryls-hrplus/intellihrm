import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Users, ArrowLeft, ShieldCheck, BookOpen, Globe } from "lucide-react";
import { PayrollCalendarGenerator } from "@/components/payroll/PayrollCalendarGenerator";
import { toast } from "sonner";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { useTranslation } from "react-i18next";
import { usePageAudit } from "@/hooks/usePageAudit";

interface PayGroupFormData {
  name: string;
  code: string;
  description: string;
  pay_frequency: string;
  pay_calculation_method: string;
  is_active: boolean;
  uses_national_insurance: boolean;
  gl_configured: boolean;
  enable_multi_currency: boolean;
  default_exchange_rate_source: string;
  start_date: string;
  end_date: string;
}

export default function PayGroupsPage() {
  const { t } = useTranslation();
  usePageAudit('pay_groups', 'Payroll');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PayGroupFormData>({
    name: "",
    code: "",
    description: "",
    pay_frequency: "monthly",
    pay_calculation_method: "time_rate",
    is_active: true,
    uses_national_insurance: false,
    gl_configured: false,
    enable_multi_currency: false,
    default_exchange_rate_source: "manual",
    start_date: getTodayString(),
    end_date: "",
  });

  const { data: payGroups, isLoading } = useQuery({
    queryKey: ["pay-groups", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("pay_groups")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PayGroupFormData) => {
      const payload = {
        company_id: selectedCompanyId,
        name: data.name,
        code: data.code,
        description: data.description || null,
        pay_frequency: data.pay_frequency,
        pay_calculation_method: (data.pay_frequency === 'weekly' || data.pay_frequency === 'biweekly') 
          ? data.pay_calculation_method : null,
        is_active: data.is_active,
        uses_national_insurance: data.uses_national_insurance,
        gl_configured: data.gl_configured,
        enable_multi_currency: data.enable_multi_currency,
        default_exchange_rate_source: data.enable_multi_currency ? data.default_exchange_rate_source : null,
        start_date: data.start_date,
        end_date: data.end_date || null,
      };

      if (editingId) {
        const { error } = await supabase.from("pay_groups").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pay_groups").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pay-groups"] });
      toast.success(editingId ? t("payroll.payGroups.payGroupUpdated") : t("payroll.payGroups.payGroupCreated"));
      closeDialog();
    },
    onError: (error: any) => {
      if (error.message?.includes("unique")) {
        toast.error(t("payroll.payGroups.codeExists"));
      } else {
        toast.error(t("common.error"));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pay_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pay-groups"] });
      toast.success(t("payroll.payGroups.payGroupDeleted"));
    },
    onError: () => toast.error(t("common.error")),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      pay_frequency: "monthly",
      pay_calculation_method: "time_rate",
      is_active: true,
      uses_national_insurance: false,
      gl_configured: false,
      enable_multi_currency: false,
      default_exchange_rate_source: "manual",
      start_date: getTodayString(),
      end_date: "",
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description || "",
      pay_frequency: item.pay_frequency,
      pay_calculation_method: item.pay_calculation_method || "time_rate",
      is_active: item.is_active,
      uses_national_insurance: item.uses_national_insurance || false,
      gl_configured: item.gl_configured || false,
      enable_multi_currency: item.enable_multi_currency || false,
      default_exchange_rate_source: item.default_exchange_rate_source || "manual",
      start_date: item.start_date,
      end_date: item.end_date || "",
    });
    setIsDialogOpen(true);
  };

  const formatFrequency = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: t("payroll.payGroups.weekly"),
      biweekly: t("payroll.payGroups.biweekly"),
      semimonthly: t("payroll.payGroups.semimonthly"),
      monthly: t("payroll.payGroups.monthly"),
    };
    return labels[freq] || freq;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t("payroll.payGroups.title")}</h1>
          <p className="text-muted-foreground">{t("payroll.payGroups.subtitle")}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <PayrollFilters
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={setSelectedCompanyId}
          showPayGroupFilter={false}
        />
        <Button onClick={() => setIsDialogOpen(true)} disabled={!selectedCompanyId}>
          <Plus className="h-4 w-4 mr-2" />
          {t("payroll.payGroups.addPayGroup")}
        </Button>
      </div>

      {!selectedCompanyId ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t("payroll.payGroups.selectCompanyPrompt")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-10 text-center">{t("common.loading")}</CardContent>
        </Card>
      ) : payGroups?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("payroll.payGroups.noPayGroups")}</p>
            <p className="text-sm">{t("payroll.payGroups.noPayGroupsHint")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("payroll.payGroups.title")}</CardTitle>
            <CardDescription>{t("payroll.payGroups.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.code")}</TableHead>
                  <TableHead>{t("payroll.payGroups.payFrequency")}</TableHead>
                  <TableHead>NI</TableHead>
                  <TableHead>GL</TableHead>
                  <TableHead>FX</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.startDate")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payGroups?.map((pg) => (
                  <TableRow key={pg.id}>
                    <TableCell className="font-medium">{pg.name}</TableCell>
                    <TableCell>{pg.code}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatFrequency(pg.pay_frequency)}</Badge>
                    </TableCell>
                    <TableCell>
                      {pg.uses_national_insurance && (
                        <ShieldCheck className="h-4 w-4 text-success" />
                      )}
                    </TableCell>
                    <TableCell>
                      {pg.gl_configured && (
                        <BookOpen className="h-4 w-4 text-success" />
                      )}
                    </TableCell>
                    <TableCell>
                      {pg.enable_multi_currency && (
                        <Globe className="h-4 w-4 text-primary" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pg.is_active ? "default" : "outline"}>
                        {pg.is_active ? t("common.active") : t("common.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateForDisplay(pg.start_date, "PP")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <PayrollCalendarGenerator
                          companyId={selectedCompanyId}
                          payGroup={pg}
                          onGenerated={() => queryClient.invalidateQueries({ queryKey: ["pay-groups"] })}
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(pg)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(pg.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? t("payroll.payGroups.editPayGroup") : t("payroll.payGroups.addPayGroup")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("common.name")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Monthly Salaried"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("common.code")} *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., MONTHLY-SAL"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("payroll.payGroups.payFrequency")} *</Label>
              <Select
                value={formData.pay_frequency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, pay_frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">{t("payroll.payGroups.weekly")}</SelectItem>
                  <SelectItem value="biweekly">{t("payroll.payGroups.biweekly")}</SelectItem>
                  <SelectItem value="semimonthly">{t("payroll.payGroups.semimonthly")}</SelectItem>
                  <SelectItem value="monthly">{t("payroll.payGroups.monthly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.pay_frequency === 'weekly' || formData.pay_frequency === 'biweekly') && (
              <div className="grid gap-2">
                <Label>Pay Calculation Method *</Label>
                <Select
                  value={formData.pay_calculation_method}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, pay_calculation_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_rate">Time Rate (Hours × Rate)</SelectItem>
                    <SelectItem value="piece_rate">Piece Rate (Units × Rate)</SelectItem>
                    <SelectItem value="balance_debt">Balance/Debt Method (Advances settled at period end)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.pay_calculation_method === 'time_rate' && 'Pay calculated based on hours worked multiplied by hourly rate'}
                  {formData.pay_calculation_method === 'piece_rate' && 'Pay calculated based on units/pieces produced multiplied by rate per piece'}
                  {formData.pay_calculation_method === 'balance_debt' && 'Advances/draws given throughout period, settled against actual earnings at pay period end'}
                </p>
              </div>
            )}
            <div className="grid gap-2">
              <Label>{t("common.description")}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("common.optional")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("common.startDate")} *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("common.endDate")}</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                  />
                  <Label>{t("common.active")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.uses_national_insurance}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, uses_national_insurance: checked }))}
                  />
                  <Label>{t("payroll.payGroups.usesNationalInsurance")}</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.gl_configured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, gl_configured: checked }))}
                />
                <Label>GL Configured</Label>
                <span className="text-xs text-muted-foreground">(Enables GL posting step before payout)</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.enable_multi_currency}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enable_multi_currency: checked }))}
                />
                <Label>Multi-Currency</Label>
                <span className="text-xs text-muted-foreground">(Process pay elements in different currencies)</span>
              </div>
            </div>
            {formData.enable_multi_currency && (
              <div className="grid gap-2">
                <Label>Default Exchange Rate Source</Label>
                <Select
                  value={formData.default_exchange_rate_source}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, default_exchange_rate_source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="central_bank">Central Bank Rates</SelectItem>
                    <SelectItem value="market">Market Rates</SelectItem>
                    <SelectItem value="fixed">Fixed Rate</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default source for exchange rates when processing payroll
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.name || !formData.code || !formData.pay_frequency || !formData.start_date}
            >
              {editingId ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
