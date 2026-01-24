import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Rocket,
  BookOpen,
  Target,
  Users,
  Clock,
  Heart,
  DollarSign,
  GraduationCap,
  Shield,
  Search,
  ArrowRight,
  CheckCircle2,
  Zap,
  Settings2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuickStartTemplates, type QuickStartTemplateRow } from "@/hooks/useQuickStartTemplates";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Target,
  Users,
  Clock,
  Heart,
  DollarSign,
  Shield,
  Rocket,
  Goal: Target,
};

function getIcon(iconName: string): React.ElementType {
  return ICON_MAP[iconName] || BookOpen;
}

function getColorClasses(colorClass: string) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    purple: "bg-purple-500/10 text-purple-600",
    blue: "bg-blue-500/10 text-blue-600",
    cyan: "bg-cyan-500/10 text-cyan-600",
    orange: "bg-orange-500/10 text-orange-600",
    rose: "bg-rose-500/10 text-rose-600",
    green: "bg-green-500/10 text-green-600",
    slate: "bg-slate-500/10 text-slate-600",
  };
  return colorMap[colorClass] || "bg-primary/10 text-primary";
}

function getGuideHref(moduleCode: string) {
  const pathMap: Record<string, string> = {
    LND: "/enablement/quickstart/learning-development",
    PERF: "/enablement/quickstart/performance",
    GOALS: "/enablement/quickstart/goals",
    WFM: "/enablement/quickstart/workforce",
    TIME: "/enablement/quickstart/time-attendance",
    BEN: "/enablement/quickstart/benefits",
    COMP: "/enablement/quickstart/compensation",
    SEC: "/enablement/quickstart/admin-security",
  };
  return pathMap[moduleCode] || `/enablement/quickstart/${moduleCode.toLowerCase()}`;
}

function getEstimatedMinutes(template: QuickStartTemplateRow): number {
  const setupSteps = template.setup_steps as unknown[];
  if (!Array.isArray(setupSteps)) return 15;
  
  return setupSteps.reduce((acc: number, step: unknown) => {
    const s = step as { estimatedTime?: string };
    const minutes = parseInt(s.estimatedTime || "0");
    return acc + (isNaN(minutes) ? 0 : minutes);
  }, 0 as number) || 15;
}

function getPrerequisitesCount(template: QuickStartTemplateRow): number {
  const prereqs = template.prerequisites as unknown[];
  return Array.isArray(prereqs) ? prereqs.length : 0;
}

export default function QuickStartGuidesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all templates (published only for regular users)
  const { data: templates, isLoading } = useQuickStartTemplates(true);

  const filteredGuides = useMemo(() => {
    if (!templates) return [];
    
    const allGuides = templates.map((template) => ({
      id: template.module_code.toLowerCase(),
      moduleCode: template.module_code,
      title: template.breadcrumb_label || template.title.replace(" Quick Start", ""),
      description: template.subtitle || "",
      icon: getIcon(template.icon_name),
      color: getColorClasses(template.color_class),
      estimatedMinutes: getEstimatedMinutes(template),
      prerequisites: getPrerequisitesCount(template),
      status: template.status as "published" | "draft",
      href: getGuideHref(template.module_code),
    }));
    
    if (!searchQuery.trim()) return allGuides;
    
    const query = searchQuery.toLowerCase();
    return allGuides.filter(
      (guide) =>
        guide.title.toLowerCase().includes(query) ||
        guide.description.toLowerCase().includes(query) ||
        guide.moduleCode.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  const availableCount = filteredGuides.filter((g) => g.status === "published").length;
  const totalCount = filteredGuides.length;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Quick Start Guides" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Rocket className="h-8 w-8 text-primary" />
              Quick Start Guides
            </h1>
            <p className="text-muted-foreground mt-1">
              Get modules up and running in 10-30 minutes with step-by-step setup guides
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <Zap className="h-3 w-3 mr-1" />
              {availableCount} of {totalCount} Available
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/enablement/quickstarts/admin")}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quick start guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">What are Quick Start Guides?</p>
                <p className="text-sm text-muted-foreground">
                  These are condensed setup guides that focus on the critical path to get a module working. 
                  They include prerequisites, essential configuration steps, and verification checks — 
                  everything you need for a minimal viable setup.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-5 w-3/4 mt-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Guides Grid */}
        {!isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGuides.map((guide) => {
              const Icon = guide.icon;
              const isAvailable = guide.status === "published";

              return (
                <Card
                  key={guide.id}
                  className={`relative transition-all ${
                    isAvailable
                      ? "hover:shadow-md hover:border-primary/30 cursor-pointer"
                      : "opacity-60"
                  }`}
                  onClick={() => isAvailable && navigate(guide.href)}
                >
                  {!isAvailable && (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 text-xs"
                    >
                      Coming Soon
                    </Badge>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${guide.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{guide.title}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {guide.moduleCode}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <CardDescription className="text-sm">
                      {guide.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {guide.estimatedMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {guide.prerequisites} prerequisites
                      </span>
                    </div>
                    {isAvailable && (
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        Start Guide
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filteredGuides.length === 0 && (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No guides found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
