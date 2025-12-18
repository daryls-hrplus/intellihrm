import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Video,
  Package,
  MousePointer,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Flag,
  Lightbulb,
  AlertCircle,
  Zap,
  Link2,
} from "lucide-react";

interface GapAnalysisResult {
  gaps: Array<{
    feature_code: string;
    feature_name: string;
    description: string;
    module_code: string;
    module_name: string;
    coverage: {
      documentation: boolean;
      scorm: boolean;
      rise: boolean;
      video: boolean;
      dap: boolean;
    };
    coverageScore: number;
    missingContent: string[];
  }>;
  recommendations?: {
    priorities?: Array<{
      feature_code: string;
      priority: string;
      reason: string;
      recommended_content_types: string[];
    }>;
    quick_wins?: string[];
    high_impact?: string[];
    summary?: string;
  };
}

interface ChangeReportResult {
  dateRange: { startDate: string; endDate: string };
  summary: {
    totalChanges: number;
    featureChanges: number;
    moduleChanges: number;
    workflowChanges: number;
    roleChanges: number;
    lookupChanges: number;
  };
  changes: {
    features: any[];
    modules: any[];
    workflows: any[];
    roles: any[];
    lookups: any[];
  };
}

interface IntegrationAnalysisResult {
  suggestions: Array<{
    source_module: string;
    target_module: string;
    integration_type: string;
    description: string;
    priority: string;
    implementation_notes: string;
  }>;
  crossModuleDependencies: any[];
  recommendations?: string;
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  documentation: <FileText className="h-4 w-4" />,
  scorm: <Package className="h-4 w-4" />,
  rise: <BookOpen className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  dap: <MousePointer className="h-4 w-4" />,
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-600 border-red-500/30",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  low: "bg-green-500/10 text-green-600 border-green-500/30",
};

export function GapAnalysisRenderer({ data }: { data: GapAnalysisResult }) {
  const { gaps, recommendations } = data;

  // Group by module
  const moduleGroups = gaps.reduce((acc, gap) => {
    const key = gap.module_name || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(gap);
    return acc;
  }, {} as Record<string, typeof gaps>);

  const criticalGaps = gaps.filter((g) => g.coverageScore < 20);
  const lowCoverageGaps = gaps.filter((g) => g.coverageScore >= 20 && g.coverageScore < 60);
  const partialGaps = gaps.filter((g) => g.coverageScore >= 60 && g.coverageScore < 100);
  const completeItems = gaps.filter((g) => g.coverageScore === 100);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{criticalGaps.length}</p>
            <p className="text-xs text-muted-foreground">Critical (0-20%)</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600">{lowCoverageGaps.length}</p>
            <p className="text-xs text-muted-foreground">Low (20-60%)</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{partialGaps.length}</p>
            <p className="text-xs text-muted-foreground">Partial (60-99%)</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{completeItems.length}</p>
            <p className="text-xs text-muted-foreground">Complete (100%)</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {recommendations && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.summary && (
              <p className="text-sm text-muted-foreground">{recommendations.summary}</p>
            )}

            {recommendations.priorities && recommendations.priorities.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm">Priority Features</h4>
                <div className="space-y-2">
                  {recommendations.priorities.slice(0, 5).map((p, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                      <Badge className={priorityColors[p.priority] || "bg-muted"}>
                        {p.priority}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{p.feature_code}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.reason}</p>
                        <div className="flex gap-1 mt-2">
                          {p.recommended_content_types?.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {recommendations.quick_wins && recommendations.quick_wins.length > 0 && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h4 className="font-medium text-sm text-green-600 mb-2 flex items-center gap-1">
                    <Zap className="h-4 w-4" /> Quick Wins
                  </h4>
                  <ul className="text-xs space-y-1">
                    {recommendations.quick_wins.slice(0, 5).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendations.high_impact && recommendations.high_impact.length > 0 && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h4 className="font-medium text-sm text-blue-600 mb-2 flex items-center gap-1">
                    <Flag className="h-4 w-4" /> High Impact
                  </h4>
                  <ul className="text-xs space-y-1">
                    {recommendations.high_impact.slice(0, 5).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features by Module */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Features by Module</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-6">
              {Object.entries(moduleGroups).map(([moduleName, features]) => (
                <div key={moduleName}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{moduleName}</h4>
                    <Badge variant="outline">{features.length} features</Badge>
                  </div>
                  <div className="space-y-2">
                    {features.map((f) => (
                      <div key={f.feature_code} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{f.feature_name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{f.feature_code}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{f.coverageScore.toFixed(0)}%</span>
                            <Progress value={f.coverageScore} className="w-20 h-2" />
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {Object.entries(f.coverage).map(([type, hasIt]) => (
                            <div
                              key={type}
                              className={`p-1.5 rounded ${
                                hasIt
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                              title={type}
                            >
                              {contentTypeIcons[type]}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export function ChangeReportRenderer({ data }: { data: ChangeReportResult }) {
  const { dateRange, summary, changes } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Application Change Report</h3>
              <p className="text-sm text-muted-foreground">
                {dateRange.startDate} to {dateRange.endDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{summary.totalChanges}</p>
              <p className="text-xs text-muted-foreground">Total Changes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Features", count: summary.featureChanges, color: "text-blue-600" },
          { label: "Modules", count: summary.moduleChanges, color: "text-purple-600" },
          { label: "Workflows", count: summary.workflowChanges, color: "text-amber-600" },
          { label: "Roles", count: summary.roleChanges, color: "text-green-600" },
          { label: "Lookups", count: summary.lookupChanges, color: "text-pink-600" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-xl font-bold ${item.color}`}>{item.count}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Changes Detail */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {changes.features && changes.features.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Feature Changes ({changes.features.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {changes.features.map((f: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{f.feature_name || f.feature_code}</p>
                        <p className="text-xs text-muted-foreground">{f.feature_code}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(f.updated_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {changes.modules && changes.modules.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Module Changes ({changes.modules.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {changes.modules.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <p className="font-medium text-sm">{m.module_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {new Date(m.updated_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {changes.workflows && changes.workflows.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  Workflow Changes ({changes.workflows.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {changes.workflows.map((w: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <p className="font-medium text-sm">{w.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {new Date(w.updated_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function IntegrationAnalysisRenderer({ data }: { data: IntegrationAnalysisResult }) {
  const { suggestions, crossModuleDependencies, recommendations } = data;

  return (
    <div className="space-y-6">
      {/* Recommendations Summary */}
      {recommendations && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">AI Analysis</h4>
                <p className="text-sm text-muted-foreground mt-1">{recommendations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Cross-Module Integration Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {suggestions.map((s, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">{s.source_module}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{s.target_module}</Badge>
                    <Badge className={priorityColors[s.priority] || "bg-muted"}>
                      {s.priority}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{s.integration_type}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                  {s.implementation_notes && (
                    <p className="text-xs text-muted-foreground mt-2 p-2 rounded bg-muted/50">
                      <strong>Implementation:</strong> {s.implementation_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dependencies */}
      {crossModuleDependencies && crossModuleDependencies.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Existing Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {crossModuleDependencies.map((dep: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <span className="font-medium text-sm">{dep.source}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-medium text-sm">{dep.target}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {dep.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function GenericResultsRenderer({ data }: { data: any }) {
  // For results that have markdown content
  if (data.content && typeof data.content === "string") {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      </div>
    );
  }

  // For structured results with a summary
  if (data.summary || data.analysis) {
    return (
      <div className="space-y-4">
        {data.summary && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">{data.summary}</p>
            </CardContent>
          </Card>
        )}
        {data.analysis && (
          <Card>
            <CardContent className="p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {typeof data.analysis === "string" ? data.analysis : JSON.stringify(data.analysis, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Fallback to formatted JSON
  return (
    <Card>
      <CardContent className="p-4">
        <pre className="text-sm whitespace-pre-wrap font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
