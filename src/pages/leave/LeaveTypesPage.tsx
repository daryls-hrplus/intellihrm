import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement, LeaveType } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Plus, Pencil, Calendar } from "lucide-react";

export default function LeaveTypesPage() {
  const { t } = useLanguage();
  const { company } = useAuth();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { leaveTypes, loadingTypes, createLeaveType, updateLeaveType } = useLeaveManagement(selectedCompanyId);
  const [isOpen, setIsOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    accrual_unit: "days" as "days" | "hours",
    is_accrual_based: true,
    default_annual_entitlement: 0,
    allows_negative_balance: false,
    max_negative_balance: 0,
    requires_approval: true,
    min_request_amount: 0.5,
    max_consecutive_days: null as number | null,
    advance_notice_days: 0,
    can_be_encashed: false,
    encashment_rate: 1,
    color: "#3B82F6",
    accrues_leave_while_on: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      accrual_unit: "days",
      is_accrual_based: true,
      default_annual_entitlement: 0,
      allows_negative_balance: false,
      max_negative_balance: 0,
      requires_approval: true,
      min_request_amount: 0.5,
      max_consecutive_days: null,
      advance_notice_days: 0,
      can_be_encashed: false,
      encashment_rate: 1,
      color: "#3B82F6",
      accrues_leave_while_on: true,
    });
    setEditingType(null);
  };

  const handleEdit = (type: LeaveType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      code: type.code,
      description: type.description || "",
      accrual_unit: type.accrual_unit,
      is_accrual_based: type.is_accrual_based,
      default_annual_entitlement: type.default_annual_entitlement,
      allows_negative_balance: type.allows_negative_balance,
      max_negative_balance: type.max_negative_balance,
      requires_approval: type.requires_approval,
      min_request_amount: type.min_request_amount,
      max_consecutive_days: type.max_consecutive_days,
      advance_notice_days: type.advance_notice_days,
      can_be_encashed: type.can_be_encashed,
      encashment_rate: type.encashment_rate,
      color: type.color,
      accrues_leave_while_on: type.accrues_leave_while_on,
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedCompanyId) return;

    if (editingType) {
      await updateLeaveType.mutateAsync({ id: editingType.id, ...formData });
    } else {
      await createLeaveType.mutateAsync({ ...formData, company_id: selectedCompanyId });
    }
    setIsOpen(false);
    resetForm();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("leave.title"), href: "/leave" },
            { label: t("leave.leaveTypes.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("leave.leaveTypes.title")}</h1>
              <p className="text-muted-foreground">{t("leave.leaveTypes.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={setSelectedCompanyId} 
            />
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("leave.leaveTypes.addType")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingType ? t("leave.leaveTypes.editType") : t("leave.leaveTypes.addType")}</DialogTitle>
                </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("leave.leaveTypes.name")} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Annual Leave"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">{t("leave.leaveTypes.code")} *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., ANNUAL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("leave.leaveTypes.description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t("leave.leaveTypes.description")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accrual_unit">{t("leave.leaveTypes.accrualUnit")}</Label>
                    <Select
                      value={formData.accrual_unit}
                      onValueChange={(value: "days" | "hours") => setFormData({ ...formData, accrual_unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">{t("leave.leaveTypes.days")}</SelectItem>
                        <SelectItem value="hours">{t("leave.leaveTypes.hours")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_entitlement">{t("leave.leaveTypes.defaultEntitlement")}</Label>
                    <Input
                      id="default_entitlement"
                      type="number"
                      value={formData.default_annual_entitlement}
                      onChange={(e) => setFormData({ ...formData, default_annual_entitlement: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_request">{t("leave.leaveTypes.minRequest")}</Label>
                    <Input
                      id="min_request"
                      type="number"
                      step="0.5"
                      value={formData.min_request_amount}
                      onChange={(e) => setFormData({ ...formData, min_request_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_consecutive">{t("leave.leaveTypes.maxConsecutive")}</Label>
                    <Input
                      id="max_consecutive"
                      type="number"
                      value={formData.max_consecutive_days || ""}
                      onChange={(e) => setFormData({ ...formData, max_consecutive_days: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder={t("leave.leaveTypes.noLimit")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advance_notice">{t("leave.leaveTypes.advanceNotice")}</Label>
                    <Input
                      id="advance_notice"
                      type="number"
                      value={formData.advance_notice_days}
                      onChange={(e) => setFormData({ ...formData, advance_notice_days: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">{t("leave.leaveTypes.color")}</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="is_accrual_based">{t("leave.leaveTypes.accrualBased")}</Label>
                    <Switch
                      id="is_accrual_based"
                      checked={formData.is_accrual_based}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_accrual_based: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="requires_approval">{t("leave.leaveTypes.requiresApproval")}</Label>
                    <Switch
                      id="requires_approval"
                      checked={formData.requires_approval}
                      onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="allows_negative">{t("leave.leaveTypes.allowNegative")}</Label>
                    <Switch
                      id="allows_negative"
                      checked={formData.allows_negative_balance}
                      onCheckedChange={(checked) => setFormData({ ...formData, allows_negative_balance: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="can_be_encashed">{t("leave.leaveTypes.canBeEncashed")}</Label>
                    <Switch
                      id="can_be_encashed"
                      checked={formData.can_be_encashed}
                      onCheckedChange={(checked) => setFormData({ ...formData, can_be_encashed: checked })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3 bg-amber-50 dark:bg-amber-950/20">
                  <div>
                    <Label htmlFor="accrues_leave_while_on">{t("leave.leaveTypes.accruesLeaveWhileOn")}</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("leave.leaveTypes.accruesLeaveWhileOnDesc")}
                    </p>
                  </div>
                  <Switch
                    id="accrues_leave_while_on"
                    checked={formData.accrues_leave_while_on}
                    onCheckedChange={(checked) => setFormData({ ...formData, accrues_leave_while_on: checked })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    {t("leave.common.cancel")}
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.name || !formData.code}>
                    {editingType ? t("leave.common.update") : t("leave.common.create")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("leave.leaveTypes.name")}</TableHead>
                <TableHead>{t("leave.leaveTypes.code")}</TableHead>
                <TableHead>{t("leave.leaveTypes.accrualUnit")}</TableHead>
                <TableHead>{t("leave.leaveTypes.entitlement")}</TableHead>
                <TableHead>{t("leave.leaveTypes.accrualBased")}</TableHead>
                <TableHead>{t("leave.leaveTypes.accruesLeave")}</TableHead>
                <TableHead>{t("leave.leaveTypes.approvalRequired")}</TableHead>
                <TableHead>{t("leave.leaveTypes.status")}</TableHead>
                <TableHead className="w-[80px]">{t("leave.leaveTypes.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingTypes ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {t("leave.leaveTypes.loading")}
                  </TableCell>
                </TableRow>
              ) : leaveTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {t("leave.leaveTypes.noTypes")}
                  </TableCell>
                </TableRow>
              ) : (
                leaveTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                        {type.name}
                      </div>
                    </TableCell>
                    <TableCell>{type.code}</TableCell>
                    <TableCell className="capitalize">{type.accrual_unit}</TableCell>
                    <TableCell>{type.default_annual_entitlement} {type.accrual_unit}</TableCell>
                    <TableCell>
                      <Badge variant={type.is_accrual_based ? "default" : "secondary"}>
                        {type.is_accrual_based ? t("leave.leaveTypes.yes") : t("leave.leaveTypes.no")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.accrues_leave_while_on ? "default" : "destructive"}>
                        {type.accrues_leave_while_on ? t("leave.leaveTypes.yes") : t("leave.leaveTypes.no")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.requires_approval ? "default" : "secondary"}>
                        {type.requires_approval ? t("leave.leaveTypes.yes") : t("leave.leaveTypes.no")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.is_active ? "default" : "secondary"}>
                        {type.is_active ? t("leave.leaveTypes.active") : t("leave.leaveTypes.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
