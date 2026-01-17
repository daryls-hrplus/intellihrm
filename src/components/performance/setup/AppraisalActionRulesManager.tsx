import { useState, useMemo } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppraisalFormTemplates } from "@/hooks/useAppraisalFormTemplates";
import { usePerformanceCategories } from "@/hooks/usePerformanceCategories";
import { useActionRuleAI, AISuggestedRule } from "@/hooks/useActionRuleAI";
import { RatingLevelSelector } from "./RatingLevelSelector";
import { 
  useAppraisalActionRules, 
  AppraisalActionRule, 
  CreateRuleInput,
  ConditionType,
  ActionType,
  ConditionSection,
  ConditionOperator,
} from "@/hooks/useAppraisalActionRules";
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  Shield, 
  Zap,
  FileText,
  UserCheck,
  TrendingUp,
  Bell,
  Calendar,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Lock,
  MessageSquare,
  Award,
  Target,
  Loader2,
  CheckCircle2,
  Building2
} from "lucide-react";

interface Props {
  companyId: string;
  companyName?: string;
}

// Simplified condition types with rating category support
const CONDITION_TYPES: { value: ConditionType | "rating_category"; label: string; description: string }[] = [
  { value: "rating_category", label: "Falls into Rating Category", description: "Trigger when score maps to specific rating level" },
  { value: "score_below", label: "Score Below Value", description: "Trigger when score falls below a specific number" },
  { value: "score_above", label: "Score Above Value", description: "Trigger when score exceeds a specific number" },
  { value: "repeated_low", label: "Consecutive Low Scores", description: "Trigger after multiple low-scoring cycles" },
];

const ACTION_TYPES: { value: ActionType; label: string; description: string; icon: React.ElementType }[] = [
  { value: "create_pip", label: "Create Performance Improvement Plan", description: "Initiate a formal PIP process", icon: AlertTriangle },
  { value: "create_idp", label: "Create Individual Development Plan", description: "Generate a development plan", icon: FileText },
  { value: "suggest_succession", label: "Suggest for Succession Pool", description: "Flag for leadership pipeline", icon: UserCheck },
  { value: "block_finalization", label: "Block Appraisal Finalization", description: "Prevent completion without action", icon: Shield },
  { value: "require_comment", label: "Require Manager Comment", description: "Mandate justification note", icon: FileText },
  { value: "notify_hr", label: "Notify HR Team", description: "Send alert to HR", icon: Bell },
  { value: "schedule_coaching", label: "Schedule Coaching Session", description: "Prompt coaching meeting", icon: Calendar },
  { value: "require_development_plan", label: "Require Development Plan", description: "Mandate development planning", icon: TrendingUp },
];

const SECTIONS: { value: ConditionSection; label: string }[] = [
  { value: "overall", label: "Overall Score" },
  { value: "goals", label: "Goals" },
  { value: "competencies", label: "Competencies" },
  { value: "responsibilities", label: "Responsibilities" },
  { value: "feedback_360", label: "360 Feedback" },
  { value: "values", label: "Values" },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: "Low", color: "bg-slate-500" },
  { value: 2, label: "Medium", color: "bg-amber-500" },
  { value: 3, label: "High", color: "bg-orange-500" },
  { value: 4, label: "Critical", color: "bg-destructive" },
];

// Template categories for filtering
const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "pip", label: "PIP" },
  { id: "development", label: "Development" },
  { id: "succession", label: "Succession" },
  { id: "coaching", label: "Coaching" },
  { id: "hr_alerts", label: "HR Alerts" },
  { id: "blocking", label: "Blocking" },
];

// Expanded quick rule templates - industry best practices
const RULE_TEMPLATES = [
  // PIP Rules
  {
    id: "low_score_pip",
    name: "Low Score → PIP",
    description: "Create PIP when employee receives low ratings",
    category: "pip",
    icon: AlertTriangle,
    color: "text-destructive",
    defaults: {
      rule_name: "Low Score PIP Trigger",
      rule_code: "low_score_pip",
      condition_type: "rating_category" as const,
      rating_level_codes: ["needs_improvement", "unsatisfactory"],
      condition_section: "overall" as ConditionSection,
      action_type: "create_pip" as ActionType,
      action_is_mandatory: true,
      action_priority: 4,
      action_message: "Based on your performance rating, a Performance Improvement Plan has been initiated. Your manager will schedule a meeting to discuss next steps.",
    },
  },
  {
    id: "critical_score_pip",
    name: "Critical Score → Immediate PIP",
    description: "Mandatory PIP for unsatisfactory ratings",
    category: "pip",
    icon: AlertTriangle,
    color: "text-destructive",
    defaults: {
      rule_name: "Critical Score Immediate PIP",
      rule_code: "critical_score_pip",
      condition_type: "rating_category" as const,
      rating_level_codes: ["unsatisfactory"],
      condition_section: "overall" as ConditionSection,
      action_type: "create_pip" as ActionType,
      action_is_mandatory: true,
      action_priority: 4,
      action_message: "Due to your performance rating, an immediate Performance Improvement Plan is required. HR has been notified.",
    },
  },
  // Blocking Rules
  {
    id: "critical_block",
    name: "Critical Score → Block Finalization",
    description: "Block appraisal until action is taken",
    category: "blocking",
    icon: Lock,
    color: "text-destructive",
    defaults: {
      rule_name: "Critical Score Blocking",
      rule_code: "critical_score_block",
      condition_type: "rating_category" as const,
      rating_level_codes: ["unsatisfactory"],
      condition_section: "overall" as ConditionSection,
      action_type: "block_finalization" as ActionType,
      action_is_mandatory: true,
      action_priority: 4,
      action_message: "This appraisal cannot be finalized until a Performance Improvement Plan has been initiated.",
    },
  },
  {
    id: "low_goals_block",
    name: "Low Goals Score → Block",
    description: "Block until goals are discussed",
    category: "blocking",
    icon: Lock,
    color: "text-amber-500",
    defaults: {
      rule_name: "Low Goals Score Block",
      rule_code: "low_goals_block",
      condition_type: "score_below" as const,
      rating_level_codes: [],
      condition_section: "goals" as ConditionSection,
      condition_threshold: 2.5,
      action_type: "block_finalization" as ActionType,
      action_is_mandatory: true,
      action_priority: 3,
      action_message: "Appraisal blocked: Goals section requires review and manager comment before finalization.",
    },
  },
  // HR Alerts
  {
    id: "low_score_hr_alert",
    name: "Low Score → Notify HR",
    description: "Alert HR when employee scores low",
    category: "hr_alerts",
    icon: Bell,
    color: "text-amber-500",
    defaults: {
      rule_name: "Low Score HR Alert",
      rule_code: "low_score_hr_alert",
      condition_type: "rating_category" as const,
      rating_level_codes: ["needs_improvement", "unsatisfactory"],
      condition_section: "overall" as ConditionSection,
      action_type: "notify_hr" as ActionType,
      action_is_mandatory: true,
      action_priority: 3,
      action_message: "HR has been notified of this performance rating for review and support.",
    },
  },
  {
    id: "star_performer_hr_alert",
    name: "Star Performer → Notify HR",
    description: "Alert HR for recognition and rewards",
    category: "hr_alerts",
    icon: Award,
    color: "text-emerald-500",
    defaults: {
      rule_name: "Star Performer Recognition Alert",
      rule_code: "star_performer_alert",
      condition_type: "rating_category" as const,
      rating_level_codes: ["exceptional"],
      condition_section: "overall" as ConditionSection,
      action_type: "notify_hr" as ActionType,
      action_is_mandatory: false,
      action_priority: 2,
      action_message: "This exceptional performer has been flagged for recognition and potential reward consideration.",
    },
  },
  // Succession
  {
    id: "high_performer_succession",
    name: "Top Performer → Succession",
    description: "Flag high performers for succession planning",
    category: "succession",
    icon: TrendingUp,
    color: "text-emerald-500",
    defaults: {
      rule_name: "High Performer Succession Flag",
      rule_code: "high_performer_succession",
      condition_type: "rating_category" as const,
      rating_level_codes: ["exceptional", "exceeds"],
      condition_section: "overall" as ConditionSection,
      action_type: "suggest_succession" as ActionType,
      action_is_mandatory: false,
      action_priority: 2,
      action_message: "This employee has been flagged for succession planning consideration based on their outstanding performance.",
    },
  },
  // Development
  {
    id: "average_idp",
    name: "Average Score → IDP",
    description: "Recommend development plan for average performers",
    category: "development",
    icon: FileText,
    color: "text-blue-500",
    defaults: {
      rule_name: "Average Score Development Plan",
      rule_code: "average_score_idp",
      condition_type: "rating_category" as const,
      rating_level_codes: ["meets"],
      condition_section: "overall" as ConditionSection,
      action_type: "create_idp" as ActionType,
      action_is_mandatory: false,
      action_priority: 2,
      action_message: "A development plan is recommended to help you grow into the next level of performance.",
    },
  },
  {
    id: "competency_gap_dev",
    name: "Competency Gap → Development Plan",
    description: "Require development when competencies are low",
    category: "development",
    icon: Target,
    color: "text-blue-500",
    defaults: {
      rule_name: "Competency Gap Development",
      rule_code: "competency_gap_dev",
      condition_type: "score_below" as const,
      rating_level_codes: [],
      condition_section: "competencies" as ConditionSection,
      condition_threshold: 3.0,
      action_type: "require_development_plan" as ActionType,
      action_is_mandatory: true,
      action_priority: 3,
      action_message: "A competency development plan is required to address identified skill gaps.",
    },
  },
  // Coaching
  {
    id: "needs_improvement_coaching",
    name: "Low Score → Schedule Coaching",
    description: "Prompt coaching session for struggling employees",
    category: "coaching",
    icon: Calendar,
    color: "text-violet-500",
    defaults: {
      rule_name: "Performance Coaching Session",
      rule_code: "needs_improvement_coaching",
      condition_type: "rating_category" as const,
      rating_level_codes: ["needs_improvement"],
      condition_section: "overall" as ConditionSection,
      action_type: "schedule_coaching" as ActionType,
      action_is_mandatory: false,
      action_priority: 2,
      action_message: "A coaching session has been recommended to support your performance improvement.",
    },
  },
  {
    id: "goals_gap_coaching",
    name: "Goals Gap → Schedule Coaching",
    description: "Coaching when goals performance is weak",
    category: "coaching",
    icon: Calendar,
    color: "text-violet-500",
    defaults: {
      rule_name: "Goals Coaching Session",
      rule_code: "goals_gap_coaching",
      condition_type: "score_below" as const,
      rating_level_codes: [],
      condition_section: "goals" as ConditionSection,
      condition_threshold: 3.0,
      action_type: "schedule_coaching" as ActionType,
      action_is_mandatory: false,
      action_priority: 2,
      action_message: "A coaching session is recommended to help improve your goal achievement.",
    },
  },
  // Comment Required
  {
    id: "low_score_comment",
    name: "Low Score → Require Comment",
    description: "Mandate manager justification for low ratings",
    category: "pip",
    icon: MessageSquare,
    color: "text-amber-500",
    defaults: {
      rule_name: "Low Score Comment Required",
      rule_code: "low_score_comment",
      condition_type: "rating_category" as const,
      rating_level_codes: ["needs_improvement", "unsatisfactory"],
      condition_section: "overall" as ConditionSection,
      action_type: "require_comment" as ActionType,
      action_is_mandatory: true,
      action_priority: 3,
      action_message: "Manager comment is required to justify this performance rating.",
    },
  },
];

interface FormData extends Partial<CreateRuleInput> {
  rating_level_codes?: string[];
}

export function AppraisalActionRulesManager({ companyId, companyName }: Props) {
  const { templates, isLoading: templatesLoading } = useAppraisalFormTemplates(companyId);
  const { data: ratingLevels } = usePerformanceCategories(companyId);
  const { isLoading: aiLoading, suggestions: aiSuggestions, getSuggestions, clearSuggestions } = useActionRuleAI();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  const { rules, isLoading: rulesLoading, createRule, updateRule, deleteRule, isCreating, isUpdating } = useAppraisalActionRules(selectedTemplateId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AppraisalActionRule | null>(null);
  const [activeTab, setActiveTab] = useState<"custom" | "templates" | "ai">("custom");
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    condition_type: "rating_category",
    condition_section: "overall",
    condition_operator: "<",
    condition_threshold: 2.5,
    condition_cycles: 1,
    rating_level_codes: [],
    action_type: "create_idp",
    action_is_mandatory: false,
    action_priority: 2,
    requires_hr_override: false,
    auto_execute: false,
    is_active: true,
  });

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (templateCategory === "all") return RULE_TEMPLATES;
    return RULE_TEMPLATES.filter(t => t.category === templateCategory);
  }, [templateCategory]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Generate rule preview text
  const rulePreview = useMemo(() => {
    if (!formData.condition_type || !formData.action_type) return null;

    const conditionType = formData.condition_type as ConditionType | "rating_category";
    let conditionText = "";
    
    if (conditionType === "rating_category" && formData.rating_level_codes?.length) {
      const selectedNames = ratingLevels
        ?.filter(r => formData.rating_level_codes?.includes(r.code))
        .map(r => r.name) || [];
      conditionText = `score falls into ${selectedNames.join(" or ")}`;
    } else if (conditionType === "score_below") {
      conditionText = `score is below ${formData.condition_threshold}`;
    } else if (conditionType === "score_above") {
      conditionText = `score is above ${formData.condition_threshold}`;
    } else if (conditionType === "repeated_low") {
      conditionText = `score is below ${formData.condition_threshold} for ${formData.condition_cycles} consecutive cycles`;
    }

    const sectionLabel = SECTIONS.find(s => s.value === formData.condition_section)?.label || "Overall";
    const actionLabel = ACTION_TYPES.find(a => a.value === formData.action_type)?.label || formData.action_type;
    const mandatory = formData.action_is_mandatory ? " (mandatory)" : " (advisory)";

    return `When ${sectionLabel} ${conditionText}, then ${actionLabel.toLowerCase()}${mandatory}.`;
  }, [formData, ratingLevels]);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormData({
      condition_type: "rating_category",
      condition_section: "overall",
      condition_operator: "<",
      condition_threshold: 2.5,
      condition_cycles: 1,
      rating_level_codes: [],
      action_type: "create_idp",
      action_is_mandatory: false,
      action_priority: 2,
      requires_hr_override: false,
      auto_execute: false,
      is_active: true,
    });
    setActiveTab("custom");
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
      rating_level_codes: (rule as any).rating_level_codes || [],
      action_type: rule.action_type,
      action_is_mandatory: rule.action_is_mandatory,
      action_priority: rule.action_priority,
      action_description: rule.action_description || "",
      action_message: rule.action_message || "",
      requires_hr_override: rule.requires_hr_override,
      auto_execute: rule.auto_execute,
      is_active: rule.is_active,
    });
    setActiveTab("custom");
    setDialogOpen(true);
  };

  const handleUseTemplate = (template: typeof RULE_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      ...template.defaults,
    }));
    setActiveTab("custom");
  };

  const handleUseAISuggestion = (suggestion: AISuggestedRule) => {
    setFormData({
      rule_name: suggestion.rule_name,
      rule_code: suggestion.rule_code,
      description: suggestion.description,
      condition_type: suggestion.condition_type,
      condition_section: suggestion.condition_section as ConditionSection,
      rating_level_codes: suggestion.rating_level_codes,
      action_type: suggestion.action_type as ActionType,
      action_is_mandatory: suggestion.action_is_mandatory,
      action_priority: suggestion.action_priority,
      action_message: suggestion.action_message,
      condition_threshold: 2.5,
      condition_cycles: 1,
      requires_hr_override: false,
      auto_execute: false,
      is_active: true,
    });
    setActiveTab("custom");
    setShowAiSuggestions(false);
  };

  const handleGetAISuggestions = async () => {
    if (!ratingLevels?.length) return;
    setShowAiSuggestions(true);
    await getSuggestions(
      ratingLevels.map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
        min_score: r.min_score,
        max_score: r.max_score,
        requires_pip: r.requires_pip || false,
        succession_eligible: r.succession_eligible || false,
        promotion_eligible: r.promotion_eligible || false,
        bonus_eligible: r.bonus_eligible || false,
      })),
      rules.map(r => ({
        rule_code: r.rule_code,
        action_type: r.action_type,
        rating_level_codes: (r as any).rating_level_codes,
      }))
    );
  };

  const handleSubmit = async () => {
    if (!formData.rule_name || !formData.rule_code) return;

    try {
      // For rating_category, store the rating codes and calculate threshold from them
      const submitData: any = { ...formData };
      
      if (formData.condition_type === "rating_category" && formData.rating_level_codes?.length) {
        // Find the minimum score threshold from selected rating levels
        const selectedLevels = ratingLevels?.filter(r => formData.rating_level_codes?.includes(r.code)) || [];
        if (selectedLevels.length > 0) {
          submitData.condition_threshold = Math.min(...selectedLevels.map(l => l.min_score));
          submitData.condition_operator = "<=";
          // Also store the max score for accurate matching
          const maxScore = Math.max(...selectedLevels.map(l => l.max_score));
          submitData.condition_threshold = maxScore;
        }
        submitData.condition_type = "score_below"; // Fall back to score_below for DB compatibility
      }

      if (editingRule) {
        await updateRule({ id: editingRule.id, ...submitData });
      } else {
        await createRule({
          ...submitData,
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

  const getRatingLevelDisplay = (rule: AppraisalActionRule) => {
    const codes = (rule as any).rating_level_codes as string[] | undefined;
    if (!codes?.length) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">{SECTIONS.find(s => s.value === rule.condition_section)?.label}</Badge>
          <span>{rule.condition_operator}</span>
          <span className="font-mono">{rule.condition_threshold}</span>
        </div>
      );
    }

    const matchingLevels = ratingLevels?.filter(l => codes.includes(l.code)) || [];
    return (
      <div className="flex flex-wrap gap-1">
        {matchingLevels.map(level => (
          <Badge 
            key={level.id} 
            variant="outline"
            style={{ borderColor: level.color, color: level.color }}
          >
            {level.name}
          </Badge>
        ))}
      </div>
    );
  };

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
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Appraisal Action Rules
              </CardTitle>
              <CardDescription>
                Automate actions based on appraisal outcomes and rating levels
              </CardDescription>
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
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No action rules configured</p>
                  <p className="text-sm mb-4">Create rules to automate responses to appraisal outcomes.</p>
                  <Button variant="outline" onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Rule
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule</TableHead>
                      <TableHead>Trigger Condition</TableHead>
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
                          <div className="text-xs text-muted-foreground font-mono">{rule.rule_code}</div>
                        </TableCell>
                        <TableCell>
                          {getRatingLevelDisplay(rule)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.action_type === "create_pip" ? "destructive" : "default"}>
                            {ACTION_TYPES.find(a => a.value === rule.action_type)?.label?.split(" ").slice(0, 2).join(" ")}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Action Rule" : "Create Action Rule"}</DialogTitle>
            {companyName && (
              <p className="text-sm text-muted-foreground">{companyName}</p>
            )}
            <DialogDescription>
              Define automated actions triggered by specific appraisal outcomes
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "custom" | "templates" | "ai")}>
            <TabsList className="mb-4">
              <TabsTrigger value="custom">Custom Rule</TabsTrigger>
              <TabsTrigger value="templates" disabled={!!editingRule}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Quick Templates
              </TabsTrigger>
              <TabsTrigger value="ai" disabled={!!editingRule}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Suggestions
              </TabsTrigger>
            </TabsList>

            {/* AI Suggestions Tab */}
            <TabsContent value="ai" className="space-y-4">
              <div className="text-center p-6 border-2 border-dashed rounded-lg bg-gradient-to-br from-violet-50/50 to-primary/5">
                <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">AI-Powered Rule Suggestions</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Let AI analyze your rating levels and existing rules to suggest intelligent action rules based on industry best practices.
                </p>
                <Button 
                  onClick={handleGetAISuggestions} 
                  disabled={aiLoading || !ratingLevels?.length}
                  className="gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Get AI Suggestions
                    </>
                  )}
                </Button>
              </div>

              {showAiSuggestions && (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3 pr-4">
                    {aiLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : aiSuggestions.length === 0 ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No additional rules suggested. Your current configuration covers the main scenarios.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      aiSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg hover:border-primary hover:bg-muted/30 transition-all cursor-pointer"
                          onClick={() => handleUseAISuggestion(suggestion)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{suggestion.rule_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {ACTION_TYPES.find(a => a.value === suggestion.action_type)?.label?.split(" ").slice(0, 2).join(" ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {suggestion.rating_level_codes.map(code => (
                                  <Badge key={code} variant="secondary" className="text-xs">
                                    {code}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground italic">
                                <Building2 className="h-3 w-3 inline mr-1" />
                                {suggestion.industry_context}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Quick Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Start with a pre-configured rule template based on industry best practices.
              </p>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={templateCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTemplateCategory(cat.id)}
                    className="text-xs"
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-[350px]">
                <div className="space-y-3 pr-4">
                  {filteredTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <div
                        key={template.id}
                        onClick={() => handleUseTemplate(template)}
                        className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/30 transition-all"
                      >
                        <div className={`p-2 rounded-lg bg-muted ${template.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.name}</span>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {template.category.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              {/* Rule Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule_name">Rule Name *</Label>
                  <Input
                    id="rule_name"
                    value={formData.rule_name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                    placeholder="e.g., Low Score PIP Trigger"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule_code">Rule Code *</Label>
                  <Input
                    id="rule_code"
                    value={formData.rule_code || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      rule_code: e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
                    }))}
                    placeholder="e.g., low_score_pip"
                    className="font-mono"
                  />
                </div>
              </div>

              <Separator />

              {/* WHEN Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">WHEN</div>
                  <span className="text-sm text-muted-foreground">this happens...</span>
                </div>

                <div className="pl-4 border-l-2 border-primary/30 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Condition Type</Label>
                      <Select 
                        value={formData.condition_type} 
                        onValueChange={(v) => setFormData(prev => ({ 
                          ...prev, 
                          condition_type: v as ConditionType | "rating_category",
                          rating_level_codes: v === "rating_category" ? prev.rating_level_codes : []
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_TYPES.map((type) => (
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

                  {formData.condition_type === "rating_category" ? (
                    <div className="space-y-2">
                      <Label>Rating Level(s)</Label>
                      <RatingLevelSelector
                        companyId={companyId}
                        selectedCodes={formData.rating_level_codes || []}
                        onSelectionChange={(codes) => setFormData(prev => ({ ...prev, rating_level_codes: codes }))}
                        multiSelect={true}
                        showEligibility={true}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Threshold Value</Label>
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
                  )}
                </div>
              </div>

              <Separator />

              {/* THEN Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded">THEN</div>
                  <span className="text-sm text-muted-foreground">do this...</span>
                </div>

                <div className="pl-4 border-l-2 border-emerald-500/30 space-y-4">
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTION_TYPES.map((action) => {
                        const Icon = action.icon;
                        const isSelected = formData.action_type === action.value;
                        return (
                          <div
                            key={action.value}
                            onClick={() => setFormData(prev => ({ ...prev, action_type: action.value }))}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected 
                                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <div>
                              <div className="text-sm font-medium">{action.label}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="flex gap-2">
                      {PRIORITY_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={formData.action_priority === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, action_priority: option.value }))}
                          className="flex-1"
                        >
                          <div className={`h-2 w-2 rounded-full mr-2 ${option.color}`} />
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Message to Employee (optional)</Label>
                    <Textarea
                      value={formData.action_message || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, action_message: e.target.value }))}
                      placeholder="Message shown to employees when this rule triggers..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-1 rounded">SETTINGS</div>
                  <span className="text-sm text-muted-foreground">enforcement options</span>
                </div>

                <div className="pl-4 border-l-2 border-muted space-y-4">
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
                    <div className="flex items-center justify-between pl-4">
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
                      <p className="text-sm text-muted-foreground">Create PIP/IDP automatically without confirmation</p>
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
                      checked={formData.is_active !== false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Rule Preview */}
              {rulePreview && formData.rule_name && (
                <Alert className="bg-muted/50">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Rule Preview:</strong> {rulePreview}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

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
