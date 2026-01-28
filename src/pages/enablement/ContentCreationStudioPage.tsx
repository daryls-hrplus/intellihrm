import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Bot,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { useTabState } from "@/hooks/useTabState";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { useApplicationModules, useApplicationFeatures } from "@/hooks/useApplicationFeatures";
import { useContentCreationAgent, GeneratedArtifact } from "@/hooks/useContentCreationAgent";
import { useManualSectionPreview } from "@/hooks/useManualSectionPreview";
import { useInitializeSections } from "@/hooks/useManualGeneration";
import { ContentCreationAgentChat } from "@/components/enablement/ContentCreationAgentChat";
import { AgentContextPanel } from "@/components/enablement/AgentContextPanel";
import { GeneratedArtifactList } from "@/components/enablement/GeneratedArtifactCard";
import { ContentDiffPreview } from "@/components/enablement/ContentDiffPreview";
import { toast } from "sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ContentCreationStudioPage() {
  const { navigateToList } = useWorkspaceNavigation();
  const { modules } = useApplicationModules();
  const { features } = useApplicationFeatures();

  const [tabState, setTabState] = useTabState({
    defaultState: {
      selectedModule: "",
      selectedFeature: "",
      artifactsExpanded: true,
    },
    syncToUrl: ["selectedModule", "selectedFeature"],
  });

  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isDiffPreviewOpen, setIsDiffPreviewOpen] = useState(false);

  // Manual section preview hook
  const {
    manuals,
    chapters,
    sectionsForChapter,
    selectedSection,
    selectedManualId,
    selectedChapter,
    selectedSectionId,
    isLoadingManuals,
    isLoadingSections,
    isGeneratingPreview,
    isApplying,
    previewResult,
    setSelectedManualId,
    setSelectedChapter,
    setSelectedSectionId,
    generatePreview,
    applyChanges,
    regenerateSection,
    regenerateChapter,
    clearPreview,
  } = useManualSectionPreview();

  // Initialize sections mutation
  const { mutate: initializeSections, isPending: isInitializing } = useInitializeSections();

  // Handle initialize sections
  const handleInitializeSections = () => {
    const manual = manuals.find(m => m.id === selectedManualId);
    if (!manual) return;
    
    initializeSections({
      manualId: selectedManualId,
      moduleName: manual.manual_name.replace(' Manual', '').replace(' Guide', '').replace(' - Administrator', ''),
      moduleCodes: manual.module_codes,
      targetRoles: ['admin', 'hr_user', 'consultant']
    });
  };

  const {
    isLoading,
    isStreaming,
    currentAction,
    contextAnalysis,
    chatMessages,
    generatedArtifacts,
    analyzeContext,
    identifyGaps,
    suggestNextActions,
    generateManualSection,
    generateKBArticle,
    generateQuickStart,
    generateSOP,
    sendChatMessage,
    clearChat,
    saveArtifact,
    removeArtifact,
  } = useContentCreationAgent();

  // Load suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      const result = await suggestNextActions();
      setSuggestions(result);
    };
    loadSuggestions();
  }, []);

  // Handle module/feature selection
  const handleModuleChange = (moduleCode: string) => {
    // Convert special values back to empty string for internal state
    const actualValue = moduleCode === "__all__" ? "" : moduleCode;
    setTabState({ selectedModule: actualValue, selectedFeature: "" });
  };

  const handleFeatureChange = (featureCode: string) => {
    // Convert special values back to empty string for internal state
    const actualValue = featureCode === "__none__" ? "" : featureCode;
    setTabState({ selectedFeature: actualValue });
  };

  // Convert internal state to Select-compatible values (non-empty)
  const selectModuleValue = tabState.selectedModule || "__all__";
  const selectFeatureValue = tabState.selectedFeature || "__none__";

  // Handle quick actions from chat
  const handleQuickAction = async (action: string, params?: Record<string, unknown>) => {
    const moduleCode = params?.moduleCode as string || tabState.selectedModule;
    const featureCode = params?.featureCode as string || tabState.selectedFeature;

    switch (action) {
      case 'analyze_context':
        await analyzeContext(moduleCode || undefined);
        break;
      case 'identify_gaps':
        await identifyGaps();
        break;
      case 'generate_manual_section':
        if (featureCode) {
          const result = await generateManualSection({ featureCode });
          if (result) {
            setPreviewContent(result.content);
            setPreviewTitle(result.metadata.sectionTitle);
          }
        }
        break;
      case 'generate_kb_article':
        if (featureCode) {
          const result = await generateKBArticle({ featureCode });
          if (result) {
            setPreviewContent(result.content || JSON.stringify(result, null, 2));
            setPreviewTitle(result.title);
          }
        }
        break;
      case 'generate_quickstart':
        if (moduleCode) {
          const result = await generateQuickStart(moduleCode);
          if (result) {
            setPreviewContent(JSON.stringify(result, null, 2));
            setPreviewTitle(`Quick Start: ${result.moduleName}`);
          }
        }
        break;
      case 'generate_sop':
        if (featureCode) {
          const result = await generateSOP(featureCode);
          if (result) {
            setPreviewContent(JSON.stringify(result, null, 2));
            setPreviewTitle(result.title);
          }
        }
        break;
      case 'suggest_next_actions':
        const newSuggestions = await suggestNextActions();
        setSuggestions(newSuggestions);
        break;
    }
  };

  // Handle artifact preview
  const handleArtifactPreview = (artifact: GeneratedArtifact) => {
    setPreviewContent(artifact.content);
    setPreviewTitle(artifact.title);
    setSelectedArtifactId(artifact.id);
  };

  // Handle artifact copy
  const handleArtifactCopy = (artifact: GeneratedArtifact) => {
    toast.success("Copied to clipboard");
  };

  // Handle save content to artifacts
  const handleSaveContent = async () => {
    if (!previewContent) return;

    const artifact = generatedArtifacts.find(a => a.id === selectedArtifactId);
    if (artifact) {
      await saveArtifact(artifact);
    }
  };

  // Handle copy content
  const handleCopyContent = () => {
    navigator.clipboard.writeText(previewContent);
    toast.success("Copied to clipboard");
  };

  // Handle preview changes for manual sections
  const handlePreviewChanges = async () => {
    const result = await generatePreview();
    if (result) {
      setIsDiffPreviewOpen(true);
    }
  };

  // Handle apply changes from diff preview
  const handleApplyChanges = async () => {
    await applyChanges();
    setIsDiffPreviewOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-background">
          <Breadcrumbs
            items={[
              { label: "Enablement", href: "/enablement" },
              { label: "Content Creation Studio" },
            ]}
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Content Creation Studio</h1>
                <p className="text-muted-foreground">
                  AI-powered documentation agent with schema awareness and multi-format output
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Bot className="h-3 w-3" />
                Agent Ready
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToList({
                  route: "/enablement/artifacts",
                  title: "Artifacts Library",
                  moduleCode: "enablement",
                })}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Artifacts
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Resizable Panels */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Agent Chat */}
            <ResizablePanel defaultSize={50} minSize={35}>
              <div className="h-full flex flex-col p-4">
                <ContentCreationAgentChat
                  messages={chatMessages}
                  isStreaming={isStreaming}
                  onSendMessage={sendChatMessage}
                  onQuickAction={handleQuickAction}
                  onClearChat={clearChat}
                  suggestions={suggestions}
                  selectedModule={tabState.selectedModule}
                  selectedFeature={tabState.selectedFeature}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Context & Preview */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col p-4">
                <ScrollArea className="flex-1">
                  <AgentContextPanel
                    analysis={contextAnalysis}
                    isLoading={isLoading && currentAction === 'analyze_context'}
                    modules={modules}
                    features={features}
                    selectedModule={selectModuleValue}
                    selectedFeature={selectFeatureValue}
                    onModuleChange={handleModuleChange}
                    onFeatureChange={handleFeatureChange}
                    onRefreshAnalysis={() => analyzeContext(tabState.selectedModule || undefined)}
                    previewContent={previewContent}
                    previewTitle={previewTitle}
                    onSaveContent={selectedArtifactId ? handleSaveContent : undefined}
                    onCopyContent={previewContent ? handleCopyContent : undefined}
                    // Manual content selection props
                    manuals={manuals}
                    chapters={chapters}
                    sectionsForChapter={sectionsForChapter}
                    selectedSection={selectedSection}
                    selectedManualId={selectedManualId}
                    selectedChapter={selectedChapter}
                    selectedSectionId={selectedSectionId}
                    onManualChange={setSelectedManualId}
                    onChapterChange={setSelectedChapter}
                    onSectionChange={setSelectedSectionId}
                    onPreviewChanges={handlePreviewChanges}
                    onRegenerateSection={regenerateSection}
                    onRegenerateChapter={regenerateChapter}
                    isLoadingManuals={isLoadingManuals}
                    isLoadingSections={isLoadingSections}
                    isGeneratingPreview={isGeneratingPreview}
                    isApplyingChanges={isApplying}
                    onInitializeSections={handleInitializeSections}
                    isInitializing={isInitializing}
                  />
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Bottom Panel - Generated Artifacts */}
        {generatedArtifacts.length > 0 && (
          <div className="flex-shrink-0 border-t bg-muted/30">
            <div className="px-4 py-2 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTabState({ artifactsExpanded: !tabState.artifactsExpanded })}
                className="gap-2"
              >
                {tabState.artifactsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
                Generated Content ({generatedArtifacts.length})
              </Button>
            </div>
            
            {tabState.artifactsExpanded && (
              <div className="px-4 pb-4">
                <ScrollArea className="h-[200px]">
                  <GeneratedArtifactList
                    artifacts={generatedArtifacts}
                    onSave={saveArtifact}
                    onCopy={handleArtifactCopy}
                    onRemove={removeArtifact}
                    onPreview={handleArtifactPreview}
                    selectedArtifactId={selectedArtifactId}
                  />
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        {/* Diff Preview Dialog */}
        {previewResult && (
          <ContentDiffPreview
            isOpen={isDiffPreviewOpen}
            onClose={() => {
              setIsDiffPreviewOpen(false);
              clearPreview();
            }}
            sectionTitle={previewResult.sectionInfo.title}
            sectionNumber={previewResult.sectionInfo.sectionNumber}
            currentContent={previewResult.currentContent}
            proposedContent={previewResult.proposedContent}
            onApply={handleApplyChanges}
            isApplying={isApplying}
          />
        )}
      </div>
    </AppLayout>
  );
}
