import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { ContextAnalysis } from "@/hooks/useContentCreationAgent";
import { ApplicationModule, ApplicationFeature } from "@/hooks/useApplicationFeatures";
import { cn } from "@/lib/utils";
import { markdownToHtml } from "@/lib/utils/markdown";

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
}: AgentContextPanelProps) {
  // Filter features by selected module
  const filteredFeatures = selectedModule
    ? features.filter(f => {
        const mod = modules.find(m => m.id === f.module_id);
        return mod?.module_code === selectedModule;
      })
    : features;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Context Selectors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Module</label>
            <Select value={selectedModule} onValueChange={onModuleChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All modules</SelectItem>
                {modules.map((mod) => (
                  <SelectItem key={mod.id} value={mod.module_code}>
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
                <SelectItem value="">No specific feature</SelectItem>
                {filteredFeatures.slice(0, 50).map((feat) => (
                  <SelectItem key={feat.id} value={feat.feature_code}>
                    {feat.feature_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Stats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Coverage
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshAnalysis}
              disabled={isLoading}
              className="h-7 w-7 p-0"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis ? (
            <>
              {/* Overall Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Coverage</span>
                  <span className="font-medium">{analysis.coveragePercentage}%</span>
                </div>
                <Progress value={analysis.coveragePercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{analysis.documented} documented</span>
                  <span>{analysis.undocumented} gaps</span>
                </div>
              </div>

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
                            onClick={() => onModuleChange(code)}
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
            </>
          ) : (
            <div className="text-center py-6">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Click refresh to analyze coverage
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
