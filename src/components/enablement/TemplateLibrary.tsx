import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Library,
  Save,
  Copy,
  Trash2,
  Search,
  Check,
  FileText,
  BookOpen,
  FileCheck,
  Zap,
  LayoutTemplate,
  Eye,
  Settings,
  Palette,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DocumentTemplate, DEFAULT_TEMPLATES } from "./DocumentTemplateConfig";
import { TemplateReferenceUploader } from "./TemplateReferenceUploader";
import { TemplateInstructionsManager } from "./TemplateInstructionsManager";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { TemplateStylingEditor } from "./TemplateStylingEditor";
import { TemplateConfigurationPanel } from "./TemplateConfigurationPanel";
import { TemplateLivePreview } from "./TemplateLivePreview";

interface SavedTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  layout_config: Record<string, unknown>;
  sections_config: Record<string, unknown>;
  formatting_config: Record<string, unknown>;
  branding_config: Record<string, unknown>;
  is_system_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateLibraryProps {
  selectedTemplate: DocumentTemplate | null;
  onTemplateSelect: (template: DocumentTemplate) => void;
  onClose: () => void;
}

export function TemplateLibrary({
  selectedTemplate,
  onTemplateSelect,
  onClose,
}: TemplateLibraryProps) {
  const [activeTab, setActiveTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [saveTemplateDescription, setSaveTemplateDescription] = useState("");
  const [saveTemplateCategory, setSaveTemplateCategory] = useState("custom");
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  // Internal working copy of template for changes (doesn't close sheet)
  const [workingTemplate, setWorkingTemplate] = useState<DocumentTemplate | null>(selectedTemplate);
  
  // Sync working template when selected template changes from outside
  useEffect(() => {
    setWorkingTemplate(selectedTemplate);
  }, [selectedTemplate]);
  
  const queryClient = useQueryClient();

  // Fetch saved templates
  const { data: savedTemplates = [], isLoading } = useQuery({
    queryKey: ['enablement-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enablement_document_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavedTemplate[];
    }
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (template: {
      name: string;
      description: string;
      category: string;
      layout_config: Record<string, unknown>;
      sections_config: Record<string, unknown>;
      formatting_config: Record<string, unknown>;
      branding_config: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('enablement_document_templates')
        .insert({
          name: template.name,
          description: template.description,
          category: template.category,
          layout_config: template.layout_config,
          sections_config: template.sections_config,
          formatting_config: template.formatting_config,
          branding_config: template.branding_config,
          created_by: user.id
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enablement-templates'] });
      toast.success("Template saved successfully");
      setShowSaveDialog(false);
      resetSaveForm();
    },
    onError: (error) => {
      toast.error("Failed to save template: " + error.message);
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('enablement_document_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enablement-templates'] });
      toast.success("Template deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete template: " + error.message);
    }
  });

  const resetSaveForm = () => {
    setSaveTemplateName("");
    setSaveTemplateDescription("");
    setSaveTemplateCategory("custom");
  };

  const handleSaveTemplate = () => {
    if (!workingTemplate || !saveTemplateName.trim()) {
      toast.error("Please provide a template name");
      return;
    }

    saveTemplateMutation.mutate({
      name: saveTemplateName,
      description: saveTemplateDescription,
      category: saveTemplateCategory,
      layout_config: workingTemplate.layout as unknown as Record<string, unknown>,
      sections_config: workingTemplate.sections as unknown as Record<string, unknown>,
      formatting_config: workingTemplate.formatting as unknown as Record<string, unknown>,
      branding_config: workingTemplate.branding as unknown as Record<string, unknown>
    });
  };

  const handleCloneTemplate = (template: SavedTemplate) => {
    setSaveTemplateName(`${template.name} (Copy)`);
    setSaveTemplateDescription(template.description || "");
    setSaveTemplateCategory(template.category);
    setShowSaveDialog(true);
  };

  const handleSelectSavedTemplate = (template: SavedTemplate) => {
    const docTemplate: DocumentTemplate = {
      id: template.id,
      name: template.name,
      description: template.description || "",
      type: template.category as DocumentTemplate['type'],
      layout: template.layout_config as unknown as DocumentTemplate['layout'],
      sections: template.sections_config as unknown as DocumentTemplate['sections'],
      formatting: template.formatting_config as unknown as DocumentTemplate['formatting'],
      branding: template.branding_config as unknown as DocumentTemplate['branding']
    };
    setWorkingTemplate(docTemplate);
    toast.success(`Template "${template.name}" selected`);
  };

  const handleLayoutToggle = (key: keyof DocumentTemplate['layout'], value: boolean) => {
    if (!workingTemplate) return;
    setWorkingTemplate({
      ...workingTemplate,
      layout: { ...workingTemplate.layout, [key]: value }
    });
  };

  const handleSectionToggle = (key: keyof DocumentTemplate['sections'], value: boolean) => {
    if (!workingTemplate) return;
    setWorkingTemplate({
      ...workingTemplate,
      sections: { ...workingTemplate.sections, [key]: value }
    });
  };

  const handleFormattingChange = (key: keyof DocumentTemplate['formatting'], value: string) => {
    if (!workingTemplate) return;
    setWorkingTemplate({
      ...workingTemplate,
      formatting: { ...workingTemplate.formatting, [key]: value }
    });
  };

  const filteredSystemTemplates = DEFAULT_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSavedTemplates = savedTemplates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'training_guide': return <BookOpen className="h-4 w-4" />;
      case 'user_manual': return <FileText className="h-4 w-4" />;
      case 'sop': return <FileCheck className="h-4 w-4" />;
      case 'quick_start': return <Zap className="h-4 w-4" />;
      default: return <LayoutTemplate className="h-4 w-4" />;
    }
  };

  const layoutLabels: Record<string, string> = {
    includeTableOfContents: 'Table of Contents',
    includeSummary: 'Executive Summary',
    includePrerequisites: 'Prerequisites',
    includeLearningObjectives: 'Learning Objectives',
    includeScreenshots: 'Screenshots',
    includeStepNumbers: 'Step Numbers',
    includeTimeEstimates: 'Time Estimates',
    includeRoleIndicators: 'Role Indicators',
    includeVersionInfo: 'Version Info',
    includeRelatedDocs: 'Related Documents'
  };

  const sectionLabels: Record<string, string> = {
    introduction: 'Introduction',
    overview: 'Overview',
    prerequisites: 'Prerequisites',
    stepByStep: 'Step-by-Step Guide',
    bestPractices: 'Best Practices',
    troubleshooting: 'Troubleshooting',
    faqs: 'FAQs',
    glossary: 'Glossary',
    appendix: 'Appendix'
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5" />
            <CardTitle>Template Library</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={!workingTemplate}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => {
                if (workingTemplate) {
                  onTemplateSelect(workingTemplate);
                }
                onClose();
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Apply & Close
            </Button>
          </div>
        </div>
        <CardDescription>
          Select, customize, and save document templates
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Template Indicator */}
        {workingTemplate && (
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getCategoryIcon(workingTemplate.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{workingTemplate.name}</p>
              <p className="text-xs text-muted-foreground">{workingTemplate.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: workingTemplate.branding.primaryColor }}
                title="Primary color"
              />
              <div 
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: workingTemplate.branding.secondaryColor || '#6b7280' }}
                title="Secondary color"
              />
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="templates" className="gap-1">
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="configure" className="gap-1">
              <Settings className="h-4 w-4" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-1">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="ai-context" className="gap-1">
              <Sparkles className="h-4 w-4" />
              AI Context
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab - Gallery View */}
          <TabsContent value="templates" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[400px]">
              {/* System Templates */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4" />
                  System Templates
                </h4>
                <div className="grid gap-2">
                  {filteredSystemTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg transition-all cursor-pointer ${
                        workingTemplate?.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setWorkingTemplate(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {getCategoryIcon(template.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(template);
                              setShowPreviewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {workingTemplate?.id === template.id && (
                            <Badge variant="default" className="text-xs">Selected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Templates */}
              {savedTemplates.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    My Templates
                  </h4>
                  <div className="grid gap-2">
                    {filteredSavedTemplates.map((template) => {
                      const branding = template.branding_config as DocumentTemplate['branding'];
                      return (
                        <div
                          key={template.id}
                          className={`p-3 border rounded-lg transition-all ${
                            workingTemplate?.id === template.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-muted-foreground/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Mini Preview */}
                            <div className="w-16 h-12 border rounded overflow-hidden flex-shrink-0 bg-background">
                              <div 
                                className="h-3 flex items-center px-1"
                                style={{ backgroundColor: (branding?.primaryColor || '#1e40af') + '20' }}
                              >
                                <div 
                                  className="w-2 h-2 rounded-sm"
                                  style={{ backgroundColor: branding?.primaryColor || '#1e40af' }}
                                />
                              </div>
                              <div className="p-1 space-y-0.5">
                                <div className="h-1 bg-muted rounded-full w-3/4" />
                                <div className="h-0.5 bg-muted rounded-full w-full" />
                              </div>
                            </div>

                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleSelectSavedTemplate(template)}
                            >
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                            </div>

                            <div className="flex items-center gap-1">
                              <div 
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: branding?.primaryColor || '#1e40af' }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: branding?.secondaryColor || '#6b7280' }}
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const docTemplate: DocumentTemplate = {
                                    id: template.id,
                                    name: template.name,
                                    description: template.description || "",
                                    type: template.category as DocumentTemplate['type'],
                                    layout: template.layout_config as unknown as DocumentTemplate['layout'],
                                    sections: template.sections_config as unknown as DocumentTemplate['sections'],
                                    formatting: template.formatting_config as unknown as DocumentTemplate['formatting'],
                                    branding: branding
                                  };
                                  setPreviewTemplate(docTemplate);
                                  setShowPreviewDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCloneTemplate(template)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deleteTemplateMutation.mutate(template.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Configure Tab - Split Layout with Live Preview */}
          <TabsContent value="configure" className="mt-4">
            {!workingTemplate ? (
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Select a template first to configure it</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configure Template
                  </h3>
                  <TemplateConfigurationPanel
                    template={workingTemplate}
                    onTemplateUpdate={setWorkingTemplate}
                  />
                </div>
                
                {/* Live Preview Panel */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </h3>
                  <TemplateLivePreview template={workingTemplate} />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="mt-4">
            <TemplateStylingEditor
              template={workingTemplate}
              onTemplateUpdate={setWorkingTemplate}
            />
          </TabsContent>

          {/* AI Context Tab */}
          <TabsContent value="ai-context" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Reference Documents
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Upload documents for AI to learn formatting and style patterns
                  </p>
                  <TemplateReferenceUploader templateId={editingTemplate?.id} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Custom Instructions
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Add specific instructions for AI content generation
                  </p>
                  <TemplateInstructionsManager 
                    templateId={editingTemplate?.id}
                    onInstructionsChange={(instructions) => {
                      console.log("Instructions updated:", instructions);
                    }}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
            <DialogDescription>
              Save your current template configuration for reuse
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="My Custom Template"
                value={saveTemplateName}
                onChange={(e) => setSaveTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Describe what this template is for..."
                value={saveTemplateDescription}
                onChange={(e) => setSaveTemplateDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select value={saveTemplateCategory} onValueChange={setSaveTemplateCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training_guide">Training Guide</SelectItem>
                  <SelectItem value="user_manual">User Manual</SelectItem>
                  <SelectItem value="sop">SOP</SelectItem>
                  <SelectItem value="quick_start">Quick Start</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={saveTemplateMutation.isPending}
            >
              {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <TemplatePreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        template={previewTemplate}
        onSelect={(template) => {
          setWorkingTemplate(template);
          toast.success(`Template "${template.name}" selected`);
        }}
      />
    </Card>
  );
}