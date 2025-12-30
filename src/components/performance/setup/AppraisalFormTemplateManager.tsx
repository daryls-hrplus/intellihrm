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
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppraisalFormTemplates, AppraisalFormTemplate, CreateTemplateInput, validateWeights } from "@/hooks/useAppraisalFormTemplates";
import { Plus, Edit, Trash2, Copy, Star, Lock, AlertTriangle, CheckCircle, Target, BookOpen, Users, MessageSquare, Heart } from "lucide-react";

interface Props {
  companyId: string;
}

export function AppraisalFormTemplateManager({ companyId }: Props) {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate, setDefaultTemplate, isCreating, isUpdating } = useAppraisalFormTemplates(companyId);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AppraisalFormTemplate | null>(null);
  const [duplicatingTemplate, setDuplicatingTemplate] = useState<AppraisalFormTemplate | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateCode, setDuplicateCode] = useState("");

  const [formData, setFormData] = useState<Partial<CreateTemplateInput>>({
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
  });

  const weightValidation = validateWeights(formData);

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
    });
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
    if (!weightValidation.valid) return;

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

  const sections = [
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
                  <TableHead>Sections</TableHead>
                  <TableHead>Weight Distribution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
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
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{template.code}</TableCell>
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
                      <div className="flex items-center gap-1 text-xs">
                        {template.include_goals && <span>{template.goals_weight}%</span>}
                        {template.include_competencies && <span>/ {template.competencies_weight}%</span>}
                        {template.include_responsibilities && <span>/ {template.responsibilities_weight}%</span>}
                        {template.include_360_feedback && <span>/ {template.feedback_360_weight}%</span>}
                        {template.include_values && <span>/ {template.values_weight}%</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDuplicate(template)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      {!template.is_default && (
                        <Button variant="ghost" size="icon" onClick={() => setDefaultTemplate(template.id)}>
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              Configure appraisal form sections and their weights
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Individual Contributor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  placeholder="e.g., ic_standard"
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

            {/* Section Configuration */}
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

              {sections.map((section) => {
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

            {/* Settings */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Template Settings</Label>
              
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!weightValidation.valid || !formData.name || !formData.code || isCreating || isUpdating}
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
