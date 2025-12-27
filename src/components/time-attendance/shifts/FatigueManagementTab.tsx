import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

  const getRuleTypeLabel = (ruleType: string) => {
    const labels: Record<string, string> = {
      max_consecutive_shifts: t("timeAttendance.shifts.fatigue.maxConsecutiveShifts"),
      min_rest_between_shifts: t("timeAttendance.shifts.fatigue.minRestBetweenShifts"),
      max_hours_per_day: t("timeAttendance.shifts.fatigue.maxHoursPerDay"),
      max_hours_per_week: t("timeAttendance.shifts.fatigue.maxHoursPerWeek"),
      max_hours_per_period: t("timeAttendance.shifts.fatigue.maxHoursPerPeriod"),
      mandatory_break: t("timeAttendance.shifts.fatigue.mandatoryBreak"),
    };
    return labels[ruleType] || ruleType;
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
            {t("timeAttendance.shifts.fatigue.title")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("timeAttendance.shifts.fatigue.minRestBetween")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("timeAttendance.shifts.fatigue.createRule")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("timeAttendance.shifts.fatigue.createFatigueRule")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("timeAttendance.shifts.fatigue.ruleName")}</Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder={t("timeAttendance.shifts.fatigue.ruleNamePlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("timeAttendance.shifts.fatigue.code")}</Label>
                  <Input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder={t("timeAttendance.shifts.fatigue.codePlaceholder")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("timeAttendance.shifts.fatigue.ruleType")}</Label>
                <Select value={formData.rule_type} onValueChange={v => setFormData(p => ({ ...p, rule_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max_consecutive_shifts">{t("timeAttendance.shifts.fatigue.maxConsecutiveShifts")}</SelectItem>
                    <SelectItem value="min_rest_between_shifts">{t("timeAttendance.shifts.fatigue.minRestBetweenShifts")}</SelectItem>
                    <SelectItem value="max_hours_per_day">{t("timeAttendance.shifts.fatigue.maxHoursPerDay")}</SelectItem>
                    <SelectItem value="max_hours_per_week">{t("timeAttendance.shifts.fatigue.maxHoursPerWeek")}</SelectItem>
                    <SelectItem value="max_hours_per_period">{t("timeAttendance.shifts.fatigue.maxHoursPerPeriod")}</SelectItem>
                    <SelectItem value="mandatory_break">{t("timeAttendance.shifts.fatigue.mandatoryBreak")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("timeAttendance.shifts.fatigue.thresholdValue")}</Label>
                  <Input type="number" min={1} value={formData.threshold_value} onChange={e => setFormData(p => ({ ...p, threshold_value: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t("timeAttendance.shifts.fatigue.unit")}</Label>
                  <Select value={formData.threshold_unit} onValueChange={v => setFormData(p => ({ ...p, threshold_unit: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">{t("timeAttendance.shifts.fatigue.hours")}</SelectItem>
                      <SelectItem value="days">{t("timeAttendance.shifts.fatigue.days")}</SelectItem>
                      <SelectItem value="shifts">{t("timeAttendance.shifts.fatigue.shifts")}</SelectItem>
                      <SelectItem value="minutes">{t("timeAttendance.shifts.fatigue.minutes")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("timeAttendance.shifts.fatigue.appliesTo")}</Label>
                  <Select value={formData.applies_to} onValueChange={v => setFormData(p => ({ ...p, applies_to: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("timeAttendance.shifts.fatigue.allEmployees")}</SelectItem>
                      <SelectItem value="department">{t("timeAttendance.shifts.fatigue.specificDepartment")}</SelectItem>
                      <SelectItem value="role">{t("timeAttendance.shifts.fatigue.specificRole")}</SelectItem>
                      <SelectItem value="shift_type">{t("timeAttendance.shifts.fatigue.specificShiftType")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("timeAttendance.shifts.fatigue.severity")}</Label>
                  <Select value={formData.severity} onValueChange={v => setFormData(p => ({ ...p, severity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">{t("timeAttendance.shifts.fatigue.infoLogOnly")}</SelectItem>
                      <SelectItem value="warning">{t("timeAttendance.shifts.fatigue.warningAlert")}</SelectItem>
                      <SelectItem value="block">{t("timeAttendance.shifts.fatigue.blockPrevent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("common.description")}</Label>
                <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder={t("timeAttendance.shifts.fatigue.descriptionPlaceholder")} />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleCreateRule} disabled={!formData.name || !formData.code}>{t("timeAttendance.shifts.fatigue.createRule")}</Button>
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
                <div className="text-sm text-muted-foreground">{t("timeAttendance.shifts.fatigue.activeRules")}</div>
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
                <div className="text-sm text-muted-foreground">{t("timeAttendance.shifts.fatigue.activeViolations")}</div>
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
                <div className="text-sm text-muted-foreground">{t("timeAttendance.shifts.fatigue.resolved")}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("timeAttendance.shifts.fatigue.fatigueRules")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">{t("common.loading")}</div>
            ) : rules.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">{t("timeAttendance.shifts.fatigue.noRules")}</div>
            ) : (
              <div className="space-y-2">
                {rules.map(rule => (
                  <div key={rule.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {getRuleTypeLabel(rule.rule_type)} • {rule.threshold_value} {rule.threshold_unit}
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
            <CardTitle className="text-base">{t("timeAttendance.shifts.fatigue.recentViolations")}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeViolations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">{t("timeAttendance.shifts.fatigue.noViolations")}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("timeAttendance.shifts.fatigue.employee")}</TableHead>
                    <TableHead>{t("timeAttendance.shifts.fatigue.rule")}</TableHead>
                    <TableHead>{t("timeAttendance.shifts.fatigue.date")}</TableHead>
                    <TableHead>{t("timeAttendance.shifts.fatigue.actions")}</TableHead>
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
            <DialogTitle>{t("timeAttendance.shifts.fatigue.overrideViolation")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("timeAttendance.shifts.fatigue.overrideReason")}</Label>
              <Textarea 
                value={overrideReason} 
                onChange={e => setOverrideReason(e.target.value)} 
                placeholder={t("timeAttendance.shifts.fatigue.overridePlaceholder")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleOverride} disabled={!overrideReason}>{t("timeAttendance.shifts.fatigue.approveOverride")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
