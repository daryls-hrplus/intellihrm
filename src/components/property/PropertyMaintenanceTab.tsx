import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { Plus, Wrench, Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { getTodayString } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

interface Props { companyId?: string; }
const MAINTENANCE_TYPES = ["repair", "inspection", "upgrade", "cleaning", "calibration"];
const STATUSES = ["scheduled", "in_progress", "completed", "cancelled"];

const PropertyMaintenanceTab = ({ companyId }: Props) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({ property_id: "", maintenance_type: "repair", title: "", description: "", vendor: "", cost: "", currency: "USD", scheduled_date: "", performed_by: "", notes: "" });

  const { items, maintenance, loadingMaintenance, createMaintenance, updateMaintenance } = usePropertyManagement(companyId);
  const filteredMaintenance = maintenance.filter((m) => statusFilter === "all" || m.status === statusFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMaintenance.mutateAsync({
      property_id: formData.property_id, maintenance_type: formData.maintenance_type, title: formData.title,
      description: formData.description || null, vendor: formData.vendor || null, cost: formData.cost ? parseFloat(formData.cost) : null,
      currency: formData.currency, scheduled_date: formData.scheduled_date || null, performed_by: formData.performed_by || null,
      notes: formData.notes || null, status: "scheduled", created_by: user?.id,
    });
    setIsDialogOpen(false);
    setFormData({ property_id: "", maintenance_type: "repair", title: "", description: "", vendor: "", cost: "", currency: "USD", scheduled_date: "", performed_by: "", notes: "" });
  };

  const handleComplete = async (id: string) => { await updateMaintenance.mutateAsync({ id, status: "completed", completed_date: getTodayString() }); };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-info/10 text-info border-info/20";
      case "in_progress": return "bg-warning/10 text-warning border-warning/20";
      case "completed": return "bg-success/10 text-success border-success/20";
      case "cancelled": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  if (loadingMaintenance) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />{t("companyProperty.maintenance.title")}</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={t("common.allStatus")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allStatus")}</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`companyProperty.maintenance.statuses.${s}`)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />{t("companyProperty.maintenance.scheduleMaintenance")}</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{t("companyProperty.maintenance.scheduleMaintenanceTitle")}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>{t("companyProperty.assignments.asset")} *</Label>
                  <Select value={formData.property_id} onValueChange={(v) => setFormData({ ...formData, property_id: v })} required>
                    <SelectTrigger><SelectValue placeholder={t("companyProperty.assignments.selectAsset")} /></SelectTrigger>
                    <SelectContent>{items.map((item) => <SelectItem key={item.id} value={item.id}>{item.asset_tag} - {item.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t("companyProperty.maintenance.maintenanceType")} *</Label>
                    <Select value={formData.maintenance_type} onValueChange={(v) => setFormData({ ...formData, maintenance_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{MAINTENANCE_TYPES.map((t2) => <SelectItem key={t2} value={t2}>{t(`companyProperty.maintenance.types.${t2}`)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t("companyProperty.maintenance.scheduledDate")}</Label><Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>{t("common.name")} *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
                <div className="space-y-2"><Label>{t("common.description")}</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t("companyProperty.maintenance.vendor")}</Label><Input value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} /></div>
                  <div className="space-y-2"><Label>{t("companyProperty.maintenance.performedBy")}</Label><Input value={formData.performed_by} onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t("companyProperty.maintenance.cost")}</Label><Input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} /></div>
                  <div className="space-y-2"><Label>{t("common.currency")}</Label><Input value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" disabled={createMaintenance.isPending}>{createMaintenance.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("companyProperty.maintenance.schedule")}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMaintenance.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>{t("companyProperty.maintenance.noMaintenance")}</p><p className="text-sm">{t("companyProperty.maintenance.noMaintenanceHint")}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>{t("companyProperty.assignments.asset")}</TableHead><TableHead>{t("common.name")}</TableHead><TableHead>{t("companyProperty.maintenance.maintenanceType")}</TableHead><TableHead>{t("companyProperty.maintenance.vendor")}</TableHead><TableHead>{t("companyProperty.maintenance.scheduled")}</TableHead><TableHead>{t("companyProperty.maintenance.cost")}</TableHead><TableHead>{t("common.status")}</TableHead><TableHead>{t("common.actions")}</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredMaintenance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell><div><p className="font-medium">{record.property?.name}</p><p className="text-xs text-muted-foreground font-mono">{record.property?.asset_tag}</p></div></TableCell>
                    <TableCell><div><p className="font-medium">{record.title}</p>{record.description && <p className="text-xs text-muted-foreground line-clamp-1">{record.description}</p>}</div></TableCell>
                    <TableCell>{t(`companyProperty.maintenance.types.${record.maintenance_type}`)}</TableCell>
                    <TableCell>{record.vendor || "-"}</TableCell>
                    <TableCell>{record.scheduled_date ? format(new Date(record.scheduled_date), "PP") : "-"}</TableCell>
                    <TableCell>{record.cost ? `${record.currency} ${record.cost.toLocaleString()}` : "-"}</TableCell>
                    <TableCell><Badge variant="outline" className={getStatusColor(record.status)}>{t(`companyProperty.maintenance.statuses.${record.status}`)}</Badge></TableCell>
                    <TableCell>
                      {(record.status === "scheduled" || record.status === "in_progress") && (<Button variant="outline" size="sm" className="gap-1" onClick={() => handleComplete(record.id)}><Check className="h-3 w-3" />{t("companyProperty.maintenance.complete")}</Button>)}
                      {record.status === "completed" && record.completed_date && <span className="text-xs text-muted-foreground">{format(new Date(record.completed_date), "PP")}</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyMaintenanceTab;
