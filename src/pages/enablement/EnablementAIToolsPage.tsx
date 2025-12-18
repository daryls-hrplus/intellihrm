import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
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

export default function EnablementAIToolsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("gap-analysis");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Form states
  const [moduleFilter, setModuleFilter] = useState("all");
  const [featureCode, setFeatureCode] = useState("");
  const [contentToAnalyze, setContentToAnalyze] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/enablement")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
                    const isActive = activeTab === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setActiveTab(tool.id);
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
              {activeTab === "generate-all-docs" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Files className="h-5 w-5 text-emerald-500" />
                      Generate All Feature Documents
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Bulk generate documentation for all features in a module. This will create comprehensive docs for each feature.
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
                          This will generate documentation for multiple features. The process may take several minutes depending on the number of features.
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

              {/* Application Change Report */}
              {activeTab === "change-report" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <GitCompare className="h-5 w-5 text-orange-500" />
                      Application Change Report
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Generate a dated report of all UI and backend changes to inform release documentation. Tracks features, modules, workflows, roles, and database changes.
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

              {/* Gap Analysis */}
              {activeTab === "gap-analysis" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Search className="h-5 w-5 text-blue-500" />
                      Content Gap Analysis
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Scan all features and identify which ones lack documentation, videos, or training content.
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
              {activeTab === "change-detection" && (
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

              {/* Contextual Help Generator */}
              {activeTab === "contextual-help" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-green-500" />
                      Contextual Help Generator
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Generate tooltips, walkthroughs, help text, and error messages for a feature.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Feature Code</Label>
                    <Input
                      placeholder="e.g., LEAVE_REQUEST, PAYROLL_RUN"
                      value={featureCode}
                      onChange={(e) => setFeatureCode(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={() => runAnalysis("generate-contextual-help", { featureCode })}
                    disabled={isLoading || !featureCode}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate Help Content
                  </Button>
                </div>
              )}

              {/* FAQ Generator */}
              {activeTab === "faq-generator" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-purple-500" />
                      FAQ Generator
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Analyze resolved support tickets and generate FAQ entries automatically.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Filter by Category</Label>
                    <Select value={moduleFilter} onValueChange={setModuleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="leave_management">Leave Management</SelectItem>
                        <SelectItem value="payroll">Payroll</SelectItem>
                        <SelectItem value="workforce">Workforce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => runAnalysis("generate-faq-from-tickets", { moduleCode: moduleFilter })}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    Generate FAQs
                  </Button>
                </div>
              )}

              {/* Learning Path Optimizer */}
              {activeTab === "learning-path" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-cyan-500" />
                      Learning Path Optimizer
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Create personalized learning paths based on role and skill gaps.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={roleCode} onValueChange={setRoleCode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="hr_admin">HR Administrator</SelectItem>
                          <SelectItem value="payroll_admin">Payroll Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Learning Goals</Label>
                      <Input
                        placeholder="e.g., Leave management, Payroll basics"
                        value={learningGoals}
                        onChange={(e) => setLearningGoals(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      runAnalysis("optimize-learning-path", {
                        roleCode,
                        learningGoals: learningGoals.split(",").map((g) => g.trim()),
                      })
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <GraduationCap className="h-4 w-4 mr-2" />
                    )}
                    Generate Learning Path
                  </Button>
                </div>
              )}

              {/* Voice-Over Script Generator */}
              {activeTab === "voiceover-script" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Mic className="h-5 w-5 text-pink-500" />
                      Voice-Over Script Generator
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Generate professional narration scripts for training videos.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Feature Code</Label>
                      <Input
                        placeholder="e.g., LEAVE_REQUEST"
                        value={featureCode}
                        onChange={(e) => setFeatureCode(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Video Duration (minutes)</Label>
                      <Select defaultValue="3">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 minutes</SelectItem>
                          <SelectItem value="3">3 minutes</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      runAnalysis("generate-voiceover-script", {
                        featureCode,
                        videoDuration: 3,
                      })
                    }
                    disabled={isLoading || !featureCode}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mic className="h-4 w-4 mr-2" />
                    )}
                    Generate Script
                  </Button>
                </div>
              )}

              {/* Content Effectiveness Scorer */}
              {activeTab === "content-scorer" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-500" />
                      Content Effectiveness Scorer
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Analyze documentation quality and get actionable improvement suggestions.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Content to Analyze</Label>
                    <Textarea
                      placeholder="Paste your documentation content here..."
                      value={contentToAnalyze}
                      onChange={(e) => setContentToAnalyze(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={() =>
                      runAnalysis("score-content-effectiveness", {
                        content: contentToAnalyze,
                        contentType: "documentation",
                      })
                    }
                    disabled={isLoading || !contentToAnalyze}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    Analyze Content
                  </Button>
                </div>
              )}

              {/* Cross-Module Integration Analysis */}
              {activeTab === "integration-analysis" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-cyan-500" />
                      Cross-Module Integration Analysis
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Analyze modules and features to identify integration opportunities and suggest cross-module functionality.
                    </p>
                  </div>

                  <Button
                    onClick={() => runAnalysis("analyze-cross-module-integrations", {})}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    Analyze Integrations
                  </Button>
                </div>
              )}

              {/* Results Display */}
              {results && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Results</h3>
                  </div>
                  {activeTab === "gap-analysis" && results.gaps ? (
                    <GapAnalysisRenderer data={results} />
                  ) : activeTab === "change-report" && (results.changes || results.changesByDate) ? (
                    <ChangeReportRenderer data={results} />
                  ) : activeTab === "change-detection" && (results.changedFeatures || results.analysis) ? (
                    <ChangeDetectionRenderer data={results} />
                  ) : activeTab === "faq-generator" && (results.faqs || results.message) ? (
                    <FAQRenderer data={results} />
                  ) : activeTab === "integration-analysis" && results.suggestions ? (
                    <IntegrationAnalysisRenderer data={results} />
                  ) : (
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
