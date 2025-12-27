import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFatigueManagement } from "@/hooks/useFatigueManagement";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { AlertTriangle, Plus, Check, Trash2, Shield, Clock, AlertCircle } from "lucide-react";

interface FatigueManagementTabProps {
  companyId: string;
}

export function FatigueManagementTab({ companyId }: FatigueManagementTabProps) {
  const { rules, violations, isLoading, createRule, updateRule, deleteRule, acknowledgeViolation, overrideViolation } = useFatigueManagement(companyId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    rule_type: "max_consecutive_shifts",
    threshold_value: 5,
    threshold_unit: "shifts",
    applies_to: "all",
    severity: "warning",
  });

  const handleCreateRule = async () => {
    await createRule({
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
      rule_type: formData.rule_type,
      threshold_value: formData.threshold_value,
      threshold_unit: formData.threshold_unit,
      applies_to: formData.applies_to,
      severity: formData.severity,
    });
    setDialogOpen(false);
    setFormData({
      name: "",
      code: "",
      description: "",
      rule_type: "max_consecutive_shifts",
      threshold_value: 5,
      threshold_unit: "shifts",
      applies_to: "all",
      severity: "warning",
    });
  };

  const handleOverride = async () => {
    if (!selectedViolation || !overrideReason) return;
    await overrideViolation(selectedViolation, overrideReason);
    setOverrideDialogOpen(false);
    setSelectedViolation(null);
    setOverrideReason("");
  };

  const ruleTypeLabels: Record<string, string> = {
    max_consecutive_shifts: "Max Consecutive Shifts",
    min_rest_between_shifts: "Min Rest Between Shifts",
    max_hours_per_day: "Max Hours Per Day",
    max_hours_per_week: "Max Hours Per Week",
    max_hours_per_period: "Max Hours Per Period",
    mandatory_break: "Mandatory Break",
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      info: "secondary",
      warning: "outline",
      block: "destructive",
    };
    const icons: Record<string, React.ReactNode> = {
      info: <AlertCircle className="h-3 w-3 mr-1" />,
      warning: <AlertTriangle className="h-3 w-3 mr-1" />,
      block: <Shield className="h-3 w-3 mr-1" />,
    };
    return (
      <Badge variant={variants[severity] || "secondary"} className="flex items-center">
        {icons[severity]}
        {severity}
      </Badge>
    );
  };

  const activeViolations = violations.filter(v => !v.acknowledged_at && !v.override_approved_by);
  const resolvedViolations = violations.filter(v => v.acknowledged_at || v.override_approved_by);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fatigue Management
          </h3>
          <p className="text-sm text-muted-foreground">Configure rest rules and monitor violations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Fatigue Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Max 6 Consecutive Days" />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g., FAT-001" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select value={formData.rule_type} onValueChange={v => setFormData(p => ({ ...p, rule_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max_consecutive_shifts">Max Consecutive Shifts</SelectItem>
                    <SelectItem value="min_rest_between_shifts">Min Rest Between Shifts</SelectItem>
                    <SelectItem value="max_hours_per_day">Max Hours Per Day</SelectItem>
                    <SelectItem value="max_hours_per_week">Max Hours Per Week</SelectItem>
                    <SelectItem value="max_hours_per_period">Max Hours Per Period</SelectItem>
                    <SelectItem value="mandatory_break">Mandatory Break</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Threshold Value</Label>
                  <Input type="number" min={1} value={formData.threshold_value} onChange={e => setFormData(p => ({ ...p, threshold_value: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={formData.threshold_unit} onValueChange={v => setFormData(p => ({ ...p, threshold_unit: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="shifts">Shifts</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Applies To</Label>
                  <Select value={formData.applies_to} onValueChange={v => setFormData(p => ({ ...p, applies_to: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="department">Specific Department</SelectItem>
                      <SelectItem value="role">Specific Role</SelectItem>
                      <SelectItem value="shift_type">Specific Shift Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={formData.severity} onValueChange={v => setFormData(p => ({ ...p, severity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info (Log only)</SelectItem>
                      <SelectItem value="warning">Warning (Alert)</SelectItem>
                      <SelectItem value="block">Block (Prevent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe the rule and its purpose..." />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRule} disabled={!formData.name || !formData.code}>Create Rule</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{rules.filter(r => r.is_active).length}</div>
                <div className="text-sm text-muted-foreground">Active Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeViolations.length}</div>
                <div className="text-sm text-muted-foreground">Active Violations</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{resolvedViolations.length}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fatigue Rules</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : rules.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No rules configured</div>
            ) : (
              <div className="space-y-2">
                {rules.map(rule => (
                  <div key={rule.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ruleTypeLabels[rule.rule_type]} • {rule.threshold_value} {rule.threshold_unit}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(rule.severity)}
                        <Switch 
                          checked={rule.is_active} 
                          onCheckedChange={(checked) => updateRule(rule.id, { is_active: checked })}
                        />
                        <Button size="sm" variant="ghost" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Violations</CardTitle>
          </CardHeader>
          <CardContent>
            {activeViolations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No active violations</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeViolations.slice(0, 10).map(violation => (
                    <TableRow key={violation.id}>
                      <TableCell className="font-medium">{violation.employee?.full_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getSeverityBadge(violation.severity)}
                          <span className="text-sm">{violation.rule?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateForDisplay(violation.violation_date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => acknowledgeViolation(violation.id)}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setSelectedViolation(violation.id);
                              setOverrideDialogOpen(true);
                            }}
                          >
                            <Clock className="h-4 w-4 text-blue-600" />
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

      {/* Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Violation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Override Reason</Label>
              <Textarea 
                value={overrideReason} 
                onChange={e => setOverrideReason(e.target.value)} 
                placeholder="Provide justification for overriding this violation..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleOverride} disabled={!overrideReason}>Approve Override</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
