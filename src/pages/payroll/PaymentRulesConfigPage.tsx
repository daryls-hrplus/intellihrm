import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Plus, Save, Trash2, Settings2 } from "lucide-react";

interface PayrollRule {
  id: string;
  company_id: string;
  name: string;
  code: string;
  rule_type: string;
  overtime_multiplier: number | null;
  weekend_multiplier: number | null;
  holiday_multiplier: number | null;
  night_shift_multiplier: number | null;
  double_time_multiplier: number | null;
  double_half_multiplier: number | null;
  triple_time_multiplier: number | null;
  quadruple_time_multiplier: number | null;
  overtime_tier_1_threshold: number | null;
  overtime_tier_2_threshold: number | null;
  overtime_tier_3_threshold: number | null;
  overtime_tier_4_threshold: number | null;
  consecutive_day_threshold: number | null;
  consecutive_day_multiplier: number | null;
  is_active: boolean;
}

interface OvertimeRateTier {
  id: string;
  company_id: string;
  payroll_rule_id: string | null;
  tier_name: string;
  tier_code: string;
  min_hours: number;
  max_hours: number | null;
  multiplier: number;
  applies_to: string[];
  priority: number;
  is_active: boolean;
  description: string | null;
}

const DEFAULT_RULE: Partial<PayrollRule> = {
  name: "",
  code: "",
  rule_type: "overtime",
  overtime_multiplier: 1.5,
  weekend_multiplier: 2.0,
  holiday_multiplier: 2.5,
  night_shift_multiplier: 1.25,
  double_time_multiplier: 2.0,
  double_half_multiplier: 2.5,
  triple_time_multiplier: 3.0,
  quadruple_time_multiplier: 4.0,
  overtime_tier_1_threshold: 40,
  overtime_tier_2_threshold: 48,
  overtime_tier_3_threshold: 56,
  overtime_tier_4_threshold: 64,
  consecutive_day_threshold: 7,
  consecutive_day_multiplier: 2.0,
  is_active: true,
};

const DEFAULT_TIER: Partial<OvertimeRateTier> = {
  tier_name: "",
  tier_code: "",
  min_hours: 0,
  max_hours: null,
  multiplier: 1.5,
  applies_to: ["weekday"],
  priority: 1,
  is_active: true,
  description: "",
};

export default function PaymentRulesConfigPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [rules, setRules] = useState<PayrollRule[]>([]);
  const [tiers, setTiers] = useState<OvertimeRateTier[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch company from profile
  useEffect(() => {
    const fetchCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      if (data?.company_id) setSelectedCompany(data.company_id);
    };
    fetchCompany();
  }, []);
  const [saving, setSaving] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PayrollRule | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<PayrollRule>>(DEFAULT_RULE);
  const [editingTier, setEditingTier] = useState<Partial<OvertimeRateTier>>(DEFAULT_TIER);

  useEffect(() => {
    if (selectedCompany) {
      fetchRules();
      fetchTiers();
    }
  }, [selectedCompany]);

  const fetchRules = async () => {
    if (!selectedCompany) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("payroll_rules")
      .select("*")
      .eq("company_id", selectedCompany)
      .order("name");

    if (error) {
      console.error("Error fetching payroll rules:", error);
      toast.error("Failed to load payroll rules");
    } else {
      setRules(data || []);
    }
    setLoading(false);
  };

  const fetchTiers = async () => {
    if (!selectedCompany) return;

    const { data, error } = await supabase
      .from("overtime_rate_tiers")
      .select("*")
      .eq("company_id", selectedCompany)
      .order("priority");

    if (error) {
      console.error("Error fetching overtime tiers:", error);
    } else {
      setTiers(data || []);
    }
  };

  const handleSaveRule = async () => {
    if (!selectedCompany || !editingRule.name || !editingRule.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: editingRule.name,
        code: editingRule.code,
        rule_type: editingRule.rule_type || "overtime",
        overtime_multiplier: editingRule.overtime_multiplier,
        weekend_multiplier: editingRule.weekend_multiplier,
        holiday_multiplier: editingRule.holiday_multiplier,
        night_shift_multiplier: editingRule.night_shift_multiplier,
        double_time_multiplier: editingRule.double_time_multiplier,
        double_half_multiplier: editingRule.double_half_multiplier,
        triple_time_multiplier: editingRule.triple_time_multiplier,
        quadruple_time_multiplier: editingRule.quadruple_time_multiplier,
        overtime_tier_1_threshold: editingRule.overtime_tier_1_threshold,
        overtime_tier_2_threshold: editingRule.overtime_tier_2_threshold,
        overtime_tier_3_threshold: editingRule.overtime_tier_3_threshold,
        overtime_tier_4_threshold: editingRule.overtime_tier_4_threshold,
        consecutive_day_threshold: editingRule.consecutive_day_threshold,
        consecutive_day_multiplier: editingRule.consecutive_day_multiplier,
        is_active: editingRule.is_active ?? true,
        company_id: selectedCompany,
      };

      if (editingRule.id) {
        const { error } = await supabase
          .from("payroll_rules")
          .update(payload)
          .eq("id", editingRule.id);

        if (error) throw error;
        toast.success("Payroll rule updated");
      } else {
        const { error } = await supabase.from("payroll_rules").insert(payload);

        if (error) throw error;
        toast.success("Payroll rule created");
      }

      setIsRuleDialogOpen(false);
      setEditingRule(DEFAULT_RULE);
      fetchRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save payroll rule");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTier = async () => {
    if (!selectedCompany || !editingTier.tier_name || !editingTier.tier_code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        tier_name: editingTier.tier_name,
        tier_code: editingTier.tier_code,
        min_hours: editingTier.min_hours ?? 0,
        max_hours: editingTier.max_hours,
        multiplier: editingTier.multiplier ?? 1.5,
        applies_to: editingTier.applies_to || ["weekday"],
        priority: editingTier.priority ?? 1,
        is_active: editingTier.is_active ?? true,
        description: editingTier.description,
        company_id: selectedCompany,
        payroll_rule_id: editingTier.payroll_rule_id,
      };

      if (editingTier.id) {
        const { error } = await supabase
          .from("overtime_rate_tiers")
          .update(payload)
          .eq("id", editingTier.id);

        if (error) throw error;
        toast.success("Overtime tier updated");
      } else {
        const { error } = await supabase.from("overtime_rate_tiers").insert(payload);

        if (error) throw error;
        toast.success("Overtime tier created");
      }

      setIsTierDialogOpen(false);
      setEditingTier(DEFAULT_TIER);
      fetchTiers();
    } catch (error) {
      console.error("Error saving tier:", error);
      toast.error("Failed to save overtime tier");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    const { error } = await supabase
      .from("payroll_rules")
      .delete()
      .eq("id", ruleId);

    if (error) {
      toast.error("Failed to delete rule");
    } else {
      toast.success("Rule deleted");
      fetchRules();
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm("Are you sure you want to delete this tier?")) return;

    const { error } = await supabase
      .from("overtime_rate_tiers")
      .delete()
      .eq("id", tierId);

    if (error) {
      toast.error("Failed to delete tier");
    } else {
      toast.success("Tier deleted");
      fetchTiers();
    }
  };

  const openEditRule = (rule: PayrollRule) => {
    setEditingRule(rule);
    setIsRuleDialogOpen(true);
  };

  const openEditTier = (tier: OvertimeRateTier) => {
    setEditingTier(tier);
    setIsTierDialogOpen(true);
  };

  const getMultiplierBadge = (multiplier: number | null) => {
    if (!multiplier) return null;
    return (
      <Badge variant="outline" className="font-mono">
        {multiplier}x
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Payment Rules" }
          ]}
        />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Rules Configuration</h1>
            <p className="text-muted-foreground">
              Configure overtime multipliers, thresholds, and payment rate tiers
            </p>
          </div>
        </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Payroll Rules
          </TabsTrigger>
          <TabsTrigger value="tiers" className="gap-2">
            <Clock className="h-4 w-4" />
            Overtime Tiers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payroll Rules</CardTitle>
                  <CardDescription>
                    Define multipliers for different types of work hours
                  </CardDescription>
                </div>
                <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingRule(DEFAULT_RULE)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRule.id ? "Edit Payroll Rule" : "Create Payroll Rule"}
                      </DialogTitle>
                      <DialogDescription>
                        Configure overtime multipliers and thresholds
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Rule Name *</Label>
                          <Input
                            id="name"
                            value={editingRule.name || ""}
                            onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                            placeholder="Standard Overtime"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Code *</Label>
                          <Input
                            id="code"
                            value={editingRule.code || ""}
                            onChange={(e) => setEditingRule({ ...editingRule, code: e.target.value })}
                            placeholder="STD_OT"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rule_type">Rule Type</Label>
                        <Select
                          value={editingRule.rule_type || "overtime"}
                          onValueChange={(value) => setEditingRule({ ...editingRule, rule_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overtime">Overtime</SelectItem>
                            <SelectItem value="weekend">Weekend</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="night_shift">Night Shift</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Rate Multipliers
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Standard OT (1.5x)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingRule.overtime_multiplier ?? 1.5}
                              onChange={(e) => setEditingRule({ ...editingRule, overtime_multiplier: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Double Time (2x)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingRule.double_time_multiplier ?? 2.0}
                              onChange={(e) => setEditingRule({ ...editingRule, double_time_multiplier: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Double & Half (2.5x)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingRule.double_half_multiplier ?? 2.5}
                              onChange={(e) => setEditingRule({ ...editingRule, double_half_multiplier: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Triple Time (3x)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingRule.triple_time_multiplier ?? 3.0}
                              onChange={(e) => setEditingRule({ ...editingRule, triple_time_multiplier: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Quadruple Time (4x)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingRule.quadruple_time_multiplier ?? 4.0}
                              onChange={(e) => setEditingRule({ ...editingRule, quadruple_time_multiplier: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Weekend</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingRule.weekend_multiplier ?? 2.0}
                              onChange={(e) => setEditingRule({ ...editingRule, weekend_multiplier: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Holiday</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingRule.holiday_multiplier ?? 2.5}
                              onChange={(e) => setEditingRule({ ...editingRule, holiday_multiplier: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Night Shift</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingRule.night_shift_multiplier ?? 1.25}
                              onChange={(e) => setEditingRule({ ...editingRule, night_shift_multiplier: parseFloat(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Hour Thresholds (Weekly)
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tier 1 (Standard OT starts)</Label>
                            <Input
                              type="number"
                              value={editingRule.overtime_tier_1_threshold ?? 40}
                              onChange={(e) => setEditingRule({ ...editingRule, overtime_tier_1_threshold: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tier 2 (Double time starts)</Label>
                            <Input
                              type="number"
                              value={editingRule.overtime_tier_2_threshold ?? 48}
                              onChange={(e) => setEditingRule({ ...editingRule, overtime_tier_2_threshold: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tier 3 (Triple time starts)</Label>
                            <Input
                              type="number"
                              value={editingRule.overtime_tier_3_threshold ?? 56}
                              onChange={(e) => setEditingRule({ ...editingRule, overtime_tier_3_threshold: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tier 4 (Quadruple time starts)</Label>
                            <Input
                              type="number"
                              value={editingRule.overtime_tier_4_threshold ?? 64}
                              onChange={(e) => setEditingRule({ ...editingRule, overtime_tier_4_threshold: parseFloat(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium">Consecutive Day Rules</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Consecutive Days Threshold</Label>
                            <Input
                              type="number"
                              value={editingRule.consecutive_day_threshold ?? 7}
                              onChange={(e) => setEditingRule({ ...editingRule, consecutive_day_threshold: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Consecutive Day Multiplier</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingRule.consecutive_day_multiplier ?? 2.0}
                              onChange={(e) => setEditingRule({ ...editingRule, consecutive_day_multiplier: parseFloat(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingRule.is_active ?? true}
                          onCheckedChange={(checked) => setEditingRule({ ...editingRule, is_active: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveRule} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Rule"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payroll rules configured. Click "Add Rule" to create one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Standard</TableHead>
                      <TableHead>Double</TableHead>
                      <TableHead>Triple</TableHead>
                      <TableHead>Quad</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell className="font-mono text-sm">{rule.code}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{rule.rule_type}</Badge>
                        </TableCell>
                        <TableCell>{getMultiplierBadge(rule.overtime_multiplier)}</TableCell>
                        <TableCell>{getMultiplierBadge(rule.double_time_multiplier)}</TableCell>
                        <TableCell>{getMultiplierBadge(rule.triple_time_multiplier)}</TableCell>
                        <TableCell>{getMultiplierBadge(rule.quadruple_time_multiplier)}</TableCell>
                        <TableCell>
                          <Badge variant={rule.is_active ? "default" : "secondary"}>
                            {rule.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditRule(rule)}>
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteRule(rule.id)}
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
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overtime Rate Tiers</CardTitle>
                  <CardDescription>
                    Define flexible overtime tiers with hour ranges and multipliers
                  </CardDescription>
                </div>
                <Dialog open={isTierDialogOpen} onOpenChange={setIsTierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingTier(DEFAULT_TIER)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingTier.id ? "Edit Overtime Tier" : "Create Overtime Tier"}
                      </DialogTitle>
                      <DialogDescription>
                        Define hour ranges and corresponding multipliers
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tier Name *</Label>
                          <Input
                            value={editingTier.tier_name || ""}
                            onChange={(e) => setEditingTier({ ...editingTier, tier_name: e.target.value })}
                            placeholder="Time and a Half"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tier Code *</Label>
                          <Input
                            value={editingTier.tier_code || ""}
                            onChange={(e) => setEditingTier({ ...editingTier, tier_code: e.target.value })}
                            placeholder="OT_1_5X"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Min Hours</Label>
                          <Input
                            type="number"
                            value={editingTier.min_hours ?? 0}
                            onChange={(e) => setEditingTier({ ...editingTier, min_hours: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Hours (blank = unlimited)</Label>
                          <Input
                            type="number"
                            value={editingTier.max_hours ?? ""}
                            onChange={(e) => setEditingTier({ ...editingTier, max_hours: e.target.value ? parseFloat(e.target.value) : null })}
                            placeholder="No limit"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Multiplier *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editingTier.multiplier ?? 1.5}
                            onChange={(e) => setEditingTier({ ...editingTier, multiplier: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Priority (lower = applied first)</Label>
                        <Input
                          type="number"
                          value={editingTier.priority ?? 1}
                          onChange={(e) => setEditingTier({ ...editingTier, priority: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={editingTier.description || ""}
                          onChange={(e) => setEditingTier({ ...editingTier, description: e.target.value })}
                          placeholder="Applied after 40 hours in a week"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingTier.is_active ?? true}
                          onCheckedChange={(checked) => setEditingTier({ ...editingTier, is_active: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTierDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveTier} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Tier"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {tiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No overtime tiers configured. Click "Add Tier" to create one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead>Tier Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Hour Range</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiers.map((tier) => (
                      <TableRow key={tier.id}>
                        <TableCell>
                          <Badge variant="outline">{tier.priority}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{tier.tier_name}</TableCell>
                        <TableCell className="font-mono text-sm">{tier.tier_code}</TableCell>
                        <TableCell>
                          {tier.min_hours}h - {tier.max_hours ? `${tier.max_hours}h` : "∞"}
                        </TableCell>
                        <TableCell>{getMultiplierBadge(tier.multiplier)}</TableCell>
                        <TableCell>
                          <Badge variant={tier.is_active ? "default" : "secondary"}>
                            {tier.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditTier(tier)}>
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteTier(tier.id)}
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
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
}