import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import {
  LayoutDashboard,
  BookOpen,
  Rocket,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FolderTree,
  ClipboardCheck,
  HelpCircle,
  Database,
} from "lucide-react";
import { FeatureRegistrySyncDialog } from "@/components/enablement/FeatureRegistrySyncDialog";
import { NewFeaturesIndicator } from "@/components/enablement/NewFeaturesIndicator";
import { EnablementWelcomeBanner } from "@/components/enablement/EnablementWelcomeBanner";
import { EnablementHelpPanel } from "@/components/enablement/EnablementHelpPanel";
import { useEnablementContentStatus, useEnablementReleases } from "@/hooks/useEnablementData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTabState } from "@/hooks/useTabState";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

export default function EnablementHubPage() {
  const { t } = useTranslation();
  const { navigateToList } = useWorkspaceNavigation();
  
  // Tab state persistence
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "dashboard",
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

  // PRIMARY SECTIONS - Simplified to 3 clear phases (Create → Review → Manage → Reference)
  const primarySections: ModuleSection[] = useMemo(() => [
    {
      titleKey: "1. Create",
      items: [
        {
          title: "Content Creation Studio",
          description: "AI-powered documentation with templates, schema analysis, and 11 automation tools",
          href: "/enablement/create",
          icon: Sparkles,
          color: "bg-primary/10 text-primary",
          badge: "All-in-One",
        },
      ],
    },
    {
      titleKey: "1.5. Review & Edit",
      items: [
        {
          title: "Content Review Center",
          description: "Review, edit, and approve AI-generated content before publishing",
          href: "/enablement/review",
          icon: ClipboardCheck,
          color: "bg-amber-500/10 text-amber-500",
        },
      ],
    },
    {
      titleKey: "2. Manage & Release",
      items: [
        {
          title: "Release Command Center",
          description: "Coverage, workflow, publishing, milestones & AI manager",
          href: "/enablement/release-center",
          icon: Rocket,
          color: "bg-primary/10 text-primary",
          badge: "All-in-One",
        },
      ],
    },
    {
      titleKey: "3. Reference Library",
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
        {
          title: "Enablement Artifacts",
          description: "Single source of truth for all content",
          href: "/enablement/artifacts",
          icon: FileText,
          color: "bg-cyan-500/10 text-cyan-500",
        },
        {
          title: "Platform Standards",
          description: "5 enterprise patterns including Navigation and Accessibility",
          href: "/enablement/standards",
          icon: HelpCircle,
          color: "bg-slate-500/10 text-slate-500",
        },
        {
          title: "Product Capabilities",
          description: "25 modules, 1,675+ capabilities by employee lifecycle",
          href: "/enablement/product-capabilities",
          icon: FileText,
          color: "bg-orange-500/10 text-orange-500",
          badge: "1,675+ Capabilities",
        },
        {
          title: "Feature Registry",
          description: "Code-defined feature definitions and route mappings",
          href: "/enablement/route-registry",
          icon: Database,
          color: "bg-indigo-500/10 text-indigo-500",
          badge: "Developer Reference",
        },
      ],
    },
  ], []);

  // Check if user has published content
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

        {/* Header - Simplified with Help Button */}
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
            <EnablementHelpPanel />
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateToList({
                    route: "/enablement/release-center",
                    title: "Release Command Center",
                    moduleCode: "enablement",
                    icon: Rocket,
                  })}
                >
                  View Release
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Primary Sections - 3 Phase Workflow */}
        <div className="space-y-6">
          <GroupedModuleCards sections={primarySections} defaultOpen={true} />
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
