import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings2,
  Edit,
  Eye,
  Globe,
  FileText,
  Plus,
  Trash2,
  Save,
  X,
  GraduationCap,
  Target,
  Users,
  Clock,
  Heart,
  DollarSign,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  useQuickStartTemplates,
  useUpdateQuickStartTemplate,
  usePublishQuickStartTemplate,
  type QuickStartTemplateRow,
} from "@/hooks/useQuickStartTemplates";
import { useGenerateQuickStartContent } from "@/hooks/useGenerateQuickStartContent";
import { getModuleInfo } from "@/lib/quickstartModuleMapping";

const ICON_OPTIONS = [
  { value: "GraduationCap", label: "Graduation Cap", icon: GraduationCap },
  { value: "Target", label: "Target", icon: Target },
  { value: "Users", label: "Users", icon: Users },
  { value: "Clock", label: "Clock", icon: Clock },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "DollarSign", label: "Dollar Sign", icon: DollarSign },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Rocket", label: "Rocket", icon: Rocket },
];

const COLOR_OPTIONS = [
  { value: "emerald", label: "Emerald" },
  { value: "purple", label: "Purple" },
  { value: "blue", label: "Blue" },
  { value: "cyan", label: "Cyan" },
  { value: "orange", label: "Orange" },
  { value: "rose", label: "Rose" },
  { value: "green", label: "Green" },
  { value: "slate", label: "Slate" },
];

function getIconComponent(iconName: string) {
  const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return iconOption?.icon || GraduationCap;
}

export default function QuickStartAdminPage() {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useQuickStartTemplates(true);
  const updateMutation = useUpdateQuickStartTemplate();
  const publishMutation = usePublishQuickStartTemplate();
  const { generateContent, isGenerating } = useGenerateQuickStartContent();
  
  const [editingTemplate, setEditingTemplate] = useState<QuickStartTemplateRow | null>(null);
  const [editedData, setEditedData] = useState<Partial<QuickStartTemplateRow>>({});

  const handleEdit = (template: QuickStartTemplateRow) => {
    setEditingTemplate(template);
    setEditedData({
      title: template.title,
      subtitle: template.subtitle || "",
      icon_name: template.icon_name,
      color_class: template.color_class,
      quick_setup_time: template.quick_setup_time || "",
      full_config_time: template.full_config_time || "",
      breadcrumb_label: template.breadcrumb_label || "",
      rollout_recommendation: template.rollout_recommendation || "",
      roles: template.roles,
      prerequisites: template.prerequisites,
      pitfalls: template.pitfalls,
      content_strategy_questions: template.content_strategy_questions,
      setup_steps: template.setup_steps,
      rollout_options: template.rollout_options,
      verification_checks: template.verification_checks,
      integration_checklist: template.integration_checklist,
      success_metrics: template.success_metrics,
      next_steps: template.next_steps,
    });
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingTemplate.id,
        updates: editedData,
      });
      toast({
        title: "Template Updated",
        description: `${editingTemplate.module_code} Quick Start Guide has been saved.`,
      });
      setEditingTemplate(null);
      setEditedData({});
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update template. Please try again.",
      });
    }
  };

  const handlePublishToggle = async (template: QuickStartTemplateRow) => {
    const newStatus = template.status === "published" ? "draft" : "published";
    try {
      await publishMutation.mutateAsync({ id: template.id, status: newStatus });
      toast({
        title: newStatus === "published" ? "Published" : "Unpublished",
        description: `${template.module_code} Quick Start Guide is now ${newStatus}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status. Please try again.",
      });
    }
  };

  const handlePreview = (template: QuickStartTemplateRow) => {
    const previewPath = `/enablement/quickstart/${template.module_code.toLowerCase()}`;
    window.open(previewPath, "_blank");
  };

  const updateJsonField = (field: keyof QuickStartTemplateRow, value: string) => {
    try {
      const parsed = JSON.parse(value);
      setEditedData((prev) => ({ ...prev, [field]: parsed }));
    } catch {
      // Invalid JSON, don't update
    }
  };

  const handleGenerateContent = async () => {
    if (!editingTemplate) return;
    
    const moduleInfo = getModuleInfo(editingTemplate.module_code);
    if (!moduleInfo) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unknown module code. Cannot generate content.",
      });
      return;
    }

    const generated = await generateContent(editingTemplate.module_code);
    if (generated) {
      setEditedData((prev) => ({
        ...prev,
        roles: generated.roles,
        prerequisites: generated.prerequisites,
        pitfalls: generated.pitfalls,
        content_strategy_questions: generated.contentStrategyQuestions,
        setup_steps: generated.setupSteps,
        rollout_options: generated.rolloutOptions,
        rollout_recommendation: generated.rolloutRecommendation,
        verification_checks: generated.verificationChecks,
        integration_checklist: generated.integrationChecklist,
        success_metrics: generated.successMetrics,
        quick_setup_time: "15-30 minutes",
        full_config_time: "2-4 hours",
      }));
      toast({
        title: "Content Generated",
        description: "AI-generated content has been added to all fields. Review and save when ready.",
      });
    }
  };

  const publishedCount = templates?.filter((t) => t.status === "published").length || 0;
  const draftCount = templates?.filter((t) => t.status === "draft").length || 0;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Quick Start Guides", href: "/enablement/quickstarts" },
            { label: "Admin" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings2 className="h-8 w-8 text-primary" />
              Quick Start Guide Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage Quick Start Guides for all modules
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="default">
              <Globe className="h-3 w-3 mr-1" />
              {publishedCount} Published
            </Badge>
            <Badge variant="secondary">
              <FileText className="h-3 w-3 mr-1" />
              {draftCount} Drafts
            </Badge>
          </div>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Quick Start Templates</CardTitle>
            <CardDescription>
              Click "Edit" to modify content, then "Publish" to make available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.map((template) => {
                    const IconComponent = getIconComponent(template.icon_name);
                    const hasContent = 
                      Array.isArray(template.roles) && (template.roles as unknown[]).length > 0 &&
                      Array.isArray(template.setup_steps) && (template.setup_steps as unknown[]).length > 0;
                    
                    return (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded bg-${template.color_class}-500/10`}>
                              <IconComponent className={`h-4 w-4 text-${template.color_class}-600`} />
                            </div>
                            <Badge variant="outline">{template.module_code}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{template.title}</TableCell>
                        <TableCell>
                          {template.status === "published" ? (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <FileText className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {hasContent ? (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Needs Content
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(template.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(template)}
                              disabled={!hasContent}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={template.status === "published" ? "secondary" : "default"}
                              size="sm"
                              onClick={() => handlePublishToggle(template)}
                              disabled={!hasContent}
                            >
                              {template.status === "published" ? "Unpublish" : "Publish"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingTemplate} onOpenChange={() => !isGenerating && setEditingTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>
                    Edit {editingTemplate?.module_code} Quick Start Guide
                  </DialogTitle>
                  <DialogDescription>
                    Modify the content for this Quick Start Guide. All fields use JSON format for arrays.
                  </DialogDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] pr-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                  <TabsTrigger value="prereqs">Prerequisites</TabsTrigger>
                  <TabsTrigger value="steps">Setup Steps</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={editedData.title || ""}
                        onChange={(e) => setEditedData((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Breadcrumb Label</Label>
                      <Input
                        value={editedData.breadcrumb_label || ""}
                        onChange={(e) => setEditedData((prev) => ({ ...prev, breadcrumb_label: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={editedData.subtitle || ""}
                      onChange={(e) => setEditedData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select
                        value={editedData.icon_name}
                        onValueChange={(value) => setEditedData((prev) => ({ ...prev, icon_name: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ICON_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <opt.icon className="h-4 w-4" />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Color Theme</Label>
                      <Select
                        value={editedData.color_class}
                        onValueChange={(value) => setEditedData((prev) => ({ ...prev, color_class: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLOR_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-${opt.value}-500`} />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quick Setup Time</Label>
                      <Input
                        value={editedData.quick_setup_time || ""}
                        onChange={(e) => setEditedData((prev) => ({ ...prev, quick_setup_time: e.target.value }))}
                        placeholder="e.g., 15-30 minutes"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Config Time</Label>
                      <Input
                        value={editedData.full_config_time || ""}
                        onChange={(e) => setEditedData((prev) => ({ ...prev, full_config_time: e.target.value }))}
                        placeholder="e.g., 2-4 hours"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Rollout Recommendation</Label>
                    <Textarea
                      value={editedData.rollout_recommendation || ""}
                      onChange={(e) => setEditedData((prev) => ({ ...prev, rollout_recommendation: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Common Pitfalls (JSON Array)</Label>
                    <Textarea
                      value={JSON.stringify(editedData.pitfalls || [], null, 2)}
                      onChange={(e) => updateJsonField("pitfalls", e.target.value)}
                      rows={4}
                      className="font-mono text-sm"
                      placeholder='[{"issue": "...", "prevention": "..."}]'
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content Strategy Questions (JSON Array)</Label>
                    <Textarea
                      value={JSON.stringify(editedData.content_strategy_questions || [], null, 2)}
                      onChange={(e) => updateJsonField("content_strategy_questions", e.target.value)}
                      rows={3}
                      className="font-mono text-sm"
                      placeholder='["Question 1?", "Question 2?"]'
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="roles" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Roles (JSON Array)</Label>
                    <p className="text-xs text-muted-foreground">
                      Format: {"[{\"role\": \"Primary Owner\", \"title\": \"HR Admin\", \"icon\": \"UserCog\", \"responsibility\": \"...\"}]"}
                    </p>
                    <Textarea
                      value={JSON.stringify(editedData.roles || [], null, 2)}
                      onChange={(e) => updateJsonField("roles", e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="prereqs" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Prerequisites (JSON Array)</Label>
                    <p className="text-xs text-muted-foreground">
                      Format: {"[{\"id\": \"unique-id\", \"title\": \"...\", \"description\": \"...\", \"required\": true, \"href\": \"/path\", \"module\": \"ModuleName\"}]"}
                    </p>
                    <Textarea
                      value={JSON.stringify(editedData.prerequisites || [], null, 2)}
                      onChange={(e) => updateJsonField("prerequisites", e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="steps" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Setup Steps (JSON Array)</Label>
                    <p className="text-xs text-muted-foreground">
                      Format: {"[{\"id\": \"step-1\", \"title\": \"...\", \"description\": \"...\", \"estimatedTime\": \"5 min\", \"substeps\": [...], \"expectedResult\": \"...\", \"href\": \"/path\"}]"}
                    </p>
                    <Textarea
                      value={JSON.stringify(editedData.setup_steps || [], null, 2)}
                      onChange={(e) => updateJsonField("setup_steps", e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Rollout Options (JSON Array)</Label>
                    <Textarea
                      value={JSON.stringify(editedData.rollout_options || [], null, 2)}
                      onChange={(e) => updateJsonField("rollout_options", e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                      placeholder='[{"id": "soft", "label": "Soft Launch", "description": "..."}]'
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="verification" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Verification Checks (JSON Array of strings)</Label>
                    <Textarea
                      value={JSON.stringify(editedData.verification_checks || [], null, 2)}
                      onChange={(e) => updateJsonField("verification_checks", e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                      placeholder='["Check 1", "Check 2", "Check 3"]'
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Integration Checklist (JSON Array)</Label>
                    <Textarea
                      value={JSON.stringify(editedData.integration_checklist || [], null, 2)}
                      onChange={(e) => updateJsonField("integration_checklist", e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                      placeholder='[{"id": "sso", "label": "SSO configured", "required": true}]'
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="metrics" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Success Metrics (JSON Array)</Label>
                    <Textarea
                      value={JSON.stringify(editedData.success_metrics || [], null, 2)}
                      onChange={(e) => updateJsonField("success_metrics", e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                      placeholder='[{"metric": "Enrollment Rate", "target": "50%", "howToMeasure": "Dashboard"}]'
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Steps (JSON Array)</Label>
                    <Textarea
                      value={JSON.stringify(editedData.next_steps || [], null, 2)}
                      onChange={(e) => updateJsonField("next_steps", e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                      placeholder='[{"label": "Configure Settings", "href": "/admin/settings", "icon": "Settings"}]'
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
