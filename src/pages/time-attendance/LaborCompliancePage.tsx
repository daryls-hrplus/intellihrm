import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2,
  Scale,
  Clock,
  Coffee,
  Moon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LaborRule {
  id: string;
  country_code: string;
  region_code: string | null;
  rule_name: string;
  rule_type: string;
  threshold_value: number;
  threshold_unit: string;
  applies_to_employee_types: string[];
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  legal_reference: string | null;
  penalty_description: string | null;
  created_at: string;
}

const RULE_TYPES = [
  { value: "max_daily_hours", label: "Max Daily Hours", icon: Clock },
  { value: "max_weekly_hours", label: "Max Weekly Hours", icon: Clock },
  { value: "max_monthly_overtime", label: "Max Monthly Overtime", icon: Clock },
  { value: "min_rest_between_shifts", label: "Min Rest Between Shifts", icon: Moon },
  { value: "min_weekly_rest", label: "Min Weekly Rest", icon: Coffee },
  { value: "mandatory_break_duration", label: "Mandatory Break Duration", icon: Coffee },
  { value: "mandatory_break_after_hours", label: "Break After Hours Worked", icon: Coffee },
  { value: "night_shift_restrictions", label: "Night Shift Restrictions", icon: Moon },
  { value: "overtime_multiplier", label: "Overtime Pay Multiplier", icon: Scale },
  { value: "holiday_multiplier", label: "Holiday Pay Multiplier", icon: Scale },
];

const COUNTRIES = [
  { code: "JM", name: "Jamaica" },
  { code: "TT", name: "Trinidad & Tobago" },
  { code: "BB", name: "Barbados" },
  { code: "GY", name: "Guyana" },
  { code: "DO", name: "Dominican Republic" },
  { code: "GH", name: "Ghana" },
  { code: "NG", name: "Nigeria" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
];

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "Labor Compliance" },
];

export default function LaborCompliancePage() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<LaborRule | null>(null);
  const [filterCountry, setFilterCountry] = useState("all");

  const [formData, setFormData] = useState({
    country_code: "",
    region_code: "",
    rule_name: "",
    rule_type: "",
    threshold_value: 0,
    threshold_unit: "hours",
    effective_from: new Date().toISOString().split('T')[0],
    is_active: true,
    legal_reference: "",
    penalty_description: "",
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["labor-compliance-rules", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("labor_compliance_rules")
        .select("*")
        .eq("company_id", company?.id)
        .order("country_code")
        .order("rule_type");
      if (error) throw error;
      return data as LaborRule[];
    },
    enabled: !!company?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("labor_compliance_rules")
        .insert({
          company_id: company?.id,
          ...data,
          region_code: data.region_code || null,
          applies_to_employee_types: ["all"],
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rule created");
      queryClient.invalidateQueries({ queryKey: ["labor-compliance-rules"] });
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("labor_compliance_rules")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rule updated");
      queryClient.invalidateQueries({ queryKey: ["labor-compliance-rules"] });
      setEditingRule(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("labor_compliance_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rule deleted");
      queryClient.invalidateQueries({ queryKey: ["labor-compliance-rules"] });
    },
  });

  const resetForm = () => {
    setFormData({
      country_code: "",
      region_code: "",
      rule_name: "",
      rule_type: "",
      threshold_value: 0,
      threshold_unit: "hours",
      effective_from: new Date().toISOString().split('T')[0],
      is_active: true,
      legal_reference: "",
      penalty_description: "",
    });
  };

  const handleEdit = (rule: LaborRule) => {
    setEditingRule(rule);
    setFormData({
      country_code: rule.country_code,
      region_code: rule.region_code || "",
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      threshold_value: rule.threshold_value,
      threshold_unit: rule.threshold_unit,
      effective_from: rule.effective_from,
      is_active: rule.is_active,
      legal_reference: rule.legal_reference || "",
      penalty_description: rule.penalty_description || "",
    });
  };

  const handleSubmit = () => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredRules = rules.filter(r => 
    filterCountry === "all" || r.country_code === filterCountry
  );

  const groupedByCountry = filteredRules.reduce((acc, rule) => {
    if (!acc[rule.country_code]) acc[rule.country_code] = [];
    acc[rule.country_code].push(rule);
    return acc;
  }, {} as Record<string, LaborRule[]>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Labor Compliance Rules</h1>
            <p className="text-muted-foreground">
              Configure working hours, overtime, and rest requirements by jurisdiction
            </p>
          </div>
          <Dialog open={showAddDialog || !!editingRule} onOpenChange={(open) => {
            if (!open) {
              setShowAddDialog(false);
              setEditingRule(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingRule ? "Edit Rule" : "Add Compliance Rule"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Country *</Label>
                    <Select value={formData.country_code} onValueChange={(v) => setFormData({ ...formData, country_code: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Region (optional)</Label>
                    <Input
                      value={formData.region_code}
                      onChange={(e) => setFormData({ ...formData, region_code: e.target.value })}
                      placeholder="e.g., CA, NY"
                    />
                  </div>
                </div>
                <div>
                  <Label>Rule Name *</Label>
                  <Input
                    value={formData.rule_name}
                    onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                    placeholder="e.g., Maximum Weekly Hours"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rule Type *</Label>
                    <Select value={formData.rule_type} onValueChange={(v) => setFormData({ ...formData, rule_type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {RULE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Threshold Unit</Label>
                    <Select value={formData.threshold_unit} onValueChange={(v) => setFormData({ ...formData, threshold_unit: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="multiplier">Multiplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Threshold Value *</Label>
                    <Input
                      type="number"
                      value={formData.threshold_value}
                      onChange={(e) => setFormData({ ...formData, threshold_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Effective From *</Label>
                    <Input
                      type="date"
                      value={formData.effective_from}
                      onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Legal Reference</Label>
                  <Input
                    value={formData.legal_reference}
                    onChange={(e) => setFormData({ ...formData, legal_reference: e.target.value })}
                    placeholder="e.g., Labour Act Section 12.3"
                  />
                </div>
                <div>
                  <Label>Penalty Description</Label>
                  <Textarea
                    value={formData.penalty_description}
                    onChange={(e) => setFormData({ ...formData, penalty_description: e.target.value })}
                    placeholder="Describe penalties for non-compliance..."
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingRule(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingRule ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-[200px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rules by Country */}
        {isLoading ? (
          <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>
        ) : Object.keys(groupedByCountry).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No compliance rules configured. Click "Add Rule" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedByCountry).map(([countryCode, countryRules]) => {
            const country = COUNTRIES.find(c => c.code === countryCode);
            return (
              <Card key={countryCode}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {country?.name || countryCode}
                  </CardTitle>
                  <CardDescription>{countryRules.length} rule(s) configured</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Legal Reference</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countryRules.map(rule => {
                        const ruleType = RULE_TYPES.find(t => t.value === rule.rule_type);
                        return (
                          <TableRow key={rule.id}>
                            <TableCell className="font-medium">{rule.rule_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{ruleType?.label || rule.rule_type}</Badge>
                            </TableCell>
                            <TableCell>
                              {rule.threshold_value} {rule.threshold_unit}
                            </TableCell>
                            <TableCell>
                              <Badge variant={rule.is_active ? "default" : "secondary"}>
                                {rule.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {rule.legal_reference || "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(rule)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteMutation.mutate(rule.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}