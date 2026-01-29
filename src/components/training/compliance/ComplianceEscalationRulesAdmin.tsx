import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, AlertTriangle, Bell, Clock, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface EscalationRule {
  id: string;
  company_id: string;
  tier_level: number;
  tier_name: string;
  days_overdue_min: number;
  days_overdue_max: number | null;
  notification_roles: string[];
  notification_template_id: string | null;
  sla_hours: number;
  actions: Json;
  escalate_to_role: string | null;
  include_hr_partner: boolean;
  include_department_head: boolean;
  auto_restrict_access: boolean;
  is_active: boolean;
}

interface ComplianceEscalationRulesAdminProps {
  companyId: string;
}

const TIER_COLORS: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800 border-yellow-300",
  2: "bg-orange-100 text-orange-800 border-orange-300",
  3: "bg-red-100 text-red-800 border-red-300",
  4: "bg-purple-100 text-purple-800 border-purple-300",
};

const TIER_ICONS: Record<number, typeof AlertTriangle> = {
  1: Clock,
  2: Bell,
  3: AlertTriangle,
  4: Shield,
};

const DEFAULT_RULES = [
  {
    tier_level: 1,
    tier_name: "Initial Warning",
    days_overdue_min: 1,
    days_overdue_max: 7,
    notification_roles: ["employee"],
    sla_hours: 24,
    actions: { send_reminder: true },
    escalate_to_role: null,
    include_hr_partner: false,
    include_department_head: false,
    auto_restrict_access: false,
    is_active: true,
  },
  {
    tier_level: 2,
    tier_name: "Manager Alert",
    days_overdue_min: 8,
    days_overdue_max: 14,
    notification_roles: ["employee", "manager"],
    sla_hours: 48,
    actions: { send_reminder: true, notify_manager: true },
    escalate_to_role: "manager",
    include_hr_partner: false,
    include_department_head: false,
    auto_restrict_access: false,
    is_active: true,
  },
  {
    tier_level: 3,
    tier_name: "HR Escalation",
    days_overdue_min: 15,
    days_overdue_max: 30,
    notification_roles: ["employee", "manager", "hr"],
    sla_hours: 72,
    actions: { send_reminder: true, notify_manager: true, notify_hr: true },
    escalate_to_role: "hr",
    include_hr_partner: true,
    include_department_head: false,
    auto_restrict_access: true,
    is_active: true,
  },
  {
    tier_level: 4,
    tier_name: "Executive Review",
    days_overdue_min: 31,
    days_overdue_max: null,
    notification_roles: ["employee", "manager", "hr", "executive"],
    sla_hours: 24,
    actions: { send_reminder: true, notify_all: true, disciplinary_flag: true },
    escalate_to_role: "executive",
    include_hr_partner: true,
    include_department_head: true,
    auto_restrict_access: true,
    is_active: true,
  },
];

export function ComplianceEscalationRulesAdmin({ companyId }: ComplianceEscalationRulesAdminProps) {
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EscalationRule | null>(null);
  const [formData, setFormData] = useState({
    tier_level: 1,
    tier_name: "",
    days_overdue_min: 1,
    days_overdue_max: "",
    notification_roles: "employee",
    sla_hours: 24,
    include_hr_partner: false,
    include_department_head: false,
    auto_restrict_access: false,
    is_active: true,
  });

  useEffect(() => {
    if (companyId) loadRules();
  }, [companyId]);

  const loadRules = async () => {
    setLoading(true);
    // @ts-ignore - Supabase type instantiation issue
    const { data, error } = await supabase
      .from("compliance_escalation_rules")
      .select("*")
      .eq("company_id", companyId)
      .order("tier_level");

    if (error) {
      console.error("Error loading escalation rules:", error);
      toast.error("Failed to load escalation rules");
    } else {
      setRules(data || []);
    }
    setLoading(false);
  };

  const initializeDefaultRules = async () => {
    const rulesWithCompanyId = DEFAULT_RULES.map((rule) => ({
      ...rule,
      company_id: companyId,
    }));

    // @ts-ignore - Supabase type instantiation issue
    const { error } = await supabase
      .from("compliance_escalation_rules")
      .insert(rulesWithCompanyId);

    if (error) {
      toast.error("Failed to initialize default rules");
    } else {
      toast.success("Default escalation rules created");
      loadRules();
    }
  };

  const openEdit = (rule: EscalationRule) => {
    setEditingRule(rule);
    setFormData({
      tier_level: rule.tier_level,
      tier_name: rule.tier_name,
      days_overdue_min: rule.days_overdue_min,
      days_overdue_max: rule.days_overdue_max?.toString() || "",
      notification_roles: rule.notification_roles.join(", "),
      sla_hours: rule.sla_hours,
      include_hr_partner: rule.include_hr_partner,
      include_department_head: rule.include_department_head,
      auto_restrict_access: rule.auto_restrict_access,
      is_active: rule.is_active,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingRule(null);
    const nextTier = rules.length > 0 ? Math.max(...rules.map((r) => r.tier_level)) + 1 : 1;
    setFormData({
      tier_level: nextTier,
      tier_name: "",
      days_overdue_min: 1,
      days_overdue_max: "",
      notification_roles: "employee",
      sla_hours: 24,
      include_hr_partner: false,
      include_department_head: false,
      auto_restrict_access: false,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.tier_name) {
      toast.error("Tier name is required");
      return;
    }

    const payload = {
      company_id: companyId,
      tier_level: formData.tier_level,
      tier_name: formData.tier_name,
      days_overdue_min: formData.days_overdue_min,
      days_overdue_max: formData.days_overdue_max ? parseInt(formData.days_overdue_max) : null,
      notification_roles: formData.notification_roles.split(",").map((r) => r.trim()),
      sla_hours: formData.sla_hours,
      include_hr_partner: formData.include_hr_partner,
      include_department_head: formData.include_department_head,
      auto_restrict_access: formData.auto_restrict_access,
      is_active: formData.is_active,
      actions: {},
    };

    if (editingRule) {
      // @ts-ignore - Supabase type instantiation issue
      const { error } = await supabase
        .from("compliance_escalation_rules")
        .update(payload)
        .eq("id", editingRule.id);
      if (error) {
        toast.error("Failed to update rule");
      } else {
        toast.success("Rule updated successfully");
        setDialogOpen(false);
        loadRules();
      }
    } else {
      // @ts-ignore - Supabase type instantiation issue
      const { error } = await supabase.from("compliance_escalation_rules").insert(payload);
      if (error) {
        toast.error("Failed to create rule");
      } else {
        toast.success("Rule created successfully");
        setDialogOpen(false);
        loadRules();
      }
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this escalation rule?")) return;

    const { error } = await supabase.from("compliance_escalation_rules").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete rule");
    } else {
      toast.success("Rule deleted");
      loadRules();
    }
  };

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading escalation rules...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Escalation Rules Configuration
            </CardTitle>
            <CardDescription>
              Define escalation tiers for overdue compliance training. Each tier triggers progressively stronger actions.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {rules.length === 0 && (
              <Button variant="outline" onClick={initializeDefaultRules}>
                <Shield className="h-4 w-4 mr-2" />
                Initialize Defaults
              </Button>
            )}
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No escalation rules configured.</p>
              <p className="text-sm">Click "Initialize Defaults" to create the standard 4-tier escalation model.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Notify</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Restrict Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => {
                  const TierIcon = TIER_ICONS[rule.tier_level] || AlertTriangle;
                  return (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Badge className={TIER_COLORS[rule.tier_level] || "bg-muted"}>
                          <TierIcon className="h-3 w-3 mr-1" />
                          Tier {rule.tier_level}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{rule.tier_name}</TableCell>
                      <TableCell>
                        {rule.days_overdue_min}
                        {rule.days_overdue_max ? `-${rule.days_overdue_max}` : "+"} days
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {rule.notification_roles.length} roles
                        </div>
                      </TableCell>
                      <TableCell>{rule.sla_hours}h</TableCell>
                      <TableCell>
                        <Switch checked={rule.auto_restrict_access} disabled />
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(rule)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteRule(rule.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Escalation Rule" : "Add Escalation Tier"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier Level</Label>
                <Input
                  type="number"
                  min={1}
                  max={4}
                  value={formData.tier_level}
                  onChange={(e) => setFormData({ ...formData, tier_level: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tier Name *</Label>
                <Input
                  value={formData.tier_name}
                  onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
                  placeholder="e.g., Manager Alert"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Days Overdue (Min)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.days_overdue_min}
                  onChange={(e) => setFormData({ ...formData, days_overdue_min: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Days Overdue (Max)</Label>
                <Input
                  type="number"
                  value={formData.days_overdue_max}
                  onChange={(e) => setFormData({ ...formData, days_overdue_max: e.target.value })}
                  placeholder="Leave empty for no limit"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notification Roles</Label>
              <Input
                value={formData.notification_roles}
                onChange={(e) => setFormData({ ...formData, notification_roles: e.target.value })}
                placeholder="employee, manager, hr, executive"
              />
              <p className="text-xs text-muted-foreground">Comma-separated list of roles to notify</p>
            </div>
            <div className="space-y-2">
              <Label>SLA (hours)</Label>
              <Input
                type="number"
                min={1}
                value={formData.sla_hours}
                onChange={(e) => setFormData({ ...formData, sla_hours: parseInt(e.target.value) || 24 })}
              />
              <p className="text-xs text-muted-foreground">Time allowed before auto-escalation to next tier</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.include_hr_partner}
                  onCheckedChange={(c) => setFormData({ ...formData, include_hr_partner: c })}
                />
                <Label>Include HR Partner</Label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.include_department_head}
                  onCheckedChange={(c) => setFormData({ ...formData, include_department_head: c })}
                />
                <Label>Include Department Head</Label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.auto_restrict_access}
                  onCheckedChange={(c) => setFormData({ ...formData, auto_restrict_access: c })}
                />
                <Label>Auto-restrict system access</Label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingRule ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
