import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  BookOpen,
  Layout,
  Image,
  AlertCircle,
  Info,
  CheckCircle,
  Lightbulb,
  List,
  Table,
  Code,
  Eye,
  Save,
  RotateCcw
} from "lucide-react";

import { DocumentType } from "@/hooks/useDocumentTemplates";

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
  layout: {
    includeTableOfContents: boolean;
    includeSummary: boolean;
    includePrerequisites: boolean;
    includeLearningObjectives: boolean;
    includeScreenshots: boolean;
    includeStepNumbers: boolean;
    includeTimeEstimates: boolean;
    includeRoleIndicators: boolean;
    includeVersionInfo: boolean;
    includeRelatedDocs: boolean;
  };
  sections: {
    introduction: boolean;
    overview: boolean;
    prerequisites: boolean;
    stepByStep: boolean;
    bestPractices: boolean;
    troubleshooting: boolean;
    faqs: boolean;
    glossary: boolean;
    appendix: boolean;
  };
  formatting: {
    headerStyle: 'numbered' | 'plain' | 'icon';
    calloutStyle: 'confluence' | 'github' | 'minimal';
    screenshotPlacement: 'inline' | 'sidebar' | 'annotated';
    codeBlockTheme: 'light' | 'dark' | 'auto';
  };
  branding: {
    primaryColor: string;
    secondaryColor?: string;
    logoUrl?: string;
    footerText?: string;
    companyName?: string;
  };
}

import { INDUSTRY_ALIGNED_TEMPLATES } from "./TemplatePresetConfigs";

const DEFAULT_TEMPLATES: DocumentTemplate[] = INDUSTRY_ALIGNED_TEMPLATES;

interface DocumentTemplateConfigProps {
  selectedTemplate: DocumentTemplate | null;
  onTemplateChange: (template: DocumentTemplate) => void;
  onTemplateCustomize: (template: DocumentTemplate) => void;
}

export function DocumentTemplateConfig({
  selectedTemplate,
  onTemplateChange,
  onTemplateCustomize,
}: DocumentTemplateConfigProps) {
  const [activeTab, setActiveTab] = useState("templates");
  const [customTemplate, setCustomTemplate] = useState<DocumentTemplate | null>(selectedTemplate);

  const handleSelectTemplate = (templateId: string) => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const copy = JSON.parse(JSON.stringify(template));
      setCustomTemplate(copy);
      onTemplateChange(copy);
    }
  };

  const handleLayoutToggle = (key: keyof DocumentTemplate['layout'], value: boolean) => {
    if (!customTemplate) return;
    const updated = {
      ...customTemplate,
      layout: { ...customTemplate.layout, [key]: value }
    };
    setCustomTemplate(updated);
    onTemplateCustomize(updated);
  };

  const handleSectionToggle = (key: keyof DocumentTemplate['sections'], value: boolean) => {
    if (!customTemplate) return;
    const updated = {
      ...customTemplate,
      sections: { ...customTemplate.sections, [key]: value }
    };
    setCustomTemplate(updated);
    onTemplateCustomize(updated);
  };

  const handleFormattingChange = (key: keyof DocumentTemplate['formatting'], value: string) => {
    if (!customTemplate) return;
    const updated = {
      ...customTemplate,
      formatting: { ...customTemplate.formatting, [key]: value }
    };
    setCustomTemplate(updated);
    onTemplateCustomize(updated);
  };

  const handleBrandingChange = (key: keyof DocumentTemplate['branding'], value: string) => {
    if (!customTemplate) return;
    const updated = {
      ...customTemplate,
      branding: { ...customTemplate.branding, [key]: value }
    };
    setCustomTemplate(updated);
    onTemplateCustomize(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Document Template
        </CardTitle>
        <CardDescription>
          Configure documentation format and style similar to Confluence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-3">
              {DEFAULT_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    customTemplate?.id === template.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Badge variant={customTemplate?.id === template.id ? "default" : "outline"}>
                      {template.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            {customTemplate && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(customTemplate.layout).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace('include', '').trim()}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          handleLayoutToggle(key as keyof DocumentTemplate['layout'], checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            {customTemplate && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select which sections to include in the generated documentation
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(customTemplate.sections).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`section-${key}`} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <Switch
                        id={`section-${key}`}
                        checked={value}
                        onCheckedChange={(checked) => 
                          handleSectionToggle(key as keyof DocumentTemplate['sections'], checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            {customTemplate && (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium">Formatting Options</h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Header Style</Label>
                      <Select
                        value={customTemplate.formatting.headerStyle}
                        onValueChange={(v) => handleFormattingChange('headerStyle', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="numbered">Numbered (1. 1.1 1.1.1)</SelectItem>
                          <SelectItem value="plain">Plain Headers</SelectItem>
                          <SelectItem value="icon">Icon Headers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Callout Style</Label>
                      <Select
                        value={customTemplate.formatting.calloutStyle}
                        onValueChange={(v) => handleFormattingChange('calloutStyle', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confluence">Confluence (Info/Warning/Success panels)</SelectItem>
                          <SelectItem value="github">GitHub (Blockquote style)</SelectItem>
                          <SelectItem value="minimal">Minimal (Bordered)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Screenshot Placement</Label>
                      <Select
                        value={customTemplate.formatting.screenshotPlacement}
                        onValueChange={(v) => handleFormattingChange('screenshotPlacement', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inline">Inline with Text</SelectItem>
                          <SelectItem value="sidebar">Sidebar Layout</SelectItem>
                          <SelectItem value="annotated">Annotated with Callouts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Branding</h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        placeholder="Intelli HRM"
                        value={customTemplate.branding.companyName || ''}
                        onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          value={customTemplate.branding.primaryColor}
                          onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        />
                        <Input
                          value={customTemplate.branding.primaryColor}
                          onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                          placeholder="#0052CC"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Footer Text</Label>
                      <Input
                        placeholder="© 2025 Company Name. Confidential."
                        value={customTemplate.branding.footerText || ''}
                        onChange={(e) => handleBrandingChange('footerText', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export { DEFAULT_TEMPLATES };
