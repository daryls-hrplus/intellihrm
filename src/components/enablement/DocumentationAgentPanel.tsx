import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bot,
  Scan,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
  FolderSearch,
  Zap,
} from "lucide-react";
import { useDocumentationAgent } from "@/hooks/useDocumentationAgent";
import { useApplicationModules } from "@/hooks/useApplicationFeatures";

interface DocumentationAgentPanelProps {
  onGenerateComplete?: (content: string, feature: { feature_code: string; feature_name: string }) => void;
}

export function DocumentationAgentPanel({ onGenerateComplete }: DocumentationAgentPanelProps) {
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("analyze");
  const [generatingFeature, setGeneratingFeature] = useState<string | null>(null);
  
  const { modules } = useApplicationModules();
  const {
    isAnalyzing,
    isGenerating,
    analysis,
    coverageAssessment,
    bulkCandidates,
    analyzeSchema,
    assessCoverage,
    getBulkCandidates,
    generateKBArticle,
  } = useDocumentationAgent();

  const handleAnalyze = async () => {
    await analyzeSchema(selectedModule === "all" ? undefined : selectedModule);
  };

  const handleAssessCoverage = async () => {
    await assessCoverage();
  };

  const handleGetCandidates = async () => {
    await getBulkCandidates(selectedModule === "all" ? undefined : selectedModule);
  };

  const handleGenerateArticle = async (featureCode: string) => {
    setGeneratingFeature(featureCode);
    const result = await generateKBArticle(featureCode);
    setGeneratingFeature(null);
    
    if (result?.article && onGenerateComplete) {
      onGenerateComplete(result.article.content, {
        feature_code: result.feature_code,
        feature_name: result.article.title,
      });
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Documentation Agent</CardTitle>
              <CardDescription>
                AI-powered schema analysis and documentation generation
              </CardDescription>
            </div>
          </div>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map((mod) => (
                <SelectItem key={mod.id} value={mod.module_code}>
                  {mod.module_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze" className="gap-2">
              <Scan className="h-4 w-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="coverage" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Coverage
            </TabsTrigger>
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </TabsTrigger>
          </TabsList>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FolderSearch className="h-4 w-4 mr-2" />
                )}
                Analyze Schema
              </Button>
            </div>

            {analysis && (
              <div className="space-y-4 pt-4 border-t">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{analysis.totalFeatures}</p>
                    <p className="text-xs text-muted-foreground">Total Features</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[hsl(var(--semantic-success-bg))]">
                    <p className="text-2xl font-bold text-[hsl(var(--semantic-success-text))]">
                      {analysis.documented}
                    </p>
                    <p className="text-xs text-muted-foreground">Documented</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[hsl(var(--semantic-warning-bg))]">
                    <p className="text-2xl font-bold text-[hsl(var(--semantic-warning-text))]">
                      {analysis.undocumented}
                    </p>
                    <p className="text-xs text-muted-foreground">Gaps</p>
                  </div>
                </div>

                {/* Coverage Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Documentation Coverage</span>
                    <span className="font-medium">{analysis.coveragePercentage}%</span>
                  </div>
                  <Progress value={analysis.coveragePercentage} />
                </div>

                {/* Priority Features */}
                {analysis.priorityFeatures.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-[hsl(var(--semantic-warning-text))]" />
                      Priority Documentation Gaps
                    </h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {analysis.priorityFeatures.slice(0, 10).map((feature) => (
                          <div 
                            key={feature.feature_code}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                          >
                            <div>
                              <p className="text-sm font-medium">{feature.feature_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {feature.module_code} • {feature.feature_code}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleGenerateArticle(feature.feature_code)}
                              disabled={isGenerating && generatingFeature === feature.feature_code}
                            >
                              {isGenerating && generatingFeature === feature.feature_code ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Zap className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Coverage Tab */}
          <TabsContent value="coverage" className="space-y-4">
            <Button 
              onClick={handleAssessCoverage} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Assess Full Coverage
            </Button>

            {coverageAssessment && (
              <div className="space-y-4 pt-4 border-t">
                {/* Readiness Score */}
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Readiness Score</p>
                  <p className={`text-4xl font-bold ${
                    coverageAssessment.readinessScore >= 80 
                      ? 'text-[hsl(var(--semantic-success-text))]'
                      : coverageAssessment.readinessScore >= 60 
                        ? 'text-[hsl(var(--semantic-warning-text))]'
                        : 'text-[hsl(var(--semantic-error-text))]'
                  }`}>
                    {coverageAssessment.readinessScore}%
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border">
                    <p className="text-lg font-bold">{coverageAssessment.overallCoverage}%</p>
                    <p className="text-xs text-muted-foreground">Feature Coverage</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-lg font-bold">{coverageAssessment.publishedArticles}</p>
                    <p className="text-xs text-muted-foreground">KB Articles</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-lg font-bold">{coverageAssessment.publishedQuickstarts}</p>
                    <p className="text-xs text-muted-foreground">Quick Starts</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-lg font-bold">
                      {coverageAssessment.documented}/{coverageAssessment.totalFeatures}
                    </p>
                    <p className="text-xs text-muted-foreground">Features Documented</p>
                  </div>
                </div>

                {/* Module Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Coverage by Module</h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {Object.entries(coverageAssessment.moduleBreakdown).map(([code, data]) => (
                        <div key={code} className="flex items-center gap-3">
                          <span className="text-xs font-mono w-24 truncate">{code}</span>
                          <Progress value={data.percentage} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {data.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4">
            <Button 
              onClick={handleGetCandidates} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Find Undocumented Features
            </Button>

            {bulkCandidates.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Ready to Generate ({bulkCandidates.length} features)
                  </h4>
                  <Badge variant="outline">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {bulkCandidates.map((candidate) => (
                      <div 
                        key={candidate.feature_code}
                        className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{candidate.feature_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {candidate.module_name}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleGenerateArticle(candidate.feature_code)}
                          disabled={isGenerating}
                        >
                          {isGenerating && generatingFeature === candidate.feature_code ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
