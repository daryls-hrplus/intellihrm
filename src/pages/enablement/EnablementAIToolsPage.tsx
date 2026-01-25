import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
  FileText,
  MessageSquare,
  GraduationCap,
  Mic,
  BarChart3,
  Shield,
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Wand2,
  HelpCircle,
  Brain,
  Files,
  GitCompare,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { marked } from "marked";
import {
  GapAnalysisRenderer,
  ChangeDetectionRenderer,
  FAQRenderer,
  IntegrationAnalysisRenderer,
  GenericResultsRenderer,
} from "@/components/enablement/AIToolsResultsRenderer";
import { ChangeReportRenderer } from "@/components/enablement/ChangeReportRenderer";
import { useTabState } from "@/hooks/useTabState";

export default function EnablementAIToolsPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Tab state persistence
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "gap-analysis",
      moduleFilter: "all",
      featureCode: "",
      contentToAnalyze: "",
      roleCode: "",
      learningGoals: "",
      startDate: "",
      endDate: "",
    },
  });

  const runAnalysis = async (functionName: string, payload: any) => {
    setIsLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (error) throw error;
      setResults(data);
      toast.success("Analysis complete!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to run analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content, { breaks: true, async: false }) as string;
    return { __html: html };
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
      description: "Detect feature changes needing documentation updates",
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
      description: "Analyze documentation quality and get improvements",
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

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "AI Automation Tools" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              AI Automation Tools
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered tools to automate content creation and analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tool Selection Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Available Tools</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-2">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = tabState.activeTab === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setTabState({ activeTab: tool.id });
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
                            <p className="text-xs text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
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
              {tabState.activeTab === "generate-all-docs" && (
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
                      <Select value={tabState.moduleFilter} onValueChange={(v) => setTabState({ moduleFilter: v })}>
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
                    onClick={() => runAnalysis("generate-all-feature-docs", { moduleCode: tabState.moduleFilter })}
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
              {tabState.activeTab === "gap-analysis" && (
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
                      <Select value={tabState.moduleFilter} onValueChange={(v) => setTabState({ moduleFilter: v })}>
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
                    onClick={() => runAnalysis("analyze-content-gaps", { moduleCode: tabState.moduleFilter })}
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
              {tabState.activeTab === "change-detection" && (
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
              {tabState.activeTab === "change-report" && (
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
                        value={tabState.startDate}
                        onChange={(e) => setTabState({ startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={tabState.endDate}
                        onChange={(e) => setTabState({ endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Leave dates empty to scan the last 30 days by default.
                  </p>

                  <Button
                    onClick={() => runAnalysis("application-change-report", { 
                      startDate: tabState.startDate || undefined, 
                      endDate: tabState.endDate || undefined 
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

              {/* Other tools - simplified display */}
              {!["generate-all-docs", "gap-analysis", "change-detection", "change-report"].includes(tabState.activeTab) && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium">Tool Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    This AI tool is currently under development. Check back soon for updates.
                  </p>
                </div>
              )}

              {/* Results Area */}
              {results && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Analysis Results
                  </h3>
                  {tabState.activeTab === "gap-analysis" && <GapAnalysisRenderer data={results} />}
                  {tabState.activeTab === "change-detection" && <ChangeDetectionRenderer data={results} />}
                  {tabState.activeTab === "change-report" && <ChangeReportRenderer data={results} />}
                  {tabState.activeTab === "faq-generator" && <FAQRenderer data={results} />}
                  {tabState.activeTab === "integration-analysis" && <IntegrationAnalysisRenderer data={results} />}
                  {!["gap-analysis", "change-detection", "change-report", "faq-generator", "integration-analysis"].includes(tabState.activeTab) && (
                    <GenericResultsRenderer data={results} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
