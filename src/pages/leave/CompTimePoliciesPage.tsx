import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings, Plus, Pencil } from "lucide-react";
import { useCompensatoryTime, CompTimePolicy } from "@/hooks/useCompensatoryTime";
import { useAuth } from "@/contexts/AuthContext";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { format } from "date-fns";

const breadcrumbItems = [
  { label: "Leave", href: "/leave" },
  { label: "Comp Time Policies" },
];

const expiryTypeLabels: Record<string, string> = {
  configurable: 'Custom Period',
  no_expiry: 'No Expiry',
  year_end_reset: 'Year End Reset',
};

export default function CompTimePoliciesPage() {
  const { company } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");
  const { policies, loadingPolicies, createPolicy, updatePolicy } = useCompensatoryTime(selectedCompanyId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CompTimePolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expiry_type: 'no_expiry' as 'configurable' | 'no_expiry' | 'year_end_reset',
    expiry_days: '',
    max_balance_hours: '',
    requires_approval: true,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      expiry_type: 'no_expiry',
      expiry_days: '',
      max_balance_hours: '',
      requires_approval: true,
      is_active: true,
    });
    setEditingPolicy(null);
  };

  const handleEdit = (policy: CompTimePolicy) => {
    setFormData({
      name: policy.name,
      description: policy.description || '',
      expiry_type: policy.expiry_type,
      expiry_days: policy.expiry_days?.toString() || '',
      max_balance_hours: policy.max_balance_hours?.toString() || '',
      requires_approval: policy.requires_approval,
      is_active: policy.is_active,
    });
    setEditingPolicy(policy);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      description: formData.description || null,
      expiry_type: formData.expiry_type,
      expiry_days: formData.expiry_type === 'configurable' && formData.expiry_days 
        ? parseInt(formData.expiry_days) : null,
      max_balance_hours: formData.max_balance_hours ? parseFloat(formData.max_balance_hours) : null,
      requires_approval: formData.requires_approval,
      is_active: formData.is_active,
      company_id: selectedCompanyId,
    };

    if (editingPolicy) {
      await updatePolicy.mutateAsync({ id: editingPolicy.id, ...payload });
    } else {
      await createPolicy.mutateAsync(payload);
    }

    setDialogOpen(false);
    resetForm();
  };

  const isValid = formData.name.trim() && selectedCompanyId;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Comp Time Policies</h1>
              <p className="text-muted-foreground">Configure compensatory time off rules</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>
              Manage how compensatory time is earned, tracked, and expires
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPolicies ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : policies.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No policies configured</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Expiry Type</TableHead>
                    <TableHead>Max Balance</TableHead>
                    <TableHead>Requires Approval</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          {policy.description && (
                            <p className="text-sm text-muted-foreground">{policy.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {expiryTypeLabels[policy.expiry_type]}
                          {policy.expiry_type === 'configurable' && policy.expiry_days && (
                            <span className="ml-1">({policy.expiry_days} days)</span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {policy.max_balance_hours 
                          ? `${policy.max_balance_hours} hrs` 
                          : 'Unlimited'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.requires_approval ? 'default' : 'secondary'}>
                          {policy.requires_approval ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.is_active ? 'default' : 'secondary'}>
                          {policy.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(policy)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Add Policy'}</DialogTitle>
            <DialogDescription>
              Configure compensatory time policy settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Policy Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Comp Time"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Policy description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Expiry Type</Label>
              <Select 
                value={formData.expiry_type} 
                onValueChange={(v) => setFormData({ ...formData, expiry_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_expiry">No Expiry</SelectItem>
                  <SelectItem value="configurable">Custom Period (days)</SelectItem>
                  <SelectItem value="year_end_reset">Year End Reset</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.expiry_type === 'configurable' && (
              <div className="space-y-2">
                <Label>Expiry Days</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.expiry_days}
                  onChange={(e) => setFormData({ ...formData, expiry_days: e.target.value })}
                  placeholder="e.g., 90"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Maximum Balance (hours)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={formData.max_balance_hours}
                onChange={(e) => setFormData({ ...formData, max_balance_hours: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Requires Approval</Label>
              <Switch
                checked={formData.requires_approval}
                onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isValid || createPolicy.isPending || updatePolicy.isPending}
            >
              {editingPolicy ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
