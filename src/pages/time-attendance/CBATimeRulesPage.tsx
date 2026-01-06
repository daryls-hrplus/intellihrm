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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { Scale, Plus, Search, FileText, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CBAAgreement {
  id: string;
  agreement_name: string;
  agreement_code: string;
  union_name: string | null;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  document_url: string | null;
  created_at: string;
}

interface CBATimeRule {
  id: string;
  agreement_id: string;
  rule_name: string;
  rule_type: string;
  condition_json: Record<string, unknown> | null;
  value_numeric: number | null;
  value_text: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
}

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "CBA Time Rules" },
];

export default function CBATimeRulesPage() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgreement, setSelectedAgreement] = useState<CBAAgreement | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: "",
    rule_type: "overtime",
    day_type: "regular",
    overtime_multiplier: "1.5",
    max_hours_per_day: "8",
    description: "",
  });

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["cba-agreements", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cba_agreements")
        .select("*")
        .eq("company_id", company?.id)
        .order("effective_date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CBAAgreement[];
    },
    enabled: !!company?.id,
  });

  const { data: rules = [] } = useQuery({
    queryKey: ["cba-time-rules", selectedAgreement?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cba_time_rules")
        .select("*")
        .eq("agreement_id", selectedAgreement?.id)
        .order("rule_type");
      if (error) throw error;
      return (data || []) as unknown as CBATimeRule[];
    },
    enabled: !!selectedAgreement?.id,
  });

  const addRuleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAgreement) throw new Error("No agreement selected");
      const { error } = await supabase.from("cba_time_rules").insert({
        agreement_id: selectedAgreement.id,
        rule_name: newRule.rule_name,
        rule_type: newRule.rule_type,
        condition_json: { day_type: newRule.day_type },
        value_numeric: parseFloat(newRule.overtime_multiplier),
        value_text: `max_hours:${newRule.max_hours_per_day}`,
        priority: 1,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Time rule added");
      setShowRuleDialog(false);
      setNewRule({ rule_name: "", rule_type: "overtime", day_type: "regular", overtime_multiplier: "1.5", max_hours_per_day: "8", description: "" });
      queryClient.invalidateQueries({ queryKey: ["cba-time-rules"] });
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("cba_time_rules")
        .update({ is_active: isActive })
        .eq("id", ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cba-time-rules"] });
    },
  });

  const filteredAgreements = agreements.filter(a =>
    a.agreement_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.union_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  };

  // Parse condition for display
  const getConditionDisplay = (rule: CBATimeRule) => {
    if (rule.condition_json && typeof rule.condition_json === 'object') {
      const cond = rule.condition_json as Record<string, unknown>;
      return cond.day_type as string || "—";
    }
    return "—";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CBA Time Rules</h1>
            <p className="text-muted-foreground">
              Collective Bargaining Agreement time and attendance rules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agreements List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                CBA Agreements
              </CardTitle>
              <CardDescription>Select an agreement to view its time rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agreements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <p className="text-center py-4 text-muted-foreground">Loading...</p>
                ) : filteredAgreements.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No CBA agreements found</p>
                ) : (
                  filteredAgreements.map((agreement) => (
                    <div
                      key={agreement.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAgreement?.id === agreement.id 
                          ? "bg-primary/10 border-primary" 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedAgreement(agreement)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{agreement.agreement_name}</p>
                          <p className="text-sm text-muted-foreground">{agreement.union_name}</p>
                        </div>
                        <Badge variant={agreement.is_active ? "default" : "secondary"}>
                          {agreement.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {isExpiringSoon(agreement.effective_to) && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          Expiring soon
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rules Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Rules
                  </CardTitle>
                  <CardDescription>
                    {selectedAgreement 
                      ? `Rules for ${selectedAgreement.agreement_name}`
                      : "Select an agreement to view its rules"
                    }
                  </CardDescription>
                </div>
                {selectedAgreement && (
                  <Button onClick={() => setShowRuleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedAgreement ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a CBA agreement from the left panel to view its time rules</p>
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No time rules defined for this agreement</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowRuleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Rule
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Day Type</TableHead>
                    <TableHead className="text-center">Multiplier</TableHead>
                    <TableHead className="text-center">Value</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                            <p className="font-medium">{rule.rule_name}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.rule_type}</Badge>
                          </TableCell>
                          <TableCell>{getConditionDisplay(rule)}</TableCell>
                          <TableCell className="text-center">
                            {rule.value_numeric ? `${rule.value_numeric}x` : "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {rule.value_text || "—"}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={(checked) => 
                                toggleRuleMutation.mutate({ ruleId: rule.id, isActive: checked })
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Rule Dialog */}
        <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  value={newRule.rule_name}
                  onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                  placeholder="e.g., Sunday Overtime Rate"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Type</Label>
                  <Select value={newRule.rule_type} onValueChange={(v) => setNewRule({ ...newRule, rule_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overtime">Overtime</SelectItem>
                      <SelectItem value="shift_differential">Shift Differential</SelectItem>
                      <SelectItem value="rest_period">Rest Period</SelectItem>
                      <SelectItem value="break_time">Break Time</SelectItem>
                      <SelectItem value="max_hours">Max Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Day Type</Label>
                  <Select value={newRule.day_type} onValueChange={(v) => setNewRule({ ...newRule, day_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular Day</SelectItem>
                      <SelectItem value="weekend">Weekend</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="night">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Overtime Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newRule.overtime_multiplier}
                    onChange={(e) => setNewRule({ ...newRule, overtime_multiplier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Hours/Day</Label>
                  <Input
                    type="number"
                    value={newRule.max_hours_per_day}
                    onChange={(e) => setNewRule({ ...newRule, max_hours_per_day: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Describe this rule..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRuleDialog(false)}>Cancel</Button>
              <Button 
                onClick={() => addRuleMutation.mutate()}
                disabled={addRuleMutation.isPending || !newRule.rule_name}
              >
                Add Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
