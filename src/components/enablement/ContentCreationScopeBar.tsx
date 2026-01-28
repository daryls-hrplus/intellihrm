import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layers,
  BookOpen,
  RefreshCw,
  Loader2,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { ContextMode } from "./AgentContextPanel";
import { ContextAnalysis } from "@/hooks/useContentCreationAgent";
import { ApplicationModule, ApplicationFeature } from "@/hooks/useApplicationFeatures";
import { ManualDefinition, ManualSection } from "@/hooks/useManualGeneration";
import { ChapterInfo } from "@/hooks/useChapterGeneration";
import { cn } from "@/lib/utils";

interface ContentCreationScopeBarProps {
  contextMode: ContextMode;
  onContextModeChange: (mode: ContextMode) => void;
  // Module mode props
  modules: ApplicationModule[];
  features: ApplicationFeature[];
  selectedModule: string;
  selectedFeature: string;
  onModuleChange: (code: string) => void;
  onFeatureChange: (code: string) => void;
  // Manual mode props
  manuals: ManualDefinition[];
  chapters: ChapterInfo[];
  sectionsForChapter: ManualSection[];
  selectedManualId: string;
  selectedChapter: string;
  selectedSectionId: string;
  onManualChange: (id: string) => void;
  onChapterChange: (num: string) => void;
  onSectionChange: (id: string) => void;
  onInitializeSections?: () => void;
  isInitializing?: boolean;
  isLoadingManuals?: boolean;
  isLoadingSections?: boolean;
  // Coverage/Analysis
  analysis: ContextAnalysis | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export function ContentCreationScopeBar({
  contextMode,
  onContextModeChange,
  // Module mode
  modules,
  features,
  selectedModule,
  selectedFeature,
  onModuleChange,
  onFeatureChange,
  // Manual mode
  manuals,
  chapters,
  sectionsForChapter,
  selectedManualId,
  selectedChapter,
  selectedSectionId,
  onManualChange,
  onChapterChange,
  onSectionChange,
  onInitializeSections,
  isInitializing = false,
  isLoadingManuals = false,
  isLoadingSections = false,
  // Analysis
  analysis,
  isAnalyzing,
  onAnalyze,
}: ContentCreationScopeBarProps) {
  // Filter features by selected module
  const filteredFeatures = selectedModule && selectedModule !== "__all__"
    ? features.filter(f => {
        const mod = modules.find(m => m.id === f.module_id);
        return mod?.module_code === selectedModule;
      })
    : features;

  // Get selected manual for display
  const selectedManual = manuals.find(m => m.id === selectedManualId);
  
  // Determine coverage color and status
  const getCoverageColor = (percentage: number | undefined) => {
    if (!percentage) return "text-muted-foreground";
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getCoverageProgressClass = (percentage: number | undefined) => {
    if (!percentage) return "";
    if (percentage >= 80) return "[&>div]:bg-green-500";
    if (percentage >= 50) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-red-500";
  };

  return (
    <div className="flex-shrink-0 px-6 py-3 bg-muted/30 border-b">
      <div className="flex items-center gap-4">
        {/* Mode Toggle */}
        <Tabs
          value={contextMode}
          onValueChange={(v) => onContextModeChange(v as ContextMode)}
          className="flex-shrink-0"
        >
          <TabsList className="h-9">
            <TabsTrigger value="module" className="gap-1.5 px-3">
              <Layers className="h-4 w-4" />
              Module
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-1.5 px-3">
              <BookOpen className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Separator orientation="vertical" className="h-8" />

        {/* Cascading Selectors - based on mode */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {contextMode === "module" ? (
            <>
              {/* Module Selector */}
              <div className="w-48">
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

              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

              {/* Feature Selector */}
              <div className="w-56">
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
            <>
              {/* Manual Selector */}
              <div className="w-56">
                <Select value={selectedManualId} onValueChange={onManualChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a manual" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingManuals ? (
                      <div className="p-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      manuals.map((manual) => (
                        <SelectItem key={manual.id} value={manual.id}>
                          {manual.manual_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

              {/* Chapter Selector */}
              <div className="w-48">
                <Select
                  value={selectedChapter}
                  onValueChange={onChapterChange}
                  disabled={!selectedManualId}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSections ? (
                      <div className="p-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    ) : chapters.length === 0 && selectedManualId ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No chapters found
                      </div>
                    ) : (
                      chapters.map((ch) => (
                        <SelectItem key={ch.chapterNumber} value={ch.chapterNumber}>
                          Ch {ch.chapterNumber}: {ch.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

              {/* Section Selector */}
              <div className="w-56">
                <Select
                  value={selectedSectionId}
                  onValueChange={onSectionChange}
                  disabled={!selectedChapter}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionsForChapter.length === 0 && selectedChapter ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No sections in chapter
                      </div>
                    ) : (
                      sectionsForChapter.map((sec) => (
                        <SelectItem key={sec.id} value={sec.id}>
                          {sec.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Initialize Sections Button */}
              {selectedManualId && chapters.length === 0 && onInitializeSections && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onInitializeSections}
                  disabled={isInitializing}
                  className="flex-shrink-0"
                >
                  {isInitializing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Initialize
                </Button>
              )}
            </>
          )}
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Coverage Indicator */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {analysis ? (
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Coverage</span>
                  <span className={cn("font-semibold", getCoverageColor(analysis.coveragePercentage))}>
                    {analysis.coveragePercentage}%
                  </span>
                </div>
                <Progress
                  value={analysis.coveragePercentage}
                  className={cn("h-1.5", getCoverageProgressClass(analysis.coveragePercentage))}
                />
              </div>
              {analysis.undocumented > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {analysis.undocumented} gaps
                </Badge>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground min-w-[120px]">
              Click Analyze to check coverage
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            size="sm"
            className="flex-shrink-0"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            Analyze
          </Button>
        </div>
      </div>
    </div>
  );
}
