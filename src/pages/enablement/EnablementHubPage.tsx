import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard,
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
  Brain,
  HelpCircle,
  FolderTree,
  ClipboardCheck,
  Network,
  Users,
  Target,
  Shield,
  ChevronDown,
  Eye,
  EyeOff,
  Route,
  Clock,
  Heart,
  Radar,
  Grid3X3,
  TrendingUp,
  Kanban,
} from "lucide-react";
import { FeatureRegistrySyncDialog } from "@/components/enablement/FeatureRegistrySyncDialog";
import { NewFeaturesIndicator } from "@/components/enablement/NewFeaturesIndicator";
import { EnablementWelcomeBanner } from "@/components/enablement/EnablementWelcomeBanner";
import { useEnablementContentStatus, useEnablementReleases } from "@/hooks/useEnablementData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTabState } from "@/hooks/useTabState";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { MANUAL_CONFIGS } from "@/hooks/useManualPublishing";

export default function EnablementHubPage() {
  const { t } = useTranslation();
  const { navigateToList, navigateToSetup } = useWorkspaceNavigation();
  
  // Tab state persistence
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "dashboard",
      showAdvanced: false,
    },
    syncToUrl: ["activeTab"],
  });

  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
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
          title: "Content Creation Studio",
          description: "AI-powered documentation with templates and schema analysis",
          href: "/enablement/create",
          icon: Sparkles,
          color: "bg-primary/10 text-primary",
          badge: "Consolidated",
        },
      ],
    },
    {
      titleKey: "Documentation Library",
      items: [
        {
          title: "Administrator Manuals",
          description: "10 comprehensive admin guides (515+ sections)",
          href: "/enablement/manuals",
          icon: BookOpen,
          color: "bg-blue-500/10 text-blue-500",
          badge: "10 Guides",
        },
        {
          title: "Quick Start Guides",
          description: "Get modules running in 10-30 minutes",
          href: "/enablement/quickstarts",
          icon: Rocket,
          color: "bg-emerald-500/10 text-emerald-500",
        },
        {
          title: "Implementation Checklists",
          description: "Prerequisites and go-live readiness",
          href: "/enablement/checklists",
          icon: ClipboardCheck,
          color: "bg-amber-500/10 text-amber-500",
        },
        {
          title: "Module Documentation",
          description: "Browse all content by module",
          href: "/enablement/modules",
          icon: FolderTree,
          color: "bg-violet-500/10 text-violet-500",
        },
      ],
    },
      {
        titleKey: "Content Workflow",
        items: [
          {
            title: "Content Workflow",
            description: "Track content from draft to published",
            href: "/enablement/release-center?activeTab=workflow",
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
          title: "Publish to Help Center",
          description: "AI-enhanced publishing with version control",
          href: "/enablement/manual-publishing",
          icon: Upload,
          color: "bg-emerald-500/10 text-emerald-500",
        },
      ],
    },
    {
      titleKey: "Release Management",
      items: [
        {
          title: "Release Command Center",
          description: "Version lifecycle, milestones, coverage analysis & AI manager",
          href: "/enablement/release-center",
          icon: Rocket,
          color: "bg-primary/10 text-primary",
          badge: "Pre-Release",
        },
      ],
    },
  ], []);

  // Icon map for dynamic manual rendering - using LucideIcon type
  const manualIconMap: Record<string, typeof Shield> = {
    'admin-security': Shield,
    'workforce': Users,
    'hr-hub': HelpCircle,
    'appraisals': BookOpen,
    'goals': Target,
    'time-attendance': Clock,
    'benefits': Heart,
    'feedback-360': Radar,
    'succession': Grid3X3,
    'career-development': TrendingUp,
  };

  // ADVANCED SECTIONS - Consolidated into 5 logical groups
  const advancedSections: ModuleSection[] = useMemo(() => [
    // GROUP 1: Content & AI Tools
    {
      titleKey: "Content & AI Tools",
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
        {
          title: "Enablement Artifacts",
          description: "Single source of truth for all content",
          href: "/enablement/artifacts",
          icon: FileText,
          color: "bg-primary/10 text-primary",
        },
        {
          title: "Product Capabilities Document",
          description: "Comprehensive 18-module capabilities guide with PDF export",
          href: "/enablement/product-capabilities",
          icon: FileText,
          color: "bg-primary/10 text-primary",
          badge: "Sales",
        },
      ],
    },
    // GROUP 2: Administrator Manuals - Dynamic from MANUAL_CONFIGS
    {
      titleKey: "Administrator Manuals (All 10)",
      items: MANUAL_CONFIGS.map(manual => ({
        title: manual.name.replace(' - Administrator Guide', '').replace(' Manual', ''),
        description: `${manual.sectionsCount} sections`,
        href: manual.href,
        icon: manualIconMap[manual.id] ?? BookOpen,
        color: manual.color,
        badge: `${manual.sectionsCount}`,
      })),
    },
    // GROUP 3: External Integrations
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
    // GROUP 4: Implementation & Governance
    {
      titleKey: "Implementation & Governance",
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
        {
          title: "Route Registry",
          description: "Database-First route management",
          href: "/enablement/route-registry",
          icon: Route,
          color: "bg-orange-500/10 text-orange-500",
          badge: "SSOT",
        },
        {
          title: "Platform Standards",
          description: "5 enterprise patterns including Navigation, Color Semantics, and Accessibility",
          href: "/enablement/standards",
          icon: Eye,
          color: "bg-primary/10 text-primary",
          badge: "2 Published",
        },
      ],
    },
    // GROUP 5: Analytics & Settings
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

  const handleTabChange = (tab: string) => {
    setTabState({ activeTab: tab });
  };

  const handleAdvancedToggle = (open: boolean) => {
    setTabState({ showAdvanced: open });
  };

  // Check if user has published content (only count published, not in-development)
  const hasPublishedContent = (publishedArticlesCount ?? 0) > 0;
  
  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('enablement-welcome-dismissed', 'true');
  };

  const handleNavigateToDocsGenerator = () => {
    navigateToList({
      route: "/enablement/create",
      title: "Content Creation Studio",
      moduleCode: "enablement",
      icon: Sparkles,
    });
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
            <Button onClick={handleNavigateToDocsGenerator}>
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

        {/* Main Content - Dashboard only (Workflow moved to Release Command Center) */}
        <div className="space-y-6">
          {/* Primary Sections */}
          <GroupedModuleCards sections={primarySections} defaultOpen={true} />

          {/* Advanced Section Toggle */}
          <Collapsible open={tabState.showAdvanced} onOpenChange={handleAdvancedToggle}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-12 text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-2">
                  {tabState.showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {tabState.showAdvanced ? "Hide Advanced Features" : "Show Advanced Features"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${tabState.showAdvanced ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <GroupedModuleCards sections={advancedSections} defaultOpen={false} showToggleButton />
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Feature Registry Sync Dialog */}
        <FeatureRegistrySyncDialog
          open={syncDialogOpen}
          onOpenChange={setSyncDialogOpen}
        />
      </div>
    </AppLayout>
  );
}
