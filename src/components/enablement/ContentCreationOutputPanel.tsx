import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  BarChart3,
  Copy,
  Save,
  AlertCircle,
  Clock,
  ChevronRight,
  FileX,
  FileQuestion,
  Rocket,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { GapAnalysis, GapSummary, ContextAnalysis } from "@/hooks/useContentCreationAgent";
import { ApplicationModule } from "@/hooks/useApplicationFeatures";
import { ContextMode } from "./AgentContextPanel";
import { cn } from "@/lib/utils";
import { markdownToHtml } from "@/lib/utils/markdown";

interface ContentCreationOutputPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  // Preview
  previewContent: string;
  previewTitle: string;
  onSaveContent?: () => void;
  onCopyContent?: () => void;
  // Gap Analysis
  gapAnalysis: { gaps: GapAnalysis; summary: GapSummary } | null;
  isLoadingGaps: boolean;
  onGenerateForGap: (featureCode: string, type: 'kb' | 'manual' | 'sop') => void;
  onRefreshGaps: (moduleCode?: string) => void;
  modules: ApplicationModule[];
  selectedModule: string;
  onModuleChange: (code: string) => void;
  // Details
  analysis: ContextAnalysis | null;
  contextMode: ContextMode;
  onDrillIntoModule: (moduleCode: string) => void;
}

export function ContentCreationOutputPanel({
  activeTab,
  onTabChange,
  previewContent,
  previewTitle,
  onSaveContent,
  onCopyContent,
  gapAnalysis,
  isLoadingGaps,
  onGenerateForGap,
  onRefreshGaps,
  modules,
  selectedModule,
  onModuleChange,
  analysis,
  contextMode,
  onDrillIntoModule,
}: ContentCreationOutputPanelProps) {
  const summary = gapAnalysis?.summary;
  const gaps = gapAnalysis?.gaps;

  const totalGaps = summary
    ? summary.undocumentedFeatures +
      summary.missingKBArticles +
      summary.missingQuickStarts +
      summary.missingSOPs +
      summary.orphanedDocumentation
    : 0;

  const gapCategories = summary ? [
    {
      id: "undocumented",
      label: "Undocumented",
      count: summary.undocumentedFeatures,
      icon: FileX,
      bgColor: "bg-[hsl(var(--semantic-error-bg))]",
      textColor: "text-[hsl(var(--semantic-error-text))]",
      items: gaps?.noDocumentation || [],
    },
    {
      id: "missing-kb",
      label: "Missing KB",
      count: summary.missingKBArticles,
      icon: FileQuestion,
      bgColor: "bg-[hsl(var(--semantic-warning-bg))]",
      textColor: "text-[hsl(var(--semantic-warning-text))]",
      items: gaps?.noKBArticle || [],
    },
    {
      id: "no-quickstart",
      label: "No Quick Start",
      count: summary.missingQuickStarts,
      icon: Rocket,
      bgColor: "bg-[hsl(var(--semantic-info-bg))]",
      textColor: "text-[hsl(var(--semantic-info-text))]",
      items: gaps?.noQuickStart || [],
    },
    {
      id: "missing-sop",
      label: "Missing SOP",
      count: summary.missingSOPs,
      icon: ClipboardList,
      bgColor: "bg-[hsl(var(--semantic-neutral-bg))]",
      textColor: "text-[hsl(var(--semantic-neutral-text))]",
      items: gaps?.noSOP || [],
    },
  ] : [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-0 flex-shrink-0">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="preview" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Preview
              {previewContent && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-1">
                  1
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="gaps" className="gap-1.5">
              <Search className="h-4 w-4" />
              Gaps
              {totalGaps > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs ml-1">
                  {totalGaps}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Details
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <Separator className="mt-3" />

      <CardContent className="flex-1 min-h-0 p-0">
        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div className="flex flex-col h-full">
            {previewContent ? (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{previewTitle}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {onCopyContent && (
                      <Button variant="ghost" size="sm" onClick={onCopyContent}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    )}
                    {onSaveContent && (
                      <Button size="sm" onClick={onSaveContent}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    )}
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div
                    className="p-4 prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(previewContent) }}
                  />
                </ScrollArea>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">No content generated yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use quick actions or chat to generate documentation
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gaps Tab */}
        {activeTab === "gaps" && (
          <div className="flex flex-col h-full">
            {/* Gap Filter Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Filter:</span>
                <Select value={selectedModule || "__all__"} onValueChange={onModuleChange}>
                  <SelectTrigger className="h-7 w-40 text-xs">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRefreshGaps(selectedModule === "__all__" ? undefined : selectedModule)}
                disabled={isLoadingGaps}
                className="h-7"
              >
                {isLoadingGaps ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>

            <ScrollArea className="flex-1">
              {isLoadingGaps ? (
                <div className="flex items-center justify-center h-full p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !gapAnalysis ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">No gap analysis yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Find Gaps" in quick actions to analyze
                  </p>
                </div>
              ) : totalGaps === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-green-600">All documented!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No gaps found in the selected scope
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {gapCategories.filter(c => c.count > 0).map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <div
                          key={cat.id}
                          className={cn("p-3 rounded-lg", cat.bgColor)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={cn("h-4 w-4", cat.textColor)} />
                            <span className={cn("text-xl font-bold", cat.textColor)}>
                              {cat.count}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{cat.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Orphaned Warning */}
                  {summary && summary.orphanedDocumentation > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--semantic-warning-bg))] border border-[hsl(var(--semantic-warning-border))]">
                      <AlertTriangle className="h-4 w-4 text-[hsl(var(--semantic-warning-text))] flex-shrink-0" />
                      <span className="text-xs text-[hsl(var(--semantic-warning-text))]">
                        {summary.orphanedDocumentation} orphaned doc(s) referencing invalid features
                      </span>
                    </div>
                  )}

                  {/* Gap Items by Category */}
                  {gapCategories.filter(c => c.count > 0 && c.items.length > 0).map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <cat.icon className={cn("h-4 w-4", cat.textColor)} />
                        <span className="text-sm font-medium">{cat.label}</span>
                        <Badge variant="secondary" className="h-5 text-xs">
                          {cat.items.length}
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        {cat.items.slice(0, 5).map((item) => (
                          <div
                            key={item.feature_code}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{item.feature_name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.module_name}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs flex-shrink-0"
                              onClick={() => onGenerateForGap(
                                item.feature_code,
                                cat.id === "undocumented" ? "manual" :
                                cat.id === "missing-kb" ? "kb" :
                                cat.id === "missing-sop" ? "sop" : "manual"
                              )}
                            >
                              Generate
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        ))}
                        {cat.items.length > 5 && (
                          <p className="text-xs text-muted-foreground text-center py-1">
                            +{cat.items.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <ScrollArea className="h-full">
            {analysis ? (
              <div className="p-4 space-y-4">
                {/* Readiness Score */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Readiness Score</p>
                    <p className="text-xs text-muted-foreground">Based on coverage & freshness</p>
                  </div>
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      analysis.readinessScore >= 80
                        ? "text-green-500"
                        : analysis.readinessScore >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                    )}
                  >
                    {analysis.readinessScore}
                  </div>
                </div>

                {/* Coverage Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-primary">{analysis.totalFeatures}</p>
                    <p className="text-xs text-muted-foreground">Total Features</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-green-500">{analysis.documented}</p>
                    <p className="text-xs text-muted-foreground">Documented</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-red-500">{analysis.undocumented}</p>
                    <p className="text-xs text-muted-foreground">Gaps</p>
                  </div>
                </div>

                {/* Module Breakdown */}
                {Object.entries(analysis.moduleBreakdown).length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">By Module</p>
                    <div className="space-y-2">
                      {Object.entries(analysis.moduleBreakdown)
                        .sort(([, a], [, b]) => b.percentage - a.percentage)
                        .map(([code, data]) => (
                          <div key={code} className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="truncate">{data.moduleName}</span>
                                <span className="text-muted-foreground">{data.percentage}%</span>
                              </div>
                              <Progress value={data.percentage} className="h-1.5" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => onDrillIntoModule(code)}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recommendations</p>
                    <div className="space-y-1.5">
                      {analysis.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-muted/30">
                          <AlertCircle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stale Content Warning */}
                {analysis.staleContent.length > 0 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        {analysis.staleContent.length} items need refresh
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Content older than 90 days may be outdated
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">No analysis data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click "Analyze" in the scope bar to get details
                </p>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
