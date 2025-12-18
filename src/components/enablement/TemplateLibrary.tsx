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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Library,
  Plus,
  Save,
  Copy,
  Trash2,
  Search,
  Check,
  FileText,
  BookOpen,
  FileCheck,
  Zap,
  Upload,
  MessageSquare,
  Palette,
  LayoutTemplate
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DocumentTemplate, DEFAULT_TEMPLATES } from "./DocumentTemplateConfig";
import { TemplateReferenceUploader } from "./TemplateReferenceUploader";
import { TemplateInstructionsManager } from "./TemplateInstructionsManager";

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
  const [activeTab, setActiveTab] = useState("system");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [saveTemplateDescription, setSaveTemplateDescription] = useState("");
  const [saveTemplateCategory, setSaveTemplateCategory] = useState("custom");
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  
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
          branding_config: template.branding_config
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
    if (!selectedTemplate || !saveTemplateName.trim()) {
      toast.error("Please provide a template name");
      return;
    }

    saveTemplateMutation.mutate({
      name: saveTemplateName,
      description: saveTemplateDescription,
      category: saveTemplateCategory,
      layout_config: selectedTemplate.layout as unknown as Record<string, unknown>,
      sections_config: selectedTemplate.sections as unknown as Record<string, unknown>,
      formatting_config: selectedTemplate.formatting as unknown as Record<string, unknown>,
      branding_config: selectedTemplate.branding as unknown as Record<string, unknown>
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
    onTemplateSelect(docTemplate);
    toast.success(`Template "${template.name}" selected`);
  };

  const filteredSystemTemplates = DEFAULT_TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredSavedTemplates = savedTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'training_guide': return <BookOpen className="h-4 w-4" />;
      case 'user_manual': return <FileText className="h-4 w-4" />;
      case 'sop': return <FileCheck className="h-4 w-4" />;
      case 'quick_start': return <Zap className="h-4 w-4" />;
      default: return <LayoutTemplate className="h-4 w-4" />;
    }
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
              disabled={!selectedTemplate}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
        <CardDescription>
          Browse, create, and manage document templates
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="training_guide">Training Guide</SelectItem>
              <SelectItem value="user_manual">User Manual</SelectItem>
              <SelectItem value="sop">SOP</SelectItem>
              <SelectItem value="quick_start">Quick Start</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="system">System Templates</TabsTrigger>
            <TabsTrigger value="my-templates">My Templates</TabsTrigger>
            <TabsTrigger value="reference-docs">Reference Docs</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
          </TabsList>

          {/* System Templates */}
          <TabsContent value="system" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="grid gap-3">
                {filteredSystemTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => onTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getCategoryIcon(template.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTemplate?.id === template.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <Badge variant="outline">
                          {template.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* My Templates */}
          <TabsContent value="my-templates" className="mt-4">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <span className="text-muted-foreground">Loading templates...</span>
                </div>
              ) : filteredSavedTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <LayoutTemplate className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No saved templates yet</p>
                  <p className="text-sm text-muted-foreground">
                    Configure a template and click "Save Current" to create one
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredSavedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex items-start gap-3 flex-1 cursor-pointer"
                          onClick={() => handleSelectSavedTemplate(template)}
                        >
                          <div className="p-2 bg-muted rounded-lg">
                            {getCategoryIcon(template.category)}
                          </div>
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Updated {new Date(template.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {template.category.replace('_', ' ')}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCloneTemplate(template)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Reference Documents */}
          <TabsContent value="reference-docs" className="mt-4">
            <TemplateReferenceUploader 
              templateId={editingTemplate?.id} 
            />
          </TabsContent>

          {/* Custom Instructions */}
          <TabsContent value="instructions" className="mt-4">
            <TemplateInstructionsManager 
              templateId={editingTemplate?.id}
              onInstructionsChange={(instructions) => {
                console.log("Instructions updated:", instructions);
              }}
            />
          </TabsContent>

          {/* Styling Tab - placeholder for now */}
          <TabsContent value="styling" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure visual styling and branding for your templates
              </p>
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <Palette className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Select a template first, then use the Layout, Sections, and Styling tabs in the main config
                </p>
              </div>
            </div>
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
    </Card>
  );
}
