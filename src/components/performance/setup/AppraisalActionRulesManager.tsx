import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppraisalFormTemplates } from "@/hooks/useAppraisalFormTemplates";
import { 
  useAppraisalActionRules, 
  AppraisalActionRule, 
  CreateRuleInput,
  ConditionType,
  ActionType,
  ConditionSection,
  ConditionOperator,
  getRuleDescription
} from "@/hooks/useAppraisalActionRules";
import { Plus, Edit, Trash2, AlertTriangle, Info, ArrowRight, Shield } from "lucide-react";

interface Props {
  companyId: string;
}

const CONDITION_TYPES: { value: ConditionType; label: string }[] = [
  { value: "score_below", label: "Score Below Threshold" },
  { value: "score_above", label: "Score Above Threshold" },
  { value: "repeated_low", label: "Repeated Low Score" },
  { value: "gap_detected", label: "Performance Gap Detected" },
  { value: "improvement_trend", label: "Improvement Trend" },
  { value: "competency_gap", label: "Competency Gap" },
  { value: "goal_not_met", label: "Goal Not Met" },
];

const ACTION_TYPES: { value: ActionType; label: string; description: string }[] = [
  { value: "create_idp", label: "Create IDP", description: "Auto-create Individual Development Plan" },
  { value: "create_pip", label: "Create PIP", description: "Initiate Performance Improvement Plan" },
  { value: "suggest_succession", label: "Succession Suggestion", description: "Suggest for succession pool" },
  { value: "block_finalization", label: "Block Finalization", description: "Prevent appraisal completion" },
  { value: "require_comment", label: "Require Comment", description: "Manager must add justification" },
  { value: "notify_hr", label: "Notify HR", description: "Send alert to HR team" },
  { value: "schedule_coaching", label: "Schedule Coaching", description: "Prompt coaching session" },
  { value: "require_development_plan", label: "Require Dev Plan", description: "Mandate development planning" },
];

const SECTIONS: { value: ConditionSection; label: string }[] = [
  { value: "overall", label: "Overall Score" },
  { value: "goals", label: "Goals Section" },
  { value: "competencies", label: "Competencies Section" },
  { value: "responsibilities", label: "Responsibilities Section" },
  { value: "feedback_360", label: "360 Feedback Section" },
  { value: "values", label: "Values Section" },
];

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "<", label: "Less than" },
  { value: "<=", label: "Less than or equal" },
  { value: ">", label: "Greater than" },
  { value: ">=", label: "Greater than or equal" },
  { value: "=", label: "Equal to" },
  { value: "!=", label: "Not equal to" },
];

export function AppraisalActionRulesManager({ companyId }: Props) {
  const { templates, isLoading: templatesLoading } = useAppraisalFormTemplates(companyId);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  const { rules, isLoading: rulesLoading, createRule, updateRule, deleteRule, isCreating, isUpdating } = useAppraisalActionRules(selectedTemplateId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AppraisalActionRule | null>(null);

  const [formData, setFormData] = useState<Partial<CreateRuleInput>>({
    condition_type: "score_below",
    condition_section: "overall",
    condition_operator: "<",
    condition_threshold: 2.5,
    condition_cycles: 1,
    action_type: "create_idp",
    action_is_mandatory: false,
    action_priority: 1,
    requires_hr_override: false,
    auto_execute: false,
    is_active: true,
  });

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormData({
      condition_type: "score_below",
      condition_section: "overall",
      condition_operator: "<",
      condition_threshold: 2.5,
      condition_cycles: 1,
      action_type: "create_idp",
      action_is_mandatory: false,
      action_priority: 1,
      requires_hr_override: false,
      auto_execute: false,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (rule: AppraisalActionRule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      rule_code: rule.rule_code,
      description: rule.description || "",
      condition_type: rule.condition_type,
      condition_section: rule.condition_section,
      condition_operator: rule.condition_operator,
      condition_threshold: rule.condition_threshold,
      condition_cycles: rule.condition_cycles || 1,
      action_type: rule.action_type,
      action_is_mandatory: rule.action_is_mandatory,
      action_priority: rule.action_priority,
      action_description: rule.action_description || "",
      action_message: rule.action_message || "",
      requires_hr_override: rule.requires_hr_override,
      auto_execute: rule.auto_execute,
      is_active: rule.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.rule_name || !formData.rule_code) return;

    try {
      if (editingRule) {
        await updateRule({ id: editingRule.id, ...formData });
      } else {
        await createRule({
          ...formData,
          template_id: selectedTemplateId,
          company_id: companyId,
        } as CreateRuleInput);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this action rule? This cannot be undone.")) return;
    await deleteRule(id);
  };

  const isLoading = templatesLoading || rulesLoading;

  if (templatesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appraisal Action Rules</CardTitle>
              <CardDescription>Configure automated actions triggered by appraisal outcomes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Select Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Choose a template to configure rules" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                    {template.is_default && " (Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedTemplateId ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Select a template above to view and configure its action rules.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Configuring rules for: <strong>{selectedTemplate?.name}</strong>
                </div>
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              {rulesLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No action rules configured for this template.</p>
                  <p className="text-sm">Create rules to automate responses to appraisal outcomes.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div className="font-medium">{rule.rule_name}</div>
                          <div className="text-xs text-muted-foreground">{rule.rule_code}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{rule.condition_section}</Badge>
                            <span>{rule.condition_operator}</span>
                            <span className="font-mono">{rule.condition_threshold}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.action_type === "create_pip" ? "destructive" : "default"}>
                            {ACTION_TYPES.find(a => a.value === rule.action_type)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {rule.action_is_mandatory ? (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Mandatory
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Advisory</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.is_active ? "default" : "secondary"}>
                            {rule.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(rule)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Action Rule" : "Create Action Rule"}</DialogTitle>
            <DialogDescription>
              Define conditions and actions for appraisal outcomes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule_name">Rule Name *</Label>
                <Input
                  id="rule_name"
                  value={formData.rule_name || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                  placeholder="e.g., Low Score IDP Trigger"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule_code">Rule Code *</Label>
                <Input
                  id="rule_code"
                  value={formData.rule_code || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, rule_code: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  placeholder="e.g., low_score_idp"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this rule does..."
              />
            </div>

            {/* Condition Configuration */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Condition</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition Type</Label>
                  <Select 
                    value={formData.condition_type} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, condition_type: v as ConditionType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select 
                    value={formData.condition_section} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, condition_section: v as ConditionSection }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map((section) => (
                        <SelectItem key={section.value} value={section.value}>{section.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select 
                    value={formData.condition_operator} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, condition_operator: v as ConditionOperator }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.condition_threshold || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition_threshold: Number(e.target.value) }))}
                  />
                </div>

                {formData.condition_type === "repeated_low" && (
                  <div className="space-y-2">
                    <Label>Consecutive Cycles</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.condition_cycles || 1}
                      onChange={(e) => setFormData(prev => ({ ...prev, condition_cycles: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Configuration */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Action</Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select 
                    value={formData.action_type} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, action_type: v as ActionType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          <div>
                            <div>{action.label}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={String(formData.action_priority || 1)} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, action_priority: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Low</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">High</SelectItem>
                      <SelectItem value="4">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>User-Facing Message</Label>
                <Textarea
                  value={formData.action_message || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, action_message: e.target.value }))}
                  placeholder="Message shown to users when this rule triggers..."
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Enforcement Settings</Label>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Mandatory Action</Label>
                  <p className="text-sm text-muted-foreground">Block finalization until action is completed</p>
                </div>
                <Switch
                  checked={formData.action_is_mandatory || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, action_is_mandatory: checked }))}
                />
              </div>

              {formData.action_is_mandatory && (
                <div className="flex items-center justify-between pl-6">
                  <div>
                    <Label>Allow HR Override</Label>
                    <p className="text-sm text-muted-foreground">HR can bypass with justification</p>
                  </div>
                  <Switch
                    checked={formData.requires_hr_override || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_hr_override: checked }))}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Execute</Label>
                  <p className="text-sm text-muted-foreground">Automatically create IDP/PIP without confirmation</p>
                </div>
                <Switch
                  checked={formData.auto_execute || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_execute: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Rule is currently enforced</p>
                </div>
                <Switch
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>

            {/* Rule Preview */}
            {formData.rule_name && formData.condition_type && formData.action_type && (
              <Alert>
                <ArrowRight className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rule Logic:</strong> {getRuleDescription({
                    ...formData,
                    condition_type: formData.condition_type as ConditionType,
                    condition_section: formData.condition_section as ConditionSection,
                    condition_operator: (formData.condition_operator || "<") as ConditionOperator,
                    condition_threshold: formData.condition_threshold || 0,
                    action_type: formData.action_type as ActionType,
                    action_is_mandatory: formData.action_is_mandatory || false,
                  } as AppraisalActionRule)}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.rule_name || !formData.rule_code || isCreating || isUpdating}
            >
              {editingRule ? "Save Changes" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
