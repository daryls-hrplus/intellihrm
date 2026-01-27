import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Search,
  Files,
  MessageSquare,
  GraduationCap,
  Mic,
  BarChart3,
  Shield,
  RefreshCw,
  Loader2,
  HelpCircle,
  Brain,
  GitCompare,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  GapAnalysisRenderer,
  ChangeDetectionRenderer,
  FAQRenderer,
  IntegrationAnalysisRenderer,
  GenericResultsRenderer,
} from "@/components/enablement/AIToolsResultsRenderer";
import { ChangeReportRenderer } from "@/components/enablement/ChangeReportRenderer";

interface AIToolsPanelProps {
  onResultGenerated?: (result: unknown) => void;
}

export function AIToolsPanel({ onResultGenerated }: AIToolsPanelProps) {
  const [activeTool, setActiveTool] = useState("gap-analysis");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<unknown>(null);
  const [moduleFilter, setModuleFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const runAnalysis = async (functionName: string, payload: Record<string, unknown>) => {
    setIsLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (error) throw error;
      setResults(data);
      onResultGenerated?.(data);
      toast.success("Analysis complete!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to run analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const tools = [
    {
      id: "generate-all-docs",
      name: "Generate All Feature Docs",
      description: "Bulk generate documentation for all features",
      icon: Files,
      priority: "High",
      color: "text-emerald-500",
    },
    {
      id: "change-report",
      name: "Application Change Report",
      description: "Track UI and backend changes with dates",
      icon: GitCompare,
      priority: "High",
      color: "text-orange-500",
    },
    {
      id: "gap-analysis",
      name: "Content Gap Analysis",
      description: "Scan features and identify documentation gaps",
      icon: Search,
      priority: "High",
      color: "text-blue-500",
    },
    {
      id: "change-detection",
      name: "Change Detection",
      description: "Detect features needing documentation updates",
      icon: RefreshCw,
      priority: "High",
      color: "text-amber-500",
    },
    {
      id: "contextual-help",
      name: "Contextual Help Generator",
      description: "Generate tooltips, walkthroughs, and help text",
      icon: HelpCircle,
      priority: "High",
      color: "text-green-500",
    },
    {
      id: "faq-generator",
      name: "FAQ Generator",
      description: "Convert support tickets into FAQ entries",
      icon: MessageSquare,
      priority: "Medium",
      color: "text-purple-500",
    },
    {
      id: "learning-path",
      name: "Learning Path Optimizer",
      description: "Create personalized learning paths by role",
      icon: GraduationCap,
      priority: "Medium",
      color: "text-cyan-500",
    },
    {
      id: "voiceover-script",
      name: "Voice-Over Script Generator",
      description: "Generate narration scripts for training videos",
      icon: Mic,
      priority: "Medium",
      color: "text-pink-500",
    },
    {
      id: "content-scorer",
      name: "Content Effectiveness Scorer",
      description: "Analyze documentation quality and improvements",
      icon: BarChart3,
      priority: "Low",
      color: "text-indigo-500",
    },
    {
      id: "compliance-detector",
      name: "Compliance Impact Detector",
      description: "Flag compliance-related changes",
      icon: Shield,
      priority: "Low",
      color: "text-red-500",
    },
    {
      id: "integration-analysis",
      name: "Cross-Module Integration",
      description: "Analyze and suggest module integrations",
      icon: Brain,
      priority: "Medium",
      color: "text-cyan-500",
    },
  ];

  const activeTodTool = tools.find(t => t.id === activeTool);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Tool Selection Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Tools
          </CardTitle>
          <CardDescription>11 automation tools</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTool(tool.id);
                      setResults(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${tool.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {tool.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${
                          tool.priority === "High"
                            ? "border-red-500/30 text-red-600"
                            : tool.priority === "Medium"
                            ? "border-amber-500/30 text-amber-600"
                            : "border-green-500/30 text-green-600"
                        }`}
                      >
                        {tool.priority}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <Card className="lg:col-span-3">
        <CardContent className="p-6">
          {/* Generate All Feature Docs */}
          {activeTool === "generate-all-docs" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Files className="h-5 w-5 text-emerald-500" />
                  Generate All Feature Documents
                </h2>
                <p className="text-muted-foreground mt-1">
                  Bulk generate documentation for all features in a module.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Filter by Module</Label>
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All modules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      <SelectItem value="workforce">Workforce</SelectItem>
                      <SelectItem value="leave">Leave Management</SelectItem>
                      <SelectItem value="payroll">Payroll</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="recruitment">Recruitment</SelectItem>
                      <SelectItem value="time_attendance">Time & Attendance</SelectItem>
                      <SelectItem value="benefits">Benefits</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-600">Bulk Generation Notice</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will generate documentation for multiple features. The process may take several minutes.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => runAnalysis("generate-all-feature-docs", { moduleCode: moduleFilter })}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Files className="h-4 w-4 mr-2" />
                )}
                Generate All Documents
              </Button>
            </div>
          )}

          {/* Gap Analysis */}
          {activeTool === "gap-analysis" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  Content Gap Analysis
                </h2>
                <p className="text-muted-foreground mt-1">
                  Scan all features and identify which ones lack documentation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Filter by Module</Label>
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All modules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      <SelectItem value="workforce">Workforce</SelectItem>
                      <SelectItem value="leave">Leave Management</SelectItem>
                      <SelectItem value="payroll">Payroll</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="recruitment">Recruitment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => runAnalysis("analyze-content-gaps", { moduleCode: moduleFilter })}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Run Gap Analysis
              </Button>
            </div>
          )}

          {/* Change Detection */}
          {activeTool === "change-detection" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-500" />
                  Change Detection
                </h2>
                <p className="text-muted-foreground mt-1">
                  Detect features that have been updated since their documentation was last modified.
                </p>
              </div>

              <Button
                onClick={() => runAnalysis("detect-feature-changes", {})}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Scan for Changes
              </Button>
            </div>
          )}

          {/* Change Report */}
          {activeTool === "change-report" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-orange-500" />
                  Application Change Report
                </h2>
                <p className="text-muted-foreground mt-1">
                  Generate a dated report of all UI and backend changes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Leave dates empty to scan the last 30 days by default.
              </p>

              <Button
                onClick={() => runAnalysis("application-change-report", { 
                  startDate: startDate || undefined, 
                  endDate: endDate || undefined 
                })}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <GitCompare className="h-4 w-4 mr-2" />
                )}
                Generate Change Report
              </Button>
            </div>
          )}

          {/* Other tools - Coming Soon */}
          {!["generate-all-docs", "gap-analysis", "change-detection", "change-report"].includes(activeTool) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {activeTodTool && (
                <>
                  <activeTodTool.icon className={`h-12 w-12 mb-4 ${activeTodTool.color}`} />
                  <h3 className="font-medium">{activeTodTool.name}</h3>
                </>
              )}
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                This AI tool is currently under development. Check back soon for updates.
              </p>
            </div>
          )}

          {/* Results Area */}
          {results && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Results</h3>
              {activeTool === "gap-analysis" && <GapAnalysisRenderer data={results as Parameters<typeof GapAnalysisRenderer>[0]['data']} />}
              {activeTool === "change-detection" && <ChangeDetectionRenderer data={results as Parameters<typeof ChangeDetectionRenderer>[0]['data']} />}
              {activeTool === "faq-generator" && <FAQRenderer data={results as Parameters<typeof FAQRenderer>[0]['data']} />}
              {activeTool === "integration-analysis" && <IntegrationAnalysisRenderer data={results as Parameters<typeof IntegrationAnalysisRenderer>[0]['data']} />}
              {activeTool === "change-report" && <ChangeReportRenderer data={results as Parameters<typeof ChangeReportRenderer>[0]['data']} />}
              {!["gap-analysis", "change-detection", "faq-generator", "integration-analysis", "change-report"].includes(activeTool) && (
                <GenericResultsRenderer data={results} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
