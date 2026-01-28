import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useContentCreationAgent, GeneratedArtifact, GapAnalysis, GapSummary } from "@/hooks/useContentCreationAgent";
import { useManualSectionPreview } from "@/hooks/useManualSectionPreview";
import { useInitializeSections } from "@/hooks/useManualGeneration";
import { ContentCreationAgentChat } from "@/components/enablement/ContentCreationAgentChat";
import { ContentCreationScopeBar } from "@/components/enablement/ContentCreationScopeBar";
import { ContentCreationOutputPanel } from "@/components/enablement/ContentCreationOutputPanel";
import { GeneratedArtifactList } from "@/components/enablement/GeneratedArtifactCard";
import { ContentDiffPreview } from "@/components/enablement/ContentDiffPreview";
import { ContextMode } from "@/components/enablement/AgentContextPanel";
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
      contextMode: "module" as ContextMode,
      outputTab: "preview",
    },
    syncToUrl: ["selectedModule", "selectedFeature"],
  });

  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>("");
  const [isDiffPreviewOpen, setIsDiffPreviewOpen] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<{ gaps: GapAnalysis; summary: GapSummary } | null>(null);

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
    generateManualSection,
    generateKBArticle,
    generateQuickStart,
    generateSOP,
    sendChatMessage,
    clearChat,
    saveArtifact,
    removeArtifact,
  } = useContentCreationAgent();

  // Handle module/feature selection
  const handleModuleChange = (moduleCode: string) => {
    const actualValue = moduleCode === "__all__" ? "" : moduleCode;
    setTabState({ selectedModule: actualValue, selectedFeature: "" });
  };

  const handleFeatureChange = (featureCode: string) => {
    const actualValue = featureCode === "__none__" ? "" : featureCode;
    setTabState({ selectedFeature: actualValue });
  };

  // Convert internal state to Select-compatible values
  const selectModuleValue = tabState.selectedModule || "__all__";
  const selectFeatureValue = tabState.selectedFeature || "__none__";

  // Handle context mode change
  const handleContextModeChange = (mode: ContextMode) => {
    setTabState({ contextMode: mode });
  };

  // Handle analyze - respects current context mode
  const handleAnalyze = async () => {
    if (tabState.contextMode === 'manual' && selectedManualId) {
      await analyzeContext(undefined, { manualId: selectedManualId });
    } else {
      await analyzeContext(tabState.selectedModule || undefined);
    }
  };

  // Handle quick actions from chat
  const handleQuickAction = async (action: string, params?: Record<string, unknown>) => {
    const moduleCode = params?.moduleCode as string || tabState.selectedModule;
    const featureCode = params?.featureCode as string || tabState.selectedFeature;

    switch (action) {
      case 'analyze_context':
        await handleAnalyze();
        break;
      case 'identify_gaps':
        const gapResult = await identifyGaps(moduleCode || undefined);
        if (gapResult) {
          setGapAnalysis(gapResult);
          setTabState({ outputTab: 'gaps' });
        }
        break;
      case 'generate_manual_section':
        if (featureCode) {
          const result = await generateManualSection({ featureCode });
          if (result) {
            setPreviewContent(result.content);
            setPreviewTitle(result.metadata.sectionTitle);
            setTabState({ outputTab: 'preview' });
          }
        }
        break;
      case 'generate_kb_article':
        if (featureCode) {
          const result = await generateKBArticle({ featureCode });
          if (result) {
            setPreviewContent(result.content || JSON.stringify(result, null, 2));
            setPreviewTitle(result.title);
            setTabState({ outputTab: 'preview' });
          }
        }
        break;
      case 'generate_quickstart':
        if (moduleCode) {
          const result = await generateQuickStart(moduleCode);
          if (result) {
            setPreviewContent(JSON.stringify(result, null, 2));
            setPreviewTitle(`Quick Start: ${result.moduleName}`);
            setTabState({ outputTab: 'preview' });
          }
        }
        break;
      case 'generate_sop':
        if (featureCode) {
          const result = await generateSOP(featureCode);
          if (result) {
            setPreviewContent(JSON.stringify(result, null, 2));
            setPreviewTitle(result.title);
            setTabState({ outputTab: 'preview' });
          }
        }
        break;
      case 'regenerate_section':
        await regenerateSection();
        break;
      case 'regenerate_chapter':
        await regenerateChapter();
        break;
    }
  };

  // Handle artifact preview
  const handleArtifactPreview = (artifact: GeneratedArtifact) => {
    setPreviewContent(artifact.content);
    setPreviewTitle(artifact.title);
    setSelectedArtifactId(artifact.id);
    setTabState({ outputTab: 'preview' });
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

  // Handle gap panel generate action
  const handleGenerateForGap = async (featureCode: string, type: 'kb' | 'manual' | 'sop') => {
    switch (type) {
      case 'manual':
        const manualResult = await generateManualSection({ featureCode });
        if (manualResult) {
          setPreviewContent(manualResult.content);
          setPreviewTitle(manualResult.metadata.sectionTitle);
          setTabState({ outputTab: 'preview' });
        }
        break;
      case 'kb':
        const kbResult = await generateKBArticle({ featureCode });
        if (kbResult) {
          setPreviewContent(kbResult.content || JSON.stringify(kbResult, null, 2));
          setPreviewTitle(kbResult.title);
          setTabState({ outputTab: 'preview' });
        }
        break;
      case 'sop':
        const sopResult = await generateSOP(featureCode);
        if (sopResult) {
          setPreviewContent(JSON.stringify(sopResult, null, 2));
          setPreviewTitle(sopResult.title);
          setTabState({ outputTab: 'preview' });
        }
        break;
    }
  };

  // Handle gap panel refresh
  const handleRefreshGaps = async (moduleCode?: string) => {
    const result = await identifyGaps(moduleCode);
    if (result) {
      setGapAnalysis(result);
    }
  };

  // Handle drill into module from details
  const handleDrillIntoModule = (moduleCode: string) => {
    setTabState({ contextMode: 'module', selectedModule: moduleCode });
    handleAnalyze();
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
                  AI-powered documentation agent with schema awareness
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

        {/* Scope Bar */}
        <ContentCreationScopeBar
          contextMode={tabState.contextMode as ContextMode}
          onContextModeChange={handleContextModeChange}
          modules={modules}
          features={features}
          selectedModule={selectModuleValue}
          selectedFeature={selectFeatureValue}
          onModuleChange={handleModuleChange}
          onFeatureChange={handleFeatureChange}
          manuals={manuals}
          chapters={chapters}
          sectionsForChapter={sectionsForChapter}
          selectedManualId={selectedManualId}
          selectedChapter={selectedChapter}
          selectedSectionId={selectedSectionId}
          onManualChange={setSelectedManualId}
          onChapterChange={setSelectedChapter}
          onSectionChange={setSelectedSectionId}
          onInitializeSections={handleInitializeSections}
          isInitializing={isInitializing}
          isLoadingManuals={isLoadingManuals}
          isLoadingSections={isLoadingSections}
          analysis={contextAnalysis}
          isAnalyzing={isLoading && currentAction === 'analyze_context'}
          onAnalyze={handleAnalyze}
        />

        {/* Main Content - Resizable Panels */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Agent Chat */}
            <ResizablePanel defaultSize={55} minSize={40}>
              <div className="h-full p-4">
                <ContentCreationAgentChat
                  messages={chatMessages}
                  isStreaming={isStreaming}
                  onSendMessage={sendChatMessage}
                  onQuickAction={handleQuickAction}
                  onClearChat={clearChat}
                  selectedModule={tabState.selectedModule}
                  selectedFeature={tabState.selectedFeature}
                  contextMode={tabState.contextMode as ContextMode}
                  hasSection={!!selectedSectionId}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Output Panel */}
            <ResizablePanel defaultSize={45} minSize={30}>
              <div className="h-full p-4">
                <ContentCreationOutputPanel
                  activeTab={tabState.outputTab}
                  onTabChange={(tab) => setTabState({ outputTab: tab })}
                  previewContent={previewContent}
                  previewTitle={previewTitle}
                  onSaveContent={selectedArtifactId ? handleSaveContent : undefined}
                  onCopyContent={previewContent ? handleCopyContent : undefined}
                  gapAnalysis={gapAnalysis}
                  isLoadingGaps={isLoading && currentAction === 'identify_gaps'}
                  onGenerateForGap={handleGenerateForGap}
                  onRefreshGaps={handleRefreshGaps}
                  modules={modules}
                  selectedModule={selectModuleValue}
                  onModuleChange={handleModuleChange}
                  analysis={contextAnalysis}
                  contextMode={tabState.contextMode as ContextMode}
                  onDrillIntoModule={handleDrillIntoModule}
                />
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
                Generated Artifacts ({generatedArtifacts.length})
              </Button>
            </div>

            {tabState.artifactsExpanded && (
              <div className="px-4 pb-4">
                <GeneratedArtifactList
                  artifacts={generatedArtifacts}
                  onPreview={handleArtifactPreview}
                  onSave={saveArtifact}
                  onRemove={removeArtifact}
                  onCopy={handleArtifactCopy}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Diff Preview Dialog */}
      {previewResult && (
        <ContentDiffPreview
          isOpen={isDiffPreviewOpen}
          onClose={() => setIsDiffPreviewOpen(false)}
          currentContent={previewResult.currentContent}
          proposedContent={previewResult.proposedContent}
          sectionTitle={previewResult.sectionInfo.title}
          sectionNumber={previewResult.sectionInfo.sectionNumber}
          onApply={handleApplyChanges}
          isApplying={isApplying}
        />
      )}
    </AppLayout>
  );
}
