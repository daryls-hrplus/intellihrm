import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  Calendar,
  RefreshCw,
  MessageSquare,
  HelpCircle,
  Clock,
  User,
  Settings,
  Database,
  Code,
  Plus,
  Edit,
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
  dateRange?: { start: string; end: string };
  summary?: {
    ui: number;
    backend: number;
    database: number;
    edge_function: number;
    total: number;
  };
  changesByDate?: Record<string, any[]>;
  changes?: any[];
}

interface ChangeDetectionResult {
  changedFeatures?: Array<{
    feature_code: string;
    feature_name: string;
    module_code: string;
    module_name: string;
    updated_at: string;
    hasContent: boolean;
  }>;
  analysis?: {
    changes?: Array<{
      feature_code: string;
      change_type: string;
      severity: string;
      suggested_updates: string[];
      estimated_effort: string;
    }>;
    summary?: string;
    priority_order?: string[];
  };
}

interface FAQResult {
  faqs?: Array<{
    question: string;
    answer: string;
    category: string;
    keywords?: string[];
    ticket_count?: number;
    priority?: string;
  }>;
  ticketCount?: number;
  source?: string;
  message?: string;
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

const changeTypeIcons: Record<string, React.ReactNode> = {
  Created: <Plus className="h-4 w-4 text-green-500" />,
  Updated: <Edit className="h-4 w-4 text-blue-500" />,
  new_feature: <Plus className="h-4 w-4 text-green-500" />,
  ui_change: <Settings className="h-4 w-4 text-purple-500" />,
  workflow_change: <RefreshCw className="h-4 w-4 text-amber-500" />,
  enhancement: <TrendingUp className="h-4 w-4 text-cyan-500" />,
};

const categoryIcons: Record<string, React.ReactNode> = {
  ui: <Settings className="h-4 w-4 text-purple-500" />,
  backend: <Code className="h-4 w-4 text-blue-500" />,
  database: <Database className="h-4 w-4 text-green-500" />,
  edge_function: <Zap className="h-4 w-4 text-amber-500" />,
};

export function GapAnalysisRenderer({ data }: { data: GapAnalysisResult }) {
  const { gaps, recommendations } = data;

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
                                hasIt ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
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
  const { dateRange, summary, changesByDate, changes } = data;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const sortedDates = changesByDate
    ? Object.keys(changesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Application Change Report
              </h3>
              {dateRange && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(dateRange.start)} — {formatDate(dateRange.end)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">{summary?.total || changes?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Changes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Summary */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "UI Changes", count: summary.ui, icon: categoryIcons.ui, color: "text-purple-600 bg-purple-500/10 border-purple-500/30" },
            { label: "Backend", count: summary.backend, icon: categoryIcons.backend, color: "text-blue-600 bg-blue-500/10 border-blue-500/30" },
            { label: "Database", count: summary.database, icon: categoryIcons.database, color: "text-green-600 bg-green-500/10 border-green-500/30" },
            { label: "Edge Functions", count: summary.edge_function, icon: categoryIcons.edge_function, color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
          ].map((item) => (
            <Card key={item.label} className={`border ${item.color.split(" ").slice(2).join(" ")}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color.split(" ").slice(1, 2).join(" ")}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${item.color.split(" ")[0]}`}>{item.count}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Timeline View */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Changes Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[450px]">
            {sortedDates.length > 0 ? (
              <Accordion type="multiple" className="space-y-2" defaultValue={sortedDates.slice(0, 3)}>
                {sortedDates.map((date) => {
                  const dayChanges = changesByDate![date];
                  return (
                    <AccordionItem key={date} value={date} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">{formatDate(date)}</p>
                            <p className="text-xs text-muted-foreground">{dayChanges.length} changes</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-2 pl-10">
                          {dayChanges.map((change: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                            >
                              <div className="shrink-0 mt-0.5">
                                {changeTypeIcons[change.changeType] || <Edit className="h-4 w-4 text-muted-foreground" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-sm">{change.entityName}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {change.entityType}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      change.changeType === "Created"
                                        ? "bg-green-500/10 text-green-600"
                                        : "bg-blue-500/10 text-blue-600"
                                    }`}
                                  >
                                    {change.changeType}
                                  </Badge>
                                </div>
                                {change.details && (
                                  <p className="text-xs text-muted-foreground mt-1">{change.details}</p>
                                )}
                              </div>
                              <div className="shrink-0">
                                {categoryIcons[change.category] || <Settings className="h-4 w-4 text-muted-foreground" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : changes && changes.length > 0 ? (
              <div className="space-y-2">
                {changes.map((change: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className="shrink-0 mt-0.5">
                      {changeTypeIcons[change.changeType] || <Edit className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{change.entityName}</p>
                        <Badge variant="outline" className="text-xs">{change.entityType}</Badge>
                      </div>
                      {change.details && (
                        <p className="text-xs text-muted-foreground mt-1">{change.details}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {formatDate(change.changedAt)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No changes found in the selected date range.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export function ChangeDetectionRenderer({ data }: { data: ChangeDetectionResult }) {
  const { changedFeatures, analysis } = data;

  const groupedByModule = changedFeatures?.reduce((acc, f) => {
    const key = f.module_name || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {} as Record<string, typeof changedFeatures>);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-amber-600" />
                Change Detection Results
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Features requiring documentation updates
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-amber-600">{changedFeatures?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Features Changed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {analysis?.summary && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">AI Analysis</h4>
                <p className="text-sm text-muted-foreground mt-1">{analysis.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Changes from AI */}
      {analysis?.changes && analysis.changes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Documentation Updates Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.changes.map((change, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{change.feature_code}</p>
                        <Badge className={priorityColors[change.severity] || "bg-muted"}>
                          {change.severity}
                        </Badge>
                        <Badge variant="outline">{change.change_type?.replace("_", " ")}</Badge>
                      </div>
                      {change.suggested_updates && change.suggested_updates.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {change.suggested_updates.map((update, uIdx) => (
                            <li key={uIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="h-3 w-3 mt-1 shrink-0" />
                              {update}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      Effort: {change.estimated_effort}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features by Module */}
      {groupedByModule && Object.keys(groupedByModule).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Changed Features by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Accordion type="multiple" className="space-y-2">
                {Object.entries(groupedByModule).map(([moduleName, features]) => (
                  <AccordionItem key={moduleName} value={moduleName} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{moduleName}</span>
                        <Badge variant="secondary" className="ml-2">{features?.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="space-y-2">
                        {features?.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded bg-muted/50">
                            <div>
                              <p className="font-medium text-sm">{f.feature_name}</p>
                              <p className="text-xs text-muted-foreground">{f.feature_code}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!f.hasContent && (
                                <Badge variant="destructive" className="text-xs">No Docs</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {new Date(f.updated_at).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function FAQRenderer({ data }: { data: FAQResult }) {
  const { faqs, ticketCount, source, message } = data;

  if (message && (!faqs || faqs.length === 0)) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-amber-500 opacity-50" />
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/5 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                Generated FAQ Entries
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {source === "sample" ? "Generated from sample data" : `Analyzed from ${ticketCount || 0} support tickets`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-purple-600">{faqs?.length || 0}</p>
              <p className="text-sm text-muted-foreground">FAQs Created</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            <Accordion type="single" collapsible className="px-4">
              {faqs?.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-start gap-3 text-left">
                      <div className="p-2 rounded-full bg-purple-500/10 shrink-0">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{faq.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {faq.category && (
                            <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                          )}
                          {faq.priority && (
                            <Badge className={`text-xs ${priorityColors[faq.priority] || "bg-muted"}`}>
                              {faq.priority}
                            </Badge>
                          )}
                          {faq.ticket_count && (
                            <span className="text-xs text-muted-foreground">
                              {faq.ticket_count} related tickets
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-12 pb-4">
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm whitespace-pre-wrap">{faq.answer}</p>
                      {faq.keywords && faq.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                          {faq.keywords.map((kw, kwIdx) => (
                            <Badge key={kwIdx} variant="secondary" className="text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export function IntegrationAnalysisRenderer({ data }: { data: IntegrationAnalysisResult }) {
  const { suggestions, crossModuleDependencies, recommendations } = data;

  return (
    <div className="space-y-6">
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
  if (data.content && typeof data.content === "string") {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      </div>
    );
  }

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
