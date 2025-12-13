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
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  companyId?: string;
}

const MAINTENANCE_TYPES = ["repair", "inspection", "upgrade", "cleaning", "calibration"];
const STATUSES = ["scheduled", "in_progress", "completed", "cancelled"];

const PropertyMaintenanceTab = ({ companyId }: Props) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    property_id: "",
    maintenance_type: "repair",
    title: "",
    description: "",
    vendor: "",
    cost: "",
    currency: "USD",
    scheduled_date: "",
    performed_by: "",
    notes: "",
  });

  const { items, maintenance, loadingMaintenance, createMaintenance, updateMaintenance } = usePropertyManagement(companyId);

  const filteredMaintenance = maintenance.filter((m) => {
    if (statusFilter === "all") return true;
    return m.status === statusFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMaintenance.mutateAsync({
      property_id: formData.property_id,
      maintenance_type: formData.maintenance_type,
      title: formData.title,
      description: formData.description || null,
      vendor: formData.vendor || null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      currency: formData.currency,
      scheduled_date: formData.scheduled_date || null,
      performed_by: formData.performed_by || null,
      notes: formData.notes || null,
      status: "scheduled",
      created_by: user?.id,
    });
    setIsDialogOpen(false);
    setFormData({
      property_id: "",
      maintenance_type: "repair",
      title: "",
      description: "",
      vendor: "",
      cost: "",
      currency: "USD",
      scheduled_date: "",
      performed_by: "",
      notes: "",
    });
  };

  const handleComplete = async (id: string) => {
    await updateMaintenance.mutateAsync({
      id,
      status: "completed",
      completed_date: new Date().toISOString().split("T")[0],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-info/10 text-info border-info/20";
      case "in_progress": return "bg-warning/10 text-warning border-warning/20";
      case "completed": return "bg-success/10 text-success border-success/20";
      case "cancelled": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  if (loadingMaintenance) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Maintenance Records
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s.replace("_", " ").charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Schedule Maintenance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset *</Label>
                  <Select value={formData.property_id} onValueChange={(v) => setFormData({ ...formData, property_id: v })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.asset_tag} - {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={formData.maintenance_type} onValueChange={(v) => setFormData({ ...formData, maintenance_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MAINTENANCE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vendor</Label>
                    <Input
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Performed By</Label>
                    <Input
                      value={formData.performed_by}
                      onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMaintenance.isPending}>
                    {createMaintenance.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Schedule
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMaintenance.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No maintenance records found</p>
            <p className="text-sm">Schedule maintenance for your assets</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.property?.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{record.property?.asset_tag}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.title}</p>
                        {record.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{record.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{record.maintenance_type}</TableCell>
                    <TableCell>{record.vendor || "-"}</TableCell>
                    <TableCell>
                      {record.scheduled_date 
                        ? format(new Date(record.scheduled_date), "PP")
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      {record.cost 
                        ? `${record.currency} ${record.cost.toLocaleString()}`
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(record.status)}>
                        {record.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(record.status === "scheduled" || record.status === "in_progress") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleComplete(record.id)}
                        >
                          <Check className="h-3 w-3" />
                          Complete
                        </Button>
                      )}
                      {record.status === "completed" && record.completed_date && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(record.completed_date), "PP")}
                        </span>
                      )}
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
