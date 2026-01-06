import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Calendar, ShieldAlert, Loader2 } from "lucide-react";
import { useLeaveBlackouts, LeaveBlackoutPeriod } from "@/hooks/useLeaveEnhancements";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useLanguage } from "@/hooks/useLanguage";

export default function LeaveBlackoutPeriodsPage() {
  const { t } = useLanguage();
  const { company } = useAuth();
  const { blackoutPeriods, isLoading, createBlackout, updateBlackout, deleteBlackout } = useLeaveBlackouts(company?.id);
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<LeaveBlackoutPeriod | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    applies_to_all: true,
    is_hard_block: false,
    requires_override_approval: true,
    is_recurring: false,
    is_active: true,
  });

  const handleEdit = (item: LeaveBlackoutPeriod) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      start_date: item.start_date,
      end_date: item.end_date,
      applies_to_all: item.applies_to_all,
      is_hard_block: item.is_hard_block,
      requires_override_approval: item.requires_override_approval,
      is_recurring: item.is_recurring,
      is_active: item.is_active,
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (editingItem) {
      await updateBlackout.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createBlackout.mutateAsync(formData);
    }
    setShowDialog(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blackout period?")) {
      await deleteBlackout.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      applies_to_all: true,
      is_hard_block: false,
      requires_override_approval: true,
      is_recurring: false,
      is_active: true,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.leave"), href: "/leave" },
          { label: "Blackout Periods" }
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6" />
              Leave Blackout Periods
            </h1>
            <p className="text-muted-foreground">Configure dates when leave requests are restricted or blocked</p>
          </div>
          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Blackout Period
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : blackoutPeriods.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No blackout periods configured</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blackoutPeriods.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDateForDisplay(item.start_date)} - {formatDateForDisplay(item.end_date)}
                        </div>
                        {item.is_recurring && (
                          <Badge variant="outline" className="mt-1">Recurring</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_hard_block ? "destructive" : "secondary"}>
                          {item.is_hard_block ? "Hard Block" : "Soft Block"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "outline"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Blackout Period" : "Add Blackout Period"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Year-End Freeze, Peak Season"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain why this period is restricted..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Hard Block</Label>
                  <p className="text-xs text-muted-foreground">Completely prevent leave requests</p>
                </div>
                <Switch
                  checked={formData.is_hard_block}
                  onCheckedChange={(v) => setFormData({ ...formData, is_hard_block: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Override Approval</Label>
                  <p className="text-xs text-muted-foreground">Allow exceptions with approval</p>
                </div>
                <Switch
                  checked={formData.requires_override_approval}
                  onCheckedChange={(v) => setFormData({ ...formData, requires_override_approval: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Recurring Annually</Label>
                  <p className="text-xs text-muted-foreground">Repeat every year</p>
                </div>
                <Switch
                  checked={formData.is_recurring}
                  onCheckedChange={(v) => setFormData({ ...formData, is_recurring: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">Enable this blackout period</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.start_date || !formData.end_date}
            >
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
