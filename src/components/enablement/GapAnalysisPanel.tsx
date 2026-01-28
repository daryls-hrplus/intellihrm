import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileX,
  FileQuestion,
  Rocket,
  ClipboardList,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GapAnalysis, GapSummary } from "@/hooks/useContentCreationAgent";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GapAnalysisPanelProps {
  gaps: GapAnalysis | null;
  summary: GapSummary | null;
  isLoading: boolean;
  onGenerateForFeature: (featureCode: string, type: 'kb' | 'manual' | 'sop') => void;
  onRefresh: () => void;
  onDismiss: () => void;
}

interface GapItemProps {
  featureCode: string;
  featureName: string;
  moduleName?: string;
  onGenerateManual?: () => void;
  onGenerateKB?: () => void;
  onGenerateSOP?: () => void;
}

function GapItem({
  featureCode,
  featureName,
  moduleName,
  onGenerateManual,
  onGenerateKB,
  onGenerateSOP,
}: GapItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{featureName}</p>
        {moduleName && (
          <p className="text-xs text-muted-foreground truncate">{moduleName}</p>
        )}
        <p className="text-xs text-muted-foreground/60 font-mono">{featureCode}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0 ml-2">
        {onGenerateManual && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onGenerateManual}
            className="h-7 w-7 p-0"
            title="Generate Manual Section"
          >
            <BookOpen className="h-3.5 w-3.5" />
          </Button>
        )}
        {onGenerateKB && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onGenerateKB}
            className="h-7 w-7 p-0"
            title="Generate KB Article"
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
        )}
        {onGenerateSOP && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onGenerateSOP}
            className="h-7 w-7 p-0"
            title="Generate SOP"
          >
            <ClipboardList className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface OrphanedItemProps {
  sectionNumber: string;
  sectionTitle: string;
  manualCode: string;
  orphanedCodes: string[];
  actionRequired: string;
}

function OrphanedItem({
  sectionNumber,
  sectionTitle,
  manualCode,
  orphanedCodes,
  actionRequired,
}: OrphanedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="p-2 rounded-lg border bg-card">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="text-left min-w-0">
              <p className="text-sm font-medium truncate">
                {sectionNumber}. {sectionTitle}
              </p>
              <p className="text-xs text-muted-foreground">{manualCode}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                {orphanedCodes.length} invalid
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 pt-2 border-t">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Invalid Feature Codes:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {orphanedCodes.map((code) => (
                  <Badge key={code} variant="outline" className="text-xs font-mono">
                    {code}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Action Required:</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">{actionRequired}</p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function GapAnalysisPanel({
  gaps,
  summary,
  isLoading,
  onGenerateForFeature,
  onRefresh,
  onDismiss,
}: GapAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState("undocumented");

  const categories = [
    {
      id: "undocumented",
      label: "Undocumented",
      count: summary?.undocumentedFeatures || 0,
      icon: FileX,
      color: "text-red-500",
    },
    {
      id: "noKB",
      label: "Missing KB",
      count: summary?.missingKBArticles || 0,
      icon: FileQuestion,
      color: "text-orange-500",
    },
    {
      id: "noQuickStart",
      label: "No Quick Start",
      count: summary?.missingQuickStarts || 0,
      icon: Rocket,
      color: "text-blue-500",
    },
    {
      id: "noSOP",
      label: "Missing SOP",
      count: summary?.missingSOPs || 0,
      icon: ClipboardList,
      color: "text-purple-500",
    },
    {
      id: "orphaned",
      label: "Orphaned",
      count: summary?.orphanedDocumentation || 0,
      icon: AlertTriangle,
      color: "text-yellow-500",
    },
  ];

  const totalGaps = categories.reduce((sum, cat) => sum + cat.count, 0);

  if (!gaps && !isLoading) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="text-base">Gap Analysis</CardTitle>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Analyzing..." : `${totalGaps} total gaps found`}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-7 w-7 p-0"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-7 w-7 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Scanning for gaps...</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Badge
                    key={cat.id}
                    variant={activeTab === cat.id ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      activeTab === cat.id && "bg-primary"
                    )}
                    onClick={() => setActiveTab(cat.id)}
                  >
                    <Icon className={cn("h-3 w-3 mr-1", activeTab !== cat.id && cat.color)} />
                    {cat.label} ({cat.count})
                  </Badge>
                );
              })}
            </div>

            {/* Undocumented Features */}
            <TabsContent value="undocumented" className="mt-0">
              <ScrollArea className="h-[280px]">
                {gaps?.noDocumentation && gaps.noDocumentation.length > 0 ? (
                  <div className="space-y-2">
                    {gaps.noDocumentation.map((gap) => (
                      <GapItem
                        key={gap.feature_code}
                        featureCode={gap.feature_code}
                        featureName={gap.feature_name}
                        moduleName={gap.module_name}
                        onGenerateManual={() => onGenerateForFeature(gap.feature_code, 'manual')}
                        onGenerateKB={() => onGenerateForFeature(gap.feature_code, 'kb')}
                        onGenerateSOP={() => onGenerateForFeature(gap.feature_code, 'sop')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileX className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No undocumented features</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Missing KB Articles */}
            <TabsContent value="noKB" className="mt-0">
              <ScrollArea className="h-[280px]">
                {gaps?.noKBArticle && gaps.noKBArticle.length > 0 ? (
                  <div className="space-y-2">
                    {gaps.noKBArticle.map((gap) => (
                      <GapItem
                        key={gap.feature_code}
                        featureCode={gap.feature_code}
                        featureName={gap.feature_name}
                        onGenerateKB={() => onGenerateForFeature(gap.feature_code, 'kb')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileQuestion className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">All features have KB articles</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Missing Quick Starts */}
            <TabsContent value="noQuickStart" className="mt-0">
              <ScrollArea className="h-[280px]">
                {gaps?.noQuickStart && gaps.noQuickStart.length > 0 ? (
                  <div className="space-y-2">
                    {gaps.noQuickStart.map((gap) => (
                      <div
                        key={gap.module_code}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card"
                      >
                        <div>
                          <p className="text-sm font-medium">{gap.module_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {gap.module_code}
                          </p>
                        </div>
                        <Button size="sm" variant="secondary">
                          <Rocket className="h-3.5 w-3.5 mr-1" />
                          Generate
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Rocket className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">All modules have quick starts</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Missing SOPs */}
            <TabsContent value="noSOP" className="mt-0">
              <ScrollArea className="h-[280px]">
                {gaps?.noSOP && gaps.noSOP.length > 0 ? (
                  <div className="space-y-2">
                    {gaps.noSOP.map((gap) => (
                      <GapItem
                        key={gap.feature_code}
                        featureCode={gap.feature_code}
                        featureName={gap.feature_name}
                        onGenerateSOP={() => onGenerateForFeature(gap.feature_code, 'sop')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">All features have SOPs</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Orphaned Documentation */}
            <TabsContent value="orphaned" className="mt-0">
              <ScrollArea className="h-[280px]">
                {gaps?.orphanedDocumentation && gaps.orphanedDocumentation.length > 0 ? (
                  <div className="space-y-2">
                    {gaps.orphanedDocumentation.map((orphan, idx) => (
                      <OrphanedItem
                        key={idx}
                        sectionNumber={orphan.section_number}
                        sectionTitle={orphan.section_title}
                        manualCode={orphan.manual_code}
                        orphanedCodes={orphan.orphaned_codes}
                        actionRequired={orphan.action_required}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No orphaned documentation</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
