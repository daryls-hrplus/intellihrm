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
  FolderTree,
  ClipboardCheck,
  HelpCircle,
  Database,
} from "lucide-react";
import { FeatureRegistrySyncDialog } from "@/components/enablement/FeatureRegistrySyncDialog";
import { NewFeaturesIndicator } from "@/components/enablement/NewFeaturesIndicator";
import { EnablementHelpPanel } from "@/components/enablement/EnablementHelpPanel";
import { EnablementWorkflowStepper } from "@/components/enablement/EnablementWorkflowStepper";
import { RecommendedNextActions } from "@/components/enablement/RecommendedNextActions";
import { PhaseTransitionBanner } from "@/components/enablement/PhaseTransitionBanner";
import { EnablementOnboardingWizard } from "@/components/enablement/EnablementOnboardingWizard";
import { EnhancedWorkflowStats } from "@/components/enablement/EnhancedWorkflowStats";
import { useEnablementReleases } from "@/hooks/useEnablementData";
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
  const { releases } = useEnablementReleases();

  const activeRelease = releases.find(
    (r) => r.status === "preview" || r.status === "planning"
  );

  // PRIMARY SECTIONS - Simplified to 4 clear phases (Create → Review → Release → Library)
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
        {/* Onboarding Wizard - Shows on first visit */}
        <EnablementOnboardingWizard />

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

        {/* Visual Workflow Stepper - NEW Enhancement 1 */}
        <EnablementWorkflowStepper />

        {/* Phase Transition Banner - NEW Enhancement 4 */}
        <PhaseTransitionBanner />

        {/* Recommended Next Actions - NEW Enhancement 3 */}
        <RecommendedNextActions />

        {/* Stats Row: Enhanced Stats + Active Release */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Enhanced Workflow Stats - NEW Enhancement 5 */}
          <EnhancedWorkflowStats />

          {/* Active Release Banner */}
          {activeRelease && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Rocket className="h-5 w-5 text-primary" />
                    </div>
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
        </div>

        {/* Primary Sections - 4 Phase Workflow */}
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
