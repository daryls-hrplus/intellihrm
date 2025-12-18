import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  LayoutGrid,
  Video,
  MousePointer,
  BookOpen,
  Rocket,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ContentWorkflowBoard } from "@/components/enablement/ContentWorkflowBoard";
import { ReleaseManager } from "@/components/enablement/ReleaseManager";
import { ContentCoverageMatrix } from "@/components/enablement/ContentCoverageMatrix";
import { VideoLibraryManager } from "@/components/enablement/VideoLibraryManager";
import { DAPGuidesManager } from "@/components/enablement/DAPGuidesManager";
import { RiseTemplateManager } from "@/components/enablement/RiseTemplateManager";
import { useEnablementContentStatus, useEnablementReleases } from "@/hooks/useEnablementData";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";

export default function EnablementHubPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { contentItems } = useEnablementContentStatus();
  const { releases } = useEnablementReleases();

  // Calculate stats
  const totalFeatures = Object.values(FEATURE_REGISTRY).reduce(
    (acc, module) => acc + Object.keys(module.features).length,
    0
  );

  const activeRelease = releases.find(
    (r) => r.status === "preview" || r.status === "planning"
  );

  const stats = {
    total: totalFeatures,
    inProgress: contentItems.filter((i) => i.workflow_status === "in_progress").length,
    inReview: contentItems.filter((i) => i.workflow_status === "review").length,
    published: contentItems.filter((i) => i.workflow_status === "published").length,
    critical: contentItems.filter((i) => i.priority === "critical").length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/enablement")}>
              Enablement
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Content Hub</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Enablement Content Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage documentation, training content, and enablement materials across all features
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/enablement/docs-generator")}>
            <FileText className="h-4 w-4 mr-2" />
            Doc Generator
          </Button>
          <Button onClick={() => setActiveTab("workflow")}>
            <Kanban className="h-4 w-4 mr-2" />
            Workflow Board
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Features</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inReview}</p>
                <p className="text-xs text-muted-foreground">In Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Critical Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Release Banner */}
      {activeRelease && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    Active Release: {activeRelease.version_number}
                    {activeRelease.release_name && ` - ${activeRelease.release_name}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {activeRelease.status} • {activeRelease.feature_count} features
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("releases")}>
                View Release
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Workflow</span>
          </TabsTrigger>
          <TabsTrigger value="releases" className="gap-2">
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Releases</span>
          </TabsTrigger>
          <TabsTrigger value="coverage" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Coverage</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="dap" className="gap-2">
            <MousePointer className="h-4 w-4" />
            <span className="hidden sm:inline">DAP</span>
          </TabsTrigger>
          <TabsTrigger value="rise" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Rise</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate("/enablement/docs-generator")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Sparkles className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Generate Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered docs for any feature
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setActiveTab("workflow")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <Kanban className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Content Workflow</h3>
                    <p className="text-sm text-muted-foreground">
                      Track content tasks in Kanban board
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setActiveTab("coverage")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <LayoutGrid className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Coverage Matrix</h3>
                    <p className="text-sm text-muted-foreground">
                      View content status across features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest content updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Activity feed will appear here as you work on content
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <ContentWorkflowBoard releaseId={activeRelease?.id} />
        </TabsContent>

        <TabsContent value="releases">
          <ReleaseManager />
        </TabsContent>

        <TabsContent value="coverage">
          <ContentCoverageMatrix />
        </TabsContent>

        <TabsContent value="videos">
          <VideoLibraryManager />
        </TabsContent>

        <TabsContent value="dap">
          <DAPGuidesManager />
        </TabsContent>

        <TabsContent value="rise">
          <RiseTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
