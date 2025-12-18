import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClipboardList,
  Code,
  FileCheck,
  Rocket,
  Settings,
  Clock,
  Calendar,
  Users,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  Eye,
  FileText,
  Video,
  MousePointer,
  ExternalLink,
  Timer,
  Target,
} from "lucide-react";
import { useEnablementReleases, useEnablementContentStatus } from "@/hooks/useEnablementData";
import type { EnablementContentStatus, EnablementRelease, WorkflowColumn } from "@/types/enablement";
import { format, differenceInDays, parseISO } from "date-fns";

interface WorkflowStage {
  id: WorkflowColumn;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  navLink?: string;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "backlog",
    label: "Planning",
    icon: ClipboardList,
    color: "text-slate-600",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    description: "Features identified, scope defined",
    navLink: "/enablement?tab=workflow",
  },
  {
    id: "in_progress",
    label: "Development",
    icon: Code,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Content creation in progress",
    navLink: "/enablement?tab=workflow",
  },
  {
    id: "review",
    label: "Review",
    icon: FileCheck,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    description: "Quality review & approval",
    navLink: "/enablement?tab=workflow",
  },
  {
    id: "published",
    label: "Published",
    icon: Rocket,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    description: "Live and available",
    navLink: "/enablement?tab=coverage",
  },
];

const CONTENT_TYPE_ICONS: Record<string, React.ElementType> = {
  documentation: FileText,
  video: Video,
  scorm: MousePointer,
  dap: MousePointer,
};

const TIME_ESTIMATES: Record<string, number> = {
  documentation: 2,
  video: 4,
  scorm_lite: 3,
  rise_course: 6,
  dap_guide: 1,
};

export function ReleaseWorkflowDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { releases, isLoading: releasesLoading } = useEnablementReleases();
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>("all");
  
  const { contentItems, isLoading: contentLoading } = useEnablementContentStatus(
    selectedReleaseId !== "all" ? selectedReleaseId : undefined
  );

  const selectedRelease = useMemo(() => {
    if (selectedReleaseId === "all") return null;
    return releases.find(r => r.id === selectedReleaseId);
  }, [selectedReleaseId, releases]);

  const stageStats = useMemo(() => {
    const stats: Record<WorkflowColumn, { count: number; hours: number; items: EnablementContentStatus[] }> = {
      backlog: { count: 0, hours: 0, items: [] },
      in_progress: { count: 0, hours: 0, items: [] },
      review: { count: 0, hours: 0, items: [] },
      published: { count: 0, hours: 0, items: [] },
      archived: { count: 0, hours: 0, items: [] },
    };

    contentItems.forEach(item => {
      const stage = item.workflow_status;
      if (stats[stage]) {
        stats[stage].count++;
        // Calculate estimated hours based on content types
        const hours = calculateItemHours(item);
        stats[stage].hours += hours;
        stats[stage].items.push(item);
      }
    });

    return stats;
  }, [contentItems]);

  const totalStats = useMemo(() => {
    const total = contentItems.length;
    const completed = stageStats.published.count;
    const inProgress = stageStats.in_progress.count + stageStats.review.count;
    const pending = stageStats.backlog.count;
    const totalHours = Object.values(stageStats).reduce((sum, s) => sum + s.hours, 0);
    const completedHours = stageStats.published.hours;
    const remainingHours = totalHours - completedHours;

    return {
      total,
      completed,
      inProgress,
      pending,
      completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalHours,
      completedHours,
      remainingHours,
    };
  }, [stageStats, contentItems]);

  function calculateItemHours(item: EnablementContentStatus): number {
    let hours = 0;
    if (item.documentation_status !== "not_started") hours += TIME_ESTIMATES.documentation;
    if (item.video_status !== "not_started") hours += TIME_ESTIMATES.video;
    if (item.scorm_lite_status !== "not_started") hours += TIME_ESTIMATES.scorm_lite;
    if (item.rise_course_status !== "not_started") hours += TIME_ESTIMATES.rise_course;
    if (item.dap_guide_status !== "not_started") hours += TIME_ESTIMATES.dap_guide;
    // Use AI estimate or calculated estimate
    return (item as any).estimated_hours || (item as any).ai_estimated_hours || hours || 4;
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  }

  function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "not_started": return "outline";
      default: return "outline";
    }
  }

  const isLoading = releasesLoading || contentLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Release Selector & Summary */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedReleaseId} onValueChange={setSelectedReleaseId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a release" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Releases</SelectItem>
              {releases.map(release => (
                <SelectItem key={release.id} value={release.id}>
                  {release.version_number} - {release.release_name || "Unnamed"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedRelease && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Target: {selectedRelease.release_date 
                  ? format(parseISO(selectedRelease.release_date), "MMM d, yyyy")
                  : "Not set"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/enablement?tab=releases")}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Releases
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalStats.total}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{totalStats.completionPercent}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
            <Progress value={totalStats.completionPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Hours</p>
                <p className="text-2xl font-bold">{totalStats.totalHours.toFixed(0)}h</p>
              </div>
              <Timer className="h-8 w-8 text-blue-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalStats.remainingHours.toFixed(0)}h remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{totalStats.inProgress}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Workflow Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            Workflow Pipeline
            <Badge variant="outline" className="font-normal">
              Click stages to navigate
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
            {WORKFLOW_STAGES.map((stage, index) => {
              const stats = stageStats[stage.id];
              const Icon = stage.icon;
              
              return (
                <div key={stage.id} className="flex items-center flex-1 min-w-[200px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => stage.navLink && navigate(stage.navLink)}
                          className={`flex-1 p-4 rounded-lg ${stage.bgColor} hover:opacity-90 transition-all cursor-pointer border-2 border-transparent hover:border-primary/20`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-background/50 ${stage.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold">{stage.label}</h4>
                              <p className="text-xs text-muted-foreground">{stage.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold">{stats.count}</p>
                                <p className="text-xs text-muted-foreground">items</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold">{stats.hours.toFixed(0)}h</p>
                                <p className="text-xs text-muted-foreground">estimated</p>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to view {stage.label.toLowerCase()} items</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {index < WORKFLOW_STAGES.length - 1 && (
                    <ChevronRight className="h-6 w-6 text-muted-foreground mx-1 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Work Items by Stage */}
      <Tabs defaultValue="in_progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {WORKFLOW_STAGES.map(stage => (
            <TabsTrigger key={stage.id} value={stage.id} className="flex items-center gap-2">
              <stage.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{stage.label}</span>
              <Badge variant="secondary" className="ml-1">
                {stageStats[stage.id].count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {WORKFLOW_STAGES.map(stage => (
          <TabsContent key={stage.id} value={stage.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <stage.icon className={`h-5 w-5 ${stage.color}`} />
                    {stage.label} Items
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {stageStats[stage.id].hours.toFixed(0)} hours total
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {stageStats[stage.id].items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mb-2" />
                      <p>No items in this stage</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stageStats[stage.id].items.map(item => {
                        const hours = calculateItemHours(item);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/enablement?tab=workflow`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-8 rounded-full ${getPriorityColor(item.priority)}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{item.feature_code}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {item.module_code}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  {item.documentation_status !== "not_started" && (
                                    <Badge variant={getStatusBadgeVariant(item.documentation_status)} className="text-xs">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Doc
                                    </Badge>
                                  )}
                                  {item.video_status !== "not_started" && (
                                    <Badge variant={getStatusBadgeVariant(item.video_status)} className="text-xs">
                                      <Video className="h-3 w-3 mr-1" />
                                      Video
                                    </Badge>
                                  )}
                                  {item.scorm_lite_status !== "not_started" && (
                                    <Badge variant={getStatusBadgeVariant(item.scorm_lite_status)} className="text-xs">
                                      <MousePointer className="h-3 w-3 mr-1" />
                                      SCORM
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  <Timer className="h-4 w-4 text-muted-foreground" />
                                  {hours}h
                                </div>
                                {item.due_date && (
                                  <p className="text-xs text-muted-foreground">
                                    Due: {format(parseISO(item.due_date), "MMM d")}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/enablement?tab=workflow")}
            >
              <ClipboardList className="h-6 w-6" />
              <span className="text-sm">Workflow Board</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/enablement?tab=coverage")}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Coverage Matrix</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/enablement/ai-tools")}
            >
              <Code className="h-6 w-6" />
              <span className="text-sm">AI Tools</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate("/enablement/guide")}
            >
              <Eye className="h-6 w-6" />
              <span className="text-sm">View Guide</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
