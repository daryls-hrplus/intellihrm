import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  CheckCircle2,
  Package,
  Settings,
  BarChart3,
  Map,
  Upload,
  Library,
  Brain,
  HelpCircle,
  FolderTree,
  ClipboardCheck,
  RefreshCw,
  Network,
  Users,
  Target,
  Shield,
  CalendarClock,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { ContentWorkflowBoard } from "@/components/enablement/ContentWorkflowBoard";
import { ReleaseManager } from "@/components/enablement/ReleaseManager";
import { ReleaseWorkflowDashboard } from "@/components/enablement/ReleaseWorkflowDashboard";
import { FeatureRegistrySyncDialog } from "@/components/enablement/FeatureRegistrySyncDialog";
import { NewFeaturesIndicator } from "@/components/enablement/NewFeaturesIndicator";
import { EnablementWelcomeBanner } from "@/components/enablement/EnablementWelcomeBanner";
import { useEnablementContentStatus, useEnablementReleases } from "@/hooks/useEnablementData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function EnablementHubPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "dashboard");
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    const dismissed = localStorage.getItem('enablement-welcome-dismissed');
    return dismissed !== 'true';
  });
  const { contentItems } = useEnablementContentStatus();
  const { releases } = useEnablementReleases();

  // Fetch total features count from database
  const { data: dbFeatureCount = 0 } = useQuery({
    queryKey: ["application-features-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("application_features")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch published KB articles count
  const { data: publishedArticlesCount } = useQuery({
    queryKey: ["published-kb-articles-count"],
    queryFn: async (): Promise<number> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = supabase.from("kb_articles").select("*", { count: "exact", head: true }) as any;
      const { count, error } = await query.eq("status", "published");
      if (error) throw error;
      return count ?? 0;
    },
  });

  const activeRelease = releases.find(
    (r) => r.status === "preview" || r.status === "planning"
  );

  // Simplified stats - 3 key metrics
  const contentCreatedCount = contentItems.length;
  const readyToPublishCount = contentItems.filter((i) => 
    (i.workflow_status as string) === "ready_for_enablement"
  ).length;

  // PRIMARY SECTIONS - Core workflow (6 items in 3 sections)
  const primarySections: ModuleSection[] = useMemo(() => [
    {
      titleKey: "Create Content",
      items: [
        {
          title: "AI Documentation Generator",
          description: "Generate training guides, SOPs, and KB articles with AI",
          href: "/enablement/docs-generator",
          icon: Sparkles,
          color: "bg-primary/10 text-primary",
          badge: "Recommended",
        },
        {
          title: "Template Library",
          description: "Manage document templates and formatting",
          href: "/enablement/template-library",
          icon: Library,
          color: "bg-purple-500/10 text-purple-500",
        },
      ],
    },
    {
      titleKey: "Content Workflow",
      items: [
        {
          title: "Workflow Board",
          description: "Track content from draft to published",
          href: "/enablement?tab=workflow",
          icon: Kanban,
          color: "bg-amber-500/10 text-amber-500",
        },
        {
          title: "Feature Audit",
          description: "Identify documentation gaps and coverage",
          href: "/enablement/audit",
          icon: ClipboardCheck,
          color: "bg-emerald-500/10 text-emerald-500",
        },
      ],
    },
    {
      titleKey: "Publish",
      items: [
        {
          title: "Administrator Manuals",
          description: "6 comprehensive admin guides (284 sections)",
          href: "/enablement/manuals",
          icon: BookOpen,
          color: "bg-blue-500/10 text-blue-500",
          badge: "6 Guides",
        },
        {
          title: "Publish to Help Center",
          description: "AI-enhanced publishing with version control",
          href: "/enablement/manual-publishing",
          icon: Upload,
          color: "bg-emerald-500/10 text-emerald-500",
        },
      ],
    },
  ], []);

  // ADVANCED SECTIONS - Hidden by default
  const advancedSections: ModuleSection[] = useMemo(() => [
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
          description: "Best practices and workflow guide",
          href: "/enablement/guide",
          icon: HelpCircle,
          color: "bg-emerald-500/10 text-emerald-500",
        },
      ],
    },
    {
      titleKey: "Content Management",
      items: [
        {
          title: "Enablement Artifacts",
          description: "Single source of truth for all content",
          href: "/enablement/artifacts",
          icon: FileText,
          color: "bg-primary/10 text-primary",
        },
        {
          title: "Feature Catalog",
          description: "Browse all modules and features",
          href: "/enablement/feature-catalog",
          icon: FolderTree,
          color: "bg-violet-500/10 text-violet-500",
        },
        {
          title: "Content Lifecycle",
          description: "Track review schedules and expiring content",
          href: "/enablement/content-lifecycle",
          icon: CalendarClock,
          color: "bg-amber-500/10 text-amber-500",
        },
      ],
    },
    {
      titleKey: "Release Management",
      items: [
        {
          title: "Release Versions",
          description: "Manage release versions and bundling",
          href: "/enablement?tab=releases",
          icon: Rocket,
          color: "bg-pink-500/10 text-pink-500",
        },
        {
          title: "Release Calendar",
          description: "View release timeline",
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
          title: "SCORM-Lite Generator",
          description: "Create lightweight SCORM packages",
          href: "/enablement/scorm-generator",
          icon: Package,
          color: "bg-indigo-500/10 text-indigo-500",
        },
        {
          title: "Guided Tours",
          description: "Interactive guided tours and tooltips",
          href: "/enablement/tours",
          icon: Map,
          color: "bg-teal-500/10 text-teal-500",
        },
        {
          title: "Video Library",
          description: "Link video content from external platforms",
          href: "/enablement?tab=videos",
          icon: Video,
          color: "bg-rose-500/10 text-rose-500",
        },
        {
          title: "DAP Guides",
          description: "In-app walkthroughs and tooltips",
          href: "/enablement?tab=dap",
          icon: MousePointer,
          color: "bg-teal-500/10 text-teal-500",
        },
        {
          title: "Rise Templates",
          description: "Articulate Rise lesson templates",
          href: "/enablement?tab=rise",
          icon: BookOpen,
          color: "bg-orange-500/10 text-orange-500",
        },
      ],
    },
    {
      titleKey: "Administrator Manuals (Individual)",
      items: [
        {
          title: "Admin & Security Guide",
          description: "Administration and security configuration",
          href: "/enablement/manuals/admin-security",
          icon: Shield,
          color: "bg-red-500/10 text-red-600",
          badge: "55 Sections",
        },
        {
          title: "Workforce Guide",
          description: "Workforce module configuration",
          href: "/enablement/manuals/workforce",
          icon: Users,
          color: "bg-blue-500/10 text-blue-600",
          badge: "80 Sections",
        },
        {
          title: "HR Hub Guide",
          description: "HR Hub configuration",
          href: "/enablement/manuals/hr-hub",
          icon: HelpCircle,
          color: "bg-purple-500/10 text-purple-600",
          badge: "32 Sections",
        },
        {
          title: "Performance Appraisal Guide",
          description: "Performance Appraisal configuration",
          href: "/enablement/manuals/appraisals",
          icon: BookOpen,
          color: "bg-primary/10 text-primary",
          badge: "48 Sections",
        },
        {
          title: "Goals Manual",
          description: "Goals Management configuration",
          href: "/enablement/manuals/goals",
          icon: Target,
          color: "bg-green-500/10 text-green-600",
          badge: "24 Sections",
        },
      ],
    },
    {
      titleKey: "Implementation Tools",
      items: [
        {
          title: "Provisioning Guide",
          description: "Demo tenant provisioning guide",
          href: "/enablement/client-provisioning",
          icon: Network,
          color: "bg-indigo-500/10 text-indigo-500",
        },
        {
          title: "Testing Checklist",
          description: "Production readiness checklist",
          href: "/enablement/client-provisioning/testing",
          icon: ClipboardCheck,
          color: "bg-green-500/10 text-green-500",
        },
        {
          title: "Client Registry",
          description: "Manage demo registrations",
          href: "/admin/client-registry",
          icon: Users,
          color: "bg-purple-500/10 text-purple-500",
        },
      ],
    },
    {
      titleKey: "Analytics & Settings",
      items: [
        {
          title: "Coverage Matrix",
          description: "Content completion status across features",
          href: "/enablement?tab=coverage",
          icon: LayoutGrid,
          color: "bg-green-500/10 text-green-500",
        },
        {
          title: "Content Analytics",
          description: "Track content creation metrics",
          href: "/enablement/analytics",
          icon: BarChart3,
          color: "bg-violet-500/10 text-violet-500",
        },
        {
          title: "Enablement Settings",
          description: "Configure module preferences",
          href: "/enablement/settings",
          icon: Settings,
          color: "bg-slate-500/10 text-slate-500",
        },
      ],
    },
  ], []);

  // Sync tab state with URL
  useEffect(() => {
    const validTabs = ["workflow", "releases", "coverage", "videos", "dap", "rise"];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
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

  // Check if user has published content (only count published, not in-development)
  const hasPublishedContent = (publishedArticlesCount ?? 0) > 0;
  
  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('enablement-welcome-dismissed', 'true');
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

        {/* Header - Simplified */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Enablement Content Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and publish documentation with AI assistance
            </p>
          </div>
          <div className="flex gap-2">
            <NewFeaturesIndicator onSyncClick={() => setSyncDialogOpen(true)} />
            <Button variant="outline" onClick={() => handleTabChange("workflow")}>
              <Kanban className="h-4 w-4 mr-2" />
              View Workflow
            </Button>
            <Button onClick={() => navigate("/enablement/docs-generator")}>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </div>
        </div>

        {/* Welcome Banner - Show for new users until dismissed or they have published content */}
        {showWelcome && !hasPublishedContent && (
          <EnablementWelcomeBanner onDismiss={handleDismissWelcome} />
        )}

        {/* Simplified Stats - 3 key metrics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contentCreatedCount}</p>
                  <p className="text-xs text-muted-foreground">Content Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <ArrowRight className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{readyToPublishCount}</p>
                  <p className="text-xs text-muted-foreground">Ready to Publish</p>
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
                  <p className="text-2xl font-bold">{publishedArticlesCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
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

        {/* Main Content - Tabs for workflow views, cards for navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="workflow" className="gap-2">
              <Kanban className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="releases" className="gap-2">
              <Rocket className="h-4 w-4" />
              Releases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Primary Sections */}
            <GroupedModuleCards sections={primarySections} defaultOpen={true} />

            {/* Advanced Section Toggle */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-12 text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showAdvanced ? "Hide Advanced Features" : "Show Advanced Features"}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <GroupedModuleCards sections={advancedSections} defaultOpen={false} showToggleButton />
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="workflow">
            <ContentWorkflowBoard releaseId={activeRelease?.id} />
          </TabsContent>

          <TabsContent value="releases" className="space-y-6">
            <ReleaseWorkflowDashboard />
            <ReleaseManager />
          </TabsContent>
        </Tabs>

        {/* Feature Registry Sync Dialog */}
        <FeatureRegistrySyncDialog
          open={syncDialogOpen}
          onOpenChange={setSyncDialogOpen}
        />
      </div>
    </AppLayout>
  );
}
