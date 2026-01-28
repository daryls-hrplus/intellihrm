import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ChevronRight,
  Loader2,
  Layers,
  BookOpen,
} from "lucide-react";
import { ContextAnalysis, GapSummary } from "@/hooks/useContentCreationAgent";
import { ApplicationModule, ApplicationFeature } from "@/hooks/useApplicationFeatures";
import { ManualDefinition, ManualSection } from "@/hooks/useManualGeneration";
import { ChapterInfo } from "@/hooks/useChapterGeneration";
import { ManualContentSelector } from "./ManualContentSelector";
import { GapSummaryCard } from "./GapSummaryCard";
import { ContextualCoverageSummary } from "./ContextualCoverageSummary";
import { cn } from "@/lib/utils";
import { markdownToHtml } from "@/lib/utils/markdown";

export type ContextMode = 'module' | 'manual';

interface AgentContextPanelProps {
  analysis: ContextAnalysis | null;
  isLoading: boolean;
  modules: ApplicationModule[];
  features: ApplicationFeature[];
  selectedModule: string;
  selectedFeature: string;
  onModuleChange: (moduleCode: string) => void;
  onFeatureChange: (featureCode: string) => void;
  onRefreshAnalysis: () => void;
  previewContent?: string;
  previewTitle?: string;
  onSaveContent?: () => void;
  onCopyContent?: () => void;
  // Manual content selection props
  manuals?: ManualDefinition[];
  chapters?: ChapterInfo[];
  sectionsForChapter?: ManualSection[];
  selectedSection?: ManualSection | null;
  selectedManualId?: string;
  selectedChapter?: string;
  selectedSectionId?: string;
  onManualChange?: (manualId: string) => void;
  onChapterChange?: (chapterNumber: string) => void;
  onSectionChange?: (sectionId: string) => void;
  onPreviewChanges?: () => void;
  onRegenerateSection?: () => void;
  onRegenerateChapter?: () => void;
  isLoadingManuals?: boolean;
  isLoadingSections?: boolean;
  isGeneratingPreview?: boolean;
  isApplyingChanges?: boolean;
  onInitializeSections?: () => void;
  isInitializing?: boolean;
  // Gap summary
  gapSummary?: GapSummary | null;
  onViewGapDetails?: () => void;
  // Context mode control (unified selection)
  contextMode?: ContextMode;
  onContextModeChange?: (mode: ContextMode) => void;
  onAnalyzeWithContext?: (mode: ContextMode, manualId?: string, moduleCode?: string) => void;
}

export function AgentContextPanel({
  analysis,
  isLoading,
  modules,
  features,
  selectedModule,
  selectedFeature,
  onModuleChange,
  onFeatureChange,
  onRefreshAnalysis,
  previewContent,
  previewTitle,
  onSaveContent,
  onCopyContent,
  // Manual content selection props
  manuals = [],
  chapters = [],
  sectionsForChapter = [],
  selectedSection = null,
  selectedManualId = "",
  selectedChapter = "",
  selectedSectionId = "",
  onManualChange,
  onChapterChange,
  onSectionChange,
  onPreviewChanges,
  onRegenerateSection,
  onRegenerateChapter,
  isLoadingManuals = false,
  isLoadingSections = false,
  isGeneratingPreview = false,
  isApplyingChanges = false,
  onInitializeSections,
  isInitializing = false,
  gapSummary,
  onViewGapDetails,
  contextMode: externalContextMode,
  onContextModeChange,
  onAnalyzeWithContext,
}: AgentContextPanelProps) {
  // Internal context mode state (used if not controlled externally)
  const [internalContextMode, setInternalContextMode] = useState<ContextMode>('module');
  
  // Use external control if provided, otherwise internal
  const contextMode = externalContextMode ?? internalContextMode;
  const setContextMode = onContextModeChange ?? setInternalContextMode;

  // Filter features by selected module
  const filteredFeatures = selectedModule
    ? features.filter(f => {
        const mod = modules.find(m => m.id === f.module_id);
        return mod?.module_code === selectedModule;
      })
    : features;

  // Handle analyze based on context mode
  const handleAnalyze = () => {
    if (onAnalyzeWithContext) {
      if (contextMode === 'manual') {
        onAnalyzeWithContext('manual', selectedManualId, undefined);
      } else {
        onAnalyzeWithContext('module', undefined, selectedModule === "__all__" ? undefined : selectedModule);
      }
    } else {
      onRefreshAnalysis();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Unified Context Selector with Mode Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Context</CardTitle>
            <Tabs 
              value={contextMode} 
              onValueChange={(v) => setContextMode(v as ContextMode)}
              className="w-auto"
            >
              <TabsList className="h-7 p-0.5">
                <TabsTrigger value="module" className="text-xs px-2 h-6 gap-1">
                  <Layers className="h-3 w-3" />
                  Module
                </TabsTrigger>
                <TabsTrigger value="manual" className="text-xs px-2 h-6 gap-1">
                  <BookOpen className="h-3 w-3" />
                  Manual
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription className="text-xs mt-1">
            {contextMode === 'module' 
              ? "Select a module to analyze features and generate content"
              : "Select a manual to analyze coverage and regenerate sections"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {contextMode === 'module' ? (
            <>
              {/* Module/Feature Selectors */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Module</label>
                <Select value={selectedModule} onValueChange={onModuleChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All modules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All modules</SelectItem>
                    {modules.map((mod) => (
                      <SelectItem key={mod.id} value={mod.module_code || mod.id}>
                        {mod.module_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Feature</label>
                <Select value={selectedFeature} onValueChange={onFeatureChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a feature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No specific feature</SelectItem>
                    {filteredFeatures.slice(0, 50).map((feat) => (
                      <SelectItem key={feat.id} value={feat.feature_code || feat.id}>
                        {feat.feature_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            /* Manual Content Selector - shown when in Manual mode */
            onManualChange && onChapterChange && onSectionChange && onPreviewChanges && onRegenerateSection && onRegenerateChapter && (
              <ManualContentSelector
                manuals={manuals}
                chapters={chapters}
                sectionsForChapter={sectionsForChapter}
                selectedSection={selectedSection}
                selectedManualId={selectedManualId}
                selectedChapter={selectedChapter}
                selectedSectionId={selectedSectionId}
                onManualChange={onManualChange}
                onChapterChange={onChapterChange}
                onSectionChange={onSectionChange}
                onPreviewChanges={onPreviewChanges}
                onRegenerateSection={onRegenerateSection}
                onRegenerateChapter={onRegenerateChapter}
                onInitializeSections={onInitializeSections}
                isLoadingManuals={isLoadingManuals}
                isLoadingSections={isLoadingSections}
                isGeneratingPreview={isGeneratingPreview}
                isApplying={isApplyingChanges}
                isInitializing={isInitializing}
              />
            )
          )}

          {/* Contextual Coverage Summary - always visible, reflects current mode */}
          <ContextualCoverageSummary
            mode={contextMode}
            selectedManualId={selectedManualId}
            selectedModuleCode={selectedModule === "__all__" ? undefined : selectedModule}
            analysis={analysis}
            isLoading={isLoading}
            onAnalyze={handleAnalyze}
            manuals={manuals}
          />
        </CardContent>
      </Card>

      {/* Gap Summary Card - shown in module mode when gaps exist */}
      {contextMode === 'module' && gapSummary && onViewGapDetails && (
        <GapSummaryCard summary={gapSummary} onViewDetails={onViewGapDetails} />
      )}

      {/* Detailed Coverage Stats - shown when analysis exists */}
      {analysis && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Details
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Readiness Score */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Readiness Score</p>
                <p className="text-xs text-muted-foreground">Based on coverage & freshness</p>
              </div>
              <div className={cn(
                "text-2xl font-bold",
                analysis.readinessScore >= 80 ? "text-green-500" :
                analysis.readinessScore >= 60 ? "text-yellow-500" : "text-red-500"
              )}>
                {analysis.readinessScore}
              </div>
            </div>

            {/* Module Breakdown (top 5) */}
            {Object.entries(analysis.moduleBreakdown).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">By Module</p>
                <div className="space-y-2">
                  {Object.entries(analysis.moduleBreakdown)
                    .sort(([, a], [, b]) => b.percentage - a.percentage)
                    .slice(0, 5)
                    .map(([code, data]) => (
                      <div key={code} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="truncate">{data.moduleName}</span>
                            <span className="text-muted-foreground">{data.percentage}%</span>
                          </div>
                          <Progress value={data.percentage} className="h-1" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setContextMode('module');
                            onModuleChange(code);
                          }}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Recommendations</p>
                <div className="space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <AlertCircle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stale Content Warning */}
            {analysis.staleContent.length > 0 && (
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {analysis.staleContent.length} items need refresh (90+ days)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Panel */}
      {previewContent && (
        <Card className="flex-1 min-h-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Preview
                </CardTitle>
                {previewTitle && (
                  <CardDescription className="text-xs mt-1">
                    {previewTitle}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-1">
                {onCopyContent && (
                  <Button variant="ghost" size="sm" onClick={onCopyContent}>
                    Copy
                  </Button>
                )}
                {onSaveContent && (
                  <Button size="sm" onClick={onSaveContent}>
                    Save
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-[300px]">
              <div 
                className="p-4 prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(previewContent) }}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
