import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { 
  Sparkles, 
  Loader2, 
  BookOpen, 
  FileText, 
  Video,
  Copy,
  Download,
  Save,
  FileCheck,
  Library
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useModulesWithFeatures, ApplicationFeature } from "@/hooks/useApplicationFeatures";
import { FeatureBrowser, FeatureDetailPanel } from "@/components/enablement/FeatureBrowser";
import { DocumentTemplate, DEFAULT_TEMPLATES } from "@/components/enablement/DocumentTemplateConfig";
import { ConfluenceStylePreview, GeneratedDocument } from "@/components/enablement/ConfluenceStylePreview";
import { TemplateLibrary } from "@/components/enablement/TemplateLibrary";

type ContentType = 'module_overview' | 'feature_tutorial' | 'video_storyboard' | 'quick_reference' | 'kb_article' | 'training_guide' | 'sop';

interface GeneratedContent {
  type: ContentType;
  content: any;
  rawJson: string;
}

export default function ApplicationDocsGeneratorPage() {
  const { t } = useTranslation();
  const { data: modulesWithFeatures } = useModulesWithFeatures();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [selectedFeatureData, setSelectedFeatureData] = useState<ApplicationFeature | null>(null);
  const [contentType, setContentType] = useState<ContentType>("training_guide");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(DEFAULT_TEMPLATES[0]);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  const availableRoles = ["admin", "hr_manager", "employee"];

  // Get categories (modules without parent_module_code that start with 'cat_')
  const categories = useMemo(() => 
    modulesWithFeatures.filter(m => m.module_code.startsWith('cat_')),
    [modulesWithFeatures]
  );

  // Get modules within selected category
  const modulesInCategory = useMemo(() => 
    modulesWithFeatures.filter(m => 
      !m.module_code.startsWith('cat_') && 
      (m as any).parent_module_code === selectedCategory
    ),
    [modulesWithFeatures, selectedCategory]
  );

  const module = useMemo(() => 
    modulesWithFeatures.find(m => m.module_code === selectedModule),
    [modulesWithFeatures, selectedModule]
  );

  const handleGenerate = async () => {
    if (!selectedModule) {
      toast.error("Please select a module");
      return;
    }

    if ((contentType === 'feature_tutorial' || contentType === 'video_storyboard' || contentType === 'kb_article') && !selectedFeature) {
      toast.error("Please select a feature for this content type");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const actionMap: Record<ContentType, string> = {
        module_overview: 'generate_module_overview',
        feature_tutorial: 'generate_feature_tutorial',
        video_storyboard: 'generate_video_storyboard',
        quick_reference: 'generate_quick_reference',
        kb_article: 'generate_kb_article',
        training_guide: 'generate_training_guide',
        sop: 'generate_sop'
      };

      const payload: any = {
        action: actionMap[contentType],
        moduleCode: selectedModule,
        moduleName: module?.module_name,
        targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
        customInstructions: customInstructions || undefined,
        template: selectedTemplate
      };

      if (selectedFeatureData) {
        payload.featureCode = selectedFeature;
        payload.featureName = selectedFeatureData.feature_name;
        payload.featureDescription = selectedFeatureData.description;
        payload.workflowSteps = selectedFeatureData.workflow_steps;
        payload.uiElements = selectedFeatureData.ui_elements;
      }

      const { data, error } = await supabase.functions.invoke('enablement-ai-assistant', {
        body: payload
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedContent({
          type: contentType,
          content: data.content,
          rawJson: JSON.stringify(data.content, null, 2)
        });
        toast.success("Content generated successfully!");
      } else {
        throw new Error(data.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyJson = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.rawJson);
      toast.success("JSON copied to clipboard");
    }
  };

  const handleSaveTutorial = async () => {
    if (!generatedContent) return;

    try {
      const { error } = await supabase.from('enablement_tutorials').insert({
        module_id: null, // Would need to look up from application_modules table
        title: generatedContent.content.title || `${module?.module_name} ${contentType}`,
        description: generatedContent.content.description || generatedContent.content.summary,
        content_type: contentType.replace('_', ' '),
        content: generatedContent.content,
        target_roles: targetRoles,
        status: 'draft'
      });

      if (error) throw error;
      toast.success("Tutorial saved as draft");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save tutorial");
    }
  };

  const renderGeneratedContent = () => {
    if (!generatedContent) return null;

    const { content, type } = generatedContent;

    switch (type) {
      case 'module_overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-muted-foreground mt-2">{content.description}</p>
            </div>
            {content.learningObjectives && (
              <div>
                <h3 className="font-semibold mb-2">Learning Objectives</h3>
                <ul className="list-disc list-inside space-y-1">
                  {content.learningObjectives.map((obj: string, i: number) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
            {content.sections?.map((section: any, i: number) => (
              <div key={i}>
                <h3 className="font-semibold text-lg mb-2">{section.heading}</h3>
                <div className="prose prose-sm max-w-none">
                  <p>{section.content}</p>
                </div>
                {section.keyPoints && (
                  <ul className="mt-2 space-y-1">
                    {section.keyPoints.map((point: string, j: number) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {content.estimatedDuration && (
              <Badge variant="outline">Est. Duration: {content.estimatedDuration} minutes</Badge>
            )}
          </div>
        );

      case 'feature_tutorial':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-muted-foreground mt-2">{content.description}</p>
            </div>
            {content.prerequisites && (
              <div>
                <h3 className="font-semibold mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1">
                  {content.prerequisites.map((pre: string, i: number) => (
                    <li key={i}>{pre}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-4">Steps</h3>
              <div className="space-y-4">
                {content.steps?.map((step: any) => (
                  <Card key={step.stepNumber}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="default">{step.stepNumber}</Badge>
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{step.instruction}</p>
                      {step.tip && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <span className="font-medium">💡 Tip:</span> {step.tip}
                        </div>
                      )}
                      {step.screenshotHint && (
                        <div className="mt-2 text-sm text-muted-foreground italic">
                          📷 Screenshot: {step.screenshotHint}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {content.summary && (
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p>{content.summary}</p>
              </div>
            )}
          </div>
        );

      case 'video_storyboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-muted-foreground mt-2">{content.description}</p>
              {content.totalDuration && (
                <Badge variant="outline" className="mt-2">Total Duration: {content.totalDuration}</Badge>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-4">Scenes</h3>
              <div className="space-y-4">
                {content.scenes?.map((scene: any) => (
                  <Card key={scene.sceneNumber}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="secondary">Scene {scene.sceneNumber}</Badge>
                          {scene.title}
                        </CardTitle>
                        <Badge variant="outline">{scene.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">NARRATION</Label>
                        <p className="italic">"{scene.narration}"</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">ON SCREEN</Label>
                        <p>{scene.onScreenAction}</p>
                      </div>
                      {scene.annotations?.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">ANNOTATIONS</Label>
                          <ul className="list-disc list-inside">
                            {scene.annotations.map((ann: string, i: number) => (
                              <li key={i}>{ann}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {content.closingScript && (
              <div>
                <h3 className="font-semibold mb-2">Closing</h3>
                <p className="italic">"{content.closingScript}"</p>
              </div>
            )}
          </div>
        );

      case 'quick_reference':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{content.title}</h2>
            {content.sections?.map((section: any, i: number) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{section.heading}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.items?.map((item: any, j: number) => (
                      <div key={j} className="flex items-start justify-between gap-4 py-1 border-b last:border-0">
                        <div>
                          <span className="font-medium">{item.label}</span>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        {item.shortcut && (
                          <Badge variant="outline" className="shrink-0">{item.shortcut}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {content.tips && (
              <div>
                <h3 className="font-semibold mb-2">💡 Tips</h3>
                <ul className="space-y-1">
                  {content.tips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {content.warnings && (
              <div>
                <h3 className="font-semibold mb-2">⚠️ Warnings</h3>
                <ul className="space-y-1">
                  {content.warnings.map((warning: string, i: number) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'kb_article':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-muted-foreground mt-2">{content.summary}</p>
            </div>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.content?.replace(/\n/g, '<br/>') || '' }} />
            </div>
            {content.faqs && (
              <div>
                <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {content.faqs.map((faq: any, i: number) => (
                    <div key={i}>
                      <h4 className="font-medium">{faq.question}</h4>
                      <p className="text-muted-foreground mt-1">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {content.tags && (
              <div className="flex gap-2 flex-wrap">
                {content.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'training_guide':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              {content.description && <p className="text-muted-foreground mt-2">{content.description}</p>}
              {content.summary && <p className="text-muted-foreground mt-2">{content.summary}</p>}
            </div>
            {content.estimatedDuration && (
              <Badge variant="outline">Est. Duration: {content.estimatedDuration} minutes</Badge>
            )}
            {content.learningObjectives && content.learningObjectives.length > 0 && (
              <div className="p-4 border rounded-lg bg-muted/30">
                <h3 className="font-semibold mb-3">Learning Objectives</h3>
                <ul className="space-y-2">
                  {content.learningObjectives.map((obj: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {content.prerequisites && content.prerequisites.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1">
                  {content.prerequisites.map((pre: string, i: number) => (
                    <li key={i}>{pre}</li>
                  ))}
                </ul>
              </div>
            )}
            {content.sections && content.sections.map((section: any, i: number) => (
              <div key={i} className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">{section.heading || section.title}</h3>
                {section.content && <p>{section.content}</p>}
                {section.keyPoints && (
                  <ul className="space-y-1 ml-4">
                    {section.keyPoints.map((point: string, j: number) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.steps && section.steps.map((step: any, j: number) => (
                  <Card key={j} className="mt-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="default">{step.stepNumber || j + 1}</Badge>
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{step.instruction || step.description}</p>
                      {step.tip && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm border-l-4 border-blue-500">
                          <span className="font-medium">💡 Tip:</span> {step.tip}
                        </div>
                      )}
                      {step.warning && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded text-sm border-l-4 border-yellow-500">
                          <span className="font-medium">⚠️ Warning:</span> {step.warning}
                        </div>
                      )}
                      {step.screenshotHint && (
                        <div className="mt-2 text-sm text-muted-foreground italic">
                          📷 Screenshot: {step.screenshotHint}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
            {content.steps && !content.sections && (
              <div>
                <h3 className="font-semibold mb-4">Steps</h3>
                <div className="space-y-4">
                  {content.steps.map((step: any, i: number) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="default">{step.stepNumber || i + 1}</Badge>
                          {step.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{step.instruction || step.description}</p>
                        {step.tip && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm border-l-4 border-blue-500">
                            <span className="font-medium">💡 Tip:</span> {step.tip}
                          </div>
                        )}
                        {step.warning && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded text-sm border-l-4 border-yellow-500">
                            <span className="font-medium">⚠️ Warning:</span> {step.warning}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {content.summary && !content.description && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p>{content.summary}</p>
              </div>
            )}
          </div>
        );

      case 'sop':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              {content.description && <p className="text-muted-foreground mt-2">{content.description}</p>}
              {content.purpose && <p className="text-muted-foreground mt-2">{content.purpose}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {content.documentNumber && (
                <div>
                  <span className="font-medium">Document #:</span> {content.documentNumber}
                </div>
              )}
              {content.version && (
                <div>
                  <span className="font-medium">Version:</span> {content.version}
                </div>
              )}
              {content.effectiveDate && (
                <div>
                  <span className="font-medium">Effective Date:</span> {content.effectiveDate}
                </div>
              )}
              {content.reviewDate && (
                <div>
                  <span className="font-medium">Review Date:</span> {content.reviewDate}
                </div>
              )}
            </div>
            {content.scope && (
              <div>
                <h3 className="font-semibold mb-2">Scope</h3>
                <p>{content.scope}</p>
              </div>
            )}
            {content.responsibilities && content.responsibilities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Responsibilities</h3>
                <div className="space-y-2">
                  {content.responsibilities.map((resp: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <Badge variant="outline">{resp.role}</Badge>
                      <span>{resp.responsibility || resp.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {content.procedures && content.procedures.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Procedures</h3>
                <div className="space-y-4">
                  {content.procedures.map((proc: any, i: number) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="default">{proc.stepNumber || i + 1}</Badge>
                          {proc.title || proc.action}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{proc.description || proc.instruction}</p>
                        {proc.substeps && (
                          <ul className="mt-2 ml-4 space-y-1 list-disc list-inside">
                            {proc.substeps.map((sub: string, j: number) => (
                              <li key={j}>{sub}</li>
                            ))}
                          </ul>
                        )}
                        {proc.note && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Note:</span> {proc.note}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {content.sections && content.sections.map((section: any, i: number) => (
              <div key={i} className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">{section.heading || section.title}</h3>
                {section.content && <p>{section.content}</p>}
                {section.steps && section.steps.map((step: any, j: number) => (
                  <Card key={j} className="mt-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="default">{step.stepNumber || j + 1}</Badge>
                        {step.title || step.action}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{step.description || step.instruction}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
            {content.references && content.references.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">References</h3>
                <ul className="list-disc list-inside space-y-1">
                  {content.references.map((ref: string, i: number) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return <pre className="text-sm">{JSON.stringify(content, null, 2)}</pre>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Docs Generator</h1>
        <p className="text-muted-foreground">
          Generate documentation, tutorials, and training content using AI
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
            <CardDescription>Configure what content to generate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training_guide">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Training Guide (Industry Standard)
                    </div>
                  </SelectItem>
                  <SelectItem value="module_overview">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Module Overview
                    </div>
                  </SelectItem>
                  <SelectItem value="feature_tutorial">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Feature Tutorial
                    </div>
                  </SelectItem>
                  <SelectItem value="sop">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Standard Operating Procedure
                    </div>
                  </SelectItem>
                  <SelectItem value="video_storyboard">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Storyboard
                    </div>
                  </SelectItem>
                  <SelectItem value="quick_reference">Quick Reference Guide</SelectItem>
                  <SelectItem value="kb_article">Knowledge Base Article</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Template Library */}
              <Sheet open={showTemplateLibrary} onOpenChange={setShowTemplateLibrary}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Library className="h-4 w-4 mr-2" />
                    Template Library
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
                  <TemplateLibrary
                    selectedTemplate={selectedTemplate}
                    onTemplateSelect={(template) => {
                      setSelectedTemplate(template);
                      setShowTemplateLibrary(false);
                      toast.success(`Template "${template.name}" applied`);
                    }}
                    onClose={() => setShowTemplateLibrary(false)}
                  />
                </SheetContent>
              </Sheet>
              {selectedTemplate && (
                <div className="mt-2 space-y-1">
                  <span className="text-sm font-medium">{selectedTemplate.name}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: selectedTemplate.branding.primaryColor }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {selectedTemplate.branding.companyName || 'No branding set'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Module Category</Label>
              <Select value={selectedCategory} onValueChange={(v) => {
                setSelectedCategory(v);
                setSelectedModule("");
                setSelectedFeature("");
                setSelectedFeatureData(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.module_code} value={cat.module_code}>
                      {cat.module_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Module</Label>
              <Select 
                value={selectedModule} 
                onValueChange={(v) => {
                  setSelectedModule(v);
                  setSelectedFeature("");
                  setSelectedFeatureData(null);
                }}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCategory ? "Select a module" : "Select a category first"} />
                </SelectTrigger>
                <SelectContent>
                  {modulesInCategory.map((mod) => (
                    <SelectItem key={mod.module_code} value={mod.module_code}>
                      {mod.module_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {contentType !== 'module_overview' && module && module.features.length > 0 && (
              <div className="space-y-2">
                <Label>Feature</Label>
                <Select value={selectedFeature} onValueChange={(v) => {
                  setSelectedFeature(v);
                  const feat = module.features.find(f => f.feature_code === v);
                  setSelectedFeatureData(feat || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a feature" />
                  </SelectTrigger>
                  <SelectContent>
                    {module.features.map((feat) => (
                      <SelectItem key={feat.feature_code} value={feat.feature_code}>
                        {feat.feature_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Target Roles</Label>
              <div className="flex flex-wrap gap-4">
                {availableRoles.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={targetRoles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTargetRoles([...targetRoles, role]);
                        } else {
                          setTargetRoles(targetRoles.filter(r => r !== role));
                        }
                      }}
                    />
                    <label htmlFor={role} className="text-sm capitalize">{role.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Instructions (Optional)</Label>
              <Textarea
                placeholder="Add any specific requirements or focus areas..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleGenerate}
              disabled={isGenerating || !selectedModule}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>Preview and export your content</CardDescription>
              </div>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyJson}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveTutorial}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <ScrollArea className="h-[600px] pr-4">
                    {renderGeneratedContent()}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="json">
                  <ScrollArea className="h-[600px]">
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                      {generatedContent.rawJson}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a module and content type, then click Generate</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
