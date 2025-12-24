import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Lock, Shield, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GoalLockingRule {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  rule_type: string;
  trigger_status: string[] | null;
  allow_admin_override: boolean;
  allow_adjustment_request: boolean;
  lock_fields: string[] | null;
  is_active: boolean;
  priority: number;
}

interface GoalLockingRulesManagerProps {
  companyId: string;
}

const ruleTypes = [
  { value: "on_approval", label: "Lock on Approval", description: "Lock goals when they receive final approval" },
  { value: "on_cycle_freeze", label: "Lock on Cycle Freeze", description: "Lock when goal cycle reaches freeze date" },
  { value: "on_status_change", label: "Lock on Status Change", description: "Lock when goal reaches specific status" },
  { value: "manual_only", label: "Manual Only", description: "Only lock goals manually (no auto-lock)" },
];

const goalStatuses = [
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const lockableFields = [
  { value: "name", label: "Goal Name" },
  { value: "description", label: "Description" },
  { value: "target_value", label: "Target Value" },
  { value: "weighting", label: "Weighting" },
  { value: "start_date", label: "Start Date" },
  { value: "end_date", label: "End Date" },
];

export function GoalLockingRulesManager({ companyId }: GoalLockingRulesManagerProps) {
  const [rules, setRules] = useState<GoalLockingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<GoalLockingRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rule_type: "on_approval",
    trigger_status: [] as string[],
    allow_admin_override: true,
    allow_adjustment_request: true,
    lock_fields: [] as string[],
    is_active: true,
    priority: 0,
  });

  useEffect(() => {
    fetchRules();
  }, [companyId]);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_locking_rules")
        .select("*")
        .eq("company_id", companyId)
        .order("priority", { ascending: false });
      
      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error("Error fetching locking rules:", error);
      toast.error("Failed to load locking rules");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (rule?: GoalLockingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || "",
        rule_type: rule.rule_type,
        trigger_status: rule.trigger_status || [],
        allow_admin_override: rule.allow_admin_override,
        allow_adjustment_request: rule.allow_adjustment_request,
        lock_fields: rule.lock_fields || [],
        is_active: rule.is_active,
        priority: rule.priority,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: "",
        description: "",
        rule_type: "on_approval",
        trigger_status: [],
        allow_admin_override: true,
        allow_adjustment_request: true,
        lock_fields: [],
        is_active: true,
        priority: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please enter a rule name");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        company_id: companyId,
        name: formData.name,
        description: formData.description || null,
        rule_type: formData.rule_type,
        trigger_status: formData.trigger_status.length > 0 ? formData.trigger_status : null,
        allow_admin_override: formData.allow_admin_override,
        allow_adjustment_request: formData.allow_adjustment_request,
        lock_fields: formData.lock_fields.length > 0 ? formData.lock_fields : null,
        is_active: formData.is_active,
        priority: formData.priority,
      };

      if (editingRule) {
        const { error } = await supabase
          .from("goal_locking_rules")
          .update(payload)
          .eq("id", editingRule.id);
        if (error) throw error;
        toast.success("Locking rule updated");
      } else {
        const { error } = await supabase
          .from("goal_locking_rules")
          .insert(payload);
        if (error) throw error;
        toast.success("Locking rule created");
      }
      
      setDialogOpen(false);
      fetchRules();
    } catch (error) {
      console.error("Error saving locking rule:", error);
      toast.error("Failed to save locking rule");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this locking rule? Goals will no longer auto-lock using this rule.")) return;
    
    try {
      const { error } = await supabase
        .from("goal_locking_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Locking rule deleted");
      fetchRules();
    } catch (error) {
      console.error("Error deleting locking rule:", error);
      toast.error("Failed to delete locking rule");
    }
  };

  const toggleStatus = (status: string) => {
    setFormData(prev => ({
      ...prev,
      trigger_status: prev.trigger_status.includes(status)
        ? prev.trigger_status.filter(s => s !== status)
        : [...prev.trigger_status, status]
    }));
  };

  const toggleField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      lock_fields: prev.lock_fields.includes(field)
        ? prev.lock_fields.filter(f => f !== field)
        : [...prev.lock_fields, field]
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Goal Locking Rules
            </CardTitle>
            <CardDescription>
              Configure when goals are automatically locked to prevent edits
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Locking rules prevent unauthorized changes to goals after key milestones. Rules are evaluated by priority (highest first).
            </AlertDescription>
          </Alert>
          
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No locking rules configured. Goals will not be automatically locked.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rule Type</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Override</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      {ruleTypes.find(t => t.value === rule.rule_type)?.label || rule.rule_type}
                    </TableCell>
                    <TableCell>
                      {rule.rule_type === "on_status_change" && rule.trigger_status ? (
                        <div className="flex gap-1 flex-wrap">
                          {rule.trigger_status.map(s => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {rule.allow_admin_override ? (
                        <Badge variant="secondary">Admin can override</Badge>
                      ) : (
                        <Badge variant="destructive">No override</Badge>
                      )}
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Locking Rule" : "Create Locking Rule"}</DialogTitle>
            <DialogDescription>
              Configure when and how goals should be locked
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Lock on Final Approval"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain when this rule applies..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_type">Rule Type</Label>
              <Select value={formData.rule_type} onValueChange={(v) => setFormData({ ...formData, rule_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ruleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.rule_type === "on_status_change" && (
              <div className="border rounded-lg p-4 space-y-3">
                <Label>Trigger on these statuses:</Label>
                <div className="flex flex-wrap gap-4">
                  {goalStatuses.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={formData.trigger_status.includes(status.value)}
                        onCheckedChange={() => toggleStatus(status.value)}
                      />
                      <Label htmlFor={`status-${status.value}`} className="text-sm">
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border rounded-lg p-4 space-y-3">
              <Label>Lock specific fields only (leave empty to lock all):</Label>
              <div className="grid grid-cols-2 gap-2">
                {lockableFields.map((field) => (
                  <div key={field.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.value}`}
                      checked={formData.lock_fields.includes(field.value)}
                      onCheckedChange={() => toggleField(field.value)}
                    />
                    <Label htmlFor={`field-${field.value}`} className="text-sm">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">Higher priority rules are evaluated first</p>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Override Options
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_admin_override">Allow Admin Override</Label>
                    <p className="text-xs text-muted-foreground">Admins can unlock goals if needed</p>
                  </div>
                  <Switch
                    id="allow_admin_override"
                    checked={formData.allow_admin_override}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_admin_override: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_adjustment_request">Allow Adjustment Requests</Label>
                    <p className="text-xs text-muted-foreground">Users can request goal adjustments after lock</p>
                  </div>
                  <Switch
                    id="allow_adjustment_request"
                    checked={formData.allow_adjustment_request}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_adjustment_request: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Rule is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : editingRule ? "Update Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
