// Panel for managing template and branding settings within the Manual Generation Dashboard

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Palette, Layout, FileText, Save, Loader2 } from "lucide-react";
import { DocumentTemplate, DocumentTemplateConfig, DEFAULT_TEMPLATES } from "./DocumentTemplateConfig";
import { TemplateStylingEditor } from "./TemplateStylingEditor";
import { ManualDefinition } from "@/hooks/useManualGeneration";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ManualBrandingPanelProps {
  manual: ManualDefinition;
  onUpdate?: () => void;
}

export function ManualBrandingPanel({ manual, onUpdate }: ManualBrandingPanelProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("template");
  const [hasChanges, setHasChanges] = useState(false);

  // Parse existing template config from manual
  const existingConfig = (manual as any).template_config || {};
  
  // Initialize template from existing config or default
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(() => {
    const templateType = existingConfig.templateType || "training_guide";
    const baseTemplate = DEFAULT_TEMPLATES.find(t => t.type === templateType) || DEFAULT_TEMPLATES[0];
    
    return {
      ...baseTemplate,
      branding: {
        ...baseTemplate.branding,
        ...(existingConfig.branding || {}),
      },
      layout: {
        ...baseTemplate.layout,
        ...(existingConfig.layout || {}),
      },
      formatting: {
        ...baseTemplate.formatting,
        ...(existingConfig.formatting || {}),
      },
    };
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const templateConfig = {
        templateType: selectedTemplate?.type,
        branding: selectedTemplate?.branding,
        layout: selectedTemplate?.layout,
        formatting: selectedTemplate?.formatting,
        targetRoles: existingConfig.targetRoles || ["admin"],
      };

      const { error } = await supabase
        .from("manual_definitions")
        .update({ template_config: templateConfig })
        .eq("id", manual.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-definitions"] });
      setHasChanges(false);
      toast.success("Template and branding settings saved");
      onUpdate?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleTemplateChange = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setHasChanges(true);
  };

  const handleTemplateCustomize = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setHasChanges(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Template & Branding
            </CardTitle>
            <CardDescription>
              Configure document template, layout options, and branding for {manual.manual_name}
            </CardDescription>
          </div>
          {hasChanges && (
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="template">
              <FileText className="h-4 w-4 mr-2" />
              Template
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Layout className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="mt-4">
            <div className="grid gap-3">
              {DEFAULT_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.type === template.type
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:border-muted-foreground/50"
                  }`}
                  onClick={() => {
                    const updatedTemplate = {
                      ...template,
                      branding: {
                        ...template.branding,
                        ...(selectedTemplate?.branding || {}),
                      },
                    };
                    handleTemplateChange(updatedTemplate);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Badge variant={selectedTemplate?.type === template.type ? "default" : "outline"}>
                      {template.type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="layout" className="mt-4">
            {selectedTemplate && (
              <DocumentTemplateConfig
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
                onTemplateCustomize={handleTemplateCustomize}
              />
            )}
          </TabsContent>

          <TabsContent value="branding" className="mt-4">
            <TemplateStylingEditor
              template={selectedTemplate}
              onTemplateUpdate={handleTemplateCustomize}
            />
          </TabsContent>
        </Tabs>

        {/* Current Config Summary */}
        {selectedTemplate && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Current Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Template:</span>
                <Badge variant="outline" className="ml-2">
                  {selectedTemplate.name}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Header Style:</span>
                <span className="ml-2">{selectedTemplate.formatting.headerStyle}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Callout Style:</span>
                <span className="ml-2">{selectedTemplate.formatting.calloutStyle}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Colors:</span>
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: selectedTemplate.branding.primaryColor }}
                />
                {selectedTemplate.branding.secondaryColor && (
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: selectedTemplate.branding.secondaryColor }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
