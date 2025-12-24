import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Settings2,
  Users,
  Building2,
  User,
  Trash2,
  GripVertical,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApprovalRule {
  id: string;
  company_id: string;
  name: string;
  goal_level: string;
  approval_type: string;
  requires_hr_approval: boolean;
  max_approval_days: number | null;
  is_active: boolean;
}

interface ApprovalChainStep {
  id: string;
  rule_id: string;
  step_order: number;
  approver_type: string;
  approver_user_id: string | null;
  is_optional: boolean;
  sla_hours: number | null;
}

interface GoalApprovalRulesManagerProps {
  companyId?: string;
}

const levelConfig = {
  individual: { label: "Individual Goals", icon: User, color: "bg-primary/10 text-primary" },
  team: { label: "Team Goals", icon: Users, color: "bg-info/10 text-info" },
  department: { label: "Department Goals", icon: Users, color: "bg-warning/10 text-warning" },
  company: { label: "Company Goals", icon: Building2, color: "bg-success/10 text-success" },
};

const approvalTypeLabels: Record<string, string> = {
  single_level: "Single Level",
  multi_level: "Multi Level",
  skip_level: "Skip Level",
  no_approval: "No Approval Required",
};

const approverTypeLabels: Record<string, string> = {
  direct_manager: "Direct Manager",
  skip_manager: "Skip-Level Manager",
  hr: "HR Representative",
  department_head: "Department Head",
  specific_user: "Specific User",
};

export function GoalApprovalRulesManager({ companyId }: GoalApprovalRulesManagerProps) {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [chainSteps, setChainSteps] = useState<Record<string, ApprovalChainStep[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ApprovalRule | null>(null);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);

  // Form state for rule
  const [ruleForm, setRuleForm] = useState({
    name: "",
    goal_level: "individual",
    approval_type: "single_level",
    requires_hr_approval: false,
    max_approval_days: "",
    is_active: true,
  });

  // Form state for chain step
  const [stepForm, setStepForm] = useState({
    approver_type: "direct_manager",
    approver_user_id: "",
    is_optional: false,
    sla_hours: "",
  });

  useEffect(() => {
    if (companyId) {
      fetchRules();
      fetchEmployees();
    }
  }, [companyId]);

  const fetchEmployees = async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", companyId)
      .order("full_name");
    setEmployees(data || []);
  };

  const fetchRules = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const { data: rulesData, error: rulesError } = await supabase
        .from("goal_approval_rules")
        .select("*")
        .eq("company_id", companyId)
        .order("goal_level");

      if (rulesError) throw rulesError;
      setRules((rulesData || []) as ApprovalRule[]);

      // Fetch chain steps for each rule
      if (rulesData?.length) {
        const ruleIds = rulesData.map(r => r.id);
        const { data: stepsData, error: stepsError } = await supabase
          .from("goal_approval_chain")
          .select("*")
          .in("rule_id", ruleIds)
          .order("step_order");

        if (stepsError) throw stepsError;

        const stepsMap: Record<string, ApprovalChainStep[]> = {};
        ((stepsData || []) as ApprovalChainStep[]).forEach(step => {
          if (!stepsMap[step.rule_id]) stepsMap[step.rule_id] = [];
          stepsMap[step.rule_id].push(step);
        });
        setChainSteps(stepsMap);
      }
    } catch (error) {
      console.error("Error fetching approval rules:", error);
      toast.error("Failed to load approval rules");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async () => {
    if (!companyId) return;

    try {
      const ruleData = {
        company_id: companyId,
        name: ruleForm.name || `${ruleForm.goal_level} approval rule`,
        goal_level: ruleForm.goal_level,
        approval_type: ruleForm.approval_type,
        requires_hr_approval: ruleForm.requires_hr_approval,
        max_approval_days: ruleForm.max_approval_days ? parseInt(ruleForm.max_approval_days) : null,
        is_active: ruleForm.is_active,
      };

      if (selectedRule) {
        const { error } = await supabase
          .from("goal_approval_rules")
          .update(ruleData)
          .eq("id", selectedRule.id);
        if (error) throw error;
        toast.success("Approval rule updated");
      } else {
        const { error } = await supabase
          .from("goal_approval_rules")
          .insert([ruleData]);
        if (error) throw error;
        toast.success("Approval rule created");
      }

      setDialogOpen(false);
      setSelectedRule(null);
      fetchRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save approval rule");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this approval rule?")) return;

    try {
      const { error } = await supabase
        .from("goal_approval_rules")
        .delete()
        .eq("id", ruleId);
      if (error) throw error;
      toast.success("Approval rule deleted");
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Failed to delete approval rule");
    }
  };

  const handleAddStep = async () => {
    if (!selectedRule) return;

    try {
      const currentSteps = chainSteps[selectedRule.id] || [];
      const nextOrder = currentSteps.length + 1;

      const { error } = await supabase
        .from("goal_approval_chain")
        .insert([{
          rule_id: selectedRule.id,
          step_order: nextOrder,
          approver_type: stepForm.approver_type,
          approver_user_id: stepForm.approver_type === "specific_user" ? stepForm.approver_user_id : null,
          is_optional: stepForm.is_optional,
          sla_hours: stepForm.sla_hours ? parseInt(stepForm.sla_hours) : null,
        }]);

      if (error) throw error;
      toast.success("Approval step added");
      setStepDialogOpen(false);
      setStepForm({
        approver_type: "direct_manager",
        approver_user_id: "",
        is_optional: false,
        sla_hours: "",
      });
      fetchRules();
    } catch (error) {
      console.error("Error adding step:", error);
      toast.error("Failed to add approval step");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      const { error } = await supabase
        .from("goal_approval_chain")
        .delete()
        .eq("id", stepId);
      if (error) throw error;
      toast.success("Approval step removed");
      fetchRules();
    } catch (error) {
      console.error("Error deleting step:", error);
      toast.error("Failed to remove approval step");
    }
  };

  const handleToggleActive = async (rule: ApprovalRule) => {
    try {
      const { error } = await supabase
        .from("goal_approval_rules")
        .update({ is_active: !rule.is_active })
        .eq("id", rule.id);
      if (error) throw error;
      fetchRules();
    } catch (error) {
      console.error("Error toggling rule:", error);
      toast.error("Failed to update rule");
    }
  };

  const openEditRule = (rule: ApprovalRule) => {
    setSelectedRule(rule);
    setRuleForm({
      name: rule.name,
      goal_level: rule.goal_level,
      approval_type: rule.approval_type,
      requires_hr_approval: rule.requires_hr_approval,
      max_approval_days: rule.max_approval_days?.toString() || "",
      is_active: rule.is_active,
    });
    setDialogOpen(true);
  };

  const openAddStep = (rule: ApprovalRule) => {
    setSelectedRule(rule);
    setStepDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading approval rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Goal Approval Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure approval workflows for different goal levels
          </p>
        </div>
        <Button onClick={() => { setSelectedRule(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No approval rules configured</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {rules.map((rule) => {
            const config = levelConfig[rule.goal_level as keyof typeof levelConfig] || levelConfig.individual;
            const Icon = config.icon;
            const steps = chainSteps[rule.id] || [];

            return (
              <AccordionItem key={rule.id} value={rule.id} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.label}</span>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {approvalTypeLabels[rule.approval_type]}
                        {rule.requires_hr_approval && " • HR Approval Required"}
                        {rule.max_approval_days && ` • ${rule.max_approval_days} days SLA`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggleActive(rule)}
                      />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Approval Chain Steps</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditRule(rule)}>
                          Edit Rule
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openAddStep(rule)}>
                          <Plus className="mr-1 h-3 w-3" />
                          Add Step
                        </Button>
                      </div>
                    </div>

                    {steps.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No approval steps defined. Add steps to define the approval chain.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Approver Type</TableHead>
                            <TableHead>Optional</TableHead>
                            <TableHead>SLA (Hours)</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {steps.map((step) => (
                            <TableRow key={step.id}>
                              <TableCell className="font-medium">{step.step_order}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {approverTypeLabels[step.approver_type] || step.approver_type}
                                  {step.approver_user_id && (
                                    <Badge variant="outline" className="text-xs">
                                      {employees.find(e => e.id === step.approver_user_id)?.full_name || "Unknown"}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={step.is_optional ? "secondary" : "default"}>
                                  {step.is_optional ? "Optional" : "Required"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {step.sla_hours ? (
                                  <span className="flex items-center gap-1 text-sm">
                                    <Clock className="h-3 w-3" />
                                    {step.sla_hours}h
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleDeleteStep(step.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}

                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete Rule
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Add/Edit Rule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRule ? "Edit Approval Rule" : "Create Approval Rule"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Rule Name</Label>
              <Input
                value={ruleForm.name}
                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                placeholder="e.g., Individual Goal Approval"
              />
            </div>

            <div>
              <Label>Goal Level</Label>
              <Select
                value={ruleForm.goal_level}
                onValueChange={(v) => setRuleForm({ ...ruleForm, goal_level: v })}
                disabled={!!selectedRule}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Goals</SelectItem>
                  <SelectItem value="team">Team Goals</SelectItem>
                  <SelectItem value="department">Department Goals</SelectItem>
                  <SelectItem value="company">Company Goals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Approval Type</Label>
              <Select
                value={ruleForm.approval_type}
                onValueChange={(v) => setRuleForm({ ...ruleForm, approval_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_approval">No Approval Required</SelectItem>
                  <SelectItem value="single_level">Single Level (Direct Manager)</SelectItem>
                  <SelectItem value="multi_level">Multi Level (Multiple Approvers)</SelectItem>
                  <SelectItem value="skip_level">Skip Level (Manager's Manager)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Max Approval Days (SLA)</Label>
              <Input
                type="number"
                placeholder="e.g., 5"
                value={ruleForm.max_approval_days}
                onChange={(e) => setRuleForm({ ...ruleForm, max_approval_days: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="requires_hr"
                checked={ruleForm.requires_hr_approval}
                onCheckedChange={(v) => setRuleForm({ ...ruleForm, requires_hr_approval: v })}
              />
              <Label htmlFor="requires_hr">Requires HR Approval</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={ruleForm.is_active}
                onCheckedChange={(v) => setRuleForm({ ...ruleForm, is_active: v })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRule}>Save Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Approval Step</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Approver Type</Label>
              <Select
                value={stepForm.approver_type}
                onValueChange={(v) => setStepForm({ ...stepForm, approver_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_manager">Direct Manager</SelectItem>
                  <SelectItem value="skip_manager">Skip-Level Manager</SelectItem>
                  <SelectItem value="hr">HR Representative</SelectItem>
                  <SelectItem value="department_head">Department Head</SelectItem>
                  <SelectItem value="specific_user">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {stepForm.approver_type === "specific_user" && (
              <div>
                <Label>Select User</Label>
                <Select
                  value={stepForm.approver_user_id}
                  onValueChange={(v) => setStepForm({ ...stepForm, approver_user_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>SLA (Hours)</Label>
              <Input
                type="number"
                placeholder="e.g., 48"
                value={stepForm.sla_hours}
                onChange={(e) => setStepForm({ ...stepForm, sla_hours: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_optional"
                checked={stepForm.is_optional}
                onCheckedChange={(v) => setStepForm({ ...stepForm, is_optional: v })}
              />
              <Label htmlFor="is_optional">Optional Step</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStepDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStep}>Add Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
