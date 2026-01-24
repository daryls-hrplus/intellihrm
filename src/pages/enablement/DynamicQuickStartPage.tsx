import { useParams } from "react-router-dom";
import { QuickStartTemplate } from "@/components/enablement/quickstarts/QuickStartTemplate";
import { useQuickStartTemplate } from "@/hooks/useQuickStartTemplates";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { QuickStartData } from "@/types/quickstart";
import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  Target,
  Users,
  Clock,
  Heart,
  DollarSign,
  Shield,
  Rocket,
  UserCog,
  MonitorCog,
  Briefcase,
  Settings,
  BookOpen,
  FolderTree,
  BarChart3,
  CheckSquare,
  FileText,
  TrendingUp,
  Award,
  Layers,
} from "lucide-react";

// Map string icon names to actual icon components
const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  Target,
  Users,
  Clock,
  Heart,
  DollarSign,
  Shield,
  Rocket,
  UserCog,
  MonitorCog,
  Briefcase,
  Settings,
  BookOpen,
  FolderTree,
  BarChart3,
  CheckSquare,
  FileText,
  TrendingUp,
  Award,
  Layers,
};

// Map module codes to URL slugs
const MODULE_SLUG_MAP: Record<string, string> = {
  "learning-development": "LND",
  "performance": "PERF",
  "goals": "GOALS",
  "workforce": "WFM",
  "time-attendance": "TIME",
  "benefits": "BEN",
  "compensation": "COMP",
  "security": "SEC",
};

function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || GraduationCap;
}

export default function DynamicQuickStartPage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const navigate = useNavigate();
  
  // Convert slug to module code
  const moduleCode = moduleSlug ? MODULE_SLUG_MAP[moduleSlug] || moduleSlug.toUpperCase() : "";
  
  const { data: template, isLoading, error } = useQuickStartTemplate(moduleCode);
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }
  
  if (error || !template) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Quick Start Guide Not Found</AlertTitle>
            <AlertDescription>
              The requested Quick Start Guide could not be found or has not been published yet.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/enablement/quickstarts")}>
            Return to Quick Start Guides
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  // Transform database template to QuickStartData format
  const quickStartData: QuickStartData = {
    moduleCode: template.module_code,
    title: template.title,
    subtitle: template.subtitle || "",
    icon: getIconComponent(template.icon_name),
    colorClass: template.color_class,
    quickSetupTime: template.quick_setup_time || "15-30 minutes",
    fullConfigTime: template.full_config_time || "2-4 hours",
    breadcrumbLabel: template.breadcrumb_label || template.title,
    roles: (template.roles as unknown as Array<{role: string; title: string; icon: string; responsibility: string}>)?.map(r => ({
      ...r,
      icon: getIconComponent(r.icon),
    })) || [],
    prerequisites: (template.prerequisites as unknown as Array<{id: string; title: string; description: string; required: boolean; href?: string; module?: string}>) || [],
    pitfalls: (template.pitfalls as unknown as Array<{issue: string; prevention: string}>) || [],
    contentStrategyQuestions: (template.content_strategy_questions as unknown as string[]) || [],
    setupSteps: (template.setup_steps as unknown as Array<{id: string; title: string; description: string; estimatedTime: string; substeps?: string[]; expectedResult?: string; href?: string}>) || [],
    rolloutOptions: (template.rollout_options as unknown as Array<{id: string; label: string; description: string}>) || [],
    rolloutRecommendation: template.rollout_recommendation || "",
    verificationChecks: (template.verification_checks as unknown as string[]) || [],
    integrationChecklist: (template.integration_checklist as unknown as Array<{id: string; label: string; required: boolean}>) || [],
    successMetrics: (template.success_metrics as unknown as Array<{metric: string; target: string; howToMeasure: string}>) || [],
    nextSteps: (template.next_steps as unknown as Array<{label: string; href: string; icon: string}>)?.map(s => ({
      ...s,
      icon: getIconComponent(s.icon),
    })) || [],
  };
  
  return <QuickStartTemplate data={quickStartData} />;
}
