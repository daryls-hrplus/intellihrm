import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppraisalFormTemplates, AppraisalFormTemplate, CreateTemplateInput, validateWeights } from "@/hooks/useAppraisalFormTemplates";
import { useAppraisalTemplateSections } from "@/hooks/useAppraisalTemplateSections";
import { useAppraisalTemplatePhases, validatePhaseTimeline } from "@/hooks/useAppraisalTemplatePhases";
import { toast } from "sonner";
import { TemplateSectionConfigPanel } from "./TemplateSectionConfigPanel";
import { AppraisalPhaseTimeline } from "./AppraisalPhaseTimeline";
import { AppraisalFormTemplatePreview } from "./AppraisalFormTemplatePreview";
import { 
  Plus, Edit, Trash2, Copy, Star, Lock, AlertTriangle, CheckCircle, 
  Target, BookOpen, Users, MessageSquare, Heart, ChevronLeft, ChevronRight,
  Calendar, Shield, Building, Eye, EyeOff, Check
} from "lucide-react";
import { CYCLE_TYPE_PRESETS, type AppraisalCycleType, type WeightEnforcement } from "@/types/appraisalFormTemplates";
import { cn } from "@/lib/utils";

interface Props {
  companyId: string;
  companyName?: string;
}

export function AppraisalFormTemplateManager({ companyId, companyName }: Props) {
  const { 
    templates, 
    isLoading, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate, 
    duplicateTemplate, 
    setDefaultTemplate, 
    isCreating, 
    isUpdating 
  } = useAppraisalFormTemplates(companyId);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AppraisalFormTemplate | null>(null);
  const [duplicatingTemplate, setDuplicatingTemplate] = useState<AppraisalFormTemplate | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateCode, setDuplicateCode] = useState("");
  const [wizardStep, setWizardStep] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const WIZARD_STEPS = ['basics', 'sections', 'phases', 'timing', 'governance'] as const;
  type WizardStep = typeof WIZARD_STEPS[number];

  // Section and phase hooks - only active when editing
  const { 
    sections, 
    createSection, 
    updateSection, 
    deleteSection, 
    reorderSections,
    isUpdating: isSectionUpdating 
  } = useAppraisalTemplateSections(editingTemplate?.id);
  
  const { 
    phases, 
    createPhase, 
    updatePhase, 
    deletePhase, 
    reorderPhases,
    bulkCreatePhases,
    isUpdating: isPhaseUpdating 
  } = useAppraisalTemplatePhases(editingTemplate?.id);

  const [formData, setFormData] = useState<Partial<CreateTemplateInput> & {
    applicable_cycle_types?: AppraisalCycleType[];
    weight_enforcement?: WeightEnforcement;
    default_duration_days?: number;
    default_evaluation_offset_days?: number;
    default_grace_period_days?: number;
    version_number?: number;
    is_draft?: boolean;
  }>({
    include_goals: true,
    include_competencies: true,
    include_responsibilities: true,
    include_360_feedback: false,
    include_values: false,
    goals_weight: 40,
    competencies_weight: 30,
    responsibilities_weight: 20,
    feedback_360_weight: 0,
    values_weight: 10,
    min_rating: 1,
    max_rating: 5,
    is_locked: false,
    allow_weight_override: true,
    requires_hr_approval_for_override: false,
    is_active: true,
    applicable_cycle_types: ['annual'],
    weight_enforcement: 'strict',
    default_duration_days: 365,
    default_evaluation_offset_days: 14,
    default_grace_period_days: 3,
    version_number: 1,
    is_draft: false,
  });

  const weightValidation = validateWeights(formData);

  // Determine if we're using legacy weights or new section-based weights
  const useLegacySections = sections.length === 0;

  // Generate preview sections from legacy form data when no custom sections exist
  const previewSections = useMemo(() => {
    if (!useLegacySections) return sections;
    
    // Create mock sections from legacy form data for preview
    const legacyPreviewSections: Array<{
      id: string;
      template_id: string;
      section_type: string;
      display_name: string;
      weight: number;
      display_order: number;
      is_active: boolean;
      visible_to_employee: boolean;
      visible_to_manager: boolean;
      is_advisory_only: boolean;
      include_in_final_score: boolean;
      scoring_method: string;
      deadline_offset_days: number;
      advisory_label: string | null;
    }> = [];

    if (formData.include_goals) {
      legacyPreviewSections.push({
        id: 'legacy-goals',
        template_id: editingTemplate?.id || 'new',
        section_type: 'goals',
        display_name: 'Goals',
        weight: formData.goals_weight || 0,
        display_order: 1,
        is_active: true,
        visible_to_employee: true,
        visible_to_manager: true,
        is_advisory_only: false,
        include_in_final_score: true,
        scoring_method: 'numeric',
        deadline_offset_days: 0,
        advisory_label: null,
      });
    }

    if (formData.include_competencies) {
      legacyPreviewSections.push({
        id: 'legacy-competencies',
        template_id: editingTemplate?.id || 'new',
        section_type: 'competencies',
        display_name: 'Competencies',
        weight: formData.competencies_weight || 0,
        display_order: 2,
        is_active: true,
        visible_to_employee: true,
        visible_to_manager: true,
        is_advisory_only: false,
        include_in_final_score: true,
        scoring_method: 'numeric',
        deadline_offset_days: 0,
        advisory_label: null,
      });
    }

    if (formData.include_responsibilities) {
      legacyPreviewSections.push({
        id: 'legacy-responsibilities',
        template_id: editingTemplate?.id || 'new',
        section_type: 'responsibilities',
        display_name: 'Responsibilities',
        weight: formData.responsibilities_weight || 0,
        display_order: 3,
        is_active: true,
        visible_to_employee: true,
        visible_to_manager: true,
        is_advisory_only: false,
        include_in_final_score: true,
        scoring_method: 'numeric',
        deadline_offset_days: 0,
        advisory_label: null,
      });
    }

    if (formData.include_360_feedback) {
      legacyPreviewSections.push({
        id: 'legacy-feedback_360',
        template_id: editingTemplate?.id || 'new',
        section_type: 'feedback_360',
        display_name: '360 Feedback',
        weight: formData.feedback_360_weight || 0,
        display_order: 4,
        is_active: true,
        visible_to_employee: true,
        visible_to_manager: true,
        is_advisory_only: true,
        include_in_final_score: false,
        scoring_method: 'aggregate',
        deadline_offset_days: 7,
        advisory_label: 'Peer feedback informs the overall assessment but does not directly affect the final score.',
      });
    }

    if (formData.include_values) {
      legacyPreviewSections.push({
        id: 'legacy-values',
        template_id: editingTemplate?.id || 'new',
        section_type: 'values',
        display_name: 'Values',
        weight: formData.values_weight || 0,
        display_order: 5,
        is_active: true,
        visible_to_employee: true,
        visible_to_manager: true,
        is_advisory_only: false,
        include_in_final_score: true,
        scoring_method: 'numeric',
        deadline_offset_days: 0,
        advisory_label: null,
      });
    }

    return legacyPreviewSections;
  }, [useLegacySections, sections, formData, editingTemplate?.id]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setWizardStep(0);
    setFormData({
      include_goals: true,
      include_competencies: true,
      include_responsibilities: true,
      include_360_feedback: false,
      include_values: false,
      goals_weight: 40,
      competencies_weight: 30,
      responsibilities_weight: 20,
      feedback_360_weight: 0,
      values_weight: 10,
      min_rating: 1,
      max_rating: 5,
      is_locked: false,
      allow_weight_override: true,
      requires_hr_approval_for_override: false,
      is_active: true,
      applicable_cycle_types: ['annual'],
      weight_enforcement: 'strict',
      default_duration_days: 365,
      default_evaluation_offset_days: 14,
      default_grace_period_days: 3,
      version_number: 1,
      is_draft: false,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (template: AppraisalFormTemplate) => {
    setEditingTemplate(template);
    setWizardStep(0);
    setFormData({
      name: template.name,
      code: template.code,
      description: template.description || "",
      include_goals: template.include_goals,
      include_competencies: template.include_competencies,
      include_responsibilities: template.include_responsibilities,
      include_360_feedback: template.include_360_feedback,
      include_values: template.include_values,
      goals_weight: template.goals_weight,
      competencies_weight: template.competencies_weight,
      responsibilities_weight: template.responsibilities_weight,
      feedback_360_weight: template.feedback_360_weight,
      values_weight: template.values_weight,
      min_rating: template.min_rating,
      max_rating: template.max_rating,
      is_locked: template.is_locked,
      allow_weight_override: template.allow_weight_override,
      requires_hr_approval_for_override: template.requires_hr_approval_for_override,
      is_active: template.is_active,
      applicable_cycle_types: (template as any).applicable_cycle_types || ['annual'],
      weight_enforcement: (template as any).weight_enforcement || 'strict',
      default_duration_days: (template as any).default_duration_days || 365,
      default_evaluation_offset_days: (template as any).default_evaluation_offset_days || 14,
      default_grace_period_days: (template as any).default_grace_period_days || 3,
      version_number: (template as any).version_number || 1,
      is_draft: (template as any).is_draft || false,
    });
    setDialogOpen(true);
  };

  const handleOpenDuplicate = (template: AppraisalFormTemplate) => {
    setDuplicatingTemplate(template);
    setDuplicateName(`${template.name} (Copy)`);
    setDuplicateCode(`${template.code}_copy`);
    setDuplicateDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (useLegacySections && !weightValidation.valid) return;

    // Phase ordering validation (for existing templates with phases)
    if (editingTemplate && phases.length > 0) {
      const phaseValidation = validatePhaseTimeline(phases);
      if (!phaseValidation.valid) {
        toast.error(phaseValidation.issues[0]);
        setWizardStep(2); // Navigate to Phases tab
        return;
      }
    }

    try {
      if (editingTemplate) {
        await updateTemplate({ id: editingTemplate.id, ...formData });
      } else {
        await createTemplate({ ...formData, company_id: companyId } as CreateTemplateInput);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDuplicate = async () => {
    if (!duplicatingTemplate) return;
    try {
      await duplicateTemplate({ id: duplicatingTemplate.id, newName: duplicateName, newCode: duplicateCode });
      setDuplicateDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template? This action cannot be undone.")) return;
    await deleteTemplate(id);
  };

  const updateWeight = (section: string, value: number) => {
    setFormData(prev => ({ ...prev, [section]: value }));
  };

  const toggleSection = (section: string, enabled: boolean) => {
    const sectionKey = `include_${section}` as keyof typeof formData;
    const weightKey = `${section}_weight` as keyof typeof formData;
    
    setFormData(prev => ({
      ...prev,
      [sectionKey]: enabled,
      [weightKey]: enabled ? 20 : 0,
    }));
  };

  const handleCycleTypeChange = (cycleType: AppraisalCycleType) => {
    const preset = CYCLE_TYPE_PRESETS[cycleType];
    setFormData(prev => ({
      ...prev,
      applicable_cycle_types: [cycleType],
      weight_enforcement: preset.weightEnforcement,
      default_duration_days: preset.defaultDurationDays,
      default_evaluation_offset_days: preset.defaultEvaluationOffset,
    }));
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "goals": return <Target className="h-4 w-4" />;
      case "competencies": return <BookOpen className="h-4 w-4" />;
      case "responsibilities": return <Users className="h-4 w-4" />;
      case "feedback_360": return <MessageSquare className="h-4 w-4" />;
      case "values": return <Heart className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
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

  const legacySections = [
    { key: "goals", label: "Goals", includeKey: "include_goals", weightKey: "goals_weight" },
    { key: "competencies", label: "Competencies", includeKey: "include_competencies", weightKey: "competencies_weight" },
    { key: "responsibilities", label: "Responsibilities", includeKey: "include_responsibilities", weightKey: "responsibilities_weight" },
    { key: "feedback_360", label: "360 Feedback", includeKey: "include_360_feedback", weightKey: "feedback_360_weight" },
    { key: "values", label: "Values", includeKey: "include_values", weightKey: "values_weight" },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Appraisal Form Templates</CardTitle>
            <CardDescription>Configure reusable templates with section weights and settings</CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates configured. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Cycle Type</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => {
                  const cycleTypes = (template as any).applicable_cycle_types || ['annual'];
                  const version = (template as any).version_number || 1;
                  
                  return (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {template.name}
                          {template.is_default && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                          {template.is_locked && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                          <Badge variant="secondary" className="text-xs">
                            v{version}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{template.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {cycleTypes[0]?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {template.include_goals && <Badge variant="outline" className="text-xs">Goals</Badge>}
                          {template.include_competencies && <Badge variant="outline" className="text-xs">Comp</Badge>}
                          {template.include_responsibilities && <Badge variant="outline" className="text-xs">Resp</Badge>}
                          {template.include_360_feedback && <Badge variant="outline" className="text-xs">360</Badge>}
                          {template.include_values && <Badge variant="outline" className="text-xs">Values</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(template)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDuplicate(template)} title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </Button>
                        {!template.is_default && (
                          <Button variant="ghost" size="icon" onClick={() => setDefaultTemplate(template.id)} title="Set as Default">
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="gap-2"
                >
                  {previewOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {previewOpen ? "Hide Preview" : "Preview"}
                </Button>
                {companyName && (
                  <Badge variant="outline" className="text-xs font-normal">
                    <Building className="h-3 w-3 mr-1" />
                    {companyName}
                  </Badge>
                )}
              </div>
            </div>
            <DialogDescription>
              Configure your appraisal form template{companyName ? ` for ${companyName}` : ''}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-muted/30 border-b">
            {WIZARD_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Allow clicking on completed steps or current step
                    if (index <= wizardStep || (index === 2 && !editingTemplate)) return;
                    setWizardStep(index);
                  }}
                  disabled={index === 2 && !editingTemplate}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    index < wizardStep && "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90",
                    index === wizardStep && "bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary",
                    index > wizardStep && "bg-muted text-muted-foreground",
                    index === 2 && !editingTemplate && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {index < wizardStep ? <Check className="h-4 w-4" /> : index + 1}
                </button>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 transition-colors",
                    index < wizardStep ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs 
            value={WIZARD_STEPS[wizardStep]} 
            onValueChange={(v) => setWizardStep(WIZARD_STEPS.indexOf(v as WizardStep))}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-5 px-6 pt-2 bg-transparent">
              <TabsTrigger value="basics" className="text-xs">1. Basics</TabsTrigger>
              <TabsTrigger value="sections" className="text-xs">2. Sections</TabsTrigger>
              <TabsTrigger value="phases" disabled={!editingTemplate} className="text-xs">3. Phases</TabsTrigger>
              <TabsTrigger value="timing" className="text-xs">4. Timing</TabsTrigger>
              <TabsTrigger value="governance" className="text-xs">5. Governance</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6">
              {/* Step 1: Basics */}
              <TabsContent value="basics" className="mt-0 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Annual Performance Review"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                      placeholder="e.g., annual_review"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe when this template should be used..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cycle Type</Label>
                    <Select 
                      value={formData.applicable_cycle_types?.[0] || 'annual'} 
                      onValueChange={(v) => handleCycleTypeChange(v as AppraisalCycleType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(CYCLE_TYPE_PRESETS) as [AppraisalCycleType, typeof CYCLE_TYPE_PRESETS[AppraisalCycleType]][]).map(([type, preset]) => (
                          <SelectItem key={type} value={type}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rating Scale</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.min_rating || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_rating: Number(e.target.value) }))}
                        min={0}
                        max={10}
                        className="w-20"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="number"
                        value={formData.max_rating || 5}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_rating: Number(e.target.value) }))}
                        min={1}
                        max={10}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Step 2: Sections */}
              <TabsContent value="sections" className="mt-0 py-4 space-y-4">
                {useLegacySections ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Configure Sections & Weights</h3>
                        <p className="text-xs text-muted-foreground">Enable sections and assign weight percentages (must total 100%)</p>
                      </div>
                      {weightValidation.valid ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {weightValidation.total}%
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {weightValidation.total}%
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {legacySections.map((section) => {
                        const isEnabled = formData[section.includeKey as keyof typeof formData] as boolean;
                        const weight = (formData[section.weightKey as keyof typeof formData] as number) || 0;

                        return (
                          <div key={section.key} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 w-36">
                              {getSectionIcon(section.key)}
                              <span className="text-sm font-medium">{section.label}</span>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) => toggleSection(section.key, checked)}
                            />
                            {isEnabled && (
                              <div className="flex-1 flex items-center gap-3">
                                <Slider
                                  value={[weight]}
                                  onValueChange={([value]) => updateWeight(section.weightKey, value)}
                                  max={100}
                                  step={5}
                                  className="flex-1"
                                />
                                <span className="w-10 text-right font-mono text-sm">{weight}%</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!weightValidation.valid && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Weights must total 100%. Current total: {weightValidation.total}%
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Advanced Section Configuration</h4>
                    </div>
                    {editingTemplate && (
                      <TemplateSectionConfigPanel
                        sections={sections}
                        templateId={editingTemplate.id}
                        weightEnforcement={formData.weight_enforcement || 'strict'}
                        onAddSection={createSection}
                        onUpdateSection={updateSection}
                        onDeleteSection={deleteSection}
                        onReorderSections={reorderSections}
                        isUpdating={isSectionUpdating}
                      />
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Step 3: Phases */}
              <TabsContent value="phases" className="mt-0 py-4 space-y-4">
                {editingTemplate ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="text-sm font-medium">Phase Timeline</h4>
                        <p className="text-xs text-muted-foreground">Define the phases employees go through during the appraisal cycle</p>
                      </div>
                    </div>
                    <AppraisalPhaseTimeline
                      phases={phases}
                      templateId={editingTemplate.id}
                      defaultDurationDays={formData.default_duration_days || 365}
                      cycleType={formData.applicable_cycle_types?.[0] || 'annual'}
                      companyEmployeeCount={150}
                      onAddPhase={createPhase}
                      onUpdatePhase={updatePhase}
                      onDeletePhase={deletePhase}
                      onReorderPhases={reorderPhases}
                      onBulkCreatePhases={bulkCreatePhases}
                      isUpdating={isPhaseUpdating}
                    />
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Save the template first to configure phases. Phases define the workflow stages employees go through during each appraisal cycle.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Step 4: Timing */}
              <TabsContent value="timing" className="mt-0 py-4 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">Default Timing Configuration</h4>
                    <p className="text-xs text-muted-foreground">Set default durations for appraisal cycles using this template</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 p-4 border rounded-lg">
                    <Label>Cycle Duration</Label>
                    <Input
                      type="number"
                      value={formData.default_duration_days || 365}
                      onChange={(e) => setFormData(prev => ({ ...prev, default_duration_days: parseInt(e.target.value) || 365 }))}
                      min={0}
                      max={730}
                    />
                    <p className="text-xs text-muted-foreground">Length of each review cycle in days</p>
                  </div>
                  <div className="space-y-2 p-4 border rounded-lg">
                    <Label>Evaluation Offset</Label>
                    <Input
                      type="number"
                      value={formData.default_evaluation_offset_days || 14}
                      onChange={(e) => setFormData(prev => ({ ...prev, default_evaluation_offset_days: parseInt(e.target.value) || 14 }))}
                      min={0}
                      max={60}
                    />
                    <p className="text-xs text-muted-foreground">Days before end when evaluations are due</p>
                  </div>
                  <div className="space-y-2 p-4 border rounded-lg">
                    <Label>Grace Period</Label>
                    <Input
                      type="number"
                      value={formData.default_grace_period_days || 3}
                      onChange={(e) => setFormData(prev => ({ ...prev, default_grace_period_days: parseInt(e.target.value) || 3 }))}
                      min={0}
                      max={14}
                    />
                    <p className="text-xs text-muted-foreground">Extra time for late submissions</p>
                  </div>
                </div>
              </TabsContent>

              {/* Step 5: Governance */}
              <TabsContent value="governance" className="mt-0 py-4 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">Governance & Controls</h4>
                    <p className="text-xs text-muted-foreground">Configure template locking, weight enforcement, and approval requirements</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Weight Enforcement</Label>
                    <Select 
                      value={formData.weight_enforcement || 'strict'} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, weight_enforcement: v as WeightEnforcement }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strict">Strict (must equal 100%)</SelectItem>
                        <SelectItem value="relaxed">Relaxed (max 100%)</SelectItem>
                        <SelectItem value="none">None (qualitative only)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">How strictly section weights are enforced</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-sm">Lock Template</Label>
                      <p className="text-xs text-muted-foreground">Prevent changes when used in active cycles</p>
                    </div>
                    <Switch
                      checked={formData.is_locked || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_locked: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-sm">Allow Weight Override</Label>
                      <p className="text-xs text-muted-foreground">Allow individual cycles to customize weights</p>
                    </div>
                    <Switch
                      checked={formData.allow_weight_override || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_weight_override: checked }))}
                    />
                  </div>

                  {formData.allow_weight_override && (
                    <div className="flex items-center justify-between p-4 border rounded-lg ml-4 border-l-2 border-primary/30">
                      <div>
                        <Label className="text-sm">Require HR Approval</Label>
                        <p className="text-xs text-muted-foreground">Weight changes require HR approval</p>
                      </div>
                      <Switch
                        checked={formData.requires_hr_approval_for_override || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_hr_approval_for_override: checked }))}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-sm">Active</Label>
                      <p className="text-xs text-muted-foreground">Template available for new cycles</p>
                    </div>
                    <Switch
                      checked={formData.is_active || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer with Navigation */}
          <div className="px-6 py-4 border-t flex justify-between items-center bg-background">
            <div>
              {wizardStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setWizardStep(prev => prev - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              {wizardStep < WIZARD_STEPS.length - 1 ? (
                <Button 
                  onClick={() => {
                    // Skip phases step for new templates
                    if (wizardStep === 1 && !editingTemplate) {
                      setWizardStep(3); // Skip to timing
                    } else {
                      setWizardStep(prev => prev + 1);
                    }
                  }}
                  disabled={
                    (wizardStep === 0 && (!formData.name || !formData.code)) ||
                    (wizardStep === 1 && useLegacySections && !weightValidation.valid)
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={(useLegacySections && !weightValidation.valid) || !formData.name || !formData.code || isCreating || isUpdating}
                >
                  {editingTemplate ? "Save Changes" : "Create Template"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Sheet */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px] overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              Template Preview
            </SheetTitle>
          </SheetHeader>
          <div className="p-6">
            <AppraisalFormTemplatePreview
              template={{
                ...formData,
                name: formData.name || 'Untitled Template',
              }}
              sections={previewSections as any}
              phases={phases || []}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Template</DialogTitle>
            <DialogDescription>
              Create a copy of "{duplicatingTemplate?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Template Name</Label>
              <Input
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>New Template Code</Label>
              <Input
                value={duplicateCode}
                onChange={(e) => setDuplicateCode(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDuplicate} disabled={!duplicateName || !duplicateCode}>
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
