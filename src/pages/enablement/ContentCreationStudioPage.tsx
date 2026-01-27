import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  FileText,
  Library,
  Bot,
  Wand2,
  BookOpen,
  HelpCircle,
  ClipboardList,
  Loader2,
  Copy,
  Download,
  ArrowRight,
  Brain,
} from "lucide-react";
import { useTabState } from "@/hooks/useTabState";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { DocumentationAgentPanel } from "@/components/enablement/DocumentationAgentPanel";
import { AIToolsPanel } from "@/components/enablement/AIToolsPanel";
import { useApplicationModules } from "@/hooks/useApplicationFeatures";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ContentType = "kb-article" | "training-guide" | "sop" | "quickstart";

interface GeneratedContent {
  type: ContentType;
  title: string;
  content: string;
  metadata?: {
    feature_code?: string;
    module_code?: string;
  };
}

export default function ContentCreationStudioPage() {
  const { navigateToList } = useWorkspaceNavigation();
  const { modules } = useApplicationModules();
  
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "ai-generator",
    },
    syncToUrl: ["activeTab"],
  });

  const [contentType, setContentType] = useState<ContentType>("kb-article");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const contentTypeOptions: { value: ContentType; label: string; icon: typeof FileText; description: string }[] = [
    { 
      value: "kb-article", 
      label: "KB Article", 
      icon: HelpCircle,
      description: "Help center article for end users"
    },
    { 
      value: "training-guide", 
      label: "Training Guide", 
      icon: BookOpen,
      description: "Step-by-step training documentation"
    },
    { 
      value: "sop", 
      label: "SOP Document", 
      icon: ClipboardList,
      description: "Standard operating procedure"
    },
    { 
      value: "quickstart", 
      label: "Quick Start", 
      icon: Sparkles,
      description: "Rapid setup guide for modules"
    },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-artifact-content', {
        body: {
          topic,
          contentType,
          moduleCode: selectedModule || undefined,
          additionalContext: context || undefined,
        }
      });

      if (error) throw error;

      if (data?.content) {
        setGeneratedContent({
          type: contentType,
          title: data.title || topic,
          content: data.content,
          metadata: {
            module_code: selectedModule,
          }
        });
        toast.success("Content generated successfully");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAgentGenerate = (content: string, feature: { feature_code: string; feature_name: string }) => {
    setGeneratedContent({
      type: "kb-article",
      title: feature.feature_name,
      content,
      metadata: {
        feature_code: feature.feature_code,
      }
    });
    setTabState({ activeTab: "preview" });
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      toast.success("Content copied to clipboard");
    }
  };

  const handleSaveToArtifacts = async () => {
    if (!generatedContent) return;

    try {
      // Get a unique artifact_id
      const artifactId = `gen-${Date.now()}`;
      
      const { error } = await supabase.from("enablement_artifacts").insert({
        artifact_id: artifactId,
        title: generatedContent.title,
        content: generatedContent.content,
        artifact_type: generatedContent.type === "kb-article" ? "kb_article" : 
                       generatedContent.type === "training-guide" ? "training_guide" :
                       generatedContent.type === "sop" ? "sop" : "quickstart",
        module_code: generatedContent.metadata?.module_code,
        feature_code: generatedContent.metadata?.feature_code,
        status: "draft",
      });

      if (error) throw error;
      toast.success("Saved to artifacts library");
      
      navigateToList({
        route: "/enablement/artifacts",
        title: "Enablement Artifacts",
        moduleCode: "enablement",
      });
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save artifact");
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Content Creation Studio" },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Content Creation Studio</h1>
              <p className="text-muted-foreground">
                AI-powered documentation generation with templates, schema awareness, and automation tools
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Bot className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>

        {/* Main Content */}
        <Tabs 
          value={tabState.activeTab} 
          onValueChange={(value) => setTabState({ activeTab: value })}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ai-generator" className="gap-2">
              <Wand2 className="h-4 w-4" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2">
              <Bot className="h-4 w-4" />
              Documentation Agent
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Library className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Tools
              <Badge variant="secondary" className="ml-1 text-xs">11</Badge>
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2" disabled={!generatedContent}>
              <FileText className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* AI Generator Tab */}
          <TabsContent value="ai-generator" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Generate Content
                  </CardTitle>
                  <CardDescription>
                    Describe what you want to create and let AI generate it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content Type Selection */}
                  <div className="space-y-2">
                    <Label>Content Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {contentTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setContentType(option.value)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            contentType === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <option.icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{option.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Module Selection */}
                  <div className="space-y-2">
                    <Label>Module (Optional)</Label>
                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a module for context" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific module</SelectItem>
                        {modules.map((mod) => (
                          <SelectItem key={mod.id} value={mod.module_code}>
                            {mod.module_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic */}
                  <div className="space-y-2">
                    <Label>Topic / Title</Label>
                    <Input
                      placeholder="e.g., How to configure leave policies"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  {/* Additional Context */}
                  <div className="space-y-2">
                    <Label>Additional Context (Optional)</Label>
                    <Textarea
                      placeholder="Add any specific requirements, audience details, or key points to cover..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !topic.trim()}
                    className="w-full"
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

              {/* Quick Tips */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="p-1.5 rounded bg-primary/10">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <p>Select a content type that matches your documentation needs</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-1.5 rounded bg-primary/10">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <p>Choose a module to give the AI context about the feature area</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-1.5 rounded bg-primary/10">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <p>Be specific in your topic - mention the exact feature or workflow</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-1.5 rounded bg-primary/10">
                        <span className="text-primary font-bold">4</span>
                      </div>
                      <p>Review and edit the generated content before publishing</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Try the Documentation Agent</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          The agent can analyze your database schema and automatically identify 
                          undocumented features to generate content for.
                        </p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto mt-2"
                          onClick={() => setTabState({ activeTab: "agent" })}
                        >
                          Open Documentation Agent
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Documentation Agent Tab */}
          <TabsContent value="agent" className="mt-6">
            <DocumentationAgentPanel onGenerateComplete={handleAgentGenerate} />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Template Library
                </CardTitle>
                <CardDescription>
                  Pre-built templates for common documentation types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { title: "Feature Overview", type: "kb-article", sections: 5 },
                    { title: "Step-by-Step Guide", type: "training-guide", sections: 8 },
                    { title: "Configuration SOP", type: "sop", sections: 6 },
                    { title: "Module Quick Start", type: "quickstart", sections: 4 },
                    { title: "Troubleshooting Guide", type: "kb-article", sections: 6 },
                    { title: "Best Practices", type: "training-guide", sections: 5 },
                  ].map((template, idx) => (
                    <Card key={idx} className="cursor-pointer hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{template.title}</h4>
                          <Badge variant="outline">{template.sections} sections</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {template.type.replace("-", " ")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="ai-tools" className="mt-6">
            <AIToolsPanel />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-6">
            {generatedContent && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{generatedContent.title}</CardTitle>
                      <CardDescription className="capitalize">
                        {generatedContent.type.replace("-", " ")}
                        {generatedContent.metadata?.module_code && ` • ${generatedContent.metadata.module_code}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopyContent}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" onClick={handleSaveToArtifacts}>
                        <Download className="h-4 w-4 mr-2" />
                        Save to Artifacts
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                      {generatedContent.content}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
