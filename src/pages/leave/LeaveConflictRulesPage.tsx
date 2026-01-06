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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Users, AlertTriangle, Loader2 } from "lucide-react";
import { useLeaveConflictRules, LeaveConflictRule } from "@/hooks/useLeaveEnhancements";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function LeaveConflictRulesPage() {
  const { t } = useLanguage();
  const { company } = useAuth();
  const { conflictRules, isLoading, createRule, updateRule, deleteRule } = useLeaveConflictRules(company?.id);
  
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", company?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", company?.id)
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
    enabled: !!company?.id,
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<LeaveConflictRule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rule_type: "percentage" as LeaveConflictRule['rule_type'],
    department_id: "",
    max_concurrent_percentage: 25,
    max_concurrent_count: 2,
    warning_threshold_percentage: 20,
    block_threshold_percentage: 30,
    min_coverage_required: 1,
    is_warning_only: true,
    is_active: true,
  });

  const handleEdit = (item: LeaveConflictRule) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      rule_type: item.rule_type,
      department_id: item.department_id || "",
      max_concurrent_percentage: item.max_concurrent_percentage,
      max_concurrent_count: item.max_concurrent_count || 2,
      warning_threshold_percentage: item.warning_threshold_percentage,
      block_threshold_percentage: item.block_threshold_percentage,
      min_coverage_required: item.min_coverage_required,
      is_warning_only: item.is_warning_only,
      is_active: item.is_active,
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      department_id: formData.department_id || null,
    };
    
    if (editingItem) {
      await updateRule.mutateAsync({ id: editingItem.id, ...payload });
    } else {
      await createRule.mutateAsync(payload);
    }
    setShowDialog(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this conflict rule?")) {
      await deleteRule.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      rule_type: "percentage",
      department_id: "",
      max_concurrent_percentage: 25,
      max_concurrent_count: 2,
      warning_threshold_percentage: 20,
      block_threshold_percentage: 30,
      min_coverage_required: 1,
      is_warning_only: true,
      is_active: true,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.leave"), href: "/leave" },
          { label: "Conflict Rules" }
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Team Conflict Rules
            </h1>
            <p className="text-muted-foreground">Configure team coverage requirements and concurrent leave limits</p>
          </div>
          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : conflictRules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No conflict rules configured</p>
                <p className="text-sm">Add rules to manage team coverage during leave periods</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Thresholds</TableHead>
                    <TableHead>Enforcement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conflictRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          {rule.description && (
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {rule.department?.name || <span className="text-muted-foreground">All Departments</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rule.rule_type === 'percentage' ? 'Percentage' : 
                           rule.rule_type === 'absolute' ? 'Absolute Count' : 'Critical Roles'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rule.rule_type === 'percentage' ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                              Warning: {rule.warning_threshold_percentage}%
                            </div>
                            <div className="flex items-center gap-1 text-destructive">
                              <AlertTriangle className="h-3 w-3" />
                              Block: {rule.block_threshold_percentage}%
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            Max {rule.max_concurrent_count} concurrent
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.is_warning_only ? "secondary" : "destructive"}>
                          {rule.is_warning_only ? "Warning Only" : "Blocking"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? "default" : "outline"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(rule.id)}
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
            <DialogTitle>{editingItem ? "Edit Conflict Rule" : "Add Conflict Rule"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rule Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Engineering Team Coverage"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain this rule..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select value={formData.rule_type} onValueChange={(v: any) => setFormData({ ...formData, rule_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Based</SelectItem>
                    <SelectItem value="absolute">Absolute Count</SelectItem>
                    <SelectItem value="critical_roles">Critical Roles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.rule_type === 'percentage' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Warning Threshold (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.warning_threshold_percentage}
                    onChange={(e) => setFormData({ ...formData, warning_threshold_percentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Block Threshold (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.block_threshold_percentage}
                    onChange={(e) => setFormData({ ...formData, block_threshold_percentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Max Concurrent Employees on Leave</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.max_concurrent_count}
                  onChange={(e) => setFormData({ ...formData, max_concurrent_count: parseInt(e.target.value) || 1 })}
                />
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Warning Only</Label>
                  <p className="text-xs text-muted-foreground">Show warning but allow submission</p>
                </div>
                <Switch
                  checked={formData.is_warning_only}
                  onCheckedChange={(v) => setFormData({ ...formData, is_warning_only: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">Enable this rule</p>
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
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
