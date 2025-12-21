import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
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
  Package,
  Settings,
  BarChart3,
  Upload,
  Library,
  Brain,
  HelpCircle,
  FolderTree,
} from "lucide-react";
import { ContentWorkflowBoard } from "@/components/enablement/ContentWorkflowBoard";
import { ReleaseManager } from "@/components/enablement/ReleaseManager";
import { ReleaseWorkflowDashboard } from "@/components/enablement/ReleaseWorkflowDashboard";
import { ContentCoverageMatrix } from "@/components/enablement/ContentCoverageMatrix";
import { VideoLibraryManager } from "@/components/enablement/VideoLibraryManager";
import { DAPGuidesManager } from "@/components/enablement/DAPGuidesManager";
import { RiseTemplateManager } from "@/components/enablement/RiseTemplateManager";
import { useEnablementContentStatus, useEnablementReleases } from "@/hooks/useEnablementData";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";

export default function EnablementHubPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "dashboard");
  const { contentItems } = useEnablementContentStatus();
  const { releases } = useEnablementReleases();

  // Calculate stats
  const totalFeatures = FEATURE_REGISTRY.reduce(
    (acc, module) => acc + module.groups.reduce((gAcc, group) => gAcc + group.features.length, 0),
    0
  );

  const activeRelease = releases.find(
    (r) => r.status === "preview" || r.status === "planning"
  );

  const stats = {
    total: totalFeatures,
    inProgress: contentItems.filter((i) => i.workflow_status === "development" || i.workflow_status === "planning").length,
    inReview: contentItems.filter((i) => i.workflow_status === "review").length,
    published: contentItems.filter((i) => i.workflow_status === "published").length,
    critical: contentItems.filter((i) => i.priority === "critical").length,
  };

  // Grouped sections following the pattern from other modules
  const sections: ModuleSection[] = useMemo(() => [
    {
      titleKey: "Content Authoring",
      items: [
        {
          title: "Enablement Artifacts",
          description: "Single source of truth for all enablement content",
          href: "/enablement/artifacts",
          icon: FileText,
          color: "bg-primary/10 text-primary",
        },
        {
          title: "Feature Catalog",
          description: "Browse all modules, groups, and features with search and details",
          href: "/enablement/feature-catalog",
          icon: FolderTree,
          color: "bg-violet-500/10 text-violet-500",
        },
      ],
    },
    {
      titleKey: "AI Automation",
      items: [
        {
          title: "AI Automation Tools",
          description: "8 AI-powered tools for content automation",
          href: "/enablement/ai-tools",
          icon: Brain,
          color: "bg-primary/10 text-primary",
        },
        {
          title: "User Guide",
          description: "Best practices and workflow guide (industry-aligned)",
          href: "/enablement/guide",
          icon: HelpCircle,
          color: "bg-emerald-500/10 text-emerald-500",
        },
      ],
    },
    {
      titleKey: "Content Generation",
      items: [
        {
          title: "Documentation Generator",
          description: "AI-powered documentation generation for features",
          href: "/enablement/docs-generator",
          icon: Sparkles,
          color: "bg-blue-500/10 text-blue-500",
        },
        {
          title: "Template Library",
          description: "Manage document templates and reference documents",
          href: "/enablement/template-library",
          icon: Library,
          color: "bg-purple-500/10 text-purple-500",
        },
        {
          title: "SCORM-Lite Generator",
          description: "Create lightweight SCORM packages for LMS",
          href: "/enablement/scorm-generator",
          icon: Package,
          color: "bg-indigo-500/10 text-indigo-500",
        },
      ],
    },
    {
      titleKey: "Content Workflow",
      items: [
        {
          title: "Workflow Board",
          description: "Kanban board to track content development tasks",
          href: "/enablement?tab=workflow",
          icon: Kanban,
          color: "bg-amber-500/10 text-amber-500",
        },
        {
          title: "Coverage Matrix",
          description: "View content completion status across all features",
          href: "/enablement?tab=coverage",
          icon: LayoutGrid,
          color: "bg-green-500/10 text-green-500",
        },
      ],
    },
    {
      titleKey: "Release Management",
      items: [
        {
          title: "Release Versions",
          description: "Manage release versions and content bundling",
          href: "/enablement?tab=releases",
          icon: Rocket,
          color: "bg-pink-500/10 text-pink-500",
        },
        {
          title: "Release Calendar",
          description: "View release timeline and planning",
          href: "/enablement/release-calendar",
          icon: Calendar,
          color: "bg-cyan-500/10 text-cyan-500",
        },
      ],
    },
    {
      titleKey: "External Integrations",
      items: [
        {
          title: "Video Library",
          description: "Link Trupeer, Guidde, and other video content",
          href: "/enablement?tab=videos",
          icon: Video,
          color: "bg-rose-500/10 text-rose-500",
        },
        {
          title: "DAP Guides (UserGuiding)",
          description: "Manage in-app walkthroughs and tooltips",
          href: "/enablement?tab=dap",
          icon: MousePointer,
          color: "bg-teal-500/10 text-teal-500",
        },
        {
          title: "Rise Templates",
          description: "Articulate Rise lesson structure templates",
          href: "/enablement?tab=rise",
          icon: BookOpen,
          color: "bg-orange-500/10 text-orange-500",
        },
      ],
    },
    {
      titleKey: "Analytics & Settings",
      items: [
        {
          title: "Content Analytics",
          description: "Track content creation metrics and team performance",
          href: "/enablement/analytics",
          icon: BarChart3,
          color: "bg-violet-500/10 text-violet-500",
        },
        {
          title: "Enablement Settings",
          description: "Configure enablement module preferences",
          href: "/enablement/settings",
          icon: Settings,
          color: "bg-slate-500/10 text-slate-500",
        },
      ],
    },
  ], []);

  // Sync tab state with URL
  useEffect(() => {
    if (tabParam && tabParam !== activeTab && ["workflow", "releases", "coverage", "videos", "dap", "rise"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam && activeTab !== "dashboard") {
      setActiveTab("dashboard");
    }
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "dashboard") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Content Hub" },
          ]}
        />

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
              Generate Docs
            </Button>
            <Button onClick={() => handleTabChange("workflow")}>
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
                <Button variant="outline" size="sm" onClick={() => handleTabChange("releases")}>
                  View Release
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
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

          <TabsContent value="dashboard" className="space-y-6">
            <GroupedModuleCards sections={sections} />
          </TabsContent>

          <TabsContent value="workflow">
            <ContentWorkflowBoard releaseId={activeRelease?.id} />
          </TabsContent>

          <TabsContent value="releases" className="space-y-6">
            <ReleaseWorkflowDashboard />
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
    </AppLayout>
  );
}
