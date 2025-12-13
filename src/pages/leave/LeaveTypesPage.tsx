import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement, LeaveType } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
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
  const { company } = useAuth();
  const { leaveTypes, loadingTypes, createLeaveType, updateLeaveType } = useLeaveManagement(company?.id);
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
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!company?.id) return;

    if (editingType) {
      await updateLeaveType.mutateAsync({ id: editingType.id, ...formData });
    } else {
      await createLeaveType.mutateAsync({ ...formData, company_id: company.id });
    }
    setIsOpen(false);
    resetForm();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Leave Management", href: "/leave" },
            { label: "Leave Types" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Types</h1>
              <p className="text-muted-foreground">Configure leave categories and settings</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Leave Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingType ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Annual Leave"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., ANNUAL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description of the leave type"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accrual_unit">Accrual Unit</Label>
                    <Select
                      value={formData.accrual_unit}
                      onValueChange={(value: "days" | "hours") => setFormData({ ...formData, accrual_unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_entitlement">Default Annual Entitlement</Label>
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
                    <Label htmlFor="min_request">Min Request Amount</Label>
                    <Input
                      id="min_request"
                      type="number"
                      step="0.5"
                      value={formData.min_request_amount}
                      onChange={(e) => setFormData({ ...formData, min_request_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_consecutive">Max Consecutive Days</Label>
                    <Input
                      id="max_consecutive"
                      type="number"
                      value={formData.max_consecutive_days || ""}
                      onChange={(e) => setFormData({ ...formData, max_consecutive_days: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advance_notice">Advance Notice Days</Label>
                    <Input
                      id="advance_notice"
                      type="number"
                      value={formData.advance_notice_days}
                      onChange={(e) => setFormData({ ...formData, advance_notice_days: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
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
                    <Label htmlFor="is_accrual_based">Accrual Based</Label>
                    <Switch
                      id="is_accrual_based"
                      checked={formData.is_accrual_based}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_accrual_based: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="requires_approval">Requires Approval</Label>
                    <Switch
                      id="requires_approval"
                      checked={formData.requires_approval}
                      onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="allows_negative">Allow Negative Balance</Label>
                    <Switch
                      id="allows_negative"
                      checked={formData.allows_negative_balance}
                      onCheckedChange={(checked) => setFormData({ ...formData, allows_negative_balance: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="can_be_encashed">Can Be Encashed</Label>
                    <Switch
                      id="can_be_encashed"
                      checked={formData.can_be_encashed}
                      onCheckedChange={(checked) => setFormData({ ...formData, can_be_encashed: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.name || !formData.code}>
                    {editingType ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Entitlement</TableHead>
                <TableHead>Accrual Based</TableHead>
                <TableHead>Approval Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingTypes ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : leaveTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No leave types configured. Add your first leave type to get started.
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
                        {type.is_accrual_based ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.requires_approval ? "default" : "secondary"}>
                        {type.requires_approval ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.is_active ? "default" : "secondary"}>
                        {type.is_active ? "Active" : "Inactive"}
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
