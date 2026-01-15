import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  Settings,
  AlertTriangle,
  Play,
  Pause,
  Zap,
  FileText,
  Bell,
  Calendar,
  TrendingUp,
  DollarSign,
  BarChart3,
  Grid3X3,
  Users,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Shield,
  Lock,
  ArrowRight,
  Target,
  Loader2,
  Info
} from "lucide-react";
import { 
  useUnifiedAppraisalRules, 
  UnifiedAppraisalRule,
  CreateUnifiedRuleInput,
  TargetModule,
  ActionType,
  ConditionType,
  ConditionSection,
  TARGET_MODULES,
  ACTION_TYPES,
  CONDITION_SECTIONS,
  PRIORITY_OPTIONS
} from "@/hooks/useUnifiedAppraisalRules";
import { usePerformanceCategories, PerformanceCategory } from "@/hooks/usePerformanceCategories";
import { useActionRuleAI, AISuggestedRule } from "@/hooks/useActionRuleAI";
import { RatingLevelSelector } from "./RatingLevelSelector";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface UnifiedAppraisalRulesManagerProps {
  companyId: string;
}

// Template categories for filtering
const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "pip", label: "PIP" },
  { id: "development", label: "Development" },
  { id: "succession", label: "Succession" },
  { id: "nine_box", label: "9-Box" },
  { id: "notifications", label: "Notifications" },
  { id: "compensation", label: "Compensation" },
];

// Quick rule templates covering all target modules
const RULE_TEMPLATES = [
  // PIP Rules
  {
    id: "low_score_pip",
    name: "Low Score → Create PIP",
    description: "Create Performance Improvement Plan for low performers",
    category: "pip",
    icon: AlertTriangle,
    color: "text-destructive",
    defaults: {
      name: "Low Score PIP Trigger",
      description: "Automatically create PIP when employee receives low rating",
      trigger_event: "appraisal_finalized" as const,
      condition_type: "category_match" as ConditionType,
      condition_operator: "in" as const,
      rating_level_codes: ["needs_improvement", "unsatisfactory"],
      condition_section: "overall" as ConditionSection,
      target_module: "pip" as TargetModule,
      action_type: "create" as ActionType,
      action_priority: 4,
      action_is_mandatory: true,
      action_message: "A Performance Improvement Plan has been initiated based on your performance rating.",
      auto_execute: true,
    },
  },
  // 9-Box Rules
  {
    id: "update_nine_box",
    name: "Finalized → Update 9-Box",
    description: "Automatically update 9-Box assessment from appraisal",
    category: "nine_box",
    icon: Grid3X3,
    color: "text-blue-500",
    defaults: {
      name: "Auto-Update 9-Box Assessment",
      description: "Update 9-Box performance rating when appraisal is finalized",
      trigger_event: "appraisal_finalized" as const,
      condition_type: "category_match" as ConditionType,
      condition_operator: "in" as const,
      rating_level_codes: [],
      condition_section: "overall" as ConditionSection,
      target_module: "nine_box" as TargetModule,
      action_type: "update" as ActionType,
      action_config: { performance_rating_from_score: true },
      action_priority: 2,
      action_is_mandatory: false,
      auto_execute: true,
    },
  },
  // Succession Rules
  {
    id: "high_performer_succession",
    name: "Top Performer → Succession",
    description: "Update succession readiness for high performers",
    category: "succession",
    icon: TrendingUp,
    color: "text-emerald-500",
    defaults: {
      name: "High Performer Succession Update",
      description: "Update succession readiness level based on performance",
      trigger_event: "category_assigned" as const,
      condition_type: "category_match" as ConditionType,
      condition_operator: "in" as const,
      rating_level_codes: ["exceptional", "exceeds"],
      condition_section: "overall" as ConditionSection,
      target_module: "succession" as TargetModule,
      action_type: "update" as ActionType,
      action_priority: 2,
      action_is_mandatory: false,
      action_message: "Employee has been flagged for succession planning consideration.",
      auto_execute: true,
    },
  },
  // IDP Rules
  {
    id: "average_idp",
    name: "Average Score → Create IDP",
    description: "Create development plan for average performers",
    category: "development",
    icon: FileText,
    color: "text-blue-500",
    defaults: {
      name: "Average Score Development Plan",
      description: "Recommend development plan for employees meeting expectations",
      trigger_event: "appraisal_finalized" as const,
      condition_type: "category_match" as ConditionType,
      condition_operator: "in" as const,
      rating_level_codes: ["meets"],
      condition_section: "overall" as ConditionSection,
      target_module: "idp" as TargetModule,
      action_type: "create" as ActionType,
      action_priority: 2,
      action_is_mandatory: false,
      action_message: "A development plan is recommended to help you grow.",
      auto_execute: false,
    },
  },
  // Notification Rules
  {
    id: "low_score_hr_notify",
    name: "Low Score → Notify HR",
    description: "Alert HR when employee scores low",
    category: "notifications",
    icon: Bell,
    color: "text-amber-500",
    defaults: {
      name: "Low Score HR Alert",
      description: "Send notification to HR for review and support",
      trigger_event: "appraisal_finalized" as const,
      condition_type: "category_match" as ConditionType,
      condition_operator: "in" as const,
      rating_level_codes: ["needs_improvement", "unsatisfactory"],
      condition_section: "overall" as ConditionSection,
      target_module: "notifications" as TargetModule,
      action_type: "notify" as ActionType,
      action_priority: 3,
      action_is_mandatory: true,
      action_message: "HR has been notified of this performance rating.",
      auto_execute: true,
    },
  },
  {
    id: "star_performer_notify",
    name: "Star Performer → Notify HR",
    description: "Alert HR for recognition and rewards",
    category: "notifications",
    icon: Bell,
    color: "text-emerald-500",
    defaults: {
      name: "Star Performer Recognition Alert",
      description: "Notify HR about exceptional performers for recognition",
      trigger_event: "category_assigned" as const,
      condition_type: "category_match" as ConditionType,
      condition_operator: "in" as const,
      rating_level_codes: ["exceptional"],
      condition_section: "overall" as ConditionSection,
      target_module: "notifications" as TargetModule,
      action_type: "notify" as ActionType,
      action_priority: 2,
      action_is_mandatory: false,
      action_message: "Exceptional performer flagged for recognition.",
      auto_execute: true,
    },
  },
  // Compensation Rules
  {
    id: "top_performer_comp",
    name: "Top Performer → Compensation Review",
    description: "Flag high performers for salary review",
    category: "compensation",
    icon: DollarSign,
    color: "text-emerald-500",
    defaults: {
      name: "Top Performer Compensation Flag",
      description: "Flag exceptional performers for compensation review",
      trigger_event: "appraisal_finalized" as const,
      condition_type: "category_match" as ConditionType,
      condition_operator: "in" as const,
      rating_level_codes: ["exceptional", "exceeds"],
      condition_section: "overall" as ConditionSection,
      target_module: "compensation" as TargetModule,
      action_type: "flag" as ActionType,
      action_priority: 2,
      action_is_mandatory: false,
      action_message: "Employee flagged for compensation review based on performance.",
      auto_execute: true,
    },
  },
  // Reminders/Coaching Rules
  {
    id: "low_score_coaching",
    name: "Low Score → Schedule Coaching",
    description: "Create coaching reminder for struggling employees",
    category: "development",
    icon: Calendar,
    color: "text-violet-500",
    defaults: {
      name: "Performance Coaching Reminder",
      description: "Create reminder to schedule coaching session",
      trigger_event: "appraisal_finalized" as const,
      condition_type: "category_match" as ConditionType,
      condition_operator: "in" as const,
      rating_level_codes: ["needs_improvement"],
      condition_section: "overall" as ConditionSection,
      target_module: "reminders" as TargetModule,
      action_type: "create" as ActionType,
      action_priority: 3,
      action_is_mandatory: false,
      action_message: "Coaching session has been recommended.",
      auto_execute: true,
    },
  },
];

// Module icon mapping
const MODULE_ICONS: Record<TargetModule, React.ElementType> = {
  nine_box: Grid3X3,
  succession: Users,
  idp: FileText,
  pip: AlertTriangle,
  compensation: DollarSign,
  workforce_analytics: BarChart3,
  notifications: Bell,
  reminders: Calendar,
};

function SortableRuleCard({ 
  rule, 
  ratingLevels,
  onEdit, 
  onDelete, 
  onToggle 
}: { 
  rule: UnifiedAppraisalRule;
  ratingLevels: PerformanceCategory[];
  onEdit: () => void; 
  onDelete: () => void;
  onToggle: (active: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const ModuleIcon = MODULE_ICONS[rule.target_module] || Settings;
  const moduleInfo = TARGET_MODULES.find(m => m.value === rule.target_module);

  const matchingLevels = ratingLevels.filter(l => rule.rating_level_codes?.includes(l.code));

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
    >
      <button {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1 rounded">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm">{rule.name}</p>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <ModuleIcon className="h-3 w-3" />
            {moduleInfo?.label}
          </Badge>
          {rule.action_is_mandatory && (
            <Badge variant="destructive" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Mandatory
            </Badge>
          )}
          {rule.requires_approval && (
            <Badge variant="secondary" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Approval Required
            </Badge>
          )}
        </div>
        
        {/* Rating levels or condition display */}
        <div className="flex flex-wrap gap-1 mt-1">
          {matchingLevels.length > 0 ? (
            matchingLevels.map(level => (
              <Badge 
                key={level.id} 
                variant="outline"
                className="text-xs"
                style={{ borderColor: level.color, color: level.color }}
              >
                {level.name}
              </Badge>
            ))
          ) : rule.condition_value !== null ? (
            <span className="text-xs text-muted-foreground">
              Score {rule.condition_operator} {rule.condition_value}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">All appraisals</span>
          )}
        </div>
        
        {rule.description && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{rule.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Switch 
          checked={rule.is_active} 
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-primary"
        />
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function UnifiedAppraisalRulesManager({ companyId }: UnifiedAppraisalRulesManagerProps) {
  const { allRules: rules, isLoadingAll: loading, createRule, updateRule, deleteRule, toggleRule, reorderRules } = useUnifiedAppraisalRules(companyId);
  const { data: ratingLevels = [] } = usePerformanceCategories(companyId);
  const { isLoading: aiLoading, suggestions: aiSuggestions, getSuggestions, clearSuggestions } = useActionRuleAI();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<UnifiedAppraisalRule | null>(null);
  const [activeDialogTab, setActiveDialogTab] = useState<"custom" | "templates" | "ai">("custom");
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  
  const [formData, setFormData] = useState<Partial<CreateUnifiedRuleInput>>({
    name: "",
    description: "",
    trigger_event: "appraisal_finalized",
    condition_type: "category_match",
    condition_operator: "in",
    rating_level_codes: [],
    condition_section: "overall",
    target_module: "notifications",
    action_type: "notify",
    action_config: {},
    action_priority: 2,
    action_is_mandatory: false,
    action_message: "",
    requires_hr_override: false,
    auto_execute: true,
    requires_approval: false,
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (templateCategory === "all") return RULE_TEMPLATES;
    return RULE_TEMPLATES.filter(t => t.category === templateCategory);
  }, [templateCategory]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = rules.findIndex(r => r.id === active.id);
      const newIndex = rules.findIndex(r => r.id === over.id);
      const newOrder = [...rules];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      await reorderRules(newOrder.map(r => r.id));
    }
  };

  const openCreateDialog = () => {
    setEditingRule(null);
    setFormData({
      name: "",
      description: "",
      trigger_event: "appraisal_finalized",
      condition_type: "category_match",
      condition_operator: "in",
      rating_level_codes: [],
      condition_section: "overall",
      target_module: "notifications",
      action_type: "notify",
      action_config: {},
      action_priority: 2,
      action_is_mandatory: false,
      action_message: "",
      requires_hr_override: false,
      auto_execute: true,
      requires_approval: false,
      is_active: true,
    });
    setActiveDialogTab("templates");
    setDialogOpen(true);
  };

  const openEditDialog = (rule: UnifiedAppraisalRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      trigger_event: rule.trigger_event,
      condition_type: rule.condition_type,
      condition_operator: rule.condition_operator,
      condition_value: rule.condition_value ?? undefined,
      rating_level_codes: rule.rating_level_codes || [],
      condition_section: rule.condition_section || "overall",
      target_module: rule.target_module,
      action_type: rule.action_type,
      action_config: rule.action_config || {},
      action_priority: rule.action_priority,
      action_is_mandatory: rule.action_is_mandatory,
      action_message: rule.action_message || "",
      requires_hr_override: rule.requires_hr_override,
      auto_execute: rule.auto_execute,
      requires_approval: rule.requires_approval,
      is_active: rule.is_active,
    });
    setActiveDialogTab("custom");
    setDialogOpen(true);
  };

  const handleUseTemplate = (template: typeof RULE_TEMPLATES[0]) => {
    // Check if template's codes match any configured rating levels
    const templateCodes = template.defaults.rating_level_codes || [];
    const matchingCodes = templateCodes.filter(
      code => ratingLevels.some(r => r.code.toLowerCase() === code.toLowerCase())
    );

    if (templateCodes.length > 0 && matchingCodes.length === 0) {
      toast.warning(
        `This template uses rating levels (${templateCodes.join(', ')}) that don't match your setup. Please select the appropriate rating levels manually.`,
        { duration: 6000 }
      );
    } else if (matchingCodes.length < templateCodes.length && templateCodes.length > 0) {
      const missing = templateCodes.filter(
        code => !ratingLevels.some(r => r.code.toLowerCase() === code.toLowerCase())
      );
      toast.info(
        `Some template rating levels (${missing.join(', ')}) were not found. Please verify your selection.`,
        { duration: 5000 }
      );
    }

    // Map matching codes to actual codes (preserve case from DB)
    const actualMatchingCodes = matchingCodes.map(code => {
      const match = ratingLevels.find(r => r.code.toLowerCase() === code.toLowerCase());
      return match?.code || code;
    });

    setFormData(prev => ({
      ...prev,
      ...template.defaults,
      // Only include codes that actually exist
      rating_level_codes: actualMatchingCodes,
    }));
    setActiveDialogTab("custom");
  };

  const handleUseAISuggestion = (suggestion: AISuggestedRule) => {
    // Map the AI suggestion to our unified format
    const targetModule: TargetModule = 
      suggestion.action_type === "create_pip" ? "pip" :
      suggestion.action_type === "create_idp" ? "idp" :
      suggestion.action_type === "suggest_succession" ? "succession" :
      suggestion.action_type === "notify_hr" ? "notifications" :
      suggestion.action_type === "schedule_coaching" ? "reminders" : "notifications";

    const actionType: ActionType =
      suggestion.action_type === "create_pip" || suggestion.action_type === "create_idp" ? "create" :
      suggestion.action_type === "suggest_succession" ? "update" : "notify";

    setFormData({
      name: suggestion.rule_name,
      description: suggestion.description,
      trigger_event: "appraisal_finalized",
      condition_type: "category_match",
      condition_operator: "in",
      rating_level_codes: suggestion.rating_level_codes,
      condition_section: suggestion.condition_section as ConditionSection,
      target_module: targetModule,
      action_type: actionType,
      action_priority: suggestion.action_priority,
      action_is_mandatory: suggestion.action_is_mandatory,
      action_message: suggestion.action_message,
      auto_execute: true,
      requires_approval: false,
      is_active: true,
    });
    setActiveDialogTab("custom");
  };

  const handleGetAISuggestions = async () => {
    if (!ratingLevels?.length) return;
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
        rule_code: r.name,
        action_type: r.action_type,
        rating_level_codes: r.rating_level_codes,
      }))
    );
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Rule name is required");
      return;
    }

    // Validate rating levels are selected when using category_match condition
    if (formData.condition_type === "category_match") {
      // Check if any rating level codes are specified
      if (!formData.rating_level_codes?.length) {
        toast.error("At least one rating level must be selected for this rule to trigger");
        return;
      }

      // Check if selected codes actually exist in configured rating levels
      const validCodes = formData.rating_level_codes.filter(
        code => ratingLevels.some(r => r.code === code)
      );

      if (validCodes.length === 0) {
        toast.error(
          "None of the selected rating levels exist in your configuration. Please select valid rating levels or set up rating levels first."
        );
        return;
      }

      // Warn if some codes are invalid but allow save with valid ones
      if (validCodes.length < formData.rating_level_codes.length) {
        const invalidCodes = formData.rating_level_codes.filter(
          code => !ratingLevels.some(r => r.code === code)
        );
        toast.warning(
          `Some rating levels were not found: ${invalidCodes.join(', ')}. Rule will only trigger for valid levels.`
        );
        formData.rating_level_codes = validCodes;
      }
    }

    try {
      if (editingRule) {
        await updateRule({ id: editingRule.id, ...formData });
      } else {
        await createRule({
          ...formData,
          company_id: companyId,
        } as CreateUnifiedRuleInput);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rule? This cannot be undone.")) return;
    await deleteRule(id);
  };

  const handleToggle = async (id: string, active: boolean) => {
    await toggleRule({ id, isActive: active });
  };

  // Rule preview text
  const rulePreview = useMemo(() => {
    if (!formData.target_module) return null;

    const moduleInfo = TARGET_MODULES.find(m => m.value === formData.target_module);
    const actionInfo = ACTION_TYPES.find(a => a.value === formData.action_type);
    const sectionInfo = CONDITION_SECTIONS.find(s => s.value === formData.condition_section);

    let conditionText = "";
    if (formData.rating_level_codes?.length) {
      const selectedNames = ratingLevels
        ?.filter(r => formData.rating_level_codes?.includes(r.code))
        .map(r => r.name) || [];
      conditionText = `rating is ${selectedNames.join(" or ")}`;
    } else if (formData.condition_value) {
      conditionText = `${sectionInfo?.label || 'score'} ${formData.condition_operator} ${formData.condition_value}`;
    } else {
      conditionText = "appraisal is finalized";
    }

    const mandatory = formData.action_is_mandatory ? " (mandatory)" : "";

    return `When ${conditionText}, then ${actionInfo?.label?.toLowerCase()} in ${moduleInfo?.label}${mandatory}.`;
  }, [formData, ratingLevels]);

  if (loading) {
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
                Appraisal Outcome Rules
              </CardTitle>
              <CardDescription>
                Automate actions across HR modules based on appraisal outcomes
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No outcome rules configured</p>
              <p className="text-sm mb-4">Create rules to automate actions when appraisals are finalized.</p>
              <Button variant="outline" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Rule
              </Button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={rules.map(r => r.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {rules.map(rule => (
                    <SortableRuleCard
                      key={rule.id}
                      rule={rule}
                      ratingLevels={ratingLevels}
                      onEdit={() => openEditDialog(rule)}
                      onDelete={() => handleDelete(rule.id)}
                      onToggle={(active) => handleToggle(rule.id, active)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Rule Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Rule" : "Create Outcome Rule"}</DialogTitle>
            <DialogDescription>
              Configure automated actions that trigger when appraisals are finalized
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeDialogTab} onValueChange={(v) => setActiveDialogTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Quick Templates
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Suggestions
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Custom Rule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-4">
              <div className="space-y-4">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <Button
                      key={cat.id}
                      size="sm"
                      variant={templateCategory === cat.id ? "default" : "outline"}
                      onClick={() => setTemplateCategory(cat.id)}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>

                <ScrollArea className="h-[350px]">
                  <div className="grid grid-cols-2 gap-3">
                    {filteredTemplates.map(template => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleUseTemplate(template)}
                          className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-muted ${template.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{template.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {TARGET_MODULES.find(m => m.value === template.defaults.target_module)?.label}
                              </Badge>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-4">
              <div className="space-y-4">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Get AI-powered rule suggestions based on your rating levels and existing rules.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleGetAISuggestions} 
                  disabled={aiLoading || !ratingLevels?.length}
                  className="w-full"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Suggestions
                    </>
                  )}
                </Button>

                {aiSuggestions && aiSuggestions.length > 0 && (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleUseAISuggestion(suggestion)}
                          className="w-full p-4 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all text-left"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{suggestion.rule_name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {suggestion.rating_level_codes?.map(code => {
                                  const level = ratingLevels.find(l => l.code === code);
                                  return level ? (
                                    <Badge 
                                      key={code} 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{ borderColor: level.color, color: level.color }}
                                    >
                                      {level.name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">{suggestion.action_type.replace('_', ' ')}</Badge>
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-6">
                  {/* Rule Preview */}
                  {rulePreview && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        {rulePreview}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Rating Level Validation Warning */}
                  {formData.condition_type === "category_match" && (
                    <>
                      {!ratingLevels.length ? (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            No rating levels are configured. Rules require rating levels to trigger.{" "}
                            <a href="/performance/setup?tab=appraisals&sub=performance-categories" className="underline font-medium">
                              Set up rating levels first
                            </a>
                          </AlertDescription>
                        </Alert>
                      ) : formData.rating_level_codes?.length === 0 ? (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            At least one rating level must be selected for this rule to trigger.
                          </AlertDescription>
                        </Alert>
                      ) : null}
                    </>
                  )}

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Rule Name *</Label>
                      <Input
                        value={formData.name || ""}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Low Score PIP Trigger"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description || ""}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe what this rule does..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* WHEN - Condition */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      When this happens...
                    </h4>

                    <div className="space-y-2">
                      <Label>Rating Level(s)</Label>
                      <RatingLevelSelector
                        companyId={companyId}
                        selectedCodes={formData.rating_level_codes || []}
                        onSelectionChange={codes => setFormData({ ...formData, rating_level_codes: codes })}
                        multiSelect
                      />
                      <p className="text-xs text-muted-foreground">
                        Select rating levels that trigger this rule. Leave empty to apply to all.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Score Section</Label>
                      <Select
                        value={formData.condition_section}
                        onValueChange={v => setFormData({ ...formData, condition_section: v as ConditionSection })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_SECTIONS.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* THEN - Action */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Then do this...
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Target Module *</Label>
                        <Select
                          value={formData.target_module}
                          onValueChange={v => setFormData({ ...formData, target_module: v as TargetModule })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TARGET_MODULES.map(t => (
                              <SelectItem key={t.value} value={t.value}>
                                <div className="flex items-center gap-2">
                                  {t.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Action Type *</Label>
                        <Select
                          value={formData.action_type}
                          onValueChange={v => setFormData({ ...formData, action_type: v as ActionType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTION_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={String(formData.action_priority || 2)}
                        onValueChange={v => setFormData({ ...formData, action_priority: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map(p => (
                            <SelectItem key={p.value} value={String(p.value)}>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${p.color}`} />
                                {p.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Message (optional)</Label>
                      <Textarea
                        value={formData.action_message || ""}
                        onChange={e => setFormData({ ...formData, action_message: e.target.value })}
                        placeholder="Message shown to employee/manager when action is triggered..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Execution Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Execution Settings
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <Label className="text-sm">Auto Execute</Label>
                          <p className="text-xs text-muted-foreground">Run automatically</p>
                        </div>
                        <Switch
                          checked={formData.auto_execute}
                          onCheckedChange={v => setFormData({ ...formData, auto_execute: v })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <Label className="text-sm">Mandatory</Label>
                          <p className="text-xs text-muted-foreground">Cannot be skipped</p>
                        </div>
                        <Switch
                          checked={formData.action_is_mandatory}
                          onCheckedChange={v => setFormData({ ...formData, action_is_mandatory: v })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <Label className="text-sm">Requires Approval</Label>
                          <p className="text-xs text-muted-foreground">Queue for review</p>
                        </div>
                        <Switch
                          checked={formData.requires_approval}
                          onCheckedChange={v => setFormData({ ...formData, requires_approval: v })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <Label className="text-sm">Active</Label>
                          <p className="text-xs text-muted-foreground">Enable this rule</p>
                        </div>
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={v => setFormData({ ...formData, is_active: v })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {editingRule ? "Update Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
