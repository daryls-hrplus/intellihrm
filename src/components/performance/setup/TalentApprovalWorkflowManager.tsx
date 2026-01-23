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
  Clock,
  Target,
  ClipboardCheck,
  MessageSquare,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApprovalRule {
  id: string;
  company_id: string;
  name: string;
  process_type: string;
  scope_level: string;
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

interface TalentApprovalWorkflowManagerProps {
  companyId?: string;
}

const processTypeConfig = {
  goals: { label: "Goals", icon: Target, color: "bg-primary/10 text-primary" },
  appraisals: { label: "Performance Appraisals", icon: ClipboardCheck, color: "bg-success/10 text-success" },
  "360_feedback": { label: "360° Feedback", icon: MessageSquare, color: "bg-info/10 text-info" },
  learning: { label: "Learning Requests", icon: GraduationCap, color: "bg-warning/10 text-warning" },
  succession: { label: "Succession Plans", icon: TrendingUp, color: "bg-secondary/10 text-secondary-foreground" },
};

const scopeLevelConfig = {
  individual: { label: "Individual", icon: User },
  team: { label: "Team", icon: Users },
  department: { label: "Department", icon: Users },
  company: { label: "Company", icon: Building2 },
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

export function TalentApprovalWorkflowManager({ companyId }: TalentApprovalWorkflowManagerProps) {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [chainSteps, setChainSteps] = useState<Record<string, ApprovalChainStep[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ApprovalRule | null>(null);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [filterProcessType, setFilterProcessType] = useState<string>("all");

  const [ruleForm, setRuleForm] = useState({
    name: "",
    process_type: "goals",
    scope_level: "individual",
    approval_type: "single_level",
    requires_hr_approval: false,
    max_approval_days: "",
    is_active: true,
  });

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
      // Still using goal_approval_rules table but treating it as unified
      const { data: rulesData, error: rulesError } = await supabase
        .from("goal_approval_rules")
        .select("*")
        .eq("company_id", companyId)
        .order("goal_level");

      if (rulesError) throw rulesError;
      
      // Map the existing goal_level to scope_level for the unified view
      const mappedRules = (rulesData || []).map(r => ({
        ...r,
        process_type: "goals", // Default to goals for existing rules
        scope_level: r.goal_level,
      })) as ApprovalRule[];
      
      setRules(mappedRules);

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
        name: ruleForm.name || `${ruleForm.process_type} - ${ruleForm.scope_level} approval`,
        goal_level: ruleForm.scope_level, // Map back to goal_level for DB
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
        toast.success("Approval workflow updated");
      } else {
        const { error } = await supabase
          .from("goal_approval_rules")
          .insert([ruleData]);
        if (error) throw error;
        toast.success("Approval workflow created");
      }

      setDialogOpen(false);
      setSelectedRule(null);
      fetchRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save approval workflow");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this approval workflow?")) return;

    try {
      const { error } = await supabase
        .from("goal_approval_rules")
        .delete()
        .eq("id", ruleId);
      if (error) throw error;
      toast.success("Approval workflow deleted");
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Failed to delete approval workflow");
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
      toast.error("Failed to update workflow");
    }
  };

  const openEditRule = (rule: ApprovalRule) => {
    setSelectedRule(rule);
    setRuleForm({
      name: rule.name,
      process_type: rule.process_type || "goals",
      scope_level: rule.scope_level,
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

  const filteredRules = filterProcessType === "all" 
    ? rules 
    : rules.filter(r => r.process_type === filterProcessType);

  // Group rules by process type
  const groupedRules = filteredRules.reduce((acc, rule) => {
    const type = rule.process_type || "goals";
    if (!acc[type]) acc[type] = [];
    acc[type].push(rule);
    return acc;
  }, {} as Record<string, ApprovalRule[]>);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading approval workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Talent Approval Workflows</h3>
          <p className="text-sm text-muted-foreground">
            Configure approval workflows for Goals, Appraisals, 360 Feedback, and other talent processes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterProcessType} onValueChange={setFilterProcessType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by process" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Processes</SelectItem>
              {Object.entries(processTypeConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setSelectedRule(null); setRuleForm({
            name: "",
            process_type: "goals",
            scope_level: "individual",
            approval_type: "single_level",
            requires_hr_approval: false,
            max_approval_days: "",
            is_active: true,
          }); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Workflow
          </Button>
        </div>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No approval workflows configured</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRules).map(([processType, processRules]) => {
            const processConfig = processTypeConfig[processType as keyof typeof processTypeConfig] || processTypeConfig.goals;
            const ProcessIcon = processConfig.icon;
            
            return (
              <Card key={processType}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${processConfig.color}`}>
                      <ProcessIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{processConfig.label}</CardTitle>
                      <CardDescription>{processRules.length} workflow{processRules.length !== 1 ? 's' : ''} configured</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {processRules.map((rule) => {
                      const scopeConfig = scopeLevelConfig[rule.scope_level as keyof typeof scopeLevelConfig] || scopeLevelConfig.individual;
                      const ScopeIcon = scopeConfig.icon;
                      const steps = chainSteps[rule.id] || [];

                      return (
                        <AccordionItem key={rule.id} value={rule.id} className="border rounded-lg">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-4 w-full">
                              <div className="flex items-center gap-2">
                                <ScopeIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{scopeConfig.label}</span>
                              </div>
                              <Badge variant={rule.is_active ? "default" : "secondary"} className="ml-auto mr-4">
                                {rule.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {approvalTypeLabels[rule.approval_type]}
                                {rule.requires_hr_approval && " • HR Required"}
                              </span>
                              <div onClick={e => e.stopPropagation()}>
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
                                <h4 className="font-medium text-sm">Approval Chain ({steps.length} step{steps.length !== 1 ? 's' : ''})</h4>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openEditRule(rule)}>
                                    Edit
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
                                      <TableHead>Approver</TableHead>
                                      <TableHead>Required</TableHead>
                                      <TableHead>SLA</TableHead>
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
                                          ) : "—"}
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
                                  Delete Workflow
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Workflow Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRule ? "Edit Approval Workflow" : "Create Approval Workflow"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Workflow Name</Label>
              <Input
                value={ruleForm.name}
                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                placeholder="e.g., Manager Goal Approval"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Process Type</Label>
                <Select
                  value={ruleForm.process_type}
                  onValueChange={(v) => setRuleForm({ ...ruleForm, process_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(processTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Scope Level</Label>
                <Select
                  value={ruleForm.scope_level}
                  onValueChange={(v) => setRuleForm({ ...ruleForm, scope_level: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(scopeLevelConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  {Object.entries(approvalTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Max Approval Days (SLA)</Label>
              <Input
                type="number"
                value={ruleForm.max_approval_days}
                onChange={(e) => setRuleForm({ ...ruleForm, max_approval_days: e.target.value })}
                placeholder="e.g., 5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={ruleForm.requires_hr_approval}
                  onCheckedChange={(c) => setRuleForm({ ...ruleForm, requires_hr_approval: c })}
                />
                <Label>Requires HR Approval</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={ruleForm.is_active}
                  onCheckedChange={(c) => setRuleForm({ ...ruleForm, is_active: c })}
                />
                <Label>Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRule}>Save Workflow</Button>
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
                  {Object.entries(approverTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
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
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>SLA (Hours)</Label>
              <Input
                type="number"
                value={stepForm.sla_hours}
                onChange={(e) => setStepForm({ ...stepForm, sla_hours: e.target.value })}
                placeholder="e.g., 48"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={stepForm.is_optional}
                onCheckedChange={(c) => setStepForm({ ...stepForm, is_optional: c })}
              />
              <Label>Optional Step</Label>
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
