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
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useAppraisalFormTemplates, AppraisalFormTemplate, CreateTemplateInput, validateWeights } from "@/hooks/useAppraisalFormTemplates";
import { useAppraisalTemplateSections } from "@/hooks/useAppraisalTemplateSections";
import { useAppraisalTemplatePhases } from "@/hooks/useAppraisalTemplatePhases";
import { AppraisalFormTemplatePreview } from "./AppraisalFormTemplatePreview";
import { TemplateSectionConfigPanel } from "./TemplateSectionConfigPanel";
import { AppraisalPhaseTimeline } from "./AppraisalPhaseTimeline";
import { 
  Plus, Edit, Trash2, Copy, Star, Lock, AlertTriangle, CheckCircle, 
  Target, BookOpen, Users, MessageSquare, Heart, Eye, Calendar, 
  Settings2, History, GitBranch
} from "lucide-react";
import { CYCLE_TYPE_PRESETS, type AppraisalCycleType, type WeightEnforcement } from "@/types/appraisalFormTemplates";

interface Props {
  companyId: string;
}

type DialogTab = "basic" | "sections" | "phases" | "settings";

export function AppraisalFormTemplateManager({ companyId }: Props) {
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
  const [activeTab, setActiveTab] = useState<DialogTab>("basic");
  const [showPreview, setShowPreview] = useState(true);

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

  const handleOpenCreate = () => {
    setEditingTemplate(null);
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
    setActiveTab("basic");
    setDialogOpen(true);
  };

  const handleOpenEdit = (template: AppraisalFormTemplate) => {
    setEditingTemplate(template);
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
    setActiveTab("basic");
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
            <CardDescription>Configure reusable templates with section weights, phases, and settings</CardDescription>
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
                  <TableHead>Cycle Types</TableHead>
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
                        <div className="flex gap-1 flex-wrap">
                          {cycleTypes.map((ct: string) => (
                            <Badge key={ct} variant="outline" className="text-xs capitalize">
                              {ct.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
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

      {/* Create/Edit Dialog - Enhanced with Tabs and Preview */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
                <DialogDescription>
                  Configure appraisal form sections, phases, and settings
                </DialogDescription>
              </div>
              {editingTemplate && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <GitBranch className="h-3 w-3 mr-1" />
                    v{formData.version_number}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {showPreview ? "Hide" : "Show"} Preview
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={showPreview && editingTemplate ? 60 : 100} minSize={40}>
                <div className="h-full overflow-y-auto pr-4">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DialogTab)}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="sections" disabled={!editingTemplate}>
                        Sections
                      </TabsTrigger>
                      <TabsTrigger value="phases" disabled={!editingTemplate}>
                        Phases
                      </TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                      {/* Basic Info */}
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
                        />
                      </div>

                      {/* Cycle Type Selection */}
                      <div className="space-y-2">
                        <Label>Primary Cycle Type</Label>
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
                                <div className="flex flex-col">
                                  <span>{preset.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {preset.defaultDurationDays > 0 ? `${preset.defaultDurationDays} days` : 'Ongoing'}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date Configuration */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Default Duration (days)</Label>
                          <Input
                            type="number"
                            value={formData.default_duration_days || 365}
                            onChange={(e) => setFormData(prev => ({ ...prev, default_duration_days: parseInt(e.target.value) || 365 }))}
                            min={0}
                            max={730}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Evaluation Offset (days)</Label>
                          <Input
                            type="number"
                            value={formData.default_evaluation_offset_days || 14}
                            onChange={(e) => setFormData(prev => ({ ...prev, default_evaluation_offset_days: parseInt(e.target.value) || 14 }))}
                            min={0}
                            max={60}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Grace Period (days)</Label>
                          <Input
                            type="number"
                            value={formData.default_grace_period_days || 3}
                            onChange={(e) => setFormData(prev => ({ ...prev, default_grace_period_days: parseInt(e.target.value) || 3 }))}
                            min={0}
                            max={14}
                          />
                        </div>
                      </div>

                      {/* Legacy Section Configuration (for new templates without sections) */}
                      {useLegacySections && (
                        <div className="space-y-4">
                          <Label className="text-base font-semibold">Sections & Weights</Label>
                          
                          <Alert variant={weightValidation.valid ? "default" : "destructive"}>
                            {weightValidation.valid ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                            <AlertDescription>
                              {weightValidation.valid 
                                ? `Total weight: ${weightValidation.total}% ✓`
                                : weightValidation.message}
                            </AlertDescription>
                          </Alert>

                          {legacySections.map((section) => {
                            const isEnabled = formData[section.includeKey as keyof typeof formData] as boolean;
                            const weight = (formData[section.weightKey as keyof typeof formData] as number) || 0;

                            return (
                              <div key={section.key} className="flex items-center gap-4 p-4 border rounded-lg">
                                <div className="flex items-center gap-3 w-40">
                                  {getSectionIcon(section.key)}
                                  <span className="font-medium">{section.label}</span>
                                </div>
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={(checked) => toggleSection(section.key, checked)}
                                />
                                {isEnabled && (
                                  <div className="flex-1 flex items-center gap-4">
                                    <Slider
                                      value={[weight]}
                                      onValueChange={([value]) => updateWeight(section.weightKey, value)}
                                      max={100}
                                      step={5}
                                      className="flex-1"
                                    />
                                    <span className="w-12 text-right font-mono">{weight}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="sections" className="space-y-4">
                      {editingTemplate ? (
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
                      ) : (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Save the template first to configure advanced sections.
                          </AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>

                    <TabsContent value="phases" className="space-y-4">
                      {editingTemplate ? (
                        <AppraisalPhaseTimeline
                          phases={phases}
                          templateId={editingTemplate.id}
                          defaultDurationDays={formData.default_duration_days || 365}
                          onAddPhase={createPhase}
                          onUpdatePhase={updatePhase}
                          onDeletePhase={deletePhase}
                          onReorderPhases={reorderPhases}
                          isUpdating={isPhaseUpdating}
                        />
                      ) : (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Save the template first to configure phase timeline.
                          </AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                      {/* Rating Scale */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min Rating</Label>
                          <Input
                            type="number"
                            value={formData.min_rating || 1}
                            onChange={(e) => setFormData(prev => ({ ...prev, min_rating: Number(e.target.value) }))}
                            min={0}
                            max={10}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Rating</Label>
                          <Input
                            type="number"
                            value={formData.max_rating || 5}
                            onChange={(e) => setFormData(prev => ({ ...prev, max_rating: Number(e.target.value) }))}
                            min={1}
                            max={10}
                          />
                        </div>
                      </div>

                      {/* Weight Enforcement */}
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
                      </div>

                      {/* Template Settings */}
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Governance</Label>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Lock Template</Label>
                            <p className="text-sm text-muted-foreground">Prevent weight changes when used in cycles</p>
                          </div>
                          <Switch
                            checked={formData.is_locked || false}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_locked: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Weight Override</Label>
                            <p className="text-sm text-muted-foreground">Allow cycles to customize weights</p>
                          </div>
                          <Switch
                            checked={formData.allow_weight_override || false}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_weight_override: checked }))}
                          />
                        </div>

                        {formData.allow_weight_override && (
                          <div className="flex items-center justify-between pl-6">
                            <div>
                              <Label>Require HR Approval</Label>
                              <p className="text-sm text-muted-foreground">Weight changes need HR approval</p>
                            </div>
                            <Switch
                              checked={formData.requires_hr_approval_for_override || false}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_hr_approval_for_override: checked }))}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Active</Label>
                            <p className="text-sm text-muted-foreground">Template available for new cycles</p>
                          </div>
                          <Switch
                            checked={formData.is_active || false}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>

              {showPreview && editingTemplate && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={40} minSize={30}>
                    <AppraisalFormTemplatePreview
                      template={formData as any}
                      sections={sections}
                      phases={phases}
                    />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={(useLegacySections && !weightValidation.valid) || !formData.name || !formData.code || isCreating || isUpdating}
            >
              {editingTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
